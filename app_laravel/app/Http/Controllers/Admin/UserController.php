<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Outlet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserInvitationEmail;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display the user management index page with all users and their roles/outlets.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $managersPerPage = $request->input('managers_per_page', 5);
        $outletUsersPerPage = $request->input('outlet_users_per_page', 5);

        $managersQuery = User::with(['roles', 'managedOutlets'])
            ->whereHas('roles', function($query) {
                $query->where('name', 'manager');
            });

        $outletUsersQuery = User::with(['roles', 'outletUserOutlet'])
            ->whereHas('roles', function($query) {
                $query->where('name', 'outlet-user');
            });

        $managers = $managersQuery->paginate($managersPerPage, ['*'], 'managers_page', $request->input('managers_page'))
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => 'Manager',
                    'managed_outlets' => $user->managedOutlets->map(function ($outlet) {
                        return [
                            'id' => $outlet->id,
                            'name' => $outlet->name
                        ];
                    }),
                    'managed_outlets_count' => $user->managedOutlets->count()
                ];
            });

        $outletUsers = $outletUsersQuery->paginate($outletUsersPerPage, ['*'], 'outlet_users_page', $request->input('outlet_users_page'))
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => 'Outlet User',
                    'assigned_outlet' => $user->outletUserOutlet ? $user->outletUserOutlet->name : null,
                ];
            });

        return Inertia::render('Admin/Users/IndexPage', [
            'managers' => $managers,
            'outletUsers' => $outletUsers,
        ]);
    }

    /**
     * Display the activity log for a specific user.
     *
     * @param int $userId
     * @return \Inertia\Response
     */
    public function activityLog($userId)
    {
        return Inertia::render('Admin/Users/ActivityLogPage', [
            'userId' => $userId,
        ]);
    }

    /**
     * Store a newly created user (Manager or Outlet User) from the Admin panel.
     */
    public function store(Request $request)
    {
        Log::info('Request data for User creation:', $request->all());
        Log::info('Admin User Create Request:', $request->all());
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['manager', 'outlet-user'])],
            'outlet_id' => ['nullable', 'required_if:role,outlet-user', 'exists:outlets,id'],
            'outlet_ids' => ['nullable', 'required_if:role,manager', 'array'],
            'outlet_ids.*' => ['exists:outlets,id'],
        ]);

        // Generate next role_id
        $rolePrefix = $validated['role'] === 'manager' ? 'M' : 'O';
        $maxRoleId = User::where('role_id', 'like', $rolePrefix . '-%')
            ->orderByRaw("CAST(SUBSTRING(role_id, 3) AS INTEGER) DESC")
            ->value('role_id');
        $nextNumber = 1;
        if ($maxRoleId) {
            $parts = explode('-', $maxRoleId);
            if (isset($parts[1]) && is_numeric($parts[1])) {
                $nextNumber = intval($parts[1]) + 1;
            }
        }
        $newRoleId = sprintf('%s-%03d', $rolePrefix, $nextNumber);

        // Use a transaction to ensure role assignment happens before activity logging
        DB::transaction(function () use ($validated, $newRoleId) {
        // Create the user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role_id' => $newRoleId,
        ]);

            // Assign Bouncer role immediately
        $user->assign($validated['role']);

        // Handle outlet assignments
        if ($validated['role'] === 'outlet-user' && !empty($validated['outlet_id'])) {
            $assignedOutlet = Outlet::find($validated['outlet_id']);
            if ($assignedOutlet) {
                $assignedOutlet->outlet_user_role_id = $user->role_id;
                $assignedOutlet->save();
            }
        } elseif ($validated['role'] === 'manager' && !empty($validated['outlet_ids'])) {
            // Update each outlet individually to trigger activity logging
            foreach ($validated['outlet_ids'] as $outletId) {
                $outlet = Outlet::find($outletId);
                if ($outlet) {
                    $outlet->manager_role_id = $user->role_id;
                    $outlet->save();
                }
            }
        }

        // Send invitation email
        $roleTitle = $validated['role'] === 'manager' ? 'Manager' : 'Outlet User';
        $outletName = isset($assignedOutlet) ? $assignedOutlet->name : null;
        $defaultPassword = 'password';

        // Get assigned outlets for managers
        $assignedOutlets = null;
        if ($validated['role'] === 'manager' && !empty($validated['outlet_ids'])) {
            $assignedOutlets = Outlet::whereIn('id', $validated['outlet_ids'])
                ->orderBy('name')
                ->get(['id', 'name']);

            Log::info('Assigned outlets for new manager', [
                'manager_id' => $user->id,
                'manager_role_id' => $user->role_id,
                'outlet_count' => $assignedOutlets->count(),
                'outlet_names' => $assignedOutlets->pluck('name')
            ]);
        }

        Mail::to($user->email)->send(new UserInvitationEmail(
            $user,
            $roleTitle,
            $defaultPassword,
            $outletName,
            $assignedOutlets
        ));
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'User created and invitation email sent.');
    }

    /**
     * Show the form for editing a user.
     */
    public function edit(User $user)
    {
        $user->load('roles', 'outletUserOutlet', 'managedOutlets');
        $role = $user->roles->first() ? $user->roles->first()->name : null;

        // Get available outlets based on role
        $availableOutlets = [];
        if ($role === 'outlet-user') {
            $assignedOutlet = $user->outletUserOutlet;
            $assignedOutletId = $assignedOutlet ? $assignedOutlet->id : null;

            // Get outlets that are not assigned to any outlet user or are assigned to this user
            $availableOutlets = Outlet::where(function ($query) use ($assignedOutletId) {
                $query->whereNull('outlet_user_role_id');
                if ($assignedOutletId) {
                    $query->orWhere('id', $assignedOutletId);
                }
            })
                ->orderBy('name')
                ->get(['id', 'name']);
        } else if ($role === 'manager') {
            // For managers, get outlets that have no manager or are already assigned to this manager
            $availableOutlets = Outlet::where(function ($query) use ($user) {
                $query->whereNull('manager_role_id')
                    ->orWhere('manager_role_id', $user->role_id);
            })
                ->orderBy('name')
                ->get(['id', 'name']);
        } else {
            // For other roles, get all outlets
            $availableOutlets = Outlet::orderBy('name')->get(['id', 'name']);
        }

        $assignableRoles = [
            ['value' => 'manager', 'label' => 'Manager'],
            ['value' => 'outlet-user', 'label' => 'Outlet User'],
        ];

        return Inertia::render('Admin/Users/EditPage', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $role,
                'assigned_outlet_id' => $user->outletUserOutlet ? $user->outletUserOutlet->id : null,
                'managed_outlet_ids' => $user->managedOutlets->pluck('id'),
                'is_active' => $user->is_active ?? true,
            ],
            'availableOutlets' => $availableOutlets,
            'assignableRoles' => $assignableRoles,
        ]);
    }

    /**
     * Update a user (Admin action).
     */
    public function update(Request $request, User $user)
    {
        Log::info('User Update Request Data:', $request->all());

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(['manager', 'outlet-user'])],
            'outlet_id' => ['nullable', 'required_if:role,outlet-user', 'exists:outlets,id'],
            'outlet_ids' => ['nullable', 'required_if:role,manager', 'array'],
            'outlet_ids.*' => ['exists:outlets,id'],
        ]);

        // Check for outlet assignment validity for managers
        if ($validated['role'] === 'manager' && !empty($validated['outlet_ids'])) {
            $availableOutlets = Outlet::where(function ($query) use ($user) {
                $query->whereNull('manager_role_id')
                    ->orWhere('manager_role_id', $user->role_id);
            })->pluck('id')->toArray();

            $invalidOutlets = array_diff($validated['outlet_ids'], $availableOutlets);
            if (!empty($invalidOutlets)) {
                return back()->withErrors([
                    'outlet_ids' => 'Some selected outlets are already assigned to other managers.'
                ])->withInput();
            }
        }

        // Update user info
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        // Update Bouncer role
        $user->roles()->detach();
        $user->assign($validated['role']);

        // Handle outlet assignments
        if ($validated['role'] === 'outlet-user') {
            // Remove user from any previous outlet by loading and saving each to trigger observer
            $previousOutlets = Outlet::where('outlet_user_role_id', $user->role_id)->get();
            foreach ($previousOutlets as $outlet) {
                $outlet->outlet_user_role_id = null;
                $outlet->save();
            }
            
            // Assign to new outlet
            if (!empty($validated['outlet_id'])) {
                $outlet = Outlet::find($validated['outlet_id']);
                if ($outlet) {
                    $outlet->outlet_user_role_id = $user->role_id;
                    $outlet->save(); // This will trigger the observer
                }
            }
        } else {
            // For manager role
            // Get current and new outlet assignments
            $currentOutletIds = Outlet::where('manager_role_id', $user->role_id)->pluck('id')->toArray();
            $newOutletIds = $validated['outlet_ids'] ?? [];

            // Find outlets to unassign (in current but not in new)
            $outletsToUnassign = array_diff($currentOutletIds, $newOutletIds);
            if (!empty($outletsToUnassign)) {
                $outlets = Outlet::whereIn('id', $outletsToUnassign)->get();
                foreach ($outlets as $outlet) {
                    $outlet->manager_role_id = null;
                    $outlet->save();
                }
            }

            // Find outlets to assign (in new but not in current)
            $outletsToAssign = array_diff($newOutletIds, $currentOutletIds);
            if (!empty($outletsToAssign)) {
                $outlets = Outlet::whereIn('id', $outletsToAssign)->get();
                foreach ($outlets as $outlet) {
                    $outlet->manager_role_id = $user->role_id;
                    $outlet->save();
                }
            }
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Delete a user (Admin action).
     */
    public function destroy(User $user)
    {
        // Prevent deletion of primary admin
        if ($user->email === 'admin@example.com') {
            return redirect()->route('admin.users.index')->with('error', 'Cannot delete the primary admin user.');
        }
        // Clear outlet assignments
        Outlet::where('outlet_user_role_id', $user->role_id)
            ->orWhere('manager_role_id', $user->role_id)
            ->update([
                'outlet_user_role_id' => null,
                'manager_role_id' => null
            ]);
        $user->roles()->detach();
        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}

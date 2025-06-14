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

class UserController extends Controller
{
    /**
     * Display the user management index page with all users and their roles/outlets.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $allUsers = User::with(['roles', 'outletUserOutlet', 'managedOutlets'])->get();
        $managers = $allUsers->filter(function ($user) {
            return $user->roles->pluck('name')->contains('manager');
        })->map(function ($user) {
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
        })->values();
        $outletUsers = $allUsers->filter(function ($user) {
            return $user->roles->pluck('name')->contains('outlet-user');
        })->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => 'Outlet User',
                'assigned_outlet' => $user->outletUserOutlet ? $user->outletUserOutlet->name : null,
            ];
        })->values();
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

        // Create the user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role_id' => $newRoleId,
        ]);

        // Assign Bouncer role
        $user->assign($validated['role']);

        // Handle outlet assignments
        if ($validated['role'] === 'outlet-user' && !empty($validated['outlet_id'])) {
            $assignedOutlet = Outlet::find($validated['outlet_id']);
            if ($assignedOutlet) {
                $assignedOutlet->outlet_user_role_id = $user->role_id;
                $assignedOutlet->save();
            }
        } elseif ($validated['role'] === 'manager' && !empty($validated['outlet_ids'])) {
            Outlet::whereIn('id', $validated['outlet_ids'])->update([
                'manager_role_id' => $user->role_id
            ]);
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
            // Remove user from any previous outlet
            Outlet::where('outlet_user_role_id', $user->role_id)->update(['outlet_user_role_id' => null]);
            // Assign to new outlet
            if (!empty($validated['outlet_id'])) {
                $outlet = Outlet::find($validated['outlet_id']);
                if ($outlet) {
                    $outlet->outlet_user_role_id = $user->role_id;
                    $outlet->save();
                }
            }
        } else {
            // For manager role
            // First, clear all previous outlet assignments for this manager
            Outlet::where('manager_role_id', $user->role_id)->update(['manager_role_id' => null]);

            // Then assign the selected outlets
            if (!empty($validated['outlet_ids'])) {
                Outlet::whereIn('id', $validated['outlet_ids'])->update([
                    'manager_role_id' => $user->role_id
                ]);
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

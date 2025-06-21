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
use App\Models\Role;
use Illuminate\Support\Facades\Gate;
use App\Models\ActivityLog;

class UserController extends Controller
{
    /**
     * Check if current user has only custom roles
     */
    private function hasOnlyCustomRoles()
    {
        $systemRoles = ['admin', 'manager', 'outlet-user'];
        $userRoles = Auth::user()->roles->pluck('name')->toArray();

        return count($userRoles) > 0 && !array_intersect($userRoles, $systemRoles);
    }

    /**
     * Check permission for custom role users
     */
    private function checkPermission($permission)
    {
        // If user has system roles, they have full access.
        if (!$this->hasOnlyCustomRoles()) {
            return true;
        }

        // For custom roles, use our reliable manual method instead of the failing Gate.
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userAbilities = $user->getAbilitiesManually();

        // Special case for view-users: allow if user has ANY user management permission.
        if ($permission === 'view-users') {
            return $userAbilities->intersect(['view-users', 'create-users', 'edit-users', 'delete-users'])->isNotEmpty();
        }

        // For other permissions, check for the specific ability.
        return $userAbilities->contains($permission);
    }

    /**
     * Display the user management index page with all users and their roles/outlets.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Check view permission (now includes implicit check for any user management permission)
        if (!$this->checkPermission('view-users')) {
            abort(403, 'Unauthorized');
        }

        $managersPerPage = $request->input('managers_per_page', 5);
        $outletUsersPerPage = $request->input('outlet_users_per_page', 5);
        $customRoleUsersPerPage = $request->input('custom_role_users_per_page', 5);
        $adminUsersPerPage = $request->input('admin_users_per_page', 5);

        $managersQuery = User::with(['roles', 'managedOutlets'])
            ->whereHas('roles', function ($query) {
                $query->where('name', 'manager');
            })
            ->orderBy('id');

        $outletUsersQuery = User::with(['roles', 'outletUserOutlet'])
            ->whereHas('roles', function ($query) {
                $query->where('name', 'outlet-user');
            })
            ->orderBy('id');

        $customRoleUsersQuery = User::with(['roles'])
            ->whereHas('roles', function ($query) {
                $query->whereNotIn('name', ['manager', 'outlet-user', 'admin']);
            })
            ->orderBy('id');

        $adminUsersQuery = User::with(['roles'])
            ->whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })
            ->orderBy('id');

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

        $customRoleUsers = $customRoleUsersQuery->paginate($customRoleUsersPerPage, ['*'], 'custom_role_users_page', $request->input('custom_role_users_page'))
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => $user->roles->first() ? ($user->roles->first()->title ?? $user->roles->first()->name) : '',
                ];
            });

        $adminUsers = $adminUsersQuery->paginate($adminUsersPerPage, ['*'], 'admin_users_page', $request->input('admin_users_page'))
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => $user->roles->first() ? ($user->roles->first()->title ?? $user->roles->first()->name) : '',
                ];
            });

        return Inertia::render('Admin/Users/IndexPage', [
            'managers' => $managers,
            'outletUsers' => $outletUsers,
            'customRoleUsers' => $customRoleUsers,
            'adminUsers' => $adminUsers,
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
        // Activity log viewing is tied to view-users permission
        if (!$this->checkPermission('view-users')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Admin/Users/ActivityLogPage', [
            'userId' => $userId,
        ]);
    }

    /**
     * Store a newly created user (Manager or Outlet User) from the Admin panel.
     */
    public function store(Request $request)
    {
        // Check create permission
        if (!$this->checkPermission('create-users')) {
            abort(403, 'Unauthorized');
        }

        Log::info('Request data for User creation:', $request->all());
        Log::info('Admin User Create Request:', $request->all());
        $allowedRoles = Role::pluck('name')->toArray();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in($allowedRoles)],
            'outlet_id' => ['nullable', 'required_if:role,outlet-user', 'exists:outlets,id'],
            'outlet_ids' => ['nullable', 'required_if:role,manager', 'array'],
            'outlet_ids.*' => ['exists:outlets,id'],
        ]);

        // Generate next role_id for each role type
        $rolePrefix = $validated['role'] === 'manager' ? 'M' : ($validated['role'] === 'outlet-user' ? 'O' : ($validated['role'] === 'admin' ? 'A' : 'C'));
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

        DB::transaction(function () use ($validated, $newRoleId) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $newRoleId,
            ]);

            // Assign Bouncer role immediately
            $user->assign($validated['role']);

            // Handle outlet assignments only for system roles
            if ($validated['role'] === 'outlet-user' && !empty($validated['outlet_id'])) {
                $assignedOutlet = Outlet::find($validated['outlet_id']);
                if ($assignedOutlet) {
                    $assignedOutlet->outlet_user_role_id = $user->role_id;
                    $assignedOutlet->save();
                }
            } elseif ($validated['role'] === 'manager' && !empty($validated['outlet_ids'])) {
                foreach ($validated['outlet_ids'] as $outletId) {
                    $outlet = Outlet::find($outletId);
                    if ($outlet) {
                        $outlet->manager_role_id = $user->role_id;
                        $outlet->save();
                    }
                }
            }

            // Send invitation email (roleTitle logic for system roles, fallback for custom)
            $roleTitle = ($validated['role'] === 'manager' ? 'Manager' : ($validated['role'] === 'outlet-user' ? 'Outlet User' : ucfirst(str_replace('-', ' ', $validated['role']))));
            $outletName = isset($assignedOutlet) ? $assignedOutlet->name : null;
            $defaultPassword = 'password';
            $assignedOutlets = null;
            if ($validated['role'] === 'manager' && !empty($validated['outlet_ids'])) {
                $assignedOutlets = Outlet::whereIn('id', $validated['outlet_ids'])
                    ->orderBy('name')
                    ->get(['id', 'name']);
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
        // Check edit permission
        if (!$this->checkPermission('edit-users')) {
            abort(403, 'Unauthorized');
        }

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
        // Check edit permission
        if (!$this->checkPermission('edit-users')) {
            abort(403, 'Unauthorized');
        }

        $oldRole = $user->roles->first();
        $oldRoleTitle = $oldRole ? ($oldRole->title ?? $oldRole->name) : 'N/A';

        $allowedRoles = Role::pluck('name')->toArray();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in($allowedRoles)],
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

        // Detach old role and assign new one
        $user->roles()->detach();
        $user->assign($validated['role']);

        $newRoleName = $validated['role'];
        if ($oldRole->name !== $newRoleName) {
            $newRole = Role::where('name', $newRoleName)->first();
            $newRoleTitle = $newRole ? ($newRole->title ?? $newRole->name) : 'N/A';

            ActivityLog::create([
                'target_type' => 'User',
                'action_type' => 'Update',
                'details' => "Role for user \"{$user->name}\" was changed from \"{$oldRoleTitle}\" to \"{$newRoleTitle}\".",
                'user_id' => Auth::id(),
            ]);
        }

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
        // Check delete permission
        if (!$this->checkPermission('delete-users')) {
            abort(403, 'Unauthorized');
        }

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

<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Silber\Bouncer\Database\Ability;
use Silber\Bouncer\Database\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Silber\Bouncer\BouncerFacade as Bouncer;

class RolePermissionController extends Controller
{
    // List all roles
    public function roles()
    {
        // Temporarily log the role model being used
        Log::info('Role model being used: ' . get_class(new Role()));

        $roles = Role::query()
            ->select('roles.*')
            ->selectRaw('COALESCE((SELECT COUNT(*) FROM assigned_roles WHERE assigned_roles.role_id = roles.id), 0) as user_count')
            ->orderByRaw("CASE name WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 WHEN 'outlet-user' THEN 3 ELSE 4 END")
            ->get();

        // Define system roles that cannot be deleted or have their permissions modified
        $systemRoles = ['admin', 'manager', 'outlet-user'];

        // Add isSystem flag to each role
        $roles->each(function ($role) use ($systemRoles) {
            $role->isSystem = in_array($role->name, $systemRoles);
        });

        return response()->json($roles);
    }

    // List all abilities (permissions)
    public function abilities()
    {
        return response()->json(Ability::all());
    }

    // Store a new role
    public function storeRole(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $role = Role::create($validatedData);

        // Re-fetch the newly created role with user_count for consistency
        $newRole = Role::query()
            ->where('id', $role->id)
            ->select('roles.*')
            ->selectRaw('COALESCE((SELECT COUNT(*) FROM assigned_roles WHERE assigned_roles.role_id = roles.id), 0) as user_count')
            ->first();

        return response()->json(['success' => true, 'role' => $newRole], 201); // 201 Created
    }

    // Get all ability IDs assigned to a role
    public function getRoleAbilities($roleId)
    {
        $role = Role::findOrFail($roleId);
        $abilityIds = $role->abilities()->pluck('abilities.id');
        return response()->json($abilityIds);
    }

    // Update abilities for a role
    public function updateRoleAbilities(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);
        $abilityIds = $request->input('ability_ids', []);

        // Sync abilities and get changes
        $changes = $role->abilities()->sync($abilityIds);

        // Log activity if there were any changes in permissions
        if (!empty($changes['attached']) || !empty($changes['detached'])) {
            ActivityLog::create([
                'target_type' => 'Role',
                'action_type' => 'Update',
                'details' => "Permissions for role \"{$role->title}\" were updated.",
                'user_id' => Auth::id(),
            ]);
        }

        // Refresh Bouncer's cache to ensure changes are reflected immediately
        Bouncer::refresh();

        return response()->json(['success' => true]);
    }

    // Update role details (name, title, description)
    public function updateRoleDetails(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);
        $role->update($request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id, // Ensure unique name
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]));

        // Re-fetch the role with the user_count and correct order for consistency
        $updatedRole = Role::query()
            ->where('id', $role->id)
            ->select('roles.*')
            ->selectRaw('COALESCE((SELECT COUNT(*) FROM assigned_roles WHERE assigned_roles.role_id = roles.id), 0) as user_count')
            ->first();

        // Define system roles that cannot be deleted or have their permissions modified (must match the list in roles() method)
        $systemRoles = ['admin', 'manager', 'outlet-user'];

        // Add isSystem flag to the updated role
        $updatedRole->isSystem = in_array($updatedRole->name, $systemRoles);

        return response()->json(['success' => true, 'role' => $updatedRole]);
    }

    // Delete a role
    public function destroyRole($roleId)
    {
        $role = Role::findOrFail($roleId);

        // Prevent deletion of system roles (e.g., 'admin', 'manager', 'outlet-user')
        if (in_array($role->name, ['admin', 'manager', 'outlet-user'])) {
            return response()->json(['success' => false, 'message' => 'System roles cannot be deleted.'], 403);
        }

        // Check if role is assigned to any users
        if ($role->users()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Role cannot be deleted while assigned to users.'], 409);
        }

        $role->delete();

        return response()->json(['success' => true, 'message' => 'Role deleted successfully.']);
    }
}

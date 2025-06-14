<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Silber\Bouncer\Database\Role;
use Silber\Bouncer\Database\Ability;
use Silber\Bouncer\Database\Permission;
use Illuminate\Support\Facades\DB;

class RolePermissionController extends Controller
{
    // List all roles
    public function roles()
    {
        $roles = Role::query()
            ->select('roles.*')
            ->selectRaw('COALESCE((SELECT COUNT(*) FROM assigned_roles WHERE assigned_roles.role_id = roles.id), 0) as user_count')
            ->orderByRaw("CASE name WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 WHEN 'outlet-user' THEN 3 ELSE 4 END")
            ->get();
        return response()->json($roles);
    }

    // List all abilities (permissions)
    public function abilities()
    {
        return response()->json(Ability::all());
    }

    // Get all ability IDs assigned to a role
    public function getRoleAbilities($roleId)
    {
        $role = Role::findOrFail($roleId);
        $abilityIds = $role->abilities()->pluck('id');
        return response()->json($abilityIds);
    }

    // Update abilities for a role
    public function updateRoleAbilities(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);
        $abilityIds = $request->input('ability_ids', []);
        // Sync abilities
        $role->abilities()->sync($abilityIds);
        return response()->json(['success' => true]);
    }
}

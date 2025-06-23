<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Outlet;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List outlet users managed by the current manager
     */
    public function index(Request $request)
    {
        $manager = Auth::user();
        $outlets = Outlet::where('manager_role_id', $manager->role_id)->get();

        $outletUsers = $outlets->map(function ($outlet) {
            $user = User::where('role_id', $outlet->outlet_user_role_id)->first();
            if (!$user) return null;

            $lastLogin = ActivityLog::where('user_id', $user->id)
                ->where('action_type', 'Login')
                ->max('created_at');

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'outlet' => $outlet->name,
                'status' => $lastLogin ? 'Active' : 'Needs Onboarding',
                'lastLogin' => $lastLogin ? $lastLogin : 'Never',
                'dateJoined' => $user->created_at ? $user->created_at->format('Y-m-d') : '',
            ];
        })->filter()->values();

        return response()->json([
            'outletUsers' => $outletUsers
        ]);
    }
}

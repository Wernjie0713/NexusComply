<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Silber\Bouncer\BouncerFacade as Bouncer;
use App\Models\Audit;

class MobileDashboardController extends Controller
{
    /**
     * Get dashboard data for the mobile app based on user role.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getData(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if user has outlet user role
        if (Bouncer::is($user)->an('outlet-user')) {
            return $this->getOutletUserData($user);
        }
        
        // If role not supported in mobile app, return error
        return response()->json([
            'message' => 'User role not supported in mobile application',
        ], 403);
    }
    
    /**
     * Get dashboard data specifically for outlet users.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    private function getOutletUserData($user): JsonResponse
    {
        // Get audit counts based on status
        $completedCount = Audit::where('user_id', $user->id)
            ->whereHas('status', function($query) {
                $query->where('name', 'approved');
            })
            ->count();

        $newAuditsCount = Audit::where('user_id', $user->id)
            ->whereHas('status', function($query) {
                $query->where('name', 'draft');
            })
            ->count();

        $pendingCount = Audit::where('user_id', $user->id)
            ->whereHas('status', function($query) {
                $query->whereNotIn('name', ['approved', 'draft']);
            })
            ->count();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'outlet-user',
            ],
            'metrics' => [
                [
                    'title' => 'Tasks Pending',
                    'value' => (string)$pendingCount,
                    'icon' => 'clipboard-outline',
                    'color' => '#EF4444'
                ],
                [
                    'title' => 'Completed',
                    'value' => (string)$completedCount,
                    'icon' => 'checkmark-circle-outline',
                    'color' => '#10B981'
                ],
                [
                    'title' => 'Compliance Score',
                    'value' => 'NaN',
                    'icon' => 'analytics-outline',
                    'color' => '#3B82F6'
                ],
                [
                    'title' => 'New Audits',
                    'value' => (string)$newAuditsCount,
                    'icon' => 'document-text-outline',
                    'color' => '#F59E0B'
                ]
            ],
            'recentActivity' => [
                [
                    'id' => 1,
                    'title' => 'Daily Temperature Check',
                    'status' => 'completed',
                    'timestamp' => now()->subHours(2)->toIso8601String(),
                    'displayTime' => 'Today at 9:30 AM'
                ],
                [
                    'id' => 2,
                    'title' => 'Staff Hygiene Inspection',
                    'status' => 'completed',
                    'timestamp' => now()->subHours(4)->toIso8601String(),
                    'displayTime' => 'Today at 7:45 AM'
                ],
                [
                    'id' => 3,
                    'title' => 'Equipment Cleaning Log',
                    'status' => 'completed',
                    'timestamp' => now()->subDay()->toIso8601String(),
                    'displayTime' => 'Yesterday at 5:15 PM'
                ]
            ]
        ]);
    }
}
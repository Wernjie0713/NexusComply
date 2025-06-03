<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Silber\Bouncer\BouncerFacade as Bouncer;

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
        // In a real implementation, you would:
        // 1. Fetch tasks pending for the outlet
        // 2. Get compliance metrics
        // 3. Get recent activity
        // 4. Format everything for mobile consumption
        
        // For demo purposes, we'll return structured mock data
        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'outlet-user',
            ],
            'metrics' => [
                [
                    'title' => 'Tasks Pending',
                    'value' => '12',
                    'icon' => 'clipboard-outline',
                    'color' => '#EF4444'
                ],
                [
                    'title' => 'Completed',
                    'value' => '28',
                    'icon' => 'checkmark-circle-outline',
                    'color' => '#10B981'
                ],
                [
                    'title' => 'Compliance Score',
                    'value' => '92%',
                    'icon' => 'analytics-outline',
                    'color' => '#3B82F6'
                ],
                [
                    'title' => 'New Audits',
                    'value' => '3',
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
            ],
            'tasksDueToday' => [
                [
                    'id' => 1,
                    'title' => 'Equipment Safety Check',
                    'dueTime' => 'Due by 5:00 PM',
                    'priority' => 'high'
                ],
                [
                    'id' => 2,
                    'title' => 'Inventory Audit',
                    'dueTime' => 'Due by 6:30 PM',
                    'priority' => 'medium'
                ]
            ]
        ]);
    }
}
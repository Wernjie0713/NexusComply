<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use App\Models\Audit;
use App\Models\Status;
use App\Models\ActivityLog;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Get all statuses in one query
            $statuses = Status::all()->keyBy('name');
            
            // Get all statistics in one query
            $statistics = [
                'totalOutlets' => Outlet::where('is_active', true)->count(),
                'activeUsers' => User::where('email_verified_at', '!=', null)->count(),
                'currentMonthChecks' => Audit::whereBetween('created_at', [
                    Carbon::now()->startOfMonth(),
                    Carbon::now()->endOfMonth()
                ])->count(),
                'pendingReviews' => Audit::where('status_id', $statuses['draft']->id ?? null)->count()
            ];
            
            // Get compliance data
            $complianceData = [
                'fullyCompliant' => [
                    'count' => Audit::where('status_id', $statuses['submitted']->id ?? null)->count(),
                    'percentage' => 65
                ],
                'partiallyCompliant' => [
                    'count' => Audit::where('status_id', $statuses['revised']->id ?? null)->count(),
                    'percentage' => 25
                ],
                'nonCompliant' => [
                    'count' => Audit::where('status_id', $statuses['draft']->id ?? null)->count(),
                    'percentage' => 10
                ]
            ];
            
            // Get recent activities
            $recentActivities = ActivityLog::with('user')
                ->latest('created_at')
                ->take(5)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'description' => $activity->details,
                        'time' => Carbon::parse($activity->created_at)->diffForHumans()
                    ];
                });
            
            return Inertia::render('Admin/DashboardPage', [
                'statistics' => $statistics,
                'complianceData' => $complianceData,
                'recentActivities' => $recentActivities
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Admin/DashboardPage', [
                'statistics' => [],
                'complianceData' => [],
                'recentActivities' => []
            ]);
        }
    }
}
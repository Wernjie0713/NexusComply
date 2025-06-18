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
                'averageCompletionTime' => Audit::whereNotNull('end_time')
                    ->whereNotNull('start_time')
                    ->where('end_time', '>=', Carbon::now()->subMonths(3))
                    ->get()
                    ->avg(function ($audit) {
                        return Carbon::parse($audit->end_time)->diffInHours(Carbon::parse($audit->start_time));
                    }),
                'pendingReviews' => Audit::where('status_id', $statuses['pending']->id ?? null)->count()
            ];

            // Get compliance data
            $complianceData = [
                'fullyCompliant' => [
                    'count' => Audit::where('status_id', $statuses['approved']->id ?? null)
                        ->where('created_at', '>=', Carbon::now()->startOfMonth())
                        ->count(),
                    'percentage' => 0
                ],
                'partiallyCompliant' => [
                    'count' => Audit::whereIn('status_id', [
                        $statuses['pending']->id ?? null,
                        $statuses['rejected']->id ?? null
                    ])
                    ->where('created_at', '>=', Carbon::now()->startOfMonth())
                    ->count(),
                    'percentage' => 0
                ],
                'nonCompliant' => [
                    'count' => Audit::where('status_id', $statuses['draft']->id ?? null)
                        ->where('created_at', '>=', Carbon::now()->startOfMonth())
                        ->count(),
                    'percentage' => 0
                ]
            ];

            // Calculate total audits for this month
            $totalAudits = array_sum(array_column($complianceData, 'count'));

            // Calculate percentages if there are audits
            if ($totalAudits > 0) {
                $complianceData['fullyCompliant']['percentage'] = round(($complianceData['fullyCompliant']['count'] / $totalAudits) * 100);
                $complianceData['partiallyCompliant']['percentage'] = round(($complianceData['partiallyCompliant']['count'] / $totalAudits) * 100);
                $complianceData['nonCompliant']['percentage'] = round(($complianceData['nonCompliant']['count'] / $totalAudits) * 100);
            }

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

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use App\Models\Audit;
use App\Models\Status;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Get total active outlets
            $totalOutlets = Outlet::where('is_active', true)->count();
            
            // Get active users (users with role_id)
            $activeUsers = User::whereNotNull('role_id')->count();
            
            // Get compliance checks for current month
            $currentMonthChecks = Audit::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();
                
            // Get status IDs for different compliance states
            $pendingReviewStatus = Status::where('name', 'Pending Review')->first();
            $fullyCompliantStatus = Status::where('name', 'Fully Compliant')->first();
            $partiallyCompliantStatus = Status::where('name', 'Partially Compliant')->first();
            $nonCompliantStatus = Status::where('name', 'Non-Compliant')->first();
            
            // Get pending reviews
            $pendingReviews = $pendingReviewStatus ? 
                Audit::where('status_id', $pendingReviewStatus->id)->count() : 0;
            
            // Get compliance data
            $totalAudits = Audit::count();
            $fullyCompliant = $fullyCompliantStatus ? 
                Audit::where('status_id', $fullyCompliantStatus->id)->count() : 0;
            $partiallyCompliant = $partiallyCompliantStatus ? 
                Audit::where('status_id', $partiallyCompliantStatus->id)->count() : 0;
            $nonCompliant = $nonCompliantStatus ? 
                Audit::where('status_id', $nonCompliantStatus->id)->count() : 0;
            
            // Calculate percentages
            $fullyCompliantPercentage = $totalAudits > 0 ? round(($fullyCompliant / $totalAudits) * 100) : 0;
            $partiallyCompliantPercentage = $totalAudits > 0 ? round(($partiallyCompliant / $totalAudits) * 100) : 0;
            $nonCompliantPercentage = $totalAudits > 0 ? round(($nonCompliant / $totalAudits) * 100) : 0;
            
            return Inertia::render('Admin/DashboardPage', [
                'statistics' => [
                    'totalOutlets' => $totalOutlets,
                    'activeUsers' => $activeUsers,
                    'currentMonthChecks' => $currentMonthChecks,
                    'pendingReviews' => $pendingReviews,
                ],
                'complianceData' => [
                    'fullyCompliant' => [
                        'count' => $fullyCompliant,
                        'percentage' => $fullyCompliantPercentage
                    ],
                    'partiallyCompliant' => [
                        'count' => $partiallyCompliant,
                        'percentage' => $partiallyCompliantPercentage
                    ],
                    'nonCompliant' => [
                        'count' => $nonCompliant,
                        'percentage' => $nonCompliantPercentage
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard data fetch error: ' . $e->getMessage());
            throw $e; // Let Laravel handle the error
        }
    }
}
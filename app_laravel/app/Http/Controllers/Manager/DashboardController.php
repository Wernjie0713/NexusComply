<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Audit;
use App\Models\Status;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $roleId = $user->role_id;

            // Get all outlets managed by this manager
            $outlets = Outlet::where('manager_role_id', $roleId)->pluck('id');

            // Get all audits for these outlets
            $audits = Audit::whereIn('outlet_id', $outlets)->get();

            // Get status IDs
            $statuses = Status::all()->keyBy('name');
            $draftStatusId = $statuses['draft']->id ?? null;
            $pendingStatusId = $statuses['pending']->id ?? null;
            $approvedStatusId = $statuses['approved']->id ?? null;
            $rejectedStatusId = $statuses['rejected']->id ?? null;

            // Get period from request
            $period = $request->input('period', 'this_month');
            $now = Carbon::now();

            if ($period === 'this_month') {
                $start = $now->copy()->startOfMonth();
                $end = $now->copy()->endOfMonth();
            } elseif ($period === 'last_month') {
                $start = $now->copy()->subMonth()->startOfMonth();
                $end = $now->copy()->subMonth()->endOfMonth();
            } else { // all_time
                $start = null;
                $end = null;
            }

            // Filter audits by period
            $auditsFiltered = $audits;
            if ($start && $end) {
                $auditsFiltered = $audits->filter(function ($audit) use ($start, $end) {
                    return $audit->created_at >= $start && $audit->created_at <= $end;
                });
            }

            // Now use $auditsFiltered for all summary calculations
            $pendingSubmissions = $auditsFiltered->where('status_id', $draftStatusId)->count();
            $overdueAudits = $auditsFiltered->filter(function ($audit) use ($draftStatusId, $pendingStatusId, $now) {
                return in_array($audit->status_id, [$draftStatusId, $pendingStatusId]) &&
                    $audit->due_date && Carbon::parse($audit->due_date)->lt($now);
            })->count();
            $pendingReviews = $auditsFiltered->where('status_id', $pendingStatusId)->count();

            $complianceData = [
                'fullyCompliant' => [
                    'count' => $auditsFiltered->where('status_id', $approvedStatusId)->count(),
                    'percentage' => 0
                ],
                'partiallyCompliant' => [
                    'count' => $auditsFiltered->whereIn('status_id', array_filter([$pendingStatusId, $rejectedStatusId]))->count(),
                    'percentage' => 0
                ],
                'nonCompliant' => [
                    'count' => $auditsFiltered->where('status_id', $draftStatusId)->count(),
                    'percentage' => 0
                ]
            ];
            $totalAudits = array_sum(array_column($complianceData, 'count'));
            if ($totalAudits > 0) {
                $complianceData['fullyCompliant']['percentage'] = round(($complianceData['fullyCompliant']['count'] / $totalAudits) * 100);
                $complianceData['partiallyCompliant']['percentage'] = round(($complianceData['partiallyCompliant']['count'] / $totalAudits) * 100);
                $complianceData['nonCompliant']['percentage'] = round(($complianceData['nonCompliant']['count'] / $totalAudits) * 100);
            }

            // Auditor Performance table (optionally filter by period)
            $outletStaffActivity = [];
            $outletWithStaff = Outlet::whereIn('id', $outlets)->with('outletUser')->get();
            foreach ($outletWithStaff as $outlet) {
                $staff = $outlet->outletUser;
                if ($staff) {
                    $staffAudits = Audit::where('outlet_id', $outlet->id)
                        ->where('user_id', $staff->id)
                        ->when($start && $end, function ($query) use ($start, $end) {
                            $query->whereBetween('created_at', [$start, $end]);
                        })
                        ->get();
                    $outletStaffActivity[] = [
                        'id' => $staff->id,
                        'name' => $staff->name,
                        'outlet' => $outlet->name,
                        'auditsCompleted' => $staffAudits->where('status_id', $approvedStatusId)->count(),
                        'pendingSubmissions' => $staffAudits->where('status_id', $draftStatusId)->count(),
                        'overdueAudits' => $staffAudits->filter(function ($audit) use ($draftStatusId, $pendingStatusId, $now) {
                            return in_array($audit->status_id, [$draftStatusId, $pendingStatusId]) &&
                                $audit->due_date && Carbon::parse($audit->due_date)->lt($now);
                        })->count(),
                        'rejectedAudits' => $staffAudits->where('status_id', $rejectedStatusId)->count(),
                    ];
                }
            }

            // Stacked bar chart data: audits grouped by compliance category and compliance status (filtered by period)
            $categories = \App\Models\ComplianceCategory::all();
            $categoryBarData = $categories->map(function ($category) use ($auditsFiltered, $approvedStatusId, $pendingStatusId, $rejectedStatusId, $draftStatusId) {
                $catAudits = $auditsFiltered->filter(function ($audit) use ($category) {
                    return $audit->complianceRequirement && $audit->complianceRequirement->category_id == $category->id;
                });
                return [
                    'category' => $category->name,
                    'fullyCompliant' => $catAudits->where('status_id', $approvedStatusId)->count(),
                    'partiallyCompliant' => $catAudits->whereIn('status_id', array_filter([$pendingStatusId, $rejectedStatusId]))->count(),
                    'nonCompliant' => $catAudits->where('status_id', $draftStatusId)->count(),
                ];
            })->values()->all();

            return Inertia::render('Manager/DashboardPage', [
                'outletsMonitored' => $outlets->count(),
                'pendingSubmissions' => $pendingSubmissions,
                'overdueAudits' => $overdueAudits,
                'pendingReviews' => $pendingReviews,
                'complianceData' => $complianceData,
                'outletStaffActivity' => $outletStaffActivity,
                'userName' => $user->name,
                'categoryComplianceBarData' => $categoryBarData,
                'selectedPeriod' => $period,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Manager/DashboardPage', [
                'outletsMonitored' => 0,
                'pendingSubmissions' => 0,
                'overdueAudits' => 0,
                'pendingReviews' => 0,
                'complianceData' => [],
                'outletStaffActivity' => [],
                'error' => $e->getMessage(),
                'userName' => null,
                'categoryComplianceBarData' => [],
                'selectedPeriod' => 'this_month', // Default to this_month on error
            ]);
        }
    }
}

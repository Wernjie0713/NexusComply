<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Audit;
use App\Models\Status;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
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

            // Get start of current month
            $startOfMonth = Carbon::now()->startOfMonth();

            // Get all audits for these outlets created this month
            $auditsThisMonth = $audits->filter(function ($audit) use ($startOfMonth) {
                return $audit->created_at >= $startOfMonth;
            });

            // Pending submissions: audits with status 'draft' created this month
            $pendingSubmissions = $auditsThisMonth->where('status_id', $draftStatusId)->count();

            // Overdue audits: status 'draft' or 'pending', due_date < now, created this month
            $now = Carbon::now();
            $overdueAudits = $auditsThisMonth->filter(function ($audit) use ($draftStatusId, $pendingStatusId, $now) {
                return in_array($audit->status_id, [$draftStatusId, $pendingStatusId]) &&
                    $audit->due_date && Carbon::parse($audit->due_date)->lt($now);
            })->count();

            // Compliance rate: percent of 'approved' audits this month
            $approvedThisMonth = $auditsThisMonth->where('status_id', $approvedStatusId)->count();
            $totalThisMonth = $auditsThisMonth->count();
            $complianceRate = $totalThisMonth > 0 ? round(($approvedThisMonth / $totalThisMonth) * 100) : 0;

            // Regional compliance summary (like admin, but filtered)
            $rejectedStatusId = $statuses['rejected']->id ?? null;
            $complianceData = [
                'fullyCompliant' => [
                    'count' => $auditsThisMonth->where('status_id', $approvedStatusId)->count(),
                    'percentage' => 0
                ],
                'partiallyCompliant' => [
                    'count' => $auditsThisMonth->whereIn('status_id', array_filter([$pendingStatusId, $rejectedStatusId]))->count(),
                    'percentage' => 0
                ],
                'nonCompliant' => [
                    'count' => $auditsThisMonth->where('status_id', $draftStatusId)->count(),
                    'percentage' => 0
                ]
            ];
            $totalAudits = array_sum(array_column($complianceData, 'count'));
            if ($totalAudits > 0) {
                $complianceData['fullyCompliant']['percentage'] = round(($complianceData['fullyCompliant']['count'] / $totalAudits) * 100);
                $complianceData['partiallyCompliant']['percentage'] = round(($complianceData['partiallyCompliant']['count'] / $totalAudits) * 100);
                $complianceData['nonCompliant']['percentage'] = round(($complianceData['nonCompliant']['count'] / $totalAudits) * 100);
            }

            // Pending Reviews card: total audits in 'pending' status for these outlets, this month
            $pendingReviews = $auditsThisMonth->where('status_id', $pendingStatusId)->count();

            // Auditor Performance table
            $outletStaffActivity = [];
            foreach (Outlet::whereIn('id', $outlets)->with('outletUser')->get() as $outlet) {
                $staff = $outlet->outletUser;
                if ($staff) {
                    $staffAudits = Audit::where('outlet_id', $outlet->id)
                        ->where('user_id', $staff->id)
                        ->where('created_at', '>=', $startOfMonth)
                        ->get();
                    $outletStaffActivity[] = [
                        'id' => $staff->id,
                        'name' => $staff->name,
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

            // Stacked bar chart data: audits grouped by compliance category and compliance status
            $categories = \App\Models\ComplianceCategory::all();
            $categoryBarData = $categories->map(function ($category) use ($audits, $approvedStatusId, $pendingStatusId, $rejectedStatusId, $draftStatusId) {
                // Get audits for this category (via complianceRequirement)
                $catAudits = $audits->filter(function ($audit) use ($category) {
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
            ]);
        }
    }
} 
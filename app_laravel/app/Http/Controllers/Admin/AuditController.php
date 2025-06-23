<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Audit;
use App\Models\Outlet;
use App\Models\User;
use App\Models\ComplianceRequirement;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class AuditController extends Controller
{
    /**
     * Display a listing of the audits.
     */
    public function index(Request $request)
    {
        // Get latest version IDs for versioned audits
        $latestVersionSubquery = DB::table('audit_version as av1')
            ->select('av1.first_audit_id', DB::raw('MAX(av1.audit_version) as latest_version'))
            ->groupBy('av1.first_audit_id');

        $latestAuditIds = DB::table('audit_version as av2')
            ->joinSub($latestVersionSubquery, 'latest', function ($join) {
                $join->on('av2.first_audit_id', '=', 'latest.first_audit_id')
                    ->on('av2.audit_version', '=', 'latest.latest_version');
            })
            ->pluck('av2.audit_id');

        // Find all audit IDs that are in the audit_version table (any version)
        $versionedAuditIds = DB::table('audit_version')->pluck('audit_id');

        // Get all audits with related data, but only latest version or not versioned
        $query = Audit::with([
            'outlet',
            'user',
            'status',
            'complianceRequirement',
            'auditForms.formTemplate',
            'auditForms.status',
        ])
            ->when($request->has('dateFilter') && $request->dateFilter !== 'all', function ($q) use ($request) {
                $now = now();
                switch ($request->dateFilter) {
                    case 'last7':
                        $q->where('start_time', '>=', $now->copy()->subDays(7));
                        break;
                    case 'last30':
                        $q->where('start_time', '>=', $now->copy()->subDays(30));
                        break;
                    case 'last90':
                        $q->where('start_time', '>=', $now->copy()->subDays(90));
                        break;
                    case 'thisYear':
                        $q->whereYear('start_time', $now->year);
                        break;
                }
            })
            ->where(function ($query) use ($latestAuditIds, $versionedAuditIds) {
                $query->whereIn('id', $latestAuditIds)
                    ->orWhereNotIn('id', $versionedAuditIds);
            });

        // Calculate summary data
        $summaryData = [
            'totalActive' => Audit::whereHas('status', function ($q) {
                $q->whereIn('name', ['draft', 'pending']);
            })->count(),
            'pendingReview' => Audit::whereHas('status', function ($q) {
                $q->where('name', 'pending');
            })->count(),
            'overdueTasks' => Audit::whereHas('status', function ($q) {
                $q->whereIn('name', ['draft', 'pending']);
            })->where('due_date', '<', now())->count(),
        ];

        // Apply status filter
        if ($request->has('statusFilter') && $request->statusFilter !== 'all') {
            $query->whereHas('status', function ($q) use ($request) {
                $q->where('name', $request->statusFilter);
            });
        }

        $audits = $query->orderBy('start_time', 'desc')->get();

        // Set versionNumber for each audit
        foreach ($audits as $audit) {
            // Add version information if available
            $versionInfo = DB::table('audit_version')
                ->where('audit_id', $audit->id)
                ->first();

            if ($versionInfo) {
                $audit->isVersioned = true;
                $audit->versionNumber = $versionInfo->audit_version;
                $audit->firstAuditId = $versionInfo->first_audit_id;
            } else {
                $audit->isVersioned = false;
                $audit->versionNumber = 1;
            }
        }

        // Transform the audits to include the compliance requirement title
        $audits->transform(function ($audit) {
            $audit->title = $audit->complianceRequirement ? $audit->complianceRequirement->title : 'Unnamed Audit';
            if ($audit->complianceRequirement && $audit->complianceRequirement->frequency) {
                $audit->due_date = $this->calculateDueDate($audit->start_time, $audit->complianceRequirement->frequency);
            }
            return $audit;
        });

        // Calculate due dates for each audit based on frequency
        $audits->transform(function ($audit) {
            if ($audit->complianceRequirement && $audit->complianceRequirement->frequency) {
                $audit->due_date = $this->calculateDueDate($audit->start_time, $audit->complianceRequirement->frequency);
            }
            return $audit;
        });

        // --- Audit History Data ---
        $allAudits = Audit::with(['outlet', 'user', 'status', 'complianceRequirement'])->get()->keyBy('id');
        $auditChains = DB::table('audit_version')
            ->select('first_audit_id', DB::raw('COUNT(*) as num_versions'))
            ->groupBy('first_audit_id')
            ->get()
            ->keyBy('first_audit_id');
        $auditsWithVersions = $auditChains->keys()->all();

        // Build history for audits with versions (existing logic)
        $auditHistory = $auditChains->map(function ($chain, $firstAuditId) use ($allAudits) {
            $originalAudit = $allAudits[$firstAuditId] ?? null;
            if (!$originalAudit) return null;

            $versionsMeta = DB::table('audit_version')
                ->where('first_audit_id', $firstAuditId)
                ->orderBy('audit_version')
                ->get()
                ->keyBy('audit_id');

            $versions = $versionsMeta->keys();

            $versionAudits = Audit::with(['status', 'user'])
                ->whereIn('id', $versions)
                ->get()
                ->sortBy(function ($audit) use ($versions) {
                    return array_search($audit->id, $versions->toArray());
                })
                ->values();

            $versionDetails = $versionAudits->map(function ($audit) use ($versionsMeta) {
                $meta = $versionsMeta[$audit->id] ?? null;
                // Find review/action log (if any)
                $reviewLog = \App\Models\ActivityLog::where('target_type', 'audit')
                    ->where('action_type', 'review')
                    ->where('details', 'like', '%"audit_id":' . $audit->id . '%')
                    ->orderByDesc('created_at')
                    ->first();
                // Find rejection reason (if rejected)
                $rejectionReason = null;
                if ($audit->status && strtolower($audit->status->name) === 'rejected') {
                    $auditFormIds = DB::table('audit_audit_form')
                        ->where('audit_id', $audit->id)
                        ->pluck('audit_form_id');
                    $rejectionReason = DB::table('issue')
                        ->whereIn('audit_form_id', $auditFormIds)
                        ->value('description');
                }
                $issuesCount = 0;
                $issuesArr = [];
                if ($audit->status && strtolower($audit->status->name) === 'rejected') {
                    $auditFormIds = DB::table('audit_audit_form')
                        ->where('audit_id', $audit->id)
                        ->pluck('audit_form_id');
                    $issuesArr = DB::table('issue')
                        ->whereIn('audit_form_id', $auditFormIds)
                        ->select('id', 'description', 'severity', 'created_at', 'due_date', 'updated_at', 'status_id')
                        ->get()
                        ->map(function ($issue) {
                            $correctiveActions = DB::table('corrective_actions')
                                ->where('issue_id', $issue->id)
                                ->select('description', 'completion_date', 'verification_date', 'status_id', 'created_at')
                                ->get();
                            $issue->corrective_actions = $correctiveActions;
                            return $issue;
                        });
                    $issuesCount = $issuesArr->count();
                }
                $auditFormIds = DB::table('audit_audit_form')
                    ->where('audit_id', $audit->id)
                    ->pluck('audit_form_id');
                $forms = DB::table('audit_form')
                    ->whereIn('id', $auditFormIds)
                    ->get(['id', 'name', 'value', 'form_id']);
                $forms = $forms->map(function ($form) {
                    $structure = DB::table('form_templates')
                        ->where('id', $form->form_id)
                        ->value('structure');
                    return [
                        'id' => $form->id,
                        'name' => $form->name,
                        'form_id' => $form->form_id,
                        'value' => is_string($form->value) ? json_decode($form->value, true) : $form->value,
                        'structure' => is_string($structure) ? json_decode($structure, true) : $structure,
                    ];
                });
                return [
                    'audit_version' => $meta->audit_version ?? null,
                    'audit_id' => $audit->id,
                    'submitted_by' => $audit->user ? $audit->user->name : (User::find($audit->user_id)->name ?? ''),
                    'submission_date' => $audit->start_time ?? $audit->created_at,
                    'status' => $audit->status->name ?? '',
                    'reviewed_by' => $reviewLog ? optional($reviewLog->user)->name : null,
                    'action_date' => $reviewLog ? $reviewLog->created_at : null,
                    'rejection_reason' => $rejectionReason,
                    'issues_count' => $issuesCount,
                    'issues' => $issuesArr,
                    'forms' => $forms,
                ];
            });
            $latestAudit = $versionAudits->last();
            return [
                'original_audit_id' => $originalAudit->id,
                'compliance_requirement' => $originalAudit->complianceRequirement->title ?? '',
                'outlet_name' => $originalAudit->outlet->name ?? '',
                'initiated_by' => $originalAudit->user ? $originalAudit->user->name : (User::find($originalAudit->user_id)->name ?? ''),
                'initiated_date' => $originalAudit->start_time ?? $originalAudit->created_at,
                'num_versions' => $chain->num_versions,
                'current_status' => $latestAudit->status->name ?? '',
                'last_action_date' => $latestAudit->updated_at ?? $latestAudit->created_at,
                'versions' => $versionDetails,
            ];
        })->filter()->values();

        // Get all audit_ids that are part of any version chain (as audit_id in audit_version)
        $allVersionedAuditIds = DB::table('audit_version')->pluck('audit_id')->all();
        // Exclude all audits that are part of any version chain
        $standaloneAudits = $allAudits->except($allVersionedAuditIds);
        foreach ($standaloneAudits as $audit) {
            $userName = (is_object($audit) && isset($audit->user) && $audit->user) ? $audit->user->name : (is_array($audit) && isset($audit['user']) && $audit['user'] ? $audit['user']->name : (User::find(is_object($audit) ? $audit->user_id : $audit['user_id'])->name ?? ''));
            $outletName = $audit->outlet ? $audit->outlet->name : '';
            $complianceTitle = $audit->complianceRequirement ? $audit->complianceRequirement->title : '';
            $statusName = $audit->status ? $audit->status->name : '';
            // Fetch forms for this standalone audit using the join table
            $auditFormIds = DB::table('audit_audit_form')
                ->where('audit_id', $audit->id)
                ->pluck('audit_form_id');
            $forms = DB::table('audit_form')
                ->whereIn('id', $auditFormIds)
                ->get(['id', 'name', 'value', 'form_id']);
            $forms = $forms->map(function ($form) {
                $structure = DB::table('form_templates')
                    ->where('id', $form->form_id)
                    ->value('structure');
                return [
                    'id' => $form->id,
                    'name' => $form->name,
                    'form_id' => $form->form_id,
                    'value' => is_string($form->value) ? json_decode($form->value, true) : $form->value,
                    'structure' => is_string($structure) ? json_decode($structure, true) : $structure,
                ];
            });
            $auditHistory->push([
                'original_audit_id' => $audit->id,
                'compliance_requirement' => $complianceTitle,
                'outlet_name' => $outletName,
                'initiated_by' => $userName,
                'initiated_date' => $audit->start_time ?? $audit->created_at,
                'num_versions' => 1,
                'current_status' => $statusName,
                'last_action_date' => $audit->updated_at ?? $audit->created_at,
                'versions' => [[
                    'audit_version' => 1,
                    'audit_id' => $audit->id,
                    'submitted_by' => $userName,
                    'submission_date' => $audit->start_time ?? $audit->created_at,
                    'status' => $statusName,
                    'reviewed_by' => null,
                    'action_date' => null,
                    'rejection_reason' => null,
                    'issues_count' => 0,
                    'issues' => [],
                    'forms' => $forms,
                ]],
            ]);
        }

        // After building $auditHistory (before pagination), sort by last_action_date DESC
        $auditHistory = $auditHistory->sortByDesc('last_action_date')->values();

        // PAGINATE THE AUDIT HISTORY
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 5);
        $paginatedAuditHistory = new LengthAwarePaginator(
            $auditHistory->forPage($page, $perPage)->values(),
            $auditHistory->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Debug log before pagination
        \Log::info('AuditHistory count before pagination', [
            'total_audits' => $auditHistory->count(),
            'audit_ids' => $auditHistory->pluck('original_audit_id')->all(),
            'perPage' => $perPage,
            'page' => $page,
        ]);

        return Inertia::render('Admin/Audits/IndexPage', [
            'audits' => $audits,
            'filters' => $request->only(['dateFilter', 'statusFilter', 'per_page', 'search']),
            'summaryData' => $summaryData,
            'states' => Outlet::select('state')
                ->whereNotNull('state')
                ->where('state', '!=', '')
                ->distinct()
                ->orderBy('state')
                ->pluck('state'),
            'complianceCategories' => \App\Models\ComplianceCategory::select('id', 'name')
                ->orderBy('name')
                ->get(),
            'outlets' => Outlet::select('id', 'name')
                ->orderBy('name')
                ->get(),
            'managers' => User::whereIs('manager')
                ->select('id', 'name', 'email', 'role_id')
                ->orderBy('name')
                ->get(),
            'auditHistory' => $paginatedAuditHistory,
            'statuses' => \App\Models\Status::select('id', 'name')->get(),
        ]);
    }

    /**
     * Generate Audit Report
     */
    public function generateReport(Request $request)
    {
        try {
            // Log the request details for debugging
            Log::info('AuditController: Starting report generation', [
                'reportType' => $request->reportType,
                'dateRange' => $request->only(['startDate', 'endDate']),
                'filter' => $request->filter,
                'user' => auth()->user()?->id,
                'session_id' => session()->getId(),
                'csrf_token' => $request->header('X-CSRF-TOKEN') ? 'present' : 'missing'
            ]);

            // Validate required fields
            $request->validate([
                'reportType' => 'required|string',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after_or_equal:startDate',
                'filter' => 'nullable|string'
            ]);

            $startDate = Carbon::parse($request->input('startDate', now()->subDays(30)->format('Y-m-d')))->startOfDay();
            $endDate = Carbon::parse($request->input('endDate', now()->format('Y-m-d')))->endOfDay();
            $reportType = $request->input('reportType');
            $filter = $request->input('filter', 'all');

            // Base query for audits
            $query = Audit::with(['outlet', 'user', 'status', 'complianceRequirement'])
                ->whereBetween('start_time', [$startDate, $endDate]);

            // Apply filters based on report type and filter value
            if ($filter !== 'all') {
                switch ($reportType) {
                    case 'Overall Compliance Trends Report':
                        // Filter by state
                        $query->whereHas('outlet', function ($q) use ($filter) {
                            $q->where('state', 'LIKE', '%' . $filter . '%');
                        });
                        break;
                    case 'Manager Audit Performance Report':
                        // Filter by manager
                        $query->whereHas('user', function ($q) use ($filter) {
                            $q->where('name', 'LIKE', '%' . $filter . '%');
                        });
                        break;
                    case 'Outlet Non-Compliance Summary':
                        // Filter by outlet
                        $query->whereHas('outlet', function ($q) use ($filter) {
                            $q->where('name', 'LIKE', '%' . $filter . '%');
                        });
                        break;
                    case 'Specific Standard Adherence Report':
                        // Filter by category name (not compliance requirement name)
                        $query->whereHas('complianceRequirement.category', function ($q) use ($filter) {
                            $q->where('name', 'LIKE', '%' . $filter . '%');
                        });
                        break;
                }
            }

            $audits = $query->get();

            // Check if there's any data to report
            if ($audits->isEmpty()) {
                return response()->json([
                    'noData' => true,
                    'message' => 'No audit data available for the selected criteria. Please try different filters or date ranges.',
                    'reportType' => $reportType,
                    'dateRange' => [
                        'start' => $startDate,
                        'end' => $endDate
                    ],
                    'filter' => $filter
                ]);
            }

            // Group by date and state
            $grouped = $audits->groupBy(function ($audit) {
                return Carbon::parse($audit->start_time)->format('Y-m-d') . '|' . ($audit->outlet->state ?? 'Unknown');
            });

            $tableRows = [];
            $trendData = [];
            foreach ($grouped as $key => $group) {
                [$date, $state] = explode('|', $key);
                $total = $group->count();
                $compliant = $group->where('status.name', 'approved')->count();
                $nonCompliant = $group->where('status.name', 'draft')->count();
                $partiallyCompliant = $total - $compliant - $nonCompliant;
                $complianceRate = $total > 0 ? round(($compliant / $total) * 100, 1) : 0;
                $status = $complianceRate >= 90 ? 'Excellent' : ($complianceRate >= 70 ? 'Good' : 'Low Compliance');
                $tableRows[] = [
                    'date' => $date,
                    'state' => $state,
                    'totalAudits' => $total,
                    'compliantAudits' => $compliant,
                    'partiallyCompliantAudits' => $partiallyCompliant,
                    'nonCompliantAudits' => $nonCompliant,
                    'complianceRate' => $complianceRate,
                    'status' => $status,
                ];
                $trendData[] = [
                    'date' => $date,
                    'complianceRate' => $complianceRate,
                ];
            }

            // Sort tableRows and trendData by date
            usort($tableRows, fn($a, $b) => strcmp($a['date'], $b['date']));
            usort($trendData, fn($a, $b) => strcmp($a['date'], $b['date']));

            // Calculate summary statistics
            $summary = [
                'totalAudits' => $audits->count(),
                'completedAudits' => $audits->where('status.name', 'completed')->count(),
                'pendingAudits' => $audits->where('status.name', 'pending')->count(),
                'complianceRate' => $audits->count() > 0 ?
                    round(($audits->where('status.name', 'completed')->count() / $audits->count()) * 100, 1) : 0
            ];

            // Group by outlet for Outlet Non-Compliance Summary
            if ($reportType === 'Outlet Non-Compliance Summary') {
                $grouped = $audits->groupBy(function ($audit) {
                    return $audit->outlet->id ?? 'Unknown';
                });
                $tableRows = [];
                foreach ($grouped as $outletId => $group) {
                    $outletName = $group->first()->outlet->name ?? 'Unknown';
                    $total = $group->count();
                    $nonCompliant = $group->where('status.name', 'draft')->count();
                    $complianceRate = $total > 0 ? round((($total - $nonCompliant) / $total) * 100, 1) : 0;
                    $status = $complianceRate >= 90 ? 'Excellent' : ($complianceRate >= 70 ? 'Good' : 'Needs Improvement');
                    $tableRows[] = [
                        'outletName' => $outletName,
                        'totalAudits' => $total,
                        'nonCompliantAudits' => $nonCompliant,
                        'complianceRate' => $complianceRate,
                        'status' => $status,
                    ];
                }
                // Sort by compliance rate ascending (most non-compliant first)
                usort($tableRows, fn($a, $b) => $a['complianceRate'] <=> $b['complianceRate']);
            }

            // Group by category for Specific Standard Adherence Report
            if ($reportType === 'Specific Standard Adherence Report') {
                $grouped = $audits->groupBy(function ($audit) {
                    return $audit->complianceRequirement->category->id ?? 'Unknown';
                });
                $tableRows = [];
                $trendData = [];
                $totalAudits = 0;
                $totalAdhered = 0;
                foreach ($grouped as $categoryId => $group) {
                    $categoryName = $group->first()->complianceRequirement->category->name ?? 'Unknown';
                    $total = $group->count();
                    $adhered = $group->where('status.name', 'approved')->count();
                    $adherenceRate = $total > 0 ? round(($adhered / $total) * 100, 1) : 0;
                    $status = $adherenceRate >= 90 ? 'Excellent' : ($adherenceRate >= 70 ? 'Good' : 'Needs Improvement');
                    $tableRows[] = [
                        'categoryName' => $categoryName,
                        'totalAudits' => $total,
                        'adheredAudits' => $adhered,
                        'adherenceRate' => $adherenceRate,
                        'status' => $status,
                    ];
                    $trendData[] = [
                        'categoryName' => $categoryName,
                        'adherenceRate' => $adherenceRate,
                    ];
                    $totalAudits += $total;
                    $totalAdhered += $adhered;
                }
                usort($tableRows, fn($a, $b) => $a['adherenceRate'] <=> $b['adherenceRate']);
                $summary = [
                    'totalAudits' => $totalAudits,
                    'adheredAudits' => $totalAdhered,
                    'averageAdherenceRate' => count($tableRows) > 0 ? round(array_sum(array_column($tableRows, 'adherenceRate')) / count($tableRows), 1) : 0,
                ];
                $formattedData = [
                    'reportType' => $reportType,
                    'dateRange' => [
                        'start' => $startDate,
                        'end' => $endDate
                    ],
                    'filter' => $filter,
                    'summary' => $summary,
                    'tableRows' => $tableRows,
                    'trendData' => $trendData,
                ];
                return response()->json($formattedData);
            }

            // Format data for frontend
            $formattedData = [
                'reportType' => $reportType,
                'dateRange' => [
                    'start' => $startDate,
                    'end' => $endDate
                ],
                'filter' => $filter,
                'summary' => $summary,
                'tableRows' => $tableRows,
                'trendData' => $trendData,
            ];

            return response()->json($formattedData);
        } catch (\Exception $e) {
            Log::error('Audit Report Generation Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to generate audit report. Please try again.'
            ], 500);
        }
    }

    /**
     * Calculate due date based on frequency
     */
    private function calculateDueDate($startDate, $frequency)
    {
        if (!$startDate) {
            return now()->endOfMonth();
        }

        $startDate = \Carbon\Carbon::parse($startDate);

        return match ($frequency) {
            'Daily' => $startDate->copy()->endOfDay(),
            'Weekly' => $startDate->copy()->endOfWeek(),
            'Monthly' => $startDate->copy()->endOfMonth(),
            'Quarterly' => $startDate->copy()->addMonths(3)->endOfMonth(),
            'Bi-annually' => $startDate->copy()->addMonths(6)->endOfMonth(),
            'Annually' => $startDate->copy()->endOfYear(),
            default => $startDate->copy()->endOfMonth(),
        };
    }

    /**
     * Get audit data for the admin dashboard
     */
    public function getAuditData()
    {
        $query = Audit::with([
            'outlet',
            'user',
            'status',
            'complianceRequirement',
            'auditForms.formTemplate',
            'auditForms.status',
        ])->orderBy('start_time', 'desc');

        $audits = $query->get();

        // Transform the audits to include the compliance requirement title
        $audits->transform(function ($audit) {
            $audit->title = $audit->complianceRequirement ? $audit->complianceRequirement->title : 'Unnamed Audit';
            if ($audit->complianceRequirement && $audit->complianceRequirement->frequency) {
                $audit->due_date = $this->calculateDueDate($audit->start_time, $audit->complianceRequirement->frequency);
            }
            return $audit;
        });

        return response()->json([
            'audits' => $audits
        ]);
    }

    /**
     * Get forms for a specific audit
     */
    public function getAuditForms($auditId)
    {
        $audit = Audit::with(['auditForms.formTemplate', 'auditForms.status'])
            ->findOrFail($auditId);

        $forms = $audit->auditForms->map(function ($form) {
            return [
                'id' => $form->id,
                'formName' => $form->name,
                'templateName' => $form->formTemplate->name,
                'templateId' => $form->formTemplate->id,
                'status_id' => $form->status_id,
                'status' => $form->status->name,
                'createdAt' => $form->created_at,
                'updatedAt' => $form->updated_at
            ];
        });

        return response()->json([
            'auditId' => $auditId,
            'forms' => $forms
        ]);
    }

    /**
     * Get details for a specific audit
     */
    public function getAuditDetails($auditId)
    {
        $audit = Audit::with([
            'outlet',
            'user',
            'status',
            'complianceRequirement',
            'auditForms.formTemplate',
            'auditForms.status',
        ])->findOrFail($auditId);

        // Add version info
        $versionInfo = \DB::table('audit_version')->where('audit_id', $audit->id)->first();
        if ($versionInfo) {
            $versionNumber = $versionInfo->audit_version;
            $isVersioned = true;
        } else {
            $versionNumber = 1;
            $isVersioned = false;
        }

        return response()->json([
            'audit' => [
                'id' => $audit->id,
                'name' => $audit->complianceRequirement ? $audit->complianceRequirement->title : 'Unnamed Audit',
                'outletName' => $audit->outlet ? $audit->outlet->name : 'Unknown Outlet',
                'status' => $audit->status ? $audit->status->name : 'Unknown',
                'startDate' => $audit->start_time,
                'dueDate' => $this->calculateDueDate($audit->start_time, $audit->complianceRequirement?->frequency),
                'progress' => $audit->progress,
                'formCount' => $audit->auditForms->count(),
                'submittedBy' => $audit->user ? $audit->user->name : 'Unknown User',
                'versionNumber' => $versionNumber,
                'isVersioned' => $isVersioned,
                'forms' => $audit->auditForms->map(function ($form) {
                    return [
                        'id' => $form->id,
                        'name' => $form->formTemplate ? $form->formTemplate->name : 'Unnamed Form',
                        'templateName' => $form->formTemplate ? $form->formTemplate->name : 'Unknown Template',
                        'status' => $form->status ? $form->status->name : 'Unknown'
                    ];
                })
            ]
        ]);
    }

    /**
     * Get details for a specific audit form
     */
    public function getAuditFormDetails($formId)
    {
        // Fetch form details with joins, like the manager version
        $form = DB::table('audit_form')
            ->leftJoin('form_templates', 'audit_form.form_id', '=', 'form_templates.id')
            ->leftJoin('status', 'audit_form.status_id', '=', 'status.id')
            ->leftJoin('audit_audit_form', 'audit_form.id', '=', 'audit_audit_form.audit_form_id')
            ->leftJoin('audit', 'audit_audit_form.audit_id', '=', 'audit.id')
            ->leftJoin('outlets', 'audit.outlet_id', '=', 'outlets.id')
            ->leftJoin('users', 'audit.user_id', '=', 'users.id')
            ->leftJoin('compliance_requirements', 'audit.compliance_id', '=', 'compliance_requirements.id')
            ->where('audit_form.id', $formId)
            ->select(
                'audit_form.id',
                'audit_form.name as formName',
                'form_templates.name as templateName',
                'audit_form.value as formValues',
                'form_templates.structure as formStructure',
                'audit_form.status_id',
                'status.name as status',
                'outlets.name as outletName',
                'audit.id as auditId',
                'users.name as submittedBy',
                'compliance_requirements.title as requirement',
                'audit_form.created_at as createdAt',
                'audit_form.updated_at as updatedAt'
            )
            ->first();

        if (!$form) {
            return response()->json(['error' => 'Form not found'], 404);
        }

        // Decode JSON fields safely
        $formValues = $form->formValues ? json_decode($form->formValues, true) : null;
        $formStructure = $form->formStructure ? json_decode($form->formStructure, true) : null;

        return response()->json([
            'id' => $form->id,
            'name' => $form->formName ?? 'Unnamed Form',
            'status' => $form->status ?? 'Unknown',
            'content' => $formValues,
            'structure' => $formStructure,
            'submitted_at' => $form->createdAt,
            'updated_at' => $form->updatedAt,
            'audit' => [
                'id' => $form->auditId,
                'outlet' => $form->outletName ?? 'Unknown Outlet',
                'submittedBy' => $form->submittedBy ?? 'Unknown User',
                'requirement' => $form->requirement ?? 'Unknown Requirement'
            ]
        ]);
    }
}

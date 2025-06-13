<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Audit;

class AuditController extends Controller
{
    /**
     * Display a listing of the audits.
     */
    public function index(Request $request)
    {
        $query = Audit::with(['user', 'outlet', 'status']);
        $perPage = $request->input('perPage', 5); // Default to 5 if not provided

        // Calculate summary data across all audits (using optimized database queries)
        $summaryData = [
            'totalActive' => Audit::whereHas('status', function ($q) {
                $q->where('name', 'In Progress');
            })->count(),
            'pendingReview' => Audit::whereHas('status', function ($q) {
                $q->where('name', 'Pending Review');
            })->count(),
            'overdueTasks' => Audit::where(function ($q) {
                $q->where('end_time', '<', now());
                $q->whereDoesntHave('status', function ($sq) {
                    $sq->where('name', 'Completed');
                });
            })->count(),
        ];

        // Apply date range filter
        if ($request->has('dateFilter') && $request->dateFilter !== 'all') {
            $today = now();
            switch ($request->dateFilter) {
                case 'last7':
                    $query->where('start_time', '>=', $today->subDays(7));
                    break;
                case 'last30':
                    $query->where('start_time', '>=', $today->subDays(30));
                    break;
                case 'last90':
                    $query->where('start_time', '>=', $today->subDays(90));
                    break;
                case 'thisYear':
                    $query->whereYear('start_time', $today->year);
                    break;
            }
        }

        // Apply status filter
        if ($request->has('statusFilter') && $request->statusFilter !== 'all') {
            $query->whereHas('status', function ($q) use ($request) {
                $q->where('name', $request->statusFilter);
            });
        }
        
        $audits = $query->orderBy('start_time', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Audits/IndexPage', [
            'audits' => $audits,
            'filters' => $request->only(['dateFilter', 'statusFilter', 'perPage']),
            'summaryData' => $summaryData,
        ]);
    }
} 
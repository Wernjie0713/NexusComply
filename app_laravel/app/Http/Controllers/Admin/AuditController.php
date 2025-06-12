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

        // Apply date range filter
        if ($request->has('dateFilter')) {
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
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Audits/IndexPage', [
            'audits' => $audits,
            'filters' => $request->only(['dateFilter', 'statusFilter'])
        ]);
    }
} 
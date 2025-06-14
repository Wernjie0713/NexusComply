<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class MobileAuditController extends Controller
{
    /**
     * Create a new audit.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'compliance_id' => 'required|exists:compliance_requirements,id',
            'outlet_id' => 'required|exists:outlets,id',
        ]);

        try {
            $audit = Audit::create([
                'compliance_id' => $request->compliance_id,
                'outlet_id' => $request->outlet_id,
                'user_id' => Auth::id(),
                'status_id' => 1, // Initial status (e.g., "In Progress")
                'start_time' => Carbon::now(),
                'progress' => 0,
            ]);

            return response()->json([
                'message' => 'Audit created successfully',
                'audit' => $audit
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create audit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get audits for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserAudits(Request $request)
    {
        try {
            $audits = Audit::with(['status', 'complianceRequirement'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($audit) {
                    return [
                        'id' => $audit->id,
                        'title' => $audit->complianceRequirement->title,
                        'dueDate' => 'June 20, 2025', // Placeholder date as requested
                        'status' => $audit->status->name,
                        'isDraft' => $audit->status->name === 'In Progress',
                        'type' => 'active'
                    ];
                });

            return response()->json($audits);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch audits',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
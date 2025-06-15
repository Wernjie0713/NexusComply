<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\Outlet;

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
            $audits = Audit::with(['status', 'complianceRequirement', 'outlet'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($audit) {
                    try {
                        $outletData = $audit->outlet ? [
                            'outlet_id' => $audit->outlet->id,
                            'outlet_name' => $audit->outlet->name
                        ] : [
                            'outlet_id' => null,
                            'outlet_name' => 'Unknown Outlet'
                        ];

                        // Calculate due date based on frequency using start_time
                        $dueDate = $this->calculateDueDate($audit->start_time, $audit->complianceRequirement->frequency);

                        return array_merge([
                            'id' => $audit->id,
                            'title' => $audit->complianceRequirement->title,
                            'dueDate' => $dueDate->format('Y-m-d'),
                            'status' => $audit->status->name,
                            'isDraft' => $audit->status->name === 'In Progress',
                            'type' => 'active'
                        ], $outletData);
                    } catch (\Exception $e) {
                        \Log::error('Error processing audit ' . $audit->id . ': ' . $e->getMessage());
                        return [
                            'id' => $audit->id,
                            'title' => $audit->complianceRequirement->title ?? 'Unknown Title',
                            'dueDate' => now()->format('Y-m-d'),
                            'status' => $audit->status->name ?? 'Unknown Status',
                            'isDraft' => false,
                            'type' => 'active',
                            'outlet_id' => null,
                            'outlet_name' => 'Error Loading Outlet'
                        ];
                    }
                });

            return response()->json($audits);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch audits: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch audits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate the due date based on frequency and start date
     *
     * @param \Carbon\Carbon $startDate
     * @param string|null $frequency
     * @return \Carbon\Carbon
     */
    private function calculateDueDate($startDate, $frequency = null)
    {
        if (!$startDate) {
            return now()->endOfMonth();
        }

        $startDate = Carbon::parse($startDate);
        
        return match($frequency) {
            'Daily' => $startDate->copy()->endOfDay(),
            'Weekly' => $startDate->copy()->endOfWeek(),
            'Monthly' => $startDate->copy()->endOfMonth(), // This will return the last day of the start_time's month
            'Quarterly' => $startDate->copy()->addMonths(3)->endOfMonth(),
            'Bi-annually' => $startDate->copy()->addMonths(6)->endOfMonth(),
            'Annually' => $startDate->copy()->endOfYear(),
            default => $startDate->copy()->endOfMonth(), // Default to end of current month if frequency is not set
        };
    }

    /**
     * Get outlet information.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOutlet($id)
    {
        try {
            $outlet = Outlet::findOrFail($id);
            
            return response()->json([
                'id' => $outlet->id,
                'name' => $outlet->name,
                'address' => $outlet->address,
                'city' => $outlet->city,
                'state' => $outlet->state,
                'postal_code' => $outlet->postal_code,
                'phone_number' => $outlet->phone_number
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch outlet information',
                'error' => $e->getMessage()
            ], 404);
        }
    }
} 
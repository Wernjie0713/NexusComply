<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Fetch all activity logs with user, sorted by created_at desc, id desc
            $activities = ActivityLog::with('user')
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'action_type' => $activity->action_type,
                        'target_type' => $activity->target_type,
                        'details' => $activity->details,
                        'created_at' => $activity->created_at ? $activity->created_at->format('Y-m-d H:i:s') : null,
                        'user' => $activity->user ? [
                            'name' => $activity->user->name,
                            'email' => $activity->user->email
                        ] : null
                    ];
                });

            // Get unique action types and target types for filters
            $actionTypes = ActivityLog::distinct()->pluck('action_type')->sort()->values()->toArray();
            $targetTypes = ActivityLog::distinct()->pluck('target_type')->sort()->values()->toArray();

            return Inertia::render('Admin/ActivityLog/IndexPage', [
                'activities' => $activities,
                'filters' => [
                    'action_types' => $actionTypes,
                    'target_types' => $targetTypes,
                    'current' => []
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Activity Log Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Admin/ActivityLog/IndexPage', [
                'activities' => [],
                'filters' => [
                    'action_types' => [],
                    'target_types' => [],
                    'current' => []
                ]
            ]);
        }
    }

    public function export(Request $request)
    {
        try {
            $query = ActivityLog::with('user')
                ->orderByDesc('created_at')
                ->orderByDesc('id');

            // Apply filters if provided
            if ($request->has('action_type') && $request->action_type) {
                $query->where('action_type', $request->action_type);
            }
            if ($request->has('target_type') && $request->target_type) {
                $query->where('target_type', $request->target_type);
            }
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', Carbon::parse($request->date_from));
            }
            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', Carbon::parse($request->date_to));
            }

            // Limit to last 1000 records for better performance
            $activities = $query->limit(1000)->get();

            $fileName = 'activity_logs_' . Carbon::now()->format('Y-m-d_H-i-s');

            if ($request->format === 'csv' || $request->format === 'excel') {
                // Use native CSV export for Excel/CSV format
                $headers = [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => "attachment; filename=\"$fileName.csv\"",
                ];
                $callback = function () use ($activities) {
                    $handle = fopen('php://output', 'w');
                    fputcsv($handle, ['No.', 'Date/Time', 'Action Type', 'Target Type', 'Details', 'User']);
                    foreach ($activities as $index => $activity) {
                        fputcsv($handle, [
                            $index + 1,
                            Carbon::parse($activity->created_at)->format('Y-m-d H:i:s'),
                            ucfirst($activity->action_type),
                            ucfirst($activity->target_type),
                            $activity->details,
                            $activity->user ? $activity->user->name . ' (' . $activity->user->email . ')' : 'System'
                        ]);
                    }
                    fclose($handle);
                };
                return response()->stream($callback, 200, $headers);
            } else {
                // For PDF format, return the data to be processed by the frontend
                $formattedData = $activities->map(function ($activity) {
                    return [
                        'created_at' => Carbon::parse($activity->created_at)->format('Y-m-d H:i:s'),
                        'action_type' => ucfirst($activity->action_type),
                        'target_type' => ucfirst($activity->target_type),
                        'details' => $activity->details,
                        'user' => $activity->user ? [
                            'name' => $activity->user->name,
                            'email' => $activity->user->email
                        ] : null
                    ];
                });

                return response()->json([
                    'data' => $formattedData,
                    'dateRange' => [
                        'start' => $activities->isNotEmpty() ? $activities->last()->created_at->format('Y-m-d') : Carbon::now()->subDays(30)->format('Y-m-d'),
                        'end' => $activities->isNotEmpty() ? $activities->first()->created_at->format('Y-m-d') : Carbon::now()->format('Y-m-d')
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Activity Log Export Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to export activity logs. Please try again.');
        }
    }

    /**
     * Generate Activity Log Report
     */
    public function generateActivityLogReport(Request $request)
    {
        try {
            // Get date range from request
            $startDate = $request->input('start_date', now()->subDays(30)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));

            // Get activity log data
            $data = ActivityLog::whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            // Generate PDF using Snappy
            $pdf = \PDF::loadView('reports.admin.activity-log', [
                'data' => $data,
                'dateRange' => [
                    'start' => Carbon::parse($startDate),
                    'end' => Carbon::parse($endDate)
                ]
            ]);

            // Set PDF options
            $pdf->setOption('page-size', 'A4');
            $pdf->setOption('orientation', 'portrait');
            $pdf->setOption('margin-top', 10);
            $pdf->setOption('margin-right', 10);
            $pdf->setOption('margin-bottom', 15);
            $pdf->setOption('margin-left', 10);
            $pdf->setOption('encoding', 'UTF-8');
            $pdf->setOption('dpi', 300);
            $pdf->setOption('enable-local-file-access', true);
            $pdf->setOption('enable-javascript', true);
            $pdf->setOption('javascript-delay', 1000);
            $pdf->setOption('no-stop-slow-scripts', true);
            $pdf->setOption('enable-smart-shrinking', true);
            $pdf->setOption('print-media-type', true);
            $pdf->setOption('footer-font-size', 8);
            $pdf->setOption('footer-spacing', 5);

            return $pdf->download('activity-log-report.pdf');
        } catch (\Exception $e) {
            \Log::error('Activity Log Report Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to generate activity log report. Please try again.');
        }
    }

    public function exportCsv(Request $request)
    {
        $fileName = 'activity_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $activities = \App\Models\ActivityLog::with('user')->latest('created_at')->get();
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ];
        $callback = function () use ($activities) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No.', 'Date/Time', 'Action Type', 'Target Type', 'Details', 'User']);
            foreach ($activities as $index => $activity) {
                fputcsv($handle, [
                    $index + 1,
                    optional($activity->created_at)->format('Y-m-d H:i:s'),
                    ucfirst($activity->action_type),
                    ucfirst($activity->target_type),
                    $activity->details,
                    $activity->user ? $activity->user->name . ' (' . $activity->user->email . ')' : 'System'
                ]);
            }
            fclose($handle);
        };
        return response()->stream($callback, 200, $headers);
    }
}

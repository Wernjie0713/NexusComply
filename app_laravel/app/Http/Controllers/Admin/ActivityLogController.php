<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Barryvdh\Snappy\Facades\SnappyPdf as PDF;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('ActivityLogController: Starting index method');
            
            $query = ActivityLog::with('user')
                ->latest('created_at');

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

            Log::info('ActivityLogController: Query built', ['sql' => $query->toSql()]);

            $activities = $query->paginate($request->input('per_page', 5))
                ->withQueryString()
                ->through(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'action_type' => $activity->action_type,
                        'target_type' => $activity->target_type,
                        'details' => $activity->details,
                        'created_at' => Carbon::parse($activity->created_at)->format('Y-m-d H:i:s'),
                        'time_ago' => Carbon::parse($activity->created_at)->diffForHumans(),
                        'user' => $activity->user ? [
                            'name' => $activity->user->name,
                            'email' => $activity->user->email
                        ] : null
                    ];
                });

            // Convert to array and fix null URLs in pagination
            $activitiesArray = $activities->toArray();
            $activitiesArray['links'] = array_map(function ($link) {
                $link['url'] = $link['url'] ?? '';
                return $link;
            }, $activitiesArray['links']);

            // Get unique action types and target types for filters
            $actionTypes = ActivityLog::distinct()->pluck('action_type')->sort()->values()->toArray();
            $targetTypes = ActivityLog::distinct()->pluck('target_type')->sort()->values()->toArray();

            Log::info('ActivityLogController: Filter types retrieved', [
                'action_types_count' => count($actionTypes),
                'target_types_count' => count($targetTypes)
            ]);

            $data = [
                'activities' => $activitiesArray,
                'filters' => [
                    'action_types' => $actionTypes,
                    'target_types' => $targetTypes,
                    'current' => $request->only(['action_type', 'target_type', 'date_from', 'date_to', 'per_page'])
                ]
            ];


            return Inertia::render('Admin/ActivityLog/IndexPage', $data);
        } catch (\Exception $e) {
            Log::error('Activity Log Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('Admin/ActivityLog/IndexPage', [
                'activities' => [
                    'data' => [],
                    'links' => []
                ],
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
            Log::info('ActivityLogController: Starting export method', [
                'format' => $request->format,
                'filters' => $request->only(['action_type', 'target_type', 'date_from', 'date_to'])
            ]);
            
            $query = ActivityLog::with('user')
                ->latest('created_at');

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
                $callback = function() use ($activities) {
                    $handle = fopen('php://output', 'w');
                    fputcsv($handle, ['No.', 'Date/Time', 'Action Type', 'Target Type', 'Details', 'User']);
                    foreach ($activities as $index => $activity) {
                        fputcsv($handle, [
                            $index + 1,
                            Carbon::parse($activity->created_at)->format('m/d/Y H:i:s'),
                            ucfirst($activity->action_type),
                            ucfirst($activity->target_type),
                            $activity->details,
                            $activity->user ? $activity->user->name . ' (' . $activity->user->email . ')' : 'System'
                        ]);
                    }
                    fclose($handle);
                };
                return response()->stream($callback, 200, $headers);
            } else { // PDF
                $exportData = $activities->map(function ($activity, $index) {
                    return [
                        'No.' => $index + 1,
                        'Date/Time' => Carbon::parse($activity->created_at)->format('m/d/Y H:i:s'),
                        'Action Type' => ucfirst($activity->action_type),
                        'Target Type' => ucfirst($activity->target_type),
                        'Details' => $activity->details,
                        'User' => $activity->user ? $activity->user->name . ' (' . $activity->user->email . ')' : 'System'
                    ];
                });
                $pdf = \PDF::loadView('exports.activity_logs', [
                    'data' => $exportData,
                    'title' => 'Activity Logs Export',
                    'date' => Carbon::now()->format('Y-m-d H:i:s')
                ]);
                $pdf->setOption('page-size', 'A4');
                $pdf->setOption('orientation', 'landscape');
                $pdf->setOption('page-width', '297mm');
                $pdf->setOption('page-height', '210mm');
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
                $pdf->setOption('footer-left', 'Generated on: ' . Carbon::now()->format('Y-m-d H:i:s'));
                $pdf->setOption('footer-right', '[page] of [topage]');
                $pdf->setOption('footer-font-size', 8);
                $pdf->setOption('footer-spacing', 5);
                return $pdf->download($fileName . '.pdf');
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
        $callback = function() use ($activities) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No.', 'Date/Time', 'Action Type', 'Target Type', 'Details', 'User']);
            foreach ($activities as $index => $activity) {
                fputcsv($handle, [
                    $index + 1,
                    optional($activity->created_at)->format('m/d/Y H:i:s'),
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
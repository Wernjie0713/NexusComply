<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

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

            $activities = $query->paginate($request->input('per_page', 10))
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

            Log::info('ActivityLogController: Activities retrieved', ['count' => count($activitiesArray['data'])]);

            // Get unique action types and target types for filters
            $actionTypes = ActivityLog::distinct()->pluck('action_type')->toArray();
            $targetTypes = ActivityLog::distinct()->pluck('target_type')->toArray();

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

            Log::info('ActivityLogController: Rendering view with data', ['data_structure' => array_keys($data)]);

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
            
            // Format data for export
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
            
            $fileName = 'activity_logs_' . Carbon::now()->format('Y-m-d_H-i-s');
            
            if ($request->format === 'csv') {
                return $this->exportToCsv($exportData, $fileName);
            } else {
                return $this->exportToPdf($exportData, $fileName);
            }
            
        } catch (\Exception $e) {
            Log::error('Activity Log Export Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Failed to export activity logs. Please try again.');
        }
    }
    
    private function exportToCsv($data, $fileName)
    {
        // Create CSV file
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '.csv"',
        ];
        
        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Add headers
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
            }
            
            // Add rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    private function exportToPdf($data, $fileName)
    {
        // Configure PDF options for better performance
        $pdf = Pdf::setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => false,
            'isPhpEnabled' => false,
            'isFontSubsettingEnabled' => true,
            'defaultFont' => 'DejaVu Sans'
        ])->loadView('exports.activity_logs', [
            'data' => $data,
            'title' => 'Activity Logs Export',
            'date' => Carbon::now()->format('Y-m-d H:i:s')
        ]);
        
        return $pdf->download($fileName . '.pdf');
    }
}
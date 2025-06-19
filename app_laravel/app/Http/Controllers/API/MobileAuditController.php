<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\Outlet;
use App\Models\AuditForm;
use App\Services\SupabaseStorageService;
use Illuminate\Support\Facades\DB;

class MobileAuditController extends Controller
{
    private $storageService;

    public function __construct(SupabaseStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

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
            $audits = Audit::with(['status', 'complianceRequirement', 'outlet.manager'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($audit) {
                    try {
                        $outletData = $audit->outlet ? [
                            'outlet_id' => $audit->outlet->id,
                            'outlet_name' => $audit->outlet->name,
                            'manager_name' => $audit->outlet->manager ? $audit->outlet->manager->name : 'No Manager Assigned'
                        ] : [
                            'outlet_id' => null,
                            'outlet_name' => 'Unknown Outlet',
                            'manager_name' => 'No Manager Assigned'
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
                            'outlet_name' => 'Error Loading Outlet',
                            'manager_name' => 'Error Loading Manager'
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

    /**
     * Submit a form for an audit.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitForm(Request $request)
    {
        // Add debug logging
        \Log::info('Form submission received:', [
            'audit_id' => $request->audit_id,
            'form_id' => $request->form_id,
            'name' => $request->name,
            'value' => $request->value
        ]);

        $request->validate([
            'audit_id' => 'required|exists:audit,id',
            'form_id' => 'required|exists:form_templates,id',
            'name' => 'required|string',
            'value' => 'required|array'
        ]);

        try {
            // Check if an audit form already exists for this audit and form
            $existingForm = AuditForm::where('audit_id', $request->audit_id)
                ->where('form_id', $request->form_id)
                ->first();

            if ($existingForm) {
                // Update existing form
                $existingForm->update([
                    'name' => $request->name,
                    'value' => $request->value,
                    'status_id' => 1 // Default status (e.g., "In Progress")
                ]);
                
                $auditForm = $existingForm;
                $message = 'Form updated successfully';
            } else {
                // Create new form
                $auditForm = AuditForm::create([
                    'audit_id' => $request->audit_id, // Keep this for backward compatibility
                    'form_id' => $request->form_id,
                    'name' => $request->name,
                    'value' => $request->value,
                    'status_id' => 1 // Default status (e.g., "In Progress")
                ]);

                // Create the many-to-many relationship record
                DB::table('audit_audit_form')->insert([
                    'audit_id' => $request->audit_id,
                    'audit_form_id' => $auditForm->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $message = 'Form submitted successfully';
            }

            // Update audit progress
            $this->updateAuditProgress($request->audit_id);

            return response()->json([
                'message' => $message,
                'audit_form' => $auditForm
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to submit form: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to submit form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the progress of an audit based on completed forms.
     *
     * @param int $auditId
     * @return void
     */
    private function updateAuditProgress($auditId)
    {
        try {
            $audit = Audit::with('complianceRequirement.formTemplates')->findOrFail($auditId);
            $totalForms = $audit->complianceRequirement->formTemplates->count();
            
            if ($totalForms > 0) {
                $completedForms = AuditForm::where('audit_id', $auditId)->count();
                $progress = ($completedForms / $totalForms) * 100;
                
                $audit->update([
                    'progress' => $progress
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to update audit progress: ' . $e->getMessage());
        }
    }

    public function uploadFile(Request $request)
    {
        try {
            \Log::info('File upload request received', [
                'fileName' => $request->fileName,
                'fieldId' => $request->fieldId,
                'hasFile' => !empty($request->file),
                'fileSize' => strlen($request->file ?? ''),
                'requestData' => $request->all()
            ]);

            $request->validate([
                'file' => 'required',
                'fileName' => 'required|string',
                'fieldId' => 'required|string'
            ]);

            // Check if the file data is valid base64
            if (!preg_match('/^[a-zA-Z0-9\/\r\n+]*={0,2}$/', $request->file)) {
                \Log::error('Invalid base64 data received');
                throw new \Exception('Invalid file data');
            }

            // Decode base64 file
            $fileData = base64_decode($request->file, true);
            if ($fileData === false) {
                \Log::error('Failed to decode base64 data');
                throw new \Exception('Failed to decode file data');
            }

            \Log::info('File decoded successfully', [
                'decodedSize' => strlen($fileData)
            ]);

            // Upload to Supabase storage
            try {
                $result = $this->storageService->uploadFile($fileData, $request->fileName);
                \Log::info('Supabase upload response', [
                    'result' => $result
                ]);
            } catch (\Exception $e) {
                \Log::error('Supabase upload error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

            \Log::info('File uploaded successfully', [
                'path' => $result['path'],
                'url' => $result['url']
            ]);

            return response()->json([
                'path' => $result['path'],
                'url' => $result['url'],
                'message' => 'File uploaded successfully'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('File upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to upload file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function serveFile($filename)
    {
        try {
            $file = $this->storageService->getFile($filename);

            return response($file['contents'])
                ->header('Content-Type', $file['mime_type'])
                ->header('Content-Disposition', 'inline; filename="' . $filename . '"')
                ->header('Cache-Control', 'public, max-age=300');
        } catch (\Exception $e) {
            \Log::error('Error serving file', [
                'error' => $e->getMessage(),
                'filename' => $filename
            ]);
            return response()->json(['error' => 'Error serving file'], 500);
        }
    }

    /**
     * Delete an audit.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $audit = Audit::findOrFail($id);
            
            // Only allow deletion of drafts (Draft status)
            if ($audit->status->name !== 'draft') {
                return response()->json([
                    'message' => 'Only draft audits can be deleted',
                ], 403);
            }

            // Delete associated audit forms first
            $audit->auditForms()->delete();
            
            // Delete the audit
            $audit->delete();

            return response()->json([
                'message' => 'Audit deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to delete audit: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete audit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit an audit for review.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function submit($id)
    {
        try {
            $audit = Audit::findOrFail($id);
            
            // Check if all forms are completed
            $totalForms = $audit->complianceRequirement->formTemplates->count();
            $completedForms = AuditForm::where('audit_id', $id)->count();
            
            if ($completedForms < $totalForms) {
                return response()->json([
                    'message' => 'All forms must be completed before submitting the audit',
                ], 400);
            }

            // Update audit status to submitted (id: 6)
            $audit->update([
                'status_id' => 6, // submitted status
                'end_time' => now()
            ]);

            return response()->json([
                'message' => 'Audit submitted successfully',
                'success' => true
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to submit audit: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to submit audit',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
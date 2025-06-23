<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\AuditForm;
use App\Models\Issue;
use App\Models\Status;
use Illuminate\Support\Facades\Http;

class AuditController extends Controller
{
    public function getManagerAudits(Request $request)
    {
        try {
            // Get the logged-in user ID and their role_id
            $userId = Auth::id();
            Log::info('Manager Audits - User ID: ' . $userId);
            
            // Get the user's role_id from users table
            $userRole = DB::table('users')
                ->where('id', $userId)
                ->value('role_id');
            
            Log::info('User Role ID: ' . $userRole);
            
            // Find outlets where this user's role matches manager_role_id
            $managedOutletIds = DB::table('outlets')
                ->where('manager_role_id', $userRole)
                ->pluck('id');
            
            Log::info('Managed outlet IDs: ' . json_encode($managedOutletIds));
            
            // If no outlets found, return empty array
            if ($managedOutletIds->isEmpty()) {
                Log::info('No managed outlets found for user role ' . $userRole);
                return response()->json(['audits' => []]);
            }
            
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
                
            Log::info('Latest audit version IDs: ' . json_encode($latestAuditIds));
            
            // Find all audit IDs that are in the audit_version table (any version)
            $versionedAuditIds = DB::table('audit_version')
                ->pluck('audit_id');
                
            Log::info('All versioned audit IDs: ' . json_encode($versionedAuditIds));
            
            // Get audits for these outlets - must either be latest version OR not versioned at all
            $audits = DB::table('audit')
                ->join('outlets', 'audit.outlet_id', '=', 'outlets.id')
                ->join('status', 'audit.status_id', '=', 'status.id')
                ->leftJoin('compliance_requirements', 'audit.compliance_id', '=', 'compliance_requirements.id')
                ->whereIn('audit.outlet_id', $managedOutletIds)
                ->where(function($query) use ($latestAuditIds, $versionedAuditIds) {
                    $query->whereIn('audit.id', $latestAuditIds)
                        ->orWhereNotIn('audit.id', $versionedAuditIds);
                })
                ->select(
                    'audit.id',
                    'outlets.name as outletName',
                    'compliance_requirements.title as auditType',
                    'audit.progress',
                    'status.name as status',
                    'audit.due_date as dueDate',
                    'audit.start_time as startDate',
                    'audit.created_at',
                )
                ->orderBy('audit.start_time')
                ->get();
            
            Log::info('Audits found after version filtering: ' . count($audits));
            
            // After fetching the audits, add form counts manually
            foreach ($audits as $audit) {
                // Count forms for this audit USING THE JUNCTION TABLE
                $formCount = DB::table('audit_form')
                    ->join('audit_audit_form', 'audit_form.id', '=', 'audit_audit_form.audit_form_id')
                    ->where('audit_audit_form.audit_id', $audit->id)
                    ->count();
                
                // Add the property manually
                $audit->formCount = $formCount;
                
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
                }
            }
            
            return response()->json([
                'audits' => $audits,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getManagerAudits: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get forms associated with a specific audit
     *
     * @param int $auditId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuditForms($auditId)
    {
        try {
            Log::info('Fetching forms for audit ID: ' . $auditId);
            
            // Verify audit exists and user has permission to access it
            $userId = Auth::id();
            $userRole = DB::table('users')
                ->where('id', $userId)
                ->value('role_id');
                
            $audit = DB::table('audit')
                ->join('outlets', 'audit.outlet_id', '=', 'outlets.id')
                ->where('audit.id', $auditId)
                ->where('outlets.manager_role_id', $userRole)
                ->first();
                
            if (!$audit) {
                Log::warning('User attempted to access unauthorized audit or audit not found. User ID: ' . $userId . ', Audit ID: ' . $auditId);
                return response()->json(['error' => 'Audit not found or unauthorized'], 404);
            }
            
            // Get forms associated with this audit - USING JUNCTION TABLE
            $forms = DB::table('audit_form')
                ->join('audit_audit_form', 'audit_form.id', '=', 'audit_audit_form.audit_form_id')
                ->join('form_templates', 'audit_form.form_id', '=', 'form_templates.id')
                ->leftJoin('status', 'audit_form.status_id', '=', 'status.id')
                ->where('audit_audit_form.audit_id', $auditId)
                ->select(
                    'audit_form.id',
                    'audit_form.name as formName',
                    'form_templates.name as templateName',
                    'form_templates.id as templateId',
                    'audit_form.status_id',
                    'status.name as status',
                    'audit_form.created_at as createdAt',
                    'audit_form.updated_at as updatedAt'
                )
                ->orderBy('audit_form.updated_at', 'desc')
                ->get();
                
            Log::info('Found ' . count($forms) . ' forms for audit ID: ' . $auditId);
            
            return response()->json([
                'auditId' => $auditId,
                'forms' => $forms
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in getAuditForms: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get form details with its values
     *
     * @param int $formId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuditFormDetails($formId)
    {
        try {
            Log::info('Fetching details for form ID: ' . $formId);
            
            // Get the form details
            $form = DB::table('audit_form')
                ->join('form_templates', 'audit_form.form_id', '=', 'form_templates.id')
                ->leftJoin('status', 'audit_form.status_id', '=', 'status.id')
                ->leftJoin('audit_audit_form', 'audit_form.id', '=', 'audit_audit_form.audit_form_id')
                ->leftJoin('audit', 'audit_audit_form.audit_id', '=', 'audit.id')
                ->leftJoin('outlets', 'audit.outlet_id', '=', 'outlets.id')
                ->where('audit_form.id', $formId)
                ->select(
                    'audit_form.id',
                    'audit_form.name as formName',
                    'form_templates.name as templateName',
                    'audit_form.value as formValues',
                    'form_templates.structure as formStructure',
                    'audit_form.ai_analysis as aiAnalysis',
                    'audit_form.status_id', // Include raw status_id
                    'status.name as status',
                    'outlets.name as outletName',
                    'audit.id as auditId',
                    'audit_form.created_at as createdAt',
                    'audit_form.updated_at as updatedAt'
                )
                ->first();
                
            if (!$form) {
                return response()->json(['error' => 'Form not found'], 404);
            }
            
            // Verify user has permission to access this form
            $userId = Auth::id();
            $userRole = DB::table('users')
                ->where('id', $userId)
                ->value('role_id');
                
            $hasAccess = DB::table('outlets')
                ->where('id', DB::table('audit')
                    ->where('id', $form->auditId)
                    ->value('outlet_id'))
                ->where('manager_role_id', $userRole)
                ->exists();
                
            if (!$hasAccess) {
                Log::warning('User attempted to access unauthorized form. User ID: ' . $userId . ', Form ID: ' . $formId);
                return response()->json(['error' => 'Unauthorized access'], 403);
            }
            
            // Process form values and structure if needed
            $formValues = null;
            $formStructure = null;
            
            if ($form->formValues) {
                $formValues = json_decode($form->formValues, true);
            }
            
            if ($form->formStructure) {
                $formStructure = json_decode($form->formStructure, true);
            }
            
            // Create a combined structure with mapped values
            $combinedForm = [];
            
            if ($formStructure && is_array($formStructure) && $formValues) {
                $combinedForm = $this->mapFormStructureWithValues($formStructure, $formValues);
            }
            
            return response()->json([
                'form' => $form,
                'combinedForm' => $combinedForm
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in getAuditFormDetails: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update form status (approve/reject/request revision)
     *
     * @param Request $request
     * @param int $formId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateFormStatus(Request $request, $formId)
    {
        try {
            // Validate request data
            $validatedData = $request->validate([
                'status_id' => 'required|exists:status,id',
                // Add validation for issue details when rejected (status_id = 4)
                'issue_description' => 'required_if:status_id,4|string',
                'issue_severity' => 'required_if:status_id,4|in:Low,Medium,High,Critical',
                'issue_due_date' => 'required_if:status_id,4|date|after:today',
            ]);

            DB::beginTransaction();

            // Update the form status
            $form = AuditForm::findOrFail($formId);
            $form->status_id = $validatedData['status_id'];
            $form->save();

            // If status is Rejected (status_id = 4), create an issue
            if ($validatedData['status_id'] == 4) {
                $issue = new Issue();
                $issue->description = $validatedData['issue_description'];
                $issue->severity = $validatedData['issue_severity'];
                $issue->due_date = $validatedData['issue_due_date'];
                $issue->audit_form_id = $formId;
                $issue->status_id = $validatedData['status_id']; // Initially same as form status
                $issue->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Form status updated successfully',
                'data' => [
                    'form' => $form,
                    'issue' => $issue ?? null
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating form status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the audit ID for a form using the junction table
     *
     * @param int $formId
     * @return int|null
     */
    private function getAuditIdForForm($formId)
    {
        $relation = DB::table('audit_audit_form')
            ->where('audit_form_id', $formId)
            ->orderBy('created_at', 'desc')
            ->first();
            
        return $relation ? $relation->audit_id : null;
    }

    /**
     * Update the audit version tracking table
     *
     * @param int $currentAuditId
     * @param int $newAuditId
     * @return void
     */
    private function updateAuditVersion($currentAuditId, $newAuditId)
    {
        // Check if the current audit is already in the version table
        $existingVersion = DB::table('audit_version')
            ->where('audit_id', $currentAuditId)
            ->first();
        
        if ($existingVersion) {
            // This is not the first version, use the existing first_audit_id
            $firstAuditId = $existingVersion->first_audit_id;
            
            // Get the next version number
            $nextVersion = DB::table('audit_version')
                ->where('first_audit_id', $firstAuditId)
                ->max('audit_version') + 1;
        } else {
            // This is the first rejection, so current audit becomes version 1
            $firstAuditId = $currentAuditId;
            
            // Insert record for the original audit (version 1)
            DB::table('audit_version')->insert([
                'audit_id' => $currentAuditId,
                'first_audit_id' => $firstAuditId,
                'audit_version' => 1
            ]);

            $nextVersion = 2;
        }
        
        // Insert record for the new audit
        DB::table('audit_version')->insert([
            'audit_id' => $newAuditId,
            'first_audit_id' => $firstAuditId,
            'audit_version' => $nextVersion
        ]);
    }
    /**
     * Update the specified issue.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateIssue(Request $request, $id)
    {
        try {
            $issue = Issue::findOrFail($id);
            
            $validated = $request->validate([
                'description' => 'required|string',
                'severity' => 'required|string|in:Low,Medium,High,Critical',
                'due_date' => 'required|date|after_or_equal:today',
            ]);
            
            $issue->update($validated);
            
            return response()->json([
                'message' => 'Issue updated successfully',
                'issue' => $issue
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update issue: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update issue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified issue.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteIssue($id)
    {
        try {
            $issue = Issue::findOrFail($id);
            $issue->delete();
            
            return response()->json([
                'message' => 'Issue deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete issue: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete issue',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Map form structure elements with their corresponding values
     * 
     * @param array $structure The form structure array
     * @param array $values The form values array
     * @return array Combined structure with values
     */
    private function mapFormStructureWithValues($structure, $values)
    {
        $result = [];
        
        foreach ($structure as $element) {
            $elementId = $element['id'];
            
            // Create a new element with structure and value
            $mappedElement = $element;
            
            // Find the value for this element if it exists
            if (array_key_exists($elementId, $values)) {
                $mappedElement['value'] = $values[$elementId];
            } else {
                // Set default value based on input type
                switch ($element['type']) {
                    case 'checkbox':
                        $mappedElement['value'] = false;
                        break;
                    case 'checkbox-group':
                    case 'radio-group':
                        $mappedElement['value'] = [];
                        break;
                    default:
                        $mappedElement['value'] = null;
                }
            }
            
            $result[] = $mappedElement;
        }
        
        // Sort by the order field if it exists
        usort($result, function($a, $b) {
            return ($a['order'] ?? 0) - ($b['order'] ?? 0);
        });
        
        return $result;
    }

    /**
     * Update audit status
     *
     * @param Request $request
     * @param int $auditId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAuditStatus(Request $request, $auditId)
    {
        try {
            // Validate request data
            $validatedData = $request->validate([
                'status_id' => 'required|exists:status,id',
            ]);

            // Find the audit
            $audit = DB::table('audit')->where('id', $auditId)->first();
            
            if (!$audit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Audit not found'
                ], 404);
            }
            
            // Begin transaction
            DB::beginTransaction();
            
            // Update the original audit status
            DB::table('audit')
                ->where('id', $auditId)
                ->update([
                    'status_id' => $validatedData['status_id'],
                    'updated_at' => now()
                ]);
            
            // If the audit is rejected, create a new version
            if ($validatedData['status_id'] == 4) { // Rejected
                // Create a new audit based on the original one
                $newAuditId = $this->createNewAuditForRejection($audit);
                
                // Update the audit version tracking
                $this->updateAuditVersion($auditId, $newAuditId);
                
                // Process all forms from the original audit
                $this->processFormsForRejectedAudit($auditId, $newAuditId);
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Audit rejected and new version created successfully',
                    'new_audit_id' => $newAuditId
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Audit status updated successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error updating audit status: ' . $e->getMessage(), [
                'audit_id' => $auditId,
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating audit status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new audit specifically for rejection workflow
     *
     * @param object $originalAudit
     * @return int New audit ID
     */
    private function createNewAuditForRejection($originalAudit)
    {
        // Convert the audit object to an array
        $auditData = (array) $originalAudit;
        
        // Remove the ID and timestamps
        unset($auditData['id']);
        unset($auditData['created_at']);
        unset($auditData['updated_at']);
        
        // Set status to 6 (Revision Requested) for the new audit
        $auditData['status_id'] = 7;
        
        // Add today's date and update due date (extend by 7 days from today)
        $auditData['start_time'] = now();

        // Explicitly set timestamps
        $auditData['created_at'] = now();
        $auditData['updated_at'] = now();

        $auditData['progress'] = 0;
        // Create the new audit
        $newAuditId = DB::table('audit')->insertGetId($auditData);
        
        Log::info("Created new audit {$newAuditId} for rejected audit {$originalAudit->id}");
        
        return $newAuditId;
    }

    /**
     * Process forms from a rejected audit
     * - Duplicate rejected forms with their original data
     * - Link non-rejected forms to the new audit
     *
     * @param int $originalAuditId
     * @param int $newAuditId
     * @return void
     */
    private function processFormsForRejectedAudit($originalAuditId, $newAuditId)
    {
        // Get all forms associated with the original audit
        $forms = DB::table('audit_audit_form')
            ->join('audit_form', 'audit_audit_form.audit_form_id', '=', 'audit_form.id')
            ->where('audit_audit_form.audit_id', $originalAuditId)
            ->select('audit_form.*', 'audit_audit_form.id as relation_id')
            ->get();
        
        $now = now();
        
        foreach ($forms as $form) {
            if ($form->status_id == 4) {
                // This is a rejected form - create a duplicate with the same data
                $newFormId = DB::table('audit_form')->insertGetId([
                    'name' => $form->name,
                    'form_id' => $form->form_id,
                    'value' => $form->value,
                    'status_id' => 7, // Set to Pending for the new form
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
                
                // Link the new form to the new audit via junction table
                DB::table('audit_audit_form')->insert([
                    'audit_id' => $newAuditId,
                    'audit_form_id' => $newFormId,
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
                
                Log::info("Duplicated rejected form {$form->id} as new form {$newFormId} for audit {$newAuditId}");
            } else {
                // This is a non-rejected form - just link it to the new audit
                DB::table('audit_audit_form')->insert([
                    'audit_id' => $newAuditId,
                    'audit_form_id' => $form->id,
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
                
                Log::info("Linked existing form {$form->id} to new audit {$newAuditId}");
            }
        }
        
        Log::info("Processed " . count($forms) . " forms for rejected audit {$originalAuditId}");
    }
    
    /**
     * Get detailed audit information
     *
     * @param int $auditId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuditDetails($auditId)
    {
        try {
            // Verify the current user has permission to access this audit
            $userId = Auth::id();
            $userRole = DB::table('users')
                ->where('id', $userId)
                ->value('role_id');
                
            // Fetch the audit with related data - using outlet_user_role_id for submitter
            $audit = DB::table('audit')
                ->join('outlets', 'audit.outlet_id', '=', 'outlets.id')
                ->leftJoin('users as submitter', 'outlets.outlet_user_role_id', '=', 'submitter.role_id')
                ->leftJoin('status', 'audit.status_id', '=', 'status.id')
                ->leftJoin('compliance_requirements', 'audit.compliance_id', '=', 'compliance_requirements.id')
                ->where('audit.id', $auditId)
                ->where('outlets.manager_role_id', $userRole) // Ensure current user has permission
                ->select(
                    'audit.id',
                    'compliance_requirements.title as auditType',
                    'outlets.name as outletName',
                    'submitter.name as submittedBy', // Changed from users.name to submitter.name
                    'audit.start_time as startDate',
                    'audit.end_time as endDate',
                    'audit.updated_at as updatedAt',
                    'audit.status_id',
                    'status.name as status',
                    'audit.progress as progress',
                )
                ->first();

            if (!$audit) {
                return response()->json(['message' => 'Audit not found or unauthorized'], 404);
            }
            
            // Add version information
            $versionInfo = DB::table('audit_version')
                ->where('audit_id', $audit->id)
                ->first();
                
            if ($versionInfo) {
                $audit->isVersioned = true;
                $audit->versionNumber = $versionInfo->audit_version;
                $audit->firstAuditId = $versionInfo->first_audit_id;
            } else {
                $audit->isVersioned = false;
            }
            
            return response()->json([
                'audit' => $audit
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch audit details: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Check if there are any rejected forms for the given audit
     *
     * @param int $auditId
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkRejectedForms($auditId)
    {
        Log::info('Starting checkRejectedForms', ['auditId' => $auditId]);
        
        // Get all forms for this audit with proper status information using junction table
        $forms = DB::table('audit_form')
            ->join('audit_audit_form', 'audit_form.id', '=', 'audit_audit_form.audit_form_id')
            ->where('audit_audit_form.audit_id', $auditId)
            ->get();
        
        // Log the forms we found
        Log::info('Retrieved forms for audit', [
            'auditId' => $auditId,
            'formCount' => $forms->count(),
            'formStatusIds' => $forms->pluck('status_id')->toArray()
        ]);
        
        // Check if any forms have rejected status (status_id = 4)
        $hasRejectedForms = $forms->contains(function($form) {
            // Log each form's status_id for debugging
            Log::info('Checking form status', [
                'form_id' => $form->id ?? 'unknown',
                'status_id' => $form->status_id ?? 'missing',
                'is_rejected' => ($form->status_id === 4) ? 'yes' : 'no'
            ]);
            
            return $form->status_id === 4; // 4 is the ID for "rejected" status
        });
        
        // Log the result
        Log::info('Rejected forms check result', [
            'auditId' => $auditId,
            'hasRejectedForms' => $hasRejectedForms ? 'true' : 'false'
        ]);
        
        return response()->json([
            'hasRejectedForms' => $hasRejectedForms
        ]);
    }

    /**
     * Generate AI analysis for a form submission
     *
     * @param AuditForm $auditForm
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateFormAnalysis(AuditForm $auditForm)
    {
        try {
            Log::info('AI Analysis requested for form ID: ' . $auditForm->id);
            
            // Check if analysis already exists
            if ($auditForm->ai_analysis) {
                Log::info('AI Analysis already exists for form ID: ' . $auditForm->id);
                return response()->json([
                    'success' => true,
                    'analysis' => $auditForm->ai_analysis,
                    'cached' => true
                ]);
            }

            // Verify user has permission to access this form
            $userId = Auth::id();
            $userRole = DB::table('users')
                ->where('id', $userId)
                ->value('role_id');

            // Get audit ID for this form
            $auditId = $this->getAuditIdForForm($auditForm->id);
            if (!$auditId) {
                return response()->json(['error' => 'Form not associated with any audit'], 404);
            }

            // Check permission
            $hasAccess = DB::table('audit')
                ->join('outlets', 'audit.outlet_id', '=', 'outlets.id')
                ->where('audit.id', $auditId)
                ->where('outlets.manager_role_id', $userRole)
                ->exists();

            if (!$hasAccess) {
                Log::warning('User attempted to generate AI analysis for unauthorized form. User ID: ' . $userId . ', Form ID: ' . $auditForm->id);
                return response()->json(['error' => 'Unauthorized access'], 403);
            }

            // Get form template and combined data
            $formTemplate = $auditForm->formTemplate;
            if (!$formTemplate) {
                return response()->json(['error' => 'Form template not found'], 404);
            }

            // Prepare form data for analysis
            $formStructure = $formTemplate->structure;
            $formValues = $auditForm->value;
            $combinedForm = $this->mapFormStructureWithValues($formStructure, $formValues);

            // Extract text content from form for AI analysis
            $textContent = $this->extractTextContentFromForm($combinedForm);

            Log::info('Extracted text content length: ' . strlen($textContent));

            // Call external AI API
            $aiResponse = $this->callAIAnalysisAPI($textContent, $formTemplate->name);

            // Save the analysis to database
            $auditForm->ai_analysis = $aiResponse;
            $auditForm->save();

            Log::info('AI Analysis saved successfully for form ID: ' . $auditForm->id);

            return response()->json([
                'success' => true,
                'analysis' => $aiResponse,
                'cached' => false
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating AI analysis: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate AI analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extract text content from form structure and values for AI analysis
     *
     * @param array $combinedForm
     * @return string
     */
    private function extractTextContentFromForm($combinedForm)
    {
        $textContent = '';
        
        if (!is_array($combinedForm)) {
            return $textContent;
        }

        foreach ($combinedForm as $field) {
            if (!is_array($field)) continue;
            
            $label = $field['label'] ?? 'Unnamed Field';
            $value = $field['value'] ?? 'No response';
            $type = $field['type'] ?? 'unknown';
            
            // Format based on field type
            switch ($type) {
                case 'checkbox':
                case 'radio':
                    if (is_array($value)) {
                        $value = implode(', ', $value);
                    }
                    break;
                case 'file':
                    if (is_array($value) && !empty($value)) {
                        $value = 'Files uploaded: ' . implode(', ', array_column($value, 'name'));
                    } else {
                        $value = 'No files uploaded';
                    }
                    break;
                default:
                    // Handle text, textarea, number, etc.
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
            }
            
            $textContent .= "{$label}: {$value}\n";
        }
        
        return $textContent;
    }

    /**
     * Call external AI API for form analysis
     *
     * @param string $textContent
     * @param string $formName
     * @return array
     */
    private function callAIAnalysisAPI($textContent, $formName)
    {
        $prompt = "Please analyze this audit form submission and provide insights in the following JSON format:

{
  \"compliance_score\": 85,
  \"risk_level\": \"Medium\",
  \"key_findings\": [
    \"Finding 1\",
    \"Finding 2\"
  ],
  \"recommendations\": [
    \"Recommendation 1\",
    \"Recommendation 2\"
  ],
  \"areas_of_concern\": [
    \"Concern 1\",
    \"Concern 2\"
  ],
  \"positive_aspects\": [
    \"Positive aspect 1\",
    \"Positive aspect 2\"
  ]
}

Form Name: {$formName}

Form Submission Data:
{$textContent}

Please provide a comprehensive analysis focusing on compliance adherence, potential risks, and actionable recommendations for improvement.";

        // Check if API key is available
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            throw new \Exception('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
        }

        Log::info('Making OpenAI API call', [
            'model' => env('OPENAI_MODEL', 'gpt-4'),
            'api_key_length' => strlen($apiKey),
            'api_key_prefix' => substr($apiKey, 0, 10) . '...'
        ]);

        // Make API call with 120 second timeout
        $response = Http::timeout(120)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json'
            ])
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => env('OPENAI_MODEL', 'gpt-4'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert compliance auditor. Analyze the provided audit form data and return your analysis in the requested JSON format only, without any additional text or markdown formatting.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.3,
                'max_tokens' => 1500
            ]);

        if (!$response->successful()) {
            throw new \Exception('AI API request failed: ' . $response->body());
        }

        $responseData = $response->json();
        
        if (!isset($responseData['choices'][0]['message']['content'])) {
            throw new \Exception('Invalid AI API response structure');
        }

        $aiContent = $responseData['choices'][0]['message']['content'];
        
        // Parse JSON response
        $analysisData = json_decode($aiContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse AI response as JSON: ' . json_last_error_msg());
        }

        // Validate required fields
        $requiredFields = ['compliance_score', 'risk_level', 'key_findings', 'recommendations'];
        foreach ($requiredFields as $field) {
            if (!isset($analysisData[$field])) {
                throw new \Exception("Missing required field in AI response: {$field}");
            }
        }

        return $analysisData;
    }
}
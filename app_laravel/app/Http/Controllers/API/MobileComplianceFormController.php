<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRequirement;
use App\Models\Audit;
use App\Models\AuditForm;
use App\Models\Issue;
use Illuminate\Http\Request;
use App\Models\AuditVersion;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MobileComplianceFormController extends Controller
{
    public function index(Request $request)
    {
        // Get active compliance requirements with their categories and form templates
        $requirements = ComplianceRequirement::with(['category', 'formTemplates'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($requirement) {
                return [
                    'id' => $requirement->id,
                    'title' => $requirement->title,
                    'description' => $requirement->description,
                    'icon' => $this->getIconForSubmissionType($requirement->submission_type),
                    'category' => $requirement->category?->name,
                    'submission_type' => $requirement->submission_type,
                    'frequency' => $requirement->frequency,
                    'document_upload_instructions' => $requirement->document_upload_instructions,
                    'form_templates' => $requirement->formTemplates->map(function ($template) {
                        return [
                            'id' => $template->id,
                            'name' => $template->name,
                            'description' => $template->description,
                            'structure' => $template->structure
                        ];
                    })
                ];
            });

        return response()->json($requirements);
    }

    /**
     * Get forms for a specific audit, including both created and not-yet-created forms
     * 
     * @param Request $request
     * @param int $auditId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuditForms(Request $request, $auditId)
    {
        try {
            // Get the audit with its compliance requirement and existing forms with their statuses
            $audit = Audit::with(['complianceRequirement.formTemplates', 'auditForms.status'])
                ->findOrFail($auditId);

            // Get all form templates from the compliance requirement
            $allFormTemplates = $audit->complianceRequirement->formTemplates;
            
            // Transform into response format
            $forms = $allFormTemplates->map(function ($template) use ($audit) {
                // Check if this form has already been created in audit_form
                $auditForm = $audit->auditForms->firstWhere('form_id', $template->id);
                
                $status = $auditForm ? 
                    ['id' => $auditForm->status->id, 'name' => $auditForm->status->name] :
                    ['id' => 1, 'name' => 'draft']; // Default status for new forms

                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'description' => $template->description,
                    'structure' => $template->structure,
                    'status' => $status,
                    'audit_form_id' => $auditForm?->id,
                    'value' => $auditForm?->value,
                    'is_created' => !is_null($auditForm),
                    'created_at' => $auditForm?->created_at,
                    'updated_at' => $auditForm?->updated_at
                ];
            });

            // Get version history
            $versionHistory = [];
            $currentVersionInfo = \App\Models\AuditVersion::where('audit_id', $audit->id)->first();

            if ($currentVersionInfo) {
                $allVersions = \App\Models\AuditVersion::with(['audit.status', 'audit.complianceRequirement', 'audit.outlet'])
                    ->where('first_audit_id', $currentVersionInfo->first_audit_id)
                    ->orderBy('audit_version', 'desc')
                    ->get();
                
                $versionHistory = $allVersions->map(function ($version) {
                    if (!$version->audit || !$version->audit->complianceRequirement) return null;
                    
                    $dueDate = $this->calculateDueDate($version->audit->start_time, $version->audit->complianceRequirement->frequency);

                    return [
                        'audit_id' => $version->audit_id,
                        'version' => $version->audit_version,
                        'status' => $version->audit->status->name,
                        'title' => $version->audit->complianceRequirement->title,
                        'dueDate' => $dueDate->format('Y-m-d'),
                        'outlet_id' => $version->audit->outlet_id,
                    ];
                })->filter()->values();
            }

            return response()->json([
                'forms' => $forms,
                'audit' => [
                    'id' => $audit->id,
                    'compliance_id' => $audit->compliance_id,
                    'status' => $audit->status->name
                ],
                'version_history' => $versionHistory,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch audit forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get issue data for an audit form
     * 
     * @param Request $request
     * @param int $auditFormId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuditFormIssue(Request $request, $auditFormId)
    {
        $step = 'initializing';
        try {
            // Step 1: Get the current audit form and its form_id (template id)
            $step = 'finding current audit form';
            $currentAuditForm = AuditForm::findOrFail($auditFormId);
            $targetFormId = $currentAuditForm->form_id;

            // Step 2: Get the current audit_id from the pivot table
            $step = 'finding current audit id';
            $currentAuditId = DB::table('audit_audit_form')
                ->where('audit_form_id', $auditFormId)
                ->value('audit_id');

            if (!$currentAuditId) {
                return response()->json(['message' => 'Audit not found for the given form.'], 404);
            }

            // Step 3: Find the previous version of the audit
            // First, get the version info for the current audit
            $step = 'finding current audit version info';
            $currentVersionInfo = AuditVersion::where('audit_id', $currentAuditId)->first();

            if (!$currentVersionInfo || $currentVersionInfo->audit_version < 2) {
                return response()->json(['message' => 'No previous version found for this audit. Audit ID: ' . $currentAuditId], 404);
            }

            // Then, find the audit_id of the previous version
            $step = 'finding previous audit id';
            $previousAuditId = AuditVersion::where('first_audit_id', $currentVersionInfo->first_audit_id)
                ->where('audit_version', $currentVersionInfo->audit_version - 1)
                ->value('audit_id');
            
            if (!$previousAuditId) {
                return response()->json(['message' => 'Previous audit version record not found.'], 404);
            }

            // Step 4: Get all audit_form_ids for the previous audit
            $step = 'getting previous audit form ids';
            $previousAuditFormIds = DB::table('audit_audit_form')
                ->where('audit_id', $previousAuditId)
                ->pluck('audit_form_id');

            // Step 5: Find the audit_form in the previous version that matches the form_id
            $step = 'finding matching form in previous version';
            $previousVersionAuditFormId = DB::table('audit_form')
                ->whereIn('id', $previousAuditFormIds)
                ->where('form_id', $targetFormId)
                ->value('id');

            if (!$previousVersionAuditFormId) {
                return response()->json(['message' => 'Corresponding form in previous audit version not found.'], 404);
            }

            // Step 6: Get the issue associated with that previous audit form
            $step = 'getting issue from previous version';
            $issues = Issue::where('audit_form_id', $previousVersionAuditFormId)
                ->with('status')
                ->get();

            if ($issues->isEmpty()) {
                return response()->json(['message' => 'No issue found for the corresponding form in the previous version.'], 404);
            }

            $formattedIssues = $issues->map(function ($issue) {
                $latestCorrectiveAction = DB::table('corrective_actions')
                    ->where('issue_id', $issue->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                return [
                    'id' => $issue->id,
                    'description' => $issue->description,
                    'severity' => $issue->severity,
                    'due_date' => $issue->due_date,
                    'status' => $issue->status->name,
                    'corrective_action' => $latestCorrectiveAction ? $latestCorrectiveAction->description : null,
                ];
            });

            return response()->json([
                'issues' => $formattedIssues
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => "Failed to fetch audit form issue at step: {$step}",
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateDueDate($startDate, $frequency = null)
    {
        if (!$startDate) {
            return now()->endOfMonth();
        }

        $startDate = Carbon::parse($startDate);
        
        return match($frequency) {
            'Daily' => $startDate->copy()->endOfDay(),
            'Weekly' => $startDate->copy()->endOfWeek(),
            'Monthly' => $startDate->copy()->endOfMonth(),
            'Quarterly' => $startDate->copy()->addMonths(3)->endOfMonth(),
            'Bi-annually' => $startDate->copy()->addMonths(6)->endOfMonth(),
            'Annually' => $startDate->copy()->endOfYear(),
            default => $startDate->copy()->endOfMonth(),
        };
    }

    private function getIconForSubmissionType($type)
    {
        return match($type) {
            'form_template' => 'document-text',
            'document_upload_only' => 'cloud-upload',
            default => 'document'
        };
    }
}

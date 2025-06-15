<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRequirement;
use App\Models\Audit;
use App\Models\AuditForm;
use Illuminate\Http\Request;

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
            // Get the audit with its compliance requirement and existing forms
            $audit = Audit::with(['complianceRequirement.formTemplates', 'auditForms'])
                ->findOrFail($auditId);

            // Get all form templates from the compliance requirement
            $allFormTemplates = $audit->complianceRequirement->formTemplates;
            
            // Transform into response format
            $forms = $allFormTemplates->map(function ($template) use ($audit) {
                // Check if this form has already been created in audit_form
                $auditForm = $audit->auditForms->firstWhere('form_id', $template->id);
                
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'description' => $template->description,
                    'structure' => $template->structure,
                    'is_created' => !is_null($auditForm),
                    'audit_form_id' => $auditForm?->id,
                    'value' => $auditForm?->value,
                    'created_at' => $auditForm?->created_at,
                    'updated_at' => $auditForm?->updated_at
                ];
            });

            return response()->json([
                'forms' => $forms,
                'audit' => [
                    'id' => $audit->id,
                    'compliance_id' => $audit->compliance_id,
                    'status' => $audit->status->name
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch audit forms',
                'error' => $e->getMessage()
            ], 500);
        }
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

<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRequirement;
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
                            'description' => $template->description
                        ];
                    })
                ];
            });

        return response()->json($requirements);
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

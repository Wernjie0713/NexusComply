<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRequirement;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComplianceRequirementController extends Controller
{
    /**
     * Get form templates associated with a compliance requirement
     *
     * @param ComplianceRequirement $complianceRequirement
     * @return JsonResponse
     */
    public function getFormTemplates(ComplianceRequirement $complianceRequirement): JsonResponse
    {
        try {
            // Get form templates through the pivot table
            $formTemplates = FormTemplate::query()
                ->join('compliance_requirement_form_template', 'form_templates.id', '=', 'compliance_requirement_form_template.form_template_id')
                ->where('compliance_requirement_form_template.compliance_requirement_id', $complianceRequirement->id)
                ->select('form_templates.id', 'form_templates.name', 'form_templates.description')
                ->get();

            return response()->json([
                'data' => $formTemplates,
                'message' => 'Form templates retrieved successfully'
            ], 200, [
                'Content-Type' => 'application/json'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching form templates: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to fetch form templates',
                'error' => $e->getMessage()
            ], 500, [
                'Content-Type' => 'application/json'
            ]);
        }
    }
} 
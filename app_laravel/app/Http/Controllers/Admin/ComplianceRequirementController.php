<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRequirement;
use App\Models\FormTemplate;
use App\Models\ComplianceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Status;

class ComplianceRequirementController extends Controller
{
    /**
     * Display a listing of the compliance requirements.
     */
    public function index()
    {
        // Get all compliance requirements with related form templates
        $complianceRequirements = ComplianceRequirement::with(['formTemplates:id,name', 'creator:id,name', 'category:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        // Get the IDs for the statuses we need
        $revisedStatusId = Status::where('name', 'revised')->value('id');
        $submittedStatusId = Status::where('name', 'submitted')->value('id');

        // Get revised form templates using the direct ID
        $revisedFormTemplates = FormTemplate::where('status_id', $revisedStatusId)
            ->with(['creator', 'status'])
            ->withCount('complianceRequirements')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Get submitted form templates using the direct ID
        $submittedFormTemplates = FormTemplate::where('status_id', $submittedStatusId)
            ->with(['creator', 'status'])
            ->withCount('complianceRequirements')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Get all compliance categories
        $categories = ComplianceCategory::orderBy('name')->get();
            
        return Inertia::render('Admin/ComplianceFramework/SetupPage', [
            'complianceRequirements' => $complianceRequirements,
            'formTemplates' => $revisedFormTemplates,
            'submittedFormTemplates' => $submittedFormTemplates,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get only revised form templates for the selection UI
        $formTemplates = FormTemplate::whereHas('status', function($query) {
            $query->where('name', 'revised');
        })
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $categories = ComplianceCategory::orderBy('name')->get();

        return Inertia::render('Admin/ComplianceFramework/SetupPage', [
            'formTemplates' => $formTemplates,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created compliance requirement in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:compliance_category,id',
            'submission_type' => 'required|string|in:form_template,document_upload_only',
            'form_template_ids' => 'nullable|array|required_if:submission_type,form_template',
            'form_template_ids.*' => 'exists:form_templates,id',
            'document_upload_instructions' => 'nullable|required_if:submission_type,document_upload_only|string',
            'frequency' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        
        // Add the authenticated user's ID to the data
        $validated['created_by_user_id'] = Auth::id();
        
        // Remove form_template_ids from validated data as it's not a direct column
        $formTemplateIds = $validated['form_template_ids'] ?? [];
        unset($validated['form_template_ids']);
        
        // Create the compliance requirement
        $complianceRequirement = ComplianceRequirement::create($validated);
        
        // Attach form templates if any
        if (!empty($formTemplateIds)) {
            $complianceRequirement->formTemplates()->attach($formTemplateIds);
        }
        
        return redirect()->route('admin.compliance-requirements.index')
            ->with('success', 'Compliance requirement created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $complianceRequirement = ComplianceRequirement::with(['category', 'formTemplates'])->findOrFail($id);
        
        // Get only revised form templates for the selection UI
        $formTemplates = FormTemplate::whereHas('status', function($query) {
            $query->where('name', 'revised');
        })
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $categories = ComplianceCategory::orderBy('name')->get();

        return Inertia::render('Admin/ComplianceFramework/SetupPage', [
            'complianceRequirement' => $complianceRequirement,
            'formTemplates' => $formTemplates,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified compliance requirement in storage.
     */
    public function update(Request $request, ComplianceRequirement $complianceRequirement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:compliance_category,id',
            'submission_type' => 'required|string|in:form_template,document_upload_only',
            'form_template_ids' => 'nullable|array|required_if:submission_type,form_template',
            'form_template_ids.*' => 'exists:form_templates,id',
            'document_upload_instructions' => 'nullable|required_if:submission_type,document_upload_only|string',
            'frequency' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        
        // Remove form_template_ids from validated data as it's not a direct column
        $formTemplateIds = $validated['form_template_ids'] ?? [];
        unset($validated['form_template_ids']);
        
        // Update the compliance requirement
        $complianceRequirement->update($validated);
        
        // Sync form templates
        $complianceRequirement->formTemplates()->sync($formTemplateIds);
        
        return redirect()->route('admin.compliance-requirements.index')
            ->with('success', 'Compliance requirement updated successfully.');
    }

    /**
     * Remove the specified compliance requirement from storage.
     */
    public function destroy(ComplianceRequirement $complianceRequirement)
    {
        $complianceRequirement->delete();
        
        return redirect()->route('admin.compliance-requirements.index')
            ->with('success', 'Compliance requirement deleted successfully.');
    }
}

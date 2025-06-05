<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRequirement;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ComplianceRequirementController extends Controller
{
    /**
     * Display a listing of the compliance requirements.
     */
    public function index()
    {
        // Get all compliance requirements with related form templates
        $complianceRequirements = ComplianceRequirement::with(['formTemplate:id,name', 'creator:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        // Get all published form templates for the selection UI
        $formTemplates = FormTemplate::where('status', 'published')
            ->orderBy('name')
            ->get(['id', 'name', 'description']);
            
        return Inertia::render('Admin/ComplianceFramework/SetupPage', [
            'complianceRequirements' => $complianceRequirements,
            'formTemplates' => $formTemplates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created compliance requirement in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'submission_type' => 'required|string|in:form_template,document_upload_only',
            'form_template_id' => 'nullable|required_if:submission_type,form_template|exists:form_templates,id',
            'document_upload_instructions' => 'nullable|required_if:submission_type,document_upload_only|string',
            'frequency' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        
        // Add the authenticated user's ID to the data
        $validated['created_by_user_id'] = Auth::id();
        
        // Create the compliance requirement
        $complianceRequirement = ComplianceRequirement::create($validated);
        
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
        //
    }

    /**
     * Update the specified compliance requirement in storage.
     */
    public function update(Request $request, ComplianceRequirement $complianceRequirement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'submission_type' => 'required|string|in:form_template,document_upload_only',
            'form_template_id' => 'nullable|required_if:submission_type,form_template|exists:form_templates,id',
            'document_upload_instructions' => 'nullable|required_if:submission_type,document_upload_only|string',
            'frequency' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        
        // Update the compliance requirement
        $complianceRequirement->update($validated);
        
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

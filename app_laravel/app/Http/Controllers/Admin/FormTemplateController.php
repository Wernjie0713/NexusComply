<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Models\ComplianceRequirement;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of the form templates.
     */
    /**
     * Show the form for creating a new form template.
     */
    public function create()
    {
        $statuses = Status::all();
        $draftStatusId = Status::where('name', 'draft')->first()->id;

        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'create',
            'formTemplate' => null,
            'fromCompliance' => request()->has('from_compliance'),
            'statuses' => $statuses,
            'defaultStatusId' => $draftStatusId,
        ]);
    }

    /**
     * Store a newly created form template in storage.
     */
    public function store(Request $request)
    {
        Log::info('FormTemplate Store Request Received:', [
            'request_data' => $request->all()
        ]);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'structure' => 'required|array',
            'action' => 'nullable|string|in:save_draft,submit_for_revision',
        ]);

        // Determine the correct status_id based on action
        $action = $validated['action'] ?? 'save_draft';
        
        // Set the status ID based on the action
        if ($action === 'submit_for_revision') {
            $newStatusId = Status::where('name', 'submitted')->value('id');
            Log::info('Setting status to submitted for new form', ['status_id' => $newStatusId]);
        } else { // Default to draft for 'save_draft' or no action
            $newStatusId = Status::where('name', 'draft')->value('id');
            Log::info('Setting status to draft for new form', ['status_id' => $newStatusId]);
        }

        // Remove action from validated data since it's not a model attribute
        unset($validated['action']);

        $formTemplate = FormTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'structure' => $validated['structure'],
            'status_id' => $newStatusId,
            'created_by_user_id' => Auth::id(),
        ]);

        Log::info('FormTemplate Created:', [
            'id' => $formTemplate->id, 
            'status_id' => $formTemplate->status_id,
            'status_name' => $formTemplate->status->name ?? 'unknown'
        ]);

        // If the form is being submitted for revision, redirect to compliance requirements page
        if ($action === 'submit_for_revision') {
            return redirect()->route('admin.compliance-requirements.index')
                ->with('success', 'Form template submitted for revision.');
        }

        // Otherwise redirect to edit page
        return redirect()->route('admin.form-templates.edit', $formTemplate)
            ->with('success', 'Form template created successfully.');
    }

    /**
     * Show the form for editing the specified form template.
     */
    public function edit(FormTemplate $formTemplate)
    {
        $statuses = Status::all();

        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'edit',
            'formTemplate' => $formTemplate->load('status'),
            'fromCompliance' => request()->has('from_compliance'),
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified form template in storage.
     */
    public function update(Request $request, FormTemplate $formTemplate)
    {
        Log::info('FormTemplate Update Request Received:', [
            'request_data' => $request->all(),
            'current_status_id' => $formTemplate->status_id,
            'current_status_name' => $formTemplate->status->name ?? 'unknown'
        ]);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'structure' => 'required|array',
            'action' => 'nullable|string|in:save_draft,submit_for_revision,approve_revision',
        ]);

        // Determine the correct status_id based on action
        $action = $validated['action'] ?? 'save_draft';
        
        // Set the status ID based on the action
        if ($action === 'submit_for_revision') {
            $newStatusId = Status::where('name', 'submitted')->value('id');
            Log::info('Changing status to submitted', ['new_status_id' => $newStatusId]);
        } elseif ($action === 'approve_revision') {
            $newStatusId = Status::where('name', 'revised')->value('id');
            Log::info('Changing status to revised (approved)', ['new_status_id' => $newStatusId]);
        } else { // Default to draft for 'save_draft' or no action
            $newStatusId = Status::where('name', 'draft')->value('id');
            Log::info('Changing status to draft', ['new_status_id' => $newStatusId]);
        }

        // Remove action from validated data since it's not a model attribute
        unset($validated['action']);

        // Update with the explicitly set status_id
        $updateData = [
            'name' => $validated['name'],
            'description' => $validated['description'],
            'structure' => $validated['structure'],
            'status_id' => $newStatusId, // Use the determined status ID
        ];
        
        $formTemplate->update($updateData);

        Log::info('FormTemplate Updated:', [
            'id' => $formTemplate->id, 
            'new_status_id' => $newStatusId,
            'actual_status_id_after_update' => $formTemplate->fresh()->status_id,
            'status_name_after_update' => $formTemplate->fresh()->status->name ?? 'unknown'
        ]);

        // Redirect based on the action
        if ($action === 'approve_revision') {
            return redirect()->route('admin.compliance-requirements.index')
                ->with('success', 'Form template approved and finalized successfully.');
        } elseif ($action === 'submit_for_revision') {
            return redirect()->route('admin.compliance-requirements.index')
                ->with('success', 'Form template submitted for revision.');
        }

        // Default redirect back to edit page
        return redirect()->route('admin.form-templates.edit', $formTemplate)
            ->with('success', 'Form template updated successfully.');
    }

    /**
     * Remove the specified form template from storage.
     */
    public function destroy(FormTemplate $formTemplate)
    {
        // Check if the form template is being used by any compliance requirements
        $usedByComplianceRequirements = ComplianceRequirement::whereHas('formTemplates', function($query) use ($formTemplate) {
            $query->where('form_templates.id', $formTemplate->id);
        })->exists();
        
        if ($usedByComplianceRequirements) {
            return redirect()->route('admin.compliance-requirements.index')
                ->with('error', 'Form template cannot be deleted because it is being used by one or more compliance requirements.');
        }
        
        $formTemplate->delete();

        return redirect()->route('admin.compliance-requirements.index')
            ->with('success', 'Form template deleted successfully.');
    }
}

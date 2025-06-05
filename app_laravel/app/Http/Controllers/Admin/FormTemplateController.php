<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of the form templates.
     */
    public function index()
    {
        $formTemplates = FormTemplate::with('creator')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Admin/Forms/IndexPage', [
            'formTemplates' => $formTemplates,
        ]);
    }

    /**
     * Show the form for creating a new form template.
     */
    public function create()
    {
        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'create',
            'formTemplate' => null,
        ]);
    }

    /**
     * Store a newly created form template in storage.
     */
    public function store(Request $request)
    {
        Log::info('Form Template Request Data for Save/Publish:', $request->all());
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'structure' => 'required|array',
            'status' => 'required|string|in:draft,published,archived',
        ]);

        $formTemplate = FormTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'structure' => $validated['structure'],
            'status' => $validated['status'],
            'created_by_user_id' => Auth::id(),
        ]);

        Log::info('Form Template Saved with Status:', ['id' => $formTemplate->id, 'status' => $formTemplate->status]);

        return redirect()->route('admin.form-templates.edit', $formTemplate)
            ->with('success', 'Form template created successfully.');
    }

    /**
     * Show the form for editing the specified form template.
     */
    public function edit(FormTemplate $formTemplate)
    {
        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'edit',
            'formTemplate' => $formTemplate,
        ]);
    }

    /**
     * Update the specified form template in storage.
     */
    public function update(Request $request, FormTemplate $formTemplate)
    {
        Log::info('Form Template Update Request Data:', $request->all());
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'structure' => 'required|array',
            'status' => 'required|string|in:draft,published,archived',
        ]);

        $formTemplate->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'structure' => $validated['structure'],
            'status' => $validated['status'],
        ]);

        Log::info('Form Template Updated with Status:', ['id' => $formTemplate->id, 'status' => $formTemplate->status]);

        return redirect()->route('admin.form-templates.edit', $formTemplate)
            ->with('success', 'Form template updated successfully.');
    }

    /**
     * Remove the specified form template from storage.
     */
    public function destroy(FormTemplate $formTemplate)
    {
        $formTemplate->delete();

        return redirect()->route('admin.form-templates.index')
            ->with('success', 'Form template deleted successfully.');
    }
}

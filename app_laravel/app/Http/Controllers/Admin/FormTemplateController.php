<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Models\ComplianceRequirement;
use App\Models\Section;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of the form templates.
     */
    public function index()
    {
        $formTemplates = FormTemplate::with(['status', 'section'])
            ->orderBy('name')
            ->get();
            
        $sections = Section::orderBy('name')->get();

        return Inertia::render('Admin/Forms/IndexPage', [
            'formTemplates' => $formTemplates,
            'sections' => $sections,
        ]);
    }

    /**
     * Show the form for creating a new form template.
     */
    public function create()
    {
        $statuses = Status::all();
        $sections = Section::orderBy('name')->get();
        $draftStatusId = Status::where('name', 'draft')->first()->id;

        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'create',
            'formTemplate' => null,
            'fromCompliance' => request()->has('from_compliance'),
            'statuses' => $statuses,
            'sections' => $sections,
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
            'section_id' => 'nullable|exists:sections,id',
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
            'section_id' => $validated['section_id'] ?? null,
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
        $sections = Section::orderBy('name')->get();

        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'edit',
            'formTemplate' => $formTemplate->load(['status', 'section']),
            'fromCompliance' => request()->has('from_compliance'),
            'statuses' => $statuses,
            'sections' => $sections,
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
            'section_id' => 'nullable|exists:sections,id',
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
            'section_id' => $validated['section_id'] ?? null,
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

    /**
     * Import form structure from Excel file using AI with caching.
     */
    public function importFromExcel(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls|max:10240', // Max 10MB
            ]);

            // Get the uploaded file
            $file = $request->file('file');
            
            // Generate a unique hash for the file content (cache key)
            $fileHash = hash_file('sha256', $file->getPathname());
            $cacheKey = "excel_import_{$fileHash}";
            
            Log::info('Excel import started', [
                'filename' => $file->getClientOriginalName(),
                'file_hash' => $fileHash
            ]);
            
            // Check if we have a cached result for this file
            if (Cache::has($cacheKey)) {
                Log::info('Cache hit for Excel import', ['file_hash' => $fileHash]);
                
                $cachedStructure = Cache::get($cacheKey);
                
                return response()->json([
                    'structure' => $cachedStructure,
                    'message' => 'Form structure retrieved from cache (file already processed).',
                    'cached' => true
                ]);
            }
            
            Log::info('Cache miss for Excel import, processing file', ['file_hash' => $fileHash]);
            
            // Read the Excel file
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            
            // Extract all text content from the Excel file
            $extractedText = '';
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            
            for ($row = 1; $row <= $highestRow; $row++) {
                for ($col = 'A'; $col <= $highestColumn; $col++) {
                    $cellValue = $worksheet->getCell($col . $row)->getCalculatedValue();
                    if (!empty(trim($cellValue))) {
                        $extractedText .= trim($cellValue) . ' ';
                    }
                }
                $extractedText .= "\n";
            }
            
            // Clean up the extracted text
            $extractedText = trim($extractedText);
            
            if (empty($extractedText)) {
                return response()->json([
                    'error' => 'No content found in the Excel file.'
                ], 400);
            }

            Log::info('Sending request to AI API', ['file_hash' => $fileHash]);

            // Prepare the AI request
            $aiResponse = Http::timeout(120) // Increase timeout to 120 seconds for larger files
                              ->withHeaders([
                                  'Authorization' => 'Bearer ' . env('GITHUB_TOKEN'),
                                  'Content-Type' => 'application/json',
                              ])->post('https://models.github.ai/inference/chat/completions', [
                                  'model' => 'openai/gpt-4o',
                                  'messages' => [
                                      [
                                          'role' => 'system',
                                          'content' => "You are an expert assistant that converts unstructured text from a checklist into a structured JSON array for a form builder. Each object in the array represents one form field. Each field object **must** have these keys: 'id' (a new uuid), 'type', 'label', and 'order'. It can optionally have 'isRequired' (boolean), 'placeholder' (string), and 'options' (an array of strings, for 'checkbox-group', 'radio', and 'select' types). **You must only use one of the following strings for the 'type' key:** 'text', 'textarea', 'checkbox', 'checkbox-group', 'radio', 'select', 'date', 'file', 'section', 'text-block'. For questions with 'Yes/No' options, use the 'radio' type. For section headers, use the 'section' type. Return ONLY the raw JSON array, without any surrounding text, explanations, or markdown formatting like ```json."
                                      ],
                                      [
                                          'role' => 'user',
                                          'content' => "Analyze the following text extracted from a compliance checklist Excel file and convert it to the specified JSON format. Create logical form fields based on the content. Text: " . $extractedText
                                      ]
                                  ],
                                  'max_tokens' => 4000,
                                  'temperature' => 0.3
                              ]);

            // Check if the AI request was successful
            if (!$aiResponse->successful()) {
                Log::error('GitHub AI API request failed', [
                    'status' => $aiResponse->status(),
                    'response' => $aiResponse->body(),
                    'file_hash' => $fileHash
                ]);
                
                return response()->json([
                    'error' => 'Failed to process the file with AI. Please try again.'
                ], 500);
            }

            $aiData = $aiResponse->json();
            
            // Extract the AI response content
            if (!isset($aiData['choices'][0]['message']['content'])) {
                return response()->json([
                    'error' => 'Invalid response from AI service.'
                ], 500);
            }

            $aiContent = $aiData['choices'][0]['message']['content'];
            
            // Clean up the AI response (remove markdown formatting if present)
            $aiContent = trim($aiContent);
            $aiContent = preg_replace('/^```json\s*/', '', $aiContent);
            $aiContent = preg_replace('/\s*```$/', '', $aiContent);
            
            // Parse the JSON response
            $structure = json_decode($aiContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to parse AI response as JSON', [
                    'json_error' => json_last_error_msg(),
                    'ai_content' => $aiContent,
                    'file_hash' => $fileHash
                ]);
                
                return response()->json([
                    'error' => 'Failed to parse AI response. Please try again with a different file.'
                ], 500);
            }

            // Validate and normalize the structure
            if (!is_array($structure)) {
                return response()->json([
                    'error' => 'Invalid structure format from AI response.'
                ], 500);
            }

            // Normalize and validate each field
            $normalizedStructure = [];
            foreach ($structure as $index => $field) {
                if (!is_array($field) || !isset($field['label'])) {
                    continue; // Skip invalid fields
                }

                $normalizedField = [
                    'id' => isset($field['id']) ? $field['id'] : Str::uuid()->toString(),
                    'type' => isset($field['type']) ? $field['type'] : 'text',
                    'label' => $field['label'],
                    'order' => isset($field['order']) ? (int)$field['order'] : $index + 1,
                    'required' => isset($field['required']) ? (bool)$field['required'] : false,
                ];

                // Add options for fields that support them
                if (in_array($normalizedField['type'], ['radio', 'checkbox-group']) && isset($field['options']) && is_array($field['options'])) {
                    $normalizedField['options'] = $field['options'];
                } elseif (in_array($normalizedField['type'], ['radio', 'checkbox-group'])) {
                    // Provide default options if missing
                    $normalizedField['options'] = ['Option 1', 'Option 2', 'Option 3'];
                }

                $normalizedStructure[] = $normalizedField;
            }

            // Cache the successful result for 30 days
            Cache::put($cacheKey, $normalizedStructure, now()->addDays(30));
            
            Log::info('Excel import completed and cached', [
                'file_hash' => $fileHash,
                'fields_count' => count($normalizedStructure)
            ]);

            // Return the generated structure
            return response()->json([
                'structure' => $normalizedStructure,
                'message' => 'Form structure generated successfully from Excel file.',
                'cached' => false
            ]);

        } catch (\PhpOffice\PhpSpreadsheet\Exception $e) {
            Log::error('PhpSpreadsheet error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to read the Excel file. Please ensure it is a valid Excel file.'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Excel import error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.'
            ], 500);
        }
    }
}

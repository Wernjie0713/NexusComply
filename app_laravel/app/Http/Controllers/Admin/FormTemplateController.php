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
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Str;
use Inertia\Inertia;
use OpenAI;

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
     * Import form structure from Excel file using AI with fallback mechanism.
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

            // Prepare the AI messages (same for both APIs)
            $systemMessage = "You are an expert assistant that converts unstructured text from a checklist into a structured JSON array for a form builder. Each object in the array represents one form field. Each field object **must** have these keys: 'id' (a new uuid), 'type', 'label', and 'order'. It can optionally have 'isRequired' (boolean), 'placeholder' (string), and 'options' (an array of strings).

**You must only use one of the following strings for the 'type' key:** 'text', 'textarea', 'checkbox', 'checkbox-group', 'radio', 'select', 'date', 'file', 'section', 'text-block'.

Follow these rules for choosing a type:
- For questions requiring a single 'Yes' or 'No' answer, use the 'radio' type with 'Yes' and 'No' in the options array.
- For questions where a user can select **multiple** items from a list, use the 'checkbox-group' type and include the items in the options array.
- For questions where a user must select **one** item from a list (that isn't a simple Yes/No), use the 'select' type and include the items in the options array.
- For section headers, use the 'section' type.

Return ONLY the raw JSON array, without any surrounding text, explanations, or markdown formatting like ```json.";
            
            $userMessage = "Analyze the following text extracted from a compliance checklist Excel file and convert it to the specified JSON format. Create logical form fields based on the content. Text: " . $extractedText;

            $aiContent = null;
            $usedFallback = false;

            // STEP 1: Try GitHub AI API first
            try {
                Log::info('Attempting GitHub AI API for Excel import');
                
                $githubResponse = Http::timeout(120)
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . env('GITHUB_TOKEN'),
                        'Content-Type' => 'application/json',
                    ])->post('https://models.github.ai/inference/chat/completions', [
                        'model' => 'openai/gpt-4o',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => $systemMessage
                            ],
                            [
                                'role' => 'user',
                                'content' => $userMessage
                            ]
                        ],
                        'max_tokens' => 4000,
                        'temperature' => 0.3
                    ]);

                if ($githubResponse->successful()) {
                    $githubData = $githubResponse->json();
                    
                    if (isset($githubData['choices'][0]['message']['content'])) {
                        $aiContent = $githubData['choices'][0]['message']['content'];
                        Log::info('GitHub AI API succeeded for Excel import');
                    } else {
                        throw new \Exception('Invalid response structure from GitHub AI API');
                    }
                } else {
                    throw new \Exception('GitHub AI API request failed with status: ' . $githubResponse->status());
                }

            } catch (\Exception $e) {
                Log::warning('GitHub AI API failed, attempting OpenAI fallback', [
                    'github_error' => $e->getMessage(),
                    'status' => isset($githubResponse) ? $githubResponse->status() : 'N/A'
                ]);

                // STEP 2: Fallback to OpenAI API
                try {
                    $openaiApiKey = env('OPENAI_API_KEY');
                    
                    if (!$openaiApiKey) {
                        throw new \Exception('OpenAI API key not configured');
                    }

                    Log::info('Attempting OpenAI API fallback for Excel import');
                    
                    $openaiClient = OpenAI::client($openaiApiKey);
                    
                    $openaiResponse = $openaiClient->chat()->create([
                        'model' => env('OPENAI_MODEL', 'gpt-4o'),
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => $systemMessage
                            ],
                            [
                                'role' => 'user',
                                'content' => $userMessage
                            ]
                        ],
                        'max_tokens' => 4000,
                        'temperature' => 0.3
                    ]);

                    if (isset($openaiResponse->choices[0]->message->content)) {
                        $aiContent = $openaiResponse->choices[0]->message->content;
                        $usedFallback = true;
                        Log::info('OpenAI API fallback succeeded for Excel import');
                    } else {
                        throw new \Exception('Invalid response structure from OpenAI API');
                    }

                } catch (\Exception $openaiError) {
                    Log::error('Both GitHub AI and OpenAI APIs failed for Excel import', [
                        'github_error' => $e->getMessage(),
                        'openai_error' => $openaiError->getMessage()
                    ]);

                    return response()->json([
                        'error' => 'Failed to process the file with AI services. Both primary and fallback services are unavailable. Please try again later.'
                    ], 500);
                }
            }

            // Process the successful AI response
            if (!$aiContent) {
                return response()->json([
                    'error' => 'No valid response received from AI services.'
                ], 500);
            }

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
                    'used_fallback' => $usedFallback
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
                if (in_array($normalizedField['type'], ['radio', 'checkbox-group', 'select']) && isset($field['options']) && is_array($field['options'])) {
                    $normalizedField['options'] = $field['options'];
                } elseif (in_array($normalizedField['type'], ['radio', 'checkbox-group', 'select'])) {
                    // Provide default options if missing
                    if ($normalizedField['type'] === 'radio') {
                        $normalizedField['options'] = ['Yes', 'No'];
                    } else {
                        $normalizedField['options'] = ['Option 1', 'Option 2', 'Option 3'];
                    }
                }

                $normalizedStructure[] = $normalizedField;
            }

            // Return the generated structure with information about which API was used
            $successMessage = $usedFallback 
                ? 'Form structure generated successfully using backup AI service.' 
                : 'Form structure generated successfully from Excel file.';

            Log::info('Excel import completed successfully', [
                'fields_generated' => count($normalizedStructure),
                'used_fallback' => $usedFallback
            ]);

            return response()->json([
                'structure' => $normalizedStructure,
                'message' => $successMessage,
                'used_fallback' => $usedFallback
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

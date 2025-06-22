<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComplianceRequirement;
use App\Models\ComplianceCategory;
use App\Models\User;
use App\Models\FormTemplate;

class ComplianceRequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for created_by_user_id
        $adminUser = User::where('email', 'admin@example.com')->first();
        
        if (!$adminUser) {
            return; // Skip if admin user doesn't exist
        }

        // Get first category
        $category = ComplianceCategory::first();
        
        if (!$category) {
            return; // Skip if no categories exist
        }

        // Get first form template
        $formTemplate = FormTemplate::first();

        // Create sample compliance requirements
        $complianceRequirements = [
            [
                'title' => 'Food Safety Compliance',
                'description' => 'Daily food safety checks and hygiene monitoring',
                'category_id' => $category->id,
                'submission_type' => 'form_template',
                'document_upload_instructions' => null,
                'frequency' => 'Daily',
                'is_active' => true,
                'created_by_user_id' => $adminUser->id,
            ],
            [
                'title' => 'Halal Certification',
                'description' => 'Monthly halal compliance verification',
                'category_id' => $category->id,
                'submission_type' => 'form_template',
                'document_upload_instructions' => null,
                'frequency' => 'Monthly',
                'is_active' => true,
                'created_by_user_id' => $adminUser->id,
            ],
            [
                'title' => 'Safety Equipment Check',
                'description' => 'Weekly safety equipment inspection',
                'category_id' => $category->id,
                'submission_type' => 'document_upload_only',
                'document_upload_instructions' => 'Please upload photos of all safety equipment and their inspection reports',
                'frequency' => 'Weekly',
                'is_active' => true,
                'created_by_user_id' => $adminUser->id,
            ],
        ];

        foreach ($complianceRequirements as $requirement) {
            $complianceRequirement = ComplianceRequirement::create($requirement);
            
            // Attach form template if it exists and submission type is form_template
            if ($formTemplate && $requirement['submission_type'] === 'form_template') {
                $complianceRequirement->formTemplates()->attach($formTemplate->id);
            }
        }
    }
} 
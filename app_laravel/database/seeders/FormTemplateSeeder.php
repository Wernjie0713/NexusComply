<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FormTemplate;
use App\Models\Section;
use App\Models\Status;
use App\Models\User;

class FormTemplateSeeder extends Seeder
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

        // Get first section
        $section = Section::first();
        
        if (!$section) {
            return; // Skip if no sections exist
        }

        // Get revised status
        $revisedStatus = Status::where('name', 'revised')->first();
        
        if (!$revisedStatus) {
            return; // Skip if revised status doesn't exist
        }

        // Create sample form templates
        $formTemplates = [
            [
                'name' => 'Food Safety Checklist',
                'description' => 'Daily food safety and hygiene monitoring checklist',
                'structure' => [
                    [
                        'id' => 'section_1',
                        'type' => 'section',
                        'title' => 'Kitchen Hygiene',
                        'fields' => [
                            [
                                'id' => 'clean_surfaces',
                                'type' => 'checkbox',
                                'label' => 'All surfaces are clean and sanitized',
                                'required' => true
                            ],
                            [
                                'id' => 'hand_washing',
                                'type' => 'checkbox',
                                'label' => 'Staff washed hands before handling food',
                                'required' => true
                            ],
                            [
                                'id' => 'temperature',
                                'type' => 'number',
                                'label' => 'Refrigerator temperature (°C)',
                                'required' => true,
                                'min' => 0,
                                'max' => 10
                            ]
                        ]
                    ]
                ],
                'section_id' => $section->id,
                'status_id' => $revisedStatus->id,
                'created_by_user_id' => $adminUser->id,
            ],
            [
                'name' => 'Halal Compliance Form',
                'description' => 'Monthly halal compliance verification form',
                'structure' => [
                    [
                        'id' => 'section_1',
                        'type' => 'section',
                        'title' => 'Halal Certification',
                        'fields' => [
                            [
                                'id' => 'certificate_valid',
                                'type' => 'checkbox',
                                'label' => 'Halal certificate is valid and current',
                                'required' => true
                            ],
                            [
                                'id' => 'expiry_date',
                                'type' => 'date',
                                'label' => 'Certificate expiry date',
                                'required' => true
                            ],
                            [
                                'id' => 'notes',
                                'type' => 'textarea',
                                'label' => 'Additional notes',
                                'required' => false
                            ]
                        ]
                    ]
                ],
                'section_id' => $section->id,
                'status_id' => $revisedStatus->id,
                'created_by_user_id' => $adminUser->id,
            ],
        ];

        foreach ($formTemplates as $template) {
            FormTemplate::create($template);
        }
    }
} 
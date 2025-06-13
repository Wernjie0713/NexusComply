<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComplianceStaticDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed status table
        $statuses = [
            ['id' => 1, 'name' => 'draft'],
            ['id' => 2, 'name' => 'submitted'],
            ['id' => 3, 'name' => 'revised'],
        ];

        foreach ($statuses as $status) {
            DB::table('status')->updateOrInsert(
                ['id' => $status['id']],
                ['name' => $status['name']]
            );
        }

        // Seed compliance categories
        $categories = [
            'Data Protection & Privacy',
            'Information Security',
            'Financial Compliance',
            'Healthcare Compliance',
            'Workplace & Labor Laws',
            'Environmental Compliance',
            'Trade Compliance',
            'Anti-Corruption & Ethics',
            'Industry-Specific Regulations',
            'Regulatory Reporting'
        ];

        foreach ($categories as $category) {
            DB::table('compliance_category')->updateOrInsert(
                ['name' => $category],
                ['name' => $category]
            );
        }
    }
} 
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
            ['id' => 4, 'name' => 'rejected'],
            ['id' => 5, 'name' => 'approved'],
            ['id' => 6, 'name' => 'pending']
        ];

        foreach ($statuses as $status) {
            DB::table('status')->updateOrInsert(
                ['id' => $status['id']],
                ['name' => $status['name']]
            );
        }

        // Seed compliance categories
        $categories = [
            'Food Safety & Hygiene',
            'Halal Compliance',
            'Occupational Safety & Health (OSH)',
            'Workplace & Employment Compliance',
            'Business Licensing & Permits',
            'Financial & Tax Compliance',
            'Environmental Management',
            'Data Protection & Security',
            'Maintenance & Asset Management',
            'Supply Chain & Vendor Management'
        ];

        foreach ($categories as $category) {
            DB::table('compliance_category')->updateOrInsert(
                ['name' => $category],
                ['name' => $category]
            );
        }
    }
} 
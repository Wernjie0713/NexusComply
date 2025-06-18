<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Silber\Bouncer\BouncerFacade as Bouncer;

class AbilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $abilities = [
            // User Management
            ['name' => 'create-users', 'title' => 'Create Users'],
            ['name' => 'view-users', 'title' => 'View Users'],
            ['name' => 'edit-users', 'title' => 'Edit Users'],
            ['name' => 'delete-users', 'title' => 'Delete Users'],

            // Audit Management
            ['name' => 'view-all-audits', 'title' => 'View All Audits'],
            ['name' => 'review-submitted-audits', 'title' => 'Review Submitted Audits'],
            ['name' => 'approve-audits', 'title' => 'Approve Audits'],
            ['name' => 'generate-audit-reports', 'title' => 'Generate Audit Reports'],

            // Compliance Framework
            ['name' => 'manage-compliance-categories', 'title' => 'Manage Compliance Categories'],
            ['name' => 'manage-forms', 'title' => 'Manage Forms'],
            ['name' => 'create-compliance-frameworks', 'title' => 'Create Compliance Frameworks'],

            // Settings
            ['name' => 'manage-roles-permissions', 'title' => 'Manage Roles & Permissions'],
            ['name' => 'modify-system-settings', 'title' => 'Modify System Settings'],
            ['name' => 'view-system-logs', 'title' => 'View System Activity'],
        ];

        foreach ($abilities as $ability) {
            Bouncer::ability()->firstOrCreate($ability);
        }
    }
}

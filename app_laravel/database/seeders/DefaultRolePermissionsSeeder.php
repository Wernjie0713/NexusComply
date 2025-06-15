<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Silber\Bouncer\BouncerFacade as Bouncer;
use App\Models\Role;

class DefaultRolePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Ensure roles exist before assigning permissions
        $adminRole = Role::where('name', 'admin')->first();
        $managerRole = Role::where('name', 'manager')->first();
        $outletUserRole = Role::where('name', 'outlet-user')->first();

        // Admin role already has everything granted by AdminUserSeeder, so no need to explicitly grant here

        if ($managerRole) {
            Bouncer::allow($managerRole)->to([
                // Audit Management
                'approve-audits',
                'review-submitted-audits',
                'generate-audit-reports',
                // User Management
                'view-users',
            ]);
        }

        if ($outletUserRole) {
            Bouncer::allow($outletUserRole)->to([
                // Audit Management
                'review-submitted-audits',
            ]);
        }

        // Refresh Bouncer's cache to apply changes
        Bouncer::refresh();
    }
}

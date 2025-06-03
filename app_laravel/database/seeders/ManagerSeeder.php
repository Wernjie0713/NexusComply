<?php

namespace Database\Seeders;

use App\Models\User; // Make sure to import your User model
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Silber\Bouncer\BouncerFacade as Bouncer; // Import Bouncer

class ManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the 'manager' role if it doesn't exist
        $managerRole = Bouncer::role()->firstOrCreate([
            'name' => 'manager', // Using a slug-like name
            'title' => 'Manager', // Human-readable title
        ]);

        // 2. Define some basic permissions for the Manager (example)
        // For now, let's say a Manager can view users and manage audits.
        // You'll define more specific abilities later.
        // Bouncer::allow($managerRole)->to('view-users');
        // Bouncer::allow($managerRole)->to('manage-audits');
        // For now, we can skip specific abilities if you're not ready,
        // or assign a placeholder ability if needed.
        // Let's create a placeholder ability for now.
        Bouncer::ability()->firstOrCreate(['name' => 'manage-regional-tasks', 'title' => 'Manage Regional Tasks']);
        Bouncer::allow($managerRole)->to('manage-regional-tasks');


        // 3. Create a sample Manager user if they don't exist
        $managerUser = User::firstOrCreate(
            ['email' => 'manager@example.com'], // Unique email for this user
            [
                'name' => 'Manager One',
                'password' => Hash::make('password'), //  Use a secure password in real scenarios
                'email_verified_at' => now(), // Auto-verify email for seeded user
                'role_id' => 'M-001'
            ]
        );

        // 4. Assign the 'manager' role to the user
        Bouncer::assign($managerRole)->to($managerUser);

        // 5. Refresh Bouncer's cache to apply changes
        Bouncer::refreshFor($managerUser);
        // Or globally: Bouncer::refresh();
    }
}
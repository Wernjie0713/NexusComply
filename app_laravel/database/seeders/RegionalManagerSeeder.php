<?php

namespace Database\Seeders;

use App\Models\User; // Make sure to import your User model
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Silber\Bouncer\BouncerFacade as Bouncer; // Import Bouncer

class RegionalManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the 'regional-manager' role if it doesn't exist
        $regionalManagerRole = Bouncer::role()->firstOrCreate([
            'name' => 'regional-manager', // Using a slug-like name
            'title' => 'Regional Manager', // Human-readable title
        ]);

        // 2. Define some basic permissions for the Regional Manager (example)
        // For now, let's say a Regional Manager can view users and manage audits.
        // You'll define more specific abilities later.
        // Bouncer::allow($regionalManagerRole)->to('view-users');
        // Bouncer::allow($regionalManagerRole)->to('manage-audits');
        // For now, we can skip specific abilities if you're not ready,
        // or assign a placeholder ability if needed.
        // Let's create a placeholder ability for now.
        Bouncer::ability()->firstOrCreate(['name' => 'manage-regional-tasks', 'title' => 'Manage Regional Tasks']);
        Bouncer::allow($regionalManagerRole)->to('manage-regional-tasks');


        // 3. Create a sample Regional Manager user if they don't exist
        $regionalManagerUser = User::firstOrCreate(
            ['email' => 'regional.manager@example.com'], // Unique email for this user
            [
                'name' => 'Regional Manager One',
                'password' => Hash::make('password'), //  Use a secure password in real scenarios
                'email_verified_at' => now(), // Auto-verify email for seeded user
            ]
        );

        // 4. Assign the 'regional-manager' role to the user
        Bouncer::assign($regionalManagerRole)->to($regionalManagerUser);

        // 5. Refresh Bouncer's cache to apply changes
        Bouncer::refreshFor($regionalManagerUser);
        // Or globally: Bouncer::refresh();
    }
}
<?php

namespace Database\Seeders;

use App\Models\User; // Make sure to import your User model
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Silber\Bouncer\BouncerFacade as Bouncer; // Import Bouncer

class OutletUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the 'outlet-user' role if it doesn't exist
        $outletUserRole = Bouncer::role()->firstOrCreate([
            'name' => 'outlet-user', // Using a slug-like name
            'title' => 'Outlet User', // Human-readable title
        ]);

        // 2. Define some basic permissions for the Outlet User (example)
        // These abilities would allow them to perform tasks on the mobile app.
        // You will define these more specifically as you build out features.
        // For now, let's create a few placeholder abilities.
        Bouncer::ability()->firstOrCreate(['name' => 'submit-compliance-forms', 'title' => 'Submit Compliance Forms']);
        Bouncer::ability()->firstOrCreate(['name' => 'upload-audit-documents', 'title' => 'Upload Audit Documents']);
        Bouncer::ability()->firstOrCreate(['name' => 'view-assigned-audits', 'title' => 'View Assigned Audits']);

        // Assign these placeholder abilities to the 'outlet-user' role
        Bouncer::allow($outletUserRole)->to('submit-compliance-forms');
        Bouncer::allow($outletUserRole)->to('upload-audit-documents');
        Bouncer::allow($outletUserRole)->to('view-assigned-audits');

        // 3. Create a sample Outlet User if they don't exist
        // Wrap user creation in withoutEvents to prevent activity logging
        User::withoutEvents(function () use ($outletUserRole) {
            $outletUserOne = User::firstOrCreate(
                ['email' => 'jgoh0338@gmail.com'], // Unique email for this user
                [
                    'name' => 'Goh Outlet', // Example name
                    'password' => Hash::make('12345'), // Use a secure password in real scenarios
                    'email_verified_at' => now(), // Auto-verify email for seeded user
                    'role_id' => 'O-022'
                    // You might add an 'outlet_id' or 'assigned_outlet_name' field here
                    // if your User model or a related table stores this information.
                    // For now, we'll keep it simple.
                ]
            );

            // 4. Assign the 'outlet-user' role to the user
            Bouncer::assign($outletUserRole)->to($outletUserOne);

            // 5. Refresh Bouncer's cache to apply changes
            Bouncer::refreshFor($outletUserOne);
        });
        
        // Or globally: Bouncer::refresh();
    }
}
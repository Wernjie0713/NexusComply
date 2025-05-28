<?php

namespace Database\Seeders;

use App\Models\User; // Make sure to import your User model
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Silber\Bouncer\BouncerFacade as Bouncer; // Import Bouncer

class OutletManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the 'outlet-manager' role if it doesn't exist
        $outletManagerRole = Bouncer::role()->firstOrCreate([
            'name' => 'outlet-manager', // Using a slug-like name
            'title' => 'Outlet Manager', // Human-readable title
        ]);

        // 2. Define some basic permissions for the Outlet Manager (example)
        // These abilities would allow them to perform tasks on the mobile app.
        // You will define these more specifically as you build out features.
        // For now, let's create a few placeholder abilities.
        Bouncer::ability()->firstOrCreate(['name' => 'submit-compliance-forms', 'title' => 'Submit Compliance Forms']);
        Bouncer::ability()->firstOrCreate(['name' => 'upload-audit-documents', 'title' => 'Upload Audit Documents']);
        Bouncer::ability()->firstOrCreate(['name' => 'view-assigned-audits', 'title' => 'View Assigned Audits']);

        // Assign these placeholder abilities to the 'outlet-manager' role
        Bouncer::allow($outletManagerRole)->to('submit-compliance-forms');
        Bouncer::allow($outletManagerRole)->to('upload-audit-documents');
        Bouncer::allow($outletManagerRole)->to('view-assigned-audits');

        // 3. Create a sample Outlet Manager user if they don't exist
        $outletManagerUserOne = User::firstOrCreate(
            ['email' => 'outlet.manager@example.com'], // Unique email for this user
            [
                'name' => 'Outlet Manager', // Example name
                'password' => Hash::make('password'), // Use a secure password in real scenarios
                'email_verified_at' => now(), // Auto-verify email for seeded user
                // You might add an 'outlet_id' or 'assigned_outlet_name' field here
                // if your User model or a related table stores this information.
                // For now, we'll keep it simple.
            ]
        );

        // 4. Assign the 'outlet-manager' role to the user
        Bouncer::assign($outletManagerRole)->to($outletManagerUserOne);

        // 5. Refresh Bouncer's cache to apply changes for these users
        Bouncer::refreshFor($outletManagerUserOne);
        // Or globally if you prefer: Bouncer::refresh();
    }
}
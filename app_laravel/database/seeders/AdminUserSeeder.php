<?php

namespace Database\Seeders;

use App\Models\User;
use Silber\Bouncer\BouncerFacade as Bouncer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the admin role if it doesn't exist
        $role = Bouncer::role()->firstOrCreate([
            'name' => 'admin',
            'title' => 'Administrator',
        ]);

        // Grant all permissions to the admin role
        Bouncer::allow('admin')->everything();

        // Create the default admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign the admin role to the user
        Bouncer::assign('admin')->to($admin);

        // Ensure the cache is cleared
        Bouncer::refresh();
    }
}

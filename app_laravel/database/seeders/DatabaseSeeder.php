<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the admin seeder first to ensure roles exist
        $this->call([
            AdminUserSeeder::class,
            ManagerSeeder::class,
            OutletUserSeeder::class,
            DemoDataSeeder::class,
            ComplianceStaticDataSeeder::class,
            RoleDescriptionSeeder::class,
            SectionSeeder::class,
            AbilitySeeder::class,
            DefaultRolePermissionsSeeder::class,
        ]);
    }
}

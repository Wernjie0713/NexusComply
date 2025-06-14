<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleDescriptionSeeder extends Seeder
{
    public function run()
    {
        DB::table('roles')->where('name', 'admin')->update([
            'description' => 'Full system access with all permissions',
        ]);
        DB::table('roles')->where('name', 'manager')->update([
            'description' => 'Manages a region of outlets and their compliance',
        ]);
        DB::table('roles')->where('name', 'outlet-user')->update([
            'description' => 'Manages a single outlet and submits compliance documentation',
        ]);
        DB::table('roles')->where('name', 'external_auditor')->update([
            'description' => 'External user who can review specific assigned compliance documents',
        ]);
    }
}

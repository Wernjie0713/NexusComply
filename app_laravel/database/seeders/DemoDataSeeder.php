<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Outlet;
use App\Support\MalaysianDataProvider;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Bouncer;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create outlets first
        $this->createOutlets();
        
        // Create managers
        $this->createManagers();
        
        // Create outlet users
        $this->createOutletUsers();
    }

    private function createOutlets(): void
    {
        $outlets = [];
        for ($i = 0; $i < 20; $i++) {
            $addressInfo = MalaysianDataProvider::generateAddress();
            $outlets[] = [
                'name' => MalaysianDataProvider::generateOutletName(),
                'address' => $addressInfo['address'],
                'city' => $addressInfo['city'],
                'state' => $addressInfo['state'],
                'postal_code' => $addressInfo['postcode'],
                'phone_number' => MalaysianDataProvider::generatePhoneNumber(),
                'operating_hours_info' => json_encode(MalaysianDataProvider::generateOperatingHours()),
                'is_active' => true,
                'outlet_user_role_id' => null,
                'manager_role_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert in chunks to be more efficient
        foreach (array_chunk($outlets, 5) as $chunk) {
            Outlet::insert($chunk);
        }
    }

    private function createManagers(): void
    {
        $managers = [
            [
                'name' => MalaysianDataProvider::generateMalaysianName(false), // Male
                'email' => 'manager.one@nexuscomply.app',
            ],
            [
                'name' => MalaysianDataProvider::generateMalaysianName(true), // Female
                'email' => 'manager.two@nexuscomply.app',
            ]
        ];

        foreach ($managers as $managerData) {
            $roleId = $this->generateUniqueRoleId('M');
            
            $manager = User::create([
                'name' => $managerData['name'],
                'email' => $managerData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $roleId,
            ]);

            // Assign Bouncer role
            $manager->assign('manager');
        }
    }

    private function createOutletUsers(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            $roleId = $this->generateUniqueRoleId('O');
            $isFemale = (bool)rand(0, 1);
            
            $user = User::create([
                'name' => MalaysianDataProvider::generateMalaysianName($isFemale),
                'email' => sprintf('outletuser%02d@nexuscomply.app', $i),
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $roleId,
            ]);

            // Assign Bouncer role
            $user->assign('outlet-user');
        }
    }

    private function generateUniqueRoleId(string $prefix): string
    {
        $lastId = DB::table('users')
            ->where('role_id', 'like', $prefix . '-%')
            ->orderByRaw('CAST(SUBSTRING(role_id FROM 3) AS INTEGER) DESC')
            ->value('role_id');

        if (!$lastId) {
            return $prefix . '-001';
        }

        $lastNumber = (int)substr($lastId, 2);
        $newNumber = $lastNumber + 1;
        
        return sprintf('%s-%03d', $prefix, $newNumber);
    }
} 
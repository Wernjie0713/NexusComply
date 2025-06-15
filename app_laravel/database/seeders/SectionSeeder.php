<?php

namespace Database\Seeders;

use App\Models\Section;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            ['name' => 'Documentation'],
            ['name' => 'Product'],
            ['name' => 'Worker'],
            ['name' => 'Premise (Production & Warehouse)'],
            ['name' => 'Premise'],
            ['name' => 'Raw Material (Receiving, Handling, Storage)'],
            ['name' => 'Utensil, Machine, Cleaning Tools &  Others Related'],
            ['name' => 'Sanitation'],
            ['name' => 'Others'],
        ];

        foreach ($sections as $section) {
            Section::create($section);
        }
    }
}

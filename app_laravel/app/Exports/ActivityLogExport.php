<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ActivityLogExport implements FromCollection, WithHeadings, WithMapping
{
    protected $activities;

    public function __construct($activities)
    {
        $this->activities = $activities;
    }

    public function collection()
    {
        return $this->activities;
    }

    public function headings(): array
    {
        return [
            'No.',
            'Date/Time',
            'Action Type',
            'Target Type',
            'Details',
            'User',
        ];
    }

    public function map($activity): array
    {
        static $row = 0;
        $row++;
        return [
            $row,
            optional($activity->created_at)->format('m/d/Y H:i:s'),
            ucfirst($activity->action_type),
            ucfirst($activity->target_type),
            $activity->details,
            $activity->user ? ($activity->user->name . ' (' . $activity->user->email . ')') : 'System',
        ];
    }
} 
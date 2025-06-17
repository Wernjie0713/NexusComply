<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'action_type',
        'target_type',
        'details',
        'user_id',
        'created_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public $timestamps = false; // Disable timestamps since we only have created_at

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 
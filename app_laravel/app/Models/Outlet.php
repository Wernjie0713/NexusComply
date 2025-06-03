<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Outlet extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'address',
        'city',
        'state',
        'postal_code',
        'phone_number',
        'operating_hours_info',
        'outlet_user_id',
        'manager_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'operating_hours_info' => 'array',
    ];

    /**
     * Get the outlet user associated with the outlet.
     */
    public function outletUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'outlet_user_id');
    }

    /**
     * Get the manager associated with the outlet.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
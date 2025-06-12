<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'status';

    protected $fillable = [
        'name',
        'description',
    ];

    public function audits()
    {
        return $this->hasMany(Audit::class, 'status_id');
    }
} 
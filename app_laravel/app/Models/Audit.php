<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    use HasFactory;

    protected $table = 'audit';

    protected $fillable = [
        'outlet_id',
        'user_id',
        'status_id',
        'start_time',
        'end_time',
        'notes',
        'progress',
        'compliance_id',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function complianceRequirement()
    {
        return $this->belongsTo(ComplianceRequirement::class, 'compliance_id');
    }

    public function auditForms()
    {
        return $this->hasMany(AuditForm::class, 'audit_id');
    }
} 
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
        return $this->belongsToMany(AuditForm::class, 'audit_audit_form', 'audit_id', 'audit_form_id');
    }

    public function auditVersions()
    {
        return $this->hasMany(AuditVersion::class, 'audit_id');
    }

    public function firstAuditVersions()
    {
        return $this->hasMany(AuditVersion::class, 'first_audit_id');
    }

    /**
     * Get the latest version of this audit
     */
    public function getLatestVersion()
    {
        $latestVersion = AuditVersion::getLatestVersion($this->id);
        return $latestVersion ? $latestVersion->audit : $this;
    }

    /**
     * Check if this audit has versions
     */
    public function hasVersions()
    {
        return $this->firstAuditVersions()->exists();
    }

    /**
     * Get the version number of this audit
     */
    public function getVersionNumber()
    {
        $version = $this->auditVersions()->first();
        return $version ? $version->audit_version : 1;
    }
} 
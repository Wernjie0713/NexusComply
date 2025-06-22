<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditVersion extends Model
{
    use HasFactory;

    protected $table = 'audit_version';

    protected $fillable = [
        'audit_id',
        'first_audit_id',
        'audit_version'
    ];

    public function audit()
    {
        return $this->belongsTo(Audit::class, 'audit_id');
    }

    public function firstAudit()
    {
        return $this->belongsTo(Audit::class, 'first_audit_id');
    }

    /**
     * Get the latest version for a given first_audit_id
     */
    public static function getLatestVersion($firstAuditId)
    {
        return self::where('first_audit_id', $firstAuditId)
                   ->orderBy('audit_version', 'desc')
                   ->first();
    }

    /**
     * Get all versions for a given first_audit_id
     */
    public static function getAllVersions($firstAuditId)
    {
        return self::where('first_audit_id', $firstAuditId)
                   ->orderBy('audit_version', 'asc')
                   ->get();
    }
} 
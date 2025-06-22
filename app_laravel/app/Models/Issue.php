<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    use HasFactory;

    protected $table = 'issue';

    protected $fillable = [
        'description',
        'severity',
        'due_date',
        'audit_form_id',
        'status_id'
    ];

    protected $casts = [
        'due_date' => 'date'
    ];

    public function auditForm()
    {
        return $this->belongsTo(AuditForm::class, 'audit_form_id');
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function correctiveActions()
    {
        return $this->hasMany(CorrectiveAction::class);
    }
} 
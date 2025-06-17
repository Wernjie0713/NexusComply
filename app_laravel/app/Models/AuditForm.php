<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditForm extends Model
{
    use HasFactory;

    protected $table = 'audit_form';

    protected $fillable = [
        'name',
        'value',
        'audit_id',
        'form_id',
        'status_id'
    ];

    protected $casts = [
        'value' => 'array'
    ];

    public function audit()
    {
        return $this->belongsTo(Audit::class);
    }

    public function formTemplate()
    {
        return $this->belongsTo(FormTemplate::class, 'form_id');
    }
} 
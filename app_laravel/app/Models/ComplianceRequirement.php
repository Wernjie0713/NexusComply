<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ComplianceRequirement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'category_id',
        'submission_type',
        'document_upload_instructions',
        'frequency',
        'is_active',
        'created_by_user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the form templates associated with the compliance requirement.
     */
    public function formTemplates(): BelongsToMany
    {
        return $this->belongsToMany(FormTemplate::class, 'compliance_requirement_form_template');
    }

    /**
     * Get the user who created the compliance requirement.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get the category of the compliance requirement.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ComplianceCategory::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComplianceCategory extends Model
{
    use HasFactory;

    protected $table = 'compliance_category';

    protected $fillable = [
        'name',
    ];

    /**
     * Get the compliance requirements for this category.
     */
    public function complianceRequirements(): HasMany
    {
        return $this->hasMany(ComplianceRequirement::class, 'category_id');
    }
} 
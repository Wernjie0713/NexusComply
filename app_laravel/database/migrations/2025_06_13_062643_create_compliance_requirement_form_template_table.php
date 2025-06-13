<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compliance_requirement_form_template', function (Blueprint $table) {
            $table->foreignId('compliance_requirement_id')->constrained()->onDelete('cascade');
            $table->foreignId('form_template_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->primary(['compliance_requirement_id', 'form_template_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_requirement_form_template');
    }
};

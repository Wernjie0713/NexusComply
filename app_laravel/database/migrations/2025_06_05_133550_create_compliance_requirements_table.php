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
        Schema::create('compliance_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('submission_type'); // 'form_template', 'document_upload_only'
            $table->foreignId('form_template_id')->nullable()->constrained('form_templates')->nullOnDelete();
            $table->text('document_upload_instructions')->nullable();
            $table->string('frequency')->nullable(); // 'Daily', 'Weekly', 'Monthly', etc.
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_requirements');
    }
};

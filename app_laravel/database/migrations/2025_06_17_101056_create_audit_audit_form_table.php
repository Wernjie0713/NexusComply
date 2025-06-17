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
        Schema::create('audit_audit_form', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_id')->constrained('audit')->onDelete('cascade');
            $table->foreignId('audit_form_id')->constrained('audit_form')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_audit_form');
    }
};

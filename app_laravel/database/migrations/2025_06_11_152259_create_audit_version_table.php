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
        Schema::create('audit_version', function (Blueprint $table) {
            $table->unsignedBigInteger('audit_id');
            $table->unsignedBigInteger('first_audit_id');
            $table->unsignedBigInteger('audit_version');

            // Composite primary key
            $table->primary(['first_audit_id', 'audit_version']);

            // Foreign keys
            $table->foreign('audit_id')->references('id')->on('audit')->onDelete('cascade');
            $table->foreign('first_audit_id')->references('id')->on('audit')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_version');
    }
};

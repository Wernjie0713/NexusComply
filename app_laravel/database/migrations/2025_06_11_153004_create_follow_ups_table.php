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
        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unsignedBigInteger('latest_audit_id');
            $table->unsignedBigInteger('status_id');

            $table->foreign('latest_audit_id')->references('id')->on('audit')->onDelete('cascade');
            $table->foreign('status_id')->references('id')->on('status')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follow_ups');
    }
};

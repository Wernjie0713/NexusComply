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
        Schema::create('corrective_actions', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->date('completion_date')->nullable();
            $table->date('verification_date')->nullable();
            $table->timestamps();

            $table->unsignedBigInteger('issue_id');
            $table->unsignedBigInteger('status_id');

            $table->foreign('issue_id')->references('id')->on('issue')->onDelete('cascade');
            $table->foreign('status_id')->references('id')->on('status')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corrective_actions');
    }
};

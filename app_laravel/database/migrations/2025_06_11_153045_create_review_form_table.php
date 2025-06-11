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
        Schema::create('review_form', function (Blueprint $table) {
            $table->id();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unsignedBigInteger('review_user_id');
            $table->unsignedBigInteger('form_id');

            $table->foreign('review_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('form_id')->references('id')->on('form_templates')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_form');
    }
};

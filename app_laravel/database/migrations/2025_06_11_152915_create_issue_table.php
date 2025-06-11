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
        Schema::create('issue', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->string('severity');
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->unsignedBigInteger('audit_form_id');
            $table->unsignedBigInteger('status_id');

            $table->foreign('audit_form_id')->references('id')->on('audit_form')->onDelete('cascade');
            $table->foreign('status_id')->references('id')->on('status')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue');
    }
};

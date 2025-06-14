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
        Schema::table('audit', function (Blueprint $table) {
            $table->unsignedBigInteger('compliance_id')->nullable()->after('id');
            $table->foreign('compliance_id')->references('id')->on('compliance_requirements')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit', function (Blueprint $table) {
            $table->dropForeign(['compliance_id']);
            $table->dropColumn('compliance_id');
        });
    }
};

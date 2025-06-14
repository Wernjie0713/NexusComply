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
            $table->timestamp('due_date')->nullable()->after('compliance_id'); // or any column you prefer
        });

        Schema::table('compliance_requirements', function (Blueprint $table) {
            $table->timestamp('due_date')->nullable()->after('id'); // adjust the position as needed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });

        Schema::table('compliance_requirements', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });
    }
};

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
        Schema::table('form_templates', function (Blueprint $table) {
            // Drop the existing status column
            $table->dropColumn('status');
            
            // Add the new status_id foreign key
            $table->foreignId('status_id')
                  ->after('structure')
                  ->constrained('status')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_templates', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
            
            // Add back the original status column
            $table->string('status')->after('structure');
        });
    }
}; 
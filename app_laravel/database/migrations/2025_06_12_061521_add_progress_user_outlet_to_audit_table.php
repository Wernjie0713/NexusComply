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
            $table->integer('progress')->default(0)->after('notes');

            $table->foreignId('user_id')
                ->after('progress')
                ->constrained('users')
                ->onDelete('restrict');

            $table->foreignId('outlet_id')
                ->after('user_id')
                ->constrained('outlets')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['outlet_id']);
            $table->dropColumn(['progress', 'user_id', 'outlet_id']);
        });
    }
};

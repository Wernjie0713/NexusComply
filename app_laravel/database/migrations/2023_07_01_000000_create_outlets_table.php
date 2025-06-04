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
        Schema::create('outlets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('phone_number')->nullable();
            // Use JSONB for PostgreSQL, JSON for MySQL, fallback to text for others
            if (Schema::getConnection()->getDriverName() === 'pgsql') {
                $table->jsonb('operating_hours_info')->nullable()->comment('Outlet operating hours as JSONB');
            } elseif (Schema::getConnection()->getDriverName() === 'mysql') {
                $table->json('operating_hours_info')->nullable()->comment('Outlet operating hours as JSON');
            } else {
                $table->text('operating_hours_info')->nullable()->comment('Outlet operating hours as serialized text');
            }
            $table->string('outlet_user_role_id')->nullable();
            $table->string('manager_role_id')->nullable();
            $table->foreign('outlet_user_role_id')->references('role_id')->on('users')->onDelete('set null');
            $table->foreign('manager_role_id')->references('role_id')->on('users')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outlets');
    }
};
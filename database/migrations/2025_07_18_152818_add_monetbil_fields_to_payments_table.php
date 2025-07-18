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
        Schema::table('payments', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('payment_reference')->nullable()->unique();
            $table->string('monetbil_service_key')->nullable();
            $table->text('monetbil_payment_url')->nullable();
            $table->string('phone')->nullable();
            $table->integer('premium_duration')->nullable();
            
            // Index pour améliorer les performances
            $table->index('payment_reference');
            $table->index('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['payment_reference']);
            $table->dropIndex(['phone']);
            $table->dropColumn([
                'description',
                'payment_reference',
                'monetbil_service_key',
                'monetbil_payment_url',
                'phone',
                'premium_duration'
            ]);
        });
    }
};
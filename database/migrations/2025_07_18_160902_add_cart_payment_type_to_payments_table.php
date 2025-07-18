<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pour PostgreSQL, on doit modifier l'enum
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement("ALTER TYPE payments_type_enum ADD VALUE 'cart_payment'");
        } else {
            // Pour MySQL et autres
            Schema::table('payments', function (Blueprint $table) {
                $table->enum('type', ['sound', 'event', 'cart_payment'])->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Pour PostgreSQL, on ne peut pas facilement supprimer une valeur d'enum
        // Nous gardons la valeur pour éviter les erreurs
        if (DB::connection()->getDriverName() !== 'pgsql') {
            Schema::table('payments', function (Blueprint $table) {
                $table->enum('type', ['sound', 'event'])->change();
            });
        }
    }
};
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
        Schema::table('payments', function (Blueprint $table) {
            // Ajouter la colonne competition_id d'abord
            $table->foreignId('competition_id')->nullable()->constrained()->onDelete('cascade')->after('event_id');

            // Ajouter un index pour optimiser les requêtes
            $table->index(['competition_id', 'status']);
        });

        // Modifier l'enum type de manière sécurisée pour PostgreSQL
        DB::statement("ALTER TABLE payments DROP CONSTRAINT payments_type_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_type_check CHECK (type IN ('sound', 'event', 'competition_entry'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Supprimer la colonne competition_id et son index
            $table->dropIndex(['competition_id', 'status']);
            $table->dropForeign(['competition_id']);
            $table->dropColumn('competition_id');
        });

        // Remettre l'ancien enum
        DB::statement("ALTER TABLE payments DROP CONSTRAINT payments_type_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_type_check CHECK (type IN ('sound', 'event'))");
    }
};

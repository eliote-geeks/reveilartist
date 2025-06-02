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
        Schema::table('clip_likes', function (Blueprint $table) {
            // Ajouter les colonnes manquantes
            if (!Schema::hasColumn('clip_likes', 'clip_id')) {
                $table->foreignId('clip_id')->constrained()->onDelete('cascade');
            }

            if (!Schema::hasColumn('clip_likes', 'user_id')) {
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
            }
        });

        // Ajouter les contraintes et index après avoir ajouté les colonnes
        Schema::table('clip_likes', function (Blueprint $table) {
            try {
                // Contrainte unique pour éviter les doublons
                $table->unique(['clip_id', 'user_id']);

                // Index pour les performances
                $table->index(['user_id']);
                $table->index(['clip_id']);
            } catch (\Exception $e) {
                // Les index peuvent déjà exister
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clip_likes', function (Blueprint $table) {
            // Supprimer les index et contraintes
            try {
                $table->dropUnique(['clip_id', 'user_id']);
                $table->dropIndex(['user_id']);
                $table->dropIndex(['clip_id']);
            } catch (\Exception $e) {
                // Ignorer si les index n'existent pas
            }

            // Supprimer les colonnes
            if (Schema::hasColumn('clip_likes', 'clip_id')) {
                $table->dropForeign(['clip_id']);
                $table->dropColumn('clip_id');
            }

            if (Schema::hasColumn('clip_likes', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};

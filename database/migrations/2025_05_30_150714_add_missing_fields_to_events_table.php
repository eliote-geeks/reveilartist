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
        Schema::table('events', function (Blueprint $table) {
            // Champs manquants pour le contrôleur (seulement ceux qui n'existent pas)
            $table->string('location')->nullable()->after('venue'); // Nom du lieu
            $table->string('featured_image')->nullable()->after('poster_image'); // Image principale
            $table->decimal('price_min', 10, 2)->nullable()->after('ticket_price'); // Prix minimum
            $table->decimal('price_max', 10, 2)->nullable()->after('price_min'); // Prix maximum
            $table->integer('capacity')->nullable()->after('max_attendees'); // Capacité
            $table->integer('views_count')->default(0)->after('current_attendees'); // Compteur de vues
            $table->string('artist')->nullable()->after('views_count'); // Artiste principal
            $table->json('tickets')->nullable()->after('artists'); // Types de billets
            $table->boolean('featured')->default(false)->after('is_featured'); // Événement en vedette
            $table->string('website_url')->nullable()->after('contact_email');
            $table->string('facebook_url')->nullable()->after('website_url');
            $table->string('instagram_url')->nullable()->after('facebook_url');
            $table->string('twitter_url')->nullable()->after('instagram_url');
            $table->json('social_links')->nullable()->after('twitter_url'); // Liens réseaux sociaux
            $table->softDeletes()->after('twitter_url'); // Pour la suppression douce
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'location',
                'featured_image',
                'price_min',
                'price_max',
                'capacity',
                'views_count',
                'artist',
                'tickets',
                'featured',
                'website_url',
                'facebook_url',
                'instagram_url',
                'twitter_url',
                'social_links'
            ]);
            $table->dropSoftDeletes();
        });
    }
};

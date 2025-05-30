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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Organisateur
            $table->string('venue'); // Lieu de l'événement
            $table->string('address'); // Adresse complète
            $table->string('city');
            $table->string('country')->default('Cameroun');
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('poster_image')->nullable(); // Affiche de l'événement
            $table->json('gallery_images')->nullable(); // Galerie d'images
            $table->enum('category', ['concert', 'festival', 'showcase', 'workshop', 'conference', 'party']);
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_free')->default(false);
            $table->decimal('ticket_price', 10, 2)->nullable(); // Prix du billet
            $table->integer('max_attendees')->nullable(); // Capacité maximale
            $table->integer('current_attendees')->default(0);
            $table->json('artists')->nullable(); // Liste des artistes participants
            $table->json('sponsors')->nullable(); // Sponsors de l'événement
            $table->text('requirements')->nullable(); // Exigences (âge, dress code, etc.)
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('website_url')->nullable();
            $table->json('social_links')->nullable(); // Liens réseaux sociaux
            $table->timestamps();

            // Index pour les recherches
            $table->index(['status', 'event_date']);
            $table->index(['city', 'status']);
            $table->index(['category', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

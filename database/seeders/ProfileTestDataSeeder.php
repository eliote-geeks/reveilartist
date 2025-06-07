<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Sound;
use App\Models\Event;
use App\Models\Category;
use App\Models\Payment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ProfileTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer des catégories si elles n'existent pas
        $categories = [
            ['name' => 'Hip-Hop', 'description' => 'Musique Hip-Hop'],
            ['name' => 'Afrobeat', 'description' => 'Musique Afrobeat'],
            ['name' => 'R&B', 'description' => 'Rhythm and Blues'],
            ['name' => 'Pop', 'description' => 'Musique Pop'],
            ['name' => 'Jazz', 'description' => 'Musique Jazz'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }

        // Créer un utilisateur de test
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Utilisateur Test',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
                'role' => 'artist',
                'status' => 'active',
                'bio' => 'Artiste passionné de musique urbaine et créateur de contenus musicaux.',
                'location' => 'Douala, Cameroun',
                'phone' => '+237123456789',
            ]
        );

        // Créer d'autres artistes
        $artists = [];
        for ($i = 1; $i <= 5; $i++) {
            $artists[] = User::firstOrCreate(
                ['email' => "artist{$i}@example.com"],
                [
                    'name' => "Artiste {$i}",
                    'email' => "artist{$i}@example.com",
                    'password' => Hash::make('password'),
                    'role' => 'artist',
                    'status' => 'active',
                    'bio' => "Bio de l'artiste {$i}",
                    'location' => 'Yaoundé, Cameroun',
                ]
            );
        }

        // Créer des sons pour l'utilisateur test
        $userSounds = [];
        $soundTitles = [
            'Beat Afro Moderne',
            'Instrumental Hip-Hop',
            'Mélodie R&B Douce',
            'Rythme Afrobeat',
            'Son Pop Énergique'
        ];

        foreach ($soundTitles as $index => $title) {
            $sound = Sound::firstOrCreate(
                ['title' => $title, 'user_id' => $user->id],
                [
                    'title' => $title,
                    'description' => "Description du son {$title}",
                    'user_id' => $user->id,
                    'category_id' => Category::inRandomOrder()->first()->id,
                    'file_path' => "sounds/test_sound_" . ($index + 1) . ".mp3",
                    'cover_image' => "covers/test_cover_" . ($index + 1) . ".jpg",
                    'duration' => rand(120, 300), // 2-5 minutes
                    'price' => rand(0, 1) ? rand(500, 5000) : 0, // Gratuit ou payant
                    'is_free' => rand(0, 1),
                    'status' => ['published', 'pending', 'draft'][rand(0, 2)],
                    'genre' => ['Hip-Hop', 'Afrobeat', 'R&B', 'Pop'][rand(0, 3)],
                    'bpm' => rand(80, 140),
                    'plays_count' => rand(10, 1000),
                    'likes_count' => rand(5, 100),
                    'downloads_count' => rand(0, 50),
                ]
            );
            $userSounds[] = $sound;
        }

        // Créer des sons d'autres artistes
        $otherSounds = [];
        foreach ($artists as $artist) {
            for ($i = 1; $i <= 3; $i++) {
                $sound = Sound::firstOrCreate(
                    ['title' => "Son {$i} de {$artist->name}", 'user_id' => $artist->id],
                    [
                        'title' => "Son {$i} de {$artist->name}",
                        'description' => "Description du son {$i}",
                        'user_id' => $artist->id,
                        'category_id' => Category::inRandomOrder()->first()->id,
                        'file_path' => "sounds/artist_{$artist->id}_sound_{$i}.mp3",
                        'cover_image' => "covers/artist_{$artist->id}_cover_{$i}.jpg",
                        'duration' => rand(120, 300),
                        'price' => rand(1000, 8000),
                        'is_free' => false,
                        'status' => 'published',
                        'genre' => ['Hip-Hop', 'Afrobeat', 'R&B', 'Pop'][rand(0, 3)],
                        'bpm' => rand(80, 140),
                        'plays_count' => rand(50, 2000),
                        'likes_count' => rand(10, 200),
                        'downloads_count' => rand(5, 100),
                    ]
                );
                $otherSounds[] = $sound;
            }
        }

        // Créer des événements pour l'utilisateur test
        $eventTitles = [
            'Concert Afrobeat Live',
            'Soirée Hip-Hop Underground',
            'Festival de Musique Urbaine'
        ];

        foreach ($eventTitles as $index => $title) {
            Event::firstOrCreate(
                ['title' => $title, 'user_id' => $user->id],
                [
                    'title' => $title,
                    'description' => "Description de l'événement {$title}",
                    'user_id' => $user->id,
                    'category' => ['concert', 'festival', 'showcase', 'workshop', 'conference', 'party', 'soiree'][rand(0, 6)],
                    'event_date' => now()->addDays(rand(1, 90)),
                    'start_time' => '20:00:00',
                    'end_time' => '23:59:00',
                    'location' => ['Douala', 'Yaoundé', 'Bafoussam'][rand(0, 2)] . ', Cameroun',
                    'city' => ['Douala', 'Yaoundé', 'Bafoussam'][rand(0, 2)],
                    'ticket_price' => rand(2000, 15000),
                    'max_attendees' => rand(50, 500),
                    'status' => 'published',
                                            'cover_image' => "events/test_event_" . ($index + 1) . ".jpg",
                ]
            );
        }

        // Créer des événements d'autres organisateurs
        $otherEvents = [];
        foreach ($artists as $artist) {
            $event = Event::firstOrCreate(
                ['title' => "Événement de {$artist->name}", 'user_id' => $artist->id],
                [
                    'title' => "Événement de {$artist->name}",
                    'description' => "Description de l'événement",
                    'user_id' => $artist->id,
                    'category' => ['concert', 'festival', 'showcase', 'workshop', 'conference', 'party', 'soiree'][rand(0, 6)],
                    'event_date' => now()->addDays(rand(1, 60)),
                    'start_time' => '19:00:00',
                    'end_time' => '23:00:00',
                    'location' => 'Yaoundé, Cameroun',
                    'city' => 'Yaoundé',
                    'ticket_price' => rand(3000, 12000),
                    'max_attendees' => rand(100, 300),
                    'status' => 'published',
                    'cover_image' => "events/artist_{$artist->id}_event.jpg",
                ]
            );
            $otherEvents[] = $event;
        }

        // Créer des paiements (achats) pour l'utilisateur test
        $purchasedSounds = collect($otherSounds)->random(5);
        foreach ($purchasedSounds as $sound) {
            Payment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'sound_id' => $sound->id,
                    'type' => 'sound'
                ],
                [
                    'user_id' => $user->id,
                    'seller_id' => $sound->user_id,
                    'sound_id' => $sound->id,
                    'type' => 'sound',
                    'amount' => $sound->price,
                                         'seller_amount' => $sound->price * 0.85, // 15% de commission
                    'commission_amount' => $sound->price * 0.15,
                    'commission_rate' => 15.00,
                    'status' => 'completed',
                    'payment_method' => 'card',
                    'payment_provider' => 'stripe',
                    'transaction_id' => 'TXN_' . time() . '_' . rand(1000, 9999),
                    'paid_at' => now()->subDays(rand(1, 30)),
                ]
            );
        }

        // Créer des paiements pour des événements
        $purchasedEvents = collect($otherEvents)->random(2);
        foreach ($purchasedEvents as $event) {
            Payment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'type' => 'event'
                ],
                [
                    'user_id' => $user->id,
                    'seller_id' => $event->user_id,
                    'event_id' => $event->id,
                    'type' => 'event',
                                        'amount' => $event->ticket_price,
                    'seller_amount' => $event->ticket_price * 0.90, // 10% de commission
                    'commission_amount' => $event->ticket_price * 0.10,
                    'commission_rate' => 10.00,
                    'status' => 'completed',
                    'payment_method' => 'mobile_money',
                    'payment_provider' => 'orange_money',
                    'transaction_id' => 'TXN_' . time() . '_' . rand(1000, 9999),
                    'paid_at' => now()->subDays(rand(1, 15)),
                ]
            );
        }

        // Créer des ventes pour l'utilisateur test (revenus)
        foreach ($userSounds as $sound) {
            if (!$sound->is_free) {
                // Simuler quelques ventes
                $salesCount = rand(1, 10);
                for ($i = 0; $i < $salesCount; $i++) {
                    $buyer = $artists[rand(0, count($artists) - 1)];
                    Payment::firstOrCreate(
                        [
                            'user_id' => $buyer->id,
                            'seller_id' => $user->id,
                            'sound_id' => $sound->id,
                            'type' => 'sound'
                        ],
                        [
                            'user_id' => $buyer->id,
                            'seller_id' => $user->id,
                            'sound_id' => $sound->id,
                            'type' => 'sound',
                            'amount' => $sound->price,
                            'seller_amount' => $sound->price * 0.85,
                            'commission_amount' => $sound->price * 0.15,
                            'commission_rate' => 15.00,
                            'status' => 'completed',
                            'payment_method' => 'card',
                            'payment_provider' => 'stripe',
                            'transaction_id' => 'TXN_' . time() . '_' . rand(1000, 9999),
                            'paid_at' => now()->subDays(rand(1, 60)),
                        ]
                    );
                }
            }
        }

        // Ajouter des sons favoris
        $favoriteSounds = collect($otherSounds)->random(8);
        foreach ($favoriteSounds as $sound) {
            DB::table('favorite_sounds')->insertOrIgnore([
                'user_id' => $user->id,
                'sound_id' => $sound->id,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ]);
        }

        // Ajouter des followers/following
        foreach ($artists as $artist) {
            // L'utilisateur test suit quelques artistes
            if (rand(0, 1)) {
                DB::table('user_follows')->insertOrIgnore([
                    'follower_id' => $user->id,
                    'followed_id' => $artist->id,
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now()->subDays(rand(1, 60)),
                ]);
            }

            // Quelques artistes suivent l'utilisateur test
            if (rand(0, 1)) {
                DB::table('user_follows')->insertOrIgnore([
                    'follower_id' => $artist->id,
                    'followed_id' => $user->id,
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now()->subDays(rand(1, 60)),
                ]);
            }
        }

        $this->command->info('Données de test créées avec succès !');
        $this->command->info("Utilisateur de test : {$user->email} / password");
        $this->command->info("Sons créés : " . $userSounds->count());
        $this->command->info("Paiements créés : " . Payment::where('user_id', $user->id)->count());
        $this->command->info("Favoris ajoutés : " . DB::table('favorite_sounds')->where('user_id', $user->id)->count());
    }
}

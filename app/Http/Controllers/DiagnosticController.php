<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sound;
use App\Models\Event;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DiagnosticController extends Controller
{
    public function testSounds()
    {
        try {
            Log::info('=== TEST SONS DIAGNOSTIC ===');

            // Test 1: Compter les sons
            $soundsCount = Sound::count();
            Log::info("Nombre total de sons: $soundsCount");

            // Test 2: Sons avec utilisateur et catégorie
            $soundsWithRelations = Sound::with(['user', 'category'])->count();
            Log::info("Sons avec relations chargées: $soundsWithRelations");

            // Test 3: Test des accesseurs
            $sound = Sound::with(['user', 'category'])->first();
            if ($sound) {
                Log::info("Premier son ID: " . $sound->id);
                Log::info("User exists: " . ($sound->user ? 'YES' : 'NO'));
                Log::info("Category exists: " . ($sound->category ? 'YES' : 'NO'));

                try {
                    $artist = $sound->user ? $sound->user->name : 'Artiste inconnu';
                    Log::info("Artist name: $artist");
                } catch (\Exception $e) {
                    Log::error("Erreur artist: " . $e->getMessage());
                }

                try {
                    $category = $sound->category ? $sound->category->name : 'Non classé';
                    Log::info("Category name: $category");
                } catch (\Exception $e) {
                    Log::error("Erreur category: " . $e->getMessage());
                }

                try {
                    $likes = $sound->likes_count ?? 0;
                    Log::info("Likes count: $likes");
                } catch (\Exception $e) {
                    Log::error("Erreur likes_count: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Test sons terminé, vérifiez les logs',
                'sounds_count' => $soundsCount
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur test sons: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testEvents()
    {
        try {
            Log::info('=== TEST ÉVÉNEMENTS DIAGNOSTIC ===');

            // Test 1: Compter les événements
            $eventsCount = Event::count();
            Log::info("Nombre total d'événements: $eventsCount");

            // Test 2: Événements avec utilisateur
            $eventsWithUser = Event::with(['user'])->count();
            Log::info("Événements avec relations chargées: $eventsWithUser");

            // Test 3: Test des accesseurs
            $event = Event::with(['user'])->first();
            if ($event) {
                Log::info("Premier événement ID: " . $event->id);
                Log::info("User exists: " . ($event->user ? 'YES' : 'NO'));

                try {
                    $organizer = $event->user ? $event->user->name : 'Organisateur inconnu';
                    Log::info("Organizer name: $organizer");
                } catch (\Exception $e) {
                    Log::error("Erreur organizer: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Test événements terminé, vérifiez les logs',
                'events_count' => $eventsCount
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur test événements: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testCompleteProfile()
    {
        try {
            Log::info('=== TEST PROFIL COMPLET DIAGNOSTIC ===');

            // Simuler un utilisateur connecté
            $user = User::first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Aucun utilisateur trouvé pour le test'
                ], 404);
            }

            Log::info("Test avec utilisateur ID: " . $user->id);

            // Test des relations une par une
            try {
                $paymentsCount = $user->payments()->count();
                Log::info("Payments count: $paymentsCount");
            } catch (\Exception $e) {
                Log::error("Erreur payments: " . $e->getMessage());
            }

            try {
                $soundsCount = $user->sounds()->count();
                Log::info("User sounds count: $soundsCount");
            } catch (\Exception $e) {
                Log::error("Erreur user sounds: " . $e->getMessage());
            }

            try {
                $eventsCount = $user->events()->count();
                Log::info("User events count: $eventsCount");
            } catch (\Exception $e) {
                Log::error("Erreur user events: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Test profil complet terminé, vérifiez les logs',
                'user_id' => $user->id
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur test profil complet: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testDatabase()
    {
        try {
            Log::info('=== TEST BASE DE DONNÉES ===');

            // Test connexion DB
            DB::select('SELECT 1');
            Log::info('Connexion DB: OK');

            // Test des tables principales
            $tables = ['users', 'sounds', 'events', 'categories'];
            foreach ($tables as $table) {
                try {
                    $count = DB::table($table)->count();
                    Log::info("Table $table: $count enregistrements");
                } catch (\Exception $e) {
                    Log::error("Erreur table $table: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Test base de données terminé, vérifiez les logs'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur test DB: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

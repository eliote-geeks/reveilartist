<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Sound;
use App\Models\User;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UserProfileController extends Controller
{
    public function getPurchasedSounds()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Récupérer les sons achetés via les paiements complétés
            $purchasedSounds = Payment::where('user_id', $user->id)
                ->where('type', 'sound')
                ->where('status', 'completed')
                ->with(['sound' => function($query) {
                    $query->with(['user', 'category']);
                }])
                ->get()
                ->map(function($payment) {
                    try {
                        $sound = $payment->sound;
                        if ($sound) {
                            // Construire les URLs des fichiers
                            $audioFileUrl = $sound->file_path ? Storage::url($sound->file_path) : null;
                            $coverImageUrl = $sound->cover_image ? Storage::url($sound->cover_image) : null;

                            Log::info('Son acheté traité', [
                                'sound_id' => $sound->id,
                                'file_path' => $sound->file_path,
                                'audio_url' => $audioFileUrl,
                                'cover_url' => $coverImageUrl
                            ]);

                            return [
                                'id' => $sound->id,
                                'title' => $sound->title,
                                'artist' => $sound->user ? $sound->user->name : 'Artiste inconnu',
                                'cover_image' => $coverImageUrl,
                                'file_url' => $audioFileUrl,
                                'duration' => $sound->duration,
                                'price' => $sound->price,
                                'is_free' => false, // Un son acheté n'est jamais gratuit
                                'can_play' => true, // L'utilisateur a acheté le son
                                'can_download' => true, // L'utilisateur a acheté le son
                                'purchase_date' => $payment->paid_at,
                                'plays_count' => $sound->plays_count,
                                'category' => $sound->category ? $sound->category->name : null,
                                'status' => $sound->status,
                                'created_at' => $sound->created_at,
                                'updated_at' => $sound->updated_at,
                                'is_purchased' => true // Nouveau flag pour indiquer explicitement que c'est un son acheté
                            ];
                        }
                        return null;
                    } catch (\Exception $e) {
                        Log::error('Erreur lors du traitement d\'un son acheté', [
                            'payment_id' => $payment->id,
                            'error' => $e->getMessage()
                        ]);
                        return null;
                    }
                })
                ->filter() // Supprimer les entrées null
                ->values(); // Réindexer le tableau

            return response()->json([
                'success' => true,
                'data' => $purchasedSounds
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getPurchasedSounds: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des sons achetés'
            ], 500);
        }
    }

    public function getFavoriteSounds()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            Log::info('Début getFavoriteSounds', ['user_id' => $user->id]);

            // Vérifier si la table favorite_sounds existe
            if (!Schema::hasTable('favorite_sounds')) {
                Log::error('La table favorite_sounds n\'existe pas');
                return response()->json([
                    'success' => false,
                    'message' => 'La table favorite_sounds n\'existe pas'
                ], 500);
            }

            // Récupérer les sons favoris avec leurs relations
            $favoriteSounds = $user->favoriteSounds()
                ->with(['user', 'category'])
                ->get();

            Log::info('Sons favoris récupérés', ['count' => $favoriteSounds->count()]);

            $formattedSounds = $favoriteSounds->map(function($sound) use ($user) {
                try {
                    if (!$sound) {
                        Log::warning('Son null trouvé dans les favoris');
                        return null;
                    }

                    // Vérifier si l'utilisateur a acheté ce son
                    $hasPurchased = Payment::where('user_id', $user->id)
                        ->where('sound_id', $sound->id)
                        ->where('type', 'sound')
                        ->where('status', 'completed')
                        ->exists();

                    // Construire les URLs des fichiers
                    $audioFileUrl = $sound->file_path ? Storage::url($sound->file_path) : null;
                    $coverImageUrl = $sound->cover_image ? Storage::url($sound->cover_image) : null;

                    Log::info('Son favori traité', [
                        'sound_id' => $sound->id,
                        'file_path' => $sound->file_path,
                        'audio_url' => $audioFileUrl,
                        'cover_url' => $coverImageUrl,
                        'has_purchased' => $hasPurchased
                    ]);

                    return [
                        'id' => $sound->id,
                        'title' => $sound->title,
                        'artist' => $sound->user ? $sound->user->name : 'Artiste inconnu',
                        'cover_image' => $coverImageUrl,
                        'file_url' => $audioFileUrl,
                        'duration' => $sound->duration,
                        'price' => $sound->price,
                        'is_free' => $sound->is_free,
                        'can_play' => $sound->is_free || $hasPurchased,
                        'can_download' => $sound->is_free || $hasPurchased,
                        'is_favorite' => true,
                        'is_purchased' => $hasPurchased,
                        'plays_count' => $sound->plays_count,
                        'category' => $sound->category ? $sound->category->name : null,
                        'status' => $sound->status,
                        'created_at' => $sound->created_at,
                        'updated_at' => $sound->updated_at
                    ];
                } catch (\Exception $e) {
                    Log::error('Erreur lors du traitement d\'un son favori', [
                        'sound_id' => $sound ? $sound->id : 'unknown',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return null;
                }
            })
            ->filter() // Supprimer les entrées null
            ->values(); // Réindexer le tableau

            Log::info('Sons favoris formatés', ['count' => $formattedSounds->count()]);

            return response()->json([
                'success' => true,
                'data' => $formattedSounds
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getFavoriteSounds', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user ? $user->id : 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des sons favoris'
            ], 500);
        }
    }

    public function toggleFavoriteSound($soundId)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Utilisateur non authentifié'], 401);
            }

            if (!Schema::hasTable('favorite_sounds')) {
                return response()->json(['success' => false, 'message' => 'Table des favoris non disponible'], 500);
            }

            $sound = Sound::findOrFail($soundId);

            if ($user->favoriteSounds()->where('sound_id', $soundId)->exists()) {
                $user->favoriteSounds()->detach($soundId);
                $message = 'Son retiré des favoris';
            } else {
                $user->favoriteSounds()->attach($soundId);
                $message = 'Son ajouté aux favoris';
            }

            return response()->json(['success' => true, 'message' => $message]);
        } catch (\Exception $e) {
            Log::error('Erreur toggleFavoriteSound: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur lors de la modification des favoris'], 500);
        }
    }

    public function getCompleteProfile()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            Log::info('Début getCompleteProfile', ['user_id' => $user->id]);

            // Version ultra simplifiée pour test - fonctionne
            return response()->json([
                'success' => true,
                'message' => 'Endpoint fonctionnel - Version simplifiée',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'user',
                    'bio' => $user->bio ?? '',
                    'location' => $user->location ?? '',
                    'profile_photo_url' => $user->profile_photo_url ?? null,
                    'created_at' => $user->created_at,
                ],
                'general_stats' => [
                    'total_spent' => 0,
                    'total_earned' => 0,
                    'sounds_created' => 0,
                    'events_created' => 0,
                    'followers_count' => 0,
                    'following_count' => 0,
                ],
                'purchased_sounds' => [],
                'purchased_events' => [],
                'favorite_sounds' => [],
                'my_creations' => [],
                'my_events' => [],
                'detailed_stats' => [
                    'purchases' => [
                        'sounds' => ['count' => 0, 'total_spent' => 0],
                        'events' => ['count' => 0, 'total_spent' => 0]
                    ],
                    'creations' => [
                        'sounds' => ['total' => 0, 'published' => 0],
                        'events' => ['total' => 0, 'upcoming' => 0]
                    ],
                    'favorites' => ['sounds_count' => 0]
                ],
                'recent_activity' => [
                    'recent_purchases' => [],
                    'recent_creations' => [],
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getCompleteProfile', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => isset($user) ? $user->id : 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil: ' . $e->getMessage()
            ], 500);
        }
    }
}

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
                                'artist' => $sound->user->name,
                                'cover_image' => $coverImageUrl,
                                'file_url' => $audioFileUrl,
                                'duration' => $sound->duration,
                                'price' => $sound->price,
                                'is_free' => false, // Un son acheté n'est jamais gratuit
                                'can_play' => true, // L'utilisateur a acheté le son
                                'can_download' => true, // L'utilisateur a acheté le son
                                'purchase_date' => $payment->paid_at,
                                'plays_count' => $sound->plays_count,
                                'category' => $sound->category->name ?? null,
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
                'message' => 'Erreur lors de la récupération des sons favoris: ' . $e->getMessage()
            ], 500);
        }
    }

    public function toggleFavoriteSound($soundId)
    {
        try {
            $user = Auth::user();
            $sound = Sound::findOrFail($soundId);

            if ($user->favoriteSounds()->where('sound_id', $soundId)->exists()) {
                $user->favoriteSounds()->detach($soundId);
                $message = 'Son retiré des favoris';
            } else {
                $user->favoriteSounds()->attach($soundId);
                $message = 'Son ajouté aux favoris';
            }

            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur toggleFavoriteSound: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification des favoris: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le profil complet de l'utilisateur avec toutes ses statistiques
     */
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

            // Test simple pour identifier où est le problème
            try {
                $test1 = $user->payments()->count();
                Log::info('Test payments count: ' . $test1);
            } catch (\Exception $e) {
                Log::error('Erreur test payments: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur sur payments: ' . $e->getMessage()
                ], 500);
            }

            try {
                $test2 = $user->payments()->completed()->count();
                Log::info('Test payments completed count: ' . $test2);
            } catch (\Exception $e) {
                Log::error('Erreur test payments completed: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur sur payments completed: ' . $e->getMessage()
                ], 500);
            }

            try {
                $test3 = $user->sounds()->count();
                Log::info('Test sounds count: ' . $test3);
            } catch (\Exception $e) {
                Log::error('Erreur test sounds: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur sur sounds: ' . $e->getMessage()
                ], 500);
            }

            // === STATISTIQUES GÉNÉRALES ===
            $generalStats = [
                'total_spent' => $user->payments()->completed()->sum('amount'),
                'total_earned' => $user->sales()->completed()->sum('seller_amount'),
                'sounds_created' => $user->sounds()->count(),
                'events_created' => $user->events()->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
            ];

            // === SONS ACHETÉS ===
            $purchasedSounds = $user->payments()
                ->completed()
                ->sounds()
                ->with(['sound.user', 'sound.category'])
                ->orderBy('paid_at', 'desc')
                ->get()
                ->map(function($payment) {
                    $sound = $payment->sound;
                    if (!$sound) return null;

                    return [
                        'id' => $sound->id,
                        'title' => $sound->title,
                        'artist' => $sound->user->name ?? 'Artiste inconnu',
                        'category' => $sound->category->name ?? 'Non catégorisé',
                        'cover_image' => $sound->cover_image ? Storage::url($sound->cover_image) : null,
                        'file_url' => $sound->file_path ? Storage::url($sound->file_path) : null,
                        'duration' => $sound->duration,
                        'price_paid' => $payment->amount,
                        'purchase_date' => $payment->paid_at,
                        'can_play' => true,
                        'can_download' => true,
                        'genre' => $sound->genre,
                        'bpm' => $sound->bpm,
                        'plays_count' => $sound->plays_count ?? 0,
                    ];
                })
                ->filter()
                ->values();

            // === ÉVÉNEMENTS ACHETÉS ===
            $purchasedEvents = $user->payments()
                ->completed()
                ->events()
                ->with(['event.user'])
                ->orderBy('paid_at', 'desc')
                ->get()
                ->map(function($payment) {
                    $event = $payment->event;
                    if (!$event) return null;

                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'organizer' => $event->user->name ?? 'Organisateur inconnu',
                        'category' => $event->category ?? 'Non catégorisé',
                        'cover_image' => $event->cover_image ? Storage::url($event->cover_image) : null,
                        'event_date' => $event->event_date,
                        'location' => $event->location,
                        'price_paid' => $payment->amount,
                        'purchase_date' => $payment->paid_at,
                        'status' => $event->status,
                        'is_upcoming' => $event->event_date > now(),
                    ];
                })
                ->filter()
                ->values();

            // === SONS FAVORIS ===
            $favoriteSounds = [];
            if (Schema::hasTable('favorite_sounds')) {
                $favoriteSounds = $user->favoriteSounds()
                    ->with(['user', 'category'])
                    ->where('status', 'published')
                    ->orderBy('favorite_sounds.created_at', 'desc')
                    ->get()
                    ->map(function($sound) use ($user) {
                        // Vérifier si l'utilisateur a acheté ce son
                        $hasPurchased = $user->payments()
                            ->completed()
                            ->sounds()
                            ->where('sound_id', $sound->id)
                            ->exists();

                        return [
                            'id' => $sound->id,
                            'title' => $sound->title,
                            'artist' => $sound->user->name ?? 'Artiste inconnu',
                            'category' => $sound->category->name ?? 'Non catégorisé',
                            'cover_image' => $sound->cover_image ? Storage::url($sound->cover_image) : null,
                            'file_url' => ($sound->is_free || $hasPurchased) ? Storage::url($sound->file_path) : null,
                            'duration' => $sound->duration,
                            'price' => $sound->price,
                            'is_free' => $sound->is_free,
                            'can_play' => $sound->is_free || $hasPurchased,
                            'can_download' => $sound->is_free || $hasPurchased,
                            'is_purchased' => $hasPurchased,
                            'favorited_at' => $sound->pivot->created_at,
                            'genre' => $sound->genre,
                            'bpm' => $sound->bpm,
                            'plays_count' => $sound->plays_count ?? 0,
                        ];
                    });
            }

            // === MES CRÉATIONS (SONS) ===
            $myCreations = $user->sounds()
                ->with(['category'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($sound) {
                    // Calculer les revenus pour ce son
                    $revenue = Payment::where('sound_id', $sound->id)
                        ->completed()
                        ->sum('seller_amount');

                    $salesCount = Payment::where('sound_id', $sound->id)
                        ->completed()
                        ->count();

                    return [
                        'id' => $sound->id,
                        'title' => $sound->title,
                        'category' => $sound->category->name ?? 'Non catégorisé',
                        'cover_image' => $sound->cover_image ? Storage::url($sound->cover_image) : null,
                        'duration' => $sound->duration,
                        'price' => $sound->price,
                        'is_free' => $sound->is_free,
                        'status' => $sound->status,
                        'plays_count' => $sound->plays_count ?? 0,
                        'likes_count' => $sound->likes_count ?? 0,
                        'downloads_count' => $sound->downloads_count ?? 0,
                        'sales_count' => $salesCount,
                        'revenue' => $revenue,
                        'genre' => $sound->genre,
                        'bpm' => $sound->bpm,
                        'created_at' => $sound->created_at,
                    ];
                });

            // === MES ÉVÉNEMENTS ===
            $myEvents = $user->events()
                ->orderBy('event_date', 'desc')
                ->get()
                ->map(function($event) {
                    // Calculer les revenus pour cet événement
                    $revenue = Payment::where('event_id', $event->id)
                        ->completed()
                        ->sum('seller_amount');

                    $ticketsSold = Payment::where('event_id', $event->id)
                        ->completed()
                        ->count();

                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'category' => $event->category ?? 'Non catégorisé',
                        'cover_image' => $event->cover_image ? Storage::url($event->cover_image) : null,
                        'event_date' => $event->event_date,
                        'location' => $event->location,
                        'ticket_price' => $event->ticket_price,
                        'price_min' => $event->price_min,
                        'price_max' => $event->price_max,
                        'status' => $event->status,
                        'tickets_sold' => $ticketsSold,
                        'revenue' => $revenue,
                        'is_upcoming' => $event->event_date > now(),
                        'created_at' => $event->created_at,
                    ];
                });

            // === STATISTIQUES DÉTAILLÉES ===
            $detailedStats = [
                'purchases' => [
                    'sounds' => [
                        'count' => $purchasedSounds->count(),
                        'total_spent' => $purchasedSounds->sum('price_paid'),
                        'free_count' => $purchasedSounds->where('price_paid', 0)->count(),
                        'paid_count' => $purchasedSounds->where('price_paid', '>', 0)->count(),
                    ],
                    'events' => [
                        'count' => $purchasedEvents->count(),
                        'total_spent' => $purchasedEvents->sum('price_paid'),
                        'upcoming_count' => $purchasedEvents->where('is_upcoming', true)->count(),
                        'past_count' => $purchasedEvents->where('is_upcoming', false)->count(),
                    ]
                ],
                'creations' => [
                    'sounds' => [
                        'total' => $myCreations->count(),
                        'published' => $myCreations->where('status', 'published')->count(),
                        'pending' => $myCreations->where('status', 'pending')->count(),
                        'draft' => $myCreations->where('status', 'draft')->count(),
                        'total_plays' => $myCreations->sum('plays_count'),
                        'total_likes' => $myCreations->sum('likes_count'),
                        'total_revenue' => $myCreations->sum('revenue'),
                        'total_sales' => $myCreations->sum('sales_count'),
                    ],
                    'events' => [
                        'total' => $myEvents->count(),
                        'upcoming' => $myEvents->where('is_upcoming', true)->count(),
                        'past' => $myEvents->where('is_upcoming', false)->count(),
                        'total_revenue' => $myEvents->sum('revenue'),
                        'total_tickets_sold' => $myEvents->sum('tickets_sold'),
                    ]
                ],
                'favorites' => [
                    'sounds_count' => $favoriteSounds->count(),
                    'free_sounds' => $favoriteSounds->where('is_free', true)->count(),
                    'paid_sounds' => $favoriteSounds->where('is_free', false)->count(),
                ]
            ];

            // === ACTIVITÉ RÉCENTE ===
            $recentActivity = [
                'recent_purchases' => $user->payments()
                    ->completed()
                    ->with(['sound', 'event'])
                    ->orderBy('paid_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function($payment) {
                        return [
                            'type' => $payment->type,
                            'product_name' => $payment->product_name,
                            'amount' => $payment->amount,
                            'date' => $payment->paid_at,
                        ];
                    }),
                'recent_creations' => $user->sounds()
                    ->orderBy('created_at', 'desc')
                    ->limit(3)
                    ->get(['id', 'title', 'status', 'created_at']),
            ];

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'bio' => $user->bio,
                    'location' => $user->location,
                    'profile_photo_url' => $user->profile_photo_url,
                    'created_at' => $user->created_at,
                ],
                'general_stats' => $generalStats,
                'purchased_sounds' => $purchasedSounds,
                'purchased_events' => $purchasedEvents,
                'favorite_sounds' => $favoriteSounds,
                'my_creations' => $myCreations,
                'my_events' => $myEvents,
                'detailed_stats' => $detailedStats,
                'recent_activity' => $recentActivity,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getCompleteProfile', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user ? $user->id : 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil: ' . $e->getMessage()
            ], 500);
        }
    }
}

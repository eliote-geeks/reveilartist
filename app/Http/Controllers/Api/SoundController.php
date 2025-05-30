<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sound;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SoundController extends Controller
{
    /**
     * Afficher la liste des sons
     */
    public function index(Request $request)
    {
        try {
            $query = Sound::with(['user', 'category'])
                ->published(); // Seuls les sons publiés

            // Filtrer par catégorie
            if ($request->filled('category') && $request->category !== 'all') {
                if (is_numeric($request->category)) {
                    $query->where('category_id', $request->category);
                } else {
                    // Recherche par nom de catégorie
                    $query->whereHas('category', function($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->category . '%');
                    });
                }
            }

            // Filtrer par prix
            if ($request->filled('price')) {
                switch ($request->price) {
                    case 'free':
                        $query->where('is_free', true);
                        break;
                    case '0-2000':
                        $query->where('price', '>=', 0)->where('price', '<=', 2000);
                        break;
                    case '2000-3000':
                        $query->where('price', '>', 2000)->where('price', '<=', 3000);
                        break;
                    case '3000+':
                        $query->where('price', '>', 3000);
                        break;
                }
            }

            // Recherche par titre ou artiste
            if ($request->filled('search')) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('genre', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($subQ) use ($request) {
                          $subQ->where('name', 'like', '%' . $request->search . '%');
                      });
                });
            }

            // Tri
            $sortBy = $request->get('sort', 'popular');
            switch ($sortBy) {
                case 'recent':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'price-low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price-high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'likes':
                    $query->orderBy('likes_count', 'desc');
                    break;
                case 'popular':
                default:
                    $query->orderBy('plays_count', 'desc')
                          ->orderBy('likes_count', 'desc');
                    break;
            }

            $perPage = min($request->get('per_page', 12), 50); // Max 50 par page
            $sounds = $query->paginate($perPage);

            // Formatter les données pour le frontend
            $sounds->getCollection()->transform(function ($sound) {
                return [
                    'id' => $sound->id,
                    'title' => $sound->title,
                    'slug' => $sound->slug,
                    'artist' => $sound->user->name,
                    'artistId' => $sound->user->id,
                    'price' => $sound->price,
                    'is_free' => $sound->is_free,
                    'cover' => $sound->cover_image_url,
                    'category' => $sound->category->name ?? 'Non classé',
                    'category_id' => $sound->category_id,
                    'likes' => $sound->likes_count,
                    'plays' => $sound->plays_count,
                    'duration' => $sound->formatted_duration,
                    'genre' => $sound->genre,
                    'file_url' => $sound->file_url,
                    'preview_url' => route('api.sounds.preview', $sound->id), // URL pour preview
                    'is_featured' => $sound->is_featured,
                    'created_at' => $sound->created_at->format('Y-m-d'),
                    'tags' => $sound->tags ?? []
                ];
            });

            return response()->json([
                'success' => true,
                'sounds' => $sounds->items(),
                'pagination' => [
                    'current_page' => $sounds->currentPage(),
                    'last_page' => $sounds->lastPage(),
                    'per_page' => $sounds->perPage(),
                    'total' => $sounds->total(),
                    'has_more' => $sounds->hasMorePages()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des sons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un son spécifique
     */
    public function show($id)
    {
        try {
            $sound = Sound::with(['user', 'category'])
                ->where('status', 'published')
                ->findOrFail($id);

            // Incrémenter les vues (sans compter plusieurs fois le même utilisateur)
            $sound->increment('plays_count');

            $formattedSound = [
                'id' => $sound->id,
                'title' => $sound->title,
                'slug' => $sound->slug,
                'description' => $sound->description,
                'artist' => $sound->user->name,
                'artistId' => $sound->user->id,
                'price' => $sound->price,
                'is_free' => $sound->is_free,
                'cover' => $sound->cover_image_url,
                'category' => $sound->category->name ?? 'Non classé',
                'likes' => $sound->likes_count,
                'plays' => $sound->plays_count,
                'downloads' => $sound->downloads_count,
                'duration' => $sound->formatted_duration,
                'duration_seconds' => $sound->duration,
                'genre' => $sound->genre,
                'bpm' => $sound->bpm,
                'key' => $sound->key,
                'file_url' => $sound->file_url,
                'preview_url' => route('api.sounds.preview', $sound->id),
                'is_featured' => $sound->is_featured,
                'created_at' => $sound->created_at->format('Y-m-d H:i:s'),
                'upload_date' => $sound->created_at->format('Y-m-d'),
                'tags' => $sound->tags ?? [],
                'credits' => $sound->credits,
                'license_type' => $sound->license_type,
                'commercial_use' => $sound->commercial_use,
                'format' => 'MP3 320kbps', // Peut être rendu dynamique
                'file_size' => '12.5 MB' // Peut être calculé dynamiquement
            ];

            return response()->json([
                'success' => true,
                'sound' => $formattedSound
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Son non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Liker/déliker un son
     */
    public function toggleLike(Request $request, $id)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise pour liker un son'
                ], 401);
            }

            $sound = Sound::findOrFail($id);
            $user = auth('sanctum')->user();

            // Vérifier si l'utilisateur a déjà liké ce son
            $existingLike = DB::table('sound_likes')
                ->where('user_id', $user->id)
                ->where('sound_id', $sound->id)
                ->first();

            if ($existingLike) {
                // Déliker
                DB::table('sound_likes')
                    ->where('user_id', $user->id)
                    ->where('sound_id', $sound->id)
                    ->delete();

                $sound->decrement('likes_count');
                $isLiked = false;
                $message = 'Son retiré des favoris';
            } else {
                // Liker
                DB::table('sound_likes')->insert([
                    'user_id' => $user->id,
                    'sound_id' => $sound->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $sound->increment('likes_count');
                $isLiked = true;
                $message = 'Son ajouté aux favoris';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'is_liked' => $isLiked,
                'likes_count' => $sound->fresh()->likes_count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du like',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le statut de like pour plusieurs sons
     */
    public function getLikesStatus(Request $request)
    {
        try {
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => true,
                    'likes' => []
                ]);
            }

            $soundIds = $request->get('sound_ids', []);
            $user = auth('sanctum')->user();

            $likes = DB::table('sound_likes')
                ->where('user_id', $user->id)
                ->whereIn('sound_id', $soundIds)
                ->pluck('sound_id')
                ->toArray();

            return response()->json([
                'success' => true,
                'likes' => $likes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des likes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Stream de prévisualisation (20 secondes)
     */
    public function preview($id)
    {
        try {
            $sound = Sound::where('status', 'published')->findOrFail($id);

            // Chemin du fichier audio
            $filePath = storage_path('app/public/' . $sound->file_path);

            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier audio non trouvé'
                ], 404);
            }

            // Incrémenter le compteur de lectures (preview)
            $sound->increment('plays_count');

            // Headers pour le streaming audio
            $headers = [
                'Content-Type' => 'audio/mpeg',
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'public, max-age=3600',
                'X-Preview-Duration' => '20' // Indication que c'est une preview de 20s
            ];

            // Pour une vraie implémentation de preview de 20 secondes,
            // vous devriez utiliser FFmpeg pour extraire les 20 premières secondes
            // Ici, on retourne le fichier complet mais le frontend limitera à 20s

            return response()->file($filePath, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la lecture du son',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les sons populaires
     */
    public function popular(Request $request)
    {
        try {
            $limit = min($request->get('limit', 8), 20);

            $sounds = Sound::with(['user', 'category'])
                ->published()
                ->orderBy('plays_count', 'desc')
                ->orderBy('likes_count', 'desc')
                ->limit($limit)
                ->get();

            $formattedSounds = $sounds->map(function ($sound) {
                return [
                    'id' => $sound->id,
                    'title' => $sound->title,
                    'artist' => $sound->user->name,
                    'price' => $sound->price,
                    'is_free' => $sound->is_free,
                    'cover' => $sound->cover_image_url,
                    'category' => $sound->category->name ?? 'Non classé',
                    'likes' => $sound->likes_count,
                    'plays' => $sound->plays_count,
                    'preview_url' => route('api.sounds.preview', $sound->id)
                ];
            });

            return response()->json([
                'success' => true,
                'sounds' => $formattedSounds
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des sons populaires',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les sons récents
     */
    public function recent(Request $request)
    {
        try {
            $limit = min($request->get('limit', 8), 20);

            $sounds = Sound::with(['user', 'category'])
                ->published()
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            $formattedSounds = $sounds->map(function ($sound) {
                return [
                    'id' => $sound->id,
                    'title' => $sound->title,
                    'artist' => $sound->user->name,
                    'price' => $sound->price,
                    'is_free' => $sound->is_free,
                    'cover' => $sound->cover_image_url,
                    'category' => $sound->category->name ?? 'Non classé',
                    'likes' => $sound->likes_count,
                    'plays' => $sound->plays_count,
                    'preview_url' => route('api.sounds.preview', $sound->id)
                ];
            });

            return response()->json([
                'success' => true,
                'sounds' => $formattedSounds
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des sons récents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recherche de sons
     */
    public function search(Request $request)
    {
        try {
            $query = $request->get('q', '');

            if (empty($query)) {
                return response()->json([
                    'success' => true,
                    'sounds' => [],
                    'total' => 0
                ]);
            }

            $sounds = Sound::with(['user', 'category'])
                ->published()
                ->where(function($q) use ($query) {
                    $q->where('title', 'like', '%' . $query . '%')
                      ->orWhere('description', 'like', '%' . $query . '%')
                      ->orWhere('genre', 'like', '%' . $query . '%')
                      ->orWhereJsonContains('tags', $query)
                      ->orWhereHas('user', function($subQ) use ($query) {
                          $subQ->where('name', 'like', '%' . $query . '%');
                      })
                      ->orWhereHas('category', function($subQ) use ($query) {
                          $subQ->where('name', 'like', '%' . $query . '%');
                      });
                })
                ->orderBy('plays_count', 'desc')
                ->limit(20)
                ->get();

            $formattedSounds = $sounds->map(function ($sound) {
                return [
                    'id' => $sound->id,
                    'title' => $sound->title,
                    'artist' => $sound->user->name,
                    'price' => $sound->price,
                    'is_free' => $sound->is_free,
                    'cover' => $sound->cover_image_url,
                    'category' => $sound->category->name ?? 'Non classé',
                    'likes' => $sound->likes_count,
                    'plays' => $sound->plays_count,
                    'preview_url' => route('api.sounds.preview', $sound->id)
                ];
            });

            return response()->json([
                'success' => true,
                'sounds' => $formattedSounds,
                'total' => $sounds->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau son
     */
    public function store(Request $request)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise'
                ], 401);
            }

            // Validation des données
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category_id' => 'required|exists:categories,id',
                'genre' => 'nullable|string|max:100',
                'price' => 'nullable|numeric|min:0',
                'is_free' => 'boolean',
                'audio_file' => 'required|file|mimes:mp3,wav,m4a|max:51200', // Max 50MB
                'cover_image' => 'nullable|file|image|max:5120', // Max 5MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = auth('sanctum')->user();

            // Upload du fichier audio
            $audioFile = $request->file('audio_file');
            $audioPath = $audioFile->store('sounds', 'public');

            // Upload de l'image de couverture
            $coverPath = null;
            if ($request->hasFile('cover_image')) {
                $coverFile = $request->file('cover_image');
                $coverPath = $coverFile->store('covers', 'public');
            }

            // Créer le son
            $sound = Sound::create([
                'title' => $request->title,
                'slug' => Str::slug($request->title),
                'description' => $request->description,
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'genre' => $request->genre,
                'price' => $request->is_free ? 0 : ($request->price ?? 0),
                'is_free' => $request->boolean('is_free'),
                'file_path' => $audioPath,
                'cover_image' => $coverPath,
                'duration' => 0, // À calculer avec getID3 ou similar
                'status' => 'published',
                'plays_count' => 0,
                'downloads_count' => 0,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Son créé avec succès',
                'sound' => [
                    'id' => $sound->id,
                    'title' => $sound->title,
                    'slug' => $sound->slug,
                    'artist' => $sound->user->name,
                    'category' => $sound->category->name,
                    'price' => $sound->price,
                    'is_free' => $sound->is_free,
                    'status' => $sound->status
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du son',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier un son existant
     */
    public function update(Request $request, $id)
    {
        try {
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise'
                ], 401);
            }

            $sound = Sound::findOrFail($id);
            $user = auth('sanctum')->user();

            // Vérifier que l'utilisateur est le propriétaire ou admin
            if ($sound->user_id !== $user->id && !$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à modifier ce son'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'category_id' => 'sometimes|required|exists:categories,id',
                'genre' => 'nullable|string|max:100',
                'price' => 'nullable|numeric|min:0',
                'is_free' => 'boolean',
                'audio_file' => 'nullable|file|mimes:mp3,wav,m4a|max:51200',
                'cover_image' => 'nullable|file|image|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mise à jour des champs
            $updateData = [];
            if ($request->has('title')) {
                $updateData['title'] = $request->title;
                $updateData['slug'] = Str::slug($request->title);
            }
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            if ($request->has('category_id')) {
                $updateData['category_id'] = $request->category_id;
            }
            if ($request->has('genre')) {
                $updateData['genre'] = $request->genre;
            }
            if ($request->has('price') || $request->has('is_free')) {
                $updateData['price'] = $request->boolean('is_free') ? 0 : ($request->price ?? 0);
                $updateData['is_free'] = $request->boolean('is_free');
            }

            // Upload nouveau fichier audio si fourni
            if ($request->hasFile('audio_file')) {
                // Supprimer l'ancien fichier
                if ($sound->file_path && Storage::disk('public')->exists($sound->file_path)) {
                    Storage::disk('public')->delete($sound->file_path);
                }
                $audioFile = $request->file('audio_file');
                $updateData['file_path'] = $audioFile->store('sounds', 'public');
            }

            // Upload nouvelle image de couverture si fournie
            if ($request->hasFile('cover_image')) {
                // Supprimer l'ancienne image
                if ($sound->cover_image && Storage::disk('public')->exists($sound->cover_image)) {
                    Storage::disk('public')->delete($sound->cover_image);
                }
                $coverFile = $request->file('cover_image');
                $updateData['cover_image'] = $coverFile->store('covers', 'public');
            }

            $sound->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Son mis à jour avec succès',
                'sound' => $sound->fresh(['user', 'category'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un son
     */
    public function destroy($id)
    {
        try {
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise'
                ], 401);
            }

            $sound = Sound::findOrFail($id);
            $user = auth('sanctum')->user();

            // Vérifier que l'utilisateur est le propriétaire ou admin
            if ($sound->user_id !== $user->id && !$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à supprimer ce son'
                ], 403);
            }

            // Supprimer les fichiers associés
            if ($sound->file_path && Storage::disk('public')->exists($sound->file_path)) {
                Storage::disk('public')->delete($sound->file_path);
            }
            if ($sound->cover_image && Storage::disk('public')->exists($sound->cover_image)) {
                Storage::disk('public')->delete($sound->cover_image);
            }

            // Supprimer les likes associés
            DB::table('sound_likes')->where('sound_id', $sound->id)->delete();

            // Supprimer le son
            $sound->delete();

            return response()->json([
                'success' => true,
                'message' => 'Son supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un son
     */
    public function download($id)
    {
        try {
            $sound = Sound::where('status', 'published')->findOrFail($id);

            // Vérifier les droits de téléchargement
            if (!$sound->is_free && !auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise pour télécharger ce son payant'
                ], 401);
            }

            // Pour les sons payants, vérifier l'achat (à implémenter selon votre logique)
            if (!$sound->is_free) {
                // TODO: Vérifier que l'utilisateur a acheté le son
                // Pour l'instant, on autorise le téléchargement
            }

            $filePath = storage_path('app/public/' . $sound->file_path);

            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier non trouvé'
                ], 404);
            }

            // Incrémenter le compteur de téléchargements
            $sound->increment('downloads_count');

            // Headers pour le téléchargement
            $headers = [
                'Content-Type' => 'audio/mpeg',
                'Content-Disposition' => 'attachment; filename="' . $sound->slug . '.mp3"',
                'Content-Length' => filesize($filePath)
            ];

            return response()->download($filePath, $sound->slug . '.mp3', $headers);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

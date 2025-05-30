<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Sound;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Afficher la liste des utilisateurs pour le dashboard admin
     */
    public function index(Request $request)
    {
        try {
            // Vérifier que l'utilisateur connecté est admin
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise'
                ], 401);
            }

            $user = auth('sanctum')->user();
            // Pour l'instant, on permet l'accès à tous les utilisateurs connectés
            // if (!$user->is_admin) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Accès réservé aux administrateurs'
            //     ], 403);
            // }

            $query = User::query();

            // Filtrer par rôle
            if ($request->filled('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            // Recherche
            if ($request->filled('search')) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            }

            // Tri
            $sortBy = $request->get('sort', 'created_at');
            $sortOrder = $request->get('order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = min($request->get('per_page', 15), 50);
            $users = $query->paginate($perPage);

            // Formatter les données
            $users->getCollection()->transform(function ($user) {
                // Calculer les statistiques de l'utilisateur
                $soundsCount = Sound::where('user_id', $user->id)->count();
                $eventsCount = Event::where('user_id', $user->id)->count();

                $soundsRevenue = Sound::where('user_id', $user->id)
                    ->where('is_free', false)
                    ->sum('price');

                $totalPlays = Sound::where('user_id', $user->id)->sum('plays_count');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'user',
                    'status' => 'active', // Par défaut
                    'avatar' => null, // À implémenter
                    'sounds_count' => $soundsCount,
                    'events_count' => $eventsCount,
                    'revenue' => $soundsRevenue,
                    'total_plays' => $totalPlays,
                    'join_date' => $user->created_at->format('Y-m-d'),
                    'email_verified' => $user->email_verified_at ? true : false,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'users' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'has_more' => $users->hasMorePages()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des utilisateurs
     */
    public function stats(Request $request)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise'
                ], 401);
            }

            // Statistiques générales
            $totalUsers = User::count();
            $newUsersThisMonth = User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            $newUsersLastMonth = User::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();

            $growthPercentage = $newUsersLastMonth > 0
                ? (($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100
                : 0;

            // Compter les artistes (utilisateurs avec des sons)
            $artistsCount = User::whereHas('sounds')->count();

            // Compter les producteurs (utilisateurs avec des événements)
            $producersCount = User::whereHas('events')->count();

            // Top artistes (par nombre de sons)
            $topArtists = User::withCount('sounds')
                ->having('sounds_count', '>', 0)
                ->orderBy('sounds_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'sounds_count']);

            // Revenus totaux générés par les utilisateurs
            $totalRevenue = Sound::where('is_free', false)->sum('price');

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_users' => $totalUsers,
                    'new_users_this_month' => $newUsersThisMonth,
                    'growth_percentage' => round($growthPercentage, 2),
                    'artists_count' => $artistsCount,
                    'producers_count' => $producersCount,
                    'total_revenue' => $totalRevenue,
                    'top_artists' => $topArtists
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un utilisateur spécifique
     */
    public function show($id)
    {
        try {
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise'
                ], 401);
            }

            $authUser = auth('sanctum')->user();
            if (!$authUser->is_admin && $authUser->id != $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $user = User::withCount(['sounds', 'events'])->findOrFail($id);

            // Calculer les statistiques détaillées
            $soundsRevenue = Sound::where('user_id', $user->id)
                ->where('is_free', false)
                ->sum('price');

            $totalPlays = Sound::where('user_id', $user->id)->sum('plays_count');
            $totalDownloads = Sound::where('user_id', $user->id)->sum('downloads_count');

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'user',
                    'status' => $user->status ?? 'active',
                    'avatar' => $user->avatar_url ?? null,
                    'sounds_count' => $user->sounds_count,
                    'events_count' => $user->events_count,
                    'revenue' => $soundsRevenue,
                    'total_plays' => $totalPlays,
                    'total_downloads' => $totalDownloads,
                    'join_date' => $user->created_at->format('Y-m-d'),
                    'last_login' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : null,
                    'email_verified' => $user->email_verified_at ? true : false,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un utilisateur
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

            $authUser = auth('sanctum')->user();
            if (!$authUser->is_admin && $authUser->id != $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $user = User::findOrFail($id);

            // Validation
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $id,
                'role' => 'sometimes|required|in:user,artist,producer,admin',
                'status' => 'sometimes|required|in:active,suspended,banned',
                'password' => 'sometimes|nullable|string|min:8',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mise à jour
            $updateData = $request->only(['name', 'email', 'role', 'status']);

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => $user->fresh()
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
     * Supprimer un utilisateur
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

            $authUser = auth('sanctum')->user();
            if ($authUser->id == $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas supprimer votre propre compte'
                ], 403);
            }

            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

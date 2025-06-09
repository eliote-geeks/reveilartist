<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Afficher la liste des événements
     */
    public function index(Request $request)
    {
        try {
            $query = Event::query();

            // Filtrer par statut actif si demandé
            if ($request->has('active') && $request->active == '1') {
                $query->where('status', 'active');
            }

            // Filtrer par catégorie si demandé
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Filtrer par ville si demandé
            if ($request->has('city') && $request->city !== 'all') {
                $query->where('city', $request->city);
            }

            // Recherche par titre ou description
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('artist', 'like', '%' . $request->search . '%');
                });
            }

            // Ordonner par date d'événement
            $query->orderBy('event_date', 'asc');

            $events = $query->get();

            return response()->json([
                'success' => true,
                'events' => $events,
                'total' => $events->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des événements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouvel événement
     */
    public function store(Request $request)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            // Validation complète des données selon tous les champs de la base
            $validator = Validator::make($request->all(), [
                // Informations principales
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:3000',
                'category' => 'required|string|in:concert,festival,showcase,workshop,conference,party,soiree',
                'status' => 'nullable|string|in:draft,pending,published,cancelled,completed,active',

                // Lieu et date
                'venue' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'address' => 'required|string|max:500',
                'city' => 'required|string|max:100',
                'country' => 'nullable|string|max:100',
                'event_date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i|after:start_time',

                // Tarification
                'is_free' => 'nullable|boolean',
                'ticket_price' => 'nullable|numeric|min:0',
                'price_min' => 'nullable|numeric|min:0',
                'price_max' => 'nullable|numeric|min:0',
                'tickets' => 'nullable|string',

                // Capacité
                'capacity' => 'nullable|integer|min:1',
                'max_attendees' => 'nullable|integer|min:1',

                // Artistes et sponsors
                'artist' => 'nullable|string|max:255',
                'artists' => 'nullable|string',
                'sponsors' => 'nullable|string',

                // Contact
                'contact_phone' => 'required|string|max:20',
                'contact_email' => 'required|email|max:255',
                'website_url' => 'nullable|url|max:255',

                // Réseaux sociaux
                'facebook_url' => 'nullable|url|max:255',
                'instagram_url' => 'nullable|url|max:255',
                'twitter_url' => 'nullable|url|max:255',
                'social_links' => 'nullable|string',

                // Médias
                'poster_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
                'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
                'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',

                // Options avancées
                'requirements' => 'nullable|string|max:1000',
                'is_featured' => 'nullable|boolean',
                'featured' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = auth('sanctum')->user();

            // Préparer les données de l'événement
            $eventData = [
                // Informations principales
                'title' => $request->title,
                'slug' => Str::slug($request->title),
                'description' => $request->description,
                'category' => $request->category,
                'status' => $user->role === 'admin' ? ($request->status ?? 'pending') : 'pending',
                'user_id' => $user->id,

                // Lieu et date
                'venue' => $request->venue,
                'location' => $request->location,
                'address' => $request->address,
                'city' => $request->city,
                'country' => $request->country ?? 'Cameroun',
                'event_date' => $request->event_date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,

                // Tarification
                'is_free' => $request->boolean('is_free', false),
                'ticket_price' => $request->boolean('is_free') ? null : $request->ticket_price,
                'price_min' => $request->price_min,
                'price_max' => $request->price_max,
                'tickets' => $request->tickets,

                // Capacité
                'capacity' => $request->capacity,
                'max_attendees' => $request->max_attendees,
                'current_attendees' => 0,
                'views_count' => 0,
                'revenue' => 0.00,

                // Artistes et sponsors
                'artist' => $request->artist,

                // Contact
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email,
                'website_url' => $request->website_url,

                // Réseaux sociaux
                'facebook_url' => $request->facebook_url,
                'instagram_url' => $request->instagram_url,
                'twitter_url' => $request->twitter_url,
                'social_links' => $request->social_links,

                // Options avancées
                'requirements' => $request->requirements,
                'is_featured' => $user->role === 'admin' ? $request->boolean('is_featured', false) : false,
                'featured' => $user->role === 'admin' ? $request->boolean('featured', false) : false
            ];

            // Traitement des artistes (convertir string en JSON)
            if ($request->artists) {
                $artists = explode(',', $request->artists);
                $artists = array_map('trim', $artists);
                $artists = array_filter($artists);
                $eventData['artists'] = json_encode($artists);
            }

            // Traitement des sponsors (convertir string en JSON)
            if ($request->sponsors) {
                $sponsors = explode(',', $request->sponsors);
                $sponsors = array_map('trim', $sponsors);
                $sponsors = array_filter($sponsors);
                $eventData['sponsors'] = json_encode($sponsors);
            }

            // Créer l'événement
            $event = Event::create($eventData);

            // Gérer l'upload de l'image poster
            if ($request->hasFile('poster_image')) {
                $image = $request->file('poster_image');
                $imageName = time() . '_poster_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('events/posters', $imageName, 'public');
                $event->update(['poster_image' => $imagePath]);
            }

            // Gérer l'upload de l'image principale
            if ($request->hasFile('featured_image')) {
                $image = $request->file('featured_image');
                $imageName = time() . '_featured_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('events/featured', $imageName, 'public');
                $event->update(['featured_image' => $imagePath]);
            }

            // Gérer l'upload de la galerie d'images
            if ($request->hasFile('gallery_images')) {
                $galleryImages = [];
                foreach ($request->file('gallery_images') as $index => $image) {
                    $imageName = time() . '_gallery_' . $index . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                    $imagePath = $image->storeAs('events/gallery', $imageName, 'public');
                    $galleryImages[] = $imagePath;
                }
                $event->update(['gallery_images' => json_encode($galleryImages)]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Événement créé avec succès ! Il sera disponible après validation.',
                'event' => $event->fresh()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un événement spécifique
     */
    public function show($id)
    {
        try {
            $event = Event::findOrFail($id);

            return response()->json([
                'success' => true,
                'event' => $event
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Événement non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un événement
     */
    public function update(Request $request, $id)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            $event = Event::findOrFail($id);

            // Vérifier que l'utilisateur peut modifier cet événement
            $user = auth('sanctum')->user();
            if ($event->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à modifier cet événement'
                ], 403);
            }

            // Validation complète des données
            $validator = Validator::make($request->all(), [
                // Informations principales
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string|max:3000',
                'category' => 'sometimes|required|string|in:concert,festival,showcase,workshop,conference,party,soiree',
                'status' => 'nullable|string|in:draft,pending,published,cancelled,completed,active',

                // Lieu et date
                'venue' => 'sometimes|required|string|max:255',
                'location' => 'sometimes|required|string|max:255',
                'address' => 'sometimes|required|string|max:500',
                'city' => 'sometimes|required|string|max:100',
                'country' => 'nullable|string|max:100',
                'event_date' => 'sometimes|required|date',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',

                // Tarification
                'is_free' => 'nullable|boolean',
                'ticket_price' => 'nullable|numeric|min:0',
                'price_min' => 'nullable|numeric|min:0',
                'price_max' => 'nullable|numeric|min:0',
                'tickets' => 'nullable|string',

                // Capacité
                'capacity' => 'nullable|integer|min:1',
                'max_attendees' => 'nullable|integer|min:1',

                // Artistes et sponsors
                'artist' => 'nullable|string|max:255',
                'artists' => 'nullable|string',
                'sponsors' => 'nullable|string',

                // Contact
                'contact_phone' => 'sometimes|required|string|max:20',
                'contact_email' => 'sometimes|required|email|max:255',
                'website_url' => 'nullable|url|max:255',

                // Réseaux sociaux
                'facebook_url' => 'nullable|url|max:255',
                'instagram_url' => 'nullable|url|max:255',
                'twitter_url' => 'nullable|url|max:255',
                'social_links' => 'nullable|string',

                // Médias
                'poster_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
                'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
                'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',

                // Options avancées
                'requirements' => 'nullable|string|max:1000',
                'is_featured' => 'nullable|boolean',
                'featured' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Préparer les données de mise à jour
            $updateData = [];

            // Informations principales
            if ($request->has('title')) {
                $updateData['title'] = $request->title;
                $updateData['slug'] = Str::slug($request->title);
            }
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            if ($request->has('category')) {
                $updateData['category'] = $request->category;
            }

            // Statut (seulement pour les admins)
            if ($request->has('status') && $user->role === 'admin') {
                $updateData['status'] = $request->status;
            }

            // Lieu et date
            if ($request->has('venue')) {
                $updateData['venue'] = $request->venue;
            }
            if ($request->has('location')) {
                $updateData['location'] = $request->location;
            }
            if ($request->has('address')) {
                $updateData['address'] = $request->address;
            }
            if ($request->has('city')) {
                $updateData['city'] = $request->city;
            }
            if ($request->has('country')) {
                $updateData['country'] = $request->country;
            }
            if ($request->has('event_date')) {
                $updateData['event_date'] = $request->event_date;
            }
            if ($request->has('start_time')) {
                $updateData['start_time'] = $request->start_time;
            }
            if ($request->has('end_time')) {
                $updateData['end_time'] = $request->end_time;
            }

            // Tarification
            if ($request->has('is_free')) {
                $updateData['is_free'] = $request->boolean('is_free');
                if ($request->boolean('is_free')) {
                    $updateData['ticket_price'] = null;
                }
            }
            if ($request->has('ticket_price') && !$request->boolean('is_free')) {
                $updateData['ticket_price'] = $request->ticket_price;
            }
            if ($request->has('price_min')) {
                $updateData['price_min'] = $request->price_min;
            }
            if ($request->has('price_max')) {
                $updateData['price_max'] = $request->price_max;
            }
            if ($request->has('tickets')) {
                $updateData['tickets'] = $request->tickets;
            }

            // Capacité
            if ($request->has('capacity')) {
                $updateData['capacity'] = $request->capacity;
            }
            if ($request->has('max_attendees')) {
                $updateData['max_attendees'] = $request->max_attendees;
            }

            // Artistes et sponsors
            if ($request->has('artist')) {
                $updateData['artist'] = $request->artist;
            }
            if ($request->has('artists')) {
                $artists = explode(',', $request->artists);
                $artists = array_map('trim', $artists);
                $artists = array_filter($artists);
                $updateData['artists'] = !empty($artists) ? json_encode($artists) : null;
            }
            if ($request->has('sponsors')) {
                $sponsors = explode(',', $request->sponsors);
                $sponsors = array_map('trim', $sponsors);
                $sponsors = array_filter($sponsors);
                $updateData['sponsors'] = !empty($sponsors) ? json_encode($sponsors) : null;
            }

            // Contact
            if ($request->has('contact_phone')) {
                $updateData['contact_phone'] = $request->contact_phone;
            }
            if ($request->has('contact_email')) {
                $updateData['contact_email'] = $request->contact_email;
            }
            if ($request->has('website_url')) {
                $updateData['website_url'] = $request->website_url;
            }

            // Réseaux sociaux
            if ($request->has('facebook_url')) {
                $updateData['facebook_url'] = $request->facebook_url;
            }
            if ($request->has('instagram_url')) {
                $updateData['instagram_url'] = $request->instagram_url;
            }
            if ($request->has('twitter_url')) {
                $updateData['twitter_url'] = $request->twitter_url;
            }
            if ($request->has('social_links')) {
                $updateData['social_links'] = $request->social_links;
            }

            // Options avancées
            if ($request->has('requirements')) {
                $updateData['requirements'] = $request->requirements;
            }
            if ($request->has('is_featured') && $user->role === 'admin') {
                $updateData['is_featured'] = $request->boolean('is_featured');
            }
            if ($request->has('featured') && $user->role === 'admin') {
                $updateData['featured'] = $request->boolean('featured');
            }

            // Gérer la suppression de l'image poster
            if ($request->has('remove_poster_image') && $request->remove_poster_image) {
                if ($event->poster_image) {
                    Storage::disk('public')->delete($event->poster_image);
                }
                $updateData['poster_image'] = null;
            }

            // Gérer l'upload de l'image poster
            if ($request->hasFile('poster_image')) {
                // Supprimer l'ancienne image
                if ($event->poster_image) {
                    Storage::disk('public')->delete($event->poster_image);
                }

                $image = $request->file('poster_image');
                $imageName = time() . '_poster_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('events/posters', $imageName, 'public');
                $updateData['poster_image'] = $imagePath;
            }

            // Gérer la suppression de l'image principale
            if ($request->has('remove_featured_image') && $request->remove_featured_image) {
                if ($event->featured_image) {
                    Storage::disk('public')->delete($event->featured_image);
                }
                $updateData['featured_image'] = null;
            }

            // Gérer l'upload de l'image principale
            if ($request->hasFile('featured_image')) {
                // Supprimer l'ancienne image
                if ($event->featured_image) {
                    Storage::disk('public')->delete($event->featured_image);
                }

                $image = $request->file('featured_image');
                $imageName = time() . '_featured_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('events/featured', $imageName, 'public');
                $updateData['featured_image'] = $imagePath;
            }

            // Gérer la suppression de la galerie d'images
            if ($request->has('remove_gallery_images') && $request->remove_gallery_images) {
                if ($event->gallery_images) {
                    $oldImages = is_string($event->gallery_images) ? json_decode($event->gallery_images, true) : $event->gallery_images;
                    if (is_array($oldImages)) {
                        foreach ($oldImages as $oldImage) {
                            Storage::disk('public')->delete($oldImage);
                        }
                    }
                }
                $updateData['gallery_images'] = null;
            }

            // Gérer l'upload de la galerie d'images
            if ($request->hasFile('gallery_images')) {
                // Supprimer les anciennes images de galerie si on remplace
                if ($event->gallery_images && !$request->has('remove_gallery_images')) {
                    $oldImages = is_string($event->gallery_images) ? json_decode($event->gallery_images, true) : $event->gallery_images;
                    if (is_array($oldImages)) {
                        foreach ($oldImages as $oldImage) {
                            Storage::disk('public')->delete($oldImage);
                        }
                    }
                }

                $galleryImages = [];
                foreach ($request->file('gallery_images') as $index => $image) {
                    $imageName = time() . '_gallery_' . $index . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                    $imagePath = $image->storeAs('events/gallery', $imageName, 'public');
                    $galleryImages[] = $imagePath;
                }
                $updateData['gallery_images'] = json_encode($galleryImages);
            }

            // Mettre à jour l'événement
            $event->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Événement mis à jour avec succès',
                'event' => $event->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un événement
     */
    public function destroy($id)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            $event = Event::findOrFail($id);

            // Vérifier que l'utilisateur peut supprimer cet événement
            $user = auth('sanctum')->user();
            if ($event->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à supprimer cet événement'
                ], 403);
            }

            // Supprimer les images associées
            if ($event->featured_image) {
                Storage::disk('public')->delete($event->featured_image);
            }

            if ($event->poster_image) {
                Storage::disk('public')->delete($event->poster_image);
            }

            if ($event->gallery_images) {
                $galleryImages = is_array($event->gallery_images) ? $event->gallery_images : json_decode($event->gallery_images, true);
                if (is_array($galleryImages)) {
                    foreach ($galleryImages as $imagePath) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }

            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Événement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approuver un événement (admin uniquement)
     */
    public function approve($id)
    {
        try {
            // Vérifier l'authentification
            if (!auth('sanctum')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            $user = auth('sanctum')->user();

            // Vérifier que l'utilisateur est admin
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les administrateurs peuvent approuver des événements'
                ], 403);
            }

            $event = Event::findOrFail($id);

            // Vérifier que l'événement est en attente
            if ($event->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet événement n\'est pas en attente d\'approbation'
                ], 400);
            }

            // Approuver l'événement (changer seulement le statut)
            $event->update([
                'status' => 'published'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Événement approuvé avec succès',
                'event' => $event->fresh() // Récupérer les données mises à jour
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'approbation de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier si un événement est en favoris
     */
    public function checkFavoriteStatus($id)
    {
        try {
            $user = auth('sanctum')->user();
            $event = Event::findOrFail($id);

            $isFavorite = $user->likedEvents()->where('event_id', $id)->exists();

            return response()->json([
                'success' => true,
                'is_favorite' => $isFavorite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification des favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ajouter/Retirer un événement des favoris
     */
    public function toggleFavorite($id)
    {
        try {
            $user = auth('sanctum')->user();
            $event = Event::findOrFail($id);

            $isFavorite = $user->likedEvents()->where('event_id', $id)->exists();

            if ($isFavorite) {
                $user->likedEvents()->detach($id);
            } else {
                $user->likedEvents()->attach($id);
            }

            return response()->json([
                'success' => true,
                'is_favorite' => !$isFavorite,
                'message' => !$isFavorite ? 'Événement ajouté aux favoris' : 'Événement retiré des favoris'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification des favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

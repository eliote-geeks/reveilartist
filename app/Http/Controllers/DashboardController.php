<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Payment;
use App\Models\Sound;
use App\Models\Event;
use App\Models\User;
use App\Models\CommissionSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Afficher le dashboard
     */
    public function index()
    {
        return view('dashboard');
    }

    /**
     * Obtenir les statistiques générales
     */
    public function getStats()
    {
        try {
            // Statistiques utilisateurs (basées sur la vraie migration)
            $totalUsers = User::count();
            $activeUsers = User::where('status', 'active')->count();
            $artistsCount = User::where('role', 'artist')->count();
            $producersCount = User::where('role', 'producer')->count();

            // Statistiques sons (basées sur la vraie migration)
            $totalSounds = Sound::count();
            $publishedSounds = Sound::where('status', 'published')->count();
            $draftSounds = Sound::where('status', 'draft')->count();
            $pendingSounds = Sound::where('status', 'pending')->count();

            // Compter les écoutes et likes totaux
            $totalPlays = Sound::sum('plays_count') ?? 0;
            $totalDownloads = Sound::sum('downloads_count') ?? 0;
            $totalLikes = Sound::sum('likes_count') ?? 0;

            // Statistiques événements (basées sur la vraie migration)
            $totalEvents = Event::count();
            $publishedEvents = Event::where('status', 'published')->count();
            $activeEvents = Event::where('status', 'active')->count();
            $pendingEvents = Event::where('status', 'pending')->count();
            $draftEvents = Event::where('status', 'draft')->count();
            $completedEvents = Event::where('status', 'completed')->count();
            $cancelledEvents = Event::where('status', 'cancelled')->count();
            $totalTicketsSold = Event::sum('current_attendees') ?? 0;
            $totalEventRevenue = Payment::where('type', 'event')->where('status', 'completed')->sum('amount') ?? 0;

            // Statistiques de paiement basées sur le vrai modèle Payment
            $paymentStats = [
                'total_amount' => Payment::sum('amount') ?? 0,
                'total_payments' => Payment::count() ?? 0,
                'total_commission' => Payment::sum('commission_amount') ?? 0,
                'average_amount' => Payment::avg('amount') ?? 0,
                'completed_payments' => Payment::where('status', 'completed')->count() ?? 0,
                'pending_payments' => Payment::where('status', 'pending')->count() ?? 0,
                'failed_payments' => Payment::where('status', 'failed')->count() ?? 0,
                'refunded_payments' => Payment::where('status', 'refunded')->count() ?? 0,
                'cancelled_payments' => Payment::where('status', 'cancelled')->count() ?? 0,
                'sound_payments' => Payment::where('type', 'sound')->count() ?? 0,
                'event_payments' => Payment::where('type', 'event')->count() ?? 0,
                'seller_amount' => Payment::sum('seller_amount') ?? 0,
            ];

            // Calculer les revenus par type
            $soundRevenue = Payment::where('type', 'sound')->where('status', 'completed')->sum('amount') ?? 0;
            $eventRevenue = Payment::where('type', 'event')->where('status', 'completed')->sum('amount') ?? 0;

            $stats = [
                'payment_stats' => $paymentStats,
                'general_stats' => [
                    'total_users' => $totalUsers,
                    'total_sounds' => $totalSounds,
                    'total_events' => $totalEvents,
                    'active_users' => $activeUsers,
                    'published_sounds' => $publishedSounds,
                    'published_events' => $publishedEvents,
                    'active_events' => $activeEvents,
                    'pending_events' => $pendingEvents,
                    'draft_events' => $draftEvents,
                    'completed_events' => $completedEvents,
                    'cancelled_events' => $cancelledEvents,
                    'artists_count' => $artistsCount,
                    'producers_count' => $producersCount,
                    'draft_sounds' => $draftSounds,
                    'pending_sounds' => $pendingSounds,
                    'total_plays' => $totalPlays,
                    'total_downloads' => $totalDownloads,
                    'total_likes' => $totalLikes,
                    'total_tickets_sold' => $totalTicketsSold,
                    'total_event_revenue' => $totalEventRevenue,
                    'sound_revenue' => $soundRevenue,
                    'event_revenue' => $eventRevenue,
                ]
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erreur getStats: ' . $e->getMessage());

            // Retourner des statistiques par défaut en cas d'erreur
            return response()->json([
                'payment_stats' => [
                    'total_amount' => 0,
                    'total_payments' => 0,
                    'total_commission' => 0,
                    'average_amount' => 0,
                    'completed_payments' => 0,
                    'pending_payments' => 0,
                    'failed_payments' => 0,
                    'refunded_payments' => 0,
                    'cancelled_payments' => 0,
                    'sound_payments' => 0,
                    'event_payments' => 0,
                    'seller_amount' => 0,
                ],
                'general_stats' => [
                    'total_users' => 0,
                    'total_sounds' => 0,
                    'total_events' => 0,
                    'active_users' => 0,
                    'published_sounds' => 0,
                    'published_events' => 0,
                    'active_events' => 0,
                    'pending_events' => 0,
                    'draft_events' => 0,
                    'completed_events' => 0,
                    'cancelled_events' => 0,
                    'artists_count' => 0,
                    'producers_count' => 0,
                    'draft_sounds' => 0,
                    'pending_sounds' => 0,
                    'total_plays' => 0,
                    'total_downloads' => 0,
                    'total_likes' => 0,
                    'total_tickets_sold' => 0,
                    'total_event_revenue' => 0,
                    'sound_revenue' => 0,
                    'event_revenue' => 0,
                ]
            ]);
        }
    }

    /**
     * Obtenir les données pour les sons
     */
    public function getSounds()
    {
        try {
            // Utiliser les vraies colonnes basées sur la migration
            $sounds = Sound::with(['user', 'category'])
                ->select([
                    'id', 'title', 'slug', 'description', 'user_id', 'category_id',
                    'file_path', 'cover_image', 'duration', 'genre', 'price',
                    'is_free', 'is_featured', 'status', 'plays_count', 'downloads_count',
                    'likes_count', 'tags', 'bpm', 'key', 'credits', 'created_at', 'updated_at'
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($sound) {
                    return [
                        'id' => $sound->id,
                        'title' => $sound->title,
                        'slug' => $sound->slug,
                        'description' => $sound->description,
                        'user_id' => $sound->user_id,
                        'category_id' => $sound->category_id,
                        'file_path' => $sound->file_path,
                        'file_url' => $sound->file_url, // Utilise l'accesseur du modèle
                        'cover_image' => $sound->cover_image,
                        'cover_image_url' => $sound->cover_image_url, // Utilise l'accesseur du modèle
                        'duration' => $sound->duration,
                        'formatted_duration' => $sound->formatted_duration, // Utilise l'accesseur du modèle
                        'genre' => $sound->genre,
                        'price' => $sound->price,
                        'formatted_price' => $sound->formatted_price, // Utilise l'accesseur du modèle
                        'is_free' => $sound->is_free,
                        'is_featured' => $sound->is_featured,
                        'status' => $sound->status,
                        'plays_count' => $sound->plays_count ?? 0,
                        'downloads_count' => $sound->downloads_count ?? 0,
                        'likes_count' => $sound->likes_count ?? 0,
                        'tags' => $sound->tags,
                        'bpm' => $sound->bpm,
                        'key' => $sound->key,
                        'credits' => $sound->credits,
                        'created_at' => $sound->created_at,
                        'updated_at' => $sound->updated_at,
                        // Relations
                        'user' => $sound->user ? [
                            'id' => $sound->user->id,
                            'name' => $sound->user->name,
                            'email' => $sound->user->email,
                            'role' => $sound->user->role ?? 'user',
                        ] : null,
                        'category' => $sound->category ? [
                            'id' => $sound->category->id,
                            'name' => $sound->category->name,
                        ] : null,
                        // Données pour l'affichage compatibles avec l'ancien format
                        'artist' => $sound->user ? $sound->user->name : 'Artiste inconnu',
                        'artist_name' => $sound->user ? $sound->user->name : 'Artiste inconnu',
                    ];
                });

            return response()->json($sounds);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erreur getSounds: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur chargement sons', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtenir les données pour les événements
     */
    public function getEvents()
    {
        try {
            $events = Event::with(['user'])
                ->select([
                    'id', 'title', 'slug', 'description', 'user_id', 'venue',
                    'address', 'city', 'country', 'event_date', 'start_time', 'end_time',
                    'poster_image', 'category', 'status', 'is_featured',
                    'is_free', 'ticket_price', 'max_attendees', 'current_attendees',
                    'created_at', 'updated_at'
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($event) {
                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'slug' => $event->slug,
                        'description' => $event->description,
                        'user_id' => $event->user_id,
                        'venue' => $event->venue,
                        'location' => $event->venue,
                        'address' => $event->address,
                        'city' => $event->city,
                        'country' => $event->country,
                        'event_date' => $event->event_date ? $event->event_date->format('Y-m-d') : null,
                        'date' => $event->event_date ? $event->event_date->format('Y-m-d') : null,
                        'start_time' => $event->start_time,
                        'end_time' => $event->end_time,
                        'poster_image' => $event->poster_image,
                        'poster_image_url' => $event->poster_image ? asset('storage/' . $event->poster_image) : null,
                        'featured_image' => $event->poster_image,
                        'featured_image_url' => $event->poster_image ? asset('storage/' . $event->poster_image) : null,
                        'category' => $event->category,
                        'status' => $event->status,
                        'is_featured' => $event->is_featured,
                        'is_free' => $event->is_free,
                        'ticket_price' => $event->ticket_price,
                        'price_min' => $event->ticket_price,
                        'price_max' => $event->ticket_price,
                        'max_attendees' => $event->max_attendees,
                        'capacity' => $event->max_attendees,
                        'current_attendees' => $event->current_attendees ?? 0,
                        'views_count' => 0,
                        'artist' => null,
                        'artists' => null,
                        'formatted_date' => $event->event_date ? $event->event_date->format('d/m/Y') : null,
                        'formatted_time' => $event->start_time ? date('H:i', strtotime($event->start_time)) : null,
                        'formatted_price' => $event->is_free ? 'Gratuit' : ($event->ticket_price ? number_format($event->ticket_price, 0, ',', ' ') . ' XAF' : 'Prix non défini'),
                        'availability_status' => 'available',
                        'tickets_sold_percentage' => $event->max_attendees ? round(($event->current_attendees / $event->max_attendees) * 100, 1) : 0,
                        'created_at' => $event->created_at,
                        'updated_at' => $event->updated_at,
                        // Relations
                        'user' => $event->user ? [
                            'id' => $event->user->id,
                            'name' => $event->user->name,
                            'email' => $event->user->email,
                            'role' => $event->user->role ?? 'user',
                        ] : null,
                    ];
                });

            return response()->json($events);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erreur getEvents: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur chargement événements', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtenir les données pour les utilisateurs
     */
    public function getUsers()
    {
        try {
            $users = User::orderBy('created_at', 'desc')->get();

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur chargement utilisateurs'], 500);
        }
    }

    /**
     * Obtenir les paramètres de commission (simplifié)
     */
    public function getCommission()
    {
        try {
            $rates = [
                'sound_commission' => CommissionSetting::getValue('sound_commission', 15),
                'event_commission' => CommissionSetting::getValue('event_commission', 10)
            ];

            return response()->json(['rates' => $rates]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur'], 500);
        }
    }

    /**
     * Mettre à jour les commissions (simplifié)
     */
    public function updateCommission(Request $request)
    {
        try {
            $rates = $request->input('rates', []);

            if (isset($rates['sound_commission'])) {
                CommissionSetting::setValue('sound_commission', $rates['sound_commission']);
            }

            if (isset($rates['event_commission'])) {
                CommissionSetting::setValue('event_commission', $rates['event_commission']);
            }

            $updatedRates = [
                'sound_commission' => CommissionSetting::getValue('sound_commission', 15),
                'event_commission' => CommissionSetting::getValue('event_commission', 10)
            ];

            return response()->json(['rates' => $updatedRates, 'message' => 'Mis à jour']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur mise à jour'], 500);
        }
    }

    /**
     * Exporter les statistiques en CSV
     */
    public function exportStats(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $payments = Payment::with(['user', 'seller', 'sound', 'event'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'statistiques_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');

            // BOM pour UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // En-têtes CSV
            fputcsv($file, [
                'Date',
                'ID Transaction',
                'Type',
                'Produit/Événement',
                'Acheteur',
                'Vendeur',
                'Montant Total (€)',
                'Commission (€)',
                'Montant Vendeur (€)',
                'Taux Commission (%)',
                'Méthode Paiement',
                'Statut',
            ], ';');

            // Données
            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->created_at->format('d/m/Y H:i'),
                    $payment->transaction_id,
                    $payment->type === 'sound' ? 'Son' : 'Événement',
                    $payment->product_name,
                    $payment->user->name ?? 'N/A',
                    $payment->seller->name ?? 'N/A',
                    number_format($payment->amount, 2, ',', ' '),
                    number_format($payment->commission_amount, 2, ',', ' '),
                    number_format($payment->seller_amount, 2, ',', ' '),
                    number_format($payment->commission_rate, 1, ',', ' '),
                    ucfirst($payment->payment_method),
                    $payment->status_label,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Calculer une commission prévisionnelle
     */
    public function calculateCommission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:sound,event',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        try {
            $amount = $validated['amount'];
            $type = $validated['type'];

            // Utiliser le taux personnalisé ou celui configuré
            $commissionRate = $validated['commission_rate'] ??
                             CommissionSetting::getRate($type . '_commission');

            $commissionAmount = ($amount * $commissionRate) / 100;
            $sellerAmount = $amount - $commissionAmount;

            return response()->json([
                'amount' => round($amount, 2),
                'commission_rate' => round($commissionRate, 2),
                'commission_amount' => round($commissionAmount, 2),
                'seller_amount' => round($sellerAmount, 2),
                'type' => $type,
                'formatted' => [
                    'amount' => number_format($amount, 2, ',', ' ') . ' €',
                    'commission_amount' => number_format($commissionAmount, 2, ',', ' ') . ' €',
                    'seller_amount' => number_format($sellerAmount, 2, ',', ' ') . ' €',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du calcul de la commission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

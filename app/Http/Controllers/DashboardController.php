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
    public function getStats(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        // Statistiques des paiements
        $paymentStats = Payment::selectRaw('
            COUNT(*) as total_payments,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(SUM(commission_amount), 0) as total_commission,
            COALESCE(SUM(seller_amount), 0) as total_seller_amount,
            COALESCE(AVG(amount), 0) as average_amount,
            COUNT(CASE WHEN status = \'completed\' THEN 1 END) as completed_payments,
            COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_payments,
            COUNT(CASE WHEN status = \'failed\' THEN 1 END) as failed_payments,
            COUNT(CASE WHEN status = \'refunded\' THEN 1 END) as refunded_payments,
            COUNT(CASE WHEN type = \'sound\' THEN 1 END) as sound_payments,
            COUNT(CASE WHEN type = \'event\' THEN 1 END) as event_payments
        ')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->first();

        // Statistiques générales
        $generalStats = [
            'total_users' => User::count(),
            'total_sounds' => Sound::count(),
            'total_events' => Event::count(),
            'active_users' => User::where('status', 'active')->count(),
            'published_sounds' => Sound::where('status', 'published')->count(),
            'published_events' => Event::where('status', 'published')->count(),
        ];

        // Évolution quotidienne des paiements (7 derniers jours)
        $dailyStats = Payment::selectRaw('
            DATE(created_at) as date,
            COUNT(*) as count,
            COALESCE(SUM(amount), 0) as amount,
            COALESCE(SUM(commission_amount), 0) as commission
        ')
        ->where('created_at', '>=', now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Top vendeurs (artistes/organisateurs)
        $topSellers = Payment::selectRaw('
            seller_id,
            users.name as seller_name,
            users.role as seller_role,
            COUNT(*) as sales_count,
            COALESCE(SUM(seller_amount), 0) as total_earnings
        ')
        ->join('users', 'payments.seller_id', '=', 'users.id')
        ->where('payments.status', 'completed')
        ->whereBetween('payments.created_at', [$startDate, $endDate])
        ->groupBy('seller_id', 'users.name', 'users.role')
        ->orderBy('total_earnings', 'desc')
        ->limit(10)
        ->get();

        // Répartition par méthode de paiement
        $paymentMethods = Payment::selectRaw('
            payment_method,
            COUNT(*) as count,
            COALESCE(SUM(amount), 0) as total_amount
        ')
        ->where('status', 'completed')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('payment_method')
        ->get();

        return response()->json([
            'payment_stats' => $paymentStats,
            'general_stats' => $generalStats,
            'daily_stats' => $dailyStats,
            'top_sellers' => $topSellers,
            'payment_methods' => $paymentMethods,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }

    /**
     * Obtenir les données pour les sons
     */
    public function getSounds(Request $request): JsonResponse
    {
        $query = Sound::with(['user', 'payments'])
            ->withCount(['payments as total_sales' => function($query) {
                $query->where('status', 'completed');
            }])
            ->withSum(['payments as total_revenue' => function($query) {
                $query->where('status', 'completed');
            }], 'amount');

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $sounds = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json($sounds);
    }

    /**
     * Obtenir les données pour les événements
     */
    public function getEvents(Request $request): JsonResponse
    {
        $query = Event::with(['user', 'payments'])
            ->withCount(['payments as total_sales' => function($query) {
                $query->where('status', 'completed');
            }])
            ->withSum(['payments as total_revenue' => function($query) {
                $query->where('status', 'completed');
            }], 'amount');

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('venue', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $events = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json($events);
    }

    /**
     * Obtenir les données pour les utilisateurs
     */
    public function getUsers(Request $request): JsonResponse
    {
        $query = User::withCount(['sounds', 'events'])
            ->withSum(['sales as total_revenue' => function($query) {
                $query->where('status', 'completed');
            }], 'seller_amount');

        // Filtres
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Obtenir les paramètres de commission
     */
    public function getCommissionSettings(): JsonResponse
    {
        $settings = CommissionSetting::active()->orderBy('key')->get();

        return response()->json([
            'settings' => $settings,
            'rates' => CommissionSetting::getAllRates()
        ]);
    }

    /**
     * Mettre à jour les paramètres de commission
     */
    public function updateCommissionSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rates' => 'required|array',
            'rates.*' => 'numeric|min:0|max:100',
        ]);

        try {
            $updated = [];

            foreach ($validated['rates'] as $key => $value) {
                if (CommissionSetting::updateRate($key, $value)) {
                    $updated[] = $key;
                }
            }

            return response()->json([
                'message' => 'Taux de commission mis à jour avec succès',
                'updated_keys' => $updated,
                'rates' => CommissionSetting::getAllRates()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour des taux de commission',
                'error' => $e->getMessage()
            ], 500);
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

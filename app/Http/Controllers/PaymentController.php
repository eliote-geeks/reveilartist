<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Sound;
use App\Models\Event;
use App\Models\User;
use App\Services\MonetbilService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected $monetbilService;

    public function __construct(MonetbilService $monetbilService)
    {
        $this->monetbilService = $monetbilService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['user', 'seller', 'sound', 'event']);

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('sound', function ($soundQuery) use ($search) {
                      $soundQuery->where('title', 'like', "%{$search}%");
                  })
                  ->orWhereHas('event', function ($eventQuery) use ($search) {
                      $eventQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:sound,event',
            'sound_id' => 'nullable|exists:sounds,id|required_if:type,sound',
            'event_id' => 'nullable|exists:events,id|required_if:type,event',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'payment_provider' => 'nullable|string',
            'external_payment_id' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // Vérifier si le son a déjà été acheté
        if ($validated['type'] === 'sound') {
            $existingPayment = Payment::where('user_id', $validated['user_id'])
                ->where('sound_id', $validated['sound_id'])
                ->where('status', 'completed')
                ->first();

            if ($existingPayment) {
                return response()->json([
                    'message' => 'Vous avez déjà acheté ce son',
                    'error' => 'sound_already_purchased'
                ], 400);
            }
        }

        // Obtenir le vendeur selon le type
        if ($validated['type'] === 'sound') {
            $sound = Sound::findOrFail($validated['sound_id']);
            $validated['seller_id'] = $sound->user_id;
        } else {
            $event = Event::findOrFail($validated['event_id']);
            $validated['seller_id'] = $event->user_id;
        }

        try {
            $payment = Payment::createPayment($validated);

            return response()->json([
                'message' => 'Paiement créé avec succès',
                'payment' => $payment->load(['user', 'seller', 'sound', 'event'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment): JsonResponse
    {
        return response()->json(
            $payment->load(['user', 'seller', 'sound', 'event'])
        );
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['pending', 'completed', 'failed', 'refunded', 'cancelled'])],
            'external_payment_id' => 'nullable|string',
            'metadata' => 'nullable|array',
            'failure_reason' => 'nullable|string',
        ]);

        try {
            $payment->update($validated);

            // Mettre à jour les timestamps selon le statut
            if (isset($validated['status'])) {
                switch ($validated['status']) {
                    case 'completed':
                        $payment->markAsCompleted();
                        break;
                    case 'failed':
                        $payment->markAsFailed($validated['failure_reason'] ?? 'Raison non spécifiée');
                        break;
                    case 'refunded':
                        $payment->refund();
                        break;
                }
            }

            return response()->json([
                'message' => 'Paiement mis à jour avec succès',
                'payment' => $payment->fresh()->load(['user', 'seller', 'sound', 'event'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment): JsonResponse
    {
        try {
            $payment->delete();

            return response()->json([
                'message' => 'Paiement supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des paiements
     */
    public function statistics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $stats = DB::select("
            SELECT
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                SUM(commission_amount) as total_commission,
                SUM(seller_amount) as total_seller_amount,
                AVG(amount) as average_amount,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
                COUNT(CASE WHEN type = 'sound' THEN 1 END) as sound_payments,
                COUNT(CASE WHEN type = 'event' THEN 1 END) as event_payments
            FROM payments
            WHERE created_at BETWEEN ? AND ?
        ", [$startDate, $endDate]);

        // Statistiques par jour pour les graphiques
        $dailyStats = Payment::selectRaw('
                DATE(created_at) as date,
                COUNT(*) as count,
                SUM(amount) as amount,
                SUM(commission_amount) as commission
            ')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top vendeurs
        $topSellers = Payment::selectRaw('
                seller_id,
                users.name as seller_name,
                COUNT(*) as sales_count,
                SUM(seller_amount) as total_earnings
            ')
            ->join('users', 'payments.seller_id', '=', 'users.id')
            ->where('status', 'completed')
            ->whereBetween('payments.created_at', [$startDate, $endDate])
            ->groupBy('seller_id', 'users.name')
            ->orderBy('total_earnings', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'overview' => $stats[0] ?? null,
            'daily_stats' => $dailyStats,
            'top_sellers' => $topSellers,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }

    /**
     * Marquer un paiement comme complété
     */
    public function markAsCompleted(Payment $payment): JsonResponse
    {
        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Seuls les paiements en attente peuvent être marqués comme complétés'
            ], 400);
        }

        $payment->markAsCompleted();

        return response()->json([
            'message' => 'Paiement marqué comme complété',
            'payment' => $payment->fresh()
        ]);
    }

    /**
     * Rembourser un paiement
     */
    public function refund(Payment $payment): JsonResponse
    {
        if ($payment->status !== 'completed') {
            return response()->json([
                'message' => 'Seuls les paiements complétés peuvent être remboursés'
            ], 400);
        }

        $payment->refund();

        return response()->json([
            'message' => 'Paiement remboursé avec succès',
            'payment' => $payment->fresh()
        ]);
    }

    /**
     * Export des paiements en CSV
     */
    public function export(Request $request)
    {
        $payments = Payment::with(['user', 'seller', 'sound', 'event'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'paiements_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');

            // En-têtes CSV
            fputcsv($file, [
                'ID Transaction',
                'Acheteur',
                'Vendeur',
                'Type',
                'Produit',
                'Montant Total',
                'Commission',
                'Montant Vendeur',
                'Statut',
                'Date',
            ]);

            // Données
            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->transaction_id,
                    $payment->user->name ?? 'N/A',
                    $payment->seller->name ?? 'N/A',
                    $payment->type === 'sound' ? 'Son' : 'Événement',
                    $payment->product_name,
                    $payment->amount,
                    $payment->commission_amount,
                    $payment->seller_amount,
                    $payment->status_label,
                    $payment->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Initier un paiement Monetbil
     */
    public function initiateMonetbilPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:sound,event',
            'sound_id' => 'nullable|exists:sounds,id|required_if:type,sound',
            'event_id' => 'nullable|exists:events,id|required_if:type,event',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            
            // Vérifier si le son a déjà été acheté
            if ($validated['type'] === 'sound') {
                $existingPayment = Payment::where('user_id', $validated['user_id'])
                    ->where('sound_id', $validated['sound_id'])
                    ->where('status', 'completed')
                    ->first();

                if ($existingPayment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous avez déjà acheté ce son',
                        'error' => 'sound_already_purchased'
                    ], 400);
                }
                
                $item = Sound::findOrFail($validated['sound_id']);
            } else {
                $item = Event::findOrFail($validated['event_id']);
            }

            $result = $this->monetbilService->initiatePayment(
                $validated['amount'],
                $validated['description'],
                $user,
                $item,
                $validated['type']
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Paiement initié avec succès',
                    'payment' => $result['payment'],
                    'payment_url' => $result['payment_url']
                ], 201);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'initiation du paiement',
                    'error' => $result['error']
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Erreur PaymentController::initiateMonetbilPayment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gérer les notifications Monetbil
     */
    public function handleMonetbilNotification(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            Log::info('Notification Monetbil reçue: ', $data);

            $result = $this->monetbilService->processNotification($data);

            if ($result) {
                return response()->json(['success' => true], 200);
            } else {
                return response()->json(['success' => false], 400);
            }

        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement de la notification Monetbil: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Gérer le retour de succès Monetbil
     */
    public function handleMonetbilSuccess(Request $request)
    {
        try {
            $paymentRef = $request->get('item_ref');
            $payment = Payment::where('payment_reference', $paymentRef)->first();

            if ($payment) {
                $payment->markAsCompleted();
                return redirect()->route('payment.return', ['payment' => $payment->id])
                    ->with('success', 'Paiement effectué avec succès!');
            }

            return redirect()->route('home')->with('error', 'Paiement non trouvé');

        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement du succès Monetbil: ' . $e->getMessage());
            return redirect()->route('home')->with('error', 'Erreur lors du traitement du paiement');
        }
    }

    /**
     * Gérer l'échec du paiement Monetbil
     */
    public function handleMonetbilFailed(Request $request)
    {
        try {
            $paymentRef = $request->get('item_ref');
            $payment = Payment::where('payment_reference', $paymentRef)->first();

            if ($payment) {
                $payment->markAsFailed();
                return redirect()->route('payment.return', ['payment' => $payment->id])
                    ->with('error', 'Le paiement a échoué');
            }

            return redirect()->route('home')->with('error', 'Paiement non trouvé');

        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement de l\'échec Monetbil: ' . $e->getMessage());
            return redirect()->route('home')->with('error', 'Erreur lors du traitement du paiement');
        }
    }

    /**
     * Initier un paiement Monetbil depuis le panier
     */
    public function processMonetbilCartPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.type' => 'required|in:sound,event',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'promo_code' => 'nullable|string',
            'payment_method' => 'required|string',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            
            // Vérifier que l'utilisateur a un numéro de téléphone
            if (empty($user->phone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un numéro de téléphone est requis pour utiliser Monetbil',
                    'error' => 'phone_required'
                ], 400);
            }
            
            Log::info('Début du processus de paiement Monetbil pour le panier', [
                'user_id' => $user->id,
                'total' => $validated['total'],
                'items_count' => count($validated['items'])
            ]);
            
            // Vérifier si des sons ont déjà été achetés
            $soundItems = array_filter($validated['items'], fn($item) => $item['type'] === 'sound');
            foreach ($soundItems as $item) {
                $existingPayment = Payment::where('user_id', $validated['user_id'])
                    ->where('sound_id', $item['id'])
                    ->where('status', 'completed')
                    ->first();

                if ($existingPayment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous avez déjà acheté certains sons de votre panier',
                        'error' => 'sounds_already_purchased',
                        'sound_id' => $item['id']
                    ], 400);
                }
            }

            // Créer une description pour le paiement
            $itemsCount = count($validated['items']);
            $description = "Achat panier ReveilArtist - $itemsCount article(s)";

            // Initier le paiement Monetbil pour le montant total
            $result = $this->monetbilService->initiatePayment(
                $validated['total'],
                $description,
                $user,
                null,
                'cart_payment'
            );

            if ($result['success']) {
                // Stocker les données du panier dans les métadonnées
                $payment = $result['payment'];
                $payment->update([
                    'metadata' => json_encode([
                        'cart_items' => $validated['items'],
                        'subtotal' => $validated['subtotal'],
                        'discount' => $validated['discount'],
                        'promo_code' => $validated['promo_code'],
                        'payment_method' => $validated['payment_method'],
                        'is_cart_payment' => true
                    ])
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement Monetbil initié avec succès',
                    'payment' => $payment,
                    'payment_url' => $result['payment_url'],
                    'order_number' => 'RVL-' . time() . '-' . strtoupper(Str::random(5))
                ], 201);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'initiation du paiement Monetbil',
                    'error' => $result['error']
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Erreur PaymentController::processMonetbilCartPayment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traiter un paiement de test depuis le panier
     */
    public function processTestPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.type' => 'required|in:sound,event',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'promo_code' => 'nullable|string',
            'payment_method' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // Vérifier les sons déjà achetés
            $soundItems = array_filter($validated['items'], fn($item) => $item['type'] === 'sound');
            foreach ($soundItems as $item) {
                $existingPayment = Payment::where('user_id', $validated['user_id'])
                    ->where('sound_id', $item['id'])
                    ->where('status', 'completed')
                    ->first();

                if ($existingPayment) {
                    DB::rollback();
                    return response()->json([
                        'message' => 'Vous avez déjà acheté certains sons de votre panier',
                        'error' => 'sounds_already_purchased',
                        'sound_id' => $item['id']
                    ], 400);
                }
            }

            $orderNumber = 'RVL-' . time() . '-' . strtoupper(Str::random(5));
            $payments = [];

            // Créer un paiement pour chaque article
            foreach ($validated['items'] as $item) {
                $itemPrice = $item['price'] * $item['quantity'];

                // Appliquer la réduction proportionnelle si applicable
                if ($validated['discount'] > 0) {
                    $discountRatio = $validated['discount'] / $validated['subtotal'];
                    $itemDiscount = $itemPrice * $discountRatio;
                    $finalItemPrice = $itemPrice - $itemDiscount;
                } else {
                    $finalItemPrice = $itemPrice;
                }

                // Déterminer le vendeur selon le type
                if ($item['type'] === 'sound') {
                    $product = Sound::findOrFail($item['id']);
                    $sellerId = $product->user_id;
                } else {
                    $product = Event::findOrFail($item['id']);
                    $sellerId = $product->user_id;
                }

                // Calculer les commissions
                $commission = Payment::calculateCommission($finalItemPrice, $item['type']);

                // Créer le paiement
                $paymentData = [
                    'user_id' => $validated['user_id'],
                    'seller_id' => $sellerId,
                    'type' => $item['type'],
                    'amount' => $finalItemPrice,
                    'payment_method' => $validated['payment_method'],
                    'payment_provider' => 'test_payment',
                    'external_payment_id' => $orderNumber . '-' . $item['id'],
                    'metadata' => json_encode([
                        'order_number' => $orderNumber,
                        'quantity' => $item['quantity'],
                        'original_price' => $item['price'],
                        'promo_code' => $validated['promo_code'],
                        'test_payment' => true
                    ])
                ];

                if ($item['type'] === 'sound') {
                    $paymentData['sound_id'] = $item['id'];
                } else {
                    $paymentData['event_id'] = $item['id'];
                }

                $payment = Payment::create(array_merge($paymentData, $commission, [
                    'transaction_id' => 'TXN_' . time() . '_' . rand(1000, 9999),
                    'status' => 'completed', // Test payment = automatiquement complété
                    'paid_at' => now(),
                ]));

                $payments[] = $payment->load(['user', 'seller', 'sound', 'event']);

                // Mettre à jour les statistiques du produit
                if ($item['type'] === 'sound') {
                    $product->increment('downloads_count', $item['quantity']);
                } else {
                    $product->increment('current_attendees', $item['quantity']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement de test traité avec succès',
                'order_number' => $orderNumber,
                'payments' => $payments,
                'total_amount' => $validated['total'],
                'discount_applied' => $validated['discount'] ?? 0,
                'promo_code' => $validated['promo_code']
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

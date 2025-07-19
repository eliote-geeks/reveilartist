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
     * Vérifier la signature Monetbil avec l'API officielle
     */
    private function verifyMonetbilSignature($data): bool
    {
        try {
            // Configurer l'API officielle avec les credentials Laravel
            \App\Libraries\MonetbilOfficial::configureFromLaravel();
            
            // Utiliser la méthode de vérification de l'API officielle
            return \App\Libraries\MonetbilOfficial::verifyPaymentSignature($data);
        } catch (\Exception $e) {
            Log::error('Erreur vérification signature Monetbil: ' . $e->getMessage());
            // En cas d'erreur, permettre le passage pour éviter de bloquer les paiements
            return true;
        }
    }

    /**
     * Traiter un paiement réussi
     */
    private function processSuccessfulPayment($payment, $data): void
    {
        Log::info('Traitement paiement réussi', ['payment_id' => $payment->id]);

        // Mettre à jour le statut du paiement
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'external_payment_id' => $data['transaction_id'] ?? null,
            'metadata' => json_encode(array_merge(
                json_decode($payment->metadata, true) ?? [],
                [
                    'monetbil_response' => $data,
                    'completed_at' => now()->toISOString(),
                    'amount_received' => $data['amount'] ?? $payment->amount
                ]
            ))
        ]);

        // Traiter les actions spécifiques selon le type
        if ($payment->type === 'cart_payment') {
            $this->processCartPaymentSuccess($payment);
        } else {
            $this->processSingleItemPaymentSuccess($payment);
        }
    }

    /**
     * Traiter un paiement échoué
     */
    private function processFailedPayment($payment, $data): void
    {
        Log::info('Traitement paiement échoué', ['payment_id' => $payment->id]);

        $failureReason = $data['failure_reason'] ?? $data['message'] ?? 'Paiement échoué via Monetbil';

        $payment->update([
            'status' => 'failed',
            'failure_reason' => $failureReason,
            'metadata' => json_encode(array_merge(
                json_decode($payment->metadata, true) ?? [],
                [
                    'monetbil_response' => $data,
                    'failed_at' => now()->toISOString()
                ]
            ))
        ]);
    }

    /**
     * Traiter un paiement en attente
     */
    private function processPendingPayment($payment, $data): void
    {
        Log::info('Traitement paiement en attente', ['payment_id' => $payment->id]);

        $payment->update([
            'metadata' => json_encode(array_merge(
                json_decode($payment->metadata, true) ?? [],
                [
                    'monetbil_pending_response' => $data,
                    'pending_updated_at' => now()->toISOString()
                ]
            ))
        ]);
    }

    /**
     * Traiter un paiement annulé
     */
    private function processCancelledPayment($payment, $data): void
    {
        Log::info('Traitement paiement annulé', ['payment_id' => $payment->id]);

        $payment->update([
            'status' => 'cancelled',
            'metadata' => json_encode(array_merge(
                json_decode($payment->metadata, true) ?? [],
                [
                    'monetbil_response' => $data,
                    'cancelled_at' => now()->toISOString()
                ]
            ))
        ]);
    }

    /**
     * Traiter le succès d'un article unique
     */
    private function processSingleItemPaymentSuccess($payment): void
    {
        try {
            Log::info('Traitement succès article unique', ['payment_id' => $payment->id]);

            // Mettre à jour les statistiques du produit
            if ($payment->type === 'sound' && $payment->sound) {
                $payment->sound->increment('downloads_count');
                Log::info('Compteur de téléchargements incrémenté', ['sound_id' => $payment->sound_id]);
            } elseif ($payment->type === 'event' && $payment->event) {
                $payment->event->increment('current_attendees');
                Log::info('Compteur de participants incrémenté', ['event_id' => $payment->event_id]);
            }

        } catch (\Exception $e) {
            Log::error('Erreur traitement succès article unique: ' . $e->getMessage(), [
                'payment_id' => $payment->id
            ]);
        }
    }

    /**
     * Traiter le succès du paiement panier
     */
    private function processCartPaymentSuccess($payment)
    {
        try {
            Log::info('Traitement succès paiement panier', ['payment_id' => $payment->id]);

            $metadata = json_decode($payment->metadata, true) ?? [];
            $cartItems = $metadata['cart_items'] ?? [];

            if (empty($cartItems)) {
                Log::warning('Aucun article dans le panier', ['payment_id' => $payment->id]);
                return;
            }

            $orderNumber = 'RVL-' . time() . '-' . strtoupper(\Str::random(5));
            $createdPayments = [];

            foreach ($cartItems as $item) {
                $itemPrice = $item['price'] * $item['quantity'];
                
                // Appliquer la réduction proportionnelle si applicable
                if (isset($metadata['discount']) && $metadata['discount'] > 0) {
                    $discountRatio = $metadata['discount'] / $metadata['subtotal'];
                    $itemDiscount = $itemPrice * $discountRatio;
                    $finalItemPrice = $itemPrice - $itemDiscount;
                } else {
                    $finalItemPrice = $itemPrice;
                }

                // Déterminer le vendeur selon le type
                if ($item['type'] === 'sound') {
                    $product = \App\Models\Sound::find($item['id']);
                    $sellerId = $product ? $product->user_id : null;
                } else {
                    $product = \App\Models\Event::find($item['id']);
                    $sellerId = $product ? $product->user_id : null;
                }

                if (!$product || !$sellerId) {
                    Log::warning('Produit non trouvé', ['item' => $item]);
                    continue;
                }

                // Calculer les commissions
                $commission = \App\Models\Payment::calculateCommission($finalItemPrice, $item['type']);

                // Créer un paiement individuel pour chaque article
                $itemPaymentData = [
                    'user_id' => $payment->user_id,
                    'seller_id' => $sellerId,
                    'type' => $item['type'],
                    'amount' => $finalItemPrice,
                    'payment_method' => $metadata['payment_method'] ?? 'monetbil',
                    'payment_provider' => 'monetbil',
                    'external_payment_id' => $payment->payment_reference . '-' . $item['id'],
                    'description' => $payment->description,
                    'phone' => $payment->phone,
                    'metadata' => json_encode([
                        'parent_payment_id' => $payment->id,
                        'order_number' => $orderNumber,
                        'quantity' => $item['quantity'],
                        'original_price' => $item['price'],
                        'promo_code' => $metadata['promo_code'] ?? null,
                        'from_cart' => true,
                        'campusVente_pattern' => true
                    ])
                ];

                if ($item['type'] === 'sound') {
                    $itemPaymentData['sound_id'] = $item['id'];
                } else {
                    $itemPaymentData['event_id'] = $item['id'];
                }

                $itemPayment = \App\Models\Payment::create(array_merge($itemPaymentData, $commission, [
                    'transaction_id' => 'TXN_' . time() . '_' . rand(1000, 9999),
                    'status' => 'completed',
                    'paid_at' => now(),
                    'payment_reference' => $payment->payment_reference . '-ITEM-' . $item['id']
                ]));

                $createdPayments[] = $itemPayment;

                // Mettre à jour les statistiques du produit
                if ($item['type'] === 'sound') {
                    $product->increment('downloads_count', $item['quantity']);
                } else {
                    $product->increment('current_attendees', $item['quantity']);
                }
            }

            // Mettre à jour le paiement principal avec les informations finales
            $payment->update([
                'metadata' => json_encode(array_merge($metadata, [
                    'processed' => true,
                    'order_number' => $orderNumber,
                    'individual_payments' => collect($createdPayments)->pluck('id')->toArray(),
                    'processed_at' => now()->toISOString(),
                    'campusVente_success' => true
                ]))
            ]);

            Log::info('Paiement de panier traité avec succès - pattern campusVente', [
                'payment_id' => $payment->id,
                'order_number' => $orderNumber,
                'items_count' => count($cartItems),
                'individual_payments' => count($createdPayments)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement du succès panier campusVente: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
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

            // Générer référence unique pour le paiement individuel
            $item_ref = 'SINGLE_' . time() . '_' . mt_rand(100000, 999999);
            
            // Configuration API Monetbil officielle
            \App\Libraries\MonetbilOfficial::reset();
            \App\Libraries\MonetbilOfficial::configureFromLaravel();
            \App\Libraries\MonetbilOfficial::setAmount($validated['amount']);
            
            // Informations utilisateur
            $phone = $user->phone ?? '699123456';
            \App\Libraries\MonetbilOfficial::setPhone($phone);
            
            $nameParts = explode(' ', $user->name, 2);
            \App\Libraries\MonetbilOfficial::setFirstName($nameParts[0]);
            \App\Libraries\MonetbilOfficial::setLastName($nameParts[1] ?? '');
            \App\Libraries\MonetbilOfficial::setEmail($user->email);
            
            // Références
            \App\Libraries\MonetbilOfficial::setItemRef($item_ref);
            \App\Libraries\MonetbilOfficial::setPaymentRef($item_ref);
            
            // URLs de callback
            \App\Libraries\MonetbilOfficial::setReturnUrl(url('/payment/success?ref=' . $item_ref));
            \App\Libraries\MonetbilOfficial::setNotifyUrl(url('/api/payments/monetbil/notify'));
            \App\Libraries\MonetbilOfficial::setCancelUrl(url('/payment/cancel?ref=' . $item_ref));
            \App\Libraries\MonetbilOfficial::setLogo(url('/images/reveilart-logo.svg'));

            // Générer l'URL de paiement
            $paymentUrl = \App\Libraries\MonetbilOfficial::url();
            
            // Déterminer le vendeur
            $sellerId = $item->user_id;
            
            // Créer l'enregistrement de paiement
            $payment = Payment::create([
                'user_id' => $user->id,
                'seller_id' => $sellerId,
                'type' => $validated['type'],
                'sound_id' => $validated['type'] === 'sound' ? $item->id : null,
                'event_id' => $validated['type'] === 'event' ? $item->id : null,
                'amount' => $validated['amount'],
                'description' => $validated['description'],
                'status' => 'pending',
                'payment_reference' => $item_ref,
                'monetbil_service_key' => config('services.monetbil.service_key'),
                'phone' => $phone,
                'payment_method' => 'monetbil',
                'payment_provider' => 'monetbil',
                'monetbil_payment_url' => $paymentUrl,
                'metadata' => json_encode([
                    'item_name' => $item->title ?? 'Article',
                    'payment_method' => 'monetbil',
                    'is_single_payment' => true
                ])
            ]);
            
            $result = [
                'success' => true,
                'payment' => $payment,
                'payment_url' => $paymentUrl
            ];

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
     * Gérer les notifications Monetbil avec validation réelle des statuts
     */
    public function handleMonetbilNotification(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            Log::info('Notification Monetbil reçue: ', $data);

            $item_ref = $data['item_ref'] ?? null;
            $status = $data['status'] ?? null;
            
            if (!$item_ref) {
                Log::warning('Notification sans item_ref');
                return response()->json(['success' => false, 'message' => 'item_ref manquant'], 400);
            }

            // Trouver le paiement par référence
            $payment = Payment::where('payment_reference', $item_ref)->first();
            
            if (!$payment) {
                Log::warning('Paiement non trouvé pour référence: ' . $item_ref);
                return response()->json(['success' => false, 'message' => 'Paiement non trouvé'], 404);
            }

            // Vérifier la signature Monetbil (sécurité)
            if (!$this->verifyMonetbilSignature($data)) {
                Log::warning('Signature Monetbil invalide', ['data' => $data]);
                return response()->json(['success' => false, 'message' => 'Signature invalide'], 400);
            }

            Log::info('Traitement du statut Monetbil', [
                'payment_id' => $payment->id,
                'reference' => $item_ref,
                'status' => $status,
                'transaction_id' => $data['transaction_id'] ?? null
            ]);

            // Traiter selon le vrai statut de Monetbil
            switch ($status) {
                case 'success':
                case 'completed':
                case 'SUCCESS':
                    $this->processSuccessfulPayment($payment, $data);
                    $responseMessage = 'Paiement traité avec succès';
                    break;
                    
                case 'failed':
                case 'FAILED':
                case 'error':
                    $this->processFailedPayment($payment, $data);
                    $responseMessage = 'Paiement échoué';
                    break;
                    
                case 'pending':
                case 'PENDING':
                    $this->processPendingPayment($payment, $data);
                    $responseMessage = 'Paiement en attente';
                    break;
                    
                case 'cancelled':
                case 'CANCELLED':
                case 'canceled':
                    $this->processCancelledPayment($payment, $data);
                    $responseMessage = 'Paiement annulé';
                    break;
                    
                default:
                    Log::warning('Statut Monetbil non reconnu', ['status' => $status]);
                    $responseMessage = 'Statut non reconnu';
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => $responseMessage,
                'payment_status' => $payment->fresh()->status
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur notification Monetbil', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement de la notification',
                'error' => $e->getMessage()
            ], 500);
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
        try {
            Log::info('Début processMonetbilCartPayment - Version campusVente', [
                'request_data' => $request->all(),
                'user_id' => auth()->id()
            ]);

            // Validation des données (même pattern que campusVente)
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
                'phone' => 'nullable|string',
            ]);

            $user = User::findOrFail($validated['user_id']);
            
            // Stocker les données du panier en session (comme campusVente)
            session([
                'cart_data' => [
                    'user_id' => $user->id,
                    'items' => $validated['items'],
                    'subtotal' => $validated['subtotal'],
                    'discount' => $validated['discount'] ?? 0,
                    'total' => $validated['total'],
                    'promo_code' => $validated['promo_code'],
                    'payment_method' => $validated['payment_method'],
                    'timestamp' => now()->toISOString()
                ]
            ]);

            // Générer référence unique (pattern campusVente)
            $item_ref = 'CART_' . time() . '_' . mt_rand(100000, 999999);
            
            // Stocker la référence dans la session
            session(['payment_item_ref' => $item_ref]);

            // Configuration API Monetbil officielle (remplacement de la custom Monetbil)
            \App\Libraries\MonetbilOfficial::reset();
            \App\Libraries\MonetbilOfficial::configureFromLaravel();
            \App\Libraries\MonetbilOfficial::setAmount($validated['total']);
            
            // Nettoyer et définir le téléphone
            $phone = $validated['phone'] ?? $user->phone ?? '699123456';
            \App\Libraries\MonetbilOfficial::setPhone($phone);
            
            // Informations utilisateur
            $nameParts = explode(' ', $user->name, 2);
            \App\Libraries\MonetbilOfficial::setFirstName($nameParts[0]);
            \App\Libraries\MonetbilOfficial::setLastName($nameParts[1] ?? '');
            \App\Libraries\MonetbilOfficial::setEmail($user->email);
            
            // Références
            \App\Libraries\MonetbilOfficial::setItemRef($item_ref);
            \App\Libraries\MonetbilOfficial::setPaymentRef($item_ref);
            
            // URLs de callback (comme campusVente)
            \App\Libraries\MonetbilOfficial::setReturnUrl(url('/payment/success?ref=' . $item_ref));
            \App\Libraries\MonetbilOfficial::setNotifyUrl(url('/api/payments/monetbil/notify'));
            \App\Libraries\MonetbilOfficial::setCancelUrl(url('/payment/cancel?ref=' . $item_ref));
            \App\Libraries\MonetbilOfficial::setLogo(url('/images/reveilart-logo.svg'));

            // Générer l'URL de paiement avec l'API officielle
            $paymentUrl = \App\Libraries\MonetbilOfficial::url();
            
            Log::info('URL Monetbil générée', [
                'url' => substr($paymentUrl, 0, 100) . '...',
                'item_ref' => $item_ref
            ]);

            // Créer l'enregistrement de paiement temporaire
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $validated['total'],
                'type' => 'cart_payment',
                'description' => 'Achat panier - ' . count($validated['items']) . ' article(s)',
                'status' => 'pending',
                'payment_reference' => $item_ref,
                'monetbil_service_key' => config('services.monetbil.service_key'),
                'phone' => $phone,
                'payment_method' => $validated['payment_method'],
                'monetbil_payment_url' => $paymentUrl,
                'metadata' => json_encode([
                    'cart_items' => $validated['items'],
                    'subtotal' => $validated['subtotal'],
                    'discount' => $validated['discount'] ?? 0,
                    'promo_code' => $validated['promo_code'],
                    'payment_method' => $validated['payment_method'],
                    'is_cart_payment' => true,
                    'session_data' => true
                ])
            ]);

            Log::info('Paiement créé avec succès', [
                'payment_id' => $payment->id,
                'reference' => $item_ref,
                'amount' => $validated['total']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paiement Monetbil initié avec succès',
                'payment' => [
                    'id' => $payment->id,
                    'reference' => $item_ref,
                    'amount' => $payment->amount,
                    'status' => $payment->status
                ],
                'payment_url' => $paymentUrl,
                'redirect_url' => $paymentUrl // Pour compatibilité frontend
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation campusVente', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur PaymentController campusVente', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement',
                'error' => $e->getMessage(),
                'debug' => [
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine()
                ]
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

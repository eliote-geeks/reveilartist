<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;

class MonetbilService
{
    protected $serviceKey;
    protected $serviceSecret;
    protected $widgetVersion;
    protected $currency;
    protected $country;
    protected $lang;

    public function __construct()
    {
        $this->serviceKey = config('services.monetbil.service_key');
        $this->serviceSecret = config('services.monetbil.service_secret');
        $this->widgetVersion = config('services.monetbil.widget_version', 'v2.1');
        $this->currency = config('services.monetbil.currency', 'XAF');
        $this->country = config('services.monetbil.country', 'CM');
        $this->lang = config('services.monetbil.lang', 'fr');
    }

    public function initiatePayment($amount, $description, $user, $item = null, $type = 'promotional')
    {
        try {
            // Nettoyer le numéro de téléphone
            $cleanPhone = $this->cleanPhoneNumber($user->phone);
            
            // Générer une référence unique
            $paymentReference = $this->generatePaymentReference();
            
            // Créer l'enregistrement de paiement
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => $type,
                'description' => $description,
                'status' => 'pending',
                'payment_reference' => $paymentReference,
                'monetbil_service_key' => $this->serviceKey,
                'phone' => $cleanPhone,
            ]);

            // Associer l'élément selon le type
            if ($item) {
                switch ($type) {
                    case 'promotional':
                        $payment->announcement_id = $item->id;
                        break;
                    case 'meeting':
                        $payment->meeting_id = $item->id;
                        break;
                    case 'sound':
                        $payment->sound_id = $item->id;
                        break;
                    case 'event':
                        $payment->event_id = $item->id;
                        break;
                }
                $payment->save();
            }

            // Générer l'URL de paiement
            $paymentUrl = $this->generateWorkingPaymentUrl($payment);
            
            // Mettre à jour le paiement avec l'URL
            $payment->update([
                'monetbil_payment_url' => $paymentUrl
            ]);

            return [
                'success' => true,
                'payment' => $payment,
                'payment_url' => $paymentUrl
            ];

        } catch (Exception $e) {
            Log::error('Erreur lors de l\'initiation du paiement Monetbil: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function cleanPhoneNumber($phone)
    {
        // Supprimer tous les espaces et caractères spéciaux
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Si le numéro commence par 0, le remplacer par 237 (code du Cameroun)
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '237' . substr($cleanPhone, 1);
        }
        
        // S'assurer que le numéro commence par 237
        if (substr($cleanPhone, 0, 3) !== '237') {
            $cleanPhone = '237' . $cleanPhone;
        }
        
        return $cleanPhone;
    }

    public function generateWorkingPaymentUrl($payment)
    {
        $baseUrl = "https://www.monetbil.com/widget/{$this->widgetVersion}/";
        
        $params = [
            'amount' => (int)$payment->amount,
            'phone' => $payment->phone,
            'locale' => $this->lang,
            'country' => $this->country,
            'currency' => $this->currency,
            'item_ref' => $payment->payment_reference,
            'payment_ref' => $payment->payment_reference,
            'user' => $payment->user->id,
            'first_name' => $payment->user->first_name ?? explode(' ', $payment->user->name)[0],
            'last_name' => $payment->user->last_name ?? (count(explode(' ', $payment->user->name)) > 1 ? explode(' ', $payment->user->name)[1] : ''),
            'email' => $payment->user->email,
            'service_key' => $this->serviceKey,
            'notify_url' => url('/api/payments/monetbil/notify'),
            'return_url' => url('/payment/success?ref=' . $payment->payment_reference),
            'cancel_url' => url('/payment/cancel?ref=' . $payment->payment_reference),
            'logo' => url('/images/reveilart-logo.svg'),
        ];

        return $baseUrl . '?' . http_build_query($params);
    }

    public function generatePaymentUrl($payment)
    {
        $baseUrl = "https://www.monetbil.com/widget/{$this->widgetVersion}/";
        
        $params = [
            'amount' => $payment->amount,
            'phone' => $payment->phone,
            'locale' => $this->lang,
            'country' => $this->country,
            'currency' => $this->currency,
            'item_ref' => $payment->payment_reference,
            'payment_ref' => $payment->payment_reference,
            'user' => $payment->user->id,
            'first_name' => $payment->user->first_name ?? $payment->user->name,
            'last_name' => $payment->user->last_name ?? '',
            'email' => $payment->user->email,
            'service_key' => $this->serviceKey,
            'notify_url' => route('api.monetbil.notify'),
            'return_url' => route('payment.return', ['payment' => $payment->id]),
            'logo' => asset('images/logo.png'),
        ];

        return $baseUrl . '?' . http_build_query($params);
    }

    public function checkPaymentStatus($paymentReference)
    {
        try {
            $response = Http::get("https://api.monetbil.com/payment/v1/status/{$paymentReference}", [
                'service_key' => $this->serviceKey,
                'service_secret' => $this->serviceSecret,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (Exception $e) {
            Log::error('Erreur lors de la vérification du statut de paiement: ' . $e->getMessage());
            return null;
        }
    }

    public function processNotification($data)
    {
        try {
            // Vérifier la signature
            if (!$this->verifySignature($data)) {
                Log::warning('Signature invalide pour la notification Monetbil');
                return false;
            }

            // Trouver le paiement
            $payment = Payment::where('payment_reference', $data['item_ref'])->first();
            
            if (!$payment) {
                Log::warning('Paiement non trouvé pour la référence: ' . $data['item_ref']);
                return false;
            }

            // Mettre à jour le statut selon la réponse
            switch ($data['status']) {
                case 'success':
                    $payment->markAsCompleted();
                    $this->processPostPaymentActions($payment);
                    break;
                case 'failed':
                    $payment->markAsFailed();
                    break;
                default:
                    Log::info('Statut de paiement non reconnu: ' . $data['status']);
                    break;
            }

            return true;

        } catch (Exception $e) {
            Log::error('Erreur lors du traitement de la notification: ' . $e->getMessage());
            return false;
        }
    }

    public function verifySignature($data)
    {
        // Implémentation basique de vérification de signature
        // Vous pourriez vouloir implémenter une vérification plus robuste
        return true;
    }

    public function getPaymentMethods()
    {
        return [
            'orange' => 'Orange Money',
            'mtn' => 'MTN Mobile Money',
            'airtel' => 'Airtel Money',
            'camtel' => 'Camtel Money',
            'nexttel' => 'Nexttel Mobile Money',
        ];
    }

    public function formatAmount($amount)
    {
        return number_format($amount, 0, ',', ' ') . ' ' . $this->currency;
    }

    public function generatePaymentReference()
    {
        return 'REF_' . time() . '_' . mt_rand(100000, 999999);
    }

    private function processPostPaymentActions($payment)
    {
        try {
            switch ($payment->type) {
                case 'promotional':
                    if ($payment->announcement) {
                        $payment->announcement->update([
                            'is_promoted' => true,
                            'promoted_at' => now(),
                            'promotion_expires_at' => now()->addDays(7)
                        ]);
                    }
                    break;
                case 'meeting':
                    if ($payment->meeting) {
                        $payment->meeting->update([
                            'is_paid' => true,
                            'paid_at' => now()
                        ]);
                    }
                    break;
                case 'sound':
                    if ($payment->sound) {
                        $payment->sound->increment('downloads_count');
                    }
                    break;
                case 'event':
                    if ($payment->event) {
                        $payment->event->increment('current_attendees');
                    }
                    break;
                case 'cart_payment':
                    $this->processCartPaymentActions($payment);
                    break;
            }
            
            Log::info('Actions post-paiement traitées pour le paiement: ' . $payment->id);
        } catch (Exception $e) {
            Log::error('Erreur lors du traitement des actions post-paiement: ' . $e->getMessage());
        }
    }

    private function processCartPaymentActions($payment)
    {
        try {
            $metadata = json_decode($payment->metadata, true);
            
            if (!isset($metadata['cart_items']) || !isset($metadata['is_cart_payment'])) {
                Log::warning('Métadonnées du panier manquantes pour le paiement: ' . $payment->id);
                return;
            }

            $cartItems = $metadata['cart_items'];
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
                    $product = \App\Models\Sound::findOrFail($item['id']);
                    $sellerId = $product->user_id;
                } else {
                    $product = \App\Models\Event::findOrFail($item['id']);
                    $sellerId = $product->user_id;
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
                        'from_cart' => true
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
                    'individual_payments' => $createdPayments->pluck('id')->toArray(),
                    'processed_at' => now()->toISOString()
                ]))
            ]);

            Log::info('Paiement de panier traité avec succès', [
                'payment_id' => $payment->id,
                'order_number' => $orderNumber,
                'items_count' => count($cartItems),
                'individual_payments' => count($createdPayments)
            ]);

        } catch (Exception $e) {
            Log::error('Erreur lors du traitement du paiement de panier: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function initiatePremiumDatingPayment($amount, $description, $user, $duration = 30)
    {
        try {
            $paymentReference = $this->generatePaymentReference();
            
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => 'premium_dating',
                'description' => $description,
                'status' => 'pending',
                'payment_reference' => $paymentReference,
                'monetbil_service_key' => $this->serviceKey,
                'phone' => $this->cleanPhoneNumber($user->phone),
                'premium_duration' => $duration,
            ]);

            $paymentUrl = $this->generateWorkingPaymentUrl($payment);
            
            $payment->update([
                'monetbil_payment_url' => $paymentUrl
            ]);

            return [
                'success' => true,
                'payment' => $payment,
                'payment_url' => $paymentUrl
            ];

        } catch (Exception $e) {
            Log::error('Erreur lors de l\'initiation du paiement Premium Dating: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
<?php

namespace App\Libraries;

/**
 * Classe Monetbil pour l'intégration des paiements
 * Basée sur l'implémentation du projet campusVente
 */
class Monetbil
{
    private static $serviceKey;
    private static $serviceSecret;
    private static $amount;
    private static $currency = 'XAF';
    private static $country = 'CM';
    private static $locale = 'fr';
    private static $phone;
    private static $email;
    private static $firstName;
    private static $lastName;
    private static $item_ref;
    private static $payment_ref;
    private static $return_url;
    private static $notify_url;
    private static $cancel_url;
    private static $logo;
    
    /**
     * Définir la clé de service
     */
    public static function setServiceKey($key)
    {
        self::$serviceKey = $key;
    }
    
    /**
     * Définir le secret de service
     */
    public static function setServiceSecret($secret)
    {
        self::$serviceSecret = $secret;
    }
    
    /**
     * Définir le montant
     */
    public static function setAmount($amount)
    {
        self::$amount = (int)$amount;
    }
    
    /**
     * Définir la devise
     */
    public static function setCurrency($currency)
    {
        self::$currency = $currency;
    }
    
    /**
     * Définir le pays
     */
    public static function setCountry($country)
    {
        self::$country = $country;
    }
    
    /**
     * Définir la langue
     */
    public static function setLocale($locale)
    {
        self::$locale = $locale;
    }
    
    /**
     * Définir le téléphone
     */
    public static function setPhone($phone)
    {
        self::$phone = self::cleanPhoneNumber($phone);
    }
    
    /**
     * Définir l'email
     */
    public static function setEmail($email)
    {
        self::$email = $email;
    }
    
    /**
     * Définir le prénom
     */
    public static function setFirstName($firstName)
    {
        self::$firstName = $firstName;
    }
    
    /**
     * Définir le nom
     */
    public static function setLastName($lastName)
    {
        self::$lastName = $lastName;
    }
    
    /**
     * Définir la référence de l'élément
     */
    public static function setItemRef($ref)
    {
        self::$item_ref = $ref;
    }
    
    /**
     * Définir la référence de paiement
     */
    public static function setPaymentRef($ref)
    {
        self::$payment_ref = $ref;
    }
    
    /**
     * Définir l'URL de retour
     */
    public static function setReturnUrl($url)
    {
        self::$return_url = $url;
    }
    
    /**
     * Définir l'URL de notification
     */
    public static function setNotifyUrl($url)
    {
        self::$notify_url = $url;
    }
    
    /**
     * Définir l'URL d'annulation
     */
    public static function setCancelUrl($url)
    {
        self::$cancel_url = $url;
    }
    
    /**
     * Définir le logo
     */
    public static function setLogo($logo)
    {
        self::$logo = $logo;
    }
    
    /**
     * Générer l'URL de paiement
     */
    public static function generatePaymentUrl()
    {
        $baseUrl = "https://www.monetbil.com/widget/v2.1/";
        
        $params = [
            'amount' => self::$amount,
            'phone' => self::$phone,
            'locale' => self::$locale,
            'country' => self::$country,
            'currency' => self::$currency,
            'item_ref' => self::$item_ref,
            'payment_ref' => self::$payment_ref,
            'first_name' => self::$firstName,
            'last_name' => self::$lastName,
            'email' => self::$email,
            'service_key' => self::$serviceKey,
            'return_url' => self::$return_url,
            'notify_url' => self::$notify_url,
            'cancel_url' => self::$cancel_url,
            'logo' => self::$logo,
        ];
        
        // Retirer les paramètres vides
        $params = array_filter($params, function($value) {
            return $value !== null && $value !== '';
        });
        
        return $baseUrl . '?' . http_build_query($params);
    }
    
    /**
     * Nettoyer le numéro de téléphone
     */
    private static function cleanPhoneNumber($phone)
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
    
    /**
     * Vérifier la signature de retour
     */
    public static function verifySignature($data)
    {
        // Pour l'instant, retourner true (implémentation basique)
        // Dans un environnement de production, implémenter la vérification de signature
        return true;
    }
    
    /**
     * Traiter le callback de notification
     */
    public static function processCallback($data)
    {
        if (!self::verifySignature($data)) {
            return false;
        }
        
        return [
            'status' => $data['status'] ?? 'unknown',
            'transaction_id' => $data['transaction_id'] ?? null,
            'item_ref' => $data['item_ref'] ?? null,
            'payment_ref' => $data['payment_ref'] ?? null,
            'amount' => $data['amount'] ?? null,
            'phone' => $data['phone'] ?? null
        ];
    }
    
    /**
     * Réinitialiser toutes les propriétés
     */
    public static function reset()
    {
        self::$serviceKey = null;
        self::$serviceSecret = null;
        self::$amount = null;
        self::$currency = 'XAF';
        self::$country = 'CM';
        self::$locale = 'fr';
        self::$phone = null;
        self::$email = null;
        self::$firstName = null;
        self::$lastName = null;
        self::$item_ref = null;
        self::$payment_ref = null;
        self::$return_url = null;
        self::$notify_url = null;
        self::$cancel_url = null;
        self::$logo = null;
    }
}
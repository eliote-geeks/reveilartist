<?php

namespace App\Libraries;

/**
 * Monetbil Official PHP Library for Laravel Integration
 * Based on the official Monetbil PHP SDK
 */
class MonetbilOfficial
{
    const MONETBIL_WIDGET_VERSION_V2_1 = 'v2.1';
    const MONETBIL_WIDGET_VERSION_V2 = 'v2';
    const MONETBIL_ENDPOINT_GET_STATUS = 'https://api.monetbil.com/payment/v1/status/';
    const MONETBIL_WIDGET_PAYMENT_URL = 'https://www.monetbil.com/widget/%s/';

    private static $service_key;
    private static $service_secret;
    private static $amount;
    private static $currency = 'XAF';
    private static $country = 'CM';
    private static $locale = 'fr';
    private static $phone;
    private static $email;
    private static $first_name;
    private static $last_name;
    private static $user;
    private static $item_ref;
    private static $payment_ref;
    private static $return_url;
    private static $notify_url;
    private static $cancel_url;
    private static $logo;
    private static $widget_version = self::MONETBIL_WIDGET_VERSION_V2_1;

    /**
     * Configuration methods
     */
    public static function setServiceKey($service_key)
    {
        self::$service_key = $service_key;
    }

    public static function setServiceSecret($service_secret)
    {
        self::$service_secret = $service_secret;
    }

    public static function setAmount($amount)
    {
        self::$amount = (int)$amount;
    }

    public static function setCurrency($currency)
    {
        self::$currency = $currency;
    }

    public static function setCountry($country)
    {
        self::$country = $country;
    }

    public static function setLocale($locale)
    {
        self::$locale = $locale;
    }

    public static function setPhone($phone)
    {
        self::$phone = self::formatPhoneNumber($phone);
    }

    public static function setEmail($email)
    {
        self::$email = $email;
    }

    public static function setFirstName($first_name)
    {
        self::$first_name = $first_name;
    }

    public static function setLastName($last_name)
    {
        self::$last_name = $last_name;
    }

    public static function setUser($user)
    {
        self::$user = $user;
    }

    public static function setItemRef($item_ref)
    {
        self::$item_ref = $item_ref;
    }

    public static function setPaymentRef($payment_ref)
    {
        self::$payment_ref = $payment_ref;
    }

    public static function setReturnUrl($return_url)
    {
        self::$return_url = $return_url;
    }

    public static function setNotifyUrl($notify_url)
    {
        self::$notify_url = $notify_url;
    }

    public static function setCancelUrl($cancel_url)
    {
        self::$cancel_url = $cancel_url;
    }

    public static function setLogo($logo)
    {
        self::$logo = $logo;
    }

    public static function setWidgetVersion($widget_version)
    {
        self::$widget_version = $widget_version;
    }

    /**
     * Format phone number for Cameroon
     */
    private static function formatPhoneNumber($phone)
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // If phone starts with 0, replace with 237
        if (substr($phone, 0, 1) === '0') {
            $phone = '237' . substr($phone, 1);
        }
        
        // Ensure phone starts with 237
        if (substr($phone, 0, 3) !== '237') {
            $phone = '237' . $phone;
        }
        
        return $phone;
    }

    /**
     * Generate payment URL
     */
    public static function url($options = [])
    {
        $widget_url = sprintf(self::MONETBIL_WIDGET_PAYMENT_URL, self::$widget_version);
        
        $data = [
            'amount' => self::$amount,
            'phone' => self::$phone,
            'locale' => self::$locale,
            'country' => self::$country,
            'currency' => self::$currency,
            'item_ref' => self::$item_ref,
            'payment_ref' => self::$payment_ref,
            'first_name' => self::$first_name,
            'last_name' => self::$last_name,
            'email' => self::$email,
            'user' => self::$user,
            'service_key' => self::$service_key,
            'return_url' => self::$return_url,
            'notify_url' => self::$notify_url,
            'cancel_url' => self::$cancel_url,
            'logo' => self::$logo,
        ];

        // Remove null values
        $data = array_filter($data, function($value) {
            return !is_null($value) && $value !== '';
        });

        // Merge with additional options
        $data = array_merge($data, $options);

        return $widget_url . '?' . http_build_query($data);
    }

    /**
     * Start payment - redirect to payment page
     */
    public static function startPayment($options = [])
    {
        $payment_url = self::url($options);
        
        if (headers_sent()) {
            echo '<script>window.location.href = "' . $payment_url . '";</script>';
        } else {
            header('Location: ' . $payment_url);
        }
        exit;
    }

    /**
     * Check payment status
     */
    public static function checkPayment($item_ref)
    {
        if (empty(self::$service_key) || empty(self::$service_secret)) {
            throw new \Exception('Service key and secret must be set');
        }

        $url = self::MONETBIL_ENDPOINT_GET_STATUS . $item_ref;
        
        $data = [
            'service_key' => self::$service_key,
            'service_secret' => self::$service_secret,
        ];

        $response = self::makeHttpRequest($url, $data);
        
        if ($response === false) {
            return false;
        }

        $result = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return false;
        }

        return $result;
    }

    /**
     * Verify payment signature
     */
    public static function verifyPaymentSignature($data)
    {
        if (empty(self::$service_secret)) {
            return false;
        }

        $received_signature = $data['signature'] ?? '';
        unset($data['signature']);

        $expected_signature = self::generateSignature($data);

        return hash_equals($expected_signature, $received_signature);
    }

    /**
     * Generate signature for data
     */
    private static function generateSignature($data)
    {
        ksort($data);
        $string_to_sign = '';
        
        foreach ($data as $key => $value) {
            $string_to_sign .= $key . '=' . $value . '&';
        }
        
        $string_to_sign .= self::$service_secret;
        
        return hash('sha256', $string_to_sign);
    }

    /**
     * Make HTTP request
     */
    private static function makeHttpRequest($url, $data = [])
    {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        if (!empty($data)) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            \Log::error('Monetbil HTTP request error: ' . $error);
            return false;
        }
        
        return $response;
    }

    /**
     * Reset all static properties
     */
    public static function reset()
    {
        self::$service_key = null;
        self::$service_secret = null;
        self::$amount = null;
        self::$currency = 'XAF';
        self::$country = 'CM';
        self::$locale = 'fr';
        self::$phone = null;
        self::$email = null;
        self::$first_name = null;
        self::$last_name = null;
        self::$user = null;
        self::$item_ref = null;
        self::$payment_ref = null;
        self::$return_url = null;
        self::$notify_url = null;
        self::$cancel_url = null;
        self::$logo = null;
        self::$widget_version = self::MONETBIL_WIDGET_VERSION_V2_1;
    }

    /**
     * Laravel helper methods
     */
    public static function configureFromLaravel()
    {
        self::setServiceKey(config('services.monetbil.service_key'));
        self::setServiceSecret(config('services.monetbil.service_secret'));
        self::setCurrency(config('services.monetbil.currency', 'XAF'));
        self::setCountry(config('services.monetbil.country', 'CM'));
        self::setLocale(config('services.monetbil.lang', 'fr'));
    }

    /**
     * Get all current settings
     */
    public static function getSettings()
    {
        return [
            'service_key' => self::$service_key,
            'amount' => self::$amount,
            'currency' => self::$currency,
            'country' => self::$country,
            'locale' => self::$locale,
            'phone' => self::$phone,
            'email' => self::$email,
            'first_name' => self::$first_name,
            'last_name' => self::$last_name,
            'user' => self::$user,
            'item_ref' => self::$item_ref,
            'payment_ref' => self::$payment_ref,
            'return_url' => self::$return_url,
            'notify_url' => self::$notify_url,
            'cancel_url' => self::$cancel_url,
            'logo' => self::$logo,
            'widget_version' => self::$widget_version,
        ];
    }
}
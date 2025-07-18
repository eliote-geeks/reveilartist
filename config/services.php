<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'monetbil' => [
        'service_key' => env('MONETBIL_SERVICE_KEY', '9SiC3m3h0CD4PuVHqYIrW7Z7j4iW2lPs'),
        'service_secret' => env('MONETBIL_SERVICE_SECRET', 'xNksRpLCRWmG67bVXUb3YGITftKIbtkNXRp2gKLj9jWi3lySOa1Dnhg5l4LToZ98'),
        'widget_version' => env('MONETBIL_WIDGET_VERSION', 'v2.1'),
        'currency' => env('MONETBIL_CURRENCY', 'XAF'),
        'country' => env('MONETBIL_COUNTRY', 'CM'),
        'lang' => env('MONETBIL_LANG', 'fr'),
    ],

];

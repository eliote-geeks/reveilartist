<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouveau message de contact - Reveil4artist</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        .info-item {
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 4px solid #667eea;
        }
        .label {
            font-weight: bold;
            color: #667eea;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Nouveau message de contact</h2>
        <p>Reveil4artist - Formulaire de contact</p>
    </div>

    <div class="content">
        <div class="info-item">
            <span class="label">Nom :</span>
            <span>{{ $data['name'] }}</span>
        </div>

        <div class="info-item">
            <span class="label">Email :</span>
            <span>{{ $data['email'] }}</span>
        </div>

        <div class="info-item">
            <span class="label">Catégorie :</span>
            <span>{{ $data['category'] }}</span>
        </div>

        <div class="info-item">
            <span class="label">Sujet :</span>
            <span>{{ $data['subject'] }}</span>
        </div>

        <div class="info-item">
            <span class="label">Message :</span>
            <p>{{ $data['message'] }}</p>
        </div>
    </div>

    <div class="footer">
        <p>Ce message a été envoyé depuis le formulaire de contact de Reveil4artist</p>
        <p>© {{ date('Y') }} Reveil4artist. Tous droits réservés.</p>
    </div>
</body>
</html>

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Résultat du paiement - ReveilArtist</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .payment-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 3rem;
            text-align: center;
            max-width: 500px;
            width: 100%;
            margin: 2rem;
        }
        .status-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
        }
        .status-success { color: #28a745; }
        .status-pending { color: #ffc107; }
        .status-failed { color: #dc3545; }
        .payment-details {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
        }
        .btn-return {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50px;
            padding: 1rem 2rem;
            color: white;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            margin-top: 1rem;
            transition: transform 0.3s ease;
        }
        .btn-return:hover {
            transform: translateY(-2px);
            color: white;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <div class="payment-card">
        <!-- Logo -->
        <img src="{{ asset('images/reveilart-logo.svg') }}" alt="ReveilArtist" class="logo">
        
        @if($payment->status === 'completed')
            <div class="status-icon status-success">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 class="text-success mb-3">Paiement Réussi !</h2>
            <p class="text-muted">Votre paiement a été traité avec succès.</p>
        @elseif($payment->status === 'pending')
            <div class="status-icon status-pending">
                <i class="fas fa-clock"></i>
            </div>
            <h2 class="text-warning mb-3">Paiement en cours</h2>
            <p class="text-muted">Votre paiement est en cours de traitement.</p>
        @else
            <div class="status-icon status-failed">
                <i class="fas fa-times-circle"></i>
            </div>
            <h2 class="text-danger mb-3">Paiement Échoué</h2>
            <p class="text-muted">Une erreur s'est produite lors du traitement de votre paiement.</p>
        @endif

        <!-- Détails du paiement -->
        <div class="payment-details">
            <h5 class="mb-3">Détails du paiement</h5>
            <div class="row">
                <div class="col-6">
                    <small class="text-muted">Référence</small>
                    <p class="fw-bold">{{ $payment->payment_reference }}</p>
                </div>
                <div class="col-6">
                    <small class="text-muted">Montant</small>
                    <p class="fw-bold">{{ $payment->formatted_amount }}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <small class="text-muted">Type</small>
                    <p class="fw-bold">{{ ucfirst($payment->type) }}</p>
                </div>
                <div class="col-6">
                    <small class="text-muted">Statut</small>
                    <p class="fw-bold">{{ $payment->status_label }}</p>
                </div>
            </div>
            @if($payment->description)
                <div class="row">
                    <div class="col-12">
                        <small class="text-muted">Description</small>
                        <p class="fw-bold">{{ $payment->description }}</p>
                    </div>
                </div>
            @endif
        </div>

        <!-- Messages spécifiques selon le statut -->
        @if($payment->status === 'completed')
            <div class="alert alert-success" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                @if($payment->type === 'sound')
                    Vous pouvez maintenant télécharger votre son depuis votre profil.
                @elseif($payment->type === 'event')
                    Votre inscription à l'événement a été confirmée.
                @else
                    Votre achat a été finalisé avec succès.
                @endif
            </div>
        @elseif($payment->status === 'pending')
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-hourglass-half me-2"></i>
                Veuillez patienter pendant que nous traitons votre paiement. Vous recevrez une notification une fois le processus terminé.
            </div>
        @else
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Si vous pensez qu'il s'agit d'une erreur, contactez notre support client.
            </div>
        @endif

        <!-- Bouton de retour -->
        <a href="{{ url('/') }}" class="btn-return">
            <i class="fas fa-home me-2"></i>
            Retour à l'accueil
        </a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    @if($payment->status === 'completed')
        <script>
            // Redirection automatique après 10 secondes pour les paiements réussis
            setTimeout(function() {
                window.location.href = '{{ url('/') }}';
            }, 10000);
        </script>
    @endif
</body>
</html>
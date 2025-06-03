<?php

namespace App\Http\Controllers;

use App\Models\Competition;
use App\Models\CompetitionParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use SplObjectStorage;

class AudioLiveController extends Controller implements MessageComponentInterface
{
    protected $clients;
    protected $rooms;

    public function __construct()
    {
        $this->clients = new SplObjectStorage();
        $this->rooms = [];
    }

    public function onOpen(ConnectionInterface $conn)
    {
        // Nouvelle connexion WebSocket
        $this->clients->attach($conn);
        
        $roomId = $this->getRoomFromConnection($conn);
        if (!isset($this->rooms[$roomId])) {
            $this->rooms[$roomId] = new SplObjectStorage();
        }
        
        $this->rooms[$roomId]->attach($conn);
        
        Log::info("🔗 Nouvelle connexion audio: {$conn->resourceId} dans la room {$roomId}");
        
        // Notifier les autres participants qu'un utilisateur a rejoint
        $this->broadcast($roomId, [
            'type' => 'user-joined',
            'userId' => $this->getUserIdFromConnection($conn),
            'totalUsers' => count($this->rooms[$roomId])
        ], $conn);
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $data = json_decode($msg, true);
        $roomId = $this->getRoomFromConnection($from);
        
        Log::info("📨 Message audio reçu: " . $data['type'] ?? 'unknown');
        
        switch ($data['type'] ?? '') {
            case 'join-room':
                $this->handleJoinRoom($from, $data, $roomId);
                break;
                
            case 'start-broadcasting':
                $this->handleStartBroadcasting($from, $data, $roomId);
                break;
                
            case 'stop-broadcasting':
                $this->handleStopBroadcasting($from, $data, $roomId);
                break;
                
            case 'offer':
                $this->handleWebRTCOffer($from, $data, $roomId);
                break;
                
            case 'answer':
                $this->handleWebRTCAnswer($from, $data, $roomId);
                break;
                
            case 'ice-candidate':
                $this->handleICECandidate($from, $data, $roomId);
                break;
                
            case 'user-speaking':
                $this->handleUserSpeaking($from, $data, $roomId);
                break;
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        $roomId = $this->getRoomFromConnection($conn);
        $userId = $this->getUserIdFromConnection($conn);
        
        // Retirer de la room
        if (isset($this->rooms[$roomId])) {
            $this->rooms[$roomId]->detach($conn);
            
            // Notifier les autres qu'un utilisateur a quitté
            $this->broadcast($roomId, [
                'type' => 'user-left',
                'userId' => $userId,
                'totalUsers' => count($this->rooms[$roomId])
            ]);
        }
        
        // Retirer des clients
        $this->clients->detach($conn);
        
        Log::info("❌ Connexion audio fermée: {$conn->resourceId}");
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        Log::error("❌ Erreur WebSocket audio: " . $e->getMessage());
        $conn->close();
    }

    private function handleJoinRoom($conn, $data, $roomId)
    {
        $userId = $data['userId'] ?? 'anonymous';
        $userName = $data['userName'] ?? 'Utilisateur';
        
        // Envoyer la confirmation de join
        $conn->send(json_encode([
            'type' => 'room-joined',
            'roomId' => $roomId,
            'userId' => $userId,
            'totalUsers' => count($this->rooms[$roomId] ?? [])
        ]));
        
        // Notifier les autres
        $this->broadcast($roomId, [
            'type' => 'user-joined-room',
            'userId' => $userId,
            'userName' => $userName,
            'totalUsers' => count($this->rooms[$roomId] ?? [])
        ], $conn);
    }

    private function handleStartBroadcasting($conn, $data, $roomId)
    {
        $userId = $data['userId'] ?? 'unknown';
        $userName = $data['userName'] ?? 'Broadcaster';
        
        // Marquer cette connexion comme diffuseur
        $conn->broadcaster = true;
        $conn->userId = $userId;
        
        // Notifier tous les participants qu'une diffusion commence
        $this->broadcast($roomId, [
            'type' => 'broadcast-started',
            'userId' => $userId,
            'userName' => $userName
        ]);
        
        Log::info("🎤 Diffusion audio démarrée par {$userName} ({$userId})");
    }

    private function handleStopBroadcasting($conn, $data, $roomId)
    {
        $userId = $data['userId'] ?? 'unknown';
        
        // Retirer le marqueur de diffuseur
        $conn->broadcaster = false;
        
        // Notifier tous les participants que la diffusion s'arrête
        $this->broadcast($roomId, [
            'type' => 'broadcast-stopped',
            'userId' => $userId
        ]);
        
        Log::info("⏹️ Diffusion audio arrêtée par {$userId}");
    }

    private function handleWebRTCOffer($conn, $data, $roomId)
    {
        $targetUserId = $data['targetUserId'] ?? null;
        $offer = $data['offer'] ?? null;
        
        if (!$targetUserId || !$offer) return;
        
        // Transférer l'offer au destinataire
        $this->sendToUser($roomId, $targetUserId, [
            'type' => 'offer',
            'userId' => $this->getUserIdFromConnection($conn),
            'offer' => $offer
        ]);
    }

    private function handleWebRTCAnswer($conn, $data, $roomId)
    {
        $targetUserId = $data['targetUserId'] ?? null;
        $answer = $data['answer'] ?? null;
        
        if (!$targetUserId || !$answer) return;
        
        // Transférer l'answer au destinataire
        $this->sendToUser($roomId, $targetUserId, [
            'type' => 'answer',
            'userId' => $this->getUserIdFromConnection($conn),
            'answer' => $answer
        ]);
    }

    private function handleICECandidate($conn, $data, $roomId)
    {
        $targetUserId = $data['targetUserId'] ?? null;
        $candidate = $data['candidate'] ?? null;
        
        if (!$targetUserId || !$candidate) return;
        
        // Transférer le candidat ICE au destinataire
        $this->sendToUser($roomId, $targetUserId, [
            'type' => 'ice-candidate',
            'userId' => $this->getUserIdFromConnection($conn),
            'candidate' => $candidate
        ]);
    }

    private function handleUserSpeaking($conn, $data, $roomId)
    {
        $userId = $data['userId'] ?? null;
        
        if (!$userId) return;
        
        // Notifier tous les participants que cet utilisateur parle
        $this->broadcast($roomId, [
            'type' => 'user-speaking',
            'userId' => $userId
        ], $conn);
    }

    private function broadcast($roomId, $message, $except = null)
    {
        if (!isset($this->rooms[$roomId])) return;
        
        $jsonMessage = json_encode($message);
        
        foreach ($this->rooms[$roomId] as $client) {
            if ($client !== $except) {
                $client->send($jsonMessage);
            }
        }
    }

    private function sendToUser($roomId, $userId, $message)
    {
        if (!isset($this->rooms[$roomId])) return;
        
        $jsonMessage = json_encode($message);
        
        foreach ($this->rooms[$roomId] as $client) {
            if (($client->userId ?? null) === $userId) {
                $client->send($jsonMessage);
                break;
            }
        }
    }

    private function getRoomFromConnection($conn)
    {
        // Extraire l'ID de la room depuis l'URL ou les paramètres
        $uri = $conn->httpRequest->getUri();
        $path = $uri->getPath();
        
        // Format attendu: /ws/audio/competition_123
        if (preg_match('/\/ws\/audio\/(.+)/', $path, $matches)) {
            return $matches[1];
        }
        
        return 'default';
    }

    private function getUserIdFromConnection($conn)
    {
        // Retourner l'ID utilisateur stocké ou générer un ID temporaire
        return $conn->userId ?? $conn->resourceId;
    }

    // API REST pour obtenir les statistiques audio
    public function getAudioStats(Request $request, $competitionId)
    {
        $roomId = "competition_{$competitionId}";
        $totalConnections = count($this->rooms[$roomId] ?? []);
        
        $broadcasters = 0;
        $listeners = 0;
        
        if (isset($this->rooms[$roomId])) {
            foreach ($this->rooms[$roomId] as $client) {
                if ($client->broadcaster ?? false) {
                    $broadcasters++;
                } else {
                    $listeners++;
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'stats' => [
                'total_connections' => $totalConnections,
                'broadcasters' => $broadcasters,
                'listeners' => $listeners,
                'room_id' => $roomId
            ]
        ]);
    }
} 
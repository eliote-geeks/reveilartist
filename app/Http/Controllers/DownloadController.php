<?php

namespace App\Http\Controllers;

use App\Models\Sound;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use Illuminate\Support\Str;

class DownloadController extends Controller
{
    public function downloadSound(Request $request, $soundId)
    {
        $sound = Sound::findOrFail($soundId);
        $user = auth()->user();

        // Vérifier si l'utilisateur a le droit de télécharger
        if (!$sound->is_free && !$this->hasPurchasedSound($user->id, $soundId)) {
            return response()->json([
                'message' => 'Vous devez acheter ce son avant de pouvoir le télécharger',
                'error' => 'not_purchased'
            ], 403);
        }

        // Créer un dossier temporaire
        $tempPath = storage_path('app/temp/' . Str::random(10));
        mkdir($tempPath, 0755, true);

        // Copier le fichier audio
        $audioPath = storage_path('app/' . $sound->file_path);
        $newAudioPath = $tempPath . '/' . basename($sound->file_path);
        copy($audioPath, $newAudioPath);

        // Créer le fichier README avec les informations
        $readmeContent = $this->generateReadmeContent($sound);
        file_put_contents($tempPath . '/README.txt', $readmeContent);

        // Créer le ZIP
        $zipPath = storage_path('app/temp/' . Str::random(10) . '.zip');
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        // Ajouter les fichiers au ZIP
        $zip->addFile($newAudioPath, basename($sound->file_path));
        $zip->addFile($tempPath . '/README.txt', 'README.txt');

        // Ajouter la pochette si elle existe
        if ($sound->cover_path) {
            $coverPath = storage_path('app/' . $sound->cover_path);
            if (file_exists($coverPath)) {
                $zip->addFile($coverPath, 'cover.jpg');
            }
        }

        $zip->close();

        // Nettoyer le dossier temporaire
        $this->cleanupTempFiles($tempPath);

        // Retourner le fichier ZIP
        return response()->download($zipPath, $sound->title . '.zip')->deleteFileAfterSend(true);
    }

    private function hasPurchasedSound($userId, $soundId)
    {
        return Payment::where('user_id', $userId)
            ->where('sound_id', $soundId)
            ->where('status', 'completed')
            ->exists();
    }

    private function generateReadmeContent($sound)
    {
        return "INFORMATIONS DU SON
===================

Titre: {$sound->title}
Artiste: {$sound->artist}
Catégorie: {$sound->category}
Date de création: {$sound->created_at->format('d/m/Y')}

RÈGLES D'UTILISATION
===================

1. Ce son est destiné à un usage personnel uniquement.
2. La redistribution ou la revente de ce son est strictement interdite.
3. L'utilisation commerciale nécessite une autorisation écrite de l'artiste.
4. Toute modification du son doit être mentionnée dans les crédits.
5. Le son ne peut pas être utilisé dans un contexte offensant ou illégal.

CONTACT
=======

Pour toute question concernant l'utilisation de ce son, veuillez contacter :
Email: contact@reveilartist.com
Site web: www.reveilartist.com

© " . date('Y') . " ReveilArtist - Tous droits réservés";
    }

    private function cleanupTempFiles($path)
    {
        if (is_dir($path)) {
            $files = glob($path . '/*');
            foreach ($files as $file) {
                unlink($file);
            }
            rmdir($path);
        }
    }
}

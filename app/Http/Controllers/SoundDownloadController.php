<?php

namespace App\Http\Controllers;

use App\Models\Sound;
use Illuminate\Http\Request;
use ZipArchive;

class SoundDownloadController extends Controller
{
    public function download($soundId)
    {
        try {
            $sound = Sound::findOrFail($soundId);

            // Vérifier si le fichier existe
            if (!file_exists(storage_path('app/' . $sound->file_path))) {
                return response()->json(['message' => 'Fichier non trouvé'], 404);
            }

            // Retourner directement le fichier
            return response()->download(
                storage_path('app/' . $sound->file_path),
                $sound->title . '.mp3'
            );

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur de téléchargement'], 500);
        }
    }
}

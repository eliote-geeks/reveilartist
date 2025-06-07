<?php

namespace App\Http\Controllers;

use App\Models\Clip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserClipController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $clips = Clip::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $clips
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des clips',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Mettre à jour le statut des événements existants
        DB::table('events')
            ->where('status', 'pending')
            ->update(['status' => 'published']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remettre le statut à pending
        DB::table('events')
            ->where('status', 'published')
            ->update(['status' => 'pending']);
    }
};

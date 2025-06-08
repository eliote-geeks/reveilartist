<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('favorite_sounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('sound_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Empêcher les doublons
            $table->unique(['user_id', 'sound_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('favorite_sounds');
    }
};

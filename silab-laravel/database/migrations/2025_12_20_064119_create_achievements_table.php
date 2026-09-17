<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAchievementsTable extends Migration
{
    public function up()
    {
        // 1. Tabel Master (Daftar Prestasi yang tersedia)
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');         // Nama Prestasi (Misal: Sultan)
            $table->string('description');  // Penjelasan (Misal: Order 50x)
            $table->string('type');         // Tipe: 'login' atau 'orders'
            $table->integer('target');      // Syarat Angka: 1, 10, 50
            $table->timestamps();
        });

        // 2. Tabel Pivot (Menyimpan user A dapat prestasi apa)
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('achievement_id')->constrained()->onDelete('cascade');
            $table->timestamps(); // Tanggal didapat
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
}

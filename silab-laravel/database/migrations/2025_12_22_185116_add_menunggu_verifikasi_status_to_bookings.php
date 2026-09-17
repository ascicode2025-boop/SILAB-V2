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
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu', 'disetujui', 'ditolak', 'proses', 'menunggu_verifikasi', 'selesai', 'dibatalkan') DEFAULT 'menunggu'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu', 'disetujui', 'ditolak', 'proses', 'selesai', 'dibatalkan') DEFAULT 'menunggu'");
    }
};

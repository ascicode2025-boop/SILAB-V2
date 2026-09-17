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
        // Modify enum to add 'draft' status
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu', 'disetujui', 'ditolak', 'proses', 'selesai', 'dibatalkan', 'menunggu_verifikasi', 'menunggu_pembayaran', 'draft') DEFAULT 'menunggu'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum (remove 'draft')
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu', 'disetujui', 'ditolak', 'proses', 'selesai', 'dibatalkan', 'menunggu_verifikasi', 'menunggu_pembayaran') DEFAULT 'menunggu'");
    }
};

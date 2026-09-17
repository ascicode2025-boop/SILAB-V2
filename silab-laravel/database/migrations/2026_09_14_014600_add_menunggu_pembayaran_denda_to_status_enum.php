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
        DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status ENUM('pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian', 'ditolak', 'selesai', 'dibatalkan', 'menunggu_pembayaran_denda') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status ENUM('pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian', 'ditolak', 'selesai', 'dibatalkan') DEFAULT 'pending'");
    }
};

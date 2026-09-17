<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tambahkan 'menunggu_verifikasi_kepala' ke enum status
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu','disetujui','ditolak','proses','selesai','dibatalkan','menunggu_verifikasi','menunggu_ttd','menunggu_sign','ditandatangani','menunggu_verifikasi_kepala','menunggu_pembayaran','draft') NOT NULL DEFAULT 'menunggu'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu','disetujui','ditolak','proses','selesai','dibatalkan','menunggu_verifikasi','menunggu_ttd','menunggu_sign','ditandatangani','menunggu_pembayaran','draft') NOT NULL DEFAULT 'menunggu'");
    }
};

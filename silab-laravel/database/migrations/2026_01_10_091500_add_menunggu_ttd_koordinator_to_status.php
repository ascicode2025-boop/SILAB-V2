<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Ensure the status column includes all statuses used across the app
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu','disetujui','ditolak','proses','selesai','dibatalkan','menunggu_verifikasi','menunggu_ttd','menunggu_ttd_koordinator','menunggu_sign','ditandatangani','menunggu_verifikasi_kepala','menunggu_pembayaran','ditolak_kepala','dikirim_ke_teknisi','draft') NOT NULL DEFAULT 'menunggu'");
    }

    public function down()
    {
        // Revert to a safe subset (previous state)
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu','disetujui','ditolak','proses','selesai','dibatalkan','menunggu_verifikasi','menunggu_pembayaran','draft') NOT NULL DEFAULT 'menunggu'");
    }
};

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
        // Add new enum value 'menunggu_pembayaran' to bookings.status
        // Use raw statement to alter enum since changing enum in Laravel's schema builder is limited
        // Ensure enum contains all statuses that may exist in the database to avoid truncation
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu','disetujui','ditolak','proses','selesai','dibatalkan','menunggu_verifikasi','menunggu_ttd','menunggu_sign','ditandatangani','menunggu_verifikasi_kepala','menunggu_pembayaran') NOT NULL DEFAULT 'menunggu'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to previous enum (remove 'menunggu_pembayaran')
        // Revert to previous smaller enum (note: this may cause truncation if rows use newer statuses)
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('menunggu','disetujui','ditolak','proses','selesai','dibatalkan') NOT NULL DEFAULT 'menunggu'");
    }
};
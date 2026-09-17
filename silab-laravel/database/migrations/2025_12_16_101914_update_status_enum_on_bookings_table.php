<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // UPDATED: Gunakan lowercase untuk konsistensi dengan kode
        DB::statement("
            ALTER TABLE bookings
            MODIFY status ENUM(
              'menunggu',
              'disetujui',
              'ditolak',
              'proses',
              'selesai',
              'dibatalkan'
            ) NOT NULL DEFAULT 'menunggu'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE bookings
            MODIFY status ENUM(
              'menunggu',
              'disetujui',
              'ditolak',
              'proses',
              'selesai'
            ) NOT NULL DEFAULT 'menunggu'
        ");
    }
};

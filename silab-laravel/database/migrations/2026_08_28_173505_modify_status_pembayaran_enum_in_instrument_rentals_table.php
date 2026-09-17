<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status_pembayaran ENUM('tidak_perlu', 'belum_lunas', 'menunggu', 'lunas') DEFAULT 'tidak_perlu'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status_pembayaran ENUM('tidak_perlu', 'belum_lunas', 'lunas') DEFAULT 'tidak_perlu'");
    }
};

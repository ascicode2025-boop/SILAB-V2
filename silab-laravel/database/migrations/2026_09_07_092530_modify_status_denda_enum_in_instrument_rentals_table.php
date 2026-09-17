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
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status_denda ENUM('tidak_ada', 'belum_dibayar', 'menunggu', 'lunas') DEFAULT 'tidak_ada'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status_denda ENUM('tidak_ada', 'belum_dibayar', 'lunas') DEFAULT 'tidak_ada'");
    }
};

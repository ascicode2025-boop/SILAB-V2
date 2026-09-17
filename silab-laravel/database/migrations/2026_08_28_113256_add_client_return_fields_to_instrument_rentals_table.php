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
        Schema::table('instrument_rentals', function (Blueprint $table) {
            $table->date('client_return_date')->nullable();
            $table->string('client_return_condition')->nullable();
            $table->text('client_return_notes')->nullable();
        });
        
        DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status ENUM('pending', 'disetujui', 'aktif', 'menunggu_pengembalian', 'ditolak', 'selesai') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE instrument_rentals MODIFY COLUMN status ENUM('pending', 'disetujui', 'aktif', 'ditolak', 'selesai') DEFAULT 'pending'");

        Schema::table('instrument_rentals', function (Blueprint $table) {
            $table->dropColumn(['client_return_date', 'client_return_condition', 'client_return_notes']);
        });
    }
};

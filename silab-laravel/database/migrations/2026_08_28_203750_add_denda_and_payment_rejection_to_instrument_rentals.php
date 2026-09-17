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
        Schema::table('instrument_rentals', function (Blueprint $table) {
            $table->text('alasan_penolakan_pembayaran')->nullable()->after('status_pembayaran');
            $table->integer('denda')->nullable()->after('alasan_penolakan_pembayaran');
            $table->enum('status_denda', ['tidak_ada', 'belum_dibayar', 'lunas'])->default('tidak_ada')->after('denda');
            $table->string('denda_payment_proof_path')->nullable()->after('status_denda');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instrument_rentals', function (Blueprint $table) {
            $table->dropColumn(['alasan_penolakan_pembayaran', 'denda', 'status_denda', 'denda_payment_proof_path']);
        });
    }
};

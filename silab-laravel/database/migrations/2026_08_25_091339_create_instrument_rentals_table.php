<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instrument_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('tujuan_peminjaman');
            $table->text('kegiatan_penelitian');
            $table->string('dosen_penanggung_jawab');
            $table->string('surat_pembimbing_path');
            $table->date('tanggal_peminjaman');
            $table->date('tanggal_pengembalian');
            $table->enum('status', ['pending', 'disetujui', 'ditolak', 'selesai'])->default('pending');
            $table->text('alasan_penolakan')->nullable();
            $table->enum('status_pembayaran', ['tidak_perlu', 'belum_lunas', 'lunas'])->default('tidak_perlu');
            $table->string('payment_proof_path')->nullable();
            $table->string('final_document_path')->nullable(); // Ditambahkan untuk menyimpan PDF persetujuan dengan TTD Kepala Lab
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instrument_rentals');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instruments', function (Blueprint $table) {
            $table->id();
            $table->string('nama_alat');
            $table->text('deskripsi');
            $table->string('foto_path')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->integer('harga_sewa')->default(0);
            $table->enum('status', ['tersedia', 'dipinjam', 'rusak', 'perawatan'])->default('tersedia');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instruments');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Ubah kolom-kolom ini agar boleh kosong (nullable)
            $table->string('full_name')->nullable()->change();
            $table->string('institusi')->nullable()->change();
            $table->string('nomor_telpon')->nullable()->change();
            $table->text('bio')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Kembalikan ke pengaturan awal (jika perlu rollback)
            // Catatan: Ini mungkin error jika ada data NULL saat rollback
            // $table->string('full_name')->nullable(false)->change();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('analysis_prices', function (Blueprint $table) {
            $table->string('kategori')->default('Metabolit');
        });
    }

    public function down(): void
    {
        Schema::table('analysis_prices', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};

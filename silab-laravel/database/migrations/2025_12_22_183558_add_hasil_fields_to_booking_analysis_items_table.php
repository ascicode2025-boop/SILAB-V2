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
        Schema::table('booking_analysis_items', function (Blueprint $table) {
            $table->text('hasil')->nullable()->after('nama_item');
            $table->string('metode')->nullable()->after('hasil');
            $table->string('nama_analisis')->nullable()->after('metode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_analysis_items', function (Blueprint $table) {
            $table->dropColumn(['hasil', 'metode', 'nama_analisis']);
        });
    }
};

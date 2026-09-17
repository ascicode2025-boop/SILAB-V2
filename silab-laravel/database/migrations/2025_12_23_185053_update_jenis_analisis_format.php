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
        // First, alter the enum to include new value
        DB::statement("ALTER TABLE bookings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi_metabolit', 'hematologi dan metabolit')");
        DB::statement("ALTER TABLE quota_settings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi_metabolit', 'hematologi dan metabolit')");

        // Then update existing data from 'hematologi_metabolit' to 'hematologi dan metabolit'
        DB::table('bookings')
            ->where('jenis_analisis', 'hematologi_metabolit')
            ->update(['jenis_analisis' => 'hematologi dan metabolit']);

        DB::table('quota_settings')
            ->where('jenis_analisis', 'hematologi_metabolit')
            ->update(['jenis_analisis' => 'hematologi dan metabolit']);

        // Finally, remove old value from enum
        DB::statement("ALTER TABLE bookings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi dan metabolit')");
        DB::statement("ALTER TABLE quota_settings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi dan metabolit')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First, add old value back to enum
        DB::statement("ALTER TABLE bookings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi_metabolit', 'hematologi dan metabolit')");
        DB::statement("ALTER TABLE quota_settings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi_metabolit', 'hematologi dan metabolit')");

        // Revert data back to underscore format
        DB::table('bookings')
            ->where('jenis_analisis', 'hematologi dan metabolit')
            ->update(['jenis_analisis' => 'hematologi_metabolit']);

        DB::table('quota_settings')
            ->where('jenis_analisis', 'hematologi dan metabolit')
            ->update(['jenis_analisis' => 'hematologi_metabolit']);

        // Remove new value from enum
        DB::statement("ALTER TABLE bookings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi_metabolit')");
        DB::statement("ALTER TABLE quota_settings MODIFY COLUMN jenis_analisis ENUM('hematologi', 'metabolit', 'hematologi_metabolit')");
    }
};

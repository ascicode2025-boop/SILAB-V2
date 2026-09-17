<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Add nullable pdf_path column to store uploaded PDF path from teknisi
        Schema::table('bookings', function ($table) {
            $table->string('pdf_path')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('bookings', function ($table) {
            $table->dropColumn('pdf_path');
        });
    }
};

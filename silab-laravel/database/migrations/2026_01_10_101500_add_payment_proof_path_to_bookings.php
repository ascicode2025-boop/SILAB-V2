<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('bookings', 'payment_proof_path')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('payment_proof_path')->nullable()->after('pdf_path');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('bookings', 'payment_proof_path')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('payment_proof_path');
            });
        }
    }
};

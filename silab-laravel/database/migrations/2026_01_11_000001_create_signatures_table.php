<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('type')->default('kepala_approval');
            $table->unsignedBigInteger('created_by')->nullable(); // kepala id
            $table->unsignedBigInteger('signed_by')->nullable(); // koordinator id when signed
            $table->string('file_path')->nullable();
            $table->enum('status', ['pending','signed','cancelled'])->default('pending');
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('signatures');
    }
};

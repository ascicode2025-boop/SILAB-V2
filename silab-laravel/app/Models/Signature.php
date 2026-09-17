<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Booking;

class Signature extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $dates = ['signed_at', 'created_at', 'updated_at'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}

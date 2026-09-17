<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClosedRentalDate extends Model
{
    use HasFactory;

    protected $table = 'closed_rental_dates';

    protected $fillable = [
        'tanggal',
        'alasan',
        'created_by',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

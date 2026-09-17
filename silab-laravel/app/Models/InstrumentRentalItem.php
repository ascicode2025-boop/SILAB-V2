<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstrumentRentalItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id',
        'instrument_id',
        'kondisi_kembali'
    ];

    public function rental()
    {
        return $this->belongsTo(InstrumentRental::class, 'rental_id');
    }

    public function instrument()
    {
        return $this->belongsTo(Instrument::class, 'instrument_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instrument extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_alat',
        'deskripsi',
        'foto_path',
        'is_paid',
        'harga_sewa',
        'total_unit',
        'unit_rusak',
        'unit_perawatan',
    ];

    public function rentals()
    {
        return $this->belongsToMany(InstrumentRental::class, 'instrument_rental_items', 'instrument_id', 'rental_id')
                    ->withPivot('kondisi_kembali')
                    ->withTimestamps();
    }
}

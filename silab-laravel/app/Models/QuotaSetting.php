<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuotaSetting extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal' => 'date',
        'is_strict' => 'boolean',
    ];

    // Scope untuk cari quota berdasarkan tanggal dan jenis
    public function scopeForDate($query, $tanggal, $jenisAnalisis)
    {
        return $query->where('tanggal', $tanggal)
                     ->where('jenis_analisis', $jenisAnalisis);
    }

    // Scope untuk master rule (default quota)
    public function scopeMasterRule($query, $jenisAnalisis)
    {
        return $query->whereNull('tanggal')
                     ->where('jenis_analisis', $jenisAnalisis);
    }
}

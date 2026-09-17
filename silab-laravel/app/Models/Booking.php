<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kode_sampel',
        'kode_batch',
        'jenis_analisis',
        'tanggal_kirim',
        'status',
        'status_updated_at',
        'pdf_path',
        'payment_proof_path',
        'alasan_penolakan',
        'alasan_tolak',
        'alasan_teknisi',
        'jenis_hewan',
        'jenis_hewan_lain',
        'jenis_kelamin',
        'umur',
        'status_fisiologis',
        'jumlah_sampel',
        'hasil_analisis',
        'is_paid',
    ];

    protected $casts = [
        'tanggal_kirim' => 'date',
    ];

    // Ensure snake_case serialization for frontend
    protected $with = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function analysisItems()
    {
        return $this->hasMany(BookingAnalysisItem::class);
    }

    public function signature()
    {
        return $this->hasOne(\App\Models\Signature::class);
    }

    // Override toArray to ensure snake_case for relations
    public function toArray()
    {
        $array = parent::toArray();

        // Convert analysisItems to analysis_items if loaded
        if (isset($array['analysis_items'])) {
            // Already correct
        } elseif ($this->relationLoaded('analysisItems')) {
            $array['analysis_items'] = $this->analysisItems->toArray();
        }

        return $array;
    }
}

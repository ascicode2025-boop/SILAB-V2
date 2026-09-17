<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstrumentRental extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tujuan_peminjaman',
        'kegiatan_penelitian',
        'dosen_penanggung_jawab',
        'surat_pembimbing_path',
        'tanggal_peminjaman',
        'tanggal_pengembalian',
        'status',
        'alasan_penolakan',
        'catatan_koordinator',
        'status_pembayaran',
        'payment_proof_path',
        'final_document_path',
        'handover_checklist',
        'handover_notes',
        'client_return_date',
        'client_return_condition',
        'client_return_notes',
        'alasan_penolakan_pembayaran',
        'denda',
        'status_denda',
        'denda_payment_proof_path',
        'client_return_photo_path'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function instruments()
    {
        return $this->belongsToMany(Instrument::class, 'instrument_rental_items', 'rental_id', 'instrument_id')
                    ->withPivot('kondisi_kembali', 'id')
                    ->withTimestamps();
    }
}

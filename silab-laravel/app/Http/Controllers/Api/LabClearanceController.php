<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabClearance;
use App\Models\InstrumentRental;
use Illuminate\Http\Request;

class LabClearanceController extends Controller
{
    // Klien mengecek status & request surat bebas lab
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'klien') {
            return response()->json(['message' => 'Hanya klien yang bisa mengakses ini'], 403);
        }

        // Cek tagihan belum lunas
        $hasUnpaid = InstrumentRental::where('user_id', $user->id)
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->where(function ($query) {
                $query->where('status_pembayaran', 'belum_lunas')
                      ->orWhere(function ($q) {
                          $q->where('denda', '>', 0)
                            ->where('status_denda', '!=', 'lunas');
                      });
            })
            ->exists();

        // Cek peminjaman yang belum selesai dikembalikan
        $hasUnreturned = InstrumentRental::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian'])
            ->exists();

        $canBeCleared = !$hasUnpaid && !$hasUnreturned;

        $clearance = LabClearance::firstOrCreate(
            ['user_id' => $user->id],
            ['is_cleared' => $canBeCleared]
        );

        // Update status jika kondisi berubah
        if ($canBeCleared !== (bool)$clearance->is_cleared) {
            $clearance->update(['is_cleared' => $canBeCleared]);
        }

        return response()->json([
            'message' => 'Status Bebas Lab',
            'data' => [
                'is_cleared' => (bool)$clearance->is_cleared,
                'has_unpaid_rentals' => $hasUnpaid,
                'has_unreturned_rentals' => $hasUnreturned,
                'pdf_url' => $clearance->is_cleared ? ($clearance->pdf_path ? url('storage/' . $clearance->pdf_path) : null) : null
            ]
        ], 200);
    }

    // Klien generate ulang / request generate PDF Bebas Lab
    public function generate(Request $request)
    {
        $user = $request->user();
        
        $hasUnpaid = InstrumentRental::where('user_id', $user->id)
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->where(function ($query) {
                $query->where('status_pembayaran', 'belum_lunas')
                      ->orWhere(function ($q) {
                          $q->where('denda', '>', 0)
                            ->where('status_denda', '!=', 'lunas');
                      });
            })
            ->exists();

        $hasUnreturned = InstrumentRental::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian'])
            ->exists();

        if ($hasUnpaid) {
            return response()->json([
                'message' => 'Tidak dapat menerbitkan Surat Bebas Lab. Anda memiliki tagihan peminjaman yang belum lunas.'
            ], 400);
        }

        if ($hasUnreturned) {
            return response()->json([
                'message' => 'Tidak dapat menerbitkan Surat Bebas Lab. Anda masih memiliki peminjaman alat yang belum selesai.'
            ], 400);
        }

        $clearance = LabClearance::firstOrCreate(['user_id' => $user->id]);
        
        $isMahasiswa = $request->input('is_mahasiswa', true);
        $semester = $isMahasiswa ? $request->input('semester', '-') : '-';
        $departemen = $isMahasiswa ? $request->input('departemen', '-') : '-';

        $pdfName = 'bebas_lab_' . $user->id . '_' . time() . '.pdf';
        $pdfPath = 'clearances/' . $pdfName;

        $pdfData = [
            'name' => $user->full_name ?? $user->name,
            'nim' => $isMahasiswa ? ($user->nim ?? '-') : '-',
            'semester' => $semester,
            'program_mayor' => $isMahasiswa ? ($user->prodi ?? '-') : '-',
            'departemen' => $departemen,
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.surat-bebas-lab', $pdfData);
        \Illuminate\Support\Facades\Storage::disk('public')->put($pdfPath, $pdf->output());

        $clearance->update([
            'is_cleared' => true,
            'pdf_path' => $pdfPath
        ]);

        return response()->json([
            'message' => 'Surat Bebas Lab berhasil diterbitkan.',
            'data' => $clearance,
            'pdf_url' => url('storage/' . $pdfPath)
        ], 200);
    }
}

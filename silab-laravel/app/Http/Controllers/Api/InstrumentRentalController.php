<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrument;
use App\Models\InstrumentRental;
use App\Models\InstrumentRentalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use setasign\Fpdi\Fpdi;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;
use App\Models\User;
use App\Models\ClosedRentalDate;
use Illuminate\Support\Facades\Auth;

class InstrumentRentalController extends Controller
{
    // Mengambil semua pengajuan (Koordinator) atau milik Klien
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = InstrumentRental::with(['instruments', 'user']);

        if ($user->role === 'klien') {
            $query->where('user_id', $user->id);
        }

        $rentals = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Berhasil mengambil data pengajuan peminjaman',
            'data' => $rentals
        ], 200);
    }

    // Mendapatkan detail satu pengajuan
    public function show(Request $request, $id)
    {
        $rental = InstrumentRental::with(['instruments', 'user'])->findOrFail($id);
        $user = $request->user();

        if ($user->role === 'klien' && $rental->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'message' => 'Berhasil mengambil detail pengajuan',
            'data' => $rental
        ], 200);
    }

    // Submit pengajuan dari Klien
    public function store(Request $request)
    {
        $user = $request->user();

        // Validasi
        $validator = Validator::make($request->all(), [
            'instrument_ids' => 'required|array',
            'instrument_ids.*' => 'exists:instruments,id',
            'tujuan_peminjaman' => 'required|string',
            'kegiatan_penelitian' => 'required|string',
            'dosen_penanggung_jawab' => 'required|string',
            'tanggal_peminjaman' => 'required|date|after_or_equal:today',
            'tanggal_pengembalian' => 'required|date|after_or_equal:tanggal_peminjaman',
            'surat_pembimbing' => 'required|file|mimes:pdf|max:10240',
            'payment_proof' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cek alat berbayar
        $instruments = Instrument::whereIn('id', $request->instrument_ids)->get();
        $isAnyPaid = $instruments->where('is_paid', true)->isNotEmpty();

        $reqStart = \Carbon\Carbon::parse($request->tanggal_peminjaman);
        $reqEnd = \Carbon\Carbon::parse($request->tanggal_pengembalian);

        // Cek hari libur (Sabtu & Minggu)
        if ($reqStart->isWeekend() || $reqEnd->isWeekend()) {
            return response()->json([
                'errors' => [
                    'tanggal_peminjaman' => ['Peminjaman alat tidak dapat dilakukan pada hari libur (Sabtu dan Minggu).']
                ]
            ], 422);
        }

        // Cek tanggal ditutup oleh koordinator
        $closedDates = ClosedRentalDate::whereIn('tanggal', [
            $request->tanggal_peminjaman,
            $request->tanggal_pengembalian
        ])->get();

        if ($closedDates->isNotEmpty()) {
            $listDates = $closedDates->map(function ($item) {
                $tgl = \Carbon\Carbon::parse($item->tanggal)->format('d-m-Y');
                return $item->alasan ? "{$tgl} ({$item->alasan})" : $tgl;
            })->join(', ');

            return response()->json([
                'errors' => [
                    'tanggal_peminjaman' => ["Layanan peminjaman alat ditutup pada tanggal: {$listDates}."]
                ]
            ], 422);
        }

        $activeStatuses = ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian'];

        foreach ($instruments as $instrument) {
            $requestedCount = collect($request->instrument_ids)->filter(function($id) use ($instrument) {
                return (string)$id === (string)$instrument->id;
            })->count();

            $stokEfektif = $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan;

            if ($stokEfektif <= 0) {
                return response()->json([
                    'errors' => [
                        'tanggal_peminjaman' => ["Stok alat '{$instrument->nama_alat}' saat ini tidak tersedia untuk dipinjam."]
                    ]
                ], 422);
            }

            if ($requestedCount > $stokEfektif) {
                return response()->json([
                    'errors' => [
                        'tanggal_peminjaman' => ["Jumlah permintaan alat '{$instrument->nama_alat}' ({$requestedCount} unit) melebihi total unit yang tersedia ({$stokEfektif} unit)."]
                    ]
                ], 422);
            }

            // Ambil rental aktif yang beririsan dengan rentang tanggal permintaan
            // Formula irisan: (tanggal_peminjaman <= reqEnd) AND (tanggal_pengembalian >= reqStart)
            $rentals = InstrumentRentalItem::where('instrument_id', $instrument->id)
                ->whereHas('rental', function ($q) use ($reqStart, $reqEnd, $activeStatuses) {
                    $q->whereIn('status', $activeStatuses)
                      ->where('tanggal_peminjaman', '<=', $reqEnd->toDateString())
                      ->where('tanggal_pengembalian', '>=', $reqStart->toDateString());
                })
                ->with('rental')
                ->get();

            // Cek ketersediaan setiap hari di rentang permintaan
            for ($date = $reqStart->copy(); $date->lte($reqEnd); $date->addDay()) {
                $dateStr = $date->toDateString();

                $bookedOnDate = $rentals->filter(function ($item) use ($dateStr) {
                    return $item->rental
                        && $dateStr >= $item->rental->tanggal_peminjaman
                        && $dateStr <= $item->rental->tanggal_pengembalian;
                })->count();

                $sisaStok = $stokEfektif - $bookedOnDate;

                if ($requestedCount > $sisaStok) {
                    $dateFmt = $date->format('d-m-Y');
                    return response()->json([
                        'errors' => [
                            'tanggal_peminjaman' => [
                                $sisaStok <= 0
                                    ? "Alat '{$instrument->nama_alat}' sudah dipesan pada tanggal {$dateFmt}. Tidak dapat memesan di tanggal yang bersamaan. Silakan pilih tanggal lain."
                                    : "Alat '{$instrument->nama_alat}' pada tanggal {$dateFmt} sudah dipesan ({$bookedOnDate} unit terpakai, sisa {$sisaStok} unit). Permintaan ({$requestedCount} unit) melebihi kapasitas yang tersedia di tanggal tersebut."
                            ]
                        ]
                    ], 422);
                }
            }
        }

        $statusPembayaran = $isAnyPaid ? 'belum_lunas' : 'tidak_perlu';
        
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('rentals/payment', 'public');
            $statusPembayaran = 'menunggu';
        }

        // Simpan File
        $suratPath = $request->file('surat_pembimbing')->store('rentals/surat', 'public');

        // Buat Rental
        $rental = InstrumentRental::create([
            'user_id' => $user->id,
            'tujuan_peminjaman' => $request->tujuan_peminjaman,
            'kegiatan_penelitian' => $request->kegiatan_penelitian,
            'dosen_penanggung_jawab' => $request->dosen_penanggung_jawab,
            'surat_pembimbing_path' => $suratPath,
            'tanggal_peminjaman' => $request->tanggal_peminjaman,
            'tanggal_pengembalian' => $request->tanggal_pengembalian,
            'status' => 'pending',
            'status_pembayaran' => $statusPembayaran,
            'payment_proof_path' => $paymentProofPath,
        ]);

        // Attach Instruments
        foreach ($request->instrument_ids as $instrument_id) {
            InstrumentRentalItem::create([
                'rental_id' => $rental->id,
                'instrument_id' => $instrument_id
            ]);
        }

        $koordinator = User::where('role', 'koordinator')->first();
        if ($koordinator) {
            $this->sendNotification($koordinator->id, 'Pengajuan Peminjaman Baru', "Peminjaman alat baru (ID: {$rental->id}) diajukan oleh " . Auth::user()->name);
        }

        return response()->json([
            'message' => 'Pengajuan peminjaman berhasil dikirim',
            'data' => $rental->load('instruments')
        ], 201);
    }

    // Persetujuan / Penolakan (Koordinator)
    public function verify(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:disetujui,ditolak',
            'catatan_koordinator' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rental = InstrumentRental::findOrFail($id);

        if ($request->status === 'ditolak') {
            $rental->update([
                'status' => 'ditolak',
                'catatan_koordinator' => $request->catatan_koordinator,
                'alasan_penolakan' => $request->catatan_koordinator
            ]);
        } elseif ($request->status === 'disetujui') {
            $finalPath = $this->appendSignatureToPdf($rental->surat_pembimbing_path);

            $rental->update([
                'status' => 'disetujui',
                'catatan_koordinator' => $request->catatan_koordinator,
                'final_document_path' => $finalPath
            ]);
        }

        $this->sendNotification($rental->user_id, 'Status Peminjaman Alat', "Status peminjaman alat Anda (ID: {$rental->id}) telah diubah menjadi {$rental->status}.");

        return response()->json([
            'message' => 'Pengajuan berhasil diverifikasi',
            'data' => $rental
        ], 200);
    }

    // Fungsi internal untuk menambahkan TTD Kepala Lab menggunakan FPDI
    private function appendSignatureToPdf($originalPdfPath)
    {
        try {
            $fullOriginalPath = Storage::disk('public')->path($originalPdfPath);
            
            if (!file_exists($fullOriginalPath)) {
                Log::error("FPDI: Original PDF not found at " . $fullOriginalPath);
                return null;
            }

            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($fullOriginalPath);

            // Hanya proses 2 halaman pertama (hapus halaman kosong 3-6)
            $targetPages = min(2, $pageCount);

            for ($pageNo = 1; $pageNo <= $targetPages; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);
                
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
                
                if ($pageNo == 1) {
                    $ttdPath = public_path('asset/ttd.png');
                    if (file_exists($ttdPath)) {
                        $pdf->Image($ttdPath, 95, 223, 20); 
                        $pdf->SetFillColor(255, 255, 255);
                        $pdf->Rect(65, 240, 80, 15, 'F');
                        $pdf->SetFont('Arial', 'B', 10);
                        $pdf->SetXY(65, 244);
                        $pdf->Cell(80, 5, 'Prof. Dr. Ir. Dewi Apri Astuti, M.S.', 0, 0, 'C');
                        $pdf->SetFont('Arial', '', 10);
                        $pdf->SetXY(65, 248);
                        $pdf->Cell(80, 5, 'NIP. 196110051985032001', 0, 0, 'C');
                        $pdf->SetFont('Arial', 'I', 8);
                        $pdf->SetXY(85, 253);
                        $pdf->Cell(40, 5, 'Ditandatangani secara digital', 0, 0, 'C');
                    } else {
                        Log::warning("FPDI: TTD image not found at " . $ttdPath);
                    }
                } elseif ($pageNo == 2) {
                    $ttdPath = public_path('asset/ttd.png');
                    if (file_exists($ttdPath)) {
                        $pdf->Image($ttdPath, 35, 213, 20); 
                        $pdf->SetFillColor(255, 255, 255);
                        $pdf->Rect(10, 233, 70, 15, 'F');
                        $pdf->SetFont('Arial', 'B', 10);
                        $pdf->SetXY(10, 234);
                        $pdf->Cell(70, 5, 'Prof. Dr. Ir. Dewi Apri Astuti, M.S.', 0, 0, 'C');
                        $pdf->SetFont('Arial', '', 10);
                        $pdf->SetXY(10, 238);
                        $pdf->Cell(70, 5, 'NIP. 196110051985032001', 0, 0, 'C');
                        $pdf->SetFont('Arial', 'I', 8);
                        $pdf->SetXY(25, 243);
                        $pdf->Cell(40, 5, 'Ditandatangani secara digital', 0, 0, 'C');
                    }
                }
            }

            $newFileName = 'rentals/final/' . uniqid() . '_final.pdf';
            $outputFilePath = Storage::disk('public')->path($newFileName);
            
            if (!file_exists(dirname($outputFilePath))) {
                mkdir(dirname($outputFilePath), 0755, true);
            }

            $pdf->Output('F', $outputFilePath);
            return $newFileName;

        } catch (\Exception $e) {
            Log::error('FPDI Error: ' . $e->getMessage());
            return null;
        }
    }

    public function downloadTemplateWithTtd()
    {
        try {
            $templatePath = public_path('asset/Formulir_Peminjaman_Lab.pdf');
            if (!file_exists($templatePath)) {
                return response()->json(['error' => 'Template not found'], 404);
            }

            $pdf = new Fpdi();
            $pageCount = $pdf->setSourceFile($templatePath);

            // Hanya proses 2 halaman pertama (hapus halaman kosong 3-6)
            $targetPages = min(2, $pageCount);

            for ($pageNo = 1; $pageNo <= $targetPages; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);
                
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
                
                if ($pageNo == 1) {
                    $ttdPath = public_path('asset/ttd.png');
                    if (file_exists($ttdPath)) {
                        $pdf->Image($ttdPath, 95, 223, 20); 
                        $pdf->SetFillColor(255, 255, 255);
                        $pdf->Rect(65, 240, 80, 15, 'F');
                        $pdf->SetFont('Arial', 'B', 10);
                        $pdf->SetXY(65, 244);
                        $pdf->Cell(80, 5, 'Prof. Dr. Ir. Dewi Apri Astuti, M.S.', 0, 0, 'C');
                        $pdf->SetFont('Arial', '', 10);
                        $pdf->SetXY(65, 248);
                        $pdf->Cell(80, 5, 'NIP. 196110051985032001', 0, 0, 'C');
                        $pdf->SetFont('Arial', 'I', 8);
                        $pdf->SetXY(85, 253);
                        $pdf->Cell(40, 5, 'Ditandatangani secara digital', 0, 0, 'C');
                    }
                } elseif ($pageNo == 2) {
                    $ttdPath = public_path('asset/ttd.png');
                    if (file_exists($ttdPath)) {
                        $pdf->Image($ttdPath, 35, 213, 20); 
                        $pdf->SetFillColor(255, 255, 255);
                        $pdf->Rect(10, 233, 70, 15, 'F');
                        $pdf->SetFont('Arial', 'B', 10);
                        $pdf->SetXY(10, 234);
                        $pdf->Cell(70, 5, 'Prof. Dr. Ir. Dewi Apri Astuti, M.S.', 0, 0, 'C');
                        $pdf->SetFont('Arial', '', 10);
                        $pdf->SetXY(10, 238);
                        $pdf->Cell(70, 5, 'NIP. 196110051985032001', 0, 0, 'C');
                        $pdf->SetFont('Arial', 'I', 8);
                        $pdf->SetXY(25, 243);
                        $pdf->Cell(40, 5, 'Ditandatangani secara digital', 0, 0, 'C');
                    }
                }
            }

            $content = $pdf->Output('S');
            return response($content)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Formulir_Peminjaman_Lab.pdf"');
        } catch (\Exception $e) {
            Log::error('FPDI Error in template: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate template'], 500);
        }
    }

    // Upload Bukti Bayar (Klien)
    public function uploadPayment(Request $request, $id)
    {
        $user = $request->user();
        $rental = InstrumentRental::findOrFail($id);

        if ($rental->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->file('payment_proof')->store('rentals/payment', 'public');

        $rental->update([
            'status_pembayaran' => 'menunggu',
            'payment_proof_path' => $path
        ]);

        $koordinator = User::where('role', 'koordinator')->first();
        if ($koordinator) {
            $this->sendNotification($koordinator->id, 'Bukti Pembayaran Diunggah', "Klien telah mengunggah bukti pembayaran untuk peminjaman alat (ID: {$rental->id})");
        }

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah',
            'data' => $rental
        ], 200);
    }

    // Verifikasi Pembayaran (Koordinator)
    public function verifyPayment(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rental = InstrumentRental::findOrFail($id);
        
        $rental->update([
            'status_pembayaran' => 'lunas',
            'alasan_penolakan_pembayaran' => null
        ]);

        $this->sendNotification($rental->user_id, 'Pembayaran Diverifikasi', "Pembayaran untuk peminjaman alat (ID: {$rental->id}) telah diverifikasi dan lunas.");

        return response()->json([
            'message' => 'Pembayaran berhasil diverifikasi',
            'data' => $rental
        ], 200);
    }

    // Tolak Pembayaran (Koordinator)
    public function rejectPayment(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'alasan' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rental = InstrumentRental::findOrFail($id);
        
        $rental->update([
            'status_pembayaran' => 'belum_lunas',
            'payment_proof_path' => null,
            'alasan_penolakan_pembayaran' => $request->alasan
        ]);

        $this->sendNotification($rental->user_id, 'Pembayaran Ditolak', "Bukti pembayaran untuk peminjaman alat (ID: {$rental->id}) ditolak dengan alasan: " . $request->alasan);

        return response()->json([
            'message' => 'Pembayaran ditolak',
            'data' => $rental
        ], 200);
    }

    // Tandai Siap Diambil (Teknisi: disetujui → siap_diambil)
    public function markReadyForPickup(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'teknisi') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rental = InstrumentRental::findOrFail($id);

        if ($rental->status !== 'disetujui') {
            return response()->json(['message' => 'Status peminjaman bukan disetujui'], 422);
        }

        $rental->update(['status' => 'siap_diambil']);

        $this->sendNotification($rental->user_id, 'Alat Siap Diambil', "Alat untuk peminjaman (ID: {$rental->id}) telah disiapkan dan siap diambil.");

        return response()->json([
            'message' => 'Alat berhasil ditandai siap diambil',
            'data' => $rental
        ], 200);
    }

    // Serah Terima Alat ke Klien (Teknisi: siap_diambil → aktif)
    public function handover(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'teknisi') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rental = InstrumentRental::findOrFail($id);

        if ($rental->status !== 'siap_diambil') {
            return response()->json(['message' => 'Status peminjaman bukan siap_diambil'], 422);
        }

        $rental->update([
            'status' => 'aktif',
            'handover_checklist' => $request->input('handover_checklist'),
            'handover_notes' => $request->input('handover_notes'),
        ]);

        $this->sendNotification($rental->user_id, 'Alat Diserahkan', "Alat untuk peminjaman (ID: {$rental->id}) telah diserahkan dan status menjadi aktif.");

        return response()->json([
            'message' => 'Alat berhasil diserahkan',
            'data' => $rental
        ], 200);
    }

    // Pengajuan Pengembalian (Klien)
    public function clientReturnRequest(Request $request, $id)
    {
        $user = $request->user();
        $rental = InstrumentRental::findOrFail($id);

        if ($rental->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($rental->status !== 'aktif') {
            return response()->json(['message' => 'Status peminjaman bukan aktif'], 422);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_pengembalian_aktual' => 'required|date',
            'kondisi_alat' => 'required|string',
            'catatan' => 'nullable|string',
            'foto_kerusakan' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $photoPath = null;
        if ($request->hasFile('foto_kerusakan')) {
            $photoPath = $request->file('foto_kerusakan')->store('rentals/returns', 'public');
        }

        $rental->update([
            'status' => 'menunggu_pengembalian',
            'client_return_date' => $request->input('tanggal_pengembalian_aktual'),
            'client_return_condition' => $request->input('kondisi_alat'),
            'client_return_notes' => $request->input('catatan'),
            'client_return_photo_path' => $photoPath,
        ]);

        $teknisiList = User::where('role', 'teknisi')->get();
        foreach($teknisiList as $teknisi) {
            $this->sendNotification($teknisi->id, 'Pengajuan Pengembalian Alat', "Klien mengajukan pengembalian untuk peminjaman (ID: {$rental->id})");
        }

        return response()->json([
            'message' => 'Pengajuan pengembalian berhasil',
            'data' => $rental
        ], 200);
    }

    // Pengembalian Alat (Teknisi)
    public function returnInstruments(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'teknisi') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:instrument_rental_items,id',
            'items.*.instrument_id' => 'required|exists:instruments,id',
            'items.*.kondisi_kembali' => 'required|string',
            'denda' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $denda = $request->input('denda', 0);
        $hasRusak = collect($request->items)->contains(function ($item) {
            return strtolower($item['kondisi_kembali']) === 'rusak';
        });

        if ($hasRusak && $denda <= 0) {
            return response()->json([
                'message' => 'Alat rusak, wajib memasukkan nominal denda.'
            ], 422);
        }

        $rental = InstrumentRental::findOrFail($id);
        
        foreach ($request->items as $reqItem) {
            $rentalItem = InstrumentRentalItem::where('rental_id', $rental->id)
                ->where('id', $reqItem['item_id'])
                ->first();
                
            if ($rentalItem) {
                $oldKondisi = strtolower($rentalItem->kondisi_kembali ?? '');
                $newKondisi = strtolower($reqItem['kondisi_kembali']);

                $rentalItem->update(['kondisi_kembali' => $reqItem['kondisi_kembali']]);
                
                $instrument = Instrument::find($rentalItem->instrument_id);
                if ($instrument) {
                    if ($oldKondisi !== $newKondisi) {
                        // Revert old condition
                        if ($oldKondisi === 'rusak' && $instrument->unit_rusak > 0) {
                            $instrument->unit_rusak -= 1;
                        } elseif ($oldKondisi === 'dalam perawatan' && $instrument->unit_perawatan > 0) {
                            $instrument->unit_perawatan -= 1;
                        }

                        // Apply new condition
                        if ($newKondisi === 'rusak') {
                            $instrument->unit_rusak += 1;
                        } elseif ($newKondisi === 'dalam perawatan') {
                            $instrument->unit_perawatan += 1;
                        }
                        
                        $instrument->save();
                    }
                }
            }
        }

        $denda = $request->input('denda', 0);
        if ($denda > 0) {
            $rental->update([
                'status' => 'menunggu_pembayaran_denda',
                'denda' => $denda,
                'status_denda' => 'belum_dibayar'
            ]);
        } else {
            $rental->update([
                'status' => 'selesai',
                'denda' => 0,
                'status_denda' => 'tidak_ada'
            ]);
        }

        $this->sendNotification($rental->user_id, 'Pengembalian Alat Selesai', "Pengembalian alat untuk peminjaman (ID: {$rental->id}) telah selesai diverifikasi teknisi.");

        return response()->json([
            'message' => 'Pengembalian alat berhasil dicatat',
            'data' => $rental
        ], 200);
    }

    // Upload Bukti Denda (Klien)
    public function uploadDenda(Request $request, $id)
    {
        $user = $request->user();
        $rental = InstrumentRental::findOrFail($id);

        if ($rental->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($rental->status !== 'menunggu_pembayaran_denda') {
            return response()->json(['message' => 'Peminjaman tidak dalam status menunggu pembayaran denda'], 400);
        }

        $validator = Validator::make($request->all(), [
            'denda_payment_proof' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->file('denda_payment_proof')->store('rentals/denda', 'public');

        $rental->update([
            'denda_payment_proof_path' => $path,
            'status_denda' => 'menunggu'
        ]);

        $koordinator = User::where('role', 'koordinator')->first();
        if ($koordinator) {
            $this->sendNotification($koordinator->id, 'Bukti Pembayaran Denda Diunggah', "Klien telah mengunggah bukti pembayaran denda untuk peminjaman alat (ID: {$rental->id})");
        }

        return response()->json([
            'message' => 'Bukti denda berhasil diunggah',
            'data' => $rental
        ], 200);
    }

    // Verifikasi Denda (Koordinator)
    public function verifyDenda(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rental = InstrumentRental::findOrFail($id);
        
        $rental->update([
            'status' => 'selesai',
            'status_denda' => 'lunas',
            'status_pembayaran' => 'lunas'
        ]);

        $this->sendNotification($rental->user_id, 'Pembayaran Denda Diverifikasi', "Pembayaran denda untuk peminjaman alat (ID: {$rental->id}) telah diverifikasi dan lunas.");

        return response()->json([
            'message' => 'Pembayaran denda berhasil diverifikasi',
            'data' => $rental
        ], 200);
    }

    // Mengubah tanggal peminjaman dan pengembalian (Koordinator)
    public function updateDates(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_peminjaman' => 'required|date',
            'tanggal_pengembalian' => 'required|date|after_or_equal:tanggal_peminjaman',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rental = InstrumentRental::findOrFail($id);
        $reqStart = \Carbon\Carbon::parse($request->tanggal_peminjaman);
        $reqEnd = \Carbon\Carbon::parse($request->tanggal_pengembalian);
        $activeStatuses = ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian'];

        $instrumentCounts = InstrumentRentalItem::where('rental_id', $rental->id)
            ->selectRaw('instrument_id, count(*) as count')
            ->groupBy('instrument_id')
            ->pluck('count', 'instrument_id');

        foreach ($instrumentCounts as $instrumentId => $requestedQty) {
            $instrument = Instrument::find($instrumentId);
            if (!$instrument) continue;

            $otherRentals = InstrumentRentalItem::where('instrument_id', $instrumentId)
                ->where('rental_id', '!=', $rental->id)
                ->whereHas('rental', function ($q) use ($reqStart, $reqEnd, $activeStatuses) {
                    $q->whereIn('status', $activeStatuses)
                      ->where('tanggal_peminjaman', '<=', $reqEnd->toDateString())
                      ->where('tanggal_pengembalian', '>=', $reqStart->toDateString());
                })
                ->with('rental')
                ->get();

            for ($date = $reqStart->copy(); $date->lte($reqEnd); $date->addDay()) {
                $dateStr = $date->toDateString();
                $bookedOnDate = $otherRentals->filter(function ($item) use ($dateStr) {
                    return $item->rental
                        && $dateStr >= $item->rental->tanggal_peminjaman
                        && $dateStr <= $item->rental->tanggal_pengembalian;
                })->count();

                $stokEfektif = $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan;
                $sisaStok = $stokEfektif - $bookedOnDate;
                if ($requestedQty > $sisaStok) {
                    $dateFmt = $date->format('d-m-Y');
                    return response()->json([
                        'errors' => [
                            'tanggal_peminjaman' => [
                                "Alat '{$instrument->nama_alat}' sudah dipesan pada tanggal {$dateFmt}. Tidak dapat meminjam di tanggal yang bersamaan. Silakan pilih tanggal lain."
                            ]
                        ]
                    ], 422);
                }
            }
        }

        $rental->update([
            'tanggal_peminjaman' => $request->tanggal_peminjaman,
            'tanggal_pengembalian' => $request->tanggal_pengembalian,
        ]);

        return response()->json([
            'message' => 'Tanggal peminjaman berhasil diperbarui',
            'data' => $rental
        ], 200);
    }

    // Mendapatkan tanggal yang sudah dibooking untuk alat tertentu
    public function getBookedDates(Request $request)
    {
        $instrumentIds = $request->query('instrument_ids', []);
        
        if (!is_array($instrumentIds)) {
            $instrumentIds = array_filter(explode(',', $instrumentIds));
        }

        $fullyBookedDatesSet = [];


        $activeStatuses = ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian'];

        if (!empty($instrumentIds)) {
            $instruments = Instrument::whereIn('id', $instrumentIds)->get();

            foreach ($instruments as $instrument) {
                $stokEfektif = $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan;
                if ($stokEfektif <= 0) {
                    continue;
                }

                $rentalItems = InstrumentRentalItem::where('instrument_id', $instrument->id)
                    ->whereHas('rental', function ($query) use ($activeStatuses) {
                        $query->whereIn('status', $activeStatuses);
                    })
                    ->with('rental')
                    ->get();

                if ($rentalItems->isEmpty()) continue;

                $minDate = $rentalItems->min(fn($item) => $item->rental?->tanggal_peminjaman);
                $maxDate = $rentalItems->max(fn($item) => $item->rental?->tanggal_pengembalian);

                if (!$minDate || !$maxDate) continue;

                $current = \Carbon\Carbon::parse($minDate);
                $end = \Carbon\Carbon::parse($maxDate);

                while ($current->lte($end)) {
                    $dateString = $current->toDateString();
                    $count = $rentalItems->filter(function ($item) use ($dateString) {
                        return $item->rental
                            && $dateString >= $item->rental->tanggal_peminjaman
                            && $dateString <= $item->rental->tanggal_pengembalian;
                    })->count();

                    if ($count >= $stokEfektif) {
                        $fullyBookedDatesSet[$dateString] = true;
                    }
                    $current->addDay();
                }
            }
        }

        $bookedDates = [];
        $dates = array_keys($fullyBookedDatesSet);
        sort($dates);

        foreach ($dates as $date) {
            $bookedDates[] = [
                'start' => $date,
                'end' => $date
            ];
        }

        return response()->json(['data' => $bookedDates], 200);
    }

    // Mendapatkan stok tersedia per alat untuk rentang tanggal tertentu
    public function getAvailableStock(Request $request)
    {
        $instrumentIds = $request->query('instrument_ids', []);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if (!is_array($instrumentIds)) {
            $instrumentIds = array_filter(explode(',', $instrumentIds));
        }

        if (empty($instrumentIds) || !$startDate || !$endDate) {
            return response()->json(['data' => []], 200);
        }

        $reqStart = \Carbon\Carbon::parse($startDate);
        $reqEnd = \Carbon\Carbon::parse($endDate);
        $activeStatuses = ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian'];

        $instruments = Instrument::whereIn('id', $instrumentIds)->get();
        $result = [];

        foreach ($instruments as $instrument) {
            // Ambil rental aktif yang beririsan dengan rentang tanggal:
            // (tanggal_peminjaman <= reqEnd) AND (tanggal_pengembalian >= reqStart)
            $rentals = InstrumentRentalItem::where('instrument_id', $instrument->id)
                ->whereHas('rental', function ($q) use ($reqStart, $reqEnd, $activeStatuses) {
                    $q->whereIn('status', $activeStatuses)
                      ->where('tanggal_peminjaman', '<=', $reqEnd->toDateString())
                      ->where('tanggal_pengembalian', '>=', $reqStart->toDateString());
                })
                ->with('rental')
                ->get();

            $maxBooked = 0;

            for ($date = $reqStart->copy(); $date->lte($reqEnd); $date->addDay()) {
                $dateStr = $date->toDateString();
                $count = $rentals->filter(function ($item) use ($dateStr) {
                    return $item->rental
                        && $dateStr >= $item->rental->tanggal_peminjaman
                        && $dateStr <= $item->rental->tanggal_pengembalian;
                })->count();

                $maxBooked = max($maxBooked, $count);
            }

            $stokEfektif = $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan;
            $available = max(0, $stokEfektif - $maxBooked);

            $result[$instrument->id] = [
                'total_unit' => $instrument->total_unit,
                'max_booked' => $maxBooked,
                'available' => $available,
            ];
        }

        return response()->json(['data' => $result], 200);
    }

    public function cancelRental(Request $request, $id)
    {
        if (Auth::user()->role !== 'klien') {
            return response()->json(['success' => false, 'message' => 'Hanya klien yang dapat membatalkan peminjaman alat.'], 403);
        }

        $rental = InstrumentRental::find($id);
        if (!$rental) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        if ($rental->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk membatalkan peminjaman ini.'], 403);
        }

        if ($rental->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya peminjaman dengan status pending yang dapat dibatalkan.'], 400);
        }

        $rental->update(['status' => 'dibatalkan']);

        $koordinator = User::where('role', 'koordinator')->first();
        if ($koordinator) {
            $this->sendNotification($koordinator->id, 'Peminjaman Dibatalkan', "Klien telah membatalkan peminjaman alat (ID: {$rental->id})");
        }

        return response()->json(['success' => true, 'message' => 'Peminjaman alat berhasil dibatalkan.']);
    }

    private function sendNotification($userId, $title, $message, $type = 'info')
    {
        Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $rental = InstrumentRental::findOrFail($id);
        
        $user = $request->user();
        if ($user->role === 'klien' && $rental->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk menghapus peminjaman ini.'], 403);
        }

        // Only allow deleting if status is selesai, ditolak, or dibatalkan
        if (!in_array($rental->status, ['selesai', 'ditolak', 'dibatalkan'])) {
            return response()->json(['success' => false, 'message' => 'Hanya peminjaman yang sudah selesai, ditolak, atau dibatalkan yang dapat dihapus.'], 400);
        }

        // Delete related instruments
        $rental->instruments()->detach();
        
        // Delete rental record
        $rental->delete();

        return response()->json(['success' => true, 'message' => 'Data peminjaman berhasil dihapus.']);
    }

    // Mendapatkan daftar tanggal yang ditutup koordinator
    public function getClosedDates(Request $request)
    {
        $query = ClosedRentalDate::with('creator:id,name');

        if ($request->has('month') && $request->has('year')) {
            $query->whereYear('tanggal', $request->year)
                  ->whereMonth('tanggal', $request->month);
        }

        $closedDates = $query->orderBy('tanggal', 'asc')->get();

        return response()->json([
            'message' => 'Berhasil mengambil daftar tanggal ditutup',
            'data' => $closedDates
        ], 200);
    }

    // Menutup tanggal peminjaman alat (Koordinator)
    public function storeClosedDate(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Hanya koordinator yang dapat menutup tanggal peminjaman.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'alasan' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $closedDate = ClosedRentalDate::updateOrCreate(
            ['tanggal' => $request->tanggal],
            [
                'alasan' => $request->alasan,
                'created_by' => $user->id,
            ]
        );

        return response()->json([
            'message' => 'Tanggal peminjaman alat berhasil ditutup',
            'data' => $closedDate
        ], 200);
    }

    // Membuka kembali tanggal peminjaman alat (Koordinator)
    public function deleteClosedDate(Request $request, $date)
    {
        $user = $request->user();
        if ($user->role !== 'koordinator') {
            return response()->json(['message' => 'Hanya koordinator yang dapat membuka tanggal peminjaman.'], 403);
        }

        $closedDate = ClosedRentalDate::where('tanggal', $date)->first();
        if (!$closedDate) {
            return response()->json(['message' => 'Tanggal tidak ditemukan dalam daftar penutupan.'], 404);
        }

        $closedDate->delete();

        return response()->json([
            'message' => 'Tanggal peminjaman alat berhasil dibuka kembali'
        ], 200);
    }
}
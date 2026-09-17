<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingAnalysisItem;
use App\Models\QuotaSetting;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendAnalysisResult;
use App\Models\Invoice;
use App\Models\Signature;

class BookingController extends Controller
{
    /**
     * Endpoint: GET /api/koordinator-report
     * Menyediakan data dinamis untuk halaman Laporan Koordinator:
     * - chartData: statistik booking per kuartal
     * - bookings: tabel laporan
     * - filters: daftar jenis analisis, bulan, tahun
     * - reportHistory: riwayat file laporan
     * Filter: jenis_analisis, bulan, tahun (opsional)
     */
    public function getKoordinatorReport(Request $request)
    {
        // Ambil filter dari request
        $jenisAnalisis = $request->input('jenis_analisis');
        $bulan = $request->input('bulan'); // 1-12
        $tahun = $request->input('tahun');

        // Query bookings: jika filter kosong, ambil semua data
        $query = Booking::with(['user', 'analysisItems'])
            ->orderBy('tanggal_kirim', 'desc');
        if (!empty($jenisAnalisis)) {
            $query->where('jenis_analisis', $jenisAnalisis);
        }
        if (!empty($bulan)) {
            $query->whereMonth('tanggal_kirim', $bulan);
        }
        if (!empty($tahun)) {
            $query->whereYear('tanggal_kirim', $tahun);
        }
        $bookings = $query->get();

        // Jika data kosong, tetap kirim struktur data default
        // Jika bookings kosong, biarkan chartData, tableData, reportHistory tetap kosong

        // Data untuk chart: statistik booking per kuartal (Q1-Q4)
        $chartData = [
            ['name' => 'Q1', 'value' => 0],
            ['name' => 'Q2', 'value' => 0],
            ['name' => 'Q3', 'value' => 0],
            ['name' => 'Q4', 'value' => 0],
        ];
        foreach ($bookings as $b) {
            $month = (int)date('n', strtotime($b->tanggal_kirim));
            if ($month >= 1 && $month <= 3) $chartData[0]['value']++;
            elseif ($month >= 4 && $month <= 6) $chartData[1]['value']++;
            elseif ($month >= 7 && $month <= 9) $chartData[2]['value']++;
            elseif ($month >= 10 && $month <= 12) $chartData[3]['value']++;
        }

        // Data tabel laporan (booking)
        $tableData = $bookings->map(function($b) {
            return [
                'tgl' => date('d/m/Y', strtotime($b->tanggal_kirim)),
                'kode' => $b->kode_batch,
                'jenis' => $b->jenis_analisis,
                'status' => isset($b->status) ? ucfirst($b->status) : null,
            ];
        })->values();

        // Dropdown: Jenis Analisis (distinct)
        $jenisList = Booking::select('jenis_analisis')->distinct()->pluck('jenis_analisis')->values();

        // Dropdown: Tahun (distinct)
        $tahunList = Booking::selectRaw('YEAR(tanggal_kirim) as tahun')->distinct()->orderBy('tahun','desc')->pluck('tahun')->values();

        // Dropdown: Bulan (selalu 1-12)
        $bulanList = collect(range(1,12));

        // Riwayat laporan: kumpulkan file hasil analisis & invoice per bulan
        $reportHistory = $bookings->groupBy(function($b) {
            return date('Y-m', strtotime($b->tanggal_kirim));
        })->map(function($group, $ym) {
            $bulanLabel = date('M-y', strtotime($ym.'-01'));
            $latest = $group->first();

            $files = [];
            foreach ($group as $bk) {
                // analysis result PDF from booking
                if (!empty($bk->pdf_path)) {
                    $files[] = [
                        'type' => 'analysis',
                        'label' => 'Hasil - ' . ($bk->kode_batch ?? $bk->kode ?? ('B' . $bk->id)),
                        'path' => $bk->pdf_path,
                        'url' => Storage::disk('public')->exists($bk->pdf_path) ? Storage::url($bk->pdf_path) : null,
                        'booking_id' => $bk->id,
                    ];
                }

                // invoice PDF if generated in storage/invoices/{invoice_number}.pdf
                try {
                    $inv = Invoice::where('booking_id', $bk->id)->first();
                    if ($inv) {
                        $invFilename = 'invoices/' . ($inv->invoice_number ?? ('INV-' . ($bk->kode_batch ?? $bk->id))) . '.pdf';
                        if (Storage::disk('public')->exists($invFilename)) {
                            $files[] = [
                                'type' => 'invoice',
                                'label' => 'Invoice - ' . ($inv->invoice_number ?? $inv->id),
                                'path' => $invFilename,
                                'url' => Storage::url($invFilename),
                                'invoice_id' => $inv->id,
                                'booking_id' => $bk->id,
                            ];
                        }
                    }
                } catch (\Exception $ex) {
                    Log::warning('Error while fetching invoice for booking ' . $bk->id . ': ' . $ex->getMessage());
                }
            }

            // Fallback: if no files found, keep an example placeholder file name
            if (empty($files)) {
                $files[] = [
                    'type' => 'example',
                    'label' => 'laporan_' . $bulanLabel . '.pdf',
                    'path' => null,
                    'url' => null,
                ];
            }

            return [
                'bulan' => $bulanLabel,
                'files' => array_values($files),
                'tanggal_buat' => date('d/m/y', strtotime($latest->tanggal_kirim)),
                'status' => 'Dikirim ke Kepala Lab',
            ];
        })->values();

        // Mapped bookings: richer dataset for coordinator table (include user, items, pdf path, total price)
        $bookingsMapped = $bookings->map(function($b) {
            $items = [];
            foreach ($b->analysisItems as $ai) {
                $items[] = ['nama_item' => $ai->nama_item];
            }

            // compute total harga by attempting to lookup in analysis_prices table
            $total = 0;
            foreach ($b->analysisItems as $ai) {
                $price = null;

                // Defensive: prefer looking up by `jenis_analisis` (this table's actual schema)
                try {
                    if (Schema::hasColumn('analysis_prices', 'jenis_analisis')) {
                        // booking_analysis_items.nama_item maps to analysis_prices.jenis_analisis
                        $price = DB::table('analysis_prices')->where('jenis_analisis', $ai->nama_item)->value('harga');
                    } elseif (Schema::hasColumn('analysis_prices', 'nama_item')) {
                        $price = DB::table('analysis_prices')->where('nama_item', $ai->nama_item)->value('harga');
                    } elseif (Schema::hasColumn('analysis_prices', 'nama')) {
                        $price = DB::table('analysis_prices')->where('nama', $ai->nama_item ?? $ai->nama)->value('harga');
                    } elseif (Schema::hasColumn('analysis_prices', 'nama_analisis')) {
                        // older variants
                        $price = DB::table('analysis_prices')->where('nama_analisis', $ai->nama_item ?? $b->jenis_analisis)->value('harga');
                    }
                } catch (\Exception $ex) {
                    Log::warning('Price lookup failed in koordinator report: ' . $ex->getMessage());
                }

                if (!$price) {
                    $price = 50000; // default fallback
                }
                $total += (float) $price;
            }
            $jumlah = (int) ($b->jumlah_sampel ?: 1);
            $total = $total * $jumlah;

            $userName = null;
            if ($b->user) {
                $userName = $b->user->full_name ?? $b->user->name ?? null;
            }

            return [
                'id' => $b->id,
                'kode_batch' => $b->kode_batch,
                'tanggal_kirim' => $b->tanggal_kirim,
                'tgl' => date('d/m/Y', strtotime($b->tanggal_kirim)),
                'jenis_analisis' => $b->jenis_analisis,
                'status' => $b->status,
                'user_name' => $userName,
                'jumlah_sampel' => $b->jumlah_sampel,
                'analysis_items' => $items,
                'pdf_path' => $b->pdf_path ?? null,
                'is_paid' => (bool) $b->is_paid,
                'total_harga' => $total,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'chartData' => $chartData,
                'tableData' => $tableData,
                'bookings' => $bookingsMapped,
                'filters' => [
                    'jenisAnalisis' => $jenisList,
                    'bulan' => $bulanList,
                    'tahun' => $tahunList,
                ],
                'reportHistory' => $reportHistory,
            ]
        ]);
    }
    // =================================================================
    // 1. FUNGSI SIMPAN PESANAN (STORE)
    // =================================================================
    public function store(Request $request)
    {
        if (Auth::user()->role !== 'klien') {
            return response()->json(['success' => false, 'message' => 'Hanya klien yang dapat membuat booking.'], 403);
        }

        try {
            // 1. Normalisasi Nama Jenis Analisis
            $jenisRaw = strtolower($request->jenis_analisis);
            $jenisNormalized = '';

            if (stripos($jenisRaw, 'hematologi') !== false && stripos($jenisRaw, 'metabolit') !== false) {
                $jenisNormalized = 'hematologi dan metabolit';
            } elseif (stripos($jenisRaw, 'hematologi') !== false) {
                $jenisNormalized = 'hematologi';
            } else {
                $jenisNormalized = 'metabolit';
            }

            // 2. Validasi Input
            // Metabolit & Hematologi dan Metabolit = Unlimited (9999), Hematologi = 30
            $maxSampel = ($jenisNormalized === 'hematologi') ? 30 : 9999;

            $request->validate([
                'tanggal_kirim' => 'required|date|after_or_equal:today',
                'jenis_analisis' => 'required|string',
                'jenis_hewan' => 'required|string',
                'jenis_kelamin' => 'required|string',
                'umur' => 'required|string',
                'status_fisiologis' => 'required|string',
                'jumlah_sampel' => "required|integer|min:1|max:{$maxSampel}",
                'analisis_items' => 'required|array|min:1',
            ]);

            $tanggalKirim = Carbon::parse($request->tanggal_kirim)->format('Y-m-d');
            $jumlahSampel = (int) $request->jumlah_sampel;

            // 3. Cek Ketersediaan Quota (SHARED LOGIC)
            // Ini akan memastikan Hematologi & Gabungan memakan kuota yang sama
            $quotaCheck = $this->checkQuotaAvailability($tanggalKirim, $jenisNormalized, $jumlahSampel);

            if (!$quotaCheck['available']) {
                return response()->json([
                    'success' => false,
                    'message' => $quotaCheck['message']
                ], 422); // 422 Unprocessable Entity
            }

            // 4. Generate Kode Sampel dengan format: [JENIS]-[HEWAN]-[TANGGAL]-[NOMOR]
            $prefix = '';
            if ($jenisNormalized == 'hematologi') $prefix = 'HM';
            elseif ($jenisNormalized == 'metabolit') $prefix = 'MET';
            else $prefix = 'HMMET';

            // Ambil kode hewan (3 huruf pertama, uppercase)
            $jenisHewan = $request->jenis_hewan;
            if ($jenisHewan === 'lainnya' && $request->jenis_hewan_lain) {
                $jenisHewan = $request->jenis_hewan_lain;
            }
            $hewanCode = strtoupper(substr($jenisHewan, 0, 3)); // Contoh: AYA, SAP, KAM

            $dateCode = Carbon::parse($tanggalKirim)->format('ymd');
            $kodeSampelArray = [];
            for ($i = 1; $i <= $jumlahSampel; $i++) {
                $kodeSampelArray[] = sprintf("%s-%s-%s-%02d", $prefix, $hewanCode, $dateCode, $i); // Contoh: HM-AYA-251224-01
            }
            $kodeSampelJson = json_encode($kodeSampelArray);

            // 6. Simpan Booking
            DB::beginTransaction(); // Pakai Transaction biar aman

            // Kode batch: prefix dari kode sampel pertama (tanpa nomor urut)

            $kodeBatch = '';
            if (count($kodeSampelArray) > 0) {
                $first = $kodeSampelArray[0];
                $idx = strrpos($first, '-');
                $prefix = $idx !== false ? substr($first, 0, $idx) : $first;
                // Tambahkan 3 karakter acak agar unik
                $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 3));
                $kodeBatch = $prefix . '-' . $random;
            }

            $booking = Booking::create([
                'user_id' => Auth::id(),
                'tanggal_kirim' => $tanggalKirim,
                'jenis_analisis' => $jenisNormalized, // Simpan format standar (hematologi, metabolit, hematologi dan metabolit)
                'jenis_hewan' => $request->jenis_hewan,
                'jenis_hewan_lain' => $request->jenis_hewan_lain,
                'jenis_kelamin' => $request->jenis_kelamin,
                'umur' => $request->umur,
                'status_fisiologis' => $request->status_fisiologis,
                'jumlah_sampel' => $jumlahSampel,
                'kode_sampel' => $kodeSampelJson,
                'kode_batch' => $kodeBatch,
                'status' => 'menunggu',
                'is_paid' => 0,
            ]);

            // Simpan Item Analisis
            foreach ($request->analisis_items as $item) {
                BookingAnalysisItem::create([
                    'booking_id' => $booking->id,
                    'nama_item' => $item
                ]);
            }

            DB::commit();

            // Cek achievement untuk pesanan
            $this->checkOrderAchievements($booking->user_id);

            // Trigger notifikasi untuk teknisi bahwa ada booking baru
            // Ambil semua user dengan role 'teknisi'
            $teknisiUsers = \App\Models\User::where('role', 'teknisi')->get();
            foreach ($teknisiUsers as $teknisi) {
                Notification::create([
                    'user_id' => $teknisi->id,
                    'type' => 'booking_baru',
                    'title' => 'Booking Baru',
                    'message' => 'Booking baru dari ' . Auth::user()->name . ' perlu diverifikasi.',
                    'booking_id' => $booking->id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat',
                'data' => $booking
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Booking Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    // =================================================================
    // 2. HELPER FUNCTION: CEK QUOTA (LOGIKA UTAMA)
    // =================================================================
    private function checkQuotaAvailability($date, $jenis, $jumlahSampel)
    {
        // A. Tentukan Group Quota (Shared Logic)
        // Jika Hematologi ATAU Gabungan, kita cek aturan 'hematologi'
        $quotaRuleName = ($jenis === 'metabolit') ? 'metabolit' : 'hematologi';

        // Tentukan apa saja yang dihitung
        // Jika Hematologi, hitung (Hematologi + Gabungan)
        $typesToCount = [];
        if ($jenis === 'metabolit') {
            $typesToCount = ['metabolit'];
        } else {
            $typesToCount = ['hematologi', 'hematologi dan metabolit'];
        }

        // B. Ambil Aturan (Prioritas: Tanggal Spesifik -> Master Rule)
        $quotaSetting = QuotaSetting::where('jenis_analisis', $quotaRuleName)
            ->where('tanggal', $date)
            ->first();

        if (!$quotaSetting) {
            // Ambil Master Rule (tanggal = NULL)
            $quotaSetting = QuotaSetting::where('jenis_analisis', $quotaRuleName)
                ->whereNull('tanggal')
                ->first();
        }

        if (!$quotaSetting) {
            return ['available' => false, 'message' => 'Pengaturan quota tidak ditemukan.'];
        }

        // C. Cek Hari Libur
        $dayOfWeek = Carbon::parse($date)->dayOfWeek; // 0=Minggu, 6=Sabtu
        $isHoliday = false;

        if ($quotaRuleName === 'hematologi' && in_array($dayOfWeek, [5, 6, 0])) $isHoliday = true; // Jum, Sab, Min
        if ($quotaRuleName === 'metabolit' && in_array($dayOfWeek, [6, 0])) $isHoliday = true; // Sab, Min

        // Jika hari libur, tapi teknisi set kuota > 0, maka BUKA (Override)
        // Jika kuota = 0, maka TUTUP
        if ($quotaSetting->kuota_maksimal === 0) {
            return ['available' => false, 'message' => 'Laboratorium tutup pada tanggal ini.'];
        }
        if ($isHoliday && $quotaSetting->kuota_maksimal <= 0) { // Default libur dan tidak dibuka manual
             return ['available' => false, 'message' => 'Layanan tutup pada hari libur.'];
        }

        // D. Hitung Pemakaian Saat Ini (SHARED CALCULATION)
            $usedQuery = Booking::where('tanggal_kirim', $date)
                ->whereIn('jenis_analisis', $typesToCount); // Hitung total gabungan
            if (Schema::hasColumn('bookings', 'status')) {
                $usedQuery->whereNotIn('status', ['ditolak', 'dibatalkan']);
            }
            $usedQuota = $usedQuery->sum('jumlah_sampel');

        $remainingQuota = $quotaSetting->kuota_maksimal - $usedQuota;

        // E. Cek Limit (Hanya jika Strict Mode = 1)
        // Jika Strict = 0 (Soft Limit), user boleh booking meski minus (nanti jadi kuning di kalender)
        if ($quotaSetting->is_strict == 1 && $remainingQuota < $jumlahSampel) {
            return [
                'available' => false,
                'message' => "Kuota penuh! Tersisa: {$remainingQuota}, Diminta: {$jumlahSampel}"
            ];
        }

        return ['available' => true];
    }

    // =================================================================
    // 3. FUNGSI DATA KALENDER (UPDATE AGAR WARNA AKURAT)
    // =================================================================
    public function getCalendarData(Request $request)
    {
        try {
            $month = $request->input('month', Carbon::now()->month);
            $year = $request->input('year', Carbon::now()->year);
            $jenisInput = strtolower($request->input('jenis_analisis', 'metabolit'));

            // Tentukan Group untuk ditampilkan di kalender
            $quotaRuleName = ($jenisInput === 'metabolit') ? 'metabolit' : 'hematologi';
            $typesToCount = [];

            if ($jenisInput === 'metabolit') {
                $typesToCount = ['metabolit'];
            } else {
                // Jika user melihat kalender hematologi, tampilkan total (Hema + Gabungan)
                $typesToCount = ['hematologi', 'hematologi dan metabolit'];
            }

            // Ambil Aturan (Master & Spesifik)
            $masterRule = QuotaSetting::where('jenis_analisis', $quotaRuleName)->whereNull('tanggal')->first();
            $specificRules = QuotaSetting::where('jenis_analisis', $quotaRuleName)
                ->whereYear('tanggal', $year)
                ->whereMonth('tanggal', $month)
                ->get()
                ->keyBy(function ($item) { return $item->tanggal->format('Y-m-d'); });

            // Ambil Data Booking (Grouped by Date)
            $bkQuery = Booking::select(DB::raw('DATE(tanggal_kirim) as date'), DB::raw('SUM(jumlah_sampel) as total'))
                ->whereYear('tanggal_kirim', $year)
                ->whereMonth('tanggal_kirim', $month)
                ->whereIn('jenis_analisis', $typesToCount); // <--- LOGIKA SHARED

            if (Schema::hasColumn('bookings', 'status')) {
                $bkQuery->whereNotIn('status', ['ditolak', 'dibatalkan']);
            }

            $bookings = $bkQuery->groupBy(DB::raw('DATE(tanggal_kirim)'))
                ->get()
                ->keyBy('date');

            // Generate Response
            $startDate = Carbon::create($year, $month, 1);
            $endDate = $startDate->copy()->endOfMonth();
            $result = [];

            for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                $dateStr = $date->format('Y-m-d');
                $dayOfWeek = $date->dayOfWeek;

                // Default Rule
                $maxQuota = $masterRule ? $masterRule->kuota_maksimal : 15;
                $isStrict = $masterRule ? $masterRule->is_strict : 0;

                // Override jika ada aturan spesifik tanggal ini
                if (isset($specificRules[$dateStr])) {
                    $maxQuota = $specificRules[$dateStr]->kuota_maksimal;
                    $isStrict = $specificRules[$dateStr]->is_strict;
                }

                // Cek Libur
                $isHoliday = false;
                if ($quotaRuleName === 'hematologi' && in_array($dayOfWeek, [5, 6, 0])) $isHoliday = true;
                if ($quotaRuleName === 'metabolit' && in_array($dayOfWeek, [6, 0])) $isHoliday = true;

                // Logika Buka/Tutup
                $isAvailable = true;
                if ($maxQuota === 0) {
                    $isAvailable = false; // Tutup Manual
                } elseif ($isHoliday && !isset($specificRules[$dateStr])) {
                    $isAvailable = false; // Tutup Libur Standar (kecuali dibuka manual)
                } elseif ($isHoliday && isset($specificRules[$dateStr]) && $maxQuota > 0) {
                    $isAvailable = true; // Buka Manual di Hari Libur
                }

                $usedQuota = isset($bookings[$dateStr]) ? (int) $bookings[$dateStr]->total : 0;
                $remaining = max(0, $maxQuota - $usedQuota);

                // Status untuk Frontend
                $statusLabel = 'available';
                if (!$isAvailable) $statusLabel = 'closed';
                else if ($usedQuota >= $maxQuota) {
                    if ($isStrict) $statusLabel = 'full'; // Merah
                    else $statusLabel = 'warning'; // Kuning (Soft Limit)
                }

                $result[] = [
                    'date' => $dateStr,
                    'status' => $statusLabel, // helper untuk frontend
                    'is_available' => $isAvailable,
                    'max_quota' => $maxQuota,
                    'used_quota' => $usedQuota,
                    'remaining_quota' => $remaining,
                    'is_strict' => (bool) $isStrict,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Calendar Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data kalender'], 500);
        }
    }

    // =================================================================
    // 4. FUNGSI LAINNYA (Index, Update Status, dll)
    // =================================================================
    public function index(Request $request)
    {
        // Ambil data booking dengan relasi user dan analysisItems
        $bookings = Booking::with(['user', 'analysisItems', 'signature']) // Memuat relasi user, analysisItems dan signature
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform analysisItems to analysis_items for frontend consistency
        $bookings = $bookings->map(function ($booking) {
            $data = $booking->toArray();

            // Tambahkan nama lengkap user
            $data['user_fullname'] = $booking->user->name;

            // Transform analysisItems to analysis_items
            if (isset($data['analysis_items'])) {
                // Already in snake_case, keep it
            } elseif (isset($data['analysisItems'])) {
                // Convert camelCase to snake_case
                $data['analysis_items'] = $data['analysisItems'];
                unset($data['analysisItems']);
            }

            return $data;
        });

        return response()->json(['success' => true, 'data' => $bookings]);
    }

    public function indexAll(Request $request)
    {
        $query = Booking::with(['user', 'analysisItems', 'signature']);
        if ($request->filled('status') && Schema::hasColumn('bookings', 'status')) {
            $query->where('status', $request->status);
        }
        $bookings = $query->orderBy('created_at', 'desc')->get();

        // Transform analysisItems to analysis_items for frontend consistency
        $bookings = $bookings->map(function($booking) {
            $data = $booking->toArray();
            if (isset($data['analysis_items'])) {
                // Already in snake_case, keep it
            } elseif (isset($data['analysisItems'])) {
                // Convert camelCase to snake_case
                $data['analysis_items'] = $data['analysisItems'];
                unset($data['analysisItems']);
            }
            // Ensure kode_batch always present
            if (!isset($data['kode_batch'])) {
                $data['kode_batch'] = $booking->kode_batch ?? null;
            }
            return $data;
        });

        return response()->json(['success' => true, 'data' => $bookings]);
    }

    /**
     * Show a single booking by ID (with relations) for frontend detail views.
     * Route: GET /api/bookings/{id}
     */
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['user', 'analysisItems', 'signature'])->findOrFail($id);

        $data = $booking->toArray();
        // add user fullname for frontend convenience
        $data['user_fullname'] = $booking->user->name ?? null;

        // normalize analysis items key to analysis_items
        if (isset($data['analysisItems']) && !isset($data['analysis_items'])) {
            $data['analysis_items'] = $data['analysisItems'];
            unset($data['analysisItems']);
        }

        // ensure kode_batch present
        if (!isset($data['kode_batch'])) {
            $data['kode_batch'] = $booking->kode_batch ?? null;
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function updateStatus(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['koordinator', 'teknisi', 'kepala'])) {
            return response()->json(['success' => false, 'message' => 'Hanya koordinator, teknisi, dan kepala yang dapat mengubah status.'], 403);
        }

        // Accept all known statuses used in the application to avoid validation errors
        $request->validate(['status' => 'required|in:menunggu,disetujui,ditolak,proses,selesai,dibatalkan,menunggu_verifikasi,menunggu_ttd,menunggu_ttd_koordinator,menunggu_sign,ditandatangani,menunggu_verifikasi_kepala,menunggu_pembayaran,ditolak_kepala,dikirim_ke_teknisi']);
        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $booking->status = $request->status;

        // Persist status_updated_at if sent from frontend, otherwise set to now
        if ($request->filled('status_updated_at')) {
            try {
                $booking->status_updated_at = Carbon::parse($request->status_updated_at);
            } catch (\Exception $e) {
                $booking->status_updated_at = Carbon::now();
            }
        } else {
            $booking->status_updated_at = Carbon::now();
        }

        if ($request->filled('alasan_penolakan')) $booking->alasan_penolakan = $request->alasan_penolakan;
        if ($request->filled('alasan_tolak')) $booking->alasan_tolak = $request->alasan_tolak;
        if ($request->filled('alasan_teknisi')) $booking->alasan_teknisi = $request->alasan_teknisi;
        $booking->save();

        // If booking moved to menunggu_pembayaran, auto-create invoice using analysis_prices
        if ($booking->status === 'menunggu_pembayaran') {
            try {
                // Compute amount: sum analysis_prices per item, times jumlah_sampel
                $items = $booking->analysisItems()->get();
                $sumPrices = 0;
                foreach ($items as $it) {
                    $price = DB::table('analysis_prices')->where('jenis_analisis', $it->nama_item)->value('harga');
                    if (!$price) $price = 50000; // fallback per item price
                    $sumPrices += (float) $price;
                }
                $amount = ((int)$booking->jumlah_sampel) * $sumPrices;
                
                Invoice::firstOrCreate(
                    ['booking_id' => $booking->id],
                    [
                        'invoice_number' => 'INV-' . ($booking->kode_batch ? $booking->kode_batch : (date('Ymd') . '-B' . $booking->id)),
                        'user_id' => $booking->user_id,
                        'amount' => $amount,
                        'due_date' => now()->addDays(7)->toDateString(),
                        'status' => 'UNPAID'
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Auto-create invoice failed (updateStatus): ' . $e->getMessage());
            }
        }

        // If booking moved to menunggu_ttd_koordinator (Kepala sudah approve), create signature record for coordinator to sign
        if ($booking->status === 'menunggu_ttd_koordinator') {
            try {
                // create only if not exists
                $sig = Signature::where('booking_id', $booking->id)->where('type', 'kepala_approval')->first();
                if (!$sig) {
                    Signature::create([
                        'booking_id' => $booking->id,
                        'type' => 'kepala_approval',
                        'created_by' => Auth::id() ?: null,
                        'status' => 'pending'
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to create signature record: ' . $e->getMessage());
            }
        }

        // Trigger notifikasi berdasarkan status
        if ($request->status === 'disetujui' && $oldStatus !== 'disetujui') {
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_disetujui',
                'title' => 'Booking Disetujui',
                'message' => 'Booking Anda telah disetujui oleh teknisi.',
                'booking_id' => $booking->id
            ]);
        } elseif ($request->status === 'ditolak' && $oldStatus !== 'ditolak') {
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_ditolak',
                'title' => 'Booking Ditolak',
                'message' => 'Booking Anda ditolak. Alasan: ' . ($booking->alasan_penolakan ?: '-'),
                'booking_id' => $booking->id
            ]);
        }

        return response()->json(['success' => true, 'data' => $booking]);
    }

    public function cancelBooking($id)
    {
        $booking = Booking::findOrFail($id);

        // Validasi: hanya user pemilik yang bisa cancel
        if ($booking->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk membatalkan pesanan ini.'
            ], 403);
        }

        // Validasi: hanya status tertentu yang bisa dibatalkan
        $cancellableStatuses = ['menunggu', 'disetujui'];
        if (!in_array($booking->status, $cancellableStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan dengan status "' . $booking->status . '" tidak dapat dibatalkan.'
            ], 422);
        }

        // Update status menjadi dibatalkan
        $booking->status = 'dibatalkan';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data' => $booking
        ]);
    }

    public function updateAnalysisResult(Request $request, $id)
    {
        if (Auth::user()->role !== 'teknisi') {
            return response()->json(['success' => false, 'message' => 'Hanya teknisi yang dapat mengupdate hasil analisis.'], 403);
        }

        $booking = Booking::findOrFail($id);

        // Update setiap item analisis dengan hasil yang dikirim
        if ($request->has('items')) {
            foreach ($request->items as $itemData) {
                $item = BookingAnalysisItem::find($itemData['id']);
                if ($item && $item->booking_id == $booking->id) {
                    $item->hasil = $itemData['hasil'] ?? null;
                    $item->metode = $itemData['metode'] ?? null;
                    $item->nama_analisis = $itemData['nama_analisis'] ?? null;
                    // Update status jika dikirim dari frontend
                    if (isset($itemData['status'])) {
                        $item->status = $itemData['status'];
                    }
                    $item->save();

                    Log::info("Saved item {$item->id}: {$item->nama_item} = {$item->hasil}, status = {$item->status}");
                }
            }
        }

        // Reload booking with items
        $booking = Booking::with('analysisItems')->find($id);

        // Ubah status menjadi 'draft' saat simpan draft (bukan 'selesai')
        if ($booking->status === 'proses') {
            $booking->status = 'draft';
            $booking->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Draft hasil analisis berhasil disimpan',
            'data' => $booking->toArray()
        ]);
    }

    public function finalizeAnalysis(Request $request, $id)
    {
        if (Auth::user()->role !== 'teknisi') {
            return response()->json(['success' => false, 'message' => 'Hanya teknisi yang dapat menyelesaikan analisis.'], 403);
        }

        $booking = Booking::findOrFail($id);
        // Mark analysis as completed server-side but DO NOT change workflow status here.
        // Status transition to 'menunggu_verifikasi' must happen only when teknisi
        // explicitly uploads the PDF / clicks "Kirim Ke Koordinator".

        // Do not modify status here; just acknowledge completion server-side.
        // Keep existing booking record as-is.
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Analisis selesai (status belum berubah). Silakan kirim hasil ke Koordinator secara manual.'
        ]);
    }

    public function kirimKeKoordinator(Request $request, $id)
    {
        if (Auth::user()->role !== 'teknisi') {
            return response()->json(['success' => false, 'message' => 'Hanya teknisi yang dapat mengirim hasil ke koordinator.'], 403);
        }

        $booking = Booking::with('analysisItems', 'user')->findOrFail($id);

        // Ubah status menjadi menunggu_verifikasi agar Koordinator melihat dan memverifikasi hasil
        $booking->status = 'menunggu_verifikasi';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Hasil analisis berhasil dikirim ke Koordinator Lab',
            'data' => $booking
        ]);
    }

    /**
     * Upload PDF from teknisi and set booking status to menunggu_verifikasi_kepala
     */
    public function uploadPdfAndKirim(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['koordinator', 'teknisi'])) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $booking = Booking::findOrFail($id);
        // Validate upload (increase max to 50MB to be tolerant)
        try {
            $request->validate([
                'pdf' => 'required|mimes:pdf|max:51200'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('VALIDATION ERROR PDF: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        }

        $path = null;
        // Diagnostic logs to help debug upload issues
        Log::info('UploadPdfAndKirim called for booking ' . $booking->id . ' - content-type: ' . $request->header('content-type'));
        try {
            if ($request->hasFile('pdf')) {
                $file = $request->file('pdf');
                Log::info('Request hasFile pdf: true, originalName=' . $file->getClientOriginalName() . ', size=' . $file->getSize());
                if (!$file->isValid()) {
                    Log::error('UPLOAD ERROR: File PDF tidak valid');
                    return response()->json([
                        'success' => false,
                        'message' => 'File PDF tidak valid',
                    ], 400);
                }

                // Ensure directory exists
                Storage::disk('public')->makeDirectory('hasil_pdfs');
                $path = $file->store('hasil_pdfs', 'public');
                Log::info('Stored uploaded PDF to: ' . $path);
            } else if ($request->pdf) {
                // Fallback: simpan file dari stream jika tidak terdeteksi sebagai file upload
                $pdfContent = $request->get('pdf');
                $filename = 'hasil_analisis_' . time() . '.pdf';
                $path = 'hasil_pdfs/' . $filename;
                Storage::disk('public')->makeDirectory('hasil_pdfs');
                Storage::disk('public')->put($path, $pdfContent);
                Log::info('Stored fallback pdf content to: ' . $path);
            } else {
                // Try to read raw input (some clients send raw body)
                $raw = file_get_contents('php://input');
                if ($raw && strlen($raw) > 0) {
                    $filename = 'hasil_analisis_raw_' . time() . '.pdf';
                    $path = 'hasil_pdfs/' . $filename;
                    Storage::disk('public')->makeDirectory('hasil_pdfs');
                    Storage::disk('public')->put($path, $raw);
                    Log::info('Stored raw php://input to: ' . $path . ' size=' . strlen($raw));
                } else {
                    Log::error('UPLOAD ERROR: Tidak ada file pdf pada request');
                    return response()->json([
                        'success' => false,
                        'message' => 'File PDF tidak ditemukan pada request',
                    ], 400);
                }
            }
        } catch (\Exception $e) {
            Log::error('Exception during upload handling: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan saat memproses upload.'], 500);
        }

        // Verify file existence
        try {
            $exists = Storage::disk('public')->exists($path);
            Log::info('Post-upload exists check for ' . $path . ': ' . ($exists ? 'yes' : 'no'));
        } catch (\Exception $e) {
            Log::warning('Could not verify stored file: ' . $e->getMessage());
        }
        $booking->pdf_path = $path;

        // Determine uploader role to decide workflow transition
        $user = Auth::user();
        $role = $user->role ?? null;

        try {
            if ($role === 'teknisi') {
                // Teknisi uploads initial PDF -> Koordinator should verify
                $booking->status = 'menunggu_verifikasi';
                $booking->save();

                // Notify Koordinator
                $koordinatorUsers = \App\Models\User::where('role', 'koordinator')->get();
                foreach ($koordinatorUsers as $k) {
                    Notification::create([
                        'user_id' => $k->id,
                        'type' => 'hasil_dikirim_ke_koordinator',
                        'title' => 'Hasil Analisis Dikirim',
                        'message' => 'Teknisi telah mengirim hasil analisis untuk diverifikasi.',
                        'booking_id' => $booking->id
                    ]);
                }
            } else if ($role === 'koordinator') {
                // Koordinator uploads signed PDF -> move to payment and mark signature
                $booking->status = 'menunggu_pembayaran';
                $booking->save();

                // Update signature record if exists (mark as signed by current user)
                try {
                    $sig = Signature::where('booking_id', $booking->id)->where('status', 'pending')->first();
                    if ($sig) {
                        $sig->file_path = $path;
                        $sig->signed_by = Auth::id() ?: null;
                        $sig->signed_at = Carbon::now();
                        $sig->status = 'signed';
                        $sig->save();
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to update signature after coordinator upload: ' . $e->getMessage());
                }

                // Auto-create invoice for this booking if not exists
                try {
                    // Compute amount: sum analysis_prices per item, times jumlah_sampel
                    $items = $booking->analysisItems()->get();
                    $sumPrices = 0;
                    foreach ($items as $it) {
                        $price = DB::table('analysis_prices')->where('jenis_analisis', $it->nama_item)->value('harga');
                        if (!$price) $price = 50000; // fallback per item price
                        $sumPrices += (float) $price;
                    }
                    $amount = ((int)$booking->jumlah_sampel) * $sumPrices;
                    
                    Invoice::firstOrCreate(
                        ['booking_id' => $booking->id],
                        [
                            'invoice_number' => 'INV-' . ($booking->kode_batch ? $booking->kode_batch : (date('Ymd') . '-B' . $booking->id)),
                            'user_id' => $booking->user_id,
                            'amount' => $amount,
                            'due_date' => now()->addDays(7)->toDateString(),
                            'status' => 'UNPAID'
                        ]
                    );
                } catch (\Exception $e) {
                    Log::error('Auto-create invoice failed (uploadPdfAndKirim by koordinator): ' . $e->getMessage());
                }
            } else {
                // Default fallback: keep previous status or set to menunggu_verifikasi
                $booking->status = 'menunggu_verifikasi';
                $booking->save();
            }
        } catch (\Exception $e) {
            Log::error('Upload handling error: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'PDF berhasil diupload dan dikirim ke Koordinator',
            'data' => $booking
        ]);
    }

    /**
     * Download stored PDF for a booking
     */
    public function downloadPdf(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // If PDF path exists, try to serve stored file
        if (!empty($booking->pdf_path)) {
            $disk = storage_path('app/public/' . $booking->pdf_path);
            if (file_exists($disk)) {
                return response()->file($disk, [
                    'Content-Type' => 'application/pdf'
                ]);
            }
        }

        // Fallback: Generate PDF on-the-fly if stored PDF not available
        Log::info("Stored PDF not found for booking {$id}, generating on-the-fly...");
        return $this->downloadGeneratedPdf($request, $id);
    }

    /**
     * Generate PDF on-the-fly using booking data (fallback if uploaded PDF missing)
     */
    public function downloadGeneratedPdf(Request $request, $id)
    {
        $booking = Booking::with('analysisItems', 'user')->findOrFail($id);

        // Determine kategori: prefer booking->kategori, otherwise try to infer from analysis items
        $kategori = $booking->kategori ?? null;
        if (!$kategori && $booking->relationLoaded('analysisItems')) {
            foreach ($booking->analysisItems as $ai) {
                if (preg_match('/bdm|bdp/i', $ai->nama_item)) {
                    $kategori = $ai->nama_item;
                    break;
                }
            }
        }

        // Determine tanggal: prefer status_updated_at, then updated_at, then created_at, finally now()
        $tanggal = Carbon::now()->format('d/m/Y'); // default fallback

        if ($booking->status_updated_at) {
            $tanggal = Carbon::parse($booking->status_updated_at)->format('d/m/Y');
            Log::info("PDF tanggal dari status_updated_at: {$tanggal} for booking {$booking->id}");
        } elseif ($booking->updated_at) {
            $tanggal = Carbon::parse($booking->updated_at)->format('d/m/Y');
            Log::info("PDF tanggal dari updated_at: {$tanggal} for booking {$booking->id}");
        } elseif ($booking->created_at) {
            $tanggal = Carbon::parse($booking->created_at)->format('d/m/Y');
            Log::info("PDF tanggal dari created_at: {$tanggal} for booking {$booking->id}");
        } else {
            Log::warning("PDF tanggal fallback to now() for booking {$booking->id}");
        }

        Log::info("Final tanggal value: {$tanggal}");

        $data = [
            'booking' => $booking,
            'analysisItems' => $booking->analysisItems,
            'kategori' => $kategori,
            'tanggal' => $tanggal,
        ];

        Log::info("Data being sent to PDF view: ", $data);
        // Use DOMPDF (barryvdh/laravel-dompdf) to generate PDF
        if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            return response()->json(['success' => false, 'message' => 'PDF generator belum terpasang. Jalankan: composer require barryvdh/laravel-dompdf'], 500);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.booking_report', $data)->setPaper('a4', 'portrait');

        // Add headers to prevent caching
        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Content-Disposition' => 'inline; filename="Laporan-' . $booking->kode_batch . '.pdf"'
        ]);
    }

    // Kirim ke Kepala (dari Koordinator) -> set status menunggu_verifikasi_kepala
    public function kirimKeKepala(Request $request, $id)
    {
        if (Auth::user()->role !== 'koordinator') {
            return response()->json(['success' => false, 'message' => 'Hanya koordinator yang dapat mengirim ke Kepala Lab.'], 403);
        }

        $booking = Booking::with('analysisItems', 'user')->findOrFail($id);
        $booking->status = 'menunggu_verifikasi_kepala';
        $booking->status_updated_at = Carbon::now();
        $booking->save();

        // Notifikasi ke Kepala Lab (role = kepala)
        $kepalaUsers = \App\Models\User::where('role', 'kepala')->get();
        foreach ($kepalaUsers as $kepala) {
            Notification::create([
                'user_id' => $kepala->id,
                'type' => 'verifikasi_kepala',
                'title' => 'Permintaan Verifikasi oleh Koordinator',
                'message' => 'Ada hasil analisis yang perlu diverifikasi oleh Kepala Lab.',
                'booking_id' => $booking->id
            ]);
        }

        // Transform analysisItems to analysis_items for consistency
        $responseData = $booking->toArray();
        $responseData['analysis_items'] = $booking->analysisItems;

        return response()->json(['success' => true, 'message' => 'Dikirim ke Kepala', 'data' => $responseData]);
    }

    // Approve by Kepala -> set status menunggu_ttd_koordinator (so Koordinator can sign)
    public function approveByKepala(Request $request, $id)
    {
        if (Auth::user()->role !== 'kepala') {
            return response()->json(['success' => false, 'message' => 'Hanya Kepala Lab yang dapat menyetujui.'], 403);
        }

        $booking = Booking::with('analysisItems', 'user')->findOrFail($id);
        // Setelah Kepala menyetujui, buat record Signature (kepala_approval)
        // Set status to menunggu_ttd_koordinator so Koordinator UI and signature creation logic remain consistent
        $booking->status = 'menunggu_ttd_koordinator'; // menandakan menunggu tanda tangan Koordinator
        $booking->status_updated_at = Carbon::now();
        $booking->save();

        try {
            $sig = Signature::where('booking_id', $booking->id)->where('type', 'kepala_approval')->first();
            if (!$sig) {
                Signature::create([
                    'booking_id' => $booking->id,
                    'type' => 'kepala_approval',
                    'created_by' => Auth::id() ?: null,
                    'status' => 'pending'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create signature record on approveByKepala: ' . $e->getMessage());
        }

        // Notifikasi ke Koordinator agar mengambil dokumen untuk ditandatangani secara manual
        $koordinatorUsers = \App\Models\User::where('role', 'koordinator')->get();
        foreach ($koordinatorUsers as $k) {
            Notification::create([
                'user_id' => $k->id,
                'type' => 'perlu_ttd_koordinator',
                'title' => 'Permintaan Tanda Tangan',
                'message' => 'Hasil analisis telah disetujui Kepala. Silakan unduh, tanda tangani secara manual, dan unggah kembali.',
                'booking_id' => $booking->id
            ]);
        }

        // Transform analysisItems to analysis_items for consistency
        $responseData = $booking->toArray();
        $responseData['analysis_items'] = $booking->analysisItems;

        return response()->json(['success' => true, 'message' => 'Disetujui oleh Kepala', 'data' => $responseData]);
    }

    // Upload bukti pembayaran dari klien (client) -> simpan path dan set status menunggu_konfirmasi_pembayaran
    public function uploadPaymentProof(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        try {
            $request->validate([
                'file' => 'required|mimes:pdf,jpeg,png,jpg|max:10240'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        }

        if ($request->hasFile('file')) {
            try {
                $file = $request->file('file');
                $path = $file->store('payment_proofs', 'public');

                $booking->payment_proof_path = $path;
                // Use existing booking status to avoid enum/truncation issues
                // 'menunggu_pembayaran' is already present in migrations
                $booking->status = 'menunggu_pembayaran';
                $booking->save();

                // Notifikasi ke admin/kasir
                $users = \App\Models\User::whereIn('role', ['admin', 'keuangan', 'kepala'])->get();
                foreach ($users as $u) {
                    Notification::create([
                        'user_id' => $u->id,
                        'type' => 'bukti_pembayaran',
                        'title' => 'Bukti Pembayaran Diupload',
                        'message' => 'Bukti pembayaran telah diunggah untuk booking ' . $booking->kode_batch,
                        'booking_id' => $booking->id
                    ]);
                }

                return response()->json(['success' => true, 'message' => 'Bukti pembayaran berhasil diunggah', 'data' => $booking]);
            } catch (\Exception $e) {
                // Log full exception for debugging
                Log::error('uploadPaymentProof Exception: ' . $e->getMessage() . '\n' . $e->getTraceAsString());
                return response()->json(['success' => false, 'message' => 'Terjadi kesalahan saat menyimpan bukti pembayaran. Silakan coba lagi.'], 500);
            }
        }

        return response()->json(['success' => false, 'message' => 'File tidak ditemukan pada request'], 400);
    }

    public function verifikasiKoordinator(Request $request, $id)
    {
        if (Auth::user()->role !== 'koordinator') {
            return response()->json(['success' => false, 'message' => 'Hanya koordinator yang dapat memverifikasi hasil.'], 403);
        }

        try {
            $booking = Booking::with('analysisItems', 'user')->findOrFail($id);

            // Setelah Koordinator memverifikasi, tandai selesai agar klien dapat mengakses hasil
            $booking->status = 'selesai';
            $booking->status_updated_at = Carbon::now();
            $booking->save();

            // Notifikasi ke Kepala bahwa ada hasil untuk diverifikasi
            try {
                $kepalaUsers = \App\Models\User::where('role', 'kepala')->get();
                foreach ($kepalaUsers as $kepala) {
                    Notification::create([
                        'user_id' => $kepala->id,
                        'type' => 'permintaan_verifikasi_kepala',
                        'title' => 'Permintaan Verifikasi oleh Koordinator',
                        'message' => 'Hasil analisis telah diverifikasi oleh Koordinator dan menunggu persetujuan Kepala Lab.',
                        'booking_id' => $booking->id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to create notification for kepala during verifikasiKoordinator for booking ' . $booking->id . ': ' . $e->getMessage());
            }

            // Also notify the client that the result is verified by coordinator and now available
            try {
                Notification::create([
                    'user_id' => $booking->user_id,
                    'type' => 'hasil_terverifikasi',
                    'title' => 'Hasil Diverifikasi oleh Koordinator',
                    'message' => 'Hasil analisis Anda telah diverifikasi oleh Koordinator. Anda dapat mengunduh hasil dan status pembayaran telah diperbarui.',
                    'booking_id' => $booking->id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create notification for client during verifikasiKoordinator for booking ' . $booking->id . ': ' . $e->getMessage());
            }

            // Additionally: send email to client with the uploaded PDF (if available)
            try {
                if (!empty($booking->pdf_path) && !empty($booking->user) && !empty($booking->user->email)) {
                    $pdfFullPath = storage_path('app/public/' . $booking->pdf_path);
                    if (file_exists($pdfFullPath)) {
                        Mail::send([], [], function ($message) use ($booking, $pdfFullPath) {
                            $to = $booking->user->email;
                            $message->to($to)
                                ->subject('Hasil Analisis Anda - ' . ($booking->kode_batch ?? ''))
                                ->setBody('Halo,\n\nHasil analisis Anda telah diverifikasi oleh Koordinator. Terlampir file hasil analisis.\n\nTerima kasih.','text/plain');
                            $message->attach($pdfFullPath, ['as' => 'Hasil-Analisis.pdf', 'mime' => 'application/pdf']);
                        });
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to send verifikasi email to client for booking ' . $booking->id . ': ' . $e->getMessage());
            }

            // If an invoice exists for this booking, mark it as PAID and set paid_at; also mark booking as paid
            try {
                $invoice = Invoice::where('booking_id', $booking->id)->first();
                if ($invoice) {
                    $invoice->status = 'PAID';
                    $invoice->paid_at = Carbon::now();
                    $invoice->save();
                }
                $booking->is_paid = 1;
                $booking->save();
            } catch (\Exception $e) {
                Log::warning('Failed to mark invoice/booking as paid during verifikasiKoordinator for booking ' . $booking->id . ': ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Hasil analisis berhasil diverifikasi',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in verifikasiKoordinator for booking ' . $id . ': ' . $e->getMessage());
            return response()->json([

                'message' => 'Terjadi kesalahan saat memverifikasi hasil analisis.'
            ], 500);
        }
    }
    /**
     * Send (or resend) analysis PDF to client via email (triggered by Koordinator)
     */
    public function sendResultEmail(Request $request, $id)
    {
        $booking = Booking::with('user')->findOrFail($id);

        if (empty($booking->pdf_path)) {
            return response()->json(['success' => false, 'message' => 'Tidak ada file hasil analisis untuk dikirim.'], 400);
        }
        if (empty($booking->user) || empty($booking->user->email)) {
            return response()->json(['success' => false, 'message' => 'Alamat email klien tidak tersedia.'], 400);
        }

        try {
            Mail::to($booking->user->email)->send(new SendAnalysisResult($booking));
            return response()->json(['success' => true, 'message' => 'Email dikirim ke klien.']);
        } catch (\Exception $e) {
            Log::error('Failed to send result email for booking ' . $booking->id . ': ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal mengirim email. Periksa konfigurasi mail.'], 500);
        }
    }

    // =================================================================
    // HELPER: CEK ACHIEVEMENT PESANAN
    // =================================================================
    private function checkOrderAchievements($userId)
    {
        $totalOrders = Booking::where('user_id', $userId)->count();

        $achievements = DB::table('achievements')
            ->where('type', 'orders')
            ->where('target', '<=', $totalOrders)
            ->get();

        foreach ($achievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $userId)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $userId,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    // Fungsi untuk mengambil notifikasi pengguna berdasarkan peran

    /**
     * Koordinator menyetujui pembayaran: set status booking dan invoice menjadi lunas/PAID
     */
    public function verifyPayment(Request $request, $id)
    {
        $booking = Booking::with('user')->findOrFail($id);

        // Validasi: hanya koordinator yang boleh approve
        $user = Auth::user();
        if (!$user || $user->role !== 'koordinator') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya koordinator yang dapat menyetujui pembayaran.'
            ], 403);
        }

        // Cek status booking dan invoice
        $invoice = Invoice::where('booking_id', $booking->id)->first();
        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice tidak ditemukan untuk booking ini.'
            ], 404);
        }

        // Set status booking dan invoice menjadi lunas/PAID
        $booking->is_paid = 1;
        $booking->status = 'selesai';
        $booking->status_updated_at = Carbon::now();
        $booking->save();

        $invoice->status = 'PAID';
        $invoice->paid_at = Carbon::now();
        $invoice->save();

        // Notifikasi ke klien
        Notification::create([
            'user_id' => $booking->user_id,
            'type' => 'pembayaran_disetujui',
            'title' => 'Pembayaran Disetujui',
            'message' => 'Pembayaran Anda telah disetujui oleh Koordinator. Hasil analisis dapat diakses.',
            'booking_id' => $booking->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil disetujui dan status diperbarui.',
            'data' => $booking
        ]);
    }
    public function getNotifications(Request $request)
    {
        try {
            $userId = Auth::id(); // Ambil ID pengguna yang sedang login
            $userRole = Auth::user()->role; // Ambil peran pengguna

            // Filter notifikasi berdasarkan peran pengguna
            $notifications = Notification::where('user_id', $userId)
                ->orWhere(function ($query) use ($userRole) {
                    $query->where('role', $userRole); // Notifikasi untuk peran tertentu
                })
                ->orderBy('created_at', 'desc') // Urutkan berdasarkan waktu terbaru
                ->get();

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengambil notifikasi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil notifikasi.'
            ], 500);
        }
    }
    // =================================================================
    // 12. HAPUS BOOKING (HANYA STATUS DIBATALKAN)
    // =================================================================
    public function destroy($id)
    {
        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.'
            ], 404);
        }
        if (strtolower($booking->status) !== 'dibatalkan') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya booking dengan status dibatalkan yang dapat dihapus.'
            ], 403);
        }

        if (Auth::user()->role !== 'koordinator' && $booking->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        try {
            $booking->analysisItems()->delete();
            $booking->delete();
            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus booking.'
            ], 500);
        }
    }
}

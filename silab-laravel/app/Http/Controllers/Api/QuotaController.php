<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\QuotaSetting;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class QuotaController extends Controller
{
    // =================================================================
    // 1. AMBIL DATA KALENDER (FULL MONTH UNTUK TEKNISI)
    // =================================================================
    public function getMonthlyQuota(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('m'));
        $jenisInput = $request->input('jenis_analisis', 'metabolit');

        // 1. Normalisasi Nama (Agar sinkron dengan Database)
        $inputLower = strtolower($jenisInput);

        $jenisQuotaDb = ''; // Nama untuk query ke tabel quota_settings
        if ($inputLower == 'hematologi') $jenisQuotaDb = 'hematologi';
        elseif ($inputLower == 'metabolit') $jenisQuotaDb = 'metabolit';
        else $jenisQuotaDb = 'hematologi dan metabolit';

        // 2. Tentukan Group Penghitungan (LOGIKA SHARED QUOTA)
        // Ini kuncinya: Menentukan booking mana saja yang dihitung mengurangi kuota
        $typesToCount = [];

        if ($inputLower == 'metabolit') {
            // Metabolit + hematologi dan metabolit
            $typesToCount = ['metabolit', 'hematologi dan metabolit'];
        } else {
            // Hematologi "menanggung beban" dari Gabungan juga
            // Jadi: Total Terpakai = Booking Hematologi + Booking Gabungan
            $typesToCount = ['hematologi', 'hematologi dan metabolit'];
        }

        // 3. Ambil Aturan Master (Default tanggal = NULL)
        $masterRule = QuotaSetting::where('jenis_analisis', $jenisQuotaDb)
            ->whereNull('tanggal')
            ->first();

        // 4. Ambil Aturan Spesifik Bulan Ini (Override per tanggal jika ada)
        $specificRules = QuotaSetting::where('jenis_analisis', $jenisQuotaDb)
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->get()
            ->keyBy(function ($item) {
                return $item->tanggal->format('Y-m-d');
            });

        // 5. Ambil Data Booking (Hitung Total Berdasarkan Group)
        $bookingsCount = Booking::select(DB::raw('DATE(tanggal_kirim) as tgl'), DB::raw('SUM(jumlah_sampel) as total'))
            ->whereYear('tanggal_kirim', $year)
            ->whereMonth('tanggal_kirim', $month)
            ->whereIn('jenis_analisis', $typesToCount) // <--- PENTING: Filter gabungan
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->groupBy(DB::raw('DATE(tanggal_kirim)'))
            ->get()
            ->keyBy('tgl');

        // 6. Generate Kalender Sebulan Penuh
        $daysInMonth = Carbon::createFromDate($year, $month)->daysInMonth;
        $calendarData = []; // Format Object Key (YYYY-MM-DD)

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::createFromDate($year, $month, $day);
            $dateString = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeek;

            // --- TENTUKAN RULE HARI INI ---
            // Default value jika database kosong total
            $maxQuota = 15;
            $isStrict = 1;
            $isHoliday = false;

            // Cek Libur Standar
            if ($jenisQuotaDb == 'hematologi' && in_array($dayOfWeek, [0, 5, 6])) $isHoliday = true; // Jum, Sab, Min
            if ($jenisQuotaDb == 'metabolit' && in_array($dayOfWeek, [0, 6])) $isHoliday = true; // Sab, Min

            // Logika Prioritas Aturan:
            if (isset($specificRules[$dateString])) {
                // 1. Prioritas Tertinggi: Aturan Spesifik Tanggal Ini
                $maxQuota = $specificRules[$dateString]->kuota_maksimal;
                $isStrict = $specificRules[$dateString]->is_strict;

                // Jika teknisi set kuota > 0 di hari libur, berarti BUKA
                if ($maxQuota > 0) $isHoliday = false;
                // Jika teknisi set kuota 0, berarti TUTUP (Override)
                if ($maxQuota == 0) $isHoliday = true;

            } elseif ($masterRule) {
                // 2. Prioritas Kedua: Aturan Master (tanggal = NULL)
                $maxQuota = $masterRule->kuota_maksimal;
                $isStrict = $masterRule->is_strict;
            }

            // Hitung Pemakaian
            $usedQuota = isset($bookingsCount[$dateString]) ? (int)$bookingsCount[$dateString]->total : 0;

            // Tentukan Label Status & Ketersediaan
            $statusLabel = 'Tersedia';
            $isAvailable = true;

            if ($isHoliday || $maxQuota == 0) {
                $statusLabel = 'Libur/Tutup';
                $isAvailable = false;
                $maxQuota = 0; // Visual saja
            } else {
                if ($usedQuota >= $maxQuota) {
                    if ($isStrict == 1) {
                        $statusLabel = 'full';    // Merah (Strict)
                        $isAvailable = false;
                    } else {
                        $statusLabel = 'warning'; // Kuning (Soft Limit - Boleh lewat)
                        $isAvailable = true;
                    }
                }
            }

            // Output Data
            $calendarData[] = [
                'date' => $dateString,
                'day' => $day,
                'status' => $statusLabel,
                'is_available' => $isAvailable,
                'max_quota' => $maxQuota,
                'used_quota' => $usedQuota,
                'remaining_quota' => max(0, $maxQuota - $usedQuota),
                'is_strict' => $isStrict
            ];
        }

        return response()->json([
            'message' => 'Data kalender berhasil diambil',
            'data' => $calendarData
        ]);
    }

    // =================================================================
    // 2. UPDATE KUOTA MANUAL (OLEH TEKNISI)
    // =================================================================
    public function updateQuota(Request $request)
    {
        if (!in_array(Auth::user()->role ?? '', ['koordinator', 'teknisi'])) {
            return response()->json(['success' => false, 'message' => 'Hanya koordinator dan teknisi yang dapat mengubah kuota.'], 403);
        }

        $request->validate([
            'tanggal' => 'required|date',
            'jenis_analisis' => 'required|in:hematologi,metabolit',
            'kuota_maksimal' => 'required|integer|min:0',
            'terapkan_semua' => 'boolean'
        ]);

        $targetDate = Carbon::parse($request->tanggal);
        $jenis = $request->jenis_analisis;
        $kuota = $request->kuota_maksimal;

        // Jika teknisi update manual, kita anggap ini aturan spesifik yang Strict (Hard Limit)
        // Kecuali Anda ingin manual update juga soft limit, ubah jadi 0.
        $isStrict = 1;

        if ($request->terapkan_semua) {
            $startOfWeek = $targetDate->copy()->startOfWeek();
            $endOfWeek = $targetDate->copy()->endOfWeek();
            $current = $startOfWeek;

            while ($current->lte($endOfWeek)) {
                // Update atau Buat Aturan Spesifik
                QuotaSetting::updateOrCreate(
                    ['tanggal' => $current->format('Y-m-d'), 'jenis_analisis' => $jenis],
                    [
                        'kuota_maksimal' => $kuota,
                        'is_strict' => $isStrict
                    ]
                );
                $current->addDay();
            }
            return response()->json(['message' => 'Kuota minggu ini berhasil diperbarui']);

        } else {
            // Update 1 hari saja
            QuotaSetting::updateOrCreate(
                ['tanggal' => $request->tanggal, 'jenis_analisis' => $jenis],
                [
                    'kuota_maksimal' => $kuota,
                    'is_strict' => $isStrict
                ]
            );
            return response()->json(['message' => 'Kuota berhasil diperbarui']);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuotaSetting;

class QuotaSettingSeeder extends Seeder
{
    public function run(): void
    {
        // Bersihkan data lama terlebih dahulu
        QuotaSetting::truncate();

        // Master Rule: Default quota untuk semua tanggal
        $masterRules = [
            [
                'tanggal' => null, // Null untuk master rule
                'jenis_analisis' => 'metabolit',
                'kuota_maksimal' => 999,
                'is_strict' => false, // Unlimited untuk metabolit
            ],
            [
                'tanggal' => null, // Null untuk master rule
                'jenis_analisis' => 'hematologi',
                'kuota_maksimal' => 30,
                'is_strict' => true, // Hard limit untuk hematologi
            ],
            [
                'tanggal' => null, // Null untuk master rule
                'jenis_analisis' => 'hematologi dan metabolit',
                'kuota_maksimal' => 999,
                'is_strict' => false, // Unlimited seperti metabolit
            ],
        ];

        foreach ($masterRules as $rule) {
            QuotaSetting::create($rule);
        }
    }
}

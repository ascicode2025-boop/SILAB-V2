<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnalysisPriceSeeder extends Seeder
{
    public function run()
    {
        $data = [
            // Metabolit
            [ 'jenis_analisis' => 'Glukosa', 'harga' => 40000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Total Protein', 'harga' => 40000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Albumin', 'harga' => 40000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Trigliserida', 'harga' => 65000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Kolestrol', 'harga' => 55000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'HDL-kol', 'harga' => 90000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'LDL-kol', 'harga' => 110000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Urea/BUN', 'harga' => 40000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Kreatinin', 'harga' => 40000, 'kategori' => 'Metabolit' ],
            [ 'jenis_analisis' => 'Kalsium', 'harga' => 50000, 'kategori' => 'Metabolit' ],
            // Hematologi
            [ 'jenis_analisis' => 'BDM', 'harga' => 25000, 'kategori' => 'Hematologi' ],
            [ 'jenis_analisis' => 'BDP', 'harga' => 25000, 'kategori' => 'Hematologi' ],
            [ 'jenis_analisis' => 'Hemoglobin Darah', 'harga' => 15000, 'kategori' => 'Hematologi' ],
            [ 'jenis_analisis' => 'Hematokrit', 'harga' => 15000, 'kategori' => 'Hematologi' ],
            [ 'jenis_analisis' => 'Diferensiasi Leukosit', 'harga' => 30000, 'kategori' => 'Hematologi' ],
        ];
        DB::table('analysis_prices')->insert($data);
    }
}

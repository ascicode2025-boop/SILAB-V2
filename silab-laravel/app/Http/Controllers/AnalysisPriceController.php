<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalysisPriceController extends Controller
{
    public function index()
    {
        $data = DB::table('analysis_prices')->select('jenis_analisis', 'harga')->get();
        return response()->json($data);
    }

    // Endpoint untuk daftar analisis per kategori (misal: metabolit, hematologi)
    public function grouped()
    {
        $data = DB::table('analysis_prices')
            ->select('jenis_analisis', 'harga', 'kategori')
            ->get()
            ->groupBy('kategori')
            ->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'jenis_analisis' => $item->jenis_analisis,
                        'harga' => $item->harga
                    ];
                })->values();
            });

        // Normalize keys to lowercase for frontend compatibility
        $result = [];
        foreach ($data as $key => $value) {
            $result[strtolower($key)] = $value;
        }

        return response()->json($result);
    }
}

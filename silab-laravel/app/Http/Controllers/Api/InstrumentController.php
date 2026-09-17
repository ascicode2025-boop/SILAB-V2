<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class InstrumentController extends Controller
{
    // Klien (Read Only), Koordinator, Teknisi (CRUD)
    public function index()
    {
        $today = now()->toDateString();
        $instruments = Instrument::withCount(['rentals as active_rentals_count' => function ($query) {
            $query->whereIn('instrument_rentals.status', ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian']);
        }])->get();

        foreach ($instruments as $instrument) {
            $instrument->stok_tersedia = max(0, $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan - $instrument->active_rentals_count);
            if ($instrument->stok_tersedia <= 0) {
                $instrument->status = 'dipinjam'; // For backward compatibility if used in frontend display
            } else {
                $instrument->status = 'tersedia';
            }
        }

        return response()->json([
            'message' => 'Berhasil mengambil daftar alat',
            'data' => $instruments
        ], 200);
    }

    public function store(Request $request)
    {
        // Hanya teknisi/koordinator yang bisa akses ini (diatur via middleware routes)
        $validator = Validator::make($request->all(), [
            'nama_alat' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'is_paid' => 'boolean',
            'harga_sewa' => 'numeric|min:0',
            'total_unit' => 'numeric|min:1',
            'unit_rusak' => 'numeric|min:0',
            'unit_perawatan' => 'numeric|min:0',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120' // max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['is_paid'] = filter_var($request->is_paid, FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('instruments', 'public');
            $data['foto_path'] = $path;
        }

        $instrument = Instrument::create($data);

        $instrument->active_rentals_count = 0;
        $instrument->stok_tersedia = max(0, $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan);
        if ($instrument->stok_tersedia <= 0) {
            $instrument->status = 'dipinjam';
        } else {
            $instrument->status = 'tersedia';
        }

        return response()->json([
            'message' => 'Alat berhasil ditambahkan',
            'data' => $instrument
        ], 201);
    }

    public function show($id)
    {
        $today = now()->toDateString();
        $instrument = Instrument::withCount(['rentals as active_rentals_count' => function ($query) {
            $query->whereIn('instrument_rentals.status', ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian']);
        }])->find($id);

        if (!$instrument) {
            return response()->json(['message' => 'Alat tidak ditemukan'], 404);
        }

        $instrument->stok_tersedia = max(0, $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan - $instrument->active_rentals_count);
        if ($instrument->stok_tersedia <= 0) {
            $instrument->status = 'dipinjam';
        } else {
            $instrument->status = 'tersedia';
        }

        return response()->json([
            'message' => 'Detail alat',
            'data' => $instrument
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $instrument = Instrument::find($id);
        if (!$instrument) {
            return response()->json(['message' => 'Alat tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_alat' => 'sometimes|required|string|max:255',
            'deskripsi' => 'sometimes|required|string',
            'is_paid' => 'boolean',
            'harga_sewa' => 'numeric|min:0',
            'total_unit' => 'numeric|min:1',
            'unit_rusak' => 'numeric|min:0',
            'unit_perawatan' => 'numeric|min:0',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->has('is_paid')) {
            $data['is_paid'] = filter_var($request->is_paid, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($instrument->foto_path && Storage::disk('public')->exists($instrument->foto_path)) {
                Storage::disk('public')->delete($instrument->foto_path);
            }
            $path = $request->file('foto')->store('instruments', 'public');
            $data['foto_path'] = $path;
        }

        $instrument->update($data);

        $instrument = Instrument::withCount(['rentals as active_rentals_count' => function ($query) {
            $query->whereIn('instrument_rentals.status', ['pending', 'disetujui', 'siap_diambil', 'aktif', 'menunggu_pengembalian']);
        }])->find($id);

        $instrument->stok_tersedia = max(0, $instrument->total_unit - $instrument->unit_rusak - $instrument->unit_perawatan - $instrument->active_rentals_count);
        if ($instrument->stok_tersedia <= 0) {
            $instrument->status = 'dipinjam';
        } else {
            $instrument->status = 'tersedia';
        }

        return response()->json([
            'message' => 'Alat berhasil diupdate',
            'data' => $instrument
        ], 200);
    }

    public function destroy($id)
    {
        $instrument = Instrument::find($id);
        if (!$instrument) {
            return response()->json(['message' => 'Alat tidak ditemukan'], 404);
        }

        if ($instrument->foto_path && Storage::disk('public')->exists($instrument->foto_path)) {
            Storage::disk('public')->delete($instrument->foto_path);
        }

        $instrument->delete();

        return response()->json(['message' => 'Alat berhasil dihapus'], 200);
    }
}

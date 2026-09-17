<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;
use Barryvdh\DomPDF\Facade\Pdf as DomPdf;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        // Eager load booking.analysisItems so frontend can show itemized details
        $query = Invoice::with(['user','booking.analysisItems','confirmer'])->orderBy('created_at','desc');
        
        if (Auth::check() && Auth::user()->role === 'klien') {
            $query->where('user_id', Auth::id());
        }

        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('booking_id')) $query->where('booking_id', $request->booking_id);
        $invoices = $query->get();
        return response()->json(['success' => true, 'data' => $invoices]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_number' => 'required|unique:invoices,invoice_number',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
        ]);

        $inv = Invoice::create([
            'invoice_number' => $request->invoice_number,
            'user_id' => $request->user_id,
            'booking_id' => $request->booking_id,
            'amount' => $request->amount,
            'due_date' => $request->due_date,
            'status' => $request->status ?? 'DRAFT'
        ]);

        return response()->json(['success' => true, 'data' => $inv],201);
    }

    /**
     * Create invoice automatically from a booking by summing analysis prices
     */
    public function createFromBooking(Request $request)
    {
        if (!in_array(Auth::user()->role ?? '', ['koordinator', 'teknisi'])) {
            return response()->json(['success' => false, 'message' => 'Hanya koordinator atau teknisi yang dapat membuat invoice.'], 403);
        }

        $request->validate([
            'booking_id' => 'required|exists:bookings,id'
        ]);

        $booking = Booking::with('analysisItems','user')->findOrFail($request->booking_id);

        // If a collection was returned (e.g. an array of ids was passed), pick the first
        if ($booking instanceof SupportCollection) {
            $booking = $booking->first();
        }

        // Calculate amount by summing analysis_prices for each analysis item (per sample)
        $samples = (int) ($booking->jumlah_sampel ?? 0);
        $sumPrices = 0;
        foreach ($booking->analysisItems as $item) {
            // use 'jenis_analisis' column in analysis_prices table
            $price = DB::table('analysis_prices')->where('jenis_analisis', $item->nama_item)->value('harga');
            if (!$price) {
                // fallback price per item per sample
                $price = 50000;
            }
            $sumPrices += (float) $price;
        }
        $amount = $samples * $sumPrices;

        // Generate invoice number: prefer INV-{kode_batch} when available, otherwise fall back to INV-YYYYMMDD-B{ID}
        $invNumber = 'INV-' . ($booking->kode_batch ? $booking->kode_batch : (date('Ymd') . '-B' . $booking->id));

        $inv = Invoice::create([
            'invoice_number' => $invNumber,
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'amount' => $amount,
            'due_date' => now()->addDays(7)->toDateString(),
            'status' => 'UNPAID'
        ]);

        return response()->json(['success' => true, 'data' => $inv],201);
    }

    public function confirmPayment(Request $request, $id)
    {
        if ((Auth::user()->role ?? '') !== 'koordinator') {
            return response()->json(['success' => false, 'message' => 'Hanya koordinator yang dapat menyetujui pembayaran.'], 403);
        }

        $inv = Invoice::findOrFail($id);
        $inv->status = 'PAID';
        $inv->paid_at = now();
        $inv->confirmed_by = Auth::id();
        $inv->save();
        return response()->json(['success' => true, 'data' => $inv]);
    }

    public function uploadPaymentProof(Request $request, $id)
    {
        $inv = Invoice::findOrFail($id);
        $request->validate(['file' => 'required|mimes:pdf,jpeg,png,jpg|max:10240']);
        $file = $request->file('file');
        $path = $file->store('invoices/proofs','public');
        $inv->payment_proof_path = $path;
        $inv->status = 'UNPAID';
        $inv->save();
        return response()->json(['success' => true, 'data' => $inv]);
    }

    /**
     * Generate invoice PDF and send to client by email
     */
    public function sendToClient(Request $request, $id)
    {
        $inv = Invoice::with('booking.analysisItems', 'user')->findOrFail($id);
        Log::info('sendToClient called for invoice ' . $id);

        if (!$inv->user || empty($inv->user->email)) {
            Log::error('Invoice send failed: missing user email for invoice ' . $id);
            return response()->json(['success' => false, 'message' => 'Email klien tidak tersedia untuk invoice ini'], 400);
        }

        // Ensure PDF generator is available
        if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            return response()->json(['success' => false, 'message' => 'PDF generator belum terpasang. Jalankan composer require barryvdh/laravel-dompdf'], 500);
        }

        // Render invoice view
        try {
            $pdf = DomPdf::loadView('pdf.invoice', ['invoice' => $inv])->setPaper('a4', 'portrait');
            $output = $pdf->output();
            $filename = 'invoices/' . $inv->invoice_number . '.pdf';
            Storage::disk('public')->makeDirectory('invoices');
            Storage::disk('public')->put($filename, $output);
            Log::info('Generated invoice PDF at ' . $filename . ' for invoice ' . $id);

            // Send email with attachment
            try {
                Mail::to($inv->user->email)->send(new InvoiceMail($inv, $filename));
                Log::info('Mail sent to ' . $inv->user->email . ' for invoice ' . $id);
            } catch (\Exception $e) {
                Log::error('Mail send failed for invoice ' . $id . ': ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
            }

            return response()->json(['success' => true, 'message' => 'Invoice dikirim ke email klien', 'data' => ['pdf_path' => $filename]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal menghasilkan PDF: ' . $e->getMessage()], 500);
        }
    }
}

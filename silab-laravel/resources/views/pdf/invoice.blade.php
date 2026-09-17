<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice {{ $invoice->invoice_number }}</title>
  <style>
    body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; }
    .header { text-align: center; margin-bottom: 20px; }
    .items { width: 100%; border-collapse: collapse; }
    .items th, .items td { border: 1px solid #ccc; padding: 8px; }
    .right { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Invoice</h2>
    <div>No: {{ $invoice->invoice_number }}</div>
    <div>Tanggal: {{ $invoice->created_at->format('d/m/Y') }}</div>
  </div>

  <div>
    <strong>Kepada:</strong>
    <div>{{ $invoice->user->name ?? '-' }}</div>
    <div>{{ $invoice->user->email ?? '-' }}</div>
  </div>

  <br/>
  <table class="items">
    <thead>
      <tr>
        <th>Deskripsi</th>
        <th>Jumlah Sampel</th>
        <th class="right">Harga / sampel</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      @php
        $booking = $invoice->booking;
        $jumlah = $booking->jumlah_sampel ?? 1;
        $sum = 0;
      @endphp
      @if($booking && $booking->analysisItems && $booking->analysisItems->count()>0)
        @foreach($booking->analysisItems as $it)
          @php
            // Lookup price by 'jenis_analisis' (database column) — fallback to 50000 if not found
            $price = \DB::table('analysis_prices')->where('jenis_analisis', $it->nama_item)->value('harga') ?: 50000;
            $line = $price * $jumlah;
            $sum += $line;
          @endphp
          <tr>
            <td>{{ $it->nama_item }}</td>
            <td class="right">{{ $jumlah }}</td>
            <td class="right">Rp {{ number_format($price,0,',','.') }}</td>
            <td class="right">Rp {{ number_format($line,0,',','.') }}</td>
          </tr>
        @endforeach
      @else
        <tr>
          <td>Invoice untuk booking {{ $invoice->booking_id ?? '-' }}</td>
          <td class="right">-</td>
          <td class="right">-</td>
          <td class="right">Rp {{ number_format($invoice->amount,0,',','.') }}</td>
        </tr>
      @endif
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="right"><strong>Total</strong></td>
        <td class="right"><strong>Rp {{ number_format($invoice->amount,0,',','.') }}</strong></td>
      </tr>
    </tfoot>
  </table>

  <p>Harap lakukan pembayaran sebelum {{ $invoice->due_date }}.</p>
</body>
</html>

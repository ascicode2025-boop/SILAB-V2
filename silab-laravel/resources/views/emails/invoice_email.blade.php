<html>
<head>
  <meta charset="utf-8" />
</head>
<body>
  <p>Yth. {{ $invoice->user->name ?? 'Klien' }},</p>
  <p>Terima kasih. Bersama email ini kami lampirkan invoice untuk layanan laboratorium Anda:</p>
  <ul>
    <li>Nomor Invoice: <strong>{{ $invoice->invoice_number }}</strong></li>
    <li>Jumlah: <strong>Rp {{ number_format($invoice->amount,0,',','.') }}</strong></li>
    <li>Tanggal Jatuh Tempo: <strong>{{ $invoice->due_date }}</strong></li>
  </ul>
  <p>Silakan buka lampiran untuk melihat rincian. Jika ada pertanyaan, balas email ini atau hubungi tim kami.</p>
  <p>Salam,<br/>Laboratorium</p>
</body>
</html>

<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hasil Analisis</title>
</head>
<body>
  <p>Halo {{ $booking->user->name ?? '' }},</p>
  <p>Hasil analisis untuk pesanan Anda (ref: {{ $booking->kode_batch ?? $booking->id }}) telah diverifikasi oleh Koordinator. Terlampir file hasil analisis.</p>
  <p>Terima kasih telah menggunakan layanan kami.</p>
  <p>Salam,<br/>Tim Laboratorium</p>
</body>
</html>

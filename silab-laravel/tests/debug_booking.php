<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = $argv[1] ?? null;
if (!$id) { echo "Usage: php debug_booking.php {id}\n"; exit(1); }
$b = App\Models\Booking::with('signature')->find($id);
if (!$b) { echo json_encode(['error' => 'not found', 'id' => $id]); exit; }
$out = [
    'id' => $b->id,
    'status' => $b->status,
    'pdf_path' => $b->pdf_path,
    'signature' => $b->signature ? $b->signature->toArray() : null
];
echo json_encode($out, JSON_PRETTY_PRINT);

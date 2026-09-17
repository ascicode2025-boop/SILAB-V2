<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$books = App\Models\Booking::with('signature','user')->orderBy('created_at','desc')->take(10)->get();
$out = [];
foreach($books as $b) {
    $out[] = [
        'id'=>$b->id,
        'kode_batch'=>$b->kode_batch,
        'status'=>$b->status,
        'created_at'=>(string)$b->created_at,
        'pdf_path'=>$b->pdf_path,
        'signature'=> $b->signature ? $b->signature->toArray() : null,
        'user'=> $b->user ? ['id'=>$b->user->id,'name'=>$b->user->name] : null
    ];
}
echo json_encode($out, JSON_PRETTY_PRINT);

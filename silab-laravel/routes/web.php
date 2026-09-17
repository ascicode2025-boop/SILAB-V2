<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;


// Blokir akses ke file sensitif
Route::get('/.env', function () {
    abort(404);
});
Route::get('/storage/{any}', function () {
    abort(404);
})->where('any', '.*\.env.*');

Route::get('/', function () {
    return response()->json([
        'message' => 'API Berhasil dijalankan.'
    ]);
});

// Route to serve storage files with CORS headers for React app access
Route::get('/storage/{path}', function ($path) {
    // Ensure the file exists in storage
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }

    // Get the full path
    $fullPath = Storage::disk('public')->path($path);

    // Return file with CORS headers
    return response()->file($fullPath, [
        'Access-Control-Allow-Origin' => 'http://localhost:3000',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials' => 'true',
    ]);
})->where('path', '.*');

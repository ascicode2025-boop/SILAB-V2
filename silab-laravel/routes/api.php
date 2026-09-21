<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\Api\QuotaController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


// Blokir akses ke file sensitif via API
Route::get('/.env', function () {
    abort(404);
});
Route::get('/storage/{any}', function () {
    abort(404);
})->where('any', '.*\.env.*');

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Reset Password
Route::post('/send-otp', [PasswordResetController::class, 'sendOtp']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::get('/hello', function () {
    return response()->json(['message' => 'Koneksi API Berhasil']);
});


use App\Http\Controllers\AnalysisPriceController;
Route::get('/analysis-prices', [AnalysisPriceController::class, 'index']);
Route::get('/analysis-prices-grouped', [AnalysisPriceController::class, 'grouped']);
Route::get('/calendar-quota', [QuotaController::class, 'getMonthlyQuota']);

// Public Instruments (no auth required)
Route::get('/instruments', [\App\Http\Controllers\Api\InstrumentController::class, 'index']);
Route::get('/instruments/{id}', [\App\Http\Controllers\Api\InstrumentController::class, 'show']);


// Protected Routes (Harus Login)
Route::middleware('auth:sanctum')->group(function () {

    // Data User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ==========================================
    // [BARU] ROUTE UPDATE PROFILE
    // ==========================================
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    // ==========================================

    Route::post('/update-quota', [QuotaController::class, 'updateQuota']);

    // Booking Routes
    Route::middleware('throttle:30,1')->post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/all', [BookingController::class, 'indexAll']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    // Koordinator Report/Statistik Route
    Route::get('/koordinator-report', [BookingController::class, 'getKoordinatorReport']);
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);
    Route::put('/bookings/{id}/results', [BookingController::class, 'updateAnalysisResult']);
    Route::put('/bookings/{id}/finalize', [BookingController::class, 'finalizeAnalysis']);
    Route::put('/bookings/{id}/kirim-koordinator', [BookingController::class, 'kirimKeKoordinator']);
    Route::put('/bookings/{id}/kirim-kepala', [BookingController::class, 'kirimKeKepala']);
    Route::put('/bookings/{id}/approve-by-kepala', [BookingController::class, 'approveByKepala']);
    Route::post('/bookings/{id}/upload-pdf', [BookingController::class, 'uploadPdfAndKirim']);
    Route::post('/bookings/{id}/upload-payment-proof', [BookingController::class, 'uploadPaymentProof']);
    Route::get('/bookings/{id}/pdf', [BookingController::class, 'downloadPdf']);
    Route::get('/bookings/{id}/pdf-generated', [BookingController::class, 'downloadGeneratedPdf']);
    Route::put('/bookings/{id}/verifikasi', [BookingController::class, 'verifikasiKoordinator']);
    // Koordinator approve payment (for frontend Setujui Pembayaran)
    Route::post('/bookings/{id}/verify-payment', [BookingController::class, 'verifyPayment']);
    Route::post('/bookings/{id}/send-result-email', [BookingController::class, 'sendResultEmail']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    // Notification Routes
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread']);
    Route::get('/notifications', [NotificationController::class, 'getAll']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

        // Invoice routes
        Route::get('/invoices', [\App\Http\Controllers\Api\InvoiceController::class, 'index']);
        Route::post('/invoices', [\App\Http\Controllers\Api\InvoiceController::class, 'store']);
        Route::post('/invoices/{id}/upload-payment-proof', [\App\Http\Controllers\Api\InvoiceController::class, 'uploadPaymentProof']);
        // Create invoice automatically from booking (sums analysis_prices)
        Route::post('/invoices/from-booking', [\App\Http\Controllers\Api\InvoiceController::class, 'createFromBooking']);
        // Confirm payment by admin/keuangan
        Route::put('/invoices/{id}/confirm-payment', [\App\Http\Controllers\Api\InvoiceController::class, 'confirmPayment']);
        // Send invoice PDF to client via email
        Route::post('/invoices/{id}/send-email', [\App\Http\Controllers\Api\InvoiceController::class, 'sendToClient']);

    // User management (koordinator only)
    Route::middleware('role:koordinator')->group(function () {
        Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::post('/users', [\App\Http\Controllers\Api\UserController::class, 'store']);
        Route::patch('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
    });

    // INSTRUMENTS (Peminjaman Alat) ROUTES - teknisi & koordinator only
    Route::middleware('role:teknisi,koordinator')->group(function () {
        Route::post('/instruments', [\App\Http\Controllers\Api\InstrumentController::class, 'store']);
        Route::put('/instruments/{id}', [\App\Http\Controllers\Api\InstrumentController::class, 'update']);
        Route::delete('/instruments/{id}', [\App\Http\Controllers\Api\InstrumentController::class, 'destroy']);
    });
    Route::get('/rentals', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'index']);
    Route::get('/rentals/closed-dates', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'getClosedDates']);
    Route::post('/rentals/closed-dates', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'storeClosedDate']);
    Route::delete('/rentals/closed-dates/{date}', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'deleteClosedDate']);
    Route::get('/rentals/booked-dates', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'getBookedDates']);
    Route::get('/rentals/available-stock', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'getAvailableStock']);
    Route::get('/rentals/{id}', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'show']);
    Route::middleware('throttle:30,1')->post('/rentals', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'store']);
    Route::put('/rentals/{id}/verify', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'verify']);
    Route::post('/rentals/{id}/payment', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'uploadPayment']);
    Route::put('/rentals/{id}/verify-payment', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'verifyPayment']);
    Route::put('/rentals/{id}/reject-payment', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'rejectPayment']);
    Route::post('/rentals/{id}/denda', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'uploadDenda']);
    Route::put('/rentals/{id}/verify-denda', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'verifyDenda']);
    Route::put('/rentals/{id}/update-dates', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'updateDates']);
    Route::put('/rentals/{id}/ready-pickup', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'markReadyForPickup']);
    Route::put('/rentals/{id}/handover', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'handover']);
    Route::put('/rentals/{id}/return', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'returnInstruments']);
    Route::post('/rentals/{id}/return-request', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'clientReturnRequest']);
    Route::put('/rentals/{id}/cancel', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'cancelRental']);
    Route::delete('/rentals/{id}', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'destroy']);

    Route::get('/lab-clearance', [\App\Http\Controllers\Api\LabClearanceController::class, 'index']);
    Route::post('/lab-clearance/generate', [\App\Http\Controllers\Api\LabClearanceController::class, 'generate']);

    Route::get('/download-template', [\App\Http\Controllers\Api\InstrumentRentalController::class, 'downloadTemplateWithTtd']);
});

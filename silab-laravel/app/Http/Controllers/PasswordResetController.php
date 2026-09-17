<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Mail\SendOtpMail;

class PasswordResetController extends Controller
{

    public function sendOtp(Request $request)
    {

        $request->validate([
            'email' => 'required|email',
        ]);


        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar.'], 404);
        }


        $otp = rand(100000, 999999);
        $expires_at = Carbon::now()->addMinutes(10);

        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'otp' => Hash::make($otp),
                'expires_at' => $expires_at,
                'created_at' => Carbon::now()
            ]
        );


        try {
            Mail::to($request->email)->send(new SendOtpMail($otp));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim email OTP. Cek konfigurasi SMTP Anda.'], 500);
        }

        return response()->json(['message' => 'OTP telah dikirim ke email Anda.'], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|min:6|max:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $resetRecord = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord || !Hash::check($request->otp, $resetRecord->otp)) {
            return response()->json(['message' => 'OTP tidak valid.'], 400);
        }

        if (Carbon::now()->isAfter($resetRecord->expires_at)) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            return response()->json(['message' => 'OTP sudah kedaluwarsa. Silakan minta OTP baru.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password berhasil direset.'], 200);
    }
}

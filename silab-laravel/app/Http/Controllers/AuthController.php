<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Jobs\ProcessUserAchievements;
use App\Mail\WelcomeEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // ==========================================
    // 1. REGISTER (Username, Email, Pass, Institusi, NoHP)
    // ==========================================
    public function register(Request $request)
    {
        Log::info('Register attempt: ', [
            'name' => $request->name,
            'email' => $request->email,
            'institusi' => $request->institusi,
            'nomor_telpon' => $request->nomor_telpon,
        ]);

        try {
            // Validasi
            $request->validate([
                // Akun Dasar
                'name' => ['required', 'string', 'max:255', 'unique:users'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],

                // [DIKEMBALIKAN] Data ini wajib diisi saat register agar muncul di edit profil nanti
                'institusi' => ['required', 'string', 'in:Umum,Dosen IPB,Mahasiswa IPB,Tendik IPB'],
                'nomor_telpon' => ['required', 'string', 'max:20'],
            ], [
                'name.required' => 'Username wajib diisi.',
                'name.unique' => 'Username sudah digunakan, silakan pilih username lain.',
                'name.max' => 'Username maksimal 255 karakter.',
                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Format email tidak valid.',
                'email.unique' => 'Email sudah terdaftar, silakan gunakan email lain atau login.',
                'password.required' => 'Password wajib diisi.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.min' => 'Password minimal 8 karakter.',
                'institusi.required' => 'Pilihan institusi wajib dipilih.',
                'institusi.in' => 'Institusi yang dipilih tidak valid.',
                'nomor_telpon.required' => 'Nomor telepon wajib diisi.',
                'nomor_telpon.max' => 'Nomor telepon maksimal 20 digit.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Register validation failed: ', $e->errors());
            throw $e;
        }

        // Buat User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // Simpan data ini agar nanti tertampil otomatis di form Edit Profil
            'institusi' => $request->institusi,
            'nomor_telpon' => $request->nomor_telpon,

            'role' => 'klien',
            'login_count' => 0,

            // [PENTING] full_name dibiarkan NULL.
            // Ini menjadi penanda bagi Frontend bahwa user ini "Belum Lengkap"
            // sehingga akan di-redirect ke halaman Edit Profil.
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        } catch (\Exception $e) {
            Log::error('Gagal kirim welcome email: ' . $e->getMessage());
        }

        /** @var string $token */
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil! Silakan lengkapi Nama Lengkap Anda.',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // ==========================================
    // 2. LOGIN
    // ==========================================
    public function login(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required'],
        ]);

        // Rate limiter key: combine username + IP to avoid global lockouts
        $loginName = (string) $request->input('name');
        $key = Str::lower($loginName) . '|' . $request->ip();
        $maxAttempts = 5;
        $decaySeconds = 5 * 60; // 5 minutes

        // If too many attempts, still try to authenticate: allow successful login to bypass lockout
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            // Attempt authentication even if locked
            if (Auth::attempt($request->only('name', 'password'))) {
                // Clear attempts on successful login
                RateLimiter::clear($key);
            } else {
                // Increment hit and respond with 429 and Retry-After
                $seconds = RateLimiter::availableIn($key) ?: $decaySeconds;
                RateLimiter::hit($key, $decaySeconds);
                return response()->json([
                    'message' => 'Terlalu banyak percobaan. Silakan coba lagi nanti.'
                ], 429)->header('Retry-After', $seconds);
            }
        } else {
            // Normal flow: attempt authentication and increment on failure
            if (!Auth::attempt($request->only('name', 'password'))) {
                RateLimiter::hit($key, $decaySeconds);
                return response()->json([
                    'message' => 'Username atau password salah.'
                ], 401);
            }
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Cek apakah akun dinonaktifkan
        if (isset($user->status) && $user->status === 'Non-Aktif') {
            Auth::logout();
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.'
            ], 403);
        }

        // Logika Keaktifan
        $user->increment('login_count');
        ProcessUserAchievements::dispatch($user, 'login');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'full_name' => $user->full_name, // Jika ini null, frontend akan redirect
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'institusi' => $user->institusi,
                'nomor_telpon' => $user->nomor_telpon,
                'nim' => $user->nim,
                'prodi' => $user->prodi,
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil'], 200);
    }

    // ==========================================
    // 3. ME (DATA USER)
    // ==========================================
    public function me(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Cek dan berikan achievement untuk user (background)
        if ($user->role === 'teknisi') {
            ProcessUserAchievements::dispatch($user, 'technician_update');
        } elseif ($user->role === 'koordinator') {
            ProcessUserAchievements::dispatch($user, 'koordinator_update');
        }

        // Stats berbeda berdasarkan role
        if ($user->role === 'teknisi') {
            // Untuk teknisi: Total Analisis = booking selesai
            $totalAnalisis = DB::table('bookings')->where('status', 'selesai')->count();
            $statsKey = 'total_orders';
        } elseif ($user->role === 'koordinator') {
            // Untuk koordinator: Total Verifikasi = booking yang sudah ditandatangani
            $totalAnalisis = DB::table('bookings')->whereIn('status', ['ditandatangani', 'selesai'])->count();
            $statsKey = 'total_verifikasi';
        } else {
            // Untuk klien: Total Orders = booking milik user
            $totalAnalisis = DB::table('bookings')->where('user_id', $user->id)->count();
            $statsKey = 'total_orders';
        }

        $totalLogin = $user->login_count;
        $totalAchievements = DB::table('user_achievements')->where('user_id', $user->id)->count();

        $myAchievements = DB::table('user_achievements')
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->where('user_achievements.user_id', $user->id)
            ->select('achievements.name', 'achievements.description', 'achievements.type')
            ->get();

        return response()->json([
            'user' => $user,
            'stats' => [
                $statsKey => $totalAnalisis,
                'total_login' => $totalLogin,
                'total_achievements' => $totalAchievements
            ],
            'achievements_list' => $myAchievements
        ]);
    }

    // ==========================================
    // 4. UPDATE PROFILE
    // ==========================================
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Validasi Input
        $validated = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            // Di sini user WAJIB mengisi Nama Lengkap
            'full_name' => ['required', 'string', 'max:255'],

            // Email bisa diedit
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users')->ignore($user->id)
            ],

            // Institusi & No Telpon tetap divalidasi (data dari register akan otomatis terisi)
            // Allow any string for institusi here because some existing users use values
            // like 'Internal Lab' or other lab names that are not part of the limited list.
            'institusi' => 'required|string',
            'nomor_telpon' => 'required|string|max:20',
            
            'nim' => 'nullable|string|max:50',
            'prodi' => 'nullable|string|max:100',

            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,bmp,webp,tiff,tif',
        ]);

        try {
            if ($request->hasFile('avatar')) {
                $file = $request->file('avatar');

                // Validasi file upload
                if (!$file->isValid()) {
                    return response()->json([
                        'message' => 'File avatar tidak valid atau upload gagal.',
                        'errors' => ['avatar' => ['The avatar failed to upload.']]
                    ], 422);
                }

                // Hapus avatar lama jika ada
                if ($user->avatar && Storage::exists('public/' . $user->avatar)) {
                    Storage::delete('public/' . $user->avatar);
                }

                // Upload avatar baru
                $path = $file->store('avatars', 'public');

                if (!$path) {
                    return response()->json([
                        'message' => 'Gagal menyimpan avatar.',
                        'errors' => ['avatar' => ['Failed to save avatar to storage.']]
                    ], 500);
                }

                $user->avatar = $path;
            }

            // Update Data
            $user->name = $request->name;
            $user->full_name = $request->full_name;
            $user->email = $request->email;
            $user->institusi = $request->institusi;
            $user->nomor_telpon = $request->nomor_telpon;
            $user->nim = $request->nim;
            $user->prodi = $request->prodi;
            $user->bio = $request->bio;

            $user->save();

            // Cek dan berikan achievement teknisi jika perlu
            if ($user->role === 'teknisi') {
                ProcessUserAchievements::dispatch($user, 'technician_update');
            }

            return response()->json([
                'message' => 'Profil berhasil diperbarui!',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Update Profile Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat update profil.',
                'errors' => ['avatar' => [$e->getMessage()]]
            ], 500);
        }
    }
}

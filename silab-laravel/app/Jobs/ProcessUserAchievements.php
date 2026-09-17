<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessUserAchievements implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;
    public $trigger; // 'login', 'technician_update', 'koordinator_update'

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, $trigger = 'login')
    {
        $this->user = $user;
        $this->trigger = $trigger;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if ($this->trigger === 'login') {
                $this->checkLoginAchievements($this->user);
                $this->checkTechnicianAchievements($this->user);
                $this->checkKoordinatorAchievements($this->user);
            } elseif ($this->trigger === 'technician_update') {
                $this->checkTechnicianAchievements($this->user);
            } elseif ($this->trigger === 'koordinator_update') {
                $this->checkKoordinatorAchievements($this->user);
            }
        } catch (\Exception $e) {
            Log::error('Error processing achievements for user ' . $this->user->id . ': ' . $e->getMessage());
        }
    }

    private function checkLoginAchievements(User $user)
    {
        $achievements = DB::table('achievements')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->where(function($query) use ($user) {
                $query->whereNull('role')
                      ->orWhere('role', 'klien')
                      ->orWhere('role', $user->role);
            })
            ->get();

        foreach ($achievements as $achievement) {
            if ($achievement->role === 'teknisi' && $user->role !== 'teknisi') {
                continue;
            }
            if (($achievement->role === 'klien' || $achievement->role === null) && $user->role === 'teknisi') {
                continue;
            }

            $exists = DB::table('user_achievements')
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    private function checkTechnicianAchievements(User $user)
    {
        if ($user->role !== 'teknisi') return;

        // 1. Login Achievements
        $loginAchievements = DB::table('achievements')
            ->where('role', 'teknisi')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->get();

        foreach ($loginAchievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // 2. Analysis Achievements
        $analysisCount = DB::table('bookings')
            ->where('status', 'selesai')
            ->count();

        $analysisAchievements = DB::table('achievements')
            ->where('role', 'teknisi')
            ->where('type', 'analysis')
            ->where('target', '<=', $analysisCount)
            ->get();

        foreach ($analysisAchievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    private function checkKoordinatorAchievements(User $user)
    {
        if ($user->role !== 'koordinator') return;

        // 1. Login Achievements
        $loginAchievements = DB::table('achievements')
            ->where('role', 'koordinator')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->get();

        foreach ($loginAchievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // 2. Verifikasi Achievements
        $verifikasiCount = DB::table('bookings')
            ->whereIn('status', ['ditandatangani', 'selesai'])
            ->count();

        $verifikasiAchievements = DB::table('achievements')
            ->where('role', 'koordinator')
            ->where('type', 'verifikasi')
            ->where('target', '<=', $verifikasiCount)
            ->get();

        foreach ($verifikasiAchievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}

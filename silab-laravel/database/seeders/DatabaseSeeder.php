<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Only create if not exists
        User::firstOrCreate(
            ['name' => 'Test User'],
            [
                'email' => 'test@example.com',
                'password' => Hash::make('123456'),
                'institusi' => 'umum',
                'nomor_telpon' => '081234567890',
            ]
        );

        // 1. Akun Teknisi
        User::firstOrCreate(
            ['name' => 'yudha.teknisi'],
            [
                'email' => 'teknisi@lab.com',
                'password' => Hash::make('123456'),
                'role' => 'teknisi',
                'institusi' => 'Internal Lab',
                'nomor_telpon' => '081234567890'
            ]
        );

        // 2. Akun Koordinator
        User::firstOrCreate(
            ['name' => 'kokom.koordinator'],
            [
                'email' => 'koordinator@lab.com',
                'password' => Hash::make('123456'),
                'role' => 'koordinator',
                'institusi' => 'Internal Lab',
                'nomor_telpon' => '081234567891'
            ]
        );

        // 3. Akun Kepala Lab
        User::firstOrCreate(
            ['name' => 'prof.dewi'],
            [
                'email' => 'kepala@lab.com',
                'password' => Hash::make('123456'),
                'role' => 'kepala',
                'institusi' => 'Internal Lab',
                'nomor_telpon' => '081234567892'
            ]
        );
        $this->call([
            AnalysisPriceSeeder::class,
            QuotaSettingSeeder::class,
            AchievementSeeder::class,
        ]);
    }
}

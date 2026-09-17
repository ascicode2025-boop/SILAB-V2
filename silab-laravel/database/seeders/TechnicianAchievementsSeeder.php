<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TechnicianAchievementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Achievement khusus teknisi
        $technicianAchievements = [
            // --- Kategori: KEAKTIFAN (Login) untuk Teknisi ---
            [
                'name' => 'Teknisi Baru',
                'description' => 'Login pertama kali sebagai teknisi',
                'type' => 'login',
                'target' => 1,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Teknisi Aktif',
                'description' => 'Telah login sebanyak 10 kali',
                'type' => 'login',
                'target' => 10,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Teknisi Setia',
                'description' => 'Telah login sebanyak 50 kali',
                'type' => 'login',
                'target' => 50,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Kategori: ANALISIS (Jumlah analisis selesai) ---
            [
                'name' => 'Analisis Pertama',
                'description' => 'Menyelesaikan analisis pertama',
                'type' => 'analysis',
                'target' => 1,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Teknisi Terampil',
                'description' => 'Menyelesaikan 10 analisis',
                'type' => 'analysis',
                'target' => 10,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Teknisi Ahli',
                'description' => 'Menyelesaikan 25 analisis',
                'type' => 'analysis',
                'target' => 25,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Teknisi Master',
                'description' => 'Menyelesaikan 50 analisis',
                'type' => 'analysis',
                'target' => 50,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Teknisi Legendaris',
                'description' => 'Menyelesaikan 100 analisis',
                'type' => 'analysis',
                'target' => 100,
                'role' => 'teknisi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($technicianAchievements as $achievement) {
            DB::table('achievements')->updateOrInsert(
                ['name' => $achievement['name'], 'role' => $achievement['role']],
                $achievement
            );
        }

        Log::info('Technician achievements seeded successfully.');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KoordinatorAchievementSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('achievements')->insert([
            [
                'name' => 'Verifikasi Pertama',
                'description' => 'Melakukan verifikasi hasil analisis pertama kali.',
                'type' => 'verifikasi',
                'target' => 1,
                'role' => 'koordinator',
            ],
            [
                'name' => 'Verifikasi 10x',
                'description' => 'Melakukan verifikasi hasil analisis sebanyak 10 kali.',
                'type' => 'verifikasi',
                'target' => 10,
                'role' => 'koordinator',
            ],
            [
                'name' => 'Verifikasi 50x',
                'description' => 'Melakukan verifikasi hasil analisis sebanyak 50 kali.',
                'type' => 'verifikasi',
                'target' => 50,
                'role' => 'koordinator',
            ],
            [
                'name' => 'Login Rutin',
                'description' => 'Login ke sistem selama 7 hari berturut-turut.',
                'type' => 'login',
                'target' => 7,
                'role' => 'koordinator',
            ],
            [
                'name' => 'Koordinator Teladan',
                'description' => 'Mendapatkan penghargaan sebagai koordinator teladan.',
                'type' => 'award',
                'target' => 1,
                'role' => 'koordinator',
            ],
            [
                'name' => 'Sertifikasi Koordinator',
                'description' => 'Menyelesaikan pelatihan sertifikasi koordinator.',
                'type' => 'certification',
                'target' => 1,
                'role' => 'koordinator',
            ],
        ]);
    }
}

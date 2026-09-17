<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema; // <--- Tambahkan ini

class AchievementSeeder extends Seeder
{
    public function run()
    {
        // Matikan pengecekan Foreign Key sementara agar bisa truncate
        Schema::disableForeignKeyConstraints();

        // Kosongkan tabel (Reset ID kembali ke 1)
        DB::table('achievements')->truncate();

        // Hidupkan kembali pengecekan Foreign Key
        Schema::enableForeignKeyConstraints();

        // Isi Data
        DB::table('achievements')->insert([
            // --- Kategori: KEAKTIFAN (Login) ---
            [
                'name' => 'Pendatang Baru',
                'description' => 'Login pertama kali ke aplikasi',
                'type' => 'login',
                'target' => 1,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'name' => 'Warga Tetap',
                'description' => 'Telah login sebanyak 50 kali',
                'type' => 'login',
                'target' => 50,
                'created_at' => now(), 'updated_at' => now()
            ],

            // --- Kategori: PESANAN (Orders) ---
            [
                'name' => 'Order Pertama',
                'description' => 'Berhasil membuat pesanan pertama',
                'type' => 'orders',
                'target' => 1,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'name' => 'Pelanggan Setia',
                'description' => 'Telah membuat 10 pesanan',
                'type' => 'orders',
                'target' => 10,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'name' => 'Sultan',
                'description' => 'Telah membuat 50 pesanan',
                'type' => 'orders',
                'target' => 50,
                'created_at' => now(), 'updated_at' => now()
            ]
        ]);
    }
}

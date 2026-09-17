<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupLog extends Command
{
    protected $signature = 'log:backup';
    protected $description = 'Backup laravel.log ke folder backup setiap hari';

    public function handle()
    {
        $logPath = storage_path('logs/laravel.log');
        $backupDir = storage_path('logs/backup/');
        if (!file_exists($logPath)) {
            $this->info('Log file tidak ditemukan.');
            return;
        }
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0775, true);
        }
        $tanggal = Carbon::now()->format('Y-m-d_His');
        $backupFile = $backupDir.'laravel_'.$tanggal.'.log';
        copy($logPath, $backupFile);
        $this->info('Log berhasil dibackup ke '.$backupFile);
    }
}

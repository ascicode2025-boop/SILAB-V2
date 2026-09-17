<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;

class ClearStoredPdfPaths extends Command
{
    protected $signature = 'clear:stored-pdf-paths';
    protected $description = 'Clear stored PDF paths to force regeneration with correct dates';

    public function handle()
    {
        $this->info('🗑️  Clearing stored PDF paths from bookings...');

        $updated = Booking::whereNotNull('pdf_path')
            ->whereIn('status', [
                'menunggu_ttd',
                'menunggu_ttd_koordinator',
                'disetujui',
                'ditandatangani',
                'selesai'
            ])
            ->update(['pdf_path' => null]);

        $this->info("✅ Cleared {$updated} PDF paths.");
        $this->info('💡 Sekarang PDF akan di-generate ulang dengan tanggal yang benar.');

        return 0;
    }
}

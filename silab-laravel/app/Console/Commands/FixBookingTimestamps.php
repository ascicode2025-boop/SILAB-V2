<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use Carbon\Carbon;

class FixBookingTimestamps extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:booking-timestamps';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update status_updated_at for bookings that are missing this timestamp';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Mencari bookings yang belum memiliki status_updated_at...');

        // Find all bookings that are in approved states but missing status_updated_at
        $bookings = Booking::whereNull('status_updated_at')
            ->whereIn('status', [
                'menunggu_ttd',
                'menunggu_ttd_koordinator',
                'disetujui',
                'ditandatangani',
                'selesai',
                'menunggu_pembayaran'
            ])
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('✅ Semua bookings sudah memiliki status_updated_at yang valid.');
            return 0;
        }

        $this->info("📝 Ditemukan {$bookings->count()} bookings yang perlu di-update.");

        $bar = $this->output->createProgressBar($bookings->count());
        $bar->start();

        $updated = 0;
        foreach ($bookings as $booking) {
            // Use updated_at as fallback, or created_at if updated_at is null
            $timestamp = $booking->updated_at ?? $booking->created_at ?? Carbon::now();

            $booking->status_updated_at = $timestamp;
            $booking->save();

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Berhasil update {$updated} bookings!");
        $this->info('💡 Sekarang PDF akan menampilkan tanggal dengan benar.');

        return 0;
    }
}

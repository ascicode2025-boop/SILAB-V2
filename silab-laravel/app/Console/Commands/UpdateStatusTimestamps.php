<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use Carbon\Carbon;

class UpdateStatusTimestamps extends Command
{
    protected $signature = 'bookings:update-timestamps';
    protected $description = 'Update status_updated_at for bookings that are missing it';

    public function handle()
    {
        $this->info('Updating status_updated_at for existing bookings...');

        // Update bookings that don't have status_updated_at
        $bookings = Booking::whereIn('status', [
            'menunggu_ttd',
            'menunggu_ttd_koordinator',
            'disetujui',
            'selesai',
            'ditandatangani'
        ])
        ->whereNull('status_updated_at')
        ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            // Use updated_at as fallback
            $booking->status_updated_at = $booking->updated_at ?? $booking->created_at ?? Carbon::now();
            $booking->save();
            $count++;

            $this->line("Updated booking #{$booking->id} ({$booking->kode_batch}) - status_updated_at: {$booking->status_updated_at}");
        }

        $this->info("Total updated: {$count} bookings");

        // Show current state
        $this->newLine();
        $this->info('Current bookings with TTD status:');
        $current = Booking::whereIn('status', ['menunggu_ttd', 'menunggu_ttd_koordinator', 'disetujui'])
            ->select('id', 'kode_batch', 'status', 'status_updated_at', 'updated_at')
            ->get();

        foreach ($current as $b) {
            $this->line("ID: {$b->id} | Batch: {$b->kode_batch} | Status: {$b->status} | Timestamp: " . ($b->status_updated_at ? $b->status_updated_at->format('d/m/Y H:i') : 'NULL'));
        }

        return 0;
    }
}

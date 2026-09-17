<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\Booking;

class SendAnalysisResult extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    /**
     * Create a new message instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = 'Hasil Analisis Anda - ' . ($this->booking->kode_batch ?? '');
        $mail = $this->subject($subject)
            ->view('emails.analysis_result')
            ->with(['booking' => $this->booking]);

        if (!empty($this->booking->pdf_path)) {
            $pdfFullPath = storage_path('app/public/' . $this->booking->pdf_path);
            if (file_exists($pdfFullPath)) {
                $mail->attach($pdfFullPath, ['as' => 'Hasil-Analisis.pdf', 'mime' => 'application/pdf']);
            }
        }

        return $mail;
    }
}

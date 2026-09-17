<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invoice;
    public $pdfPath;

    public function __construct($invoice, $pdfPath = null)
    {
        $this->invoice = $invoice;
        $this->pdfPath = $pdfPath;
    }

    public function build()
    {
        $mail = $this->subject('Invoice Anda dari Laboratorium')->view('emails.invoice_email')->with(['invoice' => $this->invoice]);
        if ($this->pdfPath && file_exists(storage_path('app/public/' . $this->pdfPath))) {
            $mail->attach(storage_path('app/public/' . $this->pdfPath), [
                'as' => basename($this->pdfPath),
                'mime' => 'application/pdf'
            ]);
        }
        return $mail;
    }
}

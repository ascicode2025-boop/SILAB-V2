<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-mail {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email sending functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?: 'test@example.com';

        $this->info('Testing email configuration...');
        $this->info('Mail Driver: ' . config('mail.default'));
        $this->info('SMTP Host: ' . config('mail.mailers.smtp.host'));
        $this->info('SMTP Port: ' . config('mail.mailers.smtp.port'));
        $this->info('SMTP Username: ' . config('mail.mailers.smtp.username'));
        $this->info('SMTP Encryption: ' . config('mail.mailers.smtp.encryption'));

        try {
            Mail::raw('This is a test email from Laravel application.', function ($message) use ($email) {
                $message->to($email)
                        ->subject('Test Email from Laravel');
            });

            $this->info('✅ Test email sent successfully to: ' . $email);
            $this->info('Check your email inbox (and spam folder) for the test message.');

        } catch (\Exception $e) {
            $this->error('❌ Failed to send test email: ' . $e->getMessage());
            $this->error('Please check your SMTP configuration in .env file.');
        }
    }
}

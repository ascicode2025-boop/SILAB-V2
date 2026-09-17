<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            display: inline-block;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Kode OTP Reset Password</h1>
        </div>
        <div class="content">
            <p>Halo,</p>
            <p>Anda telah meminta untuk mereset password akun Anda. Berikut adalah kode OTP (One-Time Password) yang diperlukan:</p>
            <div class="otp-code">{{ $otp }}</div>
            <p>Kode ini akan kedaluwarsa dalam 10 menit. Jika Anda tidak meminta reset password, abaikan email ini.</p>
            <p>Terima kasih,</p>
            <p>Tim SILAB</p>
        </div>
        <div class="footer">
            <p>Jika Anda memiliki pertanyaan, silakan hubungi kami di support@silab.com</p>
        </div>
    </div>
</body>
</html>

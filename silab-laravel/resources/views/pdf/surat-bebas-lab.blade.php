<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Bebas Penggunaan Laboratorium</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header {
            width: 100%;
            border-bottom: 3px solid black;
            padding-bottom: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header img {
            width: 100%;
            max-height: 100px;
            object-fit: contain;
        }
        .title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 30px;
        }
        .title h3 {
            margin: 0;
            text-decoration: underline;
            font-size: 12pt;
        }
        .content {
            margin-bottom: 30px;
        }
        .data-table {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        .data-table td {
            padding: 2px 5px;
            vertical-align: top;
        }
        .data-table td:first-child {
            width: 150px;
        }
        .lab-list {
            margin-top: 10px;
            margin-bottom: 30px;
        }
        .lab-list ol {
            margin: 0;
            padding-left: 40px;
        }
        .footer {
            margin-top: 50px;
        }
        .footer-date {
            text-align: right;
            margin-bottom: 10px;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
        }
        .signature-table th, .signature-table td {
            border: 1px solid black;
            padding: 10px;
            text-align: left;
            vertical-align: top;
        }
        .signature-table th {
            text-align: center;
            font-weight: bold;
        }
        .signature-box {
            position: relative;
            min-height: 100px;
        }
        .signature-img {
            max-width: 80px;
            max-height: 80px;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <div class="header" style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
        <table style="width: 100%; border: none; padding: 0; margin: 0;">
            <tr>
                <td style="width: 15%; text-align: left; vertical-align: middle; border: none; padding: 0;">
                    @php
                        $logoPath = public_path('asset/logo-ipb.png');
                        $logoSrc = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : '';
                    @endphp
                    @if($logoSrc)
                        <img src="{{ $logoSrc }}" style="width: 90px; height: auto;" alt="Logo IPB">
                    @endif
                </td>
                <td style="width: 50%; text-align: left; vertical-align: middle; border: none; padding: 0;">
                    <h1 style="margin: 0; font-size: 18pt; font-weight: bold; color: black;">INSTITUT PERTANIAN BOGOR</h1>
                    <h2 style="margin: 0; font-size: 14pt; font-weight: bold; color: #cc5a14;">FAKULTAS PETERNAKAN</h2>
                </td>
                <td style="width: 35%; text-align: left; vertical-align: middle; border: none; border-left: 2px solid black; padding-left: 10px;">
                    <p style="margin: 0; font-size: 9pt;">Kampus IPB Dramaga, Bogor 16680</p>
                    <p style="margin: 0; font-size: 9pt;">Telepon (0251) 8626213</p>
                    <p style="margin: 0; font-size: 9pt;">intp@apps.ipb.ac.id</p>
                    <p style="margin: 0; font-size: 9pt;">intp.fapet.ipb.ac.id</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="title">
        <h3>SURAT KETERANGAN</h3>
        <h3>BEBAS PENGGUNAAN LABORATORIUM</h3>
    </div>

    <div class="content">
        <p>Yang bertanda tangan di bawah ini, menerangkan bahwa :</p>

        <table class="data-table">
            <tr>
                <td>Nama</td>
                <td>: {{ $name }}</td>
            </tr>
            <tr>
                <td>NIM</td>
                <td>: {{ $nim }}</td>
            </tr>
            <tr>
                <td>Semester</td>
                <td>: {{ $semester }}</td>
            </tr>
            <tr>
                <td>Program mayor</td>
                <td>: {{ $program_mayor }}</td>
            </tr>
            <tr>
                <td>Departemen</td>
                <td>: {{ $departemen }}</td>
            </tr>
        </table>

        <p>Tidak mempunyai pinjaman bahan kimia, Alat - alat laboratorium atau tanggungan lain pada Laboratorium tempat penelitian, yang dilaksanakan di laboratorium :</p>
        
        <div class="lab-list">
            <ol>
                <li>Laboratorium Nutrisi Ternak Daging dan Kerja</li>
                <li>Laboratorium Biokimia dan Mikrobiologi Nutrisi</li>
                <li>Laboratorium Biokimia</li>
            </ol>
        </div>

        <p>Demikian surat keterangan bebas laboratorium ini agar dapat dipergunakan sebagaimana mestinya.</p>
    </div>

    <div class="footer">
        <div class="footer-date">
            Bogor, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}
        </div>

        <table class="signature-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Nama Laboratorium</th>
                    <th style="width: 50%;">Tanda tangan<br>Penanggung Jawab Laboratorium</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <ol style="margin-top: 0; margin-bottom: 0; padding-left: 20px;">
                            <li>Laboratorium Nutrisi Ternak Daging dan Kerja</li>
                            <li>Laboratorium Biokimia dan Mikrobiologi Nutrisi</li>
                            <li>Laboratorium Biokimia</li>
                        </ol>
                    </td>
                    <td>
                        <table style="width: 100%; border: none;">
                            <tr>
                                <td style="border: none; padding: 2px; width: 80px;">Nama</td>
                                <td style="border: none; padding: 2px;">: Prof. Dr. Ir. Dewi Apri Astuti, M.S.</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 2px;">NIP</td>
                                <td style="border: none; padding: 2px;">: 196110051985032001</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 2px;">Tanda tangan</td>
                                <td style="border: none; padding: 2px;">:
                                    @php
                                        $ttdPath = public_path('asset/ttd.png');
                                        $ttdSrc = file_exists($ttdPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($ttdPath)) : '';
                                    @endphp
                                    @if($ttdSrc)
                                        <br><img src="{{ $ttdSrc }}" class="signature-img" alt="TTD">
                                    @endif
                                </td>
                            </tr>
                        </table>

                        <hr style="border: 0; border-top: 1px dotted #000; margin: 15px 0;">

                        <table style="width: 100%; border: none;">
                            <tr>
                                <td style="border: none; padding: 2px; width: 80px;">Nama</td>
                                <td style="border: none; padding: 2px;">: Kokom Komalasari, S.Pt., M.Si.</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 2px;">Tanda tangan</td>
                                <td style="border: none; padding: 2px;">: 
                                    <!-- Dikosongkan sesuai request -->
                                    <br><br><br>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

</body>
</html>

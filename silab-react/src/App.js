import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { useAutoLogout } from "./hooks/useAutoLogout";

// --- IMPORT YANG HARUS LANGSUNG DIMUAT (dipakai di semua halaman) ---
import NavbarLandingPage from "./pages/NavbarLandingPage";
import PrivateRoute from "./pages/PrivateRoute";
import PopupProvider from "./components/Common/PopupProvider";

// --- LOADING SPINNER (tampil saat halaman sedang dimuat) ---
const LoadingFallback = () => (
  <div style={{
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "60vh", fontFamily: "Poppins, sans-serif"
  }}>
    <div style={{ textAlign: "center" }}>
      <div className="spinner-border text-secondary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Memuat halaman...</p>
    </div>
  </div>
);

// ====================================================================
// LAZY IMPORTS — Halaman hanya dimuat saat user navigasi ke sana
// ====================================================================

// --- Halaman Publik ---
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const Profile = React.lazy(() => import("./pages/Profile"));
const DaftarAnalisis = React.lazy(() => import("./pages/DaftarAnalisis"));
const ForgetPassword = React.lazy(() => import("./pages/ForgetPassword"));
const Galeri = React.lazy(() => import("./pages/Galeri"));
const PanduanSampel = React.lazy(() => import("./pages/PanduanSampel"));
const DaftarAlatSebelumLogin = React.lazy(() => import("./pages/DaftarAlatSebelumLogin"));
const UnauthorizedPage = React.lazy(() => import("./pages/UnauthorizedPage"));

// --- Dashboard Klien ---
const Dashboard = React.lazy(() => import("./pages/Klien/Dashboard"));
const PanduanSampelKlien = React.lazy(() => import("./pages/Klien/PanduanSampelKlien"));
const BookingCalenderKlien = React.lazy(() => import("./pages/Klien/BookingCalenderKlien"));
const PemesananSampelKlien = React.lazy(() => import("./pages/Klien/PemesananSampelKlien"));
const Metabolit = React.lazy(() => import("./pages/Klien/Metabolit"));
const Hematologi = React.lazy(() => import("./pages/Klien/Hematologi"));
const HematologiDanMetabolit = React.lazy(() => import("./pages/Klien/HematologiDanMetabolit"));
const MenungguPersetujuan = React.lazy(() => import("./pages/Klien/MenungguPersetujuan"));
const ProsesAnalisis = React.lazy(() => import("./pages/Klien/ProsesAnalisis"));
const ProfileAkunKlien = React.lazy(() => import("./pages/Klien/ProfileAkunKlien"));
const EditProfileKlien = React.lazy(() => import("./pages/Klien/EditProfileKlien"));
const DaftarAnalisisLogin = React.lazy(() => import("./pages/Klien/DaftarAnalisisLogin"));
const PembayaranKlien = React.lazy(() => import("./pages/Klien/PembayaranKlien"));
const RiwayatAnalisisKlien = React.lazy(() => import("./pages/Klien/RiwayatAnalisisKlien"));
const DaftarAlat = React.lazy(() => import("./pages/Klien/DaftarAlat"));
const PengajuanPeminjamanAlat = React.lazy(() => import("./pages/Klien/PengajuanPeminjamanAlat"));
const DaftarPengajuanAlat = React.lazy(() => import("./pages/Klien/DaftarPengajuanAlat"));
const DetailPengajuanAlat = React.lazy(() => import("./pages/Klien/DetailPengajuanAlat"));

// --- Dashboard Teknisi ---
const DashboardTeknisi = React.lazy(() => import("./pages/Teknisi/DashboardTeknisi"));
const AturTanggalTeknisi = React.lazy(() => import("./pages/Teknisi/AturTanggalTeknisi"));
const JadwalSampel = React.lazy(() => import("./pages/Teknisi/JadwalSampel"));
const VerifikasiSampel = React.lazy(() => import("./pages/Teknisi/VerifikasiSampel"));
const AlasanMenolak = React.lazy(() => import("./pages/Teknisi/AlasanMenolak"));
const InputNilaiAnalisis = React.lazy(() => import("./pages/Teknisi/InputNilaiAnalisis"));
const FormInputNilaiAnalisis = React.lazy(() => import("./pages/Teknisi/FormInputNilaiAnalisis"));
const GeneratePdfAnalysis = React.lazy(() => import("./pages/Teknisi/GeneratePdfAnalysis"));
const ProfileAkunTeknisi = React.lazy(() => import("./pages/Teknisi/ProfileAkunTeknisi"));
const EditProfileTeknisi = React.lazy(() => import("./pages/Teknisi/EditProfileTeknisi"));
const InventarisAlat = React.lazy(() => import("./pages/Teknisi/InventarisAlat"));
const PengelolaanPeminjamanAlat = React.lazy(() => import("./pages/Teknisi/PengelolaanPeminjamanAlat"));
const RiwayatAnalisisTeknisi = React.lazy(() => import("./pages/Teknisi/RiwayatAnalisisTeknisi"));

// --- Dashboard Koordinator ---
const DashboardKoordinator = React.lazy(() => import("./pages/Koordinator/DashboardKoordinator"));
const VerifikasiSampelKoordinator = React.lazy(() => import("./pages/Koordinator/VerifikasiSampelKoordinator"));
const LihatHasilPdfKoordinator = React.lazy(() => import("./pages/Koordinator/LihatHasilPdfKoordinator"));
const TandaTanganKoordinator = React.lazy(() => import("./pages/Koordinator/TandaTanganKoordinator"));
const ManajemenPembayaran = React.lazy(() => import("./pages/Koordinator/ManajemenPembayaran"));
const LaporanKoordinator = React.lazy(() => import("./pages/Koordinator/LaporanKoordinator"));
const ManajemenPengajuanKoordinator = React.lazy(() => import("./pages/Koordinator/ManajemenPengajuanKoordinator"));
const KalenderPeminjamanAlat = React.lazy(() => import("./pages/Koordinator/KalenderPeminjamanAlat"));
const ManajemenAkun = React.lazy(() => import("./pages/Koordinator/ManajemenRole"));
const ProfileAkunKoordinator = React.lazy(() => import("./pages/Koordinator/ProfileAkunKoordinator"));
const EditProfileKoordinator = React.lazy(() => import("./pages/Koordinator/EditProfileKoordinator"));

// --- Dashboard Kepala ---
const MentoringKepala = React.lazy(() => import("./pages/Kepala/MentoringKepala"));
const LaporanKepala = React.lazy(() => import("./pages/Kepala/LaporanKepala"));
const DashboardKepala = React.lazy(() => import("./pages/Kepala/DashboardKepala"));
const VerifikasiKepala = React.lazy(() => import("./pages/Kepala/VerifikasiKepala"));
const LihatHasilPdfKepala = React.lazy(() => import("./pages/Kepala/LihatHasilPdfKepala"));
const ProfileAkunKepala = React.lazy(() => import("./pages/Kepala/ProfileAkunKepala"));
const EditProfileKepala = React.lazy(() => import("./pages/Kepala/EditProfileKepala"));
const PersetujuanPengajuanKepala = React.lazy(() => import("./pages/Kepala/PersetujuanPengajuanKepala"));
const LaporanPeminjamanKepala = React.lazy(() => import("./pages/Kepala/LaporanPeminjamanKepala"));

// ====================================================================
// 1. Layout dengan Navbar (Untuk Landing Page - PUBLIK)
// ====================================================================
function AppLayoutWithNavbar() {
  return (
    <>
      <NavbarLandingPage />
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Semua di sini bisa diakses TANPA Login */}
          <Route path="/landingPage" component={LandingPage} />
          <Route path="/profile" component={Profile} />
          <Route path="/daftarAnalisis" component={DaftarAnalisis} />
          <Route path="/daftarAlat" component={DaftarAlatSebelumLogin} />
          <Route path="/daftarAlatSebelumLogin" component={DaftarAlatSebelumLogin} />
          <Route path="/galeri" component={Galeri} />
          <Route path="/panduanSampel" component={PanduanSampel} />
          <Redirect exact from="/" to="/LandingPage" />
        </Switch>
      </Suspense>
    </>
  );
}

// ====================================================================
// 2. Layout TANPA Navbar Landing Page (Login & Dashboard - PROTECTED)
// ====================================================================
function AppLayoutWithoutNavbar() {
  // Setup auto logout: 60 menit inaktivitas
  useAutoLogout(60, () => {
    console.log("User telah di-logout karena inaktivitas");
  });

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Alias route untuk /teknisi/dashboard/riwayat agar menampilkan RiwayatAnalisisTeknisi */}
        <PrivateRoute path="/teknisi/dashboard/riwayat" component={RiwayatAnalisisTeknisi} allowedRoles={["teknisi"]} />
        {/* --- HALAMAN AKSES PUBLIK (Login/Register) --- */}
        {/* Tetap Route biasa, karena user belum login di sini */}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgetPassword" component={ForgetPassword} />
        <Route path="/unauthorized" component={UnauthorizedPage} /> {/* ⭐ NEW: Halaman Unauthorized */}
        {/* --- DASHBOARD INTERNAL (WAJIB LOGIN + CEK ROLE) --- */}
        {/* 1. Koordinator (Hanya role 'koordinator' yang boleh masuk) */}
        <PrivateRoute path="/koordinator/dashboard/profile/edit" component={EditProfileKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/profile" component={ProfileAkunKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/manajemenAkun" component={ManajemenAkun} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/manajemenPengajuan" component={ManajemenPengajuanKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/kalenderPeminjaman" component={KalenderPeminjamanAlat} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/laporanKoordinator" component={LaporanKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/tandaTanganKoordinator" component={TandaTanganKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/manajemenPembayaran" component={ManajemenPembayaran} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/verifikasiSampelKoordinator/lihatHasilPdfKoordinator/:id" component={LihatHasilPdfKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard/verifikasiSampelKoordinator" component={VerifikasiSampelKoordinator} allowedRoles={["koordinator"]} />
        <PrivateRoute path="/koordinator/dashboard" component={DashboardKoordinator} allowedRoles={["koordinator"]} />
        {/* 2. Kepala (Hanya role 'kepala' yang boleh masuk) */}
        <PrivateRoute path="/kepala/dashboard/laporanPeminjaman" component={LaporanPeminjamanKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/persetujuanPengajuan" component={PersetujuanPengajuanKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/mentoringKepala" component={MentoringKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/:id" component={LihatHasilPdfKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/profile/edit" component={EditProfileKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/profile" component={ProfileAkunKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/verifikasiKepala" component={VerifikasiKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard/laporanKepala" component={LaporanKepala} allowedRoles={["kepala"]} />
        <PrivateRoute path="/kepala/dashboard" component={DashboardKepala} allowedRoles={["kepala"]} />
        {/* 3. Teknisi (Hanya role 'teknisi' yang boleh masuk) */}
        <PrivateRoute path="/teknisi/dashboard/generatePdfAnalysis" component={GeneratePdfAnalysis} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/inputNilaiAnalisis/input-analisis/:id" component={FormInputNilaiAnalisis} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/inputNilaiAnalisis" component={InputNilaiAnalisis} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/verifikasiSampel/alasanMenolak" component={AlasanMenolak} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/verifikasiSampel" component={VerifikasiSampel} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/jadwalSampel" component={JadwalSampel} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/aturTanggalTeknisi" component={AturTanggalTeknisi} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/profile/edit" component={EditProfileTeknisi} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/profile" component={ProfileAkunTeknisi} allowedRoles={["teknisi"]} />
        {/* Route baru untuk Riwayat Analisis Teknisi */}
        <PrivateRoute path="/teknisi/dashboard/riwayat-analisis" component={RiwayatAnalisisTeknisi} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/inventarisAlat" component={InventarisAlat} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard/pengelolaanPeminjaman" component={PengelolaanPeminjamanAlat} allowedRoles={["teknisi"]} />
        <PrivateRoute path="/teknisi/dashboard" component={DashboardTeknisi} allowedRoles={["teknisi"]} />
        {/* 4. Klien / Umum (Hanya role 'klien' yang boleh masuk) */}
        {/* Saya tambahkan pembatasan 'klien' agar teknisi tidak salah masuk ke sini */}
        <PrivateRoute path="/dashboard/riwayatAnalisisKlien" component={RiwayatAnalisisKlien} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/pembayaranKlien" component={PembayaranKlien} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/prosesAnalisis" component={ProsesAnalisis} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/menungguPersetujuan" component={MenungguPersetujuan} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/pemesananSampelKlien/hematologiDanMetabolit" component={HematologiDanMetabolit} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/pemesananSampelKlien/hematologi" component={Hematologi} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/pemesananSampelKlien/metabolit" component={Metabolit} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/pemesananSampelKlien" component={PemesananSampelKlien} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/panduanSampelKlien" component={PanduanSampelKlien} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/daftarAnalisisLogin" component={DaftarAnalisisLogin} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/daftarAlatAnalisis" component={DaftarAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/daftarAlat" component={DaftarAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/pengajuanPeminjaman" component={PengajuanPeminjamanAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/detailPengajuan/step/:id" component={DetailPengajuanAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/detailPengajuan/step" component={DetailPengajuanAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/detailPengajuan" component={DaftarPengajuanAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/daftarPengajuanAlat" component={DaftarPengajuanAlat} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/bookingCalenderKlien" component={BookingCalenderKlien} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/ProfileAkunKlien/EditProfileKlien" component={EditProfileKlien} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard/ProfileAkunKlien" component={ProfileAkunKlien} allowedRoles={["klien"]} />
        {/* Halaman Utama Dashboard Klien */}
        <PrivateRoute path="/dashboard-klien" component={Dashboard} allowedRoles={["klien"]} />
        <PrivateRoute path="/dashboard" component={Dashboard} allowedRoles={["klien"]} />
      </Switch>
    </Suspense>
  );
}

// ====================================================================
// 3. Main App Router
// ====================================================================
function App() {
  return (
    <Router>
      <PopupProvider />
      <Switch>
        {/* A. Rute yang masuk ke Layout Tanpa Navbar (Login & Dashboard) */}
        <Route path="/login" component={AppLayoutWithoutNavbar} />
        <Route path="/register" component={AppLayoutWithoutNavbar} />
        <Route path="/forgetPassword" component={AppLayoutWithoutNavbar} />
        <Route path="/unauthorized" component={AppLayoutWithoutNavbar} />

        {/* Group Dashboard berdasarkan Role */}
        <Route path="/teknisi" component={AppLayoutWithoutNavbar} />
        <Route path="/koordinator" component={AppLayoutWithoutNavbar} />
        <Route path="/kepala" component={AppLayoutWithoutNavbar} />
        <Route path="/dashboard" component={AppLayoutWithoutNavbar} />

        {/* B. Sisanya masuk ke Layout DENGAN Navbar (Landing Page) */}
        <Route component={AppLayoutWithNavbar} />
      </Switch>
    </Router>
  );
}

export default App;

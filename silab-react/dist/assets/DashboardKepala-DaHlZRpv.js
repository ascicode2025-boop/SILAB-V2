import{r as i,h as _,j as a,ai as K,V as T,ag as F,x as V,B as w}from"./index-CqYFNuvE.js";import{N}from"./NavbarLoginKepala-0VDcbJym.js";import{b as z}from"./BookingService-BarUXI9m.js";import{S as E}from"./Spinner-DWv1JFGT.js";import{R as I}from"./Row-DXmN8v6s.js";import{C as m}from"./Col-BCtYfjE6.js";import{C as t}from"./Card-B_1Ew0lC.js";import{R as H,B as J,X as R,Y,T as O,a as G}from"./BarChart-DXjmveR0.js";import{T as P}from"./Table-CoQ7sqG9.js";import"./index-CpySI7i3.js";import"./ConfirmModal-BnH4z8Vl.js";import"./InputGroupContext-B-mH4PIZ.js";import"./index-B9ygI19o.js";import"./apiConfig-BHYt2i42.js";function oa(){var j,k;i.useEffect(()=>{document.title="SILAB-NTDK - Dashboard Kepala"},[]);const g=_(),[A,f]=i.useState(!0),[c,D]=i.useState({menungguVerifikasi:0,sudahDisetujui:0,laporanBulanIni:0}),[n,B]=i.useState([]),[C,S]=i.useState([]);i.useEffect(()=>{M()},[]);const M=async()=>{try{f(!0);const e=await z(),r=(e==null?void 0:e.data)||[],h=r.filter(s=>(s.status||"").toLowerCase()==="menunggu_verifikasi_kepala").length,p=r.filter(s=>(s.status||"").toLowerCase()==="selesai").length,o=new Date,d=o.getMonth(),l=o.getFullYear(),x=r.filter(s=>{const v=new Date(s.created_at);return v.getMonth()===d&&v.getFullYear()===l}).length;D({menungguVerifikasi:h,sudahDisetujui:p,laporanBulanIni:x});const u=r.filter(s=>(s.status||"").toLowerCase()==="menunggu_verifikasi_kepala").slice(0,5);B(u);const y=L(r);S(y)}catch(e){console.error("Gagal mengambil data dashboard:",e)}finally{f(!1)}},L=e=>{const r=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],p=new Date().getMonth(),o=[];for(let d=3;d>=0;d--){const l=(p-d+12)%12,x=e.filter(u=>new Date(u.created_at).getMonth()===l).length;o.push({bulan:r[l],total:x})}return o},b=e=>{try{if(!e)return"-";if(typeof e=="string"){const r=JSON.parse(e);return(Array.isArray(r)?r:[r]).filter(Boolean).join(", ")}return Array.isArray(e)?e.join(", "):String(e)}catch{return String(e)}};return A?a.jsx(N,{children:a.jsxs("div",{className:"text-center py-5",children:[a.jsx(E,{animation:"border",variant:"primary"}),a.jsx("p",{className:"mt-2",children:"Memuat data..."})]})}):a.jsx(N,{children:a.jsxs("div",{className:"dashboard-wrapper",children:[a.jsx("h5",{className:"mb-4 fw-semibold",children:"Selamat Datang!"}),a.jsxs(I,{className:"g-4 mb-4",children:[a.jsx(m,{md:4,children:a.jsxs(t,{className:"summary-card",children:[a.jsx(K,{className:"icon"}),a.jsx("p",{children:"Menunggu Verifikasi"}),a.jsx("h3",{children:c.menungguVerifikasi}),a.jsx("span",{children:"Laporan"})]})}),a.jsx(m,{md:4,children:a.jsxs(t,{className:"summary-card",children:[a.jsx(T,{className:"icon"}),a.jsx("p",{children:"Sudah Disetujui"}),a.jsx("h3",{children:c.sudahDisetujui}),a.jsx("span",{children:"Hasil"})]})}),a.jsx(m,{md:4,children:a.jsxs(t,{className:"summary-card",children:[a.jsx(F,{className:"icon"}),a.jsx("p",{children:"Laporan Bulan Ini"}),a.jsx("h3",{children:c.laporanBulanIni}),a.jsx("span",{children:"Dokumen"})]})})]}),n.length>0&&a.jsx("div",{className:"verifikasi-wrapper",children:a.jsxs(t,{className:"verifikasi-card",children:[a.jsx(V,{className:"verifikasi-icon"}),a.jsxs("div",{className:"verifikasi-content",children:[a.jsxs("p",{children:["Hasil analisis ",a.jsx("strong",{children:((j=n[0])==null?void 0:j.kode_batch)||b((k=n[0])==null?void 0:k.kode_sampel)})," siap diverifikasi"]}),a.jsx(w,{size:"sm",className:"verifikasi-btn",onClick:()=>g.push("/kepala/dashboard/verifikasiKepala"),children:"Verifikasi Sekarang"})]})]})}),a.jsxs(t,{className:"chart-card mb-5",children:[a.jsx("h6",{className:"fw-semibold mb-3",children:"Statistik Aktivitas Laboratorium"}),a.jsx(H,{width:"100%",height:260,children:a.jsxs(J,{data:C,children:[a.jsx(R,{dataKey:"bulan"}),a.jsx(Y,{}),a.jsx(O,{}),a.jsx(G,{dataKey:"total",fill:"#8d6e63",radius:[10,10,0,0]})]})})]}),a.jsxs(t,{className:"table-card shadow-sm",children:[a.jsx(t.Header,{className:"table-header",children:"Sampel Menunggu Verifikasi Akhir"}),a.jsxs(P,{hover:!0,responsive:!0,className:"mb-0 custom-table",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"Kode Batch"}),a.jsx("th",{children:"Jenis Analisis"}),a.jsx("th",{children:"Tanggal Masuk"}),a.jsx("th",{children:"Status"}),a.jsx("th",{children:"Aksi"})]})}),a.jsx("tbody",{children:n.length===0?a.jsx("tr",{children:a.jsx("td",{colSpan:5,className:"text-center py-4 text-muted",children:"Tidak ada sampel yang menunggu verifikasi akhir"})}):n.map(e=>a.jsxs("tr",{children:[a.jsx("td",{className:"fw-semibold",children:e.kode_batch||b(e.kode_sampel)}),a.jsx("td",{children:e.jenis_analisis||e.jenis||"-"}),a.jsx("td",{children:e.created_at?new Date(e.created_at).toLocaleDateString("id-ID"):"-"}),a.jsx("td",{children:a.jsx("span",{className:"status-badge menunggu",children:"Menunggu Verifikasi"})}),a.jsx("td",{children:a.jsx(w,{size:"sm",variant:"primary",style:{backgroundColor:"#45352F",borderColor:"#45352F"},onClick:()=>g.push(`/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/${e.id}`),children:"Lihat Detail"})})]},e.id))})]})]}),a.jsx("style",{children:`
          .dashboard-wrapper {
            padding: 32px 40px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .summary-card {
            text-align: center;
            padding: 32px 20px;
            border-radius: 20px;
            border: none;
            background: #ffffff;
            box-shadow: 0 8px 18px rgba(0,0,0,0.08);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .summary-card .icon {
            font-size: 42px;
            color: #5d4037;
            margin-bottom: 16px;
          }

          .summary-card h3 {
            margin: 6px 0;
            color: #3e2723;
            font-size: 1.8rem;
          }

          .alert-card {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 24px;
            border-radius: 18px;
            background: #fff3e0;
            border: none;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .chart-card {
            padding: 24px;
            border-radius: 20px;
            border: none;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .table-card {
            border-radius: 20px;
            overflow: hidden;
          }
          .verifikasi-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 24px; 
            }


            .verifikasi-card {
            width: 100%;
            max-width: 500px;
            padding: 28px 32px;
            border-radius: 22px;
            border: none;
            background: linear-gradient(135deg, #8d6e63, #6d4c41);
            color: #fff;
            box-shadow: 0 10px 24px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            gap: 20px;
            }

        .verifikasi-icon {
        font-size: 34px;
        color: #ffe0b2;
        flex-shrink: 0;
        }

        .verifikasi-content p {
        margin-bottom: 12px;
        font-size: 0.95rem;
        }

        .verifikasi-btn {
        background: #3e2723 !important;
        border: none !important;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 500;
        }

        .verifikasi-btn:hover {
        background: #2e1b18 !important;
        }
        /* ===== TABLE COKLAT ===== */
        .table-card {
        border-radius: 20px;
        overflow: hidden;
        border: none;
        }

        .table-header {
        background: linear-gradient(135deg, #6d4c41, #4e342e);
        color: #fff;
        font-weight: 600;
        padding: 18px 24px;
        border-bottom: none;
        }

        .custom-table {
        background: #fff;
        }

        .custom-table thead th {
        background: #efebe9;
        color: #4e342e;
        font-weight: 600;
        border: none;
        padding: 14px 18px;
        }

        .custom-table tbody td {
        padding: 14px 18px;
        vertical-align: middle;
        border-top: 1px solid #d7ccc8;
        color: #4e342e;
        }

        .custom-table tbody tr:hover {
        background: #f3ece9;
        }

        /* ===== STATUS BADGE ===== */
        .status-badge {
        padding: 6px 14px;
        border-radius: 14px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-block;
        }

        .status-badge.selesai {
        background: #a1887f;
        color: #3e2723;
        }

        .status-badge.menunggu {
        background: #d7ccc8;
        color: #4e342e;
        }


        `})]})})}export{oa as default};

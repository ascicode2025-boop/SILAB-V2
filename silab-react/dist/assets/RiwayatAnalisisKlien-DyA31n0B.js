import{r as l,j as e,C,B as D}from"./index-CaIZNISw.js";import{N as B}from"./NavbarLoginKlien-CKdNSjW7.js";import{F as A}from"./FooterSetelahLogin-CwXkxCYG.js";import{a as E,g as _}from"./apiConfig-C4YYeh9X.js";import{m as b}from"./proxy-Zkw_X7q2.js";import{C as u}from"./Card-DBdnq1X7.js";import{R as L}from"./Row-CrQ8ZgGk.js";import{C as j}from"./Col-BhJnHBef.js";import{I as f}from"./InputGroup-HKW8SpXj.js";import{S as y}from"./search-BwOqjGjU.js";import{F as R}from"./Form-CDOU6Buo.js";import{T as H}from"./Table-Wd0Xy1yB.js";import{H as T,B as N}from"./hash-DmA-0OWx.js";import{C as w,a as I}from"./chevron-right-ClOpJtAt.js";import"./ConfirmModal-D_daSTw7.js";import"./InputGroupContext-BWpzRyd4.js";import"./index-B9ygI19o.js";import"./createLucideIcon-gH3xQe6x.js";import"./ElementChildren-BvWeNFQg.js";const ie=()=>{l.useEffect(()=>{document.title="SILAB-NTDK - Riwayat Analisis"},[]);const[o,p]=l.useState([]),[k,m]=l.useState(!0),[x,F]=l.useState("");l.useEffect(()=>{(async()=>{m(!0);try{const s=_(),n=localStorage.getItem("token"),z=n?{Authorization:`Bearer ${n}`}:{},d=await(await fetch(`${s}/bookings`,{headers:z})).json();if(d&&d.success){const S=(d.data||[]).filter(t=>{const c=(t.status||"").toLowerCase();return["selesai","lunas","paid","ditandatangani","verified"].includes(c)});p(S.map((t,c)=>{let h="-";return t.analysis_items&&t.analysis_items.length>0&&(h=t.analysis_items.map(g=>g.nama_item||g.namaItem||"-").join(", ")),{no:c+1,kode_batch:t.kode_batch||"-",jenis:h,tanggal:t.updated_at?new Date(t.updated_at).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"}):"-",status:(t.status||"").toLowerCase(),pdf_path:t.pdf_path,id:t.id}}))}}catch{p([])}finally{m(!1)}})()},[]);const i={btnCokelat:"#9E8379",background:"#F8F9FA",textDark:"#2D3436",textMuted:"#636E72"},v=a=>{const s={lunas:{bg:"#E3F9E5",color:"#1F922B",label:"Lunas"},paid:{bg:"#E3F9E5",color:"#1F922B",label:"Lunas"},verified:{bg:"#E3F9E5",color:"#1F922B",label:"Terverifikasi"},ditandatangani:{bg:"#E1F5FE",color:"#0288D1",label:"Ditandatangani"},default:{bg:"#F3F0EF",color:"#8D766B",label:"Selesai"}},n=s[a]||s.default;return e.jsx("span",{style:{backgroundColor:n.bg,color:n.color,padding:"6px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:"600",display:"inline-block"},children:n.label})},r=()=>o.filter(a=>a.kode_batch.toLowerCase().includes(x.toLowerCase())||a.jenis.toLowerCase().includes(x.toLowerCase()));return e.jsxs(B,{children:[e.jsxs("div",{style:{backgroundColor:i.background,minHeight:"100vh",padding:"60px 0"},children:[e.jsxs(C,{children:[e.jsxs(b.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},className:"mb-5",children:[e.jsx("h2",{className:"fw-bold",style:{color:i.textDark,fontSize:"2.2rem"},children:"Riwayat Analisis"}),e.jsx("p",{style:{color:i.textMuted},children:"Kelola dan unduh hasil sertifikat pengujian laboratorium Anda."})]}),e.jsx(b.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1},children:e.jsxs(u,{className:"border-0 shadow-sm",style:{borderRadius:"24px",overflow:"hidden"},children:[e.jsx(u.Header,{className:"bg-white p-4 border-0",children:e.jsxs(L,{className:"g-3 align-items-center",children:[e.jsx(j,{xs:12,md:8,lg:6,children:e.jsxs(f,{className:"bg-light border-0 px-3 py-1",style:{borderRadius:"15px"},children:[e.jsx(f.Text,{className:"bg-transparent border-0 text-muted",children:e.jsx(y,{size:18})}),e.jsx(R.Control,{placeholder:"Cari kode batch atau jenis analisis...",className:"bg-transparent border-0 shadow-none",style:{fontSize:"14px"},onChange:a=>F(a.target.value)})]})}),e.jsx(j,{xs:12,md:4,lg:6,className:"d-none d-lg-block",children:e.jsxs("small",{className:"text-muted",children:["Menampilkan ",r().length," dari ",o.length," riwayat analisis"]})})]})}),e.jsx("div",{className:"table-responsive",children:e.jsxs(H,{hover:!0,className:"mb-0 custom-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"ps-4 d-none d-md-table-cell",children:"No"}),e.jsxs("th",{children:[e.jsx(T,{size:14,className:"me-1 d-none d-sm-inline"}),e.jsx("span",{className:"d-sm-none",children:"Kode"}),e.jsx("span",{className:"d-none d-sm-inline",children:"Kode Batch"})]}),e.jsxs("th",{className:"d-none d-lg-table-cell",children:[e.jsx(N,{size:14,className:"me-1"})," Jenis Analisis"]}),e.jsxs("th",{className:"d-none d-md-table-cell",children:[e.jsx(w,{size:14,className:"me-1"})," Tanggal Selesai"]}),e.jsx("th",{className:"text-center",children:"Status"}),e.jsx("th",{className:"text-center pe-4",children:"Aksi"})]})}),e.jsx("tbody",{children:k?e.jsx("tr",{children:e.jsx("td",{colSpan:6,className:"text-center py-5",children:"Memuat data..."})}):o.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:6,className:"text-center py-5",children:"Belum ada riwayat analisis."})}):r().length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:6,className:"text-center py-5",children:e.jsxs("div",{className:"text-muted",children:[e.jsx(y,{size:40,className:"mb-3 opacity-50"}),e.jsx("p",{className:"mb-2",children:"Tidak ditemukan hasil"}),e.jsx("small",{children:"Coba ubah kata kunci pencarian Anda"})]})})}):r().map((a,s)=>e.jsxs("tr",{children:[e.jsx("td",{className:"ps-4 text-muted d-none d-md-table-cell",children:s+1}),e.jsxs("td",{children:[e.jsx("div",{className:"fw-bold",style:{color:i.textDark},children:a.kode_batch}),e.jsxs("div",{className:"d-lg-none text-muted small mt-1",style:{fontSize:"12px",lineHeight:"1.3"},children:[e.jsx(N,{size:12,className:"me-1"}),e.jsx("span",{className:"text-truncate d-inline-block",style:{maxWidth:"200px",verticalAlign:"middle"},children:a.jenis})]}),e.jsxs("div",{className:"d-md-none text-muted small mt-1",style:{fontSize:"11px"},children:[e.jsx(w,{size:10,className:"me-1"}),a.tanggal]})]}),e.jsx("td",{className:"d-none d-lg-table-cell",children:e.jsx("div",{className:"text-truncate",style:{maxWidth:"250px"},children:a.jenis})}),e.jsx("td",{className:"text-muted d-none d-md-table-cell",children:a.tanggal}),e.jsx("td",{className:"text-center",children:e.jsx("div",{className:"d-flex justify-content-center",children:v(a.status)})}),e.jsx("td",{className:"text-center pe-4",children:a.pdf_path?e.jsxs(D,{as:"a",href:`${E()}/storage/${a.pdf_path}`,target:"_blank",className:"btn-lihat-new",size:"sm",children:[e.jsx("span",{className:"d-none d-sm-inline",children:"Hasil"}),e.jsx("span",{className:"d-sm-none",children:"PDF"}),e.jsx(I,{size:14})]}):e.jsx("span",{className:"text-muted small italic d-block text-center",style:{fontSize:"11px"},children:"Diproses"})})]},a.id))})]})})]})})]}),e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .custom-table {
            font-family: 'Inter', sans-serif;
            border-collapse: separate;
            border-spacing: 0;
          }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 20px 15px;
            border-top: none;
            border-bottom: 1px solid #F1F2F6;
          }

          .custom-table tbody td {
            padding: 20px 15px;
            vertical-align: middle;
            font-size: 14px;
            border-bottom: 1px solid #F1F2F6;
            color: #2D3436;
          }

          .custom-table tbody tr:hover {
            background-color: #F8F9FA !important;
            transition: all 0.2s ease;
          }

          .btn-lihat-new {
            background-color: ${i.btnCokelat};
            border: none;
            border-radius: 8px;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(158, 131, 121, 0.2);
            white-space: nowrap;
          }

          .btn-lihat-new:hover {
            background-color: #8D766B;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(158, 131, 121, 0.3);
          }

          .btn-lihat-new:active {
            transform: translateY(0);
          }

          /* Mobile specific styles */
          @media (max-width: 768px) {
            .custom-table thead th {
              padding: 12px 8px;
              font-size: 10px;
            }
            
            .custom-table tbody td {
              padding: 12px 8px;
              font-size: 13px;
            }
            
            .btn-lihat-new {
              padding: 4px 8px;
              font-size: 10px;
              gap: 4px;
              border-radius: 6px;
            }
            
            .table-responsive {
              font-size: 12px;
            }
          }

          @media (max-width: 576px) {
            .custom-table thead th {
              padding: 10px 6px;
              font-size: 9px;
            }
            
            .custom-table tbody td {
              padding: 10px 6px;
              font-size: 12px;
            }
            
            .btn-lihat-new {
              padding: 4px 6px;
              font-size: 9px;
              min-width: auto;
            }
          }

          /* Status badge responsive */
          @media (max-width: 768px) {
            .custom-table tbody td span[style*="padding: 6px 14px"] {
              padding: 4px 8px !important;
              font-size: 10px !important;
              border-radius: 6px !important;
            }
          }
        `})]}),e.jsx(A,{})]})};export{ie as default};

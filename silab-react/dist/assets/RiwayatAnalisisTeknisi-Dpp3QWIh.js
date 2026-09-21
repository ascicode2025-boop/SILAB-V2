import{r,j as e,C as M,B as L,M as g}from"./index-CaIZNISw.js";import{N as K}from"./NavbarLoginTeknisi-BKy1pQe8.js";import{F as P}from"./FooterSetelahLogin-CwXkxCYG.js";import{a as U,g as $}from"./apiConfig-C4YYeh9X.js";import{m as H}from"./proxy-Zkw_X7q2.js";import{C as f}from"./Card-DBdnq1X7.js";import{R as W}from"./Row-CrQ8ZgGk.js";import{C as G}from"./Col-BhJnHBef.js";import{I}from"./InputGroup-HKW8SpXj.js";import{S as J}from"./search-BwOqjGjU.js";import{F as Y}from"./Form-CDOU6Buo.js";import{T as E}from"./Table-Wd0Xy1yB.js";import{H as Z,B as q}from"./hash-DmA-0OWx.js";import{U as N}from"./user-Ctb7vZv3.js";import{C as O,a as Q}from"./chevron-right-ClOpJtAt.js";import{E as V}from"./eye-DEpsUnhC.js";import{F as X}from"./file-text-C92lwdRj.js";import"./ConfirmModal-D_daSTw7.js";import"./InputGroupContext-BWpzRyd4.js";import"./index-B9ygI19o.js";import"./createLucideIcon-gH3xQe6x.js";import"./ElementChildren-BvWeNFQg.js";function ee(y,x){return x?x.split(" | ").map(a=>{const h=a.match(/\[(.*?)\]/),o=h?h[1]:"-";let j="",b="",i="",c="",l="",u="";if(a.includes("STD=")&&a.includes("SPL="))return j=(a.match(/STD=([\d.]+)/)||[])[1]||"",b=(a.match(/SPL=([\d.]+)/)||[])[1]||"",c=(a.match(/HASIL=([\d.]+)/)||[])[1]||"",l=(a.match(/HASIL=[\d.]+\s*([a-zA-Z%/]+)/)||[])[1]||"",{code:o,std:j,spl:b,hasil:c,unit:l&&l!=="("?l:""};if(a.includes("INPUT=")&&a.includes("HASIL=")){i=(a.match(/INPUT=([\d.]+)/)||[])[1]||"",c=(a.match(/HASIL=([\d.]+)/)||[])[1]||"";let m=a.match(/HASIL=[\d.]+\s*\(([^)]+)\)/);return l=m&&m[1]?m[1]:"",{code:o,input:i,hasil:c,unit:l}}else return a.includes("Lim:")&&a.includes("%")?(u=a.replace(/\[.*?\]:\s*/,""),{code:o,detail:u}):{code:o,raw:a}}):[]}const ve=()=>{var m,k,z,S,F,_,D,C;r.useEffect(()=>{document.title="SILAB-NTDK - Riwayat Analisis Teknisi"},[]);const[y,x]=r.useState([]),[v,a]=r.useState(!0),[h,o]=r.useState(""),[j,b]=r.useState(!1),[i,c]=r.useState(null),l={primary:"#8D766B",btnCokelat:"#9E8379",background:"#F8F9FA",textDark:"#2D3436"};r.useEffect(()=>{(async()=>{a(!0);try{const n=$(),t=localStorage.getItem("token"),d=t?{Authorization:`Bearer ${t}`}:{},p=await(await fetch(`${n}/bookings/all`,{headers:d})).json();if(p&&p.success){const R=(p.data||[]).filter(T=>{var A;return T.status!=="selesai"?!1:(A=T.analysis_items)==null?void 0:A.some(B=>B.hasil&&B.hasil.trim()!=="")});x(R)}}catch{x([])}finally{a(!1)}})()},[]);const u=y.filter(s=>{var n,t,d;return((n=s.kode_batch)==null?void 0:n.toLowerCase().includes(h.toLowerCase()))||((d=(t=s.user)==null?void 0:t.full_name)==null?void 0:d.toLowerCase().includes(h.toLowerCase()))});return e.jsxs(K,{children:[e.jsxs("div",{style:{backgroundColor:l.background,minHeight:"100vh",padding:"60px 0"},children:[e.jsxs(M,{children:[e.jsxs(H.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},className:"mb-5",children:[e.jsxs("div",{className:"d-flex align-items-center gap-2 mb-2",children:[e.jsx("div",{style:{width:"30px",height:"3px",backgroundColor:l.primary}}),e.jsx("span",{className:"text-uppercase fw-bold",style:{color:l.primary,fontSize:"12px",letterSpacing:"1px"},children:"Technician Dashboard"})]}),e.jsx("h2",{className:"fw-bold",style:{color:l.textDark,fontSize:"2.2rem"},children:"Riwayat Analisis Selesai"}),e.jsx("p",{className:"text-muted",children:"Pantau hasil validasi pengujian laboratorium yang telah tuntas."})]}),e.jsx(H.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1},children:e.jsxs(f,{className:"border-0 shadow-sm",style:{borderRadius:"24px",overflow:"hidden"},children:[e.jsx(f.Header,{className:"bg-white p-4 border-0",children:e.jsx(W,{className:"g-3 align-items-center",children:e.jsx(G,{md:5,children:e.jsxs(I,{className:"bg-light border-0 px-3 py-1",style:{borderRadius:"15px"},children:[e.jsx(I.Text,{className:"bg-transparent border-0 text-muted",children:e.jsx(J,{size:18})}),e.jsx(Y.Control,{placeholder:"Cari kode batch atau nama klien...",className:"bg-transparent border-0 shadow-none",style:{fontSize:"14px"},onChange:s=>o(s.target.value)})]})})})}),e.jsx("div",{className:"table-responsive",children:e.jsx("div",{className:"responsive-table-wrapper",children:e.jsxs(E,{hover:!0,className:"mb-0 custom-table responsive-riwayat-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"ps-4",children:"No"}),e.jsxs("th",{children:[e.jsx(Z,{size:14,className:"me-1"})," Kode Batch"]}),e.jsxs("th",{className:"d-none d-md-table-cell",children:[e.jsx(N,{size:14,className:"me-1"})," Nama Klien"]}),e.jsxs("th",{className:"d-none d-lg-table-cell",children:[e.jsx(q,{size:14,className:"me-1"})," Jenis Analisis"]}),e.jsxs("th",{className:"d-none d-lg-table-cell",children:[e.jsx(O,{size:14,className:"me-1"})," Tanggal Selesai"]}),e.jsx("th",{className:"text-center d-none d-sm-table-cell",children:"Status"}),e.jsx("th",{className:"text-center pe-4",children:"Aksi"})]})}),e.jsx("tbody",{children:v?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"text-center py-5 text-muted",children:"Memuat data..."})}):u.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"text-center py-5 text-muted",children:"Tidak ada riwayat ditemukan."})}):u.map((s,n)=>{var t,d,w;return e.jsxs("tr",{children:[e.jsx("td",{className:"ps-4 text-muted",children:n+1}),e.jsx("td",{className:"fw-bold responsive-main-cell",style:{color:l.textDark},children:e.jsxs("div",{className:"d-flex flex-column",children:[e.jsx("span",{className:"main-code",children:s.kode_batch||"-"}),e.jsxs("div",{className:"d-block d-md-none mobile-condensed-info",children:[e.jsxs("small",{className:"text-muted d-block",children:[e.jsx(N,{size:12,className:"me-1"}),((t=s.user)==null?void 0:t.full_name)||"-"]}),e.jsx("small",{className:"text-muted d-block d-sm-none",children:e.jsx("span",{style:{backgroundColor:"#E3F9E5",color:"#1F922B",padding:"2px 8px",borderRadius:"6px",fontSize:"10px",fontWeight:"600"},children:"Selesai"})})]})]})}),e.jsx("td",{className:"d-none d-md-table-cell",children:((d=s.user)==null?void 0:d.full_name)||"-"}),e.jsx("td",{className:"d-none d-lg-table-cell",children:e.jsx("div",{className:"text-truncate",style:{maxWidth:"250px"},children:(w=s.analysis_items)==null?void 0:w.map(p=>p.jenis_analisis||p.nama_item||"-").join(", ")})}),e.jsx("td",{className:"d-none d-lg-table-cell text-muted",children:s.updated_at?new Date(s.updated_at).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"}):"-"}),e.jsx("td",{className:"text-center d-none d-sm-table-cell",children:e.jsx("span",{style:{backgroundColor:"#E3F9E5",color:"#1F922B",padding:"6px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:"600"},children:"Selesai"})}),e.jsx("td",{className:"text-center pe-4",children:e.jsxs("div",{className:"d-flex justify-content-center gap-1 responsive-action-buttons",children:[e.jsxs(L,{variant:"light",size:"sm",className:"d-inline-flex align-items-center gap-1 rounded-pill px-2 px-md-3 responsive-btn",onClick:()=>{c(s),b(!0)},children:[e.jsx(V,{size:14})," ",e.jsx("span",{className:"d-none d-sm-inline",children:"Detail"})]}),s.pdf_path&&e.jsxs(L,{as:"a",href:`${U()}/storage/${s.pdf_path}`,target:"_blank",className:"btn-hasil-teknisi responsive-btn",size:"sm",children:[e.jsx(X,{size:14,className:"d-inline d-sm-none"}),e.jsx("span",{className:"d-none d-sm-inline",children:"Hasil"}),e.jsx(Q,{size:14,className:"d-none d-sm-inline"})]})]})})]},s.id)})})]})})})]})})]}),e.jsxs(g,{show:j,onHide:()=>b(!1),size:"lg",centered:!0,className:"custom-modal",children:[e.jsx(g.Header,{closeButton:!0,className:"border-0 pb-0 px-4 pt-4",children:e.jsx(g.Title,{className:"fw-bold",children:"Detail Laporan Analisis"})}),e.jsx(g.Body,{className:"p-4",children:i&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"p-3 bg-light rounded-4 mb-4 border d-flex flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsx("small",{className:"text-muted d-block text-uppercase fw-bold",style:{fontSize:"10px"},children:"Kode Batch"}),e.jsx("span",{className:"fw-bold text-primary",children:i.kode_batch})]}),e.jsxs("div",{children:[e.jsx("small",{className:"text-muted d-block text-uppercase fw-bold",style:{fontSize:"10px"},children:"Klien"}),e.jsxs("span",{className:"fw-bold",children:[e.jsx(N,{size:14,className:"me-1"}),((m=i.user)==null?void 0:m.full_name)||"N/A"]})]}),e.jsxs("div",{children:[e.jsx("small",{className:"text-muted d-block text-uppercase fw-bold",style:{fontSize:"10px"},children:"No. Telepon"}),e.jsx("span",{className:"fw-bold",children:((k=i.user)==null?void 0:k.nomor_telpon)||((z=i.user)==null?void 0:z.nomor_telpon)||((S=i.user)==null?void 0:S.nomor_telpon)||((F=i.user)==null?void 0:F.nomor_telpon)||((_=i.user)==null?void 0:_.nomor_telpon)||"-"})]}),e.jsxs("div",{children:[e.jsx("small",{className:"text-muted d-block text-uppercase fw-bold",style:{fontSize:"10px"},children:"Email"}),e.jsx("span",{className:"fw-bold",children:((D=i.user)==null?void 0:D.email)||"-"})]}),e.jsxs("div",{children:[e.jsx("small",{className:"text-muted d-block text-uppercase fw-bold",style:{fontSize:"10px"},children:"Selesai Pada"}),e.jsx("span",{className:"fw-bold",children:new Date(i.updated_at).toLocaleDateString("id-ID")})]})]}),(C=i.analysis_items)==null?void 0:C.map((s,n)=>e.jsxs(f,{className:"border-0 shadow-sm mb-3",style:{borderRadius:"15px",overflow:"hidden"},children:[e.jsxs(f.Header,{className:"bg-white fw-bold py-3 border-bottom d-flex align-items-center gap-2",children:[e.jsx("div",{style:{width:"8px",height:"8px",borderRadius:"50%",backgroundColor:l.primary}}),s.nama_item||s.jenis_analisis]}),e.jsxs(f.Body,{children:[s.hasil?e.jsx("div",{className:"table-responsive rounded-3 border",children:e.jsxs(E,{size:"sm",className:"mb-0",children:[e.jsx("thead",{className:"bg-light",children:e.jsx("tr",{style:{fontSize:"12px"},children:s.hasil.includes("STD=")?e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Kode"}),e.jsx("th",{children:"Abs Std"}),e.jsx("th",{children:"Abs Sampel"}),e.jsx("th",{children:"Hasil"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{children:"Kode Sampel"}),e.jsx("th",{children:"Data Analisis"})]})})}),e.jsx("tbody",{style:{fontSize:"13px"},children:ee(s.nama_item,s.hasil).map((t,d)=>e.jsxs("tr",{children:[e.jsx("td",{children:t.code}),t.std?e.jsxs(e.Fragment,{children:[e.jsx("td",{children:t.std}),e.jsx("td",{children:t.spl}),e.jsxs("td",{children:[t.hasil," ",t.unit]})]}):e.jsx("td",{children:t.detail||t.hasil||t.raw})]},d))})]})}):e.jsx("span",{className:"text-muted italic small",children:"Hasil belum diinputkan."}),e.jsxs("div",{className:"mt-2 text-muted",style:{fontSize:"12px"},children:["Metode: ",e.jsx("b",{children:s.metode||"-"})]})]})]},s.id||n))]})})]}),e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .custom-table {
            font-family: 'Inter', sans-serif;
            border-collapse: separate;
            border-spacing: 0;
            font-size: clamp(12px, 2.5vw, 14px);
          }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: clamp(10px, 2vw, 11px);
            letter-spacing: 0.5px;
            padding: clamp(12px, 3vw, 20px) clamp(8px, 2vw, 15px);
            border-bottom: 1px solid #F1F2F6;
            white-space: nowrap;
          }

          .custom-table tbody td {
            padding: clamp(12px, 3vw, 20px) clamp(8px, 2vw, 15px);
            vertical-align: middle;
            font-size: clamp(12px, 2.5vw, 14px);
            border-bottom: 1px solid #F1F2F6;
          }
          
          .responsive-riwayat-table {
            min-width: 100%;
          }
          
          .responsive-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .responsive-main-cell {
            min-width: 120px;
          }
          
          .main-code {
            white-space: nowrap;
            font-weight: 700;
            font-size: clamp(13px, 2.8vw, 15px);
          }
          
          .mobile-condensed-info {
            margin-top: 4px;
            line-height: 1.3;
          }
          
          .mobile-condensed-info small {
            font-size: clamp(10px, 2vw, 12px);
            margin-bottom: 2px;
          }
          
          .responsive-action-buttons {
            gap: clamp(2px, 1vw, 8px) !important;
          }
          
          .responsive-btn {
            font-size: clamp(10px, 2.2vw, 13px) !important;
            padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 16px) !important;
            border-radius: clamp(6px, 1.5vw, 10px) !important;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-hasil-teknisi {
            background-color: ${l.btnCokelat};
            border: none;
            border-radius: clamp(6px, 1.5vw, 10px);
            padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 16px);
            font-size: clamp(10px, 2.2vw, 13px);
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: clamp(2px, 0.5vw, 6px);
            transition: 0.3s;
            min-height: 32px;
          }

          .btn-hasil-teknisi:hover {
            background-color: #8D766B;
            color: white;
            transform: translateY(-1px);
          }

          .custom-modal .modal-content {
            border-radius: 25px;
            border: none;
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .responsive-table-wrapper {
              margin: 0 -15px;
              border-radius: 0;
            }
            
            .custom-table {
              font-size: 12px;
            }
            
            .custom-table thead th {
              padding: 12px 8px;
              font-size: 10px;
            }
            
            .custom-table tbody td {
              padding: 12px 8px;
              font-size: 12px;
            }
            
            .responsive-main-cell {
              min-width: 140px;
            }
            
            .main-code {
              font-size: 13px;
            }
            
            .mobile-condensed-info small {
              font-size: 11px;
            }
            
            .responsive-btn {
              font-size: 11px !important;
              padding: 6px 10px !important;
              min-height: 30px;
            }
            
            .btn-hasil-teknisi {
              font-size: 11px;
              padding: 6px 10px;
              min-height: 30px;
            }
          }
          
          /* Tablet adjustments */
          @media (min-width: 769px) and (max-width: 1024px) {
            .custom-table tbody td {
              font-size: 13px;
            }
            
            .responsive-btn {
              font-size: 12px !important;
            }
            
            .btn-hasil-teknisi {
              font-size: 12px;
            }
          }
          
          /* Small mobile phones */
          @media (max-width: 480px) {
            .responsive-table-wrapper {
              margin: 0 -10px;
            }
            
            .custom-table thead th,
            .custom-table tbody td {
              padding: 10px 6px;
            }
            
            .responsive-main-cell {
              min-width: 120px;
            }
            
            .main-code {
              font-size: 12px;
            }
            
            .mobile-condensed-info small {
              font-size: 10px;
            }
            
            .responsive-btn {
              font-size: 10px !important;
              padding: 5px 8px !important;
              min-height: 28px;
            }
            
            .btn-hasil-teknisi {
              font-size: 10px;
              padding: 5px 8px;
              min-height: 28px;
            }
          }
          
          /* Desktop display classes */
          @media (min-width: 768px) {
            .d-md-table-cell {
              display: table-cell !important;
            }
            .d-md-none {
              display: none !important;
            }
          }
          
          @media (min-width: 992px) {
            .d-lg-table-cell {
              display: table-cell !important;
            }
          }
          
          @media (min-width: 576px) {
            .d-sm-table-cell {
              display: table-cell !important;
            }
            .d-sm-inline {
              display: inline !important;
            }
            .d-sm-none {
              display: none !important;
            }
          }
        `})]}),e.jsx(P,{})]})};export{ve as default};

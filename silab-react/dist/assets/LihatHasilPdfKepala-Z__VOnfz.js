import{r as l,a9 as O,h as T,j as e,B as m,M as h,k as D,U as g}from"./index-CaIZNISw.js";import{E}from"./jspdf.plugin.autotable-DqDgKpsX.js";import{N as M}from"./NavbarLoginKepala-L35lHQx3.js";import{F as G}from"./FooterSetelahLogin-CwXkxCYG.js";import{f as I}from"./pdfHelpers-DsnQpvSX.js";import{b as J,u as W}from"./BookingService-CXKogaHN.js";import{S as j}from"./Spinner-MbuZ3Cq6.js";import{C as F}from"./Card-DBdnq1X7.js";import"./slicedToArray-3-nhYaLK.js";import"./index-DAOyaS4S.js";import"./ConfirmModal-D_daSTw7.js";import"./InputGroupContext-BWpzRyd4.js";import"./index-B9ygI19o.js";import"./apiConfig-C4YYeh9X.js";import"./Row-CrQ8ZgGk.js";import"./Col-BhJnHBef.js";const Y=`
  @media (max-width: 992px) {
    .pdf-header-card .card-body {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 1rem !important;
    }
    .pdf-header-actions {
      width: 100% !important;
      justify-content: flex-start !important;
    }
    .pdf-viewer-container {
      height: 600px !important;
    }
  }
  
  @media (max-width: 768px) {
    .pdf-header-title {
      font-size: 1.1rem !important;
    }
    .pdf-header-subtitle {
      font-size: 0.8rem !important;
    }
    .pdf-header-actions {
      flex-wrap: wrap !important;
    }
    .pdf-header-actions .btn {
      font-size: 0.8rem !important;
      padding: 0.4rem 0.75rem !important;
    }
    .pdf-viewer-container {
      height: 500px !important;
      border-radius: 6px !important;
    }
  }
  
  @media (max-width: 576px) {
    .pdf-page-container {
      padding: 0.75rem !important;
    }
    .pdf-header-card {
      margin-bottom: 0.75rem !important;
    }
    .pdf-header-card .card-body {
      padding: 0.75rem !important;
    }
    .pdf-header-title {
      font-size: 1rem !important;
    }
    .pdf-header-subtitle {
      font-size: 0.75rem !important;
      line-height: 1.4 !important;
    }
    .pdf-header-actions {
      gap: 0.5rem !important;
    }
    .pdf-header-actions .btn {
      flex: 1 1 auto !important;
      min-width: 100px !important;
      font-size: 0.75rem !important;
      padding: 0.35rem 0.5rem !important;
    }
    .pdf-viewer-container {
      height: 450px !important;
      margin: 0 -0.75rem !important;
      border-radius: 0 !important;
      border-left: none !important;
      border-right: none !important;
    }
  }
`;function pe(){var S,B,L;l.useEffect(()=>{document.title="SILAB-NTDK - Lihat Hasil PDF"},[]);const{id:b}=O(),k=T(),[N,v]=l.useState(!1),[t,$]=l.useState(null),[o,f]=l.useState(null),[C,_]=l.useState(!1),[p,P]=l.useState(!1),[U,u]=l.useState(!1),[x,w]=l.useState({show:!1,title:"",message:"",type:"info"}),y=()=>{let i="unknown";if(t){if(t.kode_batch)i=t.kode_batch;else if(t.kode_sampel)try{if(typeof t.kode_sampel=="string"&&t.kode_sampel.trim().startsWith("[")){const a=JSON.parse(t.kode_sampel);Array.isArray(a)&&a.length>0&&(i=a[0])}else i=t.kode_sampel}catch{i=t.kode_sampel}}return`Laporan_Analisis_${String(i).replace(/[^a-zA-Z0-9\-_]/g,"_")}.pdf`};l.useEffect(()=>{b&&R(b)},[b]);const R=async i=>{try{v(!0);const r=await J(),n=((r==null?void 0:r.data)||[]).find(s=>String(s.id)===String(i));if($(n||null),n){const s="https://api.silabntdk.com/api",d=s.replace(/\/api\/?$/,"");let c=null;n.file_ttd_path?c=`${d}/storage/${n.file_ttd_path}`:n.pdf_path?c=`${d}/storage/${n.pdf_path}`:c=`${s}/bookings/${n.id}/pdf`,f(c)}}catch(r){console.error(r)}finally{v(!1)}},A=()=>{if(!t)return null;const r="https://api.silabntdk.com/api".replace(/\/api\/?$/,"");return t.file_ttd_path?`${r}/storage/${t.file_ttd_path}`:t.pdf_path?`${r}/storage/${t.pdf_path}`:null},K=(i=!1)=>{if(!t)return;I(t);const r=new E("p","mm","a4");if(r.text("Preview PDF Generated Client Side",10,10),i)r.save(y());else{const a=r.output("blob");o&&URL.revokeObjectURL(o);const n=new File([a],y(),{type:"application/pdf"});f(URL.createObjectURL(n))}};l.useEffect(()=>{const i=async a=>{const n="https://api.silabntdk.com/api";try{const s=await fetch(`${n}/bookings/${a}/pdf`,{headers:{...g(),Accept:"application/pdf"}});if(s.ok)return await s.blob()}catch{}try{const s=await fetch(`${n}/bookings/${a}/pdf-generated`,{headers:{...g(),Accept:"application/pdf"}});if(s.ok)return await s.blob()}catch{}return null};(async()=>{if(!t)return;_(!0);let a=null;try{a=await i(t.id)}catch{}if(a){o&&URL.revokeObjectURL(o);const n=URL.createObjectURL(a);f(n)}else!t.pdf_path&&!t.file_ttd_path?K(!1):f(null);_(!1)})()},[t]);const z=async()=>{if(t){P(!0);try{await W(t.id,{status:"menunggu_ttd_koordinator",status_updated_at:new Date().toISOString()}),u(!1),w({show:!0,title:"Berhasil!",message:"Hasil analisis telah disetujui dan dikirim ke Koordinator untuk ditandatangani.",type:"success"}),setTimeout(()=>{k.push("/kepala/dashboard/verifikasiKepala")},1500)}catch(i){console.error("Gagal update status:",i),w({show:!0,title:"Gagal",message:"Gagal menyetujui hasil analisis.",type:"error"})}finally{P(!1)}}},H=async()=>{const i=y(),r="https://api.silabntdk.com/api";try{let a;if(t!=null&&t.id){const d=await fetch(`${r}/bookings/${t.id}/pdf`,{headers:{...g(),Accept:"application/pdf"}});d.ok&&(a=await d.blob())}if(!a){const d=A();if(d){const c=await fetch(d,{headers:g(),mode:"cors"});c.ok&&(a=await c.blob())}}if(!a){alert("PDF tidak tersedia.");return}const n=window.URL.createObjectURL(a),s=document.createElement("a");s.style.display="none",s.href=n,s.download=i,document.body.appendChild(s),s.click(),window.URL.revokeObjectURL(n),document.body.removeChild(s)}catch(a){console.error("Download error:",a),alert("Gagal mengunduh PDF. Silakan coba lagi.")}};return e.jsxs(M,{children:[e.jsx("style",{children:Y}),e.jsxs("div",{className:"container-fluid p-3 p-md-4 pdf-page-container",style:{minHeight:"calc(100vh - 160px)"},children:[N&&e.jsx("div",{className:"text-center py-5",children:e.jsx(j,{animation:"border"})}),!N&&e.jsxs(e.Fragment,{children:[e.jsx(F,{className:"shadow-sm border-0 mb-2 mb-md-3 pdf-header-card",children:e.jsxs(F.Body,{className:"d-flex justify-content-between align-items-center flex-wrap gap-2",children:[e.jsxs("div",{className:"flex-grow-1",children:[e.jsx("h5",{className:"mb-1 text-primary pdf-header-title",children:"Preview Hasil Analisis"}),e.jsxs("p",{className:"mb-0 text-muted small pdf-header-subtitle",children:["Kode Batch: ",e.jsx("strong",{children:(t==null?void 0:t.kode_batch)||"-"}),e.jsx("span",{className:"d-none d-sm-inline",children:" | "}),e.jsx("br",{className:"d-sm-none"}),"Status: ",e.jsx("strong",{className:"text-uppercase",children:((S=t==null?void 0:t.status)==null?void 0:S.replace(/_/g," "))||"-"})]})]}),e.jsxs("div",{className:"d-flex gap-2 flex-wrap pdf-header-actions",children:[e.jsxs(m,{variant:"secondary",size:"sm",className:"d-flex align-items-center",onClick:()=>k.push("/kepala/dashboard/verifikasiKepala"),children:[e.jsx("span",{className:"d-none d-sm-inline me-1",children:"←"})," Kembali"]}),e.jsxs(m,{variant:"primary",size:"sm",className:"d-flex align-items-center",onClick:H,children:[e.jsx("span",{className:"d-none d-sm-inline me-1",children:"↓"})," Download"]}),t&&(t.status||"").toLowerCase()==="menunggu_verifikasi_kepala"&&e.jsx(m,{variant:"success",size:"sm",className:"d-flex align-items-center",onClick:()=>u(!0),disabled:p,style:{backgroundColor:"#28a745",borderColor:"#28a745"},children:p?e.jsxs(e.Fragment,{children:[e.jsx(j,{as:"span",animation:"border",size:"sm",role:"status","aria-hidden":"true",className:"me-1"}),e.jsx("span",{className:"d-none d-md-inline",children:"Memproses..."})]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"d-none d-md-inline",children:"Setuju (Kirim ke TTD)"}),e.jsx("span",{className:"d-md-none",children:"Setuju"})]})})]})]})}),e.jsx("div",{className:"pdf-viewer-container",style:{height:"75vh",minHeight:"400px",maxHeight:"800px",border:"1px solid #ddd",borderRadius:"8px",overflow:"hidden",backgroundColor:"#525659"},children:C?e.jsxs("div",{className:"d-flex flex-column justify-content-center align-items-center h-100 text-white",children:[e.jsx(j,{animation:"border",variant:"light",className:"mb-2"}),e.jsx("p",{className:"mb-0",children:"Memuat Preview PDF..."})]}):o?e.jsx("object",{data:o,type:"application/pdf",width:"100%",height:"100%","aria-label":"PDF Preview",children:e.jsxs("div",{className:"d-flex flex-column justify-content-center align-items-center h-100 text-white p-3 text-center",children:[e.jsx("p",{className:"mb-2",children:"PDF tidak dapat ditampilkan di browser ini."}),e.jsx("a",{href:o,target:"_blank",rel:"noopener noreferrer",className:"btn btn-outline-light btn-sm",children:"Buka PDF di Tab Baru"})]})}):e.jsx("div",{className:"d-flex justify-content-center align-items-center h-100 text-white",children:e.jsx("p",{className:"mb-0",children:"Preview tidak tersedia."})})})]})]}),e.jsxs(h,{show:U,onHide:()=>u(!1),centered:!0,style:{zIndex:1060},children:[e.jsx(h.Header,{closeButton:!0,style:{borderBottom:"1px solid #eee"},children:e.jsxs(h.Title,{className:"h5 fw-bold",children:[e.jsx("span",{className:"text-success me-2",children:"✓"}),"Konfirmasi Persetujuan"]})}),e.jsxs(h.Body,{className:"px-4 py-3",children:[e.jsx("p",{className:"mb-2",children:"Apakah Anda yakin menyetujui hasil analisis ini?"}),e.jsxs("p",{className:"mb-3 text-muted small",children:["Dengan menyetujui, dokumen akan dikirim ke ",e.jsx("strong",{children:"Koordinator"})," untuk proses ",e.jsx("strong",{children:"Tanda Tangan Digital"}),"."]}),e.jsxs("div",{className:"bg-light p-3 rounded",children:[e.jsxs("div",{className:"d-flex justify-content-between small",children:[e.jsx("span",{className:"text-muted",children:"Kode Batch:"}),e.jsx("strong",{children:(t==null?void 0:t.kode_batch)||"-"})]}),e.jsxs("div",{className:"d-flex justify-content-between small mt-1",children:[e.jsx("span",{className:"text-muted",children:"Pemesan:"}),e.jsx("strong",{children:((B=t==null?void 0:t.user)==null?void 0:B.full_name)||((L=t==null?void 0:t.user)==null?void 0:L.name)||"-"})]}),e.jsxs("div",{className:"d-flex justify-content-between small mt-1",children:[e.jsx("span",{className:"text-muted",children:"Jenis Analisis:"}),e.jsx("strong",{children:(t==null?void 0:t.jenis_analisis)||"-"})]})]})]}),e.jsxs(h.Footer,{className:"border-top-0",children:[e.jsx(m,{variant:"outline-secondary",onClick:()=>u(!1),disabled:p,children:"Batal"}),e.jsx(m,{variant:"success",onClick:z,disabled:p,style:{minWidth:"120px"},children:p?e.jsxs(e.Fragment,{children:[e.jsx(j,{as:"span",animation:"border",size:"sm",role:"status","aria-hidden":"true",className:"me-2"}),"Memproses..."]}):"Ya, Setujui"})]})]}),e.jsx(D,{show:x.show,title:x.title,message:x.message,type:x.type,onClose:()=>w(i=>({...i,show:!1}))}),e.jsx(G,{})]})}export{pe as default};

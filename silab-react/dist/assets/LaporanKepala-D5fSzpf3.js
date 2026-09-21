import{r as o,b5 as $,U as w,j as e,C as J,B as k}from"./index-CaIZNISw.js";import{N as E}from"./NavbarLoginKepala-L35lHQx3.js";import{F as G}from"./FooterSetelahLogin-CwXkxCYG.js";import{a as y}from"./index-B9ygI19o.js";import{g as O}from"./apiConfig-C4YYeh9X.js";import{C as F}from"./Card-DBdnq1X7.js";import{R as W}from"./Row-CrQ8ZgGk.js";import{C as c}from"./Col-BhJnHBef.js";import{F as r}from"./Form-CDOU6Buo.js";import{m as K}from"./proxy-Zkw_X7q2.js";import{I as L}from"./InputGroup-HKW8SpXj.js";import{S as I}from"./search-BwOqjGjU.js";import{T as H}from"./Table-Wd0Xy1yB.js";import"./index-DAOyaS4S.js";import"./ConfirmModal-D_daSTw7.js";import"./InputGroupContext-BWpzRyd4.js";import"./ElementChildren-BvWeNFQg.js";import"./createLucideIcon-gH3xQe6x.js";const ce=()=>{o.useEffect(()=>{document.title="SILAB-NTDK - Laporan Kepala"},[]);const[v,m]=o.useState([]),[d,u]=o.useState(!1),[N,h]=o.useState(!1),[b,_]=o.useState(""),[x,A]=o.useState(""),[f,R]=o.useState(""),[g,T]=o.useState("");o.useEffect(()=>{S()},[]);const j=O(),S=async()=>{if(u(!0),!$()){m([]),h(!0),u(!1);return}try{const a=new URL(`${j}/koordinator-report-debug`);x&&a.searchParams.append("jenis_analisis",x),f&&a.searchParams.append("bulan",f),g&&a.searchParams.append("tahun",g);const s=await y.get(a.toString(),{headers:w()});let n=[];s&&s.data&&s.data.data&&(s.data.data.bookings&&Array.isArray(s.data.data.bookings)&&s.data.data.bookings.length?n=s.data.data.bookings:s.data.data.tableData&&Array.isArray(s.data.data.tableData)&&(n=s.data.data.tableData));const l=n.map(t=>({id:t.id||t.booking_id||t.bookingId||null,kode:t.kode||t.kode_batch||(t.id?String(t.id):"-"),klien:t.user&&(t.user.full_name||t.user.name)||t.user_name||t.klien||"-",jenis:t.jenis_analisis||t.jenis||t.jenisAnalisis||"-",status:t.status||"-",pdf_path:t.pdf_path||t.pdfPath||null,pdf_url:t.pdf_url||t.pdfUrl||null}));m(l),h(!1)}catch(a){console.error("Gagal fetch laporan:",a),a&&a.response&&a.response.status===401&&h(!0),m([])}u(!1)},U=async a=>{if(a)try{let s;const n=`Hasil_Analisis_${a.kode||a.kode_batch||a.id||"hasil"}.pdf`;if(a.pdf_url){const p=await fetch(a.pdf_url);if(!p.ok)throw new Error("Network error");s=await p.blob()}else if(a.id){const p=`${j}/bookings/${a.id}/pdf`,C=await y.get(p,{headers:w(),responseType:"blob"}),z=C.headers["content-type"]||"application/pdf";s=new Blob([C.data],{type:z})}else{alert("File hasil analisis tidak tersedia untuk item ini.");return}const l=window.URL.createObjectURL(s),t=document.createElement("a");t.style.display="none",t.href=l,t.download=n,document.body.appendChild(t),t.click(),t.remove(),window.URL.revokeObjectURL(l)}catch(s){console.error("Download gagal:",s),alert("Gagal mengunduh file. Periksa koneksi atau login Anda.")}},B=async a=>{if(a)try{if(a.pdf_url){window.open(a.pdf_url,"_blank");return}if(!a.id){alert("File preview tidak tersedia untuk item ini.");return}const s=`${j}/bookings/${a.id}/pdf`,n=await y.get(s,{headers:w(),responseType:"blob"}),l=new Blob([n.data],{type:n.headers["content-type"]||"application/pdf"}),t=window.URL.createObjectURL(l);window.open(t,"_blank"),setTimeout(()=>window.URL.revokeObjectURL(t),60*1e3)}catch(s){console.error("Preview gagal:",s),alert("Gagal menampilkan preview. Periksa koneksi atau login Anda.")}},i={btnCokelat:"#9E8379",btnAbu:"#7F8C8D",background:"#F7F5F4"},P=[{value:"1",label:"Januari"},{value:"2",label:"Februari"},{value:"3",label:"Maret"},{value:"4",label:"April"},{value:"5",label:"Mei"},{value:"6",label:"Juni"},{value:"7",label:"Juli"},{value:"8",label:"Agustus"},{value:"9",label:"September"},{value:"10",label:"Oktober"},{value:"11",label:"November"},{value:"12",label:"Desember"}],D=()=>{const a=new Date().getFullYear(),s=[];for(let n=a;n>=a-5;n--)s.push(n);return s};return e.jsxs(E,{children:[e.jsxs("div",{style:{backgroundColor:i.background,minHeight:"100vh",padding:"20px 0"},children:[e.jsxs(J,{className:"px-2 px-md-3",children:[e.jsx(F,{className:"border-0 shadow-sm p-2 p-md-4 mb-3 mb-md-4",style:{borderRadius:"20px"},children:e.jsxs(W,{className:"align-items-end g-3",children:[e.jsx(c,{md:3,children:e.jsxs(r.Group,{children:[e.jsx(r.Label,{className:"small fw-bold text-muted",children:"Jenis Analisis:"}),e.jsxs(r.Select,{value:x,onChange:a=>A(a.target.value),className:"custom-input shadow-sm",children:[e.jsx("option",{value:"",children:"Semua"}),e.jsx("option",{value:"hematologi",children:"Hematologi"}),e.jsx("option",{value:"metabolit",children:"Metabolit"})]})]})}),e.jsx(c,{md:3,children:e.jsxs(r.Group,{children:[e.jsx(r.Label,{className:"small fw-bold text-muted",children:"Bulan:"}),e.jsxs(r.Select,{value:f,onChange:a=>R(a.target.value),className:"custom-input shadow-sm",children:[e.jsx("option",{value:"",children:"Semua Bulan"}),P.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))]})]})}),e.jsx(c,{md:3,children:e.jsxs(r.Group,{children:[e.jsx(r.Label,{className:"small fw-bold text-muted",children:"Tahun:"}),e.jsxs(r.Select,{value:g,onChange:a=>T(a.target.value),className:"custom-input shadow-sm",children:[e.jsx("option",{value:"",children:"Semua Tahun"}),D().map(a=>e.jsx("option",{value:a,children:a},a))]})]})}),e.jsx(c,{md:3,children:e.jsx(k,{className:"w-100 btn-tampilkan",onClick:S,children:"Tampilkan"})})]})}),e.jsxs(K.div,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.2},children:[e.jsx("div",{className:"mb-3 d-flex justify-content-start",children:e.jsxs(L,{className:"rounded-pill border px-2 bg-white shadow-sm",style:{maxWidth:"400px"},children:[e.jsx(r.Control,{value:b,onChange:a=>_(a.target.value),placeholder:"Cari berdasarkan kode, klien, atau jenis...",className:"bg-transparent border-0 py-2 shadow-none small"}),e.jsx(L.Text,{className:"bg-transparent border-0 text-muted",children:e.jsx(I,{size:16})})]})}),e.jsx(F,{className:"border-0 shadow-sm overflow-hidden",style:{borderRadius:"20px"},children:e.jsx("div",{className:"table-responsive",style:{overflowX:"auto"},children:e.jsxs(H,{hover:!0,className:"mb-0 custom-table-style text-center align-middle",style:{minWidth:"700px",width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"18%",minWidth:"120px"},children:"Kode Sampel"}),e.jsx("th",{style:{width:"20%",minWidth:"130px"},children:"Klien"}),e.jsx("th",{style:{width:"22%",minWidth:"140px"},children:"Jenis Analisis"}),e.jsx("th",{style:{width:"18%",minWidth:"110px"},children:"Status"}),e.jsx("th",{style:{width:"22%",minWidth:"180px"},children:"Aksi"})]})}),e.jsxs("tbody",{children:[d&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"py-3 py-md-4 text-center",children:"Memuat data..."})}),!d&&N&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"py-3 py-md-4 text-center text-muted",children:"Silakan login untuk melihat laporan."})}),!d&&!N&&v.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"py-3 py-md-4 text-center text-muted",children:"Tidak ada data laporan"})}),!d&&v.filter(a=>String(a.status).toLowerCase()==="selesai").filter(a=>{if(!b)return!0;const s=b.toLowerCase();return String(a.kode||"").toLowerCase().includes(s)||String(a.klien||"").toLowerCase().includes(s)||String(a.jenis||"").toLowerCase().includes(s)}).map((a,s)=>e.jsxs("tr",{children:[e.jsx("td",{className:"py-2 py-md-4 border-end",style:{wordBreak:"break-word"},children:a.kode}),e.jsx("td",{className:"py-2 py-md-4 border-end",style:{wordBreak:"break-word"},children:a.klien}),e.jsx("td",{className:"py-2 py-md-4 border-end",style:{wordBreak:"break-word"},children:a.jenis}),e.jsx("td",{className:"py-2 py-md-4 border-end",style:{fontSize:"0.85rem"},children:a.status}),e.jsx("td",{className:"py-2 py-md-4",children:e.jsxs("div",{className:"d-flex justify-content-center gap-1 gap-md-2 flex-wrap",children:[e.jsxs(k,{className:"btn-action-unduh btn-responsive",onClick:()=>U(a),disabled:!a.id&&!a.pdf_url,size:"sm",children:[e.jsx("span",{className:"d-none d-md-inline",children:"Unduh"}),e.jsx("span",{className:"d-md-none",children:"📄"})]}),e.jsxs(k,{className:"btn-action-arsip btn-responsive",onClick:()=>B(a),disabled:!a.id&&!a.pdf_url,size:"sm",children:[e.jsx("span",{className:"d-none d-md-inline",children:"Preview"}),e.jsx("span",{className:"d-md-none",children:"👁"})]})]})})]},s))]})]})})})]})]}),e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          body { font-family: 'Plus Jakarta Sans', sans-serif; }

          .custom-input {
            border-radius: 20px !important;
            padding: 0.6rem 1rem !important;
            font-size: 14px;
          }

          .icon-calendar-bg {
            background-color: ${i.btnCokelat};
            padding: 5px;
            border-radius: 8px;
            display: flex;
            align-items: center;
          }

          .btn-tampilkan {
            background-color: ${i.btnCokelat} !important;
            border: none !important;
            border-radius: 50px !important;
            padding: 10px !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }

          .custom-table-style thead th {
            font-weight: 800;
            padding: 15px 8px;
            background-color: #FFFFFF;
            border-bottom: 1px solid #F0F0F0;
            font-size: 0.9rem;
          }

          @media (min-width: 768px) {
            .custom-table-style thead th {
              padding: 20px;
              font-size: 1rem;
            }
          }

          .btn-action-unduh {
            background-color: ${i.btnCokelat} !important;
            border: none !important;
            padding: 4px 12px !important;
            border-radius: 50px !important;
            font-size: 12px !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            min-width: 60px;
          }

          .btn-action-arsip {
            background-color: ${i.btnAbu} !important;
            border: none !important;
            padding: 4px 12px !important;
            border-radius: 50px !important;
            font-size: 12px !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            min-width: 60px;
          }

          @media (min-width: 768px) {
            .btn-action-unduh, .btn-action-arsip {
              padding: 6px 25px !important;
              font-size: 14px !important;
              min-width: auto;
            }
          }

          .border-end { border-right: 1px solid #F0F0F0 !important; }
        `})]}),e.jsx(G,{})]})};export{ce as default};

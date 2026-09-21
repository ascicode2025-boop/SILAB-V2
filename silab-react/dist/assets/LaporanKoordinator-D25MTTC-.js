import{U as T,r as c,j as a,C as J,B as R}from"./index-CaIZNISw.js";import{N as X}from"./NavbarLoginKoordinator-pGHc6gak.js";import{F as q}from"./FooterSetelahLogin-CwXkxCYG.js";import{a as N}from"./index-B9ygI19o.js";import{g as E}from"./apiConfig-C4YYeh9X.js";import{m as g}from"./proxy-Zkw_X7q2.js";import{C as b}from"./Card-DBdnq1X7.js";import{F as u}from"./Form-CDOU6Buo.js";import{R as O}from"./Row-CrQ8ZgGk.js";import{C as y}from"./Col-BhJnHBef.js";import{I as z}from"./InputGroup-HKW8SpXj.js";import{c as W}from"./createLucideIcon-gH3xQe6x.js";import{S as G}from"./Spinner-MbuZ3Cq6.js";import{R as V,B as Q,T as Z,X as aa,Y as ea,a as sa,C as ta}from"./BarChart-BNikDo1U.js";import{T as L}from"./Table-Wd0Xy1yB.js";import{H as ra,B as ia}from"./hash-DmA-0OWx.js";import{U as la}from"./user-Ctb7vZv3.js";import{E as na}from"./eye-DEpsUnhC.js";import{F as oa}from"./file-text-C92lwdRj.js";import"./index-DAOyaS4S.js";import"./ConfirmModal-D_daSTw7.js";import"./InputGroupContext-BWpzRyd4.js";import"./ElementChildren-BvWeNFQg.js";/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const da=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],ca=W("funnel",da);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ma=[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]],pa=W("trending-up",ma),B=E(),ha=async(o={})=>{const m={};o.jenis_analisis&&(m.jenis_analisis=o.jenis_analisis),o.bulan&&(m.bulan=o.bulan),o.tahun&&(m.tahun=o.tahun);try{const s=`${B}/koordinator-report`;console.debug("[koordinatorReport] requesting",s,"params=",m);const p=await N.get(s,{params:m,headers:T()});if(!(p&&p.data&&(p.data.success===!1||!p.data.data)))return p.data}catch(s){console.error("[koordinatorReport] primary request failed:",s&&s.toString())}try{const s=`${B}/koordinator-report-debug`;return console.debug("[koordinatorReport] attempting debug route",s),(await N.get(s,{params:m})).data}catch(s){throw console.error("[koordinatorReport] debug route failed:",s&&s.toString()),s}},C=E(),$a=()=>{c.useEffect(()=>{document.title="SILAB-NTDK - Laporan Koordinator"},[]);const[o,m]=c.useState([]),[s,p]=c.useState([]),[$,I]=c.useState({jenisAnalisis:[],bulan:[],tahun:[]}),[j,H]=c.useState({jenis_analisis:"",bulan:"",tahun:""}),[v,M]=c.useState([]),[U,k]=c.useState(!1),[xa,_]=c.useState(null),K=[{value:"1",label:"Januari"},{value:"2",label:"Februari"},{value:"3",label:"Maret"},{value:"4",label:"April"},{value:"5",label:"Mei"},{value:"6",label:"Juni"},{value:"7",label:"Juli"},{value:"8",label:"Agustus"},{value:"9",label:"September"},{value:"10",label:"Oktober"},{value:"11",label:"November"},{value:"12",label:"Desember"}],P=()=>{const e=new Date().getFullYear(),t=[];for(let i=e;i>=e-5;i--)t.push(i);return t},l={primary:"#8D766B",background:"#F8F9FA",textDark:"#2D3436",textMuted:"#636E72"},S=async(e={})=>{var t,i,h,x;k(!0),_(null);try{const n=await ha(e);if(n.success){m(n.data.chartData||[]);let f=n.data.bookings||n.data.tableData||[];if(!f||f.length===0)try{const d=await N.get(`${C}/bookings/all`,{headers:T()});f=(((t=d==null?void 0:d.data)==null?void 0:t.data)||(d==null?void 0:d.data)||[]).map(r=>{var A,D;return{tgl:r.tanggal_kirim?new Date(r.tanggal_kirim).toLocaleDateString("id-ID"):"-",kode_batch:r.kode_batch||"-",user_name:((A=r.user)==null?void 0:A.full_name)||((D=r.user)==null?void 0:D.name)||"-",jenis_analisis:r.jenis_analisis||"-",analysis_items:Array.isArray(r.analysis_items)?r.analysis_items:[],jumlah_sampel:r.jumlah_sampel||1,total_harga:Number(r.total_harga)||Number(r.jumlah_sampel||1)*5e4,status:r.status||"-",pdf_path:r.pdf_path||null}})}catch(d){console.error(d)}p(f),I({jenisAnalisis:((i=n.data.filters)==null?void 0:i.jenisAnalisis)||[],bulan:((h=n.data.filters)==null?void 0:h.bulan)||[],tahun:(((x=n.data.filters)==null?void 0:x.tahun)||[]).slice().sort((d,F)=>F-d)}),M(n.data.reportHistory||[])}}catch{_("Gagal memuat data laporan.")}k(!1)};c.useEffect(()=>{S()},[]);const w=e=>H({...j,[e.target.name]:e.target.value}),Y=e=>{e.preventDefault(),S(j)};return a.jsxs(X,{children:[a.jsxs("div",{style:{backgroundColor:l.background,minHeight:"100vh",padding:"30px 0"},children:[a.jsxs(J,{className:"px-2 px-md-3",children:[a.jsxs(g.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},className:"mb-5",children:[a.jsxs("div",{className:"d-flex align-items-center gap-2 mb-2",children:[a.jsx("div",{style:{width:"30px",height:"3px",backgroundColor:l.primary}}),a.jsx("span",{className:"text-uppercase fw-bold",style:{color:l.primary,fontSize:"12px",letterSpacing:"1px"},children:"Coordinator Insights"})]}),a.jsx("h2",{className:"fw-bold",style:{color:l.textDark,fontSize:"2.2rem"},children:"Laporan Analisis"}),a.jsx("p",{style:{color:l.textMuted},children:"Pantau performa aktivitas laboratorium dan kelola dokumen laporan bulanan."})]}),a.jsx(g.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.1},children:a.jsx(b,{className:"border-0 shadow-sm p-4 mb-5",style:{borderRadius:"24px"},children:a.jsx(u,{onSubmit:Y,children:a.jsxs(O,{className:"g-3 align-items-end",children:[a.jsxs(y,{lg:4,children:[a.jsx(u.Label,{className:"small fw-bold text-muted text-uppercase ms-1",children:"Jenis Analisis"}),a.jsxs(z,{className:"bg-light border-0 px-2 py-1",style:{borderRadius:"12px"},children:[a.jsx(z.Text,{className:"bg-transparent border-0",children:a.jsx(ca,{size:16})}),a.jsxs(u.Select,{name:"jenis_analisis",value:j.jenis_analisis,onChange:w,className:"bg-transparent border-0 shadow-none",children:[a.jsx("option",{value:"",children:"Semua Analisis"}),$.jenisAnalisis.map((e,t)=>a.jsx("option",{value:e,children:e},t))]})]})]}),a.jsxs(y,{lg:3,children:[a.jsx(u.Label,{className:"small fw-bold text-muted text-uppercase ms-1",children:"Bulan"}),a.jsxs(u.Select,{name:"bulan",value:j.bulan,onChange:w,className:"bg-light border-0 py-2 shadow-none",style:{borderRadius:"12px"},children:[a.jsx("option",{value:"",children:"Semua Bulan"}),K.map(e=>a.jsx("option",{value:e.value,children:e.label},e.value))]})]}),a.jsxs(y,{lg:3,children:[a.jsx(u.Label,{className:"small fw-bold text-muted text-uppercase ms-1",children:"Tahun"}),a.jsxs(u.Select,{name:"tahun",value:j.tahun,onChange:w,className:"bg-light border-0 py-2 shadow-none",style:{borderRadius:"12px"},children:[a.jsx("option",{value:"",children:"Semua Tahun"}),P().map(e=>a.jsx("option",{value:e,children:e},e))]})]}),a.jsx(y,{lg:2,children:a.jsx(R,{type:"submit",className:"w-100 border-0 py-2 fw-bold",style:{backgroundColor:l.primary,borderRadius:"12px"},children:U?a.jsx(G,{size:"sm",animation:"border"}):"Tampilkan"})})]})})})}),a.jsx(g.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.2},children:a.jsxs(b,{className:"mb-5 border-0 shadow-sm overflow-hidden",style:{borderRadius:"24px"},children:[a.jsxs(b.Header,{className:"bg-white border-0 pt-4 px-4 pb-0",children:[a.jsxs("div",{className:"d-flex align-items-center gap-2 mb-1",children:[a.jsx(pa,{size:20,className:"text-primary"}),a.jsx("h5",{className:"fw-bold mb-0",children:"Statistik Aktivitas Lab"})]}),a.jsx("p",{className:"small text-muted mb-0",children:"Visualisasi jumlah pesanan per kuartal"})]}),a.jsx(b.Body,{className:"p-4",children:a.jsx("div",{style:{width:"100%",height:300},children:a.jsx(V,{children:a.jsxs(Q,{data:o,children:[a.jsx(Z,{cursor:{fill:"#f8f9fa"},contentStyle:{borderRadius:"12px",border:"none",boxShadow:"0 4px 15px rgba(0,0,0,0.1)"}}),a.jsx(aa,{dataKey:"name",axisLine:!1,tickLine:!1,tick:{fill:"#999",fontSize:12},dy:10}),a.jsx(ea,{axisLine:!1,tickLine:!1,tick:{fill:"#999",fontSize:12}}),a.jsx(sa,{dataKey:"value",radius:[10,10,0,0],barSize:45,children:o.map((e,t)=>a.jsx(ta,{fill:t===o.length-1?"#3E322E":l.primary},`cell-${t}`))})]})})})})]})}),a.jsxs(g.div,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.3},children:[a.jsxs("div",{className:"d-flex align-items-center justify-content-between mb-3 px-1",children:[a.jsx("h5",{className:"fw-bold mb-0",children:"Rincian Laporan Analisis"}),a.jsxs("span",{className:"text-muted small",children:["Total ",s.length," data ditemukan"]})]}),a.jsx(b,{className:"border-0 shadow-sm overflow-hidden mb-5",style:{borderRadius:"24px"},children:a.jsx("div",{className:"table-responsive",style:{overflowX:"auto"},children:a.jsxs(L,{hover:!0,className:"mb-0 custom-table",style:{minWidth:"900px",width:"100%"},children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{className:"ps-2 ps-md-4",style:{minWidth:"100px",width:"12%"},children:"Tanggal"}),a.jsxs("th",{style:{minWidth:"120px",width:"15%"},children:[a.jsx(ra,{size:14,className:"me-1"})," Batch"]}),a.jsxs("th",{style:{minWidth:"140px",width:"18%"},children:[a.jsx(la,{size:14,className:"me-1"})," Pemesan"]}),a.jsxs("th",{style:{minWidth:"160px",width:"25%"},children:[a.jsx(ia,{size:14,className:"me-1"})," Analisis"]}),a.jsx("th",{className:"text-end",style:{minWidth:"120px",width:"15%"},children:"Total Biaya"}),a.jsx("th",{className:"text-center",style:{minWidth:"100px",width:"10%"},children:"Status"}),a.jsx("th",{className:"text-center pe-2 pe-md-4",style:{minWidth:"100px",width:"10%"},children:"Aksi"})]})}),a.jsx("tbody",{children:s.length===0?a.jsx("tr",{children:a.jsx("td",{colSpan:7,className:"text-center py-4 py-md-5 text-muted",children:"Data tidak tersedia"})}):s.map((e,t)=>{var i,h;return a.jsxs("tr",{children:[a.jsx("td",{className:"ps-2 ps-md-4 text-muted small",children:e.tgl}),a.jsx("td",{className:"fw-bold text-dark",style:{wordBreak:"break-word"},children:e.kode_batch}),a.jsx("td",{style:{wordBreak:"break-word"},children:e.user_name}),a.jsxs("td",{children:[a.jsx("div",{className:"small fw-medium",children:e.jenis_analisis}),a.jsx("div",{className:"d-flex gap-1 mt-1 flex-wrap",children:(i=e.analysis_items)==null?void 0:i.map((x,n)=>a.jsx("span",{className:"badge-param",children:x.nama_item||x.nama},n))})]}),a.jsxs("td",{className:"text-end fw-bold",style:{color:l.primary},children:["Rp ",(h=e.total_harga)==null?void 0:h.toLocaleString("id-ID")]}),a.jsx("td",{className:"text-center",children:a.jsx("span",{className:"badge-status-finished",children:e.status})}),a.jsx("td",{className:"text-center pe-2 pe-md-4",children:e.pdf_path&&a.jsxs(R,{as:"a",target:"_blank",href:`${C.replace(/\/api$/,"")}/storage/${e.pdf_path}`,className:"btn-table-action",size:"sm",children:[a.jsx(na,{size:14}),a.jsx("span",{className:"d-none d-md-inline ms-1",children:"Preview"}),a.jsx("span",{className:"d-md-none",children:"📄"})]})})]},t)})})]})})})]}),a.jsxs(g.div,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.4},children:[a.jsx("h5",{className:"fw-bold mb-3 px-1",children:"Riwayat Dokumen Laporan Bulanan"}),a.jsx(b,{className:"border-0 shadow-sm overflow-hidden",style:{borderRadius:"24px"},children:a.jsx("div",{className:"table-responsive",style:{overflowX:"auto"},children:a.jsxs(L,{hover:!0,className:"mb-0 custom-table",style:{minWidth:"700px",width:"100%"},children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{className:"ps-2 ps-md-4",style:{minWidth:"140px",width:"25%"},children:"Bulan / Periode"}),a.jsx("th",{style:{minWidth:"180px",width:"35%"},children:"Dokumen Tersedia"}),a.jsx("th",{style:{minWidth:"120px",width:"20%"},children:"Dibuat Pada"}),a.jsx("th",{className:"text-center pe-2 pe-md-4",style:{minWidth:"100px",width:"20%"},children:"Status"})]})}),a.jsx("tbody",{children:v.length===0?a.jsx("tr",{children:a.jsx("td",{colSpan:4,className:"text-center py-4 py-md-5 text-muted",children:"Belum ada riwayat dokumen"})}):v.map((e,t)=>{var i;return a.jsxs("tr",{children:[a.jsx("td",{className:"ps-2 ps-md-4 fw-bold",style:{wordBreak:"break-word"},children:e.bulan}),a.jsx("td",{children:a.jsx("div",{className:"d-flex flex-column gap-1",children:(i=e.files)==null?void 0:i.map((h,x)=>a.jsxs("a",{href:h.url,target:"_blank",rel:"noreferrer",className:"text-primary text-decoration-none small d-flex align-items-center gap-2",children:[a.jsx(oa,{size:14})," ",h.label]},x))})}),a.jsx("td",{className:"text-muted small",children:e.tanggal_buat}),a.jsx("td",{className:"text-center pe-2 pe-md-4",children:a.jsx("span",{className:"badge-status-info",children:e.status})})]},t)})})]})})})]})]}),a.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body { font-family: 'Inter', sans-serif; }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 15px 10px;
            border-bottom: 1px solid #F1F2F6;
          }

          @media (min-width: 768px) {
            .custom-table thead th {
              padding: 20px 15px;
              font-size: 11px;
            }
          }

          .custom-table tbody td {
            padding: 12px 10px;
            vertical-align: middle;
            font-size: 14px;
            border-bottom: 1px solid #F1F2F6;
            color: #2D3436;
          }

          @media (min-width: 768px) {
            .custom-table tbody td {
              padding: 18px 15px;
            }
          }

          .badge-param {
            background-color: #F1F2F6;
            color: #636E72;
            padding: 3px 6px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 500;
          }

          @media (min-width: 768px) {
            .badge-param {
              padding: 3px 8px;
              font-size: 10px;
            }
          }

          .badge-status-finished {
            background-color: #E3F9E5;
            color: #1F922B;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: capitalize;
          }

          .badge-status-info {
            background-color: #E1F5FE;
            color: #0288D1;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
          }

          .btn-table-action {
            background-color: transparent;
            color: ${l.primary};
            border: 1px solid ${l.primary};
            border-radius: 8px;
            font-size: 12px;
            padding: 5px 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          }

          .btn-table-action:hover {
            background-color: ${l.primary};
            color: white;
          }
        `})]}),a.jsx(q,{})]})};export{$a as default};

import{r,h as k,j as i}from"./index-CqYFNuvE.js";import{N as j}from"./NavbarLoginTeknisi-C6zoOReJ.js";import{F as v}from"./FooterSetelahLogin-DuThF3V4.js";import{b as _}from"./BookingService-BarUXI9m.js";import{L as b}from"./LoadingSpinner-Cnivfqvt.js";import{T as w}from"./index-B24ntVWI.js";import{C as S}from"./TextArea-DXk1wgx5.js";import{F as z}from"./Table-avN0XXPV.js";import{E as N}from"./index-izyTvglE.js";import{T as n}from"./index-BAgaUUvj.js";import{B as A}from"./PurePanel-B8llCOnV.js";import{R as I}from"./EditOutlined-B30MjN2k.js";import"./ConfirmModal-BnH4z8Vl.js";import"./InputGroupContext-B-mH4PIZ.js";import"./index-B9ygI19o.js";import"./apiConfig-BHYt2i42.js";import"./Row-DXmN8v6s.js";import"./Col-BCtYfjE6.js";import"./render-D7llve0s.js";import"./slicedToArray-3-nhYaLK.js";import"./defineProperty-TZCcmawT.js";import"./KeyCode-_5CS0hxx.js";import"./index-Cye0urzz.js";import"./Skeleton-dnd8F2Be.js";import"./motion-lHxd50FR.js";import"./useIcons-Bu7s1dhG.js";import"./useBubbleLock-Dvovy9sl.js";const{Title:T,Text:p}=w;function si(){r.useEffect(()=>{document.title="SILAB-NTDK - Input Nilai Analisis"},[]);const[m,x]=r.useState([]),[o,d]=r.useState(!0),c=k();r.useEffect(()=>{let t=!0;const e=async()=>{if(t)try{const s=await _(),l=(s==null?void 0:s.data)||[],u=["proses","selesai_di_analisis","menunggu_verifikasi","draft","dikirim_ke_teknisi","dikirim ke teknisi"],g=l.filter(y=>u.includes((y.status||"").toLowerCase()));t&&(x(g),d(!1))}catch(s){console.error("Failed to fetch approved samples",s),t&&d(!1)}};e();const a=setInterval(()=>{t&&e()},3e4);return()=>{t=!1,clearInterval(a)}},[]);const f=async t=>{c.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${t.id}`)},h=[{title:"No",key:"index",render:(t,e,a)=>a+1,width:60,responsive:["lg"]},{title:"Kode Batch",dataIndex:"kode_batch",key:"kode_batch",width:220,render:(t,e)=>{var a,s;return i.jsxs("div",{children:[i.jsx(n,{color:"blue",style:{marginBottom:"2px",fontWeight:600,fontSize:"1rem",letterSpacing:"1px",whiteSpace:"nowrap"},children:e.kode_batch||"-"}),i.jsxs("div",{className:"d-lg-none mt-1",style:{fontSize:"11px",color:"#666"},children:[i.jsxs("div",{children:["👤 ",((a=e.user)==null?void 0:a.full_name)||((s=e.user)==null?void 0:s.name)||"-"]}),i.jsxs("div",{children:["📊 ",e.jenis_analisis]}),Array.isArray(e.analysis_items)&&e.analysis_items.length>0&&i.jsxs("div",{children:["🔬"," ",e.analysis_items.slice(0,2).map(l=>l.nama_item).join(", "),e.analysis_items.length>2&&` +${e.analysis_items.length-2} lainnya`]})]})]})}},{title:"Nama Lengkap",dataIndex:["user","full_name"],key:"client_name",width:150,responsive:["lg"],render:(t,e)=>{var a;return t||((a=e.user)==null?void 0:a.name)||"-"}},{title:"Jenis Analisis",dataIndex:"jenis_analisis",key:"jenis_analisis",width:150,responsive:["lg"]},{title:"Analisis Item",dataIndex:"analysis_items",key:"analysis_items",width:200,responsive:["lg"],render:t=>i.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px",maxHeight:"80px",overflowY:"auto"},children:Array.isArray(t)&&t.length>0?t.map(e=>i.jsx(n,{color:"blue",style:{margin:0,fontSize:"0.75rem"},children:e.nama_item},e.id)):i.jsx(p,{type:"secondary",children:"-"})})},{title:"Status",dataIndex:"status",key:"status",width:160,align:"center",render:t=>t==="menunggu_verifikasi"?i.jsx(n,{color:"orange",children:"Menunggu Verifikasi"}):t==="selesai_di_analisis"?i.jsx(n,{color:"green",children:"Selesai di Analisis"}):t==="draft"?i.jsx(n,{color:"gold",children:"Draft"}):t==="ditolak"?i.jsx(n,{color:"red",children:"Ditolak"}):t==="dikirim_ke_teknisi"||t==="dikirim ke teknisi"?i.jsx(n,{color:"blue",children:"Dikirim ke Teknisi"}):i.jsx(n,{color:"blue",children:"Proses"})},{title:"Aksi",key:"action",align:"center",width:200,render:(t,e)=>{let a="Input",s=!1;return e.status==="menunggu_verifikasi"&&(a="Edit",s=!0),e.status==="selesai_di_analisis"&&(a="Kirim ke Koordinator"),(e.status==="dikirim_ke_teknisi"||e.status==="dikirim ke teknisi")&&(a="Edit (Dikirim Kembali)",s=!1),e.status==="draft"&&(a="Lanjutkan Pengerjaan"),e.status==="ditolak"&&(a="Perbaiki Hasil (Ditolak)",s=!1),i.jsxs(A,{type:"primary",icon:i.jsx(I,{}),size:"middle",disabled:s,onClick:()=>f(e),style:{fontSize:"12px"},children:[i.jsx("span",{className:"d-none d-md-inline",children:a}),i.jsx("span",{className:"d-md-none",children:"Edit"})]})}}];return i.jsxs(j,{children:[i.jsxs("div",{style:{minHeight:"90vh",backgroundColor:"#f8f9fa",fontFamily:"Poppins, sans-serif",padding:"30px 20px"},children:[i.jsxs("div",{className:"container",style:{maxWidth:"1400px"},children:[i.jsxs("div",{className:"mb-4",children:[i.jsxs(T,{level:3,style:{marginBottom:"8px"},children:["Input Nilai Analisis ",i.jsx("span",{style:{fontSize:"16px",fontWeight:"400",color:"#8c8c8c"},children:"| Manajemen Sampel"})]}),i.jsx(p,{type:"secondary",children:"Silahkan masukkan parameter nilai untuk sampel yang telah dikonfirmasi diterima."})]}),i.jsx(S,{bordered:!1,className:"shadow-sm responsive-table-card",style:{borderRadius:"12px",overflow:"hidden"},children:o?i.jsx("div",{className:"text-center py-5",children:i.jsx(b,{spinning:o,tip:"Memuat data sampel..."})}):i.jsx(z,{dataSource:m,columns:h,rowKey:"id",pagination:{pageSize:10,showSizeChanger:!0,showTotal:t=>`Total ${t} sampel`,responsive:!0,size:"small"},locale:{emptyText:i.jsx(N,{description:"Belum ada sampel yang disetujui"})},scroll:{x:"max-content"},size:"middle"})})]}),i.jsx("style",{jsx:!0,children:`
          .d-none {
            display: none !important;
          }
          .d-md-inline {
            display: none !important;
          }
          .d-md-none {
            display: inline !important;
          }

          @media (min-width: 768px) {
            .d-md-inline {
              display: inline !important;
            }
            .d-md-none {
              display: none !important;
            }
          }

          @media (max-width: 768px) {
            .responsive-table-card .ant-table-thead > tr > th {
              font-size: 12px;
              padding: 8px 4px;
            }

            .responsive-table-card .ant-table-tbody > tr > td {
              font-size: 12px;
              padding: 8px 4px;
            }

            .ant-btn {
              font-size: 11px !important;
              padding: 4px 8px;
            }

            .ant-tag {
              font-size: 10px;
              padding: 1px 4px;
              margin: 1px;
            }
          }

          @media (max-width: 576px) {
            .responsive-table-card .ant-table-thead > tr > th {
              font-size: 11px;
              padding: 6px 2px;
            }

            .responsive-table-card .ant-table-tbody > tr > td {
              font-size: 11px;
              padding: 6px 2px;
            }

            .ant-btn {
              font-size: 10px !important;
              padding: 2px 6px;
            }
          }
        `})]}),i.jsx(v,{})]})}export{si as default};

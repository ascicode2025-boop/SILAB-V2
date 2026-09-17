import{h as P,E,r,j as a,aa as M,ab as H,I as w,ac as v,J as B,ad as N,ae as U,ag as $,ah as O,af as _,ai as J,aj as K,al as W,aR as X,aS as G}from"./index-CqYFNuvE.js";import{D as o,B as V,C as Y,g as q,a as Q,m as Z,b as aa}from"./ConfirmModal-BnH4z8Vl.js";import{a as ea}from"./apiConfig-BHYt2i42.js";function ra({children:S}){const n=P(),x=E(),[c,b]=r.useState("dashboard"),[l,m]=r.useState(!1),[i,z]=r.useState(null),[f,g]=r.useState([]),[h,u]=r.useState(0),[C,A]=r.useState(!1);r.useEffect(()=>{const e=JSON.parse(localStorage.getItem("user"));e&&z(e)},[]);const d=async()=>{try{const e=await q(1,50),s=e&&e.data&&e.data.data?e.data.data:[],t=await Q(),D=t&&t.count?t.count:0;g(s||[]),u(D||0)}catch(e){console.error("Error fetching notifications:",e)}};r.useEffect(()=>{d();const e=setInterval(d,3e4);return()=>clearInterval(e)},[]);const F=async e=>{try{await aa(e.id),g(s=>s.map(t=>t.id===e.id?{...t,is_read:!0}:t)),u(s=>Math.max(0,s-1)),d().catch(s=>console.error("Background fetch error:",s)),e.booking_id&&n.push("/teknisi/dashboard/verifikasiSampel")}catch(s){console.error("Error marking notification as read:",s)}},L=async()=>{try{await Z(),d()}catch(e){console.error("Error marking all as read:",e)}},y=[{title:"Analisis Sampel",items:[{key:"dashboard",label:"Dasbor",icon:a.jsx(U,{})},{key:"aturTanggalTeknisi",label:"Atur Kuota Harian",icon:a.jsx($,{})},{key:"jadwalSampel",label:"Jadwal Penerimaan Sampel",icon:a.jsx(O,{})},{key:"verifikasiSampel",label:"Verifikasi & Update Status Sampel",icon:a.jsx(_,{})},{key:"inputNilaiAnalisis",label:"Input Hasil Analisis & Rumus Otomatis",icon:a.jsx(J,{})},{key:"generatePdfAnalysis",label:"Generate Laporan Hasil Analisis (PDF)",icon:a.jsx(K,{})},{key:"riwayat",label:"Riwayat Analisis",icon:a.jsx(W,{})}]},{title:"Peminjaman Alat",items:[{key:"inventarisAlat",label:"Inventaris Alat",icon:a.jsx(X,{})},{key:"pengelolaanPeminjaman",label:"Pengelolaan Peminjaman",icon:a.jsx(G,{})}]}],k=y.flatMap(e=>e.items),j=i!=null&&i.avatar?i.avatar.startsWith("http")||i.avatar.startsWith("blob")?i.avatar:`${ea()}/storage/${i.avatar}`:null;r.useEffect(()=>{const e=x.pathname.replace("/teknisi/dashboard/",""),s=k.find(t=>e.startsWith(t.key));s&&b(s.key)},[x.pathname]);const I=(()=>{var e;return((e=k.find(s=>s.key===c))==null?void 0:e.label)||"Dasbor"})(),R=()=>{localStorage.removeItem("user"),localStorage.removeItem("token"),n.push("/LandingPage")},[T,p]=r.useState(!1);return a.jsxs("div",{className:"dashboard-layout",style:{fontFamily:"Poppins, sans-serif"},children:[a.jsxs("header",{className:"dashboard-header d-flex justify-content-between align-items-center px-4 py-2 shadow-sm bg-white border-bottom sticky-top",children:[a.jsxs("div",{className:"d-flex align-items-center",children:[a.jsx("button",{className:"btn btn-light border-0 me-3 d-lg-none rounded-circle",onClick:()=>m(!l),"aria-label":"Toggle sidebar",children:l?a.jsx(M,{size:20,className:"text-secondary"}):a.jsx(H,{size:20,className:"text-secondary"})}),a.jsxs("div",{className:"d-flex align-items-center gap-3",children:[a.jsx(w,{src:"/asset/gambarLogo.png",alt:"IPB Logo",className:"navbar-logo",style:{width:"120px",height:"auto"}}),a.jsx("div",{className:"vr d-none d-md-block mx-2 text-muted opacity-25",style:{height:"30px"}}),a.jsxs("div",{className:"d-none d-md-flex flex-column justify-content-center",children:[a.jsx("span",{className:"fw-bold text-dark mb-0",style:{fontSize:"0.85rem",lineHeight:"1.2"},children:"Sistem Informasi Laboratorium"}),a.jsx("span",{className:"text-muted",style:{fontSize:"0.75rem"},children:"Nutrisi Ternak Daging Dan Kerja"})]})]})]}),a.jsxs("div",{className:"d-flex align-items-center gap-2",children:[a.jsxs(o,{show:C,onToggle:e=>A(e),align:"end",children:[a.jsxs(o.Toggle,{variant:"light",className:"border-0 bg-transparent position-relative p-2 rounded-circle",style:{width:"40px",height:"40px"},children:[a.jsx(v,{size:18,className:"text-secondary"}),h>0&&a.jsx(V,{bg:"danger",pill:!0,className:"position-absolute border border-white",style:{top:"4px",right:"4px",fontSize:"0.6rem",padding:"3px 5px"},children:h})]}),a.jsxs(o.Menu,{className:"shadow-lg border-0 mt-2",style:{width:"320px",borderRadius:"12px",overflow:"hidden"},children:[a.jsxs("div",{className:"d-flex justify-content-between align-items-center px-3 py-3 bg-light",children:[a.jsx("h6",{className:"mb-0 fw-bold",children:"Notifikasi"}),h>0&&a.jsx("button",{className:"btn btn-sm btn-link text-decoration-none p-0 fw-semibold",onClick:L,children:"Tandai Semua"})]}),a.jsx("div",{style:{maxHeight:"350px",overflowY:"auto"},children:f.length===0?a.jsxs("div",{className:"text-center text-muted py-5",children:[a.jsx(v,{size:30,className:"mb-2 opacity-25"}),a.jsx("p",{className:"small mb-0",children:"Tidak ada notifikasi baru"})]}):f.map(e=>a.jsx(o.Item,{onClick:()=>F(e),className:"py-3 px-3 border-bottom",style:{whiteSpace:"normal",backgroundColor:e.is_read?"#ffffff":"#f0f7ff"},children:a.jsxs("div",{className:"d-flex flex-column gap-1",children:[a.jsx("div",{className:`small fw-bold ${e.is_read?"text-secondary":"text-dark"}`,children:e.title}),a.jsx("div",{className:"text-muted",style:{fontSize:"0.8rem",lineHeight:"1.4"},children:e.message}),a.jsx("div",{className:"text-uppercase fw-medium",style:{fontSize:"0.65rem",color:"#adb5bd"},children:new Date(e.created_at).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})})]})},e.id))})]})]}),a.jsxs(o,{align:"end",children:[a.jsxs(o.Toggle,{variant:"light",className:"d-flex align-items-center border-0 bg-light rounded-pill px-2 px-md-3 py-1 gap-2",style:{transition:"0.3s"},children:[j?a.jsx(w,{src:j,roundedCircle:!0,className:"navbar-avatar",width:28,height:28,style:{width:"28px",height:"28px",objectFit:"cover",flexShrink:0}}):a.jsx(B,{size:24,className:"text-primary flex-shrink-0"}),a.jsx("span",{className:"fw-semibold d-none d-md-inline",style:{fontSize:"0.85rem"},children:(i==null?void 0:i.name)||"User"})]}),a.jsxs(o.Menu,{className:"shadow-lg border-0 mt-2",style:{borderRadius:"10px"},children:[a.jsxs(o.Item,{className:"py-2",onClick:()=>n.push("/teknisi/dashboard/profile"),children:[a.jsx("i",{className:"bi bi-person me-2"})," Profil Akun"]}),a.jsx("hr",{className:"dropdown-divider opacity-50"}),a.jsxs(o.Item,{className:"py-2 text-danger",onClick:()=>p(!0),children:[a.jsx("i",{className:"bi bi-box-arrow-right me-2"})," Logout"]})]})]})]})]}),a.jsx("aside",{className:`dashboard-sidebar bg-white px-2 py-3 shadow-sm ${l?"open":""}`,children:a.jsx(N,{className:"flex-column",children:y.map((e,s)=>a.jsxs("div",{className:s>0?"mt-3":"",children:[a.jsx("div",{className:"sidebar-section-title px-3 py-1 text-muted fw-semibold",style:{fontSize:"0.78rem",color:"#6c757d"},children:e.title}),e.items.map(t=>a.jsxs(N.Link,{onClick:()=>{b(t.key),t.key==="riwayat"?n.push("/teknisi/dashboard/riwayat"):n.push(`/teknisi/dashboard/${t.key}`),m(!1)},className:`d-flex align-items-center mb-1 py-2 px-3 rounded ${c===t.key?"active":""}`,style:{color:c===t.key?"#111":"#333",fontSize:"0.875rem",transition:"background 0.2s, color 0.2s",cursor:"pointer"},children:[a.jsx("span",{className:"me-3 d-flex align-items-center",style:{fontSize:"1.05rem"},children:t.icon}),a.jsx("span",{children:t.label})]},t.key))]},e.title))})}),l&&a.jsx("div",{className:"sidebar-overlay",onClick:()=>m(!1)}),a.jsxs("main",{className:"dashboard-content",children:[a.jsx("div",{className:"page-title-bar",children:a.jsx("h5",{className:"m-0 px-4 py-2",children:I})}),a.jsx("div",{className:"dashboard-inner",children:S})]}),a.jsx(Y,{show:T,title:"Konfirmasi Logout",message:"Anda yakin ingin keluar dari akun?",onConfirm:()=>{R(),p(!1)},onCancel:()=>p(!1)}),a.jsx("style",{children:`
        .dashboard-layout { display: flex; min-height: 100vh; flex-direction: column; }
        .dashboard-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; z-index: 1060; background: #fff; display: flex; align-items: center; }
        .dashboard-sidebar { width: 250px; position: fixed; top: 70px; left: 0; height: calc(100vh - 70px); overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 1055; border-right: 1px solid #e5e5e5; background: #fff; }
        .dashboard-sidebar.open { transform: translateX(0); }
        .dashboard-sidebar .nav-link { color: #333; border-radius: 4px; }
        .dashboard-sidebar .nav-link:hover { background-color: #f2f2f2; }
        .dashboard-sidebar .nav-link.active { background-color: #e0e0e0; font-weight: 600; color: #111; }
        .sidebar-section-title { font-family: Poppins, sans-serif; font-weight: 600; }
        .dashboard-content { flex: 1; background-color: #fafafa; min-height: calc(100vh - 70px); margin-top: 70px; margin-left: 0; padding: 0 !important; transition: margin-left 0.3s ease; }
        .dashboard-inner { padding: 0 !important; margin: 0 !important; }
        .page-title-bar { background-color: #a6867b; color: #fff; font-weight: 500; font-size: 1.25rem; letter-spacing: 0.5px; box-shadow: 0 -4px 8px rgba(0,0,0,0.25) inset; border-bottom-left-radius: 30px; border-bottom-right-radius:30px; }
        .sidebar-overlay { position: fixed; top: 70px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1050; }
        .subtitle-text { font-size: 0.8rem; white-space: normal; }
        .modal { z-index: 1070 !important; }
        .modal-backdrop { z-index: 1065 !important; }
        @keyframes bellRing {
            0% { transform: rotate(0); }
            15% { transform: rotate(10deg); }
            30% { transform: rotate(-10deg); }
            45% { transform: rotate(6deg); }
            60% { transform: rotate(-6deg); }
            75% { transform: rotate(3deg); }
            100% { transform: rotate(0); }
          }

          .bell-animate {
            animation: bellRing 1.2s ease-in-out infinite;
            transform-origin: top center;
          }
            
        @media (min-width: 992px) {
          .dashboard-sidebar { transform: translateX(0); }
          .dashboard-content { margin-left: 250px; margin-top: 70px; }
        }

        .dashboard-header .navbar-avatar {
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          min-height: 28px !important;
          max-width: 28px !important;
          max-height: 28px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          flex-shrink: 0 !important;
        }

        @media (max-width: 991.98px) {
          .dashboard-sidebar { padding-top: 1rem; width: 75%; max-width: 260px; box-shadow: 2px 0 8px rgba(0,0,0,0.15); }
          .dashboard-header .navbar-logo { width: 100px; height: auto; }
          .dashboard-header .subtitle-text { font-size: 0.4rem !important; white-space: nowrap !important; text-overflow: ellipsis; max-width: 180px; }
          .dashboard-sidebar .nav-link { font-size: 0.9rem; }
        }

        @media (max-width: 576px) {
          .dashboard-header .navbar-logo { width: 85px; height: auto; }
          .dashboard-header { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
        }
      `})]})}export{ra as N};

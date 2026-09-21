import{r as i,c as ke,l as Ge,E as He,h as Ue,j as l}from"./index-CaIZNISw.js";import{E as Xe,a as Ee}from"./jspdf.plugin.autotable-DqDgKpsX.js";import{N as Ve}from"./NavbarLoginTeknisi-BKy1pQe8.js";import{F as Ye}from"./FooterSetelahLogin-CwXkxCYG.js";import{f as Je}from"./pdfHelpers-DsnQpvSX.js";import{L as qe}from"./LoadingSpinner-BH2wnucV.js";import{b as _e,i as Qe}from"./BookingService-CXKogaHN.js";import{a as Ze,s as Q}from"./index-BImrRw9v.js";import{F as et}from"./Table-_QbBes97.js";import{f as tt,o as Ne,R as nt,B as ce}from"./PurePanel-CLnrfGH9.js";import{I as Be,aQ as je,u as We,c as Z,g as st,m as at,r as it,ai as ot,F as rt,b as lt,ag as ct}from"./render-CHXtws0v.js";import{R as dt}from"./EditOutlined-syweK-dR.js";import{R as mt}from"./CheckCircleOutlined-DypROjN0.js";import{t as pt}from"./index-Bh1jDRiu.js";import{c as gt,T as Ce}from"./index-eJdr0sOI.js";import{M as ut}from"./index-lVql701E.js";import{R as ft}from"./EyeOutlined-EDOUEnqu.js";import"./slicedToArray-3-nhYaLK.js";import"./ConfirmModal-D_daSTw7.js";import"./InputGroupContext-BWpzRyd4.js";import"./index-B9ygI19o.js";import"./apiConfig-C4YYeh9X.js";import"./Row-CrQ8ZgGk.js";import"./Col-BhJnHBef.js";import"./KeyCode-_5CS0hxx.js";import"./index-BKTfwYq-.js";import"./defineProperty-TZCcmawT.js";import"./motion-DMlib3MP.js";import"./useIcons-BoNg3esw.js";import"./useBubbleLock-uganp6Dc.js";import"./Skeleton-Dietr7L6.js";import"./index-VYwGnh4Q.js";var ht={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"}}]},name:"download",theme:"outlined"};function Ae(){return Ae=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var a in s)Object.prototype.hasOwnProperty.call(s,a)&&(e[a]=s[a])}return e},Ae.apply(this,arguments)}const yt=(e,t)=>i.createElement(Be,Ae({},e,{ref:t,icon:ht})),bt=i.forwardRef(yt);var xt={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"defs",attrs:{},children:[{tag:"style",attrs:{}}]},{tag:"path",attrs:{d:"M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z"}}]},name:"send",theme:"outlined"};function Pe(){return Pe=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var a in s)Object.prototype.hasOwnProperty.call(s,a)&&(e[a]=s[a])}return e},Pe.apply(this,arguments)}const kt=(e,t)=>i.createElement(Be,Pe({},e,{ref:t,icon:xt})),St=i.forwardRef(kt),vt={percent:0,prefixCls:"rc-progress",strokeColor:"#2db7f5",strokeLinecap:"round",strokeWidth:1,railColor:"#D9D9D9",railWidth:1,gapPosition:"bottom",loading:!1},wt=()=>{const e=i.useRef([]),t=i.useRef(null);return i.useEffect(()=>{const s=Date.now();let a=!1;e.current.forEach(c=>{if(!c)return;a=!0;const f=c.style;f.transitionDuration=".3s, .3s, .3s, .06s",t.current&&s-t.current<100&&(f.transitionDuration="0s, 0s")}),a&&(t.current=Date.now())}),e.current},Ie=({bg:e,children:t})=>i.createElement("div",{style:{width:"100%",height:"100%",background:e}},t);function Te(e,t){return Object.keys(e).map(s=>{const a=parseFloat(s),c=`${Math.floor(a*t)}%`;return`${e[s]} ${c}`})}const Ct=i.forwardRef((e,t)=>{const{prefixCls:s,color:a,gradientId:c,radius:f,className:k,style:x,ptg:d,strokeLinecap:r,strokeWidth:N,size:w,gapDegree:h}=e,P=a&&typeof a=="object",I=P?"#FFF":void 0,T=w/2,D=i.createElement("circle",{className:ke(`${s}-circle-path`,k),r:f,cx:T,cy:T,stroke:I,strokeLinecap:r,strokeWidth:N,opacity:d===0?0:1,style:x,ref:t});if(!P)return D;const B=`${c}-conic`,S=h?`${180+h/2}deg`:"0deg",E=Te(a,(360-h)/360),v=Te(a,1),C=`conic-gradient(from ${S}, ${E.join(", ")})`,j=`linear-gradient(to ${h?"bottom":"top"}, ${v.join(", ")})`;return i.createElement(i.Fragment,null,i.createElement("mask",{id:B},D),i.createElement("foreignObject",{x:0,y:0,width:w,height:w,mask:`url(#${B})`},i.createElement(Ie,{bg:j},i.createElement(Ie,{bg:C}))))}),ge=100,$e=(e,t,s,a,c,f,k,x,d,r,N=0)=>{const w=s/100*360*((360-f)/360),h=f===0?0:{bottom:0,top:180,left:90,right:-90}[k];let P=(100-a)/100*t;d==="round"&&a!==100&&(P+=r/2,P>=t&&(P=t-.01));const I=ge/2;return{stroke:typeof x=="string"?x:void 0,strokeDasharray:`${t}px ${e}`,strokeDashoffset:P+N,transform:`rotate(${c+w+h}deg)`,transformOrigin:`${I}px ${I}px`,transition:"stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s",fillOpacity:0}},$t=(({id:e,loading:t})=>{if(!t)return{indeterminateStyleProps:{},indeterminateStyleAnimation:null};const s=`${e}-indeterminate-animate`;return{indeterminateStyleProps:{transform:"rotate(0deg)",animation:`${s} 1s linear infinite`},indeterminateStyleAnimation:Ge.createElement("style",null,`@keyframes ${s} {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`)}});function Le(){return Le=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var a in s)Object.prototype.hasOwnProperty.call(s,a)&&(e[a]=s[a])}return e},Le.apply(this,arguments)}function Re(e){const t=e??[];return Array.isArray(t)?t:[t]}const Nt=e=>{const{id:t,prefixCls:s,classNames:a={},styles:c={},steps:f,strokeWidth:k,railWidth:x,gapDegree:d=0,gapPosition:r,railColor:N,strokeLinecap:w,style:h,className:P,strokeColor:I,percent:T,loading:D,...B}={...vt,...e},S=ge/2,E=tt(t),v=`${E}-gradient`,C=S-k/2,j=Math.PI*2*C,L=d>0?90+d/2:-90,_=j*((360-d)/360),{count:W,gap:K}=typeof f=="object"?f:{count:f,gap:2},X=Re(T),z=Re(I),V=z.find(R=>R&&typeof R=="object"),b=V&&typeof V=="object"?"butt":w,{indeterminateStyleProps:ee,indeterminateStyleAnimation:A}=$t({id:E,loading:D}),oe=$e(j,_,0,100,L,d,r,N,b,k),Y=wt(),te=()=>{let R=0;return X.map((H,M)=>{const J=z[M]||z[z.length-1],n=$e(j,_,R,H,L,d,r,J,b,k);return R+=H,i.createElement(Ct,{key:M,color:J,ptg:H,radius:C,prefixCls:s,gradientId:v,className:a.track,style:{...n,...ee,...c.track},strokeLinecap:b,strokeWidth:k,gapDegree:d,ref:o=>{Y[M]=o},size:ge})}).reverse()},q=()=>{const R=Math.round(W*(X[0]/100)),H=100/W;let M=0;return new Array(W).fill(null).map((J,n)=>{const o=n<=R-1?z[0]:N,p=o&&typeof o=="object"?`url(#${v})`:void 0,m=$e(j,_,M,H,L,d,r,o,"butt",k,K);return M+=(_-m.strokeDashoffset+K)*100/_,i.createElement("circle",{key:n,className:ke(`${s}-circle-path`,a.track),r:C,cx:S,cy:S,stroke:p,strokeWidth:k,opacity:1,style:{...m,...c.track},ref:$=>{Y[n]=$}})})};return i.createElement("svg",Le({className:ke(`${s}-circle`,a.root,P),viewBox:`0 0 ${ge} ${ge}`,style:{...c.root,...h},id:t,role:"presentation"},B),!W&&i.createElement("circle",{className:ke(`${s}-circle-rail`,a.rail),r:C,cx:S,cy:S,stroke:N,strokeLinecap:b,strokeWidth:x||k,style:{...oe,...c.rail}}),W?q():te(),A)};function ie(e){return!e||e<0?0:e>100?100:e}function Se({success:e}){let t;return e&&"percent"in e&&(t=e.percent),t}const jt=({percent:e,success:t})=>{const s=ie(Se({success:t}));return[s,ie(ie(e)-s)]},At=({success:e={},strokeColor:t})=>{const{strokeColor:s}=e;return[s||je.green,t||null]},ve=(e,t,s)=>{let a=-1,c=-1;if(t==="step"){const f=s.steps,k=s.strokeWidth;typeof e=="string"||typeof e>"u"?(a=e==="small"?2:14,c=k??8):typeof e=="number"?[a,c]=[e,e]:[a=14,c=8]=Array.isArray(e)?e:[e.width,e.height],a*=f}else if(t==="line"){const f=s==null?void 0:s.strokeWidth;typeof e=="string"||typeof e>"u"?c=f||(e==="small"?6:8):typeof e=="number"?[a,c]=[e,e]:[a=-1,c=8]=Array.isArray(e)?e:[e.width,e.height]}else(t==="circle"||t==="dashboard")&&(typeof e=="string"||typeof e>"u"?[a,c]=e==="small"?[60,60]:[120,120]:typeof e=="number"?[a,c]=[e,e]:Array.isArray(e)&&(a=e[0]??e[1]??120,c=e[0]??e[1]??120));return[a,c]},Pt=3,Lt=e=>Pt/e*100,Fe=["root","body","indicator"],Dt=e=>{const{prefixCls:t,classNames:s,styles:a,railColor:c,trailColor:f,strokeLinecap:k="round",gapPosition:x,gapPlacement:d,gapDegree:r,width:N=120,type:w,children:h,success:P,size:I=N,steps:T}=e,{direction:D}=We("progress"),B=c??f,[S,E]=ve(I,"circle");let{strokeWidth:v}=e;v===void 0&&(v=Math.max(Lt(S),6));const C={width:S,height:E,fontSize:S*.15+6},j=i.useMemo(()=>{if(r||r===0)return r;if(w==="dashboard")return 75},[r,w]),L=jt(e),_=i.useMemo(()=>{const b=(d??x)||w==="dashboard"&&"bottom"||void 0,ee=D==="rtl";switch(b){case"start":return ee?"right":"left";case"end":return ee?"left":"right";default:return b}},[D,d,x,w]),W=Object.prototype.toString.call(e.strokeColor)==="[object Object]",K=At({success:P,strokeColor:e.strokeColor}),X=Z(`${t}-body`,{[`${t}-circle-gradient`]:W},s.body),z=i.createElement(Nt,{steps:T,percent:T?L[1]:L,strokeWidth:v,railWidth:v,strokeColor:T?K[1]:K,strokeLinecap:k,railColor:B,prefixCls:t,gapDegree:j,gapPosition:_,classNames:Ne(s,Fe),styles:Ne(a,Fe)}),V=S<=20,se=i.createElement("div",{className:X,style:{...C,...a.body}},z,!V&&h);return V?i.createElement(gt,{title:h},se):se},De="--progress-line-stroke-color",Et=e=>{const t="-100%";return new ot("antProgressLTRActive",{"0%":{transform:`translateX(${t}) scaleX(0)`,opacity:.1},"20%":{transform:`translateX(${t}) scaleX(0)`,opacity:.5},to:{transform:"translateX(0) scaleX(1)",opacity:0}})},_t=e=>{const{componentCls:t,iconCls:s}=e;return{[t]:{...it(e),display:"inline-flex","&-rtl":{direction:"rtl"},[`${t}-indicator`]:{color:e.colorText,lineHeight:1,whiteSpace:"nowrap",verticalAlign:"middle",wordBreak:"normal",[s]:{fontSize:e.fontSize}},[`&${t}-status-exception`]:{[`${t}-indicator`]:{color:e.colorError}},[`&${t}-status-success`]:{[`${t}-indicator`]:{color:e.colorSuccess}}}}},It=e=>{const{componentCls:t}=e;return{[`${t}-line`]:{position:"relative",width:"100%",fontSize:e.fontSize,[`${t}-body`]:{display:"inline-flex",alignItems:"center",width:"100%",gap:e.marginXS},[`${t}-rail`]:{flex:"auto",background:e.remainingColor,borderRadius:e.lineBorderRadius,position:"relative",width:"100%"},[`&${t}-status-active`]:{[`${t}-track:after`]:{content:'""',position:"absolute",inset:0,backgroundColor:e.colorBgContainer,borderRadius:"inherit",opacity:0,animationName:Et(),animationDuration:e.progressActiveMotionDuration,animationTimingFunction:e.motionEaseOutQuint,animationIterationCount:"infinite"}},[`${t}-track`]:{position:"absolute",insetInlineStart:0,insetBlock:0,borderRadius:"inherit",background:e.defaultColor,transition:`all ${e.motionDurationSlow} ${e.motionEaseInOutCirc}`,minWidth:"max-content",display:"flex",alignItems:"center","&-success":{background:e.colorSuccess}},[`&${t}-status-exception`]:{[`${t}-track`]:{background:e.colorError}},[`&${t}-status-success`]:{[`${t}-track`]:{background:e.colorSuccess}},[`${t}-indicator-outer`]:{[`&${t}-indicator-start`]:{order:-1}},[`${t}-body-layout-bottom`]:{flexDirection:"column",alignItems:"center",gap:e.marginXXS},[`${t}-indicator${t}-indicator-inner`]:{color:e.colorWhite,paddingInline:e.paddingXXS,width:"100%",display:"flex",justifyContent:"center",[`&${t}-indicator-end`]:{justifyContent:"end"},[`&${t}-indicator-start`]:{justifyContent:"start"},[`&${t}-indicator-bright`]:{color:"rgba(0, 0, 0, 0.45)"}}}}},Tt=e=>{const{componentCls:t,iconCls:s}=e;return{[`${t}-circle`]:{[`${t}-circle-rail`]:{stroke:e.remainingColor},[`${t}-body:not(${t}-circle-gradient)`]:{[`${t}-circle-path`]:{stroke:e.defaultColor}},[`${t}-body`]:{position:"relative",lineHeight:1,backgroundColor:"transparent"},[`${t}-indicator`]:{position:"absolute",insetBlockStart:"50%",insetInlineStart:0,width:"100%",margin:0,padding:0,color:e.circleTextColor,fontSize:e.circleTextFontSize,lineHeight:1,whiteSpace:"normal",textAlign:"center",transform:"translateY(-50%)",[s]:{fontSize:e.circleIconFontSize}},[`&${t}-status-exception`]:{[`${t}-body:not(${t}-circle-gradient)`]:{[`${t}-circle-path`]:{stroke:e.colorError}}},[`&${t}-status-success`]:{[`${t}-body:not(${t}-circle-gradient)`]:{[`${t}-circle-path`]:{stroke:e.colorSuccess}}}},[`${t}-inline-circle`]:{lineHeight:1,[`${t}-inner`]:{verticalAlign:"bottom"}}}},Rt=e=>{const{componentCls:t}=e;return{[t]:{[`${t}-steps`]:{display:"inline-block","&-body":{display:"flex",flexDirection:"row",alignItems:"center",gap:e.progressStepMarginInlineEnd,[`${t}-indicator`]:{marginInlineStart:e.marginXS}},"&-item":{flexShrink:0,minWidth:e.progressStepMinWidth,backgroundColor:e.remainingColor,transition:`all ${e.motionDurationSlow}`,"&-active":{backgroundColor:e.defaultColor}}}}}},Ft=e=>{const{componentCls:t,iconCls:s}=e;return{[t]:{[`${t}-small&-line, ${t}-small&-line ${t}-indicator ${s}`]:{fontSize:e.fontSizeSM}}}},Bt=e=>({circleTextColor:e.colorText,defaultColor:e.colorInfo,remainingColor:e.colorFillSecondary,lineBorderRadius:100,circleTextFontSize:"1em",circleIconFontSize:`${e.fontSize/e.fontSizeSM}em`}),Wt=st("Progress",e=>{const t=e.calc(e.marginXXS).div(2).equal(),s=at(e,{progressStepMarginInlineEnd:t,progressStepMinWidth:t,progressActiveMotionDuration:"2.4s"});return[_t(s),It(s),Tt(s),Rt(s),Ft(s)]},Bt),Kt=e=>{let t=[];return Object.keys(e).forEach(s=>{const a=Number.parseFloat(s.replace(/%/g,""));Number.isNaN(a)||t.push({key:a,value:e[s]})}),t=t.sort((s,a)=>s.key-a.key),t.map(({key:s,value:a})=>`${a} ${s}%`).join(", ")},Mt=(e,t)=>{const{from:s=je.blue,to:a=je.blue,direction:c=t==="rtl"?"to left":"to right",...f}=e;if(Object.keys(f).length!==0){const x=Kt(f),d=`linear-gradient(${c}, ${x})`;return{background:d,[De]:d}}const k=`linear-gradient(${c}, ${s}, ${a})`;return{background:k,[De]:k}},Ot=e=>{const{prefixCls:t,classNames:s,styles:a,direction:c,percent:f,size:k,strokeWidth:x,strokeColor:d,strokeLinecap:r="round",children:N,railColor:w,trailColor:h,percentPosition:P,success:I}=e,{align:T,type:D}=P,B=w??h,S=r==="square"||r==="butt"?0:void 0,E=k??[-1,x||(k==="small"?6:8)],[v,C]=ve(E,"line",{strokeWidth:x}),j={backgroundColor:B||void 0,borderRadius:S,height:C},L=`${t}-track`,_=d&&typeof d!="string"?Mt(d,c):{[De]:d,background:d},W={width:`${ie(f)}%`,height:C,borderRadius:S,..._},K=Se(e),X={width:`${ie(K)}%`,height:C,borderRadius:S,backgroundColor:I==null?void 0:I.strokeColor};return i.createElement("div",{className:Z(`${t}-body`,s.body,{[`${t}-body-layout-bottom`]:T==="center"&&D==="outer"}),style:{width:v>0?v:"100%",...a.body}},i.createElement("div",{className:Z(`${t}-rail`,s.rail),style:{...j,...a.rail}},i.createElement("div",{className:Z(L,s.track),style:{...W,...a.track}},D==="inner"&&N),K!==void 0&&i.createElement("div",{className:Z(L,`${L}-success`,s.track),style:{...X,...a.track}})),D==="outer"&&N)},zt=e=>{const{classNames:t,styles:s,size:a,steps:c,rounding:f=Math.round,percent:k=0,strokeWidth:x=8,strokeColor:d,railColor:r,trailColor:N,prefixCls:w,children:h}=e,P=f(c*(k/100)),T=a??[a==="small"?2:14,x],[D,B]=ve(T,"step",{steps:c,strokeWidth:x}),S=D/c,E=Array.from({length:c}),v=r??N;for(let C=0;C<c;C++){const j=Array.isArray(d)?d[C]:d;E[C]=i.createElement("div",{key:C,className:Z(`${w}-steps-item`,{[`${w}-steps-item-active`]:C<=P-1},t.track),style:{backgroundColor:C<=P-1?j:v,width:S,height:B,...s.track}})}return i.createElement("div",{className:Z(`${w}-steps-body`,t.body),style:s.body},E,h)},Gt=["normal","exception","active","success"],Ht=i.forwardRef((e,t)=>{const{prefixCls:s,className:a,rootClassName:c,classNames:f,styles:k,steps:x,strokeColor:d,percent:r=0,size:N="default",showInfo:w=!0,type:h="line",status:P,format:I,style:T,percentPosition:D={},...B}=e,{align:S="end",type:E="outer"}=D,v=Array.isArray(d)?d[0]:d,C=typeof d=="string"||Array.isArray(d)?d:void 0,j=i.useMemo(()=>{if(v){const o=typeof v=="string"?v:Object.values(v)[0];return new rt(o).isLight()}return!1},[d]),L=i.useMemo(()=>{var p,m;const o=Se(e);return Number.parseInt(o!==void 0?(p=o??0)==null?void 0:p.toString():(m=r??0)==null?void 0:m.toString(),10)},[r,e.success]),_=i.useMemo(()=>!Gt.includes(P)&&L>=100?"success":P||"normal",[P,L]),{getPrefixCls:W,direction:K,className:X,style:z,classNames:V,styles:se}=We("progress"),b=W("progress",s),[ee,A]=Wt(b),oe={...e,percent:r,type:h,size:N,showInfo:w,percentPosition:D},[Y,te]=lt([V,f],[se,k],{props:oe}),q=h==="line",R=q&&!x,H=i.useMemo(()=>{if(!w)return null;const o=Se(e);let p;const m=I||(F=>`${F}%`),$=q&&j&&E==="inner";return E==="inner"||I||_!=="exception"&&_!=="success"?p=m(ie(r),ie(o)):_==="exception"?p=q?i.createElement(ct,null):i.createElement(nt,null):_==="success"&&(p=q?i.createElement(Ze,null):i.createElement(pt,null)),i.createElement("span",{className:Z(`${b}-indicator`,{[`${b}-indicator-bright`]:$,[`${b}-indicator-${S}`]:R,[`${b}-indicator-${E}`]:R},Y.indicator),style:te.indicator,title:typeof p=="string"?p:void 0},p)},[w,r,L,_,h,b,I,q,j,E,S,R,Y.indicator,te.indicator]),M={...e,classNames:Y,styles:te};let J;h==="line"?J=x?i.createElement(zt,{...M,strokeColor:C,prefixCls:b,steps:typeof x=="object"?x.count:x},H):i.createElement(Ot,{...M,strokeColor:v,prefixCls:b,direction:K,percentPosition:{align:S,type:E}},H):(h==="circle"||h==="dashboard")&&(J=i.createElement(Dt,{...M,strokeColor:v,prefixCls:b,progressStatus:_},H));const n=Z(b,`${b}-status-${_}`,{[`${b}-${h==="dashboard"&&"circle"||h}`]:h!=="line",[`${b}-inline-circle`]:h==="circle"&&ve(N,"circle")[0]<=20,[`${b}-line`]:R,[`${b}-line-align-${S}`]:R,[`${b}-line-position-${E}`]:R,[`${b}-steps`]:x,[`${b}-show-info`]:w,[`${b}-${N}`]:typeof N=="string",[`${b}-rtl`]:K==="rtl"},X,a,c,Y.root,ee,A);return i.createElement("div",{ref:t,style:{...z,...te.root,...T},className:n,role:"progressbar","aria-valuenow":L,"aria-valuemin":0,"aria-valuemax":100,...Ne(B,["railColor","trailColor","strokeWidth","width","gapDegree","gapPosition","gapPlacement","strokeLinecap","success"])},J)});function $n({autoGenerate:e=!1,filename:t="hasil_analisis.pdf",booking:s=null}){var M,J;i.useEffect(()=>{document.title="SILAB-NTDK - Generate PDF Analisis"},[]);const a=He(),c=Ue();(M=a.state)==null||M.autoGenerate;const[f,k]=i.useState(null),[x,d]=i.useState(!1),[r,N]=i.useState(null),[w,h]=i.useState(null),[P,I]=i.useState([]),[T,D]=i.useState("list"),[B,S]=i.useState(!1),[E,v]=i.useState(!1),[C,j]=i.useState(0),L=s||((J=a.state)==null?void 0:J.booking),_=L==null?void 0:L.id,W=L==null?void 0:L.resultUnits,K=["KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI","INSTITUT PERTANIAN BOGOR","FAKULTAS PETERNAKAN","DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN","LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA","Jl. Agathis Kampus IPB Darmaga, Bogor 16680"],X={header:{kepada:"Kepada Yth.",instansi:"****",tempat:"Di Tempat",tanggal:"**/**/****",jenis_kelamin:"****",umur:"**** minggu",status_fisiologis:"****",title1:"Tabel 1. Hasil Analisis Hematologi",title2:"Tabel 2. Hasil Analisis Metabolit"},table1:[["Kode","BDM x10^6(Butir/mm³)","BDP x10^3 (Butir/mm³)",`HB
(G%)`,`PCV
(%)`,`Limfosit
(%)`,`Neutrofil
(%)`,`Eosinofil
(%)`,`Monosit
(%)`,`Basofil
(%)`],["-","-","-","-","-","-","-","-","-","-"]],table2:[["No","Kode",`Glukosa
(mg/dL)`,`Total Protein
(g/dL)`,`Albumin
(mg/dL)`,`Kolestrol
(mg/dL)`,`Trigliserida
(mg/dL)`,`Urea/BUN
(mg/dL)`,`Kreatinin
(mg/dL)`,`Kalsium
(mg/dL)`,`HDL-kol
(mg/dL)`,`LDL-kol
(mg/dL)`],[]]};i.useEffect(()=>{_?(V(_),D("detail")):(z(),D("list"))},[_]),i.useEffect(()=>{r&&(r.status==="proses"||r.status)},[r]);const z=async()=>{try{d(!0);const n=await _e(),o=(n==null?void 0:n.data)||[],p=["proses","draft","menunggu_verifikasi","menunggu_verifikasi_kepala","menunggu_ttd","menunggu_ttd_koordinator","menunggu_pembayaran","selesai","disetujui","diperbaiki_teknisi","revised","diperbaiki"],m=o.filter(y=>{const G=(y.status||"").toLowerCase(),O=Array.isArray(y.analysis_items)&&y.analysis_items.some(ae=>(ae.status||"").toLowerCase()==="revised");return(p.includes(G)||O)&&G!=="menunggu_pembayaran_awal"&&G!=="pending"&&G!=="dibatalkan"&&G!=="rejected"}),$=m.filter(y=>!y.jenis_analisis||y.jenis_analisis.trim()===""?!1:(y.status||"").toLowerCase()==="proses"?Array.isArray(y.analysis_items)&&y.analysis_items.some(O=>O.hasil&&O.hasil.toString().trim()!==""||(O.status||"").toLowerCase()==="revised"):(Array.isArray(y.analysis_items)&&y.analysis_items.some(O=>(O.status||"").toLowerCase()==="revised"),!0));console.log("=== DEBUG FILTER TEKNISI ==="),console.log("All bookings count:",o.length),console.log("After status filter:",m.length),console.log("Final booking count (with analysis):",$.length);const F=[...new Set(o.map(y=>y.status))];console.log("All unique statuses:",F);const u=[...new Set($.map(y=>y.status))];console.log("Teknisi filtered statuses:",u);const U=[...new Set($.map(y=>y.jenis_analisis))];console.log("Jenis analisis yang ada:",U),console.log("============================="),$.sort((y,G)=>{const O=(y.status||"").toLowerCase(),ae=(G.status||"").toLowerCase();return O==="menunggu_verifikasi"&&ae!=="menunggu_verifikasi"?-1:O!=="menunggu_verifikasi"&&ae==="menunggu_verifikasi"?1:new Date(G.created_at)-new Date(y.created_at)}),I($)}catch(n){console.error("Error fetching bookings:",n),Q.error("Gagal memuat daftar booking.")}finally{d(!1)}},V=async n=>{try{d(!0);const o=await _e(),m=((o==null?void 0:o.data)||[]).find($=>$.id===n);if(m)if(W){const $={...m,resultUnits:W};N($),h($)}else N(m),h(m);else Q.error("Data booking tidak ditemukan!")}catch(o){console.error("Error fetching booking:",o),Q.error("Gagal memuat data booking.")}finally{d(!1)}},se=n=>{h(n),N(n),D("detail")},b=()=>{D("list"),h(null),N(null),k(null),z()},ee=()=>{w&&c.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${w.id}`)},A=r?Je(r):X;function oe(){if(!r)return null;const n=new Xe("p","mm","a4");let o=(r==null?void 0:r.kode_batch)||(r==null?void 0:r.kode_sampel)||"-";Array.isArray(o)&&(o=o[0]||"-");const m=`hasil_analisis - ${String(o).replace(/[^a-zA-Z0-9-_]/g,"_")}.pdf`,$=n.internal.pageSize.getWidth(),F=n.internal.pageSize.getHeight(),u=14,U=14,y=$-u-U,G={font:"helvetica",fontSize:8,textColor:20,cellPadding:1.5,valign:"middle",halign:"center",lineWidth:.1,lineColor:[200,200,200],overflow:"linebreak"},O={fillColor:[0,85,128],textColor:255,fontStyle:"bold",halign:"center",valign:"middle",cellPadding:2},ae={fillColor:[248,248,248]};let g=20;const Ke=43,Me=30;try{n.addImage("/asset/Logo-IPB.png","PNG",12,5,Ke,Me)}catch{}let re=10;const Oe=15;if(n.setFontSize(12),n.setFont("times","bold"),K.forEach(ne=>{n.text(ne,$/2+Oe,re,{align:"center"}),re+=6}),re-=2,n.setLineWidth(.5),n.setDrawColor(0,0,0),n.line(14,re,$-14,re),g=re+10,n.setFontSize(11),n.setFont("times","normal"),n.text(A.header.kepada,u,g),A.header.tanggal&&n.text(`Tanggal: ${A.header.tanggal}`,$-U,g,{align:"right"}),g+=6,n.text(A.header.instansi,u,g),g+=6,n.text(A.header.tempat,u,g),g+=12,n.setFontSize(10),n.setFont("times","bold"),n.text("Informasi Hewan:",u,g),g+=5,n.setFont("times","normal"),n.text(`Jenis Kelamin: ${A.header.jenis_kelamin||"-"}`,u,g),g+=4,n.text(`Umur: ${A.header.umur||"-"}`,u,g),g+=4,n.text(`Status Fisiologis: ${A.header.status_fisiologis||"-"}`,u,g),g+=12,A.table1&&A.table1.length>0&&A.header.title1){n.setFontSize(11),n.setFont("times","bold");const ne=n.splitTextToSize(A.header.title1,y);n.text(ne,u,g),g+=ne.length*5+2;const[,...ue]=A.table1,[me,...fe]=A.table1,pe=12,he=30,ye=y-pe-he,be=me.length-2,xe=ye/(be>0?be:1);let le={0:{cellWidth:pe},1:{cellWidth:he,whiteSpace:"nowrap",overflow:"hidden"}};for(let we=2;we<me.length;we++)le[we]={cellWidth:xe};Ee(n,{startY:g,head:[me],body:fe,theme:"grid",styles:G,headStyles:O,alternateRowStyles:ae,columnStyles:le,margin:{left:u,right:U},tableWidth:"auto"}),g=n.lastAutoTable.finalY+12}if(A.table2&&A.table2.length>0&&A.header.title2){F-g<40&&(n.addPage(),g=20),n.setFontSize(11),n.setFont("times","bold");const ne=n.splitTextToSize(A.header.title2,y);n.text(ne,u,g),g+=ne.length*5+2;const[ue,...me]=A.table2,fe=10,pe=35,he=y-fe-pe,ye=ue.length-2,be=he/(ye>0?ye:1);let xe={0:{cellWidth:fe},1:{cellWidth:pe,whiteSpace:"nowrap",overflow:"hidden"}};for(let le=2;le<ue.length;le++)xe[le]={cellWidth:be};Ee(n,{startY:g,head:[ue],body:me,theme:"grid",styles:G,headStyles:O,alternateRowStyles:ae,columnStyles:xe,margin:{left:u,right:U},tableWidth:"auto"}),g=n.lastAutoTable.finalY+15}F-g<60?(n.addPage(),g=40):g+=15;const de=$-45;n.setFontSize(10),n.setFont("times","normal"),n.text("Penanggungjawab Lab. Analisis",de,g,{align:"center"}),g+=5,n.text("Ilmu Nutrisi Ternak Daging dan Kerja",de,g,{align:"center"}),g+=25,n.setLineWidth(.3),n.setDrawColor(0,0,0),n.line(de-25,g,de+25,g),g+=4,n.text("Prof. Dewi Apri Astuti, MS",de,g,{align:"center"});const ze=n.output("blob");return new File([ze],m,{type:"application/pdf"})}function Y(n=!1){const o=oe();if(o)if(n){const p=URL.createObjectURL(o),m=document.createElement("a");m.href=p,m.download=o.name,document.body.appendChild(m),m.click(),m.parentNode&&m.parentNode.removeChild(m),URL.revokeObjectURL(p)}else{f&&URL.revokeObjectURL(f);const p=URL.createObjectURL(o);k(p)}}const te=async()=>{var n,o,p,m,$;if(!r){Q.error("Data booking tidak ditemukan!");return}try{v(!0),j(0);const F=oe();if(!F){Q.error("Gagal membuat file PDF. Silakan coba lagi."),v(!1),j(0);return}if(!(F instanceof File)){Q.error("File PDF tidak valid. Silakan coba lagi."),v(!1),j(0);return}try{await Qe(r.id,F,u=>{j(u)})}catch(u){console.error("Upload error response:",(u==null?void 0:u.response)||u);const U=((o=(n=u==null?void 0:u.response)==null?void 0:n.data)==null?void 0:o.message)||((p=u==null?void 0:u.response)==null?void 0:p.statusText)||u.message||"Gagal upload PDF ke server.",y=($=(m=u==null?void 0:u.response)==null?void 0:m.data)!=null&&$.errors?JSON.stringify(u.response.data.errors):null;Q.error(U+(y?`: ${y}`:"")),v(!1),j(0);return}await V(r.id),j(100),setTimeout(()=>j(0),800),Q.success({content:"Hasil analisis berhasil dikirim ke Koordinator Lab!",duration:2})}catch(F){console.error("Gagal kirim ke koordinator:",F),Q.error("Terjadi kesalahan saat mengirim ke koordinator."),j(0)}finally{v(!1)}};i.useEffect(()=>{A&&r&&T==="detail"&&Y(!1)},[r,T]);const q=[{title:"Kode Sampel",dataIndex:"kode_batch",key:"kode_batch",width:150,render:(n,o)=>{var U,y;const p=n||o.kode_sampel||"-",m=((U=o.user)==null?void 0:U.full_name)||((y=o.user)==null?void 0:y.name)||"-",$=o.jenis_analisis||"-",F=o.tanggal_booking||o.created_at,u=F?new Date(F).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):"-";return l.jsxs("div",{children:[l.jsx("div",{children:l.jsx(Ce,{color:"blue",style:{fontSize:"12px",marginBottom:"4px"},children:p})}),l.jsxs("div",{className:"d-block d-md-none",style:{fontSize:"11px",color:"#666",lineHeight:"1.3"},children:[l.jsx("div",{style:{fontWeight:"500",color:"#333",marginBottom:"2px"},children:m}),l.jsx("div",{style:{marginBottom:"2px"},children:$}),l.jsx("div",{style:{color:"#888"},children:u})]})]})}},{title:"Nama Lengkap",dataIndex:"user",key:"user",width:150,className:"d-none d-md-table-cell",render:n=>(n==null?void 0:n.full_name)||(n==null?void 0:n.name)||"-"},{title:"Jenis Analisis",dataIndex:"jenis_analisis",key:"jenis_analisis",width:180,className:"d-none d-lg-table-cell",render:n=>n||"-"},{title:"Tanggal Pemesanan",key:"tanggal_pemesanan",width:120,className:"d-none d-lg-table-cell",render:(n,o)=>{const p=o.tanggal_booking||o.created_at;return p?new Date(p).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):"-"}},{title:"Status",dataIndex:"status",key:"status",width:120,align:"center",render:n=>{let o="default",p=n,m=n;switch(n){case"proses":case"draft":o="warning",p="Perlu Kirim Koordinator",m="Perlu Kirim";break;case"menunggu_verifikasi":o="processing",p="Sudah Dikirim ke Koordinator",m="Dikirim";break;case"menunggu_verifikasi_kepala":o="processing",p="Di Koordinator",m="Di Koordinator";break;case"menunggu_ttd":case"menunggu_ttd_koordinator":o="purple",p="Menunggu TTD",m="TTD";break;case"menunggu_pembayaran":case"selesai":o="success",p="Selesai",m="Selesai";break;default:p=(n==null?void 0:n.replace(/_/g," "))||"-",m=p}return l.jsxs(l.Fragment,{children:[l.jsx("span",{className:"d-none d-md-inline",children:l.jsx(Ce,{color:o,children:p})}),l.jsx("span",{className:"d-inline d-md-none",children:l.jsx(Ce,{color:o,style:{fontSize:"10px",padding:"2px 4px"},children:m})})]})}},{title:"Aksi",key:"aksi",width:80,align:"center",render:(n,o)=>l.jsxs(ce,{type:"primary",icon:l.jsx(ft,{}),size:"small",className:"responsive-btn",onClick:()=>se(o),children:[l.jsx("span",{className:"d-none d-sm-inline",children:"PDF"}),l.jsx("span",{className:"d-inline d-sm-none",children:"PDF"})]})}],H=r&&["menunggu_verifikasi","menunggu_verifikasi_kepala","menunggu_ttd","menunggu_ttd_koordinator","menunggu_pembayaran","selesai","disetujui"].includes((r.status||"").toLowerCase());return l.jsxs(Ve,{children:[l.jsxs("div",{className:"container-fluid p-4",style:{minHeight:"calc(100vh - 160px)"},children:[x&&l.jsx("div",{className:"text-center py-5",children:l.jsx(qe,{spinning:x,tip:"Memuat data..."})}),!x&&T==="list"&&l.jsxs("div",{className:"card shadow-sm",style:{borderRadius:"12px",overflow:"hidden",border:"none"},children:[l.jsx("div",{className:"card-header text-white",style:{backgroundColor:"#cdb0a7",borderBottom:"2px solid #8D6E63",padding:"15px 20px"},children:l.jsx("h5",{className:"mb-0",style:{fontWeight:"600",letterSpacing:"0.5px"},children:"Daftar Hasil Analisis (Riwayat)"})}),l.jsx("div",{className:"card-body responsive-table-container",style:{backgroundColor:"#FAF8F6"},children:l.jsx(et,{columns:q,dataSource:P,rowKey:"id",pagination:{pageSize:10,style:{marginTop:"20px"},showSizeChanger:!1,showQuickJumper:!1,responsive:!0},scroll:{scrollToFirstRowOnChange:!0},locale:{emptyText:"Tidak ada data analisis"},className:"custom-brown-table responsive-analysis-table",size:"small"})})]}),!x&&T==="detail"&&l.jsxs("div",{className:"d-flex flex-column gap-3",children:[l.jsxs("div",{className:"card shadow-sm p-3",children:[l.jsx("h5",{className:"mb-3",children:"Preview Hasil Analisis"}),l.jsxs("div",{className:"d-flex gap-2 flex-wrap",children:[l.jsx(ce,{icon:l.jsx(bt,{}),onClick:()=>Y(!0),children:"Download PDF"}),l.jsx(ce,{icon:l.jsx(dt,{}),onClick:ee,disabled:!r||H,children:"Edit Data"}),r&&["menunggu_verifikasi","menunggu_verifikasi_kepala","menunggu_ttd","menunggu_ttd_koordinator","menunggu_pembayaran","selesai","disetujui"].includes((r.status||"").toLowerCase())?l.jsx(ce,{type:"default",icon:l.jsx(mt,{}),disabled:!0,style:{background:"#f6ffed",borderColor:"#b7eb8f",color:"#52c41a"},children:"Sudah Dikirim ke Koordinator"}):l.jsx(ce,{type:"primary",icon:l.jsx(St,{}),onClick:()=>S(!0),disabled:!r||E,children:"Kirim Ke Koordinator Lab"}),E&&l.jsx("div",{style:{minWidth:240,marginLeft:12},children:l.jsx(Ht,{percent:C,status:C===0?void 0:C<100?"active":"success"})}),l.jsx(ut,{title:"Konfirmasi Pengiriman",open:B,onOk:()=>{S(!1),te()},onCancel:()=>S(!1),okText:"Ya, Kirim",cancelText:"Batal",children:l.jsx("p",{children:"Apakah Anda yakin ingin mengirim hasil analisis ke Koordinator Lab?"})}),l.jsx(ce,{onClick:b,children:"Kembali ke Daftar"})]})]}),l.jsx("div",{className:"card shadow-sm p-0",style:{height:"800px"},children:f&&l.jsx("iframe",{src:f,title:"PDF Preview",style:{width:"100%",height:"100%",border:"none"}})})]})]}),l.jsx(Ye,{}),l.jsx("style",{children:`
        .responsive-table-container {
          overflow-x: visible; /* Remove horizontal overflow */
          -webkit-overflow-scrolling: touch;
        }
        
        .responsive-analysis-table {
          font-size: clamp(11px, 2.5vw, 14px);
          width: 100%;
        }
        
        .responsive-analysis-table .ant-table {
          width: 100% !important;
        }
        
        .responsive-analysis-table .ant-table-thead > tr > th {
          padding: clamp(8px, 2vw, 16px) clamp(4px, 1vw, 8px);
          font-size: clamp(10px, 2.2vw, 13px);
          font-weight: 600;
          white-space: nowrap;
        }
        
        .responsive-analysis-table .ant-table-tbody > tr > td {
          padding: clamp(6px, 1.5vw, 12px) clamp(4px, 1vw, 8px);
          font-size: clamp(10px, 2vw, 12px);
        }
        
        .responsive-btn {
          font-size: clamp(10px, 2vw, 12px);
          padding: clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 8px);
        }
        
        @media (max-width: 768px) {
          .responsive-table-container {
            margin: 0;
            padding: 0;
            overflow-x: visible !important;
          }
          
          .responsive-analysis-table {
            width: 100% !important;
          }
          
          .responsive-analysis-table .ant-table {
            font-size: 11px;
            width: 100% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th {
            padding: 8px 4px;
            font-size: 10px;
            line-height: 1.2;
          }
          
          .responsive-analysis-table .ant-table-tbody > tr > td {
            padding: 6px 4px;
            font-size: 10px;
            line-height: 1.3;
            word-break: break-word;
          }
          
          .responsive-analysis-table .ant-tag {
            font-size: 9px;
            padding: 2px 4px;
            line-height: 1.2;
          }
          
          .responsive-btn {
            font-size: 10px;
            padding: 2px 6px;
            height: auto;
            min-height: 24px;
          }
          
          .responsive-btn .anticon {
            font-size: 12px;
          }
          
          /* Ensure table columns distribute evenly on mobile */
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(1) {
            width: 40% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(2) {
            width: 35% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(3) {
            width: 25% !important;
          }
        }
        
        @media (max-width: 576px) {
          .card-header h5 {
            font-size: clamp(14px, 4vw, 18px);
          }
          
          .responsive-analysis-table .ant-table {
            font-size: 10px;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th {
            padding: 6px 2px;
            font-size: 9px;
          }
          
          .responsive-analysis-table .ant-table-tbody > tr > td {
            padding: 4px 2px;
            font-size: 9px;
            vertical-align: top;
          }
          
          .responsive-analysis-table .ant-pagination {
            margin-top: 12px !important;
          }
          
          .responsive-analysis-table .ant-pagination-item {
            min-width: 28px;
            height: 28px;
            line-height: 26px;
            font-size: 11px;
          }
        }
        
        @media (min-width: 769px) {
          .d-md-table-cell {
            display: table-cell !important;
          }
          
          .d-md-block {
            display: block !important;
          }
          
          .d-md-none {
            display: none !important;
          }
          
          .d-md-inline {
            display: inline !important;
          }
        }
        
        @media (min-width: 992px) {
          .d-lg-table-cell {
            display: table-cell !important;
          }
        }
        
        /* Ensure status column is always visible */
        .responsive-analysis-table .ant-table-thead > tr > th,
        .responsive-analysis-table .ant-table-tbody > tr > td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Fix for very small screens */
        @media (max-width: 400px) {
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(1) {
            width: 45% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(2) {
            width: 30% !important;
          }
          
          .responsive-analysis-table .ant-table-thead > tr > th:nth-child(3) {
            width: 25% !important;
          }
        }
      `})]})}export{$n as default};

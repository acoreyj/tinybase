var e,t;e=this,t=function(e){"use strict";const t=e=>typeof e,n="",r=t(n),s=t(t),i=Math.max,o=Math.min,a=isFinite,c=e=>null==e,d=(e,t,n)=>c(e)?n?.():t(e),l=e=>Array.isArray(e),u=()=>{},f=(e,t)=>e.forEach(t),h=e=>g(e,((e,t)=>e+t),0),v=e=>e.length,g=(e,t,n)=>e.reduce(t,n),M=(e,...t)=>e.push(...t),p=Object.freeze,y=e=>e.size,m=(e,t)=>e?.has(t)??!1,b=e=>c(e)||0==y(e),L=e=>[...e?.values()??[]],w=e=>e.clear(),T=(e,t)=>e?.forEach(t),x=(e,t)=>e?.delete(t),E=e=>new Map(e),I=(e,t)=>e?.get(t),R=(e,t)=>T(e,((e,n)=>t(n,e))),S=(e,t,n)=>c(n)?(x(e,t),e):e?.set(t,n),j=(e,t,n)=>(m(e,t)||S(e,t,n()),I(e,t)),k=(e,t,n,r,s=0)=>d((n?j:I)(e,t[s],s>v(t)-2?n:E),(i=>{if(s>v(t)-2)return r?.(i)&&S(e,t[s]),i;const o=k(i,t,n,r,s+1);return b(i)&&S(e,t[s]),o})),z=E([["avg",[(e,t)=>h(e)/t,(e,t,n)=>e+(t-e)/(n+1),(e,t,n)=>e+(e-t)/(n-1),(e,t,n,r)=>e+(t-n)/r]],["max",[e=>i(...e),(e,t)=>i(t,e),(e,t)=>t==e?void 0:e,(e,t,n)=>n==e?void 0:i(t,e)]],["min",[e=>o(...e),(e,t)=>o(t,e),(e,t)=>t==e?void 0:e,(e,t,n)=>n==e?void 0:o(t,e)]],["sum",[e=>h(e),(e,t)=>e+t,(e,t)=>e-t,(e,t,n)=>e-n+t]]]),A=e=>new Set(l(e)||c(e)?e:[e]),D=(e,t)=>e?.add(t),N=/^\d+$/,B=(e=>{const i=new WeakMap;return e=>(i.has(e)||i.set(e,(e=>{const i=E(),[o,h,g,B,C,F,O,,W,$,q]=((e,t,r)=>{const s=e.hasRow,i=E(),o=E(),a=E(),u=E(),h=E(),g=(t,n,...r)=>{const s=j(h,t,A);return f(r,(t=>D(s,t)&&n&&e.callListener(t))),r},M=(t,...n)=>d(I(h,t),(r=>{f(0==v(n)?L(r):n,(t=>{e.delListener(t),x(r,t)})),b(r)&&S(h,t)})),p=(e,n)=>{S(i,e,n),m(o,e)||(S(o,e,t()),S(a,e,E()),S(u,e,E()))},y=e=>{S(i,e),S(o,e),S(a,e),S(u,e),M(e)};return[()=>e,()=>{return e=i,[...e?.keys()??[]];var e},e=>R(o,e),e=>m(o,e),e=>I(i,e),e=>I(o,e),(e,t)=>S(o,e,t),p,(t,r,i,o,d)=>{p(t,r);const h=E(),y=E(),b=I(a,t),L=I(u,t),x=t=>{const i=n=>e.getCell(r,t,n),a=I(b,t),u=s(r,t)?(f=o(i,t),isNaN(f)||c(f)||!0===f||!1===f||f===n?void 0:1*f):void 0;var f,g,M,p;if(a===u||l(a)&&l(u)&&(M=u,v(g=a)===v(M)&&(p=(e,t)=>M[t]===e,g.every(p)))||S(h,t,[a,u]),!c(d)){const e=I(L,t),n=s(r,t)?d(i,t):void 0;e!=n&&S(y,t,n)}},j=e=>{i((()=>{T(h,(([,e],t)=>S(b,t,e))),T(y,((e,t)=>S(L,t,e)))}),h,y,b,L,e),w(h),w(y)};R(b,x),e.hasTable(r)&&f(e.getRowIds(r),(e=>{m(b,e)||x(e)})),j(!0),M(t),g(t,0,e.addRowListener(r,null,((e,t,n)=>x(n))),e.addTableListener(r,(()=>j())))},y,()=>R(h,y),g,M]})(e,u),[G,H,J]=(e=>{let t;const[r,s]=(()=>{const e=[];let t=0;return[r=>(r?e.shift():null)??n+t++,t=>{N.test(t)&&v(e)<1e3&&M(e,t)}]})(),i=E();return[(e,s,o,a=[],c=(()=>[]))=>{t??=K;const d=r(1);return S(i,d,[e,s,o,a,c]),D(k(s,o??[n],A),d),d},(e,r,...s)=>f(((e,t=[n])=>{const r=[],s=(e,n)=>n==v(t)?M(r,e):null===t[n]?T(e,(e=>s(e,n+1))):f([t[n],null],(t=>s(I(e,t),n+1)));return s(e,0),r})(e,r),(e=>T(e,(e=>I(i,e)[0](t,...r??[],...s))))),e=>d(I(i,e),(([,t,r])=>(k(t,r??[n],void 0,(t=>(x(t,e),b(t)?1:0))),S(i,e),s(e),r))),e=>d(I(i,e),(([e,,n=[],r,s])=>{const i=(...o)=>{const a=v(o);a==v(n)?e(t,...o,...s(o)):c(n[a])?f(r[a]?.(...o)??[],(e=>i(...o,e))):i(...o,n[a])};i()}))]})(),K={setMetricDefinition:(e,n,o,d,l,u,f)=>{const h=t(o)==s?[o,l,u,f]:I(z,o)??I(z,"sum");return W(e,n,((t,n,r,s,o,d)=>{const l=F(e),u=y(s);d||=c(l),t();let f=((e,t,n,r,s,i=!1)=>{if(b(n))return;const[o,a,d,l]=s;return i||=c(e),T(r,(([n,r])=>{i||(e=c(n)?a?.(e,r,t++):c(r)?d?.(e,n,t--):l?.(e,r,n,t),i||=c(e))})),i?o(L(n),y(n)):e})(l,u,s,n,h,d);a(f)||(f=void 0),f!=l&&(O(e,f),H(i,[e],f,l))}),(1,t(v=d)==r?e=>e(v):v??(()=>1))),K;var v},delMetricDefinition:e=>($(e),K),getStore:o,getMetricIds:h,forEachMetric:g,hasMetric:B,getTableId:C,getMetric:F,addMetricListener:(e,t)=>G(t,i,[e]),delListener:e=>(J(e),K),destroy:q,getListenerStats:()=>({})};return p(K)})(e)),i.get(e))})();e.createMetrics=B},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseMetrics={});

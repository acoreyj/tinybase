var e,t;e=this,t=function(e){"use strict";const t=Promise,a=e=>null==e,n=(e,t,n)=>a(e)?n?.():t(e),s=(e,t,a)=>e.slice(t,a),o=e=>new t(e),r=Object,i=e=>r.getPrototypeOf(e),l=r.entries,c=r.keys,g=r.freeze,d=(e,t)=>((e,t)=>e.forEach(t))(l(e),(([e,a])=>t(a,e))),y=e=>(e=>!a(e)&&n(i(e),(e=>e==r.prototype||a(i(e))),(()=>!0)))(e)&&0==(e=>c(e).length)(e),u=(e,t,a)=>(((e,t)=>t in e)(e,t)||(e[t]=a()),e[t]),f=(e,t)=>e?.delete(t),h=e=>new Map(e),p=(e,t)=>e?.get(t),v=(e,t,n)=>a(n)?(f(e,t),e):e?.set(t,n),b=(e,t,a,n)=>{var s,o;return s=e,o=t,s?.has(o)||v(e,t,a()),p(e,t)};new globalThis.TextEncoder;const w=(e,t)=>t?[e,t]:[e],S=(e,t)=>((e??"")>(t??"")?e:t)??"",A=(e="")=>w(((e=[])=>r.fromEntries(e))(),e),C=h(),M=h(),T="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".split("");var m;h((m=(e,t)=>[e,t],T.map(m)));e.createWsSynchronizer=async(e,t,r=1,i)=>{let l;const c=(e,a)=>t.addEventListener(e,a),m=((e,t,s,r,i,l,c={})=>{let m;const L=h();s(((s,o,r,i)=>{0==r?n(p(L,o),(([e,t])=>a(e)||e==s?t(i,s):0)):2==r&&x.isAutoLoading()?O(s,i).then((e=>{m?.(void 0,e)})):3==r&&x.isAutoLoading()?m?.(void 0,i):n(1==r&&x.isAutoSaving()?e.getMergeableContentHashes():4==r?e.getMergeableTableDiff(i):5==r?e.getMergeableRowDiff(i):6==r?e.getMergeableCellDiff(i):7==r?e.getMergeableValueDiff(i):void 0,(e=>{t(s,o,0,e)}))}));const H=async(e,a,n="")=>o(((s,o)=>{const r=((e=16)=>crypto.getRandomValues(new Uint8Array(e)).reduce(((e,t)=>e+T[63&t]),""))(),l=setTimeout((()=>{f(L,r),o(`No response from ${e??"anyone"} to '${a}'`)}),1e3*i);v(L,r,[e,(e,t)=>{clearTimeout(l),f(L,r),s([e,t])}]),t(e,r,a,n)})),D=(e,[t,a])=>{d(t,(([t,a],n)=>{const s=u(e[0],n,A);d(t,(([e,t],a)=>{const n=u(s[0],a,A);d(e,(([e,t],a)=>n[0][a]=w(e,t))),n[1]=S(n[1],t)})),s[1]=S(s[1],a)})),e[1]=S(e[1],a)},O=async(t=null,n)=>{a(n)&&([n,t]=await H(t,1));const[s,o]=n,[r,i]=e.getMergeableContentHashes();let l=A();if(r!=s){const[a,n]=(await H(t,4,e.getMergeableTableHashes()))[0];if(l=a,!y(n)){const[a,s]=(await H(t,5,e.getMergeableRowHashes(n)))[0];if(D(l,a),!y(s)){const a=(await H(t,6,e.getMergeableCellHashes(s)))[0];D(l,a)}}}return[l,i==o?A():(await H(t,7,e.getMergeableValuesHashes()))[0],1]},x=((e,t,s,o,r,i,l,c={},d=[])=>{let u,f,h,w=0;b(C,d,(()=>0)),b(M,d,(()=>[]));const[S,A,T,m,L]=((e=1,t)=>e>1&&"getMergeableContent"in t?[1,t.getMergeableContent,t.getTransactionMergeableChanges,([[e],[t]])=>!y(e)||!y(t),t.setDefaultContent]:2!=e?[0,t.getContent,t.getTransactionChanges,([e,t])=>!y(e)||!y(t),t.setContent]:0)(l,e),H=t=>{var a;(S&&(a=t?.[0],Array.isArray(a))?1===t?.[2]?e.applyMergeableChanges:e.setMergeableContent:1===t?.[2]?e.applyChanges:e.setContent)(t)},D=async e=>(2!=w&&(w=1,await z((async()=>{try{H(await t())}catch(t){i?.(t),e&&L(e)}w=0}))),N),O=()=>(f&&(r(f),f=void 0),N),x=async e=>(1!=w&&(w=2,await z((async()=>{try{await s(A,e)}catch(e){i?.(e)}w=0}))),N),E=()=>(n(h,e.delListener),h=void 0,N),z=async(...e)=>(((e,...t)=>{e.push(...t)})(p(M,d),...e),await(async()=>{if(!p(C,d)){for(v(C,d,1);!a((e=p(M,d),u=e.shift()));)try{await u()}catch(e){i?.(e)}v(C,d,0)}var e})(),N),N={load:D,startAutoLoad:async e=>(await O().load(e),f=o((async(e,t)=>{t||e?2!=w&&(w=1,H(t??e),w=0):await D()})),N),stopAutoLoad:O,isAutoLoading:()=>!a(f),save:x,startAutoSave:async()=>(await E().save(),h=e.addDidFinishTransactionListener((()=>{const e=T();m(e)&&x(e)})),N),stopAutoSave:E,isAutoSaving:()=>!a(h),schedule:z,getStore:()=>e,destroy:()=>O().stopAutoSave(),getStats:()=>({}),...c};return g(N)})(e,(async()=>{const e=await O();return y(e[0][0])&&y(e[1][0])?void 0:e}),(async(a,n)=>{n?t(null,null,3,n):t(null,null,2,e.getMergeableContentHashes())}),(e=>m=e),(()=>m=void 0),l,2,{startSync:async e=>await(await x.startAutoLoad(e)).startAutoSave(),stopSync:()=>x.stopAutoLoad().stopAutoSave(),destroy:()=>(r(),x.stopSync()),getSynchronizerStats:()=>({}),...c});return x})(e,((e,...a)=>{t.send((e??"")+"\n"+JSON.stringify(a,((e,t)=>void 0===t?"￼":t)))}),(e=>{l=e}),(()=>{t.close()}),r,i,{getWebSocket:()=>t});return c("message",(({data:e})=>{if(!a(l)){const a=e.toString("utf8").indexOf("\n");-1!==a&&l(s(e,0,a),...(t=s(e,a+1),JSON.parse(t,((e,t)=>"￼"===t?void 0:t))))}var t})),o(((e,a)=>{t.readyState!=t.OPEN?(c("error",a),c("open",(()=>e(m)))):e(m)}))}},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseSynchronizerWsClient={});

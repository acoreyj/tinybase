var e,t;e=this,t=function(e){"use strict";const t=e=>typeof e,a=t(""),s=e=>null==e,n=(e,t,a)=>s(e)?a?.():t(e),o=Object,r=e=>o.getPrototypeOf(e),i=o.keys,c=o.freeze,y=e=>(e=>!s(e)&&n(r(e),(e=>e==o.prototype||s(r(e))),(()=>!0)))(e)&&0==(e=>i(e).length)(e),l=JSON.parse,g=e=>new Map(e),d=(e,t)=>e?.get(t),u=(e,t,a)=>{return s(a)?(n=e,o=t,n?.delete(o),e):e?.set(t,a);var n,o},p=(e,t,a)=>{var s,n;return s=e,n=t,s?.has(n)||u(e,t,a()),d(e,t)},f=g(),h=g(),v=e=>{return s=e?.[0],t(s)==a;var s},w="storage",C=globalThis.window,S=(e,t,a,r)=>((e,t,a,o,r,i,l,[g,w]=[],C=[])=>{let S,b,A,L=0,M=0;p(f,C,(()=>0)),p(h,C,(()=>[]));const[m,T,O,P]=((e,t)=>s(t.getMergeableContent)?[0,t.getContent,t.getTransactionChanges,([e,t])=>!y(e)||!y(t)]:[1,t.getMergeableContent,t.getTransactionMergeableChanges,([,[[,e],[,t]]])=>!y(e)||!y(t)])(0,e),x=async e=>(2!=L&&(L=1,await E.schedule((async()=>{await e(),L=0}))),E),E={load:async(a,s)=>await x((async()=>{try{const a=await t();(m&&v(a)?e.setMergeableContent:e.setContent)(a)}catch{e.setContent([a,s])}})),startAutoLoad:async(a={},s={})=>(E.stopAutoLoad(),await E.load(a,s),M=1,A=o((async(a,s)=>{if(s){const t=s();await x((async()=>(m&&v(t)?e.applyMergeableChanges:e.applyChanges)(t)))}else await x((async()=>{try{const s=a?.()??await t();(m&&v(s)?e.setMergeableContent:e.setContent)(s)}catch(e){i?.(e)}}))})),E),stopAutoLoad:()=>(M&&(r(A),A=void 0,M=0),E),save:async e=>(1!=L&&(L=2,await E.schedule((async()=>{try{await a(T,e)}catch(e){i?.(e)}L=0}))),E),startAutoSave:async()=>(await E.stopAutoSave().save(),S=e.addDidFinishTransactionListener((()=>{const e=O();P(e)&&E.save((()=>e))})),E),stopAutoSave:()=>(n(S,e.delListener),S=void 0,E),schedule:async(...e)=>(((e,...t)=>{e.push(...t)})(d(h,C),...e),await(async()=>{if(!d(f,C)){for(u(f,C,1);!s((e=d(h,C),b=e.shift()));)try{await b()}catch(e){i?.(e)}u(f,C,0)}var e})(),E),getStore:()=>e,destroy:()=>E.stopAutoLoad().stopAutoSave(),getStats:()=>({})};return g&&(E[g]=()=>w),c(E)})(e,(async()=>l(a.getItem(t))),(async e=>{return a.setItem(t,(s=e(),JSON.stringify(s,((e,t)=>t instanceof Map?o.fromEntries([...t]):t))));var s}),(e=>{const s=s=>{s.storageArea===a&&s.key===t&&e((()=>l(s.newValue)))};return C.addEventListener(w,s),s}),(e=>C.removeEventListener(w,e)),r,0,["getStorageName",t]);e.createLocalPersister=(e,t,a)=>S(e,t,localStorage,a),e.createSessionPersister=(e,t,a)=>S(e,t,sessionStorage,a)},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBasePersisterBrowser={});

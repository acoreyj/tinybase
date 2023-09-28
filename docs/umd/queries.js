var e,t;e=this,t=function(e){"use strict";const t=e=>typeof e,n=t(""),s=t(!0),r=t(0),o=t(t),a="Listener",i="Result",l="Ids",d="Table",c="Row",u=c+"Count",f=c+l,h="Sorted"+c+l,g="Cell",v=g+l,w=(e,t)=>e.every(t),L=(e,t)=>e.forEach(t),y=e=>T(e,((e,t)=>e+t),0),R=e=>e.length,p=e=>0==R(e),T=(e,t,n)=>e.reduce(t,n),b=(e,...t)=>e.push(...t),m=Math.max,C=Math.min,Q=isFinite,S=e=>null==e,I=(e,t,n)=>S(e)?n?.():t(e),x=e=>t(e)==o,E=e=>Array.isArray(e),M=()=>{},j=Object,D=j.freeze,k=e=>e?.size??0,z=(e,t)=>e?.has(t)??!1,A=e=>S(e)||0==k(e),F=e=>[...e?.values()??[]],B=e=>e.clear(),O=(e,t)=>e?.forEach(t),W=(e,t)=>e?.delete(t),q=e=>new Map(e),G=(e,t)=>e?.get(t),H=(e,t)=>O(e,((e,n)=>t(n,e))),J=(e,t,n)=>S(n)?(W(e,t),e):e?.set(t,n),K=(e,t,n)=>(z(e,t)||J(e,t,n()),G(e,t)),N=(e,t,n,s,r=0)=>I((n?K:G)(e,t[r],r>R(t)-2?n:q),(o=>{if(r>R(t)-2)return s?.(o)&&J(e,t[r]),o;const a=N(o,t,n,s,r+1);return A(o)&&J(e,t[r]),a})),P=e=>new Set(E(e)||S(e)?e:[e]),U=(e,t)=>e?.add(t),V=q([["avg",[(e,t)=>y(e)/t,(e,t,n)=>e+(t-e)/(n+1),(e,t,n)=>e+(e-t)/(n-1),(e,t,n,s)=>e+(t-n)/s]],["max",[e=>m(...e),(e,t)=>m(t,e),(e,t)=>t==e?void 0:e,(e,t,n)=>n==e?void 0:m(t,e)]],["min",[e=>C(...e),(e,t)=>C(t,e),(e,t)=>t==e?void 0:e,(e,t,n)=>n==e?void 0:C(t,e)]],["sum",[e=>y(e),(e,t)=>e+t,(e,t)=>e-t,(e,t,n)=>e-n+t]]]),X=(e=>{const o=new WeakMap;return e=>(o.has(e)||o.set(e,(e=>{const o=e.createStore,l=o(),y=o(),T=q(),{addListener:m,callListeners:C,delListener:X}=y,[Y,Z,$,_,ee,,,te,,ne,se,re,oe,ae]=((e,t,n,s,r)=>{const o=e.hasRow,a=q(),i=q(),l=q(),d=q(),c=q(),u=q(),f=(t,n,...s)=>{const r=K(u,t,P);return L(s,(t=>U(r,t)&&n&&e.callListener(t))),s},h=(t,...n)=>I(G(u,t),(s=>{L(p(n)?F(s):n,(t=>{e.delListener(t),W(s,t)})),A(s)&&J(u,t)})),g=(e,t)=>{J(a,e,t),z(i,e)||(J(i,e,!0),J(d,e,q()),J(c,e,q()),r(l))},v=e=>{J(a,e),J(i,e),J(d,e),J(c,e),h(e),r(l)};return[()=>e,()=>{return e=a,[...e?.keys()??[]];var e},e=>H(i,e),e=>z(i,e),e=>G(a,e),e=>G(i,e),(e,t)=>J(i,e,t),g,(t,s,r,a,i)=>{g(t,s);const l=q(),u=q(),v=G(d,t),y=G(c,t),p=t=>{const r=n=>e.getCell(s,t,n),d=G(v,t),c=o(s,t)?n(a(r,t)):void 0;var f,h;if(d===c||E(d)&&E(c)&&(h=c,R(f=d)===R(h)&&w(f,((e,t)=>h[t]===e)))||J(l,t,[d,c]),!S(i)){const e=G(y,t),n=o(s,t)?i(r,t):void 0;e!=n&&J(u,t,n)}},T=e=>{r((()=>{O(l,(([,e],t)=>J(v,t,e))),O(u,((e,t)=>J(y,t,e)))}),l,u,v,y,e),B(l),B(u)};H(v,p),e.hasTable(s)&&L(e.getRowIds(s),(e=>{z(v,e)||p(e)})),T(!0),h(t),f(t,0,e.addRowListener(s,null,((e,t,n)=>p(n))),e.addTableListener(s,(()=>T())))},v,e=>s(e,l),()=>H(u,v),f,h]})(e,0,M,m,C),ie=(e,t,...n)=>L(n,(n=>U(K(K(T,t,q),e,P),n))),le=e=>{I(G(T,e),(e=>{H(e,((e,t)=>O(t,(t=>e.delListener(t))))),B(e)})),L([y,l],(t=>t.delTable(e)))},de=(e,t,n)=>ie(t,e,t.addStartTransactionListener(n.startTransaction),t.addDidFinishTransactionListener((()=>n.finishTransaction()))),ce={setQueryDefinition:(o,a,i)=>{te(o,a),le(o);const d=[],c=[[null,[a,null,null,[],q()]]],u=[],f=[],h=[];i({select:(e,t)=>{const n=x(e)?[R(d)+"",e]:[S(t)?e:t,n=>n(e,t)];return b(d,n),{as:e=>n[0]=e}},join:(e,t,n)=>{const s=S(n)||x(t)?null:t,r=S(s)?t:n,o=[e,[e,s,x(r)?r:e=>e(r),[],q()]];return b(c,o),{as:e=>o[0]=e}},where:(e,t,n)=>b(u,x(e)?e:S(n)?n=>n(e)===t:s=>s(e,t)===n),group:(e,t,n,s,r)=>{const o=[e,[e,x(t)?[t,n,s,r]:G(V,t)??[(e,t)=>t]]];return b(f,o),{as:e=>o[0]=e}},having:(e,t)=>b(h,x(e)?e:n=>n(e)===t)});const g=q(d);if(A(g))return ce;const v=q(c);H(v,((e,[,t])=>I(G(v,t),(({3:t})=>S(e)?0:b(t,e)))));const T=q(f);let m=l;if(A(T)&&p(h))m=y;else{de(o,m,y);const e=q();H(T,((t,[n,s])=>U(K(e,n,P),[t,s])));const a=P();H(g,(t=>z(e,t)?0:U(a,t)));const i=q(),l=(a,i,l,d)=>I(a,(([c,u,f,g])=>{H(i,((o,[a])=>{const i=K(c,o,q),u=G(i,l),f=d?void 0:a;if(u!==f){const a=P([[u,f]]),d=k(i);J(i,l,f),O(G(e,o),(([e,o])=>{const l=((e,t,n,s,r,o=!1)=>{if(A(n))return;const[a,i,l,d]=r;return o||=S(e),O(s,(([n,s])=>{o||(e=S(n)?i?.(e,s,t++):S(s)?l?.(e,n,t--):d?.(e,s,n,t),o||=S(e))})),o?a(F(n),k(n)):e})(g[e],d,i,a,o);g[e]=S((e=>{const o=t(e);return(e=>e==n||e==s)(o)||o==r&&Q(e)?o:void 0})(l))?null:l}))}})),A(u)||!w(h,(e=>e((e=>g[e]))))?y.delRow(o,f):S(f)?a[2]=y.addRow(o,g):y.setRow(o,f,g)}));ie(m,o,m.addRowListener(o,null,((t,n,s,r)=>{const d=[],c=[],u=q(),f=m.hasRow(o,s);let h=!f;O(a,(e=>{const[t,n,a]=r(o,s,e);b(d,n),b(c,a),h||=t})),H(e,(e=>{const[t,,n]=r(o,s,e);(h||t)&&J(u,e,[n])})),h&&l(N(i,d,void 0,(([,e])=>(W(e,s),A(e)))),u,s,1),f&&l(N(i,c,(()=>{const e={};return O(a,(t=>e[t]=m.getCell(o,s,t))),[q(),P(),void 0,e]}),(([,e])=>{U(e,s)})),u,s)})))}de(o,e,m);const C=(t,n,s,r)=>{const i=t=>e.getCell(n,s,t);L(r,(n=>{const[s,,r,a,l]=G(v,n),d=r?.(i,t),[c,u]=G(l,t)??[];d!=c&&(S(u)||ae(o,u),J(l,t,S(d)?null:[d,...oe(o,1,e.addRowListener(s,d,(()=>C(t,s,d,a))))]))})),(t=>{const n=(n,s)=>e.getCell(...S(s)?[a,t,n]:n===a?[a,t,s]:[G(v,n)?.[0],G(G(v,n)?.[4],t)?.[0],s]);m.transaction((()=>w(u,(e=>e(n)))?H(g,((e,s)=>((e,t,n,s,r)=>S(r)?e.delCell(t,n,s,!0):e.setCell(t,n,s,r))(m,o,t,e,s(n,t)))):m.delRow(o,t)))})(t)},{3:E}=G(v,null);return m.transaction((()=>oe(o,1,e.addRowListener(a,null,((t,n,s)=>{e.hasRow(a,s)?C(s,a,s,E):(m.delRow(o,s),O(v,(({4:e})=>I(G(e,s),(([,t])=>{ae(o,t),J(e,s)})))))}))))),ce},delQueryDefinition:e=>(le(e),ne(e),ce),getStore:Y,getQueryIds:Z,forEachQuery:$,hasQuery:_,getTableId:ee,addQueryIdsListener:e=>se((()=>e(ce))),delListener:e=>(X(e),ce),destroy:re,getListenerStats:()=>{const{tables:e,tableIds:t,transaction:n,...s}=y.getListenerStats();return s}};var ue,fe;return ue={[d]:[1,1],[d+v]:[0,1],[u]:[0,1],[f]:[0,1],[h]:[0,5],[c]:[1,2],[v]:[0,2],[g]:[1,3]},fe=([e,t],n)=>{L(e?["get","has","forEach"]:["get"],(e=>ce[e+i+n]=(...t)=>y[e+n](...t))),ce["add"+i+n+a]=(...e)=>{return y["add"+n+a](...(s=e,0,r=t,s.slice(0,r)),((n,...s)=>e[t](ce,...s)),!0);var s,r}},((e,t)=>{e.map(t)})(j.entries(ue),(([e,t])=>fe(t,e))),D(ce)})(e)),o.get(e))})();e.createQueries=X},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseQueries={});

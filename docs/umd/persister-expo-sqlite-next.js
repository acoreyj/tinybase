var a,t;a=this,t=function(a,t){"use strict";const e=a=>typeof a,s="tinybase",n="",i=",",o=e(n),c=(a,t)=>a.repeat(t),r=Promise,l=clearInterval,y=a=>null==a,w=(a,t,e)=>y(a)?e?.():t(a),d=a=>e(a)==o,u=(a,t,e)=>a.slice(t,e),p=a=>a.length,E=async a=>r.all(a),f=(a,t="")=>a.join(t),v=(a,t)=>a.map(t),m=a=>0==p(a),A=(a,t)=>a.filter(t),h=(a,...t)=>a.push(...t),g=(a,t)=>a?.has(t)??!1,N=a=>[...a?.values()??[]],T=(a,t)=>a?.delete(t),O=Object,C=a=>O.getPrototypeOf(a),L=O.entries,S=O.keys,R=O.freeze,b=(a=[])=>O.fromEntries(a),x=(...a)=>O.assign({},...a),D=(a,t)=>t in a,I=(a,t)=>v(L(a),(([a,e])=>t(e,a))),P=a=>O.values(a),M=a=>p(S(a)),$=a=>(a=>!y(a)&&w(C(a),(a=>a==O.prototype||y(C(a))),(()=>!0)))(a)&&0==M(a),_=a=>new Map(a),F=a=>[...a?.keys()??[]],q=(a,t)=>a?.get(t),j=(a,t)=>v([...a?.entries()??[]],(([a,e])=>t(e,a))),B=(a,t,e)=>y(e)?(T(a,t),a):a?.set(t,e),H=(a,t,e,s)=>(g(a,t)||B(a,t,e()),q(a,t)),J=(a,t,e,s=B)=>(I(t,((t,s)=>e(a,s,t))),((a,t)=>{((a,t)=>{a?.forEach(t)})(a,((a,e)=>t(e)))})(a,(e=>D(t,e)?0:s(a,e))),a),Y="_",k="_id",G=a=>`"${a.replace(/"/g,'""')}"`,U="SELECT",W=a=>new Set(Array.isArray(a)||y(a)?a:[a]),z=(a,t)=>a?.add(t),K="TABLE",V="ALTER "+K,Q="DELETE FROM",X=U+"*FROM",Z="FROM pragma_table_",aa="WHERE",ta=(a,t,e,s)=>{const o=_();return[async()=>J(o,b(await E(v(await a("SELECT name "+Z+"list WHERE schema='main'AND(type='table'OR type='view')AND name IN("+sa(t)+")ORDER BY name",t),(async({name:t})=>[t,b(v(await a(U+" name,type "+Z+"info(?)",[t]),(({name:a,type:t})=>[a,t])))])))),((a,t,e)=>B(o,t,J(H(o,t,_),e,((a,t,e)=>{e!=q(a,t)&&B(a,t,e)}),((a,t)=>B(a,t))))),((a,t)=>B(o,t))),async(t,e)=>((a,t)=>!y(q(q(o,a),t)))(t,e)?b(A(v(await a(X+G(t)),(a=>{return[a[e],(t={...a},s=e,delete t[s],t)];var t,s})),(([a,t])=>!y(a)&&!$(t)))):{},async(t,e,c,r,l,w=!1)=>{const d=W();I(c??{},(a=>v(S(a??{}),(a=>z(d,a)))));const u=N(d);if(!w&&l&&m(u)&&g(o,t))return await a("DROP "+K+G(t)),void B(o,t);if(m(u)||g(o,t)){const s=q(o,t),i=W(F(s));await E([...v(u,(async e=>{T(i,e)||(await a(V+G(t)+"ADD"+G(e)),B(s,e,n))})),...!w&&r?v(N(i),(async n=>{n!=e&&(await a(V+G(t)+"DROP"+G(n)),B(s,n))})):[]])}else await a("CREATE "+K+G(t)+"("+G(e)+` PRIMARY KEY ON CONFLICT REPLACE${f(v(u,(a=>i+G(a))))});`),B(o,t,_([[e,n],...v(u,(a=>[a,n]))]));if(w)y(c)?await a(Q+G(t)+aa+" 1"):await E(I(c,(async(n,i)=>{y(n)?await a(Q+G(t)+aa+G(e)+"=?",[i]):m(u)||await ea(a,t,e,S(n),[i,...P(n)],s)})));else if(m(u))g(o,t)&&await a(Q+G(t)+aa+" 1");else{const n=A(F(q(o,t)),(a=>a!=e)),i=[],r=[];I(c??{},((a,t)=>{h(i,t,...v(n,(t=>a?.[t]))),h(r,t)})),await ea(a,t,e,n,i,s),await a(Q+G(t)+aa+G(e)+"NOT IN("+sa(r)+")",r)}},async t=>{let s;await a("BEGIN");try{s=await t()}catch(a){e?.(a)}return await a("END"),s}]},ea=async(a,t,e,s,o,r=!0)=>await a("INSERT "+(r?n:"OR REPLACE ")+"INTO"+G(t)+"("+G(e)+f(v(s,(a=>i+G(a))))+")VALUES"+u(c(`,(?${c(",?",p(s))})`,p(o)/(p(s)+1)),1)+(r?"ON CONFLICT("+G(e)+")DO UPDATE SET"+f(v(s,(a=>G(a)+"=excluded."+G(a))),i):n),v(o,(a=>a??null))),sa=a=>f(v(a,(()=>"?")),i),na=JSON.parse,ia=_(),oa=_(),ca=(a,t,e,s,n,i,o,c={},r=[])=>{let l,u,p,E=0;H(ia,r,(()=>0)),H(oa,r,(()=>[]));const[f,v,m,A]=((a,t)=>[0,t.getContent,t.getTransactionChanges,([a,t])=>!$(a)||!$(t)])(0,a),g=async a=>(2!=E&&(E=1,await T.schedule((async()=>{await a(),E=0}))),T),N=t=>{(f&&d(t?.[0])?1===t?.[1][2]?a.applyMergeableChanges:a.setMergeableContent:1===t?.[2]?a.applyChanges:a.setContent)(t)},T={load:async(e,s)=>await g((async()=>{try{N(await t())}catch(t){i?.(t),a.setContent([e,s])}})),startAutoLoad:async(a={},e={})=>(await T.stopAutoLoad().load(a,e),u=s((async(a,e)=>{const s=e?.();await g((async()=>{try{N(s??a?.()??await t())}catch(a){i?.(a)}}))})),T),stopAutoLoad:()=>(u&&(n(u),u=void 0),T),isAutoLoading:()=>!y(u),save:async a=>(1!=E&&(E=2,await T.schedule((async()=>{try{await e(v,a)}catch(a){i?.(a)}E=0}))),T),startAutoSave:async()=>(await T.stopAutoSave().save(),p=a.addDidFinishTransactionListener((()=>{const a=m();A(a)&&T.save((()=>a))})),T),stopAutoSave:()=>(w(p,a.delListener),p=void 0,T),isAutoSaving:()=>!y(p),schedule:async(...a)=>(h(q(oa,r),...a),await(async()=>{if(!q(ia,r)){for(B(ia,r,1);!y((a=q(oa,r),l=a.shift()));)try{await l()}catch(a){i?.(a)}B(ia,r,0)}var a})(),T),getStore:()=>a,destroy:()=>T.stopAutoLoad().stopAutoSave(),getStats:()=>({}),...c};return R(T)},ra="store",la=(a,t,e,s,n,[i],o,c,r,l)=>{const[y,w,d,u]=ta(t,o,n,l);return ca(a,(async()=>await u((async()=>(await y(),na((await w(i,k))[Y]?.[ra]??"null"))))),(async a=>await u((async()=>{var t;await y(),await d(i,k,{[Y]:{[ra]:(t=a()??null,JSON.stringify(t,((a,t)=>t instanceof Map?O.fromEntries([...t]):t)))}},!0,!0)}))),e,s,n,0,{[r]:()=>c},c)},ya=(a,t,e,s,n,[i,o,[c,r,l]],w,d,u,p)=>{const[f,v,m,h]=ta(t,w,n,p),g=async(a,t)=>await E(j(o,(async([e,s,n,i],o)=>{t&&!D(a,o)||await m(e,s,a[o],n,i,t)}))),N=async(a,t)=>r?await m(l,k,{[Y]:a},!0,!0,t):null;return ca(a,(async()=>await h((async()=>{await f();const a=await(async()=>b(A(await E(j(i,(async([a,t],e)=>[a,await v(e,t)]))),(a=>!$(a[1])))))(),t=await(async()=>c?(await v(l,k))[Y]:{})();return $(a)&&y(t)?void 0:[a,t]}))),(async(a,t)=>await h((async()=>{if(await f(),y(t)){const[t,e]=a();await g(t),await N(e)}else{const[a,e]=t();await g(a,!0),await N(e,!0)}}))),e,s,n,0,{[u]:()=>d},d)},wa="json",da="autoLoadIntervalSeconds",ua="storeTableName",pa="rowIdColumnName",Ea="tableId",fa="tableName",va="deleteEmptyColumns",ma="deleteEmptyTable",Aa={mode:wa,[da]:1},ha={load:0,save:0,[fa]:s+"_values"},ga=(a,t,e,s)=>{const n=_();return I(a,((a,i)=>{const o=u(P(x(t,d(a)?{[e]:a}:a)),0,M(t));y(o[0])||s(i,o[0])||B(n,i,o)})),n},Na="pragma_",Ta="data_version",Oa="schema_version",Ca=(a,t,e,n,i,o,c,r,y="getDb",w)=>{let p,E,f;const[v,m,A,h]=(a=>{const t=(a=>x(Aa,d(a)?{[ua]:a}:a??{}))(a),e=t[da];if(t.mode==wa){const{storeTableName:a=s}=t;return[1,e,[a],W(a)]}const{tables:{load:n={},save:i={}}={},values:o={}}=t,c=u(P(x(ha,o)),0,M(ha)),r=c[2],l=W(r);return[0,e,[ga(n,{[Ea]:null,[pa]:k},Ea,(a=>z(l,a)&&a==r)),ga(i,{[fa]:null,[pa]:k,[va]:0,[ma]:0},fa,((a,t)=>z(l,t)&&t==r)),c],l]})(t);return(v?la:ya)(a,o?async(a,t)=>(o(a,t),await e(a,t)):e,(a=>{return[(t=async()=>{try{const[{d:t,s:s,c:n}]=await e(`SELECT ${Ta} d,${Oa} s,TOTAL_CHANGES() c FROM ${Na}${Ta} JOIN ${Na}${Oa}`);t==(p??=t)&&s==(E??=s)&&n==(f??=n)||(a(),p=t,E=s)}catch{}},s=m,t(),setInterval(t,1e3*s)),n((t=>h.has(t)?a():0))];var t,s}),(([a,t])=>{l(a),p=E=f=null,i(t)}),c,A,N(h),r,y,w)};a.createExpoSqliteNextPersister=(a,e,s,n,i)=>Ca(a,s,(async(a,t=[])=>await e.getAllAsync(a,t)),(a=>t.addDatabaseChangeListener((({tableName:t})=>a(t)))),(a=>a.remove()),n,i,e)},"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("expo-sqlite/next")):"function"==typeof define&&define.amd?define(["exports","expo-sqlite/next"],t):t((a="undefined"!=typeof globalThis?globalThis:a||self).TinyBasePersisterExpoSqliteNext={},a["expo-sqlite/next"]);

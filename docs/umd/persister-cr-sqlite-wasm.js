var a,t;a=this,t=function(a){"use strict";const t=a=>typeof a,e="tinybase",s="",n=",",i=t(s),o=(a,t)=>a.repeat(t),c=Promise,r=clearInterval,l=a=>null==a,y=(a,t,e)=>l(a)?e?.():t(a),w=a=>t(a)==i,d=(a,t,e)=>a.slice(t,e),u=a=>a.length,p=async a=>c.all(a),E=(a,t="")=>a.join(t),f=(a,t)=>a.map(t),m=a=>0==u(a),v=(a,t)=>a.filter(t),A=(a,...t)=>a.push(...t),h=(a,t)=>a?.has(t)??!1,T=a=>[...a?.values()??[]],O=(a,t)=>a?.delete(t),g=Object,C=a=>g.getPrototypeOf(a),N=g.entries,L=g.keys,S=g.freeze,R=(a=[])=>g.fromEntries(a),b=(...a)=>g.assign({},...a),I=(a,t)=>t in a,D=(a,t)=>f(N(a),(([a,e])=>t(e,a))),P=a=>g.values(a),M=a=>u(L(a)),$=a=>(a=>!l(a)&&y(C(a),(a=>a==g.prototype||l(C(a))),(()=>!0)))(a)&&0==M(a),_=a=>new Map(a),F=a=>[...a?.keys()??[]],x=(a,t)=>a?.get(t),j=(a,t)=>f([...a?.entries()??[]],(([a,e])=>t(e,a))),B=(a,t,e)=>l(e)?(O(a,t),a):a?.set(t,e),W=(a,t,e,s)=>(h(a,t)||B(a,t,e()),x(a,t)),H=(a,t,e,s=B)=>(D(t,((t,s)=>e(a,s,t))),((a,t)=>{((a,t)=>{a?.forEach(t)})(a,((a,e)=>t(e)))})(a,(e=>I(t,e)?0:s(a,e))),a),J="_",U="_id",Y=a=>`"${a.replace(/"/g,'""')}"`,k="SELECT",q=a=>new Set(Array.isArray(a)||l(a)?a:[a]),G=(a,t)=>a?.add(t),z="TABLE",K="ALTER "+z,V="DELETE FROM",Q=k+"*FROM",X="FROM pragma_table_",Z="WHERE",aa=(a,t,e,i)=>{const o=_();return[async()=>H(o,R(await p(f(await a("SELECT name "+X+"list WHERE schema='main'AND(type='table'OR type='view')AND name IN("+ea(t)+")ORDER BY name",t),(async({name:t})=>[t,R(f(await a(k+" name,type "+X+"info(?)",[t]),(({name:a,type:t})=>[a,t])))])))),((a,t,e)=>B(o,t,H(W(o,t,_),e,((a,t,e)=>{e!=x(a,t)&&B(a,t,e)}),((a,t)=>B(a,t))))),((a,t)=>B(o,t))),async(t,e)=>((a,t)=>!l(x(x(o,a),t)))(t,e)?R(v(f(await a(Q+Y(t)),(a=>{return[a[e],(t={...a},s=e,delete t[s],t)];var t,s})),(([a,t])=>!l(a)&&!$(t)))):{},async(t,e,c,r,y,w=!1)=>{const d=q();D(c??{},(a=>f(L(a??{}),(a=>G(d,a)))));const u=T(d);if(!w&&y&&m(u)&&h(o,t))return await a("DROP "+z+Y(t)),void B(o,t);if(m(u)||h(o,t)){const n=x(o,t),i=q(F(n));await p([...f(u,(async e=>{O(i,e)||(await a(K+Y(t)+"ADD"+Y(e)),B(n,e,s))})),...!w&&r?f(T(i),(async s=>{s!=e&&(await a(K+Y(t)+"DROP"+Y(s)),B(n,s))})):[]])}else await a("CREATE "+z+Y(t)+"("+Y(e)+` PRIMARY KEY ON CONFLICT REPLACE${E(f(u,(a=>n+Y(a))))});`),B(o,t,_([[e,s],...f(u,(a=>[a,s]))]));if(w)l(c)?await a(V+Y(t)+Z+" 1"):await p(D(c,(async(s,n)=>{l(s)?await a(V+Y(t)+Z+Y(e)+"=?",[n]):m(u)||await ta(a,t,e,L(s),[n,...P(s)],i)})));else if(m(u))h(o,t)&&await a(V+Y(t)+Z+" 1");else{const s=v(F(x(o,t)),(a=>a!=e)),n=[],r=[];D(c??{},((a,t)=>{A(n,t,...f(s,(t=>a?.[t]))),A(r,t)})),await ta(a,t,e,s,n,i),await a(V+Y(t)+Z+Y(e)+"NOT IN("+ea(r)+")",r)}},async t=>{let s;await a("BEGIN");try{s=await t()}catch(a){e?.(a)}return await a("END"),s}]},ta=async(a,t,e,i,c,r=!0)=>await a("INSERT "+(r?s:"OR REPLACE ")+"INTO"+Y(t)+"("+Y(e)+E(f(i,(a=>n+Y(a))))+")VALUES"+d(o(`,(?${o(",?",u(i))})`,u(c)/(u(i)+1)),1)+(r?"ON CONFLICT("+Y(e)+")DO UPDATE SET"+E(f(i,(a=>Y(a)+"=excluded."+Y(a))),n):s),f(c,(a=>a??null))),ea=a=>E(f(a,(()=>"?")),n),sa=JSON.parse,na=_(),ia=_(),oa=(a,t,e,s,n,i,o,c={},r=[])=>{let d,u,p,E=0;W(na,r,(()=>0)),W(ia,r,(()=>[]));const[f,m,v,h]=((a,t)=>[0,t.getContent,t.getTransactionChanges,([a,t])=>!$(a)||!$(t)])(0,a),T=async a=>(2!=E&&(E=1,await g.schedule((async()=>{await a(),E=0}))),g),O=t=>{(f&&w(t?.[0])?1===t?.[1][2]?a.applyMergeableChanges:a.setMergeableContent:1===t?.[2]?a.applyChanges:a.setContent)(t)},g={load:async(e,s)=>await T((async()=>{try{O(await t())}catch(t){i?.(t),a.setContent([e,s])}})),startAutoLoad:async(a={},e={})=>(await g.stopAutoLoad().load(a,e),u=s((async(a,e)=>{const s=e?.();await T((async()=>{try{O(s??a?.()??await t())}catch(a){i?.(a)}}))})),g),stopAutoLoad:()=>(u&&(n(u),u=void 0),g),isAutoLoading:()=>!l(u),save:async a=>(1!=E&&(E=2,await g.schedule((async()=>{try{await e(m,a)}catch(a){i?.(a)}E=0}))),g),startAutoSave:async()=>(await g.stopAutoSave().save(),p=a.addDidFinishTransactionListener((()=>{const a=v();h(a)&&g.save((()=>a))})),g),stopAutoSave:()=>(y(p,a.delListener),p=void 0,g),isAutoSaving:()=>!l(p),schedule:async(...a)=>(A(x(ia,r),...a),await(async()=>{if(!x(na,r)){for(B(na,r,1);!l((a=x(ia,r),d=a.shift()));)try{await d()}catch(a){i?.(a)}B(na,r,0)}var a})(),g),getStore:()=>a,destroy:()=>g.stopAutoLoad().stopAutoSave(),getStats:()=>({}),...c};return S(g)},ca="store",ra=(a,t,e,s,n,[i],o,c,r,l)=>{const[y,w,d,u]=aa(t,o,n,l);return oa(a,(async()=>await u((async()=>(await y(),sa((await w(i,U))[J]?.[ca]??"null"))))),(async a=>await u((async()=>{var t;await y(),await d(i,U,{[J]:{[ca]:(t=a()??null,JSON.stringify(t,((a,t)=>t instanceof Map?g.fromEntries([...t]):t)))}},!0,!0)}))),e,s,n,0,{[r]:()=>c},c)},la=(a,t,e,s,n,[i,o,[c,r,y]],w,d,u,E)=>{const[f,m,A,h]=aa(t,w,n,E),T=async(a,t)=>await p(j(o,(async([e,s,n,i],o)=>{t&&!I(a,o)||await A(e,s,a[o],n,i,t)}))),O=async(a,t)=>r?await A(y,U,{[J]:a},!0,!0,t):null;return oa(a,(async()=>await h((async()=>{await f();const a=await(async()=>R(v(await p(j(i,(async([a,t],e)=>[a,await m(e,t)]))),(a=>!$(a[1])))))(),t=await(async()=>c?(await m(y,U))[J]:{})();return $(a)&&l(t)?void 0:[a,t]}))),(async(a,t)=>await h((async()=>{if(await f(),l(t)){const[t,e]=a();await T(t),await O(e)}else{const[a,e]=t();await T(a,!0),await O(e,!0)}}))),e,s,n,0,{[u]:()=>d},d)},ya="json",wa="autoLoadIntervalSeconds",da="storeTableName",ua="rowIdColumnName",pa="tableId",Ea="tableName",fa="deleteEmptyColumns",ma="deleteEmptyTable",va={mode:ya,[wa]:1},Aa={load:0,save:0,[Ea]:e+"_values"},ha=(a,t,e,s)=>{const n=_();return D(a,((a,i)=>{const o=d(P(b(t,w(a)?{[e]:a}:a)),0,M(t));l(o[0])||s(i,o[0])||B(n,i,o)})),n},Ta="pragma_",Oa="data_version",ga="schema_version",Ca=(a,t,s,n,i,o,c,l,y="getDb",u)=>{let p,E,f;const[m,v,A,h]=(a=>{const t=(a=>b(va,w(a)?{[da]:a}:a??{}))(a),s=t[wa];if(t.mode==ya){const{storeTableName:a=e}=t;return[1,s,[a],q(a)]}const{tables:{load:n={},save:i={}}={},values:o={}}=t,c=d(P(b(Aa,o)),0,M(Aa)),r=c[2],l=q(r);return[0,s,[ha(n,{[pa]:null,[ua]:U},pa,(a=>G(l,a)&&a==r)),ha(i,{[Ea]:null,[ua]:U,[fa]:0,[ma]:0},Ea,((a,t)=>G(l,t)&&t==r)),c],l]})(t);return(m?ra:la)(a,o?async(a,t)=>(o(a,t),await s(a,t)):s,(a=>{return[(t=async()=>{try{const[{d:t,s:e,c:n}]=await s(`SELECT ${Oa} d,${ga} s,TOTAL_CHANGES() c FROM ${Ta}${Oa} JOIN ${Ta}${ga}`);t==(p??=t)&&e==(E??=e)&&n==(f??=n)||(a(),p=t,E=e)}catch{}},e=v,t(),setInterval(t,1e3*e)),n((t=>h.has(t)?a():0))];var t,e}),(([a,t])=>{r(a),p=E=f=null,i(t)}),c,A,T(h),l,y,u)};a.createCrSqliteWasmPersister=(a,t,e,s,n)=>Ca(a,e,(async(a,e=[])=>await t.execO(a,e)),(a=>t.onUpdate(((t,e,s)=>a(s)))),(a=>a()),s,n,t)},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((a="undefined"!=typeof globalThis?globalThis:a||self).TinyBasePersisterCrSqliteWasm={});

var a,t;a=this,t=function(a){"use strict";const t=a=>typeof a,e="tinybase",s="",n=",",i=t(s),o=(a,t)=>a.repeat(t),c=Promise,r=clearInterval,l=a=>null==a,y=(a,t,e)=>l(a)?e?.():t(a),w=a=>t(a)==i,u=(a,t,e)=>a.slice(t,e),d=a=>a.length,p=async a=>c.all(a),E=(a,t="")=>a.join(t),f=(a,t)=>a.map(t),m=a=>0==d(a),v=(a,t)=>a.filter(t),h=(a,...t)=>a.push(...t),T=(a,t)=>a?.has(t)??!1,A=a=>[...a?.values()??[]],O=(a,t)=>a?.delete(t),N=Object,C=a=>N.getPrototypeOf(a),R=N.entries,g=N.keys,L=N.freeze,S=(a=[])=>N.fromEntries(a),b=(...a)=>N.assign({},...a),I=(a,t)=>t in a,D=(a,t)=>f(R(a),(([a,e])=>t(e,a))),_=a=>N.values(a),P=a=>d(g(a)),M=a=>(a=>!l(a)&&y(C(a),(a=>a==N.prototype||l(C(a))),(()=>!0)))(a)&&0==P(a),$=a=>new Map(a),F=a=>[...a?.keys()??[]],j=(a,t)=>a?.get(t),x=(a,t)=>f([...a?.entries()??[]],(([a,e])=>t(e,a))),k=(a,t,e)=>l(e)?(O(a,t),a):a?.set(t,e),q=(a,t,e)=>(T(a,t)||k(a,t,e()),j(a,t)),B=(a,t,e,s=k)=>(D(t,((t,s)=>e(a,s,t))),((a,t)=>{((a,t)=>{a?.forEach(t)})(a,((a,e)=>t(e)))})(a,(e=>I(t,e)?0:s(a,e))),a),W=a=>new Set(Array.isArray(a)||l(a)?a:[a]),H=(a,t)=>a?.add(t),J="_",Y="_id",G=a=>`"${a.replace(/"/g,'""')}"`,U="SELECT",V="TABLE",z="ALTER "+V,K="DELETE FROM",Q=U+"*FROM",X="FROM pragma_table_",Z="WHERE",aa=(a,t,e,i)=>{const o=$();return[async()=>B(o,S(await p(f(await a("SELECT name "+X+"list WHERE schema='main'AND(type='table'OR type='view')AND name IN("+ea(t)+")ORDER BY name",t),(async({name:t})=>[t,S(f(await a(U+" name,type "+X+"info(?)",[t]),(({name:a,type:t})=>[a,t])))])))),((a,t,e)=>k(o,t,B(q(o,t,$),e,((a,t,e)=>{e!=j(a,t)&&k(a,t,e)}),((a,t)=>k(a,t))))),((a,t)=>k(o,t))),async(t,e)=>((a,t)=>!l(j(j(o,a),t)))(t,e)?S(v(f(await a(Q+G(t)),(a=>{return[a[e],(t={...a},s=e,delete t[s],t)];var t,s})),(([a,t])=>!l(a)&&!M(t)))):{},async(t,e,c,r,y,w=!1)=>{const u=W();D(c??{},(a=>f(g(a??{}),(a=>H(u,a)))));const d=A(u);if(!w&&y&&m(d)&&T(o,t))return await a("DROP "+V+G(t)),void k(o,t);if(m(d)||T(o,t)){const n=j(o,t),i=W(F(n));await p([...f(d,(async e=>{O(i,e)||(await a(z+G(t)+"ADD"+G(e)),k(n,e,s))})),...!w&&r?f(A(i),(async s=>{s!=e&&(await a(z+G(t)+"DROP"+G(s)),k(n,s))})):[]])}else await a("CREATE "+V+G(t)+"("+G(e)+` PRIMARY KEY ON CONFLICT REPLACE${E(f(d,(a=>n+G(a))))});`),k(o,t,$([[e,s],...f(d,(a=>[a,s]))]));if(w)l(c)?await a(K+G(t)+Z+" 1"):await p(D(c,(async(s,n)=>{l(s)?await a(K+G(t)+Z+G(e)+"=?",[n]):m(d)||await ta(a,t,e,g(s),[n,..._(s)],i)})));else if(m(d))T(o,t)&&await a(K+G(t)+Z+" 1");else{const s=v(F(j(o,t)),(a=>a!=e)),n=[],r=[];D(c??{},((a,t)=>{h(n,t,...f(s,(t=>a?.[t]))),h(r,t)})),await ta(a,t,e,s,n,i),await a(K+G(t)+Z+G(e)+"NOT IN("+ea(r)+")",r)}},async t=>{let s;await a("BEGIN");try{s=await t()}catch(a){e?.(a)}return await a("END"),s}]},ta=async(a,t,e,i,c,r=!0)=>await a("INSERT "+(r?s:"OR REPLACE ")+"INTO"+G(t)+"("+G(e)+E(f(i,(a=>n+G(a))))+")VALUES"+u(o(`,(?${o(",?",d(i))})`,d(c)/(d(i)+1)),1)+(r?"ON CONFLICT("+G(e)+")DO UPDATE SET"+E(f(i,(a=>G(a)+"=excluded."+G(a))),n):s),f(c,(a=>a??null))),ea=a=>E(f(a,(()=>"?")),n),sa=JSON.parse,na=$(),ia=$(),oa=(a,t,e,s,n,i,o,[c,r]=[],u=[])=>{let d,p,E,f=0,m=0;q(na,u,(()=>0)),q(ia,u,(()=>[]));const v=a.getContent,T=a.getTransactionChanges,A=async a=>(2!=f&&(f=1,await O.schedule((async()=>{await a(),f=0}))),O),O={load:async(e,s)=>await A((async()=>{try{const e=await t();(o&&w(e[0])?a.applyMergeableChanges:a.setContent)(e)}catch{a.setContent([e,s])}})),startAutoLoad:async(e={},n={})=>(O.stopAutoLoad(),await O.load(e,n),m=1,E=s((async(e,s)=>{if(s){const t=s();await A((async()=>a.applyChanges(t)))}else await A((async()=>{try{a.setContent(e?.()??await t())}catch(a){i?.(a)}}))})),O),stopAutoLoad:()=>(m&&(n(E),E=void 0,m=0),O),save:async a=>(1!=f&&(f=2,await O.schedule((async()=>{try{await e(v,a)}catch(a){i?.(a)}f=0}))),O),startAutoSave:async()=>(await O.stopAutoSave().save(),d=a.addDidFinishTransactionListener((()=>{const[a,t]=T();M(a)&&M(t)||O.save((()=>[a,t]))})),O),stopAutoSave:()=>(y(d,a.delListener),d=void 0,O),schedule:async(...a)=>(h(j(ia,u),...a),await(async()=>{if(!j(na,u)){for(k(na,u,1);!l((a=j(ia,u),p=a.shift()));)try{await p()}catch(a){i?.(a)}k(na,u,0)}var a})(),O),getStore:()=>a,destroy:()=>O.stopAutoLoad().stopAutoSave(),getStats:()=>({})};return c&&(O[c]=()=>r),L(O)},ca="store",ra=(a,t,e,s,n,[i],o,c,r,l)=>{const[y,w,u,d]=aa(t,o,n,l);return oa(a,(async()=>await d((async()=>(await y(),sa((await w(i,Y))[J]?.[ca]??"null"))))),(async a=>await d((async()=>{var t;await y(),await u(i,Y,{[J]:{[ca]:(t=a()??null,JSON.stringify(t,((a,t)=>t instanceof Map?N.fromEntries([...t]):t)))}},!0,!0)}))),e,s,n,!1,[r,c],c)},la=(a,t,e,s,n,[i,o,[c,r,y]],w,u,d,E)=>{const[f,m,h,T]=aa(t,w,n,E),A=async(a,t)=>await p(x(o,(async([e,s,n,i],o)=>{t&&!I(a,o)||await h(e,s,a[o],n,i,t)}))),O=async(a,t)=>r?await h(y,Y,{[J]:a},!0,!0,t):null;return oa(a,(async()=>await T((async()=>{await f();const a=await(async()=>S(v(await p(x(i,(async([a,t],e)=>[a,await m(e,t)]))),(a=>!M(a[1])))))(),t=await(async()=>c?(await m(y,Y))[J]:{})();return M(a)&&l(t)?void 0:[a,t]}))),(async(a,t)=>await T((async()=>{if(await f(),l(t)){const[t,e]=a();await A(t),await O(e)}else{const[a,e]=t();await A(a,!0),await O(e,!0)}}))),e,s,n,!1,[d,u],u)},ya="json",wa="autoLoadIntervalSeconds",ua="storeTableName",da="rowIdColumnName",pa="tableId",Ea="tableName",fa="deleteEmptyColumns",ma="deleteEmptyTable",va={mode:ya,[wa]:1},ha={load:0,save:0,[Ea]:e+"_values"},Ta=(a,t,e,s)=>{const n=$();return D(a,((a,i)=>{const o=u(_(b(t,w(a)?{[e]:a}:a)),0,P(t));l(o[0])||s(i,o[0])||k(n,i,o)})),n},Aa="pragma_",Oa="data_version",Na="schema_version",Ca=(a,t,s,n,i,o,c,l,y="getDb",d)=>{let p,E,f;const[m,v,h,T]=(a=>{const t=(a=>b(va,w(a)?{[ua]:a}:a??{}))(a),s=t[wa];if(t.mode==ya){const{storeTableName:a=e}=t;return[1,s,[a],W(a)]}const{tables:{load:n={},save:i={}}={},values:o={}}=t,c=u(_(b(ha,o)),0,P(ha)),r=c[2],l=W(r);return[0,s,[Ta(n,{[pa]:null,[da]:Y},pa,(a=>H(l,a)&&a==r)),Ta(i,{[Ea]:null,[da]:Y,[fa]:0,[ma]:0},Ea,((a,t)=>H(l,t)&&t==r)),c],l]})(t);return(m?ra:la)(a,o?async(a,t)=>(o(a,t),await s(a,t)):s,(a=>{return[(t=async()=>{try{const[{d:t,s:e,c:n}]=await s(`SELECT ${Oa} d,${Na} s,TOTAL_CHANGES() c FROM ${Aa}${Oa} JOIN ${Aa}${Na}`);t==(p??=t)&&e==(E??=e)&&n==(f??=n)||(a(),p=t,E=e)}catch{}},e=v,t(),setInterval(t,1e3*e)),n((t=>T.has(t)?a():0))];var t,e}),(([a,t])=>{r(a),p=E=f=null,i(t)}),c,h,A(T),l,y,d)};a.createSqliteWasmPersister=(a,t,e,s,n,i)=>Ca(a,s,(async(a,t=[])=>e.exec(a,{bind:t,rowMode:"object",returnValue:"resultRows"}).map((a=>({...a})))),(a=>t.capi.sqlite3_update_hook(e,((t,e,s,n)=>a(n)),0)),(()=>t.capi.sqlite3_update_hook(e,(()=>0),0)),n,i,e)},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((a="undefined"!=typeof globalThis?globalThis:a||self).TinyBasePersisterSqliteWasm={});

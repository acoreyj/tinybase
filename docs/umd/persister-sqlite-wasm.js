var a,t;a=this,t=function(a){"use strict";const t=a=>typeof a,e="tinybase",s="",n=",",i=t(s),o=(a,t)=>a.repeat(t),c=Promise,r=clearInterval,l=a=>null==a,y=(a,t,e)=>l(a)?e?.():t(a),w=a=>t(a)==i,d=(a,t,e)=>a.slice(t,e),u=a=>a.length,p=async a=>c.all(a),E=(a,t="")=>a.join(t),f=(a,t)=>a.map(t),m=a=>0==u(a),v=(a,t)=>a.filter(t),h=(a,...t)=>a.push(...t),T=(a,t)=>a?.has(t)??!1,A=a=>[...a?.values()??[]],O=(a,t)=>a?.delete(t),N=Object,R=a=>N.getPrototypeOf(a),L=N.keys,S=N.freeze,C=(a=[])=>N.fromEntries(a),b=(...a)=>N.assign({},...a),g=(a,t)=>f(N.entries(a),(([a,e])=>t(e,a))),I=a=>N.values(a),D=a=>u(L(a)),_=a=>(a=>!l(a)&&y(R(a),(a=>a==N.prototype||l(R(a))),(()=>!0)))(a)&&0==D(a),P=a=>new Map(a),$=a=>[...a?.keys()??[]],M=(a,t)=>a?.get(t),F=(a,t)=>f([...a?.entries()??[]],(([a,e])=>t(e,a))),j=(a,t,e)=>l(e)?(O(a,t),a):a?.set(t,e),x=(a,t,e)=>(T(a,t)||j(a,t,e()),M(a,t)),k=(a,t,e,s=j)=>(g(t,((t,s)=>e(a,s,t))),((a,t)=>{((a,t)=>{a?.forEach(t)})(a,((a,e)=>t(e)))})(a,(e=>((a,t)=>!l(((a,t)=>y(a,(a=>a[t])))(a,t)))(t,e)?0:s(a,e))),a),q="_",B="_id",W=a=>`"${a.replace(/"/g,'""')}"`,H="SELECT",J=a=>new Set(Array.isArray(a)||l(a)?a:[a]),Y=(a,t)=>a?.add(t),G="TABLE",U="ALTER "+G,V="DELETE FROM",z=H+"*FROM",K="FROM pragma_table_",Q="WHERE",X=(a,t,e,i)=>{const o=P();return[async()=>k(o,C(await p(f(await a("SELECT name "+K+"list WHERE schema='main'AND(type='table'OR type='view')AND name IN("+aa(t)+")ORDER BY name",t),(async({name:t})=>[t,C(f(await a(H+" name,type "+K+"info(?)",[t]),(({name:a,type:t})=>[a,t])))])))),((a,t,e)=>j(o,t,k(x(o,t,P),e,((a,t,e)=>{e!=M(a,t)&&j(a,t,e)}),((a,t)=>j(a,t))))),((a,t)=>j(o,t))),async(t,e)=>((a,t)=>!l(M(M(o,a),t)))(t,e)?C(v(f(await a(z+W(t)),(a=>{return[a[e],(t={...a},s=e,delete t[s],t)];var t,s})),(([a,t])=>!l(a)&&!_(t)))):{},async(t,e,c,r,y,w=!1)=>{const d=J();g(c??{},(a=>f(L(a??{}),(a=>Y(d,a)))));const u=A(d);if(!w&&y&&m(u)&&T(o,t))return await a("DROP "+G+W(t)),void j(o,t);if(m(u)||T(o,t)){const n=M(o,t),i=J($(n));await p([...f(u,(async e=>{O(i,e)||(await a(U+W(t)+"ADD"+W(e)),j(n,e,s))})),...!w&&r?f(A(i),(async s=>{s!=e&&(await a(U+W(t)+"DROP"+W(s)),j(n,s))})):[]])}else await a("CREATE "+G+W(t)+"("+W(e)+` PRIMARY KEY ON CONFLICT REPLACE${E(f(u,(a=>n+W(a))))});`),j(o,t,P([[e,s],...f(u,(a=>[a,s]))]));if(w)l(c)?await a(V+W(t)+Q+" 1"):await p(g(c,(async(s,n)=>{l(s)?await a(V+W(t)+Q+W(e)+"=?",[n]):m(u)||await Z(a,t,e,L(s),[n,...I(s)],i)})));else if(m(u))T(o,t)&&await a(V+W(t)+Q+" 1");else{const s=v($(M(o,t)),(a=>a!=e)),n=[],r=[];g(c??{},((a,t)=>{h(n,t,...f(s,(t=>a?.[t]))),h(r,t)})),await Z(a,t,e,s,n,i),await a(V+W(t)+Q+W(e)+"NOT IN("+aa(r)+")",r)}},async t=>{let s;await a("BEGIN");try{s=await t()}catch(a){e?.(a)}return await a("END"),s}]},Z=async(a,t,e,i,c,r=!0)=>await a("INSERT "+(r?s:"OR REPLACE ")+"INTO"+W(t)+"("+W(e)+E(f(i,(a=>n+W(a))))+")VALUES"+d(o(`,(?${o(",?",u(i))})`,u(c)/(u(i)+1)),1)+(r?"ON CONFLICT("+W(e)+")DO UPDATE SET"+E(f(i,(a=>W(a)+"=excluded."+W(a))),n):s),f(c,(a=>a??null))),aa=a=>E(f(a,(()=>"?")),n),ta=JSON.parse,ea=P(),sa=P(),na=(a,t,e,s,n,i,[o,c]=[],r=[])=>{let w,d,u,p=0,E=0;x(ea,r,(()=>0)),x(sa,r,(()=>[]));const f=async a=>(2!=p&&(p=1,await m.schedule((async()=>{await a(),p=0}))),m),m={load:async(e,s)=>await f((async()=>{try{a.setContent(await t())}catch{a.setContent([e,s])}})),startAutoLoad:async(e={},n={})=>(m.stopAutoLoad(),await m.load(e,n),E=1,u=s((async(e,s)=>{if(s){const t=s();await f((async()=>a.setTransactionChanges(t)))}else await f((async()=>{try{a.setContent(e?.()??await t())}catch(a){i?.(a)}}))})),m),stopAutoLoad:()=>(E&&(n(u),u=void 0,E=0),m),save:async t=>(1!=p&&(p=2,await m.schedule((async()=>{try{await e(a.getContent,t)}catch(a){i?.(a)}p=0}))),m),startAutoSave:async()=>(await m.stopAutoSave().save(),w=a.addDidFinishTransactionListener(((a,t)=>{const[e,s]=t();_(e)&&_(s)||m.save((()=>[e,s]))})),m),stopAutoSave:()=>(y(w,a.delListener),w=void 0,m),schedule:async(...a)=>(h(M(sa,r),...a),await(async()=>{if(!M(ea,r)){for(j(ea,r,1);!l((a=M(sa,r),d=a.shift()));)try{await d()}catch(a){i?.(a)}j(ea,r,0)}var a})(),m),getStore:()=>a,destroy:()=>m.stopAutoLoad().stopAutoSave(),getStats:()=>({})};return o&&(m[o]=()=>c),S(m)},ia="store",oa=(a,t,e,s,n,[i],o,c,r,l)=>{const[y,w,d,u]=X(t,o,n,l);return na(a,(async()=>await u((async()=>(await y(),ta((await w(i,B))[q]?.[ia]??"null"))))),(async a=>await u((async()=>{var t;await y(),await d(i,B,{[q]:{[ia]:(t=a()??null,JSON.stringify(t,((a,t)=>t instanceof Map?N.fromEntries([...t]):t)))}},!0,!0)}))),e,s,n,[r,c],c)},ca=(a,t,e,s,n,[i,o,[c,r,y]],w,d,u,E)=>{const[f,m,h,T]=X(t,w,n,E),A=async(a,t)=>await p(F(o,(async([e,s,n,i],o)=>{const c=a[o];t&&void 0===c||await h(e,s,c,n,i,t)}))),O=async(a,t)=>r?await h(y,B,{[q]:a},!0,!0,t):null;return na(a,(async()=>await T((async()=>{await f();const a=await(async()=>C(v(await p(F(i,(async([a,t],e)=>[a,await m(e,t)]))),(a=>!_(a[1])))))(),t=await(async()=>c?(await m(y,B))[q]:{})();return _(a)&&l(t)?void 0:[a,t]}))),(async(a,t)=>await T((async()=>{if(await f(),l(t)){const[t,e]=a();await A(t),await O(e)}else{const[a,e]=t();await A(a,!0),await O(e,!0)}}))),e,s,n,[u,d],d)},ra="json",la="autoLoadIntervalSeconds",ya="rowIdColumnName",wa="tableId",da="tableName",ua={mode:ra,[la]:1},pa={load:0,save:0,[da]:e+"_values"},Ea=(a,t,e,s)=>{const n=P();return g(a,((a,i)=>{const o=d(I(b(t,w(a)?{[e]:a}:a)),0,D(t));l(o[0])||s(i,o[0])||j(n,i,o)})),n},fa="pragma_",ma="data_version",va="schema_version",ha=(a,t,s,n,i,o,c,l,y="getDb",u)=>{let p,E,f;const[m,v,h,T]=(a=>{const t=(a=>b(ua,w(a)?{storeTableName:a}:a??{}))(a),s=t[la];if(t.mode==ra){const{storeTableName:a=e}=t;return[1,s,[a],J(a)]}const{tables:{load:n={},save:i={}}={},values:o={}}=t,c=d(I(b(pa,o)),0,D(pa)),r=c[2],l=J(r);return[0,s,[Ea(n,{[wa]:null,[ya]:B},wa,(a=>Y(l,a)&&a==r)),Ea(i,{[da]:null,[ya]:B,deleteEmptyColumns:0,deleteEmptyTable:0},da,((a,t)=>Y(l,t)&&t==r)),c],l]})(t);return(m?oa:ca)(a,o?async(a,t)=>(o(a,t),await s(a,t)):s,(a=>{return[(t=async()=>{try{const[{d:t,s:e,c:n}]=await s(`SELECT ${ma} d,${va} s,TOTAL_CHANGES() c FROM ${fa}${ma} JOIN ${fa}${va}`);t==(p??=t)&&e==(E??=e)&&n==(f??=n)||(a(),p=t,E=e)}catch{}},e=v,t(),setInterval(t,1e3*e)),n((t=>T.has(t)?a():0))];var t,e}),(([a,t])=>{r(a),p=E=f=null,i(t)}),c,h,A(T),l,y,u)};a.createSqliteWasmPersister=(a,t,e,s,n,i)=>ha(a,s,(async(a,t=[])=>e.exec(a,{bind:t,rowMode:"object",returnValue:"resultRows"}).map((a=>({...a})))),(a=>t.capi.sqlite3_update_hook(e,((t,e,s,n)=>a(n)),0)),(()=>t.capi.sqlite3_update_hook(e,(()=>0),0)),n,i,e)},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((a="undefined"!=typeof globalThis?globalThis:a||self).TinyBasePersisterSqliteWasm={});

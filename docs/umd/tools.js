var e,t;e=this,t=function(e){"use strict";const t=e=>typeof e,l="tinybase",a="",n=",",o=t(a),d=t(!0),s=t(0),r="type",I="default",c="Listener",$="get",i="add",u="Ids",p="Table",b=p+"s",C=p+u,h="Row",m=h+u,g="Sorted"+h+u,f="Cell",w=f+u,y="Value",T=y+"s",v=y+u,V=Promise,x=isFinite,R=(e,t)=>e instanceof t,k=e=>null==e,S=e=>e==o||e==d,P=e=>t(e)==o,A=e=>Array.isArray(e),E=async e=>V.all(e),D=e=>{const l=t(e);return S(l)||l==s&&x(e)?l:void 0},O=(e,t)=>e.every(t),N=(e,t)=>e.sort(t),G=(e,t)=>e.forEach(t),L=(e,t=a)=>e.join(t),j=(e,t)=>e.map(t),M=e=>e.length,J=(e,t)=>e.filter(t),z=(e,...t)=>e.push(...t),W=e=>e.pop(),B=(e,...t)=>e.unshift(...t),F=e=>e.shift(),U=Object,_=U.keys,Z=U.freeze,H=e=>R(e,U)&&e.constructor==U,Q=(e,t)=>j(U.entries(e),(([e,l])=>t(l,e))),q=e=>M(_(e)),K=e=>H(e)&&0==q(e),X=(e,t)=>e?.has(t)??!1,Y=e=>[...e?.values()??[]],ee=(e,t)=>e?.forEach(t),te=(e,t)=>e?.delete(t),le=e=>new Map(e),ae=(e,t)=>e?.get(t),ne=(e,t)=>ee(e,((e,l)=>t(l,e))),oe=(e,t)=>j([...e?.entries()??[]],(([e,l])=>t(l,e))),de=(e,t,l)=>k(l)?(te(e,t),e):e?.set(t,l),se=(e,t,l)=>(X(e,t)||de(e,t,l()),ae(e,t)),re=e=>e.toUpperCase(),Ie=e=>e.toLowerCase(),ce="a ",$e="A function for",ie=", and registers a listener so that any changes to that result will cause a re-render",ue="Callback",pe="Del",be="Deps",Ce=be+"?: React.DependencyList",he="doRollback?: DoRollback",me="actions: () => Return, "+he,ge="export",fe="Id",we="Invalid",ye="Json",Te=Ie(c),ve="?: ",Ve=" | undefined",xe="NonNullable",Re="Partial",ke="Props",Se="Provider",Pe=`Registers a ${Te} that will be called`,Ae="Represents",Ee="rowId: "+fe,De="Schema",Oe="Set",Ne=", descending?: boolean, offset?: number, limit?: number",Ge="[]",Le="the Store",je="Transaction",Me=je+"Changes",Je=Ie(je),ze="Execute a "+Je+" to make multiple mutations",We="Explicitly starts a "+Je,Be="Explicitly finishes a "+Je,Fe="the end of the "+Je,Ue="void",_e=" => "+Ue,Ze="WhenSet",He=" when setting it",Qe=ce+"string serialization of",qe=" ",Ke="Gets a callback that can ",Xe="the ",Ye=" the schema for",et=(e=0,t=0)=>`the ${mt[e]}content of`+(t?qe+Le:a),tt=(e=0,t,l=0)=>bt[t]+qe+et(e,1)+(l?" when setting it":a),lt=(e,t=0)=>Ae+` a Row when ${t?"s":"g"}etting ${et()} the '${e}' `+p,at=(e,t,l=0)=>`Gets ${l?"sorted, paginated":"the"} Ids of the ${e}s in `+t,nt=(e,t)=>`Calls a function for each ${e} in `+t,ot=e=>"The props passed to a component that renders "+e,dt=e=>"A function that takes "+e,st=(e,t=0)=>$e+" listening to changes to "+ht[e]+" in "+ht[t],rt=(e,t,l=0)=>Pe+" whenever "+ht[e]+" in "+ht[t]+" change"+(l?a:"s"),It=e=>`the '${e}' `+p,ct=e=>"the specified Row in "+It(e),$t=(e,t=0)=>bt[t]+` ${et()} `+It(e),it=(e,t=0)=>bt[t]+` ${et()} `+ct(e),ut=(e,t,l=0)=>bt[l]+` the '${t}' Cell for `+ct(e),pt=(e,t=0)=>bt[t]+` the '${e}' Value`,bt=["Gets","Checks existence of","Sets","Deletes","Sets part of",Ae,"Gets "+Qe,"Sets "+Qe,Pe+" whenever",Ke+"set",Ke+"add",Ke+"set part of",Ke+"delete","Renders","Gets "+Qe+Ye,"Sets"+Ye,"Deletes"+Ye],Ct=[$,"has","set","del","set","forEach",i,a],ht=[Le,b,Xe+p+qe+u,ce+p,Xe+h+qe+u,ce+h,Xe+f+qe+u,ce+f,"invalid Cell changes",T,Xe+y+qe+u,ce+y,"invalid Value changes",Xe+"sorted "+h+qe+u,Xe+f+qe+u+" anywhere",Xe+"number of Rows"],mt=[a,"tabular ","keyed value "],gt=e=>new Set(A(e)||k(e)?e:[e]),ft=(e,t)=>e?.add(t),wt=/[^A-Za-z]+/,yt=/[^A-Za-z0-9]+/,Tt=/^( *)\/\*\* *(.*?) *\*\/$/gm,vt=(e,t,l)=>e.substring(t,l),Vt=e=>e.includes(n),xt=(e,t,l,a=1)=>{const n=`${t}${1==a?"":a}`;return X(e,n)?xt(e,t,l,a+1):(de(e,n,l),n)},Rt=e=>e.replace(Tt,((e,t,l)=>{const a=77-kt(t);return`${t}/**\n${l.replace(RegExp(`([^\\n]{1,${a}})(\\s|$)`,"g"),t+" * $1\n")}${t} */`})),kt=e=>e.length,St=e=>e.flat(1e3),Pt=(e,t=0)=>L(j(e.split(yt),((e,l)=>(l>0||t?re:Ie)(vt(e,0,1))+vt(e,1)))),At=e=>re(L((e&&!wt.test(e[0])?e:" "+e).split(yt),"_")),Et=e=>`/** ${e}. */`,Dt=(...e)=>L(J(e,(e=>e)),", "),Ot=(...e)=>"{"+L(e,"; ")+"}",Nt=(...e)=>Ot(...j(e,(e=>"readonly "+e))),Gt=()=>{const e=[le(),le(),le(),le()],t=le(),l=le(),n=e=>{const t=e.indexOf(" as ");return-1!=t?e.substring(t+4):e};return[(...e)=>L(St(e),"\n"),(t,l,...a)=>G(a,(a=>G([0,1],(n=>(t??n)==n?ft(se(e[n],l,gt),a):0)))),(e,l,n,o=a,d=1)=>xt(t,e,[l,n,o,d]),(e,t,a)=>xt(l,e,A(a)?[`(${t}) => {`,a,"}"]:[`(${t}) => ${a}`]),(e,t)=>ae(l,e)===t?e:xt(l,e,t),(t=0)=>j([...N(oe(e[t],((e,t)=>`import {${L(N(Y(e),((e,t)=>n(e)>n(t)?1:-1)),", ")}} from '${t}';`)),((e,t)=>Vt(e)!=Vt(t)?Vt(e)?-1:1:e>t?1:-1)),a],(e=>e.replace("{React}","React"))),()=>oe(t,(([e,t,l,n],o)=>[Et(t),`${n?ge+" ":a}type ${o}${l} = ${e};`,a])),()=>oe(l,((e,t)=>(e=A(e)?e:[e],z(e,W(e)+";"),[`const ${t} = ${F(e)}`,e,a])))]},Lt=e=>{const t=new WeakMap;return l=>(t.has(l)||t.set(l,e(l)),t.get(l))},jt=(e,t,l)=>[t=>Q(e,((e,a)=>t(a,Pt(a,1),l(At(a),`'${a}'`)))),(t,a)=>Q(e[t],((e,t)=>a(t,e[r],e[I],l(At(t),`'${t}'`),Pt(t,1)))),e=>Q(t,((t,a)=>e(a,t[r],t[I],l(At(a),`'${a}'`),Pt(a,1))))],Mt=(e,t,l,n)=>[(n,o)=>{const d=n+": "+o,s=e(b,Ot(...t((e=>`'${e}'?: {[rowId: Id]: `+Ot(...l(e,((e,t,l)=>`'${e}'${k(l)?"?":a}: ${t}`)))+"}"))),tt(1,5)),r=e(b+Ze,Ot(...t((e=>`'${e}'?: {[rowId: Id]: `+Ot(...l(e,((e,t)=>`'${e}'?: ${t}`)))+"}"))),tt(1,5,1)),I=e(p+fe,"keyof "+s,"A "+p+" Id in "+Le),$=`<TId extends ${I}>`,i=e(p,xe+`<${s}[TId]>`,"A "+p+" in "+Le,$),u=e(p+Ze,xe+`<${r}[TId]>`,"A "+p+" in "+Le+He,$),y=e(h,i+"<TId>[Id]","A "+h+" in a "+p,$),T=e(h+Ze,u+"<TId>[Id]","A "+h+" in a "+p+He,$),v=e(f+fe,`Extract<keyof ${y}<TId>, Id>`,"A "+f+" Id in a "+h,$),V=e(f,xe+`<${s}[TId]>[Id][CId]`,"A "+f+" in a "+h,`<TId extends ${I}, CId extends ${v}<TId>>`),x=e("CellIdCellArray",`CId extends ${v}<TId> ? [cellId: CId, cell: ${V}<TId, CId>] : never`,f+" Ids and types in a "+h,`<TId extends ${I}, CId = ${v}<TId>>`,0),R=e(f+ue,`(...[cellId, cell]: ${x}<TId>)`+_e,dt(ce+f+" Id, and "+f),$),S=e(h+ue,"(rowId: Id, forEachCell: (cellCallback: CellCallback<TId>) "+_e+") "+_e,dt(ce+h+" Id, and a "+f+" iterator"),$),P=e(p+f+ue,`(cellId: ${v}<TId>, count: number) `+_e,dt(ce+f+" Id, and count of how many times it appears"),$),A=e("TableIdForEachRowArray",`TId extends ${I} ? [tableId: TId, forEachRow: (rowCallback: ${S}<TId>)${_e}] : never`,p+" Ids and callback types",`<TId = ${I}>`,0),E=e(p+ue,`(...[tableId, forEachRow]: ${A})`+_e,dt(ce+p+" Id, and a "+h+" iterator"),a),D=e("TableIdRowIdCellIdArray",`TId extends ${I} ? [tableId: TId, rowId: Id, cellId: ${v}<TId>] : never`,"Ids for GetCellChange",`<TId = ${I}>`,0),O=e("GetCellChange",`(...[tableId, rowId, cellId]: ${D}) => CellChange`,$e+" returning information about any Cell's changes during a "+Je),N=e(b+c,`(${d}, getCellChange: ${O}${Ve})`+_e,st(1)),G=e(C+c,`(${d})`+_e,st(2)),L=e(p+c,`(${d}, tableId: ${I}, getCellChange: ${O}${Ve})`+_e,st(3)),j=e(p+w+c,`(${d}, tableId: ${I})`+_e,st(14,3)),M=e(h+"Count"+c,`(${d}, tableId: ${I})`+_e,st(15,3)),J=e(m+c,`(${d}, tableId: ${I})`+_e,st(4,3)),z=e(g+c,"("+Dt(d,"tableId: "+I,"cellId: Id"+Ve,"descending: boolean","offset: number","limit: number"+Ve,"sortedRowIds: Ids")+")"+_e,st(13,3)),W=e(h+c,"("+Dt(""+d,"tableId: "+I,Ee,`getCellChange: ${O}${Ve}`)+")"+_e,st(5,3)),B=e(w+c,"("+Dt(""+d,"tableId: "+I,Ee)+")"+_e,st(6,5)),F=e("CellListenerArgsArrayInner",`CId extends ${v}<TId> ? [${d}, tableId: TId, ${Ee}, cellId: CId, newCell: ${V}<TId, CId> ${Ve}, oldCell: ${V}<TId, CId> ${Ve}, getCellChange: ${O} ${Ve}] : never`,"Cell args for CellListener",`<TId extends ${I}, CId = ${v}<TId>>`,0),U=e("CellListenerArgsArrayOuter",`TId extends ${I} ? `+F+"<TId> : never","Table args for CellListener",`<TId = ${I}>`,0);return[s,r,I,i,u,y,T,v,V,R,S,P,E,N,G,L,j,M,J,z,W,B,e(f+c,`(...[${n}, tableId, rowId, cellId, newCell, oldCell, getCellChange]: ${U})`+_e,st(7,5)),e(we+f+c,`(${d}, tableId: Id, ${Ee}, cellId: Id, invalidCells: any[])`+_e,st(8))]},(t,l)=>{const o=t+": "+l,d=e(T,Ot(...n(((e,t,l)=>`'${e}'${k(l)?"?":a}: ${t}`))),tt(2,5)),s=e(T+Ze,Ot(...n(((e,t)=>`'${e}'?: ${t}`))),tt(2,5,1)),r=e(y+fe,"keyof "+d,"A "+y+" Id in "+Le),I=e(y,xe+`<${d}[VId]>`,"A "+y+" Id in "+Le,`<VId extends ${r}>`),$=e("ValueIdValueArray",`VId extends ${r} ? [valueId: VId, value: ${I}<VId>] : never`,y+" Ids and types in "+Le,`<VId = ${r}>`,0),i=e(y+ue,`(...[valueId, value]: ${$})`+_e,dt(ce+y+" Id, and "+y)),u=e("GetValueChange",`(valueId: ${r}) => ValueChange`,$e+" returning information about any Value's changes during a "+Je),p=e(T+c,`(${o}, getValueChange: ${u}${Ve})`+_e,st(9)),b=e(v+c,`(${o})`+_e,st(10)),C=e("ValueListenerArgsArray",`VId extends ${r} ? [${o}, valueId: VId, newValue: ${I}<VId> ${Ve}, oldValue: ${I}<VId> ${Ve}, getValueChange: ${u} ${Ve}] : never`,"Value args for ValueListener",`<VId = ${r}>`,0);return[d,s,r,I,i,p,b,e(y+c,`(...[${t}, valueId, newValue, oldValue, getValueChange]: `+C+")"+_e,st(11)),e(we+y+c,`(${o}, valueId: Id, invalidValues: any[])`+_e,st(12))]},(t,l)=>e(je+c,`(${t}: ${l}, getTransactionChanges: GetTransactionChanges, getTransactionLog: GetTransactionLog)`+_e,$e+" listening to the completion of a "+Je)],Jt=(e,t=a,l=a)=>`store.${e}(${t})`+(l?" as "+l:a),zt=(e,t=a)=>`fluent(() => ${Jt(e,t)})`,Wt=(e,t=a,l=a)=>`store.${e}(${t?t+", ":a}proxy(listener)${l?", "+l:a})`,Bt=(e,t,n)=>{const[o,s,$,V,x,R,S,A]=Gt(),[E,D,O]=jt(e,t,x),[N,j,M]=Mt($,E,D,O),J=le(),W=(e=0)=>oe(J,(([t,l,n,o,d],s)=>{const r=e?[s+`: ${d}(${t}): ${l} => ${n},`]:[s+d+`(${t}): ${l};`];return e||B(r,Et(o)),z(r,a),r})),F=(e,t,l,n,o,d=a)=>xt(J,e,[t,l,n,o,d]),U=(e,t,l,n,o,d=a,s=a,r=a)=>F(Ct[e]+t+(4==e?Re:a)+l,d,n,(n==H?zt:Jt)(Ct[e]+(4==e?Re:a)+l,s,e?void 0:n),o,r),_=(e,t,l,n=a,o=a,d=1,s=a)=>F(i+e+c,(n?n+", ":a)+Te+": "+t+(d?", mutator?: boolean":a),fe,Wt(i+e+c,o,d?"mutator":a),l,s),Z=`./${Pt(n)}.d`,H=Pt(n,1),Q=Pt(H),q=[],X=le();let ee=[],te=[];if(s(1,Z,H,`create${H} as create${H}Decl`),K(e))s(null,l,b);else{s(0,l,"CellChange"),s(null,l,u);const[e,t,n,o,c,i,y,T,v,V,R,S,A,O,j,M,J,W,B,F,K,te,ne,oe]=N(Q,H),se=le();E(((e,t)=>{const l=`<'${e}'>`,a=[$(t+p,o+l,Ae+` the '${e}' `+p),$(t+p+Ze,c+l,Ae+` the '${e}' `+p+He),$(t+h,i+l,lt(e)),$(t+h+Ze,y+l,lt(e,1)),$(t+f+fe,T+l,`A Cell Id for the '${e}' `+p),$(t+f+ue,V+l,dt(`a Cell Id and value from a Row in the '${e}' `+p)),$(t+h+ue,R+l,dt(`a Row Id from the '${e}' Table, and a Cell iterator`)),$(t+p+f+ue,S+l,dt(`a Cell Id from anywhere in the '${e}' Table, and a count of how many times it appears`))];de(se,e,a),s(1,Z,...a)})),s(1,Z,e,t,n,T,A,O,j,M,J,W,B,F,K,te,ne,oe),ee=[e,t,n,T,O,j,M,J,W,B,F,K,te,ne,se],G([[e],[d],[H,"tables: "+t,"tables"],[H]],(([e,t,l],n)=>U(n,a,b,e,tt(1,n),t,l))),U(0,a,C,n+Ge,at(p,Le)),U(5,a,p,Ue,nt(p,Le),"tableCallback: "+A,"tableCallback as any"),E(((e,t,l)=>{const[n,o,s,r,I,c,$,i]=ae(se,e);G([[n],[d],[H,"table: "+o,", table"],[H]],(([n,o,d=a],s)=>U(s,t,p,n,$t(e,s),o,l+d))),U(0,t,p+w,u,at(f,"the whole of "+It(e)),a,l),U(5,t,p+f,Ue,nt(p+f,"the whole of "+It(e)),"tableCellCallback: "+i,l+", tableCellCallback as any"),U(0,t,h+"Count","number","Gets the number of Rows in the "+It(e),a,l),U(0,t,m,u,at(h,It(e)),a,l),U(0,t,g,u,at(h,It(e),1),"cellId?: "+I+Ne,l+", cellId, descending, offset, limit"),U(5,t,h,Ue,nt(h,It(e)),"rowCallback: "+$,l+", rowCallback as any"),G([[s],[d],[H,", row: "+r,", row"],[H],[H,", partialRow: "+r,", partialRow"]],(([n,o=a,d=a],s)=>U(s,t,h,n,it(e,s),Ee+o,l+", rowId"+d))),U(6,t,h,fe+Ve,"Add a new Row to "+It(e),"row: "+r+", reuseIds?: boolean",l+", row, reuseIds"),U(0,t,w,I+Ge,at(f,ct(e)),Ee,l+", rowId"),U(5,t,f,Ue,nt(f,ct(e)),Ee+", cellCallback: "+c,l+", rowId, cellCallback as any"),D(e,((n,o,s,r,I)=>{const c="Map"+Pt(o,1);de(X,o,c);const $=o+(k(s)?Ve:a);G([[$],[d],[H,`, cell: ${o} | `+c,", cell as any"],[H]],(([o,d=a,s=a],c)=>U(c,t+I,f,o,ut(e,n,c),Ee+d,l+", rowId, "+r+s))),U(1,t+I,p+f,d,bt[1]+` the '${n}' Cell anywhere in `+It(e),a,l+", "+r)}))})),U(0,a,b+ye,ye,tt(1,6)),U(2,a,b+ye,H,tt(1,7),"tablesJson: "+ye,"tables"+ye),_(b,O,tt(1,8)+" changes"),_(C,j,rt(2,0,1)),_(p,M,rt(3,0),`tableId: ${n} | null`,"tableId"),_(p+w,J,rt(14,3,1),`tableId: ${n} | null`,"tableId"),_(h+"Count",W,rt(15,3),`tableId: ${n} | null`,"tableId"),_(m,B,rt(4,3,1),`tableId: ${n} | null`,"tableId"),_(g,F,rt(13,3,1),Dt("tableId: TId",`cellId: ${T}<TId>`+Ve,"descending: boolean","offset: number","limit: number"+Ve),Dt("tableId","cellId","descending","offset","limit"),1,"<TId extends TableId>"),_(h,K,rt(5,3),`tableId: ${n} | null, rowId: IdOrNull`,"tableId, rowId"),_(w,te,rt(6,5,1),`tableId: ${n} | null, rowId: IdOrNull`,"tableId, rowId"),_(f,ne,rt(7,5),`tableId: ${n} | null, rowId: IdOrNull, cellId: ${L(E((e=>ae(se,e)?.[4]??a))," | ")} | null`,"tableId, rowId, cellId"),_(we+f,oe,Pe+" whenever an invalid Cell change was attempted","tableId: IdOrNull, rowId: IdOrNull, cellId: IdOrNull","tableId, rowId, cellId"),s(1,Z,...Y(X)),z(q,".set"+b+De+"({",St(E(((e,t,l)=>[`[${l}]: {`,...D(e,((e,t,l,n)=>`[${n}]: {[${x(At(r),`'${r}'`)}]: ${x(At(t),`'${t}'`)}${k(l)?a:`, [${x(At(I),`'${I}'`)}]: `+(P(l)?x(At(l),`'${l}'`):l)}},`)),"},"]))),"})")}if(K(t))s(null,l,T);else{const[e,t,n,o,c,$,i,u,p]=j(Q,H);s(1,Z,e,t,n,c,$,i,u,p),te=[e,t,n,$,i,u],G([[e],[d],[H,"values: "+t,"values"],[H],[H,"partialValues: "+t,"partialValues"]],(([e,t,l],n)=>U(n,a,T,e,tt(2,n),t,l))),U(0,a,v,n+Ge,at(y,Le)),U(5,a,y,"void",nt(y,Le),"valueCallback: "+c,"valueCallback as any"),O(((e,t,l,n,o)=>{const s="Map"+Pt(t,1);de(X,t,s),G([[t],[d],[H,`value: ${t} | `+s,", value as any"],[H]],(([t,l,d=a],s)=>U(s,o,y,t,pt(e,s),l,n+d)))})),U(0,a,T+ye,ye,tt(2,6)),U(2,a,T+ye,H,tt(2,7),"valuesJson: "+ye,"values"+ye),_(T,$,tt(2,8)+" changes"),_(v,i,rt(10,0,1)),_(y,u,rt(11,0),`valueId: ${n} | null`,"valueId"),_(we+y,p,Pe+" whenever an invalid Value change was attempted","valueId: IdOrNull","valueId"),s(1,Z,...Y(X)),s(0,l,"ValueChange"),z(q,".set"+T+De+"({",O(((e,t,l,n)=>[`[${n}]: {[${x(At(r),`'${r}'`)}]: ${x(At(t),`'${t}'`)}${k(l)?a:`, [${x(At(I),`'${I}'`)}]: `+(P(l)?x(At(l),`'${l}'`):l)}},`])),"})")}U(0,a,"Content",`[${b}, ${T}]`,tt(0,0)),U(2,a,"Content",H,tt(0,2),`[tables, values]: [${b}, ${T}]`,"[tables, values]"),U(2,a,Me,H,`Applies a set of ${Me} to the Store`,"transactionChanges: "+Me,"transactionChanges"),ne(X,((e,t)=>$(t,`(cell: ${e}${Ve}) => `+e,`Takes a ${e} Cell value and returns another`))),s(null,l,"DoRollback",fe,"IdOrNull",ye,"Store",Me),s(0,l,"Get"+Me,"GetTransactionLog"),U(0,a,ye,ye,tt(0,6)),U(2,a,ye,H,tt(0,7),"tablesAndValuesJson: "+ye,"tablesAndValuesJson"),U(7,a,Je,"Return",ze,me,"actions, doRollback","<Return>"),U(7,a,"start"+je,H,We),U(7,a,"finish"+je,H,Be,he,"doRollback");const se=M(Q,H);return _("Start"+je,se,Pe+" just before the start of the "+Je,a,a,0),_("WillFinish"+je,se,Pe+" just before "+Fe,a,a,0),_("DidFinish"+je,se,Pe+" just after "+Fe,a,a,0),U(7,a,"call"+c,H,"Manually provoke a listener to be called","listenerId: Id","listenerId"),U(3,a,c,H,"Remove a listener that was previously added to "+Le,"listenerId: Id","listenerId"),F("getStore",a,"Store","store",bt[0]+" the underlying Store object"),s(1,l,"createStore"),s(1,Z,H,`create${H} as create${H}Decl`,se),x("store",["createStore()",...q]),V("fluent","actions: () => Store",["actions();",`return ${Q};`]),V("proxy","listener: any",`(_: Store, ...params: any[]) => listener(${Q}, ...params)`),x(Q,["{",...W(1),"}"]),[o(...R(0),...S(),ge+" interface "+H+" {",...W(0),"}",a,Et(`Creates a ${H} object`),ge+" function create"+H+"(): "+H+";"),o(...R(1),ge+" const create"+H+": typeof create"+H+"Decl = () => {",...A(),`return Object.freeze(${Q});`,"};"),ee,te]},Ft=e=>$+e,Ut=e=>Dt(Ft(e),Ft(e)+be),_t="debugIds?: boolean",Zt="debugIds={debugIds}",Ht="then"+Ce,Qt="Parameter",qt=": (parameter: "+Qt+", store: Store) => ",Kt="const contextValue = useContext(Context);",Xt=", based on a parameter",Yt=": ",el="<"+Qt+",>",tl=Qt+"ized"+ue+"<"+Qt+">",ll="rowId",al="rowId={rowId}",nl=", separator, debugIds",ol="separator?: ReactElement | string",dl="then?: (store: Store",sl=Dt(dl+")"+_e,Ht),rl="then, then"+be,Il=ll+Yt+fe,cl="View",$l=(e,...t)=>Dt(...t,Te+": "+e,Te+Ce,"mutator?: boolean"),il=(...e)=>Dt(...e,Te,Te+be,"mutator"),ul=(e,t,n,o,d)=>{const[s,r,I,$,i,V,x,R]=Gt(),[S,P,A]=jt(e,t,i),E=`./${Pt(n)}.d`,D=`./${Pt(n)}-ui-react.d`,O="tinybase/ui-react",N=Pt(n,1),G=Pt(N),j=N+"Or"+N+fe,M=G+"Or"+N+fe,J=G+`={${G}}`,W=le(),F=(e,t,l,n,o,d=a)=>(r(1,D,e+" as "+e+"Decl"),xt(W,e,[t,l,n,o,d])),U=(e,t,l,n,o,d=a)=>F("use"+e,t,l,n,o,d),_=(e,t,l,n,o=a,d=a,s=a,I=a,c=a)=>(r(1,O,`use${t} as use${t}Core`),U(e,Dt(o,X,I),l,ee+`(${M}, use${t}Core, [`+(d||a)+(c?"], ["+c:a)+"]);",n,s)),Z=(e,t,l,a)=>F(e,t,1,l,a),H=(e=0)=>oe(W,(([t,l,n,o,d],s)=>{const r=e?[ge+` const ${s}: typeof ${s}Decl = ${d}(${t}): ${1==l?"any":l} =>`,n]:[ge+` function ${s}${d}(${t}): ${1==l?"ComponentReturnType":l};`];return e||B(r,Et(o)),z(r,a),r}));r(null,l,fe,"Store",ue,Qt+"ized"+ue),r(0,O,"ComponentReturnType"),r(1,O,"useCellIds"),r(null,O,"ExtraProps"),r(0,E,N);const Q=I(j,N+" | "+fe,`Used when you need to refer to a ${N} in a React hook or component`),q=I(Se+ke,Nt(G+ve+N,G+`ById?: {[${G}Id: Id]: ${N}}`),`Used with the ${Se} component, so that a `+N+" can be passed into the context of an application");r(0,"react","ReactElement","ComponentType"),r(1,"react","React"),r(1,D,Q,q);const X=M+ve+Q;i("{createContext, useContext, useMemo}","React"),i("Context",`createContext<[${N}?, {[${G}Id: Id]: ${N}}?]>([])`),U("Create"+N,`create: () => ${N}, create`+Ce,N,"\n// eslint-disable-next-line react-hooks/exhaustive-deps\nuseMemo(create, createDeps)",`Create a ${N} within a React application with convenient memoization`);const Y=U(N,"id?: Id",N+Ve,["{",Kt,"return id == null ? contextValue[0] : contextValue[1]?.[id];","}"],`Get a reference to a ${N} from within a ${Se} component context`),ee=$("useHook",M+`: ${Q} | undefined, hook: (...params: any[]) => any, preParams: any[], postParams: any[] = []`,[`const ${G} = ${Y}(${M} as Id);`,`return hook(...preParams, ((${M} == null || typeof ${M} == 'string')`,`? ${G} : ${M})?.getStore(), ...postParams)`]),te=$("getProps","getProps: ((id: any) => ExtraProps) | undefined, id: Id","(getProps == null) ? ({} as ExtraProps) : getProps(id)"),ne=$("wrap",Dt("children: any","separator?: any","encloseWithId?: boolean","id?: Id"),["const separated = separator==null || !Array.isArray(children)"," ? children"," : children.map((child, c) => (c > 0 ? [separator, child] : child));","return encloseWithId ? [id, ':{', separated, '}'] : separated;"]),de=$("useCustomOrDefaultCellIds",Dt("customCellIds: Ids | undefined","tableId: Id","rowId: Id",`${M}?: ${Q} | undefined`),[`const defaultCellIds = ${ee}(${M}, useCellIds, [tableId, rowId]);`,"return customCellIds ?? defaultCellIds;"]),se=i("NullComponent","() => null");if(!K(e)){const[e,t,n,d,s,i,y,T,v,V,x,R,A,O,j]=o;r(null,E,e,t,n,s,i,y,T,v,V,x,R,A,O),r(0,E,d),r(1,E,N),r(null,l,u,"IdOrNull");const M=$("tableView",`{${G}, rowComponent, getRowComponentProps, customCellIds`+nl+"}: any, rowIds: Ids, tableId: Id, defaultRowComponent: React.ComponentType<any>",["const Row = rowComponent ?? defaultRowComponent;",`return ${ne}(rowIds.map((rowId) => (`,"<Row","{..."+te+"(getRowComponentProps, rowId)}","key={rowId}","tableId={tableId}",al,"customCellIds={customCellIds}",J,Zt,"/>","))",nl,", tableId,",");"]),z=$("getDefaultTableComponent","tableId: Id",L(S(((e,t,l)=>`tableId == ${l} ? ${t}TableView : `)))+se),W=$("getDefaultCellComponent","tableId: Id, cellId: Id",L(S(((e,t,l)=>`tableId == ${l} ? ${L(P(e,((e,l,a,n,o)=>`cellId == ${n} ? `+t+o+"CellView : ")))+se} : `)))+se);_(b,b,e,tt(1,0)+ie);const B=_(C,C,n+Ge,at(p,Le)+ie);_(Oe+b+ue,Oe+b+ue,tl,tt(1,9)+Xt,Dt(Ft(b)+qt+t,Ft(b)+Ce),Ut(b),el,Dt(dl,`tables: ${t})`+_e,Ht),rl),_(pe+b+ue,pe+b+ue,ue,tt(1,12),a,a,a,sl,rl);const F=I(f+ke,Nt("tableId?: TId","rowId: Id","cellId?: CId",G+ve+N,_t),ot(ce+f),`<TId extends ${n}, CId extends ${d}<TId>>`),U=I(h+ke,Nt("tableId?: TId","rowId: Id",G+ve+N,"cellComponents?: {readonly [CId in "+d+`<TId>]?: ComponentType<${F}<TId, CId>>;}`,`getCellComponentProps?: (cellId: ${d}<TId>) => ExtraProps`,`customCellIds?: ${d}<TId>[]`,ol,_t),ot(ce+h),`<TId extends ${n}>`),H=I(p+ke,Nt("tableId?: TId",G+ve+N,`rowComponent?: ComponentType<${U}<TId>>`,"getRowComponentProps?: (rowId: Id) => ExtraProps","customCellIds?: CellId<TId>[]",ol,_t),ot(ce+p),`<TId extends ${n}>`),Q=I("Sorted"+p+ke,Nt("tableId?: TId","cellId?: "+d+"<TId>","descending?: boolean","offset?: number","limit?: number",G+ve+N,`rowComponent?: ComponentType<${U}<TId>>`,"getRowComponentProps?: (rowId: Id) => ExtraProps","customCellIds?: CellId<TId>[]",ol,_t),ot(ce+"sorted "+p),`<TId extends ${n}>`),q=I(b+ke,Nt(G+ve+N,"tableComponents?: {readonly [TId in "+n+`]?: ComponentType<${H}<TId>>;}`,`getTableComponentProps?: (tableId: ${n}) => ExtraProps`,ol,_t),ot(et(1,1)));r(1,D,q,H,Q,U,F),Z(b+cl,"{"+G+", tableComponents, getTableComponentProps"+nl+"}: "+q,[ne+`(${B}(${G}).map((tableId) => {`,"const Table = (tableComponents?.[tableId] ?? "+z+"(tableId)) as React.ComponentType<TableProps<typeof tableId>>;","return <Table",`{...${te}(getTableComponentProps, tableId)}`,"tableId={tableId}","key={tableId}",J,Zt,"/>;","}), separator)"],tt(1,13)+ie),S(((e,t,l)=>{const[n,o,d,s,I]=ae(j,e);r(null,E,n,o,d,s,I),_(t+p,p,n,$t(e)+ie,a,l),_(t+p+w,p+w,u,at(f,"the whole of "+It(e))+ie,a,l);const c=_(t+m,m,u,at(h,It(e))+ie,a,l),$=_(t+g,g,u,at(h,It(e),1)+ie,"cellId?: "+I+", descending?: boolean, offset?: number, limit?: number",l+", cellId, descending, offset, limit");_(t+h,h,d,it(e)+ie,Il,Dt(l,ll)),_(t+w,w,I+Ge,at(f,ct(e))+ie,Il,Dt(l,ll)),_(Oe+t+p+ue,Oe+p+ue,tl,$t(e,9)+Xt,Dt(Ft(p)+qt+o,Ft(p)+Ce),Dt(l,Ut(p)),el,Dt(dl,`table: ${o})`+_e,Ht),rl),_(pe+t+p+ue,pe+p+ue,ue,$t(e,12),a,l,a,sl,rl),_(Oe+t+h+ue,Oe+h+ue,tl,it(e,9)+Xt,Dt(Il,Ft(h)+qt+s,Ft(h)+Ce),Dt(l,ll,Ut(h)),el,Dt(dl,`row: ${s})`+_e,Ht),rl),_("Add"+t+h+ue,"Add"+h+ue,tl,it(e,10)+Xt,Dt(Ft(h)+qt+s,Ft(h)+Ce),Dt(l,Ut(h)),el,"then?: ("+Dt(Il+Ve,"store: Store","row: "+s+")"+_e,"then"+Ce)+", reuseRowIds?: boolean",rl+", reuseRowIds"),_(Oe+t+Re+h+ue,Oe+Re+h+ue,tl,it(e,11)+Xt,Dt(Il,Ft(Re+h)+qt+s,Ft(Re+h)+Ce),Dt(l,ll,Ut(Re+h)),el,Dt(dl,`partialRow: ${s})`+_e,Ht),rl),_(pe+t+h+ue,pe+h+ue,ue,it(e,12),Il,Dt(l,ll),a,sl,rl);const i=Z(t+h+cl,"{rowId, "+G+", cellComponents, getCellComponentProps, customCellIds"+nl+`}: ${U}<'${e}'>`,[ne+`(${de}(customCellIds, `+l+`, rowId, ${G}).map((cellId: ${I}) => {`,"const Cell = (cellComponents?.[cellId] ?? "+W+`(${l}, cellId)) as React.ComponentType<CellProps<typeof `+l+", typeof cellId>>;","return <Cell",`{...${te}(getCellComponentProps, cellId)} `,"key={cellId}",`tableId={${l}}`,al,"cellId={cellId}",J,Zt,"/>;","})"+nl+", rowId)"],it(e,13)+ie);Z(t+"Sorted"+p+cl,"{cellId, descending, offset, limit, ...props}: "+Q+`<'${e}'>`,M+"(props, "+$+`(cellId, descending, offset, limit, props.${G}), ${l}, ${i});`,$t(e,13)+", sorted"+ie),Z(t+p+cl,`props: ${H}<'${e}'>`,M+"(props, "+c+`(props.${G}), ${l}, ${i});`,$t(e,13)+ie),P(e,((n,o,d,s,I)=>{const c="Map"+Pt(o,1);r(0,E,c),r(1,E,c);const $=_(t+I+f,f,o+(k(d)?Ve:a),ut(e,n)+ie,Il,Dt(l,ll,s));_(Oe+t+I+f+ue,Oe+f+ue,tl,ut(e,n,9)+Xt,Dt(Il,Ft(f)+qt+o+" | "+c,Ft(f)+Ce),Dt(l,ll,s,Ut(f)),el,Dt(dl,`cell: ${o} | ${c})`+_e,Ht),rl),_(pe+t+I+f+ue,pe+f+ue,ue,ut(e,n,12),Dt(Il,"forceDel?: boolean"),Dt(l,ll,s,"forceDel"),a,sl,rl),Z(t+I+f+cl,`{rowId, ${G}, debugIds}: `+F+`<'${e}', '${n}'>`,[ne+`('' + ${$}(rowId, `+G+`) ?? '', undefined, debugIds, ${s})`],ut(e,n,13)+ie)}))}));const K=L(S((e=>ae(j,e)?.[4]??a))," | ");_(b+c,b+c,Ue,tt(1,8)+" changes",$l(s),il()),_(C+c,C+c,Ue,rt(2,0,1),$l(i),il()),_(p+c,p+c,Ue,rt(3,0),$l(y,`tableId: ${n} | null`),il("tableId")),_(p+w+c,p+w+c,Ue,rt(14,3,1),$l(T,`tableId: ${n} | null`),il("tableId")),_(m+c,m+c,Ue,rt(4,3,1),$l(V,`tableId: ${n} | null`),il("tableId")),_(g+c,g+c,Ue,rt(13,3,1),$l(x,`tableId: ${n} | null`,"cellId: "+K+Ve,"descending: boolean","offset: number","limit: number"+Ve),il("tableId","cellId","descending","offset","limit")),_(h+c,h+c,Ue,rt(5,3),$l(R,`tableId: ${n} | null`,ll+": IdOrNull"),il("tableId",ll)),_(w+c,w+c,Ue,rt(6,5,1),$l(A,`tableId: ${n} | null`,ll+": IdOrNull"),il("tableId",ll)),_(f+c,f+c,Ue,rt(7,5),$l(O,`tableId: ${n} | null`,ll+": IdOrNull",`cellId: ${K} | null`),il("tableId",ll,"cellId"))}if(!K(t)){const[e,t,l,n,o,s]=d;r(null,E,...d),r(1,E,N);const i=$("getDefaultValueComponent","valueId: Id",L(A(((e,t,l,a,n)=>`valueId == ${a} ? `+n+"ValueView : ")))+se);_(T,T,e,tt(2,0)+ie);const u=_(v,v,l+Ge,at(y,Le)+ie);_(Oe+T+ue,Oe+T+ue,tl,tt(2,9)+Xt,Dt(Ft(T)+qt+t,Ft(T)+Ce),Ut(T),el,Dt(dl,`values: ${t})`+_e,Ht),rl),_(Oe+Re+T+ue,Oe+Re+T+ue,tl,tt(2,11)+Xt,Dt(Ft(Re+T)+qt+t,Ft(Re+T)+Ce),Ut(Re+T),el,Dt(dl,`partialValues: ${t})`+_e,Ht),rl),_(pe+T+ue,pe+T+ue,ue,tt(2,12),a,a,a,sl,rl);const p=I(y+ke,Nt("valueId?: VId",G+ve+N,_t),ot("a Value"),`<VId extends ${l}>`),b=I(T+ke,Nt(G+ve+N,"valueComponents?: {readonly [VId in "+l+`]?: ComponentType<${p}<VId>>;}`,`getValueComponentProps?: (valueId: ${l}) => ExtraProps`,ol,_t),ot(et(2,1)));r(1,D,b,p),Z(T+cl,"{"+G+", valueComponents, getValueComponentProps"+nl+"}: "+b,[ne+`(${u}(${G}).map((valueId) => {`,"const Value = valueComponents?.[valueId] ?? "+i+"(valueId);","return <Value",`{...${te}(getValueComponentProps, valueId)}`,"key={valueId}",J,Zt,"/>;","}), separator)"],tt(2,13)+ie),A(((e,t,l,n,o)=>{const d="Map"+Pt(t,1);r(0,E,d),r(1,E,d);const s=_(o+y,y,t,pt(e)+ie,a,n);_(Oe+o+y+ue,Oe+y+ue,tl,pt(e,9)+Xt,Dt(Ft(y)+qt+t+" | "+d,Ft(y)+Ce),Dt(n,Ut(y)),el,Dt(dl,`value: ${t} | ${d})`+_e,Ht),rl),_(pe+o+y+ue,pe+y+ue,ue,pt(e,12),a,n,a,sl,rl),Z(o+y+cl,`{${G}, debugIds}: ${p}<'${e}'>`,[ne+`('' + ${s}(`+G+`) ?? '', undefined, debugIds, ${n})`],pt(e,13)+ie)})),_(T+c,T+c,Ue,tt(2,8)+" changes",$l(n),il()),_(v+c,v+c,Ue,rt(10,0,1),$l(o),il()),_(y+c,y+c,Ue,rt(11,0),$l(s,`valueId: ${l} | null`),il("valueId"))}return Z(Se,`{${G}, ${G}ById, children}: `+q+" & {children: React.ReactNode}",["{",Kt,"return (","<Context."+Se,"value={useMemo(",`() => [${G} ?? contextValue[0], {...contextValue[1], ...${G}ById}],`,`[${G}, ${G}ById, contextValue],`,")}>","{children}",`</Context.${Se}>`,");","}"],"Wraps part of an application in a context that provides default objects to be used by hooks and components within"),[s(...V(0),...x(),...H(0)),s(...V(1),...R(),...H(1))]},pl=(e,t,l)=>{if(K(e)&&K(t))return[a,a,a,a];const[n,o,d,s]=Bt(e,t,l);return[n,o,...ul(e,t,l,d,s)]},bl=JSON.parse,Cl="prettier/",hl=Cl+"plugins/",ml={parser:"typescript",singleQuote:!0,trailingComma:"all",bracketSpacing:!1,jsdocSingleLineComment:!1},gl=Lt((e=>{const t=()=>{const t=bl(e.getTablesSchemaJson());return!K(t)||O(e.getTableIds(),(l=>{const a=e.getRowIds(l),n=le();if(O(a,(t=>O(e.getCellIds(l,t),(a=>{const o=e.getCell(l,t,a),d=se(n,a,(()=>[D(o),le(),[0],0])),[s,r,[I]]=d,c=se(r,o,(()=>0))+1;return c>I&&(d[2]=[c,o]),de(r,o,c),d[3]++,s==D(o)})))))return t[l]={},ee(n,(([e,,[,n],o],d)=>{t[l][d]={[r]:e,...o==M(a)?{[I]:n}:{}}})),1}))?t:{}},l=()=>{const t=bl(e.getValuesSchemaJson());return K(t)&&e.forEachValue(((e,l)=>{t[e]={[r]:D(l)}})),t},a=e=>pl(t(),l(),e),n=async e=>{const t=["d.ts","ts","d.ts","tsx"],l=[];let n;try{n=(await import(Cl+"standalone")).format,z(l,await import(hl+"estree"),await import(hl+"typescript"))}catch(e){n=async e=>e}return await E(j(a(e),(async(e,a)=>Rt(await n(e,{...ml,plugins:l,filepath:"_."+t[a]})))))};return Z({getStoreStats:t=>{let l=0,a=0,n=0;const o={};return e.forEachTable(((e,d)=>{l++;let s=0,r=0;const I={};d(((e,l)=>{s++;let a=0;l((()=>a++)),r+=a,t&&(I[e]={rowCells:a})})),a+=s,n+=r,t&&(o[e]={tableRows:s,tableCells:r,rows:I})})),{totalTables:l,totalRows:a,totalCells:n,totalValues:M(e.getValueIds()),jsonLength:kt(e.getJson()),...t?{detail:{tables:o}}:{}}},getStoreTablesSchema:t,getStoreValuesSchema:l,getStoreApi:a,getPrettyStoreApi:n,getStore:()=>e})}));e.createTools=gl},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseTools={});

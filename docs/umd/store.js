var e,t;e=this,t=function(e){"use strict";const t=e=>typeof e,s="",n=t(s),a=t(!0),l=t(0),o=t(t),r="type",i="default",c="Has",d="Ids",u="Table",f=u+"s",h=u+d,g="Row",T=g+"Count",b=g+d,S="Cell",V=S+d,p="Value",v=p+"s",y=p+d,C=e=>s+e,m=isFinite,w=e=>null==e,L=(e,t,s)=>w(e)?s?.():t(e),R=e=>e==n||e==a,I=e=>t(e)==o,J=(e,t,s)=>e.slice(t,s),E=e=>e.length,F=(e,t)=>e.forEach(t),O=(e,t)=>e.map(t),x=(e,...t)=>e.push(...t),z=Object,P=e=>z.getPrototypeOf(e),j=z.entries,k=z.keys,A=z.isFrozen,M=z.freeze,N=e=>!w(e)&&L(P(e),(e=>e==z.prototype||w(P(e))),(()=>!0)),B=(e,t)=>t in e,D=(e,t)=>(delete e[t],e),H=(e,t)=>O(j(e),(([e,s])=>t(s,e))),W=e=>N(e)&&0==(e=>E(k(e)))(e),$=e=>e?.size??0,q=(e,t)=>e?.has(t)??!1,G=e=>w(e)||0==$(e),K=e=>e.clear(),Q=(e,t)=>e?.forEach(t),U=(e,t)=>e?.delete(t),X=e=>new Map(e),Y=e=>[...e?.keys()??[]],Z=(e,t)=>e?.get(t),_=(e,t)=>Q(e,((e,s)=>t(s,e))),ee=(e,t,s)=>w(s)?(U(e,t),e):e?.set(t,s),te=(e,t,s)=>(q(e,t)||ee(e,t,s()),Z(e,t)),se=(e,t,s,n=ee)=>(H(t,((t,n)=>s(e,n,t))),_(e,(s=>B(t,s)?0:n(e,s))),e),ne=(e,t,s)=>{const n={};return Q(e,((e,a)=>{const l=t?t(e,a):e;!s?.(l,e)&&(n[a]=l)})),n},ae=(e,t,s)=>ne(e,(e=>ne(e,t,s)),W),le=(e,t,s)=>ne(e,(e=>ae(e,t,s)),W),oe=(e,t)=>{const s=X();return Q(e,((e,n)=>s.set(n,t?.(e)??e))),s},re=e=>oe(e,oe),ie=e=>oe(e,re),ce=(e,t,s,n,a=0)=>L((s?te:Z)(e,t[a],a>E(t)-2?s:X),(l=>{if(a>E(t)-2)return n?.(l)&&ee(e,t[a]),l;const o=ce(l,t,s,n,a+1);return G(l)&&ee(e,t[a]),o})),de=e=>new Set(Array.isArray(e)||w(e)?e:[e]),ue=(e,t)=>e?.add(t),fe=/^\d+$/,he=()=>{const e=[];let t=0;return[n=>(n?e.shift():null)??s+t++,t=>{fe.test(t)&&E(e)<1e3&&x(e,t)}]},ge=e=>[e,e],Te=()=>[X(),X()],be=e=>[...e],Se=([e,t])=>e===t,Ve=e=>{const s=t(e);return R(s)||s==l&&m(e)?s:void 0},pe=(e,t,s,n,a)=>w(a)?e.delCell(t,s,n,!0):e.setCell(t,s,n,a),ve=(e,t,s)=>w(s)?e.delValue(t):e.setValue(t,s),ye=e=>JSON.stringify(e,((e,t)=>t instanceof Map?z.fromEntries([...t]):t)),Ce=JSON.parse,me=(e,t,s)=>w(e)||!N(e)||W(e)||A(e)?(s?.(),!1):(H(e,((s,n)=>{t(s,n)||D(e,n)})),!W(e)),we=(e,t,s)=>ee(e,t,Z(e,t)==-s?void 0:s),Le=()=>{let e,t,n=!1,a=!1,o=0,d=[];const m=X(),z=X(),P=X(),j=X(),k=X(),A=X(),N=X(),fe=X(),Re=X(),Ie=X(),Je=X(),Ee=X(),Fe=X(),Oe=X(),xe=de(),ze=X(),Pe=X(),je=X(),ke=X(),Ae=Te(),Me=Te(),Ne=Te(),Be=Te(),De=Te(),He=Te(),We=Te(),$e=Te(),qe=Te(),Ge=Te(),Ke=Te(),Qe=Te(),Ue=Te(),Xe=Te(),Ye=Te(),Ze=Te(),_e=Te(),et=Te(),tt=Te(),st=Te(),nt=Te(),at=Te(),lt=X(),ot=Te(),[rt,it,ct,dt]=(e=>{let t;const[n,a]=he(),l=X();return[(e,a,o,r=[],i=(()=>[]))=>{t??=Fs;const c=n(1);return ee(l,c,[e,a,o,r,i]),ue(ce(a,o??[s],de),c),c},(e,n,...a)=>F(((e,t=[s])=>{const n=[],a=(e,s)=>s==E(t)?x(n,e):null===t[s]?Q(e,(e=>a(e,s+1))):F([t[s],null],(t=>a(Z(e,t),s+1)));return a(e,0),n})(e,n),(e=>Q(e,(e=>Z(l,e)[0](t,...n??[],...a))))),e=>L(Z(l,e),(([,t,n])=>(ce(t,n??[s],void 0,(t=>(U(t,e),G(t)?1:0))),ee(l,e),a(e),n))),e=>L(Z(l,e),(([e,,s=[],n,a])=>{const l=(...o)=>{const r=E(o);r==E(s)?e(t,...o,...a(o)):w(s[r])?F(n[r]?.(...o)??[],(e=>l(...o,e))):l(...o,s[r])};l()}))]})(),ut=e=>{if(!me(e,((e,t)=>[r,i].includes(t))))return!1;const t=e[r];return!(!R(t)&&t!=l||(Ve(e[i])!=t&&D(e,i),0))},ft=(t,s)=>(!e||q(Je,s)||Ht(s))&&me(t,((e,t)=>ht(s,t,e)),(()=>Ht(s))),ht=(e,t,s,n)=>me(n?s:St(s,e,t),((n,a)=>L(gt(e,t,a,n),(e=>(s[a]=e,!0)),(()=>!1))),(()=>Ht(e,t))),gt=(t,s,n,a)=>e?L(Z(Z(Je,t),n),(e=>Ve(a)!=e[r]?Ht(t,s,n,a,e[i]):a),(()=>Ht(t,s,n,a))):w(Ve(a))?Ht(t,s,n,a):a,Tt=(e,t)=>me(t?e:Vt(e),((t,s)=>L(bt(s,t),(t=>(e[s]=t,!0)),(()=>!1))),(()=>Wt())),bt=(e,s)=>t?L(Z(Fe,e),(t=>Ve(s)!=t[r]?Wt(e,s,t[i]):s),(()=>Wt(e,s))):w(Ve(s))?Wt(e,s):s,St=(e,t,s)=>(L(Z(Ee,t),(([n,a])=>{Q(n,((t,s)=>{B(e,s)||(e[s]=t)})),Q(a,(n=>{B(e,n)||Ht(t,s,n)}))})),e),Vt=e=>(t&&(Q(Oe,((t,s)=>{B(e,s)||(e[s]=t)})),Q(xe,(t=>{B(e,t)||Wt(t)}))),e),pt=e=>se(Je,e,((e,t,s)=>{const n=X(),a=de();se(te(Je,t,X),s,((e,t,s)=>{ee(e,t,s),L(s[i],(e=>ee(n,t,e)),(()=>ue(a,t)))})),ee(Ee,t,[n,a])}),((e,t)=>{ee(Je,t),ee(Ee,t)})),vt=e=>se(Fe,e,((e,t,s)=>{ee(Fe,t,s),L(s[i],(e=>ee(Oe,t,e)),(()=>ue(xe,t)))}),((e,t)=>{ee(Fe,t),ee(Oe,t),U(xe,t)})),yt=e=>W(e)?ys():bs(e),Ct=e=>se(je,e,((e,t,s)=>mt(t,s)),((e,t)=>xt(t))),mt=(e,t)=>se(te(je,e,(()=>(kt(e,1),ee(ze,e,he()),ee(Pe,e,X()),X()))),t,((t,s,n)=>wt(e,t,s,n)),((t,s)=>zt(e,t,s))),wt=(e,t,s,n,a)=>se(te(t,s,(()=>(At(e,s,1),X()))),n,((t,n,a)=>Lt(e,s,t,n,a)),((n,l)=>Pt(e,t,s,n,l,a))),Lt=(e,t,s,n,a)=>{q(s,n)||Mt(e,t,n,1);const l=Z(s,n);a!==l&&(Nt(e,t,n,l,a),ee(s,n,a))},Rt=(e,t,s,n,a)=>L(Z(t,s),(t=>Lt(e,s,t,n,a)),(()=>wt(e,t,s,St({[n]:a},e,s)))),It=e=>W(e)?ws():Ss(e),Jt=e=>se(ke,e,((e,t,s)=>Et(t,s)),((e,t)=>jt(t))),Et=(e,t)=>{q(ke,e)||Bt(e,1);const s=Z(ke,e);t!==s&&(Dt(e,s,t),ee(ke,e,t))},Ft=(e,t)=>{const[s]=Z(ze,e),n=s(t);return q(Z(je,e),n)?Ft(e,t):n},Ot=e=>Z(je,e)??mt(e,{}),xt=e=>mt(e,{}),zt=(e,t,s)=>{const[,n]=Z(ze,e);n(s),wt(e,t,s,{},!0)},Pt=(e,t,s,n,a,l)=>{const o=Z(Z(Ee,e)?.[0],a);if(!w(o)&&!l)return Lt(e,s,n,a,o);const r=t=>{Nt(e,s,t,Z(n,t)),Mt(e,s,t,-1),ee(n,t)};w(o)?r(a):_(n,r),G(n)&&(At(e,s,-1),G(ee(t,s))&&(kt(e,-1),ee(je,e),ee(ze,e),ee(Pe,e)))},jt=e=>{const t=Z(Oe,e);if(!w(t))return Et(e,t);Dt(e,Z(ke,e)),Bt(e,-1),ee(ke,e)},kt=(e,t)=>we(m,e,t),At=(e,t,s)=>we(te(j,e,X),t,s)&&ee(P,e,te(P,e,(()=>0))+s),Mt=(e,t,s,n)=>{const a=Z(Pe,e),l=Z(a,s)??0;(0==l&&1==n||1==l&&-1==n)&&we(te(z,e,X),s,n),ee(a,s,l!=-n?l+n:null),we(te(te(k,e,X),t,X),s,n)},Nt=(e,t,s,n,a)=>te(te(te(A,e,X),t,X),s,(()=>[n,0]))[1]=a,Bt=(e,t)=>we(N,e,t),Dt=(e,t,s)=>te(fe,e,(()=>[t,0]))[1]=s,Ht=(e,t,s,n,a)=>(x(te(te(te(Re,e,X),t,X),s,(()=>[])),n),a),Wt=(e,t,s)=>(x(te(Ie,e,(()=>[])),t),s),$t=(e,t,s)=>L(Z(Z(Z(A,e),t),s),(([e,t])=>[!0,e,t]),(()=>[!1,...ge(ls(e,t,s))])),qt=e=>L(Z(fe,e),(([e,t])=>[!0,e,t]),(()=>[!1,...ge(is(e))])),Gt=e=>G(Re)||G(Ze[e])?0:Q(e?ie(Re):Re,((t,s)=>Q(t,((t,n)=>Q(t,((t,a)=>it(Ze[e],[s,n,a],t))))))),Kt=e=>G(Ie)||G(_e[e])?0:Q(e?oe(Ie):Ie,((t,s)=>it(_e[e],[s],t))),Qt=(e,t,s,n)=>{if(!G(e))return it(t,n,(()=>ne(e))),_(e,((e,t)=>it(s,[...n??[],e],1==t))),1},Ut=e=>{const t=cs();t!=n&&it(Ae[e],void 0,t);const s=G(Ge[e]),a=G(Ue[e])&&G(Xe[e])&&G(qe[e])&&G(Ke[e])&&G(He[e])&&G(We[e])&&G($e[e])&&s&&G(Ne[e])&&G(Be[e]),l=G(Ye[e])&&G(Qe[e])&&G(De[e])&&G(Me[e]);if(!a||!l){const t=e?[oe(m),re(z),oe(P),re(j),ie(k),ie(A)]:[m,z,P,j,k,A];if(!a){Qt(t[0],Ne[e],Be[e]),Q(t[1],((t,s)=>Qt(t,He[e],We[e],[s]))),Q(t[2],((t,s)=>{0!=t&&it($e[e],[s],ts(s))}));const n=de();Q(t[3],((t,a)=>{Qt(t,qe[e],Ke[e],[a])&&!s&&(it(Ge[e],[a,null]),ue(n,a))})),s||Q(t[5],((t,s)=>{if(!q(n,s)){const n=de();Q(t,(e=>Q(e,(([t,s],a)=>s!==t?ue(n,a):U(e,a))))),Q(n,(t=>it(Ge[e],[s,t])))}})),Q(t[4],((t,s)=>Q(t,((t,n)=>Qt(t,Ue[e],Xe[e],[s,n])))))}if(!l){let s;Q(t[5],((t,n)=>{let a;Q(t,((t,l)=>{let o;Q(t,(([t,r],i)=>{r!==t&&(it(Ye[e],[n,l,i],r,t,$t),s=a=o=1)})),o&&it(Qe[e],[n,l],$t)})),a&&it(De[e],[n],$t)})),s&&it(Me[e],void 0,$t)}}},Xt=e=>{const t=gs();t!=a&&it(et[e],void 0,t);const s=G(st[e])&&G(nt[e]),n=G(at[e])&&G(tt[e]);if(!s||!n){const t=e?[oe(N),oe(fe)]:[N,fe];if(s||Qt(t[0],st[e],nt[e]),!n){let s;Q(t[1],(([t,n],a)=>{n!==t&&(it(at[e],[a],n,t,qt),s=1)})),s&&it(tt[e],void 0,qt)}}},Yt=(e,...t)=>(Is((()=>e(...O(t,C)))),Fs),Zt=()=>le(je),_t=()=>Y(je),es=e=>Y(Z(Pe,C(e))),ts=e=>$(Z(je,C(e))),ss=e=>Y(Z(je,C(e))),ns=(e,t,s,n=0,a)=>{return O(J((o=Z(je,C(e)),r=(e,s)=>[w(t)?s:Z(e,C(t)),s],l=([e],[t])=>((e??0)<(t??0)?-1:1)*(s?-1:1),O([...o?.entries()??[]],(([e,t])=>r(t,e))).sort(l)),n,w(a)?a:n+a),(([,e])=>e));var l,o,r},as=(e,t)=>Y(Z(Z(je,C(e)),C(t))),ls=(e,t,s)=>Z(Z(Z(je,C(e)),C(t)),C(s)),os=()=>ne(ke),rs=()=>Y(ke),is=e=>Z(ke,C(e)),cs=()=>!G(je),ds=e=>q(je,C(e)),us=(e,t)=>q(Z(Pe,C(e)),C(t)),fs=(e,t)=>q(Z(je,C(e)),C(t)),hs=(e,t,s)=>q(Z(Z(je,C(e)),C(t)),C(s)),gs=()=>!G(ke),Ts=e=>q(ke,C(e)),bs=e=>Yt((()=>(e=>me(e,ft,Ht))(e)?Ct(e):0)),Ss=e=>Yt((()=>Tt(e)?Jt(e):0)),Vs=e=>{try{yt(Ce(e))}catch{}return Fs},ps=t=>Yt((()=>{if((e=me(t,(e=>me(e,ut))))&&(pt(t),!G(je))){const e=Zt();ys(),bs(e)}})),vs=e=>Yt((()=>{if(t=(e=>me(e,ut))(e)){const s=os();Rs(),ws(),t=!0,vt(e),Ss(s)}})),ys=()=>Yt((()=>Ct({}))),Cs=e=>Yt((e=>q(je,e)?xt(e):0),e),ms=(e,t)=>Yt(((e,t)=>L(Z(je,e),(s=>q(s,t)?zt(e,s,t):0))),e,t),ws=()=>Yt((()=>Jt({}))),Ls=()=>Yt((()=>{pt({}),e=!1})),Rs=()=>Yt((()=>{vt({}),t=!1})),Is=(e,t)=>{if(-1!=o){Js();const s=e();return Es(t),s}},Js=()=>(-1!=o&&o++,1==o&&it(lt,void 0),Fs),Es=e=>(o>0&&(o--,0==o&&(o=1,Gt(1),G(A)||Ut(1),Kt(1),G(fe)||Xt(1),e?.(Fs)&&(Q(A,((e,t)=>Q(e,((e,s)=>Q(e,(([e],n)=>pe(Fs,t,s,n,e))))))),K(A),Q(fe,(([e],t)=>ve(Fs,t,e))),K(fe)),it(ot[0],void 0),o=-1,Gt(0),G(A)||Ut(0),Kt(0),G(fe)||Xt(0),d[0]?.(Fs),it(ot[1],void 0),d[1]?.(Fs),o=0,n=cs(),a=gs(),F([m,z,P,j,k,A,Re,N,fe,Ie],K))),Fs),Fs={getContent:()=>[Zt(),os()],getTables:Zt,getTableIds:_t,getTable:e=>ae(Z(je,C(e))),getTableCellIds:es,getRowCount:ts,getRowIds:ss,getSortedRowIds:ns,getRow:(e,t)=>ne(Z(Z(je,C(e)),C(t))),getCellIds:as,getCell:ls,getValues:os,getValueIds:rs,getValue:is,hasTables:cs,hasTable:ds,hasTableCell:us,hasRow:fs,hasCell:hs,hasValues:gs,hasValue:Ts,getTablesJson:()=>ye(je),getValuesJson:()=>ye(ke),getJson:()=>ye([je,ke]),getTablesSchemaJson:()=>ye(Je),getValuesSchemaJson:()=>ye(Fe),getSchemaJson:()=>ye([Je,Fe]),hasTablesSchema:()=>e,hasValuesSchema:()=>t,setContent:([e,t])=>Yt((()=>{(W(e)?ys:bs)(e),(W(t)?ws:Ss)(t)})),setTables:bs,setTable:(e,t)=>Yt((e=>ft(t,e)?mt(e,t):0),e),setRow:(e,t,s)=>Yt(((e,t)=>ht(e,t,s)?wt(e,Ot(e),t,s):0),e,t),addRow:(e,t,s=!0)=>Is((()=>{let n;return ht(e,n,t)&&(e=C(e),wt(e,Ot(e),n=Ft(e,s?1:0),t)),n})),setPartialRow:(e,t,s)=>Yt(((e,t)=>{if(ht(e,t,s,1)){const n=Ot(e);H(s,((s,a)=>Rt(e,n,t,a,s)))}}),e,t),setCell:(e,t,s,n)=>Yt(((e,t,s)=>L(gt(e,t,s,I(n)?n(ls(e,t,s)):n),(n=>Rt(e,Ot(e),t,s,n)))),e,t,s),setValues:Ss,setPartialValues:e=>Yt((()=>Tt(e,1)?H(e,((e,t)=>Et(t,e))):0)),setValue:(e,t)=>Yt((e=>L(bt(e,I(t)?t(is(e)):t),(t=>Et(e,t)))),e),applyChanges:e=>Yt((()=>{H(e[0],((e,t)=>w(e)?Cs(t):H(e,((e,s)=>w(e)?ms(t,s):H(e,((e,n)=>pe(Fs,t,s,n,e))))))),H(e[1],((e,t)=>ve(Fs,t,e)))})),setTablesJson:Vs,setValuesJson:e=>{try{It(Ce(e))}catch{}return Fs},setJson:e=>Yt((()=>{try{const[t,s]=Ce(e);yt(t),It(s)}catch{Vs(e)}})),setTablesSchema:ps,setValuesSchema:vs,setSchema:(e,t)=>Yt((()=>{ps(e),vs(t)})),delTables:ys,delTable:Cs,delRow:ms,delCell:(e,t,s,n)=>Yt(((e,t,s)=>L(Z(je,e),(a=>L(Z(a,t),(l=>q(l,s)?Pt(e,a,t,l,s,n):0))))),e,t,s),delValues:ws,delValue:e=>Yt((e=>q(ke,e)?jt(e):0),e),delTablesSchema:Ls,delValuesSchema:Rs,delSchema:()=>Yt((()=>{Ls(),Rs()})),transaction:Is,startTransaction:Js,getTransactionChanges:()=>[ne(A,((e,t)=>-1===Z(m,t)?void 0:ne(e,((e,s)=>-1===Z(Z(j,t),s)?void 0:ne(e,(([,e])=>e),((e,t)=>Se(t)))),W)),W),ne(fe,(([,e])=>e),((e,t)=>Se(t)))],getTransactionLog:()=>[!G(A),!G(fe),le(A,be,Se),le(Re),ne(fe,be,Se),ne(Ie),ne(m),ae(j),le(k),ne(N)],finishTransaction:Es,forEachTable:e=>Q(je,((t,s)=>e(s,(e=>Q(t,((t,s)=>e(s,(e=>_(t,e))))))))),forEachTableCell:(e,t)=>_(Z(Pe,C(e)),t),forEachRow:(e,t)=>Q(Z(je,C(e)),((e,s)=>t(s,(t=>_(e,t))))),forEachCell:(e,t,s)=>_(Z(Z(je,C(e)),C(t)),s),forEachValue:e=>_(ke,e),addSortedRowIdsListener:(e,t,s,n,a,l,o)=>{let r=ns(e,t,s,n,a);return rt((()=>{const o=ns(e,t,s,n,a);var i,c,d;c=r,E(i=o)===E(c)&&(d=(e,t)=>c[t]===e,i.every(d))||(r=o,l(Fs,e,t,s,n,a,r))}),Ge[o?1:0],[e,t],[_t])},addStartTransactionListener:e=>rt(e,lt),addWillFinishTransactionListener:e=>rt(e,ot[0]),addDidFinishTransactionListener:e=>rt(e,ot[1]),callListener:e=>(dt(e),Fs),delListener:e=>(ct(e),Fs),getListenerStats:()=>({}),createStore:Le,addListener:rt,callListeners:it,setInternalListeners:(e,t)=>d=[e,t]};return H({[c+f]:[0,Ae,[],()=>[cs()]],[f]:[0,Me],[h]:[0,Ne],[c+u]:[1,Be,[_t],e=>[ds(...e)]],[u]:[1,De,[_t]],[u+V]:[1,He,[_t]],[c+u+S]:[2,We,[_t,es],e=>[us(...e)]],[T]:[1,$e,[_t]],[b]:[1,qe,[_t]],[c+g]:[2,Ke,[_t,ss],e=>[fs(...e)]],[g]:[2,Qe,[_t,ss]],[V]:[2,Ue,[_t,ss]],[c+S]:[3,Xe,[_t,ss,as],e=>[hs(...e)]],[S]:[3,Ye,[_t,ss,as],e=>ge(ls(...e))],InvalidCell:[3,Ze],[c+v]:[0,et,[],()=>[gs()]],[v]:[0,tt],[y]:[0,st],[c+p]:[1,nt,[rs],e=>[Ts(...e)]],[p]:[1,at,[rs],e=>ge(is(e[0]))],InvalidValue:[1,_e]},(([e,t,s,n],a)=>{Fs["add"+a+"Listener"]=(...a)=>rt(a[e],t[a[e+1]?1:0],e>0?J(a,0,e):void 0,s,n)})),M(Fs)};e.createStore=Le},"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseStore={});

var e,s;e=this,s=function(e,s){"use strict";const t=e=>typeof e,o="",u=t(o),r=t(t),l="Listener",d="Result",n="Has",i="has",a="Ids",c="Table",I=c+"s",C=c+a,b="Row",p=b+"Count",w=b+a,R="Sorted"+b+a,k="Cell",g=k+a,L="Value",h=L+"s",m=L+a,y=e=>null==e,T=(e,s,t)=>y(e)?t?.():s(e),V=e=>t(e)==u,S=e=>t(e)==r,f=()=>{},v=(e,s)=>e.map(s),x=Object.keys,P=(e,s)=>T(e,(e=>e[s])),q=(e,s)=>(delete e[s],e),{createContext:B,useContext:H,useEffect:M}=s,D=B([]),F=(e,s)=>{const t=H(D);return y(e)?t[s]:V(e)?P(t[s+1]??{},e):e},O=(e,s)=>{const t=F(e,s);return y(e)||V(e)?t:e},Q=e=>x(H(D)[e]??{}),E=e=>O(e,0),A=e=>O(e,2),G=e=>O(e,4),j=e=>O(e,6),U=e=>O(e,8),W=e=>O(e,10),z=e=>e.toLowerCase();z(l);const J="Transaction";z(J);const{useCallback:K,useEffect:N,useMemo:X,useLayoutEffect:Y,useRef:Z,useState:$}=s,_=[],ee={},se=[[],void 0,[]],te=(e,s,t=_)=>{const o=X((()=>s(e)),[e,...t]);return N((()=>()=>o.destroy()),[o]),o},oe=(e,s,t,o=_,u,r="get",l="")=>{const[,d]=$(),n=K((()=>s?.[r+e]?.(...o)??t),[s,r,e,...o,t]),i=Z();return X((()=>i.current=n()),[n]),ue(l+e,s,((...e)=>{i.current=y(u)?n():e[u],d([])}),[n,u],o),i.current},ue=(e,s,t,o=_,u=_,...r)=>Y((()=>{const o=s?.["add"+e+l]?.(...u,t,...r);return()=>s?.delListener(o)}),[s,e,...u,...o,...r]),re=(e,s,t,o=_,u=f,r=_,...l)=>{const d=E(e);return K((e=>T(d,(o=>T(t(e,o),(t=>u(o["set"+s](...v(l,(s=>S(s)?s(e,o):s)),t),t)))))),[d,s,...o,...r,...l])},le=(e,s,t=f,o=_,...u)=>{const r=E(e);return K((()=>t(r?.["del"+s](...u))),[r,s,...o,...u])},de=(e,s,t)=>{const o=W(e);return K((()=>o?.[s](t)),[o,s,t])},ne=e=>oe(C,E(e),_),ie=(e,s)=>oe(w,E(s),_,[e]),ae=(e,s,t,o=0,u,r)=>oe(R,E(r),_,[e,s,t,o,u],6),ce=(e,s,t)=>oe(g,E(t),_,[e,s]),Ie=(e,s,t,o)=>oe(k,E(o),void 0,[e,s,t],4),Ce=e=>oe(m,E(e),_),be=(e,s)=>oe(L,E(s),void 0,[e]),pe=(e,s)=>oe("Metric",A(s),void 0,[e]),we=(e,s)=>oe("SliceIds",G(s),_,[e]),Re=(e,s,t)=>oe("Slice"+w,G(t),_,[e,s]),ke=(e,s,t)=>oe("RemoteRowId",j(t),void 0,[e,s]),ge=(e,s,t)=>oe("Local"+w,j(t),_,[e,s]),Le=(e,s,t)=>oe("Linked"+w,j(t),_,[e,s]),he=(e,s)=>oe(d+w,U(s),_,[e]),me=(e,s,t,o=0,u,r)=>oe(d+R,U(r),_,[e,s,t,o,u],6),ye=(e,s,t)=>oe(d+g,U(t),_,[e,s]),Te=(e,s,t,o)=>oe(d+k,U(o),void 0,[e,s,t]),Ve=e=>oe("CheckpointIds",W(e),se),Se=(e,s)=>oe("Checkpoint",W(s),void 0,[e]),fe=e=>de(e,"goBackward"),ve=e=>de(e,"goForward"),{PureComponent:xe,Fragment:Pe,createElement:qe,useCallback:Be,useLayoutEffect:He,useRef:Me,useState:De}=s,Fe=(e,...s)=>y(e)?{}:e(...s),Oe=(e,s)=>[e,e?.getStore(),e?.getLocalTableId(s),e?.getRemoteTableId(s)],{useCallback:Qe,useContext:Ee,useMemo:Ae,useState:Ge}=s,je=({tableId:e,store:s,rowComponent:t=Ne,getRowComponentProps:o,customCellIds:u,separator:r,debugIds:l},d)=>Je(v(d,(r=>qe(t,{...Fe(o,r),key:r,tableId:e,rowId:r,customCellIds:u,store:s,debugIds:l}))),r,l,e),Ue=({queryId:e,queries:s,resultRowComponent:t=_e,getResultRowComponentProps:o,separator:u,debugIds:r},l)=>Je(v(l,(u=>qe(t,{...Fe(o,u),key:u,queryId:e,rowId:u,queries:s,debugIds:r}))),u,r,e),We=({relationshipId:e,relationships:s,rowComponent:t=Ne,getRowComponentProps:o,separator:u,debugIds:r},l,d)=>{const[n,i,a]=Oe(j(s),e),c=l(e,d,n);return Je(v(c,(e=>qe(t,{...Fe(o,e),key:e,tableId:a,rowId:e,store:i,debugIds:r}))),u,r,d)},ze=e=>({checkpoints:s,checkpointComponent:t=es,getCheckpointComponentProps:o,separator:u,debugIds:r})=>{const l=W(s);return Je(v(e(Ve(l)),(e=>qe(t,{...Fe(o,e),key:e,checkpoints:l,checkpointId:e,debugIds:r}))),u)},Je=(e,s,t,o)=>{const u=y(s)||!Array.isArray(e)?e:v(e,((e,t)=>t>0?[s,e]:e));return t?[o,":{",u,"}"]:u},Ke=({tableId:e,rowId:s,cellId:t,store:u,debugIds:r})=>Je(o+(Ie(e,s,t,u)??o),void 0,r,t),Ne=({tableId:e,rowId:s,store:t,cellComponent:o=Ke,getCellComponentProps:u,customCellIds:r,separator:l,debugIds:d})=>Je(v(((e,s,t,o)=>{const u=ce(s,t,o);return e??u})(r,e,s,t),(r=>qe(o,{...Fe(u,r),key:r,tableId:e,rowId:s,cellId:r,store:t,debugIds:d}))),l,d,s),Xe=e=>je(e,ie(e.tableId,e.store)),Ye=({valueId:e,store:s,debugIds:t})=>Je(o+(be(e,s)??o),void 0,t,e),Ze=({indexId:e,sliceId:s,indexes:t,rowComponent:o=Ne,getRowComponentProps:u,separator:r,debugIds:l})=>{const[d,n,i]=((e,s)=>[e,e?.getStore(),e?.getTableId(s)])(G(t),e),a=Re(e,s,d);return Je(v(a,(e=>qe(o,{...Fe(u,e),key:e,tableId:i,rowId:e,store:n,debugIds:l}))),r,l,s)},$e=({queryId:e,rowId:s,cellId:t,queries:u,debugIds:r})=>Je(o+(Te(e,s,t,u)??o),void 0,r,t),_e=({queryId:e,rowId:s,queries:t,resultCellComponent:o=$e,getResultCellComponentProps:u,separator:r,debugIds:l})=>Je(v(ye(e,s,t),(r=>qe(o,{...Fe(u,r),key:r,queryId:e,rowId:s,cellId:r,queries:t,debugIds:l}))),r,l,s),es=({checkpoints:e,checkpointId:s,debugIds:t})=>Je(Se(s,e)??o,void 0,t,s),ss=ze((e=>e[0])),ts=ze((e=>y(e[1])?[]:[e[1]])),os=ze((e=>e[2]));e.BackwardCheckpointsView=ss,e.CellView=Ke,e.CheckpointView=es,e.CurrentCheckpointView=ts,e.ForwardCheckpointsView=os,e.IndexView=({indexId:e,indexes:s,sliceComponent:t=Ze,getSliceComponentProps:o,separator:u,debugIds:r})=>Je(v(we(e,s),(u=>qe(t,{...Fe(o,u),key:u,indexId:e,sliceId:u,indexes:s,debugIds:r}))),u,r,e),e.LinkedRowsView=e=>We(e,Le,e.firstRowId),e.LocalRowsView=e=>We(e,ge,e.remoteRowId),e.MetricView=({metricId:e,metrics:s,debugIds:t})=>Je(pe(e,s)??o,void 0,t,e),e.Provider=({store:e,storesById:s,metrics:t,metricsById:o,indexes:u,indexesById:r,relationships:l,relationshipsById:d,queries:n,queriesById:i,checkpoints:a,checkpointsById:c,children:I})=>{const C=Ee(D),[b,p]=Ge({}),w=Qe(((e,s)=>p((t=>P(t,e)==s?t:{...t,[e]:s}))),[]),R=Qe((e=>p((s=>({...q(s,e)})))),[]);return qe(D.Provider,{value:Ae((()=>[e??C[0],{...C[1],...s,...b},t??C[2],{...C[3],...o},u??C[4],{...C[5],...r},l??C[6],{...C[7],...d},n??C[8],{...C[9],...i},a??C[10],{...C[11],...c},w,R]),[e,s,b,t,o,u,r,l,d,n,i,a,c,C,w,R])},I)},e.RemoteRowView=({relationshipId:e,localRowId:s,relationships:t,rowComponent:o=Ne,getRowComponentProps:u,debugIds:r})=>{const[l,d,,n]=Oe(j(t),e),i=ke(e,s,l);return Je(y(n)||y(i)?null:qe(o,{...Fe(u,i),key:i,tableId:n,rowId:i,store:d,debugIds:r}),void 0,r,s)},e.ResultCellView=$e,e.ResultRowView=_e,e.ResultSortedTableView=({cellId:e,descending:s,offset:t,limit:o,...u})=>Ue(u,me(u.queryId,e,s,t,o,u.queries)),e.ResultTableView=e=>Ue(e,he(e.queryId,e.queries)),e.RowView=Ne,e.SliceView=Ze,e.SortedTableView=({cellId:e,descending:s,offset:t,limit:o,...u})=>je(u,ae(u.tableId,e,s,t,o,u.store)),e.TableView=Xe,e.TablesView=({store:e,tableComponent:s=Xe,getTableComponentProps:t,separator:o,debugIds:u})=>Je(v(ne(e),(o=>qe(s,{...Fe(t,o),key:o,tableId:o,store:e,debugIds:u}))),o),e.ValueView=Ye,e.ValuesView=({store:e,valueComponent:s=Ye,getValueComponentProps:t,separator:o,debugIds:u})=>Je(v(Ce(e),(o=>qe(s,{...Fe(t,o),key:o,valueId:o,store:e,debugIds:u}))),o),e.useAddRowCallback=(e,s,t=_,o,u=f,r=_,l=!0)=>{const d=E(o);return K((t=>T(d,(o=>T(s(t,o),(s=>u(o.addRow(S(e)?e(t,o):e,s,l),o,s)))))),[d,e,...t,...r,l])},e.useCell=Ie,e.useCellIds=ce,e.useCellIdsListener=(e,s,t,o,u,r)=>ue(g,E(r),t,o,[e,s],u),e.useCellListener=(e,s,t,o,u,r,l)=>ue(k,E(l),o,u,[e,s,t],r),e.useCheckpoint=Se,e.useCheckpointIds=Ve,e.useCheckpointIdsListener=(e,s,t)=>ue("CheckpointIds",W(t),e,s),e.useCheckpointListener=(e,s,t,o)=>ue("Checkpoint",W(o),s,t,[e]),e.useCheckpoints=e=>F(e,10),e.useCheckpointsIds=()=>Q(11),e.useCheckpointsOrCheckpointsById=W,e.useCreateCheckpoints=(e,s,t)=>te(e,s,t),e.useCreateIndexes=(e,s,t)=>te(e,s,t),e.useCreateMetrics=(e,s,t)=>te(e,s,t),e.useCreatePersister=(e,s,t=_,o,u=_,r,l=_)=>{const[,d]=$(),n=X((()=>s(e)),[e,...t]);return N((()=>((async()=>{o&&(await o(n),d([]))})(),()=>{n?.destroy(),r?.(n)})),[n,...u,...l]),n},e.useCreateQueries=(e,s,t)=>te(e,s,t),e.useCreateRelationships=(e,s,t)=>te(e,s,t),e.useCreateStore=(e,s=_)=>X(e,s),e.useDelCellCallback=(e,s,t,o,u,r,l)=>le(u,k,r,l,e,s,t,o),e.useDelRowCallback=(e,s,t,o,u)=>le(t,b,o,u,e,s),e.useDelTableCallback=(e,s,t,o)=>le(s,c,t,o,e),e.useDelTablesCallback=(e,s,t)=>le(e,I,s,t),e.useDelValueCallback=(e,s,t,o)=>le(s,L,t,o,e),e.useDelValuesCallback=(e,s,t)=>le(e,h,s,t),e.useDidFinishTransactionListener=(e,s,t)=>ue("DidFinish"+J,E(t),e,s),e.useGoBackwardCallback=fe,e.useGoForwardCallback=ve,e.useGoToCallback=(e,s=_,t,o=f,u=_)=>{const r=W(t);return K((s=>T(r,(t=>T(e(s),(e=>o(t.goTo(e),e)))))),[r,...s,...u])},e.useHasCell=(e,s,t,o)=>oe(k,E(o),!1,[e,s,t],4,i,n),e.useHasCellListener=(e,s,t,o,u,r,l)=>ue(n+k,E(l),o,u,[e,s,t],r),e.useHasRow=(e,s,t)=>oe(b,E(t),!1,[e,s],3,i,n),e.useHasRowListener=(e,s,t,o,u,r)=>ue(n+b,E(r),t,o,[e,s],u),e.useHasTable=(e,s)=>oe(c,E(s),!1,[e],2,i,n),e.useHasTableCell=(e,s,t)=>oe(c+k,E(t),!1,[e,s],3,i,n),e.useHasTableCellListener=(e,s,t,o,u,r)=>ue(n+c+k,E(r),t,o,[e,s],u),e.useHasTableListener=(e,s,t,o,u)=>ue(n+c,E(u),s,t,[e],o),e.useHasTables=e=>oe(I,E(e),!1,[],1,i,n),e.useHasTablesListener=(e,s,t,o)=>ue(n+I,E(o),e,s,[],t),e.useHasValue=(e,s)=>oe(L,E(s),!1,[e],2,i,n),e.useHasValueListener=(e,s,t,o,u)=>ue(n+L,E(u),s,t,[e],o),e.useHasValues=e=>oe(h,E(e),!1,[],1,i,n),e.useHasValuesListener=(e,s,t,o)=>ue(n+h,E(o),e,s,[],t),e.useIndexIds=e=>oe("IndexIds",G(e),_),e.useIndexes=e=>F(e,4),e.useIndexesIds=()=>Q(5),e.useIndexesOrIndexesById=G,e.useLinkedRowIds=Le,e.useLinkedRowIdsListener=(e,s,t,o,u)=>ue("Linked"+w,j(u),t,o,[e,s]),e.useLocalRowIds=ge,e.useLocalRowIdsListener=(e,s,t,o,u)=>ue("Local"+w,j(u),t,o,[e,s]),e.useMetric=pe,e.useMetricIds=e=>oe("MetricIds",A(e),_),e.useMetricListener=(e,s,t,o)=>ue("Metric",A(o),s,t,[e]),e.useMetrics=e=>F(e,2),e.useMetricsIds=()=>Q(3),e.useMetricsOrMetricsById=A,e.useProvideStore=(e,s)=>{const{12:t,13:o}=H(D);M((()=>(t?.(e,s),()=>o?.(e))),[t,e,s,o])},e.useQueries=e=>F(e,8),e.useQueriesIds=()=>Q(9),e.useQueriesOrQueriesById=U,e.useQueryIds=e=>oe("QueryIds",U(e),_),e.useRedoInformation=e=>{const s=W(e),[,,[t]]=Ve(s);return[!y(t),ve(s),t,T(t,(e=>s?.getCheckpoint(e)))??o]},e.useRelationshipIds=e=>oe("RelationshipIds",j(e),_),e.useRelationships=e=>F(e,6),e.useRelationshipsIds=()=>Q(7),e.useRelationshipsOrRelationshipsById=j,e.useRemoteRowId=ke,e.useRemoteRowIdListener=(e,s,t,o,u)=>ue("RemoteRowId",j(u),t,o,[e,s]),e.useResultCell=Te,e.useResultCellIds=ye,e.useResultCellIdsListener=(e,s,t,o,u)=>ue(d+g,U(u),t,o,[e,s]),e.useResultCellListener=(e,s,t,o,u,r)=>ue(d+k,U(r),o,u,[e,s,t]),e.useResultRow=(e,s,t)=>oe(d+b,U(t),ee,[e,s]),e.useResultRowCount=(e,s)=>oe(d+p,U(s),0,[e]),e.useResultRowCountListener=(e,s,t,o)=>ue(d+p,U(o),s,t,[e]),e.useResultRowIds=he,e.useResultRowIdsListener=(e,s,t,o)=>ue(d+w,U(o),s,t,[e]),e.useResultRowListener=(e,s,t,o,u)=>ue(d+b,U(u),t,o,[e,s]),e.useResultSortedRowIds=me,e.useResultSortedRowIdsListener=(e,s,t,o,u,r,l,n)=>ue(d+R,U(n),r,l,[e,s,t,o,u]),e.useResultTable=(e,s)=>oe(d+c,U(s),ee,[e]),e.useResultTableCellIds=(e,s)=>oe(d+c+g,U(s),_,[e]),e.useResultTableCellIdsListener=(e,s,t,o)=>ue(d+c+g,U(o),s,t,[e]),e.useResultTableListener=(e,s,t,o)=>ue(d+c,U(o),s,t,[e]),e.useRow=(e,s,t)=>oe(b,E(t),ee,[e,s]),e.useRowCount=(e,s)=>oe(p,E(s),0,[e]),e.useRowCountListener=(e,s,t,o,u)=>ue(p,E(u),s,t,[e],o),e.useRowIds=ie,e.useRowIdsListener=(e,s,t,o,u)=>ue(w,E(u),s,t,[e],o),e.useRowListener=(e,s,t,o,u,r)=>ue(b,E(r),t,o,[e,s],u),e.useSetCellCallback=(e,s,t,o,u,r,l,d)=>re(r,k,o,u,l,d,e,s,t),e.useSetCheckpointCallback=(e=f,s=_,t,o=f,u=_)=>{const r=W(t);return K((s=>T(r,(t=>{const u=e(s);o(t.addCheckpoint(u),t,u)}))),[r,...s,...u])},e.useSetPartialRowCallback=(e,s,t,o,u,r,l)=>re(u,"PartialRow",t,o,r,l,e,s),e.useSetPartialValuesCallback=(e,s,t,o,u)=>re(t,"PartialValues",e,s,o,u),e.useSetRowCallback=(e,s,t,o,u,r,l)=>re(u,b,t,o,r,l,e,s),e.useSetTableCallback=(e,s,t,o,u,r)=>re(o,c,s,t,u,r,e),e.useSetTablesCallback=(e,s,t,o,u)=>re(t,I,e,s,o,u),e.useSetValueCallback=(e,s,t,o,u,r)=>re(o,L,s,t,u,r,e),e.useSetValuesCallback=(e,s,t,o,u)=>re(t,h,e,s,o,u),e.useSliceIds=we,e.useSliceIdsListener=(e,s,t,o)=>ue("SliceIds",G(o),s,t,[e]),e.useSliceRowIds=Re,e.useSliceRowIdsListener=(e,s,t,o,u)=>ue("Slice"+w,G(u),t,o,[e,s]),e.useSortedRowIds=ae,e.useSortedRowIdsListener=(e,s,t,o,u,r,l,d,n)=>ue(R,E(n),r,l,[e,s,t,o,u],d),e.useStartTransactionListener=(e,s,t)=>ue("Start"+J,E(t),e,s),e.useStore=e=>F(e,0),e.useStoreIds=()=>Q(1),e.useStoreOrStoreById=E,e.useTable=(e,s)=>oe(c,E(s),ee,[e]),e.useTableCellIds=(e,s)=>oe(c+g,E(s),_,[e]),e.useTableCellIdsListener=(e,s,t,o,u)=>ue(c+g,E(u),s,t,[e],o),e.useTableIds=ne,e.useTableIdsListener=(e,s,t,o)=>ue(C,E(o),e,s,_,t),e.useTableListener=(e,s,t,o,u)=>ue(c,E(u),s,t,[e],o),e.useTables=e=>oe(I,E(e),ee),e.useTablesListener=(e,s,t,o)=>ue(I,E(o),e,s,_,t),e.useUndoInformation=e=>{const s=W(e),[t,u]=Ve(s);return[(r=t,!(0==r.length)),fe(s),u,T(u,(e=>s?.getCheckpoint(e)))??o];var r},e.useValue=be,e.useValueIds=Ce,e.useValueIdsListener=(e,s,t,o)=>ue(m,E(o),e,s,_,t),e.useValueListener=(e,s,t,o,u)=>ue(L,E(u),s,t,[e],o),e.useValues=e=>oe(h,E(e),ee),e.useValuesListener=(e,s,t,o)=>ue(h,E(o),e,s,_,t),e.useWillFinishTransactionListener=(e,s,t)=>ue("WillFinish"+J,E(t),e,s)},"object"==typeof exports&&"undefined"!=typeof module?s(exports,require("react")):"function"==typeof define&&define.amd?define(["exports","react"],s):s((e="undefined"!=typeof globalThis?globalThis:e||self).TinyBaseUiReact={},e.React);

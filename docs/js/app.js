(()=>{var p=document,f=t=>p.querySelector(t),g=(t,n)=>t.querySelector(n),v=t=>p.getElementById(t),d=(t,n,l={},r)=>{let a=p.createElement(t);return Object.entries(l).forEach(E=>a.setAttribute(...E)),r!=null&&(a.innerText=r),n!=null?n.appendChild(a):a},L=(t,n,l)=>{let r=(t.className??"").split(" ");l(r,r.indexOf(n)),t.className=r.join(" ")},h=(t,n)=>L(t,n,(l,r)=>r==-1?l.push(n):null),H=(t,n)=>L(t,n,(l,r)=>r!=-1?l.splice(r,1):null),b=(t,n,l)=>L(t,n,(r,a)=>a!=-1?r.splice(a,1):r.push(n)&&l()),m="dark",T="light",M="auto",k=()=>q(),q=()=>{let t=matchMedia("(prefers-color-scheme: dark)"),n=()=>{let l=localStorage.getItem(m)??M;f("#dark")?.setAttribute("class",l),f("html").className=l==m||l==M&&t.matches?m:T};t.addEventListener("change",n),window.addEventListener("storage",l=>{l.storageArea==localStorage&&l.key==m&&n()}),addEventListener("load",()=>{f("#dark").addEventListener("click",()=>{let l=localStorage.getItem(m);localStorage.setItem(m,l==m?T:l==T?M:m),n()}),n()}),n()};k();addEventListener("load",()=>{let t=f("body > main > nav"),n=f("body > main > article");if(t==null||n==null)return;let l=()=>{let o=g(n,":scope iframe");if(o==null)return;let e=o.parentElement.insertBefore(d("form",null,{action:"https://codepen.io/pen/define",method:"post",target:"_blank"}),o);o.parentElement.insertBefore(d("a",null,{id:"penEdit"},"CodePen"),o).onclick=()=>{e.childNodes.length==0?fetch("pen.json").then(s=>s.text()).then(s=>{d("input",e,{type:"hidden",name:"data",value:s}),e.submit()}):e.submit()}};l(),p.body.addEventListener("click",o=>{if(o.button!=0)return;let e=o.target;if(e.tagName=="SPAN"&&e.innerHTML==""&&e.parentElement.tagName=="LI")return r(e.parentElement);for(;e.tagName!="A"&&e.parentElement!=null;)e=e.parentElement;let s=e.href;!o.metaKey&&!o.shiftKey&&s!=null&&s!=location.origin+"/"&&s.startsWith(location.origin+"/")&&!s.includes("#")&&(a(s),o.preventDefault(),history.pushState(null,"",s+"/"))}),window.onpopstate=function(o){location.href.includes("#")||(a(location.href),o.preventDefault())};let r=o=>b(o,"open",()=>{let e=g(o,"a");e.href!=location.origin+"/"&&e.click()}),a=o=>{fetch(`${o}/nav.json`).then(e=>e.json()).then(e=>{H(g(t,"li.current"),"current"),E(e,g(t,"ul"))}),fetch(`${o}/article.html`).then(e=>e.text()).then(e=>x(e))},E=({i:o,n:e,u:s,r:N,c:C,p:A,o:B,_:y},S)=>{let i=v(o);if(i==null){i=d("li",S,{id:o}),d("span",i);let c=d("a",i,{href:s});N?d("code",c,{},e):c.innerText=e,A&&h(i,"parent")}if(B&&h(i,"open"),y!=null){let c=g(i,"ul")??d("ul",i);y.forEach(u=>{E(u,c)})}if(C){h(i,"current"),p.title=`${e} | TinyBase`;let c=i.getBoundingClientRect(),u=t.getBoundingClientRect();c.top<u.top?t.scrollBy(0,c.top-u.top):c.bottom>u.bottom&&t.scrollBy(0,Math.min(c.bottom-u.bottom,c.top-u.top))}},x=o=>{n.innerHTML=o,n.scrollTo(0,0),l()}});})();

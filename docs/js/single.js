(()=>{var v=document,o=t=>v.querySelector(t);var g=t=>v.getElementById(t);var f=(t,s,e)=>{let n=(t.className??"").split(" ");e(n,n.indexOf(s)),t.className=n.join(" ")},M=(t,s)=>f(t,s,(e,n)=>n==-1?e.push(s):null),u=(t,s)=>f(t,s,(e,n)=>n!=-1?e.splice(n,1):null);var l="dark",L="light",p="auto",T=()=>h(),h=()=>{let t=matchMedia("(prefers-color-scheme: dark)"),s=()=>{let e=localStorage.getItem(l)??p;o("#dark")?.setAttribute("class",e),o("html").className=e==l||e==p&&t.matches?l:L};t.addEventListener("change",s),window.addEventListener("storage",e=>{e.storageArea==localStorage&&e.key==l&&s()}),addEventListener("load",()=>{o("#dark").addEventListener("click",()=>{let e=localStorage.getItem(l);localStorage.setItem(l,e==l?L:e==L?p:l),s()}),s()}),s()};T();addEventListener("load",()=>{let t=o("body > main > nav"),s=o("body > main > article");if(t==null||s==null)return;let e=new Map,n=new IntersectionObserver(m=>{m.forEach(a=>{let r=a.target,d=a.target.className,c=/s\d+/.test(d)?parseInt(d.substr(1)):0,i=e.get(c);i==null&&(i=new Set,e.set(c,i)),a.isIntersecting?i.add(r):(i.delete(r),u(g(r.dataset.id),"current"))});let E=0;e.forEach((a,r)=>{a.size>0&&r>E&&(E=r)}),e.forEach((a,r)=>a.forEach(d=>{let c=g(d.dataset.id);r==E?M(c,"current"):u(c,"current")}))});s.querySelectorAll("section[data-id]").forEach(m=>n.observe(m))});})();

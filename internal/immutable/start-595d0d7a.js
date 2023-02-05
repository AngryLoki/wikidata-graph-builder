import{S as ot,i as it,s as st,a as lt,e as T,c as ct,b as H,g as Q,t as j,d as x,f as D,h as q,j as ft,o as Oe,k as ut,l as dt,m as pt,n as $e,p as z,q as ht,r as mt,u as _t,v as B,w as G,x as se,y as J,z as K,A as he}from"./chunks/index-04c8a6d0.js";import{S as tt,I as M,g as ze,f as We,a as Re,b as me,s as Y,i as Ye,c as oe,P as Xe,d as gt,e as wt,h as yt}from"./chunks/singletons-1dd5363d.js";import{_ as ee}from"./chunks/preload-helper-41c905a7.js";function bt(r,e){return r==="/"||e==="ignore"?r:e==="never"?r.endsWith("/")?r.slice(0,-1):r:e==="always"&&!r.endsWith("/")?r+"/":r}function vt(r){return r.split("%25").map(decodeURI).join("%25")}function Et(r){for(const e in r)r[e]=decodeURIComponent(r[e]);return r}const kt=["href","pathname","search","searchParams","toString","toJSON"];function $t(r,e){const n=new URL(r);for(const o of kt){let a=n[o];Object.defineProperty(n,o,{get(){return e(),a},enumerable:!0,configurable:!0})}return Rt(n),n}function Rt(r){Object.defineProperty(r,"hash",{get(){throw new Error("Cannot access event.url.hash. Consider using `$page.url.hash` inside a component instead")}})}const St="/__data.json";function It(r){return r.replace(/\/$/,"")+St}function Lt(...r){let e=5381;for(const n of r)if(typeof n=="string"){let o=n.length;for(;o;)e=e*33^n.charCodeAt(--o)}else if(ArrayBuffer.isView(n)){const o=new Uint8Array(n.buffer,n.byteOffset,n.byteLength);let a=o.length;for(;a;)e=e*33^o[--a]}else throw new TypeError("value must be a string or TypedArray");return(e>>>0).toString(36)}const _e=window.fetch;window.fetch=(r,e)=>((r instanceof Request?r.method:(e==null?void 0:e.method)||"GET")!=="GET"&&ie.delete(Ue(r)),_e(r,e));const ie=new Map;function At(r,e){const n=Ue(r,e),o=document.querySelector(n);if(o!=null&&o.textContent){const{body:a,...h}=JSON.parse(o.textContent),t=o.getAttribute("data-ttl");return t&&ie.set(n,{body:a,init:h,ttl:1e3*Number(t)}),Promise.resolve(new Response(a,h))}return _e(r,e)}function Ot(r,e,n){if(ie.size>0){const o=Ue(r,n),a=ie.get(o);if(a){if(performance.now()<a.ttl&&["default","force-cache","only-if-cached",void 0].includes(n==null?void 0:n.cache))return new Response(a.body,a.init);ie.delete(o)}}return _e(e,n)}function Ue(r,e){let o=`script[data-sveltekit-fetched][data-url=${JSON.stringify(r instanceof Request?r.url:r)}]`;if(e!=null&&e.headers||e!=null&&e.body){const a=[];e.headers&&a.push([...new Headers(e.headers)].join(",")),e.body&&(typeof e.body=="string"||ArrayBuffer.isView(e.body))&&a.push(e.body),o+=`[data-hash="${Lt(...a)}"]`}return o}const Pt=/^(\[)?(\.\.\.)?(\w+)(?:=(\w+))?(\])?$/;function Nt(r){const e=[];return{pattern:r==="/"?/^\/$/:new RegExp(`^${Tt(r).map(o=>{const a=/^\[\.\.\.(\w+)(?:=(\w+))?\]$/.exec(o);if(a)return e.push({name:a[1],matcher:a[2],optional:!1,rest:!0,chained:!0}),"(?:/(.*))?";const h=/^\[\[(\w+)(?:=(\w+))?\]\]$/.exec(o);if(h)return e.push({name:h[1],matcher:h[2],optional:!0,rest:!1,chained:!0}),"(?:/([^/]+))?";if(!o)return;const t=o.split(/\[(.+?)\](?!\])/);return"/"+t.map((u,m)=>{if(m%2){if(u.startsWith("x+"))return Se(String.fromCharCode(parseInt(u.slice(2),16)));if(u.startsWith("u+"))return Se(String.fromCharCode(...u.slice(2).split("-").map(I=>parseInt(I,16))));const w=Pt.exec(u);if(!w)throw new Error(`Invalid param: ${u}. Params and matcher names can only have underscores and alphanumeric characters.`);const[,E,P,k,F]=w;return e.push({name:k,matcher:F,optional:!!E,rest:!!P,chained:P?m===1&&t[0]==="":!1}),P?"(.*?)":E?"([^/]*)?":"([^/]+?)"}return Se(u)}).join("")}).join("")}/?$`),params:e}}function Ut(r){return!/^\([^)]+\)$/.test(r)}function Tt(r){return r.slice(1).split("/").filter(Ut)}function jt(r,e,n){const o={},a=r.slice(1);let h=0;for(let t=0;t<e.length;t+=1){const f=e[t],u=a[t-h];if(f.chained&&f.rest&&h){o[f.name]=a.slice(t-h,t+1).filter(m=>m).join("/"),h=0;continue}if(u===void 0){f.rest&&(o[f.name]="");continue}if(!f.matcher||n[f.matcher](u)){o[f.name]=u;continue}if(f.optional&&f.chained){h++;continue}return}if(!h)return o}function Se(r){return r.normalize().replace(/[[\]]/g,"\\$&").replace(/%/g,"%25").replace(/\//g,"%2[Ff]").replace(/\?/g,"%3[Ff]").replace(/#/g,"%23").replace(/[.*+?^${}()|\\]/g,"\\$&")}function Dt(r,e,n,o){const a=new Set(e);return Object.entries(n).map(([f,[u,m,w]])=>{const{pattern:E,params:P}=Nt(f),k={id:f,exec:F=>{const I=E.exec(F);if(I)return jt(I,P,o)},errors:[1,...w||[]].map(F=>r[F]),layouts:[0,...m||[]].map(t),leaf:h(u)};return k.errors.length=k.layouts.length=Math.max(k.errors.length,k.layouts.length),k});function h(f){const u=f<0;return u&&(f=~f),[u,r[f]]}function t(f){return f===void 0?f:[a.has(f),r[f]]}}function Vt(r){let e,n,o;var a=r[0][0];function h(t){return{props:{data:t[2],form:t[1]}}}return a&&(e=B(a,h(r))),{c(){e&&G(e.$$.fragment),n=T()},l(t){e&&se(e.$$.fragment,t),n=T()},m(t,f){e&&J(e,t,f),H(t,n,f),o=!0},p(t,f){const u={};if(f&4&&(u.data=t[2]),f&2&&(u.form=t[1]),a!==(a=t[0][0])){if(e){Q();const m=e;j(m.$$.fragment,1,0,()=>{K(m,1)}),x()}a?(e=B(a,h(t)),G(e.$$.fragment),D(e.$$.fragment,1),J(e,n.parentNode,n)):e=null}else a&&e.$set(u)},i(t){o||(e&&D(e.$$.fragment,t),o=!0)},o(t){e&&j(e.$$.fragment,t),o=!1},d(t){t&&q(n),e&&K(e,t)}}}function Ct(r){let e,n,o;var a=r[0][0];function h(t){return{props:{data:t[2],$$slots:{default:[Ht]},$$scope:{ctx:t}}}}return a&&(e=B(a,h(r))),{c(){e&&G(e.$$.fragment),n=T()},l(t){e&&se(e.$$.fragment,t),n=T()},m(t,f){e&&J(e,t,f),H(t,n,f),o=!0},p(t,f){const u={};if(f&4&&(u.data=t[2]),f&1051&&(u.$$scope={dirty:f,ctx:t}),a!==(a=t[0][0])){if(e){Q();const m=e;j(m.$$.fragment,1,0,()=>{K(m,1)}),x()}a?(e=B(a,h(t)),G(e.$$.fragment),D(e.$$.fragment,1),J(e,n.parentNode,n)):e=null}else a&&e.$set(u)},i(t){o||(e&&D(e.$$.fragment,t),o=!0)},o(t){e&&j(e.$$.fragment,t),o=!1},d(t){t&&q(n),e&&K(e,t)}}}function qt(r){let e,n,o;var a=r[0][1];function h(t){return{props:{data:t[3],form:t[1]}}}return a&&(e=B(a,h(r))),{c(){e&&G(e.$$.fragment),n=T()},l(t){e&&se(e.$$.fragment,t),n=T()},m(t,f){e&&J(e,t,f),H(t,n,f),o=!0},p(t,f){const u={};if(f&8&&(u.data=t[3]),f&2&&(u.form=t[1]),a!==(a=t[0][1])){if(e){Q();const m=e;j(m.$$.fragment,1,0,()=>{K(m,1)}),x()}a?(e=B(a,h(t)),G(e.$$.fragment),D(e.$$.fragment,1),J(e,n.parentNode,n)):e=null}else a&&e.$set(u)},i(t){o||(e&&D(e.$$.fragment,t),o=!0)},o(t){e&&j(e.$$.fragment,t),o=!1},d(t){t&&q(n),e&&K(e,t)}}}function Ft(r){let e,n,o;var a=r[0][1];function h(t){return{props:{data:t[3],$$slots:{default:[Mt]},$$scope:{ctx:t}}}}return a&&(e=B(a,h(r))),{c(){e&&G(e.$$.fragment),n=T()},l(t){e&&se(e.$$.fragment,t),n=T()},m(t,f){e&&J(e,t,f),H(t,n,f),o=!0},p(t,f){const u={};if(f&8&&(u.data=t[3]),f&1043&&(u.$$scope={dirty:f,ctx:t}),a!==(a=t[0][1])){if(e){Q();const m=e;j(m.$$.fragment,1,0,()=>{K(m,1)}),x()}a?(e=B(a,h(t)),G(e.$$.fragment),D(e.$$.fragment,1),J(e,n.parentNode,n)):e=null}else a&&e.$set(u)},i(t){o||(e&&D(e.$$.fragment,t),o=!0)},o(t){e&&j(e.$$.fragment,t),o=!1},d(t){t&&q(n),e&&K(e,t)}}}function Mt(r){let e,n,o;var a=r[0][2];function h(t){return{props:{data:t[4],form:t[1]}}}return a&&(e=B(a,h(r))),{c(){e&&G(e.$$.fragment),n=T()},l(t){e&&se(e.$$.fragment,t),n=T()},m(t,f){e&&J(e,t,f),H(t,n,f),o=!0},p(t,f){const u={};if(f&16&&(u.data=t[4]),f&2&&(u.form=t[1]),a!==(a=t[0][2])){if(e){Q();const m=e;j(m.$$.fragment,1,0,()=>{K(m,1)}),x()}a?(e=B(a,h(t)),G(e.$$.fragment),D(e.$$.fragment,1),J(e,n.parentNode,n)):e=null}else a&&e.$set(u)},i(t){o||(e&&D(e.$$.fragment,t),o=!0)},o(t){e&&j(e.$$.fragment,t),o=!1},d(t){t&&q(n),e&&K(e,t)}}}function Ht(r){let e,n,o,a;const h=[Ft,qt],t=[];function f(u,m){return u[0][2]?0:1}return e=f(r),n=t[e]=h[e](r),{c(){n.c(),o=T()},l(u){n.l(u),o=T()},m(u,m){t[e].m(u,m),H(u,o,m),a=!0},p(u,m){let w=e;e=f(u),e===w?t[e].p(u,m):(Q(),j(t[w],1,1,()=>{t[w]=null}),x(),n=t[e],n?n.p(u,m):(n=t[e]=h[e](u),n.c()),D(n,1),n.m(o.parentNode,o))},i(u){a||(D(n),a=!0)},o(u){j(n),a=!1},d(u){t[e].d(u),u&&q(o)}}}function Ze(r){let e,n=r[6]&&Qe(r);return{c(){e=ut("div"),n&&n.c(),this.h()},l(o){e=dt(o,"DIV",{id:!0,"aria-live":!0,"aria-atomic":!0,style:!0});var a=pt(e);n&&n.l(a),a.forEach(q),this.h()},h(){$e(e,"id","svelte-announcer"),$e(e,"aria-live","assertive"),$e(e,"aria-atomic","true"),z(e,"position","absolute"),z(e,"left","0"),z(e,"top","0"),z(e,"clip","rect(0 0 0 0)"),z(e,"clip-path","inset(50%)"),z(e,"overflow","hidden"),z(e,"white-space","nowrap"),z(e,"width","1px"),z(e,"height","1px")},m(o,a){H(o,e,a),n&&n.m(e,null)},p(o,a){o[6]?n?n.p(o,a):(n=Qe(o),n.c(),n.m(e,null)):n&&(n.d(1),n=null)},d(o){o&&q(e),n&&n.d()}}}function Qe(r){let e;return{c(){e=ht(r[7])},l(n){e=mt(n,r[7])},m(n,o){H(n,e,o)},p(n,o){o&128&&_t(e,n[7])},d(n){n&&q(e)}}}function Bt(r){let e,n,o,a,h;const t=[Ct,Vt],f=[];function u(w,E){return w[0][1]?0:1}e=u(r),n=f[e]=t[e](r);let m=r[5]&&Ze(r);return{c(){n.c(),o=lt(),m&&m.c(),a=T()},l(w){n.l(w),o=ct(w),m&&m.l(w),a=T()},m(w,E){f[e].m(w,E),H(w,o,E),m&&m.m(w,E),H(w,a,E),h=!0},p(w,[E]){let P=e;e=u(w),e===P?f[e].p(w,E):(Q(),j(f[P],1,1,()=>{f[P]=null}),x(),n=f[e],n?n.p(w,E):(n=f[e]=t[e](w),n.c()),D(n,1),n.m(o.parentNode,o)),w[5]?m?m.p(w,E):(m=Ze(w),m.c(),m.m(a.parentNode,a)):m&&(m.d(1),m=null)},i(w){h||(D(n),h=!0)},o(w){j(n),h=!1},d(w){f[e].d(w),w&&q(o),m&&m.d(w),w&&q(a)}}}function Gt(r,e,n){let{stores:o}=e,{page:a}=e,{components:h}=e,{form:t}=e,{data_0:f=null}=e,{data_1:u=null}=e,{data_2:m=null}=e;ft(o.page.notify);let w=!1,E=!1,P=null;return Oe(()=>{const k=o.page.subscribe(()=>{w&&(n(6,E=!0),n(7,P=document.title||"untitled page"))});return n(5,w=!0),k}),r.$$set=k=>{"stores"in k&&n(8,o=k.stores),"page"in k&&n(9,a=k.page),"components"in k&&n(0,h=k.components),"form"in k&&n(1,t=k.form),"data_0"in k&&n(2,f=k.data_0),"data_1"in k&&n(3,u=k.data_1),"data_2"in k&&n(4,m=k.data_2)},r.$$.update=()=>{r.$$.dirty&768&&o.page.set(a)},[h,t,f,u,m,w,E,P,o,a]}class Jt extends ot{constructor(e){super(),it(this,e,Gt,Bt,st,{stores:8,page:9,components:0,form:1,data_0:2,data_1:3,data_2:4})}}const Kt={},ge=[()=>ee(()=>import("./chunks/0-24c7175b.js"),["./chunks\\0-24c7175b.js","./chunks\\_layout-6222a003.js","./assets\\_layout-a33dd75d.css","./components\\layout.svelte-a1211f0d.js","./chunks\\index-04c8a6d0.js"],import.meta.url),()=>ee(()=>import("./chunks/1-6f4bd32b.js"),["./chunks\\1-6f4bd32b.js","./components\\error.svelte-0049a760.js","./chunks\\index-04c8a6d0.js","./chunks\\stores-f65c066e.js","./chunks\\singletons-1dd5363d.js","./chunks\\index-7838a8a2.js"],import.meta.url),()=>ee(()=>import("./chunks/2-11c41c70.js"),["./chunks\\2-11c41c70.js","./chunks\\_layout-e4a84b88.js","./components\\pages\\components\\_layout.svelte-065e0f7b.js","./chunks\\index-04c8a6d0.js"],import.meta.url),()=>ee(()=>import("./chunks/3-fef723e8.js"),["./chunks\\3-fef723e8.js","./chunks\\_page-26be32cc.js","./chunks\\index-04c8a6d0.js","./chunks\\stores-f65c066e.js","./chunks\\singletons-1dd5363d.js","./chunks\\index-7838a8a2.js","./chunks\\ColorInput-b5b4d3d0.js","./assets\\ColorInput-3d3f2fbb.css","./chunks\\preload-helper-41c905a7.js","./assets\\_page-e57394c9.css"],import.meta.url),()=>ee(()=>import("./chunks/4-b93abcb9.js"),["./chunks\\4-b93abcb9.js","./components\\pages\\components\\_page.svelte-05c0ab34.js","./chunks\\index-04c8a6d0.js","./chunks\\ColorInput-b5b4d3d0.js","./chunks\\index-7838a8a2.js","./assets\\ColorInput-3d3f2fbb.css"],import.meta.url),()=>ee(()=>import("./chunks/5-9c8cdb77.js"),["./chunks\\5-9c8cdb77.js","./components\\pages\\worker\\_page.svelte-3848ef61.js","./chunks\\preload-helper-41c905a7.js","./chunks\\index-04c8a6d0.js"],import.meta.url)],nt=[],zt={"/":[3],"/components":[4,[2]],"/worker":[5]},Wt={handleError:({error:r})=>{console.error(r)}};let Pe=class{constructor(e,n){this.status=e,typeof n=="string"?this.body={message:n}:n?this.body=n:this.body={message:`Error: ${e}`}}toString(){return JSON.stringify(this.body)}},xe=class{constructor(e,n){this.status=e,this.location=n}};async function Yt(r){var e;for(const n in r)if(typeof((e=r[n])==null?void 0:e.then)=="function")return Object.fromEntries(await Promise.all(Object.entries(r).map(async([o,a])=>[o,await a])));return r}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");const Xt=-1,Zt=-2,Qt=-3,xt=-4,en=-5,tn=-6;function nn(r){if(typeof r=="number")return o(r,!0);if(!Array.isArray(r)||r.length===0)throw new Error("Invalid input");const e=r,n=Array(e.length);function o(a,h=!1){if(a===Xt)return;if(a===Qt)return NaN;if(a===xt)return 1/0;if(a===en)return-1/0;if(a===tn)return-0;if(h)throw new Error("Invalid input");if(a in n)return n[a];const t=e[a];if(!t||typeof t!="object")n[a]=t;else if(Array.isArray(t))if(typeof t[0]=="string")switch(t[0]){case"Date":n[a]=new Date(t[1]);break;case"Set":const u=new Set;n[a]=u;for(let E=1;E<t.length;E+=1)u.add(o(t[E]));break;case"Map":const m=new Map;n[a]=m;for(let E=1;E<t.length;E+=2)m.set(o(t[E]),o(t[E+1]));break;case"RegExp":n[a]=new RegExp(t[1],t[2]);break;case"Object":n[a]=Object(t[1]);break;case"BigInt":n[a]=BigInt(t[1]);break;case"null":const w=Object.create(null);n[a]=w;for(let E=1;E<t.length;E+=2)w[t[E]]=o(t[E+1]);break}else{const f=new Array(t.length);n[a]=f;for(let u=0;u<t.length;u+=1){const m=t[u];m!==Zt&&(f[u]=o(m))}}else{const f={};n[a]=f;for(const u in t){const m=t[u];f[u]=o(m)}}return n[a]}return o(0)}function an(r){return r.filter(e=>e!=null)}const Ie=Dt(ge,nt,zt,Kt),at=ge[0],Ne=ge[1];at();Ne();let te={};try{te=JSON.parse(sessionStorage[tt])}catch{}function Le(r){te[r]=oe()}function rn({target:r,base:e}){var Ge;const n=document.documentElement,o=[];let a=null;const h={before_navigate:[],after_navigate:[]};let t={branch:[],error:null,url:null},f=!1,u=!1,m=!0,w=!1,E=!1,P=!1,k=!1,F,I=(Ge=history.state)==null?void 0:Ge[M];I||(I=Date.now(),history.replaceState({...history.state,[M]:I},"",location.href));const we=te[I];we&&(history.scrollRestoration="manual",scrollTo(we.x,we.y));let X,Te,le;async function je(){le=le||Promise.resolve(),await le,le=null;const i=new URL(location.href),s=ue(i,!0);a=null,await Ve(s,i,[])}async function ye(i,{noScroll:s=!1,replaceState:c=!1,keepFocus:l=!1,state:p={},invalidateAll:d=!1},_,b){return typeof i=="string"&&(i=new URL(i,ze(document))),pe({url:i,scroll:s?oe():null,keepfocus:l,redirect_chain:_,details:{state:p,replaceState:c},nav_token:b,accepted:()=>{d&&(k=!0)},blocked:()=>{},type:"goto"})}async function De(i){const s=ue(i,!1);if(!s)throw new Error(`Attempted to preload a URL that does not belong to this app: ${i}`);return a={id:s.id,promise:Fe(s).then(c=>(c.type==="loaded"&&c.state.error&&(a=null),c))},a.promise}async function ce(...i){const c=Ie.filter(l=>i.some(p=>l.exec(p))).map(l=>Promise.all([...l.layouts,l.leaf].map(p=>p==null?void 0:p[1]())));await Promise.all(c)}async function Ve(i,s,c,l,p={},d){var b,y;Te=p;let _=i&&await Fe(i);if(_||(_=await Be(s,{id:null},await re(new Error(`Not found: ${s.pathname}`),{url:s,params:{},route:{id:null}}),404)),s=(i==null?void 0:i.url)||s,Te!==p)return!1;if(_.type==="redirect")if(c.length>10||c.includes(s.pathname))_=await fe({status:500,error:await re(new Error("Redirect loop"),{url:s,params:{},route:{id:null}}),url:s,route:{id:null}});else return ye(new URL(_.location,s).href,{},[...c,s.pathname],p),!1;else((y=(b=_.props)==null?void 0:b.page)==null?void 0:y.status)>=400&&await Y.updated.check()&&await ae(s);if(o.length=0,k=!1,w=!0,l&&l.details){const{details:g}=l,$=g.replaceState?0:1;g.state[M]=I+=$,history[g.replaceState?"replaceState":"pushState"](g.state,"",s)}if(a=null,u?(t=_.state,_.props.page&&(_.props.page.url=s),F.$set(_.props)):Ce(_),l){const{scroll:g,keepfocus:$}=l,{activeElement:A}=document;await he();const V=document.activeElement!==A&&document.activeElement!==document.body;if(!$&&!V&&await Ae(),m){const S=s.hash&&document.getElementById(decodeURIComponent(s.hash.slice(1)));g?scrollTo(g.x,g.y):S?S.scrollIntoView():scrollTo(0,0)}}else await he();m=!0,_.props.page&&(X=_.props.page),d&&d(),w=!1}function Ce(i){var l;t=i.state;const s=document.querySelector("style[data-sveltekit]");s&&s.remove(),X=i.props.page,F=new Jt({target:r,props:{...i.props,stores:Y},hydrate:!0});const c={from:null,to:{params:t.params,route:{id:((l=t.route)==null?void 0:l.id)??null},url:new URL(location.href)},willUnload:!1,type:"enter"};h.after_navigate.forEach(p=>p(c)),u=!0}async function ne({url:i,params:s,branch:c,status:l,error:p,route:d,form:_}){let b="never";for(const S of c)(S==null?void 0:S.slash)!==void 0&&(b=S.slash);i.pathname=bt(i.pathname,b),i.search=i.search;const y={type:"loaded",state:{url:i,params:s,branch:c,error:p,route:d},props:{components:an(c).map(S=>S.node.component)}};_!==void 0&&(y.props.form=_);let g={},$=!X,A=0;for(let S=0;S<Math.max(c.length,t.branch.length);S+=1){const v=c[S],N=t.branch[S];(v==null?void 0:v.data)!==(N==null?void 0:N.data)&&($=!0),v&&(g={...g,...v.data},$&&(y.props[`data_${A}`]=g),A+=1)}return(!t.url||i.href!==t.url.href||t.error!==p||_!==void 0&&_!==X.form||$)&&(y.props.page={error:p,params:s,route:{id:(d==null?void 0:d.id)??null},status:l,url:new URL(i),form:_??null,data:$?g:X.data}),y}async function be({loader:i,parent:s,url:c,params:l,route:p,server_data_node:d}){var g,$,A;let _=null;const b={dependencies:new Set,params:new Set,parent:!1,route:!1,url:!1},y=await i();if((g=y.universal)!=null&&g.load){let V=function(...v){for(const N of v){const{href:C}=new URL(N,c);b.dependencies.add(C)}};const S={route:{get id(){return b.route=!0,p.id}},params:new Proxy(l,{get:(v,N)=>(b.params.add(N),v[N])}),data:(d==null?void 0:d.data)??null,url:$t(c,()=>{b.url=!0}),async fetch(v,N){let C;v instanceof Request?(C=v.url,N={body:v.method==="GET"||v.method==="HEAD"?void 0:await v.blob(),cache:v.cache,credentials:v.credentials,headers:v.headers,integrity:v.integrity,keepalive:v.keepalive,method:v.method,mode:v.mode,redirect:v.redirect,referrer:v.referrer,referrerPolicy:v.referrerPolicy,signal:v.signal,...N}):C=v;const W=new URL(C,c).href;return V(W),u?Ot(C,W,N):At(C,N)},setHeaders:()=>{},depends:V,parent(){return b.parent=!0,s()}};_=await y.universal.load.call(null,S)??null,_=_?await Yt(_):null}return{node:y,loader:i,server:d,universal:($=y.universal)!=null&&$.load?{type:"data",data:_,uses:b}:null,data:_??(d==null?void 0:d.data)??null,slash:((A=y.universal)==null?void 0:A.trailingSlash)??(d==null?void 0:d.slash)}}function qe(i,s,c,l,p){if(k)return!0;if(!l)return!1;if(l.parent&&i||l.route&&s||l.url&&c)return!0;for(const d of l.params)if(p[d]!==t.params[d])return!0;for(const d of l.dependencies)if(o.some(_=>_(new URL(d))))return!0;return!1}function ve(i,s){return(i==null?void 0:i.type)==="data"?{type:"data",data:i.data,uses:{dependencies:new Set(i.uses.dependencies??[]),params:new Set(i.uses.params??[]),parent:!!i.uses.parent,route:!!i.uses.route,url:!!i.uses.url},slash:i.slash}:(i==null?void 0:i.type)==="skip"?s??null:null}async function Fe({id:i,invalidating:s,url:c,params:l,route:p}){if((a==null?void 0:a.id)===i)return a.promise;const{errors:d,layouts:_,leaf:b}=p,y=[..._,b];d.forEach(R=>R==null?void 0:R().catch(()=>{})),y.forEach(R=>R==null?void 0:R[1]().catch(()=>{}));let g=null;const $=t.url?i!==t.url.pathname+t.url.search:!1,A=t.route?p.id!==t.route.id:!1;let V=!1;const S=y.map((R,U)=>{var Z;const L=t.branch[U],O=!!(R!=null&&R[0])&&((L==null?void 0:L.loader)!==R[1]||qe(V,A,$,(Z=L.server)==null?void 0:Z.uses,l));return O&&(V=!0),O});if(S.some(Boolean)){try{g=await et(c,S)}catch(R){return fe({status:500,error:await re(R,{url:c,params:l,route:{id:p.id}}),url:c,route:p})}if(g.type==="redirect")return g}const v=g==null?void 0:g.nodes;let N=!1;const C=y.map(async(R,U)=>{var Ee;if(!R)return;const L=t.branch[U],O=v==null?void 0:v[U];if((!O||O.type==="skip")&&R[1]===(L==null?void 0:L.loader)&&!qe(N,A,$,(Ee=L.universal)==null?void 0:Ee.uses,l))return L;if(N=!0,(O==null?void 0:O.type)==="error")throw O;return be({loader:R[1],url:c,params:l,route:p,parent:async()=>{var Ke;const Je={};for(let ke=0;ke<U;ke+=1)Object.assign(Je,(Ke=await C[ke])==null?void 0:Ke.data);return Je},server_data_node:ve(O===void 0&&R[0]?{type:"skip"}:O??null,L==null?void 0:L.server)})});for(const R of C)R.catch(()=>{});const W=[];for(let R=0;R<y.length;R+=1)if(y[R])try{W.push(await C[R])}catch(U){if(U instanceof xe)return{type:"redirect",location:U.location};let L=500,O;if(v!=null&&v.includes(U))L=U.status??L,O=U.error;else if(U instanceof Pe)L=U.status,O=U.body;else{if(await Y.updated.check())return await ae(c);O=await re(U,{params:l,url:c,route:{id:p.id}})}const Z=await Me(R,W,d);return Z?await ne({url:c,params:l,branch:W.slice(0,Z.idx).concat(Z.node),status:L,error:O,route:p}):await Be(c,{id:p.id},O,L)}else W.push(void 0);return await ne({url:c,params:l,branch:W,status:200,error:null,route:p,form:s?void 0:null})}async function Me(i,s,c){for(;i--;)if(c[i]){let l=i;for(;!s[l];)l-=1;try{return{idx:l+1,node:{node:await c[i](),loader:c[i],data:{},server:null,universal:null}}}catch{continue}}}async function fe({status:i,error:s,url:c,route:l}){const p={};let d=null;if(nt[0]===0)try{const g=await et(c,[!0]);if(g.type!=="data"||g.nodes[0]&&g.nodes[0].type!=="data")throw 0;d=g.nodes[0]??null}catch{(c.origin!==location.origin||c.pathname!==location.pathname||f)&&await ae(c)}const b=await be({loader:at,url:c,params:p,route:l,parent:()=>Promise.resolve({}),server_data_node:ve(d)}),y={node:await Ne(),loader:Ne,universal:null,server:null,data:null};return await ne({url:c,params:p,branch:[b,y],status:i,error:s,route:null})}function ue(i,s){if(Ye(i,e))return;const c=de(i);for(const l of Ie){const p=l.exec(c);if(p)return{id:i.pathname+i.search,invalidating:s,route:l,params:Et(p),url:i}}}function de(i){return vt(i.pathname.slice(e.length)||"/")}function He({url:i,type:s,intent:c,delta:l}){var b,y;let p=!1;const d={from:{params:t.params,route:{id:((b=t.route)==null?void 0:b.id)??null},url:t.url},to:{params:(c==null?void 0:c.params)??null,route:{id:((y=c==null?void 0:c.route)==null?void 0:y.id)??null},url:i},willUnload:!c,type:s};l!==void 0&&(d.delta=l);const _={...d,cancel:()=>{p=!0}};return E||h.before_navigate.forEach(g=>g(_)),p?null:d}async function pe({url:i,scroll:s,keepfocus:c,redirect_chain:l,details:p,type:d,delta:_,nav_token:b,accepted:y,blocked:g}){const $=ue(i,!1),A=He({url:i,type:d,delta:_,intent:$});if(!A){g();return}Le(I),y(),E=!0,u&&Y.navigating.set(A),await Ve($,i,l,{scroll:s,keepfocus:c,details:p},b,()=>{E=!1,h.after_navigate.forEach(V=>V(A)),Y.navigating.set(null)})}async function Be(i,s,c,l){return i.origin===location.origin&&i.pathname===location.pathname&&!f?await fe({status:l,error:c,url:i,route:s}):await ae(i)}function ae(i){return location.href=i.href,new Promise(()=>{})}function rt(){let i;n.addEventListener("mousemove",d=>{const _=d.target;clearTimeout(i),i=setTimeout(()=>{l(_,2)},20)});function s(d){l(d.composedPath()[0],1)}n.addEventListener("mousedown",s),n.addEventListener("touchstart",s,{passive:!0});const c=new IntersectionObserver(d=>{for(const _ of d)_.isIntersecting&&(ce(de(new URL(_.target.href))),c.unobserve(_.target))},{threshold:0});function l(d,_){const b=We(d,n);if(!b)return;const{url:y,external:g}=Re(b,e);if(g)return;const $=me(b);$.reload||(_<=$.preload_data?De(y):_<=$.preload_code&&ce(de(y)))}function p(){c.disconnect();for(const d of n.querySelectorAll("a")){const{url:_,external:b}=Re(d,e);if(b)continue;const y=me(d);y.reload||(y.preload_code===Xe.viewport&&c.observe(d),y.preload_code===Xe.eager&&ce(de(_)))}}h.after_navigate.push(p),p()}return{after_navigate:i=>{Oe(()=>(h.after_navigate.push(i),()=>{const s=h.after_navigate.indexOf(i);h.after_navigate.splice(s,1)}))},before_navigate:i=>{Oe(()=>(h.before_navigate.push(i),()=>{const s=h.before_navigate.indexOf(i);h.before_navigate.splice(s,1)}))},disable_scroll_handling:()=>{(w||!u)&&(m=!1)},goto:(i,s={})=>ye(i,s,[]),invalidate:i=>{if(typeof i=="function")o.push(i);else{const{href:s}=new URL(i,location.href);o.push(c=>c.href===s)}return je()},invalidateAll:()=>(k=!0,je()),preload_data:async i=>{const s=new URL(i,ze(document));await De(s)},preload_code:ce,apply_action:async i=>{if(i.type==="error"){const s=new URL(location.href),{branch:c,route:l}=t;if(!l)return;const p=await Me(t.branch.length,c,l.errors);if(p){const d=await ne({url:s,params:t.params,branch:c.slice(0,p.idx).concat(p.node),status:i.status??500,error:i.error,route:l});t=d.state,F.$set(d.props),he().then(Ae)}}else if(i.type==="redirect")ye(i.location,{invalidateAll:!0},[]);else{const s={form:i.data,page:{...X,form:i.data,status:i.status}};F.$set(s),i.type==="success"&&he().then(Ae)}},_start_router:()=>{var i;history.scrollRestoration="manual",addEventListener("beforeunload",s=>{var l;let c=!1;if(!E){const p={from:{params:t.params,route:{id:((l=t.route)==null?void 0:l.id)??null},url:t.url},to:null,willUnload:!0,type:"leave",cancel:()=>c=!0};h.before_navigate.forEach(d=>d(p))}c?(s.preventDefault(),s.returnValue=""):history.scrollRestoration="auto"}),addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){Le(I);try{sessionStorage[tt]=JSON.stringify(te)}catch{}}}),(i=navigator.connection)!=null&&i.saveData||rt(),n.addEventListener("click",s=>{if(s.button||s.which!==1||s.metaKey||s.ctrlKey||s.shiftKey||s.altKey||s.defaultPrevented)return;const c=We(s.composedPath()[0],n);if(!c)return;const{url:l,external:p,target:d}=Re(c,e);if(!l)return;if(d==="_parent"||d==="_top"){if(window.parent!==window)return}else if(d&&d!=="_self")return;const _=me(c);if(!(c instanceof SVGAElement)&&l.protocol!==location.protocol&&!(l.protocol==="https:"||l.protocol==="http:"))return;if(p||_.reload){He({url:l,type:"link"})||s.preventDefault(),E=!0;return}const[y,g]=l.href.split("#");if(g!==void 0&&y===location.href.split("#")[0]){P=!0,Le(I),t.url=l,Y.page.set({...X,url:l}),Y.page.notify();return}pe({url:l,scroll:_.noscroll?oe():null,keepfocus:!1,redirect_chain:[],details:{state:{},replaceState:l.href===location.href},accepted:()=>s.preventDefault(),blocked:()=>s.preventDefault(),type:"link"})}),n.addEventListener("submit",s=>{if(s.defaultPrevented)return;const c=HTMLFormElement.prototype.cloneNode.call(s.target),l=s.submitter;if(((l==null?void 0:l.formMethod)||c.method)!=="get")return;const d=new URL((l==null?void 0:l.hasAttribute("formaction"))&&(l==null?void 0:l.formAction)||c.action);if(Ye(d,e))return;const _=s.target,{noscroll:b,reload:y}=me(_);if(y)return;s.preventDefault(),s.stopPropagation();const g=new FormData(_),$=l==null?void 0:l.getAttribute("name");$&&g.append($,(l==null?void 0:l.getAttribute("value"))??""),d.search=new URLSearchParams(g).toString(),pe({url:d,scroll:b?oe():null,keepfocus:!1,redirect_chain:[],details:{state:{},replaceState:!1},nav_token:{},accepted:()=>{},blocked:()=>{},type:"form"})}),addEventListener("popstate",s=>{var c;if((c=s.state)!=null&&c[M]){if(s.state[M]===I)return;const l=te[s.state[M]];if(t.url.href.split("#")[0]===location.href.split("#")[0]){te[I]=oe(),I=s.state[M],scrollTo(l.x,l.y);return}const p=s.state[M]-I;pe({url:new URL(location.href),scroll:l,keepfocus:!1,redirect_chain:[],details:null,accepted:()=>{I=s.state[M]},blocked:()=>{history.go(-p)},type:"popstate",delta:p})}}),addEventListener("hashchange",()=>{P&&(P=!1,history.replaceState({...history.state,[M]:++I},"",location.href))});for(const s of document.querySelectorAll("link"))s.rel==="icon"&&(s.href=s.href);addEventListener("pageshow",s=>{s.persisted&&Y.navigating.set(null)})},_hydrate:async({status:i=200,error:s,node_ids:c,params:l,route:p,data:d,form:_})=>{f=!0;const b=new URL(location.href);({params:l={},route:p={id:null}}=ue(b,!1)||{});let y;try{const g=c.map(async($,A)=>{const V=d[A];return be({loader:ge[$],url:b,params:l,route:p,parent:async()=>{const S={};for(let v=0;v<A;v+=1)Object.assign(S,(await g[v]).data);return S},server_data_node:ve(V)})});y=await ne({url:b,params:l,branch:await Promise.all(g),status:i,error:s,form:_,route:Ie.find(({id:$})=>$===p.id)??null})}catch(g){if(g instanceof xe){await ae(new URL(g.location,location.href));return}y=await fe({status:g instanceof Pe?g.status:500,error:await re(g,{url:b,params:l,route:p}),url:b,route:p})}Ce(y)}}}async function et(r,e){var h;const n=new URL(r);n.pathname=It(r.pathname),n.searchParams.append("x-sveltekit-invalidated",e.map(t=>t?"1":"").join("_"));const o=await _e(n.href),a=await o.json();if(!o.ok)throw new Error(a);return(h=a.nodes)==null||h.forEach(t=>{(t==null?void 0:t.type)==="data"&&(t.data=nn(t.data),t.uses={dependencies:new Set(t.uses.dependencies??[]),params:new Set(t.uses.params??[]),parent:!!t.uses.parent,route:!!t.uses.route,url:!!t.uses.url})}),a}function re(r,e){return r instanceof Pe?r.body:Wt.handleError({error:r,event:e})??{message:e.route.id!=null?"Internal Error":"Not Found"}}function Ae(){const r=document.querySelector("[autofocus]");if(r)r.focus();else{const e=document.body,n=e.getAttribute("tabindex");return e.tabIndex=-1,e.focus({preventScroll:!0}),n!==null?e.setAttribute("tabindex",n):e.removeAttribute("tabindex"),new Promise(o=>{setTimeout(()=>{var a;o((a=getSelection())==null?void 0:a.removeAllRanges())})})}}async function un({env:r,hydrate:e,paths:n,target:o,version:a}){gt(n),yt(a);const h=rn({target:o,base:n.base});wt({client:h}),e?await h._hydrate(e):h.goto(location.href,{replaceState:!0}),h._start_router()}export{un as start};
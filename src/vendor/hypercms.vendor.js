var hypercms=(()=>{var rt=Object.defineProperty;var zr=Object.getOwnPropertyDescriptor;var Wr=Object.getOwnPropertyNames;var Vr=Object.prototype.hasOwnProperty;var nt=(e,t)=>{for(var r in t)rt(e,r,{get:t[r],enumerable:!0})},Kr=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of Wr(t))!Vr.call(e,i)&&i!==r&&rt(e,i,{get:()=>t[i],enumerable:!(n=zr(t,i))||n.enumerable});return e};var Gr=e=>Kr(rt({},"__esModule",{value:!0}),e);var io={};nt(io,{cms:()=>ro,default:()=>no});var Ce=["textContent","innerText","innerHTML","outerHTML","value","checked","selected","disabled","readOnly","type","tagName","nodeName","nodeType","nodeValue","childElementCount","id","className","classList","baseURI","offsetWidth","offsetHeight","clientWidth","clientHeight","scrollWidth","scrollHeight","dataset","currentSrc","duration","paused","title","documentURI","contentType"],it=new Set(Ce),$t=new Set(["textContent","innerText","innerHTML","value","checked","selected","disabled","readOnly","type","id","className","title"]),Bt=new Set(["tagName","nodeName","nodeType","nodeValue","childElementCount","classList","baseURI","documentURI","contentType","offsetWidth","offsetHeight","clientWidth","clientHeight","scrollWidth","scrollHeight","currentSrc","duration","paused","dataset"]);var Me={};nt(Me,{EmptyListInsert:()=>pe,MAX_RULE_DEPTH:()=>ne,MaxRuleDepthExceeded:()=>G,RuleTargetReadOnly:()=>fe,RulesParseError:()=>re,ShapeMismatch:()=>he,UnknownRulesVersion:()=>me,UpgradeAlreadyRegistered:()=>Re});var re=class extends Error{constructor(t,r){super(t),this.name="RulesParseError",this.cause=r}},me=class extends Error{constructor(t){super(`unknown rules version: ${t}. Library supports "1".`),this.name="UnknownRulesVersion",this.version=t}},ne=20,G=class extends Error{constructor(t){super(`rule depth exceeded ${ne} at path: ${t.join(".")}`),this.name="MaxRuleDepthExceeded",this.path=t}},he=class extends Error{constructor(t){super(`shape mismatch: ${t.length} field(s) failed validation`),this.name="ShapeMismatch",this.mismatches=t}},pe=class extends Error{constructor(t){super(`cannot add items to empty list at "${t.join(".")}" \u2014 no sibling to clone as template. Seed the list with a hidden item first.`),this.name="EmptyListInsert",this.path=t}},fe=class extends Error{constructor(t){super(`cannot write to read-only DOM property "${t}"`),this.name="RuleTargetReadOnly",this.target=t}},Re=class extends Error{constructor(){super("upgrade transform already registered; only one registration is allowed per page."),this.name="UpgradeAlreadyRegistered"}};function z(e,t,r,n={}){return ot(e,t,r,{depth:0,path:[]},n)}function ot(e,t,r,n,i){if(n.depth>ne)throw new G(n.path);if(typeof r=="string")return Yr(e,t,r,i);if(Array.isArray(r)){let[o,a]=r;return e.find(t,o,i).map((l,c)=>ot(e,l,a,{depth:n.depth+1,path:[...n.path,c]},i))}if(typeof r=="object"&&r!==null){let o={};for(let[a,s]of Object.entries(r))o[a]=ot(e,t,s,{depth:n.depth+1,path:[...n.path,a]},i);return o}return null}function Yr(e,t,r,n){if(r.endsWith("[]")){let o=r.slice(0,-2);return e.find(t,o,n).map(a=>e.text(a))}if(r.startsWith("@"))return Pt(e,t,r.slice(1));if(r.includes("@")){let o=r.lastIndexOf("@"),a=r.slice(0,o),s=r.slice(o+1),l=a?e.find(t,a,n):[t];return l.length===0?null:Pt(e,l[0],s)}if(r===".")return e.text(t);let i=e.find(t,r,n);return i.length===0?null:e.text(i[0])}function Pt(e,t,r){if(it.has(r)){let i=e.prop(t,r);return i==null?null:String(i)}let n=e.attr(t,r);return n||null}var Jr=.5;function st(e,t,r,n,i,o,a,s={}){let l=e.find(t,r,s);if(i.length===0){l.forEach(S=>e.remove(S));return}let c=i.length>l.length,d=l[0]||null;if(c&&!d&&(d=tn(e,t,r,s),!d))throw new pe(o.path);let m=l.map(S=>Xr(e,S,n,s)),h=null;if(d){h=e.clone(d),s.templateAttr&&e.removeAttr(h,s.templateAttr);let S=e.stripIds(h);S>0&&console.warn(`[hyper-html-api] stripped ${S} id attribute(s) from cloned template at "${o.path.join(".")||"(root)"}"`)}let y=Zr(i,m,n),x=l[0]||d,T=e.parent(x),k=l.length>0?en(e,T,x):0,M=new Set,E=i.map((S,C)=>{let A=y[C];if(A>=0)return M.add(A),l[A];let b=e.clone(h);return e.stripIds(b),b});l.forEach((S,C)=>{M.has(C)||e.remove(S)}),E.forEach((S,C)=>{let A=k+C;e.children(T).findIndex(u=>e.sameNode(u,S))!==A&&e.insertAt(T,S,A)}),E.forEach((S,C)=>{if(n===null){let A=i[C],b=A==null?"":String(A);e.text(S)!==b&&e.text(S,b)}else{let A=a(e,S,n,i[C],{depth:o.depth+1,path:[...o.path,C]},s);A&&A!==S&&(E[C]=A)}})}function Xr(e,t,r,n){return r===null?e.text(t):z(e,t,r,n)}function Zr(e,t,r){let n=new Array(e.length).fill(-1),i=new Set;return e.forEach((o,a)=>{let s=-1,l=-1;t.forEach((c,d)=>{if(i.has(d))return;let m=Qr(o,c,r),h=m===l&&s>=0?Math.abs(d-a)<Math.abs(s-a):!1;(m>l||h)&&(l=m,s=d)}),l>=Jr&&(n[a]=s,i.add(s))}),n}function Qr(e,t,r){if(r===null)return e===t?1:0;let n=Object.keys(r||{});if(n.length===0)return 0;let i=0;for(let o of n)JSON.stringify(e?.[o])===JSON.stringify(t?.[o])&&i++;return i/n.length}function en(e,t,r){let n=e.children(t);for(let i=0;i<n.length;i++)if(e.sameNode(n[i],r))return i;return-1}function tn(e,t,r,n){if(!n.templateAttr)return null;let i=t;for(;i;){let o=e.find(i,r,{includeRulesTag:!1});for(let a of o)if(e.attr(a,n.templateAttr)!=null)return a;i=e.parent(i)}return null}var Ht=new Set(["checked","selected","disabled","readOnly","paused"]);function Y(e,t,r,n,i={}){let o=[];if(at(r,n,[],o),o.length)throw new he(o);Te(e,t,r,n,{depth:0,path:[]},i)}function Te(e,t,r,n,i,o={}){if(i.depth>ne)throw new G(i.path);if(n===void 0)return t;if(typeof r=="string")return rn(e,t,r,n,i,o);if(Array.isArray(r)){let[a,s]=r;return st(e,t,a,s,n,i,Te,o),t}if(typeof r=="object"&&r!==null){for(let[a,s]of Object.entries(r)){let l=Te(e,t,s,n==null?n:n[a],{depth:i.depth+1,path:[...i.path,a]},o);l&&l!==t&&(t=l)}return t}return t}function rn(e,t,r,n,i,o){if(r.endsWith("[]")){let s=r.slice(0,-2);return st(e,t,s,null,n,i,Te,o),t}if(r.startsWith("@"))return Ut(e,t,r.slice(1),n);if(r.includes("@")){let s=r.lastIndexOf("@"),l=r.slice(0,s),c=r.slice(s+1),d=l?e.find(t,l,o):[t];return d.length===0||Ut(e,d[0],c,n),t}if(r===".")return e.text(t,n==null?"":String(n)),t;let a=e.find(t,r,o);return a.length===0||e.text(a[0],n==null?"":String(n)),t}function Ut(e,t,r,n){if(Bt.has(r))throw new fe(r);if(r==="outerHTML"){let i=n==null?"":String(n);return e.replaceWith(t,i)}return $t.has(r)?(e.prop(t,r,nn(r,n)),t):(e.attr(t,r,n==null?"":String(n)),t)}function nn(e,t){return t==null?Ht.has(e)?!1:"":Ht.has(e)?!!t:t}function at(e,t,r,n){if(t!==void 0){if(typeof e=="string"){if(e.endsWith("[]")){Array.isArray(t)?t.forEach((i,o)=>{typeof i=="object"&&i!==null&&n.push({path:ge([...r,o]),expected:"scalar",got:be(i)})}):n.push({path:ge(r),expected:"array",got:be(t)});return}t!==null&&typeof t=="object"&&n.push({path:ge(r),expected:"scalar",got:be(t)});return}if(Array.isArray(e)){if(!Array.isArray(t)){n.push({path:ge(r),expected:"array",got:be(t)});return}let i=e[1];t.forEach((o,a)=>at(i,o,[...r,a],n));return}if(typeof e=="object"&&e!==null){if(t===null||Array.isArray(t)||typeof t!="object"){n.push({path:ge(r),expected:"object",got:be(t)});return}for(let[i,o]of Object.entries(e))at(o,t[i],[...r,i],n)}}}function be(e){return e===null?"null":Array.isArray(e)?"array":typeof e}function ge(e){return e.join(".")}function lt(e){try{return JSON.parse(e)}catch(t){throw new re(`Invalid strict JSON: ${t.message}`,t)}}function ke(e){try{return JSON.parse(e)}catch{}let t={BRACE_OPEN:"{",BRACE_CLOSE:"}",BRACKET_OPEN:"[",BRACKET_CLOSE:"]",COLON:":",COMMA:",",STRING:"STRING",SELECTOR:"SELECTOR",IDENTIFIER:"IDENTIFIER",NUMBER:"NUMBER",BOOLEAN:"BOOLEAN"};function r(i){let o=[],a=0;for(;a<i.length;){let s=i[a];if(/\s/.test(s)){a++;continue}if("{}".includes(s)){o.push({type:s,value:s}),a++;continue}if(s==="["){let m=!1,h=a+1;for(;h<i.length&&/\s/.test(i[h]);)h++;if(h<i.length&&/[a-zA-Z_]/.test(i[h])&&(m=!0),!m){o.push({type:s,value:s}),a++;continue}}if(s==="]"){o.push({type:s,value:s}),a++;continue}if(s===":"){o.push({type:t.COLON,value:s}),a++;continue}if(s===","){o.push({type:t.COMMA,value:s}),a++;continue}if(s==='"'||s==="'"){let m=s,h=a+1;for(;h<i.length&&i[h]!==m;)i[h]==="\\"&&h++,h++;o.push({type:t.STRING,value:i.substring(a+1,h),quoted:!0,sourceQuote:m}),a=h+1;continue}let l=a,c;for(;l<i.length&&!/[{},]/.test(i[l]);)if(i[l]===":"){let m=[":first",":last",":nth-child",":nth-of-type",":first-child",":last-child",":first-of-type",":last-of-type",":only-child",":only-of-type",":hover",":focus",":active",":visited",":disabled",":enabled",":checked",":empty",":root",":target",":not",":before",":after",":nth-last-child",":nth-last-of-type"],h=!1;for(let y of m){let x=y.substring(1);if(i.substring(l+1,l+1+x.length)===x){h=!0,l+=x.length;break}}if(!h)break}else if(i[l]==="["){for(l++;l<i.length&&i[l]!=="]";){if(i[l]==='"'||i[l]==="'"){let m=i[l];for(l++;l<i.length&&i[l]!==m;)i[l]==="\\"&&l++,l++}l++}l<i.length&&i[l]==="]"&&l++}else l++;c=i.substring(a,l);let d=t.IDENTIFIER;/^-?\d+(\.\d+)?$/.test(c)?d=t.NUMBER:c==="true"||c==="false"||c==="null"?d=t.BOOLEAN:/^[.#@\[]|[.#@\[]| /.test(c)&&(d=t.SELECTOR),o.push({type:d,value:c,quoted:!1}),a=l}return o}function n(i){let o="";for(let a=0;a<i.length;a++){let s=i[a];if("{}".includes(s.type)||"[]".includes(s.type)){o+=s.value;continue}if(s.type===t.COLON){o+=s.value;continue}if(s.type===t.COMMA){let l=i[a+1];if(l&&(l.type==="}"||l.type==="]"))continue;o+=s.value;continue}if(s.type===t.STRING&&s.quoted){let l=s.value;s.sourceQuote==="'"&&(l=l.replace(/\\'/g,"'"),l=l.replace(/(\\*)"/g,(c,d)=>d.length%2===0?d+'\\"':c)),o+=`"${l}"`;continue}if(s.type===t.NUMBER||s.type===t.BOOLEAN){o+=s.value;continue}if(s.type===t.SELECTOR||s.type===t.IDENTIFIER){o+=`"${s.value}"`;continue}o+=`"${s.value}"`}return o}try{let i=r(e),o=n(i);return JSON.parse(o)}catch(i){throw new re("Invalid extraction rules syntax: "+i.message,i)}}var on="1",zt=/^[a-zA-Z0-9_-]+$/;function J(e,t,r){let n;if(r===void 0)n="script[data-rules-name]";else{if(typeof r!="string"||!zt.test(r))throw new Error(`hyper-html-api: invalid rules token ${JSON.stringify(r)} (must match ${zt})`);n=`script[data-rules-name~="${r}"]`}let i=e.find(t,n,{includeRulesTag:!0});if(i.length===0)return null;r!==void 0&&i.length>1&&console.warn(`hyper-html-api: ${i.length} rules tags match data-rules-name~="${r}"; using the first.`);let o=i[0],a=e.attr(o,"data-rules-version");if(a!==on)throw new me(a);return{rules:ke(e.text(o)),tagNode:o}}function ct(e,t,r){if(r&&typeof r=="object")return{rules:r,tagNode:null};if(typeof r=="string"){let n=t&&t.ownerDocument?t.ownerDocument:t;return J(e,n,r)}return null}function Wt(e,t,r,n){let i=ct(e,t,r);if(!i){let s=typeof r=="string"?`data-rules-name~="${r}"`:"the provided rules object";throw new Error(`hyper-html-api: could not resolve rules for ${s}`)}let{rules:o,tagNode:a}=i;return{rules:o,tagNode:a,get:()=>z(e,t,o,n),set:s=>Y(e,t,o,s,n)}}var Gt={includeClasses:!0,includeAttributes:["href","src","name","type","role","aria-label","alt","title"],excludeAttributePrefixes:["data-morph-","data-hyper-","data-im-"],textHintLength:64,excludeIds:!0,maxPathDepth:4,landmarks:["HEADER","NAV","MAIN","ASIDE","FOOTER","SECTION","ARTICLE"],weights:{signature:100,pathSegment:10,textMatch:20,textMismatch:25,uniqueCandidate:50,positionPenalty:1,slotMatch:30},minConfidence:101};function ln(e){let t=5381;for(let r=0;r<e.length;r++)t=(t<<5)+t^e.charCodeAt(r);return Math.abs(t).toString(36)}function cn(e){if(e.classList&&e.classList.length>0)return Array.from(e.classList).sort().join(" ");let t=e.getAttribute?.("class");return t?t.split(/\s+/).filter(Boolean).sort().join(" "):""}function dn(e,t){let r=[];for(let n of e.attributes||[]){let i=n.name;i==="id"||i==="class"||t.excludeAttributePrefixes.some(o=>i.startsWith(o))||t.includeAttributes.includes(i)&&r.push(`${i}=${n.value}`)}return r.sort().join("|")}function un(e,t){return(e.textContent||"").replace(/\s+/g," ").trim().slice(0,t.textHintLength)}function mn(e,t){let r=[e.tagName];return t.includeClasses&&r.push(cn(e)),r.push(dn(e,t)),ln(r.join("|"))}function hn(e){let t=e.tagName,r=1,n=e.previousElementSibling;for(;n;)n.tagName===t&&r++,n=n.previousElementSibling;return r}function pn(e,t){return e.id||e.getAttribute?.("role")?!0:t.landmarks.includes(e.tagName)}function fn(e){if(e.id)return`#${e.id}`;let t=e.getAttribute?.("role");return t?`@${t}`:e.tagName}function bn(e,t){let r=[],n=e;for(;n&&n.tagName&&r.length<t.maxPathDepth;){let i=`${n.tagName}:${hn(n)}`;if(r.unshift(i),n!==e&&pn(n,t)){r.unshift(fn(n));break}n=n.parentElement}return r}function gn(e,t){let r=0,n=e.length-1,i=t.length-1;for(;n>=0&&i>=0&&e[n]===t[i];)r++,n--,i--;return r}function P(e,t,r){if(r.has(e))return r.get(e);let n={signature:mn(e,t),path:bn(e,t),textHint:un(e,t)};return r.set(e,n),n}function Zt(e,t,r,n){if(n.has(e))return n.get(e);let i=new Map,o=e.querySelectorAll("*"),a=0;for(let s of o){let l=P(s,t,r);l.domIndex=a++,i.has(l.signature)||i.set(l.signature,[]),i.get(l.signature).push(s)}return n.set(e,i),i}function kn(e,t,r){r.delete(e),t.delete(e);let n=e.querySelectorAll("*");for(let i of n)t.delete(i)}function dt(e,t,r,n,i){let o=P(e,r,n),a=P(t,r,n),s=r.weights,l={},c=0;if(o.signature!==a.signature)return{score:0,breakdown:{rejected:"signature mismatch"}};c+=s.signature,l.signature=s.signature;let m=gn(o.path,a.path)*s.pathSegment;c+=m,l.path=m;let h=!0;if(o.textHint&&a.textHint?o.textHint===a.textHint?(c+=s.textMatch,l.text=s.textMatch):(c-=s.textMismatch,l.text=-s.textMismatch,h=!1):o.textHint!==a.textHint&&(c-=s.textMismatch,l.text=-s.textMismatch,h=!1),i.candidateCount===1&&h&&(c+=s.uniqueCandidate,l.unique=s.uniqueCandidate),typeof o.domIndex=="number"&&typeof a.domIndex=="number"){let y=Math.abs(o.domIndex-a.domIndex),x=Math.min(y*s.positionPenalty,20);c-=x,l.drift=-x}return{score:c,breakdown:l}}function Yt(e,t,r,n,i){if(r.excludeIds&&e.id)return null;let o=Zt(t,r,n,i),a=P(e,r,n);if(typeof a.domIndex!="number"){let h=0,y=e.previousElementSibling;for(;y;)h++,y=y.previousElementSibling;a.domIndex=h}let s=o.get(a.signature)||[],l=r.excludeIds?s.filter(h=>!h.id):s;if(l.length===0)return null;let c=null,d=0,m=null;for(let h of l){let{score:y,breakdown:x}=dt(e,h,r,n,{candidateCount:l.length});y>d&&(d=y,c=h,m=x)}return d<r.minConfidence?null:{element:c,confidence:d,breakdown:m}}function yn(e,t,r,n){let i=[],o=r.weights.signature+r.weights.slotMatch,a={slot:o};function s(m){if(m.children)return m.children;let h=m.childNodes;if(!h)return[];let y=[];for(let x=0;x<h.length;x++)h[x].nodeType===1&&y.push(h[x]);return y}function l(m,h){let y=s(m),x=s(h);if(y.length===x.length)for(let T=0;T<y.length;T++){let k=y[T],M=x[T];if(r.excludeIds&&(k.id||M.id)||k.tagName!==M.tagName)continue;let E=P(k,r,n).signature,S=P(M,r,n).signature;E!==S&&i.push({newEl:k,oldEl:M,score:o,breakdown:a}),l(k,M)}}function c(m,h){for(;;){if(m.tagName===h.tagName)return[m,h];let y=s(m);if(!m.tagName&&y.length===1){m=y[0];continue}let x=s(h);if(x.length===1&&x[0].tagName===m.tagName){h=x[0];continue}return null}}let d=c(e,t);return d&&l(d[0],d[1]),i}function Jt(e,t,r,n,i){let o=t.querySelectorAll("*"),a=Zt(e,r,n,i),s=0;for(let m of o){let h=P(m,r,n);h.domIndex=s++}let l=[];for(let m of o){if(r.excludeIds&&m.id)continue;let h=P(m,r,n),y=a.get(h.signature)||[],x=r.excludeIds?y.filter(T=>!T.id):y;for(let T of x){let{score:k,breakdown:M}=dt(m,T,r,n,{candidateCount:x.length});k>=r.minConfidence&&l.push({newEl:m,oldEl:T,score:k,breakdown:M})}}if(r.weights.slotMatch>0){let m=yn(t,e,r,n);for(let h of m)l.push(h)}l.sort((m,h)=>h.score-m.score);let c=new Map,d=new Set;for(let{newEl:m,oldEl:h}of l)c.has(m)||d.has(h)||(c.set(m,h),d.add(h));return c}function Xt(e,t,r,n){let i=P(e,r,n),o=P(t,r,n),{score:a,breakdown:s}=dt(e,t,r,n,{candidateCount:1});return{matches:a>=r.minConfidence,score:a,breakdown:s,newMeta:{signature:i.signature,path:i.path,textHint:i.textHint},oldMeta:{signature:o.signature,path:o.path,textHint:o.textHint}}}function Qt(e={}){let t={...Gt,...e,weights:{...Gt.weights,...e.weights}},r=new WeakMap,n=new WeakMap;return{findMatch:(i,o)=>Yt(i,o,t,r,n),computeMatches:(i,o)=>Jt(i,o,t,r,n),explain:(i,o)=>Xt(i,o,t,r),invalidate:i=>kn(i,r,n),session:()=>{let i=new WeakMap,o=new WeakMap;return{findMatch:(a,s)=>Yt(a,s,t,i,o),computeMatches:(a,s)=>Jt(a,s,t,i,o),explain:(a,s)=>Xt(a,s,t,i)}},getConfig:()=>({...t})}}var vn=Qt(),ut=(function(){"use strict";let e=()=>{};function t(k){if(!(k instanceof Element))return!1;if(k.hasAttribute("save-ignore"))return!0;if(k.tagName==="LINK"||k.tagName==="SCRIPT"){let M=k.getAttribute("src")||k.getAttribute("href")||"";if(M.startsWith("chrome-extension://")||M.startsWith("moz-extension://")||M.startsWith("safari-web-extension://"))return!0}return!1}function r(k,M){if(M!=="smart")return k.outerHTML;let E=k.getAttribute("src"),S=k.getAttribute("type")||"text/javascript";if(E)try{let C=new URL(E,window.location.href);return`ext:${S}:${C.origin}${C.pathname}${C.search}`}catch{return`ext:${S}:${E}`}else{let C=k.textContent.trim(),A=5381;for(let b=0;b<C.length;b++)A=(A<<5)+A^C.charCodeAt(b);return`inline:${S}:${Math.abs(A).toString(36)}`}}let n={morphStyle:"outerHTML",callbacks:{beforeNodeAdded:e,afterNodeAdded:e,beforeNodeMorphed:e,afterNodeMorphed:e,beforeNodeRemoved:e,afterNodeRemoved:e,beforeAttributeUpdated:e},head:{style:"merge",shouldPreserve:k=>k.getAttribute("im-preserve")==="true",shouldReAppend:k=>k.getAttribute("im-re-append")==="true",shouldRemove:e,afterHeadMorphed:e},scripts:{handle:!1,matchMode:"outerHTML",shouldPreserve:k=>k.getAttribute("im-preserve")==="true",shouldReAppend:k=>k.getAttribute("im-re-append")==="true",shouldRemove:e,afterScriptsHandled:e},restoreFocus:!0},i={computeMatches(k,M){let{computeMatches:E}=vn.session();return E(k,M)}};function o(k,M,E={}){k=x(k);let S=T(M),C=y(k,S,E),A=C.scripts.matchMode,b=new Set(Array.from(k.querySelectorAll("script")).map(p=>r(p,A))),w=s(C,()=>d(C,k,S,p=>p.morphStyle==="innerHTML"?(l(p,k,S),Array.from(k.childNodes)):a(p,k,S)));C.pantry.remove();let u=h(k,b,C);return u.length>0?w instanceof Promise?w.then(p=>Promise.all(u).then(()=>p)):Promise.all(u).then(()=>w):w}function a(k,M,E){let S=T(M);return l(k,S,E,M,M.nextSibling),Array.from(S.childNodes)}function s(k,M){if(!k.config.restoreFocus)return M();let E=document.activeElement;if(!(E instanceof HTMLInputElement||E instanceof HTMLTextAreaElement))return M();let{id:S,selectionStart:C,selectionEnd:A}=E,b=M();return S&&S!==document.activeElement?.getAttribute("id")&&(E=k.target.querySelector(`[id="${S}"]`),E?.focus()),E&&!E.selectionEnd&&A!=null&&E.setSelectionRange(C,A),b}let l=(function(){function k(u,p,g,f=null,v=null){p instanceof HTMLTemplateElement&&g instanceof HTMLTemplateElement&&(p=p.content,g=g.content),f||=p.firstChild;for(let _ of g.childNodes){if(t(_))continue;if(f&&f!=v){let O=E(u,_,f,v);if(O){O!==f&&C(u,f,O),c(O,_,u),f=O.nextSibling;continue}}if(_ instanceof Element){let O=_.getAttribute("id");if(u.persistentIds.has(O)){let j=A(p,O,f,u);c(j,_,u),f=j.nextSibling;continue}if(!u.idMap.has(_)){let j=u.hyperMatches.get(_);if(j&&!u.idMap.has(j)){w(p,j,f),c(j,_,u),f=j.nextSibling;continue}}}let R=M(p,_,f,u);R&&(f=R.nextSibling)}for(;f&&f!=v;){let _=f;f=f.nextSibling,t(_)||S(u,_)}}function M(u,p,g,f){if(f.callbacks.beforeNodeAdded(p)===!1)return null;if(f.idMap.has(p)){let v=document.createElement(p.tagName);return u.insertBefore(v,g),c(v,p,f),f.callbacks.afterNodeAdded(v),v}else{let v=document.importNode(p,!0);return u.insertBefore(v,g),f.callbacks.afterNodeAdded(v),v}}let E=(function(){function u(f,v,_,R){let O=v instanceof Element&&!f.idMap.has(v)?f.hyperMatches.get(v):null,j=null,$=v.nextSibling,ue=0,N=_;for(;N&&N!=R;){if(g(N,v)){if(p(f,N,v)||N===O&&!f.idMap.has(N))return N;if(j===null){let ee=N instanceof Element&&f.hyperMatchedOldElements.has(N);!f.idMap.has(N)&&!ee&&(j=N)}}if(j===null&&$&&g(N,$)&&(ue++,$=$.nextSibling,ue>=2&&(j=void 0)),f.activeElementAndParents.includes(N))break;N=N.nextSibling}return j||null}function p(f,v,_){let R=f.idMap.get(v),O=f.idMap.get(_);if(!O||!R)return!1;for(let j of R)if(O.has(j))return!0;return!1}function g(f,v){let _=f,R=v;return _.nodeType===R.nodeType&&_.tagName===R.tagName&&(!_.getAttribute?.("id")||_.getAttribute?.("id")===R.getAttribute?.("id"))}return u})();function S(u,p){let g=p instanceof Element&&u.hyperMatchedOldElements.has(p)&&!u.idMap.has(p);if(u.idMap.has(p)||g)w(u.pantry,p,null);else{if(u.callbacks.beforeNodeRemoved(p)===!1)return;p.parentNode?.removeChild(p),u.callbacks.afterNodeRemoved(p)}}function C(u,p,g){let f=p;for(;f&&f!==g;){let v=f;f=f.nextSibling,t(v)||S(u,v)}return f}function A(u,p,g,f){let v=f.target.getAttribute?.("id")===p&&f.target||f.target.querySelector(`[id="${p}"]`)||f.pantry.querySelector(`[id="${p}"]`);return b(v,f),w(u,v,g),v}function b(u,p){let g=u.getAttribute("id");for(;u=u.parentNode;){let f=p.idMap.get(u);f&&(f.delete(g),f.size||p.idMap.delete(u))}}function w(u,p,g){if(u.moveBefore)try{u.moveBefore(p,g)}catch{u.insertBefore(p,g)}else u.insertBefore(p,g)}return k})(),c=(function(){function k(b,w,u){return u.ignoreActive&&b===document.activeElement?null:(u.callbacks.beforeNodeMorphed(b,w)===!1||(b instanceof HTMLHeadElement&&u.head.ignore||(b instanceof HTMLHeadElement&&u.head.style!=="morph"?m(b,w,u):(M(b,w,u),A(b,u)||l(u,b,w))),u.callbacks.afterNodeMorphed(b,w)),b)}function M(b,w,u){let p=w.nodeType;if(p===1){let g=b,f=w,v=g.attributes,_=f.attributes;for(let R of _)C(R.name,g,"update",u)||g.getAttribute(R.name)!==R.value&&g.setAttribute(R.name,R.value);for(let R=v.length-1;0<=R;R--){let O=v[R];if(O&&!f.hasAttribute(O.name)){if(C(O.name,g,"remove",u))continue;g.removeAttribute(O.name)}}A(g,u)||E(g,f,u)}(p===8||p===3)&&b.nodeValue!==w.nodeValue&&(b.nodeValue=w.nodeValue)}function E(b,w,u){if(b instanceof HTMLInputElement&&w instanceof HTMLInputElement&&w.type!=="file"){let p=w.value,g=b.value;S(b,w,"checked",u),S(b,w,"disabled",u),u.formStateSync==="property"?g!==p&&(C("value",b,"update",u)||(b.value=p)):w.hasAttribute("value")?g!==p&&(C("value",b,"update",u)||(b.setAttribute("value",p),b.value=p)):C("value",b,"remove",u)||(b.value="",b.removeAttribute("value"))}else if(b instanceof HTMLOptionElement&&w instanceof HTMLOptionElement)S(b,w,"selected",u);else if(b instanceof HTMLTextAreaElement&&w instanceof HTMLTextAreaElement){let p=w.value,g=b.value;if(C("value",b,"update",u))return;p!==g&&(b.value=p),b.firstChild&&b.firstChild.nodeValue!==p&&(b.firstChild.nodeValue=p)}}function S(b,w,u,p){let g=w[u],f=b[u];if(g!==f){let v=C(u,b,"update",p);if(v||(b[u]=w[u]),p.formStateSync==="property")return;g?v||b.setAttribute(u,""):C(u,b,"remove",p)||b.removeAttribute(u)}}function C(b,w,u,p){return b==="value"&&p.ignoreActiveValue&&w===document.activeElement?!0:p.callbacks.beforeAttributeUpdated(b,w,u)===!1}function A(b,w){return!!w.ignoreActiveValue&&b===document.activeElement&&b!==document.body}return k})();function d(k,M,E,S){if(k.head.block){let C=M.querySelector("head"),A=E.querySelector("head");if(C&&A){let b=m(C,A,k);return Promise.all(b).then(()=>{let w=Object.assign(k,{head:{block:!1,ignore:!0}});return S(w)})}}return S(k)}function m(k,M,E){let S=[],C=[],A=[],b=[],w=E.scripts.matchMode,u=f=>{if(f.tagName==="SCRIPT")return r(f,w);if(f.tagName==="LINK"&&w==="smart"){let v=f.getAttribute("href");if(v)try{let _=new URL(v,window.location.href);return`link:${f.getAttribute("rel")||""}:${_.origin}${_.pathname}${_.search}`}catch{}}return f.outerHTML},p=new Map;for(let f of M.children)t(f)||p.set(u(f),f);for(let f of k.children){let v=u(f),_=p.has(v),R=E.head.shouldReAppend(f),O=E.head.shouldPreserve(f);_||O?R?C.push(f):(p.delete(v),A.push(f)):E.head.style==="append"?R&&(C.push(f),b.push(f)):E.head.shouldRemove(f)!==!1&&!t(f)&&C.push(f)}b.push(...p.values());let g=[];for(let f of b){let v=document.createRange().createContextualFragment(f.outerHTML).firstChild;if(E.callbacks.beforeNodeAdded(v)!==!1){if("href"in v&&v.href||"src"in v&&v.src){let _,R=new Promise(function(O){_=O});v.addEventListener("load",function(){_()}),g.push(R)}k.appendChild(v),E.callbacks.afterNodeAdded(v),S.push(v)}}for(let f of C)E.callbacks.beforeNodeRemoved(f)!==!1&&(k.removeChild(f),E.callbacks.afterNodeRemoved(f));return E.head.afterHeadMorphed(k,{added:S,kept:A,removed:C}),g}function h(k,M,E){if(!E.scripts.handle)return[];let S=[],C=[],A=[],b=[],w=E.scripts.matchMode,u=Array.from(k.querySelectorAll("script"));for(let g of u){let f=r(g,w),v=M.has(f),_=E.scripts.shouldPreserve(g),R=E.scripts.shouldReAppend(g);v||_?R?(C.push(g),b.push(g)):A.push(g):b.push(g)}for(let g of M){let f=u.some(v=>v.outerHTML===g)}let p=[];for(let g of b){if(E.callbacks.beforeNodeAdded(g)===!1)continue;let f=document.createRange().createContextualFragment(g.outerHTML).firstChild;if(f.src){let v,_=new Promise(function(R){v=R});f.addEventListener("load",function(){v()}),f.addEventListener("error",function(){v()}),p.push(_)}g.replaceWith(f),E.callbacks.afterNodeAdded(f),S.push(f)}return E.scripts.afterScriptsHandled(k,{added:S,kept:A,removed:C}),p}let y=(function(){function k(u,p,g){let{persistentIds:f,idMap:v}=b(u,p),_=i.computeMatches(u,p);if(typeof g.key=="function"){let $=new Map,ue=new Set,N=F=>{let I=g.key(F);I!=null&&($.has(I)?ue.add(I):$.set(I,F))};u instanceof Element&&N(u);for(let F of u.querySelectorAll("*"))N(F);for(let F of ue)$.delete(F);let ee=new Map;for(let[F,I]of _)ee.set(I,F);let Qe=p.__hyperMorphRoot||p,Ee=new Map,qt=new Set,Dt=F=>{let I=g.key(F);I!=null&&(Ee.has(I)?qt.add(I):Ee.set(I,F))};Qe instanceof Element&&Dt(Qe);for(let F of Qe.querySelectorAll("*"))Dt(F);for(let F of qt)Ee.delete(F);for(let[F,I]of Ee){let te=$.get(F);if(!te||te.tagName!==I.tagName)continue;let et=ee.get(te);et&&et!==I&&_.delete(et);let tt=_.get(I);tt&&tt!==te&&ee.delete(tt),_.set(I,te),ee.set(te,I)}}let R=new Set;for(let $ of _.values())R.add($);let O=M(g),j=O.morphStyle||"outerHTML";if(!["innerHTML","outerHTML"].includes(j))throw`Do not understand how to morph style ${j}`;return{target:u,newContent:p,config:O,morphStyle:j,ignoreActive:O.ignoreActive,ignoreActiveValue:O.ignoreActiveValue,restoreFocus:O.restoreFocus,formStateSync:O.formStateSync||"attribute",idMap:v,persistentIds:f,hyperMatches:_,hyperMatchedOldElements:R,pantry:E(),activeElementAndParents:S(u),callbacks:O.callbacks,head:O.head,scripts:O.scripts}}function M(u){let p=Object.assign({},n);return Object.assign(p,u),p.callbacks=Object.assign({},n.callbacks,u.callbacks),p.head=Object.assign({},n.head,u.head),p.scripts=Object.assign({},n.scripts,u.scripts),p}function E(){let u=document.createElement("div");return u.hidden=!0,document.body.insertAdjacentElement("afterend",u),u}function S(u){let p=[],g=document.activeElement;if(g?.tagName!=="BODY"&&u.contains(g))for(;g&&(p.push(g),g!==u);)g=g.parentElement;return p}function C(u){let p=Array.from(u.querySelectorAll("[id]"));return u.getAttribute?.("id")&&p.push(u),p}function A(u,p,g,f){for(let v of f){let _=v.getAttribute("id");if(p.has(_)){let R=v;for(;R;){let O=u.get(R);if(O==null&&(O=new Set,u.set(R,O)),O.add(_),R===g)break;R=R.parentElement}}}}function b(u,p){let g=C(u),f=C(p),v=w(g,f),_=new Map;A(_,v,u,g);let R=p.__hyperMorphRoot||p;return A(_,v,R,f),{persistentIds:v,idMap:_}}function w(u,p){let g=new Set,f=new Map;for(let{id:_,tagName:R}of u)f.has(_)?g.add(_):f.set(_,R);let v=new Set;for(let{id:_,tagName:R}of p)v.has(_)?g.add(_):f.get(_)===R&&v.add(_);for(let _ of g)v.delete(_);return v}return k})(),{normalizeElement:x,normalizeParent:T}=(function(){let k=new WeakSet;function M(A){return A instanceof Document?A.documentElement:A}function E(A){if(A==null)return document.createElement("div");if(typeof A=="string")return E(C(A));if(k.has(A))return A;if(A instanceof Node){if(A.parentNode)return new S(A);{let b=document.createElement("div");return b.append(A),b}}else{let b=document.createElement("div");for(let w of[...A])b.append(w);return b}}class S{constructor(b){this.originalNode=b,this.realParentNode=b.parentNode,this.previousSibling=b.previousSibling,this.nextSibling=b.nextSibling}get childNodes(){let b=[],w=this.previousSibling?this.previousSibling.nextSibling:this.realParentNode.firstChild;for(;w&&w!=this.nextSibling;)b.push(w),w=w.nextSibling;return b}querySelectorAll(b){return this.childNodes.reduce((w,u)=>{if(u instanceof Element){u.matches(b)&&w.push(u);let p=u.querySelectorAll(b);for(let g=0;g<p.length;g++)w.push(p[g])}return w},[])}insertBefore(b,w){return this.realParentNode.insertBefore(b,w)}moveBefore(b,w){return this.realParentNode.moveBefore(b,w)}get __hyperMorphRoot(){return this.originalNode}}function C(A){let b=new DOMParser,w=A.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(w.match(/<\/html>/)||w.match(/<\/head>/)||w.match(/<\/body>/)){let u=b.parseFromString(A,"text/html");if(w.match(/<\/html>/))return k.add(u),u;{let p=u.firstChild;return p&&k.add(p),p}}else{let p=b.parseFromString("<body><template>"+A+"</template></body>","text/html").body.querySelector("template").content;return k.add(p),p}}return{normalizeElement:M,normalizeParent:E}})();return{morph:o,defaults:n}})();var zo=ut.morph,Wo=ut.defaults,mt=ut;var Sn=null;function Oe(){return Sn}function je(e,t){let r={carriedOver:0,discarded:0,listItems:0},n=ht(t,e,r);return pt(t,e,r),{data:n,summary:r}}function ht(e,t,r){if(typeof e=="string")return e.endsWith("[]")?Array.isArray(t)?(r.listItems+=t.length,r.carriedOver+=t.length,t):void 0:t==null?void 0:(r.carriedOver++,t);if(Array.isArray(e)){let[,n]=e;return Array.isArray(t)?(r.listItems+=t.length,t.map(i=>ht(n,i,r))):void 0}if(typeof e=="object"&&e!==null){let n={};for(let[i,o]of Object.entries(e)){let a=ht(o,t?.[i],r);a!==void 0&&(n[i]=a)}return n}}function pt(e,t,r){if(t!=null){if(typeof e=="object"&&e!==null&&!Array.isArray(e)){if(typeof t!="object"||Array.isArray(t))return;let n=new Set(Object.keys(e));for(let i of Object.keys(t))n.has(i)?pt(e[i],t[i],r):r.discarded+=Le(t[i]);return}if(Array.isArray(e)&&Array.isArray(t)){let n=e[1];t.forEach(i=>pt(n,i,r));return}typeof e=="string"&&!e.endsWith("[]")&&typeof t=="object"&&t!==null&&(r.discarded+=Le(t))}}function Le(e){return e==null?0:Array.isArray(e)?e.reduce((t,r)=>t+Le(r),0):typeof e=="object"?Object.values(e).reduce((t,r)=>t+Le(r),0):1}function En(e){return e&&e.nodeType===1&&e.tagName==="SCRIPT"&&e.hasAttribute&&e.hasAttribute("data-rules-name")}function Cn(e){return e?(e.nodeType===9||e.nodeType===11,e):null}var Rn={find(e,t,r={}){let n=Cn(e);if(!n||!n.querySelectorAll)return[];let i=Array.from(n.querySelectorAll(t));r.includeRulesTag||(i=i.filter(a=>!En(a)));let o=[];if(r.skip&&o.push(r.skip),r.templateAttr&&o.push("["+r.templateAttr+"]"),o.length){let a=o.join(", ");i=i.filter(s=>!s.closest||!s.closest(a))}return i},parent(e){return e?e.parentElement:null},children(e){return e?Array.from(e.children):[]},text(e,t){if(t===void 0)return(e.textContent||"").trim();e.textContent=t},attr(e,t,r){if(r===void 0)return e.hasAttribute&&e.hasAttribute(t)?e.getAttribute(t):null;e.setAttribute(t,r)},removeAttr(e,t){e&&e.removeAttribute&&e.removeAttribute(t)},prop(e,t,r){if(r===void 0){let n=e?e[t]:void 0;return n!==void 0?n:null}e[t]=r},clone(e){return e.cloneNode(!0)},insertAt(e,t,r){let n=e.children[r]||null;e.insertBefore(t,n)},remove(e){e&&e.parentNode&&e.parentNode.removeChild(e)},replaceWith(e,t){if(!e||!e.parentNode)throw new Error("dom.replaceWith: node has no parent");let n=e.ownerDocument.createElement("template");n.innerHTML=t;let i=n.content.firstElementChild;if(!i)throw new Error("dom.replaceWith: html did not parse to an element");return e.parentNode.replaceChild(i,e),i},stripIds(e){let t=0;return e.id&&(e.removeAttribute("id"),t++),(e.querySelectorAll?e.querySelectorAll("[id]"):[]).forEach(n=>{n.removeAttribute("id"),t++}),t},sameNode(e,t){return e===t}},H=Rn;var Mn="_hyperHtmlApi",Tn="upgrade-helper",On="parentOrigin";function gt(e=typeof location<"u"?location:null){if(!e)return!1;try{return new URLSearchParams(e.search).get(Mn)===Tn}catch{return!1}}function er(e=typeof location<"u"?location:null){return e?new URLSearchParams(e.search).get(On):null}function kt({win:e,doc:t,parentOrigin:r}={}){if(e=e||(typeof window<"u"?window:null),t=t||(typeof document<"u"?document:null),!e||!t||(r=r||er(e.location),!r))return;let n=()=>Ln({win:e,doc:t,parentOrigin:r});t.readyState==="loading"?t.addEventListener("DOMContentLoaded",n,{once:!0}):n()}function Ln({win:e,doc:t,parentOrigin:r}){let n;try{n=J(H,t.body)}catch(l){return ft(e,r,l)}if(!n)return ft(e,r,new Error("helper-mode: no rules tag in v2 document"));let i=n.rules,o=Nn(t,"hyper-version"),a=!!Oe(),s=l=>{if(l.source!==e.parent||l.origin!==r)return;let c=l.data;if(!(!c||c.type!=="hha:upgrade-data")){e.removeEventListener("message",s);try{let d=jn({doc:t,rules:i,v1Data:c.v1Data});e.parent.postMessage({type:"hha:upgrade-result",html:d.html,summary:d.summary},r)}catch(d){ft(e,r,d)}}};e.addEventListener("message",s),e.parent.postMessage({type:"hha:upgrade-ready",rules:i,version:o,hasTransform:a},r)}function jn({doc:e,rules:t,v1Data:r}){let n=Oe(),i=r,o=!1;n&&(i=n(r),o=!0);let{data:a,summary:s}=je(i,t);Y(H,e.body,t,a);let l=z(H,e.body,t);return{html:`<!DOCTYPE html>
`+e.documentElement.outerHTML,summary:{...s,transformApplied:o,appliedFieldCount:bt(l)}}}function ft(e,t,r){e.parent.postMessage({type:"hha:upgrade-error",name:r?.name||"Error",message:r?.message||String(r)},t)}function Nn(e,t){let r=e.querySelector(`meta[name="${t}"]`);return r?r.getAttribute("content"):null}function bt(e){return e==null?0:Array.isArray(e)?e.reduce((t,r)=>t+bt(r),0):typeof e=="object"?Object.values(e).reduce((t,r)=>t+bt(r),0):1}var q={extract:(e,t,r)=>z(H,e,t,r),apply:(e,t,r,n)=>Y(H,e,t,r,n),findRulesIn:(e,t)=>J(H,e,t),findRules:(e,t)=>ct(H,e,t),bind:(e,t,r)=>Wt(H,e,t,r),parseStrict:lt,parseRelaxed:ke,errors:Me,DOM_PROPERTIES:Ce};typeof window<"u"&&gt(window.location)&&kt({win:window,doc:document});var vt={};nt(vt,{fromString:()=>W,getRuleAtPath:()=>X,getValueAtPath:()=>$n,setAtPath:()=>yt,toString:()=>Dn});function Dn(e){return e.map(String).join(".")}function W(e){return e===""?[]:e.split(".").map(t=>/^\d+$/.test(t)?Number(t):t)}function X(e,t){let r=e;for(let n of t){if(r==null)return;if(typeof r=="string"){if(r.endsWith("[]")&&(typeof n=="number"||n==="*")){r=r.slice(0,-2);continue}return}if(Array.isArray(r)){if(typeof n!="number"&&n!=="*")return;r=r[1];continue}if(typeof r=="object"){if(typeof n=="number"||!(n in r))return;r=r[n];continue}return}return r}function $n(e,t){let r=e;for(let n of t){if(r==null)return;r=r[n]}return r}function yt(e,t,r){if(t.length===0)return r;let[n,...i]=t;if(typeof n=="number"){let o=Array.isArray(e)?[...e]:[];return o[n]=yt(o[n],i,r),o}return{...e&&typeof e=="object"?e:{},[n]:yt((e||{})[n],i,r)}}function ye(e){if(typeof e=="string")return e.endsWith("[]")?[]:"";if(Array.isArray(e))return[];if(typeof e=="object"&&e!==null){let t={};for(let[r,n]of Object.entries(e))t[r]=ye(n);return t}return""}function Ne(e,t,{ignoreActiveValue:r=!0}={}){mt.morph(e,t,{morphStyle:"innerHTML",ignoreActiveValue:r,restoreFocus:!0,formStateSync:"property"})}function Ie(e){return e.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g,"$1 $2").replace(/[-_]/g," ").replace(/\s+/g," ").trim().replace(/^./,t=>t.toUpperCase())}var Bn='<div class="hcms-drag-handle mirk-sortable__grip" aria-hidden="true"><div class="mirk-sortable__dots"><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span></div></div>',xt='<svg class="hcms-x" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"></path></svg>',nr={"@scalar":`
    <label class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <input class="mirk-input" data-hcms-field />
      <div class="hcms-error" hidden></div>
    </label>
  `,"@object":`
    <section class="hcms-object" data-hcms-shape="object">
      <h3 class="hcms-object-title" data-hcms-label></h3>
      <div class="hcms-object-fields"></div>
      <div class="hcms-error" hidden></div>
    </section>
  `,"@scalar-array":`
    <section class="hcms-array hcms-scalar-array" data-hcms-shape="scalar-array">
      <header class="hcms-array-header">
        <h3 class="hcms-array-title" data-hcms-label></h3>
      </header>
      <ul class="hcms-array-items"></ul>
      <div class="hcms-error" hidden></div>
      <button type="button" class="hcms-add mirk-button mirk-button--small" data-hcms-action="add"><span class="mirk-button__label">+ Add</span></button>
    </section>
  `,"@scalar-array-item":`
    <li class="hcms-array-item" draggable="true">
      <input class="mirk-input" data-hcms-field />
      <button type="button" class="hcms-move hcms-move-up hcms-sr-only" data-hcms-action="move-up" aria-label="Move up">\u2191</button>
      <button type="button" class="hcms-move hcms-move-down hcms-sr-only" data-hcms-action="move-down" aria-label="Move down">\u2193</button>
      <button type="button" class="hcms-remove" data-hcms-action="remove" aria-label="Remove">\xD7</button>
      <div class="hcms-error" hidden></div>
    </li>
  `,"@object-array":`
    <section class="hcms-array hcms-object-array hcms-array--cards" data-hcms-shape="object-array">
      <header class="hcms-array-header">
        <h3 class="hcms-array-title" data-hcms-label></h3>
      </header>
      <div class="hcms-array-items"></div>
      <div class="hcms-error" hidden></div>
      <button type="button" class="hcms-add mirk-button mirk-button--small" data-hcms-action="add"><span class="mirk-button__label">+ Add</span></button>
    </section>
  `,"@object-array-item":`
    <article class="hcms-card mirk-sortable__item" draggable="true">
      ${Bn}
      <div class="hcms-card-body mirk-sortable__body">
        <div class="hcms-card-fields"></div>
        <div class="hcms-card-controls">
          <button type="button" class="hcms-move hcms-move-up hcms-sr-only" data-hcms-action="move-up" aria-label="Move up">\u2191</button>
          <button type="button" class="hcms-move hcms-move-down hcms-sr-only" data-hcms-action="move-down" aria-label="Move down">\u2193</button>
          <button type="button" class="hcms-remove hcms-remove--card" data-hcms-action="remove" aria-label="Remove">${xt}</button>
        </div>
      </div>
      <div class="hcms-error" hidden></div>
    </article>
  `,"@file":`
    <div class="hcms-field hcms-upload hcms-upload--file" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <div class="mirk-file mirk-file--compact mirk-file--round">
        <label class="mirk-button mirk-button--round mirk-button--small">
          <input type="file" data-hcms-upload />
          <span class="mirk-button__label">Choose</span>
        </label>
        <a class="mirk-file__name" data-hcms-field></a>
        <button type="button" class="hcms-upload-clear" data-hcms-action="clear-upload" aria-label="Remove file">${xt}</button>
      </div>
      <div class="hcms-error" hidden></div>
    </div>
  `,"@image":`
    <div class="hcms-field hcms-upload hcms-upload--image" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <div class="mirk-image mirk-image--compact mirk-image--rounded">
        <label class="mirk-button mirk-button--small mirk-image__upload">
          <input type="file" accept="image/*" data-hcms-upload />
          <span class="mirk-button__label">Upload image</span>
        </label>
        <figure class="mirk-image__thumb">
          <span class="mirk-image__frame"><img class="mirk-image__preview" data-hcms-field alt="" /></span>
          <button type="button" class="hcms-upload-clear hcms-upload-clear--badge" data-hcms-action="clear-upload" aria-label="Remove image">${xt}</button>
        </figure>
      </div>
      <div class="hcms-error" hidden></div>
    </div>
  `,"@checkbox":`
    <div class="hcms-field hcms-field--row" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <label class="mirk-checkbox">
        <input type="checkbox" class="mirk-sr-only" data-hcms-field />
        <span class="mirk-checkbox__box"><span class="mirk-checkbox__mark"></span></span>
      </label>
      <div class="hcms-error" hidden></div>
    </div>
  `,"@toggle":`
    <div class="hcms-field hcms-field--row" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <label class="mirk-toggle">
        <input type="checkbox" role="switch" class="mirk-sr-only" data-hcms-field />
        <span class="mirk-toggle__track"><span class="mirk-toggle__thumb"></span></span>
      </label>
      <div class="hcms-error" hidden></div>
    </div>
  `,"@select":`
    <label class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <div class="mirk-select">
        <select class="mirk-select__field" data-hcms-field></select>
        <span aria-hidden="true" class="mirk-select__chevron">\u203A</span>
      </div>
      <div class="hcms-error" hidden></div>
    </label>
  `,"@radio":`
    <div class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <div class="hcms-radio-row">
        <label class="mirk-radio">
          <input type="radio" class="mirk-sr-only" data-hcms-field />
          <span class="mirk-radio__ring"><span class="mirk-radio__fill"></span><span class="mirk-radio__dot"></span></span>
          <span class="mirk-radio__label"></span>
        </label>
      </div>
      <div class="hcms-error" hidden></div>
    </div>
  `,"@textarea":`
    <label class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <textarea class="mirk-textarea" rows="3" data-hcms-field></textarea>
      <div class="hcms-error" hidden></div>
    </label>
  `,"@number":`
    <label class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <input class="mirk-input" type="number" data-hcms-field />
      <div class="hcms-error" hidden></div>
    </label>
  `,"@chips":`
    <div class="hcms-field hcms-chips" data-hcms-shape="scalar-array">
      <span class="hcms-label" data-hcms-label></span>
      <div class="mirk-tags hcms-array-items"></div>
      <button type="button" class="hcms-add mirk-button mirk-button--small" data-hcms-action="add"><span class="mirk-button__label">+ Add</span></button>
      <div class="hcms-error" hidden></div>
    </div>
  `,"@chips-item":`
    <span class="mirk-tags__chip" data-hcms-array-item>
      <input class="hcms-chip-field" data-hcms-field aria-label="Item" placeholder="\u2026" />
      <button type="button" class="hcms-remove" data-hcms-action="remove" aria-label="Remove">\xD7</button>
    </span>
  `},Pn=["@scalar","@object","@scalar-array","@scalar-array-item","@object-array","@object-array-item"];function qe(e){let t=e.head||e.documentElement;if(t)for(let r of Pn)ar(e,t,r)}function wt(e,t){if(!nr[t])return null;let r=e&&(e.head||e.documentElement);return r?ar(e,r,t):null}var tr={src:"@image",checked:"@checkbox"},Fe={image:"@image",file:"@file",checkbox:"@checkbox",toggle:"@toggle",select:"@select",radio:"@radio",textarea:"@textarea",number:"@number"},Hn=new Set([...Object.values(Fe),"@chips","@chips-item"]);function ve(e,t,r){if(typeof e!="string")return"@scalar";let n=e.lastIndexOf("@"),i=Be(xe(e,n),t,"data-hcms-component");if(i&&Fe[i]){let o=Fe[i],a=Array.isArray(r)&&r.some(s=>s==="*"||typeof s=="number");return o==="@number"&&!rr(e,n,t,a).every(zn)||(o==="@checkbox"||o==="@toggle")&&(n<0||e.slice(n+1)!=="checked")&&!rr(e,n,t,a).every(Wn)?"@scalar":o}if(n>=0){let o=e.slice(n+1);if(tr[o])return tr[o]}return"@scalar"}function ir(e,t){if(typeof e!="string")return null;let r=e.lastIndexOf("@"),n=Be(xe(e,r),t,"data-hcms-component");return n&&Fe[n]||null}var Un=/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;function zn(e){return e==null||e===""?!0:Un.test(String(e))}function Wn(e){return e==null||e===""||e==="true"||e==="false"}function rr(e,t,r,n){if(!r||!r.querySelectorAll)return[];let i=xe(e,t);if(!i||i===".")return[];let o=null;try{o=r.querySelectorAll(i)}catch{return[]}let a=t>=0?e.slice(t+1):null,s=[];for(let l of o)if(!(l.closest&&l.closest("[cms-template], [data-hcms-shell]"))&&(a?a==="value"&&"value"in l?s.push(l.value):s.push(l.getAttribute?l.getAttribute(a):null):s.push((l.textContent||"").trim()),!n))break;return s}function De(e,t){if(typeof e!="string"||!e.endsWith("[]")||!t||!t.querySelector)return null;let r=e.slice(0,-2).trim();if(!r)return null;let n=null;try{n=t.querySelector(r)}catch{return null}let i=n&&n.closest?n.closest("[data-hcms-component]"):null;return(i&&i.getAttribute?i.getAttribute("data-hcms-component"):null)==="chips"?{array:"@chips",item:"@chips-item"}:null}function ie(e,t,r){let n=e.join("."),i=e.map(o=>typeof o=="number"?"*":o).join(".");return n&&B(r,n)||i&&i!==n&&B(r,i)||B(r,t)}function $e(e,t,r){let n=De(e,r);if(!n)return null;let i=ie(t,n.array,r);return i&&i.getAttribute("data-hcms-tpl")===n.array?n:null}function or(e,t){if(typeof e!="string")return null;let r=e.lastIndexOf("@"),n=Be(xe(e,r),t,"data-hcms-options");if(n==null)return null;let i=n.trim().split(/\s+/).filter(Boolean);return i.length?i:null}function sr(e,t){if(typeof e!="string")return null;let r=e.lastIndexOf("@");return Be(xe(e,r),t,"data-hcms-crop")}function xe(e,t){return t>=0?e.slice(0,t):e}function Be(e,t,r){if(!t||!t.querySelector||!e||e===".")return null;let n=null;try{n=t.querySelector(e)}catch{return null}return n&&n.getAttribute?n.getAttribute(r):null}function Pe(e,t){if(!e||t==null)return;r(t);function r(n){let i=Z(n);if(i==="scalar"){let o=ve(n,e);Hn.has(o)&&wt(e,o);return}if(i==="scalar-array"){let o=De(n,e);o&&(wt(e,o.array),wt(e,o.item));return}if(i==="object"){for(let o of Object.values(n))r(o);return}if(i==="object-array"){let o=n[1];if(o&&typeof o=="object"&&!Array.isArray(o))for(let a of Object.values(o))r(a);else r(o)}}}function ar(e,t,r){let n=B(e,r);if(n)return n;let i=e.createElement("template");return i.setAttribute("data-hcms-tpl",r),i.setAttribute("save-remove",""),i.innerHTML=nr[r].trim(),t.appendChild(i),i}function B(e,t){return!e||!e.querySelector?null:e.querySelector(`template[data-hcms-tpl="${Vn(t)}"]`)}function Vn(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}function Z(e){return typeof e=="string"?e.endsWith("[]")?"scalar-array":"scalar":Array.isArray(e)?"object-array":typeof e=="object"&&e!==null?"object":"scalar"}function we(e){return e?!!(e.content||e).querySelector("[data-hcms-field]"):!1}var lr={IMG:"src",A:"href"};function He(e){if(!e)return"value";let t=(e.tagName||"").toUpperCase();return t==="INPUT"?(e.getAttribute("type")||"text").toLowerCase()==="checkbox"?"checked":"value":t==="TEXTAREA"||t==="SELECT"?"value":lr[t]?lr[t]:null}function cr(e,t){let r=(e.tagName||"").toUpperCase(),n=(e.getAttribute&&e.getAttribute("type")||"").toLowerCase(),i=He(e),a=`${ur(r,n)}[data-hcms-field="${oe(t)}"]`;return r==="INPUT"&&n==="radio"?`${a}:checked@value`:i?`${a}@${i}`:a}function Kn(e){let t=(e.tagName||"").toUpperCase(),r=(e.getAttribute&&e.getAttribute("type")||"").toLowerCase(),n=He(e),o=`${ur(t,r)}[data-hcms-field]`;return t==="INPUT"&&r==="radio"?`${o}:checked@value`:n?`${o}@${n}`:o}function ur(e,t){return e==="INPUT"?t?`input[type="${t}"]`:"input":e==="TEXTAREA"?"textarea":e==="SELECT"?"select":e==="IMG"?"img":e==="A"?"a":':not([data-hcms-shape="scalar"]):not([data-hcms-shape="object"]):not([data-hcms-shape="object-array"]):not([data-hcms-shape="scalar-array"])'}function oe(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var dr=new Set(["__proto__","constructor","prototype"]);function Ue(e,t){return r(e,[]);function r(c,d){let m=Z(c);if(m==="scalar")return n(c,d);if(m==="scalar-array")return i(c,d);if(m==="object-array")return o(c,d);if(m==="object"){let h=Object.create(null);for(let[y,x]of Object.entries(c)){if(dr.has(y))throw new Error(`hypercms: rule key "${y}" is forbidden at "${d.join(".")||"<root>"}"`);h[y]=r(x,[...d,y])}return h}return null}function n(c,d){let m=d.length?d[d.length-1]:null,h=typeof m=="string"?m:"__value",y=l(d,h);if(y)return cr(y,h);let x=s(ve(c,t,d),h);return x?cr(x,h):`input[data-hcms-field="${oe(h)}"]@value`}function i(c,d){let m=$e(c,d,t),h=m&&s(m.item,null)||s("@scalar-array-item",null),y=h?Kn(h):"input[data-hcms-field]@value";return[a(d,"[data-hcms-array-item]"),y]}function o(c,d){let[,m]=c,h=[...d,"*"],y=a(d,"[data-hcms-card]");if(m&&typeof m=="object"&&!Array.isArray(m)){let x=Object.create(null);for(let[T,k]of Object.entries(m)){if(dr.has(T))throw new Error(`hypercms: rule key "${T}" is forbidden at "${h.join(".")}"`);x[T]=r(k,[...h,T])}return[y,x]}return[y,r(m,[...h,0])]}function a(c,d){let m=c.length?c[c.length-1]:"",h=c.some(T=>T==="*"),y=c.join(".");return`${h?`[data-hcms-field="${oe(m)}"]`:`[data-hcms-path="${oe(y)}"]`} > .hcms-array-items > ${d}`}function s(c,d){if(!t)return null;let m=B(t,c);if(!m)return null;let h=m.content||m;if(d){let y=h.querySelector(`[data-hcms-field="${oe(d)}"]`);if(y)return y}return h.querySelector("[data-hcms-field]")}function l(c,d){if(!t)return null;let m=c.map(x=>typeof x=="number"?"*":x).join("."),y=[c.join("."),m];for(let x=c.length-1;x>=0;x--){let T=c.slice(0,x).map(k=>typeof k=="number"?"*":k);T.push("*"),y.push(T.join("."))}for(let x of y){if(!x)continue;let T=B(t,x);if(!T||!we(T))continue;let k=T.content||T,M=k.querySelector(`[data-hcms-field="${oe(d)}"]`)||k.querySelector("[data-hcms-field]");if(M)return M}return null}}function _t(e){if(!e)return"";let t=String(e).split(/[?#]/)[0],r=t.split("/").pop()||t;try{return decodeURIComponent(r)}catch{return r}}function ze({pageRules:e,formRules:t,data:r,doc:n}){let i=n.createDocumentFragment(),o=At(e,[],r,n);return o&&i.appendChild(o),i}function hr({shape:e,itemShape:t,pathArr:r,data:n,doc:i,itemKey:o}){if(e==="object-array-item")return fr(t,r,n,i);if(e==="scalar-array-item")return br(r,n,i,o||null);throw new Error(`hypercms: buildItem called with unknown shape "${e}"`)}function At(e,t,r,n){let i=Z(e);return i==="scalar"?Gn(e,t,r,n):i==="object"?Zn(e,t,r,n):i==="object-array"?Qn(e,t,r,n):i==="scalar-array"?ei(e,t,r,n):null}function Gn(e,t,r,n){let i=ve(e,n,t),o=ie(t,i,n);if(!o)throw new Error(`hypercms: missing template for scalar at "${t.join(".")}"`);let a=ir(e,n);a==="@number"&&i==="@scalar"&&console.info(`[hypercms] field "${t.join(".")}" declares component "@number" but its value isn't a plain number; rendering a text input so the value is preserved`),(a==="@checkbox"||a==="@toggle")&&i==="@scalar"&&console.info(`[hypercms] field "${t.join(".")}" declares component "${a}" but its value isn't true/false; rendering a text input so the value is preserved`),pr(o,a===i?a:null,t);let s=se(o,n);ae(s,t);let l=o.getAttribute?.("data-hcms-tpl");if((i==="@select"||i==="@radio")&&l===i&&Yn(s,e,t,r,n,i),i==="@image"&&l==="@image"){let c=sr(e,n);c!=null&&!s.hasAttribute("data-hcms-crop")&&s.setAttribute("data-hcms-crop",c)}return ti(s,V(t)),We(s,V(t)),Ve(s,V(t)),xr(s,r),i==="@file"&&Xn(s),s}function pr(e,t,r){if(!t)return;let n=e.getAttribute?.("data-hcms-tpl");n&&n!==t&&console.info(`[hypercms] field "${r.join(".")}" declares component "${t}" but custom template "${n}" wins`)}function Yn(e,t,r,n,i,o){let a=or(t,i),s=a?[...a]:[],l=n==null?"":String(n);if(l!==""&&!s.includes(l)&&s.unshift(l),!a&&(Jn(e,"data-hcms-options required (space-separated values)"),s.length===0)){e.querySelector(".mirk-radio")?.remove();return}if(o==="@select"){let m=e.querySelector("select[data-hcms-field]");if(!m)return;for(let h of s){let y=i.createElement("option");y.value=h,y.textContent=Ie(h),m.appendChild(y)}return}let c=e.querySelector(".mirk-radio");if(!c||!c.parentNode)return;let d=St(r.join("."));for(let m of s){let h=c.cloneNode(!0),y=h.querySelector('input[type="radio"]');y&&(y.value=m,y.name=d);let x=h.querySelector(".mirk-radio__label");x&&(x.textContent=Ie(m)),c.parentNode.insertBefore(h,c)}c.remove()}function St(e){return"hcms-"+String(e).replace(/[^A-Za-z0-9_-]/g,"-")}function Jn(e,t){let r=e.querySelector?e.querySelector(".hcms-error"):null;r&&(r.textContent=t,r.hidden=!1)}function Xn(e){let t=e.querySelector?e.querySelector("a.mirk-file__name[data-hcms-field]"):null;t&&(t.textContent=_t(t.getAttribute("href")))}function Zn(e,t,r,n){let i=ie(t,"@object",n);if(!i)throw new Error(`hypercms: missing template for object at "${t.join(".")}"`);let o=se(i,n);if(ae(o,t),We(o,V(t)),Ve(o,V(t)),we(i))return _r(o,e,t),wr(o,e,r),o;let a=Ke(o,".hcms-object-fields",i,t);for(let[s,l]of Object.entries(e)){let c=r==null?null:r[s],d=At(l,[...t,s],c,n);d&&a.appendChild(d)}return o}function Qn(e,t,r,n){let i=ie(t,"@object-array",n);if(!i)throw new Error(`hypercms: missing template for object-array at "${t.join(".")}"`);let o=se(i,n);ae(o,t),We(o,V(t)),Ve(o,V(t)),kr(o,i),vr(o,i,t);let a=Ke(o,".hcms-array-items",i,t),[,s]=e;return(Array.isArray(r)?r:[]).forEach((c,d)=>{let m=fr(s,[...t,d],c,n);m&&a.appendChild(m)}),yr(o),o}function fr(e,t,r,n){let i=gr(t,"object-array-item",n);if(!i)throw new Error(`hypercms: missing item template for "${t.join(".")}"`);let o=se(i,n);if(o.setAttribute("data-hcms-card",""),o.classList.contains("hcms-card")||o.classList.add("hcms-card"),ae(o,t),we(i))return e&&typeof e=="object"&&!Array.isArray(e)&&(_r(o,e,t),wr(o,e,r)),o;let a=Ke(o,".hcms-card-fields",i,t);if(e&&typeof e=="object"&&!Array.isArray(e))for(let[s,l]of Object.entries(e)){let c=r==null?null:r[s],d=At(l,[...t,s],c,n);d&&a.appendChild(d)}return o}function ei(e,t,r,n){let i=De(e,n),o=$e(e,t,n),a=i?i.array:"@scalar-array",s=ie(t,a,n);if(!s)throw new Error(`hypercms: missing template for scalar-array at "${t.join(".")}"`);pr(s,i?i.array:null,t);let l=se(s,n);ae(l,t),We(l,V(t)),Ve(l,V(t)),kr(l,s),vr(l,s,t),o&&l.setAttribute("data-hcms-item-tpl",o.item);let c=Ke(l,".hcms-array-items",s,t);return(Array.isArray(r)?r:[]).forEach((m,h)=>{let y=br([...t,h],m,n,o?o.item:null);y&&c.appendChild(y)}),yr(l),l}function br(e,t,r,n){let i=gr(e,"scalar-array-item",r,n);if(!i)throw new Error(`hypercms: missing item template for "${e.join(".")}"`);let o=se(i,r);return o.setAttribute("data-hcms-array-item",""),o.classList.contains("hcms-array-item")||o.classList.add("hcms-array-item"),ae(o,e),xr(o,t),o}function gr(e,t,r,n){let i=e.map(o=>typeof o=="number"?"*":o).join(".");return B(r,i)||n&&B(r,n)||B(r,"@"+t)}function se(e,t){let r=e.content||e,n=t.createElement("div");return n.appendChild(r.cloneNode(!0)),n.firstElementChild||n}function ae(e,t){e.setAttribute("data-hcms-path",t.join("."))}function ti(e,t){let r=t==null?"":String(t);if(e.matches&&e.matches("[data-hcms-field]")){e.getAttribute("data-hcms-field")||e.setAttribute("data-hcms-field",r);return}(e.querySelectorAll?e.querySelectorAll("[data-hcms-field]"):[]).forEach(i=>{i.getAttribute("data-hcms-field")||i.setAttribute("data-hcms-field",r)})}function We(e,t){t==null||t===""||!e.setAttribute||e.hasAttribute?.("data-hcms-field")||e.setAttribute("data-hcms-field",String(t))}function Ve(e,t){if(t==null||t==="")return;(e.querySelectorAll?e.querySelectorAll("[data-hcms-label]"):[]).forEach(n=>{(n.textContent||"").trim()===""&&(n.textContent=Ie(String(t)))})}function kr(e,t){["data-hcms-no-add","data-hcms-no-remove","data-hcms-no-reorder"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,"")}),["data-hcms-min-items","data-hcms-max-items"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,t.getAttribute(r))})}function yr(e){let t=e.querySelector?e.querySelector(".hcms-array-items"):null;if(!t)return;let r=Array.from(t.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),n=r.length,i=mr(e,"data-hcms-max-items"),o=mr(e,"data-hcms-min-items"),a=e.hasAttribute("data-hcms-no-add"),s=e.hasAttribute("data-hcms-no-remove"),l=e.hasAttribute("data-hcms-no-reorder"),c=e.querySelector('[data-hcms-action="add"]');c&&(c.hidden=a||i!=null&&n>=i),r.forEach((d,m)=>{let h=d.querySelector('[data-hcms-action="remove"]');h&&(h.hidden=s||o!=null&&n<=o);let y=d.querySelector('[data-hcms-action="move-up"]');y&&(y.hidden=l||m===0);let x=d.querySelector('[data-hcms-action="move-down"]');x&&(x.hidden=l||m===n-1)})}function mr(e,t){if(!e||!e.hasAttribute(t))return null;let r=parseInt(e.getAttribute(t),10);return Number.isFinite(r)?r:null}function vr(e,t,r){if(e.hasAttribute("data-hcms-no-reorder")||t.hasAttribute("data-hcms-no-reorder"))return;let n=e.querySelector(".hcms-array-items");if(!n)return;let i="hcms-"+r.join(".");n.setAttribute("sortable",i),n.setAttribute("onsorted","hypercmsCommit && hypercmsCommit()")}function V(e){return e.length?e[e.length-1]:null}function xr(e,t){let r=ri(e);if(r.length!==0)for(let n of r)Ar(n,t)}function ri(e){if(!e)return[];let t=[];return e.matches?.("[data-hcms-field]")&&ni(e)&&t.push(e),(e.querySelectorAll?e.querySelectorAll("input[data-hcms-field], textarea[data-hcms-field], select[data-hcms-field], img[data-hcms-field], a[data-hcms-field], [contenteditable][data-hcms-field]"):[]).forEach(n=>t.push(n)),t}function ni(e){let t=(e.tagName||"").toUpperCase();return!!(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||t==="IMG"||t==="A"||e.hasAttribute?.("contenteditable"))}function wr(e,t,r){(e.querySelectorAll?e.querySelectorAll("[data-hcms-field]"):[]).forEach(i=>{let o=i.getAttribute("data-hcms-field");if(!o)return;if(!t||typeof t!="object"||!(o in t)){console.warn(`[hypercms] inline template field "${o}" is not in the rule shape; ignoring`);return}let a=r==null?null:r[o];Ar(i,a)})}function _r(e,t,r){if(!e.querySelectorAll)return;e.querySelectorAll("[data-hcms-field]").forEach(i=>{let o=i.getAttribute("data-hcms-field");if(!o||t&&typeof t=="object"&&!(o in t))return;let a=[...r,o].join(".");i.setAttribute("data-hcms-path",a)})}function Ke(e,t,r,n){if(!e.querySelector)return e;let i=e.querySelector(t);if(i)return i;let o=r?.getAttribute?.("data-hcms-tpl")||n.join(".");throw new Error(`hypercms: template "${o}" is in slotted mode but has no ${t} element`)}function Ar(e,t){let r=He(e),n=(e.tagName||"").toUpperCase(),i=(e.getAttribute("type")||"").toLowerCase();if(n==="INPUT"&&i==="radio"){e.checked=e.value!=null&&String(e.value)===String(t??"");return}if(r==="checked"){e.checked=t===!0||t==="true";return}if(r){e[r]=t==null?"":String(t);return}e.textContent=t==null?"":String(t)}var Sr={skip:"[data-hcms-shell]",templateAttr:"cms-template"};function Er(e,t,r,n={}){let{observerHandle:i,shellRoot:o,structural:a,structuralPath:s}=n;i?.pause?.();try{if(!a)try{return q.apply(e,t,r,Sr),{ok:!0}}catch(m){return{ok:!1,error:m}}let l=ii(e,t,s),c=l?si(l):null,d=l?null:li(e,o);try{return q.apply(e,t,r,Sr),{ok:!0}}catch(m){return c?ai(l,c):d&&ci(e,o,d),{ok:!1,error:m}}}finally{i?.resume?.()}}function ii(e,t,r){if(!r||!e)return null;let n=W(r),i=[],o=t;for(let a of n){if(typeof o=="string"||o==null||Array.isArray(o))break;if(typeof o=="object"&&a in o){if(i.push(a),o=o[a],Array.isArray(o)||typeof o=="string"&&o.endsWith("[]"))break}else return null}return!Array.isArray(o)&&!(typeof o=="string"&&o.endsWith("[]"))?null:oi(e,t,i)}function oi(e,t,r){if(r.length===0)return null;let n=e,i=t;for(let o=0;o<r.length;o++){let a=r[o];if(!i||typeof i!="object"||Array.isArray(i))return null;let s=i[a];if(s==null)return null;if(o===r.length-1){if(Array.isArray(s)){let[l]=s;return n.querySelector?.(l)?.parentElement||null}if(typeof s=="string"&&s.endsWith("[]")){let l=s.slice(0,-2);return n.querySelector?.(l)?.parentElement||null}return null}i=s}return null}function si(e){let t=[];for(let r of Array.from(e.childNodes))t.push(r.cloneNode(!0));return t}function ai(e,t){for(;e.firstChild;)e.removeChild(e.firstChild);for(let r of t)e.appendChild(r)}function li(e,t){let r=[];for(let n of Array.from(e.childNodes))n===t||t&&n.contains?.(t)||r.push(n.cloneNode(!0));return r}function ci(e,t,r){for(let i of Array.from(e.childNodes))i===t||t&&i.contains?.(t)||e.removeChild(i);let n=di(e,t);for(let i of r)e.insertBefore(i,n||null)}function di(e,t){if(!t)return null;for(let r of Array.from(e.childNodes))if(r===t||r.contains?.(t))return r;return null}var Et=new WeakSet;function ce(e,t){let r=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;if(!r)return t();r.pause();try{let n=t();return n&&n.ok?r.commitCaptured(e):r.discardCaptured(),n}finally{r.resume()}}function Je(e){let t=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;if(!t)return e();t.pause();try{return e()}finally{t.discardCaptured(),t.resume()}}function Mr(e){let{formRoot:t}=e;if(!t||Et.has(t))return;Et.add(t);let r=a=>{let s=a.target;!s||!s.closest||s.closest("[data-hcms-form-root]")&&s.matches("input, textarea, select")&&(s.matches('input[type="file"]')||!s.closest("[data-hcms-field]")&&!s.hasAttribute?.("data-hcms-field")||Cr(s,e))},n=a=>{let s=a.target;if(!(!s||!s.closest)&&s.closest("[data-hcms-form-root]")){if(s.matches('input[type="file"][data-hcms-upload]')){gi(s,e);return}s.matches('input[type="checkbox"], input[type="radio"], select')&&Cr(s,e)}},i=a=>{let s=a.target;if(!s||!s.closest)return;let l=s.closest("[data-hcms-action]");if(!l)return;let c=l.getAttribute("data-hcms-action");if(c==="add"||c==="remove"||c==="move-up"||c==="move-down"||c==="clear-upload"){if(!l.closest("[data-hcms-form-root]"))return}else if(c==="close"&&!l.closest("[data-hcms-shell]"))return;if(c==="add"){let d=l.closest("[data-hcms-path]");if(!d)return;let m=d.getAttribute("data-hcms-path");Ct(m,e)}else if(c==="remove"){let d=l.closest("[data-hcms-card], [data-hcms-array-item]");if(!d)return;_i(d,e)}else if(c==="move-up"||c==="move-down"){let d=l.closest("[data-hcms-card], [data-hcms-array-item]");if(!d)return;xi(d,c==="move-up"?-1:1,e)}else c==="clear-upload"?ki(l,e):c==="close"&&e.onCloseRequested?.()},o=t.ownerDocument;o.addEventListener("input",r,!0),o.addEventListener("change",n,!0),o.addEventListener("click",i,!0),e.detachEvents=()=>{o.removeEventListener("input",r,!0),o.removeEventListener("change",n,!0),o.removeEventListener("click",i,!0),Et.delete(t)}}var ui=new Set(["value","checked"]);function mi(e,t){if(!t)return null;let r=W(t);if(r.some(l=>typeof l=="number"||l==="*"))return null;let n=X(e.pageRules,r);if(typeof n!="string")return null;let i=n.lastIndexOf("@");if(i===-1)return null;let o=n.slice(i+1);if(!ui.has(o))return null;let a=n.slice(0,i),s=a?e.pageRoot.querySelector(a):e.pageRoot;return s?{el:s,prop:o,oldValue:s[o]}:null}function Cr(e,t){let n=(e.closest("[data-hcms-field]")||e).closest("[data-hcms-path]")?.getAttribute("data-hcms-path")||"",i=mi(t,n);if(U(D(t),{path:n,structural:!1},t),i){let o=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;o&&typeof o.recordValue=="function"&&o.recordValue(i.el,{prop:i.prop,oldValue:i.oldValue,newValue:i.el[i.prop]})}}var hi={type:"image/webp",quality:.85,maxWidth:2048,maxHeight:2048};async function pi(e,t){let r=t&&t.getAttribute?t.getAttribute("data-hcms-crop"):null;if(r==null)return{file:e};let n=typeof window<"u"&&window.hyperclay&&window.hyperclay.quickcrop||null;if(typeof n!="function")return{file:e};try{let i=await n(e,{aspect:fi(r),...hi});return i===null?null:{file:bi(i.blob,e.name),dataURL:i.dataURL}}catch(i){return _e(t,i&&i.message||"Crop failed"),null}}function fi(e){let t=String(e??"").trim().toLowerCase();if(t===""||t==="free")return null;let r=t.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);if(!r)return null;let n=parseFloat(r[1]),i=parseFloat(r[2]);return!n||!i?null:n/i}function bi(e,t){let r=e.type==="image/webp"?".webp":e.type==="image/jpeg"?".jpg":".png",n=String(t||"image").replace(/\.[^.]+$/,"");try{return new File([e],n+r,{type:e.type})}catch{return e}}async function gi(e,t){let r=e.files&&e.files[0];if(!r)return;let n=e.closest("[data-hcms-path]");if(!n)return;let i=n.getAttribute("data-hcms-path")||"";_e(n,null);let o=await pi(r,n);if(!o||t.closed){Q(e);return}let a=o.file,s=o.dataURL||null,l=typeof window<"u"&&window.hyperclay&&window.hyperclay.uploadFileBasic||null,c=null;if(typeof l=="function")try{let d=await l(a);c=d&&d.uploads&&d.uploads[0]&&d.uploads[0].url}catch(d){if(t.closed){Q(e);return}_e(n,d&&d.message||"Upload failed"),t.dispatch?.("hcms:error",{error:d,path:i}),Q(e);return}if(t.closed){Q(e);return}if(c||(c=s||vi(a)),!c){Q(e);return}_e(n,null),Tr(n,c,a.name),U(D(t),{path:i,structural:!1},t),Q(e)}function ki(e,t){let r=e.closest("[data-hcms-path]");if(!r)return;let n=r.getAttribute("data-hcms-path")||"";Tr(r,"","");let i=r.querySelector('input[type="file"][data-hcms-upload]');i&&Q(i),_e(r,null),U(D(t),{path:n,structural:!1},t)}function yi(e){return e.querySelector?e.querySelector("img[data-hcms-field], a[data-hcms-field]"):null}function Tr(e,t,r){let n=yi(e);if(!n)return;let i=(n.tagName||"").toUpperCase();i==="IMG"?n.src=t||"":i==="A"&&(n.href=t||"",n.textContent=t?r||_t(t):"")}function Q(e){try{e.value=""}catch{}}function vi(e){let t=typeof URL<"u"&&URL.createObjectURL?URL:null;if(!t)return"";try{return t.createObjectURL(e)}catch{return""}}function _e(e,t){let r=e.querySelector?e.querySelector(":scope > .hcms-error"):null;r&&(t?(r.textContent=t,r.hidden=!1):(r.textContent="",r.hidden=!0))}function Ct(e,t){let{formRoot:r,pageRules:n}=t,i=r.querySelector(`[data-hcms-path="${Ti(e)}"]`);if(!i)throw new Error(`hypercms: no element at path "${e}"`);let o=i.querySelector(".hcms-array-items");if(!o)throw new Error(`hypercms: array container missing .hcms-array-items at "${e}"`);let a=W(e),s=Ci(n,a),l=Array.isArray(s),c=typeof s=="string"&&s.endsWith("[]");if(!l&&!c)throw new Error(`hypercms: path "${e}" is not an array`);let d=Ye(i,"data-hcms-max-items"),m=o.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]");if(i.hasAttribute("data-hcms-no-add")||d!=null&&m.length>=d)return;let h=m.length,y=l?s[1]:s.replace(/\[\]$/,""),x=ye(l?y:"string"),T=hr({shape:l?"object-array-item":"scalar-array-item",itemShape:y,pathArr:[...a,h],data:x,doc:t.doc,itemKey:i.getAttribute("data-hcms-item-tpl")||null});return o.appendChild(T),Mt(i),ce(`Add ${e}`,()=>U(D(t),{path:e,structural:!0},t))}function xi(e,t,r){let n=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]');if(!n||n.hasAttribute("data-hcms-no-reorder"))return;let i=n.querySelector(".hcms-array-items");if(!i)return;let o=Array.from(i.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),a=o.indexOf(e);if(a<0)return;let s=a+t;if(s<0||s>=o.length)return;let l=e.querySelector(`[data-hcms-action="${t<0?"move-up":"move-down"}"]`);return t<0?i.insertBefore(e,o[s]):i.insertBefore(e,o[s].nextSibling),Ot(i),Mt(n),l&&typeof l.focus=="function"&&e.querySelector(`[data-hcms-action="${t<0?"move-up":"move-down"}"]`)?.focus?.(),ce(`Reorder ${n.getAttribute("data-hcms-path")||""}`,()=>U(D(r),{path:n.getAttribute("data-hcms-path")||"",structural:!0},r))}var Ge="Delete this item?";function wi(e,t){let r=e&&e.getAttribute("data-hcms-confirm-remove");if(r!=null)return/^(off|false|no|0)$/i.test(r.trim())?null:r||Ge;let n=t&&t.confirmRemove;return n===!1?null:typeof n=="string"?n||Ge:n===!0||e&&e.getAttribute("data-hcms-shape")==="object-array"?Ge:null}function _i(e,t){let r=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]'),n=wi(r,t);if(n==null)return le(e,t);let i=typeof window<"u"&&(window.hyperclay?.consent||window.consent);typeof i=="function"?Promise.resolve(i(n)).then(()=>le(e,t),()=>{}):typeof window<"u"&&typeof window.confirm=="function"?window.confirm(n)&&le(e,t):le(e,t)}function le(e,t){let r=e.getAttribute("data-hcms-path")||"",n=e.parentElement,i=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]');if(!i?.hasAttribute("data-hcms-no-remove")){if(i){let o=Ye(i,"data-hcms-min-items"),a=i.querySelector(".hcms-array-items"),s=a?a.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]").length:0;if(o!=null&&s<=o)return}return e.remove(),n&&Ot(n),i&&Mt(i),ce(`Remove ${r}`,()=>U(D(t),{path:r,structural:!0},t))}}function U(e,t,r){let n=Ae(e);if(n===r.lastFingerprint)return{ok:!0,skipped:!0};let i=Er(r.pageRoot,r.pageRules,e,{observerHandle:r.observerHandle,shellRoot:r.shellRoot,structural:!!t.structural,structuralPath:t.path||null});return i.ok?(r.lastFingerprint=n,r.lastData=e,Rr(r,null),r.dispatch?.("hcms:change",{data:e,path:t.path,structural:!!t.structural}),r.onChange?.(e,t)):(Rr(r,Ei(i.error,t.path)),r.dispatch?.("hcms:error",{error:i.error,attemptedData:e}),r.onError?.(i.error)),i}function D(e){let t=q.extract(e.formRoot,e.formRules);return K(t,e.formRules)}function K(e,t){if(t==null||e==null)return e;if(typeof t=="string")return t.endsWith("@checked")?e===!0||e==="true":e;if(Array.isArray(t)){if(!Array.isArray(e))return e;let[,r]=t;return e.map(n=>K(n,r))}if(typeof t=="object"){if(typeof e!="object"||Array.isArray(e))return e;let r={};for(let[n,i]of Object.entries(t))r[n]=K(e[n],i);return r}return e}function Rr(e,t){e.lastErrors=t&&t.length?t:null,Rt(e)}function Rt(e){if(Ai(e),e.errorEl&&(e.errorEl.textContent="",e.errorEl.hidden=!0),!e.lastErrors)return;let t=[];for(let{message:r,path:n}of e.lastErrors){if(n!=null&&n!==""){let i=Si(e.formRoot,n);if(i){i.textContent=i.textContent?`${i.textContent}
${r}`:r,i.hidden=!1;continue}}t.push(r)}t.length&&e.errorEl&&(e.errorEl.textContent=t.join(`
`),e.errorEl.hidden=!1)}function Ai(e){if(e.formRoot)for(let t of e.formRoot.querySelectorAll(".hcms-error"))t.textContent="",t.hidden=!0}function Si(e,t){if(!e)return null;let r=t.split(".");for(;r.length>0;){let n=r.join("."),i=typeof CSS<"u"&&CSS.escape?CSS.escape(n):n.replace(/[^a-zA-Z0-9_\-.*]/g,a=>"\\"+a),o=e.querySelector(`[data-hcms-path="${i}"]`);if(o){for(let a of o.children)if(a.classList&&a.classList.contains("hcms-error"))return a}r.pop()}return null}function Ei(e,t){return e?e.name==="EmptyListInsert"?[{message:"Add a seed item in HTML first.",path:t}]:e.name==="ShapeMismatch"&&Array.isArray(e.mismatches)&&e.mismatches.length?e.mismatches.map(r=>({message:`Shape mismatch: expected ${r.expected}, got ${r.got}`,path:r.path})):[{message:e.message||String(e),path:t}]:[{message:"unknown error",path:t}]}function Ci(e,t){let r=e;for(let n of t){if(r==null||typeof r=="string")return;if(Array.isArray(r)){if(typeof n!="number"&&n!=="*")return;r=r[1];continue}if(typeof r=="object"){if(typeof n=="number"||!(n in r))return;r=r[n];continue}return}return r}function Ye(e,t){if(!e||!e.hasAttribute(t))return null;let r=parseInt(e.getAttribute(t),10);return Number.isFinite(r)?r:null}function Mt(e){if(!e)return;let t=e.querySelector(".hcms-array-items");if(!t)return;let r=Array.from(t.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),n=r.length,i=Ye(e,"data-hcms-max-items"),o=Ye(e,"data-hcms-min-items"),a=e.hasAttribute("data-hcms-no-add"),s=e.hasAttribute("data-hcms-no-remove"),l=e.hasAttribute("data-hcms-no-reorder"),c=e.querySelector(':scope > .hcms-add, :scope > * > .hcms-add, :scope > [data-hcms-action="add"]');c&&(c.hidden=a||i!=null&&n>=i),r.forEach((d,m)=>{let h=d.querySelector('[data-hcms-action="remove"]');h&&(h.hidden=s||o!=null&&n<=o);let y=d.querySelector('[data-hcms-action="move-up"]');y&&(y.hidden=l||m===0);let x=d.querySelector('[data-hcms-action="move-down"]');x&&(x.hidden=l||m===n-1)})}function Tt(e){!e||!e.querySelectorAll||e.querySelectorAll(".hcms-array-items").forEach(t=>Ot(t))}function Ot(e){let t=e.querySelectorAll?Array.from(e.querySelectorAll('input[type="radio"][data-hcms-field]'),n=>[n,n.checked]):[],r=0;for(let n of e.children){if(!n.matches?.("[data-hcms-card], [data-hcms-array-item]"))continue;let i=n.getAttribute("data-hcms-path");if(!i)continue;let o=i.split(".");o[o.length-1]=String(r);let a=o.join(".");a!==i&&Ri(n,i,a),r++}for(let[n,i]of t)n.checked!==i&&(n.checked=i)}function Ri(e,t,r){let n=e.querySelectorAll("[data-hcms-path]");e.setAttribute("data-hcms-path",r);for(let i of n){let o=i.getAttribute("data-hcms-path");o===t?i.setAttribute("data-hcms-path",r):o&&o.startsWith(t+".")&&i.setAttribute("data-hcms-path",r+o.slice(t.length))}Mi(e)}function Mi(e){for(let t of e.querySelectorAll('input[type="radio"][data-hcms-field]')){if(!t.name||!t.name.startsWith("hcms-"))continue;let r=t.closest("[data-hcms-path]");r&&(t.name=St(r.getAttribute("data-hcms-path")))}}function Ae(e){return JSON.stringify(e,(t,r)=>{if(r&&typeof r=="object"&&!Array.isArray(r)){let n=Object.create(null);for(let i of Object.keys(r).sort())n[i]=r[i];return n}return r})}function Ti(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var qi={},Xe="hcms-shell-styles",Oi="hcms-bundled-styles-installed",Li='a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',de=new WeakSet,Lt="";function Lr(e){Lt=e}var ji=0;function Or(e){return String(e).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t])}function jr({mountTo:e,side:t="right",overlay:r=!1,showSaveButton:n=!1,title:i="Page content",eyebrow:o="Edit",theme:a=null,doc:s}){Nr(s);let l=`hcms-shell-title-${++ji}`,c=s.createElement("div");c.setAttribute("data-hcms-shell",""),c.setAttribute("save-remove",""),c.setAttribute("save-ignore",""),c.setAttribute("tabindex","-1"),c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.setAttribute("aria-labelledby",l);let d=a==="dark"?" dark":a==="light"?" light":"";c.className="hcms-shell pixel-quiet hcms-side-"+t+(r?" hcms-overlay":"")+d;let m=Or(i),h=Or(o);c.innerHTML=`
    <div class="hcms-shell-minibar" aria-hidden="true">
      <span class="hcms-shell-minibar-title">${m}</span>
      <button type="button" class="hcms-shell-close mirk-button mirk-button--small" data-hcms-action="close" aria-label="Close">
        <span class="mirk-button__label">\xD7</span>
      </button>
    </div>
    <div class="hcms-shell-body">
      <header class="hcms-shell-header">
        <div class="hcms-shell-heading">
          <div class="hcms-shell-eyebrow">${h}</div>
          <h2 class="hcms-shell-title" id="${l}">${m}</h2>
        </div>
        <button type="button" class="hcms-shell-close mirk-button mirk-button--small" data-hcms-action="close" aria-label="Close">
          <span class="mirk-button__label">\xD7</span>
        </button>
      </header>
      <div class="hcms-shell-error" role="alert" hidden></div>
      <div data-hcms-form-root class="hcms-form"></div>
      <footer class="hcms-shell-footer"${n?"":" hidden"}>
        <button type="button" class="hcms-shell-save mirk-button" trigger-save>
          <span class="mirk-button__label">Save</span>
        </button>
      </footer>
    </div>
  `,(e||s.body).appendChild(c);let x=s.body;x.classList.add("hcms-open"),r&&x.classList.add("hcms-overlay"),t==="left"&&x.classList.add("hcms-side-left");let T=Ii(c,s),k=Fi(c);return{root:c,formRoot:c.querySelector("[data-hcms-form-root]"),errorEl:c.querySelector(".hcms-shell-error"),saveButton:c.querySelector(".hcms-shell-save"),destroy(){T.detach(),k.detach(),c.remove(),x.classList.remove("hcms-open","hcms-overlay","hcms-side-left")},restoreChrome(){Ni(s),x.classList.add("hcms-open"),r&&x.classList.add("hcms-overlay"),t==="left"&&x.classList.add("hcms-side-left")}}}function Ni(e){e&&(e.getElementById(Xe)||e.querySelector("style[data-hcms-bundled-styles]")||(de.delete(e),Nr(e)))}function Nr(e){if(e&&!de.has(e)){if(e[Oi]){de.add(e);return}if(e.getElementById(Xe)||e.querySelector("style[data-hcms-bundled-styles]")){de.add(e);return}if(Lt){let t=e.createElement("style");t.id=Xe,t.setAttribute("save-remove",""),t.setAttribute("save-ignore",""),t.textContent=Lt,(e.head||e.documentElement).appendChild(t),de.add(e);return}try{let t=new URL("./theme.generated.css",qi.url).href,r=e.createElement("link");r.rel="stylesheet",r.id=Xe,r.setAttribute("save-remove",""),r.setAttribute("save-ignore",""),r.href=t,(e.head||e.documentElement).appendChild(r),de.add(e)}catch{console.warn("hypercms: shell stylesheet not applied \u2014 cssText is empty and the co-located theme fallback is unavailable. Call installStyles(themeText) before opening the CMS.")}}}function Fi(e){let t=e.querySelector(".hcms-shell-body"),r=e.querySelector(".hcms-shell-header");if(!t||!r||typeof t.addEventListener!="function")return{detach(){}};let n=()=>{let i=(r.offsetHeight||0)-12;e.classList.toggle("is-condensed",t.scrollTop>i)};return t.addEventListener("scroll",n,{passive:!0}),n(),{detach(){t.removeEventListener("scroll",n)}}}function Ii(e,t){function r(n){if(n.key!=="Tab"||!e.contains(t.activeElement))return;let i=Array.from(e.querySelectorAll(Li));if(i.length===0)return;let o=i[0],a=i[i.length-1];n.shiftKey&&t.activeElement===o?(n.preventDefault(),a.focus()):!n.shiftKey&&t.activeElement===a&&(n.preventDefault(),o.focus())}return t.addEventListener("keydown",r),{detach:()=>t.removeEventListener("keydown",r)}}var Di={skip:"[data-hcms-shell]",templateAttr:"cms-template"};function Ze(e,{ignoreActiveValue:t}={}){let r=q.findRules(e.doc,e.rulesSource||"cms");r&&(e.pageRules=r.rules,e.rulesTagNode=r.tagNode),qe(e.doc),Pe(e.doc,e.pageRules),e.formRules=Ue(e.pageRules,e.doc);let n=K(q.extract(e.pageRoot,e.pageRules,Di),e.pageRules),i=ze({pageRules:e.pageRules,formRules:e.formRules,data:n,doc:e.doc});Ne(e.formRoot,i,{ignoreActiveValue:t}),Rt(e),e.updateFingerprint&&e.updateFingerprint()}function Fr({debounce:e=100,onRefresh:t}){let r=typeof window<"u"&&window.hyperclay&&window.hyperclay.Mutation||null;if(!r||typeof r.onAnyChange!="function")throw new Error("hypercms: window.hyperclay.Mutation is required. Load hyperclayjs (or just the mutation utility) before initializing hypercms.");let n=0,i=r.onAnyChange({debounce:e},()=>{n>0||t()});return{unsubscribe:typeof i=="function"?i:()=>{},pause(){n++},resume(){n=Math.max(0,n-1)}}}var $i="[hypercms]";function Ir(e,t){if(!e||!e.querySelectorAll||!t)return;let r=Bi(t);e.querySelectorAll("template[data-hcms-tpl]").forEach(i=>{let o=i.getAttribute("data-hcms-tpl");o&&(o.startsWith("@")||r.has(o)||console.warn(`${$i} template "${o}" doesn't match any rule path; ignored`))})}function Bi(e){let t=new Set;return r([],e),t;function r(n,i){let o=n.join("."),a=n.map(l=>typeof l=="number"?"*":l).join(".");o&&t.add(o),a&&t.add(a);let s=Z(i);if(s==="object")for(let[l,c]of Object.entries(i))r([...n,l],c);else if(s==="object-array"||s==="scalar-array"){let l=[...n,"*"],c=l.map(d=>typeof d=="number"?"*":d).join(".");if(t.add(c),s==="object-array"){let d=i[1];if(d&&typeof d=="object"&&!Array.isArray(d))for(let[m,h]of Object.entries(d))r([...l,m],h)}}}}function $r(e){Lr(e)}var L={isOpen:!1,ctx:null,shell:null,opts:null};function qr(e,t){if(L.ctx!==e)return;let r=t==="livesync";t==="livesync"&&L.shell?.restoreChrome?.(),Ze(e,{ignoreActiveValue:r})}var Dr=!1;function Pi(){if(Dr)return;let e=typeof window<"u"&&window.hyperclay&&window.hyperclay.onPrepareForSave||null;typeof e=="function"&&(e(t=>{let r=t&&t.querySelector&&t.querySelector("body");r&&r.classList.remove("hcms-open","hcms-overlay","hcms-side-left")}),Dr=!0)}function Br(e={}){if(L.isOpen){console.warn("cms.open() called while already open; ignoring");return}Pi();let t=e.pageRoot||(typeof document<"u"?document.body:null);if(!t)throw new Error("hypercms: no pageRoot available");let r=t.ownerDocument||(typeof document<"u"?document:null);if(!r)throw new Error("hypercms: no document available");let n=e.rules!==void 0?e.rules:"cms",i=q.findRules(r,n);if(!i){let m=typeof n=="string"?`data-rules-name~="${n}"`:"the provided rules object";throw new Error(`hypercms: no rules found for ${m}`)}let o=i.rules,a=i.tagNode;qe(r),Pe(r,o),Ir(r,o);let s=Ue(o,r),l=K(q.extract(t,o,{skip:"[data-hcms-shell]",templateAttr:"cms-template"}),o),c=Je(()=>jr({mountTo:e.mountTo||r.body,side:e.side||"right",overlay:!!e.overlay,showSaveButton:!!e.showSaveButton,title:e.title,eyebrow:e.eyebrow,theme:e.theme,doc:r})),d={doc:r,pageRoot:t,pageRules:o,formRules:s,rulesTagNode:a,rulesSource:n,formRoot:c.formRoot,shellRoot:c.root,errorEl:c.errorEl,lastFingerprint:null,lastData:null,observerHandle:null,undoUnsub:null,livesyncUnsub:null,onChange:e.onChange,onError:e.onError,confirmRemove:e.confirmRemove,previouslyFocused:r.activeElement,dispatch(m,h){let y=r.defaultView&&r.defaultView.CustomEvent||(typeof CustomEvent<"u"?CustomEvent:null);if(!y)return;let x=new y(m,{bubbles:!0,cancelable:m==="hcms:change",detail:h});c.root.dispatchEvent(x)},onCloseRequested(){Pr()}};d.updateFingerprint=()=>{d.lastFingerprint=Ae(D(d))};try{let m=ze({pageRules:o,formRules:s,data:l,doc:r});c.formRoot.appendChild(m),Mr(d),d.updateFingerprint(),d.observerHandle=Fr({onRefresh:()=>Ze(d)});let h=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;if(h&&typeof h.on=="function"){let x=()=>{if(L.ctx!==d)return;qr(d,"undo");let T=K(q.extract(d.pageRoot,d.pageRules,{skip:"[data-hcms-shell]",templateAttr:"cms-template"}),d.pageRules);Ae(T)!==Ae(d.lastData)&&(d.lastData=T,d.onChange?.(T,{path:"",structural:!1}))};h.on("undo",x),h.on("redo",x),d.undoUnsub=()=>{h.off("undo",x),h.off("redo",x)}}let y=()=>qr(d,"livesync");r.addEventListener("hyperclay:livesync-applied",y),d.livesyncUnsub=()=>r.removeEventListener("hyperclay:livesync-applied",y),Se.ctx=d,Ui(r),Hi(c.root),L.isOpen=!0,L.ctx=d,L.shell=c,L.opts=e,d.dispatch("hcms:open",{pageRoot:t})}catch(m){throw d.observerHandle?.unsubscribe?.(),d.undoUnsub?.(),d.livesyncUnsub?.(),d.detachEvents?.(),Se.ctx===d&&(Se.ctx=null),Je(()=>c.destroy()),L.isOpen=!1,L.ctx=null,L.shell=null,L.opts=null,m}}function Hi(e){let r=e.querySelector('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');r&&typeof r.focus=="function"&&r.focus()}var Se={ctx:null};function Ui(e){let t=e.defaultView||(typeof globalThis<"u"?globalThis:null);if(!t)return;let r=function(){let i=Se.ctx;if(i)return Tt(i.formRoot),ce("Reorder",()=>U(D(i),{path:"",structural:!0},i))};typeof t.hypercmsCommit!="function"&&(t.hypercmsCommit=r),typeof globalThis<"u"&&typeof globalThis.hypercmsCommit!="function"&&(globalThis.hypercmsCommit=r)}var Nt="cms";function zi(e){let t=typeof e=="string"?e:"",r=t.indexOf("?"),n=r===-1?t:t.slice(r+1);if(!n)return t;let i=new URLSearchParams(n);return i.get(Nt)!=="true"?t:(i.set(Nt,"false"),"?"+i.toString())}function Wi(e){let t=typeof e=="string"?e:"",r=t.indexOf("?"),n=r===-1?t:t.slice(r+1);return n?new URLSearchParams(n).get(Nt)==="true":!1}function Vi(){if(typeof window>"u"||!window.location||!window.history||typeof window.history.replaceState!="function")return;let e=window.location.search,t=zi(e);t!==e&&window.history.replaceState(window.history.state,"",t+window.location.hash)}function Pr(){if(!L.isOpen)return;let{ctx:e,shell:t}=L;e.closed=!0;let r=e.previouslyFocused;if(e.dispatch("hcms:close",null),Vi(),e.observerHandle?.unsubscribe?.(),e.undoUnsub?.(),e.livesyncUnsub?.(),e.detachEvents?.(),Je(()=>t.destroy()),L.isOpen=!1,L.ctx=null,L.shell=null,L.opts=null,Se.ctx=null,r&&typeof r.focus=="function")try{r.focus()}catch{}}function Hr(){L.isOpen&&Ze(L.ctx)}var Ki={getData(){return L.isOpen?D(L.ctx):null},setValue(e,t){if(!L.isOpen)throw new Error("hypercms: cms is not open");let r=L.ctx,n=W(e),i=X(r.pageRules,n);if(i===void 0)throw new Error(`hypercms: no rule at path "${e}"`);if(typeof i!="string"||i.endsWith("[]"))throw new Error(`hypercms: setValue requires a leaf scalar path; "${e}" is not a leaf`);let o=Gi(r.formRoot,e);if(!o)throw new Error(`hypercms: no field element at path "${e}"`);Yi(o,t,r.formRoot,e),U(D(r),{path:e,structural:!1},r)},addItem(e){if(!L.isOpen)throw new Error("hypercms: cms is not open");Ct(e,L.ctx)},removeItem(e){if(!L.isOpen)throw new Error("hypercms: cms is not open");let t=L.ctx,r=W(e);if(typeof r[r.length-1]!="number")throw new Error(`hypercms: removeItem requires an item path; "${e}" is not an array index`);let i=X(t.pageRules,r.slice(0,-1));if(!(Array.isArray(i)||typeof i=="string"&&i.endsWith("[]")))throw new Error(`hypercms: removeItem requires an item path; parent of "${e}" is not an array`);let a=t.formRoot.querySelector(`[data-hcms-path="${It(e)}"]`);if(!a)throw new Error(`hypercms: no element at path "${e}"`);le(a,t)},refresh:Hr,_commit(){if(!L.isOpen)return;let e=L.ctx;return Tt(e.formRoot),ce("Update",()=>U(D(e),{path:"",structural:!0},e))}};function Gi(e,t){let r=It(t),n=`[data-hcms-path="${r}"] input[data-hcms-field], [data-hcms-path="${r}"] textarea[data-hcms-field], [data-hcms-path="${r}"] select[data-hcms-field], [data-hcms-path="${r}"] img[data-hcms-field], [data-hcms-path="${r}"] a[data-hcms-field], [data-hcms-path="${r}"] [contenteditable][data-hcms-field], input[data-hcms-path="${r}"][data-hcms-field], textarea[data-hcms-path="${r}"][data-hcms-field], select[data-hcms-path="${r}"][data-hcms-field], img[data-hcms-path="${r}"][data-hcms-field], a[data-hcms-path="${r}"][data-hcms-field], [contenteditable][data-hcms-path="${r}"][data-hcms-field]`;return e.querySelector(n)}function Yi(e,t,r,n){let i=(e.tagName||"").toUpperCase(),o=(e.getAttribute("type")||"").toLowerCase();if(i==="INPUT"&&o==="checkbox"){e.checked=t===!0||t==="true";return}if(i==="INPUT"&&o==="radio"){let a=It(n),s=r.querySelectorAll(`[data-hcms-path="${a}"][data-hcms-field][type="radio"], [data-hcms-path="${a}"] [data-hcms-field][type="radio"]`);s.length?s.forEach(l=>{l.checked=String(l.value)===String(t??"")}):e.checked=String(e.value)===String(t??"");return}if(i==="IMG"){e.src=t==null?"":String(t);return}if(i==="A"){e.href=t==null?"":String(t);return}if("value"in e){e.value=t==null?"":String(t);return}e.textContent=t==null?"":String(t)}var Ji=250,Xi=1e4;function Zi(){typeof window>"u"||typeof document>"u"||Wi(window.location?window.location.search:"")&&(L.isOpen||Qi(()=>{if(!L.isOpen)try{Br()}catch(e){console.warn("hypercms: auto-open failed",e)}}))}function jt(){return!!document.body&&!!(window.hyperclay&&window.hyperclay.Mutation)}function Qi(e){if(jt()){queueMicrotask(e);return}let t=Date.now()+Xi,r=!1,n=null,i=()=>{r||(r=!0,n!==null&&clearInterval(n),document.removeEventListener("hyperclay:mutation-ready",o))};function o(){if(L.isOpen){i();return}jt()&&(i(),e())}document.addEventListener("hyperclay:mutation-ready",o,{once:!0}),n=setInterval(()=>{if(L.isOpen){i();return}if(jt()){i(),e();return}Date.now()>=t&&(i(),console.warn("hypercms: ?cms=true auto-open gave up \u2014 window.hyperclay.Mutation never appeared. Load hyperclayjs (or the mutation utility) so the CMS can initialize."))},Ji)}Zi();var Ft={open:Br,close:Pr,refresh:Hr,api:Ki,get isOpen(){return L.isOpen},path:vt,scaffold:ye,morphForm:Ne};function It(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var Ur=`/* GENERATED by scripts/build-theme.js from mirk-interface/mirk.css \u2014 DO NOT EDIT.
   Source of truth: mirk-interface/mirk.css + src/theme/pixel-quiet.overrides.css.
   Regenerate with: npm run build:theme */

/* ===== mirk-interface@2.2.0, scoped to .hcms-shell ===== */
/*
 * mirk.css \u2014 the mirk UI kit, v2.
 * Hand-written, no build. Fourteen form components as semantic BEM classes in
 * @layer components, so utilities (Tailwind or your own) always override them
 * with zero !important. Renders fully standalone; Tailwind is optional.
 *
 * Two hinges (see mirk-ui-guide.md):
 *   1. Components live in @layer components \u2192 utilities win.
 *   2. State serializes into the DOM (native attrs, :has(), inline --mirk-value)
 *      so document.documentElement.outerHTML round-trips every visible state.
 *
 * This @layer statement makes the file self-sufficient without Tailwind, and
 * merges into Tailwind's own order (@layer theme, base, components, utilities)
 * when present.
 */
@layer base, components;

@layer base {
  /* Components are authored border-box (a 2px bevel must not grow the box). */
  .hcms-shell *, .hcms-shell *::before, .hcms-shell *::after { box-sizing: border-box; }
  .hcms-shell button, .hcms-shell input, .hcms-shell optgroup, .hcms-shell select, .hcms-shell textarea { margin: 0; }

  @font-face {
    font-family: 'Departure Mono';
    src: url('https://cdn.jsdelivr.net/npm/mirk-interface@2.2.0/fonts/DepartureMono-1.500/DepartureMono-Regular.woff2') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
  }

  .hcms-shell { font-family: 'Departure Mono', ui-monospace, "Menlo", monospace; }
  /* Preflight sets these to ui-monospace; keep them in Departure Mono. */
  .hcms-shell pre, .hcms-shell code, .hcms-shell kbd, .hcms-shell samp { font-family: inherit; }

  /* 28 tokens, one value each. light-dark() picks the side from color-scheme. */
  .hcms-shell {
    color-scheme: light dark;                 /* default: follow the OS */

    --mirk-canvas:        light-dark(#F7F2EA, #0B0C13);
    --mirk-bg:            light-dark(#F7F2EA, #1D1F2F);
    --mirk-fg:            light-dark(#15120e, #F6F7F9);
    --mirk-accent:        light-dark(#efefe5, #232639);
    --mirk-destructive:   light-dark(#d4183d, #ff5566);
    --mirk-focus-color:   light-dark(#BBA288, #5A607F);
    --mirk-bevel-bg:      light-dark(#e9d3bd, #1D1F2F);
    --mirk-bevel-fg:      light-dark(#15120e, #F6F7F9);
    --mirk-bevel-tl:      light-dark(#f3ddc7, #474C65);
    --mirk-bevel-br:      light-dark(#c2ad95, #131725);
    --mirk-bevel-hover-bg: light-dark(#dfc9b3, #232639);
    --mirk-pill-inner-top: light-dark(#efdac7, #232639);
    --mirk-input-border:  light-dark(#957E65, #6E738E);
    --mirk-placeholder-color: light-dark(#7F7366, #545973);
    --mirk-ctrl-bg:       light-dark(#8C7660, #5F6582);
    --mirk-toggle-bg:     light-dark(#DFC9AF, #656D95);
    --mirk-toggle-hi:     light-dark(#E9D6C3, #7F87AD);
    --mirk-toggle-lo:     light-dark(#C7A88A, #505677);
    --mirk-mark-fg:       light-dark(#3F3225, #E1E3EA);
    --mirk-sortable-dot:  light-dark(#e2c5a6, #393f5b);
    --mirk-sortable-shadow:    light-dark(#c7a47f, #111527);
    --mirk-sortable-label:     light-dark(#231e18, #edeef2);
    --mirk-sortable-placeholder: light-dark(#99826c, #6f7695);
    --mirk-slider-fill:   light-dark(#e9d3bd, #232639);
    --mirk-slider-nub-bg: light-dark(#DFC9AF, #656D95);
    --mirk-slider-nub-hi: light-dark(#E9D6C3, #7F87AD);
    --mirk-slider-nub-lo: light-dark(#C7A88A, #505677);

    --mirk-radius: 5px;                        /* the "rounded" corner */
    --mirk-focus-offset: 2px;                  /* non-color \u2192 can't ride light-dark() */

    background: var(--mirk-canvas);
    color: var(--mirk-fg);
  }

  /* The one non-color token with a real light/dark split (was 2px / 3px). */
  @media (prefers-color-scheme: dark) { .hcms-shell { --mirk-focus-offset: 3px; } }

  /* Force a mode on any subtree with one attribute (class aliases for hosts that
     prefer class-based theming and Tailwind's dark-variant convention). Each also
     paints its own canvas so a wrapper visibly flips. */
  .hcms-shell[data-theme="light"], .hcms-shell.light {
    color-scheme: light; --mirk-focus-offset: 2px;
    background: var(--mirk-canvas); color: var(--mirk-fg);
  }
  .hcms-shell[data-theme="dark"], .hcms-shell.dark {
    color-scheme: dark; --mirk-focus-offset: 3px;
    background: var(--mirk-canvas); color: var(--mirk-fg);
  }

  /* Built-in brand variant \u2014 "Pixel Quiet": mirk's warm soul with the volume
     down. A softened, near-equal bevel, warmer ink, terracotta destructive, a
     deeper navy-black dark. Authored with light-dark() like :root, so it follows
     the OS and still flips with .dark / .light. Opt in: data-theme="pixel-quiet".
     Sits after :root (equal specificity, source order wins). --mirk-radius /
     --mirk-focus-offset are inherited unchanged; --mirk-ctrl-bg is unused. */
  .hcms-shell[data-theme="pixel-quiet"] {
    --mirk-fg:            light-dark(#2B241B, #ECEAF2);
    --mirk-bg:            light-dark(#F7F2EA, #11131E);
    --mirk-canvas:        light-dark(#F7F2EA, #0B0C13);
    --mirk-accent:        light-dark(#efefe5, #1D1F2F);
    --mirk-destructive:   light-dark(#C24A3A, #ff5566);
    --mirk-focus-color:   light-dark(#C7AE93, #4A506B);
    --mirk-bevel-bg:      light-dark(#FCF8F1, #1A1D2C);
    --mirk-bevel-fg:      light-dark(#2B241B, #ECEAF2);
    --mirk-bevel-tl:      light-dark(#F0E7D8, #2A2E42);
    --mirk-bevel-br:      light-dark(#E2D4BF, #14182A);
    --mirk-bevel-hover-bg: light-dark(#F4ECDF, #202436);
    --mirk-pill-inner-top: light-dark(#FBF6EE, #202436);
    --mirk-input-border:  light-dark(#D8C8AF, #353B52);
    --mirk-placeholder-color: light-dark(#A8987F, #6A7090);
    --mirk-mark-fg:       light-dark(#6B5942, #C9CDE0);
    --mirk-toggle-bg:     light-dark(#EFDBBD, #3E4660);
    --mirk-toggle-hi:     light-dark(#F4EADA, #4E567A);
    --mirk-toggle-lo:     light-dark(#C2A87E, #262B42);
    --mirk-sortable-dot:  light-dark(#DDCBB0, #353B52);
    --mirk-sortable-shadow:    light-dark(#C9B493, #0E1120);
    --mirk-sortable-label:     light-dark(#8C7B62, #8A90AB);
    --mirk-sortable-placeholder: light-dark(#A8987F, #6A7090);
    /* slider nub reuses the toggle family (identical pairing in :root); the fill
       is the one value with no CMS precedent \u2014 a soft warm / muted navy track. */
    --mirk-slider-fill:   light-dark(#F2E0BD, #2A2E42);
    --mirk-slider-nub-bg: light-dark(#EFDBBD, #3E4660);
    --mirk-slider-nub-hi: light-dark(#F4EADA, #4E567A);
    --mirk-slider-nub-lo: light-dark(#C2A87E, #262B42);
  }

  /* Roll your own the same way \u2014 an explicit [data-theme] block is the escape hatch:
     [data-theme="sunset"] { color-scheme: light; --mirk-accent: #f0a868; \u2026 } */
}

@layer components {
  /* Visually hidden, still focusable/announced. The hidden native input behind
     every custom control relies on it; Tailwind is optional now. */
  .hcms-shell .mirk-sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
  }

  /* ============================ BUTTON ============================ */
  .hcms-shell .mirk-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    font: inherit; line-height: 1.5; cursor: pointer; user-select: none;
    text-align: center;
    color: var(--mirk-bevel-fg);
    background: var(--mirk-bevel-bg);
    border: 2px solid;
    /* Raised bevel: light top+left, dark right+bottom. Shorthand is T R B L. */
    border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
    padding: 4px 14px 5px;                     /* medium */
    outline: none;
  }
  .hcms-shell .mirk-button__label { white-space: nowrap; user-select: none; display: inline-block; }

  /* States, written once, shared by every size and shape. */
  .hcms-shell .mirk-button:hover { background-color: var(--mirk-bevel-hover-bg); }
  .hcms-shell .mirk-button:active {
    border-color: var(--mirk-bevel-br) var(--mirk-bevel-tl) var(--mirk-bevel-tl) var(--mirk-bevel-br);
  }
  .hcms-shell .mirk-button:not(.mirk-button--round):active .mirk-button__label { translate: 1.5px 1.5px; }
  /* Direct focus (a real <button>) or a focus-visible descendant (a <label>
     wrapping a hidden input, as the file/image upload triggers do). */
  .hcms-shell .mirk-button:focus-visible, .hcms-shell .mirk-button:has(:focus-visible) {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-button:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Sizes set padding + font (rect); round re-homes padding to the label below. */
  .hcms-shell .mirk-button--small { padding: 3px 12px; font-size: 14px; }
  .hcms-shell .mirk-button--large { padding: 4px 17px 7px; font-size: 18px; border-width: 3px; }

  /* Round register: a gradient pill frame with the label as the inner fill. */
  .hcms-shell .mirk-button--round {
    border: none; padding: 2px; border-radius: 14px;
    background-color: var(--mirk-canvas);
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-br), var(--mirk-bevel-tl));
    opacity: 0.9; transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hcms-shell .mirk-button--round:hover { opacity: 1; }
  .hcms-shell .mirk-button--round:active {
    background-image: linear-gradient(to bottom in oklab, var(--mirk-bevel-br), var(--mirk-bevel-tl));
  }
  .hcms-shell .mirk-button--round .mirk-button__label {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 4px 17px 6px; border-radius: 12px;
    color: var(--mirk-bevel-fg);
    background-color: var(--mirk-bevel-bg);
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-bg), var(--mirk-pill-inner-top));
  }
  .hcms-shell .mirk-button--round.mirk-button--small { border-radius: 12px; }
  .hcms-shell .mirk-button--round.mirk-button--small .mirk-button__label { padding: 2px 14px; border-radius: 10px; }
  .hcms-shell .mirk-button--round.mirk-button--large { border-radius: 16px; }
  .hcms-shell .mirk-button--round.mirk-button--large .mirk-button__label { padding: 7px 24px 9px; border-radius: 14px; }

  /* ============================ TEXT INPUT ============================ */
  .hcms-shell .mirk-input {
    width: 100%;
    background: var(--mirk-bevel-bg); color: var(--mirk-bevel-fg);
    border: 1px solid var(--mirk-input-border);
    padding: 5px 14px 6px;                     /* medium */
    font: inherit; line-height: 1.5; border-radius: 0; outline: none;
  }
  .hcms-shell .mirk-input::placeholder { color: var(--mirk-placeholder-color); }
  .hcms-shell .mirk-input:focus-visible {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-input--small { padding: 4px 12px; font-size: 14px; }
  .hcms-shell .mirk-input--large { padding: 6px 17px 9px; font-size: 18px; }
  .hcms-shell .mirk-input--rounded { border-radius: var(--mirk-radius); }

  /* ============================ TEXTAREA ============================ */
  .hcms-shell .mirk-textarea {
    width: 100%;
    background: var(--mirk-bevel-bg); color: var(--mirk-bevel-fg);
    border: 1px solid var(--mirk-input-border);
    padding: 6px 17px 9px; font: inherit; font-size: 18px; line-height: 1.5;
    border-radius: 0; outline: none; resize: vertical;
  }
  .hcms-shell .mirk-textarea::placeholder { color: var(--mirk-placeholder-color); }
  .hcms-shell .mirk-textarea:focus-visible {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-textarea--rounded { border-radius: var(--mirk-radius); }

  /* ============================ NUMBER ============================ */
  .hcms-shell .mirk-number {
    display: flex; align-items: stretch; width: 100%;
    background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border); border-radius: 0;
  }
  .hcms-shell .mirk-number:has(:focus-visible) {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-number__input {
    flex: 1; min-width: 0; background: transparent; color: var(--mirk-bevel-fg);
    padding: 5px 10px 6px 14px;                /* medium */
    font: inherit; line-height: 1.5; outline: none;
    appearance: textfield; -webkit-appearance: textfield;
  }
  .hcms-shell .mirk-number__input::-webkit-outer-spin-button, .hcms-shell .mirk-number__input::-webkit-inner-spin-button { -webkit-appearance: none; appearance: none; }
  .hcms-shell .mirk-number__steps { display: flex; flex-direction: column; padding: 2px; gap: 2px; }
  .hcms-shell .mirk-number__step {
    flex: 1; cursor: pointer; line-height: 1; padding: 0 10px; font-size: 9px;  /* medium */
    display: flex; align-items: center; justify-content: center;
    background: var(--mirk-bevel-bg); outline: none;
    border: 2px solid;
    border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
  }
  .hcms-shell .mirk-number__step:hover { background: var(--mirk-bevel-hover-bg); }
  .hcms-shell .mirk-number__step:active {
    border-color: var(--mirk-bevel-br) var(--mirk-bevel-tl) var(--mirk-bevel-tl) var(--mirk-bevel-br);
  }
  .hcms-shell .mirk-number__step:focus-visible { outline: 1px solid var(--mirk-focus-color); outline-offset: 1px; }

  .hcms-shell .mirk-number--small .mirk-number__input { padding: 4px 8px 4px 12px; font-size: 14px; }
  .hcms-shell .mirk-number--small .mirk-number__step { padding: 0 8px; font-size: 8px; }
  .hcms-shell .mirk-number--large .mirk-number__input { padding: 6px 12px 9px 17px; font-size: 18px; }
  .hcms-shell .mirk-number--large .mirk-number__step { padding: 0 12px; font-size: 10px; }

  .hcms-shell .mirk-number--rounded { border-radius: var(--mirk-radius); }
  .hcms-shell .mirk-number--rounded .mirk-number__step { border-radius: 3px; }

  /* ============================ SELECT / DROPDOWN ============================ */
  /* Keeps appearance:none + a real chevron (renders identically everywhere today);
     base-select/::picker is a future enhancement. */
  .hcms-shell .mirk-select { position: relative; }
  .hcms-shell .mirk-select__field {
    width: 100%; appearance: none; -webkit-appearance: none;
    background: var(--mirk-bevel-bg); color: var(--mirk-bevel-fg);
    border: 2px solid;
    border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
    padding: 4px 40px 5px 14px;                /* medium */
    font: inherit; line-height: 1.5; border-radius: 0; outline: none;
  }
  .hcms-shell .mirk-select__field:focus-visible {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-select__chevron {
    pointer-events: none; position: absolute; top: 50%; right: 14px;  /* medium */
    translate: 0 -50%; rotate: 90deg; display: inline-block; line-height: 1; font-size: 20px;
  }
  .hcms-shell .mirk-select--small .mirk-select__field { padding: 3px 36px 3px 12px; font-size: 14px; }
  .hcms-shell .mirk-select--small .mirk-select__chevron { right: 12px; font-size: 18px; }
  .hcms-shell .mirk-select--large .mirk-select__field { padding: 4px 48px 7px 17px; font-size: 18px; border-width: 3px; }
  .hcms-shell .mirk-select--large .mirk-select__chevron { right: 16px; font-size: 24px; }

  /* Round: gradient pill frame around a borderless, pill-filled select. */
  .hcms-shell .mirk-select--round .mirk-select__frame {
    padding: 2px; border-radius: 14px;         /* medium */
    background-color: var(--mirk-canvas);
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-br), var(--mirk-bevel-tl));
  }
  .hcms-shell .mirk-select--round .mirk-select__frame:has(:focus-visible) {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-select--round .mirk-select__field {
    border: none; background-color: transparent;
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-bg), var(--mirk-pill-inner-top));
    border-radius: 12px; padding: 4px 40px 6px 17px;   /* medium */
  }
  .hcms-shell .mirk-select--round.mirk-select--small .mirk-select__frame { border-radius: 12px; }
  .hcms-shell .mirk-select--round.mirk-select--small .mirk-select__field { border-radius: 10px; padding: 2px 36px 2px 14px; }
  .hcms-shell .mirk-select--round.mirk-select--large .mirk-select__frame { border-radius: 16px; }
  .hcms-shell .mirk-select--round.mirk-select--large .mirk-select__field { border-radius: 14px; padding: 7px 48px 9px 24px; }
  .hcms-shell .mirk-select--round.mirk-select--large .mirk-select__chevron { right: 16px; font-size: 24px; }

  /* ============================ CHECKBOX ============================ */
  .hcms-shell .mirk-checkbox { display: inline-flex; align-items: center; gap: 0.75rem; cursor: pointer; width: fit-content; }
  .hcms-shell .mirk-checkbox__box {
    position: relative; flex-shrink: 0; width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center; border-radius: 0;
    background: var(--mirk-bevel-bg);
    border: 2px solid;
    border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
  }
  .hcms-shell .mirk-checkbox__mark {
    opacity: 0; display: block; width: 6px; height: 12px;
    border-right: 2.5px solid var(--mirk-mark-fg); border-bottom: 2.5px solid var(--mirk-mark-fg);
    rotate: 45deg; translate: 0.5px -1.5px;
  }
  .hcms-shell .mirk-checkbox__label { font-size: 18px; line-height: 1.5; }

  .hcms-shell .mirk-checkbox:has(:checked) .mirk-checkbox__box { border-color: var(--mirk-input-border); }
  .hcms-shell .mirk-checkbox:has(:checked) .mirk-checkbox__mark { opacity: 1; }
  .hcms-shell .mirk-checkbox:has(:focus-visible) .mirk-checkbox__box {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }

  .hcms-shell .mirk-checkbox--small { gap: 0.5rem; }
  .hcms-shell .mirk-checkbox--small .mirk-checkbox__box { width: 18px; height: 18px; }
  .hcms-shell .mirk-checkbox--small .mirk-checkbox__mark {
    width: 5px; height: 10px;
    border-right-width: 2px; border-bottom-width: 2px; translate: 0.5px -1px;
  }
  .hcms-shell .mirk-checkbox--small .mirk-checkbox__label { font-size: 14px; }

  /* ============================ RADIO ============================ */
  .hcms-shell .mirk-radio { display: inline-flex; align-items: center; gap: 0.75rem; cursor: pointer; width: fit-content; }
  .hcms-shell .mirk-radio__ring {
    position: relative; flex-shrink: 0; width: 25px; height: 25px; border-radius: 9999px;
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-br), var(--mirk-bevel-tl));
  }
  .hcms-shell .mirk-radio__fill {
    display: block; position: absolute; inset: 2px; border-radius: 9999px;
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-bg), var(--mirk-pill-inner-top));
  }
  .hcms-shell .mirk-radio__dot {
    display: none; position: absolute; top: 50%; left: 50%; translate: -50% -50%;
    width: 9px; height: 9px; border-radius: 9999px; background: var(--mirk-mark-fg);
  }
  .hcms-shell .mirk-radio__label { font-size: 18px; line-height: 1.5; }

  .hcms-shell .mirk-radio:has(:checked) .mirk-radio__ring {
    background-image: none; background-color: var(--mirk-bevel-bg);
    border: 2px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-radio:has(:checked) .mirk-radio__fill { display: none; }
  .hcms-shell .mirk-radio:has(:checked) .mirk-radio__dot { display: block; }
  .hcms-shell .mirk-radio:has(:focus-visible) .mirk-radio__ring {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }

  .hcms-shell .mirk-radio--small { gap: 0.5rem; }
  .hcms-shell .mirk-radio--small .mirk-radio__ring { width: 20px; height: 20px; }
  .hcms-shell .mirk-radio--small .mirk-radio__dot { width: 7px; height: 7px; }
  .hcms-shell .mirk-radio--small .mirk-radio__label { font-size: 14px; }

  /* ============================ TOGGLE ============================ */
  .hcms-shell .mirk-toggle { display: inline-flex; align-items: center; gap: 0.75rem; cursor: pointer; width: fit-content; }
  .hcms-shell .mirk-toggle__track {
    position: relative; flex-shrink: 0; width: 49px; height: 27px; border-radius: 0;
    border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-toggle__thumb {
    position: absolute; top: 3px; left: 3px; width: 19px; height: 19px;
    background-color: var(--mirk-toggle-bg);
    border: 2px solid;
    border-color: var(--mirk-toggle-hi) var(--mirk-toggle-lo) var(--mirk-toggle-lo) var(--mirk-toggle-hi);
    transition-property: transform, translate, scale, rotate;
    transition-duration: 0.15s; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hcms-shell .mirk-toggle__label { font-size: 18px; line-height: 1.5; }

  .hcms-shell .mirk-toggle:has(:checked) .mirk-toggle__thumb { translate: 22px; }
  .hcms-shell .mirk-toggle:has(:focus-visible) .mirk-toggle__track {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }

  .hcms-shell .mirk-toggle--round .mirk-toggle__track { width: 50px; height: 29px; border-radius: 9999px; }
  .hcms-shell .mirk-toggle--round .mirk-toggle__thumb {
    width: 21px; height: 21px; border: none; border-radius: 9999px;
    background-color: transparent;
    background-image: linear-gradient(to top in oklab, var(--mirk-toggle-lo), var(--mirk-toggle-hi));
  }
  .hcms-shell .mirk-toggle--round .mirk-toggle__thumb::after {
    content: ""; position: absolute; inset: 2px; border-radius: 9999px; background: var(--mirk-toggle-bg);
  }
  .hcms-shell .mirk-toggle--round:has(:checked) .mirk-toggle__thumb { translate: 21px; }

  .hcms-shell .mirk-toggle--small { gap: 0.5rem; }
  .hcms-shell .mirk-toggle--small .mirk-toggle__track { width: 42px; height: 23px; }
  .hcms-shell .mirk-toggle--small .mirk-toggle__thumb { top: 2px; left: 2px; width: 17px; height: 17px; }
  .hcms-shell .mirk-toggle--small:has(:checked) .mirk-toggle__thumb { translate: 19px; }
  .hcms-shell .mirk-toggle--small .mirk-toggle__label { font-size: 14px; }
  .hcms-shell .mirk-toggle--round.mirk-toggle--small .mirk-toggle__track { width: 43px; height: 25px; }
  .hcms-shell .mirk-toggle--round.mirk-toggle--small .mirk-toggle__thumb { width: 19px; height: 19px; }
  .hcms-shell .mirk-toggle--round.mirk-toggle--small:has(:checked) .mirk-toggle__thumb { translate: 18px; }

  /* ============================ SLIDER ============================ */
  .hcms-shell .mirk-slider { position: relative; height: 32px; width: 100%; --mirk-value: 0%; }
  .hcms-shell .mirk-slider__input {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; z-index: 10;
  }
  .hcms-shell .mirk-slider__track {
    position: absolute; left: 0; right: 0; top: 50%; translate: 0 -50%; height: 12px;
    background: var(--mirk-canvas); border: 1px solid var(--mirk-input-border); overflow: hidden;
  }
  .hcms-shell .mirk-slider__fill { height: 100%; width: var(--mirk-value); background: var(--mirk-slider-fill); }
  .hcms-shell .mirk-slider__nub {
    position: absolute; top: 50%; left: var(--mirk-value); translate: -50% -50%;
    width: 21px; height: 21px; pointer-events: none;
    background-color: var(--mirk-slider-nub-bg);
    border: 2px solid;
    border-color: var(--mirk-slider-nub-hi) var(--mirk-slider-nub-lo) var(--mirk-slider-nub-lo) var(--mirk-slider-nub-hi);
  }
  .hcms-shell .mirk-slider__input:focus-visible ~ .mirk-slider__nub {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }

  .hcms-shell .mirk-slider--round .mirk-slider__track { height: 10px; border-radius: 9999px; }
  .hcms-shell .mirk-slider--round .mirk-slider__nub {
    width: 24px; height: 24px; border: none; border-radius: 9999px;
    background-color: transparent;
    background-image: linear-gradient(to top in oklab, var(--mirk-slider-nub-lo), var(--mirk-slider-nub-hi));
  }
  .hcms-shell .mirk-slider--round .mirk-slider__nub::after {
    content: ""; position: absolute; inset: 2px; border-radius: 9999px; background: var(--mirk-slider-nub-bg);
  }

  .hcms-shell .mirk-slider--small { height: 24px; }
  .hcms-shell .mirk-slider--small .mirk-slider__track { height: 8px; }
  .hcms-shell .mirk-slider--small .mirk-slider__nub { width: 16px; height: 16px; }
  .hcms-shell .mirk-slider--round.mirk-slider--small .mirk-slider__track { height: 7px; }
  .hcms-shell .mirk-slider--round.mirk-slider--small .mirk-slider__nub { width: 18px; height: 18px; }

  /* ============================ DATE ============================ */
  .hcms-shell .mirk-date { position: relative; }
  .hcms-shell .mirk-date__field {
    width: 100%; background: var(--mirk-bevel-bg); color: var(--mirk-bevel-fg);
    border: 1px solid var(--mirk-input-border);
    padding: 6px 44px 9px 17px; font: inherit; font-size: 18px; line-height: 1.5;
    border-radius: 0; outline: none;
  }
  .hcms-shell .mirk-date__field:focus-visible {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-date__field::-webkit-calendar-picker-indicator {
    opacity: 0; position: absolute; right: 0; top: 0; bottom: 0; width: 44px; margin: 0; cursor: pointer;
  }
  .hcms-shell .mirk-date__field::-webkit-inner-spin-button { -webkit-appearance: none; appearance: none; }
  .hcms-shell .mirk-date__field::-webkit-clear-button { -webkit-appearance: none; appearance: none; }
  .hcms-shell .mirk-date__icon {
    pointer-events: none; position: absolute; right: 16px; top: 50%; translate: 0 -50%;
  }
  .hcms-shell .mirk-date--rounded .mirk-date__field { border-radius: var(--mirk-radius); }

  .hcms-shell .mirk-date--small .mirk-date__field { padding: 4px 36px 4px 12px; font-size: 14px; }
  .hcms-shell .mirk-date--small .mirk-date__field::-webkit-calendar-picker-indicator { width: 36px; }
  .hcms-shell .mirk-date--small .mirk-date__icon { right: 12px; }

  /* The native file/image inputs are visually hidden; their styled label drives
     them, and the focus ring rides :has(:focus-visible) on button or container. */
  .hcms-shell .mirk-file__input, .hcms-shell .mirk-image__input {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
  }

  /* ============================ FILE ============================ */
  .hcms-shell .mirk-file { display: flex; align-items: center; gap: 0.75rem; width: 100%; }
  .hcms-shell .mirk-file__name {
    color: var(--mirk-placeholder-color); font-size: 18px; line-height: 1.5;
    min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .hcms-shell .mirk-file__name[data-filled] { color: var(--mirk-bevel-fg); }

  /* Compact: a shared bordered container holds a smaller button + the name. */
  .hcms-shell .mirk-file--compact {
    padding: 4px 8px; background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border); border-radius: 0;
  }
  .hcms-shell .mirk-file--compact:has(:focus-visible) {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  /* The upload trigger is a .mirk-button; nudge it onto the container's left
     border so the bevel sits flush (covers compact and round-compact). */
  .hcms-shell .mirk-file--compact .mirk-button { margin-left: -1px; }
  .hcms-shell .mirk-file--compact .mirk-file__name { font-size: 16px; }
  .hcms-shell .mirk-file--compact.mirk-file--round { border-radius: 15px; }

  /* Filled: the name slot becomes a link to the chosen file, beside a circular \xD7
     to clear it: a 1px ring over a bevel fill that turns destructive on hover.
     Empty keeps the placeholder span. */
  .hcms-shell a.mirk-file__name { text-decoration: underline; text-underline-offset: 2px; }
  .hcms-shell .mirk-file__remove {
    appearance: none; -webkit-appearance: none; flex-shrink: 0;
    width: 18px; height: 18px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    margin: 0; padding: 0; cursor: pointer; line-height: 0;
    color: var(--mirk-bevel-fg); background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-file__remove svg { display: block; width: 66%; height: 66%; }
  .hcms-shell .mirk-file__remove:hover { border-color: var(--mirk-destructive); color: var(--mirk-destructive); }

  /* Small: tighter name + gap + remove \xD7; pair the trigger with mirk-button--small.
     Composes with --compact (densest) and --round. */
  .hcms-shell .mirk-file--small { gap: 0.5rem; }
  .hcms-shell .mirk-file--small .mirk-file__name { font-size: 14px; }
  .hcms-shell .mirk-file--small .mirk-file__remove { width: 16px; height: 16px; }
  .hcms-shell .mirk-file--small.mirk-file--compact { padding: 3px 8px; }
  .hcms-shell .mirk-file--small.mirk-file--compact .mirk-file__name { font-size: 13px; }

  /* ============================ IMAGE ============================ */
  .hcms-shell .mirk-image { display: flex; flex-direction: column; gap: 0.5rem; }
  .hcms-shell .mirk-image__frame {
    position: relative; width: 120px; height: 120px; overflow: hidden; border-radius: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--mirk-bevel-bg); border: 1px solid var(--mirk-input-border);
    color: var(--mirk-placeholder-color); font-size: 14px; line-height: 1.5;
  }
  .hcms-shell .mirk-image__preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .hcms-shell .mirk-image--rounded .mirk-image__frame { border-radius: var(--mirk-radius); }
  /* The upload trigger is a .mirk-button; keep it hugging its label instead of
     stretching to fill this column-flex container. */
  .hcms-shell .mirk-image .mirk-button { width: fit-content; }

  /* Compact: a focused 56px thumbnail upload. Empty shows a small upload button;
     once an image is chosen the button hides and a thumbnail + corner \xD7 takes its
     place. The frame clips the image (overflow hidden) while the thumb wrapper
     stays visible, so the \xD7 can sit just outside the corner without being cut. */
  .hcms-shell .mirk-image--compact { flex-direction: row; align-items: center; gap: 0; }
  .hcms-shell .mirk-image__thumb { position: relative; display: inline-block; width: fit-content; margin: 0; line-height: 0; }
  .hcms-shell .mirk-image--compact .mirk-image__frame {
    width: 56px; height: 56px; overflow: hidden; border-radius: 0;
    border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-image--compact.mirk-image--rounded .mirk-image__frame { border-radius: var(--mirk-radius); }
  .hcms-shell .mirk-image--compact .mirk-image__preview {
    position: static; inset: auto; width: 100%; height: 100%; display: block; object-fit: cover;
  }
  .hcms-shell .mirk-image__remove {
    position: absolute; top: -7px; right: -7px;
    width: 18px; height: 18px; border-radius: 50%; padding: 0;
    display: inline-flex; align-items: center; justify-content: center;
    appearance: none; -webkit-appearance: none; cursor: pointer; line-height: 0;
    color: var(--mirk-bevel-fg); background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-image__remove svg { display: block; width: 10px; height: 10px; }
  .hcms-shell .mirk-image__remove:hover { color: var(--mirk-destructive); border-color: var(--mirk-destructive); }

  /* ============================ TAGS ============================ */
  .hcms-shell .mirk-tags {
    display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; padding: 0.5rem;
    background: var(--mirk-bevel-bg); border: 1px solid var(--mirk-input-border);
    border-radius: 0; cursor: text;
  }
  .hcms-shell .mirk-tags:has(:focus-visible) {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-tags__chip {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 2px 8px 2px 12px; font-size: 14px; line-height: 1.5;
    color: var(--mirk-bevel-fg); background: var(--mirk-bevel-bg);
    border: 2px solid;
    border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
  }
  .hcms-shell .mirk-tags__remove {
    appearance: none; -webkit-appearance: none;
    margin: 0; padding: 0; border: 0; background: none; color: inherit;
    cursor: pointer; font-size: 14px; line-height: 1;
  }
  .hcms-shell .mirk-tags__remove:hover { color: var(--mirk-destructive); }
  .hcms-shell .mirk-tags__input {
    appearance: none; -webkit-appearance: none;
    border: 0; padding: 0;
    flex: 1; min-width: 120px; background: transparent; color: var(--mirk-bevel-fg);
    outline: none; font-size: 18px; line-height: 1.5;
  }
  .hcms-shell .mirk-tags__input::placeholder { color: var(--mirk-placeholder-color); }

  .hcms-shell .mirk-tags--round { border-radius: 15px; }
  .hcms-shell .mirk-tags--round .mirk-tags__chip {
    padding: 2px; border: none; border-radius: 12px;
    background-color: transparent;
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-br), var(--mirk-bevel-tl));
  }
  .hcms-shell .mirk-tags__chip-inner {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 1px 8px 1px 12px; border-radius: 10px;
    color: var(--mirk-bevel-fg); background-color: var(--mirk-bevel-bg);
    background-image: linear-gradient(to top in oklab, var(--mirk-bevel-bg), var(--mirk-pill-inner-top));
  }

  .hcms-shell .mirk-tags--small { gap: 0.375rem; padding: 0.375rem; }
  .hcms-shell .mirk-tags--small .mirk-tags__chip { padding: 1px 6px 1px 10px; font-size: 12px; }
  .hcms-shell .mirk-tags--small .mirk-tags__remove { font-size: 12px; }
  .hcms-shell .mirk-tags--small .mirk-tags__input { font-size: 14px; min-width: 90px; }
  .hcms-shell .mirk-tags--small.mirk-tags--round { border-radius: 12px; }
  .hcms-shell .mirk-tags--small.mirk-tags--round .mirk-tags__chip-inner { padding: 1px 6px 1px 10px; }

  /* ============================ SORTABLE ============================ */
  .hcms-shell .mirk-sortable { display: flex; flex-direction: column; gap: 0.5rem; }
  .hcms-shell .mirk-sortable__item {
    display: flex; flex-direction: row; width: 100%;
    background: var(--mirk-bevel-bg); border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-sortable__grip {
    width: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    cursor: grab; border-right: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-sortable__grip:active { cursor: grabbing; }
  .hcms-shell .mirk-sortable__dots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px; }
  .hcms-shell .mirk-sortable__dot {
    display: block; width: 4px; height: 4px; background: var(--mirk-sortable-dot);
    box-shadow: 1px 0 0 0 var(--mirk-sortable-shadow), 0 1px 0 0 var(--mirk-sortable-shadow), 1px 1px 0 0 var(--mirk-sortable-shadow);
  }
  .hcms-shell .mirk-sortable__body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
  .hcms-shell .mirk-sortable__row { padding: 8px 17px 9px; }
  .hcms-shell .mirk-sortable__row:not(:last-child) { border-bottom: 1px solid var(--mirk-input-border); }
  .hcms-shell .mirk-sortable__label {
    display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em;
    margin-bottom: 2px; color: var(--mirk-sortable-label);
  }
  .hcms-shell .mirk-sortable__field {
    width: 100%; background: transparent; color: var(--mirk-bevel-fg);
    font-size: 18px; line-height: 1.5; outline: none;
  }
  .hcms-shell .mirk-sortable__field::placeholder { color: var(--mirk-sortable-placeholder); }
  .hcms-shell .mirk-sortable__field:focus-visible {
    outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset);
  }
  .hcms-shell .mirk-sortable--small { gap: 0.375rem; }
  .hcms-shell .mirk-sortable--small .mirk-sortable__grip { width: 24px; }
  .hcms-shell .mirk-sortable--small .mirk-sortable__row { padding: 5px 13px 6px; }
  .hcms-shell .mirk-sortable--small .mirk-sortable__label { font-size: 10px; margin-bottom: 1px; }
  .hcms-shell .mirk-sortable--small .mirk-sortable__field { font-size: 14px; }
}

/* Respect the machine \u2014 outside @layer components so it always wins. */
@media (prefers-reduced-motion: reduce) {
  .hcms-shell .mirk-button--round, .hcms-shell .mirk-toggle__thumb { transition: none; }
  .hcms-shell .mirk-button:active .mirk-button__label { translate: none; }
}
@media (forced-colors: active) {
  .hcms-shell .mirk-button, .hcms-shell .mirk-select__field, .hcms-shell .mirk-checkbox__box, .hcms-shell .mirk-toggle__track { border: 1px solid ButtonText; }
}

/* ===== pixel-quiet overrides (hypercms-owned) ===== */
/* =====================================================================
   Pixel Quiet \u2014 hypercms theme overrides (hypercms-owned).

   Adapted from cms-sidebar/pixel-quiet/overrides.css. Two jobs:
     1. Retune --mirk-* tokens, scoped to .hcms-shell.pixel-quiet (never :root).
     2. Author the panel geometry + the functional chrome the static mockup
        doesn't have (error banner, add/remove/move controls, the engine's
        sortable cards, push / overlay / left-dock modes) on top of the
        .hcms-* structural hooks.

   This file is concatenated AFTER the scoped mirk base+components by
   scripts/build-theme.js, so plain rules here win over mirk's @layer
   components with zero !important. Loaded only inside .hcms-shell, so nothing
   here leaks onto the host page.
   ===================================================================== */

/* ============================================================
   TOKEN RETUNE \u2014 LIGHT (warm cream, gentle near-equal bevel)
   ============================================================ */
.hcms-shell.pixel-quiet {
  color-scheme: light;
  --mirk-canvas: #F7F2EA;
  --mirk-bg: #F7F2EA;
  --mirk-fg: #2B241B;
  --mirk-accent: #efefe5;
  --mirk-destructive: #C24A3A;
  --mirk-focus-color: #C7AE93;

  --mirk-bevel-bg: #FCF8F1;
  --mirk-bevel-fg: #2B241B;
  --mirk-bevel-tl: #F0E7D8;
  --mirk-bevel-br: #E2D4BF;
  --mirk-bevel-hover-bg: #F4ECDF;
  --mirk-pill-inner-top: #FBF6EE;
  --mirk-input-border: #D8C8AF;
  --mirk-placeholder-color: #A8987F;

  --mirk-mark-fg: #6B5942;
  --mirk-toggle-bg: #EFDBBD;
  --mirk-toggle-hi: #F4EADA;
  --mirk-toggle-lo: #C2A87E;
  --mirk-sortable-dot: #DDCBB0;
  --mirk-sortable-shadow: #C9B493;
  --mirk-sortable-label: #8C7B62;
  --mirk-sortable-placeholder: #A8987F;

  --mirk-radius: 5px;
  --mirk-focus-offset: 2px;
}

/* dark token deltas, shared by the explicit .dark opt-in and OS preference */
.hcms-shell.pixel-quiet.dark,
.hcms-shell.pixel-quiet[data-theme="dark"] {
  color-scheme: dark;
  --mirk-canvas: #0B0C13;
  --mirk-bg: #11131E;
  --mirk-fg: #ECEAF2;
  --mirk-accent: #1D1F2F;
  --mirk-focus-color: #4A506B;

  --mirk-bevel-bg: #1A1D2C;
  --mirk-bevel-fg: #ECEAF2;
  --mirk-bevel-tl: #2A2E42;
  --mirk-bevel-br: #14182A;
  --mirk-bevel-hover-bg: #202436;
  --mirk-pill-inner-top: #202436;
  --mirk-input-border: #353B52;
  --mirk-placeholder-color: #6A7090;

  --mirk-mark-fg: #C9CDE0;
  --mirk-toggle-bg: #3E4660;
  --mirk-toggle-hi: #4E567A;
  --mirk-toggle-lo: #262B42;
  --mirk-sortable-dot: #353B52;
  --mirk-sortable-shadow: #0E1120;
  --mirk-sortable-label: #8A90AB;
  --mirk-sortable-placeholder: #6A7090;
}

/* Auto-dark on OS preference, unless the shell pins light with .light */
@media (prefers-color-scheme: dark) {
  .hcms-shell.pixel-quiet:not(.light):not([data-theme="light"]) {
    color-scheme: dark;
    --mirk-canvas: #0B0C13;
    --mirk-bg: #11131E;
    --mirk-fg: #ECEAF2;
    --mirk-accent: #1D1F2F;
    --mirk-focus-color: #4A506B;

    --mirk-bevel-bg: #1A1D2C;
    --mirk-bevel-fg: #ECEAF2;
    --mirk-bevel-tl: #2A2E42;
    --mirk-bevel-br: #14182A;
    --mirk-bevel-hover-bg: #202436;
    --mirk-pill-inner-top: #202436;
    --mirk-input-border: #353B52;
    --mirk-placeholder-color: #6A7090;

    --mirk-mark-fg: #C9CDE0;
    --mirk-toggle-bg: #3E4660;
    --mirk-toggle-hi: #4E567A;
    --mirk-toggle-lo: #262B42;
    --mirk-sortable-dot: #353B52;
    --mirk-sortable-shadow: #0E1120;
    --mirk-sortable-label: #8A90AB;
    --mirk-sortable-placeholder: #6A7090;
  }
}

/* ============================================================
   SHELL GEOMETRY \u2014 fixed, docked panel, single column.
   position: fixed makes the shell a containing block so the absolute
   minibar anchors to it; flex column so the body owns the scroll.
   ============================================================ */
.hcms-shell.pixel-quiet {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  color: var(--mirk-fg);
  background: var(--mirk-bg);
  border-left: 1px solid var(--mirk-input-border);
  box-shadow: -16px 0 48px -28px rgba(43, 36, 27, 0.45);
}
.hcms-shell.pixel-quiet.dark {
  box-shadow: -16px 0 48px -28px rgba(0, 0, 0, 0.6);
}

.hcms-shell.pixel-quiet.hcms-side-left {
  right: auto;
  left: 0;
  border-left: 0;
  border-right: 1px solid var(--mirk-input-border);
  box-shadow: 16px 0 48px -28px rgba(43, 36, 27, 0.45);
}

/* Push the page over so docked content is never hidden underneath. */
body.hcms-open:not(.hcms-overlay) { padding-right: 380px; }
body.hcms-open.hcms-side-left:not(.hcms-overlay) { padding-right: 0; padding-left: 380px; }
body.hcms-open.hcms-overlay { overflow: hidden; }

@media (max-width: 799px) {
  .hcms-shell.pixel-quiet { width: 100vw; }
  body.hcms-open:not(.hcms-overlay),
  body.hcms-open.hcms-side-left:not(.hcms-overlay) { padding-right: 0; padding-left: 0; }
  body.hcms-open { overflow: hidden; }
}

/* ---------- SCROLL REGION \u2014 holds the (scrollable) header + form + save ---------- */
.hcms-shell-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ---------- CONDENSED MINIBAR \u2014 appears once the full header scrolls away ---------- */
.hcms-shell-minibar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 24px 10px;
  background: var(--mirk-bg);
  border-bottom: 1px solid var(--mirk-input-border);
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
  transition: opacity 140ms ease, transform 160ms ease;
}
.hcms-shell.is-condensed .hcms-shell-minibar {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
.hcms-shell-minibar-title {
  font-size: 14px;
  line-height: 1;
  color: var(--mirk-fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- HEADER (no underline rule \u2014 whitespace separates the bands) ---------- */
.hcms-shell-header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 24px 4px;
}
.hcms-shell-heading { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.hcms-shell-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--mirk-placeholder-color);
}
.hcms-shell-title {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--mirk-fg);
}
.hcms-shell-close.mirk-button {
  flex-shrink: 0;
  padding: 2px 9px 3px;
  line-height: 1;
}
.hcms-shell-close .mirk-button__label { font-size: 16px; }

/* ---------- FORM \u2014 generous, even vertical rhythm ---------- */
.hcms-form {
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 24px 24px 28px;
}

/* one labeled scalar field */
.hcms-field { display: flex; flex-direction: column; gap: 9px; }
.hcms-field--row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

/* themed field label */
.hcms-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--mirk-sortable-label);
}

/* comfortable control padding + readable size, in mirk's own mono */
.hcms-shell.pixel-quiet .mirk-input,
.hcms-shell.pixel-quiet .mirk-textarea {
  font-size: 15px;
  padding: 9px 14px 10px;
}
.hcms-shell.pixel-quiet textarea.mirk-input { min-height: 76px; resize: vertical; }
.hcms-shell.pixel-quiet .mirk-select__field {
  font-size: 15px;
  padding: 8px 40px 9px 14px;
}
.hcms-shell.pixel-quiet .mirk-radio__label,
.hcms-shell.pixel-quiet .mirk-toggle__label,
.hcms-shell.pixel-quiet .mirk-tags__input { font-size: 15px; }

/* inline radio row */
.hcms-radio-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }

/* chip-field (the @chips built-in): a borderless inline input that sizes to its
   text, so chips read like static chips but stay inline-editable. */
.hcms-shell .mirk-tags__chip { padding-right: 6px; }
.hcms-shell .hcms-chip-field {
  border: 0; background: transparent; color: inherit; font: inherit;
  outline: none; min-width: 2ch; field-sizing: content; padding: 0;
}
.hcms-shell .hcms-chips .hcms-add { margin-top: 4px; align-self: flex-start; }

/* ---------- OBJECT GROUP \u2014 a quiet framed band, not a heavy card ---------- */
.hcms-object {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.hcms-object-title {
  margin: 0;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--mirk-sortable-label);
}
.hcms-object-fields { display: flex; flex-direction: column; gap: 16px; }

/* ---------- SCALAR ARRAY \u2014 a calm list of mirk-input rows ---------- */
.hcms-array { display: flex; flex-direction: column; gap: 14px; }
.hcms-array-header { display: flex; align-items: baseline; justify-content: space-between; }
.hcms-array-title {
  margin: 0;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--mirk-sortable-label);
}
/* The generic stacked-list layout is unlayered, so it would beat mirk's
   @layer-components rules on any slot that is also a mirk component. Exempt a
   mirk tags box so it keeps mirk's own row-wrap layout and inner padding. */
.hcms-array-items:not(.mirk-tags) {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hcms-array-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hcms-array-item .mirk-input { flex: 1; min-width: 0; }

/* ---------- OBJECT ARRAY \u2014 mirk-sortable cards from the engine markup ---------- */
.hcms-array--cards .hcms-array-items { gap: 14px; }
.hcms-card.mirk-sortable__item { background: var(--mirk-bevel-bg); position: relative; }
.hcms-card .hcms-card-fields { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.hcms-card .hcms-field {
  gap: 2px;
  padding: 8px 14px 9px;
}
.hcms-card .hcms-field:not(:last-child) { border-bottom: 1px solid var(--mirk-input-border); }
.hcms-card .hcms-label { letter-spacing: 0.16em; }
/* fields inside a card read as quiet rows, not chunky boxed inputs */
.hcms-card .mirk-input,
.hcms-card .mirk-textarea {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 15px;
}
.hcms-card .mirk-input:focus-visible,
.hcms-card .mirk-textarea:focus-visible { outline: none; }
/* the remove \xD7 is pulled out to the card corner (below), so the controls row
   now only holds the sr-only move buttons \u2014 collapse it until one is focused. */
.hcms-card-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 0;
}

/* quiet \xD7 remove control, shared by scalar-array rows and object-array cards */
.hcms-remove {
  flex-shrink: 0;
  appearance: none;
  border: 0;
  background: none;
  color: var(--mirk-placeholder-color);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px 6px;
}
.hcms-remove:hover { color: var(--mirk-destructive); }
.hcms-remove[hidden] { display: none; }

/* object-array card: the delete control is a square corner button pinned
   top-right, carrying the card's own 1px border + a crisp-line \xD7 icon. */
.hcms-remove--card {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--mirk-input-border);
  background: var(--mirk-bevel-bg);
  color: var(--mirk-placeholder-color);
}
.hcms-remove--card:hover { border-color: var(--mirk-destructive); }
.hcms-remove--card .hcms-x { width: 64%; height: 64%; display: block; }

/* "+ Add" \u2014 quiet, pinned left */
.hcms-add.mirk-button { align-self: flex-start; }

/* ---------- UPLOAD COMPONENTS (@file / @image) ----------
   Built on the kit's mirk-file / mirk-image--compact chrome. The native picker
   is visually hidden but focusable (the mirk-button label is the visible
   trigger and rings via :has(:focus-visible)); it is NOT .mirk-*__input, so the
   vendored mirk runtime never handles it. The empty/filled chrome is driven by
   the bound leaf's value attribute (src/href) in CSS \u2014 no JS state to desync. */
.hcms-upload input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* @image: show the upload button until the bound <img> carries a real src. */
.hcms-upload--image .mirk-image__thumb { display: none; }
.hcms-upload--image:has(.mirk-image__preview[src]:not([src=""])) .mirk-image__upload { display: none; }
.hcms-upload--image:has(.mirk-image__preview[src]:not([src=""])) .mirk-image__thumb { display: inline-block; }

/* @file: reveal the clear \xD7 and the filename only once the bound <a> has href. */
.hcms-upload--file .hcms-upload-clear { display: none; }
.hcms-upload--file:has(a.mirk-file__name[href]:not([href=""])) .hcms-upload-clear { display: inline-flex; }
/* A filled filename uses the bright foreground (the kit's [data-filled] look),
   driven by the bound href so there's no JS attribute to keep in sync \u2014 the
   vendored runtime that would otherwise stamp data-filled is inert here. */
.hcms-upload--file:has(a.mirk-file__name[href]:not([href=""])) a.mirk-file__name {
  color: var(--mirk-bevel-fg);
}
.hcms-upload--file a.mirk-file__name:empty {
  text-decoration: none;
  cursor: default;
}
.hcms-upload--file a.mirk-file__name:empty::after {
  content: "No file chosen";
  color: var(--mirk-placeholder-color);
}

/* clear-\xD7 (vendored-inert; data-hcms-action, never .mirk-*__remove). Bare \xD7 for
   @file, a pinned corner badge for @image \u2014 mirroring .hcms-remove / --card. */
.hcms-upload-clear {
  flex-shrink: 0;
  appearance: none;
  border: 0;
  background: none;
  color: var(--mirk-placeholder-color);
  cursor: pointer;
  line-height: 0;
  padding: 2px 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.hcms-upload-clear:hover { color: var(--mirk-destructive); }
.hcms-upload-clear .hcms-x { display: block; width: 14px; height: 14px; }

.hcms-upload-clear--badge {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 18px;
  height: 18px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--mirk-input-border);
  background: var(--mirk-bevel-bg);
  color: var(--mirk-bevel-fg);
}
.hcms-upload-clear--badge:hover { color: var(--mirk-destructive); border-color: var(--mirk-destructive); }
.hcms-upload-clear--badge .hcms-x { width: 10px; height: 10px; }

/* ---------- ERROR BANNER + inline errors ---------- */
.hcms-shell-error,
.hcms-error {
  font-size: 12px;
  line-height: 1.45;
  color: var(--mirk-destructive);
  background: var(--mirk-bevel-bg);
  border: 1px solid var(--mirk-destructive);
  padding: 8px 12px;
}
.hcms-shell-error { margin: 0 24px; }
.hcms-error { margin-top: 6px; }
.hcms-shell-error[hidden],
.hcms-error[hidden] { display: none; }

/* ---------- SAVE (sits at the end of the scrolling form, not pinned) ---------- */
.hcms-shell-footer {
  display: flex;
  justify-content: flex-end;
  padding: 4px 24px 28px;
}
.hcms-shell-footer[hidden] { display: none; }

/* ---------- sr-only move buttons: hidden, visible on keyboard focus ---------- */
.hcms-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.hcms-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 2px 6px;
  margin: 0 2px;
  overflow: visible;
  clip: auto;
  white-space: normal;
  background: var(--mirk-bevel-bg);
  border: 1px solid var(--mirk-input-border);
  color: var(--mirk-fg);
  font-size: 12px;
  cursor: pointer;
}
.hcms-sr-only[hidden] { display: none; }
`;typeof window<"u"&&typeof document<"u"&&(function(){if(window.__mirk)return;window.__mirk=!0;let e='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4 12 12M12 4 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="square" fill="none"/></svg>';document.addEventListener("click",r=>{let n=r.target.closest(".mirk-number__step");if(!n)return;let i=n.closest(".mirk-number").querySelector("input[type=number]");i&&(n.dataset.step==="up"?i.stepUp():i.stepDown(),i.dispatchEvent(new Event("change",{bubbles:!0})))}),document.addEventListener("input",r=>{let n=r.target.closest(".mirk-slider__input");n&&n.closest(".mirk-slider").style.setProperty("--mirk-value",`${n.value}%`)}),document.addEventListener("change",r=>{let n=r.target.closest(".mirk-file__input");if(!n||!n.files.length)return;let i=n.closest(".mirk-file"),o=i.querySelector(".mirk-file__name");if(!o)return;let a=n.files[0],s=document.createElement("a");if(s.className="mirk-file__name",s.dataset.filled="",s.href=URL.createObjectURL(a),s.target="_blank",s.rel="noopener",s.textContent=a.name,o.replaceWith(s),!i.querySelector(".mirk-file__remove")){let l=document.createElement("button");l.type="button",l.className="mirk-file__remove",l.setAttribute("aria-label","Remove file"),l.innerHTML=e,s.after(l)}}),document.addEventListener("change",r=>{let n=r.target.closest(".mirk-image__input");if(!n||!n.files.length)return;let i=n.closest(".mirk-image"),o=i.querySelector(".mirk-image__preview");if(!o)return;let a=i.querySelector(".mirk-image__placeholder"),s=new FileReader;s.onload=l=>{o.src=l.target.result,o.removeAttribute("hidden"),a&&a.setAttribute("hidden",""),i.querySelector(".mirk-image__thumb")?.removeAttribute("hidden"),i.querySelector(".mirk-image__upload")?.setAttribute("hidden","")},s.readAsDataURL(n.files[0])}),document.addEventListener("click",r=>{let n=r.target.closest(".mirk-file__remove");if(n){let o=n.closest(".mirk-file"),a=o?.querySelector(".mirk-file__input"),s=o?.querySelector(".mirk-file__name");if(a&&(a.value=""),s){let l=document.createElement("span");l.className="mirk-file__name",l.textContent="No file chosen",s.replaceWith(l)}n.remove();return}let i=r.target.closest(".mirk-image__remove");if(i){let o=i.closest(".mirk-image"),a=o?.querySelector(".mirk-image__input"),s=o?.querySelector(".mirk-image__preview");a&&(a.value=""),s&&(s.removeAttribute("src"),s.setAttribute("hidden","")),o?.querySelector(".mirk-image__thumb")?.setAttribute("hidden",""),o?.querySelector(".mirk-image__upload")?.removeAttribute("hidden")}});function t(r,n){let i=document.createElement("span");i.textContent=r;let o=document.createElement("input");o.type="hidden",o.name="tags[]",o.value=r;let a=document.createElement("button");a.type="button",a.className="mirk-tags__remove",a.textContent="\xD7";let s=document.createElement("span");if(s.className="mirk-tags__chip",n){let l=document.createElement("span");l.className="mirk-tags__chip-inner",l.append(i,o,a),s.append(l)}else s.append(i,o,a);return s}document.addEventListener("keydown",r=>{let n=r.target.closest(".mirk-tags__input");if(!n)return;let i=n.closest(".mirk-tags");if(r.key==="Enter"||r.key===","){let o=n.value.trim();if(!o)return;r.preventDefault(),n.before(t(o,i.classList.contains("mirk-tags--round"))),n.value=""}else if(r.key==="Backspace"&&!n.value){let o=i.querySelectorAll(".mirk-tags__chip");o[o.length-1]?.remove()}}),document.addEventListener("click",r=>{let n=r.target.closest(".mirk-tags__remove");if(n){n.closest(".mirk-tags__chip").remove();return}let i=r.target.closest(".mirk-tags");i&&r.target===i&&i.querySelector(".mirk-tags__input")?.focus()}),document.addEventListener("click",r=>{let n=r.target.closest("[data-copy-btn]");if(!n)return;let i=n.closest("[data-copy]");if(!i)return;let o=i.cloneNode(!0);o.querySelectorAll("[data-copy-btn]").forEach(l=>l.remove());let s=i.getAttribute("data-copy")==="text"?o.textContent.replace(/^\s+|\s+$/g,""):o.innerHTML.replace(/\s+data-copy(="[^"]*")?/g,"").replace(/^\s*\n/gm,"").trim();navigator.clipboard.writeText(s).then(()=>{let l=n.textContent;n.textContent="copied",n.dataset.copied="",setTimeout(()=>{n.textContent=l,delete n.dataset.copied},1200)}).catch(()=>{n.textContent="error",setTimeout(()=>{n.textContent="copy"},1200)})})})();$r(Ur);var ro=Ft,no={cms:Ft};return Gr(io);})();

// Auto-export to window unless suppressed by loader.
// Per hypercms plan locked decision 3: flatten to hyperclay.hypercms.open(),
// not hyperclay.hypercms.cms.open().
if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.hypercms = hypercms.cms;
  window.h = window.hyperclay;
}

export const cms = hypercms.cms;
export default hypercms;

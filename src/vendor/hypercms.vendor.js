var hypercms=(()=>{var Pe=Object.defineProperty;var pr=Object.getOwnPropertyDescriptor;var yr=Object.getOwnPropertyNames;var gr=Object.prototype.hasOwnProperty;var Ue=(e,t)=>{for(var r in t)Pe(e,r,{get:t[r],enumerable:!0})},br=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of yr(t))!gr.call(e,o)&&o!==r&&Pe(e,o,{get:()=>t[o],enumerable:!(n=pr(t,o))||n.enumerable});return e};var Sr=e=>br(Pe({},"__esModule",{value:!0}),e);var to={};Ue(to,{cms:()=>Qn,default:()=>eo});var Se=["textContent","innerText","innerHTML","outerHTML","value","checked","selected","disabled","readOnly","type","tagName","nodeName","nodeType","nodeValue","childElementCount","id","className","classList","baseURI","offsetWidth","offsetHeight","clientWidth","clientHeight","scrollWidth","scrollHeight","dataset","currentSrc","duration","paused","title","documentURI","contentType"],De=new Set(Se),xt=new Set(["textContent","innerText","innerHTML","value","checked","selected","disabled","readOnly","type","id","className","title"]),Et=new Set(["tagName","nodeName","nodeType","nodeValue","childElementCount","classList","baseURI","documentURI","contentType","offsetWidth","offsetHeight","clientWidth","clientHeight","scrollWidth","scrollHeight","currentSrc","duration","paused","dataset"]);var ve={};Ue(ve,{EmptyListInsert:()=>le,MAX_RULE_DEPTH:()=>ee,MaxRuleDepthExceeded:()=>z,RuleTargetReadOnly:()=>ue,RulesParseError:()=>Q,ShapeMismatch:()=>ce,UnknownRulesVersion:()=>ae,UpgradeAlreadyRegistered:()=>Ae});var Q=class extends Error{constructor(t,r){super(t),this.name="RulesParseError",this.cause=r}},ae=class extends Error{constructor(t){super(`unknown rules version: ${t}. Library supports "1".`),this.name="UnknownRulesVersion",this.version=t}},ee=20,z=class extends Error{constructor(t){super(`rule depth exceeded ${ee} at path: ${t.join(".")}`),this.name="MaxRuleDepthExceeded",this.path=t}},ce=class extends Error{constructor(t){super(`shape mismatch: ${t.length} field(s) failed validation`),this.name="ShapeMismatch",this.mismatches=t}},le=class extends Error{constructor(t){super(`cannot add items to empty list at "${t.join(".")}" \u2014 no sibling to clone as template. Seed the list with a hidden item first.`),this.name="EmptyListInsert",this.path=t}},ue=class extends Error{constructor(t){super(`cannot write to read-only DOM property "${t}"`),this.name="RuleTargetReadOnly",this.target=t}},Ae=class extends Error{constructor(){super("upgrade transform already registered; only one registration is allowed per page."),this.name="UpgradeAlreadyRegistered"}};function B(e,t,r,n={}){return Be(e,t,r,{depth:0,path:[]},n)}function Be(e,t,r,n,o){if(n.depth>ee)throw new z(n.path);if(typeof r=="string")return Ar(e,t,r,o);if(Array.isArray(r)){let[s,a]=r;return e.find(t,s,o).map((c,d)=>Be(e,c,a,{depth:n.depth+1,path:[...n.path,d]},o))}if(typeof r=="object"&&r!==null){let s={};for(let[a,i]of Object.entries(r))s[a]=Be(e,t,i,{depth:n.depth+1,path:[...n.path,a]},o);return s}return null}function Ar(e,t,r,n){if(r.endsWith("[]")){let s=r.slice(0,-2);return e.find(t,s,n).map(a=>e.text(a))}if(r.startsWith("@"))return wt(e,t,r.slice(1));if(r.includes("@")){let s=r.lastIndexOf("@"),a=r.slice(0,s),i=r.slice(s+1),c=a?e.find(t,a,n):[t];return c.length===0?null:wt(e,c[0],i)}if(r===".")return e.text(t);let o=e.find(t,r,n);return o.length===0?null:e.text(o[0])}function wt(e,t,r){if(De.has(r)){let o=e.prop(t,r);return o==null?null:String(o)}let n=e.attr(t,r);return n||null}var vr=.5;function We(e,t,r,n,o,s,a,i={}){let c=e.find(t,r,i);if(o.length===0){c.forEach(M=>e.remove(M));return}let d=o.length>c.length,u=c[0]||null;if(d&&!u&&(u=Tr(e,t,r,i),!u))throw new le(s.path);let p=c.map(M=>xr(e,M,n,i)),y=null;if(u){y=e.clone(u),i.templateAttr&&e.removeAttr(y,i.templateAttr);let M=e.stripIds(y);M>0&&console.warn(`[hyper-html-api] stripped ${M} id attribute(s) from cloned template at "${s.path.join(".")||"(root)"}"`)}let v=Er(o,p,n),w=c[0]||u,O=e.parent(w),b=c.length>0?Mr(e,O,w):0,k=new Set,T=o.map((M,R)=>{let E=v[R];if(E>=0)return k.add(E),c[E];let m=e.clone(y);return e.stripIds(m),m});c.forEach((M,R)=>{k.has(R)||e.remove(M)}),T.forEach((M,R)=>{let E=b+R;e.children(O).findIndex(l=>e.sameNode(l,M))!==E&&e.insertAt(O,M,E)}),T.forEach((M,R)=>{if(n===null){let E=o[R],m=E==null?"":String(E);e.text(M)!==m&&e.text(M,m)}else{let E=a(e,M,n,o[R],{depth:s.depth+1,path:[...s.path,R]},i);E&&E!==M&&(T[R]=E)}})}function xr(e,t,r,n){return r===null?e.text(t):B(e,t,r,n)}function Er(e,t,r){let n=new Array(e.length).fill(-1),o=new Set;return e.forEach((s,a)=>{let i=-1,c=-1;t.forEach((d,u)=>{if(o.has(u))return;let p=wr(s,d,r),y=p===c&&i>=0?Math.abs(u-a)<Math.abs(i-a):!1;(p>c||y)&&(c=p,i=u)}),c>=vr&&(n[a]=i,o.add(i))}),n}function wr(e,t,r){if(r===null)return e===t?1:0;let n=Object.keys(r||{});if(n.length===0)return 0;let o=0;for(let s of n)JSON.stringify(e?.[s])===JSON.stringify(t?.[s])&&o++;return o/n.length}function Mr(e,t,r){let n=e.children(t);for(let o=0;o<n.length;o++)if(e.sameNode(n[o],r))return o;return-1}function Tr(e,t,r,n){if(!n.templateAttr)return null;let o=t;for(;o;){let s=e.find(o,r,{includeRulesTag:!1});for(let a of s)if(e.attr(a,n.templateAttr)!=null)return a;o=e.parent(o)}return null}var Mt=new Set(["checked","selected","disabled","readOnly","paused"]);function G(e,t,r,n,o={}){let s=[];if(Ve(r,n,[],s),s.length)throw new ce(s);xe(e,t,r,n,{depth:0,path:[]},o)}function xe(e,t,r,n,o,s={}){if(o.depth>ee)throw new z(o.path);if(n===void 0)return t;if(typeof r=="string")return Rr(e,t,r,n,o,s);if(Array.isArray(r)){let[a,i]=r;return We(e,t,a,i,n,o,xe,s),t}if(typeof r=="object"&&r!==null){for(let[a,i]of Object.entries(r)){let c=xe(e,t,i,n==null?n:n[a],{depth:o.depth+1,path:[...o.path,a]},s);c&&c!==t&&(t=c)}return t}return t}function Rr(e,t,r,n,o,s){if(r.endsWith("[]")){let i=r.slice(0,-2);return We(e,t,i,null,n,o,xe,s),t}if(r.startsWith("@"))return Tt(e,t,r.slice(1),n);if(r.includes("@")){let i=r.lastIndexOf("@"),c=r.slice(0,i),d=r.slice(i+1),u=c?e.find(t,c,s):[t];return u.length===0||Tt(e,u[0],d,n),t}if(r===".")return e.text(t,n==null?"":String(n)),t;let a=e.find(t,r,s);return a.length===0||e.text(a[0],n==null?"":String(n)),t}function Tt(e,t,r,n){if(Et.has(r))throw new ue(r);if(r==="outerHTML"){let o=n==null?"":String(n);return e.replaceWith(t,o)}return xt.has(r)?(e.prop(t,r,Cr(r,n)),t):(e.attr(t,r,n==null?"":String(n)),t)}function Cr(e,t){return t==null?Mt.has(e)?!1:"":Mt.has(e)?!!t:t}function Ve(e,t,r,n){if(t!==void 0){if(typeof e=="string"){if(e.endsWith("[]")){Array.isArray(t)?t.forEach((o,s)=>{typeof o=="object"&&o!==null&&n.push({path:fe([...r,s]),expected:"scalar",got:de(o)})}):n.push({path:fe(r),expected:"array",got:de(t)});return}t!==null&&typeof t=="object"&&n.push({path:fe(r),expected:"scalar",got:de(t)});return}if(Array.isArray(e)){if(!Array.isArray(t)){n.push({path:fe(r),expected:"array",got:de(t)});return}let o=e[1];t.forEach((s,a)=>Ve(o,s,[...r,a],n));return}if(typeof e=="object"&&e!==null){if(t===null||Array.isArray(t)||typeof t!="object"){n.push({path:fe(r),expected:"object",got:de(t)});return}for(let[o,s]of Object.entries(e))Ve(s,t[o],[...r,o],n)}}}function de(e){return e===null?"null":Array.isArray(e)?"array":typeof e}function fe(e){return e.join(".")}function Ke(e){try{return JSON.parse(e)}catch(t){throw new Q(`Invalid strict JSON: ${t.message}`,t)}}function he(e){try{return JSON.parse(e)}catch{}let t={BRACE_OPEN:"{",BRACE_CLOSE:"}",BRACKET_OPEN:"[",BRACKET_CLOSE:"]",COLON:":",COMMA:",",STRING:"STRING",SELECTOR:"SELECTOR",IDENTIFIER:"IDENTIFIER",NUMBER:"NUMBER",BOOLEAN:"BOOLEAN"};function r(o){let s=[],a=0;for(;a<o.length;){let i=o[a];if(/\s/.test(i)){a++;continue}if("{}".includes(i)){s.push({type:i,value:i}),a++;continue}if(i==="["){let p=!1,y=a+1;for(;y<o.length&&/\s/.test(o[y]);)y++;if(y<o.length&&/[a-zA-Z_]/.test(o[y])&&(p=!0),!p){s.push({type:i,value:i}),a++;continue}}if(i==="]"){s.push({type:i,value:i}),a++;continue}if(i===":"){s.push({type:t.COLON,value:i}),a++;continue}if(i===","){s.push({type:t.COMMA,value:i}),a++;continue}if(i==='"'||i==="'"){let p=i,y=a+1;for(;y<o.length&&o[y]!==p;)o[y]==="\\"&&y++,y++;s.push({type:t.STRING,value:o.substring(a+1,y),quoted:!0,sourceQuote:p}),a=y+1;continue}let c=a,d;for(;c<o.length&&!/[{},]/.test(o[c]);)if(o[c]===":"){let p=[":first",":last",":nth-child",":nth-of-type",":first-child",":last-child",":first-of-type",":last-of-type",":only-child",":only-of-type",":hover",":focus",":active",":visited",":disabled",":enabled",":checked",":empty",":root",":target",":not",":before",":after",":nth-last-child",":nth-last-of-type"],y=!1;for(let v of p){let w=v.substring(1);if(o.substring(c+1,c+1+w.length)===w){y=!0,c+=w.length;break}}if(!y)break}else if(o[c]==="["){for(c++;c<o.length&&o[c]!=="]";){if(o[c]==='"'||o[c]==="'"){let p=o[c];for(c++;c<o.length&&o[c]!==p;)o[c]==="\\"&&c++,c++}c++}c<o.length&&o[c]==="]"&&c++}else c++;d=o.substring(a,c);let u=t.IDENTIFIER;/^-?\d+(\.\d+)?$/.test(d)?u=t.NUMBER:d==="true"||d==="false"||d==="null"?u=t.BOOLEAN:/^[.#@\[]|[.#@\[]| /.test(d)&&(u=t.SELECTOR),s.push({type:u,value:d,quoted:!1}),a=c}return s}function n(o){let s="";for(let a=0;a<o.length;a++){let i=o[a];if("{}".includes(i.type)||"[]".includes(i.type)){s+=i.value;continue}if(i.type===t.COLON){s+=i.value;continue}if(i.type===t.COMMA){let c=o[a+1];if(c&&(c.type==="}"||c.type==="]"))continue;s+=i.value;continue}if(i.type===t.STRING&&i.quoted){let c=i.value;i.sourceQuote==="'"&&(c=c.replace(/\\'/g,"'"),c=c.replace(/(\\*)"/g,(d,u)=>u.length%2===0?u+'\\"':d)),s+=`"${c}"`;continue}if(i.type===t.NUMBER||i.type===t.BOOLEAN){s+=i.value;continue}if(i.type===t.SELECTOR||i.type===t.IDENTIFIER){s+=`"${i.value}"`;continue}s+=`"${i.value}"`}return s}try{let o=r(e),s=n(o);return JSON.parse(s)}catch(o){throw new Q("Invalid extraction rules syntax: "+o.message,o)}}var kr="1",Rt=/^[a-zA-Z0-9_-]+$/;function Y(e,t,r){let n;if(r===void 0)n="script[data-rules-name]";else{if(typeof r!="string"||!Rt.test(r))throw new Error(`hyper-html-api: invalid rules token ${JSON.stringify(r)} (must match ${Rt})`);n=`script[data-rules-name~="${r}"]`}let o=e.find(t,n,{includeRulesTag:!0});if(o.length===0)return null;r!==void 0&&o.length>1&&console.warn(`hyper-html-api: ${o.length} rules tags match data-rules-name~="${r}"; using the first.`);let s=o[0],a=e.attr(s,"data-rules-version");if(a!==kr)throw new ae(a);return{rules:he(e.text(s)),tagNode:s}}function ze(e,t,r){if(r&&typeof r=="object")return{rules:r,tagNode:null};if(typeof r=="string"){let n=t&&t.ownerDocument?t.ownerDocument:t;return Y(e,n,r)}return null}function Ct(e,t,r,n){let o=ze(e,t,r);if(!o){let i=typeof r=="string"?`data-rules-name~="${r}"`:"the provided rules object";throw new Error(`hyper-html-api: could not resolve rules for ${i}`)}let{rules:s,tagNode:a}=o;return{rules:s,tagNode:a,get:()=>B(e,t,s,n),set:i=>G(e,t,s,i,n)}}var jt={includeClasses:!0,includeAttributes:["href","src","name","type","role","aria-label","alt","title"],excludeAttributePrefixes:["data-morph-","data-hyper-","data-im-"],textHintLength:64,excludeIds:!0,maxPathDepth:4,landmarks:["HEADER","NAV","MAIN","ASIDE","FOOTER","SECTION","ARTICLE"],weights:{signature:100,pathSegment:10,textMatch:20,textMismatch:25,uniqueCandidate:50,positionPenalty:1,slotMatch:30},minConfidence:101};function Ir(e){let t=5381;for(let r=0;r<e.length;r++)t=(t<<5)+t^e.charCodeAt(r);return Math.abs(t).toString(36)}function Nr(e){if(e.classList&&e.classList.length>0)return Array.from(e.classList).sort().join(" ");let t=e.getAttribute?.("class");return t?t.split(/\s+/).filter(Boolean).sort().join(" "):""}function Lr(e,t){let r=[];for(let n of e.attributes||[]){let o=n.name;o==="id"||o==="class"||t.excludeAttributePrefixes.some(s=>o.startsWith(s))||t.includeAttributes.includes(o)&&r.push(`${o}=${n.value}`)}return r.sort().join("|")}function $r(e,t){return(e.textContent||"").replace(/\s+/g," ").trim().slice(0,t.textHintLength)}function Hr(e,t){let r=[e.tagName];return t.includeClasses&&r.push(Nr(e)),r.push(Lr(e,t)),Ir(r.join("|"))}function Fr(e){let t=e.tagName,r=1,n=e.previousElementSibling;for(;n;)n.tagName===t&&r++,n=n.previousElementSibling;return r}function qr(e,t){return e.id||e.getAttribute?.("role")?!0:t.landmarks.includes(e.tagName)}function _r(e){if(e.id)return`#${e.id}`;let t=e.getAttribute?.("role");return t?`@${t}`:e.tagName}function Pr(e,t){let r=[],n=e;for(;n&&n.tagName&&r.length<t.maxPathDepth;){let o=`${n.tagName}:${Fr(n)}`;if(r.unshift(o),n!==e&&qr(n,t)){r.unshift(_r(n));break}n=n.parentElement}return r}function Ur(e,t){let r=0,n=e.length-1,o=t.length-1;for(;n>=0&&o>=0&&e[n]===t[o];)r++,n--,o--;return r}function P(e,t,r){if(r.has(e))return r.get(e);let n={signature:Hr(e,t),path:Pr(e,t),textHint:$r(e,t)};return r.set(e,n),n}function $t(e,t,r,n){if(n.has(e))return n.get(e);let o=new Map,s=e.querySelectorAll("*"),a=0;for(let i of s){let c=P(i,t,r);c.domIndex=a++,o.has(c.signature)||o.set(c.signature,[]),o.get(c.signature).push(i)}return n.set(e,o),o}function Dr(e,t,r){r.delete(e),t.delete(e);let n=e.querySelectorAll("*");for(let o of n)t.delete(o)}function Ge(e,t,r,n,o){let s=P(e,r,n),a=P(t,r,n),i=r.weights,c={},d=0;if(s.signature!==a.signature)return{score:0,breakdown:{rejected:"signature mismatch"}};d+=i.signature,c.signature=i.signature;let p=Ur(s.path,a.path)*i.pathSegment;d+=p,c.path=p;let y=!0;if(s.textHint&&a.textHint?s.textHint===a.textHint?(d+=i.textMatch,c.text=i.textMatch):(d-=i.textMismatch,c.text=-i.textMismatch,y=!1):s.textHint!==a.textHint&&(d-=i.textMismatch,c.text=-i.textMismatch,y=!1),o.candidateCount===1&&y&&(d+=i.uniqueCandidate,c.unique=i.uniqueCandidate),typeof s.domIndex=="number"&&typeof a.domIndex=="number"){let v=Math.abs(s.domIndex-a.domIndex),w=Math.min(v*i.positionPenalty,20);d-=w,c.drift=-w}return{score:d,breakdown:c}}function It(e,t,r,n,o){if(r.excludeIds&&e.id)return null;let s=$t(t,r,n,o),a=P(e,r,n);if(typeof a.domIndex!="number"){let y=0,v=e.previousElementSibling;for(;v;)y++,v=v.previousElementSibling;a.domIndex=y}let i=s.get(a.signature)||[],c=r.excludeIds?i.filter(y=>!y.id):i;if(c.length===0)return null;let d=null,u=0,p=null;for(let y of c){let{score:v,breakdown:w}=Ge(e,y,r,n,{candidateCount:c.length});v>u&&(u=v,d=y,p=w)}return u<r.minConfidence?null:{element:d,confidence:u,breakdown:p}}function Br(e,t,r,n){let o=[],s=r.weights.signature+r.weights.slotMatch,a={slot:s};function i(p){if(p.children)return p.children;let y=p.childNodes;if(!y)return[];let v=[];for(let w=0;w<y.length;w++)y[w].nodeType===1&&v.push(y[w]);return v}function c(p,y){let v=i(p),w=i(y);if(v.length===w.length)for(let O=0;O<v.length;O++){let b=v[O],k=w[O];if(r.excludeIds&&(b.id||k.id)||b.tagName!==k.tagName)continue;let T=P(b,r,n).signature,M=P(k,r,n).signature;T!==M&&o.push({newEl:b,oldEl:k,score:s,breakdown:a}),c(b,k)}}function d(p,y){for(;;){if(p.tagName===y.tagName)return[p,y];let v=i(p);if(!p.tagName&&v.length===1){p=v[0];continue}let w=i(y);if(w.length===1&&w[0].tagName===p.tagName){y=w[0];continue}return null}}let u=d(e,t);return u&&c(u[0],u[1]),o}function Nt(e,t,r,n,o){let s=t.querySelectorAll("*"),a=$t(e,r,n,o),i=0;for(let p of s){let y=P(p,r,n);y.domIndex=i++}let c=[];for(let p of s){if(r.excludeIds&&p.id)continue;let y=P(p,r,n),v=a.get(y.signature)||[],w=r.excludeIds?v.filter(O=>!O.id):v;for(let O of w){let{score:b,breakdown:k}=Ge(p,O,r,n,{candidateCount:w.length});b>=r.minConfidence&&c.push({newEl:p,oldEl:O,score:b,breakdown:k})}}if(r.weights.slotMatch>0){let p=Br(t,e,r,n);for(let y of p)c.push(y)}c.sort((p,y)=>y.score-p.score);let d=new Map,u=new Set;for(let{newEl:p,oldEl:y}of c)d.has(p)||u.has(y)||(d.set(p,y),u.add(y));return d}function Lt(e,t,r,n){let o=P(e,r,n),s=P(t,r,n),{score:a,breakdown:i}=Ge(e,t,r,n,{candidateCount:1});return{matches:a>=r.minConfidence,score:a,breakdown:i,newMeta:{signature:o.signature,path:o.path,textHint:o.textHint},oldMeta:{signature:s.signature,path:s.path,textHint:s.textHint}}}function Ht(e={}){let t={...jt,...e,weights:{...jt.weights,...e.weights}},r=new WeakMap,n=new WeakMap;return{findMatch:(o,s)=>It(o,s,t,r,n),computeMatches:(o,s)=>Nt(o,s,t,r,n),explain:(o,s)=>Lt(o,s,t,r),invalidate:o=>Dr(o,r,n),session:()=>{let o=new WeakMap,s=new WeakMap;return{findMatch:(a,i)=>It(a,i,t,o,s),computeMatches:(a,i)=>Nt(a,i,t,o,s),explain:(a,i)=>Lt(a,i,t,o)}},getConfig:()=>({...t})}}var Wr=Ht(),Ye=(function(){"use strict";let e=()=>{};function t(b){if(!(b instanceof Element))return!1;if(b.hasAttribute("save-ignore"))return!0;if(b.tagName==="LINK"||b.tagName==="SCRIPT"){let k=b.getAttribute("src")||b.getAttribute("href")||"";if(k.startsWith("chrome-extension://")||k.startsWith("moz-extension://")||k.startsWith("safari-web-extension://"))return!0}return!1}function r(b,k){if(k!=="smart")return b.outerHTML;let T=b.getAttribute("src"),M=b.getAttribute("type")||"text/javascript";if(T)try{let R=new URL(T,window.location.href);return`ext:${M}:${R.origin}${R.pathname}${R.search}`}catch{return`ext:${M}:${T}`}else{let R=b.textContent.trim(),E=5381;for(let m=0;m<R.length;m++)E=(E<<5)+E^R.charCodeAt(m);return`inline:${M}:${Math.abs(E).toString(36)}`}}let n={morphStyle:"outerHTML",callbacks:{beforeNodeAdded:e,afterNodeAdded:e,beforeNodeMorphed:e,afterNodeMorphed:e,beforeNodeRemoved:e,afterNodeRemoved:e,beforeAttributeUpdated:e},head:{style:"merge",shouldPreserve:b=>b.getAttribute("im-preserve")==="true",shouldReAppend:b=>b.getAttribute("im-re-append")==="true",shouldRemove:e,afterHeadMorphed:e},scripts:{handle:!1,matchMode:"outerHTML",shouldPreserve:b=>b.getAttribute("im-preserve")==="true",shouldReAppend:b=>b.getAttribute("im-re-append")==="true",shouldRemove:e,afterScriptsHandled:e},restoreFocus:!0},o={computeMatches(b,k){let{computeMatches:T}=Wr.session();return T(b,k)}};function s(b,k,T={}){b=w(b);let M=O(k),R=v(b,M,T),E=R.scripts.matchMode,m=new Set(Array.from(b.querySelectorAll("script")).map(f=>r(f,E))),A=i(R,()=>u(R,b,M,f=>f.morphStyle==="innerHTML"?(c(f,b,M),Array.from(b.childNodes)):a(f,b,M)));R.pantry.remove();let l=y(b,m,R);return l.length>0?A instanceof Promise?A.then(f=>Promise.all(l).then(()=>f)):Promise.all(l).then(()=>A):A}function a(b,k,T){let M=O(k);return c(b,M,T,k,k.nextSibling),Array.from(M.childNodes)}function i(b,k){if(!b.config.restoreFocus)return k();let T=document.activeElement;if(!(T instanceof HTMLInputElement||T instanceof HTMLTextAreaElement))return k();let{id:M,selectionStart:R,selectionEnd:E}=T,m=k();return M&&M!==document.activeElement?.getAttribute("id")&&(T=b.target.querySelector(`[id="${M}"]`),T?.focus()),T&&!T.selectionEnd&&E!=null&&T.setSelectionRange(R,E),m}let c=(function(){function b(l,f,g,h=null,S=null){f instanceof HTMLTemplateElement&&g instanceof HTMLTemplateElement&&(f=f.content,g=g.content),h||=f.firstChild;for(let x of g.childNodes){if(t(x))continue;if(h&&h!=S){let j=T(l,x,h,S);if(j){j!==h&&R(l,h,j),d(j,x,l),h=j.nextSibling;continue}}if(x instanceof Element){let j=x.getAttribute("id");if(l.persistentIds.has(j)){let N=E(f,j,h,l);d(N,x,l),h=N.nextSibling;continue}if(!l.idMap.has(x)){let N=l.hyperMatches.get(x);if(N&&!l.idMap.has(N)){A(f,N,h),d(N,x,l),h=N.nextSibling;continue}}}let C=k(f,x,h,l);C&&(h=C.nextSibling)}for(;h&&h!=S;){let x=h;h=h.nextSibling,t(x)||M(l,x)}}function k(l,f,g,h){if(h.callbacks.beforeNodeAdded(f)===!1)return null;if(h.idMap.has(f)){let S=document.createElement(f.tagName);return l.insertBefore(S,g),d(S,f,h),h.callbacks.afterNodeAdded(S),S}else{let S=document.importNode(f,!0);return l.insertBefore(S,g),h.callbacks.afterNodeAdded(S),S}}let T=(function(){function l(h,S,x,C){let j=S instanceof Element&&!h.idMap.has(S)?h.hyperMatches.get(S):null,N=null,F=S.nextSibling,ie=0,L=x;for(;L&&L!=C;){if(g(L,S)){if(f(h,L,S)||L===j&&!h.idMap.has(L))return L;if(N===null){let J=L instanceof Element&&h.hyperMatchedOldElements.has(L);!h.idMap.has(L)&&!J&&(N=L)}}if(N===null&&F&&g(L,F)&&(ie++,F=F.nextSibling,ie>=2&&(N=void 0)),h.activeElementAndParents.includes(L))break;L=L.nextSibling}return N||null}function f(h,S,x){let C=h.idMap.get(S),j=h.idMap.get(x);if(!j||!C)return!1;for(let N of C)if(j.has(N))return!0;return!1}function g(h,S){let x=h,C=S;return x.nodeType===C.nodeType&&x.tagName===C.tagName&&(!x.getAttribute?.("id")||x.getAttribute?.("id")===C.getAttribute?.("id"))}return l})();function M(l,f){let g=f instanceof Element&&l.hyperMatchedOldElements.has(f)&&!l.idMap.has(f);if(l.idMap.has(f)||g)A(l.pantry,f,null);else{if(l.callbacks.beforeNodeRemoved(f)===!1)return;f.parentNode?.removeChild(f),l.callbacks.afterNodeRemoved(f)}}function R(l,f,g){let h=f;for(;h&&h!==g;){let S=h;h=h.nextSibling,t(S)||M(l,S)}return h}function E(l,f,g,h){let S=h.target.getAttribute?.("id")===f&&h.target||h.target.querySelector(`[id="${f}"]`)||h.pantry.querySelector(`[id="${f}"]`);return m(S,h),A(l,S,g),S}function m(l,f){let g=l.getAttribute("id");for(;l=l.parentNode;){let h=f.idMap.get(l);h&&(h.delete(g),h.size||f.idMap.delete(l))}}function A(l,f,g){if(l.moveBefore)try{l.moveBefore(f,g)}catch{l.insertBefore(f,g)}else l.insertBefore(f,g)}return b})(),d=(function(){function b(m,A,l){return l.ignoreActive&&m===document.activeElement?null:(l.callbacks.beforeNodeMorphed(m,A)===!1||(m instanceof HTMLHeadElement&&l.head.ignore||(m instanceof HTMLHeadElement&&l.head.style!=="morph"?p(m,A,l):(k(m,A,l),E(m,l)||c(l,m,A))),l.callbacks.afterNodeMorphed(m,A)),m)}function k(m,A,l){let f=A.nodeType;if(f===1){let g=m,h=A,S=g.attributes,x=h.attributes;for(let C of x)R(C.name,g,"update",l)||g.getAttribute(C.name)!==C.value&&g.setAttribute(C.name,C.value);for(let C=S.length-1;0<=C;C--){let j=S[C];if(j&&!h.hasAttribute(j.name)){if(R(j.name,g,"remove",l))continue;g.removeAttribute(j.name)}}E(g,l)||T(g,h,l)}(f===8||f===3)&&m.nodeValue!==A.nodeValue&&(m.nodeValue=A.nodeValue)}function T(m,A,l){if(m instanceof HTMLInputElement&&A instanceof HTMLInputElement&&A.type!=="file"){let f=A.value,g=m.value;M(m,A,"checked",l),M(m,A,"disabled",l),l.formStateSync==="property"?g!==f&&(R("value",m,"update",l)||(m.value=f)):A.hasAttribute("value")?g!==f&&(R("value",m,"update",l)||(m.setAttribute("value",f),m.value=f)):R("value",m,"remove",l)||(m.value="",m.removeAttribute("value"))}else if(m instanceof HTMLOptionElement&&A instanceof HTMLOptionElement)M(m,A,"selected",l);else if(m instanceof HTMLTextAreaElement&&A instanceof HTMLTextAreaElement){let f=A.value,g=m.value;if(R("value",m,"update",l))return;f!==g&&(m.value=f),m.firstChild&&m.firstChild.nodeValue!==f&&(m.firstChild.nodeValue=f)}}function M(m,A,l,f){let g=A[l],h=m[l];if(g!==h){let S=R(l,m,"update",f);if(S||(m[l]=A[l]),f.formStateSync==="property")return;g?S||m.setAttribute(l,""):R(l,m,"remove",f)||m.removeAttribute(l)}}function R(m,A,l,f){return m==="value"&&f.ignoreActiveValue&&A===document.activeElement?!0:f.callbacks.beforeAttributeUpdated(m,A,l)===!1}function E(m,A){return!!A.ignoreActiveValue&&m===document.activeElement&&m!==document.body}return b})();function u(b,k,T,M){if(b.head.block){let R=k.querySelector("head"),E=T.querySelector("head");if(R&&E){let m=p(R,E,b);return Promise.all(m).then(()=>{let A=Object.assign(b,{head:{block:!1,ignore:!0}});return M(A)})}}return M(b)}function p(b,k,T){let M=[],R=[],E=[],m=[],A=T.scripts.matchMode,l=h=>{if(h.tagName==="SCRIPT")return r(h,A);if(h.tagName==="LINK"&&A==="smart"){let S=h.getAttribute("href");if(S)try{let x=new URL(S,window.location.href);return`link:${h.getAttribute("rel")||""}:${x.origin}${x.pathname}${x.search}`}catch{}}return h.outerHTML},f=new Map;for(let h of k.children)t(h)||f.set(l(h),h);for(let h of b.children){let S=l(h),x=f.has(S),C=T.head.shouldReAppend(h),j=T.head.shouldPreserve(h);x||j?C?R.push(h):(f.delete(S),E.push(h)):T.head.style==="append"?C&&(R.push(h),m.push(h)):T.head.shouldRemove(h)!==!1&&!t(h)&&R.push(h)}m.push(...f.values());let g=[];for(let h of m){let S=document.createRange().createContextualFragment(h.outerHTML).firstChild;if(T.callbacks.beforeNodeAdded(S)!==!1){if("href"in S&&S.href||"src"in S&&S.src){let x,C=new Promise(function(j){x=j});S.addEventListener("load",function(){x()}),g.push(C)}b.appendChild(S),T.callbacks.afterNodeAdded(S),M.push(S)}}for(let h of R)T.callbacks.beforeNodeRemoved(h)!==!1&&(b.removeChild(h),T.callbacks.afterNodeRemoved(h));return T.head.afterHeadMorphed(b,{added:M,kept:E,removed:R}),g}function y(b,k,T){if(!T.scripts.handle)return[];let M=[],R=[],E=[],m=[],A=T.scripts.matchMode,l=Array.from(b.querySelectorAll("script"));for(let g of l){let h=r(g,A),S=k.has(h),x=T.scripts.shouldPreserve(g),C=T.scripts.shouldReAppend(g);S||x?C?(R.push(g),m.push(g)):E.push(g):m.push(g)}for(let g of k){let h=l.some(S=>S.outerHTML===g)}let f=[];for(let g of m){if(T.callbacks.beforeNodeAdded(g)===!1)continue;let h=document.createRange().createContextualFragment(g.outerHTML).firstChild;if(h.src){let S,x=new Promise(function(C){S=C});h.addEventListener("load",function(){S()}),h.addEventListener("error",function(){S()}),f.push(x)}g.replaceWith(h),T.callbacks.afterNodeAdded(h),M.push(h)}return T.scripts.afterScriptsHandled(b,{added:M,kept:E,removed:R}),f}let v=(function(){function b(l,f,g){let{persistentIds:h,idMap:S}=m(l,f),x=o.computeMatches(l,f);if(typeof g.key=="function"){let F=new Map,ie=new Set,L=$=>{let H=g.key($);H!=null&&(F.has(H)?ie.add(H):F.set(H,$))};l instanceof Element&&L(l);for(let $ of l.querySelectorAll("*"))L($);for(let $ of ie)F.delete($);let J=new Map;for(let[$,H]of x)J.set(H,$);let Fe=f.__hyperMorphRoot||f,be=new Map,At=new Set,vt=$=>{let H=g.key($);H!=null&&(be.has(H)?At.add(H):be.set(H,$))};Fe instanceof Element&&vt(Fe);for(let $ of Fe.querySelectorAll("*"))vt($);for(let $ of At)be.delete($);for(let[$,H]of be){let X=F.get($);if(!X||X.tagName!==H.tagName)continue;let qe=J.get(X);qe&&qe!==H&&x.delete(qe);let _e=x.get(H);_e&&_e!==X&&J.delete(_e),x.set(H,X),J.set(X,H)}}let C=new Set;for(let F of x.values())C.add(F);let j=k(g),N=j.morphStyle||"outerHTML";if(!["innerHTML","outerHTML"].includes(N))throw`Do not understand how to morph style ${N}`;return{target:l,newContent:f,config:j,morphStyle:N,ignoreActive:j.ignoreActive,ignoreActiveValue:j.ignoreActiveValue,restoreFocus:j.restoreFocus,formStateSync:j.formStateSync||"attribute",idMap:S,persistentIds:h,hyperMatches:x,hyperMatchedOldElements:C,pantry:T(),activeElementAndParents:M(l),callbacks:j.callbacks,head:j.head,scripts:j.scripts}}function k(l){let f=Object.assign({},n);return Object.assign(f,l),f.callbacks=Object.assign({},n.callbacks,l.callbacks),f.head=Object.assign({},n.head,l.head),f.scripts=Object.assign({},n.scripts,l.scripts),f}function T(){let l=document.createElement("div");return l.hidden=!0,document.body.insertAdjacentElement("afterend",l),l}function M(l){let f=[],g=document.activeElement;if(g?.tagName!=="BODY"&&l.contains(g))for(;g&&(f.push(g),g!==l);)g=g.parentElement;return f}function R(l){let f=Array.from(l.querySelectorAll("[id]"));return l.getAttribute?.("id")&&f.push(l),f}function E(l,f,g,h){for(let S of h){let x=S.getAttribute("id");if(f.has(x)){let C=S;for(;C;){let j=l.get(C);if(j==null&&(j=new Set,l.set(C,j)),j.add(x),C===g)break;C=C.parentElement}}}}function m(l,f){let g=R(l),h=R(f),S=A(g,h),x=new Map;E(x,S,l,g);let C=f.__hyperMorphRoot||f;return E(x,S,C,h),{persistentIds:S,idMap:x}}function A(l,f){let g=new Set,h=new Map;for(let{id:x,tagName:C}of l)h.has(x)?g.add(x):h.set(x,C);let S=new Set;for(let{id:x,tagName:C}of f)S.has(x)?g.add(x):h.get(x)===C&&S.add(x);for(let x of g)S.delete(x);return S}return b})(),{normalizeElement:w,normalizeParent:O}=(function(){let b=new WeakSet;function k(E){return E instanceof Document?E.documentElement:E}function T(E){if(E==null)return document.createElement("div");if(typeof E=="string")return T(R(E));if(b.has(E))return E;if(E instanceof Node){if(E.parentNode)return new M(E);{let m=document.createElement("div");return m.append(E),m}}else{let m=document.createElement("div");for(let A of[...E])m.append(A);return m}}class M{constructor(m){this.originalNode=m,this.realParentNode=m.parentNode,this.previousSibling=m.previousSibling,this.nextSibling=m.nextSibling}get childNodes(){let m=[],A=this.previousSibling?this.previousSibling.nextSibling:this.realParentNode.firstChild;for(;A&&A!=this.nextSibling;)m.push(A),A=A.nextSibling;return m}querySelectorAll(m){return this.childNodes.reduce((A,l)=>{if(l instanceof Element){l.matches(m)&&A.push(l);let f=l.querySelectorAll(m);for(let g=0;g<f.length;g++)A.push(f[g])}return A},[])}insertBefore(m,A){return this.realParentNode.insertBefore(m,A)}moveBefore(m,A){return this.realParentNode.moveBefore(m,A)}get __hyperMorphRoot(){return this.originalNode}}function R(E){let m=new DOMParser,A=E.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(A.match(/<\/html>/)||A.match(/<\/head>/)||A.match(/<\/body>/)){let l=m.parseFromString(E,"text/html");if(A.match(/<\/html>/))return b.add(l),l;{let f=l.firstChild;return f&&b.add(f),f}}else{let f=m.parseFromString("<body><template>"+E+"</template></body>","text/html").body.querySelector("template").content;return b.add(f),f}}return{normalizeElement:k,normalizeParent:T}})();return{morph:s,defaults:n}})();var Uo=Ye.morph,Do=Ye.defaults,Ze=Ye;var Yr=null;function Ee(){return Yr}function Me(e,t){let r={carriedOver:0,discarded:0,listItems:0},n=Je(t,e,r);return Xe(t,e,r),{data:n,summary:r}}function Je(e,t,r){if(typeof e=="string")return e.endsWith("[]")?Array.isArray(t)?(r.listItems+=t.length,r.carriedOver+=t.length,t):void 0:t==null?void 0:(r.carriedOver++,t);if(Array.isArray(e)){let[,n]=e;return Array.isArray(t)?(r.listItems+=t.length,t.map(o=>Je(n,o,r))):void 0}if(typeof e=="object"&&e!==null){let n={};for(let[o,s]of Object.entries(e)){let a=Je(s,t?.[o],r);a!==void 0&&(n[o]=a)}return n}}function Xe(e,t,r){if(t!=null){if(typeof e=="object"&&e!==null&&!Array.isArray(e)){if(typeof t!="object"||Array.isArray(t))return;let n=new Set(Object.keys(e));for(let o of Object.keys(t))n.has(o)?Xe(e[o],t[o],r):r.discarded+=we(t[o]);return}if(Array.isArray(e)&&Array.isArray(t)){let n=e[1];t.forEach(o=>Xe(n,o,r));return}typeof e=="string"&&!e.endsWith("[]")&&typeof t=="object"&&t!==null&&(r.discarded+=we(t))}}function we(e){return e==null?0:Array.isArray(e)?e.reduce((t,r)=>t+we(r),0):typeof e=="object"?Object.values(e).reduce((t,r)=>t+we(r),0):1}function Zr(e){return e&&e.nodeType===1&&e.tagName==="SCRIPT"&&e.hasAttribute&&e.hasAttribute("data-rules-name")}function Jr(e){return e?(e.nodeType===9||e.nodeType===11,e):null}var Xr={find(e,t,r={}){let n=Jr(e);if(!n||!n.querySelectorAll)return[];let o=Array.from(n.querySelectorAll(t));r.includeRulesTag||(o=o.filter(a=>!Zr(a)));let s=[];if(r.skip&&s.push(r.skip),r.templateAttr&&s.push("["+r.templateAttr+"]"),s.length){let a=s.join(", ");o=o.filter(i=>!i.closest||!i.closest(a))}return o},parent(e){return e?e.parentElement:null},children(e){return e?Array.from(e.children):[]},text(e,t){if(t===void 0)return(e.textContent||"").trim();e.textContent=t},attr(e,t,r){if(r===void 0)return e.hasAttribute&&e.hasAttribute(t)?e.getAttribute(t):null;e.setAttribute(t,r)},removeAttr(e,t){e&&e.removeAttribute&&e.removeAttribute(t)},prop(e,t,r){if(r===void 0){let n=e?e[t]:void 0;return n!==void 0?n:null}e[t]=r},clone(e){return e.cloneNode(!0)},insertAt(e,t,r){let n=e.children[r]||null;e.insertBefore(t,n)},remove(e){e&&e.parentNode&&e.parentNode.removeChild(e)},replaceWith(e,t){if(!e||!e.parentNode)throw new Error("dom.replaceWith: node has no parent");let n=e.ownerDocument.createElement("template");n.innerHTML=t;let o=n.content.firstElementChild;if(!o)throw new Error("dom.replaceWith: html did not parse to an element");return e.parentNode.replaceChild(o,e),o},stripIds(e){let t=0;return e.id&&(e.removeAttribute("id"),t++),(e.querySelectorAll?e.querySelectorAll("[id]"):[]).forEach(n=>{n.removeAttribute("id"),t++}),t},sameNode(e,t){return e===t}},U=Xr;var Qr="_hyperHtmlApi",en="upgrade-helper",tn="parentOrigin";function tt(e=typeof location<"u"?location:null){if(!e)return!1;try{return new URLSearchParams(e.search).get(Qr)===en}catch{return!1}}function Ft(e=typeof location<"u"?location:null){return e?new URLSearchParams(e.search).get(tn):null}function rt({win:e,doc:t,parentOrigin:r}={}){if(e=e||(typeof window<"u"?window:null),t=t||(typeof document<"u"?document:null),!e||!t||(r=r||Ft(e.location),!r))return;let n=()=>rn({win:e,doc:t,parentOrigin:r});t.readyState==="loading"?t.addEventListener("DOMContentLoaded",n,{once:!0}):n()}function rn({win:e,doc:t,parentOrigin:r}){let n;try{n=Y(U,t.body)}catch(c){return Qe(e,r,c)}if(!n)return Qe(e,r,new Error("helper-mode: no rules tag in v2 document"));let o=n.rules,s=on(t,"hyper-version"),a=!!Ee(),i=c=>{if(c.source!==e.parent||c.origin!==r)return;let d=c.data;if(!(!d||d.type!=="hha:upgrade-data")){e.removeEventListener("message",i);try{let u=nn({doc:t,rules:o,v1Data:d.v1Data});e.parent.postMessage({type:"hha:upgrade-result",html:u.html,summary:u.summary},r)}catch(u){Qe(e,r,u)}}};e.addEventListener("message",i),e.parent.postMessage({type:"hha:upgrade-ready",rules:o,version:s,hasTransform:a},r)}function nn({doc:e,rules:t,v1Data:r}){let n=Ee(),o=r,s=!1;n&&(o=n(r),s=!0);let{data:a,summary:i}=Me(o,t);G(U,e.body,t,a);let c=B(U,e.body,t);return{html:`<!DOCTYPE html>
`+e.documentElement.outerHTML,summary:{...i,transformApplied:s,appliedFieldCount:et(c)}}}function Qe(e,t,r){e.parent.postMessage({type:"hha:upgrade-error",name:r?.name||"Error",message:r?.message||String(r)},t)}function on(e,t){let r=e.querySelector(`meta[name="${t}"]`);return r?r.getAttribute("content"):null}function et(e){return e==null?0:Array.isArray(e)?e.reduce((t,r)=>t+et(r),0):typeof e=="object"?Object.values(e).reduce((t,r)=>t+et(r),0):1}var q={extract:(e,t,r)=>B(U,e,t,r),apply:(e,t,r,n)=>G(U,e,t,r,n),findRulesIn:(e,t)=>Y(U,e,t),findRules:(e,t)=>ze(U,e,t),bind:(e,t,r)=>Ct(U,e,t,r),parseStrict:Ke,parseRelaxed:he,errors:ve,DOM_PROPERTIES:Se};typeof window<"u"&&tt(window.location)&&rt({win:window,doc:document});var ot={};Ue(ot,{fromString:()=>V,getRuleAtPath:()=>me,getValueAtPath:()=>un,setAtPath:()=>nt,toString:()=>ln});function ln(e){return e.map(String).join(".")}function V(e){return e===""?[]:e.split(".").map(t=>/^\d+$/.test(t)?Number(t):t)}function me(e,t){let r=e;for(let n of t){if(r==null)return;if(typeof r=="string"){if(r.endsWith("[]")&&(typeof n=="number"||n==="*")){r=r.slice(0,-2);continue}return}if(Array.isArray(r)){if(typeof n!="number"&&n!=="*")return;r=r[1];continue}if(typeof r=="object"){if(typeof n=="number"||!(n in r))return;r=r[n];continue}return}return r}function un(e,t){let r=e;for(let n of t){if(r==null)return;r=r[n]}return r}function nt(e,t,r){if(t.length===0)return r;let[n,...o]=t;if(typeof n=="number"){let s=Array.isArray(e)?[...e]:[];return s[n]=nt(s[n],o,r),s}return{...e&&typeof e=="object"?e:{},[n]:nt((e||{})[n],o,r)}}function pe(e){if(typeof e=="string")return e.endsWith("[]")?[]:"";if(Array.isArray(e))return[];if(typeof e=="object"&&e!==null){let t={};for(let[r,n]of Object.entries(e))t[r]=pe(n);return t}return""}function Te(e,t,{ignoreActiveValue:r=!0}={}){Ze.morph(e,t,{morphStyle:"innerHTML",ignoreActiveValue:r,restoreFocus:!0,formStateSync:"property"})}function qt(e){return e.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g,"$1 $2").replace(/[-_]/g," ").replace(/\s+/g," ").trim().replace(/^./,t=>t.toUpperCase())}var _t={"@scalar":`
    <label class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <input class="hcms-input" data-hcms-field />
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
      <button type="button" class="hcms-add" data-hcms-action="add">+ Add</button>
    </section>
  `,"@scalar-array-item":`
    <li class="hcms-array-item" draggable="true">
      <span class="hcms-drag-handle" aria-hidden="true">::</span>
      <input class="hcms-input" data-hcms-field />
      <button type="button" class="hcms-move hcms-move-up hcms-sr-only" data-hcms-action="move-up" aria-label="Move up">\u2191</button>
      <button type="button" class="hcms-move hcms-move-down hcms-sr-only" data-hcms-action="move-down" aria-label="Move down">\u2193</button>
      <button type="button" class="hcms-remove" data-hcms-action="remove" aria-label="Remove">x</button>
      <div class="hcms-error" hidden></div>
    </li>
  `,"@object-array":`
    <section class="hcms-array hcms-object-array" data-hcms-shape="object-array">
      <header class="hcms-array-header">
        <h3 class="hcms-array-title" data-hcms-label></h3>
      </header>
      <div class="hcms-array-items"></div>
      <div class="hcms-error" hidden></div>
      <button type="button" class="hcms-add" data-hcms-action="add">+ Add</button>
    </section>
  `,"@object-array-item":`
    <article class="hcms-card" draggable="true">
      <header class="hcms-card-header">
        <span class="hcms-drag-handle" aria-hidden="true">::</span>
        <button type="button" class="hcms-move hcms-move-up hcms-sr-only" data-hcms-action="move-up" aria-label="Move up">\u2191</button>
        <button type="button" class="hcms-move hcms-move-down hcms-sr-only" data-hcms-action="move-down" aria-label="Move down">\u2193</button>
        <button type="button" class="hcms-remove" data-hcms-action="remove" aria-label="Remove">x</button>
      </header>
      <div class="hcms-card-fields"></div>
      <div class="hcms-error" hidden></div>
    </article>
  `},dn=Object.keys(_t);function Re(e){let t=e.head||e.documentElement;if(t)for(let r of dn){if(D(e,r))continue;let n=e.createElement("template");n.setAttribute("data-hcms-tpl",r),n.setAttribute("save-remove",""),n.innerHTML=_t[r].trim(),t.appendChild(n)}}function D(e,t){return!e||!e.querySelector?null:e.querySelector(`template[data-hcms-tpl="${fn(t)}"]`)}function fn(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}function te(e){return typeof e=="string"?e.endsWith("[]")?"scalar-array":"scalar":Array.isArray(e)?"object-array":typeof e=="object"&&e!==null?"object":"scalar"}function ye(e){return e?!!(e.content||e).querySelector("[data-hcms-field]"):!1}var Pt={IMG:"src",A:"href"};function Ce(e){if(!e)return"value";let t=(e.tagName||"").toUpperCase();return t==="INPUT"?(e.getAttribute("type")||"text").toLowerCase()==="checkbox"?"checked":"value":t==="TEXTAREA"||t==="SELECT"?"value":Pt[t]?Pt[t]:null}function Ut(e,t){let r=(e.tagName||"").toUpperCase(),n=(e.getAttribute&&e.getAttribute("type")||"").toLowerCase(),o=Ce(e),a=`${Bt(r,n)}[data-hcms-field="${re(t)}"]`;return r==="INPUT"&&n==="radio"?`${a}:checked@value`:o?`${a}@${o}`:a}function hn(e){let t=(e.tagName||"").toUpperCase(),r=(e.getAttribute&&e.getAttribute("type")||"").toLowerCase(),n=Ce(e),s=`${Bt(t,r)}[data-hcms-field]`;return t==="INPUT"&&r==="radio"?`${s}:checked@value`:n?`${s}@${n}`:s}function Bt(e,t){return e==="INPUT"?t?`input[type="${t}"]`:"input":e==="TEXTAREA"?"textarea":e==="SELECT"?"select":e==="IMG"?"img":e==="A"?"a":':not([data-hcms-shape="scalar"]):not([data-hcms-shape="object"]):not([data-hcms-shape="object-array"]):not([data-hcms-shape="scalar-array"])'}function re(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var Dt=new Set(["__proto__","constructor","prototype"]);function ke(e,t){return r(e,[]);function r(d,u){let p=te(d);if(p==="scalar")return n(d,u);if(p==="scalar-array")return o(u);if(p==="object-array")return s(d,u);if(p==="object"){let y=Object.create(null);for(let[v,w]of Object.entries(d)){if(Dt.has(v))throw new Error(`hypercms: rule key "${v}" is forbidden at "${u.join(".")||"<root>"}"`);y[v]=r(w,[...u,v])}return y}return null}function n(d,u){let p=u.length?u[u.length-1]:null,y=typeof p=="string"?p:"__value",v=c(u,y);if(v)return Ut(v,y);let w=i("@scalar",y);return w?Ut(w,y):`input[data-hcms-field="${re(y)}"]@value`}function o(d){let u=i("@scalar-array-item",null),p=u?hn(u):"input[data-hcms-field]@value";return[a(d,"[data-hcms-array-item]"),p]}function s(d,u){let[,p]=d,y=[...u,"*"],v=a(u,"[data-hcms-card]");if(p&&typeof p=="object"&&!Array.isArray(p)){let w=Object.create(null);for(let[O,b]of Object.entries(p)){if(Dt.has(O))throw new Error(`hypercms: rule key "${O}" is forbidden at "${y.join(".")}"`);w[O]=r(b,[...y,O])}return[v,w]}return[v,r(p,[...y,0])]}function a(d,u){let p=d.length?d[d.length-1]:"",y=d.some(O=>O==="*"),v=d.join(".");return`${y?`[data-hcms-field="${re(p)}"]`:`[data-hcms-path="${re(v)}"]`} > .hcms-array-items > ${u}`}function i(d,u){if(!t)return null;let p=D(t,d);if(!p)return null;let y=p.content||p;if(u){let v=y.querySelector(`[data-hcms-field="${re(u)}"]`);if(v)return v}return y.querySelector("[data-hcms-field]")}function c(d,u){if(!t)return null;let p=d.map(w=>typeof w=="number"?"*":w).join("."),v=[d.join("."),p];for(let w=d.length-1;w>=0;w--){let O=d.slice(0,w).map(b=>typeof b=="number"?"*":b);O.push("*"),v.push(O.join("."))}for(let w of v){if(!w)continue;let O=D(t,w);if(!O||!ye(O))continue;let b=O.content||O,k=b.querySelector(`[data-hcms-field="${re(u)}"]`)||b.querySelector("[data-hcms-field]");if(k)return k}return null}}function Oe({pageRules:e,formRules:t,data:r,doc:n}){let o=n.createDocumentFragment(),s=st(e,[],r,n);return s&&o.appendChild(s),o}function Vt({shape:e,itemShape:t,pathArr:r,data:n,doc:o}){if(e==="object-array-item")return Kt(t,r,n,o);if(e==="scalar-array-item")return zt(r,n,o);throw new Error(`hypercms: buildItem called with unknown shape "${e}"`)}function st(e,t,r,n){let o=te(e);return o==="scalar"?mn(t,r,n):o==="object"?pn(e,t,r,n):o==="object-array"?yn(e,t,r,n):o==="scalar-array"?gn(e,t,r,n):null}function mn(e,t,r){let n=je(e,"@scalar",r);if(!n)throw new Error(`hypercms: missing template for scalar at "${e.join(".")}"`);let o=ne(n,r);return oe(o,e),bn(o,W(e)),Ie(o,W(e)),Ne(o,W(e)),Xt(o,t),o}function pn(e,t,r,n){let o=je(t,"@object",n);if(!o)throw new Error(`hypercms: missing template for object at "${t.join(".")}"`);let s=ne(o,n);if(oe(s,t),Ie(s,W(t)),Ne(s,W(t)),ye(o))return er(s,e,t),Qt(s,e,r),s;let a=Le(s,".hcms-object-fields",o,t);for(let[i,c]of Object.entries(e)){let d=r==null?null:r[i],u=st(c,[...t,i],d,n);u&&a.appendChild(u)}return s}function yn(e,t,r,n){let o=je(t,"@object-array",n);if(!o)throw new Error(`hypercms: missing template for object-array at "${t.join(".")}"`);let s=ne(o,n);oe(s,t),Ie(s,W(t)),Ne(s,W(t)),Yt(s,o),Jt(s,o,t);let a=Le(s,".hcms-array-items",o,t),[,i]=e;return(Array.isArray(r)?r:[]).forEach((d,u)=>{let p=Kt(i,[...t,u],d,n);p&&a.appendChild(p)}),Zt(s),s}function Kt(e,t,r,n){let o=Gt(t,"object-array-item",n);if(!o)throw new Error(`hypercms: missing item template for "${t.join(".")}"`);let s=ne(o,n);if(s.setAttribute("data-hcms-card",""),s.classList.contains("hcms-card")||s.classList.add("hcms-card"),oe(s,t),ye(o))return e&&typeof e=="object"&&!Array.isArray(e)&&(er(s,e,t),Qt(s,e,r)),s;let a=Le(s,".hcms-card-fields",o,t);if(e&&typeof e=="object"&&!Array.isArray(e))for(let[i,c]of Object.entries(e)){let d=r==null?null:r[i],u=st(c,[...t,i],d,n);u&&a.appendChild(u)}return s}function gn(e,t,r,n){let o=je(t,"@scalar-array",n);if(!o)throw new Error(`hypercms: missing template for scalar-array at "${t.join(".")}"`);let s=ne(o,n);oe(s,t),Ie(s,W(t)),Ne(s,W(t)),Yt(s,o),Jt(s,o,t);let a=Le(s,".hcms-array-items",o,t);return(Array.isArray(r)?r:[]).forEach((c,d)=>{let u=zt([...t,d],c,n);u&&a.appendChild(u)}),Zt(s),s}function zt(e,t,r){let n=Gt(e,"scalar-array-item",r);if(!n)throw new Error(`hypercms: missing item template for "${e.join(".")}"`);let o=ne(n,r);return o.setAttribute("data-hcms-array-item",""),o.classList.contains("hcms-array-item")||o.classList.add("hcms-array-item"),oe(o,e),Xt(o,t),o}function je(e,t,r){let n=e.join("."),o=e.map(s=>typeof s=="number"?"*":s).join(".");return n&&D(r,n)||o&&o!==n&&D(r,o)||D(r,t)}function Gt(e,t,r){let n=e.map(o=>typeof o=="number"?"*":o).join(".");return D(r,n)||D(r,"@"+t)}function ne(e,t){let r=e.content||e,n=t.createElement("div");return n.appendChild(r.cloneNode(!0)),n.firstElementChild||n}function oe(e,t){e.setAttribute("data-hcms-path",t.join("."))}function bn(e,t){let r=t==null?"":String(t);if(e.matches&&e.matches("[data-hcms-field]")){e.getAttribute("data-hcms-field")||e.setAttribute("data-hcms-field",r);return}(e.querySelectorAll?e.querySelectorAll("[data-hcms-field]"):[]).forEach(o=>{o.getAttribute("data-hcms-field")||o.setAttribute("data-hcms-field",r)})}function Ie(e,t){t==null||t===""||!e.setAttribute||e.hasAttribute?.("data-hcms-field")||e.setAttribute("data-hcms-field",String(t))}function Ne(e,t){if(t==null||t==="")return;(e.querySelectorAll?e.querySelectorAll("[data-hcms-label]"):[]).forEach(n=>{(n.textContent||"").trim()===""&&(n.textContent=qt(String(t)))})}function Yt(e,t){["data-hcms-no-add","data-hcms-no-remove","data-hcms-no-reorder"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,"")}),["data-hcms-min-items","data-hcms-max-items"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,t.getAttribute(r))})}function Zt(e){let t=e.querySelector?e.querySelector(".hcms-array-items"):null;if(!t)return;let r=Array.from(t.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),n=r.length,o=Wt(e,"data-hcms-max-items"),s=Wt(e,"data-hcms-min-items"),a=e.hasAttribute("data-hcms-no-add"),i=e.hasAttribute("data-hcms-no-remove"),c=e.hasAttribute("data-hcms-no-reorder"),d=e.querySelector('[data-hcms-action="add"]');d&&(d.hidden=a||o!=null&&n>=o),r.forEach((u,p)=>{let y=u.querySelector('[data-hcms-action="remove"]');y&&(y.hidden=i||s!=null&&n<=s);let v=u.querySelector('[data-hcms-action="move-up"]');v&&(v.hidden=c||p===0);let w=u.querySelector('[data-hcms-action="move-down"]');w&&(w.hidden=c||p===n-1)})}function Wt(e,t){if(!e||!e.hasAttribute(t))return null;let r=parseInt(e.getAttribute(t),10);return Number.isFinite(r)?r:null}function Jt(e,t,r){if(e.hasAttribute("data-hcms-no-reorder")||t.hasAttribute("data-hcms-no-reorder"))return;let n=e.querySelector(".hcms-array-items");if(!n)return;let o="hcms-"+r.join(".");n.setAttribute("sortable",o),n.setAttribute("onsorted","hypercmsCommit && hypercmsCommit()")}function W(e){return e.length?e[e.length-1]:null}function Xt(e,t){let r=Sn(e);if(r.length!==0)for(let n of r)tr(n,t)}function Sn(e){if(!e)return[];let t=[];return e.matches?.("[data-hcms-field]")&&An(e)&&t.push(e),(e.querySelectorAll?e.querySelectorAll("input[data-hcms-field], textarea[data-hcms-field], select[data-hcms-field], img[data-hcms-field], a[data-hcms-field], [contenteditable][data-hcms-field]"):[]).forEach(n=>t.push(n)),t}function An(e){let t=(e.tagName||"").toUpperCase();return!!(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||t==="IMG"||t==="A"||e.hasAttribute?.("contenteditable"))}function Qt(e,t,r){(e.querySelectorAll?e.querySelectorAll("[data-hcms-field]"):[]).forEach(o=>{let s=o.getAttribute("data-hcms-field");if(!s)return;if(!t||typeof t!="object"||!(s in t)){console.warn(`[hypercms] inline template field "${s}" is not in the rule shape; ignoring`);return}let a=r==null?null:r[s];tr(o,a)})}function er(e,t,r){if(!e.querySelectorAll)return;e.querySelectorAll("[data-hcms-field]").forEach(o=>{let s=o.getAttribute("data-hcms-field");if(!s||t&&typeof t=="object"&&!(s in t))return;let a=[...r,s].join(".");o.setAttribute("data-hcms-path",a)})}function Le(e,t,r,n){if(!e.querySelector)return e;let o=e.querySelector(t);if(o)return o;let s=r?.getAttribute?.("data-hcms-tpl")||n.join(".");throw new Error(`hypercms: template "${s}" is in slotted mode but has no ${t} element`)}function tr(e,t){let r=Ce(e),n=(e.tagName||"").toUpperCase(),o=(e.getAttribute("type")||"").toLowerCase();if(n==="INPUT"&&o==="radio"){e.checked=e.value!=null&&String(e.value)===String(t??"");return}if(r==="checked"){e.checked=t===!0||t==="true";return}if(r){e[r]=t==null?"":String(t);return}e.textContent=t==null?"":String(t)}var rr={skip:"[data-hcms-shell]",templateAttr:"cms-template"};function nr(e,t,r,n={}){let{observerHandle:o,shellRoot:s,structural:a,structuralPath:i}=n;o?.pause?.();try{if(!a)try{return q.apply(e,t,r,rr),{ok:!0}}catch(p){return{ok:!1,error:p}}let c=vn(e,t,i),d=c?En(c):null,u=c?null:Mn(e,s);try{return q.apply(e,t,r,rr),{ok:!0}}catch(p){return d?wn(c,d):u&&Tn(e,s,u),{ok:!1,error:p}}}finally{o?.resume?.()}}function vn(e,t,r){if(!r||!e)return null;let n=V(r),o=[],s=t;for(let a of n){if(typeof s=="string"||s==null||Array.isArray(s))break;if(typeof s=="object"&&a in s){if(o.push(a),s=s[a],Array.isArray(s)||typeof s=="string"&&s.endsWith("[]"))break}else return null}return!Array.isArray(s)&&!(typeof s=="string"&&s.endsWith("[]"))?null:xn(e,t,o)}function xn(e,t,r){if(r.length===0)return null;let n=e,o=t;for(let s=0;s<r.length;s++){let a=r[s];if(!o||typeof o!="object"||Array.isArray(o))return null;let i=o[a];if(i==null)return null;if(s===r.length-1){if(Array.isArray(i)){let[c]=i;return n.querySelector?.(c)?.parentElement||null}if(typeof i=="string"&&i.endsWith("[]")){let c=i.slice(0,-2);return n.querySelector?.(c)?.parentElement||null}return null}o=i}return null}function En(e){let t=[];for(let r of Array.from(e.childNodes))t.push(r.cloneNode(!0));return t}function wn(e,t){for(;e.firstChild;)e.removeChild(e.firstChild);for(let r of t)e.appendChild(r)}function Mn(e,t){let r=[];for(let n of Array.from(e.childNodes))n===t||t&&n.contains?.(t)||r.push(n.cloneNode(!0));return r}function Tn(e,t,r){for(let o of Array.from(e.childNodes))o===t||t&&o.contains?.(t)||e.removeChild(o);let n=Rn(e,t);for(let o of r)e.insertBefore(o,n||null)}function Rn(e,t){if(!t)return null;for(let r of Array.from(e.childNodes))if(r===t||r.contains?.(t))return r;return null}var it=new WeakSet;function se(e,t){let r=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;if(!r)return t();r.pause();try{let n=t();return n&&n.ok?r.commitCaptured(e):r.discardCaptured(),n}finally{r.resume()}}function at(e){let t=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;if(!t)return e();t.pause();try{return e()}finally{t.discardCaptured(),t.resume()}}function ir(e){let{formRoot:t}=e;if(!t||it.has(t))return;it.add(t);let r=a=>{let i=a.target;!i||!i.closest||i.closest("[data-hcms-form-root]")&&i.matches("input, textarea, select")&&(!i.closest("[data-hcms-field]")&&!i.hasAttribute?.("data-hcms-field")||or(i,e))},n=a=>{let i=a.target;!i||!i.closest||i.closest("[data-hcms-form-root]")&&i.matches('input[type="checkbox"], input[type="radio"], select')&&or(i,e)},o=a=>{let i=a.target;if(!i||!i.closest)return;let c=i.closest("[data-hcms-action]");if(!c)return;let d=c.getAttribute("data-hcms-action");if(d==="add"||d==="remove"||d==="move-up"||d==="move-down"){if(!c.closest("[data-hcms-form-root]"))return}else if((d==="close"||d==="save")&&!c.closest("[data-hcms-shell]"))return;if(d==="add"){let u=c.closest("[data-hcms-path]");if(!u)return;let p=u.getAttribute("data-hcms-path");ct(p,e)}else if(d==="remove"){let u=c.closest("[data-hcms-card], [data-hcms-array-item]");if(!u)return;lt(u,e)}else if(d==="move-up"||d==="move-down"){let u=c.closest("[data-hcms-card], [data-hcms-array-item]");if(!u)return;Cn(u,d==="move-up"?-1:1,e)}else d==="close"?e.onCloseRequested?.():d==="save"&&kn(e)},s=t.ownerDocument;s.addEventListener("input",r,!0),s.addEventListener("change",n,!0),s.addEventListener("click",o,!0),e.detachEvents=()=>{s.removeEventListener("input",r,!0),s.removeEventListener("change",n,!0),s.removeEventListener("click",o,!0),it.delete(t)}}function or(e,t){let n=(e.closest("[data-hcms-field]")||e).closest("[data-hcms-path]")?.getAttribute("data-hcms-path")||"";K(_(t),{path:n,structural:!1},t)}function ct(e,t){let{formRoot:r,pageRules:n}=t,o=r.querySelector(`[data-hcms-path="${$n(e)}"]`);if(!o)throw new Error(`hypercms: no element at path "${e}"`);let s=o.querySelector(".hcms-array-items");if(!s)throw new Error(`hypercms: array container missing .hcms-array-items at "${e}"`);let a=V(e),i=Nn(n,a),c=Array.isArray(i),d=typeof i=="string"&&i.endsWith("[]");if(!c&&!d)throw new Error(`hypercms: path "${e}" is not an array`);let u=$e(o,"data-hcms-max-items"),p=s.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]");if(o.hasAttribute("data-hcms-no-add")||u!=null&&p.length>=u)return;let y=p.length,v=c?i[1]:i.replace(/\[\]$/,""),w=pe(c?v:"string"),O=Vt({shape:c?"object-array-item":"scalar-array-item",itemShape:v,pathArr:[...a,y],data:w,doc:t.doc});return s.appendChild(O),dt(o),se(`Add ${e}`,()=>K(_(t),{path:e,structural:!0},t))}function Cn(e,t,r){let n=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]');if(!n||n.hasAttribute("data-hcms-no-reorder"))return;let o=n.querySelector(".hcms-array-items");if(!o)return;let s=Array.from(o.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),a=s.indexOf(e);if(a<0)return;let i=a+t;if(i<0||i>=s.length)return;let c=e.querySelector(`[data-hcms-action="${t<0?"move-up":"move-down"}"]`);return t<0?o.insertBefore(e,s[i]):o.insertBefore(e,s[i].nextSibling),ht(o),dt(n),c&&typeof c.focus=="function"&&e.querySelector(`[data-hcms-action="${t<0?"move-up":"move-down"}"]`)?.focus?.(),se(`Reorder ${n.getAttribute("data-hcms-path")||""}`,()=>K(_(r),{path:n.getAttribute("data-hcms-path")||"",structural:!0},r))}function lt(e,t){let r=e.getAttribute("data-hcms-path")||"",n=e.parentElement,o=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]');if(!o?.hasAttribute("data-hcms-no-remove")){if(o){let s=$e(o,"data-hcms-min-items"),a=o.querySelector(".hcms-array-items"),i=a?a.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]").length:0;if(s!=null&&i<=s)return}return e.remove(),n&&ht(n),o&&dt(o),se(`Remove ${r}`,()=>K(_(t),{path:r,structural:!0},t))}}function kn(e){let t=_(e);e.dispatch?.("hcms:save",{data:t}),e.onSave?.(t)}function K(e,t,r){let n=mt(e);if(n===r.lastFingerprint)return{ok:!0,skipped:!0};let o=nr(r.pageRoot,r.pageRules,e,{observerHandle:r.observerHandle,shellRoot:r.shellRoot,structural:!!t.structural,structuralPath:t.path||null});return o.ok?(r.lastFingerprint=n,r.lastData=e,sr(r,null),r.dispatch?.("hcms:change",{data:e,path:t.path,structural:!!t.structural}),r.onChange?.(e,t)):(sr(r,In(o.error,t.path)),r.dispatch?.("hcms:error",{error:o.error,attemptedData:e}),r.onError?.(o.error)),o}function _(e){let t=q.extract(e.formRoot,e.formRules);return Z(t,e.formRules)}function Z(e,t){if(t==null||e==null)return e;if(typeof t=="string")return t.endsWith("@checked")?e===!0||e==="true":e;if(Array.isArray(t)){if(!Array.isArray(e))return e;let[,r]=t;return e.map(n=>Z(n,r))}if(typeof t=="object"){if(typeof e!="object"||Array.isArray(e))return e;let r={};for(let[n,o]of Object.entries(t))r[n]=Z(e[n],o);return r}return e}function sr(e,t){e.lastErrors=t&&t.length?t:null,ut(e)}function ut(e){if(On(e),e.errorEl&&(e.errorEl.textContent="",e.errorEl.hidden=!0),!e.lastErrors)return;let t=[];for(let{message:r,path:n}of e.lastErrors){if(n!=null&&n!==""){let o=jn(e.formRoot,n);if(o){o.textContent=o.textContent?`${o.textContent}
${r}`:r,o.hidden=!1;continue}}t.push(r)}t.length&&e.errorEl&&(e.errorEl.textContent=t.join(`
`),e.errorEl.hidden=!1)}function On(e){if(e.formRoot)for(let t of e.formRoot.querySelectorAll(".hcms-error"))t.textContent="",t.hidden=!0}function jn(e,t){if(!e)return null;let r=t.split(".");for(;r.length>0;){let n=r.join("."),o=typeof CSS<"u"&&CSS.escape?CSS.escape(n):n.replace(/[^a-zA-Z0-9_\-.*]/g,a=>"\\"+a),s=e.querySelector(`[data-hcms-path="${o}"]`);if(s){for(let a of s.children)if(a.classList&&a.classList.contains("hcms-error"))return a}r.pop()}return null}function In(e,t){return e?e.name==="EmptyListInsert"?[{message:"Add a seed item in HTML first.",path:t}]:e.name==="ShapeMismatch"&&Array.isArray(e.mismatches)&&e.mismatches.length?e.mismatches.map(r=>({message:`Shape mismatch: expected ${r.expected}, got ${r.got}`,path:r.path})):[{message:e.message||String(e),path:t}]:[{message:"unknown error",path:t}]}function Nn(e,t){let r=e;for(let n of t){if(r==null||typeof r=="string")return;if(Array.isArray(r)){if(typeof n!="number"&&n!=="*")return;r=r[1];continue}if(typeof r=="object"){if(typeof n=="number"||!(n in r))return;r=r[n];continue}return}return r}function $e(e,t){if(!e||!e.hasAttribute(t))return null;let r=parseInt(e.getAttribute(t),10);return Number.isFinite(r)?r:null}function dt(e){if(!e)return;let t=e.querySelector(".hcms-array-items");if(!t)return;let r=Array.from(t.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),n=r.length,o=$e(e,"data-hcms-max-items"),s=$e(e,"data-hcms-min-items"),a=e.hasAttribute("data-hcms-no-add"),i=e.hasAttribute("data-hcms-no-remove"),c=e.hasAttribute("data-hcms-no-reorder"),d=e.querySelector(':scope > .hcms-add, :scope > * > .hcms-add, :scope > [data-hcms-action="add"]');d&&(d.hidden=a||o!=null&&n>=o),r.forEach((u,p)=>{let y=u.querySelector('[data-hcms-action="remove"]');y&&(y.hidden=i||s!=null&&n<=s);let v=u.querySelector('[data-hcms-action="move-up"]');v&&(v.hidden=c||p===0);let w=u.querySelector('[data-hcms-action="move-down"]');w&&(w.hidden=c||p===n-1)})}function ft(e){!e||!e.querySelectorAll||e.querySelectorAll(".hcms-array-items").forEach(t=>ht(t))}function ht(e){let t=0;for(let r of e.children){if(!r.matches?.("[data-hcms-card], [data-hcms-array-item]"))continue;let n=r.getAttribute("data-hcms-path");if(!n)continue;let o=n.split(".");o[o.length-1]=String(t);let s=o.join(".");s!==n&&Ln(r,n,s),t++}}function Ln(e,t,r){let n=e.querySelectorAll("[data-hcms-path]");e.setAttribute("data-hcms-path",r);for(let o of n){let s=o.getAttribute("data-hcms-path");s===t?o.setAttribute("data-hcms-path",r):s&&s.startsWith(t+".")&&o.setAttribute("data-hcms-path",r+s.slice(t.length))}}function mt(e){return JSON.stringify(e,(t,r)=>{if(r&&typeof r=="object"&&!Array.isArray(r)){let n=Object.create(null);for(let o of Object.keys(r).sort())n[o]=r[o];return n}return r})}function $n(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var Un={},pt="hcms-shell-styles",Hn="hcms-bundled-styles-installed",Fn='a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',ge=new WeakSet,yt="";function ar(e){yt=e}var qn=0;function cr({mountTo:e,side:t="right",overlay:r=!1,showSaveButton:n=!1,doc:o}){_n(o);let s=`hcms-shell-title-${++qn}`,a=o.createElement("div");a.setAttribute("data-hcms-shell",""),a.setAttribute("save-remove",""),a.setAttribute("save-ignore",""),a.setAttribute("tabindex","-1"),a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"),a.setAttribute("aria-labelledby",s),a.className="hcms-shell hcms-side-"+t+(r?" hcms-overlay":""),a.innerHTML=`
    <header class="hcms-shell-header">
      <h2 class="hcms-shell-title" id="${s}">Edit</h2>
      <button type="button" class="hcms-shell-close" data-hcms-action="close" aria-label="Close">\xD7</button>
    </header>
    <div class="hcms-shell-error" role="alert" hidden></div>
    <div data-hcms-form-root class="hcms-form"></div>
    <footer class="hcms-shell-footer"${n?"":" hidden"}>
      <button type="button" class="hcms-shell-save" data-hcms-action="save">Save</button>
    </footer>
  `,(e||o.body).appendChild(a);let c=o.body;c.classList.add("hcms-open"),r&&c.classList.add("hcms-overlay"),t==="left"&&c.classList.add("hcms-side-left");let d=Pn(a,o);return{root:a,formRoot:a.querySelector("[data-hcms-form-root]"),errorEl:a.querySelector(".hcms-shell-error"),saveButton:a.querySelector(".hcms-shell-save"),destroy(){d.detach(),a.remove(),c.classList.remove("hcms-open","hcms-overlay","hcms-side-left")}}}function _n(e){if(e&&!ge.has(e)){if(e[Hn]){ge.add(e);return}if(e.getElementById(pt)||e.querySelector("style[data-hcms-bundled-styles]")){ge.add(e);return}if(yt){let t=e.createElement("style");t.id=pt,t.setAttribute("save-remove",""),t.textContent=yt,(e.head||e.documentElement).appendChild(t),ge.add(e);return}try{let t=new URL("./styles.css",Un.url).href,r=e.createElement("link");r.rel="stylesheet",r.id=pt,r.setAttribute("save-remove",""),r.href=t,(e.head||e.documentElement).appendChild(r),ge.add(e)}catch{}}}function Pn(e,t){function r(n){if(n.key!=="Tab"||!e.contains(t.activeElement))return;let o=Array.from(e.querySelectorAll(Fn));if(o.length===0)return;let s=o[0],a=o[o.length-1];n.shiftKey&&t.activeElement===s?(n.preventDefault(),a.focus()):!n.shiftKey&&t.activeElement===a&&(n.preventDefault(),s.focus())}return t.addEventListener("keydown",r),{detach:()=>t.removeEventListener("keydown",r)}}var Dn={skip:"[data-hcms-shell]",templateAttr:"cms-template"};function He(e,{ignoreActiveValue:t}={}){let r=q.findRules(e.doc,e.rulesSource||"cms");r&&(e.pageRules=r.rules,e.rulesTagNode=r.tagNode),Re(e.doc),e.formRules=ke(e.pageRules,e.doc);let n=Z(q.extract(e.pageRoot,e.pageRules,Dn),e.pageRules),o=Oe({pageRules:e.pageRules,formRules:e.formRules,data:n,doc:e.doc});Te(e.formRoot,o,{ignoreActiveValue:t}),ut(e),e.updateFingerprint&&e.updateFingerprint()}function lr({debounce:e=100,onRefresh:t}){let r=typeof window<"u"&&window.hyperclay&&window.hyperclay.Mutation||null;if(!r||typeof r.onAnyChange!="function")throw new Error("hypercms: window.hyperclay.Mutation is required. Load hyperclayjs (or just the mutation utility) before initializing hypercms.");let n=0,o=r.onAnyChange({debounce:e},()=>{n>0||t()});return{unsubscribe:typeof o=="function"?o:()=>{},pause(){n++},resume(){n=Math.max(0,n-1)}}}var Bn="[hypercms]";function ur(e,t){if(!e||!e.querySelectorAll||!t)return;let r=Wn(t);e.querySelectorAll("template[data-hcms-tpl]").forEach(o=>{let s=o.getAttribute("data-hcms-tpl");s&&(s.startsWith("@")||r.has(s)||console.warn(`${Bn} template "${s}" doesn't match any rule path; ignored`))})}function Wn(e){let t=new Set;return r([],e),t;function r(n,o){let s=n.join("."),a=n.map(c=>typeof c=="number"?"*":c).join(".");s&&t.add(s),a&&t.add(a);let i=te(o);if(i==="object")for(let[c,d]of Object.entries(o))r([...n,c],d);else if(i==="object-array"||i==="scalar-array"){let c=[...n,"*"],d=c.map(u=>typeof u=="number"?"*":u).join(".");if(t.add(d),i==="object-array"){let u=o[1];if(u&&typeof u=="object"&&!Array.isArray(u))for(let[p,y]of Object.entries(u))r([...c,p],y)}}}}function dr(e){ar(e)}var I={isOpen:!1,ctx:null,shell:null,opts:null};function Vn(e={}){if(I.isOpen){console.warn("cms.open() called while already open; ignoring");return}let t=e.pageRoot||(typeof document<"u"?document.body:null);if(!t)throw new Error("hypercms: no pageRoot available");let r=t.ownerDocument||(typeof document<"u"?document:null);if(!r)throw new Error("hypercms: no document available");let n=e.rules!==void 0?e.rules:"cms",o=q.findRules(r,n);if(!o){let v=typeof n=="string"?`data-rules-name~="${n}"`:"the provided rules object";throw new Error(`hypercms: no rules found for ${v}`)}let s=o.rules,a=o.tagNode;Re(r),ur(r,s);let i=ke(s,r),c=Z(q.extract(t,s,{skip:"[data-hcms-shell]",templateAttr:"cms-template"}),s),d=at(()=>cr({mountTo:e.mountTo||r.body,side:e.side||"right",overlay:!!e.overlay,showSaveButton:!!e.showSaveButton,doc:r})),u={doc:r,pageRoot:t,pageRules:s,formRules:i,rulesTagNode:a,rulesSource:n,formRoot:d.formRoot,shellRoot:d.root,errorEl:d.errorEl,lastFingerprint:null,lastData:null,observerHandle:null,undoUnsub:null,onChange:e.onChange,onError:e.onError,onSave:e.onSave,previouslyFocused:r.activeElement,dispatch(v,w){let O=r.defaultView&&r.defaultView.CustomEvent||(typeof CustomEvent<"u"?CustomEvent:null);if(!O)return;let b=new O(v,{bubbles:!0,cancelable:v==="hcms:change"||v==="hcms:save",detail:w});d.root.dispatchEvent(b)},onCloseRequested(){fr()}};u.updateFingerprint=()=>{u.lastFingerprint=mt(_(u))};let p=Oe({pageRules:s,formRules:i,data:c,doc:r});d.formRoot.appendChild(p),ir(u),u.updateFingerprint(),u.observerHandle=lr({onRefresh:()=>He(u)});let y=typeof window<"u"&&window.hyperclay&&window.hyperclay.undo||null;if(y&&typeof y.on=="function"){let v=()=>He(u,{ignoreActiveValue:!1});y.on("undo",v),y.on("redo",v),u.undoUnsub=()=>{y.off("undo",v),y.off("redo",v)}}gt.ctx=u,zn(r),Kn(d.root),I.isOpen=!0,I.ctx=u,I.shell=d,I.opts=e,u.dispatch("hcms:open",{pageRoot:t})}function Kn(e){let r=e.querySelector('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');r&&typeof r.focus=="function"&&r.focus()}var gt={ctx:null};function zn(e){let t=e.defaultView||(typeof globalThis<"u"?globalThis:null);if(!t)return;let r=function(){let o=gt.ctx;if(o)return ft(o.formRoot),se("Reorder",()=>K(_(o),{path:"",structural:!0},o))};typeof t.hypercmsCommit!="function"&&(t.hypercmsCommit=r),typeof globalThis<"u"&&typeof globalThis.hypercmsCommit!="function"&&(globalThis.hypercmsCommit=r)}function fr(){if(!I.isOpen)return;let{ctx:e,shell:t}=I,r=e.previouslyFocused;if(e.dispatch("hcms:close",null),e.observerHandle?.unsubscribe?.(),e.undoUnsub?.(),e.detachEvents?.(),at(()=>t.destroy()),I.isOpen=!1,I.ctx=null,I.shell=null,I.opts=null,gt.ctx=null,r&&typeof r.focus=="function")try{r.focus()}catch{}}function hr(){I.isOpen&&He(I.ctx)}var Gn={getData(){return I.isOpen?_(I.ctx):null},setValue(e,t){if(!I.isOpen)throw new Error("hypercms: cms is not open");let r=I.ctx,n=V(e),o=me(r.pageRules,n);if(o===void 0)throw new Error(`hypercms: no rule at path "${e}"`);if(typeof o!="string"||o.endsWith("[]"))throw new Error(`hypercms: setValue requires a leaf scalar path; "${e}" is not a leaf`);let s=Yn(r.formRoot,e);if(!s)throw new Error(`hypercms: no field element at path "${e}"`);Zn(s,t,r.formRoot,e),K(_(r),{path:e,structural:!1},r)},addItem(e){if(!I.isOpen)throw new Error("hypercms: cms is not open");ct(e,I.ctx)},removeItem(e){if(!I.isOpen)throw new Error("hypercms: cms is not open");let t=I.ctx,r=V(e);if(typeof r[r.length-1]!="number")throw new Error(`hypercms: removeItem requires an item path; "${e}" is not an array index`);let o=me(t.pageRules,r.slice(0,-1));if(!(Array.isArray(o)||typeof o=="string"&&o.endsWith("[]")))throw new Error(`hypercms: removeItem requires an item path; parent of "${e}" is not an array`);let a=t.formRoot.querySelector(`[data-hcms-path="${St(e)}"]`);if(!a)throw new Error(`hypercms: no element at path "${e}"`);lt(a,t)},refresh:hr,_commit(){if(!I.isOpen)return;let e=I.ctx;return ft(e.formRoot),se("Update",()=>K(_(e),{path:"",structural:!0},e))}};function Yn(e,t){let r=St(t),n=`[data-hcms-path="${r}"] input[data-hcms-field], [data-hcms-path="${r}"] textarea[data-hcms-field], [data-hcms-path="${r}"] select[data-hcms-field], [data-hcms-path="${r}"] img[data-hcms-field], [data-hcms-path="${r}"] a[data-hcms-field], [data-hcms-path="${r}"] [contenteditable][data-hcms-field], input[data-hcms-path="${r}"][data-hcms-field], textarea[data-hcms-path="${r}"][data-hcms-field], select[data-hcms-path="${r}"][data-hcms-field], img[data-hcms-path="${r}"][data-hcms-field], a[data-hcms-path="${r}"][data-hcms-field], [contenteditable][data-hcms-path="${r}"][data-hcms-field]`;return e.querySelector(n)}function Zn(e,t,r,n){let o=(e.tagName||"").toUpperCase(),s=(e.getAttribute("type")||"").toLowerCase();if(o==="INPUT"&&s==="checkbox"){e.checked=t===!0||t==="true";return}if(o==="INPUT"&&s==="radio"){let a=St(n),i=r.querySelectorAll(`[data-hcms-path="${a}"][data-hcms-field][type="radio"], [data-hcms-path="${a}"] [data-hcms-field][type="radio"]`);i.length?i.forEach(c=>{c.checked=String(c.value)===String(t??"")}):e.checked=String(e.value)===String(t??"");return}if(o==="IMG"){e.src=t==null?"":String(t);return}if(o==="A"){e.href=t==null?"":String(t);return}if("value"in e){e.value=t==null?"":String(t);return}e.textContent=t==null?"":String(t)}var bt={open:Vn,close:fr,refresh:hr,api:Gn,get isOpen(){return I.isOpen},path:ot,scaffold:pe,morphForm:Te};function St(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var mr=`.hcms-shell {
  --hcms-primary: #2563eb;
  --hcms-bg: #F6F7F9;
  --hcms-text: #0f172a;
  --hcms-muted: #64748b;
  --hcms-border: #e2e8f0;
  --hcms-error: #b91c1c;
  --hcms-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  font-family: var(--hcms-font-family);
  font-size: 14px;
  line-height: 1.45;
  color: var(--hcms-text);
  background: var(--hcms-bg);
  box-sizing: border-box;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100vw;
  max-width: 400px;
  overflow-y: auto;
  border-left: 1px solid var(--hcms-border);
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(15, 23, 42, 0.08);
}

.hcms-shell.hcms-side-left {
  left: 0;
  right: auto;
  border-left: 0;
  border-right: 1px solid var(--hcms-border);
  box-shadow: 4px 0 24px rgba(15, 23, 42, 0.08);
}

.hcms-shell * {
  box-sizing: border-box;
}

.hcms-shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--hcms-border);
}

.hcms-shell-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.hcms-shell-close {
  background: transparent;
  border: 0;
  color: var(--hcms-muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.hcms-shell-close:hover { background: rgba(15, 23, 42, 0.06); color: var(--hcms-text); }

.hcms-shell-error {
  margin: 12px 16px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--hcms-error);
  border-radius: 6px;
  font-size: 13px;
}

.hcms-form {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hcms-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hcms-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--hcms-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hcms-input {
  font-family: inherit;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid var(--hcms-border);
  border-radius: 6px;
  background: #fdfdfd;
  color: var(--hcms-text);
  width: 100%;
}
.hcms-input:focus {
  outline: 2px solid var(--hcms-primary);
  outline-offset: -1px;
  border-color: var(--hcms-primary);
}

textarea.hcms-input { min-height: 80px; resize: vertical; }

.hcms-object {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--hcms-border);
  border-radius: 8px;
  background: #fdfdfd;
}

.hcms-object-title,
.hcms-array-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--hcms-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hcms-array {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hcms-array-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.hcms-array-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.hcms-array-item,
.hcms-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fdfdfd;
  border: 1px solid var(--hcms-border);
  border-radius: 6px;
}

.hcms-card {
  flex-direction: column;
  align-items: stretch;
  padding: 12px;
  gap: 10px;
}

.hcms-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hcms-card-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hcms-drag-handle {
  cursor: grab;
  color: var(--hcms-muted);
  user-select: none;
  font-family: monospace;
  font-size: 14px;
}

.hcms-remove,
.hcms-add {
  font-family: inherit;
  background: transparent;
  border: 1px solid var(--hcms-border);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--hcms-muted);
}
.hcms-remove:hover { color: var(--hcms-error); border-color: #fecaca; }
.hcms-add { align-self: flex-start; padding: 6px 12px; color: var(--hcms-text); }
.hcms-add:hover { border-color: var(--hcms-primary); color: var(--hcms-primary); }

.hcms-error {
  margin: 6px 0;
  padding: 6px 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--hcms-error);
  border-radius: 6px;
  font-size: 12px;
}
.hcms-error[hidden] { display: none; }

.hcms-shell-footer {
  border-top: 1px solid var(--hcms-border);
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
}

.hcms-shell-save {
  font-family: inherit;
  background: var(--hcms-primary);
  color: #fdfdfd;
  border: 0;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}
.hcms-shell-save:hover { filter: brightness(1.08); }

@media (max-width: 799px) {
  .hcms-shell { max-width: 100vw; }
}

/* Scroll lock only when the sidebar covers the page (overlay + mobile fullscreen). In push mode the page keeps its own scroll. */
body.hcms-open.hcms-overlay {
  overflow: hidden;
}

body.hcms-open:not(.hcms-overlay) {
  padding-right: 400px;
}
body.hcms-open.hcms-side-left:not(.hcms-overlay) {
  padding-right: 0;
  padding-left: 400px;
}
@media (max-width: 799px) {
  body.hcms-open:not(.hcms-overlay),
  body.hcms-open.hcms-side-left:not(.hcms-overlay) {
    padding-right: 0;
    padding-left: 0;
  }
  body.hcms-open {
    overflow: hidden;
  }
}

/* sr-only: visually hidden but accessible to screen readers + becomes
   visible on keyboard focus, so keyboard users can see move buttons land. */
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
  background: #F6F7F9;
  border: 1px solid #c0c8d6;
  border-radius: 3px;
  color: #1f2532;
  font-size: 12px;
  cursor: pointer;
}
.hcms-sr-only[hidden] { display: none; }
`;dr(mr);var Qn=bt,eo={cms:bt};return Sr(to);})();

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

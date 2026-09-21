var hypercms=(()=>{var Dr=Object.defineProperty;var _s=Object.getOwnPropertyDescriptor;var Ts=Object.getOwnPropertyNames;var Cs=Object.prototype.hasOwnProperty;var qr=(e,t)=>{for(var r in t)Dr(e,r,{get:t[r],enumerable:!0})},Os=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of Ts(t))!Cs.call(e,i)&&i!==r&&Dr(e,i,{get:()=>t[i],enumerable:!(n=_s(t,i))||n.enumerable});return e};var Rs=e=>Os(Dr({},"__esModule",{value:!0}),e);var cu={};qr(cu,{cms:()=>au,default:()=>lu});function ae(e){let t=0,r=null,n=-1;for(let i=0;i<e.length;i++){let o=e[i];o==="\\"?i++:r?o===r&&(r=null):o==='"'||o==="'"?r=o:o==="["||o==="("?t++:o==="]"||o===")"?t>0&&t--:o==="@"&&t===0&&(n=i)}return n}function Ht(e){let t=ae(e);return t===-1?{selector:e,prop:null}:{selector:e.slice(0,t),prop:e.slice(t+1)||null}}var Vn={includeClasses:!0,includeAttributes:["href","src","name","type","role","aria-label","alt","title"],excludeAttributePrefixes:["data-morph-","data-hyper-","data-im-"],textHintLength:64,excludeIds:!0,maxPathDepth:4,landmarks:["HEADER","NAV","MAIN","ASIDE","FOOTER","SECTION","ARTICLE"],weights:{signature:100,pathSegment:10,textMatch:20,textMismatch:25,uniqueCandidate:50,positionPenalty:1,maxDriftPenalty:19,slotMatch:30},minConfidence:101,maxScoredCandidates:16};function Ns(e){let t=5381;for(let r=0;r<e.length;r++)t=(t<<5)+t^e.charCodeAt(r);return Math.abs(t).toString(36)}function Ls(e){if(e.classList&&e.classList.length>0)return Array.from(e.classList).sort().join(" ");let t=e.getAttribute?.("class");return t?t.split(/\s+/).filter(Boolean).sort().join(" "):""}function Is(e,t){let r=[];for(let n of e.attributes||[]){let i=n.name;i==="id"||i==="class"||t.excludeAttributePrefixes.some(o=>i.startsWith(o))||t.includeAttributes.includes(i)&&r.push(`${i}=${n.value}`)}return r.sort().join("|")}function js(e,t){return(e.textContent||"").replace(/\s+/g," ").trim().slice(0,t.textHintLength)}function Fs(e,t){let r=[e.tagName];return t.includeClasses&&r.push(Ls(e)),r.push(Is(e,t)),Ns(r.join("|"))}function Ds(e){let t=e.tagName,r=1,n=e.previousElementSibling;for(;n;)n.tagName===t&&r++,n=n.previousElementSibling;return r}function qs(e,t){return e.getAttribute?.("id")||e.getAttribute?.("role")?!0:t.landmarks.includes(e.tagName)}function $s(e){let t=e.getAttribute?.("id");if(t)return`#${t}`;let r=e.getAttribute?.("role");return r?`@${r}`:e.tagName}function Ps(e,t){let r=[],n=e;for(;n&&n.tagName&&r.length<t.maxPathDepth;){let i=`${n.tagName}:${Ds(n)}`;if(r.unshift(i),n!==e&&qs(n,t)){r.unshift($s(n));break}n=n.parentElement}return r}function Bs(e,t){let r=0,n=e.length-1,i=t.length-1;for(;n>=0&&i>=0&&e[n]===t[i];)r++,n--,i--;return r}function ye(e,t,r){if(r.has(e))return r.get(e);let n={signature:Fs(e,t),path:Ps(e,t),textHint:js(e,t)};return r.set(e,n),n}function Yn(e,t,r,n){if(n.has(e))return n.get(e);let i=new Map,o=e.querySelectorAll("*"),a=0;for(let s of o){let l=ye(s,t,r);l.domIndex=a++,!t.shouldIgnore?.(s)&&(i.has(l.signature)||i.set(l.signature,[]),i.get(l.signature).push(s))}return n.set(e,i),i}function zs(e,t,r){r.delete(e),t.delete(e);let n=e.querySelectorAll("*");for(let i of n)t.delete(i)}function $r(e,t,r,n,i){let o=ye(e,r,n),a=ye(t,r,n),s=r.weights,l={},u=0;if(o.signature!==a.signature)return{score:0,breakdown:{rejected:"signature mismatch"}};u+=s.signature,l.signature=s.signature;let y=Bs(o.path,a.path)*s.pathSegment;u+=y,l.path=y;let c=!0;if(o.textHint&&a.textHint?o.textHint===a.textHint?(u+=s.textMatch,l.text=s.textMatch):(u-=s.textMismatch,l.text=-s.textMismatch,c=!1):o.textHint!==a.textHint&&(u-=s.textMismatch,l.text=-s.textMismatch,c=!1),i.candidateCount===1&&c&&(u+=s.uniqueCandidate,l.unique=s.uniqueCandidate),typeof o.domIndex=="number"&&typeof a.domIndex=="number"){let h=Math.abs(o.domIndex-a.domIndex),f=Math.min(h*s.positionPenalty,s.maxDriftPenalty);u-=f,l.drift=-f}return{score:u,breakdown:l}}function Wn(e,t,r,n,i){if(r.excludeIds&&e.getAttribute("id"))return null;let o=Yn(t,r,n,i),a=ye(e,r,n);if(typeof a.domIndex!="number"){let c=0,h=e.previousElementSibling;for(;h;)c++,h=h.previousElementSibling;a.domIndex=c}let s=o.get(a.signature)||[],l=r.excludeIds?s.filter(c=>!c.getAttribute("id")):s;if(l.length===0)return null;let u=null,m=0,y=null;for(let c of l){let{score:h,breakdown:f}=$r(e,c,r,n,{candidateCount:l.length});h>m&&(m=h,u=c,y=f)}return m<r.minConfidence?null:{element:u,confidence:m,breakdown:y}}function Hs(e,t,r,n){let i=[],o=r.weights.signature+r.weights.slotMatch,a={slot:o};function s(y){if(y.children)return y.children;let c=y.childNodes;if(!c)return[];let h=[];for(let f=0;f<c.length;f++)c[f].nodeType===1&&h.push(c[f]);return h}function l(y,c){let h=s(y),f=s(c);if(h.length===f.length)for(let b=0;b<h.length;b++){let k=h[b],A=f[b];if(r.shouldIgnore?.(k)||r.shouldIgnore?.(A)||r.excludeIds&&(k.getAttribute("id")||A.getAttribute("id"))||k.tagName!==A.tagName)continue;let E=ye(k,r,n).signature,L=ye(A,r,n).signature;E!==L&&i.push({newEl:k,oldEl:A,score:o,breakdown:a}),l(k,A)}}function u(y,c){for(;;){if(y.tagName===c.tagName)return[y,c];let h=s(y);if(!y.tagName&&h.length===1){y=h[0];continue}let f=s(c);if(f.length===1&&f[0].tagName===y.tagName){c=f[0];continue}return null}}let m=u(e,t);return m&&l(m[0],m[1]),i}function Kn(e,t,r,n,i){let o=t.querySelectorAll("*"),a=Yn(e,r,n,i),s=0;for(let h of o){let f=ye(h,r,n);f.domIndex=s++}let l=[],u=new Map;function m(h,f,b){let k=new Set;if(h.textHint){let O=u.get(h.signature);if(!O){O=new Map;for(let U of f){let ie=ye(U,r,n).textHint,ee=O.get(ie);ee||(ee=[],O.set(ie,ee)),ee.push(U)}u.set(h.signature,O)}let W=O.get(h.textHint);if(W)for(let U=0;U<W.length&&U<b;U++)k.add(W[U])}let A=0,E=f.length;for(;A<E;){let O=A+E>>1;ye(f[O],r,n).domIndex<h.domIndex?A=O+1:E=O}let L=Math.max(0,Math.min(A-(b>>1),f.length-b)),D=Math.min(L+b,f.length);for(let O=L;O<D;O++)k.add(f[O]);return[...k]}for(let h of o){if(r.shouldIgnore?.(h)||r.excludeIds&&h.getAttribute("id"))continue;let f=ye(h,r,n),b=a.get(f.signature)||[],k=r.excludeIds?b.filter(L=>!L.getAttribute("id")):b,A=r.maxScoredCandidates,E=A&&k.length>A?m(f,k,A):k;for(let L of E){let{score:D,breakdown:O}=$r(h,L,r,n,{candidateCount:k.length});D>=r.minConfidence&&l.push({newEl:h,oldEl:L,score:D,breakdown:O})}}if(r.weights.slotMatch>0){let h=Hs(t,e,r,n);for(let f of h)l.push(f)}l.sort((h,f)=>f.score-h.score);let y=new Map,c=new Set;for(let{newEl:h,oldEl:f}of l)y.has(h)||c.has(f)||(y.set(h,f),c.add(f));return y}function Gn(e,t,r,n){let i=ye(e,r,n),o=ye(t,r,n),{score:a,breakdown:s}=$r(e,t,r,n,{candidateCount:1});return{matches:a>=r.minConfidence,score:a,breakdown:s,newMeta:{signature:i.signature,path:i.path,textHint:i.textHint},oldMeta:{signature:o.signature,path:o.path,textHint:o.textHint}}}function Jn(e={}){let t={...Vn,...e,weights:{...Vn.weights,...e.weights}},r=new WeakMap,n=new WeakMap;return{findMatch:(i,o)=>Wn(i,o,t,r,n),computeMatches:(i,o)=>Kn(i,o,t,r,n),explain:(i,o)=>Gn(i,o,t,r),invalidate:i=>zs(i,r,n),session:()=>{let i=new WeakMap,o=new WeakMap;return{findMatch:(a,s)=>Wn(a,s,t,i,o),computeMatches:(a,s)=>Kn(a,s,t,i,o),explain:(a,s)=>Gn(a,s,t,i)}},getConfig:()=>({...t})}}function Pr(e,t){for(;;){for(;t<e.length&&/\s/.test(e[t]);)t++;if(e[t]==="/"&&e[t+1]==="/"){for(;t<e.length&&e[t]!==`
`;)t++;continue}if(e[t]==="/"&&e[t+1]==="*"){let r=e.indexOf("*/",t+2);if(r===-1)return e.length;t=r+2;continue}return t}}function Xn(e){return e.replace(/\\'/g,"'").replace(/(\\*)"/g,(t,r)=>r.length%2===0?r+'\\"':t)}var Us=/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/,Vs=/^[A-Za-z_$][A-Za-z0-9_$]*$/;function Ut(e){try{return JSON.parse(e)}catch{return JSON.parse(Ws(e))}}function Ws(e){let t="",r=0,n=(i,o)=>{throw new Error(`Invalid relaxed JSON: ${i} at position ${o}`)};for(;r<e.length&&(r=Pr(e,r),!(r>=e.length));){let i=e[r];if("{}[]:".includes(i)){t+=i,r++;continue}if(i===","){let s=Pr(e,r+1);if(e[s]==="}"||e[s]==="]"){r++;continue}t+=i,r++;continue}if(i==='"'||i==="'"){let s=r+1;for(;s<e.length&&e[s]!==i;)e[s]==="\\"&&s++,s++;s>=e.length&&n("unterminated string",r);let l=e.slice(r+1,s);i==="'"&&(l=Xn(l)),t+='"'+l+'"',r=s+1;continue}let o=r;for(;o<e.length&&/[A-Za-z0-9_$.+\-]/.test(e[o]);)o++;o===r&&n("unexpected character "+JSON.stringify(i),r);let a=e.slice(r,o);if(a==="true"||a==="false"||a==="null"||Us.test(a)){t+=a,r=o;continue}if(Vs.test(a)){if(e[Pr(e,o)]===":"){t+='"'+a+'"',r=o;continue}n("unquoted value "+JSON.stringify(a),r)}n("invalid token "+JSON.stringify(a),r)}return t}function Zn(e){try{return JSON.parse(e)}catch{}let t={BRACE_OPEN:"{",BRACE_CLOSE:"}",BRACKET_OPEN:"[",BRACKET_CLOSE:"]",COLON:":",COMMA:",",STRING:"STRING",SELECTOR:"SELECTOR",IDENTIFIER:"IDENTIFIER",NUMBER:"NUMBER",BOOLEAN:"BOOLEAN"};function r(i){let o=[],a=0;for(;a<i.length;){let s=i[a];if(/\s/.test(s)){a++;continue}if("{}".includes(s)){o.push({type:s,value:s}),a++;continue}if(s==="["){let y=!1,c=a+1;for(;c<i.length&&/\s/.test(i[c]);)c++;if(c<i.length&&/[a-zA-Z_]/.test(i[c])&&(y=!0),!y){o.push({type:s,value:s}),a++;continue}}if(s==="]"){o.push({type:s,value:s}),a++;continue}if(s===":"){o.push({type:t.COLON,value:s}),a++;continue}if(s===","){o.push({type:t.COMMA,value:s}),a++;continue}if(s==='"'||s==="'"){let y=s,c=a+1;for(;c<i.length&&i[c]!==y;)i[c]==="\\"&&c++,c++;o.push({type:t.STRING,value:i.substring(a+1,c),quoted:!0,sourceQuote:y}),a=c+1;continue}let l=a,u;for(;l<i.length&&!/[{},]/.test(i[l]);)if(i[l]===":"){let y=[":first",":last",":nth-child",":nth-of-type",":first-child",":last-child",":first-of-type",":last-of-type",":only-child",":only-of-type",":hover",":focus",":active",":visited",":disabled",":enabled",":checked",":empty",":root",":target",":not",":before",":after",":nth-last-child",":nth-last-of-type"],c=!1;for(let h of y){let f=h.substring(1);if(i.substring(l+1,l+1+f.length)===f){c=!0,l+=f.length;break}}if(!c)break}else if(i[l]==="["){for(l++;l<i.length&&i[l]!=="]";){if(i[l]==='"'||i[l]==="'"){let y=i[l];for(l++;l<i.length&&i[l]!==y;)i[l]==="\\"&&l++,l++}l++}l<i.length&&i[l]==="]"&&l++}else l++;u=i.substring(a,l);let m=t.IDENTIFIER;/^-?\d+(\.\d+)?$/.test(u)?m=t.NUMBER:u==="true"||u==="false"||u==="null"?m=t.BOOLEAN:/^[.#@\[]|[.#@\[]| /.test(u)&&(m=t.SELECTOR),o.push({type:m,value:u,quoted:!1}),a=l}return o}function n(i){let o="";for(let a=0;a<i.length;a++){let s=i[a];if("{}".includes(s.type)||"[]".includes(s.type)){o+=s.value;continue}if(s.type===t.COLON){o+=s.value;continue}if(s.type===t.COMMA){let l=i[a+1];if(l&&(l.type==="}"||l.type==="]"))continue;o+=s.value;continue}if(s.type===t.STRING){let l=s.value;s.sourceQuote==="'"&&(l=Xn(l)),o+=`"${l}"`;continue}if(s.type===t.NUMBER||s.type===t.BOOLEAN){o+=s.value;continue}o+=`"${s.value}"`}return o}try{let i=r(e),o=n(i);return JSON.parse(o)}catch(i){throw new Error("Invalid extraction rules syntax: "+i.message)}}var oe=Symbol("hyper-morph-json-merge:missing"),Qn=["id","_id","uuid","key","slug","code","name"];function We(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function bt(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Ks(e,t,r){Object.defineProperty(e,t,{value:r,enumerable:!0,writable:!0,configurable:!0})}function Ce(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(!Ce(e[r],t[r]))return!1;return!0}if(We(e)&&We(t)){let r=Object.keys(e);if(r.length!==Object.keys(t).length)return!1;for(let n of r)if(!bt(t,n)||!Ce(e[n],t[n]))return!1;return!0}return!1}function ei(e,t,r,n){return Ce(t,r)?t:Ce(t,e)?r:Ce(r,e)?t:We(t)&&We(r)?Gs(We(e)?e:{},t,r,n):Array.isArray(t)&&Array.isArray(r)?Zs(Array.isArray(e)?e:[],t,r,n):r}function ti(e,t,r,n){return t===oe&&r===oe?oe:t===oe?e===oe?r:Ce(r,e)?oe:r:r===oe?e===oe?t:oe:ei(e,t,r,n)}function Gs(e,t,r,n){let i={},o=new Set([...Object.keys(e),...Object.keys(t),...Object.keys(r)]);for(let a of o){let s=ti(bt(e,a)?e[a]:oe,bt(t,a)?t[a]:oe,bt(r,a)?r[a]:oe,n);s!==oe&&Ks(i,a,s)}return i}function Ys(e){return e===null||typeof e!="object"}function Vt(e){return typeof e+":"+String(e)}function Js(e,t){for(let r of t){let n=new Set;for(let i of r){if(!bt(i,e))return!1;let o=i[e];if(typeof o!="string"&&typeof o!="number")return!1;let a=Vt(o);if(n.has(a))return!1;n.add(a)}}return!0}function Xs(e,t,r,n){let i=[e,t,r],o=!0;for(let a of i)for(let s of a)We(s)||(o=!1);if(o){for(let a of n.keyCandidates)if(Js(a,i))return{kind:"keyed",field:a};return null}for(let a of i){let s=new Set;for(let l of a){if(!Ys(l))return null;let u=Vt(l);if(s.has(u))return null;s.add(u)}}return{kind:"self"}}function Zs(e,t,r,n){let i=Xs(e,t,r,n);if(!i)return r;let o=i.kind==="self"?Vt:h=>Vt(h[i.field]),a=h=>{let f=new Map;for(let b of h)f.set(o(b),b);return f},s=a(e),l=a(t),u=a(r),m=new Map,y=new Set([...s.keys(),...l.keys(),...u.keys()]);for(let h of y){let f=ti(s.has(h)?s.get(h):oe,l.has(h)?l.get(h):oe,u.has(h)?u.get(h):oe,n);f!==oe&&m.set(h,f)}let c=[];for(let h of r){let f=o(h);m.has(f)&&c.push(f)}for(let h=0;h<t.length;h++){let f=o(t[h]);if(!m.has(f)||c.includes(f))continue;let b=0;for(let k=h-1;k>=0;k--){let A=c.indexOf(o(t[k]));if(A!==-1){b=A+1;break}}c.splice(b,0,f)}return c.map(h=>m.get(h))}function Br(e,t,r,n={}){let i=n.keyCandidates?[...n.keyCandidates,...Qn]:Qn;return ei(e===void 0?oe:e,t,r,{keyCandidates:i})}function zr(e,t,r,n={}){let i=n.parse||Ut,o=[],a=(y,c)=>{if(typeof y!="string")return oe;try{return i(y)}catch(h){return o.push(`${c} side is not valid JSON (${h.message})`),oe}},s=a(t,"local"),l=a(r,"remote");if(s===oe)return{text:r,warnings:o};if(l===oe)return{text:t,warnings:o};let u=a(e,"base"),m=Br(u===oe?void 0:u,s,l,n);return Ce(m,l)?{text:r,warnings:o}:Ce(m,s)?{text:t,warnings:o}:{text:JSON.stringify(m,null,2),warnings:o}}var Qs=Object.freeze({data:Object.freeze({tokens:["no-data"],bundles:["editor-ui"]}),save:Object.freeze({tokens:["no-save"],bundles:["editor-ui"]}),snapshot:Object.freeze({tokens:["no-snapshot"],bundles:["editor-ui"]}),watch:Object.freeze({tokens:["no-watch"],bundles:["editor-ui"]}),undo:Object.freeze({tokens:["no-undo"],bundles:["editor-ui"]}),history:Object.freeze({tokens:[],bundles:["editor-ui"]})}),Cu=Object.freeze({"editor-ui":Object.freeze(["no-data","no-save","no-snapshot","no-watch","no-undo"])}),Ou=Object.freeze(["no-save","no-snapshot","no-trigger-autosave","no-dirty","no-watch","no-undo","no-data","freeze","editor-ui"]);function ri(e){let t=Qs[e];if(!t)throw new Error(`Unknown region capability: ${e}`);return[...t.tokens,...t.bundles].flatMap(r=>[`[clay~="${r}"]`,`[${r}]`]).join(", ")}var yt=(function(){"use strict";let e=()=>{},t='[editor-ui],[clay~="editor-ui"],[save-ignore],[snapshot-remove],[no-snapshot],[no-save],[save-remove],[freeze],[save-freeze],[clay~="no-save"],[clay~="no-snapshot"],[clay~="freeze"]',r=`${ri("history")},[no-undo],[clay~="no-undo"]`;function n(v){if(v?.nodeType!==1)return!1;if(v.matches(t))return!0;if(v.tagName==="LINK"||v.tagName==="SCRIPT"){let I=v.getAttribute("src")||v.getAttribute("href")||"";if(I.startsWith("chrome-extension://")||I.startsWith("moz-extension://")||I.startsWith("safari-web-extension://"))return!0}return!1}function i(v){return v?.nodeType!==1?!1:v.closest(t)?!0:n(v)}function o(v,I,N){if(N){let P=N.identityOf(v);if(P&&!N.disabled.has(P.key))return"hm-merge:"+P.key}if(I!=="smart")return v.outerHTML;let F=v.getAttribute("src"),j=v.getAttribute("type")||"text/javascript";if(F)try{let P=new URL(F,window.location.href);return`ext:${j}:${P.origin}${P.pathname}${P.search}`}catch{return`ext:${j}:${F}`}else{let P=v.textContent.trim(),_=5381;for(let T=0;T<P.length;T++)_=(_<<5)+_^P.charCodeAt(T);return`inline:${j}:${Math.abs(_).toString(36)}`}}let a="http://www.w3.org/1999/xhtml";function s(v){return v?.nodeType===1&&v.tagName==="SCRIPT"&&v.namespaceURI===a}function l(v){let I=document.createElement("div");I.innerHTML="<script><\/script>";let N=I.firstChild;for(let F of v.attributes)N.setAttribute(F.name,F.value);return N.textContent=v.textContent,N}function u(v){if(s(v))return l(v);if(v?.nodeType===1)for(let I of v.querySelectorAll("script"))s(I)&&I.replaceWith(l(I));return v}function m(v){let I=(v.getAttribute("type")||"").split(";")[0].trim().toLowerCase();return I==="application/json"||I.endsWith("+json")}let y={match:v=>v.hasAttribute("merge"),identity:v=>v.getAttribute("merge")};function c(v,I,N){if(N.merge===!1)return null;let F=[y,...N.mergeTags||[]],j=new WeakMap,P=p=>{if(j.has(p))return j.get(p);let S=null;if(s(p)&&!p.getAttribute("src")&&!i(p)){let w=p;for(let R=0;R<F.length;R++)if(F[R].match(w)){if(!m(w))console.warn("[hyper-morph] merge ignored: script type is not JSON",w);else{let B=F[R].identity(w);B!=null&&B!==""&&(S={key:R+":"+B,raw:B,recognizer:F[R]})}break}}return j.set(p,S),S},_=new Set,T=p=>{let S=new Map,w=R=>{let B=P(R);B&&(S.has(B.key)?(_.add(B.key),console.warn(`[hyper-morph] merge disabled for duplicate identity "${B.raw}"`)):S.set(B.key,R))};s(p)&&w(p);for(let R of p.querySelectorAll("script"))w(R);return S},C=T(v),x=T(I.__hyperMorphRoot||I);if(C.size===0&&x.size===0)return null;let d=null;return{identityOf:P,disabled:_,oldByKey:C,newByKey:x,baseTexts:()=>{if(d)return d;d=new Map;let p=N.mergeBase;if(!p)return d;let S;typeof p=="string"?S=new DOMParser().parseFromString(p,"text/html").documentElement:p?.nodeType===9?S=p.documentElement:S=p;let w=R=>{let B=P(R);B&&!d.has(B.key)&&d.set(B.key,R.textContent)};s(S)&&w(S);for(let R of S.querySelectorAll("script"))w(R);return d}}}function h(v,I,N){let F=v.merge;if(!F)return!1;let j=F.identityOf(I);if(!j||F.disabled.has(j.key))return!1;let P=F.identityOf(N);if(!P||P.key!==j.key)return!1;let _=I,T=N,C=T.getAttribute("merge-key")||_.getAttribute("merge-key"),{text:x,warnings:d}=zr(F.baseTexts().get(j.key),_.textContent,T.textContent,{parse:j.recognizer.parse,keyCandidates:C?C.split(/[\s,]+/).filter(Boolean):void 0});for(let g of d)console.warn(`[hyper-morph] merge "${j.raw}": ${g}`);return _.textContent!==x&&(_.textContent=x),!0}let f={morphStyle:"outerHTML",callbacks:{beforeNodeAdded:e,afterNodeAdded:e,beforeNodeMorphed:e,afterNodeMorphed:e,beforeNodeRemoved:e,afterNodeRemoved:e,beforeAttributeUpdated:e},head:{style:"merge",shouldPreserve:v=>v.getAttribute("im-preserve")==="true",shouldReAppend:v=>v.getAttribute("im-re-append")==="true",shouldRemove:e,afterHeadMorphed:e},scripts:{handle:!0,matchMode:"outerHTML",shouldPreserve:v=>v.getAttribute("im-preserve")==="true",shouldReAppend:v=>v.getAttribute("im-re-append")==="true",shouldRemove:e,afterScriptsHandled:e},restoreFocus:!0},b={computeMatches(v,I,N=i){let{computeMatches:F}=Jn({shouldIgnore:N}).session();return F(v,I)}};function k(v,I,N={}){v=Bt(v);let F=mt(I),j=Lr(v,F,N),P=j.scripts.handle?new Set(Array.from(v.querySelectorAll("script")).map(x=>o(x,j.scripts.matchMode,j.merge))):null,_=U(j),T;try{T=q(j,v,F,x=>x.morphStyle==="innerHTML"?(ee(x,v,F),Array.from(v.childNodes)):W(x,v,F))}catch(x){throw E(j),x}let C=x=>{_&&ie(j,_),A(j);let d=P?Nr(x,P,j):[];return d.length>0?Promise.all(d).then(()=>x):x};if(T instanceof Promise)return T.then(x=>{try{return C(x)}catch(d){throw E(j),d}},x=>{throw E(j),x});try{return C(T)}catch(x){throw E(j),x}}function A(v){let I=v.pantry;if(I){for(let N of Array.from(I.childNodes))v.callbacks.beforeNodeRemoved(N)!==!1&&v.callbacks.afterNodeRemoved(N);for(let N of Array.from(I.childNodes))I.removeChild(N);I.remove(),v.pantry=null,v.stagedNodes.clear()}}function E(v){let I=v.pantry;if(!I)return;let N=Array.from(v.stagedNodes.entries()).reverse();for(let[F,j]of N){if(!I.contains(F))continue;let P=j.nextSibling?.parentNode===j.parent?j.nextSibling:null;try{D(j.parent,F,P)}catch{}}for(let F of Array.from(I.childNodes))I.removeChild(F);I.remove(),v.pantry=null,v.stagedNodes.clear()}function L(v){if(v.pantry)return v.pantry;let I=v.target.ownerDocument,N=I.createElement("div");return N.hidden=!0,N.setAttribute("mutations-ignore",""),I.body.insertAdjacentElement("afterend",N),v.pantry=N,N}function D(v,I,N){if(v.moveBefore)try{v.moveBefore(I,N)}catch{v.insertBefore(I,N)}else v.insertBefore(I,N)}function O(v,I){!v.stagedNodes.has(I)&&I.parentNode&&v.stagedNodes.set(I,{parent:I.parentNode,nextSibling:I.nextSibling}),D(L(v),I,null)}function W(v,I,N){let F=mt(I);return ee(v,F,N,I,I.nextSibling),Array.from(F.childNodes)}function U(v){if(!v.config.restoreFocus)return null;let I=document.activeElement;if(!(I instanceof HTMLInputElement||I instanceof HTMLTextAreaElement))return null;let{id:N,selectionStart:F,selectionEnd:j}=I;return{element:I,id:N,selectionStart:F,selectionEnd:j}}function ie(v,I){let N=I.element;if(I.id&&I.id!==document.activeElement?.getAttribute("id")&&(N=v.target.querySelector(`[id="${CSS.escape(I.id)}"]`),N?.focus()),N&&!N.selectionEnd&&I.selectionEnd!=null)try{N.setSelectionRange(I.selectionStart,I.selectionEnd)}catch{}}let ee=(function(){function v(x,d,g,p=null,S=null){d?.tagName==="TEMPLATE"&&g?.tagName==="TEMPLATE"&&(d=d.content,g=g.content),p||=d.firstChild;for(let w of g.childNodes){if(x.shouldIgnore(w))continue;if(p&&p!=S){let B=F(x,w,p,S);if(B){B!==p&&P(x,p,B),me(B,w,x),p=B.nextSibling;continue}}if(w?.nodeType===1){let B=w.getAttribute("id");if(x.persistentIds.has(B)){let M=_(d,B,p,x);me(M,w,x),p=M.nextSibling;continue}if(!x.idMap.has(w)){let M=x.hyperMatches.get(w);if(M&&!x.idMap.has(M)&&!C(M,d)){D(d,M,p),me(M,w,x),p=M.nextSibling;continue}}}let R=I(d,w,p,x);R&&(p=R.nextSibling)}for(;p&&p!=S;){let w=p;p=p.nextSibling,x.shouldIgnore(w)||j(x,w)}}function I(x,d,g,p){if(p.callbacks.beforeNodeAdded(d)===!1)return null;let S=x.ownerDocument||x.realParentNode?.ownerDocument||p.target.ownerDocument;if(p.idMap.has(d)){let w=d,R=S.createElementNS(w.namespaceURI,w.localName);return x.insertBefore(R,g),me(R,d,p),p.callbacks.afterNodeAdded(R),R}else{let w=u(N(d,S,p));return w?(x.insertBefore(w,g),p.callbacks.afterNodeAdded(w),w):null}}function N(x,d,g){if(g.shouldIgnore(x))return null;let p=d.importNode(x,!1),S=x.nodeType===1&&x.tagName==="TEMPLATE"?x.content:x,w=p.nodeType===1&&p.tagName==="TEMPLATE"?p.content:p;for(let R of Array.from(S.childNodes||[])){let B=N(R,d,g);B&&w.appendChild(B)}return p}let F=(function(){function x(p,S,w,R){let B=S?.nodeType===1&&!p.idMap.has(S)?p.hyperMatches.get(S):null,M=null,z=S.nextSibling,$=0,H=w;for(;H&&H!=R;){if(p.shouldIgnore(H)){H=H.nextSibling;continue}if(g(H,S)){if(d(p,H,S)||H===B&&!p.idMap.has(H))return H;if(M===null){let V=H?.nodeType===1&&p.hyperMatchedOldElements.has(H);!p.idMap.has(H)&&!V&&(M=H)}}if(M===null&&z&&g(H,z)&&($++,z=z.nextSibling,$>=2&&(M=void 0)),p.activeElementAndParents.includes(H))break;H=H.nextSibling}return M||null}function d(p,S,w){let R=p.idMap.get(S),B=p.idMap.get(w);if(!B||!R)return!1;for(let M of R)if(B.has(M))return!0;return!1}function g(p,S){let w=p,R=S;return w.nodeType===R.nodeType&&w.tagName===R.tagName&&(!w.getAttribute?.("id")||w.getAttribute?.("id")===R.getAttribute?.("id"))}return x})();function j(x,d){let g=d?.nodeType===1&&x.hyperMatchedOldElements.has(d)&&!x.idMap.has(d);if(x.idMap.has(d)||g)O(x,d);else{if(x.callbacks.beforeNodeRemoved(d)===!1)return;d.parentNode?.removeChild(d),x.callbacks.afterNodeRemoved(d)}}function P(x,d,g){let p=d;for(;p&&p!==g;){let S=p;p=p.nextSibling,x.shouldIgnore(S)||j(x,S)}return p}function _(x,d,g,p){let S=p.target.ownerDocument?.defaultView?.CSS?.escape?p.target.ownerDocument.defaultView.CSS.escape(d):String(d).replace(/["\\]/g,"\\$&"),w=p.target.getAttribute?.("id")===d&&p.target||p.target.querySelector(`[id="${S}"]`)||p.pantry?.querySelector(`[id="${S}"]`);return T(w,p),D(x,w,g),w}function T(x,d){let g=x.getAttribute("id");for(;x=x.parentNode;){let p=d.idMap.get(x);p&&(p.delete(g),p.size||d.idMap.delete(x))}}function C(x,d){let g=d?.nodeType===1?d:d.realParentNode;return!!g&&x.contains(g)}return v})(),me=(function(){function v(_,T,C){return C.ignoreActive&&_===document.activeElement?null:(C.callbacks.beforeNodeMorphed(_,T)===!1||(_?.tagName==="HEAD"&&C.head.ignore||(_?.tagName==="HEAD"&&C.head.style!=="morph"?xe(_,T,C):(I(_,T,C),h(C,_,T)||P(_,C)||ee(C,_,T))),C.callbacks.afterNodeMorphed(_,T)),_)}function I(_,T,C){let x=T.nodeType;if(x===1){let d=_,g=T,p=d.attributes,S=g.attributes;for(let w of S)j(w.name,d,"update",C)||d.getAttribute(w.name)!==w.value&&d.setAttribute(w.name,w.value);for(let w=p.length-1;0<=w;w--){let R=p[w];if(R&&!g.hasAttribute(R.name)){if(j(R.name,d,"remove",C))continue;d.removeAttribute(R.name)}}P(d,C)||N(d,g,C)}(x===8||x===3)&&_.nodeValue!==T.nodeValue&&(_.nodeValue=T.nodeValue)}function N(_,T,C){if(_.tagName==="INPUT"&&T.tagName==="INPUT"&&T.type!=="file"){let x=T.value,d=_.value;F(_,T,"checked",C),F(_,T,"disabled",C),C.formStateSync==="property"&&_.indeterminate!==T.indeterminate&&(_.indeterminate=T.indeterminate),C.formStateSync==="property"?d!==x&&(j("value",_,"update",C)||(_.value=x)):T.hasAttribute("value")?d!==x&&(j("value",_,"update",C)||(_.setAttribute("value",x),_.value=x)):j("value",_,"remove",C)||(_.value="",_.removeAttribute("value"))}else if(_.tagName==="OPTION"&&T.tagName==="OPTION")F(_,T,"selected",C);else if(_.tagName==="TEXTAREA"&&T.tagName==="TEXTAREA"){let x=T.value,d=_.value;if(j("value",_,"update",C)||(x!==d&&(_.value=x),C.formStateSync==="property"))return;_.firstChild&&_.firstChild.nodeValue!==x&&(_.firstChild.nodeValue=x)}}function F(_,T,C,x){let d=T[C],g=_[C];if(d!==g){let p=j(C,_,"update",x);if(p||(_[C]=T[C]),x.formStateSync==="property")return;d?p||_.setAttribute(C,""):j(C,_,"remove",x)||_.removeAttribute(C)}}function j(_,T,C,x){return _==="value"&&x.ignoreActiveValue&&T===document.activeElement?!0:x.callbacks.beforeAttributeUpdated(_,T,C)===!1}function P(_,T){return!!T.ignoreActiveValue&&_===document.activeElement&&_!==document.body}return v})();function q(v,I,N,F){if(v.head.block){let j=I.querySelector("head"),P=N.querySelector("head");if(j&&P){let _=xe(j,P,v);return Promise.all(_).then(()=>(v.head.block=!1,v.head.ignore=!0,F(v)))}}return F(v)}function te(v){return v.tagName==="SCRIPT"?!!v.getAttribute("src"):v.tagName==="LINK"?(v.getAttribute("rel")||"").toLowerCase().split(/\s+/).includes("stylesheet")&&!!v.getAttribute("href"):!1}function xe(v,I,N){let F=[],j=[],P=[],_=[],T=N.scripts.matchMode,C=g=>{if(g.tagName==="SCRIPT")return o(g,T,N.merge);if(g.tagName==="LINK"&&T==="smart"){let p=g.getAttribute("href");if(p)try{let S=new URL(p,window.location.href);return`link:${g.getAttribute("rel")||""}:${S.origin}${S.pathname}${S.search}`}catch{}}return g.outerHTML},x=new Map;for(let g of I.children){if(N.shouldIgnore(g))continue;let p=C(g),S=x.get(p);S||(S=[],x.set(p,S)),S.push(g)}for(let g of v.children){let p=C(g),S=x.get(p),w=!!(S&&S.length),R=N.head.shouldReAppend(g),B=N.head.shouldPreserve(g);if(w||B)if(R)j.push(g);else{if(S&&S.length){let M=S.pop();S.length||x.delete(p),h(N,g,M)}P.push(g)}else N.head.style==="append"?R&&(j.push(g),_.push(g)):N.head.shouldRemove(g)!==!1&&!N.shouldIgnore(g)&&j.push(g)}for(let g of x.values())_.push(...g);let d=[];for(let g of _){let p=document.createRange().createContextualFragment(g.outerHTML).firstChild;if(N.callbacks.beforeNodeAdded(p)!==!1){if(p instanceof Element&&te(p)){let S,w=new Promise(function(R){S=R});p.addEventListener("load",function(){S()}),p.addEventListener("error",function(){S()}),d.push(w)}v.appendChild(p),N.callbacks.afterNodeAdded(p),F.push(p)}}for(let g of j)N.callbacks.beforeNodeRemoved(g)!==!1&&(v.removeChild(g),N.callbacks.afterNodeRemoved(g));return N.head.afterHeadMorphed(v,{added:F,kept:P,removed:j}),d}function Nr(v,I,N){if(!N.scripts.handle)return[];let F=[],j=[],P=[],_=[],T=N.scripts.matchMode,C=[];for(let d of v)if(d instanceof Element){s(d)&&C.push(d);for(let g of d.querySelectorAll("script"))s(g)&&C.push(g)}for(let d of C){if(d.closest("head")||N.shouldIgnore(d))continue;let g=o(d,T,N.merge),p=I.has(g),S=N.scripts.shouldPreserve(d),w=N.scripts.shouldReAppend(d);p||S?w?(j.push(d),_.push(d)):P.push(d):_.push(d)}let x=[];for(let d of _){if(N.callbacks.beforeNodeAdded(d)===!1)continue;let g=document.createElement("script");for(let p of d.attributes)g.setAttribute(p.name,p.value);if(g.textContent=d.textContent,g.src){let p,S=new Promise(function(w){p=w});g.addEventListener("load",function(){p()}),g.addEventListener("error",function(){p()}),x.push(S)}d.replaceWith(g),N.callbacks.afterNodeAdded(g),F.push(g)}return N.scripts.afterScriptsHandled(N.target,{added:F,kept:P,removed:j}),x}let Lr=(function(){function v(T,C,x){let d=x.policy==="history"?r:t,g=x.policy==="raw"?()=>!1:$=>{if($?.nodeType!==1)return!1;if(x.policy!=="history"&&i($))return!0;let H=$.closest(d);return!(!H||x.policy==="history"&&H===T&&H.matches('[no-undo],[clay~="no-undo"]')&&!H.matches('[editor-ui],[clay~="editor-ui"]'))},{persistentIds:p,idMap:S}=P(T,C,g),w=b.computeMatches(T,C,g);if(typeof x.key=="function"){let $=new Map,H=new Set,V=K=>{let Y=x.key(K);Y!=null&&($.has(Y)?H.add(Y):$.set(Y,K))};T instanceof Element&&V(T);for(let K of T.querySelectorAll("*"))V(K);for(let K of H)$.delete(K);let se=new Map;for(let[K,Y]of w)se.set(Y,K);let he=C.__hyperMorphRoot||C,Z=new Map,G=new Set,Q=K=>{let Y=x.key(K);Y!=null&&(Z.has(Y)?G.add(Y):Z.set(Y,K))};he instanceof Element&&Q(he);for(let K of he.querySelectorAll("*"))Q(K);for(let K of G)Z.delete(K);for(let[K,Y]of Z){let re=$.get(K);if(!re||re.tagName!==Y.tagName)continue;let De=se.get(re);De&&De!==Y&&w.delete(De);let qe=w.get(Y);qe&&qe!==re&&se.delete(qe),w.set(Y,re),se.set(re,Y)}}let R=I(x),B=c(T,C,R.scripts);if(B){let $=new Map;for(let[H,V]of w)$.set(V,H);for(let[H,V]of B.newByKey){if(B.disabled.has(H))continue;let se=B.oldByKey.get(H);if(!se)continue;let he=$.get(se);he&&he!==V&&w.delete(he);let Z=w.get(V);Z&&Z!==se&&$.delete(Z),w.set(V,se),$.set(se,V)}}let M=new Set;for(let $ of w.values())M.add($);let z=R.morphStyle||"outerHTML";if(!["innerHTML","outerHTML"].includes(z))throw new Error(`Do not understand how to morph style ${z}`);return{target:T,newContent:C,config:R,morphStyle:z,ignoreActive:R.ignoreActive,ignoreActiveValue:R.ignoreActiveValue,restoreFocus:R.restoreFocus,formStateSync:R.formStateSync||"attribute",idMap:S,persistentIds:p,hyperMatches:w,hyperMatchedOldElements:M,merge:B,pantry:null,stagedNodes:new Map,activeElementAndParents:N(T),callbacks:R.callbacks,head:R.head,scripts:R.scripts,shouldIgnore:g}}function I(T){let C=Object.assign({},f);return Object.assign(C,T),C.callbacks=Object.assign({},f.callbacks,T.callbacks),C.head=Object.assign({},f.head,T.head),C.scripts=Object.assign({},f.scripts,T.scripts),C}function N(T){let C=[],x=T.ownerDocument?.activeElement;if(x?.tagName!=="BODY"&&T.contains(x))for(;x&&(C.push(x),x!==T);)x=x.parentElement;return C}function F(T){let C=Array.from(T.querySelectorAll("[id]"));return T.getAttribute?.("id")&&C.push(T),C}function j(T,C,x,d){for(let g of d){let p=g.getAttribute("id");if(C.has(p)){let S=g;for(;S;){let w=T.get(S);if(w==null&&(w=new Set,T.set(S,w)),w.add(p),S===x)break;S=S.parentElement}}}}function P(T,C,x){let d=F(T).filter(R=>!x(R)),g=F(C).filter(R=>!x(R)),p=_(d,g),S=new Map;j(S,p,T,d);let w=C.__hyperMorphRoot||C;return j(S,p,w,g),{persistentIds:p,idMap:S}}function _(T,C){let x=new Set,d=new Map;for(let p of T){let S=p.getAttribute("id");d.has(S)?x.add(S):d.set(S,p.tagName)}let g=new Set;for(let p of C){let S=p.getAttribute("id");g.has(S)?x.add(S):d.get(S)===p.tagName&&g.add(S)}for(let p of x)g.delete(p);return g}return v})(),{normalizeElement:Bt,normalizeParent:mt}=(function(){let v=new WeakSet;function I(_){return _?.nodeType===9?_.documentElement:_}function N(_){if(_==null)return document.createElement("div");if(typeof _=="string")return N(P(_));if(v.has(_))return _;if(_&&typeof _=="object"&&"nodeType"in _){if(_.parentNode)return new F(_);{let T=_.ownerDocument.createElement("div");return T.append(_),T}}else{let C=[..._][0]?.ownerDocument?.createElement("div")||document.createElement("div");for(let x of[..._])C.append(x);return C}}class F{constructor(T){this.originalNode=T,this.realParentNode=T.parentNode,this.previousSibling=T.previousSibling,this.nextSibling=T.nextSibling}get childNodes(){let T=[],C=this.previousSibling?this.previousSibling.nextSibling:this.realParentNode.firstChild;for(;C&&C!=this.nextSibling;)T.push(C),C=C.nextSibling;return T}querySelectorAll(T){return this.childNodes.reduce((C,x)=>{if(x instanceof Element){x.matches(T)&&C.push(x);let d=x.querySelectorAll(T);for(let g=0;g<d.length;g++)C.push(d[g])}return C},[])}insertBefore(T,C){return this.realParentNode.insertBefore(T,C)}moveBefore(T,C){return this.realParentNode.moveBefore(T,C)}get __hyperMorphRoot(){return this.originalNode}}function j(_){let T=g=>`<${g}(?:\\s(?:[^>"']|"[^"]*"|'[^']*')*)?>`,C=_.replace(/<!--[\s\S]*?-->/g,"");for(let g of["script","style","textarea","title"])C=C.replace(new RegExp(`${T(g)}[\\s\\S]*?</${g}\\s*>`,"gi"),"");let x=new RegExp(`${T("svg")}[\\s\\S]*?</svg\\s*>`,"gi"),d;do d=C,C=C.replace(x,"");while(C!==d);return C}function P(_){let T=new DOMParser,C=j(_);if(C.match(/<\/html>/)||C.match(/<\/head>/)||C.match(/<\/body>/)){let x=T.parseFromString(_,"text/html");if(C.match(/<\/html>/))return v.add(x),x;{let d=x.firstChild;return d&&v.add(d),d}}else{let d=T.parseFromString("<body><template>"+_+"</template></body>","text/html").body.querySelector("template").content;return v.add(d),d}}return{normalizeElement:I,normalizeParent:N}})(),zt=Symbol("hyper-morph-duplicate-key"),ft=[v=>v.getAttribute("data-id"),v=>v.getAttribute("id")];function Fe(v,I){return I.map(N=>{let F=new Map;for(let j of v){if(j.nodeType!==1)continue;let P=N(j);P==null||P===""||F.set(P,F.has(P)?zt:j)}return F})}function pt(v,I,N,F){for(let j=0;j<F.length;j++){let P=F[j](v);if(P==null||P===""||I[j].get(P)!==v)continue;let _=N[j].get(P);if(!(!_||_===zt)&&_.tagName===v.tagName)return _}return null}function we(v,I,N){for(let F=0;F<N.length;F++){let j=N[F](v);if(!(j==null||j==="")&&I[F].get(j)===v)return!0}return!1}function Ir(v,I,N={}){let F=N.skip||(()=>!1),j=N.ignoreAttr||(()=>!1),P=N.tiers&&N.tiers.length?N.tiers:ft,_=null;function T(){return _||(_=Fe([v,...v.querySelectorAll("*")],P)),_}let C=null;function x(){return C||(C=Fe([I,...I.querySelectorAll("*")],P)),C}function d(G){return!G.parentElement||!G.parentElement.parentElement}function g(G,Q,K){return d(G)||we(G,T(),P)?(K.push({type:"subtree",el:G,base:Q}),!1):!0}function p(G,Q){let K=[];for(let Y of G.attributes)j(G,Y.name)||Q.getAttribute(Y.name)!==Y.value&&K.push(Y.name);for(let Y of Q.attributes)j(G,Y.name)||G.hasAttribute(Y.name)||K.push(Y.name);return K}function S(G){let Q=[],K=null,Y=()=>{K!==null&&(Q.push({nodeType:3,nodeValue:K}),K=null)};for(let re of G.childNodes){if(re.nodeType===3){K=(K===null?"":K)+re.nodeValue;continue}re.nodeType===1&&F(re)||(Y(),(re.nodeType===1||re.nodeType===8)&&Q.push(re))}return Y(),Q}function w(G,Q){if(G.nodeType!==Q.nodeType)return!1;if(G.nodeType!==1)return!0;if(G.tagName!==Q.tagName)return!1;for(let K of P){let Y=K(G),re=K(Q);if(Y!=null&&Y!==""&&re!=null&&re!==""&&Y!==re)return!1}return!0}function R(G){let Q="";for(let K of G)K.nodeType===3&&K.nodeValue.trim()!==""?Q+="\0"+K.nodeValue:K.nodeType===8&&(Q+=""+K.nodeValue);return Q}function B(G,Q,K){let Y=S(G),re=S(Q);if(Y.length===re.length){let X=!0;for(let le=0;le<Y.length;le++)if(!w(Y[le],re[le])){X=!1;break}if(X){for(let le=0;le<Y.length;le++){let Ve=Y[le];if(Ve.nodeType===1){if(M(Ve,re[le],K))return!0}else if(Ve.nodeValue!==re[le].nodeValue)return!0}return!1}}let De=Y.filter(X=>X.nodeType===1),qe=re.filter(X=>X.nodeType===1);if(R(Y)!==R(re))return!0;let qn=Fe(De,P),$n=Fe(qe,P),jr=[],Fr=new Set,Pn=[];for(let X of De){let le=pt(X,qn,$n,P);le&&!Fr.has(le)?(jr.push([X,le]),Fr.add(le)):Pn.push(X)}let Te=[];for(let X of Pn)we(X,qn,P)?K.push({type:"subtree",el:X,base:null}):Te.push(X);let gt=[];for(let X of qe)Fr.has(X)||(we(X,$n,P)?K.push({type:"deletion",el:X}):gt.push(X));if(Te.length!==gt.length)return!0;for(let X=0;X<Te.length;X++)if(!w(Te[X],gt[X]))return!0;let Bn=new Map(jr);for(let X=0;X<Te.length;X++)Bn.set(Te[X],gt[X]);let zn=-1;for(let X of De){let le=Bn.get(X);if(!le)continue;let Ve=qe.indexOf(le);if(Ve<zn)return!0;zn=Ve}for(let X=0;X<Te.length;X++)if(M(Te[X],gt[X],K))return!0;for(let[X,le]of jr)if(M(X,le,K))return!0;return!1}function M(G,Q,K){if(G.tagName!==Q.tagName)return g(G,Q,K);let Y=p(G,Q),re=[];if(B(G,Q,re))return g(G,Q,K);if(Y.length){if(!d(G)&&!we(Q,x(),P))return!0;K.push({type:"attrs",el:G,names:Y,base:Q})}return K.push(...re),!1}let z=[],$=p(v,I);$.length&&z.push({type:"attrs",el:v,names:$});let H=(G,Q)=>Array.from(G.children).find(K=>K.tagName===Q)||null,V=H(v,"HEAD"),se=H(I,"HEAD");if(V&&se){let G=[];M(V,se,G),G.length&&z.push({type:"head",el:V})}else(V||se)&&V&&z.push({type:"head",el:V});let he=H(v,"BODY"),Z=H(I,"BODY");return he&&Z?M(he,Z,z):he&&z.push({type:"subtree",el:he,base:null}),{entries:z}}function ge(v,I,N={}){let F=N.tiers&&N.tiers.length?N.tiers:ft,j=v.documentElement,P=[],_=0,T=M=>({ok:!1,placed:P,held:M,skippedAttrs:_});if(!j)return T(null);function C(M){let z=[M,...M.querySelectorAll("*")];return Fe(z,F)}let x=C(j),d=new Map,g=M=>{let z=M.getRootNode(),$=d.get(z);if(!$){let H=z.nodeType===9?z.documentElement:z;$=C(H),d.set(z,$)}return $};function p(M){if(!M.parentElement&&M.tagName==="HTML")return j;if(M.parentElement&&!M.parentElement.parentElement&&M.parentElement.tagName==="HTML"){if(M.tagName==="BODY")return v.body||null;if(M.tagName==="HEAD")return v.head||null}return null}function S(M){let z=p(M);return z||pt(M,g(M),x,F)}function w(M){if(!M)return null;let z=S(M);return z&&z.isConnected?z:null}function R(M){for(let z=0;z<F.length;z++){let $=F[z](M);$!=null&&$!==""&&x[z].set($,M)}}for(let M of I){if(M.type!=="deletion")continue;let z=S(M.el);z&&z!==j&&z.remove()}let B=I.filter(M=>M.type!=="deletion").sort((M,z)=>M.el===z.el?0:M.el.compareDocumentPosition(z.el)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);for(let M of B){if(M.type==="head"){let Z=v.importNode(M.el,!0);v.head?v.head.replaceWith(Z):j.insertBefore(Z,j.firstChild),P.push({entry:M,imported:Z});continue}if(M.type==="attrs"){let Z=w(M.el)||w(M.base);if(!Z){_++;continue}for(let G of M.names)M.el.hasAttribute(G)?Z.setAttribute(G,M.el.getAttribute(G)):Z.removeAttribute(G);continue}let z=M.el;if(p(z))return T(M);let $=w(z)||w(M.base);if($){let Z=v.importNode(z,!0);$.replaceWith(Z),R(Z),P.push({entry:M,imported:Z});continue}if(M.base!=null&&!we(M.base,g(M.base),F)||!we(z,g(z),F))return T(M);let H=z.parentElement;if(!H)return T(M);let V=w(H);if(!V)return T(M);let se=null;for(let Z=z.previousElementSibling;Z;Z=Z.previousElementSibling){let G=w(Z);if(G&&G.parentNode===V){se=G;break}}let he=v.importNode(z,!0);if(se)V.insertBefore(he,se.nextSibling);else{let Z=Array.prototype.indexOf.call(H.children,z);V.insertBefore(he,V.children[Z]||null)}R(he),P.push({entry:M,imported:he})}return{ok:!0,placed:P,held:null,skippedAttrs:_}}return{morph:k,defaults:f,findChangedRoots:Ir,spliceProtected:ge,mergeJson:Br,mergeScriptText:zr,parseJsonRelaxed:Ut,parseRulesRelaxed:Zn}})();var kt=yt.morph,ju=yt.defaults,Fu=yt.findChangedRoots,Du=yt.spliceProtected;var Hr=yt;var Wt=["textContent","innerText","innerHTML","outerHTML","value","checked","selected","disabled","readOnly","type","tagName","nodeName","nodeType","nodeValue","childElementCount","id","className","classList","baseURI","offsetWidth","offsetHeight","clientWidth","clientHeight","scrollWidth","scrollHeight","dataset","currentSrc","duration","paused","title","documentURI","contentType"],Ur=new Set(Wt),ni=new Set(["textContent","innerText","innerHTML","value","checked","selected","disabled","readOnly","type","id","className","title"]),vt=new Set(["tagName","nodeName","nodeType","nodeValue","childElementCount","classList","baseURI","documentURI","contentType","offsetWidth","offsetHeight","clientWidth","clientHeight","scrollWidth","scrollHeight","currentSrc","duration","paused","dataset"]);var Kt={};qr(Kt,{EmptyListInsert:()=>wt,MAX_RULE_DEPTH:()=>Ye,MaxRuleDepthExceeded:()=>$e,RuleTargetReadOnly:()=>At,RulesParseError:()=>Ke,ShapeMismatch:()=>xt,UnknownRulesVersion:()=>Ge});var Ke=class extends Error{constructor(t,r){super(t),this.name="RulesParseError",this.cause=r}},Ge=class extends Error{constructor(t){super(`unknown rules version: ${t}. Library supports "1".`),this.name="UnknownRulesVersion",this.version=t}},Ye=20,$e=class extends Error{constructor(t){super(`rule depth exceeded ${Ye} at path: ${t.join(".")}`),this.name="MaxRuleDepthExceeded",this.path=t}},xt=class extends Error{constructor(t){super(`shape mismatch: ${t.length} field(s) failed validation`),this.name="ShapeMismatch",this.mismatches=t}},wt=class extends Error{constructor(t){super(`cannot add items to empty list at "${t.join(".")}" \u2014 no sibling to clone as template. Seed the list with a hidden item first.`),this.name="EmptyListInsert",this.path=t}},At=class extends Error{constructor(t){super(`cannot write to read-only DOM property "${t}"`),this.name="RuleTargetReadOnly",this.target=t}};function Oe(e,t,r,n={}){if(Object.prototype.hasOwnProperty.call(n,"exclude")&&e.semanticExclude===!1)throw new Error("This adapter does not support semantic exclude queries; omit exclude or use the DOM adapter.");return Vr(e,t,r,{depth:0,path:[]},n)}function Vr(e,t,r,n,i){if(n.depth>Ye)throw new $e(n.path);if(typeof r=="string")return ia(e,t,r,n,i);if(Array.isArray(r)){let[o,a]=r,s=e.find(t,o,i);return oi(i,n,s),s.map((l,u)=>Vr(e,l,a,{depth:n.depth+1,path:[...n.path,u]},i))}if(typeof r=="object"&&r!==null){let o={};for(let[a,s]of Object.entries(r))o[a]=Vr(e,t,s,{depth:n.depth+1,path:[...n.path,a]},i);return o}return null}function ia(e,t,r,n,i){if(r.endsWith("[]")){let s=r.slice(0,-2),l=e.find(t,s,i);return oi(i,n,l),l.map(u=>e.text(u))}if(r.startsWith("@"))return ii(e,t,r.slice(1));let o=ae(r);if(o!==-1){let s=r.slice(0,o),l=r.slice(o+1),u=s?e.find(t,s,i):[t];return u.length===0?null:ii(e,u[0],l)}if(r===".")return e.text(t);let a=e.find(t,r,i);return a.length===0?null:e.text(a[0])}function oi(e,t,r){if(typeof e.onRowsRead=="function")try{e.onRowsRead(t.path.slice(),r)}catch(n){console.warn(`[hyper-html-api] onRowsRead threw at "${t.path.join(".")||"(root)"}"`,n)}}function ii(e,t,r){if(Ur.has(r)){let i=e.prop(t,r);return i==null?null:String(i)}let n=e.attr(t,r);return n||null}var si=Object.freeze({data:Object.freeze({tokens:["no-data"],bundles:["editor-ui"]}),save:Object.freeze({tokens:["no-save"],bundles:["editor-ui"]}),snapshot:Object.freeze({tokens:["no-snapshot"],bundles:["editor-ui"]}),watch:Object.freeze({tokens:["no-watch"],bundles:["editor-ui"]}),undo:Object.freeze({tokens:["no-undo"],bundles:["editor-ui"]}),history:Object.freeze({tokens:[],bundles:["editor-ui"]})}),oa=Object.freeze({"editor-ui":Object.freeze(["no-data","no-save","no-snapshot","no-watch","no-undo"])}),Xu=Object.freeze(["no-save","no-snapshot","no-trigger-autosave","no-dirty","no-watch","no-undo","no-data","freeze","editor-ui"]);function Wr(e,t){if(!e||e.nodeType!==1)return!1;let r=e.getAttribute?.("clay");return!!(r&&r.split(/\s+/).includes(t)||e.hasAttribute?.(t))}function sa(e,t){if(Wr(e,t))return!0;for(let[r,n]of Object.entries(oa))if(n.includes(t)&&Wr(e,r))return!0;return!1}function St(e){let t=si[e];if(!t)throw new Error(`Unknown region capability: ${e}`);return[...t.tokens,...t.bundles].flatMap(r=>[`[clay~="${r}"]`,`[${r}]`]).join(", ")}function aa(e,t){let r=e&&e.nodeType===1?e:e?.parentElement;for(;r&&r.nodeType===1;){let n=si[t];if(!n)throw new Error(`Unknown region capability: ${t}`);if(n.tokens.some(i=>sa(r,i))||n.bundles.some(i=>Wr(r,i)))return r;r=r.parentElement}return null}function ai(e,t){return!!aa(e,t)}var la=/:(?:focus(?:-within|-visible)?|hover|active|visited|defined)\b/i;function li(e,t){if(!/^(INPUT|TEXTAREA|SELECT|OPTION)$/.test(e.tagName||""))return;let r=(e.getAttribute?.("type")||"").toLowerCase();if("value"in e&&"value"in t&&e.tagName!=="OPTION"&&r!=="checkbox"&&r!=="radio"&&(t.value=e.value),"checked"in e&&"checked"in t&&(t.checked=e.checked),"selected"in e&&"selected"in t&&(t.selected=e.selected),e.tagName==="SELECT")for(let n=0;n<e.options.length;n++)t.options[n].selected=e.options[n].selected;"indeterminate"in e&&"indeterminate"in t&&(t.indeterminate=e.indeterminate)}function ci(e,t,r,n){if(n)return!!e.closest?.(t);let i=e;for(;i?.nodeType===1;){if(i.matches(t))return!0;if(i===r)break;i=i.parentElement}return!1}function ui(e,t,r,n,i,o,a,s){if(e.nodeType===1&&((a?ai(e,r):ci(e,n,o,!1))||i&&ci(e,i,o,a)))return null;let l=t.importNode(e,!1);s.cloneToLive.set(l,e),s.liveToClone.set(e,l);let u=e.nodeType===1&&e.tagName==="TEMPLATE"?e.content:e,m=l.nodeType===1&&l.tagName==="TEMPLATE"?l.content:l;u!==e&&(s.cloneToLive.set(m,u),s.liveToClone.set(u,m));for(let y of u.childNodes||[]){let c=ui(y,t,r,n,i,o,a,s);c&&(m.appendChild(c),y.nodeType===1&&li(y,c))}return e.nodeType===1&&li(e,l),l}function Et(e,{capability:t="data",exclude:r=null,inherit:n=!0}={}){if(!e)throw new TypeError("createContentView requires a DOM context");let i=e.nodeType===9?e:e.ownerDocument;if(!i?.implementation?.createHTMLDocument)throw new TypeError("createContentView requires an HTML DOM implementation");let o=i.implementation.createHTMLDocument(""),a=new WeakMap,s=new WeakMap,l=e.nodeType===9?e.documentElement:e;r&&o.documentElement.matches(r);let u=St(t),m=ui(l,o,t,u,r,l,n,{cloneToLive:a,liveToClone:s});e.nodeType===9&&m&&(o.replaceChild(m,o.documentElement),s.set(e,o),a.set(o,e));let y=c=>{if(la.test(c))throw new Error(`Filtered content queries do not support stateful selector: ${c}`)};return{root:m,document:o,capability:t,selector:St(t),cloneToLive:a,liveToClone:s,original(c){return a.get(c)||null},cloneOf(c){return s.get(c)||null},query(c,h=m){return y(c),Array.from(h.querySelectorAll(c),f=>a.get(f)||f)},text(c=m){return(c===m?m:s.get(c))?.textContent||""},html(c=m){return(c===m?m:s.get(c))?.innerHTML??""},clone(c=m){let h=c===m?m:s.get(c);return h?o.importNode(h,!0):null}}}function di(e){return e&&e.nodeType===1&&e.tagName==="SCRIPT"&&e.hasAttribute&&e.hasAttribute("data-rules-name")}function ca(e){return e?(e.nodeType===9||e.nodeType===11,e):null}var ce={semanticExclude:!0,find(e,t,r={}){let n=ca(e);if(!n||!n.querySelectorAll)return[];let i=Array.from(n.querySelectorAll(t));r.includeRulesTag||(i=i.filter(s=>!di(s)));let o=[];r.skip&&o.push(r.skip);let a=r.templateAttr===null?null:r.templateAttr||"cms-template";if(a&&o.push("["+a+"]"),o.length){let s=o.join(", ");i=i.filter(l=>!l.closest||!l.closest(s))}return i},parent(e){return e?e.parentElement:null},children(e){return e?Array.from(e.children):[]},text(e,t){if(t===void 0)return(e.textContent||"").trim();e.textContent=t},attr(e,t,r){if(r===void 0)return e.hasAttribute&&e.hasAttribute(t)?e.getAttribute(t):null;e.setAttribute(t,r)},removeAttr(e,t){e&&e.removeAttribute&&e.removeAttribute(t)},prop(e,t,r){if(r===void 0){let n=e?e[t]:void 0;return n!==void 0?n:null}e[t]=r},clone(e){return e.cloneNode(!0)},insertAt(e,t,r){let n=e.children[r]||null;e.insertBefore(t,n)},remove(e){e&&e.parentNode&&e.parentNode.removeChild(e)},replaceWith(e,t){if(!e||!e.parentNode)throw new Error("dom.replaceWith: node has no parent");let n=e.ownerDocument.createElement("template");n.innerHTML=t;let i=n.content.firstElementChild;if(!i)throw new Error("dom.replaceWith: html did not parse to an element");return e.parentNode.replaceChild(i,e),i},stripIds(e){let t=0;return e.id&&(e.removeAttribute("id"),t++),(e.querySelectorAll?e.querySelectorAll("[id]"):[]).forEach(n=>{n.removeAttribute("id"),t++}),t},sameNode(e,t){return e===t}};function Ae(e,t={}){if(t.exclude===null)return ce;let r=[St("data"),t.exclude].filter(Boolean).join(", "),n=e.nodeType===9?e:e.ownerDocument||e,i=e.nodeType===9?e.documentElement:e;if(!t._write&&!i?.matches?.(r)&&!i?.querySelector?.(r)&&!n?.querySelector?.(r))return ce;let o=e.nodeType===9||!e.isConnected?e:e.ownerDocument,a=e.nodeType===9?e:e.ownerDocument,s=null,l=()=>s||(s=Et(o,{capability:"data",exclude:t.exclude||null})),u=f=>{let b=l();return f===e?b.cloneOf(e):b.cloneOf(f)||f},m=f=>s?.original(f)||f,y=(f,b)=>{l().liveToClone.set(f,b),l().cloneToLive.set(b,f);let k=f.childNodes||[],A=b.childNodes||[];for(let E=0;E<Math.min(k.length,A.length);E++)y(k[E],A[E])},c=(f,b,k,A)=>{let E=Array.from(f.childNodes).filter(U=>s.cloneOf(U)),D=E[0];for(;D&&E.includes(D);)D=D.nextSibling;for(let U of E)U.remove();if(k==="innerHTML"){let U=a.createElement("template");U.innerHTML=A;for(let ie of Array.from(U.content.childNodes))f.insertBefore(ie,D||null)}else f.insertBefore(a.createTextNode(A),D||null);let O=Et(f,{capability:"data",exclude:t.exclude||null});b.replaceChildren(...Array.from(O.root?.childNodes||[]));let W=U=>{let ie=O.original(U);ie&&(s.liveToClone.set(ie,U),s.cloneToLive.set(U,ie));for(let ee of Array.from(U.childNodes||[]))W(ee)};for(let U of Array.from(b.childNodes))W(U)},h={...ce,find(f,b,k={}){let A=u(f);if(!A?.querySelectorAll)return[];let E=l().query(b,A);k.includeRulesTag||(E=E.filter(O=>!di(O)));let L=[];k.skip&&L.push(k.skip);let D=k.templateAttr===null?null:k.templateAttr||"cms-template";if(D&&L.push(`[${D}]`),L.length){let O=L.join(", ");E=E.filter(W=>!W.closest?.(O))}return E},parent(f){let b=u(f)?.parentElement;return b?m(b):null},children(f){return Array.from(u(f)?.children||[],m)},text(f,b){if(b===void 0){let E=m(f);return!E?.matches?.(r)&&!E?.querySelector?.(r)?ce.text(E):(u(f)?.textContent||"").trim()}let k=m(f);if(!k?.matches?.(r)&&!k?.querySelector?.(r)&&!s){ce.text(k,b);return}let A=l().cloneOf(k);A?c(k,A,"textContent",b):ce.text(k,b)},attr(f,b,k){let A=m(f);if(k===void 0)return ce.attr(A,b);ce.attr(A,b,k);let E=s?.cloneOf(A);E&&(ce.attr(E,b,k),Et(A,{capability:"data",exclude:t.exclude||null}).root===null&&(E.remove(),s.liveToClone.delete(A),s.cloneToLive.delete(E)))},removeAttr(f,b){let k=m(f);ce.removeAttr(k,b);let A=s?.cloneOf(k);A&&ce.removeAttr(A,b)},prop(f,b,k){let A=m(f);if(k===void 0)return b==="innerHTML"||b==="outerHTML"||b==="textContent"||b==="innerText"?ce.prop(u(A),b):ce.prop(A,b);let E=b==="innerHTML"||b==="textContent"||b==="innerText",L=E?l().cloneOf(A):s?.cloneOf(A);L&&E?c(A,L,b,k):(ce.prop(A,b,k),L&&ce.prop(L,b,k))},clone(f){let b=u(f);return b===f?ce.clone(f):a.importNode(b,!0)},insertAt(f,b,k){let A=m(f),L=h.children(A)[k]||(()=>{for(let W=A.children.length-1;W>=0;W--){let U=A.children[W];if(l().cloneOf(U))return U.nextElementSibling}return A.firstElementChild})(),D=m(b);A.insertBefore(D,L||null);let O=l().cloneOf(A);if(O){let W=l().cloneOf(D);W||(W=a.importNode(D,!0),y(D,W));let U=Array.from(O.children);O.insertBefore(W,U[k]||null)}},remove(f){let b=m(f),k=l().cloneOf(b);ce.remove(b),k&&ce.remove(k)},replaceWith(f,b){let k=m(f),A=l().cloneOf(k),E=ce.replaceWith(k,b);if(A){let L=Et(E,{capability:"data",exclude:t.exclude||null});if(!L.root)A.remove();else{A.replaceWith(L.root);let D=O=>{let W=L.original(O);W&&(s.liveToClone.set(W,O),s.cloneToLive.set(O,W));for(let U of Array.from(O.childNodes||[]))D(U)};D(L.root)}}return E}};return h}var Je=ce;function Kr(e){try{return JSON.parse(e)}catch(t){throw new Ke(`Invalid strict JSON: ${t.message}`,t)}}function Xe(e){try{return JSON.parse(e)}catch{}let t={BRACE_OPEN:"{",BRACE_CLOSE:"}",BRACKET_OPEN:"[",BRACKET_CLOSE:"]",COLON:":",COMMA:",",STRING:"STRING",SELECTOR:"SELECTOR",IDENTIFIER:"IDENTIFIER",NUMBER:"NUMBER",BOOLEAN:"BOOLEAN"};function r(i){let o=[],a=0;for(;a<i.length;){let s=i[a];if(/\s/.test(s)){a++;continue}if("{}".includes(s)){o.push({type:s,value:s}),a++;continue}if(s==="["){let y=!1,c=a+1;for(;c<i.length&&/\s/.test(i[c]);)c++;if(c<i.length&&/[a-zA-Z_]/.test(i[c])&&(y=!0),!y){o.push({type:s,value:s}),a++;continue}}if(s==="]"){o.push({type:s,value:s}),a++;continue}if(s===":"){o.push({type:t.COLON,value:s}),a++;continue}if(s===","){o.push({type:t.COMMA,value:s}),a++;continue}if(s==='"'||s==="'"){let y=s,c=a+1;for(;c<i.length&&i[c]!==y;)i[c]==="\\"&&c++,c++;o.push({type:t.STRING,value:i.substring(a+1,c),quoted:!0,sourceQuote:y}),a=c+1;continue}let l=a,u;for(;l<i.length&&!/[{},]/.test(i[l]);)if(i[l]===":"){let y=[":first",":last",":nth-child",":nth-of-type",":first-child",":last-child",":first-of-type",":last-of-type",":only-child",":only-of-type",":hover",":focus",":active",":visited",":disabled",":enabled",":checked",":empty",":root",":target",":not",":before",":after",":nth-last-child",":nth-last-of-type"],c=!1;for(let h of y){let f=h.substring(1);if(i.substring(l+1,l+1+f.length)===f){c=!0,l+=f.length;break}}if(!c)break}else if(i[l]==="["){for(l++;l<i.length&&i[l]!=="]";){if(i[l]==='"'||i[l]==="'"){let y=i[l];for(l++;l<i.length&&i[l]!==y;)i[l]==="\\"&&l++,l++}l++}l<i.length&&i[l]==="]"&&l++}else l++;u=i.substring(a,l);let m=t.IDENTIFIER;/^-?\d+(\.\d+)?$/.test(u)?m=t.NUMBER:u==="true"||u==="false"||u==="null"?m=t.BOOLEAN:/^[.#@\[]|[.#@\[]| /.test(u)&&(m=t.SELECTOR),o.push({type:m,value:u,quoted:!1}),a=l}return o}function n(i){let o="";for(let a=0;a<i.length;a++){let s=i[a];if("{}".includes(s.type)||"[]".includes(s.type)){o+=s.value;continue}if(s.type===t.COLON){o+=s.value;continue}if(s.type===t.COMMA){let l=i[a+1];if(l&&(l.type==="}"||l.type==="]"))continue;o+=s.value;continue}if(s.type===t.STRING&&s.quoted){let l=s.value;s.sourceQuote==="'"&&(l=l.replace(/\\'/g,"'"),l=l.replace(/(\\*)"/g,(u,m)=>m.length%2===0?m+'\\"':u)),o+=`"${l}"`;continue}if(s.type===t.NUMBER||s.type===t.BOOLEAN){o+=s.value;continue}if(s.type===t.SELECTOR||s.type===t.IDENTIFIER){o+=`"${s.value}"`;continue}o+=`"${s.value}"`}return o}try{let i=r(e),o=n(i);return JSON.parse(o)}catch(i){throw new Ke("Invalid extraction rules syntax: "+i.message,i)}}var mi="1",hi=/^[a-zA-Z0-9_-]+$/;function _t(e,t,r){let n;if(r===void 0)n="script[data-rules-name]";else{if(typeof r!="string"||!hi.test(r))throw new Error(`hyper-html-api: invalid rules token ${JSON.stringify(r)} (must match ${hi})`);n=`script[data-rules-name~="${r}"]`}let i=e.find(t,n,{includeRulesTag:!0});if(i.length===0)return null;r!==void 0&&i.length>1&&console.warn(`hyper-html-api: ${i.length} rules tags match data-rules-name~="${r}"; using the first.`);let o=i[0],a=e.attr(o,"data-rules-version");if(a!==mi)throw new Ge(a);return{rules:Xe(e.text(o)),tagNode:o}}var vd=new Function("url","return import(url)");function ki(e,t,r,n){let i=e.length,o=t.length,a=new Array(i).fill(-1);if(n){let k=new Set;for(let A=0;A<i;A++){let E=n[A];!(E>=0&&E<o)||k.has(E)||(a[A]=E,k.add(E))}}if(i===0||o===0)return a;let s=e.map(k=>bi(k,r)),l=t.map(k=>bi(k,r)),u=new Array(o).fill(!1);for(let k of a)k>=0&&(u[k]=!0);let m=new Map;l.forEach((k,A)=>{u[A]||m.set(k,m.has(k)?-1:A)});let y=new Map;s.forEach((k,A)=>{a[A]>=0||y.set(k,(y.get(k)||0)+1)}),s.forEach((k,A)=>{if(a[A]>=0||y.get(k)!==1)return;let E=m.get(k);E===void 0||E===-1||u[E]||(a[A]=E,u[E]=!0)});let c=[];for(let k=0;k<i;k++)a[k]<0&&c.push(k);let h=[];for(let k=0;k<o;k++)u[k]||h.push(k);if(c.length===0||h.length===0)return a;let f=i*o+1,b=(k,A)=>da(e[k],t[A],r)*f+Math.abs(k-A);for(let[k,A]of ha(c,h,b))a[k]=A;return a}var vi=e=>typeof e=="object"&&e!==null;function bi(e,t){if(!vi(t))return e==null?" null":String(e);let r=Object.keys(t);return JSON.stringify(r.map(n=>{let i=JSON.stringify(e?.[n]);return i===void 0?" undef":i}))}function da(e,t,r){if(!vi(r))return e===t?0:1;let n=Object.keys(r);if(n.length===0)return 0;let i=0;for(let o of n){let a=JSON.stringify(e?.[o]),s=JSON.stringify(t?.[o]);a!==s&&i++}return i}function ha(e,t,r){return e.length<=t.length?yi(e,t,r,!1):yi(t,e,(n,i)=>r(i,n),!0)}function yi(e,t,r,n){let i=e.length,o=t.length,a=[];for(let y=0;y<=i;y++)a.push(new Float64Array(o+1).fill(1/0));let s=[];for(let y=0;y<=i;y++)s.push(new Uint8Array(o+1));for(let y=0;y<=o;y++)a[i][y]=0;for(let y=i-1;y>=0;y--)for(let c=o-1;c>=0;c--){let h=r(e[y],t[c])+a[y+1][c+1],f=a[y][c+1];h<=f?(a[y][c]=h,s[y][c]=1):a[y][c]=f}let l=[],u=0,m=0;for(;u<i&&m<o;)s[u][m]&&(l.push(n?[t[m],e[u]]:[e[u],t[m]]),u++),m++;return l}function Yr(e,t,r,n,i,o,a,s={}){let l=e.find(t,r,s);if(i.length===0){l.forEach(O=>e.remove(O)),Gr(s,"onRowsApplied",o.path,[]);return}let u=i.length>l.length,m=l[0]||null;if(u&&!m&&(m=ga(e,t,r,s),!m))throw new wt(o.path);let y=l.map(O=>pa(e,O,n,s)),c=null;if(u&&m){c=e.clone(m),s.templateAttr&&e.removeAttr(c,s.templateAttr);let O=e.stripIds(c);O>0&&console.warn(`[hyper-html-api] stripped ${O} id attribute(s) from cloned template at "${o.path.join(".")||"(root)"}"`)}let h=ki(i,y,n,ma(e,l,i,o,s)),f=l[0]||m,b=e.parent(f),k=l.length>0?xi(e,b,f):0,A=ba(e,l),E=new Set,L=[],D=i.map((O,W)=>{let U=h[W];if(U>=0)return E.add(U),L.push(!1),l[U];L.push(!0);let ie=e.clone(c);return e.stripIds(ie),ie});l.forEach((O,W)=>{E.has(W)||e.remove(O)}),A?D.forEach((O,W)=>{let U=k+W;e.children(b).findIndex(me=>e.sameNode(me,O))!==U&&e.insertAt(b,O,U)}):ya(e,D,L,b,k),fa(e,D,n,i,o,a,s),Gr(s,"onRowsApplied",o.path,D)}function Gr(e,t,r,n){if(typeof e[t]=="function")try{return e[t](r.slice(),n)}catch(i){console.warn(`[hyper-html-api] ${t} threw at "${r.join(".")||"(root)"}"`,i);return}}function ma(e,t,r,n,i){let o=Gr(i,"identifyRows",n.path,r);if(!Array.isArray(o))return null;let a=new Array(r.length).fill(-1),s=new Set;for(let l=0;l<r.length;l++)if(o[l]){for(let u=0;u<t.length;u++)if(!(s.has(u)||!e.sameNode(t[u],o[l]))){a[l]=u,s.add(u);break}}return a}function fa(e,t,r,n,i,o,a){t.forEach((s,l)=>{if(r===null){let u=n[l],m=u==null?"":String(u);e.text(s)!==m&&e.text(s,m)}else{let u=o(e,s,r,n[l],{depth:i.depth+1,path:[...i.path,l]},a);u&&u!==s&&(t[l]=u)}})}function pa(e,t,r,n){return r===null?e.text(t):Oe(e,t,r,n.onRowsRead?{...n,onRowsRead:void 0}:n)}function xi(e,t,r){let n=e.children(t);for(let i=0;i<n.length;i++)if(e.sameNode(n[i],r))return i;return-1}function ga(e,t,r,n){if(!n.templateAttr)return null;let i=t;for(;i;){let o=e.find(i,r,{includeRulesTag:!1,templateAttr:null});for(let a of o)if(e.attr(a,n.templateAttr)!=null)return a;i=e.parent(i)}return null}function ba(e,t){if(t.length<=1)return!0;let r=e.parent(t[0]);if(!r)return!1;let n=e.children(r),i=[];for(let o of t){let a=n.findIndex(s=>e.sameNode(s,o));if(a===-1)return!1;i.push(a)}return i.sort((o,a)=>o-a),i[i.length-1]-i[0]===i.length-1}function ya(e,t,r,n,i){let o=null,a=i;for(let s=0;s<t.length;s++){if(!r[s]){o=t[s];continue}let l=o?e.parent(o):n;if(!l)continue;let u=o?xi(e,l,o)+1:a++;e.insertAt(l,t[s],u),o=t[s]}}var wi=new Set(["checked","selected","disabled","readOnly","paused"]);function Ze(e,t,r,n,i={}){if(Object.prototype.hasOwnProperty.call(i,"exclude")&&e.semanticExclude===!1)throw new Error("This adapter does not support semantic exclude queries; omit exclude or use the DOM adapter.");let o=[];if(Jr(r,n,[],o),o.length)throw new xt(o);Gt(e,t,r,n,{depth:0,path:[]},i)}function Gt(e,t,r,n,i,o={}){if(i.depth>Ye)throw new $e(i.path);if(n===void 0)return t;if(typeof r=="string")return ka(e,t,r,n,i,o);if(Array.isArray(r)){let[a,s]=r;return Yr(e,t,a,s,n,i,Gt,o),t}if(typeof r=="object"&&r!==null){for(let[a,s]of Object.entries(r)){let l=Gt(e,t,s,n==null?n:n[a],{depth:i.depth+1,path:[...i.path,a]},o);l&&l!==t&&(t=l)}return t}return t}function ka(e,t,r,n,i,o){if(r.endsWith("[]")){let l=r.slice(0,-2);return Yr(e,t,l,null,n,i,Gt,o),t}if(r.startsWith("@"))return Si(e,t,r.slice(1),n);let a=ae(r);if(a!==-1){let l=r.slice(0,a),u=r.slice(a+1),m=l?e.find(t,l,o):[t];return m.length===0||Si(e,m[0],u,n),t}if(r===".")return Ai(e,t,n),t;let s=e.find(t,r,o);return s.length===0||Ai(e,s[0],n),t}function Ai(e,t,r){let n=r==null?"":String(r);e.text(t)!==n&&e.text(t,n)}function Si(e,t,r,n){if(vt.has(r))throw new At(r);if(r==="outerHTML"){let o=n==null?"":String(n);return e.replaceWith(t,o)}if(ni.has(r)){let o=va(r,n);return e.prop(t,r)!==o&&e.prop(t,r,o),t}let i=n==null?"":String(n);return e.attr(t,r)!==i&&e.attr(t,r,i),t}function va(e,t){return t==null?wi.has(e)?!1:"":wi.has(e)?t==="false"?!1:!!t:t}function Jr(e,t,r,n){if(t!==void 0){if(typeof e=="string"){if(e.endsWith("[]")){Array.isArray(t)?t.forEach((i,o)=>{typeof i=="object"&&i!==null&&n.push({path:Ct([...r,o]),expected:"scalar",got:Tt(i)})}):n.push({path:Ct(r),expected:"array",got:Tt(t)});return}t!==null&&typeof t=="object"&&n.push({path:Ct(r),expected:"scalar",got:Tt(t)});return}if(Array.isArray(e)){if(!Array.isArray(t)){n.push({path:Ct(r),expected:"array",got:Tt(t)});return}let i=e[1];t.forEach((o,a)=>Jr(i,o,[...r,a],n));return}if(typeof e=="object"&&e!==null){if(t===null||Array.isArray(t)||typeof t!="object"){n.push({path:Ct(r),expected:"object",got:Tt(t)});return}for(let[i,o]of Object.entries(e))Jr(o,t[i],[...r,i],n)}}}function Tt(e){return e===null?"null":Array.isArray(e)?"array":typeof e}function Ct(e){return e.join(".")}function Xr(e,t,r){if(r&&typeof r=="object")return{rules:r,tagNode:null};if(typeof r=="string"){let n=t&&t.ownerDocument?t.ownerDocument:t;return _t(e,n,r)}return null}var fe={extract:(e,t,r={})=>Oe(Ae(e,r),e,t,r),apply:(e,t,r,n={})=>Ze(Ae(e,{...n,_write:!0}),e,t,r,n),findRulesIn:(e,t)=>_t(Je,e,t),findRules:(e,t)=>Xr(Je,e,t),bind:(e,t,r={})=>{let n=Xr(Je,e,t);if(!n){let i=typeof t=="string"?`data-rules-name~="${t}"`:"the provided rules object";throw new Error(`hyper-html-api: could not resolve rules for ${i}`)}return{...n,get:()=>Oe(Ae(e,r),e,n.rules,r),set:i=>Ze(Ae(e,{...r,_write:!0}),e,n.rules,i,r)}},parseStrict:Kr,parseRelaxed:Xe,ruleAttrIndex:ae,splitRule:Ht,errors:Kt,DOM_PROPERTIES:Wt};var Qr={};qr(Qr,{fromString:()=>Se,getRuleAtPath:()=>Pe,getValueAtPath:()=>Ia,setAtPath:()=>Zr,toString:()=>La});function La(e){return e.map(String).join(".")}function Se(e){return e===""?[]:e.split(".").map(t=>/^\d+$/.test(t)?Number(t):t)}function Pe(e,t){let r=e;for(let n of t){if(r==null)return;if(typeof r=="string"){if(r.endsWith("[]")&&(typeof n=="number"||n==="*")){r=r.slice(0,-2);continue}return}if(Array.isArray(r)){if(typeof n!="number"&&n!=="*")return;r=r[1];continue}if(typeof r=="object"){if(typeof n=="number"||!(n in r))return;r=r[n];continue}return}return r}function Ia(e,t){let r=e;for(let n of t){if(r==null)return;r=r[n]}return r}function Zr(e,t,r){if(t.length===0)return r;let[n,...i]=t;if(typeof n=="number"){let o=Array.isArray(e)?[...e]:[];return o[n]=Zr(o[n],i,r),o}return{...e&&typeof e=="object"?e:{},[n]:Zr((e||{})[n],i,r)}}function Ot(e){if(typeof e=="string")return e.endsWith("[]")?[]:"";if(Array.isArray(e))return[];if(typeof e=="object"&&e!==null){let t={};for(let[r,n]of Object.entries(e))t[r]=Ot(n);return t}return""}function Yt(e,t,{ignoreActiveValue:r=!0}={}){Hr.morph(e,t,{morphStyle:"innerHTML",ignoreActiveValue:r,restoreFocus:!0,formStateSync:"property",policy:"raw"})}var _i=new WeakMap,en=e=>e.map(String).join(".");function ja(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}function Ti(e,t){if(!e||!e.querySelector)return null;let r=e.querySelector(`[data-hcms-path="${ja(t)}"]`),n=r&&r.querySelector(".hcms-array-items");return n?Array.from(n.children).filter(i=>i.matches&&i.matches("[data-hcms-card], [data-hcms-array-item]")):null}function Ci(e,t,r){let n=Ti(e,t);!n||n.length!==r.length||n.forEach((i,o)=>{r[o]&&_i.set(i,r[o])})}function Jt(){let e=new Map;return{hooks:{onRowsRead(t,r){e.set(en(t),r)}},seed(t){for(let[r,n]of e)Ci(t,r,n);e.clear()}}}function Oi(e){return{identifyRows(t,r){let n=Ti(e,en(t));return!n||n.length!==r.length?null:n.map(i=>_i.get(i)||null)},onRowsApplied(t,r){Ci(e,en(t),r)}}}var Ri={skip:"[data-hcms-shell]",templateAttr:"cms-template"},tn="data-hcms-rollback-ui",Fa=0;function Mi(e,t,r,n={}){return Da(e,t,r,n)}function Da(e,t,r,n){let{shellRoot:i,structural:o,structuralPath:a,formRoot:s}=n,l=s?{...Ri,...Oi(s)}:Ri;if(!o)try{return fe.apply(e,t,r,l),{ok:!0}}catch(c){return{ok:!1,error:c}}let u=qa(e,t,a),m=u?Pa(u):null,y=u?null:za(e,i);try{return fe.apply(e,t,r,l),{ok:!0}}catch(c){return m?Ba(u,m):y&&Ha(e,i,y),{ok:!1,error:c}}}function qa(e,t,r){if(!r||!e)return null;let n=Se(r),i=[],o=t;for(let a of n){if(typeof o=="string"||o==null||Array.isArray(o))break;if(typeof o=="object"&&a in o){if(i.push(a),o=o[a],Array.isArray(o)||typeof o=="string"&&o.endsWith("[]"))break}else return null}return!Array.isArray(o)&&!(typeof o=="string"&&o.endsWith("[]"))?null:$a(e,t,i)}function $a(e,t,r){if(r.length===0)return null;let n=e,i=t;for(let o=0;o<r.length;o++){let a=r[o];if(!i||typeof i!="object"||Array.isArray(i))return null;let s=i[a];if(s==null)return null;if(o===r.length-1){if(Array.isArray(s)){let[l]=s;return n.querySelector?.(l)?.parentElement||null}if(typeof s=="string"&&s.endsWith("[]")){let l=s.slice(0,-2);return n.querySelector?.(l)?.parentElement||null}return null}i=s}return null}function Pa(e){let t=[],r=[];for(let n of Array.from(e.childNodes))t.push(rn(n,r));return{nodes:t,retained:r}}function Ba(e,t){let r=e.cloneNode(!1);for(let n of t.nodes)r.appendChild(n);kt(e,Array.from(r.childNodes),Li()),Ni(e,t.retained)}function za(e,t){let r=[],n=[];for(let i of Array.from(e.childNodes))i===t||t&&i.contains?.(t)||r.push(rn(i,n));return{nodes:r,retained:n}}function Ha(e,t,r){let n=e.cloneNode(!1);for(let i of r.nodes)n.appendChild(i);kt(e,Array.from(n.childNodes),Li()),Ni(e,r.retained)}function rn(e,t){let r=e.cloneNode(!1);if(e.nodeType===1&&e.matches('[editor-ui],[clay~="editor-ui"]')){let o=String(++Fa);r.setAttribute(tn,o),t.push({id:o,node:e})}let n=e.nodeType===1&&e.tagName==="TEMPLATE"?e.content:e,i=r.nodeType===1&&r.tagName==="TEMPLATE"?r.content:r;for(let o of Array.from(n.childNodes||[]))i.appendChild(rn(o,t));return r}function Ni(e,t){for(let{id:r,node:n}of t){let i=e.querySelector(`[${tn}="${r}"]`);i===n?n.removeAttribute(tn):n.isConnected?i?.remove():i?.replaceWith(n)}}function Li(){return{morphStyle:"innerHTML",policy:"raw",restoreFocus:!1,scripts:{handle:!1,merge:!1}}}function Zt(e){return e.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g,"$1 $2").replace(/[-_]/g," ").replace(/\s+/g," ").trim().replace(/^./,t=>t.toUpperCase())}var Ua='<div class="hcms-drag-handle mirk-sortable__grip" aria-hidden="true"><div class="mirk-sortable__dots"><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span><span class="mirk-sortable__dot"></span></div></div>',nn='<svg class="hcms-x" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"></path></svg>',Fi={"@scalar":`
    <label class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <textarea class="mirk-textarea" rows="1" data-hcms-field></textarea>
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
      ${Ua}
      <div class="hcms-card-body mirk-sortable__body">
        <div class="hcms-card-fields"></div>
        <div class="hcms-card-controls">
          <button type="button" class="hcms-move hcms-move-up hcms-sr-only" data-hcms-action="move-up" aria-label="Move up">\u2191</button>
          <button type="button" class="hcms-move hcms-move-down hcms-sr-only" data-hcms-action="move-down" aria-label="Move down">\u2193</button>
          <button type="button" class="hcms-remove hcms-remove--card" data-hcms-action="remove" aria-label="Remove">${nn}</button>
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
        <button type="button" class="hcms-upload-clear" data-hcms-action="clear-upload" aria-label="Remove file">${nn}</button>
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
          <button type="button" class="hcms-upload-clear hcms-upload-clear--badge" data-hcms-action="clear-upload" aria-label="Remove image">${nn}</button>
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
  `,"@richtext":`
    <div class="hcms-field" data-hcms-shape="scalar">
      <span class="hcms-label" data-hcms-label></span>
      <div class="mirk-textarea hcms-richtext" contenteditable="true" data-hcms-field></div>
      <div class="hcms-error" hidden></div>
    </div>
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
  `},Va=["@scalar","@object","@scalar-array","@scalar-array-item","@object-array","@object-array-item"];function Qt(e){let t=e.head||e.documentElement;if(t)for(let r of Va)Pi(e,t,r)}function on(e,t){if(!Fi[t])return null;let r=e&&(e.head||e.documentElement);return r?Pi(e,r,t):null}var Ii={src:"@image",checked:"@checkbox",innerHTML:"@richtext"},Xt={image:"@image",file:"@file",checkbox:"@checkbox",toggle:"@toggle",select:"@select",radio:"@radio",textarea:"@textarea",number:"@number",richtext:"@richtext"},Wa=new Set([...Object.values(Xt),"@chips","@chips-item"]);function Rt(e,t,r,n){if(typeof e!="string")return"@scalar";let i=ae(e),o=rr(e,i,r,n),a=nr(o,t,"data-hcms-component");if(a&&Xt[a]){let s=Xt[a],l=Array.isArray(r)&&r.some(u=>u==="*"||typeof u=="number");return s==="@number"&&!ji(e,i,t,l,o).every(Ga)||(s==="@checkbox"||s==="@toggle")&&(i<0||e.slice(i+1)!=="checked")&&!ji(e,i,t,l,o).every(Ya)?"@scalar":s}if(i>=0){let s=e.slice(i+1);if(Ii[s])return Ii[s]}return"@scalar"}function Di(e,t,r,n){if(typeof e!="string")return null;let i=ae(e),o=nr(rr(e,i,r,n),t,"data-hcms-component");return o&&Xt[o]||null}var Ka=/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;function Ga(e){return e==null||e===""?!0:Ka.test(String(e))}function Ya(e){return e==null||e===""||e==="true"||e==="false"}function ji(e,t,r,n,i){if(!r||!r.querySelectorAll)return[];if(!i||i===".")return[];let o=null;try{o=r.querySelectorAll(i)}catch{return[]}let a=t>=0?e.slice(t+1):null,s=[];for(let l of o)if(!(l.closest&&l.closest("[cms-template], [data-hcms-shell]"))&&(a?a==="value"&&"value"in l?s.push(l.value):s.push(l.getAttribute?l.getAttribute(a):null):s.push((l.textContent||"").trim()),!n))break;return s}function er(e,t){if(typeof e!="string"||!e.endsWith("[]")||!t||!t.querySelector)return null;let r=e.slice(0,-2).trim();if(!r)return null;let n=null;try{n=t.querySelector(r)}catch{return null}let i=n&&n.closest?n.closest("[data-hcms-component]"):null;return(i&&i.getAttribute?i.getAttribute("data-hcms-component"):null)==="chips"?{array:"@chips",item:"@chips-item"}:null}function Qe(e,t,r){let n=e.join("."),i=e.map(o=>typeof o=="number"?"*":o).join(".");return n&&ke(r,n)||i&&i!==n&&ke(r,i)||ke(r,t)}function tr(e,t,r){let n=er(e,r);if(!n)return null;let i=Qe(t,n.array,r);return i&&i.getAttribute("data-hcms-tpl")===n.array?n:null}function qi(e,t,r,n){if(typeof e!="string")return null;let i=ae(e),o=nr(rr(e,i,r,n),t,"data-hcms-options");if(o==null)return null;let a=o.trim().split(/\s+/).filter(Boolean);return a.length?a:null}function $i(e,t,r,n){if(typeof e!="string")return null;let i=ae(e);return nr(rr(e,i,r,n),t,"data-hcms-crop")}function Ja(e,t){return t>=0?e.slice(0,t):e}function rr(e,t,r,n){let i=Ja(e,t);return i&&i!=="."?i:Xa(n,r)}function Xa(e,t){if(e==null||!Array.isArray(t))return"";let r=[],n=e;for(let i of t){if(n==null||typeof n=="string")break;if(Array.isArray(n)){if(typeof n[0]!="string"||i!=="*"&&typeof i!="number")return"";r.push(n[0]),n=n[1];continue}if(typeof n!="object"||!Object.prototype.hasOwnProperty.call(n,i))return"";n=n[i]}return r.join(" ")}function nr(e,t,r){if(!t||!t.querySelector||!e||e===".")return null;let n=null;try{n=t.querySelector(e)}catch{return null}return n&&n.getAttribute?n.getAttribute(r):null}function ir(e,t){if(!e||t==null)return;r(t,[]);function r(n,i){let o=Be(n);if(o==="scalar"){let a=Rt(n,e,i,t);Wa.has(a)&&on(e,a);return}if(o==="scalar-array"){let a=er(n,e);a&&(on(e,a.array),on(e,a.item));return}if(o==="object"){for(let[a,s]of Object.entries(n))r(s,[...i,a]);return}if(o==="object-array"){let a=n[1],s=[...i,"*"];if(a&&typeof a=="object"&&!Array.isArray(a))for(let[l,u]of Object.entries(a))r(u,[...s,l]);else r(a,s)}}}function Pi(e,t,r){let n=ke(e,r);if(n)return n;let i=e.createElement("template");return i.setAttribute("data-hcms-tpl",r),i.setAttribute("save-remove",""),i.innerHTML=Fi[r].trim(),t.appendChild(i),i}function ke(e,t){return!e||!e.querySelector?null:e.querySelector(`template[data-hcms-tpl="${Za(t)}"]`)}function Za(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}function Be(e){return typeof e=="string"?e.endsWith("[]")?"scalar-array":"scalar":Array.isArray(e)?"object-array":typeof e=="object"&&e!==null?"object":"scalar"}function Mt(e){return e?!!(e.content||e).querySelector("[data-hcms-field]"):!1}var Bi={IMG:"src",A:"href"};function or(e){if(!e)return"value";let t=(e.tagName||"").toUpperCase();return t==="INPUT"?(e.getAttribute("type")||"text").toLowerCase()==="checkbox"?"checked":"value":t==="TEXTAREA"||t==="SELECT"?"value":Bi[t]?Bi[t]:e.hasAttribute&&e.hasAttribute("contenteditable")?"innerHTML":null}function zi(e,t){let r=(e.tagName||"").toUpperCase(),n=(e.getAttribute&&e.getAttribute("type")||"").toLowerCase(),i=or(e),a=`${Ui(r,n)}[data-hcms-field="${et(t)}"]`;return r==="INPUT"&&n==="radio"?`${a}:checked@value`:i?`${a}@${i}`:a}function Qa(e){let t=(e.tagName||"").toUpperCase(),r=(e.getAttribute&&e.getAttribute("type")||"").toLowerCase(),n=or(e),o=`${Ui(t,r)}[data-hcms-field]`;return t==="INPUT"&&r==="radio"?`${o}:checked@value`:n?`${o}@${n}`:o}function Ui(e,t){return e==="INPUT"?t?`input[type="${t}"]`:"input":e==="TEXTAREA"?"textarea":e==="SELECT"?"select":e==="IMG"?"img":e==="A"?"a":':not([data-hcms-shape="scalar"]):not([data-hcms-shape="object"]):not([data-hcms-shape="object-array"]):not([data-hcms-shape="scalar-array"])'}function et(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var Hi=new Set(["__proto__","constructor","prototype"]);function sr(e,t){return r(e,[]);function r(u,m){let y=Be(u);if(y==="scalar")return n(u,m);if(y==="scalar-array")return i(u,m);if(y==="object-array")return o(u,m);if(y==="object"){let c=Object.create(null);for(let[h,f]of Object.entries(u)){if(Hi.has(h))throw new Error(`hypercms: rule key "${h}" is forbidden at "${m.join(".")||"<root>"}"`);c[h]=r(f,[...m,h])}return c}return null}function n(u,m){let y=m.length?m[m.length-1]:null,c=typeof y=="string"?y:"__value",h=l(m,c);if(h)return zi(h,c);let f=s(Rt(u,t,m,e),c);return f?zi(f,c):`input[data-hcms-field="${et(c)}"]@value`}function i(u,m){let y=tr(u,m,t),c=y&&s(y.item,null)||s("@scalar-array-item",null),h=c?Qa(c):"input[data-hcms-field]@value";return[a(m,"[data-hcms-array-item]"),h]}function o(u,m){let[,y]=u,c=[...m,"*"],h=a(m,"[data-hcms-card]");if(y&&typeof y=="object"&&!Array.isArray(y)){let f=Object.create(null);for(let[b,k]of Object.entries(y)){if(Hi.has(b))throw new Error(`hypercms: rule key "${b}" is forbidden at "${c.join(".")}"`);f[b]=r(k,[...c,b])}return[h,f]}return[h,r(y,[...c,0])]}function a(u,m){let y=u.length?u[u.length-1]:"",c=u.some(b=>b==="*"),h=u.join(".");return`${c?`[data-hcms-field="${et(y)}"]`:`[data-hcms-path="${et(h)}"]`} > .hcms-array-items > ${m}`}function s(u,m){if(!t)return null;let y=ke(t,u);if(!y)return null;let c=y.content||y;if(m){let h=c.querySelector(`[data-hcms-field="${et(m)}"]`);if(h)return h}return c.querySelector("[data-hcms-field]")}function l(u,m){if(!t)return null;let y=u.map(f=>typeof f=="number"?"*":f).join("."),h=[u.join("."),y];for(let f=u.length-1;f>=0;f--){let b=u.slice(0,f).map(k=>typeof k=="number"?"*":k);b.push("*"),h.push(b.join("."))}for(let f of h){if(!f)continue;let b=ke(t,f);if(!b||!Mt(b))continue;let k=b.content||b,A=k.querySelector(`[data-hcms-field="${et(m)}"]`)||k.querySelector("[data-hcms-field]");if(A)return A}return null}}function sn(e){if(!e)return"";let t=String(e).split(/[?#]/)[0],r=t.split("/").pop()||t;try{return decodeURIComponent(r)}catch{return r}}function tt({pageRules:e,formRules:t,data:r,doc:n}){let i=n.createDocumentFragment(),o=an(e,[],r,n,e);return o&&i.appendChild(o),i}function Wi({shape:e,itemShape:t,pathArr:r,data:n,doc:i,itemKey:o,pageRules:a}){if(e==="object-array-item")return Gi(t,r,n,i,a);if(e==="scalar-array-item")return Yi(r,n,i,o||null);throw new Error(`hypercms: buildItem called with unknown shape "${e}"`)}function an(e,t,r,n,i){let o=Be(e);return o==="scalar"?el(e,t,r,n,i):o==="object"?il(e,t,r,n,i):o==="object-array"?ol(e,t,r,n,i):o==="scalar-array"?sl(e,t,r,n):null}function el(e,t,r,n,i){let o=Rt(e,n,t,i),a=Qe(t,o,n);if(!a)throw new Error(`hypercms: missing template for scalar at "${t.join(".")}"`);let s=Di(e,n,t,i);s==="@number"&&o==="@scalar"&&console.info(`[hypercms] field "${t.join(".")}" declares component "@number" but its value isn't a plain number; rendering a text input so the value is preserved`),(s==="@checkbox"||s==="@toggle")&&o==="@scalar"&&console.info(`[hypercms] field "${t.join(".")}" declares component "${s}" but its value isn't true/false; rendering a text input so the value is preserved`),Ki(a,s===o?s:null,t);let l=rt(a,n);nt(l,t);let u=a.getAttribute?.("data-hcms-tpl");if((o==="@select"||o==="@radio")&&u===o&&tl(l,e,t,r,n,o,i),o==="@image"&&u==="@image"){let m=$i(e,n,t,i);m!=null&&!l.hasAttribute("data-hcms-crop")&&l.setAttribute("data-hcms-crop",m)}return al(l,Ee(t)),ar(l,Ee(t)),lr(l,Ee(t)),eo(l,r),o==="@file"&&nl(l),l}function Ki(e,t,r){if(!t)return;let n=e.getAttribute?.("data-hcms-tpl");n&&n!==t&&console.info(`[hypercms] field "${r.join(".")}" declares component "${t}" but custom template "${n}" wins`)}function tl(e,t,r,n,i,o,a){let s=qi(t,i,r,a),l=s?[...s]:[],u=n==null?"":String(n);if(u!==""&&!l.includes(u)&&l.unshift(u),!s&&(rl(e,"data-hcms-options required (space-separated values)"),l.length===0)){e.querySelector(".mirk-radio")?.remove();return}if(o==="@select"){let c=e.querySelector("select[data-hcms-field]");if(!c)return;for(let h of l){let f=i.createElement("option");f.value=h,f.textContent=Zt(h),c.appendChild(f)}return}let m=e.querySelector(".mirk-radio");if(!m||!m.parentNode)return;let y=ln(r.join("."));for(let c of l){let h=m.cloneNode(!0),f=h.querySelector('input[type="radio"]');f&&(f.value=c,f.name=y);let b=h.querySelector(".mirk-radio__label");b&&(b.textContent=Zt(c)),m.parentNode.insertBefore(h,m)}m.remove()}function ln(e){return"hcms-"+String(e).replace(/[^A-Za-z0-9_-]/g,"-")}function rl(e,t){let r=e.querySelector?e.querySelector(".hcms-error"):null;r&&(r.textContent=t,r.hidden=!1)}function nl(e){let t=e.querySelector?e.querySelector("a.mirk-file__name[data-hcms-field]"):null;t&&(t.textContent=sn(t.getAttribute("href")))}function il(e,t,r,n,i){let o=Qe(t,"@object",n);if(!o)throw new Error(`hypercms: missing template for object at "${t.join(".")}"`);let a=rt(o,n);if(nt(a,t),ar(a,Ee(t)),lr(a,Ee(t)),Mt(o))return ro(a,e,t),to(a,e,r),a;let s=cr(a,".hcms-object-fields",o,t);for(let[l,u]of Object.entries(e)){let m=r==null?null:r[l],y=an(u,[...t,l],m,n,i);y&&s.appendChild(y)}return a}function ol(e,t,r,n,i){let o=Qe(t,"@object-array",n);if(!o)throw new Error(`hypercms: missing template for object-array at "${t.join(".")}"`);let a=rt(o,n);nt(a,t),ar(a,Ee(t)),lr(a,Ee(t)),Xi(a,o),Qi(a,o,t);let s=cr(a,".hcms-array-items",o,t),[,l]=e;return(Array.isArray(r)?r:[]).forEach((m,y)=>{let c=Gi(l,[...t,y],m,n,i);c&&s.appendChild(c)}),Zi(a),a}function Gi(e,t,r,n,i){let o=Ji(t,"object-array-item",n);if(!o)throw new Error(`hypercms: missing item template for "${t.join(".")}"`);let a=rt(o,n);if(a.setAttribute("data-hcms-card",""),a.classList.contains("hcms-card")||a.classList.add("hcms-card"),nt(a,t),Mt(o))return e&&typeof e=="object"&&!Array.isArray(e)&&(ro(a,e,t),to(a,e,r)),a;let s=cr(a,".hcms-card-fields",o,t);if(e&&typeof e=="object"&&!Array.isArray(e))for(let[l,u]of Object.entries(e)){let m=r==null?null:r[l],y=an(u,[...t,l],m,n,i);y&&s.appendChild(y)}return a}function sl(e,t,r,n){let i=er(e,n),o=tr(e,t,n),a=i?i.array:"@scalar-array",s=Qe(t,a,n);if(!s)throw new Error(`hypercms: missing template for scalar-array at "${t.join(".")}"`);Ki(s,i?i.array:null,t);let l=rt(s,n);nt(l,t),ar(l,Ee(t)),lr(l,Ee(t)),Xi(l,s),Qi(l,s,t),o&&l.setAttribute("data-hcms-item-tpl",o.item);let u=cr(l,".hcms-array-items",s,t);return(Array.isArray(r)?r:[]).forEach((y,c)=>{let h=Yi([...t,c],y,n,o?o.item:null);h&&u.appendChild(h)}),Zi(l),l}function Yi(e,t,r,n){let i=Ji(e,"scalar-array-item",r,n);if(!i)throw new Error(`hypercms: missing item template for "${e.join(".")}"`);let o=rt(i,r);return o.setAttribute("data-hcms-array-item",""),o.classList.contains("hcms-array-item")||o.classList.add("hcms-array-item"),nt(o,e),eo(o,t),o}function Ji(e,t,r,n){let i=e.map(o=>typeof o=="number"?"*":o).join(".");return ke(r,i)||n&&ke(r,n)||ke(r,"@"+t)}function rt(e,t){let r=e.content||e,n=t.createElement("div");return n.appendChild(r.cloneNode(!0)),n.firstElementChild||n}function nt(e,t){e.setAttribute("data-hcms-path",t.join("."))}function al(e,t){let r=t==null?"":String(t);if(e.matches&&e.matches("[data-hcms-field]")){e.getAttribute("data-hcms-field")||e.setAttribute("data-hcms-field",r);return}(e.querySelectorAll?e.querySelectorAll("[data-hcms-field]"):[]).forEach(i=>{i.getAttribute("data-hcms-field")||i.setAttribute("data-hcms-field",r)})}function ar(e,t){t==null||t===""||!e.setAttribute||e.hasAttribute?.("data-hcms-field")||e.setAttribute("data-hcms-field",String(t))}function lr(e,t){if(t==null||t==="")return;(e.querySelectorAll?e.querySelectorAll("[data-hcms-label]"):[]).forEach(n=>{(n.textContent||"").trim()===""&&(n.textContent=Zt(String(t)))})}function Xi(e,t){["data-hcms-no-add","data-hcms-no-remove","data-hcms-no-reorder"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,"")}),["data-hcms-min-items","data-hcms-max-items"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,t.getAttribute(r))})}function Zi(e){let t=e.querySelector?e.querySelector(".hcms-array-items"):null;if(!t)return;let r=Array.from(t.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),n=r.length,i=Vi(e,"data-hcms-max-items"),o=Vi(e,"data-hcms-min-items"),a=e.hasAttribute("data-hcms-no-add"),s=e.hasAttribute("data-hcms-no-remove"),l=e.hasAttribute("data-hcms-no-reorder"),u=e.querySelector('[data-hcms-action="add"]');u&&(u.hidden=a||i!=null&&n>=i),r.forEach((m,y)=>{let c=m.querySelector('[data-hcms-action="remove"]');c&&(c.hidden=s||o!=null&&n<=o);let h=m.querySelector('[data-hcms-action="move-up"]');h&&(h.hidden=l||y===0);let f=m.querySelector('[data-hcms-action="move-down"]');f&&(f.hidden=l||y===n-1)})}function Vi(e,t){if(!e||!e.hasAttribute(t))return null;let r=parseInt(e.getAttribute(t),10);return Number.isFinite(r)?r:null}function Qi(e,t,r){if(e.hasAttribute("data-hcms-no-reorder")||t.hasAttribute("data-hcms-no-reorder"))return;let n=e.querySelector(".hcms-array-items");if(!n)return;let i="hcms-"+r.join(".");n.setAttribute("sortable",i),n.setAttribute("onsorted","hypercmsCommit && hypercmsCommit()")}function Ee(e){return e.length?e[e.length-1]:null}function eo(e,t){let r=ll(e);if(r.length!==0)for(let n of r)no(n,t)}function ll(e){if(!e)return[];let t=[];return e.matches?.("[data-hcms-field]")&&cl(e)&&t.push(e),(e.querySelectorAll?e.querySelectorAll("input[data-hcms-field], textarea[data-hcms-field], select[data-hcms-field], img[data-hcms-field], a[data-hcms-field], [contenteditable][data-hcms-field]"):[]).forEach(n=>t.push(n)),t}function cl(e){let t=(e.tagName||"").toUpperCase();return!!(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||t==="IMG"||t==="A"||e.hasAttribute?.("contenteditable"))}function to(e,t,r){(e.querySelectorAll?e.querySelectorAll("[data-hcms-field]"):[]).forEach(i=>{let o=i.getAttribute("data-hcms-field");if(!o)return;if(!t||typeof t!="object"||!(o in t)){console.warn(`[hypercms] inline template field "${o}" is not in the rule shape; ignoring`);return}let a=r==null?null:r[o];no(i,a)})}function ro(e,t,r){if(!e.querySelectorAll)return;e.querySelectorAll("[data-hcms-field]").forEach(i=>{let o=i.getAttribute("data-hcms-field");if(!o||t&&typeof t=="object"&&!(o in t))return;let a=[...r,o].join(".");i.setAttribute("data-hcms-path",a)})}function cr(e,t,r,n){if(!e.querySelector)return e;let i=e.querySelector(t);if(i)return i;let o=r?.getAttribute?.("data-hcms-tpl")||n.join(".");throw new Error(`hypercms: template "${o}" is in slotted mode but has no ${t} element`)}function no(e,t){let r=or(e),n=(e.tagName||"").toUpperCase(),i=(e.getAttribute("type")||"").toLowerCase();if(n==="INPUT"&&i==="radio"){e.checked=e.value!=null&&String(e.value)===String(t??"");return}if(r==="checked"){e.checked=t===!0||t==="true";return}if(r){e[r]=t==null?"":String(t);return}e.textContent=t==null?"":String(t)}var ul={Mutation:(e,t)=>e?.Mutation??t?.Mutation,undo:(e,t)=>e?.undo??t?.undo,onPrepareForSave:(e,t)=>e?.addDocumentTransform??t?.onPrepareForSave,onSnapshot:(e,t)=>e?.onSnapshot??t?.onSnapshot,consent:(e,t)=>e?.confirm??t?.consent,RichClay:(e,t)=>e?.RichClay??t?.RichClay,quickcrop:(e,t)=>e?.quickcrop??t?.quickcrop,upload:(e,t)=>e?.upload??(t?.uploadFileBasic?hl(t.uploadFileBasic):null)},dl={402:"payment-required",413:"too-large",415:"unsupported-type",401:"unauthorized",403:"forbidden",404:"not-found"},cn=()=>({ok:!1,msg:"Upload cancelled",msgType:"skipped",code:"aborted",uploads:[]});function hl(e){return async function(r,{onProgress:n,signal:i}={}){if(i?.aborted)return cn();try{let o=await e(r,{onProgress:s=>{n?.({loaded:null,total:null,percent:s})}});if(i?.aborted)return cn();let a=o&&o.uploads||[];return typeof a[0]?.url!="string"?{ok:!1,msg:"The host accepted the file but did not say where it put it",msgType:"error",code:"bad-response",uploads:[]}:{ok:!0,msg:o.msg||"Uploaded",msgType:o.msgType||"success",code:o.code||null,uploads:a}}catch(o){if(i?.aborted)return cn();let a={};try{a=JSON.parse(o?.response||"{}")}catch{a={}}let s=a.code||dl[o?.status]||"error";return{ok:!1,msg:o&&o.message||"Upload failed",msgType:"error",code:s,uploads:[]}}}}function ue(e,t){let r=ul[e];if(!r)throw new Error(`hypercms: unknown platform capability "${e}"`);let n=t||(typeof window<"u"?window:null);return n&&r(n.clay,n.hyperclay)||null}var io=["clay:mutation-ready","hyperclay:mutation-ready"],oo=["clay:sync-applied","hyperclay:livesync-applied"],so=["clay:ready","hyperclay:ready"];function it(e,t,r){let n=null,i=o=>{n!==null&&n!==o.type||(n=o.type,queueMicrotask(()=>{n=null}),r(o))};for(let o of t)e.addEventListener(o,i);return()=>{for(let o of t)e.removeEventListener(o,i)}}var ve="data-hcms-bound",Re="data-hcms-bound-id",un=new Map;function ao(e,t){un.set(e,t)}function lo(e){un.delete(e)}function co(e){let t=e.getAttribute(Re);if(!t)return null;let r=un.get(t);return!r||!r.restorable()?null:r.originalHTML}var ze="data-hcms-owns-richclay";function ot(e){return e&&e.richclay&&e.richclay.RichClay||ue("RichClay",e)||(e&&typeof e.RichClay=="function"?e.RichClay:null)}function uo(e,t,r){!e||typeof e.setAttribute!="function"||(e.setAttribute(ve,t?"rich":"plain"),r&&e.setAttribute(ze,"true"))}function ho(e,t){if(!e||typeof e.querySelectorAll!="function")return;let r=e.querySelectorAll(`[${ve}]`);if(!r.length)return;let n=ot(t);if(n&&typeof n.stripFromClone=="function")try{n.stripFromClone(e)}catch(i){console.warn("[hypercms] richclay strip failed; editor state may reach the save",i)}for(let i of r)i.getAttribute(ze)==="true"&&i.removeAttribute("data-richclay"),i.removeAttribute(ze),i.removeAttribute(ve)}function mo(e,t){if(!e||typeof e.removeAttribute!="function")return;let r=ot(t);if(r&&typeof r.stripElement=="function")try{r.stripElement(e)}catch(n){console.warn("[hypercms] richclay element strip failed; the clone stays editable",n)}else e.removeAttribute("contenteditable"),e.removeAttribute("no-undo");e.getAttribute(ze)==="true"&&e.removeAttribute("data-richclay"),e.removeAttribute(ze),e.removeAttribute(ve),e.removeAttribute(Re)}function fo(e,t){if(!t||e==null)return e;return r(e);function r(n){if(typeof n=="string"){if(n.endsWith("[]")||ae(n)!==-1)return n;let i=null;try{i=t.querySelector(n)}catch{return n}return i&&i.children.length>0?n+"@innerHTML":n}if(Array.isArray(n))return n;if(n&&typeof n=="object"){let i=Object.create(null);for(let[o,a]of Object.entries(n))i[o]=r(a);return i}return n}}function po(e,t){if(!t||e==null)return e;return r(e,[t]);function r(n,i){if(typeof n=="string")return n.endsWith("[]")||ae(n)!==-1?n:i.some(o=>ml(o,n))?n+"@innerHTML":n;if(Array.isArray(n)){let[o,a]=n;if(typeof o!="string"||!o)return n;let s=fl(t,o);return s.length?[o,r(a,s)]:n}if(n&&typeof n=="object"){let o=Object.create(null);for(let[a,s]of Object.entries(n))o[a]=r(s,i);return o}return n}}function ml(e,t){let r=null;try{r=e.querySelector(t)}catch{return!1}return r?r.hasAttribute(ve)?r.getAttribute(ve)==="rich":r.children.length>0:!1}function fl(e,t){try{return[...e.querySelectorAll(t)]}catch{return[]}}function st(e){if(!e||e.tagName!=="TEXTAREA")return;let t=e.ownerDocument.defaultView||(typeof window<"u"?window:null);t&&t.CSS&&t.CSS.supports&&t.CSS.supports("field-sizing: content")||(e.style.height="auto",e.style.height=e.scrollHeight+"px")}function Me(e,t,r=!0){if(!e||!e.querySelectorAll||(e.querySelectorAll("textarea[data-hcms-field]").forEach(st),r===!1))return;let n=t&&t.defaultView||(typeof window<"u"?window:null),i=ot(n);i&&e.querySelectorAll("[contenteditable][data-hcms-field]").forEach(o=>{if(o.__hcmsRichclay)return;let a;try{a=new i(o,{inline:!0,hyperclay:!1,toolbar:["bold","italic","link","undo","redo"]})}catch(l){console.warn("[hypercms] richclay activation failed; field stays plain contenteditable",l);return}o.__hcmsRichclay=a;let s=a&&a.squire;s&&typeof s.addEventListener=="function"&&s.addEventListener("input",()=>{let l=n&&n.Event||Event;o.dispatchEvent(new l("input",{bubbles:!0}))})})}var dn=new WeakSet;function He(e,t){let r=ue("undo");if(!r)return t();r.pause();try{let n=t();return n&&n.ok?r.commitCaptured(e):r.discardCaptured(),n}finally{r.resume()}}function _e(e){let t=ue("undo");if(!t)return e();t.pause();try{return e()}finally{t.discardCaptured(),t.resume()}}function hr(e){let{formRoot:t}=e;if(!t||dn.has(t))return;dn.add(t);let r=a=>{let s=a.target;!s||!s.closest||s.closest("[data-hcms-form-root]")&&s.matches("input, textarea, select, [contenteditable][data-hcms-field]")&&(s.tagName==="TEXTAREA"&&st(s),!s.matches('input[type="file"]')&&(!s.closest("[data-hcms-field]")&&!s.hasAttribute?.("data-hcms-field")||go(s,e)))},n=a=>{let s=a.target;if(!(!s||!s.closest)&&s.closest("[data-hcms-form-root]")){if(s.matches('input[type="file"][data-hcms-upload]')){wl(s,e);return}s.matches('input[type="checkbox"], input[type="radio"], select')&&go(s,e)}},i=a=>{let s=a.target;if(!s||!s.closest)return;let l=s.closest("[data-hcms-action]");if(!l)return;let u=l.getAttribute("data-hcms-action");if(u==="add"||u==="remove"||u==="move-up"||u==="move-down"||u==="clear-upload"){if(!l.closest("[data-hcms-form-root]"))return}else if(u==="close"&&!l.closest("[data-hcms-shell]"))return;if(u==="add"){let m=l.closest("[data-hcms-path]");if(!m)return;let y=m.getAttribute("data-hcms-path");Nt(y,e)}else if(u==="remove"){let m=l.closest("[data-hcms-card], [data-hcms-array-item]");if(!m)return;fn(m,e)}else if(u==="move-up"||u==="move-down"){let m=l.closest("[data-hcms-card], [data-hcms-array-item]");if(!m)return;mn(m,u==="move-up"?-1:1,e)}else u==="clear-upload"?_l(l,e):u==="close"&&e.onCloseRequested?.()},o=t.ownerDocument;o.addEventListener("input",r,!0),o.addEventListener("change",n,!0),o.addEventListener("click",i,!0),e.detachEvents=()=>{o.removeEventListener("input",r,!0),o.removeEventListener("change",n,!0),o.removeEventListener("click",i,!0),dn.delete(t)}}var pl=new Set(["value","checked"]);function gl(e,t){if(!t)return null;let r=Se(t);if(r.some(l=>typeof l=="number"||l==="*"))return null;let n=Pe(e.pageRules,r);if(typeof n!="string")return null;let i=fe.ruleAttrIndex(n);if(i===-1)return null;let o=n.slice(i+1);if(!pl.has(o))return null;let a=n.slice(0,i),s=a?e.pageRoot.querySelector(a):e.pageRoot;return s?{el:s,prop:o,oldValue:s[o]}:null}function go(e,t){let n=(e.closest("[data-hcms-field]")||e).closest("[data-hcms-path]")?.getAttribute("data-hcms-path")||"",i=gl(t,n);if(be(pe(t),{path:n,structural:!1},t),i){let o=ue("undo");o&&typeof o.recordValue=="function"&&o.recordValue(i.el,{prop:i.prop,oldValue:i.oldValue,newValue:i.el[i.prop]})}}var bl={type:"image/webp",quality:.85,maxWidth:2048,maxHeight:2048};async function yl(e,t){let r=t&&t.getAttribute?t.getAttribute("data-hcms-crop"):null;if(r==null)return{file:e};let n=ue("quickcrop");if(typeof n!="function")return{file:e};try{let i=typeof window<"u"&&(window.clay?.modal??window.themodal)||"auto",o=await n(e,{aspect:kl(r),modal:i,...bl});return o===null?null:{file:vl(o.blob,e.name),dataURL:o.dataURL}}catch(i){return lt(t,i&&i.message||"Crop failed"),null}}function kl(e){let t=String(e??"").trim().toLowerCase();if(t===""||t==="free")return null;let r=t.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);if(!r)return null;let n=parseFloat(r[1]),i=parseFloat(r[2]);return!n||!i?null:n/i}function vl(e,t){let r=e.type==="image/webp"?".webp":e.type==="image/jpeg"?".jpg":".png",n=String(t||"image").replace(/\.[^.]+$/,"");try{return new File([e],n+r,{type:e.type})}catch{return e}}var xl=new Set(["unsupported","payment-required"]);async function wl(e,t){let r=e.files&&e.files[0];if(!r)return;let n=e.closest("[data-hcms-path]");if(!n)return;let i=n.getAttribute("data-hcms-path")||"";lt(n,null);let o=await yl(r,n);if(!o||t.closed){Ne(e);return}let a=o.file,s=o.dataURL||null,l=ue("upload");if(typeof l!="function")return hn(e,n,t,i,await bo(a,s,n),a);xo(n,s),yo(n,0);let u=Sl(t),m;try{m=await l(a,{signal:u?.signal,onProgress:({percent:c})=>yo(n,c)})}finally{El(t,u),Cl(n)}if(t.closed){Ne(e);return}if(m.code==="aborted"){Ne(e);return}if(m.ok)return hn(e,n,t,i,m.uploads[0].url,a);if(!xl.has(m.code)){lt(n,m.msg||"Upload failed"),t.dispatch?.("hcms:error",{error:new Error(m.msg||"Upload failed"),code:m.code,path:i}),Ne(e);return}let y=m.code==="payment-required"?"This file is stored in the page. Add a paid plan to upload files.":null;return hn(e,n,t,i,await bo(a,s,n),a,y)}function hn(e,t,r,n,i,o,a=null){if(r.closed){Ne(e);return}if(xo(t,null),lt(t,null),!i){Ne(e);return}vo(t,i,o.name),be(pe(r),{path:n,structural:!1},r),a&&lt(t,a,"info"),Ne(e)}async function bo(e,t,r){return t||await Al(e,r)}function Al(e,t){let r=t?.ownerDocument?.defaultView?.FileReader||globalThis.FileReader;return r?new Promise(n=>{let i=new r;i.onload=()=>n(typeof i.result=="string"?i.result:""),i.onerror=()=>n("");try{i.readAsDataURL(e)}catch{n("")}}):Promise.resolve("")}function Sl(e){if(typeof AbortController!="function")return null;let t=new AbortController;return(e.uploads||(e.uploads=new Set)).add(t),t}function El(e,t){t&&e.uploads?.delete(t)}function _l(e,t){let r=e.closest("[data-hcms-path]");if(!r)return;let n=r.getAttribute("data-hcms-path")||"";vo(r,"","");let i=r.querySelector('input[type="file"][data-hcms-upload]');i&&Ne(i),lt(r,null),be(pe(t),{path:n,structural:!1},t)}function Tl(e){return e.querySelector?e.querySelector("img[data-hcms-field], a[data-hcms-field]"):null}function vo(e,t,r){let n=Tl(e);if(!n)return;let i=(n.tagName||"").toUpperCase();i==="IMG"?n.src=t||"":i==="A"&&(n.href=t||"",n.textContent=t?r||sn(t):"")}function Ne(e){try{e.value=""}catch{}}function xo(e,t){let r=e.querySelector?e.querySelector(".mirk-image__frame"):null;r&&(t?r.style.backgroundImage=`url("${t.replace(/"/g,"%22")}")`:r.style.removeProperty("background-image"))}function yo(e,t){let r=Math.max(0,Math.min(100,Number(t)||0));e.setAttribute("data-hcms-uploading",""),e.style?.setProperty?.("--hcms-upload-progress",`${r}%`)}function Cl(e){e.removeAttribute("data-hcms-uploading"),e.style?.removeProperty?.("--hcms-upload-progress")}function lt(e,t,r="error"){let n=e.querySelector?e.querySelector(":scope > .hcms-error"):null;n&&(n.classList.toggle("hcms-error--info",!!t&&r==="info"),t?(n.textContent=t,n.hidden=!1):(n.textContent="",n.hidden=!0))}function Nt(e,t){let{formRoot:r,pageRules:n}=t,i=r.querySelector(`[data-hcms-path="${ct(e)}"]`);if(!i)throw new Error(`hypercms: no element at path "${e}"`);let o=i.querySelector(".hcms-array-items");if(!o)throw new Error(`hypercms: array container missing .hcms-array-items at "${e}"`);let a=Se(e),s=Ll(n,a),l=Array.isArray(s),u=typeof s=="string"&&s.endsWith("[]");if(!l&&!u)throw new Error(`hypercms: path "${e}" is not an array`);let m=dr(i,"data-hcms-max-items"),y=o.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]");if(i.hasAttribute("data-hcms-no-add")||m!=null&&y.length>=m)return;let c=y.length,h=l?s[1]:s.replace(/\[\]$/,""),f=Ot(l?h:"string"),b=Wi({shape:l?"object-array-item":"scalar-array-item",itemShape:h,pathArr:[...a,c],data:f,doc:t.doc,itemKey:i.getAttribute("data-hcms-item-tpl")||null,pageRules:n});return o.appendChild(b),Me(b,t.doc,t.view?.enhanceFormRichText!==!1),gn(i),He(`Add ${e}`,()=>be(pe(t),{path:e,structural:!0},t))}function mn(e,t,r){let n=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]');if(!n||n.hasAttribute("data-hcms-no-reorder"))return;let i=n.querySelector(".hcms-array-items");if(!i)return;let o=Array.from(i.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),a=o.indexOf(e);if(a<0)return;let s=a+t;if(s<0||s>=o.length)return;let l=e.querySelector(`[data-hcms-action="${t<0?"move-up":"move-down"}"]`);return t<0?i.insertBefore(e,o[s]):i.insertBefore(e,o[s].nextSibling),bn(i),gn(n),l&&typeof l.focus=="function"&&e.querySelector(`[data-hcms-action="${t<0?"move-up":"move-down"}"]`)?.focus?.(),He(`Reorder ${n.getAttribute("data-hcms-path")||""}`,()=>be(pe(r),{path:n.getAttribute("data-hcms-path")||"",structural:!0},r))}var ur="Delete this item?";function Ol(e,t){let r=e&&e.getAttribute("data-hcms-confirm-remove");if(r!=null)return/^(off|false|no|0)$/i.test(r.trim())?null:r||ur;let n=t&&t.confirmRemove;return n===!1?null:typeof n=="string"?n||ur:n===!0||e&&e.getAttribute("data-hcms-shape")==="object-array"?ur:null}function fn(e,t){let r=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]'),n=Ol(r,t);if(n==null)return at(e,t);let i=ue("consent")||typeof window<"u"&&window.consent;typeof i=="function"?Promise.resolve(i(n)).then(()=>{t.closed||at(e,t)},()=>{}):typeof window<"u"&&typeof window.confirm=="function"?window.confirm(n)&&at(e,t):at(e,t)}function at(e,t){let r=e.getAttribute("data-hcms-path")||"",n=e.parentElement,i=e.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]');if(!i?.hasAttribute("data-hcms-no-remove")){if(i){let o=dr(i,"data-hcms-min-items"),a=i.querySelector(".hcms-array-items"),s=a?a.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]").length:0;if(o!=null&&s<=o)return}return e.remove(),n&&bn(n),i&&gn(i),He(`Remove ${r}`,()=>be(pe(t),{path:r,structural:!0},t))}}function be(e,t,r){if(r.closed)return{ok:!1,skipped:!0,closed:!0};let n=Lt(e);if(!t.structural&&n===r.lastFingerprint)return{ok:!0,skipped:!0};let i=Object.hasOwn(r,"writeRules")?r.writeRules:r.pageRules,o=Mi(r.pageRoot,i,e,{shellRoot:r.shellRoot,structural:!!t.structural,structuralPath:t.path||null,formRoot:r.formRoot});return o.ok?(r.lastFingerprint=n,r.lastData=e,ko(r,null),r.dispatch?.("hcms:change",{data:e,path:t.path,structural:!!t.structural}),r.onChange?.(e,t)):(ko(r,Nl(o.error,t.path)),r.dispatch?.("hcms:error",{error:o.error,attemptedData:e}),r.onError?.(o.error)),o}function mr(e,t){let r=ct(t),n=`[data-hcms-path="${r}"] input[data-hcms-field], [data-hcms-path="${r}"] textarea[data-hcms-field], [data-hcms-path="${r}"] select[data-hcms-field], [data-hcms-path="${r}"] img[data-hcms-field], [data-hcms-path="${r}"] a[data-hcms-field], [data-hcms-path="${r}"] [contenteditable][data-hcms-field], input[data-hcms-path="${r}"][data-hcms-field], textarea[data-hcms-path="${r}"][data-hcms-field], select[data-hcms-path="${r}"][data-hcms-field], img[data-hcms-path="${r}"][data-hcms-field], a[data-hcms-path="${r}"][data-hcms-field], [contenteditable][data-hcms-path="${r}"][data-hcms-field]`;return e.querySelector(n)}function fr(e,t,r,n){let i=(e.tagName||"").toUpperCase(),o=(e.getAttribute("type")||"").toLowerCase();if(i==="INPUT"&&o==="checkbox"){e.checked=t===!0||t==="true";return}if(i==="INPUT"&&o==="radio"){let a=ct(n),s=r.querySelectorAll(`[data-hcms-path="${a}"][data-hcms-field][type="radio"], [data-hcms-path="${a}"] [data-hcms-field][type="radio"]`);s.length?s.forEach(l=>{l.checked=String(l.value)===String(t??"")}):e.checked=String(e.value)===String(t??"");return}if(i==="IMG"){e.src=t==null?"":String(t);return}if(i==="A"){e.href=t==null?"":String(t);return}if(e.hasAttribute&&e.hasAttribute("contenteditable")){e.innerHTML=t==null?"":String(t);return}if("value"in e){e.value=t==null?"":String(t);return}e.textContent=t==null?"":String(t)}function pe(e){let t=fe.extract(e.formRoot,e.formRules,{exclude:null});return Le(t,e.formRules)}function Le(e,t){if(t==null||e==null)return e;if(typeof t=="string")return t.endsWith("@checked")?e===!0||e==="true":e;if(Array.isArray(t)){if(!Array.isArray(e))return e;let[,r]=t;return e.map(n=>Le(n,r))}if(typeof t=="object"){if(typeof e!="object"||Array.isArray(e))return e;let r={};for(let[n,i]of Object.entries(t))r[n]=Le(e[n],i);return r}return e}function ko(e,t){e.lastErrors=t&&t.length?t:null,pn(e)}function pn(e){if(Rl(e),e.errorEl&&(e.errorEl.textContent="",e.errorEl.hidden=!0),!e.lastErrors)return;let t=[];for(let{message:r,path:n}of e.lastErrors){if(n!=null&&n!==""){let i=Ml(e.formRoot,n);if(i){i.textContent=i.textContent?`${i.textContent}
${r}`:r,i.hidden=!1;continue}}t.push(r)}t.length&&e.errorEl&&(e.errorEl.textContent=t.join(`
`),e.errorEl.hidden=!1)}function Rl(e){if(e.formRoot)for(let t of e.formRoot.querySelectorAll(".hcms-error"))t.textContent="",t.hidden=!0}function Ml(e,t){if(!e)return null;let r=t.split(".");for(;r.length>0;){let n=r.join("."),i=typeof CSS<"u"&&CSS.escape?CSS.escape(n):n.replace(/[^a-zA-Z0-9_\-.*]/g,a=>"\\"+a),o=e.querySelector(`[data-hcms-path="${i}"]`);if(o){for(let a of o.children)if(a.classList&&a.classList.contains("hcms-error"))return a}r.pop()}return null}function Nl(e,t){return e?e.name==="EmptyListInsert"?[{message:"Add a seed item in HTML first.",path:t}]:e.name==="ShapeMismatch"&&Array.isArray(e.mismatches)&&e.mismatches.length?e.mismatches.map(r=>({message:`Shape mismatch: expected ${r.expected}, got ${r.got}`,path:r.path})):[{message:e.message||String(e),path:t}]:[{message:"unknown error",path:t}]}function Ll(e,t){let r=e;for(let n of t){if(r==null||typeof r=="string")return;if(Array.isArray(r)){if(typeof n!="number"&&n!=="*")return;r=r[1];continue}if(typeof r=="object"){if(typeof n=="number"||!(n in r))return;r=r[n];continue}return}return r}function dr(e,t){if(!e||!e.hasAttribute(t))return null;let r=parseInt(e.getAttribute(t),10);return Number.isFinite(r)?r:null}function gn(e){if(!e)return;let t=e.querySelector(".hcms-array-items");if(!t)return;let r=Array.from(t.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")),n=r.length,i=dr(e,"data-hcms-max-items"),o=dr(e,"data-hcms-min-items"),a=e.hasAttribute("data-hcms-no-add"),s=e.hasAttribute("data-hcms-no-remove"),l=e.hasAttribute("data-hcms-no-reorder"),u=e.querySelector(':scope > .hcms-add, :scope > * > .hcms-add, :scope > [data-hcms-action="add"]');u&&(u.hidden=a||i!=null&&n>=i),r.forEach((m,y)=>{let c=m.querySelector('[data-hcms-action="remove"]');c&&(c.hidden=s||o!=null&&n<=o);let h=m.querySelector('[data-hcms-action="move-up"]');h&&(h.hidden=l||y===0);let f=m.querySelector('[data-hcms-action="move-down"]');f&&(f.hidden=l||y===n-1)})}function pr(e){!e||!e.querySelectorAll||e.querySelectorAll(".hcms-array-items").forEach(t=>bn(t))}function bn(e){let t=e.querySelectorAll?Array.from(e.querySelectorAll('input[type="radio"][data-hcms-field]'),n=>[n,n.checked]):[],r=0;for(let n of e.children){if(!n.matches?.("[data-hcms-card], [data-hcms-array-item]"))continue;let i=n.getAttribute("data-hcms-path");if(!i)continue;let o=i.split(".");o[o.length-1]=String(r);let a=o.join(".");a!==i&&Il(n,i,a),r++}for(let[n,i]of t)n.checked!==i&&(n.checked=i)}function Il(e,t,r){let n=e.querySelectorAll("[data-hcms-path]");e.setAttribute("data-hcms-path",r);for(let i of n){let o=i.getAttribute("data-hcms-path");o===t?i.setAttribute("data-hcms-path",r):o&&o.startsWith(t+".")&&i.setAttribute("data-hcms-path",r+o.slice(t.length))}jl(e)}function jl(e){for(let t of e.querySelectorAll('input[type="radio"][data-hcms-field]')){if(!t.name||!t.name.startsWith("hcms-"))continue;let r=t.closest("[data-hcms-path]");r&&(t.name=ln(r.getAttribute("data-hcms-path")))}}function Lt(e){return JSON.stringify(e,(t,r)=>{if(r&&typeof r=="object"&&!Array.isArray(r)){let n=Object.create(null);for(let i of Object.keys(r).sort())n[i]=r[i];return n}return r})}function ct(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var Bl={},gr="hcms-shell-styles",Fl="hcms-bundled-styles-installed",br="hcms-session-open",Dl='a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',ut=new WeakSet,yn="";function Ao(e){yn=e}function It(e){e?.body?.classList.add(br)}function kn(e){e?.body?.classList.remove(br)}var ql=0;function wo(e){return String(e).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t])}function So({mountTo:e,side:t="right",overlay:r=!1,showSaveButton:n=!1,title:i="Page content",eyebrow:o="Edit",theme:a=null,doc:s}){Eo(s);let l=`hcms-shell-title-${++ql}`,u=s.createElement("div");u.setAttribute("data-hcms-shell",""),u.setAttribute("editor-ui",""),u.setAttribute("save-remove",""),u.setAttribute("save-ignore",""),u.setAttribute("tabindex","-1"),u.setAttribute("role","dialog"),u.setAttribute("aria-modal","true"),u.setAttribute("aria-labelledby",l);let m=a==="dark"?" dark":a==="light"?" light":"";u.className="hcms-shell pixel-quiet hcms-panel hcms-side-"+t+(r?" hcms-overlay":"")+m;let y=wo(i),c=wo(o);u.innerHTML=`
    <div class="hcms-shell-minibar" aria-hidden="true">
      <span class="hcms-shell-minibar-title">${y}</span>
      <button type="button" class="hcms-shell-close mirk-button mirk-button--small" data-hcms-action="close" aria-label="Close">
        <span class="mirk-button__label">\xD7</span>
      </button>
    </div>
    <div class="hcms-shell-body">
      <header class="hcms-shell-header">
        <div class="hcms-shell-heading">
          <div class="hcms-shell-eyebrow">${c}</div>
          <h2 class="hcms-shell-title" id="${l}">${y}</h2>
        </div>
        <button type="button" class="hcms-shell-close mirk-button mirk-button--small" data-hcms-action="close" aria-label="Close">
          <span class="mirk-button__label">\xD7</span>
        </button>
      </header>
      <div class="hcms-shell-notice" role="status" hidden></div>
      <div class="hcms-shell-error" role="alert" hidden></div>
      <div data-hcms-form-root class="hcms-form"></div>
      <footer class="hcms-shell-footer"${n?"":" hidden"}>
        <button type="button" class="hcms-shell-save mirk-button" trigger-save>
          <span class="mirk-button__label">Save</span>
        </button>
      </footer>
    </div>
  `,(e||s.body).appendChild(u);let f=s.body;f.classList.add("hcms-open"),It(s),r&&f.classList.add("hcms-overlay"),t==="left"&&f.classList.add("hcms-side-left");let b=Pl(u,s),k=$l(u);return{root:u,formRoot:u.querySelector("[data-hcms-form-root]"),noticeEl:u.querySelector(".hcms-shell-notice"),errorEl:u.querySelector(".hcms-shell-error"),saveButton:u.querySelector(".hcms-shell-save"),destroy(){b.detach(),k.detach(),u.remove(),f.classList.remove("hcms-open","hcms-overlay","hcms-side-left"),kn(s)},restoreChrome(){Ie(s),f.classList.add("hcms-open"),It(s),r&&f.classList.add("hcms-overlay"),t==="left"&&f.classList.add("hcms-side-left")}}}function Ie(e){e&&(e.getElementById(gr)||e.querySelector("style[data-hcms-bundled-styles]")||(ut.delete(e),Eo(e)))}function Eo(e){if(e&&!ut.has(e)){if(e[Fl]){ut.add(e);return}if(e.getElementById(gr)||e.querySelector("style[data-hcms-bundled-styles]")){ut.add(e);return}if(yn){let t=e.createElement("style");t.id=gr,t.setAttribute("save-remove",""),t.setAttribute("save-ignore",""),t.textContent=yn,(e.head||e.documentElement).appendChild(t),ut.add(e);return}try{let t=new URL("./theme.generated.css",Bl.url).href,r=e.createElement("link");r.rel="stylesheet",r.id=gr,r.setAttribute("save-remove",""),r.setAttribute("save-ignore",""),r.href=t,(e.head||e.documentElement).appendChild(r),ut.add(e)}catch{let r=()=>{link.isConnected&&console.warn("hypercms: shell stylesheet not applied \u2014 cssText is empty and the co-located theme fallback is unavailable. Call installStyles(themeText) before opening the CMS.")};e.defaultView?.queueMicrotask?e.defaultView.queueMicrotask(r):r()}}}function $l(e){let t=e.querySelector(".hcms-shell-body"),r=e.querySelector(".hcms-shell-header");if(!t||!r||typeof t.addEventListener!="function")return{detach(){}};let n=()=>{let i=(r.offsetHeight||0)-12;e.classList.toggle("is-condensed",t.scrollTop>i)};return t.addEventListener("scroll",n,{passive:!0}),n(),{detach(){t.removeEventListener("scroll",n)}}}function Pl(e,t){function r(n){if(n.key!=="Tab"||!e.contains(t.activeElement))return;let i=Array.from(e.querySelectorAll(Dl));if(i.length===0)return;let o=i[0],a=i[i.length-1];n.shiftKey&&t.activeElement===o?(n.preventDefault(),a.focus()):!n.shiftKey&&t.activeElement===a&&(n.preventDefault(),o.focus())}return t.addEventListener("keydown",r),{detach:()=>t.removeEventListener("keydown",r)}}var zl="[hypercms]",_o={skip:"[data-hcms-shell]",templateAttr:"cms-template"},To={skip:"[data-hcms-shell]",templateAttr:null},vn=class extends Error{constructor(t,r,n){super(`hypercms: rule at "${t}" has an invalid CSS selector: "${r}"`),this.name="InvalidRuleSelector",this.path=t,this.selector=r,this.cause=n}};function kr(e,t){let r=[],n=[],i=[];return wn(Ae(e),e,t,[],r,n,i),{missing:Co(r),twins:Kl(n),readOnly:Co(i)}}function vr(e){return xn(e)}function xn(e){if(typeof e=="string")return Oo(e)?void 0:e;if(Array.isArray(e)){let[t,r]=e;return[t,xn(r)]}if(e&&typeof e=="object"){let t={};for(let[r,n]of Object.entries(e)){let i=xn(n);i!==void 0&&(t[r]=i)}return t}return e}function wn(e,t,r,n,i,o,a){if(typeof r=="string"){let s=Hl(r),l=s?yr(e,t,s,_o,n):[];if(Oo(r)){a.push(dt(n));return}if(!s)return;if(r.endsWith("[]")){l.length===0&&yr(e,t,s,To,n).length===0&&i.push(dt(n));return}l.length===0?i.push(dt(n)):l.length>1&&o.push({path:dt(n),count:l.length});return}if(Array.isArray(r)){let[s,l]=r;if(typeof s!="string"||!s)return;let u=yr(e,t,s,_o,n);if(u.length===0){yr(e,t,s,To,n).length===0&&i.push(dt(n));return}for(let m of u)wn(e,m,l,[...n,"*"],i,o,a);return}if(r&&typeof r=="object")for(let[s,l]of Object.entries(r))wn(e,t,l,[...n,s],i,o,a)}function yr(e,t,r,n,i){try{return e.find(t,r,n)}catch(o){throw new vn(dt(i),r,o)}}function Hl(e){if(e==="."||e.startsWith("@"))return null;if(e.endsWith("[]"))return e.slice(0,-2)||null;let t=ae(e);return(t===-1?e:e.slice(0,t))||null}function Ul(e){if(e.endsWith("[]"))return null;let t=ae(e);return t===-1?null:e.slice(t+1)||null}function Oo(e){let t=Ul(e);return t!=null&&vt.has(t)}function ht(e){Vl(e),Wl(e)}function Vl(e){let t=e.noticeEl;if(!t)return;let r=e.unresolved&&e.unresolved.missing||[],n=e.unresolved&&e.unresolved.readOnly||[];if(r.length===0&&n.length===0){t.textContent="",t.hidden=!0;return}let i=[];if(r.length){let o=r.length===1?"1 field no longer matches this page":`${r.length} fields no longer match this page`;i.push(`${o}: ${r.join(", ")}`)}if(n.length){let o=n.length===1?"1 field reads a property the browser will not let anything write":`${n.length} fields read properties the browser will not let anything write`;i.push(`${o}: ${n.join(", ")}`)}t.textContent=i.join(`
`),t.hidden=!1}function Wl(e){let t=e.unresolved&&e.unresolved.twins||[],r=t.map(n=>`${n.path}:${n.count}`).join("|");if(r!==e.lastTwinSignature){e.lastTwinSignature=r;for(let{path:n,count:i}of t)console.warn(`${zl} "${n}" matches ${i} elements; edits go to the first one.`)}}function Co(e){return[...new Set(e)]}function Kl(e){let t=new Map;for(let r of e){let n=t.get(r.path);(!n||r.count>n.count)&&t.set(r.path,r)}return[...t.values()]}function dt(e){return e.length?e.join("."):"(whole page)"}var Gl={skip:"[data-hcms-shell]",templateAttr:"cms-template"};function je(e,{ignoreActiveValue:t}={}){return Yl(e,{ignoreActiveValue:t})}function Yl(e,{ignoreActiveValue:t}){let r=fe.findRules(e.doc,e.rulesSource||"cms");r&&(e.pageRules=e.view.prepareRules(r.rules),e.rulesTagNode=r.tagNode),Qt(e.doc),ir(e.doc,e.pageRules),e.formRules=sr(e.pageRules,e.doc),e.writeRules=vr(e.pageRules),e.unresolved=kr(e.pageRoot,e.pageRules);let n=Jt(),i=Le(fe.extract(e.pageRoot,e.pageRules,{...Gl,...n.hooks}),e.pageRules),o=tt({pageRules:e.pageRules,formRules:e.formRules,data:i,doc:e.doc});Yt(e.formRoot,o,{ignoreActiveValue:t}),n.seed(e.formRoot),Me(e.formRoot,e.doc,e.view?.enhanceFormRichText!==!1),pn(e),ht(e),e.updateFingerprint&&e.updateFingerprint()}function Ro({debounce:e=100,onRefresh:t}){let r=ue("Mutation");if(!r||typeof r.onAnyChange!="function")throw new Error("hypercms: a mutation hub is required (clay.Mutation or hyperclay.Mutation). Load clayjs or hyperclayjs, or just the mutation utility, before initializing hypercms.");let n=r.onAnyChange({debounce:e},i=>{t(i)});return{unsubscribe:typeof n=="function"?n:()=>{}}}var Jl='input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';function Mo({doc:e,pageRoot:t,opts:r={}}){let n=r.richText!==!1,i=null;return{name:"sidebar",richText:n,enhanceFormRichText:!0,ctx:null,root:null,formRoot:null,errorEl:null,noticeEl:null,prepareRules(o){return n?fo(o,t):o},mount(o){let a=this.ctx;i=_e(()=>So({mountTo:r.mountTo||e.body,side:r.side||"right",overlay:!!r.overlay,showSaveButton:!!r.showSaveButton,title:r.title,eyebrow:r.eyebrow,theme:r.theme,doc:e})),this.root=i.root,this.formRoot=i.formRoot,this.errorEl=i.errorEl,this.noticeEl=i.noticeEl;let s=tt({pageRules:a.pageRules,formRules:a.formRules,data:o,doc:e});i.formRoot.appendChild(s),a.seeder.seed(i.formRoot),Me(i.formRoot,e),ht(a),hr(a)},refresh(o){if(o==="livesync"){i?.restoreChrome?.(),je(this.ctx,{ignoreActiveValue:!0});return}if(o==="undo"){je(this.ctx,{ignoreActiveValue:!1});return}je(this.ctx)},focusOnOpen(){let o=this.root&&this.root.querySelector(Jl);o&&typeof o.focus=="function"&&o.focus()},destroy(){i?.destroy(),i=null}}}var Xl="[cms-template], [data-hcms-shell]";function jt(e){if(!e||typeof e.getBoundingClientRect!="function"||typeof e.closest=="function"&&e.closest(Xl))return!1;let t=e.getBoundingClientRect();return t.width>=8&&t.height>=8}var Zl={skip:"[data-hcms-shell]",templateAttr:"cms-template"},Ql={skip:"[data-hcms-shell]",templateAttr:null},ec="text",tc="native",No="handle",rc=new Set(["INPUT","TEXTAREA","SELECT"]),jo=new Set(["IMG","INPUT","TEXTAREA","SELECT","OPTION","BR","HR","VIDEO","AUDIO","IFRAME","EMBED","OBJECT","CANVAS","SOURCE","TRACK","AREA","COL","PARAM","BUTTON"]);function Sn(e,t){return nc(e,t)}function nc(e,t){let r=[],n=[],i=Ae(e);return An(i,e,t,[],r,n),{targets:r,lists:n}}function An(e,t,r,n,i,o){if(typeof r=="string"){if(r.endsWith("[]")){let m=r.slice(0,-2);if(!m)return;let y=xr(e,t,m);y.forEach((c,h)=>{i.push(Io([...n,h],c,r,null))}),o.push(Lo(e,t,n,m,y,!0));return}let a=ae(r),s=a===-1?null:r.slice(a+1),l=a===-1?r:r.slice(0,a),u=!l||l==="."?t:xr(e,t,l)[0];u&&i.push(Io(n,u,r,s));return}if(Array.isArray(r)){let[a,s]=r;if(typeof a!="string"||!a)return;let l=xr(e,t,a);l.forEach((u,m)=>An(e,u,s,[...n,m],i,o)),o.push(Lo(e,t,n,a,l,typeof s=="string"));return}if(r&&typeof r=="object")for(let[a,s]of Object.entries(r))An(e,t,s,[...n,a],i,o)}function Lo(e,t,r,n,i,o){let a=i[0]?i[0].parentElement:null;if(!a){let s=xr(e,t,n,Ql)[0];a=s?s.parentElement:null}return{path:r,items:i,container:a,scalar:o}}function Io(e,t,r,n){return{path:e,el:t,rule:r,attr:n,kind:ic(t,n),icon:sc(t,n)}}function ic(e,t){let r=(e.tagName||"").toUpperCase();return!t||t==="innerHTML"?jo.has(r)?No:ec:t==="value"&&rc.has(r)&&!e.readOnly&&!oc(e)?tc:No}function oc(e){return e.disabled?!0:typeof e.matches=="function"&&e.matches(":disabled")}function sc(e,t){let r=(e.tagName||"").toUpperCase();return(!t||t==="innerHTML")&&!jo.has(r)?null:r==="IMG"||t==="srcset"?"camera":r==="A"&&t==="href"?"paperclip":"pencil"}function xr(e,t,r,n=Zl){try{return e.find(t,r,n)}catch{return[]}}var Fo=Object.freeze({data:Object.freeze({tokens:["no-data"],bundles:["editor-ui"]}),save:Object.freeze({tokens:["no-save"],bundles:["editor-ui"]}),snapshot:Object.freeze({tokens:["no-snapshot"],bundles:["editor-ui"]}),watch:Object.freeze({tokens:["no-watch"],bundles:["editor-ui"]}),undo:Object.freeze({tokens:["no-undo"],bundles:["editor-ui"]}),history:Object.freeze({tokens:[],bundles:["editor-ui"]})}),ac=Object.freeze({"editor-ui":Object.freeze(["no-data","no-save","no-snapshot","no-watch","no-undo"])}),xm=Object.freeze(["no-save","no-snapshot","no-trigger-autosave","no-dirty","no-watch","no-undo","no-data","freeze","editor-ui"]);function En(e,t){if(!e||e.nodeType!==1)return!1;let r=e.getAttribute?.("clay");return!!(r&&r.split(/\s+/).includes(t)||e.hasAttribute?.(t))}function lc(e,t){if(En(e,t))return!0;for(let[r,n]of Object.entries(ac))if(n.includes(t)&&En(e,r))return!0;return!1}function Ft(e){let t=Fo[e];if(!t)throw new Error(`Unknown region capability: ${e}`);return[...t.tokens,...t.bundles].flatMap(r=>[`[clay~="${r}"]`,`[${r}]`]).join(", ")}function cc(e,t){let r=e&&e.nodeType===1?e:e?.parentElement;for(;r&&r.nodeType===1;){let n=Fo[t];if(!n)throw new Error(`Unknown region capability: ${t}`);if(n.tokens.some(i=>lc(r,i))||n.bundles.some(i=>En(r,i)))return r;r=r.parentElement}return null}function Do(e,t){return!!cc(e,t)}var uc=/:(?:focus(?:-within|-visible)?|hover|active|visited|defined)\b/i;function qo(e,t){if(!/^(INPUT|TEXTAREA|SELECT|OPTION)$/.test(e.tagName||""))return;let r=(e.getAttribute?.("type")||"").toLowerCase();if("value"in e&&"value"in t&&e.tagName!=="OPTION"&&r!=="checkbox"&&r!=="radio"&&(t.value=e.value),"checked"in e&&"checked"in t&&(t.checked=e.checked),"selected"in e&&"selected"in t&&(t.selected=e.selected),e.tagName==="SELECT")for(let n=0;n<e.options.length;n++)t.options[n].selected=e.options[n].selected;"indeterminate"in e&&"indeterminate"in t&&(t.indeterminate=e.indeterminate)}function $o(e,t,r,n){if(n)return!!e.closest?.(t);let i=e;for(;i?.nodeType===1;){if(i.matches(t))return!0;if(i===r)break;i=i.parentElement}return!1}function Po(e,t,r,n,i,o,a,s){if(e.nodeType===1&&((a?Do(e,r):$o(e,n,o,!1))||i&&$o(e,i,o,a)))return null;let l=t.importNode(e,!1);s.cloneToLive.set(l,e),s.liveToClone.set(e,l);let u=e.nodeType===1&&e.tagName==="TEMPLATE"?e.content:e,m=l.nodeType===1&&l.tagName==="TEMPLATE"?l.content:l;u!==e&&(s.cloneToLive.set(m,u),s.liveToClone.set(u,m));for(let y of u.childNodes||[]){let c=Po(y,t,r,n,i,o,a,s);c&&(m.appendChild(c),y.nodeType===1&&qo(y,c))}return e.nodeType===1&&qo(e,l),l}function _n(e,{capability:t="data",exclude:r=null,inherit:n=!0}={}){if(!e)throw new TypeError("createContentView requires a DOM context");let i=e.nodeType===9?e:e.ownerDocument;if(!i?.implementation?.createHTMLDocument)throw new TypeError("createContentView requires an HTML DOM implementation");let o=i.implementation.createHTMLDocument(""),a=new WeakMap,s=new WeakMap,l=e.nodeType===9?e.documentElement:e;r&&o.documentElement.matches(r);let u=Ft(t),m=Po(l,o,t,u,r,l,n,{cloneToLive:a,liveToClone:s});e.nodeType===9&&m&&(o.replaceChild(m,o.documentElement),s.set(e,o),a.set(o,e));let y=c=>{if(uc.test(c))throw new Error(`Filtered content queries do not support stateful selector: ${c}`)};return{root:m,document:o,capability:t,selector:Ft(t),cloneToLive:a,liveToClone:s,original(c){return a.get(c)||null},cloneOf(c){return s.get(c)||null},query(c,h=m){return y(c),Array.from(h.querySelectorAll(c),f=>a.get(f)||f)},text(c=m){return(c===m?m:s.get(c))?.textContent||""},html(c=m){return(c===m?m:s.get(c))?.innerHTML??""},clone(c=m){let h=c===m?m:s.get(c);return h?o.importNode(h,!0):null}}}var dc=[16,8,0],de=8,hc=4;function Bo({anchor:e,bar:t,rail:r=t,viewport:n,current:i=null}){let o=c=>i===c?hc:0;if(e.bottom<=0||e.top>=n.height||e.right<=0||e.left>=n.width)return{mode:"hidden",x:0,y:0};let a=c=>Math.max(de,Math.min(e.left,n.width-c-de)),s=e.top-16-t.height;if(s>=de-o("above"))return{mode:"above",x:a(t.width),y:s};let l=e.bottom+16;if(l+t.height<=n.height-de+o("below"))return{mode:"below",x:a(t.width),y:l};let u=n.width-e.right-de,m=e.left-de,y=u>=m?[["rail-right",u],["rail-left",m]]:[["rail-left",m],["rail-right",u]];for(let[c,h]of y)for(let f of dc){if(r.width+f>h+o(c))continue;let b=c==="rail-right"?Math.min(e.right+f,n.width-r.width-de):Math.max(e.left-f-r.width,de),k=Math.min(e.bottom,n.height-de)-r.height,A=Math.max(de,Math.min(Math.max(e.top,de),k));return{mode:c,x:b,y:A,gap:f}}return{mode:"pinned",x:a(t.width),y:de}}function Tn({anchor:e,handle:t,viewport:r,inset:n=6,prefer:i="auto"}){let o=e.height>=t.height*1.5&&e.width>=t.width*2;if(i==="corner"||o){let c=Math.max(de,Math.min(e.right-t.width+n,r.width-t.width-de)),h=Math.max(de,Math.min(e.top-n,r.height-t.height-de));return{x:c,y:h,mode:"over"}}let a=4,s=e.right+a+t.width<=r.width-de,l=s?e.right+a:e.left-a-t.width,u=Math.max(de,l),m=e.top+e.height/2-t.height/2,y=Math.max(de,Math.min(m,r.height-t.height-de));return{x:u,y,mode:s?"beside-right":"beside-left"}}var Ar=!1;function zo(){if(Ar)return;let e=ue("onPrepareForSave");typeof e=="function"&&(e(t=>{Uo(t),Ho(t)}),Ar=!0)}function Ho(e){let t=e&&e.querySelector&&e.querySelector("body");t&&t.classList.remove("hcms-open","hcms-overlay","hcms-side-left",br)}function Uo(e){if(!(!e||typeof e.querySelectorAll!="function"))for(let t of e.querySelectorAll(`[${Re}]`)){let r=co(t);r!==null&&(t.innerHTML=r),t.removeAttribute(Re)}}var Sr=!1;function Er(){if(Sr)return;let e=ue("onSnapshot");typeof e=="function"&&(e(t=>{Uo(t),ho(t,typeof window<"u"?window:null),Ho(t)}),Sr=!0)}function Vo(){zo(),Er(),(!Ar||!Sr)&&mc()}var wr=null;function mc(){if(wr||typeof document>"u")return;wr=it(document,so,()=>{zo(),Er(),Ar&&Sr&&(wr?.(),wr=null)})}var fc={edit:"M8 10h2v6H8zm2 4h4v2h-4zm0-6h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm-2 2h2v2h-2zm-2 2h2v2h-2zm-4 0h2v2h-2z","move-up":"M11 4h2v2h2v2h2v2h2v2h-4v-2h-2v10h-2V10H9v2H5v-2h2V8h2V6h2z","move-down":"M11 4h2v10h2v-2h4v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2h4v2h2z",remove:"M5 5h3v3h3v3h2V8h3V5h3v3h-3v3h-3v2h3v3h3v3h-3v-3h-3v-3h-2v3H8v3H5v-3h3v-3h3v-2H8V8H5z",add:"M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"};function Ue(e){let t=e==="edit"?"6 0 18 18":"0 0 24 24",r=e==="settings"?'<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>':`<path d="${fc[e]}"/>`;return`<svg class="hcms-inline-icon" xmlns="http://www.w3.org/2000/svg" viewBox="${t}" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">${r}</svg>`}var Wo="data-hcms-ghost",pc=Ft("history");function gc(e){let t=e.container,r=null;for(;t&&(t.namespaceURI!=="http://www.w3.org/1999/xhtml"||["SELECT","OPTGROUP","DATALIST"].includes(t.tagName));)r=t,t=t.parentElement;return{parent:t,anchor:r}}function Ko({doc:e,themeRoot:t,onAdd:r,onResize:n}){let i=e.defaultView,o=[],a=!1,s=null,l=new Map;function u(h,f,b){h.style[f]!==b&&(h.style[f]=b)}function m(){let h=new Set(o.map(f=>f.node.parentElement));for(let[f,b]of l)h.has(f)&&i?.Sortable?.get(f)===b.instance||(b.instance.option("draggable")===b.selector&&b.instance.option("draggable",b.original),l.delete(f));for(let f of h){let b=i?.Sortable?.get(f);if(!b)continue;let k=b.option("draggable");if(l.get(f)?.selector===k)continue;let A=k,L=`${A.trim().startsWith(">")?"> ":""}:is(${A.trim().replace(/^>\s*/,"")}):not(${pc})`;b.option("draggable",L),l.set(f,{instance:b,original:A,selector:L})}}function y(){for(let h of o){let{node:f,slot:b,list:k}=h,A=k.items.filter(E=>E.isConnected).map(E=>E.getBoundingClientRect()).filter(E=>E.width>0&&E.height>0);A.length&&(h.width=A.reduce((E,L)=>E+L.width,0)/A.length,h.height=A.reduce((E,L)=>E+L.height,0)/A.length),u(f,"width",h.width?`${Math.round(h.width)}px`:"100%"),u(b,"height",`${Math.max(48,Math.round(h.height||64))}px`),b!==f&&(b.colSpan=Math.max(1,...k.items.map(E=>[...E.children].reduce((L,D)=>L+(D.colSpan||1),0)))),f.hidden!==a&&(f.hidden=a)}m()}function c(h,f){let b=f.tagName,k=["TBODY","THEAD","TFOOT","TABLE"].includes(b),A=e.createElement(k?"tr":["UL","OL","MENU"].includes(b)?"li":"div");for(let O of[Wo,"data-hcms-shell","editor-ui","no-watch","no-save","save-remove","snapshot-remove"])A.setAttribute(O,"");A.setAttribute("draggable","false"),A.setAttribute("contenteditable","false"),A.className="hcms-shell pixel-quiet hcms-inline-ghost";for(let O of["light","dark"])A.classList.toggle(O,!!t?.classList.contains(O));let E=k?e.createElement("td"):A;E!==A&&(E.className="hcms-inline-ghost-cell",A.appendChild(E));let L=e.createElement("button");L.type="button",L.className="hcms-inline-list-button hcms-inline-list-add mirk-button mirk-button--small",L.setAttribute("data-hcms-list-action","add"),L.innerHTML=`<span class="mirk-button__label">${Ue("add")}<span>Add</span></span>`,E.appendChild(L);let D={node:A,slot:E,button:L,list:h,width:0,height:0};L.addEventListener("click",O=>{O.preventDefault(),O.stopPropagation(),r(D.list)});for(let O of["pointerdown","mousedown","touchstart","click"])A.addEventListener(O,W=>W.stopPropagation());return A.addEventListener("dragstart",O=>{O.preventDefault(),O.stopPropagation()}),D}return{setLists(h){let f=new Set(o),b=[],k=new Set(o.map(E=>E.node)),A=new Set;for(let E of h||[]){if(!E.container||!E.container.isConnected)continue;let{parent:L,anchor:D}=gc(E);if(!L)continue;if(!A.has(L)){for(let U of L.querySelectorAll(`:scope > [${Wo}]`))k.has(U)||U.remove();A.add(L)}let O=o.find(U=>f.has(U)&&U.list.container===E.container&&U.list.path.join(".")===E.path.join("."))||c(E,L);f.delete(O),O.list=E,O.button.setAttribute("data-hcms-list",E.path.join(".")),O.button.setAttribute("aria-label",`Add to ${E.path.join(".")||"the list"}`);let W=D||E.items.filter(U=>U.parentElement===L).at(-1);W?W.nextSibling!==O.node&&W.after(O.node):O.node.parentElement!==L&&L.appendChild(O.node),b.push(O)}for(let E of f)E.node.remove();o=b,s?.disconnect(),!s&&typeof i?.ResizeObserver=="function"&&(s=new i.ResizeObserver(()=>{y(),n?.()}));for(let E of o)for(let L of E.list.items)s?.observe(L);y()},update:y,setHidden(h){a=!!h,y()},destroy(){s?.disconnect();for(let h of o)h.node.remove();o=[],m()}}}var Go=[["move-up","Move up"],["move-down","Move down"]],bc={prefer:"corner",inset:0};function yc(e,t){return t.width<=e.width&&t.height<=e.height}function Yo({doc:e,layerEl:t,onActivate:r,onListAction:n}){let i=e.defaultView,o=[],a=new Map,s=0,l=new Map,u=null,m=new Set,y=0,c=!1,h=null,f=null,b=null,k=null,A=new Map,E=!1,L=null,D=Ko({doc:e,themeRoot:t.closest("[data-hcms-shell]"),onResize:W,onAdd:d=>n?.({action:"add",list:d,index:d.items.length})}),O=e.createElement("div");O.className="hcms-inline-highlight",O.hidden=!0,O.setAttribute("aria-hidden","true"),t.appendChild(O);function W(){if(!(y||!i)){if(typeof i.requestAnimationFrame!="function")return ie();y=i.requestAnimationFrame(()=>{y=0,ie()})}}let U=()=>b||k;function ie(){if(!i)return;D.update();let d={width:i.innerWidth,height:i.innerHeight},g=U();for(let p of o){if(!p.visible){p.node.hidden=!0;continue}for(let V of p.members)V.node.hidden=E&&V.kind!=="handle";p.node.hidden=!1;let S=p.el.getBoundingClientRect(),w=p.node.getBoundingClientRect(),R=w.width,B=p.kind==="row"&&!yc(S,w);if(B&&p.el!==g){for(let V of p.members)V.kind==="row"&&(V.node.hidden=!0);w=p.node.getBoundingClientRect()}if(p.members.every(V=>V.node.hidden)){p.node.hidden=!0;continue}let M=p.kind==="handle"?null:bc,{x:z,y:$}=Tn({anchor:S,handle:w,viewport:d,...M}),H=p.members.find(V=>V.kind==="handle");if(B&&H){let V=H.node.getBoundingClientRect(),se=Tn({anchor:S,handle:V,viewport:d}),he=p.members.slice(p.members.indexOf(H)+1).filter(Z=>!Z.node.hidden).reduce((Z,G)=>Z+G.node.getBoundingClientRect().width+2,0);z=Math.max(8+R,Math.min(d.width-8,se.x+V.width+he))-w.width,$=se.y}p.node.style.transform=`translate(${Math.round(z)}px, ${Math.round($)}px)`}if(L)if(!L.node.isConnected||L.node.closest("[hidden]"))ge();else{let p=L.button.getBoundingClientRect(),S=L.menu.getBoundingClientRect();L.menu.style.left=`${Math.max(8,p.right-S.width)-p.left}px`,L.menu.style.right="auto",L.menu.style.top=p.bottom+6+S.height>d.height-8?"auto":"calc(100% + 6px)",L.menu.style.bottom=p.bottom+6+S.height>d.height-8?"calc(100% + 6px)":"auto"}te(),h?.()}function ee(d){if(d?.closest?.("[data-hcms-ghost]"))return null;for(let g=d;g&&g.nodeType===1;g=g.parentElement){let p=A.get(g);if(p)return p}return null}function me(d){L&&!L.node.contains(d.target)&&ge();let g=U();k=ee(d.target),k&&t.contains(d.target)&&(b=null),U()!==g&&W()}function q(d){if(d.relatedTarget||!k)return;let g=U();k=null,U()!==g&&W()}function te(){if(!f||O.hidden)return;let d=f.getBoundingClientRect();O.style.width=`${Math.round(d.width)}px`,O.style.height=`${Math.round(d.height)}px`,O.style.transform=`translate(${Math.round(d.left)}px, ${Math.round(d.top)}px)`}function xe(){if(!i||typeof i.IntersectionObserver!="function"){for(let g of o)g.visible=!0;return}u||(u=new i.IntersectionObserver(g=>{let p=!1;for(let S of g)for(let w of a.get(S.target)||[])w.visible!==S.isIntersecting&&(w.visible=S.isIntersecting,p=!0);p&&W()},{threshold:0}));let d=new Set(a.keys());for(let g of m)d.has(g)||u.unobserve(g);for(let g of d)m.has(g)||u.observe(g);m=d}function Nr(){c||!i||(i.addEventListener("scroll",W,{passive:!0,capture:!0}),i.addEventListener("resize",W,{passive:!0}),e.addEventListener("focusin",me),e.addEventListener("focusout",q),e.addEventListener("pointerdown",v,!0),e.addEventListener("keydown",I,!0),c=!0)}function Lr(){!c||!i||(i.removeEventListener("scroll",W,{capture:!0}),i.removeEventListener("resize",W),e.removeEventListener("focusin",me),e.removeEventListener("focusout",q),e.removeEventListener("pointerdown",v,!0),e.removeEventListener("keydown",I,!0),c=!1)}function Bt(d){return`${d.kind}\0${d.attr||""}`}function mt(d,g){return d.container===g.container&&d.scalar===g.scalar}function zt(d,g){return d.kind!==g.kind?!1:d.kind==="handle"?Bt(d.target)===Bt(g.target):d.kind==="row"?d.row===g.row&&mt(d.list,g.list):mt(d.list,g.list)}function ft(d,g){d.target=g;let p=g.path.join(".");d.node.setAttribute("data-hcms-target",p),g.icon?d.node.setAttribute("data-hcms-icon",g.icon):d.node.removeAttribute("data-hcms-icon"),d.node.setAttribute("aria-label",`Edit ${p}`)}function Fe(d){let g=e.createElement("button");g.type="button",g.className="hcms-inline-handle mirk-button mirk-button--small",g.innerHTML=`<span class="mirk-button__label">${Ue("edit")}</span>`;let p={node:g,kind:"handle",target:d};return ft(p,d),g.addEventListener("click",S=>{S.preventDefault(),S.stopPropagation(),r?.(p.target,g)}),p}function pt(d,g){let p=e.createElement("button");return p.type="button",p.className="hcms-inline-list-button mirk-button mirk-button--small",p.setAttribute("data-hcms-list-action",d),p.setAttribute("aria-label",g),p.innerHTML=`<span class="mirk-button__label">${Ue(d)}${d==="add"?"<span>Add</span>":""}</span>`,p}function we(d,{list:g,row:p,rowIndex:S,count:w}){let R=g.path.join(".");d.list=g,d.row=p,d.index=S,d.count=w,d.node.setAttribute("data-hcms-list",R),d.node.setAttribute("data-hcms-row",String(S));for(let B of d.node.querySelectorAll("[data-hcms-list-action]")){let M=B.getAttribute("data-hcms-list-action"),z=Go.find(([$])=>$===M)?.[1]||M;B.setAttribute("aria-label",`${z} ${R}.${S}`),B.disabled=M==="move-up"&&S===0||M==="move-down"&&S===w-1}}function Ir(d,g,p,S){let w=e.createElement("div");w.className="hcms-inline-row-controls";let R={node:w,kind:"row",list:d,row:g,index:p,count:S};for(let[B,M]of Go){let z=pt(B,M);z.addEventListener("click",$=>{$.preventDefault(),$.stopPropagation(),!z.disabled&&n?.({action:B,list:R.list,index:R.index,row:R.row})}),w.appendChild(z)}return we(R,{list:d,row:g,rowIndex:p,count:S}),R}function ge(d=!1){if(!L)return;let g=L;L=null,g.menu.hidden=!0,g.button.setAttribute("aria-expanded","false"),g.node.parentElement?.classList.remove("has-open-settings"),d&&g.button.isConnected&&g.button.focus({preventScroll:!0})}function v(d){L&&!L.node.contains(d.target)&&ge()}function I(d){L&&(d.key==="Escape"?(d.preventDefault(),d.stopPropagation(),ge(!0)):d.key==="Tab"?ge(!0):["ArrowDown","ArrowUp","Home","End"].includes(d.key)&&L.menu.contains(d.target)&&(d.preventDefault(),L.menu.querySelector('[role="menuitem"]').focus({preventScroll:!0})))}function N(d,{list:g,row:p,rowIndex:S}){Object.assign(d,{list:g,row:p,index:S}),d.node.setAttribute("data-hcms-list",g.path.join(".")),d.node.setAttribute("data-hcms-row",String(S)),d.button.setAttribute("aria-label",`Settings ${g.path.join(".")}.${S}`)}function F(d){let g=e.createElement("div");g.className="hcms-inline-settings";let p=pt("settings","Settings");p.setAttribute("aria-haspopup","menu"),p.setAttribute("aria-expanded","false");let S=e.createElement("div");S.className="hcms-inline-settings-menu",S.setAttribute("role","menu"),S.setAttribute("aria-label","Item settings"),S.hidden=!0;let w=e.createElement("button");w.type="button",w.setAttribute("role","menuitem"),w.setAttribute("data-hcms-list-action","remove"),w.textContent="Delete",S.appendChild(w),g.append(p,S);let R={node:g,button:p,menu:S,kind:"settings"};N(R,d);let B=()=>{ge(),L=R,S.hidden=!1,p.setAttribute("aria-expanded","true"),g.parentElement.classList.add("has-open-settings"),w.focus({preventScroll:!0}),W()};return p.addEventListener("click",M=>{M.preventDefault(),M.stopPropagation(),L===R?ge(!0):B()}),p.addEventListener("keydown",M=>{(M.key==="ArrowDown"||M.key==="ArrowUp")&&(M.preventDefault(),B())}),w.addEventListener("click",M=>{M.preventDefault(),M.stopPropagation(),ge(!0),n?.({action:"remove",list:R.list,index:R.index,row:R.row})}),R}function j(d,g){d.kind==="handle"?ft(d,g.target):d.kind==="row"?we(d,g):d.kind==="settings"&&N(d,g)}function P(d,g,p,S,w){let R=g.get(p)?.find(B=>B.category===w);if(!R){R={el:p,category:w,members:[]},d.push(R);let B=g.get(p);B?B.push(R):g.set(p,[R])}R.members.push(S)}function _(d,g,p){let S=p.items||[];S.forEach((w,R)=>{jt(w)&&(P(d,g,w,{kind:"row",list:p,row:w,rowIndex:R,count:S.length},"item"),P(d,g,w,{kind:"settings",list:p,row:w,rowIndex:R},"item"))})}function T(d,g){let p=new Set(d.members),S=[];for(let w of g){let R=d.members.find(B=>p.has(B)&&zt(B,w))||(w.kind==="handle"?Fe(w.target):w.kind==="row"?Ir(w.list,w.row,w.rowIndex,w.count):F(w));p.delete(R),j(R,w),E&&R.kind!=="handle"&&(R.node.hidden=!0),S.push(R)}for(let w of p)w===L&&ge(),w.node.remove();S.sort((w,R)=>["row","handle","settings"].indexOf(w.kind)-["row","handle","settings"].indexOf(R.kind)),S.forEach((w,R)=>{d.node.children[R]!==w.node&&d.node.insertBefore(w.node,d.node.children[R]||null)}),d.members=S}function C(d,g){let p=[],S=new Map,w=new Map,R=0;for(let $ of d||[])w.has($.el)||w.set($.el,$),!($.kind!=="handle"||!jt($.el))&&(P(p,S,$.el,{kind:"handle",target:$},"item"),R++);for(let $ of g||[])_(p,S,$);let B=new Set(o),M=new Map;for(let $ of o)M.has($.el)||M.set($.el,$.visible);let z=[];for(let $ of p){let H=o.find(V=>B.has(V)&&V.el===$.el&&V.category===$.category);if(!H){let V=e.createElement("div");V.className="hcms-inline-item-controls",V.setAttribute("role","group"),H={el:$.el,node:V,category:$.category,kind:$.category==="add"?"add":"handle",members:[],visible:M.get($.el)??!1},t.appendChild(V)}B.delete(H),H.el=$.el,H.category=$.category,T(H,$.members),H.kind=H.members.some(V=>V.kind==="row")?"row":H.members.some(V=>V.kind==="handle")?"handle":"add",H.node.setAttribute("aria-label",H.category==="add"?"List controls":"Item controls"),z.push(H)}for(let $ of B)$.node.remove();o=z,a=new Map,A=new Map;for(let $ of o){let H=a.get($.el);H?H.push($):a.set($.el,[$]);for(let V of $.members)V.kind!=="row"&&V.kind!=="settings"||(A.set(V.row,V.row),A.set(V.node,V.row),A.set($.node,V.row))}b&&!A.has(b)&&(b=null),k&&!A.has(k)&&(k=null),l=w,s=R}function x(){ge(),u?.disconnect(),u=null,m=new Set;for(let d of o)d.node.remove();o=[],a=new Map,l=new Map,A=new Map,s=0}return{setTargets(d,g){C(d,g),D.setLists(g),xe(),Nr(),W()},refresh:W,get count(){return s},get controlsHidden(){return E},setControlsHidden(d){if(E=!!d,D.setHidden(E),E){ge();for(let g of o){for(let p of g.members)p.kind!=="handle"&&(p.node.hidden=!0);g.members.every(p=>p.node.hidden)&&(g.node.hidden=!0)}}W()},elementToTarget(d){if(d?.closest?.("[data-hcms-ghost]"))return null;for(let g=d;g&&g.nodeType===1;g=g.parentElement){let p=l.get(g);if(p)return p}return null},setHoveredRow(d){let g=U();b=d?ee(d):null,U()!==g&&W()},showHighlight(d){d&&(f=d,O.hidden=!1,te())},hideHighlight(){f=null,O.hidden=!0},setFollower(d){h=typeof d=="function"?d:null},destroy(){D.destroy(),y&&i&&i.cancelAnimationFrame(y),y=0,h=null,f=null,b=null,k=null,O.remove(),Lr(),x()}}}var kc="hypercms-inline",$t="is-hcms-inline-active",Cn="is-hcms-inline-onpath",Jo='input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',vc=["bold","italic","link","undo","redo"],xc=/^H[1-6]$/,wc=0;function Qo({doc:e,pageRoot:t,opts:r={}}){let n=r.richText!==!1,i=null,o=null,a=null,s=new Map,l=null,u=null,m=null;function y(c,h,f,b,k){let A=ot(e.defaultView);if(typeof A!="function")return null;let E=k||{},L=E.originalHTML??_n(h,{capability:"history"}).html(),D=E.richClayIsOurs??!h.hasAttribute("data-richclay"),O=E.adopted??h.getAttribute("data-richclay-active")==="true",W=Dt(h,b,"history"),U=Ac(c,A,h,b,D);if(!U)return null;uo(h,b==="innerHTML",D);let ie=String(++wc);h.setAttribute(Re,ie),Er();let ee={el:h,editor:U,path:f,prop:b,boundId:ie,originalHTML:L,oldValue:W,richClayIsOurs:D,adopted:O,dirty:!1,written:!1,restorable(){return!this.adopted&&!this.dirty&&!this.written},lastEdited:void 0};s.set(h,ee),ao(ie,ee);let me=U.squire;if(me&&typeof me.addEventListener=="function"){let te=()=>{ee.dirty=!0,ee.lastEdited=Dt(h,ee.prop,"history"),Sc(c,ee)};me.addEventListener("input",te),ee.detachInput=()=>me.removeEventListener?.("input",te)}let q=()=>es(ee);return h.addEventListener("blur",q),ee.detachBlur=()=>h.removeEventListener("blur",q),ee}return{name:"inline",richText:n,ctx:null,root:null,formRoot:null,errorEl:null,noticeEl:null,handoffEl:null,handoffCountEl:null,popEl:null,enhanceFormRichText:!1,prepareRules(c){return n?po(c,t):c},bindText(c,h,f,b){return y(this.ctx,c,h,f,b)},mount(c){let h=this.ctx;i=Oc(e,r.theme),this.root=i.root,this.formRoot=i.formRoot,this.errorEl=i.errorEl,this.noticeEl=i.noticeEl,this.handoffEl=i.handoffEl,this.handoffCountEl=i.handoffCountEl,this.popEl=i.popEl,_e(()=>It(e));let f=tt({pageRules:h.pageRules,formRules:h.formRules,data:c,doc:e});i.formRoot.appendChild(f),h.seeder.seed(i.formRoot),Me(i.formRoot,e,this.enhanceFormRichText),ht(h),hr(h),o=Yo({doc:e,layerEl:i.layerEl,onActivate:(b,k)=>this.activate(b,k),onListAction:b=>this.listAction(b)}),o.setFollower(()=>this.placePopover()),i.closeEl.addEventListener("click",()=>this.deactivate()),i.toggleEl.addEventListener("click",b=>{b.preventDefault(),b.stopPropagation(),this.toggleControls()}),i.handoffEl.querySelector("[data-hcms-open-view]").addEventListener("click",b=>{b.preventDefault(),b.stopPropagation(),h.onViewRequested?.("sidebar")}),this.bindPage(),this.syncTargets()},listAction({action:c,list:h,index:f,row:b}){let k=this.ctx,A=h.path.join("."),E=k.formRoot.querySelector(`[data-hcms-path="${ct(A)}"]`);if(!E)return;if(c==="add"){Nt(A,k);return}let L=b?Mc(k,A,b):f;if(L===-1)return;let D=Rc(E,L);if(D){if(c==="remove"){fn(D,k),this.syncTargets();return}mn(D,c==="move-up"?-1:1,k),this.syncTargets()}},toggleControls(){if(!o||!i)return;let c=!o.controlsHidden;o.setControlsHidden(c),i.toggleEl.setAttribute("aria-pressed",String(c));let h=i.toggleEl.querySelector(".mirk-button__label");h&&(h.textContent=c?"Show controls":"Hide controls")},bindPage(){let c=this.ctx.pageRoot,h=i.root,f=D=>{let O=o&&o.elementToTarget(D.target);O?o.showHighlight(O.el):o?.hideHighlight(),o?.setHoveredRow(D.target)},b=()=>{o?.hideHighlight(),o?.setHoveredRow(null)},k=D=>{if(h.contains(D.target))return;let O=o&&o.elementToTarget(D.target);!O||O.kind!=="text"||s.has(O.el)||y(this.ctx,O.el,O.path.join("."),Tr(O))},A=D=>{if(h.contains(D.target))return;let O=o&&o.elementToTarget(D.target);if(!O){this.deactivate();return}(typeof D.target.closest=="function"&&D.target.closest("a[href]")||O.kind!=="text")&&D.preventDefault(),this.activate(O)},E=D=>{D.key==="Escape"&&this.deactivate()},L=D=>{let O=D.detail;if(!(!O||O.pageRoot!==this.ctx.pageRoot||!O.path))for(let W of s.values())W.path===O.path&&(W.written=!0)};c.addEventListener("pointerover",f),c.addEventListener("pointerleave",b),c.addEventListener("pointerdown",k),c.addEventListener("click",A),h.addEventListener("keydown",E),e.addEventListener("hcms:change",L),a=()=>{c.removeEventListener("pointerover",f),c.removeEventListener("pointerleave",b),c.removeEventListener("pointerdown",k),c.removeEventListener("click",A),h.removeEventListener("keydown",E),e.removeEventListener("hcms:change",L)}},activate(c,h){if(!c||!i||c.kind==="text"&&this.activateText(c))return;let f=Xo(this,i,c.path.join("."));if(!f){this.deactivate();return}l=c,u=h||null,m=null,i.popEl.hidden=!1,i.formRoot.querySelectorAll(`.${$t}`).forEach(Zo),this.placePopover(),Cc(f)},activateText(c){let h=c.el,f=s.get(h);if(f)return _r(f),!0;let b=y(this.ctx,h,c.path.join("."),Tr(c));return b?(_r(b),!0):!1},placePopover(){if(!i||!l||i.popEl.hidden)return;let c=e.defaultView;if(!c)return;let h={width:c.innerWidth,height:c.innerHeight},f=l.el.getBoundingClientRect(),b=i.popEl.getBoundingClientRect(),{mode:k,x:A,y:E}=Bo({anchor:f,bar:b,viewport:h,current:m});m=k,i.popEl.style.transform=`translate(${Math.round(A)}px, ${Math.round(E)}px)`},deactivate(){if(!i||!l&&i.popEl.hidden)return;i.popEl.hidden=!0,rs(i.root);let c=u;if(l=null,u=null,m=null,c&&e.contains(c)&&typeof c.focus=="function")try{c.focus({preventScroll:!0})}catch{c.focus()}},syncTargets(){if(!o)return;let c=this.ctx,{targets:h,lists:f}=Sn(c.pageRoot,c.pageRules);o.setTargets(h,f);let b=Ec(this,s,h,e);if(l){let A=b.get(l.el)||[],E=A.find(L=>_c(L,l))||A.find(L=>L.path.join(".")===l.path.join("."))||(A.length===1?A[0]:null);E?l=E:this.deactivate()}Tc(this.ctx,s,e);let k=h.reduce((A,E)=>A+(jt(E.el)?0:1),0);this.handoffEl&&(this.handoffCountEl.textContent=k===0?"":`${k} ${k===1?"field isn't":"fields aren't"} visible right now.`,this.handoffEl.hidden=k===0)},refresh(c,h){c==="livesync"?(Ie(e),It(e),je(this.ctx,{ignoreActiveValue:!0})):c==="undo"?je(this.ctx,{ignoreActiveValue:!1}):je(this.ctx),this.syncTargets(),(c==="livesync"||c==="undo")&&this.rebindText(c),this.restoreActive()},rebindText(c){let h=c!=="undo";for(let[f,b]of[...s]){if(!e.contains(f)){qt(this.ctx,b,{restore:!1,record:h}),s.delete(f);continue}if(f.hasAttribute(ve)){let E=Dt(f,b.prop);E!==b.lastEdited&&(b.oldValue=E,b.lastEdited=void 0);continue}let k=e.activeElement===f;qt(this.ctx,b,{restore:!1,record:h}),s.delete(f);let A=y(this.ctx,f,b.path,b.prop,{richClayIsOurs:b.richClayIsOurs,adopted:b.adopted});A&&k&&_r(A)}},restoreActive(){if(!i||!l||i.popEl.hidden)return;if(!e.contains(l.el)){this.deactivate();return}if(!Xo(this,i,l.path.join("."))){this.deactivate();return}i.formRoot.querySelectorAll(`.${$t}`).forEach(Zo),this.placePopover()},focusOnOpen(){if(this.root&&typeof this.root.focus=="function")try{this.root.focus({preventScroll:!0})}catch{this.root.focus()}},destroy(){u=null,this.deactivate();for(let c of s.values())qt(this.ctx,c);s.clear(),a?.(),a=null,o?.destroy(),o=null,i?.destroy(),i=null,kn(e),this.popEl=null,this.handoffEl=null,this.handoffCountEl=null}}}function Ac(e,t,r,n,i){return _e(()=>{let o=null;try{o=new t(r,{inline:!0,hyperclay:!1,toolbar:n==="innerHTML"?vc:!1,...xc.test(r.tagName)?{singleLine:!0}:null})}catch(a){return console.warn("[hypercms] richclay activation failed; the field falls back to the popover",a),null}if(o.unsupported||!o.active){if(i)try{o.destroy()}catch{}return null}return typeof o.reattach=="function"&&o.reattach(),o})}function Sc(e,{path:t,el:r,prop:n}){let i=mr(e.formRoot,t);i&&(fr(i,Dt(r,n),e.formRoot,t),be(pe(e),{path:t,structural:!1},e))}function Dt(e,t,r="data"){let n=_n(e,{capability:r});return t==="innerHTML"?n.html():n.text().trim()}function es(e){let{el:t,prop:r,oldValue:n,lastEdited:i}=e,o=i;if(o===void 0||o===n)return;e.oldValue=o;let a=ue("undo");if(!a||typeof a.recordValue!="function")return;let s={prop:r,oldValue:n,newValue:o,read:l=>Dt(l,r,"history"),write:(l,u)=>ts(l,r,u)};a.isPaused?queueMicrotask(()=>{t.isConnected&&a.recordValue(t,s)}):a.recordValue(t,s)}function ts(e,t,r){let n=e.cloneNode(!1);t==="innerHTML"?n.innerHTML=r:n.textContent=r,kt(e,Array.from(n.childNodes),{morphStyle:"innerHTML",policy:"history",restoreFocus:!1,scripts:{handle:!1,merge:!1}})}function qt(e,t,{restore:r=!0,record:n=!0}={}){n&&es(t),t.detachInput?.(),t.detachBlur?.(),_e(()=>{if(!t.adopted){try{t.editor.destroy()}catch(i){console.warn("[hypercms] richclay teardown failed; editor state may reach the save",i)}t.richClayIsOurs&&t.el.removeAttribute("data-richclay")}t.el.removeAttribute(ve),t.el.removeAttribute(ze),t.el.removeAttribute(Re),lo(t.boundId),r&&t.restorable()&&ts(t.el,"innerHTML",t.originalHTML)})}function _r(e){let{editor:t,el:r}=e;if(r.ownerDocument.activeElement!==r)try{typeof t.focus=="function"?t.focus():r.focus()}catch{}}function Ec(e,t,r,n){let i=new Map;for(let o of r){let a=i.get(o.el);a?a.push(o):i.set(o.el,[o])}for(let[o,a]of[...t]){let s=i.get(o)||[],l=s.find(c=>Tr(c)===a.prop)||s[0];if(!l){qt(e.ctx,a,{restore:!0}),t.delete(o);continue}a.path=l.path.join(".");let u=Tr(l);if(u===a.prop)continue;let m=n.activeElement===o;qt(e.ctx,a,{restore:!1}),t.delete(o);let y=e.bindText(o,a.path,u,{richClayIsOurs:a.richClayIsOurs,adopted:a.adopted,originalHTML:a.originalHTML});y&&m&&_r(y)}return i}function _c(e,t){return e.el===t.el&&e.kind===t.kind&&e.attr===t.attr}function Tr(e){return e.attr==="innerHTML"?"innerHTML":"textContent"}function Tc(e,t,r){for(let n of e.pageRoot.querySelectorAll(`[${ve}]`))t.has(n)||_e(()=>mo(n,r.defaultView))}function Xo(e,t,r){let n=e.formRoot&&e.formRoot.querySelector(`[data-hcms-path="${ct(r)}"]`);if(rs(t.root),!n)return null;let i=n.closest("[data-hcms-card]"),o=i?[...i.querySelectorAll('[data-hcms-shape="scalar"][data-hcms-path]')].filter(a=>a.closest("[data-hcms-card]")===i&&a.closest('[data-hcms-shape="object-array"], [data-hcms-shape="scalar-array"]')===i.parentElement.closest('[data-hcms-shape="object-array"]')):[n];o.includes(n)||o.push(n);for(let a of o){a.classList.add($t),a.removeAttribute("draggable");for(let s=a.parentElement;s&&(s.classList.add(Cn),s.removeAttribute("draggable"),s!==e.formRoot);s=s.parentElement);}return n}function rs(e){if(e)for(let t of e.querySelectorAll(`.${$t}, .${Cn}`))t.classList.remove($t,Cn)}function Zo(e){e.tagName==="TEXTAREA"&&st(e),e.querySelectorAll?.("textarea").forEach(st)}function Cc(e){let t=e.matches?.(Jo)?e:e.querySelector?.(Jo);if(!(!t||typeof t.focus!="function"))try{t.focus({preventScroll:!0})}catch{t.focus()}}function Oc(e,t){Ie(e);let r=e.createElement(kc),n=t==="dark"?" dark":t==="light"?" light":"";return r.className="hcms-shell pixel-quiet hcms-inline"+n,r.setAttribute("data-hcms-shell",""),r.setAttribute("editor-ui",""),r.setAttribute("no-save",""),r.setAttribute("save-remove",""),r.setAttribute("snapshot-remove",""),r.setAttribute("no-watch",""),r.setAttribute("tabindex","-1"),r.innerHTML=`
    <div class="hcms-inline-bar">
      <div class="hcms-inline-handoff" hidden>
        <span class="hcms-inline-handoff-count"></span>
        <button type="button" class="hcms-inline-handoff-open mirk-button mirk-button--small" data-hcms-open-view="sidebar">
          <span class="mirk-button__label">Edit in the sidebar</span>
        </button>
      </div>
      <button type="button" class="hcms-inline-toggle mirk-button mirk-button--small" data-hcms-controls-toggle aria-pressed="false" hidden>
        <span class="mirk-button__label">Hide controls</span>
      </button>
      <div class="hcms-inline-notice" role="status" hidden></div>
      <div class="hcms-inline-error" role="alert" hidden></div>
    </div>
    <div class="hcms-inline-layer"></div>
    <div class="hcms-inline-pop" role="dialog" aria-label="Edit content" hidden>
      <div class="hcms-inline-pop-header">
        <span>Edit content</span>
        <button type="button" class="hcms-inline-pop-close mirk-button mirk-button--small" aria-label="Close field editor">
          <span class="mirk-button__label">${Ue("remove")}</span>
        </button>
      </div>
      <div data-hcms-form-root class="hcms-form"></div>
    </div>
  `,e.body.appendChild(r),{root:r,formRoot:r.querySelector("[data-hcms-form-root]"),noticeEl:r.querySelector(".hcms-inline-notice"),errorEl:r.querySelector(".hcms-inline-error"),handoffEl:r.querySelector(".hcms-inline-handoff"),handoffCountEl:r.querySelector(".hcms-inline-handoff-count"),layerEl:r.querySelector(".hcms-inline-layer"),popEl:r.querySelector(".hcms-inline-pop"),closeEl:r.querySelector(".hcms-inline-pop-close"),toggleEl:r.querySelector("[data-hcms-controls-toggle]"),destroy(){r.remove()}}}function Rc(e,t){let r=e.querySelector(".hcms-array-items");return r&&r.querySelectorAll(":scope > [data-hcms-card], :scope > [data-hcms-array-item]")[t]||null}function Mc(e,t,r){let{lists:n}=Sn(e.pageRoot,e.pageRules),i=n.find(o=>o.path.join(".")===t);return i?i.items.indexOf(r):-1}var Nc="[hypercms]";function ns(e,t){if(!e||!e.querySelectorAll||!t)return;let r=Lc(t);e.querySelectorAll("template[data-hcms-tpl]").forEach(i=>{let o=i.getAttribute("data-hcms-tpl");o&&(o.startsWith("@")||r.has(o)||console.warn(`${Nc} template "${o}" doesn't match any rule path; ignored`))})}function Lc(e){let t=new Set;return r([],e),t;function r(n,i){let o=n.join("."),a=n.map(l=>typeof l=="number"?"*":l).join(".");o&&t.add(o),a&&t.add(a);let s=Be(i);if(s==="object")for(let[l,u]of Object.entries(i))r([...n,l],u);else if(s==="object-array"||s==="scalar-array"){let l=[...n,"*"],u=l.map(m=>typeof m=="number"?"*":m).join(".");if(t.add(u),s==="object-array"){let m=i[1];if(m&&typeof m=="object"&&!Array.isArray(m))for(let[y,c]of Object.entries(m))r([...l,y],c)}}}}var os={skip:"[data-hcms-shell]",templateAttr:"cms-template"},J={isOpen:!1,ctx:null,opts:null};function ss({view:e,doc:t,pageRoot:r,opts:n={},onCloseRequested:i,onViewRequested:o}){let a=n.rules!==void 0?n.rules:"cms",s=fe.findRules(t,a);if(!s){let k=typeof a=="string"?`data-rules-name~="${a}"`:"the provided rules object";throw new Error(`hypercms: no rules found for ${k}`)}let l=e.prepareRules(s.rules),u=s.tagNode;Qt(t),ir(t,l),ns(t,l);let m=sr(l,t),y=vr(l),c=kr(r,l),h=Jt(),f=Le(fe.extract(r,l,{...os,...h.hooks}),l),b={doc:t,pageRoot:r,pageRules:l,writeRules:y,formRules:m,rulesTagNode:u,rulesSource:a,richText:e.richText,view:e,seeder:h,initialData:f,get formRoot(){return e.formRoot},get shellRoot(){return e.root},get errorEl(){return e.errorEl},get noticeEl(){return e.noticeEl},unresolved:c,lastTwinSignature:null,lastFingerprint:null,lastData:null,observerHandle:null,undoUnsub:null,livesyncUnsub:null,onChange:n.onChange,onError:n.onError,confirmRemove:n.confirmRemove,previouslyFocused:t.activeElement,dispatch(k,A){let E=t.defaultView&&t.defaultView.CustomEvent||(typeof CustomEvent<"u"?CustomEvent:null);if(!E)return;let L={...A||{},pageRoot:r,view:e.name},D=new E(k,{bubbles:!0,cancelable:k==="hcms:change",detail:L});(e.root&&e.root.isConnected!==!1?e.root:r).dispatchEvent(D)},onCloseRequested:i,onViewRequested:o};return b.updateFingerprint=()=>{b.lastFingerprint=Lt(pe(b))},e.ctx=b,b}function as(e){e.updateFingerprint(),e.observerHandle=Ro({onRefresh:n=>e.view.refresh("observer",n)});let t=ue("undo");if(t&&typeof t.on=="function"){let n=()=>{if(J.ctx!==e)return;is(e,"undo");let i=Le(fe.extract(e.pageRoot,e.pageRules,os),e.pageRules);Lt(i)!==Lt(e.lastData)&&(e.lastData=i,e.onChange?.(i,{path:"",structural:!1}))};t.on("undo",n),t.on("redo",n),e.undoUnsub=()=>{t.off("undo",n),t.off("redo",n)}}let r=()=>is(e,"livesync");e.livesyncUnsub=it(e.doc,oo,r),Rn.ctx=e,jc(e.doc)}function is(e,t){J.ctx===e&&e.view.refresh(t)}function Cr(e,{dispatch:t=!0,restoreFocus:r=!0,updateUrl:n=!0,reason:i="close"}={}){if(!e||e.closed)return;e.closed=!0;for(let a of e.uploads||[])try{a.abort()}catch{}e.uploads?.clear();let o=e.previouslyFocused;if(t&&e.dispatch("hcms:close",{reason:i}),n&&Fc(),e.observerHandle?.unsubscribe?.(),e.undoUnsub?.(),e.livesyncUnsub?.(),e.detachEvents?.(),_e(()=>e.view.destroy()),Ic(),r&&typeof o?.focus=="function")try{o.focus()}catch{}}function Ic(){J.isOpen=!1,J.ctx=null,J.opts=null,Rn.ctx=null}var Rn={ctx:null};function jc(e){let t=e.defaultView||(typeof globalThis<"u"?globalThis:null);if(!t)return;let r=function(){let i=Rn.ctx;if(i)return pr(i.formRoot),He("Reorder",()=>be(pe(i),{path:"",structural:!0},i))};typeof t.hypercmsCommit!="function"&&(t.hypercmsCommit=r),typeof globalThis<"u"&&typeof globalThis.hypercmsCommit!="function"&&(globalThis.hypercmsCommit=r)}var On="cms";function ls(e){let t=typeof e=="string"?e:"",r=t.indexOf("?"),n=r===-1?t:t.slice(r+1);if(!n)return t;let i=new URLSearchParams(n);return i.get(On)!=="true"?t:(i.set(On,"false"),"?"+i.toString())}function cs(e){let t=typeof e=="string"?e:"",r=t.indexOf("?"),n=r===-1?t:t.slice(r+1);return n?new URLSearchParams(n).get(On)==="true":!1}function Fc(){if(typeof window>"u"||!window.location||!window.history||typeof window.history.replaceState!="function")return;let e=window.location.search,t=ls(e);t!==e&&window.history.replaceState(window.history.state,"",t+window.location.hash)}var us="hcms-toggle",ne="data-hcms-toggle-host",ds="hcms-toggle-style",hs="data-hcms-toggle-style",Or="data-hcms-session",ks="data-hcms-split",vs="hcms.view",Rr=["sidebar","inline"],Dc={sidebar:"In the sidebar",inline:"On the page"},Ln="var(--hcms-toggle-bg, var(--hcms-toggle-_surface))";function ms(e){try{let t=e&&e.localStorage?e.localStorage.getItem(vs):null;return Rr.includes(t)?t:null}catch{return null}}function qc(e,t){if(Rr.includes(t))try{e?.localStorage?.setItem(vs,t)}catch{}}var $c="#fafafa",Pc="#0a0a0a",Bc=`
[${ne}] {
  all: unset;
  box-sizing: border-box;
  display: var(--hcms-toggle-display, inline-flex);
  font-family: 'Departure Mono', ui-monospace, Menlo, monospace;
  --hcms-toggle-_surface: ${$c};
}
[${ne}][data-hcms-surface="dark"] {
  --hcms-toggle-_surface: ${Pc};
}
[${ne}] .hcms-toggle__main,
[${ne}] .hcms-toggle__arrow {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  min-height: 40px;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  font-size: 14px;
  color: var(--hcms-toggle-color, currentColor);
  border: 2px solid;
  border-color: var(--mirk-bevel-tl, #F0E7D8) var(--mirk-bevel-br, #E2D4BF) var(--mirk-bevel-br, #E2D4BF) var(--mirk-bevel-tl, #F0E7D8);
  border-radius: 0;
  cursor: pointer;
  box-shadow: none;
}
[${ne}] .hcms-toggle__main:hover,
[${ne}] .hcms-toggle__arrow:hover {
  border-color: var(--mirk-focus-color, #C7AE93);
  box-shadow: none;
}
[${ne}] .hcms-toggle__main:active,
[${ne}] .hcms-toggle__arrow:active {
  border-color: var(--mirk-bevel-br, #E2D4BF) var(--mirk-bevel-tl, #F0E7D8) var(--mirk-bevel-tl, #F0E7D8) var(--mirk-bevel-br, #E2D4BF);
}
[${ne}] .hcms-toggle__main:focus-visible,
[${ne}] .hcms-toggle__arrow:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -5px;
}
[${ne}] .hcms-toggle__close { display: none; }
[${ne}][${Or}="open"] .hcms-toggle__open { display: none; }
[${ne}][${Or}="open"] .hcms-toggle__close { display: inline; }
[${ne}][${ks}] .hcms-toggle__main {
  border-radius: 0;
  padding-right: 12px;
}
[${ne}] .hcms-toggle__arrow {
  gap: 0;
  padding: 0 10px;
  border-radius: 0;
  border-left-width: 0;
}
[${ne}] .hcms-toggle__menu {
  all: unset;
  box-sizing: border-box;
  min-width: 180px;
  padding: 4px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--hcms-toggle-color, currentColor);
  background: ${Ln};
  border: 1px solid var(--mirk-input-border, #D8C8AF);
  border-radius: var(--mirk-radius, 5px);
  box-shadow: 0 14px 34px -14px rgba(0, 0, 0, .45);
}
[${ne}] .hcms-toggle__item {
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 9px 10px;
  border-radius: 0;
  cursor: pointer;
}
[${ne}] .hcms-toggle__item::before {
  content: "\u25CB";
  margin-right: 8px;
  opacity: .55;
}
[${ne}] .hcms-toggle__item[aria-checked="true"]::before {
  content: "\u25CF";
  opacity: 1;
}
[${ne}] .hcms-toggle__item:hover {
  background: color-mix(in srgb, currentColor 12%, transparent);
}
[${ne}] .hcms-toggle__item:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -3px;
}
@media (pointer: coarse) {
  [${ne}] .hcms-toggle__main,
  [${ne}] .hcms-toggle__arrow { min-height: 44px; }
}
`;function zc({search:e="",cookie:t="",forced:r=null}={}){let n=typeof e=="string"?e:"",i=n.indexOf("?"),o=i===-1?n:n.slice(i+1),a=new URLSearchParams(o).get("editmode");return a?a==="true":r!=null?!!r:/(?:^|;\s*)isAdminOfCurrentResource=[^;]/.test(t)}var Mn=new WeakMap;function xs(e,t){try{e.globalCompositeOperation="copy",e.fillStyle=t,e.fillRect(0,0,1,1);let r=e.getImageData(0,0,1,1).data;return{r:r[0],g:r[1],b:r[2],a:r[3]/255}}catch{return null}}function Hc(e){if(Mn.has(e))return Mn.get(e);let t=null;try{let r=e.createElement("canvas");if(r.width=r.height=1,t=r.getContext?r.getContext("2d",{willReadFrequently:!0}):null,t){let n=xs(t,"rgb(1, 2, 3)");(!n||n.r!==1||n.g!==2||n.b!==3||n.a!==1)&&(t=null)}}catch{t=null}return Mn.set(e,t),t}function Uc(e,t){let r=String(e??"").trim();if(!r)return null;let n=Vc(r);if(n)return n;let i=t&&t.defaultView;if(!i||!i.CSS||typeof i.CSS.supports!="function"||!i.CSS.supports("color",r))return null;let o=Hc(t);return o?xs(o,r):null}function Vc(e){let t=/rgba?\(([^)]+)\)/.exec(String(e??""));if(!t)return null;let r=t[1].split(/[\s,/]+/).filter(Boolean);if(r.length<3)return null;let n=r.slice(0,3).map(Number);if(n.some(Number.isNaN))return null;let i=r[3],o=i===void 0?1:i.endsWith("%")?Number(i.slice(0,-1))/100:Number(i);return{r:n[0],g:n[1],b:n[2],a:Number.isNaN(o)?1:o}}function fs({r:e,g:t,b:r}){let n=i=>{let o=i/255;return o<=.03928?o/12.92:((o+.055)/1.055)**2.4};return .2126*n(e)+.7152*n(t)+.0722*n(r)}function ps(e,t){let r=fs(e),n=fs(t);return(Math.max(r,n)+.05)/(Math.min(r,n)+.05)}var gs={r:10,g:10,b:10},bs={r:250,g:250,b:250};function ys(e,t){let r=e.a==null?1:e.a;return{r:e.r*r+t.r*(1-r),g:e.g*r+t.g*(1-r),b:e.b*r+t.b*(1-r)}}function Wc(e){if(!e)return"light";let t=ps(ys(e,gs),gs),r=ps(ys(e,bs),bs);return t>r?"dark":"light"}function Pt(e,t){for(let[r,n]of Object.entries(t))e.style.setProperty(r,n,"important")}function Nn(e){let t=e.ownerDocument&&e.ownerDocument.defaultView,r=e.querySelector(".hcms-toggle__main");if(!t||!r||typeof t.getComputedStyle!="function")return;let n=Uc(t.getComputedStyle(r).color,e.ownerDocument);e.setAttribute("data-hcms-surface",Wc(n))}function Kc(e){Nn(e);let t=e.ownerDocument,r=t&&t.defaultView;if(!r)return;let n=0,i=()=>{if(!n){if(typeof r.requestAnimationFrame!="function")return e.isConnected?Nn(e):s();n=r.requestAnimationFrame(()=>{if(n=0,!e.isConnected)return s();Nn(e)})}};typeof r.requestAnimationFrame=="function"&&i(),t.readyState!=="complete"&&r.addEventListener("load",i,{once:!0});let o=typeof r.MutationObserver=="function"?new r.MutationObserver(i):null;o&&(o.observe(t.documentElement,{attributes:!0}),t.body&&o.observe(t.body,{attributes:!0}));let a=typeof r.matchMedia=="function"?r.matchMedia("(prefers-color-scheme: dark)"):null;a&&typeof a.addEventListener=="function"&&a.addEventListener("change",i);function s(){o&&o.disconnect(),a&&typeof a.removeEventListener=="function"&&a.removeEventListener("change",i)}}function Gc({open:e,close:t,isOpen:r,getTheme:n=()=>null,views:i=Rr},o=document){let a=o.querySelector(`[${ne}]`);if(a)return a;if(!o.querySelector(`[${hs}]`)){let q=o.createElement("style");q.setAttribute(hs,""),q.setAttribute("editor-ui",""),o.getElementById(ds)||(q.id=ds),q.setAttribute("no-save",""),q.setAttribute("snapshot-remove",""),q.setAttribute("save-ignore",""),q.textContent=Bc,o.head.insertBefore(q,o.head.firstChild)}let s=o.createElement("hypercms-toggle");s.className="hcms-shell pixel-quiet",o.getElementById(us)||(s.id=us),s.setAttribute(ne,""),s.setAttribute("editor-ui",""),s.setAttribute("no-save",""),s.setAttribute("snapshot-remove",""),s.setAttribute("save-ignore",""),s.innerHTML='<button type="button" class="hcms-toggle__main mirk-button"><span class="hcms-toggle__open">Edit content</span><span class="hcms-toggle__close">Close editor</span></button>';let l=o.defaultView,u=s.querySelector(".hcms-toggle__main"),m=Rr.filter(q=>i.includes(q)),y=m.length>1,c=y?Yc(o):null,h=y?Jc(o,m):null;y&&(s.setAttribute(ks,""),s.appendChild(c),s.appendChild(h)),Pt(s,{position:"fixed",right:"calc(var(--hcms-toggle-offset, 16px) + var(--hcms-toggle-shift, 0px))",bottom:"calc(var(--hcms-toggle-offset, 16px) + env(safe-area-inset-bottom, 0px))","z-index":"var(--hcms-toggle-z, 2147482900)"}),Pt(u,{background:Ln}),c&&Pt(c,{background:Ln}),h&&Pt(h,{position:"absolute",right:"0",bottom:"calc(100% + 8px)","z-index":"var(--hcms-toggle-z, 2147482900)",display:"none"});let f=()=>h?[...h.querySelectorAll('[role="menuitemradio"]')]:[];function b(q){if(!(!q||typeof q.focus!="function"))try{q.focus({preventScroll:!0})}catch{q.focus()}}function k(q){let te=f();te.length&&b(te[(q+te.length)%te.length])}function A(){let q=ms(l);for(let te of f())te.setAttribute("aria-checked",String(te.getAttribute("data-hcms-view")===q))}function E(q){s.contains(q.target)||O()}function L(q){h&&(h.hidden=!q,Pt(h,{display:q?"block":"none"}),c.setAttribute("aria-expanded",String(q)),q?(A(),o.addEventListener("pointerdown",E,!0)):o.removeEventListener("pointerdown",E,!0))}function D(q=0){L(!0),k(q)}function O({focusArrow:q=!1}={}){!h||h.hidden||(L(!1),q&&b(c))}function W(){let q=ms(l);return q&&m.includes(q)?q:null}async function U(q){await e({view:q}),qc(l,q)}async function ie(){if(r()){t();return}let q=W();return q?e({view:q}):y?D():e(m[0]?{view:m[0]}:{})}async function ee(q){try{await q()}catch(te){console.warn("hypercms: toggle failed to open the CMS",te)}}s.addEventListener("click",async q=>{c&&c.contains(q.target)||h&&h.contains(q.target)||await ee(ie)}),c&&(c.addEventListener("click",q=>{q.preventDefault(),h.hidden?D():O({focusArrow:!0})}),c.addEventListener("keydown",q=>{if(q.key==="ArrowUp"){q.preventDefault(),D(-1);return}(q.key==="ArrowDown"||q.key==="Enter"||q.key===" ")&&(q.preventDefault(),D(0))}),h.addEventListener("click",q=>{let te=q.target.closest?.('[role="menuitemradio"]');te&&(q.preventDefault(),O(),ee(()=>U(te.getAttribute("data-hcms-view"))))}),h.addEventListener("keydown",q=>{let te=f(),xe=te.indexOf(o.activeElement);switch(q.key){case"ArrowDown":q.preventDefault(),k(xe+1);break;case"ArrowUp":q.preventDefault(),k(xe-1);break;case"Home":q.preventDefault(),k(0);break;case"End":q.preventDefault(),k(te.length-1);break;case"Enter":case" ":if(q.preventDefault(),xe===-1)break;O(),ee(()=>U(te[xe].getAttribute("data-hcms-view")));break;case"Escape":q.preventDefault(),O({focusArrow:!0});break;case"Tab":O();break}}));let me=q=>{let te=n();s.classList.toggle("light",te==="light"),s.classList.toggle("dark",te==="dark"),q?s.setAttribute(Or,"open"):s.removeAttribute(Or)};return me(r()),o.addEventListener("hcms:open",()=>me(!0)),o.addEventListener("hcms:close",()=>me(!1)),o.body.appendChild(s),Ie(o),Kc(s),s}function Yc(e){let t=e.createElement("button");return t.type="button",t.className="hcms-toggle__arrow mirk-button",t.setAttribute("aria-haspopup","menu"),t.setAttribute("aria-expanded","false"),t.setAttribute("aria-label","Choose where to edit"),t.textContent="\u25BE",t}function Jc(e,t){let r=e.createElement("div");r.className="hcms-toggle__menu",r.setAttribute("role","menu"),r.setAttribute("aria-label","Where to edit"),r.hidden=!0;for(let n of t){let i=e.createElement("button");i.type="button",i.className="hcms-toggle__item",i.setAttribute("role","menuitemradio"),i.setAttribute("aria-checked","false"),i.setAttribute("data-hcms-view",n),i.tabIndex=-1,i.textContent=Dc[n],r.appendChild(i)}return r}function ws(e){if(typeof window>"u"||typeof document>"u")return;let t=window.__hyperclayEditMode!=null?window.__hyperclayEditMode:null;if(!zc({search:window.location.search,cookie:document.cookie,forced:t}))return;let r=()=>{document.body&&e.hasRules(document)&&Gc(e)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r,{once:!0}):r()}function As(e){if(Ao(e),typeof document<"u"){let t=document.getElementById("hcms-shell-styles");t?.tagName==="LINK"&&t.remove(),Ie(document)}}var jn={sidebar:Mo,inline:Qo};function Mr(e={}){let t=e.view||(J.isOpen?J.ctx.view.name:"sidebar"),r=jn[t];if(!r)throw new Error(`hypercms: unknown view "${t}" (expected ${Object.keys(jn).join(" or ")})`);let n=J.isOpen?{...J.opts,...e,view:t}:e,i=n.pageRoot||(typeof document<"u"?document.body:null);if(!i)throw new Error("hypercms: no pageRoot available");let o=i.ownerDocument||(typeof document<"u"?document:null);if(!o)throw new Error("hypercms: no document available");let a=null,s=null;if(J.isOpen){if(J.ctx.view.name===t)return;a=J.ctx.previouslyFocused,s=J.ctx.view.name,Cr(J.ctx,{restoreFocus:!1,updateUrl:!1,reason:"switch"})}Vo();let l=r({doc:o,pageRoot:i,opts:n}),u=ss({view:l,doc:o,pageRoot:i,opts:n,onCloseRequested:()=>Fn(),onViewRequested:m=>Mr({view:m})});a&&(u.previouslyFocused=a);try{l.mount(u.initialData),as(u),l.focusOnOpen(),J.isOpen=!0,J.ctx=u,J.opts=n,u.dispatch("hcms:open",{pageRoot:i,previous:s})}catch(m){throw Cr(u,{dispatch:!1,restoreFocus:!!a,updateUrl:!1}),m}}function Fn(){J.isOpen&&Cr(J.ctx)}function Ss(){J.isOpen&&J.ctx.view.refresh("api")}function Xc(){return J.isOpen}function Zc(){return J.isOpen&&J.ctx?J.ctx.view.name:null}var Qc={getData(){return J.isOpen?pe(J.ctx):null},setValue(e,t){if(!J.isOpen)throw new Error("hypercms: cms is not open");let r=J.ctx,n=Se(e),i=Pe(r.pageRules,n);if(i===void 0)throw new Error(`hypercms: no rule at path "${e}"`);if(typeof i!="string"||i.endsWith("[]"))throw new Error(`hypercms: setValue requires a leaf scalar path; "${e}" is not a leaf`);let o=mr(r.formRoot,e);if(!o)throw new Error(`hypercms: no field element at path "${e}"`);fr(o,t,r.formRoot,e),be(pe(r),{path:e,structural:!1},r)},addItem(e){if(!J.isOpen)throw new Error("hypercms: cms is not open");Nt(e,J.ctx)},removeItem(e){if(!J.isOpen)throw new Error("hypercms: cms is not open");let t=J.ctx,r=Se(e);if(typeof r[r.length-1]!="number")throw new Error(`hypercms: removeItem requires an item path; "${e}" is not an array index`);let i=Pe(t.pageRules,r.slice(0,-1));if(!(Array.isArray(i)||typeof i=="string"&&i.endsWith("[]")))throw new Error(`hypercms: removeItem requires an item path; parent of "${e}" is not an array`);let a=t.formRoot.querySelector(`[data-hcms-path="${iu(e)}"]`);if(!a)throw new Error(`hypercms: no element at path "${e}"`);at(a,t)},refresh:Ss,_commit(){if(!J.isOpen)return;let e=J.ctx;return pr(e.formRoot),He("Update",()=>be(pe(e),{path:"",structural:!0},e))}},eu=250,tu=1e4;function ru(){typeof window>"u"||typeof document>"u"||cs(window.location?window.location.search:"")&&(J.isOpen||nu(()=>{if(!J.isOpen)try{Mr()}catch(e){console.warn("hypercms: auto-open failed",e)}}))}function In(){return!!document.body&&!!ue("Mutation")}function nu(e){if(In()){queueMicrotask(e);return}let t=Date.now()+tu,r=!1,n=null,i=null,o=()=>{r||(r=!0,n!==null&&clearInterval(n),i&&i())};function a(){if(J.isOpen){o();return}In()&&(o(),e())}i=it(document,io,a),n=setInterval(()=>{if(J.isOpen){o();return}if(In()){o(),e();return}Date.now()>=t&&(o(),console.warn("hypercms: ?cms=true auto-open gave up \u2014 no mutation hub appeared. Load clayjs or hyperclayjs (or just the mutation utility) so the CMS can initialize."))},eu)}ru();ws({open:Mr,close:Fn,isOpen:Xc,getTheme:()=>J.opts?.theme,views:Object.keys(jn),hasRules:e=>!!fe.findRules(e,"cms")});var Dn={open:Mr,close:Fn,refresh:Ss,api:Qc,get isOpen(){return J.isOpen},currentView:Zc,path:Qr,scaffold:Ot,morphForm:Yt};function iu(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^a-zA-Z0-9_\-.*]/g,t=>"\\"+t)}var Es=`/* GENERATED by scripts/build-theme.js from mirk-interface/mirk.css \u2014 DO NOT EDIT.
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

  /* 28 tokens, one value each. light-dark() picks the side from color-scheme.
     :root paints the DEFAULT theme \u2014 "Pixel Quiet" (see 0030): mirk's warm soul
     with the volume down. The louder original palette is the opt-in
     [data-theme="full-volume"] block below. */
  .hcms-shell {
    color-scheme: light dark;                 /* default: follow the OS */

    --mirk-canvas:        light-dark(#FDF8F0, #0B0C13);
    --mirk-bg:            light-dark(#FDF8F0, #11131E);
    --mirk-fg:            light-dark(#2B241B, #ECEAF2);
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
    --mirk-ctrl-bg:       light-dark(#8C7660, #5F6582);
    --mirk-toggle-bg:     light-dark(#EFDBBD, #3E4660);
    --mirk-toggle-hi:     light-dark(#F4EADA, #4E567A);
    --mirk-toggle-lo:     light-dark(#C2A87E, #262B42);
    --mirk-mark-fg:       light-dark(#6B5942, #C9CDE0);
    --mirk-sortable-dot:  light-dark(#DDCBB0, #353B52);
    --mirk-sortable-shadow:    light-dark(#C9B493, #0E1120);
    --mirk-sortable-label:     light-dark(#8C7B62, #8A90AB);
    --mirk-sortable-placeholder: light-dark(#A8987F, #6A7090);
    --mirk-slider-fill:   light-dark(#F2E0BD, #2A2E42);
    --mirk-slider-nub-bg: light-dark(#EFDBBD, #3E4660);
    --mirk-slider-nub-hi: light-dark(#F4EADA, #4E567A);
    --mirk-slider-nub-lo: light-dark(#C2A87E, #262B42);

    /* Chip \u2014 the recovery/notification component reads from the kit's own tokens
       via 5 slim hooks, so it matches the kit by default and reskins by overriding
       a hook (not a rule). Each follows the theme (incl. the Full Volume variant)
       and OS light/dark with no per-theme repaint; the one exception is the primary
       fill, which the default (Pixel Quiet) leaves as the theme's fg ink while the
       Full Volume variant tints it a warm brown in light (see below). */
    --mirk-chip-surface:     var(--mirk-bg);            /* raised panel face */
    --mirk-chip-edge:        var(--mirk-input-border);  /* panel + recess outline */
    --mirk-chip-primary-bg:  var(--mirk-fg);            /* primary action fill \u2014 the theme's fg ink (Full Volume tints it warm brown in light) */
    --mirk-chip-primary-fg:  var(--mirk-bg);
    --mirk-chip-alert:       var(--mirk-destructive);   /* icon + struck "now" value */

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

  /* Built-in brand variant \u2014 "Full Volume": mirk's original full-strength palette,
     the loud pole of the volume axis (Pixel Quiet, now the default, is the quiet
     end). Full-contrast bevel, warm cream / deep navy, crimson destructive.
     Authored with light-dark() like :root, so it follows the OS and still flips
     with .dark / .light. Opt in: data-theme="full-volume". Sits after :root
     (equal specificity, source order wins). --mirk-radius / --mirk-focus-offset /
     --mirk-ctrl-bg and the four shared --mirk-chip-* hooks inherit from :root
     unchanged; only the tokens that differ from the default are re-declared here. */
  .hcms-shell[data-theme="full-volume"] {
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
    /* :root (Pixel Quiet) leaves the chip primary as its own fg ink; the original
       default tinted it a warm brown in light \u2014 restore that here. */
    --mirk-chip-primary-bg: light-dark(#1C170E, var(--mirk-fg));
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

  /* Quiet: a borderless text button (transparent border keeps the hit area + the
     baseline aligned with neighbouring bevel buttons). For tertiary actions. */
  .hcms-shell .mirk-button--quiet {
    background: none; background-image: none;
    border-color: transparent; color: var(--mirk-placeholder-color);
  }
  .hcms-shell .mirk-button--quiet:hover { background: none; color: var(--mirk-fg); }
  .hcms-shell .mirk-button--quiet:active { border-color: transparent; }

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
    background: var(--mirk-canvas);            /* own recessed channel, like the slider track \u2014 never the host page (0033) */
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

  /* ============================ CHIP ============================ */
  /* A collapsible recovery/notification: a round pill that expands into a RAISED
     panel \u2014 the kit's one elevated surface (a distinct --mirk-bg face, a hairline
     outline, and a soft drop shadow, the only shadow in the kit, reserved for this
     raised tier). State lives in classes (--open, is-changes) so it round-trips via
     outerHTML; mirk.js only flips them on click. Color reads from generic kit
     tokens through 5 slim --mirk-chip-* hooks, so it matches the kit and reskins by
     overriding a hook, not a rule. In a Hyperclay app, add \`save-remove\` to the
     block so a transient prompt never persists into the saved file. */
  .hcms-shell .mirk-chip { display: inline-flex; flex-direction: column; align-items: flex-start; }
  .hcms-shell .mirk-chip__panel { display: none; }
  .hcms-shell .mirk-chip--open .mirk-chip__trigger { display: none; }
  .hcms-shell .mirk-chip--open .mirk-chip__panel { display: flex; }

  /* Collapsed chip \u2014 a round mirk-button pill (mirk-button--round in the markup),
     the alert glyph seated in the label, so it reads as a distinct affordance, not
     a flat button. A soft, tight lift sets it above the page; deeper on a dark
     canvas (same media + forced-mode pattern as the panel shadow below). */
  .hcms-shell .mirk-chip__trigger .mirk-button__label { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
  .hcms-shell .mirk-chip__trigger { box-shadow: 0 6px 14px -8px rgba(43, 36, 27, 0.5), 0 2px 5px -3px rgba(43, 36, 27, 0.32); }
  @media (prefers-color-scheme: dark) { .hcms-shell .mirk-chip__trigger { box-shadow: 0 6px 14px -8px rgba(0, 0, 0, 0.6), 0 2px 6px -3px rgba(0, 0, 0, 0.5); } }
  .hcms-shell.light .mirk-chip__trigger, .hcms-shell[data-theme="light"] .mirk-chip__trigger { box-shadow: 0 6px 14px -8px rgba(43, 36, 27, 0.5), 0 2px 5px -3px rgba(43, 36, 27, 0.32); }
  .hcms-shell.dark .mirk-chip__trigger, .hcms-shell[data-theme="dark"] .mirk-chip__trigger { box-shadow: 0 6px 14px -8px rgba(0, 0, 0, 0.6), 0 2px 6px -3px rgba(0, 0, 0, 0.5); }
  /* Drive the warning fill from CSS, not an SVG fill="var(...)" presentation
     attribute (var() is not reliably honored there). */
  .hcms-shell .mirk-chip__warn { fill: var(--mirk-chip-alert); }
  .hcms-shell .mirk-chip__trigger .mirk-chip__warn { vertical-align: -2px; }

  /* The panel \u2014 the raised surface: a --mirk-bg face over the page, a hairline
     outline, a soft drop shadow. */
  .hcms-shell .mirk-chip__panel {
    width: 300px; max-width: calc(100vw - 44px);
    background: var(--mirk-chip-surface); color: var(--mirk-fg);
    border: 1px solid var(--mirk-chip-edge); border-radius: var(--mirk-radius);
    box-shadow: 0 20px 50px -30px rgba(43, 36, 27, 0.6);
    padding: 14px 15px 13px; flex-direction: column; gap: 12px;
  }
  /* The panel's larger drop (the collapsed pill above carries a tighter one); deepen
     both on a dark canvas. Mirrors the --focus-offset pattern: a media default for
     the OS, plus explicit forced-mode overrides. */
  @media (prefers-color-scheme: dark) { .hcms-shell .mirk-chip__panel { box-shadow: 0 20px 52px -26px rgba(0, 0, 0, 0.78); } }
  .hcms-shell.light .mirk-chip__panel, .hcms-shell[data-theme="light"] .mirk-chip__panel { box-shadow: 0 20px 50px -30px rgba(43, 36, 27, 0.6); }
  .hcms-shell.dark .mirk-chip__panel, .hcms-shell[data-theme="dark"] .mirk-chip__panel { box-shadow: 0 20px 52px -26px rgba(0, 0, 0, 0.78); }

  /* Head \u2014 icon, text, collapse glyph. */
  .hcms-shell .mirk-chip__head { display: flex; gap: 10px; align-items: flex-start; }
  .hcms-shell .mirk-chip__icon { flex-shrink: 0; line-height: 0; margin-top: 1px; }
  .hcms-shell .mirk-chip__headtext { min-width: 0; }
  .hcms-shell .mirk-chip__eyebrow {
    font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.2em;
    color: var(--mirk-placeholder-color); margin-bottom: 3px;
  }
  .hcms-shell .mirk-chip__title { margin: 0; font-size: 13px; font-weight: 400; line-height: 1.3; color: var(--mirk-fg); }
  .hcms-shell .mirk-chip__collapse {
    margin-left: auto; flex-shrink: 0; width: 24px; height: 24px;
    display: inline-flex; align-items: center; justify-content: center;
    background: none; border: 0; cursor: pointer; padding: 0;
    color: var(--mirk-placeholder-color);
  }
  .hcms-shell .mirk-chip__collapse:hover { color: var(--mirk-fg); }
  .hcms-shell .mirk-chip__collapse svg { display: block; }

  /* Meta line. */
  .hcms-shell .mirk-chip__meta { font-size: 11px; letter-spacing: 0.04em; color: var(--mirk-placeholder-color); }
  .hcms-shell .mirk-chip__changes-toggle {
    background: none; border: 0; cursor: pointer; font: inherit; font-size: 11px; padding: 0 0 0 4px;
    color: var(--mirk-placeholder-color); text-decoration: underline; text-underline-offset: 2px;
  }
  .hcms-shell .mirk-chip__changes-toggle:hover { color: var(--mirk-fg); }

  /* Before/after field table \u2014 a recessed stack, revealed by the changes toggle. */
  .hcms-shell .mirk-chip__preview {
    display: none; flex-direction: column; gap: 11px;
    background: var(--mirk-bevel-bg); border: 1px solid var(--mirk-chip-edge);
    padding: 10px 11px;
  }
  .hcms-shell .mirk-chip__panel.is-changes .mirk-chip__preview { display: flex; }
  .hcms-shell .mirk-chip__row { display: flex; flex-direction: column; gap: 2px; }
  .hcms-shell .mirk-chip__key {
    font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--mirk-placeholder-color);
  }
  .hcms-shell .mirk-chip__old, .hcms-shell .mirk-chip__new { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hcms-shell .mirk-chip__old { font-size: 11px; color: var(--mirk-chip-alert); text-decoration: line-through; opacity: 0.85; }
  .hcms-shell .mirk-chip__new { font-size: 12px; color: var(--mirk-fg); }

  /* Action stack \u2014 full-width buttons by weight: an embossed primary, a plain bevel
     revert, a quiet (--quiet) dismiss. */
  .hcms-shell .mirk-chip__actions { display: flex; flex-direction: column; gap: 8px; margin-top: 1px; }
  .hcms-shell .mirk-chip__actions .mirk-button { width: 100%; }
  /* Primary action \u2014 a genuine kit bevel button whose bevel palette is derived from
     the chip's primary fill (lighter top-left, darker bottom-right), so it embosses
     on any color. The base .mirk-button rules then drive its border, hover, and the
     :active flip, identical to the kit's other buttons. */
  .hcms-shell .mirk-chip__actions .mirk-chip__action--primary {
    --mirk-bevel-bg:       var(--mirk-chip-primary-bg);
    --mirk-bevel-fg:       var(--mirk-chip-primary-fg);
    --mirk-bevel-tl:       color-mix(in srgb, var(--mirk-chip-primary-bg), white 24%);
    --mirk-bevel-br:       color-mix(in srgb, var(--mirk-chip-primary-bg), black 32%);
    --mirk-bevel-hover-bg: color-mix(in srgb, var(--mirk-chip-primary-bg), white 10%);
  }

  /* ============================ FIELD ============================ */
  /* Label + control + hint as one unit, so a form composes without utilities
     (and without needing the mirk-page rhythm). Any control drops in; the gap
     matches the page scaffold's label/hint hug. Consecutive fields space
     themselves. */
  .hcms-shell .mirk-field { display: flex; flex-direction: column; gap: 6px; }
  .hcms-shell .mirk-field__label { font-size: 16px; line-height: 1.5; }
  .hcms-shell .mirk-field + .mirk-field { margin-block-start: 18px; }
  .hcms-shell .mirk-field--small .mirk-field__label { font-size: 14px; }

  /* An alert hint inside a field stays hidden until a control in the field
     goes :user-invalid \u2014 a zero-JS native-validation message. Show one
     unconditionally (a server-side error) by placing it outside the field or
     overriding display. */
  .hcms-shell .mirk-field .mirk-hint--alert { display: none; }
  .hcms-shell .mirk-field:has(:user-invalid) .mirk-hint--alert { display: block; }

  /* ============================ INVALID ============================ */
  /* Native constraint validation, styled. :user-invalid fires only after the
     user interacts (unlike :invalid, which would paint required fields red on
     load). A flat destructive border is the 0012 stateful read; the focus ring
     stays the focus signal. Pair the message with mirk-hint--alert. */
  .hcms-shell .mirk-input:user-invalid, .hcms-shell .mirk-textarea:user-invalid, .hcms-shell .mirk-date__field:user-invalid, .hcms-shell .mirk-select__field:user-invalid, .hcms-shell .mirk-number:has(.mirk-number__input:user-invalid) {
    border-color: var(--mirk-destructive);
  }
  .hcms-shell .mirk-checkbox:has(:user-invalid) .mirk-checkbox__box, .hcms-shell .mirk-toggle:has(:user-invalid) .mirk-toggle__track {
    border-color: var(--mirk-destructive);
  }
  /* The unchecked ring is a borderless gradient pill; invalid swaps it for a
     flat destructive ring (the fill pill still seats inside). */
  .hcms-shell .mirk-radio:has(:user-invalid) .mirk-radio__ring {
    background-image: none;
    border: 2px solid var(--mirk-destructive);
  }

  /* ============================ PROGRESS ============================ */
  /* A native <progress> in the slider's clothes: the canvas channel, the
     slider-fill value bar. --blocks segments the fill into pixel blocks.
     Keep the -webkit and -moz rules separate \u2014 an unrecognized pseudo-element
     invalidates the whole selector list. */
  .hcms-shell .mirk-progress {
    appearance: none; -webkit-appearance: none;
    display: block; width: 100%; height: 12px;
    border: 1px solid var(--mirk-input-border);
    background: var(--mirk-canvas);
  }
  .hcms-shell .mirk-progress::-webkit-progress-bar { background: transparent; }
  .hcms-shell .mirk-progress::-webkit-progress-value { background: var(--mirk-slider-fill); }
  .hcms-shell .mirk-progress::-moz-progress-bar { background: var(--mirk-slider-fill); }
  .hcms-shell .mirk-progress--small { height: 8px; }
  .hcms-shell .mirk-progress--round { border-radius: 9999px; overflow: hidden; }
  .hcms-shell .mirk-progress--blocks::-webkit-progress-value {
    background: repeating-linear-gradient(to right,
      var(--mirk-slider-fill) 0 8px, transparent 8px 11px);
  }
  .hcms-shell .mirk-progress--blocks::-moz-progress-bar {
    background: repeating-linear-gradient(to right,
      var(--mirk-slider-fill) 0 8px, transparent 8px 11px);
  }

  /* ============================ NOTE ============================ */
  /* An informational callout. Flat on purpose: bevel means pressable in this
     kit (0012) and a note is content, so it gets the 1px content border over
     the recessed face, never the raised edge. The 4px left edge carries the
     status: neutral ink by default, destructive on --alert. */
  .hcms-shell .mirk-note {
    display: flex; flex-direction: column; gap: 4px;
    background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border);
    border-left: 4px solid var(--mirk-mark-fg);
    padding: 10px 14px 11px;
    font-size: 14px; line-height: 1.5;
  }
  .hcms-shell .mirk-note__title {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em;
    color: var(--mirk-mark-fg);
  }
  .hcms-shell .mirk-note__body { color: var(--mirk-fg); }
  .hcms-shell .mirk-note--alert { border-left-color: var(--mirk-destructive); }
  .hcms-shell .mirk-note--alert .mirk-note__title { color: var(--mirk-destructive); }
  .hcms-shell .mirk-note--rounded { border-radius: var(--mirk-radius); }

  /* ============================ HINT ============================ */
  /* Small print under a field: neutral help text, or --alert validation text. */
  .hcms-shell .mirk-hint { margin: 0; font-size: 13px; line-height: 1.5; color: var(--mirk-placeholder-color); }
  .hcms-shell .mirk-hint--alert { color: var(--mirk-destructive); }

  /* ============================ LIST ============================ */
  /* Content bullets. <ul> gets a square pixel dot (the sortable dot's idiom,
     one step larger); a nested <ul> hollows it. <ol> gets zero-padded counters
     in the muted label ink. Styles the bare <li> by descent, like the platform. */
  .hcms-shell .mirk-list {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 6px;
    font-size: 16px; line-height: 1.5;
  }
  .hcms-shell .mirk-list li { position: relative; padding-left: 22px; }
  .hcms-shell ul.mirk-list > li::before {
    content: ""; position: absolute; left: 2px; top: 0.55em;
    width: 6px; height: 6px; background: var(--mirk-mark-fg);
    box-shadow: 1px 1px 0 0 var(--mirk-sortable-shadow);
  }
  .hcms-shell ol.mirk-list { counter-reset: mirk-li; }
  .hcms-shell ol.mirk-list > li { counter-increment: mirk-li; padding-left: 38px; }
  .hcms-shell ol.mirk-list > li::before {
    content: counter(mirk-li, decimal-leading-zero) ".";
    position: absolute; left: 0; top: 0;
    color: var(--mirk-sortable-label);
  }

  /* One nested level: hollow square, same stack. */
  .hcms-shell .mirk-list ul {
    list-style: none; margin: 6px 0 0; padding: 0;
    display: flex; flex-direction: column; gap: 6px;
  }
  .hcms-shell .mirk-list ul > li::before {
    content: ""; position: absolute; left: 2px; top: 0.55em;
    width: 6px; height: 6px; background: transparent;
    border: 1.5px solid var(--mirk-mark-fg); box-shadow: none;
  }

  .hcms-shell .mirk-list--small { font-size: 14px; gap: 4px; }
  .hcms-shell .mirk-list--small li { padding-left: 18px; }
  .hcms-shell ul.mirk-list--small > li::before, .hcms-shell .mirk-list--small ul > li::before { width: 5px; height: 5px; }
  .hcms-shell ol.mirk-list--small > li { padding-left: 32px; }

  /* ============================ BADGE ============================ */
  /* A static tag label \u2014 the display counterpart to the mirk-tags input. Flat
     on purpose: bevel means pressable (0012), a badge is content. */
  .hcms-shell .mirk-badge {
    display: inline-flex; align-items: center; gap: 0.375rem;
    padding: 1px 8px 2px; font-size: 12px; line-height: 1.5;
    color: var(--mirk-fg); background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border);
    white-space: nowrap; vertical-align: middle;
  }
  .hcms-shell .mirk-badge--accent { background: var(--mirk-accent); }
  .hcms-shell .mirk-badge--round { border-radius: 9999px; padding: 1px 10px 2px; }
  .hcms-shell .mirk-badge--alert { color: var(--mirk-destructive); border-color: var(--mirk-destructive); }

  /* ============================ TABLE ============================ */
  /* A flat data surface: the content face in a 1px frame, header cells in the
     eyebrow register, hairline row dividers. Semantic <table> styled by
     descent \u2014 no per-cell classes. The header/stripe tints ride color-mix
     toward the ink so they stay visible in every palette (Pixel Quiet's
     canvas and face are nearly the same value). Wrap in an overflow-x:auto
     div when the table can outgrow its column. */
  .hcms-shell .mirk-table {
    width: 100%; border-collapse: collapse;
    background: var(--mirk-bevel-bg);
    border: 1px solid var(--mirk-input-border);
    font-size: 14px; line-height: 1.5;
  }
  .hcms-shell .mirk-table th {
    text-align: left; font-weight: 400;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;
    color: var(--mirk-placeholder-color);
    background: color-mix(in srgb, var(--mirk-bevel-bg), var(--mirk-fg) 4%);
    padding: 7px 14px;
    border-bottom: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-table td {
    padding: 8px 14px;
    border-bottom: 1px solid var(--mirk-input-border);
    vertical-align: top;
  }
  .hcms-shell .mirk-table tbody tr:last-child td { border-bottom: 0; }
  .hcms-shell .mirk-table--striped tbody tr:nth-child(even) td {
    background: color-mix(in srgb, var(--mirk-bevel-bg), var(--mirk-fg) 3%);
  }
  .hcms-shell .mirk-table--small { font-size: 13px; }
  .hcms-shell .mirk-table--small th { padding: 5px 12px; font-size: 10px; }
  .hcms-shell .mirk-table--small td { padding: 5px 12px; }

  /* ============================ PAGE ============================ */
  /* The quickstart shell: mirk-page on <body> (or any wrapper) gives a centered
     column + typographic defaults, so two CDN tags and one class boot a full
     page. Every rule rides :where() (zero specificity): any utility, component
     class, or consumer rule beats it. Flow rhythm targets direct children only,
     so margins never leak inside component internals. */
  .hcms-shell .mirk-page { max-width: 640px; margin-inline: auto; padding: 48px 24px 96px; }
  .hcms-shell .mirk-page--wide { max-width: 960px; }

  /* Departure Mono ships one weight \u2014 hierarchy comes from size, never bold. */
  .hcms-shell .mirk-page :where(h1, h2, h3, h4) { margin: 0; font-weight: 400; line-height: 1.15; }
  .hcms-shell .mirk-page :where(h1) { font-size: 40px; }
  .hcms-shell .mirk-page :where(h2) { font-size: 26px; }
  .hcms-shell .mirk-page :where(h3) { font-size: 20px; }
  .hcms-shell .mirk-page :where(h4) { font-size: 16px; }
  .hcms-shell .mirk-page :where(p) { margin: 0; font-size: 16px; line-height: 1.6; }

  .hcms-shell .mirk-page :where(a) { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
  .hcms-shell .mirk-page :where(code, kbd) {
    font-size: 0.875em; padding: 1px 4px;
    background: var(--mirk-bevel-bg); border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-page :where(pre) {
    margin: 0; padding: 12px 14px; font-size: 13px; line-height: 1.5; overflow-x: auto;
    background: var(--mirk-bevel-bg); border: 1px solid var(--mirk-input-border);
  }
  .hcms-shell .mirk-page :where(pre code) { padding: 0; border: 0; background: none; font-size: inherit; }
  .hcms-shell .mirk-page :where(hr) { border: 0; border-top: 1px solid var(--mirk-input-border); }

  /* Flow rhythm \u2014 direct children only; headings open sections, eyebrows and
     hints hug their neighbors. Equal specificity, so source order settles ties. */
  .hcms-shell .mirk-page > :where(* + *) { margin-block-start: 14px; }
  .hcms-shell .mirk-page > :where(h1, h2, h3, h4):where(* + *) { margin-block-start: 40px; }
  .hcms-shell .mirk-page > :where(.mirk-eyebrow + *), .hcms-shell .mirk-page > :where(* + .mirk-hint) { margin-block-start: 6px; }

  /* ============================ EYEBROW ============================ */
  /* The kit's signature section label, as a shippable class. Block so it works
     the same on <p>, <label>, or <div>, and flow margins always apply. */
  .hcms-shell .mirk-eyebrow {
    display: block; margin: 0;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em;
    color: var(--mirk-placeholder-color);
  }
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

   Adapted from ARCHIVE_PROJECTS/cms-sidebar/pixel-quiet/overrides.css. Two jobs:
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
.hcms-shell.pixel-quiet.hcms-panel {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--hcms-shell-width, 380px);
  max-width: 100vw;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  color: var(--mirk-fg);
  background: var(--mirk-bg);
  border-left: 1px solid var(--mirk-input-border);
  box-shadow: -16px 0 48px -28px rgba(43, 36, 27, 0.45);
}
.hcms-shell.pixel-quiet.hcms-panel.dark {
  box-shadow: -16px 0 48px -28px rgba(0, 0, 0, 0.6);
}

.hcms-shell.pixel-quiet.hcms-side-left {
  right: auto;
  left: 0;
  border-left: 0;
  border-right: 1px solid var(--mirk-input-border);
  box-shadow: 16px 0 48px -28px rgba(43, 36, 27, 0.45);
}

/* Push the page over so docked content is never hidden underneath, and publish
   the geometry the floating toggle has to compose with. --hcms-toggle-shift is
   the distance the toggle moves left, which is the shell width only while the
   shell is docked on the right; docked left, as an overlay, or full-viewport it
   is zero. */
body.hcms-open { --hcms-shell-width: 380px; }
body.hcms-open:not(.hcms-overlay) { padding-right: var(--hcms-shell-width); }
body.hcms-open:not(.hcms-overlay):not(.hcms-side-left) { --hcms-toggle-shift: var(--hcms-shell-width); }
body.hcms-open.hcms-side-left:not(.hcms-overlay) { padding-right: 0; padding-left: var(--hcms-shell-width); }
body.hcms-open.hcms-overlay { overflow: hidden; --hcms-toggle-display: none; }

@media (max-width: 799px) {
  body.hcms-open { --hcms-shell-width: 100vw; }
  body.hcms-open:not(.hcms-overlay):not(.hcms-side-left) { --hcms-toggle-shift: 0px; }
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
  padding: 12px 24px 28px;
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

/* default scalar fields: one-row textareas that grow with their content.
   Browsers without field-sizing get a scrollHeight fallback (enhance.js). */
.hcms-shell.pixel-quiet .hcms-form textarea.mirk-textarea {
  field-sizing: content;
  resize: none;
  overflow: hidden;
  min-height: 0;
}

/* rich-text surface (@richtext): a contenteditable styled like a textarea */
.hcms-shell.pixel-quiet .hcms-richtext {
  min-height: 2.5em;
  cursor: text;
  overflow-wrap: break-word;
}
.hcms-shell.pixel-quiet .hcms-richtext a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.hcms-shell.pixel-quiet .hcms-richtext:empty::before {
  content: attr(data-hcms-placeholder);
  color: var(--mirk-placeholder-color);
}
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

/* ---------- UPLOADING (spec \xA79) ----------
   One attribute, [data-hcms-uploading], set on the field for as long as the host
   has the bytes, plus --hcms-upload-progress carrying the percent. No markup of
   its own: the templates keep their exact shape, so a half-finished upload cannot
   leave an orphan node behind in the form. The at-upload-time picture is painted
   on the frame as a background, never assigned to the bound <img>, because that
   img IS the field's value and a commit landing mid-upload would write a
   two-megabyte data URL straight into the live page. */
.hcms-upload[data-hcms-uploading] .mirk-image__frame {
  background-size: cover;
  background-position: center;
}
/* The empty state hides the thumb, so an upload into an empty field would have
   nowhere to show. Uploading reveals it, preview or not. */
.hcms-upload--image[data-hcms-uploading] .mirk-image__thumb { display: inline-block; }
.hcms-upload--image[data-hcms-uploading] .mirk-image__upload { display: none; }
/* No \xD7 mid-flight: clearing writes the leaf empty, which says nothing about the
   request still running and reads as a cancel that is not one. */
.hcms-upload[data-hcms-uploading] .hcms-upload-clear { display: none; }

.hcms-upload[data-hcms-uploading] .mirk-image__frame::after,
.hcms-upload--file[data-hcms-uploading] .mirk-file::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: var(--hcms-upload-progress, 0%);
  background: var(--mirk-bevel-fg);
  transition: width 120ms linear;
}
/* The @file row has no frame to hang the bar on, so it becomes the positioning
   context itself. */
.hcms-upload--file[data-hcms-uploading] .mirk-file { position: relative; }

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

/* ---------- UNRESOLVED-FIELDS NOTICE ---------- */
.hcms-shell-notice {
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-line;
  color: var(--mirk-mark-fg);
  background: var(--mirk-bevel-bg);
  border: 1px solid var(--mirk-input-border);
  padding: 8px 12px;
  margin: 0 24px 8px;
}
.hcms-shell-notice[hidden] { display: none; }

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

/* A note, not a refusal: the file WAS stored, in the page, and this says why it
   is not on the host. Same slot, so there is one place a field ever speaks. */
.hcms-error--info {
  color: var(--mirk-mark-fg);
  border-color: var(--mirk-input-border);
}

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

/* ============================================================
   INLINE VIEW GEOMETRY \u2014 not a panel. A transparent full-viewport
   host whose children are the only interactive surfaces, so the page
   underneath stays fully usable while the editor is open.
   ============================================================ */
.hcms-shell.pixel-quiet.hcms-inline {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  /* The host must never intercept a click meant for the page. Each child
     re-enables pointer events for itself. */
  pointer-events: none;
  background: none;
  border: 0;
  box-shadow: none;
  color: var(--mirk-fg);
}
.hcms-inline > *,
.hcms-inline-layer > * { pointer-events: auto; }
.hcms-inline-layer { position: absolute; inset: 0; pointer-events: none; }

.hcms-inline-bar {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  max-width: min(560px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hcms-inline-notice,
.hcms-inline-error {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid var(--mirk-input-border);
  background: var(--mirk-bg);
  color: var(--mirk-fg);
  box-shadow: 0 12px 32px -20px rgba(43, 36, 27, 0.5);
}
.hcms-inline-notice { white-space: pre-line; }
.hcms-inline-error { border-color: var(--mirk-destructive); color: var(--mirk-destructive); }
.hcms-inline-notice[hidden],
.hcms-inline-error[hidden] { display: none; }

.hcms-inline-pop {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: min(340px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--mirk-input-border);
  background: var(--mirk-bg);
  color: var(--mirk-fg);
  box-shadow: 0 16px 40px -22px rgba(43, 36, 27, 0.55);
  /* Above the handles. They are positioned with z-index: 1 while the popover
     sat at auto, so a handle painted over the very field it had just opened
     and covered the text in it. The popover is what someone is using; a handle
     is only an offer to open one. */
  z-index: 2;
}
.hcms-inline-pop[hidden] { display: none; }
.hcms-inline-pop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
}
.hcms-shell .hcms-inline-pop-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  padding: 4px;
}

.hcms-inline-item-controls {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  will-change: transform;
  display: flex;
  align-items: center;
  gap: 2px;
}
.hcms-inline-item-controls[hidden],
.hcms-inline-handle[hidden] { display: none; }
.hcms-inline-item-controls.has-open-settings { z-index: 3; }
.hcms-inline-settings { position: relative; display: flex; flex: none; }
.hcms-inline-settings[hidden],
.hcms-inline-settings-menu[hidden] { display: none; }
.hcms-inline-settings-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 120px;
  padding: 4px;
  border: 1px solid var(--mirk-input-border);
  border-radius: 5px;
  background: var(--mirk-bg);
  box-shadow: 0 8px 24px #0003;
}
.hcms-inline-settings-menu button {
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: var(--mirk-destructive);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.hcms-inline-settings-menu button:hover,
.hcms-inline-settings-menu button:focus-visible {
  background: var(--mirk-bevel-bg);
  outline: 1px solid var(--mirk-focus-color);
}

/* Buttons flow within the positioned item container. */
.hcms-inline-row-controls {
  display: flex;
  gap: 2px;
}
.hcms-inline-row-controls[hidden] { display: none; }

.hcms-inline-list-add[hidden] { display: none; }

.hcms-shell.hcms-inline-ghost {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  max-width: 100%;
  min-width: 0;
  margin: 8px 0 0;
  padding: 0;
  border: 1px dashed color-mix(in srgb, currentColor 25%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, currentColor 3%, transparent);
  color: inherit;
  list-style: none;
}
.hcms-shell.hcms-inline-ghost[hidden] { display: none; }
tr.hcms-shell.hcms-inline-ghost { display: table-row; }
.hcms-inline-ghost-cell { padding: 0; text-align: center; vertical-align: middle; }

.hcms-shell .hcms-inline-handle,
.hcms-shell .hcms-inline-list-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  padding: 4px;
  line-height: 1;
}
.hcms-inline-handle .mirk-button__label,
.hcms-inline-list-button .mirk-button__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}
.hcms-inline-icon { display: block; width: 24px; height: 24px; flex: none; }
.hcms-inline-handle .hcms-inline-icon { width: 20.4px; height: 20.4px; transform: translateY(-1px); }
.hcms-inline-list-add .hcms-inline-icon { width: 16.8px; height: 16.8px; }
.hcms-shell .hcms-inline-list-add { padding-inline: 10px; }

.hcms-inline-list-button {
  flex: none;
}
.hcms-inline-list-button[hidden] { display: none; }
.hcms-shell .hcms-inline-list-button:disabled {
  opacity: 1;
  color: #626B96;
  background: var(--mirk-bevel-bg);
  border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
}
.hcms-shell .hcms-inline-list-button:disabled .mirk-button__label { translate: none; }

/* A finger is not a mouse pointer: on touch the same three controls get the
   44px target the platform guidelines ask for. */
@media (pointer: coarse) {
  .hcms-shell .hcms-inline-handle,
  .hcms-shell .hcms-inline-list-button {
    min-width: 44px;
    min-height: 44px;
  }
}

.hcms-inline-toggle { align-self: center; }
.hcms-inline-toggle[hidden] { display: none; }

/* Fields with no visible anchor can still be edited through the sidebar. */
.hcms-inline-handoff {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid var(--mirk-input-border);
  background: var(--mirk-bg);
  color: var(--mirk-fg);
  align-self: center;
}
.hcms-inline-handoff[hidden] { display: none; }

/* Selected fields only. Scoped to the inline host: [data-hcms-shell] is on BOTH
   hosts, so an unscoped rule hides the sidebar's whole form too. */
.hcms-inline .hcms-form [data-hcms-path] { display: none; }
.hcms-inline .hcms-form [data-hcms-path].is-hcms-inline-onpath,
.hcms-inline .hcms-form [data-hcms-path].is-hcms-inline-active { display: block; }

.hcms-inline .hcms-form .is-hcms-inline-onpath,
.hcms-inline .hcms-form {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  min-width: 0;
  min-height: 0;
  width: 100%;
}
.hcms-inline-pop .hcms-object-title,
.hcms-inline-pop .hcms-array-header,
.hcms-inline-pop .hcms-drag-handle,
.hcms-inline-pop [data-hcms-action="add"],
.hcms-inline-pop [data-hcms-action="remove"],
.hcms-inline-pop [data-hcms-action="move-up"],
.hcms-inline-pop [data-hcms-action="move-down"],
.hcms-inline-pop .hcms-card-controls { display: none; }
.hcms-inline .hcms-form .hcms-field.is-hcms-inline-active {
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0 0 16px;
  border: 0;
  min-width: min(260px, 100%);
}
.hcms-inline .hcms-form .hcms-field.is-hcms-inline-active:last-child { margin-bottom: 0; }
.hcms-shell.pixel-quiet .hcms-inline-pop .mirk-input,
.hcms-shell.pixel-quiet .hcms-inline-pop .mirk-textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: min(260px, 100%);
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--mirk-input-border);
  background: var(--mirk-input-bg);
}
.hcms-inline-pop .mirk-input:focus-visible,
.hcms-inline-pop .mirk-textarea:focus-visible {
  outline: 2px solid var(--mirk-focus-color);
  outline-offset: 2px;
}

.hcms-inline-highlight {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border: 2px solid var(--mirk-focus-color);
  border-radius: 4px;
  box-sizing: border-box;
  will-change: transform;
}
.hcms-inline-highlight[hidden] { display: none; }
`;typeof window<"u"&&typeof document<"u"&&(function(){if(window.__mirk)return;window.__mirk=!0;let e='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4 12 12M12 4 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="square" fill="none"/></svg>';document.addEventListener("click",r=>{let n=r.target.closest(".mirk-number__step");if(!n)return;let i=n.closest(".mirk-number").querySelector("input[type=number]");i&&(n.dataset.step==="up"?i.stepUp():i.stepDown(),i.dispatchEvent(new Event("change",{bubbles:!0})))}),document.addEventListener("input",r=>{let n=r.target.closest(".mirk-slider__input");n&&n.closest(".mirk-slider").style.setProperty("--mirk-value",`${n.value}%`)}),document.addEventListener("change",r=>{let n=r.target.closest(".mirk-file__input");if(!n||!n.files.length)return;let i=n.closest(".mirk-file"),o=i.querySelector(".mirk-file__name");if(!o)return;let a=n.files[0],s=document.createElement("a");if(s.className="mirk-file__name",s.dataset.filled="",s.href=URL.createObjectURL(a),s.target="_blank",s.rel="noopener",s.textContent=a.name,o.replaceWith(s),!i.querySelector(".mirk-file__remove")){let l=document.createElement("button");l.type="button",l.className="mirk-file__remove",l.setAttribute("aria-label","Remove file"),l.innerHTML=e,s.after(l)}}),document.addEventListener("change",r=>{let n=r.target.closest(".mirk-image__input");if(!n||!n.files.length)return;let i=n.closest(".mirk-image"),o=i.querySelector(".mirk-image__preview");if(!o)return;let a=i.querySelector(".mirk-image__placeholder"),s=new FileReader;s.onload=l=>{o.src=l.target.result,o.removeAttribute("hidden"),a&&a.setAttribute("hidden",""),i.querySelector(".mirk-image__thumb")?.removeAttribute("hidden"),i.querySelector(".mirk-image__upload")?.setAttribute("hidden","")},s.readAsDataURL(n.files[0])}),document.addEventListener("click",r=>{let n=r.target.closest(".mirk-file__remove");if(n){let o=n.closest(".mirk-file"),a=o?.querySelector(".mirk-file__input"),s=o?.querySelector(".mirk-file__name");if(a&&(a.value=""),s){let l=document.createElement("span");l.className="mirk-file__name",l.textContent="No file chosen",s.replaceWith(l)}n.remove();return}let i=r.target.closest(".mirk-image__remove");if(i){let o=i.closest(".mirk-image"),a=o?.querySelector(".mirk-image__input"),s=o?.querySelector(".mirk-image__preview");a&&(a.value=""),s&&(s.removeAttribute("src"),s.setAttribute("hidden","")),o?.querySelector(".mirk-image__thumb")?.setAttribute("hidden",""),o?.querySelector(".mirk-image__upload")?.removeAttribute("hidden")}});function t(r,n){let i=document.createElement("span");i.textContent=r;let o=document.createElement("input");o.type="hidden",o.name="tags[]",o.value=r;let a=document.createElement("button");a.type="button",a.className="mirk-tags__remove",a.textContent="\xD7";let s=document.createElement("span");if(s.className="mirk-tags__chip",n){let l=document.createElement("span");l.className="mirk-tags__chip-inner",l.append(i,o,a),s.append(l)}else s.append(i,o,a);return s}document.addEventListener("keydown",r=>{let n=r.target.closest(".mirk-tags__input");if(!n)return;let i=n.closest(".mirk-tags");if(r.key==="Enter"||r.key===","){let o=n.value.trim();if(!o)return;r.preventDefault(),n.before(t(o,i.classList.contains("mirk-tags--round"))),n.value=""}else if(r.key==="Backspace"&&!n.value){let o=i.querySelectorAll(".mirk-tags__chip");o[o.length-1]?.remove()}}),document.addEventListener("click",r=>{let n=r.target.closest(".mirk-tags__remove");if(n){n.closest(".mirk-tags__chip").remove();return}let i=r.target.closest(".mirk-tags");i&&r.target===i&&i.querySelector(".mirk-tags__input")?.focus()}),document.addEventListener("click",r=>{let n=r.target.closest("[data-mirk-chip]");if(!n)return;let i=n.getAttribute("data-mirk-chip");if(i==="open")n.closest(".mirk-chip")?.classList.add("mirk-chip--open");else if(i==="collapse")n.closest(".mirk-chip")?.classList.remove("mirk-chip--open");else if(i==="changes"){let o=n.closest(".mirk-chip__panel")?.classList.toggle("is-changes");n.textContent=o?"(hide changes)":"(view changes)"}}),document.addEventListener("click",r=>{let n=r.target.closest("[data-copy-btn]");if(!n)return;let i=n.closest("[data-copy]");if(!i)return;let o=i.cloneNode(!0);o.querySelectorAll("[data-copy-btn]").forEach(l=>l.remove());let s=i.getAttribute("data-copy")==="text"?o.textContent.replace(/^\s+|\s+$/g,""):o.innerHTML.replace(/\s+data-copy(="[^"]*")?/g,"").replace(/^\s*\n/gm,"").trim();navigator.clipboard.writeText(s).then(()=>{let l=n.textContent;n.textContent="copied",n.dataset.copied="",setTimeout(()=>{n.textContent=l,delete n.dataset.copied},1200)}).catch(()=>{n.textContent="error",setTimeout(()=>{n.textContent="copy"},1200)})})})();As(Es);var au=Dn,lu={cms:Dn};return Rs(cu);})();

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

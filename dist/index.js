!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["axios-add-transforms"]=e():t["axios-add-transforms"]=e()}(this,(function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=1)}([
/*!************************************************!*\
  !*** ./node_modules/lodash.clonedeep/index.js ***!
  \************************************************/
/*! no static exports found */
/*! exports used: default */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(t,e,r){(function(t,r){var n=200,o="__lodash_hash_undefined__",c=9007199254740991,u="[object Arguments]",i="[object Boolean]",s="[object Date]",a="[object Function]",f="[object GeneratorFunction]",p="[object Map]",l="[object Number]",h="[object Object]",_="[object RegExp]",d="[object Set]",y="[object String]",b="[object Symbol]",v="[object ArrayBuffer]",g="[object DataView]",j="[object Float32Array]",m="[object Float64Array]",w="[object Int8Array]",x="[object Int16Array]",O="[object Int32Array]",A="[object Uint8Array]",P="[object Uint8ClampedArray]",I="[object Uint16Array]",S="[object Uint32Array]",M=/\w*$/,T=/^\[object .+?Constructor\]$/,k=/^(?:0|[1-9]\d*)$/,q={};q[u]=q["[object Array]"]=q[v]=q[g]=q[i]=q[s]=q[j]=q[m]=q[w]=q[x]=q[O]=q[p]=q[l]=q[h]=q[_]=q[d]=q[y]=q[b]=q[A]=q[P]=q[I]=q[S]=!0,q["[object Error]"]=q[a]=q["[object WeakMap]"]=!1;var R="object"==typeof t&&t&&t.Object===Object&&t,C="object"==typeof self&&self&&self.Object===Object&&self,$=R||C||Function("return this")(),E=e&&!e.nodeType&&e,F=E&&"object"==typeof r&&r&&!r.nodeType&&r,U=F&&F.exports===E;function B(t,e){return t.set(e[0],e[1]),t}function z(t,e){return t.add(e),t}function L(t,e,r,n){var o=-1,c=t?t.length:0;for(n&&c&&(r=t[++o]);++o<c;)r=e(r,t[o],o,t);return r}function W(t){var e=!1;if(null!=t&&"function"!=typeof t.toString)try{e=!!(t+"")}catch(t){}return e}function D(t){var e=-1,r=Array(t.size);return t.forEach((function(t,n){r[++e]=[n,t]})),r}function V(t,e){return function(r){return t(e(r))}}function G(t){var e=-1,r=Array(t.size);return t.forEach((function(t){r[++e]=t})),r}var K,N=Array.prototype,H=Function.prototype,J=Object.prototype,Q=$["__core-js_shared__"],X=(K=/[^.]+$/.exec(Q&&Q.keys&&Q.keys.IE_PROTO||""))?"Symbol(src)_1."+K:"",Y=H.toString,Z=J.hasOwnProperty,tt=J.toString,et=RegExp("^"+Y.call(Z).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),rt=U?$.Buffer:void 0,nt=$.Symbol,ot=$.Uint8Array,ct=V(Object.getPrototypeOf,Object),ut=Object.create,it=J.propertyIsEnumerable,st=N.splice,at=Object.getOwnPropertySymbols,ft=rt?rt.isBuffer:void 0,pt=V(Object.keys,Object),lt=Ft($,"DataView"),ht=Ft($,"Map"),_t=Ft($,"Promise"),dt=Ft($,"Set"),yt=Ft($,"WeakMap"),bt=Ft(Object,"create"),vt=Wt(lt),gt=Wt(ht),jt=Wt(_t),mt=Wt(dt),wt=Wt(yt),xt=nt?nt.prototype:void 0,Ot=xt?xt.valueOf:void 0;function At(t){var e=-1,r=t?t.length:0;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function Pt(t){var e=-1,r=t?t.length:0;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function It(t){var e=-1,r=t?t.length:0;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function St(t){this.__data__=new Pt(t)}function Mt(t,e){var r=Vt(t)||function(t){return function(t){return function(t){return!!t&&"object"==typeof t}(t)&&Gt(t)}(t)&&Z.call(t,"callee")&&(!it.call(t,"callee")||tt.call(t)==u)}(t)?function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n}(t.length,String):[],n=r.length,o=!!n;for(var c in t)!e&&!Z.call(t,c)||o&&("length"==c||zt(c,n))||r.push(c);return r}function Tt(t,e,r){var n=t[e];Z.call(t,e)&&Dt(n,r)&&(void 0!==r||e in t)||(t[e]=r)}function kt(t,e){for(var r=t.length;r--;)if(Dt(t[r][0],e))return r;return-1}function qt(t,e,r,n,o,c,T){var k;if(n&&(k=c?n(t,o,c,T):n(t)),void 0!==k)return k;if(!Ht(t))return t;var R=Vt(t);if(R){if(k=function(t){var e=t.length,r=t.constructor(e);e&&"string"==typeof t[0]&&Z.call(t,"index")&&(r.index=t.index,r.input=t.input);return r}(t),!e)return function(t,e){var r=-1,n=t.length;e||(e=Array(n));for(;++r<n;)e[r]=t[r];return e}(t,k)}else{var C=Bt(t),$=C==a||C==f;if(Kt(t))return function(t,e){if(e)return t.slice();var r=new t.constructor(t.length);return t.copy(r),r}(t,e);if(C==h||C==u||$&&!c){if(W(t))return c?t:{};if(k=function(t){return"function"!=typeof t.constructor||Lt(t)?{}:(e=ct(t),Ht(e)?ut(e):{});var e}($?{}:t),!e)return function(t,e){return $t(t,Ut(t),e)}(t,function(t,e){return t&&$t(e,Jt(e),t)}(k,t))}else{if(!q[C])return c?t:{};k=function(t,e,r,n){var o=t.constructor;switch(e){case v:return Ct(t);case i:case s:return new o(+t);case g:return function(t,e){var r=e?Ct(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.byteLength)}(t,n);case j:case m:case w:case x:case O:case A:case P:case I:case S:return function(t,e){var r=e?Ct(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.length)}(t,n);case p:return function(t,e,r){return L(e?r(D(t),!0):D(t),B,new t.constructor)}(t,n,r);case l:case y:return new o(t);case _:return function(t){var e=new t.constructor(t.source,M.exec(t));return e.lastIndex=t.lastIndex,e}(t);case d:return function(t,e,r){return L(e?r(G(t),!0):G(t),z,new t.constructor)}(t,n,r);case b:return c=t,Ot?Object(Ot.call(c)):{}}var c}(t,C,qt,e)}}T||(T=new St);var E=T.get(t);if(E)return E;if(T.set(t,k),!R)var F=r?function(t){return function(t,e,r){var n=e(t);return Vt(t)?n:function(t,e){for(var r=-1,n=e.length,o=t.length;++r<n;)t[o+r]=e[r];return t}(n,r(t))}(t,Jt,Ut)}(t):Jt(t);return function(t,e){for(var r=-1,n=t?t.length:0;++r<n&&!1!==e(t[r],r,t););}(F||t,(function(o,c){F&&(o=t[c=o]),Tt(k,c,qt(o,e,r,n,c,t,T))})),k}function Rt(t){return!(!Ht(t)||(e=t,X&&X in e))&&(Nt(t)||W(t)?et:T).test(Wt(t));var e}function Ct(t){var e=new t.constructor(t.byteLength);return new ot(e).set(new ot(t)),e}function $t(t,e,r,n){r||(r={});for(var o=-1,c=e.length;++o<c;){var u=e[o],i=n?n(r[u],t[u],u,r,t):void 0;Tt(r,u,void 0===i?t[u]:i)}return r}function Et(t,e){var r,n,o=t.__data__;return("string"==(n=typeof(r=e))||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==r:null===r)?o["string"==typeof e?"string":"hash"]:o.map}function Ft(t,e){var r=function(t,e){return null==t?void 0:t[e]}(t,e);return Rt(r)?r:void 0}At.prototype.clear=function(){this.__data__=bt?bt(null):{}},At.prototype.delete=function(t){return this.has(t)&&delete this.__data__[t]},At.prototype.get=function(t){var e=this.__data__;if(bt){var r=e[t];return r===o?void 0:r}return Z.call(e,t)?e[t]:void 0},At.prototype.has=function(t){var e=this.__data__;return bt?void 0!==e[t]:Z.call(e,t)},At.prototype.set=function(t,e){return this.__data__[t]=bt&&void 0===e?o:e,this},Pt.prototype.clear=function(){this.__data__=[]},Pt.prototype.delete=function(t){var e=this.__data__,r=kt(e,t);return!(r<0)&&(r==e.length-1?e.pop():st.call(e,r,1),!0)},Pt.prototype.get=function(t){var e=this.__data__,r=kt(e,t);return r<0?void 0:e[r][1]},Pt.prototype.has=function(t){return kt(this.__data__,t)>-1},Pt.prototype.set=function(t,e){var r=this.__data__,n=kt(r,t);return n<0?r.push([t,e]):r[n][1]=e,this},It.prototype.clear=function(){this.__data__={hash:new At,map:new(ht||Pt),string:new At}},It.prototype.delete=function(t){return Et(this,t).delete(t)},It.prototype.get=function(t){return Et(this,t).get(t)},It.prototype.has=function(t){return Et(this,t).has(t)},It.prototype.set=function(t,e){return Et(this,t).set(t,e),this},St.prototype.clear=function(){this.__data__=new Pt},St.prototype.delete=function(t){return this.__data__.delete(t)},St.prototype.get=function(t){return this.__data__.get(t)},St.prototype.has=function(t){return this.__data__.has(t)},St.prototype.set=function(t,e){var r=this.__data__;if(r instanceof Pt){var o=r.__data__;if(!ht||o.length<n-1)return o.push([t,e]),this;r=this.__data__=new It(o)}return r.set(t,e),this};var Ut=at?V(at,Object):function(){return[]},Bt=function(t){return tt.call(t)};function zt(t,e){return!!(e=null==e?c:e)&&("number"==typeof t||k.test(t))&&t>-1&&t%1==0&&t<e}function Lt(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||J)}function Wt(t){if(null!=t){try{return Y.call(t)}catch(t){}try{return t+""}catch(t){}}return""}function Dt(t,e){return t===e||t!=t&&e!=e}(lt&&Bt(new lt(new ArrayBuffer(1)))!=g||ht&&Bt(new ht)!=p||_t&&"[object Promise]"!=Bt(_t.resolve())||dt&&Bt(new dt)!=d||yt&&"[object WeakMap]"!=Bt(new yt))&&(Bt=function(t){var e=tt.call(t),r=e==h?t.constructor:void 0,n=r?Wt(r):void 0;if(n)switch(n){case vt:return g;case gt:return p;case jt:return"[object Promise]";case mt:return d;case wt:return"[object WeakMap]"}return e});var Vt=Array.isArray;function Gt(t){return null!=t&&function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=c}(t.length)&&!Nt(t)}var Kt=ft||function(){return!1};function Nt(t){var e=Ht(t)?tt.call(t):"";return e==a||e==f}function Ht(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function Jt(t){return Gt(t)?Mt(t):function(t){if(!Lt(t))return pt(t);var e=[];for(var r in Object(t))Z.call(t,r)&&"constructor"!=r&&e.push(r);return e}(t)}r.exports=function(t){return qt(t,!0,!0)}}).call(this,r(/*! ./../webpack/buildin/global.js */2),r(/*! ./../webpack/buildin/module.js */3)(t))},
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(t,e,r){t.exports=r(/*! ./src/index.ts */4)},
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(t){"object"==typeof window&&(r=window)}t.exports=r},
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},
/*!**********************************!*\
  !*** ./src/index.ts + 1 modules ***!
  \**********************************/
/*! exports provided: default, forEachPromise, mergeArrays, transFormRequest, transFormError, getMatchedMatchers, margeMatcher, createCacheKey */
/*! all exports used */
/*! ModuleConcatenation bailout: Cannot concat with ./node_modules/lodash.clonedeep/index.js (<- Module is not an ECMAScript module) */function(t,e,r){"use strict";r.r(e);var n=r(0),o=r.n(n);function c(t,e,...r){return t.reduce((t,e)=>t.then(t=>{const n=e(t,...r);return"function"==typeof n.then?n:Promise.resolve(n)}),Promise.resolve(e))}function u(t){return t.reduce((t,e)=>(Array.isArray(e)?t.push(...e):"object"==typeof e&&null!==e?t.push(...Object.keys(e).map(t=>e[t])):e&&t.push(e),t),[])}function i(t,e,r){return c(t,e,r)}function s(t,e,r,n){return c(t,e,r,n)}function a(t,e="/",r){const n=r&&r.toUpperCase();return t.reduce((t,r)=>{const{method:o,test:c}=r,u=o&&o.toUpperCase();let i=!1;return(i="ALL"===u||!o||!n||n===u)&&c.test(e)&&t.push(r),t},[])}function f(t){return t.reduce((t,e={})=>(t.request=u([t.request,e.request]),t.response=u([t.response,e.response]),t.error=u([t.error,e.error]),t),{request:[],response:[],error:[]})}function p(t,e){return`${e}>${t}`}r.d(e,"default",(function(){return l})),r.d(e,"forEachPromise",(function(){return c})),r.d(e,"mergeArrays",(function(){return u})),r.d(e,"transFormRequest",(function(){return i})),r.d(e,"transFormError",(function(){return s})),r.d(e,"getMatchedMatchers",(function(){return a})),r.d(e,"margeMatcher",(function(){return f})),r.d(e,"createCacheKey",(function(){return p}));class l{constructor(t={}){this._interceptorId=null,this._cache=new Map,this._options={...t}}get first(){return this._options.first}get final(){return this._options.final}get maxCache(){return this._options.maxCache}get context(){const{context:t=(()=>({}))}=this._options;return t()}get matchers(){const{matchers:t=[]}=this._options;return t}get margeResponse(){const{margeResponse:t}=this._options;return t}ejectTransform(t){return!!this._interceptorId&&(t.interceptors.request.eject(this._interceptorId.request),t.interceptors.response.eject(this._interceptorId.response),this._interceptorId=null,!0)}applyTransform(t){if(this._interceptorId)return this._interceptorId;const e=t.interceptors.request.use(this._requestInterceptors()),r=t.interceptors.response.use(t=>t,this._errorInterceptors(t));return this._interceptorId={request:e,response:r},this._interceptorId}addInterceptors(t){return this.applyTransform(t),t}_getResponseTransforms(t){const{margeResponse:e,context:r}=this,{url:n,method:o}=t,c=this._getTransformSet(n,o),i=[];return"front"===e?i.push(c.response,t.transformResponse):"back"===e?i.push(t.transformResponse,c.response):i.push(c.response),u(i).map(e=>n=>e(n,r,t))}_errorInterceptors(t){return async e=>{const{config:r}=e;if(!r)throw e;const n=r.__config;if(!n)throw e;let o=r.__status;o||(o={originalConfig:n},r.__status=o);const{url:c,method:u}=n,i=this._getTransformSet(c,u),a=await s(i.error,e,this.context,o);return o.retry||a.retry?Promise.resolve().then(()=>t(n)):Promise.reject(a)}}_requestInterceptors(){return async t=>{const{context:e}=this,r=t.__config||t,{url:n,method:c}=r;t.__config||(t.__config={...t,__config:null,method:o()(t.method),data:o()(t.data),headers:o()(t.headers),params:o()(t.params),auth:o()(t.auth),proxy:o()(t.proxy)});const u=this._getTransformSet(n,c),s=await i(u.request,{...r},e);return s.transformResponse=this._getResponseTransforms({...r}),s}}_saveCache(t,e,r){const{maxCache:n,_cache:o}=this,c=p(t,e);let u=o.get(c);return u||(u=r(),o.set(c,u),n&&o.size>0&&n<=o.size&&o.delete(o.keys()[0])),u}_getTransformSet(t="/",e="all"){return this._saveCache(t,e,()=>{const{matchers:r,final:n,first:o}=this;let c=f(a(r,t,e).map(({transform:t})=>t));return o&&(c=f([o,c])),n&&(c=f([c,n])),c})}}}])}));
//# sourceMappingURL=index.js.map
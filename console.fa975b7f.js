parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"njgK":[function(require,module,exports) {
var e={resolve:function(e,t){var n=e.resolveString||e.element.getAttribute("data-target-resolver");function r(e){return e[(t=0,n=e.length-1,Math.floor(Math.random()*(n-t+1))+t)];var t,n}!function e(t,n){var o=t.resolveString,i=(t.characters,t.offset),a=o.substring(0,i);!function e(t,n){var o=t.characters,i=(t.timeout,t.element),a=t.partialString,s=t.iterations;setTimeout(function(){if(s>=0){var c=Object.assign({},t,{iterations:s-1});i.textContent=0===s?a:a.substring(0,a.length-1)+r(o),e(c,n)}else"function"==typeof n&&n()},t.timeout)}(Object.assign({},t,{partialString:a}),function(){var r=Object.assign({},t,{offset:i+1});i<=o.length?e(r,n):"function"==typeof n&&n()})}(Object.assign({},e,{resolveString:n}),t)}},t=["adventurer","computer scientist","cyber security engineer","blockchain engineer","software engineer","leader","entrepreneur","collaborator","fellow human","alec wantoch"],n=0,r={offset:0,timeout:5,iterations:10,characters:["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","x","#","%","&","-","+","_","?","/","\\","="],resolveString:t[n],element:document.querySelector("[data-target-resolver]")};function o(){setTimeout(function(){++n>=t.length&&(n=0);var i=Object.assign({},r,{resolveString:t[n]});e.resolve(i,o)},1e3)}$(function(){setTimeout(function(){$("body").removeClass("fade-out"),$("html").css("background-color","white"),setTimeout(function(){e.resolve(r,o)},2e3)},1e3)});
},{}]},{},["njgK"], null)
//# sourceMappingURL=/console.fa975b7f.js.map
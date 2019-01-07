/*
 * Crypto-JS v2.4.0
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2011, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
if(typeof Crypto=="undefined"||!Crypto.util)(function(){var h=window.Crypto={},n=h.util={rotl:function(a,c){return a<<c|a>>>32-c},rotr:function(a,c){return a<<32-c|a>>>c},endian:function(a){if(a.constructor==Number)return n.rotl(a,8)&16711935|n.rotl(a,24)&4278255360;for(var c=0;c<a.length;c++)a[c]=n.endian(a[c]);return a},randomBytes:function(a){for(var c=[];a>0;a--)c.push(Math.floor(Math.random()*256));return c},bytesToWords:function(a){for(var c=[],b=0,f=0;b<a.length;b++,f+=8)c[f>>>5]|=a[b]<<24-
f%32;return c},wordsToBytes:function(a){for(var c=[],b=0;b<a.length*32;b+=8)c.push(a[b>>>5]>>>24-b%32&255);return c},bytesToHex:function(a){for(var c=[],b=0;b<a.length;b++){c.push((a[b]>>>4).toString(16));c.push((a[b]&15).toString(16))}return c.join("")},hexToBytes:function(a){for(var c=[],b=0;b<a.length;b+=2)c.push(parseInt(a.substr(b,2),16));return c},bytesToBase64:function(a){if(typeof btoa=="function")return btoa(l.bytesToString(a));for(var c=[],b=0;b<a.length;b+=3)for(var f=a[b]<<16|a[b+1]<<
8|a[b+2],d=0;d<4;d++)b*8+d*6<=a.length*8?c.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(f>>>6*(3-d)&63)):c.push("=");return c.join("")},base64ToBytes:function(a){if(typeof atob=="function")return l.stringToBytes(atob(a));a=a.replace(/[^A-Z0-9+\/]/ig,"");for(var c=[],b=0,f=0;b<a.length;f=++b%4)f!=0&&c.push(("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(b-1))&Math.pow(2,-2*f+8)-1)<<f*2|"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(b))>>>
6-f*2);return c}};h=h.charenc={};h.UTF8={stringToBytes:function(a){return l.stringToBytes(unescape(encodeURIComponent(a)))},bytesToString:function(a){return decodeURIComponent(escape(l.bytesToString(a)))}};var l=h.Binary={stringToBytes:function(a){for(var c=[],b=0;b<a.length;b++)c.push(a.charCodeAt(b)&255);return c},bytesToString:function(a){for(var c=[],b=0;b<a.length;b++)c.push(String.fromCharCode(a[b]));return c.join("")}}})();
(function(){var h=Crypto,n=h.util,l=h.charenc,a=l.UTF8,c=l.Binary,b=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,
2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],f=h.SHA256=function(d,g){var e=n.wordsToBytes(f._sha256(d));return g&&g.asBytes?e:g&&g.asString?c.bytesToString(e):n.bytesToHex(e)};f._sha256=function(d){if(d.constructor==String)d=a.stringToBytes(d);var g=n.bytesToWords(d),e=d.length*8;d=[1779033703,3144134277,
1013904242,2773480762,1359893119,2600822924,528734635,1541459225];var j=[],p,q,t,k,r,s,u,v,i,o,m;g[e>>5]|=128<<24-e%32;g[(e+64>>9<<4)+15]=e;for(v=0;v<g.length;v+=16){e=d[0];p=d[1];q=d[2];t=d[3];k=d[4];r=d[5];s=d[6];u=d[7];for(i=0;i<64;i++){if(i<16)j[i]=g[i+v];else{o=j[i-15];m=j[i-2];j[i]=((o<<25|o>>>7)^(o<<14|o>>>18)^o>>>3)+(j[i-7]>>>0)+((m<<15|m>>>17)^(m<<13|m>>>19)^m>>>10)+(j[i-16]>>>0)}m=e&p^e&q^p&q;var w=(e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22);o=(u>>>0)+((k<<26|k>>>6)^(k<<21|k>>>11)^(k<<7|
k>>>25))+(k&r^~k&s)+b[i]+(j[i]>>>0);m=w+m;u=s;s=r;r=k;k=t+o;t=q;q=p;p=e;e=o+m}d[0]+=e;d[1]+=p;d[2]+=q;d[3]+=t;d[4]+=k;d[5]+=r;d[6]+=s;d[7]+=u}return d};f._blocksize=16;f._digestsize=32})();
(function(){var h=Crypto,n=h.util,l=h.charenc,a=l.UTF8,c=l.Binary;h.HMAC=function(b,f,d,g){if(f.constructor==String)f=a.stringToBytes(f);if(d.constructor==String)d=a.stringToBytes(d);if(d.length>b._blocksize*4)d=b(d,{asBytes:true});var e=d.slice(0);d=d.slice(0);for(var j=0;j<b._blocksize*4;j++){e[j]^=92;d[j]^=54}b=b(e.concat(b(d.concat(f),{asBytes:true})),{asBytes:true});return g&&g.asBytes?b:g&&g.asString?c.bytesToString(b):n.bytesToHex(b)}})();

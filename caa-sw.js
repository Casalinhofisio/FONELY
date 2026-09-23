const CACHE='fonely-caa-shell-v2';
const SHELL=['./caa.html','./caa-public.css?v=3','./caa-public.js?v=4','./fonely-caa-library.js?v=2','./fonely-caa-speech.js?v=2','./fonely-icon.svg','./caa-manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fonely-caa-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.endsWith('/caa.html')){e.respondWith(fetch(e.request).catch(()=>caches.match('./caa.html')));return;}
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})));
});
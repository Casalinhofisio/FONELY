const CACHE='fonely-caa-shell-v9';
const SHELL=['./caa.html','./caa-public.css?v=7','./caa-public.js?v=10','./fonely-caa-library.js?v=5','./fonely-caa-speech.js?v=4','./fonely-icon.svg','./caa-manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fonely-caa-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin){
   if(/raw\.githubusercontent\.com$/i.test(u.hostname)||/static\.arasaac\.org$/i.test(u.hostname)){
     e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request,{mode:'no-cors'}).then(r=>{const copy=r.clone();caches.open('fonely-caa-images-v1').then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request))));
   }
   return;
 }
 if(u.pathname.endsWith('/caa.html')){e.respondWith(fetch(e.request).catch(()=>caches.match('./caa.html')));return;}
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})));
});
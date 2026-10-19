const CACHE='study-planner-v3';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const url=new URL(r.url);
  if(url.hostname==='accounts.google.com')return;
  const page=r.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/');
  if(page){
    e.respondWith(
      fetch(r).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(r,copy));
        return res;
      }).catch(()=>caches.match(r).then(m=>m||caches.match('index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(r).then(m=>m||fetch(r).then(res=>{
      if(res.ok||res.type==='opaque'){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(r,copy));
      }
      return res;
    }).catch(()=>m))
  );
});

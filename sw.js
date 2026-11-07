// 画面ファイルを端末に保存して、電波がなくても開けるようにする。
// 内容を更新して公開し直したときは、下の VERSION の数字を上げてください。
const VERSION = "v11";
const CACHE = "sleeplog-" + VERSION;
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("sleeplog-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// まず保存済みを返し、裏で最新を取り直す（次回の起動から更新が反映される）
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

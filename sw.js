{\rtf1\ansi\ansicpg1251\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const CACHE_NAME = "recipes-pwa-v1";\
const ASSETS = [\
  "./",\
  "./index.html",\
  "./styles.css",\
  "./app.js",\
  "./manifest.json",\
  "./icon.svg"\
];\
\
self.addEventListener("install", (event) => \{\
  event.waitUntil(\
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())\
  );\
\});\
\
self.addEventListener("activate", (event) => \{\
  event.waitUntil(\
    caches.keys().then(keys => Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))))\
      .then(() => self.clients.claim())\
  );\
\});\
\
self.addEventListener("fetch", (event) => \{\
  const req = event.request;\
  const url = new URL(req.url);\
\
  // \uc0\u1044 \u1083 \u1103  CSV/PapaParse \'97 \u1087 \u1088 \u1086 \u1087 \u1091 \u1089 \u1082 \u1072 \u1077 \u1084  \u1095 \u1077 \u1088 \u1077 \u1079  \u1089 \u1077 \u1090 \u1100  (\u1072  \u1077 \u1089 \u1083 \u1080  \u1089 \u1077 \u1090 \u1080  \u1085 \u1077 \u1090 , \u1073 \u1091 \u1076 \u1077 \u1090  fallback \u1085 \u1072  \u1082 \u1101 \u1096  \u1074  localStorage)\
  if (url.searchParams.get("output") === "csv") \{\
    event.respondWith(fetch(req).catch(() => caches.match(req)));\
    return;\
  \}\
\
  event.respondWith(\
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => \{\
      const copy = resp.clone();\
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));\
      return resp;\
    \}).catch(() => cached))\
  );\
\});\
}

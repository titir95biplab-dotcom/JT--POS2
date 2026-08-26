// Import Firebase libraries for Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// 1. Initialize Firebase — Juice Therapy Majherhati project
firebase.initializeApp({
    apiKey: "AIzaSyDaBliTCScl1DyMc1h96Pe6_79lKWyB-VQ",
    authDomain: "pos-majherhati.firebaseapp.com",
    projectId: "pos-majherhati",
    storageBucket: "pos-majherhati.firebasestorage.app",
    messagingSenderId: "245807455645",
    appId: "1:245807455645:web:3a27d443062a60ae8fe374"
});

// Where a tapped notification should open this outlet's app.
const APP_URL = "https://titir95biplab-dotcom.github.io/JT--POS2/";

// 2. Initialize Messaging
const messaging = firebase.messaging();

// 3. Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const n = payload.notification || {};
  const notificationTitle = n.title;
  const notificationOptions = {
    body: n.body,
    icon: '/logo.png',
    badge: '/logo.png',
    image: n.image || undefined,
    // Same tag => a new broadcast replaces the previous one instead of stacking.
    tag: 'jt-broadcast',
    renotify: true,
    // Where a tap should take the customer. fcmOptions.link from the Cloud
    // Function lands here; APP_URL is the fallback.
    data: { url: (payload.fcmOptions && payload.fcmOptions.link) || APP_URL }
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Without this, tapping the notification does nothing. Focus an open tab if
// there is one, otherwise open the app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || APP_URL;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.indexOf(APP_URL) === 0 && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});


// ── PWA CACHING ──────────────────────────────────────────
// Bump CACHE_NAME on every deploy so installed devices pick up the new build.
// Every entry below must actually exist: cache.addAll() rejects as a whole if a
// single URL 404s, which silently kills offline caching. ('./kot.html' used to be
// listed here and does not exist — the KOT app is a separate Firebase Hosting
// deployment under 'kot app/'.)
const CACHE_NAME = 'jt-majherhati-pos-v19';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

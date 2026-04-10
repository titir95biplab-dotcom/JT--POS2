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

// 2. Initialize Messaging
const messaging = firebase.messaging();

// 3. Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    image: payload.notification.image || null
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});


// ── PWA CACHING ──────────────────────────────────────────
const CACHE_NAME = 'jt-majherhati-pos-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './kot.html',
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

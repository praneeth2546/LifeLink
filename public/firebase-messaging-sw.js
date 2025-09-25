/* global self */
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self?.VITE_FIREBASE_API_KEY,
  authDomain: self?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: self?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: self?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: self?.VITE_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'LifeLink';
  const notificationOptions = {
    body: payload.notification?.body || 'Background notification',
    icon: '/icons/icon-192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

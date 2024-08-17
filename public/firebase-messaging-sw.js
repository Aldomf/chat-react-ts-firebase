/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDUK58BuZbz-TizjJq5uA7-Vh7h440CSAE",
    authDomain: "chat-react-ts-cf958.firebaseapp.com",
    projectId: "chat-react-ts-cf958",
    storageBucket: "chat-react-ts-cf958.appspot.com",
    messagingSenderId: "415842986892",
    appId: "1:415842986892:web:4e1514889d85c848cb04a9"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Only show notification if the app is not in the foreground
    if (Notification.permission === 'granted' && !document.hasFocus()) {
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/profile-dog.jpg'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Close the notification

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // If the app is already open, focus on it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If the app is not open, open it in a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

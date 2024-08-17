import { useEffect } from "react";
import { useSigninCheck } from "reactfire";
import ChatLayout from "./chat-layout";
import FormLayout from "./form-layout";
import useRequestNotificationPermission from "@/hooks/useRequestNotificationPermission";
import { getMessaging, onMessage } from "firebase/messaging";

// Define a type for the notification payload
interface CustomNotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
}

// Function to handle incoming messages
const handleForegroundMessage = (payload: CustomNotificationPayload) => {
  console.log('Message received. ', payload);
  const notificationTitle = payload.notification?.title || 'New message';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/profile-dog.jpg',
  };

  // Avoid triggering another notification if already handled
  if (document.visibilityState === 'visible') {
    new Notification(notificationTitle, notificationOptions);
  }
};

function RootLayout() {
  useRequestNotificationPermission();

  const { status, data: useSigninCheckResult } = useSigninCheck();
  const messaging = getMessaging();  // Initialize Firebase messaging

  useEffect(() => {
    console.log('Registering service worker...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    if (messaging) {
      const unsubscribe = onMessage(messaging, handleForegroundMessage);

      return () => {
        // Cleanup the subscription when component unmounts
        if (unsubscribe) unsubscribe();
      };
    }
  }, [messaging]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <div>{useSigninCheckResult.signedIn ? <ChatLayout /> : <FormLayout />}</div>;
}

export default RootLayout;

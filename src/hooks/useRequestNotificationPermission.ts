import { useEffect } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from "reactfire";

function useRequestNotificationPermission() {
  const db = getFirestore();
  const auth = useAuth();

  function saveTokenToDatabase(token: string) {
    const userId = auth.currentUser?.uid;

    if (userId) {
        console.log("userId", userId)
      const userRef = doc(db, "users", userId);
      setDoc(userRef, { fcmToken: token }, { merge: true })
        .then(() => console.log("FCM Token saved to database."))
        .catch((err) => console.log("Error saving FCM Token:", err));
    }
  }

  useEffect(() => {
    const messaging = getMessaging();
    console.log("heyyyy")

    // Request permission to send notifications
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");

        getToken(messaging, {
          vapidKey: "BKTQzPLH7O2eK_CbClIC2yF2e7XDGXufP55AjoH4NJbuMTpAODwtPQYX_Z-aJtakLULMd0HN4Yh9tHF7Q5Pm3NY",
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log("FCM Token:", currentToken);
              saveTokenToDatabase(currentToken); // Call the function here
            } else {
              console.log("No registration token available.");
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
          });
      } else {
        console.log("Unable to get permission to notify.");
      }
    });
  }, [auth, db]); // Ensure dependencies are included

}

export default useRequestNotificationPermission;
import { useEffect } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "reactfire";

function useRequestNotificationPermission() {
    const db = getFirestore();
    const { data: user } = useUser(); // Use useUser to get the authenticated user
  
    async function saveTokenToDatabase(token: string) {
      const userId = user?.uid;
      // console.log("saveTokenToDatabase function executed");
      // console.log("userId", userId);
  
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        // console.log("Found the userId");
  
        if (!userDoc.exists() || userDoc.data()?.fcmToken !== token) {
          // console.log("Saving token...");
          await setDoc(userRef, { fcmToken: token }, { merge: true })
            .then(() => console.log("FCM Token saved to database."))
            .catch((err) => console.log("Error saving FCM Token:", err));
        }
      }
    }
  
    useEffect(() => {
      // console.log("useRequestNotificationPermission hook executed");
      const messaging = getMessaging();
  
      Notification.requestPermission().then((permission) => {
        // console.log("Notification permission status:", permission);
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey:
              "BKTQzPLH7O2eK_CbClIC2yF2e7XDGXufP55AjoH4NJbuMTpAODwtPQYX_Z-aJtakLULMd0HN4Yh9tHF7Q5Pm3NY",
          })
            .then((currentToken) => {
              if (currentToken) {
                saveTokenToDatabase(currentToken);
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
    }, [user, db]);
  }
  
  export default useRequestNotificationPermission;

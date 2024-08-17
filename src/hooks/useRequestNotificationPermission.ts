import { useEffect } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "reactfire";

function useRequestNotificationPermission() {
    const db = getFirestore();
    const auth = useAuth();
  
    async function saveTokenToDatabase(token: string) {
        const userId = auth.currentUser?.uid;
      
        if (userId) {
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);
      
          // Check if the token is already stored
          if (!userDoc.exists() || userDoc.data()?.fcmToken !== token) {
            await setDoc(userRef, { fcmToken: token }, { merge: true })
              .then(() => console.log("FCM Token saved to database."))
              .catch((err) => console.log("Error saving FCM Token:", err));
          }
        }
      }
  
    useEffect(() => {
      const messaging = getMessaging();
  
      // Request permission to send notifications
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey: "BKTQzPLH7O2eK_CbClIC2yF2e7XDGXufP55AjoH4NJbuMTpAODwtPQYX_Z-aJtakLULMd0HN4Yh9tHF7Q5Pm3NY",
          })
            .then((currentToken) => {
              if (currentToken) {
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
    }, [auth, db]);
  
  }
  
  export default useRequestNotificationPermission;
import { useEffect } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

const UserStatus = () => {
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const user = auth.currentUser;
    const userDocRef = user ? doc(db, 'users', user.uid) : null;

    if (userDocRef) {
      // Function to set user online status
      const setUserOnline = async () => {
        await updateDoc(userDocRef, {
          isOnline: true,
          lastActive: Timestamp.now(),
        });
      };

      // Function to set user offline status
      const setUserOffline = async () => {
        await updateDoc(userDocRef, {
          isOnline: false,
          lastActive: Timestamp.now(),
        });
      };

      // Set user as online when the component mounts
      setUserOnline();

      // Event listener for beforeunload (when the user closes or reloads the page)
      const handleBeforeUnload = () => {
        setUserOffline();
      };

      // Event listener for visibilitychange (when the user switches tabs or minimizes the browser)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          setUserOffline();
        } else {
          setUserOnline();
        }
      };

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup listeners on component unmount
      return () => {
        if (userDocRef) {
          setUserOffline();
        }
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [auth, db]);

  return null; // No UI needed for this component
};

export default UserStatus;

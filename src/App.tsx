import {
  AuthProvider,
  FirestoreProvider,
  StorageProvider,
  useFirebaseApp,
} from "reactfire";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import RootLayout from "./layouts/root-layout";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const app = useFirebaseApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  return (
    <FirestoreProvider sdk={db}>
      <AuthProvider sdk={auth}>
        <StorageProvider sdk={storage}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <RootLayout />
          </ThemeProvider>
        </StorageProvider>
      </AuthProvider>
    </FirestoreProvider>
  );
}

export default App;

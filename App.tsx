import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConversationsScreen } from "./src/screens/ConversationsScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { AuthUser } from "./src/types/auth";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {user ? (
        <ConversationsScreen currentUser={user} onLogout={() => setUser(null)} />
      ) : (
        <LoginScreen onLoginSuccess={setUser} />
      )}
    </SafeAreaProvider>
  );
}

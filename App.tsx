import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { registerPushTokenForUser } from "./src/api/notificationsApi";
import { ConversationsScreen } from "./src/screens/ConversationsScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { clearSession, getStoredSession, saveSession } from "./src/storage/sessionStorage";
import { colors } from "./src/theme/colors";
import { AuthUser } from "./src/types/auth";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);

  useEffect(() => {
    getStoredSession()
      .then((storedUser) => {
        if (storedUser) {
          setUser(storedUser);
          registerPushTokenForUser(storedUser).catch((error) => {
            console.warn("No fue posible registrar el token de notificaciones.", error);
          });
        }
      })
      .finally(() => setRestoringSession(false));
  }, []);

  const handleLoginSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    saveSession(authUser).catch((error) => {
      console.warn("No fue posible guardar la sesión.", error);
    });
    registerPushTokenForUser(authUser).catch((error) => {
      console.warn("No fue posible registrar el token de notificaciones.", error);
    });
  };

  const handleLogout = () => {
    setUser(null);
    clearSession().catch((error) => {
      console.warn("No fue posible limpiar la sesión.", error);
    });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {restoringSession ? (
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : user ? (
        <ConversationsScreen currentUser={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  }
});

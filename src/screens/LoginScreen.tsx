import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginWithCredentials } from "../api/authApi";
import { colors } from "../theme/colors";
import { AuthUser } from "../types/auth";

type LoginScreenProps = {
  onLoginSuccess: (user: AuthUser) => void;
};

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [usuario, setUsuario] = useState("");
  const [llave, setLlave] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitLogin = async () => {
    const cleanUser = usuario.trim();
    const cleanPassword = llave.trim();

    if (!cleanUser || !cleanPassword) {
      Alert.alert("Datos incompletos", "Escribe tu usuario y contraseña para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginWithCredentials({
        usuario: cleanUser,
        llave: cleanPassword
      });

      if (response.res === "ok" && response.data) {
        onLoginSuccess(response.data);
        return;
      }

      Alert.alert("Acceso denegado", response.msg || "Usuario o contraseña incorrectos.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al iniciar sesión.";
      Alert.alert("No se pudo iniciar sesión", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>GESB Comunicación</Text>
          <Text style={styles.subtitle}>Accede con tus datos de usuario</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Usuario</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={19} color={colors.textMuted} />
              <TextInput
                accessibilityLabel="Usuario"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onChangeText={setUsuario}
                placeholder="Nombre de usuario"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                style={styles.input}
                value={usuario}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
              <TextInput
                accessibilityLabel="Contraseña"
                editable={!loading}
                onChangeText={setLlave}
                onSubmitEditing={submitLogin}
                placeholder="Contraseña"
                placeholderTextColor={colors.textMuted}
                returnKeyType="go"
                secureTextEntry={!passwordVisible}
                style={styles.input}
                value={llave}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={loading}
                onPress={() => setPasswordVisible((visible) => !visible)}
                style={styles.visibilityButton}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            disabled={loading}
            onPress={submitLogin}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && !loading && styles.buttonPressed,
              loading && styles.buttonDisabled
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={19} color={colors.accentText} />
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: colors.surface
  },
  header: {
    marginBottom: 26
  },
  title: {
    color: colors.textStrong,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32
  },
  subtitle: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 19
  },
  form: {
    gap: 17
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  inputBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 15
  },
  visibilityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  loginButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: colors.accent
  },
  loginButtonText: {
    color: colors.accentText,
    fontSize: 14,
    fontWeight: "800"
  },
  buttonPressed: {
    opacity: 0.82
  },
  buttonDisabled: {
    opacity: 0.72
  }
});

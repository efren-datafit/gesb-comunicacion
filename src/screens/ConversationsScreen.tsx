import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserConversations } from "../api/chatsApi";
import { ConversationCard } from "../components/ConversationCard";
import { colors } from "../theme/colors";
import { AuthUser } from "../types/auth";
import { Conversation } from "../types/conversation";

type ConversationsScreenProps = {
  currentUser: AuthUser;
  onLogout: () => void;
};

export function ConversationsScreen({ currentUser, onLogout }: ConversationsScreenProps) {
  const [searchText, setSearchText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadConversations = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage(null);

      try {
        const userConversations = await getUserConversations(currentUser.idus);
        setConversations(userConversations);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No fue posible cargar las conversaciones.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUser.idus]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.recipientName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
      );
    });
  }, [searchText]);

  const openConversation = (conversation: Conversation) => {
    Alert.alert("Conversación", `Abrir conversación con ${conversation.recipientName}.`);
  };

  const openProfile = () => {
    Alert.alert(currentUser.nombre, `${currentUser.email}\nCampus: ${currentUser.campus}`, [
      { text: "Cerrar sesión", style: "destructive", onPress: onLogout },
      { text: "Aceptar" }
    ]);
  };

  const startConversation = () => {
    Alert.alert("Iniciar conversación", "Buscar usuarios en la base de datos.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>GESB Comunicación</Text>
            <Text numberOfLines={1} style={styles.userName}>
              {currentUser.nombre}
            </Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              accessibilityLabel="Buscar conversaciones"
              placeholder="Buscar"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          onRefresh={() => loadConversations(true)}
          refreshing={refreshing}
          renderItem={({ item, index }) => (
            <ConversationCard conversation={item} index={index} onPress={openConversation} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{getEmptyTitle(loading, errorMessage)}</Text>
              <Text style={styles.emptyText}>
                {getEmptyText(loading, errorMessage, searchText)}
              </Text>
              {errorMessage ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reintentar carga de conversaciones"
                  onPress={() => loadConversations()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
                >
                  <Ionicons name="refresh-outline" size={18} color={colors.accentText} />
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            onPress={openProfile}
            style={({ pressed }) => [styles.navButton, pressed && styles.buttonPressed]}
          >
            <Ionicons name="person-outline" size={18} color={colors.text} />
            <Text style={styles.navButtonText}>Perfil</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Iniciar conversación"
            onPress={startConversation}
            style={({ pressed }) => [
              styles.navButton,
              styles.primaryButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.accentText} />
            <Text style={styles.primaryButtonText}>Iniciar conversación</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getEmptyTitle(loading: boolean, errorMessage: string | null): string {
  if (loading) {
    return "Cargando conversaciones";
  }

  if (errorMessage) {
    return "No se pudieron cargar";
  }

  return "Sin resultados";
}

function getEmptyText(
  loading: boolean,
  errorMessage: string | null,
  searchText: string
): string {
  if (loading) {
    return "Estamos consultando tus conversaciones disponibles.";
  }

  if (errorMessage) {
    return errorMessage;
  }

  if (searchText.trim()) {
    return "No encontramos conversaciones con ese texto.";
  }

  return "No hay conversaciones disponibles para este usuario.";
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 17,
    backgroundColor: colors.header
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24
  },
  userName: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 16
  },
  searchBox: {
    width: 122,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ead8bd",
    borderRadius: 8,
    backgroundColor: colors.card
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: colors.text,
    fontSize: 12
  },
  listContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    padding: 24
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  emptyText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center"
  },
  retryButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.accent
  },
  retryButtonText: {
    color: colors.accentText,
    fontSize: 12,
    fontWeight: "700"
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 18,
    backgroundColor: colors.header
  },
  navButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.card
  },
  primaryButton: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  buttonPressed: {
    opacity: 0.78
  },
  navButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },
  primaryButtonText: {
    color: colors.accentText,
    fontSize: 12,
    fontWeight: "700"
  }
});

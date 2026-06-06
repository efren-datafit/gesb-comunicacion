import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getChatMessages, notifyChatRecipient, sendChatMessage } from "../api/chatsApi";
import { colors } from "../theme/colors";
import { AuthUser } from "../types/auth";
import { ChatMessage, Conversation } from "../types/conversation";

const MESSAGES_REFRESH_INTERVAL_MS = 5000;

type ChatMessagesScreenProps = {
  conversation: Conversation;
  currentUser: AuthUser;
  onBack: () => void;
};

export function ChatMessagesScreen({
  conversation,
  currentUser,
  onBack
}: ChatMessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const loadMessages = useCallback(
    async (refresh = false, silent = false) => {
      if (refresh) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }

      if (!silent) {
        setErrorMessage(null);
      }

      try {
        const chatMessages = await getChatMessages(conversation.id);
        setMessages(chatMessages);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No fue posible cargar los mensajes.";
        if (!silent) {
          setErrorMessage(message);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    [conversation.id]
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadMessages(false, true);
    }, MESSAGES_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const sortedMessages = useMemo(() => messages, [messages]);
  const composerLift = Math.max(keyboardHeight - insets.bottom, 0);

  const sendMessage = async () => {
    const cleanText = messageText.trim();

    if (!cleanText || sending) {
      return;
    }

    setSending(true);

    try {
      await sendChatMessage({
        idchat: conversation.id,
        idus: currentUser.idus,
        usuario: currentUser.nombre,
        tipo: "TEXTO",
        msg: cleanText
      });

      let notificationErrorMessage: string | null = null;

      try {
        await notifyChatRecipient(conversation.id, cleanText);
      } catch (error) {
        notificationErrorMessage =
          error instanceof Error
            ? `Mensaje enviado, pero ${error.message.toLowerCase()}`
            : "Mensaje enviado, pero no fue posible enviar la notificación.";
      }

      setMessageText("");
      await loadMessages(true);

      if (notificationErrorMessage) {
        setErrorMessage(notificationErrorMessage);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No fue posible enviar el mensaje.";
      setErrorMessage(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Regresar a conversaciones"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.headerTitleBlock}>
            <Text numberOfLines={1} style={styles.areaTitle}>
              {conversation.area || "Conversación"}
            </Text>
            <Text numberOfLines={1} style={styles.senderName}>
              {conversation.recipientName}
            </Text>
          </View>
        </View>

        <FlatList
          contentContainerStyle={styles.messagesContent}
          data={sortedMessages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          onRefresh={() => loadMessages(true)}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <MessageBubble message={item} currentUserName={currentUser.nombre} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {loading ? <ActivityIndicator color={colors.accent} /> : null}
              <Text style={styles.emptyTitle}>{getEmptyTitle(loading, errorMessage)}</Text>
              <Text style={styles.emptyText}>{getEmptyText(loading, errorMessage)}</Text>
              {errorMessage ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reintentar carga de mensajes"
                  onPress={() => loadMessages()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
                >
                  <Ionicons name="refresh-outline" size={18} color={colors.accentText} />
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />

        <View style={[styles.composer, { marginBottom: composerLift }]}>
          <TextInput
            accessibilityLabel="Escribir nuevo mensaje"
            multiline
            onChangeText={setMessageText}
            placeholder="Escribir mensaje"
            placeholderTextColor={colors.textMuted}
            style={styles.messageInput}
            value={messageText}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensaje"
            disabled={sending || !messageText.trim()}
            onPress={sendMessage}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.buttonPressed,
              (sending || !messageText.trim()) && styles.sendButtonDisabled
            ]}
          >
            {sending ? (
              <ActivityIndicator color={colors.accentText} size="small" />
            ) : (
              <Ionicons name="send" size={18} color={colors.accentText} />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

type MessageBubbleProps = {
  message: ChatMessage;
  currentUserName: string;
};

function MessageBubble({ message, currentUserName }: MessageBubbleProps) {
  const outgoing = namesMatch(message.senderName, currentUserName);

  return (
    <View style={[styles.messageRow, outgoing ? styles.outgoingRow : styles.incomingRow]}>
      <View style={[styles.bubble, outgoing ? styles.outgoingBubble : styles.incomingBubble]}>
        <Text style={[styles.messageText, outgoing && styles.outgoingText]}>{message.text}</Text>
        <Text style={[styles.messageDate, outgoing && styles.outgoingDate]}>
          {message.sentAtLabel}
        </Text>
      </View>
    </View>
  );
}

function namesMatch(left: string, right: string): boolean {
  return normalizeName(left) === normalizeName(right);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function getEmptyTitle(loading: boolean, errorMessage: string | null): string {
  if (loading) {
    return "Cargando mensajes";
  }

  if (errorMessage) {
    return "No se pudieron cargar";
  }

  return "Sin mensajes";
}

function getEmptyText(loading: boolean, errorMessage: string | null): string {
  if (loading) {
    return "Estamos consultando esta conversación.";
  }

  if (errorMessage) {
    return errorMessage;
  }

  return "Todavía no hay mensajes en esta conversación.";
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
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.header
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.card
  },
  headerTitleBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end"
  },
  areaTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "right"
  },
  senderName: {
    marginTop: 3,
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "right"
  },
  messagesContent: {
    flexGrow: 1,
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 18
  },
  messageRow: {
    width: "100%",
    flexDirection: "row"
  },
  incomingRow: {
    justifyContent: "flex-start"
  },
  outgoingRow: {
    justifyContent: "flex-end"
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 8
  },
  incomingBubble: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  outgoingBubble: {
    backgroundColor: colors.accent
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19
  },
  outgoingText: {
    color: colors.accentText
  },
  messageDate: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 12,
    textAlign: "right"
  },
  outgoingDate: {
    color: "rgba(255,255,255,0.72)"
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
    padding: 24
  },
  emptyTitle: {
    marginTop: 10,
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
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 14, android: 18, default: 14 }),
    backgroundColor: colors.header
  },
  messageInput: {
    flex: 1,
    maxHeight: 112,
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 14,
    lineHeight: 19
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.accent
  },
  sendButtonDisabled: {
    opacity: 0.48
  },
  buttonPressed: {
    opacity: 0.78
  }
});

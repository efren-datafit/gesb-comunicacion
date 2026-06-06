import { Pressable, StyleSheet, Text, View } from "react-native";
import { Conversation } from "../types/conversation";
import { colors } from "../theme/colors";

type ConversationCardProps = {
  conversation: Conversation;
  index: number;
  onPress: (conversation: Conversation) => void;
};

export function ConversationCard({ conversation, index, onPress }: ConversationCardProps) {
  const alternate = index % 2 === 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir conversación con ${conversation.recipientName}`}
      onPress={() => onPress(conversation)}
      style={({ pressed }) => [
        styles.card,
        alternate && styles.cardAlternate,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{conversation.recipientInitials}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.recipient}>
            {conversation.recipientName}
          </Text>
          <Text style={styles.date}>{conversation.sentAtLabel}</Text>
        </View>
        <Text numberOfLines={2} style={styles.lastMessage}>
          {conversation.lastMessage}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card
  },
  cardAlternate: {
    backgroundColor: colors.cardAlt
  },
  cardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }]
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.accent
  },
  avatarText: {
    color: colors.accentText,
    fontSize: 13,
    fontWeight: "700"
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6
  },
  recipient: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 18
  },
  date: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 13
  },
  lastMessage: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18
  }
});

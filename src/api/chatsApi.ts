import { ChatApiItem, ChatsCollection, ChatsResponse } from "../types/chat";
import { Conversation } from "../types/conversation";

const CHATS_URL = "https://escolarex.com/ws_app/c_chats.php";

export async function getUserConversations(idus: string): Promise<Conversation[]> {
  const response = await fetch(CHATS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idus })
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar las conversaciones.");
  }

  const data = (await response.json()) as ChatsResponse;

  if (!data || typeof data.res !== "string") {
    throw new Error("El servicio de conversaciones respondió con un formato no reconocido.");
  }

  if (data.res !== "ok") {
    throw new Error(data.msg || "No fue posible obtener las conversaciones.");
  }

  const chats = data.data ?? {};

  return normalizeChats(chats).map(mapChatToConversation);
}

function normalizeChats(chats: ChatsCollection): ChatApiItem[] {
  return Array.isArray(chats) ? chats : Object.values(chats);
}

function mapChatToConversation(chat: ChatApiItem): Conversation {
  return {
    id: chat.idchat,
    recipientName: chat.nombre || chat.u_destino || "Sin nombre",
    recipientInitials: getInitials(chat.nombre || chat.u_destino || "SN"),
    lastMessage: chat.u_mensaje || "Sin mensajes recientes",
    sentAt: chat.u_fecha,
    sentAtLabel: formatDateLabel(chat.u_fecha),
    area: chat.area,
    status: chat.chat_estado
  };
}

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "SN";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatDateLabel(dateText: string): string {
  const normalizedDate = dateText.replace(" ", "T");
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short"
  })
    .format(date)
    .replace(".", "");
}

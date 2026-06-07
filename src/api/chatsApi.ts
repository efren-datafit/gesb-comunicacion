import {
  ChatApiItem,
  ChatMessageApiItem,
  ChatMessagesCollection,
  ChatMessagesResponse,
  ChatsCollection,
  ChatsResponse,
  SendChatMessagePayload,
  SendChatMessageResponse
} from "../types/chat";
import { ChatMessage, Conversation } from "../types/conversation";

const CHATS_URL = "https://escolarex.com/ws_app/c_chats.php";
const CHAT_MESSAGES_URL = "https://escolarex.com/ws_app/c_chats_mensajes.php";
const SEND_CHAT_MESSAGE_URL = "https://escolarex.com/ws_app/c_chats_nmsg.php";

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

export async function getChatMessages(idchat: string): Promise<ChatMessage[]> {
  const response = await fetch(CHAT_MESSAGES_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idchat })
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar los mensajes del chat.");
  }

  const data = (await response.json()) as ChatMessagesResponse;

  if (!data || typeof data.res !== "string") {
    throw new Error("El servicio de mensajes respondió con un formato no reconocido.");
  }

  if (data.res !== "ok" && data.res !== "200") {
    throw new Error(data.msg || "No fue posible obtener los mensajes del chat.");
  }

  const messages = data.data ?? {};

  return normalizeMessages(messages)
    .map(mapChatMessage)
    .sort((left, right) => compareByDate(left.sentAt, right.sentAt));
}

export async function sendChatMessage(payload: SendChatMessagePayload): Promise<void> {
  const response = await fetch(SEND_CHAT_MESSAGE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("No fue posible enviar el mensaje.");
  }

  const data = (await response.json()) as SendChatMessageResponse;

  if (!data || typeof data.res !== "string") {
    throw new Error("El servicio de envío respondió con un formato no reconocido.");
  }

  if (data.res !== "ok" && data.res !== "200") {
    throw new Error(data.msg || "No fue posible enviar el mensaje.");
  }
}

function normalizeChats(chats: ChatsCollection): ChatApiItem[] {
  return Array.isArray(chats) ? chats : Object.values(chats);
}

function normalizeMessages(messages: ChatMessagesCollection): ChatMessageApiItem[] {
  return Array.isArray(messages) ? messages : Object.values(messages);
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

function mapChatMessage(message: ChatMessageApiItem): ChatMessage {
  return {
    id: message.idchatmsg,
    chatId: message.idchat,
    senderName: message.remitente,
    recipientName: message.destinatario,
    type: message.tipo,
    text: message.mensaje,
    sentAt: message.fecha_envio,
    sentAtLabel: formatDateTimeLabel(message.fecha_envio),
    readAt: message.fecha_leido,
    status: message.estado
  };
}

function formatDateTimeLabel(dateText: string): string {
  const normalizedDate = dateText.replace(" ", "T");
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  })
    .format(date)
    .replace(".", "");
}

function compareByDate(leftDateText: string, rightDateText: string): number {
  const left = new Date(leftDateText.replace(" ", "T")).getTime();
  const right = new Date(rightDateText.replace(" ", "T")).getTime();

  if (Number.isNaN(left) || Number.isNaN(right)) {
    return 0;
  }

  return left - right;
}

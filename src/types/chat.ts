export type ChatApiItem = {
  idchat: string;
  idplt: string;
  idarea: string;
  area: string;
  clave: string;
  nombre: string;
  u_mensaje: string;
  u_fecha: string;
  u_destino: string;
  mensaje_estado: string;
  chat_estado: string;
  bitacora: string | null;
};

export type ChatsCollection = Record<string, ChatApiItem> | ChatApiItem[];

export type ChatsResponse = {
  res: string;
  msg: string;
  data?: ChatsCollection;
};

export type ChatMessageApiItem = {
  idchatmsg: string;
  idchat: string;
  area: string;
  remitente_clave: string;
  remitente: string;
  destinatario: string;
  tipo: string;
  mensaje: string;
  fecha_envio: string;
  fecha_leido: string | null;
  estado: string;
  bitacora: string | null;
};

export type ChatMessagesCollection = Record<string, ChatMessageApiItem> | ChatMessageApiItem[];

export type ChatMessagesResponse = {
  res: string;
  msg: string;
  data?: ChatMessagesCollection;
};

export type SendChatMessagePayload = {
  idchat: string;
  idus: string;
  usuario: string;
  tipo: "TEXTO";
  msg: string;
};

export type SendChatMessageResponse = {
  res: string;
  msg: string;
  data?: unknown;
};

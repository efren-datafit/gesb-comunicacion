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

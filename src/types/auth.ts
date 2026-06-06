export type AuthUser = {
  idus: string;
  nombre: string;
  email: string;
  idplt: string;
  multiplantel: string;
  campus: string;
  esquema: string;
  push_token: string | null;
};

export type LoginSuccessResponse = {
  res: "ok";
  msg: string;
  data: AuthUser;
};

export type LoginDeniedResponse = {
  res: string;
  msg: string;
  data?: never;
};

export type LoginResponse = LoginSuccessResponse | LoginDeniedResponse;

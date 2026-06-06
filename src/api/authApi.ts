import { LoginResponse } from "../types/auth";

const ACCESS_URL = "https://escolarex.com/ws_app/c_acceso.php";

export type LoginPayload = {
  usuario: string;
  llave: string;
};

export async function loginWithCredentials(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(ACCESS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("No fue posible conectar con el servicio de acceso.");
  }

  const data = (await response.json()) as LoginResponse;

  if (!data || typeof data.res !== "string" || typeof data.msg !== "string") {
    throw new Error("El servicio respondió con un formato no reconocido.");
  }

  if (data.res === "ok" && !data.data) {
    throw new Error("El servicio no devolvió la información del usuario.");
  }

  return data;
}

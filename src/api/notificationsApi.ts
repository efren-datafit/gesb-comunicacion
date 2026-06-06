import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { AuthUser } from "../types/auth";

const SAVE_PUSH_TOKEN_URL = "https://escolarex.com/ws_app/c_token_guardar.php";
const EXPO_PROJECT_ID = "21d1d104-d5ce-4dbd-bef8-e15b84ea6971";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

type SavePushTokenPayload = {
  idus: string;
  token: string;
  device_id: string;
  model: string;
  system: string;
  version: string;
  brand: string;
};

type SavePushTokenResponse = {
  res: string;
  msg: string;
  data?: unknown;
};

export async function registerPushTokenForUser(user: AuthUser): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const token = await getExpoPushToken();

  if (!token) {
    return null;
  }

  await savePushToken({
    idus: user.idus,
    token,
    ...(await getDeviceMetadata())
  });

  return token;
}

async function getExpoPushToken(): Promise<string | null> {
  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Mensajes GESB",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#820010"
    });
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId: EXPO_PROJECT_ID
  });

  return tokenResponse.data;
}

async function getDeviceMetadata() {
  return {
    device_id: await getDeviceId(),
    model: Device.modelName || "",
    system: Device.osName || Platform.OS,
    version: Device.osVersion || "",
    brand: Device.brand || ""
  };
}

async function getDeviceId(): Promise<string> {
  if (Platform.OS === "android") {
    return Application.getAndroidId() || "";
  }

  if (Platform.OS === "ios") {
    return (await Application.getIosIdForVendorAsync()) || "";
  }

  return "";
}

async function savePushToken(payload: SavePushTokenPayload): Promise<void> {
  const response = await fetch(SAVE_PUSH_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("No fue posible guardar el token de notificaciones.");
  }

  const data = (await response.json()) as SavePushTokenResponse;

  if (!data || typeof data.res !== "string") {
    throw new Error("El servicio de token respondió con un formato no reconocido.");
  }

  if (data.res !== "ok" && data.res !== "200") {
    throw new Error(data.msg || "No fue posible guardar el token de notificaciones.");
  }
}

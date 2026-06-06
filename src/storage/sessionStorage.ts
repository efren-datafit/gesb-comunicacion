import * as SecureStore from "expo-secure-store";
import { AuthUser } from "../types/auth";

const SESSION_STORAGE_KEY = "gesb.authUser";

export async function saveSession(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export async function getStoredSession(): Promise<AuthUser | null> {
  const rawSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthUser;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}

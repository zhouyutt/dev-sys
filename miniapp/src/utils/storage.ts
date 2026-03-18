import Taro from "@tarojs/taro";
import type { LoginResult } from "@/types";

const TOKEN_KEY = "miniapp_token";
const REFRESH_TOKEN_KEY = "miniapp_refresh_token";
const SESSION_KEY = "miniapp_session";

export function setSession(session: LoginResult) {
  Taro.setStorageSync(TOKEN_KEY, session.token);
  Taro.setStorageSync(REFRESH_TOKEN_KEY, session.refreshToken);
  Taro.setStorageSync(SESSION_KEY, session);
}

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || "";
}

export function getSession(): LoginResult | null {
  return Taro.getStorageSync(SESSION_KEY) || null;
}

export function clearSession() {
  Taro.removeStorageSync(TOKEN_KEY);
  Taro.removeStorageSync(REFRESH_TOKEN_KEY);
  Taro.removeStorageSync(SESSION_KEY);
}

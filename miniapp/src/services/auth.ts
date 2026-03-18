import Taro from "@tarojs/taro";
import type { LoginResult, MiniappRole } from "@/types";
import { request } from "@/utils/request";
import { setSession } from "@/utils/storage";

interface BindPayload {
  roleType: MiniappRole;
  username: string;
  password: string;
  profileId?: number;
  nickname?: string;
  avatarUrl?: string;
}

export async function wechatBindLogin(payload: BindPayload) {
  const wxLogin = await Taro.login();
  if (!wxLogin.code) throw new Error("Failed to get WeChat login code");

  const result = await request<LoginResult>("/wechat/auth/bind-login", "POST", {
    code: wxLogin.code,
    ...payload
  });
  setSession(result);
  return result;
}

import Taro from "@tarojs/taro";
import { API_BASE } from "@/env";
import { getToken } from "./storage";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function request<T>(url: string, method: "GET" | "POST" | "PUT" = "GET", data?: Record<string, unknown>) {
  const token = getToken();
  const res = await Taro.request<ApiResponse<T>>({
    url: `${API_BASE}${url}`,
    method,
    data,
    header: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Request failed");
  }
  return res.data.data;
}

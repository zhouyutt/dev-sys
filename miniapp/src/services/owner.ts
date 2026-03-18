import { request } from "@/utils/request";

export function fetchOwnerDashboard() {
  return request("/miniapp/owner/dashboard");
}

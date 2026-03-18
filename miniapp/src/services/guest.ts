import { request } from "@/utils/request";

export function fetchGuestProfile() {
  return request("/miniapp/guest/profile");
}

export function updateGuestProfile(payload: Record<string, unknown>) {
  return request("/miniapp/guest/profile", "PUT", payload);
}

export function fetchGuestTrips() {
  return request("/miniapp/guest/trips");
}

export function fetchGuestRoom() {
  return request("/miniapp/guest/room");
}

export function fetchGuestNotifications() {
  return request("/miniapp/guest/notifications");
}

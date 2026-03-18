import { request } from "@/utils/request";

export function fetchStaffTodayBoard() {
  return request("/miniapp/staff/today-board");
}

export function updateGuestStatus(payload: { studentId: number; status: string }) {
  return request("/miniapp/staff/guest-status", "PUT", payload);
}

export function updateRoomCheckIn(payload: { studentId: number; roomId: number | null; checkInDate?: string; checkOutDate?: string }) {
  return request("/miniapp/staff/room-checkin", "PUT", payload);
}

export function signInTripParticipant(payload: { tripId: number; studentId: number; signInStatus: string }) {
  return request("/miniapp/staff/trip-signin", "PUT", payload);
}

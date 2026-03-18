<template>
  <view class="page">
    <view class="card">
      <view class="title">Staff Today Board</view>
      <view class="row">Today trips: {{ board.todayTrips }}</view>
      <view class="row">Pending guests: {{ board.pendingGuests }}</view>
      <view class="row">Occupied rooms: {{ board.occupiedRooms }}</view>
    </view>

    <view class="card">
      <view class="title">Quick Actions</view>
      <input class="input" v-model="studentId" placeholder="Student ID" />
      <input class="input" v-model="tripId" placeholder="Trip ID" />
      <picker :range="statuses" @change="onStatusChange">
        <view class="input">Guest status: {{ guestStatus }}</view>
      </picker>
      <button class="btn" @tap="onUpdateGuestStatus">Update Guest Status</button>
      <button class="btn" @tap="onTripSignIn">Mark Trip Sign-In</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from "@tarojs/taro";
import { reactive, ref } from "vue";
import { fetchStaffTodayBoard, signInTripParticipant, updateGuestStatus } from "@/services/staff";

const board = reactive({
  todayTrips: 0,
  pendingGuests: 0,
  occupiedRooms: 0
});
const studentId = ref("");
const tripId = ref("");
const statuses = ["pending", "active", "completed", "cancelled"];
const guestStatus = ref("active");

function onStatusChange(e) {
  guestStatus.value = statuses[Number(e.detail.value)];
}

useDidShow(async () => {
  try {
    const result = await fetchStaffTodayBoard() as Record<string, number>;
    board.todayTrips = result.todayTrips || 0;
    board.pendingGuests = result.pendingGuests || 0;
    board.occupiedRooms = result.occupiedRooms || 0;
  } catch {
    Taro.showToast({ title: "Load failed", icon: "none" });
  }
});

async function onUpdateGuestStatus() {
  if (!studentId.value) return;
  try {
    await updateGuestStatus({ studentId: Number(studentId.value), status: guestStatus.value });
    Taro.showToast({ title: "Updated", icon: "success" });
  } catch {
    Taro.showToast({ title: "Update failed", icon: "none" });
  }
}

async function onTripSignIn() {
  if (!studentId.value || !tripId.value) return;
  try {
    await signInTripParticipant({
      studentId: Number(studentId.value),
      tripId: Number(tripId.value),
      signInStatus: "signed_in"
    });
    Taro.showToast({ title: "Signed in", icon: "success" });
  } catch {
    Taro.showToast({ title: "Sign-in failed", icon: "none" });
  }
}
</script>

<style lang="scss">
.row {
  margin-top: 12px;
}
.input {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  margin-top: 12px;
}
.btn {
  margin-top: 12px;
}
</style>

<template>
  <view class="page">
    <view class="card">
      <view class="title">Owner Dashboard</view>
      <view class="row">Today trips: {{ data.todayTrips }}</view>
      <view class="row">Total guests: {{ data.totalGuests }}</view>
      <view class="row">Occupied rooms: {{ data.occupiedRooms }}</view>
      <view class="row">Occupancy rate: {{ data.occupancyRate }}%</view>
      <view class="row">Top destination: {{ data.topDestination || "-" }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from "@tarojs/taro";
import { reactive } from "vue";
import { fetchOwnerDashboard } from "@/services/owner";

const data = reactive({
  todayTrips: 0,
  totalGuests: 0,
  occupiedRooms: 0,
  occupancyRate: 0,
  topDestination: ""
});

useDidShow(async () => {
  try {
    const res = await fetchOwnerDashboard() as Record<string, any>;
    data.todayTrips = res.todayTrips || 0;
    data.totalGuests = res.totalGuests || 0;
    data.occupiedRooms = res.occupiedRooms || 0;
    data.occupancyRate = res.occupancyRate || 0;
    data.topDestination = res.topDestination || "";
  } catch {
    Taro.showToast({ title: "Load failed", icon: "none" });
  }
});
</script>

<style lang="scss">
.row {
  margin-top: 12px;
}
</style>

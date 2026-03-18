<template>
  <view class="page">
    <view class="card">
      <view class="title">My Trips</view>
      <view v-for="trip in trips" :key="trip.id" class="item">
        <view>{{ trip.trip_date }} · {{ trip.destination }}</view>
        <view class="sub">{{ trip.status }} · sign-in: {{ trip.sign_in_status || "pending" }}</view>
      </view>
      <view v-if="!trips.length" class="sub">No trips yet.</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from "@tarojs/taro";
import { ref } from "vue";
import { fetchGuestTrips } from "@/services/guest";

const trips = ref<any[]>([]);
useDidShow(async () => {
  try {
    trips.value = (await fetchGuestTrips()) as any[];
  } catch {
    Taro.showToast({ title: "Load failed", icon: "none" });
  }
});
</script>

<style lang="scss">
.item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-top: 14px;
}
.sub {
  margin-top: 8px;
  font-size: 24px;
  color: #666;
}
</style>

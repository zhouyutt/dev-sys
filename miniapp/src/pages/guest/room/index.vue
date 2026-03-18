<template>
  <view class="page">
    <view class="card">
      <view class="title">My Room</view>
      <view v-if="room">
        <view>Room: {{ room.room_number }}</view>
        <view class="sub">Check-in: {{ room.check_in_date || "-" }}</view>
        <view class="sub">Check-out: {{ room.check_out_date || "-" }}</view>
      </view>
      <view v-else class="sub">No room assigned.</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from "@tarojs/taro";
import { ref } from "vue";
import { fetchGuestRoom } from "@/services/guest";

const room = ref<any>(null);
useDidShow(async () => {
  try {
    room.value = await fetchGuestRoom();
  } catch {
    Taro.showToast({ title: "Load failed", icon: "none" });
  }
});
</script>

<style lang="scss">
.sub {
  margin-top: 8px;
  color: #666;
  font-size: 24px;
}
</style>

<template>
  <view class="page">
    <view class="card">
      <view class="title">Notifications</view>
      <view v-for="item in list" :key="item.id" class="item">
        <view>{{ item.title }}</view>
        <view class="sub">{{ item.content }}</view>
      </view>
      <view v-if="!list.length" class="sub">No notifications.</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from "@tarojs/taro";
import { ref } from "vue";
import { fetchGuestNotifications } from "@/services/guest";

const list = ref<any[]>([]);
useDidShow(async () => {
  try {
    list.value = (await fetchGuestNotifications()) as any[];
  } catch {
    Taro.showToast({ title: "Load failed", icon: "none" });
  }
});
</script>

<style lang="scss">
.item {
  margin-top: 12px;
  border: 1px solid #eee;
  padding: 14px;
  border-radius: 10px;
}
.sub {
  margin-top: 6px;
  color: #666;
  font-size: 24px;
}
</style>

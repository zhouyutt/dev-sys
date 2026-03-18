<template>
  <view class="page">
    <view class="card">
      <view class="title">Guest Center</view>
      <button class="nav-btn" @tap="go('/pages/guest/profile/index')">My Profile</button>
      <button class="nav-btn" @tap="go('/pages/guest/trips/index')">My Trips</button>
      <button class="nav-btn" @tap="go('/pages/guest/room/index')">My Room</button>
      <button class="nav-btn" @tap="go('/pages/guest/notifications/index')">Notifications</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
function go(url: string) {
  Taro.navigateTo({ url });
}
</script>

<style lang="scss">
.page {
  padding-top: 24px;
}
.nav-btn {
  margin-top: 16px;
}
</style>

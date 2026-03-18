<template>
  <view class="page">
    <view class="card">
      <view class="title">Uncle Chang MiniApp</view>
      <view class="subtitle">Bind ERP account to continue</view>

      <picker :range="roles" range-key="label" @change="onRoleChange">
        <view class="input">Role: {{ roleLabel }}</view>
      </picker>
      <input class="input" v-model="username" placeholder="ERP username" />
      <input class="input" v-model="password" password placeholder="ERP password" />
      <input class="input" v-model="profileIdInput" placeholder="Profile ID (guest required)" />
      <button class="btn" :loading="loading" @tap="onLogin">WeChat bind login</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { computed, ref } from "vue";
import { wechatBindLogin } from "@/services/auth";
import type { MiniappRole } from "@/types";

const roles = [
  { label: "Guest", value: "guest" },
  { label: "Staff", value: "staff" },
  { label: "Owner", value: "owner" }
];

const role = ref<MiniappRole>("guest");
const username = ref("");
const password = ref("");
const profileIdInput = ref("");
const loading = ref(false);

const roleLabel = computed(() => roles.find(item => item.value === role.value)?.label || "Guest");

function onRoleChange(e) {
  role.value = roles[Number(e.detail.value)].value as MiniappRole;
}

async function onLogin() {
  if (!username.value || !password.value) {
    Taro.showToast({ title: "Username/password required", icon: "none" });
    return;
  }
  if (role.value === "guest" && !profileIdInput.value) {
    Taro.showToast({ title: "Guest profile ID required", icon: "none" });
    return;
  }
  loading.value = true;
  try {
    const result = await wechatBindLogin({
      roleType: role.value,
      username: username.value.trim(),
      password: password.value,
      profileId: profileIdInput.value ? Number(profileIdInput.value) : undefined
    });
    const targetMap: Record<MiniappRole, string> = {
      guest: "/pages/guest/home/index",
      staff: "/pages/staff/home/index",
      owner: "/pages/owner/dashboard/index"
    };
    Taro.reLaunch({ url: targetMap[result.roleType] });
  } catch (error) {
    Taro.showToast({ title: error.message || "Login failed", icon: "none" });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss">
.page {
  padding-top: 40px;
}
.subtitle {
  margin: 12px 0 20px;
  color: #666;
  font-size: 26px;
}
.input {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}
.btn {
  margin-top: 20px;
  background: #2d8cf0;
  color: #fff;
}
</style>

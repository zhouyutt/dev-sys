<template>
  <view class="page">
    <view class="card">
      <view class="title">My Profile</view>
      <input class="input" v-model="form.name_en" placeholder="English name" />
      <input class="input" v-model="form.phone" placeholder="Phone" />
      <input class="input" v-model="form.wechat" placeholder="WeChat ID" />
      <input class="input" v-model="form.emergency_contact" placeholder="Emergency contact" />
      <button class="btn" :loading="loading" @tap="save">Save</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from "@tarojs/taro";
import { reactive, ref } from "vue";
import { fetchGuestProfile, updateGuestProfile } from "@/services/guest";

const loading = ref(false);
const form = reactive({
  name_en: "",
  phone: "",
  wechat: "",
  emergency_contact: ""
});

useDidShow(async () => {
  try {
    const profile = await fetchGuestProfile() as Record<string, string>;
    form.name_en = profile.name_en || "";
    form.phone = profile.phone || "";
    form.wechat = profile.wechat || "";
    form.emergency_contact = profile.emergency_contact || "";
  } catch (error) {
    Taro.showToast({ title: "Load failed", icon: "none" });
  }
});

async function save() {
  loading.value = true;
  try {
    await updateGuestProfile(form);
    Taro.showToast({ title: "Saved", icon: "success" });
  } catch {
    Taro.showToast({ title: "Save failed", icon: "none" });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss">
.input {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}
.btn {
  margin-top: 18px;
}
</style>

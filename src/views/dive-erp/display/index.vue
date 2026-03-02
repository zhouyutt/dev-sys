<template>
  <div
    ref="screenRef"
    class="display-screen min-h-screen w-screen text-white p-6 box-border overflow-auto"
  >
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">{{ t("diveErp.dashboard.title") }}</h1>
      <div class="text-right">
        <div class="text-2xl">{{ currentDate }}</div>
        <div class="text-4xl font-mono font-bold">{{ currentTime }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white/10 rounded-xl p-6 backdrop-blur">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📍</span>
          {{ t("diveErp.dashboard.todayTrips") }}
        </h2>
        <div v-if="loading" class="flex justify-center py-12 text-white/80">{{ t("diveErp.dashboard.loading") }}</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="island in fixedIslands"
            :key="island.key"
            class="rounded-xl overflow-hidden shadow-lg"
            :class="island.bgClass"
          >
            <div class="px-4 py-3 flex items-center justify-between">
              <span class="font-semibold flex items-center gap-2">
                <span>🚤</span>
                {{ island.name }}
              </span>
              <span class="text-sm opacity-90">{{ islandTrips(island.key).length }} {{ t("diveErp.dashboard.boats") }}</span>
            </div>
            <div class="px-4 pb-4 space-y-4">
              <div
                v-for="trip in islandTrips(island.key)"
                :key="trip.id"
                class="bg-black/40 rounded-lg p-3 text-sm text-white shadow-inner"
              >
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <el-tag type="success" size="large">{{ boatLabel(trip) }}</el-tag>
                  <span class="font-mono text-green-200">{{ formatTime(trip.departure_time) }}</span>
                </div>
                <p class="text-white/95">
                  Captain {{ captainName(trip) }} · Instructor {{ instructorName(trip) }} · DM {{ dmName(trip) }}
                </p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span class="text-white/90 mr-1">{{ t("diveErp.dashboard.students") }}:</span>
                  <el-tag
                    v-for="s in (trip.students || []).slice(0, 12)"
                    :key="s.id"
                    size="small"
                    class="!bg-black/60 !text-white !border-0"
                  >
                    {{ s.name_en || s.name_cn || "—" }}{{ s.learning_content ? ` · ${s.learning_content}` : "" }}
                  </el-tag>
                  <span v-if="(trip.students || []).length > 12" class="text-white/80 text-xs">
                    +{{ (trip.students || []).length - 12 }} more
                  </span>
                </div>
              </div>
              <p v-if="islandTrips(island.key).length === 0" class="opacity-70 text-sm py-2">{{ t("diveErp.dashboard.noTrips") }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/10 rounded-xl p-6 backdrop-blur">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🏠</span>
          {{ t("diveErp.dashboard.roomStatus") }}
        </h2>
        <div v-if="loadingRooms" class="flex justify-center py-12 text-white/80">{{ t("diveErp.dashboard.loading") }}</div>
        <div v-else>
          <div class="flex justify-around mb-4 text-center">
            <div>
              <p class="text-sm opacity-90">{{ t("diveErp.dashboard.totalRooms") }}</p>
              <p class="text-2xl font-bold">{{ roomSummary.total }}</p>
            </div>
            <div>
              <p class="text-sm opacity-90">{{ t("diveErp.dashboard.occupied") }}</p>
              <p class="text-2xl font-bold text-red-300">{{ roomSummary.occupied }}</p>
            </div>
            <div>
              <p class="text-sm opacity-90">{{ t("diveErp.dashboard.available") }}</p>
              <p class="text-2xl font-bold text-green-300">{{ roomSummary.available }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium opacity-90 mb-2">{{ t("diveErp.dashboard.areaA") }}</p>
              <div class="flex flex-wrap gap-3">
                <div
                  v-for="r in roomsByFloorA"
                  :key="r.id"
                  class="w-20 h-20 rounded-xl flex flex-col items-center justify-center font-bold text-base shadow-md"
                  :class="roomTileClass(r)"
                >
                  <span>{{ r.room_number }}</span>
                  <span v-if="(r.students?.length || 0) > 0" class="text-xs font-normal mt-0.5 opacity-95 truncate max-w-full px-1">
                    {{ (r.students || []).map((s) => s.name_cn || s.name_en || '').filter(Boolean).join(' ') || '' }}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium opacity-90 mb-2">{{ t("diveErp.dashboard.areaB") }}</p>
              <div class="flex flex-wrap gap-3">
                <div
                  v-for="r in roomsByFloorB"
                  :key="r.id"
                  class="w-20 h-20 rounded-xl flex flex-col items-center justify-center font-bold text-base shadow-md"
                  :class="roomTileClass(r)"
                >
                  <span>{{ r.room_number }}</span>
                  <span v-if="(r.students?.length || 0) > 0" class="text-xs font-normal mt-0.5 opacity-95 truncate max-w-full px-1">
                    {{ (r.students || []).map((s) => s.name_cn || s.name_en || '').filter(Boolean).join(' ') || '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl"
      :title="isFullscreen ? t('diveErp.dashboard.exitFullscreen') : t('diveErp.dashboard.fullscreen')"
      @click="toggleFullscreen"
    >
      {{ isFullscreen ? "⤓" : "⤢" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { displayApi, roomApi } from "@/api/dive";
import dayjs from "dayjs";

defineOptions({ name: "Display" });

const { t } = useI18n();

// 固定四岛顺序（与截图一致）
const fixedIslands = [
  { key: "Mabul Island", name: "Mabul Island", bgClass: "bg-indigo-500/80" },
  { key: "Mataking Island", name: "Mataking Island", bgClass: "bg-red-500/80" },
  { key: "Sipadan", name: "Sipadan", bgClass: "bg-blue-500/80" },
  { key: "Si Amil Island", name: "Si Amil Island", bgClass: "bg-green-600/80" }
];

const screenRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const loading = ref(true);
const loadingRooms = ref(true);
const currentDate = ref("");
const currentTime = ref("");
const islandsData = ref<Record<string, any[]>>({});
const rooms = ref<any[]>([]);
const roomSummary = reactive({ total: 0, occupied: 0, available: 0 });

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let tickTimer: ReturnType<typeof setInterval> | null = null;

function islandTrips(key: string) {
  return islandsData.value[key] || [];
}

function formatTime(t: string | null | undefined) {
  if (!t) return "—";
  if (typeof t === "string" && /^\d{2}:\d{2}/.test(t)) return t.slice(0, 8);
  return String(t);
}

function boatLabel(t: any) {
  const boat = t.boat;
  if (boat?.boat_name) return boat.boat_name;
  const type = boat?.boat_type === "Large" || boat?.boat_type === "large" ? "大船" : "小船";
  return `${boat?.boat_number || "-"}${type}`;
}
function captainName(t: any) {
  return t.captain?.name_en || t.captain?.name || t.captain?.name_cn || "—";
}
function instructorName(t: any) {
  return t.instructor?.name_en || t.instructor?.name || t.instructor?.name_cn || "—";
}
function dmName(t: any) {
  return t.dm?.name_en || t.dm?.name || t.dm?.name_cn || "—";
}

const roomsByFloorA = computed(() =>
  rooms.value.filter((r: any) => r.floor === "A").sort((a: any, b: any) => a.room_number.localeCompare(b.room_number))
);
const roomsByFloorB = computed(() =>
  rooms.value.filter((r: any) => r.floor === "B").sort((a: any, b: any) => a.room_number.localeCompare(b.room_number))
);

function roomTileClass(r: any) {
  const occ = Number(r.current_occupancy) || 0;
  const max = Number(r.max_capacity) || 1;
  if (occ === 0) return "bg-green-500/80 text-white";
  if (occ >= max) return "bg-red-500/80 text-white";
  return "bg-gradient-to-r from-green-500/80 to-red-500/80 text-white";
}

function tick() {
  currentDate.value = dayjs().format("YYYY年MM月DD日 dddd");
  currentTime.value = dayjs().format("HH:mm:ss");
}

async function loadTrips() {
  try {
    const date = dayjs().format("YYYY-MM-DD");
    const res = await displayApi.tripsByIsland({ date });
    islandsData.value = (res as any)?.islands || {};
  } catch (_) {
    islandsData.value = {};
  }
}

async function loadRooms() {
  loadingRooms.value = true;
  try {
    const res = await displayApi.roomsStatus();
    const byFloor = (res as any)?.roomsByFloor || {};
    const stats = (res as any)?.statistics || {};
    rooms.value = [...(byFloor.A || []), ...(byFloor.B || [])];
    roomSummary.total = Number(stats.total) ?? rooms.value.length;
    roomSummary.occupied = Number(stats.occupied) ?? 0;
    roomSummary.available = Number(stats.available) ?? rooms.value.length;
  } catch (_) {
    try {
      const fallback = await roomApi.status();
      const d = (fallback as any)?.data ?? fallback;
      const list = d?.rooms || [];
      rooms.value = Array.isArray(list) ? list : [];
      const sum = d?.summary || {};
      roomSummary.total = rooms.value.length;
      roomSummary.occupied = Number(sum.occupied) ?? 0;
      roomSummary.available = Number(sum.available) ?? rooms.value.length;
    } catch (_2) {
      rooms.value = [];
    }
  }
  loadingRooms.value = false;
}

async function loadData() {
  loading.value = true;
  await Promise.all([loadTrips(), loadRooms()]);
  loading.value = false;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    screenRef.value?.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  tick();
  tickTimer = setInterval(tick, 1000);
  loadData();
  refreshTimer = setInterval(loadData, 15000);
  document.addEventListener("fullscreenchange", onFullscreenChange);
});

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer);
  if (refreshTimer) clearInterval(refreshTimer);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  if (document.fullscreenElement) document.exitFullscreen?.();
});
</script>

<style scoped>
.display-screen {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #1e3a5f;
  background-image: linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #134e4a 100%);
}
</style>

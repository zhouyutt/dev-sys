<script setup lang="ts">
import { ref, onMounted, computed, markRaw } from "vue";
import ReCol from "@/components/ReCol";
import { useDark, randomGradient } from "./utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { useRenderFlicker } from "@/components/ReFlicker";
import { ChartBar, ChartLine, ChartRound } from "./components/charts";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import { displayApi, studentApi } from "@/api/dive";
import { useRouter } from "vue-router";
import GroupLine from "~icons/ri/group-line";
import Question from "~icons/ri/question-answer-line";
import CheckLine from "~icons/ri/chat-check-line";
import Smile from "~icons/ri/star-smile-line";

defineOptions({
  name: "Welcome"
});

const router = useRouter();
const { isDark } = useDark();

const loading = ref(true);
const stats = ref({
  todayTripParticipants: 0,
  inHouseCount: 0,
  studentCount: 0,
  roomsAvailable: 0,
  roomsTotal: 0,
  roomOccupancyPercent: 0,
  pendingEnrollmentsCount: 0
});
const dailyStudents = ref<Array<{ date: string; count: number }>>([]);
const dailyTripParticipants = ref<Array<{ date: string; count: number }>>([]);
const pendingList = ref<any[]>([]);

let curWeek = ref(0);
const optionsBasis: Array<OptionsType> = [{ label: "近7日" }];

// 根据昨日/今日数据计算每日变动百分比
function dailyChangePercent(todayVal: number, yesterdayVal: number): string {
  if (yesterdayVal === 0) return todayVal > 0 ? "+100%" : "0%";
  const pct = Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

// 顶部四张卡片数据（沿用原样式 + 每日变动百分比）
const chartData = computed(() => {
  const s = stats.value;
  const trend = dailyStudents.value.map(({ count }) => count);
  const tripTrend = dailyTripParticipants.value.map(({ count }) => count);
  const len = trend.length;
  const tLen = tripTrend.length;
  const todayNewStudents = len ? trend[len - 1] ?? 0 : 0;
  const yesterdayNewStudents = len >= 2 ? trend[len - 2] ?? 0 : 0;
  const todayTrips = tLen ? tripTrend[tLen - 1] ?? 0 : 0;
  const yesterdayTrips = tLen >= 2 ? tripTrend[tLen - 2] ?? 0 : 0;

  return [
    {
      icon: GroupLine,
      bgColor: "#effaff",
      color: "#41b6ff",
      duration: 1200,
      name: "当天出海人数",
      value: s.todayTripParticipants,
      percent: dailyChangePercent(todayTrips, yesterdayTrips),
      data: tripTrend.length ? tripTrend : [0]
    },
    {
      icon: Question,
      bgColor: "#fff5f4",
      color: "#e85f33",
      duration: 1200,
      name: "入住人数",
      value: s.inHouseCount,
      percent: "—",
      data: trend.length ? trend : [0]
    },
    {
      icon: CheckLine,
      bgColor: "#eff8f4",
      color: "#26ce83",
      duration: 1200,
      name: "学员数量",
      value: s.studentCount,
      percent: dailyChangePercent(todayNewStudents, yesterdayNewStudents),
      data: trend.length ? trend : [0]
    },
    {
      icon: Smile,
      bgColor: "#f6f4fe",
      color: "#7846e5",
      duration: 1200,
      name: "房间剩余数量",
      value: s.roomsAvailable,
      percent: `共${s.roomsTotal}间`,
      data: trend.length ? trend : [0]
    }
  ];
});

// 分析概览 → 每日学员数量 + 每天出海人数（双柱状图）
const barChartRequireData = computed(() => dailyStudents.value.map(({ count }) => count));
const barChartQuestionData = computed(() =>
  dailyTripParticipants.value.map(({ count }) => count)
);
const barChartXAxisData = computed(() =>
  dailyStudents.value.map(({ date }) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  })
);

// 解决概率 → 房间入住百分比（保留 7 条进度条样式，同一数值）
const progressData = computed(() => {
  const pct = Math.min(100, Math.max(0, stats.value.roomOccupancyPercent));
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return days.map((week, i) => ({
    week,
    percentage: pct,
    duration: 90,
    color: i >= 4 ? "#26ce83" : "#41b6ff"
  })).reverse();
});

// 数据统计 → 每天出海人数（表格数据）
const dailyTripTableData = computed(() =>
  dailyTripParticipants.value.map(({ date, count }, i) => ({
    id: i + 1,
    date,
    count
  }))
);

async function loadData() {
  loading.value = true;
  try {
    const [statsRes, dailyRes, pendingRes] = await Promise.all([
      displayApi.dashboardStats(),
      displayApi.dailyStats(),
      studentApi.list({ status: "pending", limit: 50 })
    ]);
    const d = (statsRes as any)?.data;
    if (d) {
      stats.value = {
        todayTripParticipants: d.todayTripParticipants ?? 0,
        inHouseCount: d.inHouseCount ?? 0,
        studentCount: d.studentCount ?? 0,
        roomsAvailable: d.roomsAvailable ?? 0,
        roomsTotal: d.roomsTotal ?? 0,
        roomOccupancyPercent: d.roomOccupancyPercent ?? 0,
        pendingEnrollmentsCount: d.pendingEnrollmentsCount ?? 0
      };
    }
    const daily = (dailyRes as any)?.data;
    if (daily?.dailyStudents) dailyStudents.value = daily.dailyStudents;
    if (daily?.dailyTripParticipants) dailyTripParticipants.value = daily.dailyTripParticipants;
    pendingList.value = (pendingRes as any)?.data?.students ?? [];
  } catch (_) {}
  finally {
    loading.value = false;
  }
}

function goStudents() {
  router.push("/dive/students");
}

onMounted(loadData);
</script>

<template>
  <div>
    <el-row v-loading="loading" :gutter="24" justify="space-around">
      <re-col
        v-for="(item, index) in chartData"
        :key="index"
        v-motion
        class="mb-[18px]"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 80 * (index + 1) } }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">{{ item.name }}</span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{ backgroundColor: isDark ? 'transparent' : item.bgColor }"
            >
              <IconifyIconOffline
                :icon="item.icon"
                :color="item.color"
                width="18"
                height="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="item.duration"
                :fontSize="'1.6em'"
                :startVal="0"
                :endVal="item.value"
              />
              <p v-if="item.percent" class="font-medium text-green-500">{{ item.percent }}</p>
            </div>
            <ChartLine
              v-if="item.data.length > 1"
              class="w-1/2!"
              :color="item.color"
              :data="item.data"
            />
            <ChartRound v-else class="w-1/2!" />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="18"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
      >
        <el-card class="bar-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">每日学员数量</span>
            <Segmented v-model="curWeek" :options="optionsBasis" />
          </div>
          <div class="flex justify-between items-start mt-3">
            <ChartBar
              :require-data="barChartRequireData"
              :question-data="barChartQuestionData"
              require-legend="每日学员数量"
              question-legend="每天出海人数"
              :x-axis-data="barChartXAxisData"
            />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 480 } }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">房间入住百分比</span>
          </div>
          <div
            v-for="(item, index) in progressData"
            :key="index"
            :class="[
              'flex', 'justify-between', 'items-start',
              index === 0 ? 'mt-8' : 'mt-[2.15rem]'
            ]"
          >
            <el-progress
              :text-inside="true"
              :percentage="item.percentage"
              :stroke-width="21"
              :color="item.color"
              striped
              striped-flow
              :duration="item.duration"
            />
            <span class="text-nowrap ml-2 text-text_color_regular text-sm">{{ item.week }}</span>
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="18"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 560 } }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">每天出海人数统计</span>
          </div>
          <el-scrollbar max-height="504" class="mt-3">
            <el-table :data="dailyTripTableData" stripe style="width: 100%">
              <el-table-column prop="id" label="序号" width="60" />
              <el-table-column prop="date" label="日期" />
              <el-table-column prop="count" label="出海人数" width="100" />
            </el-table>
          </el-scrollbar>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :xs="24"
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 640 } }"
      >
        <el-card shadow="never">
          <div class="flex justify-between items-center">
            <span class="text-md font-medium">新报名学员待处理</span>
            <el-button type="primary" link size="small" @click="goStudents">去处理</el-button>
          </div>
          <el-scrollbar max-height="504" class="mt-3">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in pendingList.slice(0, 14)"
                :key="item.id || index"
                center
                placement="top"
                :icon="
                  markRaw(
                    useRenderFlicker({
                      background: randomGradient({ randomizeHue: true })
                    })
                  )
                "
                :timestamp="item.enrollment_date || item.createdAt || '—'"
              >
                <p class="text-text_color_regular text-sm">
                  {{ item.name_en || item.name_cn || "—" }} {{ item.phone ? ` · ${item.phone}` : "" }}
                </p>
              </el-timeline-item>
            </el-timeline>
            <p v-if="pendingList.length === 0" class="text-text_color_regular text-sm py-4">暂无待处理报名</p>
          </el-scrollbar>
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;
  .el-progress--line {
    width: 85%;
  }
  .el-progress-bar__innerText {
    font-size: 15px;
  }
  .el-scrollbar__bar {
    display: none;
  }
  .el-timeline-item {
    margin: 0 6px;
  }
}
:deep(.el-timeline.is-start) {
  padding-left: 0;
}
</style>

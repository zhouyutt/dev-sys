<template>
  <div class="main flex flex-col h-full p-4 gap-3">
    <!-- 顶部工具栏 -->
    <div class="flex flex-wrap items-center gap-2">
      <el-input
        v-model="searchText"
        :placeholder="t('diveErp.common.search')"
        clearable
        style="width: 220px"
        @input="applyFilter"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="filterGender" clearable :placeholder="t('diveErp.guests.gender')" style="width: 110px" @change="applyFilter">
        <el-option :label="t('diveErp.guests.male')" value="male" />
        <el-option :label="t('diveErp.guests.female')" value="female" />
        <el-option :label="t('diveErp.guests.other')" value="other" />
      </el-select>
      <el-select v-model="filterStatus" clearable :placeholder="t('diveErp.common.status')" style="width: 110px" @change="applyFilter">
        <el-option :label="t('diveErp.guests.pending')" value="pending" />
        <el-option :label="t('diveErp.guests.inHouse')" value="active" />
        <el-option :label="t('diveErp.guests.completed')" value="completed" />
      </el-select>
      <el-select v-model="filterLearning" clearable :placeholder="t('diveErp.guests.learningContent')" style="width: 150px" @change="applyFilter">
        <el-option v-for="opt in learningContentOptions" :key="opt" :label="opt" :value="opt" />
      </el-select>
      <el-select v-model="filterRoom" clearable :placeholder="t('diveErp.guests.room')" style="width: 110px" @change="applyFilter">
        <el-option v-for="r in rooms" :key="r.id" :label="r.room_number" :value="r.room_number" />
      </el-select>
      <span class="text-gray-400 text-sm ml-1">{{ t('diveErp.common.total') }}: {{ filteredList.length }}</span>
      <div class="flex-1" />
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.guests.addGuest") }}</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="filteredList"
      border
      stripe
      style="width: 100%"
      class="flex-1"
      height="100%"
      row-key="id"
      :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="px-4 py-3">
            <p class="text-gray-600 text-sm font-medium mb-2">{{ t("diveErp.guests.tripHistory") }}</p>
            <template v-if="row.tripParticipations?.length">
              <el-table :data="row.tripParticipations" border size="small" style="max-width: 700px">
                <el-table-column :label="t('diveErp.trips.tripDate')" width="110">
                  <template #default="{ row: p }">{{ p.trip?.trip_date || '—' }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.trips.destination')" width="140">
                  <template #default="{ row: p }">{{ p.trip?.destination || '—' }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.common.status')" width="100">
                  <template #default="{ row: p }">
                    <el-tag size="small">{{ p.status || '—' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="t('diveErp.trips.departure')" width="100">
                  <template #default="{ row: p }">{{ p.trip?.departure_time || '—' }}</template>
                </el-table-column>
              </el-table>
            </template>
            <span v-else class="text-gray-400 text-sm">{{ t("diveErp.guests.noTrips") }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="guest_id" :label="t('diveErp.guests.guestId')" width="100" align="center">
        <template #default="{ row }">{{ row.guest_id || "—" }}</template>
      </el-table-column>
      <el-table-column prop="name_en" :label="t('diveErp.guests.nameEn')" min-width="120" />
      <el-table-column prop="name_cn" :label="t('diveErp.guests.nameCn')" width="110" />
      <el-table-column :label="t('diveErp.guests.gender')" width="80" align="center">
        <template #default="{ row }">
          {{ row.gender === "male" ? t("diveErp.guests.male") : row.gender === "female" ? t("diveErp.guests.female") : t("diveErp.guests.other") }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" :label="t('diveErp.common.phone')" width="130" />
      <el-table-column prop="passport_number" :label="t('diveErp.guests.passportNo')" width="130" />
      <el-table-column prop="learning_content" :label="t('diveErp.guests.learningContent')" width="140" align="center">
        <template #default="{ row }">
          <span v-if="row.learning_contents?.length">{{ row.learning_contents.map(learningContentLabel).join(" / ") }}</span>
          <span v-else>{{ row.learning_content ? learningContentLabel(row.learning_content) : "—" }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.students.stayRequired')" width="80" align="center">
        <template #default="{ row }">{{ row.stay_required ? t("diveErp.common.yes") : t("diveErp.common.no") }}</template>
      </el-table-column>
      <el-table-column :label="t('diveErp.students.roomSharing')" width="90" align="center">
        <template #default="{ row }">
          <span v-if="!row.stay_required">—</span>
          <span v-else>{{ row.room_sharing_preference === "shared" ? t("diveErp.common.yes") : t("diveErp.common.no") }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.guests.room')" width="90" align="center">
        <template #default="{ row }">{{ row.room?.room_number || "—" }}</template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.title')" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.tripParticipations?.length" size="small" type="success">
            {{ row.tripParticipations.length }}
          </el-tag>
          <span v-else class="text-gray-400">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : row.status === 'completed' ? 'info' : ''" size="small">
            {{ row.status === 'active' ? t('diveErp.guests.inHouse') : row.status === 'completed' ? t('diveErp.guests.completed') : t('diveErp.guests.pending') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.common.actions')" width="220" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="(row.tripParticipations || []).length > 0"
            link
            type="success"
            size="small"
            @click="handleGeneratePdf(row)"
          >
            生成行程单
          </el-button>
          <el-button link type="primary" size="small" @click="openDialog('Edit', row)">{{ t("diveErp.common.edit") }}</el-button>
          <el-popconfirm :title="t('diveErp.guests.deleteConfirm')" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link type="danger" size="small">{{ t("diveErp.common.delete") }}</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('diveErp.guests.editGuest') : t('diveErp.guests.addGuest')"
      width="600px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item v-if="isEdit && form.guest_id" :label="t('diveErp.guests.guestId')">
          <el-input v-model="form.guest_id" disabled />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.englishName')" prop="name_en">
          <el-input v-model="form.name_en" placeholder="Name" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.chineseName')">
          <el-input v-model="form.name_cn" placeholder="Chinese name" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.gender')" prop="gender">
          <el-select v-model="form.gender" style="width: 100%">
            <el-option :label="t('diveErp.guests.male')" value="male" />
            <el-option :label="t('diveErp.guests.female')" value="female" />
            <el-option :label="t('diveErp.guests.other')" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.phone')" prop="phone">
          <el-input v-model="form.phone" placeholder="+60..." />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.passportNo')" prop="passport_number">
          <el-input v-model="form.passport_number" placeholder="Passport number" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.nationality')">
          <el-input v-model="form.nationality" placeholder="e.g. China" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.birthDate')">
          <el-date-picker v-model="form.birth_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.passportExpiry')">
          <el-date-picker v-model="form.passport_expiry" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.email')">
          <el-input v-model="form.email" placeholder="email@example.com" />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.wechat')">
          <el-input v-model="form.wechat" placeholder="WeChat ID" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.emergencyContact')">
          <el-input v-model="form.emergency_contact" placeholder="Contact name" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.emergencyPhone')">
          <el-input v-model="form.emergency_phone" placeholder="+60..." />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.learningContent')">
          <el-select v-model="form.learning_content" multiple clearable collapse-tags collapse-tags-tooltip style="width: 100%">
            <el-option v-for="opt in learningContentOptions" :key="opt" :label="learningContentLabel(opt)" :value="opt" />
          </el-select>
        </el-form-item>
        <template v-if="selectedFunDiveRoutesInForm.length">
          <el-form-item
            v-for="route in selectedFunDiveRoutesInForm"
            :key="route"
            :label="t('diveErp.enroll.funDiveDateLabel', { route: learningContentLabel(route) })"
          >
            <el-date-picker
              v-model="form.fun_dive_date_map[route]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('diveErp.enroll.funDiveDatePlaceholder', { route: learningContentLabel(route) })"
              style="width: 100%"
            />
          </el-form-item>
        </template>
        <el-form-item :label="t('diveErp.students.stayRequired')">
          <el-radio-group v-model="form.stay_required">
            <el-radio :value="true">{{ t('diveErp.common.yes') }}</el-radio>
            <el-radio :value="false">{{ t('diveErp.common.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.stay_required">
          <el-form-item :label="t('diveErp.enroll.stayDates')">
            <el-date-picker
              v-model="form.stay_dates"
              type="daterange"
              value-format="YYYY-MM-DD"
              :range-separator="t('diveErp.enroll.rangeSeparator')"
              :start-placeholder="t('diveErp.guests.checkIn')"
              :end-placeholder="t('diveErp.guests.checkOut')"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item :label="t('diveErp.students.roomSharing')">
            <el-radio-group v-model="form.room_sharing_preference">
              <el-radio value="shared">{{ t('diveErp.common.yes') }}</el-radio>
              <el-radio value="private">{{ t('diveErp.common.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
        <el-form-item :label="t('diveErp.students.sipadanTrip')">
          <el-radio-group v-model="form.sipadan_trip">
            <el-radio :value="true">{{ t('diveErp.common.yes') }}</el-radio>
            <el-radio :value="false">{{ t('diveErp.common.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.room')">
          <el-select v-model="form.room_id" :placeholder="t('diveErp.guests.emptyRoom')" clearable style="width: 100%">
            <el-option v-for="r in rooms" :key="r.id" :label="r.room_number" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('diveErp.guests.pending')" value="pending" />
            <el-option :label="t('diveErp.guests.inHouse')" value="active" />
            <el-option :label="t('diveErp.guests.completed')" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.notes')">
          <el-input v-model="form.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("diveErp.common.cancel") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="onSubmit">{{ t("diveErp.common.ok") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "@element-plus/icons-vue";
import { message } from "@/utils/message";
import { studentApi, roomApi, tripApi } from "@/api/dive";

defineOptions({ name: "DiveStudents" });

const { t } = useI18n();

const learningContentOptions = [
  "DSD",
  "OW",
  "AOW",
  "OW+AOW",
  "Snorkeling",
  "Hiking",
  "Razor Side-mounted",
  "Tech 40",
  "Tech 50",
  "Fun Dive-马达京路线",
  "Fun Dive-西亚米路线",
  "Fun Dive-马布岛路线"
];
const FUN_DIVE_OPTIONS = [
  "Fun Dive-马达京路线",
  "Fun Dive-西亚米路线",
  "Fun Dive-马布岛路线"
];
const learningContentLabel = (value: string) => {
  const keyMap: Record<string, string> = {
    DSD: "diveErp.enroll.learningOptions.dsd",
    OW: "diveErp.enroll.learningOptions.ow",
    AOW: "diveErp.enroll.learningOptions.aow",
    "OW+AOW": "diveErp.enroll.learningOptions.owAow",
    Snorkeling: "diveErp.enroll.learningOptions.snorkeling",
    Hiking: "diveErp.enroll.learningOptions.hiking",
    "Razor Side-mounted": "diveErp.enroll.learningOptions.razor",
    "Tech 40": "diveErp.enroll.learningOptions.tech40",
    "Tech 50": "diveErp.enroll.learningOptions.tech50",
    "Fun Dive-马达京路线": "diveErp.enroll.learningOptions.funDiveMataking",
    "Fun Dive-西亚米路线": "diveErp.enroll.learningOptions.funDiveSiAmil",
    "Fun Dive-马布岛路线": "diveErp.enroll.learningOptions.funDiveMabul"
  };
  return t(keyMap[value] || value);
};
const ENROLL_META_PREFIX = "ENROLL_META:";
const apiBase = (import.meta.env.VITE_API_BASE as string) || "/api";

function resolveBackendFileUrl(fileUrl: string) {
  if (!fileUrl) return "";
  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  let base = "";
  if (/^https?:\/\//.test(apiBase)) {
    base = apiBase.replace(/\/api\/?$/, "");
  } else {
    // 当前部署 frontend 在 8082，backend 在 3000，/uploads 需要直连 backend
    base = `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return `${base}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}

const loading = ref(false);
const dataList = ref<any[]>([]);
const rooms = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();

// 搜索和筛选
const searchText = ref("");
const filterGender = ref("");
const filterStatus = ref("");
const filterLearning = ref("");
const filterRoom = ref("");

const filteredList = computed(() => {
  let list = dataList.value;
  const kw = searchText.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(r =>
      (r.guest_id || "").toLowerCase().includes(kw) ||
      (r.name_en || "").toLowerCase().includes(kw) ||
      (r.name_cn || "").toLowerCase().includes(kw) ||
      (r.phone || "").toLowerCase().includes(kw) ||
      (r.passport_number || "").toLowerCase().includes(kw) ||
      (r.email || "").toLowerCase().includes(kw) ||
      (r.nationality || "").toLowerCase().includes(kw) ||
      (r.wechat || "").toLowerCase().includes(kw)
    );
  }
  if (filterGender.value) list = list.filter(r => r.gender === filterGender.value);
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value);
  if (filterLearning.value) {
    list = list.filter(r =>
      Array.isArray(r.learning_contents)
        ? r.learning_contents.includes(filterLearning.value)
        : r.learning_content === filterLearning.value
    );
  }
  if (filterRoom.value) list = list.filter(r => r.room?.room_number === filterRoom.value);
  return list;
});

function applyFilter() {
  // computed 自动响应，无需手动触发
}

const form = reactive({
  id: null as number | null,
  guest_id: "",
  name_en: "",
  name_cn: "",
  gender: "male",
  phone: "",
  passport_number: "",
  nationality: "",
  birth_date: "",
  passport_expiry: "",
  email: "",
  wechat: "",
  emergency_contact: "",
  emergency_phone: "",
  learning_content: [] as string[],
  fun_dive_date_map: {} as Record<string, string>,
  stay_required: false,
  stay_dates: [] as string[],
  room_sharing_preference: "private" as "shared" | "private",
  sipadan_trip: false,
  room_id: null as number | null,
  check_in_date: "",
  check_out_date: "",
  status: "pending",
  notes: ""
});
const selectedFunDiveRoutesInForm = computed(() =>
  form.learning_content.filter(item => FUN_DIVE_OPTIONS.includes(item))
);

const rules = {
  name_en: [{ required: true, message: "Required", trigger: "blur" }],
  phone: [{ required: true, message: "Required", trigger: "blur" }],
  passport_number: [{ required: true, message: "Required", trigger: "blur" }]
};

function parseEnrollMeta(specialRequirements: string) {
  const lines = String(specialRequirements || "").split("\n");
  const metaLine = lines.find(line => line.startsWith(ENROLL_META_PREFIX));
  if (!metaLine) return {};
  try {
    return JSON.parse(metaLine.slice(ENROLL_META_PREFIX.length));
  } catch (_) {
    return {};
  }
}

function normalizeFunDiveDateMap(funDiveDates: any) {
  if (!Array.isArray(funDiveDates)) return {};
  if (funDiveDates.length && typeof funDiveDates[0] === "string") {
    const map: Record<string, string> = {};
    FUN_DIVE_OPTIONS.forEach((route, idx) => {
      map[route] = funDiveDates[idx] || "";
    });
    return map;
  }
  const map: Record<string, string> = {};
  funDiveDates.forEach((item: any) => {
    if (item?.route) map[item.route] = item.date || "";
  });
  return map;
}

watch(selectedFunDiveRoutesInForm, (routes) => {
  const nextMap: Record<string, string> = {};
  routes.forEach((route) => {
    nextMap[route] = form.fun_dive_date_map[route] || "";
  });
  form.fun_dive_date_map = nextMap;
}, { immediate: true });

async function loadRooms() {
  try {
    const res = await roomApi.list();
    rooms.value = (res as any)?.data ?? [];
  } catch (_) {}
}

async function loadList() {
  loading.value = true;
  try {
    const res = await studentApi.list({ limit: 500 });
    const d = (res as any)?.data;
    // 同时加载行程参与记录
    const students = d?.students ?? (Array.isArray(d) ? d : []);
    // 加载每个学员的行程信息
    try {
      const tripRes = await tripApi.list();
      const trips = (tripRes as any)?.data ?? [];
      // 为每个学员附加行程参与信息
      students.forEach((s: any) => {
        s.tripParticipations = [];
        trips.forEach((trip: any) => {
          const found = (trip.participants || []).find((p: any) => p.student?.id === s.id || p.student_id === s.id);
          if (found) {
            s.tripParticipations.push({ ...found, trip });
          }
        });
      });
    } catch (_) {}
    dataList.value = students.map((student: any) => {
      const meta = parseEnrollMeta(student.special_requirements);
      return {
        ...student,
        learning_contents: Array.isArray(meta.learning_contents)
          ? meta.learning_contents
          : (student.learning_content ? [student.learning_content] : []),
        fun_dive_date_map: normalizeFunDiveDateMap(meta.fun_dive_dates),
        stay_required: meta.stay_required === true,
        room_sharing_preference: meta.room_sharing_preference || "private",
        sipadan_trip: meta.sipadan_trip === true
      };
    });
  } catch (e) {
    message(t("diveErp.guests.loadFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
}

function openDialog(_title?: string, row?: any) {
  isEdit.value = !!row;
  if (row) {
    form.id = row.id;
    form.guest_id = row.guest_id || "";
    form.name_en = row.name_en || "";
    form.name_cn = row.name_cn || "";
    form.gender = row.gender || "male";
    form.phone = row.phone || "";
    form.passport_number = row.passport_number || "";
    form.nationality = row.nationality || "";
    form.birth_date = row.birth_date || "";
    form.passport_expiry = row.passport_expiry || "";
    form.email = row.email || "";
    form.wechat = row.wechat || "";
    form.emergency_contact = row.emergency_contact || "";
    form.emergency_phone = row.emergency_phone || "";
    form.learning_content = Array.isArray(row.learning_contents)
      ? row.learning_contents
      : (row.learning_content ? [row.learning_content] : []);
    form.fun_dive_date_map = row.fun_dive_date_map || {};
    form.stay_required = row.stay_required === true;
    form.room_sharing_preference = row.room_sharing_preference || "private";
    form.room_id = row.room_id ?? row.room?.id ?? null;
    form.check_in_date = row.check_in_date || "";
    form.check_out_date = row.check_out_date || "";
    form.stay_dates = row.check_in_date || row.check_out_date ? [row.check_in_date, row.check_out_date].filter(Boolean) : [];
    form.sipadan_trip = row.sipadan_trip === true;
    form.status = row.status || "pending";
    form.notes = row.notes || "";
  }
  dialogVisible.value = true;
}

function resetForm() {
  form.id = null;
  form.guest_id = "";
  form.name_en = "";
  form.name_cn = "";
  form.gender = "male";
  form.phone = "";
  form.passport_number = "";
  form.nationality = "";
  form.birth_date = "";
  form.passport_expiry = "";
  form.email = "";
  form.wechat = "";
  form.emergency_contact = "";
  form.emergency_phone = "";
  form.learning_content = [];
  form.fun_dive_date_map = {};
  form.stay_required = false;
  form.stay_dates = [];
  form.room_sharing_preference = "private";
  form.sipadan_trip = false;
  form.room_id = null;
  form.check_in_date = "";
  form.check_out_date = "";
  form.status = "pending";
  form.notes = "";
}

async function onSubmit() {
  try {
    if (formRef.value) await formRef.value.validate();
  } catch (_) {
    return;
  }
  submitLoading.value = true;
  try {
    const payload: any = {
      name_en: form.name_en,
      name_cn: form.name_cn || null,
      gender: form.gender,
      phone: form.phone,
      passport_number: form.passport_number,
      nationality: form.nationality || null,
      birth_date: form.birth_date || null,
      passport_expiry: form.passport_expiry || null,
      email: form.email || null,
      wechat: form.wechat || null,
      emergency_contact: form.emergency_contact || null,
      emergency_phone: form.emergency_phone || null,
      learning_content: form.learning_content,
      fun_dive_dates: selectedFunDiveRoutesInForm.value.map(route => ({
        route,
        date: form.fun_dive_date_map[route] || null
      })),
      stay_required: form.stay_required,
      room_sharing_preference: form.stay_required ? form.room_sharing_preference : null,
      room_id: form.room_id || null,
      check_in_date: form.stay_required ? (form.stay_dates?.[0] || null) : null,
      check_out_date: form.stay_required ? (form.stay_dates?.[1] || null) : null,
      sipadan_trip: form.sipadan_trip,
      status: form.status,
      notes: form.notes || null
    };
    if (isEdit.value && form.id != null) {
      await studentApi.update(form.id, payload);
      message(t("diveErp.common.editSuccess"));
    } else {
      await studentApi.create(payload);
      message(t("diveErp.common.addSuccess"));
    }
    dialogVisible.value = false;
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || t("diveErp.common.requestFailed"), { type: "error" });
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(row: any) {
  try {
    await studentApi.delete(row.id);
    message(t("diveErp.common.deleteSuccess"));
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || t("diveErp.common.deleteFailed"), { type: "error" });
  }
}

async function handleGeneratePdf(row: any) {
  try {
    const res = await studentApi.generateItineraryPdf(row.id);
    const data = (res as any)?.data;
    if (data?.pdfUrl) {
      const url = resolveBackendFileUrl(data.pdfUrl);
      window.open(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, "_blank");
    } else if (data?.downloadUrl) {
      window.open(resolveBackendFileUrl(data.downloadUrl), "_blank");
    }
    message("行程单已生成（如有修改可重新生成覆盖）", { type: "success" });
  } catch (e: any) {
    message(e?.response?.data?.message || "生成行程单失败", { type: "error" });
  }
}

onMounted(() => {
  loadRooms();
  loadList();
});
</script>

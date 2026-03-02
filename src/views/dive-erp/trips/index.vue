<template>
  <div class="main flex flex-col h-full p-4 gap-3">
    <!-- 顶部工具栏 -->
    <div class="flex flex-wrap items-center gap-2">
      <el-input
        v-model="searchText"
        :placeholder="t('diveErp.common.search')"
        clearable
        style="width: 220px"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="filterDestination" clearable :placeholder="t('diveErp.trips.destination')" style="width: 150px">
        <el-option label="Mabul Island" value="Mabul Island" />
        <el-option label="Mataking Island" value="Mataking Island" />
        <el-option label="Sipadan" value="Sipadan" />
        <el-option label="Si Amil Island" value="Si Amil Island" />
      </el-select>
      <el-select v-model="filterStatus" clearable :placeholder="t('diveErp.common.status')" style="width: 120px">
        <el-option :label="t('diveErp.trips.scheduled')" value="scheduled" />
        <el-option :label="t('diveErp.guests.completed')" value="completed" />
        <el-option :label="t('diveErp.trips.cancelled')" value="cancelled" />
      </el-select>
      <el-date-picker
        v-model="filterDate"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="t('diveErp.trips.tripDate')"
        clearable
        style="width: 150px"
      />
      <span class="text-gray-400 text-sm ml-1">{{ t('diveErp.common.total') }}: {{ filteredList.length }}</span>
      <div class="flex-1" />
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.trips.addTrip") }}</el-button>
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
            <p class="text-gray-600 text-sm font-medium mb-2">{{ t("diveErp.trips.guestList") }}</p>
            <template v-if="row.participants?.length">
              <el-table :data="row.participants" border size="small" style="width: 100%">
                <el-table-column :label="t('diveErp.guests.guestId')" width="100">
                  <template #default="{ row: p }">{{ p.student?.guest_id || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.common.name')" min-width="130">
                  <template #default="{ row: p }">{{ p.student?.name_cn || p.student?.name_en || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.guests.learningContent')" width="150">
                  <template #default="{ row: p }">{{ p.student?.learning_content || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.guests.room')" width="90">
                  <template #default="{ row: p }">{{ p.student?.room?.room_number || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.common.phone')" width="130">
                  <template #default="{ row: p }">{{ p.student?.phone || "—" }}</template>
                </el-table-column>
              </el-table>
            </template>
            <span v-else class="text-gray-400 text-sm">{{ t("diveErp.trips.noGuests") }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="t('diveErp.common.id')" width="60" align="center" />
      <el-table-column prop="trip_date" :label="t('diveErp.trips.tripDate')" width="115" align="center" />
      <el-table-column prop="destination" :label="t('diveErp.trips.destination')" min-width="130" />
      <el-table-column :label="t('diveErp.trips.boat')" width="110">
        <template #default="{ row }">{{ row.boat?.boat_name || row.boat_name || "-" }}</template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.captain')" width="100">
        <template #default="{ row }">{{ row.captain?.name_en || row.captain?.name || "-" }}</template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.dm')" min-width="120">
        <template #default="{ row }">
          <span v-if="getDmList(row).length">
            <el-tag v-for="dm in getDmList(row)" :key="dm.id" size="small" class="mr-1">{{ dm.name_en || dm.name }}</el-tag>
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.instructor')" min-width="120">
        <template #default="{ row }">
          <span v-if="getInstructorList(row).length">
            <el-tag v-for="ins in getInstructorList(row)" :key="ins.id" size="small" type="success" class="mr-1">{{ ins.name_en || ins.name }}</el-tag>
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.departure')" width="95" align="center">
        <template #default="{ row }">{{ row.departure_time || "-" }}</template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.participants')" width="100" align="center">
        <template #default="{ row }">{{ row.current_participants ?? 0 }}/{{ row.max_participants ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'scheduled' ? 'success' : row.status === 'cancelled' ? 'danger' : 'info'" size="small">
            {{ row.status === "scheduled" ? t("diveErp.trips.scheduled") : row.status === "cancelled" ? t("diveErp.trips.cancelled") : row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.common.actions')" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog('Edit', row)">{{ t("diveErp.common.edit") }}</el-button>
          <el-popconfirm :title="t('diveErp.trips.deleteConfirm')" @confirm="handleDelete(row)">
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
      :title="isEdit ? t('diveErp.trips.editTrip') : t('diveErp.trips.addTrip')"
      width="560px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('diveErp.trips.tripDate')" prop="trip_date">
          <el-date-picker v-model="form.trip_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.destination')" prop="destination">
          <el-select v-model="form.destination" style="width: 100%">
            <el-option label="Mabul Island" value="Mabul Island" />
            <el-option label="Mataking Island" value="Mataking Island" />
            <el-option label="Sipadan" value="Sipadan" />
            <el-option label="Si Amil Island" value="Si Amil Island" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.boat')" prop="boat_id">
          <el-select v-model="form.boat_id" style="width: 100%">
            <el-option v-for="b in boats" :key="b.id" :label="b.boat_name || b.boat_number" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.captain')">
          <el-select v-model="form.captain_id" clearable style="width: 100%">
            <el-option v-for="s in captains" :key="s.id" :label="s.name_en || s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <!-- 多DM -->
        <el-form-item :label="t('diveErp.trips.dm')">
          <el-select v-model="form.dm_ids" multiple filterable clearable style="width: 100%">
            <el-option v-for="s in dms" :key="s.id" :label="s.name_en || s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <!-- 多教练 -->
        <el-form-item :label="t('diveErp.trips.instructor')">
          <el-select v-model="form.instructor_ids" multiple filterable clearable style="width: 100%">
            <el-option v-for="s in instructors" :key="s.id" :label="s.name_en || s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.guestList')">
          <el-select v-model="form.participant_student_ids" multiple filterable style="width: 100%">
            <el-option
              v-for="s in allStudents"
              :key="s.id"
              :label="(s.name_cn || s.name_en || '-') + (s.learning_content ? ` · ${s.learning_content}` : '')"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.departure')">
          <el-time-picker v-model="form.departure_time" value-format="HH:mm:ss" format="HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.maxParticipants')">
          <el-input-number v-model="form.max_participants" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('diveErp.trips.scheduled')" value="scheduled" />
            <el-option :label="t('diveErp.guests.completed')" value="completed" />
            <el-option :label="t('diveErp.trips.cancelled')" value="cancelled" />
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
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "@element-plus/icons-vue";
import { message } from "@/utils/message";
import { tripApi, boatApi, staffApi, studentApi } from "@/api/dive";

defineOptions({ name: "DiveTrips" });

const { t } = useI18n();

const loading = ref(false);
const dataList = ref<any[]>([]);
const boats = ref<any[]>([]);
const staffList = ref<any[]>([]);
const allStudents = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();
const currentParticipantIds = ref<number[]>([]);

// 搜索和筛选
const searchText = ref("");
const filterDestination = ref("");
const filterStatus = ref("");
const filterDate = ref("");

const captains = computed(() => staffList.value.filter((s: any) => s.role === "captain"));
const dms = computed(() => staffList.value.filter((s: any) => s.role === "dm"));
const instructors = computed(() => staffList.value.filter((s: any) => s.role === "instructor"));

const filteredList = computed(() => {
  let list = dataList.value;
  const kw = searchText.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(r =>
      (r.trip_date || "").includes(kw) ||
      (r.destination || "").toLowerCase().includes(kw) ||
      (r.boat?.boat_name || "").toLowerCase().includes(kw) ||
      (r.captain?.name_en || r.captain?.name || "").toLowerCase().includes(kw) ||
      getDmList(r).some((d: any) => (d.name_en || d.name || "").toLowerCase().includes(kw)) ||
      getInstructorList(r).some((i: any) => (i.name_en || i.name || "").toLowerCase().includes(kw)) ||
      (r.status || "").toLowerCase().includes(kw)
    );
  }
  if (filterDestination.value) list = list.filter(r => r.destination === filterDestination.value);
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value);
  if (filterDate.value) list = list.filter(r => r.trip_date === filterDate.value);
  return list;
});

// 获取行程的DM列表（兼容新旧数据）
function getDmList(row: any): any[] {
  const fromTripStaff = (row.tripStaff || [])
    .filter((ts: any) => ts.role === 'dm')
    .map((ts: any) => ts.staff)
    .filter(Boolean);
  if (fromTripStaff.length > 0) return fromTripStaff;
  if (row.dm) return [row.dm];
  return [];
}

// 获取行程的教练列表（兼容新旧数据）
function getInstructorList(row: any): any[] {
  const fromTripStaff = (row.tripStaff || [])
    .filter((ts: any) => ts.role === 'instructor')
    .map((ts: any) => ts.staff)
    .filter(Boolean);
  if (fromTripStaff.length > 0) return fromTripStaff;
  if (row.instructor) return [row.instructor];
  return [];
}

const form = reactive({
  id: null as number | null,
  trip_date: "",
  destination: "Mabul Island",
  boat_id: null as number | null,
  captain_id: null as number | null,
  dm_ids: [] as number[],
  instructor_ids: [] as number[],
  departure_time: "",
  max_participants: 20,
  status: "scheduled",
  notes: "",
  participant_student_ids: [] as number[]
});

const rules = {
  trip_date: [{ required: true, message: "Required", trigger: "change" }],
  destination: [{ required: true, message: "Required", trigger: "change" }],
  boat_id: [{ required: true, message: "Required", trigger: "change" }]
};

async function loadBoatsAndStaff() {
  try {
    const [bRes, sRes, stuRes] = await Promise.all([
      boatApi.list(),
      staffApi.list(),
      studentApi.list({ limit: 500 })
    ]);
    boats.value = (bRes as any)?.data ?? [];
    staffList.value = (sRes as any)?.data ?? [];
    const d = (stuRes as any)?.data;
    allStudents.value = d?.students ?? (Array.isArray(d) ? d : []);
  } catch (_) {}
}

async function loadList() {
  loading.value = true;
  try {
    const res = await tripApi.list();
    dataList.value = (res && (res as any).data) ? (res as any).data : [];
  } catch (e) {
    message(t("diveErp.trips.loadFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
}

function openDialog(_title?: string, row?: any) {
  isEdit.value = !!row;
  if (row) {
    form.id = row.id;
    form.trip_date = row.trip_date;
    form.destination = row.destination;
    form.boat_id = row.boat_id ?? row.boat?.id;
    form.captain_id = row.captain_id ?? row.captain?.id;
    // 从 tripStaff 中提取多DM/教练 IDs
    form.dm_ids = getDmList(row).map((d: any) => d.id).filter(Boolean);
    form.instructor_ids = getInstructorList(row).map((i: any) => i.id).filter(Boolean);
    form.departure_time = row.departure_time || "";
    form.max_participants = row.max_participants ?? 20;
    form.status = row.status || "scheduled";
    form.notes = row.notes || "";
    const ids = (row.participants || [])
      .map((p: any) => p.student?.id)
      .filter((id: any) => typeof id === "number");
    form.participant_student_ids = ids;
    currentParticipantIds.value = [...ids];
  } else {
    resetForm();
  }
  dialogVisible.value = true;
}

function resetForm() {
  form.id = null;
  form.trip_date = "";
  form.destination = "Mabul Island";
  form.boat_id = null;
  form.captain_id = null;
  form.dm_ids = [];
  form.instructor_ids = [];
  form.departure_time = "";
  form.max_participants = 20;
  form.status = "scheduled";
  form.notes = "";
  form.participant_student_ids = [];
  currentParticipantIds.value = [];
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
      trip_date: form.trip_date,
      destination: form.destination,
      boat_id: form.boat_id,
      captain_id: form.captain_id || null,
      // 保留旧字段兼容（取第一个）
      dm_id: form.dm_ids[0] || null,
      instructor_id: form.instructor_ids[0] || null,
      // 新多人字段
      dm_ids: form.dm_ids,
      instructor_ids: form.instructor_ids,
      departure_time: form.departure_time || null,
      max_participants: form.max_participants,
      status: form.status,
      notes: form.notes || null
    };

    let tripId: number | null = null;
    if (isEdit.value && form.id != null) {
      const res = await tripApi.update(form.id, payload);
      tripId = (res as any)?.data?.id ?? form.id;
      message(t("diveErp.common.edit") + " OK");
    } else {
      const res = await tripApi.create(payload);
      const created = (res as any)?.data;
      tripId = created?.id ?? null;
      message(t("diveErp.common.add") + " OK");
    }

    // 同步参与者
    if (tripId != null) {
      const selectedIds = form.participant_student_ids || [];
      const originalIds = currentParticipantIds.value || [];
      const toAdd = selectedIds.filter(id => !originalIds.includes(id));
      const toRemove = originalIds.filter(id => !selectedIds.includes(id));
      for (const id of toAdd) {
        try { await tripApi.addParticipant(tripId, { student_id: id }); } catch (_) {}
      }
      for (const id of toRemove) {
        try { await tripApi.removeParticipant(tripId, { student_id: id }); } catch (_) {}
      }
    }

    dialogVisible.value = false;
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || "Request failed", { type: "error" });
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(row: any) {
  try {
    await tripApi.delete(row.id);
    message(t("diveErp.common.delete") + " OK");
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || "Delete failed", { type: "error" });
  }
}

onMounted(() => {
  loadBoatsAndStaff();
  loadList();
});
</script>

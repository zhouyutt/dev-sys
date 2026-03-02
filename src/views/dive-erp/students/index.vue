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
        <template #default="{ row }">{{ row.learning_content || "—" }}</template>
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
      <el-table-column :label="t('diveErp.common.actions')" width="140" fixed="right" align="center">
        <template #default="{ row }">
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
        <el-form-item label="WeChat">
          <el-input v-model="form.wechat" placeholder="WeChat ID" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.emergencyContact')">
          <el-input v-model="form.emergency_contact" placeholder="Contact name" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.emergencyPhone')">
          <el-input v-model="form.emergency_phone" placeholder="+60..." />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.learningContent')">
          <el-select v-model="form.learning_content" clearable style="width: 100%">
            <el-option v-for="opt in learningContentOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.room')">
          <el-select v-model="form.room_id" :placeholder="t('diveErp.guests.emptyRoom')" clearable style="width: 100%">
            <el-option v-for="r in rooms" :key="r.id" :label="r.room_number" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.checkIn')">
          <el-date-picker v-model="form.check_in_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.checkOut')">
          <el-date-picker v-model="form.check_out_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
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
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "@element-plus/icons-vue";
import { message } from "@/utils/message";
import { studentApi, roomApi, tripApi } from "@/api/dive";

defineOptions({ name: "DiveStudents" });

const { t } = useI18n();

const learningContentOptions = [
  "OW", "AOW", "OW+AOW", "FunDive", "DSD", "Snorkeling",
  "Razor Side-mounted", "Tech 40", "Tech 50"
];

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
  if (filterLearning.value) list = list.filter(r => r.learning_content === filterLearning.value);
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
  learning_content: "" as string,
  room_id: null as number | null,
  check_in_date: "",
  check_out_date: "",
  status: "pending",
  notes: ""
});

const rules = {
  name_en: [{ required: true, message: "Required", trigger: "blur" }],
  phone: [{ required: true, message: "Required", trigger: "blur" }],
  passport_number: [{ required: true, message: "Required", trigger: "blur" }]
};

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
    dataList.value = students;
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
    form.learning_content = row.learning_content || "";
    form.room_id = row.room_id ?? row.room?.id ?? null;
    form.check_in_date = row.check_in_date || "";
    form.check_out_date = row.check_out_date || "";
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
  form.learning_content = "";
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
      learning_content: form.learning_content || null,
      room_id: form.room_id || null,
      check_in_date: form.check_in_date || null,
      check_out_date: form.check_out_date || null,
      status: form.status,
      notes: form.notes || null
    };
    if (isEdit.value && form.id != null) {
      await studentApi.update(form.id, payload);
      message(t("diveErp.common.edit") + " OK");
    } else {
      await studentApi.create(payload);
      message(t("diveErp.common.add") + " OK");
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
    await studentApi.delete(row.id);
    message(t("diveErp.common.delete") + " OK");
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || "Delete failed", { type: "error" });
  }
}

onMounted(() => {
  loadRooms();
  loadList();
});
</script>

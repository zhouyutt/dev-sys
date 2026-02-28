<template>
  <div class="main p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">{{ t("diveErp.trips.title") }}</h2>
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.trips.addTrip") }}</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
      row-key="id"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="px-4 py-3">
            <p class="text-gray-600 text-sm font-medium mb-2">{{ t("diveErp.trips.guestList") }}</p>
            <template v-if="row.participants?.length">
              <el-table :data="row.participants" border size="small" style="width: 100%">
                <el-table-column :label="t('diveErp.guests.guestId')" width="120">
                  <template #default="{ row: p }">{{ p.student?.guest_id || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.common.name')" min-width="140">
                  <template #default="{ row: p }">{{ p.student?.name_cn || p.student?.name_en || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.guests.learningContent')" width="160">
                  <template #default="{ row: p }">{{ p.student?.learning_content || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.guests.room')" width="100">
                  <template #default="{ row: p }">{{ p.student?.room?.room_number || "—" }}</template>
                </el-table-column>
                <el-table-column :label="t('diveErp.common.phone')" width="140">
                  <template #default="{ row: p }">{{ p.student?.phone || "—" }}</template>
                </el-table-column>
              </el-table>
            </template>
            <span v-else class="text-gray-400 text-sm">{{ t("diveErp.trips.noGuests") }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="t('diveErp.common.id')" width="70" align="center" />
      <el-table-column prop="trip_date" :label="t('diveErp.trips.tripDate')" width="120" align="center" />
      <el-table-column prop="destination" :label="t('diveErp.trips.destination')" width="140" />
      <el-table-column :label="t('diveErp.trips.boat')" width="120">
        <template #default="{ row }">
          {{ row.boat?.boat_name || row.boat_name || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.captain')" width="100">
        <template #default="{ row }">
          {{ row.captain?.name_en || row.captain?.name || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.dm')" width="100">
        <template #default="{ row }">
          {{ row.dm?.name_en || row.dm?.name || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.instructor')" width="100">
        <template #default="{ row }">
          {{ row.instructor?.name_en || row.instructor?.name || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.departure')" width="100" align="center">
        <template #default="{ row }">
          {{ row.departure_time || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.trips.participants')" width="110" align="center">
        <template #default="{ row }">
          {{ row.current_participants ?? 0 }}/{{ row.max_participants ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'scheduled' ? 'success' : 'info'" size="small">
            {{ row.status === "scheduled" ? t("diveErp.trips.scheduled") : row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.common.actions')" width="160" fixed="right" align="center">
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

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('diveErp.trips.editTrip') : t('diveErp.trips.addTrip')"
      width="520px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('diveErp.trips.tripDate')" prop="trip_date">
          <el-date-picker
            v-model="form.trip_date"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="t('diveErp.trips.selectDate')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.destination')" prop="destination">
          <el-select v-model="form.destination" :placeholder="t('diveErp.trips.selectDestination')" style="width: 100%">
            <el-option label="Mabul Island" value="Mabul Island" />
            <el-option label="Mataking Island" value="Mataking Island" />
            <el-option label="Sipadan" value="Sipadan" />
            <el-option label="Si Amil Island" value="Si Amil Island" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.boat')" prop="boat_id">
          <el-select v-model="form.boat_id" :placeholder="t('diveErp.trips.boat')" style="width: 100%">
            <el-option
              v-for="b in boats"
              :key="b.id"
              :label="b.boat_name || b.boat_number"
              :value="b.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.captain')" prop="captain_id">
          <el-select v-model="form.captain_id" :placeholder="t('diveErp.trips.captain')" clearable style="width: 100%">
            <el-option
              v-for="s in captains"
              :key="s.id"
              :label="s.name_en || s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.dm')" prop="dm_id">
          <el-select v-model="form.dm_id" :placeholder="t('diveErp.trips.dm')" clearable style="width: 100%">
            <el-option
              v-for="s in dms"
              :key="s.id"
              :label="s.name_en || s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.instructor')" prop="instructor_id">
          <el-select v-model="form.instructor_id" :placeholder="t('diveErp.trips.instructor')" clearable style="width: 100%">
            <el-option
              v-for="s in instructors"
              :key="s.id"
              :label="s.name_en || s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.guestList')">
          <el-select
            v-model="form.participant_student_ids"
            multiple
            filterable
            :placeholder="t('diveErp.trips.selectGuests')"
            style="width: 100%"
          >
            <el-option
              v-for="s in allStudents"
              :key="s.id"
              :label="(s.name_cn || s.name_en || '-') + (s.learning_content ? ` · ${s.learning_content}` : '')"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.trips.departure')" prop="departure_time">
          <el-time-picker
            v-model="form.departure_time"
            value-format="HH:mm:ss"
            format="HH:mm:ss"
            :placeholder="t('diveErp.trips.departureTime')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')" prop="status">
          <el-select v-model="form.status" :placeholder="t('diveErp.common.status')" style="width: 100%">
            <el-option :label="t('diveErp.trips.scheduled')" value="scheduled" />
            <el-option :label="t('diveErp.guests.completed')" value="completed" />
            <el-option :label="t('diveErp.trips.cancelled')" value="cancelled" />
          </el-select>
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
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
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

const captains = computed(() =>
  staffList.value.filter((s: any) => s.role === "captain")
);
const dms = computed(() =>
  staffList.value.filter((s: any) => s.role === "dm")
);
const instructors = computed(() =>
  staffList.value.filter((s: any) => s.role === "instructor")
);

const form = reactive({
  id: null as number | null,
  trip_date: "",
  destination: "Mabul Island",
  boat_id: null as number | null,
  captain_id: null as number | null,
  dm_id: null as number | null,
  instructor_id: null as number | null,
  departure_time: "",
  status: "scheduled",
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
    form.dm_id = row.dm_id ?? row.dm?.id;
    form.instructor_id = row.instructor_id ?? row.instructor?.id;
    form.departure_time = row.departure_time || "";
    form.status = row.status || "scheduled";
    const ids = (row.participants || [])
      .map((p: any) => p.student?.id)
      .filter((id: any) => typeof id === "number");
    form.participant_student_ids = ids;
    currentParticipantIds.value = [...ids];
  } else {
    form.id = null;
    form.trip_date = "";
    form.destination = "Mabul Island";
    form.boat_id = null;
    form.captain_id = null;
    form.dm_id = null;
    form.instructor_id = null;
    form.departure_time = "";
    form.status = "scheduled";
    form.participant_student_ids = [];
    currentParticipantIds.value = [];
  }
  dialogVisible.value = true;
}

function resetForm() {
  form.id = null;
  form.trip_date = "";
  form.destination = "Mabul Island";
  form.boat_id = null;
  form.captain_id = null;
  form.dm_id = null;
  form.instructor_id = null;
  form.departure_time = "";
  form.status = "scheduled";
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
      captain_id: form.captain_id,
      dm_id: form.dm_id,
      instructor_id: form.instructor_id,
      departure_time: form.departure_time || null,
      status: form.status
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

    if (tripId != null) {
      const selectedIds = form.participant_student_ids || [];
      const originalIds = currentParticipantIds.value || [];
      const toAdd = selectedIds.filter(id => !originalIds.includes(id));
      const toRemove = originalIds.filter(id => !selectedIds.includes(id));

      for (const id of toAdd) {
        try {
          await tripApi.addParticipant(tripId, { student_id: id });
        } catch (_) {}
      }
      for (const id of toRemove) {
        try {
          await tripApi.removeParticipant(tripId, { student_id: id });
        } catch (_) {}
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

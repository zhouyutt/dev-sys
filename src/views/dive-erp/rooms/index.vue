<template>
  <div class="main p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">{{ t("diveErp.rooms.title") }}</h2>
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.rooms.addRoom") }}</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
    >
      <el-table-column prop="id" :label="t('diveErp.common.id')" width="70" align="center" />
      <el-table-column prop="room_number" :label="t('diveErp.rooms.roomNo')" width="100" />
      <el-table-column prop="floor" :label="t('diveErp.rooms.floor')" width="80" align="center" />
      <el-table-column prop="room_type" :label="t('diveErp.rooms.roomType')" min-width="140" />
      <el-table-column :label="t('diveErp.rooms.occupancy')" width="120" align="center">
        <template #default="{ row }">
          {{ row.current_occupancy || 0 }}/{{ row.max_capacity || 3 }} ppl
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'available' ? 'success' : 'danger'" size="small">
            {{ row.status === 'available' ? t("diveErp.rooms.available") : t("diveErp.rooms.occupied") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.rooms.guests')" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">
          <template v-if="row.status !== 'available' && (row.students?.length || 0) > 0">
            <span v-for="(s, i) in (row.students || [])" :key="s.id">
              {{ s.name_cn || s.name_en || '—' }}{{ i < (row.students?.length || 0) - 1 ? '、' : '' }}
            </span>
          </template>
          <span v-else class="text-gray-400">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="notes" :label="t('diveErp.common.notes')" min-width="120" show-overflow-tooltip />
      <el-table-column :label="t('diveErp.common.actions')" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog('Edit', row)">{{ t("diveErp.common.edit") }}</el-button>
          <el-popconfirm :title="t('diveErp.rooms.deleteConfirm')" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link type="danger" size="small">{{ t("diveErp.common.delete") }}</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('diveErp.rooms.editRoom') : t('diveErp.rooms.addRoom')"
      width="480px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('diveErp.rooms.roomNo')" prop="room_number">
          <el-input v-model="form.room_number" placeholder="e.g. A2, B3" />
        </el-form-item>
        <el-form-item :label="t('diveErp.rooms.floor')" prop="floor">
          <el-select v-model="form.floor" :placeholder="t('diveErp.rooms.floor')" style="width: 100%">
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.rooms.roomType')" prop="room_type">
          <el-input v-model="form.room_type" placeholder="e.g. 大床+单人床" />
        </el-form-item>
        <el-form-item :label="t('diveErp.rooms.maxCapacity')" prop="max_capacity">
          <el-input-number v-model="form.max_capacity" :min="1" :max="10" />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')" prop="status">
          <el-select v-model="form.status" :placeholder="t('diveErp.common.status')" style="width: 100%">
            <el-option :label="t('diveErp.rooms.available')" value="available" />
            <el-option :label="t('diveErp.rooms.occupied')" value="occupied" />
            <el-option :label="t('diveErp.rooms.maintenance')" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.rooms.guests')">
          <el-select
            v-model="form.guest_student_ids"
            multiple
            filterable
            :placeholder="t('diveErp.rooms.selectGuests')"
            style="width: 100%"
          >
            <el-option
              v-for="s in allGuests"
              :key="s.id"
              :label="(s.name_cn || s.name_en || '-') + (s.learning_content ? ` · ${s.learning_content}` : '')"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.notes')" prop="notes">
          <el-input v-model="form.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("diveErp.common.cancel") }}</el-button>
        <el-button native-type="button" type="primary" :loading="submitLoading" @click="onSubmit">{{ t("diveErp.common.ok") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { roomApi, studentApi } from "@/api/dive";

defineOptions({ name: "DiveRooms" });

const { t } = useI18n();

const loading = ref(false);
const dataList = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();
const allGuests = ref<any[]>([]);

const form = reactive({
  id: null as number | null,
  room_number: "",
  floor: "A",
  room_type: "大床+单人床",
  max_capacity: 3,
  current_occupancy: 0,
  status: "available",
  notes: "",
  guest_student_ids: [] as number[]
});

const rules = {
  room_number: [{ required: true, message: "Required", trigger: "blur" }],
  floor: [{ required: true, message: "Required", trigger: "change" }]
};

async function loadList(cacheBust = false) {
  loading.value = true;
  try {
    const params = cacheBust ? { _t: Date.now() } : undefined;
    const res = await roomApi.list(params);
    dataList.value = (res && (res as any).data) ? (res as any).data : [];
  } catch (e) {
    message(t("diveErp.rooms.loadFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function loadGuests() {
  try {
    const res = await studentApi.list({ limit: 500 });
    const d = (res as any)?.data;
    allGuests.value = d?.students ?? (Array.isArray(d) ? d : []);
  } catch (_) {}
}

function openDialog(title?: string, row?: any) {
  isEdit.value = !!row;
  if (row) {
    form.id = row.id;
    form.room_number = row.room_number;
    form.floor = row.floor;
    form.room_type = row.room_type || "大床+单人床";
    form.max_capacity = row.max_capacity ?? 3;
    form.current_occupancy = row.current_occupancy ?? 0;
    form.status = row.status || "available";
    form.notes = row.notes || "";
    form.guest_student_ids = Array.isArray(row.students)
      ? row.students.map((s: any) => s.id)
      : [];
  } else {
    form.guest_student_ids = [];
  }
  dialogVisible.value = true;
}

function resetForm() {
  form.id = null;
  form.room_number = "";
  form.floor = "A";
  form.room_type = "大床+单人床";
  form.max_capacity = 3;
  form.current_occupancy = 0;
  form.status = "available";
  form.notes = "";
  form.guest_student_ids = [];
}

async function onSubmit() {
  await nextTick();
  const formEl = formRef.value;
  if (formEl) {
    try {
      await formEl.validate();
    } catch (_) {
      return;
    }
  }
  submitLoading.value = true;
  try {
    if (isEdit.value && form.id != null) {
      const res = await roomApi.update(form.id, {
        room_number: form.room_number,
        floor: form.floor,
        room_type: form.room_type,
        max_capacity: form.max_capacity,
        status: form.status,
        notes: form.notes
      });
      const updated = (res as any)?.data;
      try {
        const stuRes = await roomApi.setStudents(form.id, form.guest_student_ids || []);
        const withStudents = (stuRes as any)?.data || updated;
        if (withStudents && Array.isArray(dataList.value)) {
          const idx = dataList.value.findIndex((r: any) => r.id === withStudents.id);
          if (idx !== -1) dataList.value[idx] = { ...dataList.value[idx], ...withStudents };
        }
      } catch (_) {}
      message(t("diveErp.common.edit") + " OK");
    } else {
      const res = await roomApi.create({
        room_number: form.room_number,
        floor: form.floor,
        room_type: form.room_type,
        max_capacity: form.max_capacity,
        status: form.status,
        notes: form.notes
      });
      const created = (res as any)?.data;
      if (created) {
        if (form.guest_student_ids && form.guest_student_ids.length > 0) {
          try {
            await roomApi.setStudents(created.id, form.guest_student_ids);
          } catch (_) {}
        }
        dataList.value = [created, ...(dataList.value || [])];
      }
      message(t("diveErp.common.add") + " OK");
    }
    dialogVisible.value = false;
    loadList(true);
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || "Request failed";
    message(msg, { type: "error" });
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(row: any) {
  try {
    await roomApi.delete(row.id);
    message(t("diveErp.common.delete") + " OK");
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || "Delete failed", { type: "error" });
  }
}

onMounted(() => {
  loadGuests();
  loadList();
});
</script>

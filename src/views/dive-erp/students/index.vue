<template>
  <div class="main p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">{{ t("diveErp.guests.title") }}</h2>
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.guests.addGuest") }}</el-button>
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
      <el-table-column prop="guest_id" :label="t('diveErp.guests.guestId')" width="120" align="center">
        <template #default="{ row }">
          {{ row.guest_id || "—" }}
        </template>
      </el-table-column>
      <el-table-column prop="name_en" :label="t('diveErp.guests.nameEn')" min-width="120" />
      <el-table-column prop="name_cn" :label="t('diveErp.guests.nameCn')" width="110" />
      <el-table-column :label="t('diveErp.guests.gender')" width="90" align="center">
        <template #default="{ row }">
          {{ row.gender === "male" ? t("diveErp.guests.male") : row.gender === "female" ? t("diveErp.guests.female") : t("diveErp.guests.other") }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" :label="t('diveErp.common.phone')" width="130" />
      <el-table-column prop="passport_number" :label="t('diveErp.guests.passportNo')" width="130" />
      <el-table-column prop="learning_content" :label="t('diveErp.guests.learningContent')" width="160" align="center">
        <template #default="{ row }">
          {{ row.learning_content || "—" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.guests.room')" width="100" align="center">
        <template #default="{ row }">
          {{ row.room?.room_number || "—" }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.status || "pending" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.common.actions')" width="160" fixed="right" align="center">
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

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('diveErp.guests.editGuest') : t('diveErp.guests.addGuest')"
      width="560px"
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
        <el-form-item :label="t('diveErp.guests.chineseName')" prop="name_cn">
          <el-input v-model="form.name_cn" placeholder="Chinese name" />
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.gender')" prop="gender">
          <el-select v-model="form.gender" :placeholder="t('diveErp.guests.gender')" style="width: 100%">
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
        <el-form-item :label="t('diveErp.guests.learningContent')" prop="learning_content">
          <el-select v-model="form.learning_content" :placeholder="t('diveErp.guests.learningContent')" clearable style="width: 100%">
            <el-option
              v-for="opt in learningContentOptions"
              :key="opt"
              :label="opt"
              :value="opt"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.guests.room')" prop="room_id">
          <el-select v-model="form.room_id" :placeholder="t('diveErp.guests.emptyRoom')" clearable style="width: 100%">
            <el-option
              v-for="r in rooms"
              :key="r.id"
              :label="r.room_number"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')" prop="status">
          <el-select v-model="form.status" :placeholder="t('diveErp.common.status')" style="width: 100%">
            <el-option :label="t('diveErp.guests.pending')" value="pending" />
            <el-option :label="t('diveErp.guests.inHouse')" value="active" />
            <el-option :label="t('diveErp.guests.completed')" value="completed" />
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
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { studentApi, roomApi } from "@/api/dive";

defineOptions({ name: "DiveStudents" });

const { t } = useI18n();

const learningContentOptions = [
  "OW",
  "AOW",
  "OW+AOW",
  "FunDive",
  "DSD",
  "Snorkeling",
  "Razor Side-mounted",
  "Tech 40",
  "Tech 50"
];

const loading = ref(false);
const dataList = ref<any[]>([]);
const rooms = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();

const form = reactive({
  id: null as number | null,
  guest_id: "",
  name_en: "",
  name_cn: "",
  gender: "male",
  phone: "",
  passport_number: "",
  learning_content: "" as string,
  room_id: null as number | null,
  status: "pending"
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
    const res = await studentApi.list({ limit: 200 });
    const d = (res as any)?.data;
    dataList.value = d?.students ?? (Array.isArray(d) ? d : []);
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
    form.name_en = row.name_en;
    form.name_cn = row.name_cn || "";
    form.gender = row.gender || "male";
    form.phone = row.phone;
    form.passport_number = row.passport_number;
    form.learning_content = row.learning_content || "";
    form.room_id = row.room_id ?? row.room?.id ?? null;
    form.status = row.status || "pending";
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
  form.learning_content = "";
  form.room_id = null;
  form.status = "pending";
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
      name_cn: form.name_cn,
      gender: form.gender,
      phone: form.phone,
      passport_number: form.passport_number,
      learning_content: form.learning_content || null,
      room_id: form.room_id || null,
      status: form.status
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

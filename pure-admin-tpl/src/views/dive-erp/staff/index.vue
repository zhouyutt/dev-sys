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
      <el-select v-model="filterRole" clearable :placeholder="t('diveErp.staff.role')" style="width: 120px">
        <el-option :label="t('diveErp.staff.captain')" value="captain" />
        <el-option :label="t('diveErp.staff.diveMaster')" value="dm" />
        <el-option :label="t('diveErp.staff.instructor')" value="instructor" />
        <el-option :label="t('diveErp.staff.staffRole')" value="staff" />
      </el-select>
      <el-select v-model="filterStatus" clearable :placeholder="t('diveErp.common.status')" style="width: 110px">
        <el-option :label="t('diveErp.staff.active')" value="active" />
        <el-option :label="t('diveErp.staff.inactive')" value="inactive" />
        <el-option :label="t('diveErp.staff.onLeave')" value="on_leave" />
      </el-select>
      <span class="text-gray-400 text-sm ml-1">{{ t('diveErp.common.total') }}: {{ filteredList.length }}</span>
      <div class="flex-1" />
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.staff.addStaff") }}</el-button>
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
      :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
    >
      <el-table-column prop="id" :label="t('diveErp.common.id')" width="70" align="center" />
      <el-table-column prop="name_en" :label="t('diveErp.staff.nameEn')" min-width="110" />
      <el-table-column prop="name" :label="t('diveErp.staff.nameCn')" min-width="110" />
      <el-table-column :label="t('diveErp.staff.role')" width="120" align="center">
        <template #default="{ row }">{{ roleLabel(row.role) }}</template>
      </el-table-column>
      <el-table-column :label="t('diveErp.staff.certification')" width="130" align="center">
        <template #default="{ row }">
          {{ Array.isArray(row.certifications) ? row.certifications.join(", ") : row.certifications || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.staff.languages')" width="130" align="center">
        <template #default="{ row }">
          {{ Array.isArray(row.languages) ? row.languages.join(", ") : row.languages || "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" :label="t('diveErp.common.phone')" width="130" />
      <el-table-column prop="email" :label="t('diveErp.common.email')" min-width="150" show-overflow-tooltip />
      <el-table-column prop="hire_date" :label="t('diveErp.staff.hireDate')" width="110" align="center" />
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === "active" ? t("diveErp.staff.active") : row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.common.actions')" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog('Edit', row)">{{ t("diveErp.common.edit") }}</el-button>
          <el-popconfirm :title="t('diveErp.staff.deleteConfirm')" @confirm="handleDelete(row)">
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
      :title="isEdit ? t('diveErp.staff.editStaff') : t('diveErp.staff.addStaff')"
      width="520px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('diveErp.staff.nameEn')" prop="name_en">
          <el-input v-model="form.name_en" placeholder="English name" />
        </el-form-item>
        <el-form-item :label="t('diveErp.staff.nameCn')" prop="name">
          <el-input v-model="form.name" placeholder="中文姓名" />
        </el-form-item>
        <el-form-item :label="t('diveErp.staff.role')" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option :label="t('diveErp.staff.captain')" value="captain" />
            <el-option :label="t('diveErp.staff.diveMaster')" value="dm" />
            <el-option :label="t('diveErp.staff.instructor')" value="instructor" />
            <el-option :label="t('diveErp.staff.staffRole')" value="staff" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.phone')" prop="phone">
          <el-input v-model="form.phone" placeholder="+60..." />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.email')" prop="email">
          <el-input v-model="form.email" placeholder="email@example.com" />
        </el-form-item>
        <el-form-item :label="t('diveErp.staff.hireDate')" prop="hire_date">
          <el-date-picker v-model="form.hire_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('diveErp.staff.active')" value="active" />
            <el-option :label="t('diveErp.staff.inactive')" value="inactive" />
            <el-option :label="t('diveErp.staff.onLeave')" value="on_leave" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.common.notes')" prop="notes">
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
import { staffApi } from "@/api/dive";

defineOptions({ name: "DiveStaff" });

const { t } = useI18n();

function roleLabel(role: string) {
  const m: Record<string, string> = {
    captain: t("diveErp.staff.captain"),
    dm: t("diveErp.staff.diveMaster"),
    instructor: t("diveErp.staff.instructor"),
    staff: t("diveErp.staff.staffRole")
  };
  return m[role] || role;
}

const loading = ref(false);
const dataList = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();

// 搜索和筛选
const searchText = ref("");
const filterRole = ref("");
const filterStatus = ref("");

const filteredList = computed(() => {
  let list = dataList.value;
  const kw = searchText.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(r =>
      (r.name_en || "").toLowerCase().includes(kw) ||
      (r.name || "").toLowerCase().includes(kw) ||
      (r.phone || "").toLowerCase().includes(kw) ||
      (r.email || "").toLowerCase().includes(kw) ||
      (r.role || "").toLowerCase().includes(kw)
    );
  }
  if (filterRole.value) list = list.filter(r => r.role === filterRole.value);
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value);
  return list;
});

const form = reactive({
  id: null as number | null,
  name: "",
  name_en: "",
  role: "instructor",
  phone: "",
  email: "",
  hire_date: "",
  status: "active",
  notes: ""
});

const rules = {
  name_en: [{ required: true, message: "Required", trigger: "blur" }],
  role: [{ required: true, message: "Required", trigger: "change" }]
};

async function loadList() {
  loading.value = true;
  try {
    const res = await staffApi.list();
    dataList.value = (res && (res as any).data) ? (res as any).data : [];
  } catch (e) {
    message(t("diveErp.staff.loadFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
}

function openDialog(_title?: string, row?: any) {
  isEdit.value = !!row;
  if (row) {
    form.id = row.id;
    form.name = row.name;
    form.name_en = row.name_en;
    form.role = row.role;
    form.phone = row.phone || "";
    form.email = row.email || "";
    form.hire_date = row.hire_date || "";
    form.status = row.status || "active";
    form.notes = row.notes || "";
  }
  dialogVisible.value = true;
}

function resetForm() {
  form.id = null;
  form.name = "";
  form.name_en = "";
  form.role = "instructor";
  form.phone = "";
  form.email = "";
  form.hire_date = "";
  form.status = "active";
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
    const payload = {
      name: form.name || form.name_en,
      name_en: form.name_en,
      role: form.role,
      phone: form.phone,
      email: form.email,
      hire_date: form.hire_date || null,
      status: form.status,
      notes: form.notes
    };
    if (isEdit.value && form.id != null) {
      await staffApi.update(form.id, payload);
      message(t("diveErp.common.edit") + " OK");
    } else {
      await staffApi.create(payload);
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
    await staffApi.delete(row.id);
    message(t("diveErp.common.delete") + " OK");
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || "Delete failed", { type: "error" });
  }
}

onMounted(() => loadList());
</script>

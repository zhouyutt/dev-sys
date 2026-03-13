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
      <el-select v-model="filterType" clearable :placeholder="t('diveErp.boats.type')" style="width: 110px">
        <el-option :label="t('diveErp.boats.small')" value="small" />
        <el-option :label="t('diveErp.boats.large')" value="large" />
      </el-select>
      <el-select v-model="filterStatus" clearable :placeholder="t('diveErp.common.status')" style="width: 120px">
        <el-option :label="t('diveErp.boats.available')" value="available" />
        <el-option :label="t('diveErp.boats.inUse')" value="in_use" />
        <el-option :label="t('diveErp.rooms.maintenance')" value="maintenance" />
      </el-select>
      <span class="text-gray-400 text-sm ml-1">{{ t('diveErp.common.total') }}: {{ filteredList.length }}</span>
      <div class="flex-1" />
      <el-button type="primary" @click="openDialog()">{{ t("diveErp.boats.addBoat") }}</el-button>
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
      <el-table-column prop="boat_number" :label="t('diveErp.boats.boatNo')" width="100" />
      <el-table-column prop="boat_name" :label="t('diveErp.boats.boatName')" min-width="140" />
      <el-table-column :label="t('diveErp.boats.type')" width="90" align="center">
        <template #default="{ row }">
          {{ row.boat_type?.toLowerCase() === "large" ? t("diveErp.boats.large") : t("diveErp.boats.small") }}
        </template>
      </el-table-column>
      <el-table-column prop="max_capacity" :label="t('diveErp.boats.capacity')" width="90" align="center" />
      <el-table-column prop="status" :label="t('diveErp.common.status')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'available' ? 'success' : row.status === 'maintenance' ? 'warning' : 'info'" size="small">
            {{ row.status || "available" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="notes" :label="t('diveErp.common.notes')" min-width="150" show-overflow-tooltip />
      <el-table-column :label="t('diveErp.common.actions')" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog('Edit', row)">{{ t("diveErp.common.edit") }}</el-button>
          <el-popconfirm :title="t('diveErp.boats.deleteConfirm')" @confirm="handleDelete(row)">
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
      :title="isEdit ? t('diveErp.boats.editBoat') : t('diveErp.boats.addBoat')"
      width="480px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('diveErp.boats.boatNo')" prop="boat_number">
          <el-input v-model="form.boat_number" placeholder="e.g. 1311" />
        </el-form-item>
        <el-form-item :label="t('diveErp.boats.boatName')" prop="boat_name">
          <el-input v-model="form.boat_name" placeholder="e.g. 1311小船" />
        </el-form-item>
        <el-form-item :label="t('diveErp.boats.type')" prop="boat_type">
          <el-select v-model="form.boat_type" style="width: 100%">
            <el-option :label="t('diveErp.boats.small')" value="small" />
            <el-option :label="t('diveErp.boats.large')" value="large" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.boats.capacity')" prop="max_capacity">
          <el-input-number v-model="form.max_capacity" :min="1" :max="50" />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('diveErp.boats.available')" value="available" />
            <el-option :label="t('diveErp.boats.inUse')" value="in_use" />
            <el-option :label="t('diveErp.rooms.maintenance')" value="maintenance" />
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
import { boatApi } from "@/api/dive";

defineOptions({ name: "DiveBoats" });

const { t } = useI18n();

const loading = ref(false);
const dataList = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref();

// 搜索和筛选
const searchText = ref("");
const filterType = ref("");
const filterStatus = ref("");

const filteredList = computed(() => {
  let list = dataList.value;
  const kw = searchText.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(r =>
      (r.boat_number || "").toLowerCase().includes(kw) ||
      (r.boat_name || "").toLowerCase().includes(kw) ||
      (r.notes || "").toLowerCase().includes(kw)
    );
  }
  if (filterType.value) list = list.filter(r => (r.boat_type || "").toLowerCase() === filterType.value);
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value);
  return list;
});

const form = reactive({
  id: null as number | null,
  boat_number: "",
  boat_name: "",
  boat_type: "small",
  max_capacity: 10,
  status: "available",
  notes: ""
});

const rules = {
  boat_number: [{ required: true, message: "Required", trigger: "blur" }],
  boat_type: [{ required: true, message: "Required", trigger: "change" }],
  max_capacity: [{ required: true, message: "Required", trigger: "blur" }]
};

async function loadList() {
  loading.value = true;
  try {
    const res = await boatApi.list();
    dataList.value = (res && (res as any).data) ? (res as any).data : [];
  } catch (e) {
    message(t("diveErp.boats.loadFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
}

function openDialog(_title?: string, row?: any) {
  isEdit.value = !!row;
  if (row) {
    form.id = row.id;
    form.boat_number = row.boat_number;
    form.boat_name = row.boat_name;
    form.boat_type = row.boat_type || "small";
    form.max_capacity = row.max_capacity ?? 10;
    form.status = row.status || "available";
    form.notes = row.notes || "";
  }
  dialogVisible.value = true;
}

function resetForm() {
  form.id = null;
  form.boat_number = "";
  form.boat_name = "";
  form.boat_type = "small";
  form.max_capacity = 10;
  form.status = "available";
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
    if (isEdit.value && form.id != null) {
      await boatApi.update(form.id, {
        boat_number: form.boat_number,
        boat_name: form.boat_name,
        boat_type: form.boat_type,
        max_capacity: form.max_capacity,
        status: form.status,
        notes: form.notes
      });
      message(t("diveErp.common.edit") + " OK");
    } else {
      await boatApi.create({
        boat_number: form.boat_number,
        boat_name: form.boat_name,
        boat_type: form.boat_type,
        max_capacity: form.max_capacity,
        status: form.status,
        notes: form.notes
      });
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
    await boatApi.delete(row.id);
    message(t("diveErp.common.delete") + " OK");
    loadList();
  } catch (e: any) {
    message(e?.response?.data?.message || "Delete failed", { type: "error" });
  }
}

onMounted(() => loadList());
</script>

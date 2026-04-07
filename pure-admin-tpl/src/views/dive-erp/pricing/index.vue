<template>
  <div class="main flex flex-col h-full p-4 gap-3">
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">{{ t("diveErp.pricing.hint") }}</span>
    </div>

    <el-table
      v-loading="loading"
      :data="courses"
      border
      stripe
      style="width: 100%"
      class="flex-1"
      height="100%"
      :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
    >
      <el-table-column prop="course_code" :label="t('diveErp.pricing.courseCode')" width="140" />
      <el-table-column :label="t('diveErp.pricing.courseName')" min-width="220">
        <template #default="{ row }">
          {{ row.course_name_en || row.course_name || "-" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.pricing.currency')" width="120">
        <template #default="{ row }">
          <el-input v-model="row.currency" placeholder="MYR" />
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.pricing.price')" width="180">
        <template #default="{ row }">
          <el-input-number v-model="row.price" :min="0" :step="50" :precision="2" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column :label="t('diveErp.common.actions')" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link :loading="savingMap[row.id]" @click="savePrice(row)">
            {{ t("diveErp.pricing.save") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { courseApi } from "@/api/dive";

defineOptions({ name: "DivePricing" });
const { t } = useI18n();

const loading = ref(false);
const courses = ref<any[]>([]);
const savingMap = ref<Record<number, boolean>>({});

async function loadCourses() {
  loading.value = true;
  try {
    const res = await courseApi.list();
    courses.value = ((res as any)?.data || []).map((item: any) => ({
      ...item,
      price: item.price == null ? 0 : Number(item.price),
      currency: item.currency || "MYR"
    }));
  } catch (e: any) {
    message(e?.response?.data?.message || t("diveErp.pricing.loadFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function savePrice(row: any) {
  savingMap.value[row.id] = true;
  try {
    await courseApi.update(row.id, {
      price: row.price,
      currency: row.currency
    });
    message(t("diveErp.pricing.saveSuccess"), { type: "success" });
  } catch (e: any) {
    message(e?.response?.data?.message || t("diveErp.pricing.saveFailed"), { type: "error" });
  } finally {
    savingMap.value[row.id] = false;
  }
}

onMounted(() => loadCourses());
</script>

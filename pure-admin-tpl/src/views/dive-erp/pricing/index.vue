<template>
  <div class="main flex flex-col h-full p-4 gap-3">
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">项目价格 1:1 配置（每个项目对应一个价格）</span>
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
      <el-table-column prop="course_code" label="项目代码" width="140" />
      <el-table-column label="项目名称" min-width="220">
        <template #default="{ row }">
          {{ row.course_name_en || row.course_name || "-" }}
        </template>
      </el-table-column>
      <el-table-column label="货币" width="120">
        <template #default="{ row }">
          <el-input v-model="row.currency" placeholder="MYR" />
        </template>
      </el-table-column>
      <el-table-column label="价格" width="180">
        <template #default="{ row }">
          <el-input-number v-model="row.price" :min="0" :step="50" :precision="2" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link :loading="savingMap[row.id]" @click="savePrice(row)">
            保存
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { message } from "@/utils/message";
import { courseApi } from "@/api/dive";

defineOptions({ name: "DivePricing" });

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
    message(e?.response?.data?.message || "加载价格失败", { type: "error" });
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
    message("价格保存成功", { type: "success" });
  } catch (e: any) {
    message(e?.response?.data?.message || "价格保存失败", { type: "error" });
  } finally {
    savingMap.value[row.id] = false;
  }
}

onMounted(() => loadCourses());
</script>

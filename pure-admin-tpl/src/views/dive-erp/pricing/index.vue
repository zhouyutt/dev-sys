<template>
  <div class="main flex flex-col h-full p-4 gap-3">
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <span>内部价格维护（不会直接对外展示）</span>
      <span>·</span>
      <span>出海燃油费请保持单独一行</span>
    </div>

    <el-collapse class="flex-1 overflow-auto" v-loading="loading">
      <el-collapse-item
        v-for="group in groupedItems"
        :key="group.category"
        :title="`${group.title} (${group.items.length})`"
        :name="group.category"
      >
        <el-table
          :data="group.items"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
        >
          <el-table-column prop="code" label="Code" width="180" />
          <el-table-column label="Name" min-width="220">
            <template #default="{ row }">
              <div class="leading-5">
                <div>{{ row.name_en || "-" }}</div>
                <div class="text-xs text-gray-500">{{ row.name_cn || "" }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Unit" width="120">
            <template #default="{ row }">
              <el-input v-model="row.unit" placeholder="person/day" />
            </template>
          </el-table-column>
          <el-table-column label="Non-MY" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.price_non_malaysian"
                :min="0"
                :step="10"
                :precision="2"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="MY" width="150">
            <template #default="{ row }">
              <el-input-number v-model="row.price_malaysian" :min="0" :step="10" :precision="2" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="Currency" width="100">
            <template #default="{ row }">
              <el-input v-model="row.currency" placeholder="MYR" />
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="220">
            <template #default="{ row }">
              <el-input v-model="row.notes" placeholder="Notes" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="150" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.is_active" />
              <el-tag v-if="row.is_fuel_surcharge" size="small" type="warning" class="ml-2">Fuel</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :loading="savingMap[row.id]" @click="saveItem(row)">
                保存
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { message } from "@/utils/message";
import { pricingApi } from "@/api/dive";

defineOptions({ name: "DivePricing" });

const loading = ref(false);
const items = ref<any[]>([]);
const savingMap = ref<Record<number, boolean>>({});

const categoryTitleMap: Record<string, string> = {
  surcharge: "附加费",
  course: "课程",
  activity: "活动/出海",
  accommodation: "住宿",
  transfer: "接驳",
  other: "其他"
};

const groupedItems = computed(() => {
  const map = new Map<string, any[]>();
  items.value.forEach(item => {
    const key = item.category || "other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return Array.from(map.entries()).map(([category, groupItems]) => ({
    category,
    title: categoryTitleMap[category] || category,
    items: groupItems
  }));
});

async function loadItems() {
  loading.value = true;
  try {
    const res = await pricingApi.list();
    items.value = ((res as any)?.data || []).map((item: any) => ({
      ...item,
      price_non_malaysian: item.price_non_malaysian == null ? 0 : Number(item.price_non_malaysian),
      price_malaysian: item.price_malaysian == null ? 0 : Number(item.price_malaysian),
      currency: item.currency || "MYR"
    }));
  } catch (e: any) {
    message(e?.response?.data?.message || "加载价格列表失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function saveItem(row: any) {
  savingMap.value[row.id] = true;
  try {
    await pricingApi.update(row.id, row);
    message("价格项保存成功", { type: "success" });
  } catch (e: any) {
    message(e?.response?.data?.message || "保存失败", { type: "error" });
  } finally {
    savingMap.value[row.id] = false;
  }
}

onMounted(() => loadItems());
</script>

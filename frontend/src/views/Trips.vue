<template>
  <div class="trips-page">
    <div class="page-header">
      <h1 class="page-title">行程管理</h1>
      <VaButton @click="showAddModal = true">
        <VaIcon name="add" class="mr-1" />
        创建行程
      </VaButton>
    </div>

    <!-- 行程列表 -->
    <div class="space-y-4">
      <VaCard v-for="trip in trips" :key="trip.id" class="trip-card">
        <VaCardContent>
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <!-- 日期和目的地 -->
            <div class="lg:col-span-2">
              <div class="flex items-start gap-4">
                <div class="trip-date">
                  <div class="text-xs opacity-60">{{ getMonth(trip.date) }}</div>
                  <div class="text-3xl font-bold">{{ getDay(trip.date) }}</div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-xl font-semibold">{{ trip.destination || '未设置' }}</h3>
                    <VaChip :color="getStatusColor(trip.status)" size="small">
                      {{ getStatusText(trip.status) }}
                    </VaChip>
                  </div>
                  <div class="flex flex-wrap gap-3 text-sm text-secondary">
                    <span>
                      <VaIcon name="sailing" size="small" />
                      {{ trip.boat_name || '未分配船只' }}
                    </span>
                    <span>
                      <VaIcon name="people" size="small" />
                      {{ trip.participant_count || 0 }}人
                    </span>
                    <span v-if="trip.dive_count">
                      <VaIcon name="waves" size="small" />
                      {{ trip.dive_count }}潜
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 人员信息 -->
            <div>
              <div class="text-sm space-y-2">
                <div v-if="trip.captain">
                  <div class="text-secondary text-xs">船长</div>
                  <div class="font-medium">{{ trip.captain }}</div>
                </div>
                <div v-if="trip.dm">
                  <div class="text-secondary text-xs">潜导</div>
                  <div class="font-medium">{{ trip.dm }}</div>
                </div>
                <div v-if="trip.instructor">
                  <div class="text-secondary text-xs">教练</div>
                  <div class="font-medium">{{ trip.instructor }}</div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center justify-end gap-2">
              <VaButton preset="secondary" size="small" @click="viewTrip(trip)">
                <VaIcon name="visibility" />
              </VaButton>
              <VaButton preset="secondary" size="small" @click="editTrip(trip)">
                <VaIcon name="edit" />
              </VaButton>
              <VaButton preset="secondary" size="small" color="danger" @click="deleteTrip(trip)">
                <VaIcon name="delete" />
              </VaButton>
            </div>
          </div>

          <!-- 备注 -->
          <div v-if="trip.notes" class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-sm text-secondary">
              <VaIcon name="info" size="small" class="mr-1" />
              {{ trip.notes }}
            </p>
          </div>
        </VaCardContent>
      </VaCard>

      <div v-if="trips.length === 0" class="text-center py-12">
        <VaCard>
          <VaCardContent>
            <iconify-icon icon="mdi:sail-boat" width="64" class="text-secondary opacity-30 mb-4"></iconify-icon>
            <p class="text-secondary">暂无行程数据</p>
            <VaButton class="mt-4" @click="showAddModal = true">
              创建第一个行程
            </VaButton>
          </VaCardContent>
        </VaCard>
      </div>
    </div>

    <!-- 添加行程对话框 -->
    <VaModal
      v-model="showAddModal"
      size="large"
      title="创建行程"
      ok-text="保存"
      cancel-text="取消"
      @ok="saveTrip"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaDateInput
            v-model="tripForm.date"
            label="出行日期"
            required
          />
          <VaInput
            v-model="tripForm.destination"
            label="目的地"
            placeholder="如：诗巴丹"
            required
          />
        </div>

        <VaInput
          v-model="tripForm.boat_name"
          label="船只"
          placeholder="选择或输入船只名称"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VaInput
            v-model="tripForm.captain"
            label="船长"
            placeholder="船长姓名"
          />
          <VaInput
            v-model="tripForm.dm"
            label="潜导"
            placeholder="潜导姓名"
          />
          <VaInput
            v-model="tripForm.instructor"
            label="教练"
            placeholder="教练姓名"
          />
        </div>

        <VaInput
          v-model.number="tripForm.dive_count"
          type="number"
          label="潜水次数"
          min="1"
          max="5"
        />

        <VaTextarea
          v-model="tripForm.notes"
          label="备注"
          placeholder="行程备注..."
        />
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vuestic-ui'

const { init: notify } = useToast()

const trips = ref([])
const showAddModal = ref(false)

const tripForm = ref({
  date: new Date(),
  destination: '',
  boat_name: '',
  captain: '',
  dm: '',
  instructor: '',
  dive_count: 2,
  notes: ''
})

const getMonth = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}月`
}

const getDay = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.getDate()
}

const getStatusColor = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    ongoing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'secondary'
}

const getStatusText = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

const loadTrips = async () => {
  try {
    const { data } = await api.get('/trips')
    trips.value = Array.isArray(data) ? data : []
  } catch (error) {
    notify({ message: '加载行程列表失败', color: 'danger' })
  }
}

const saveTrip = async () => {
  try {
    await api.post('/trips', tripForm.value)
    notify({ message: '行程创建成功', color: 'success' })
    showAddModal.value = false
    loadTrips()
  } catch (error) {
    notify({ message: '行程创建失败', color: 'danger' })
  }
}

const viewTrip = (trip) => {
  notify({ message: `查看行程：${trip.destination}`, color: 'info' })
}

const editTrip = (trip) => {
  notify({ message: `编辑行程：${trip.destination}`, color: 'info' })
}

const deleteTrip = (trip) => {
  notify({ message: `删除行程：${trip.destination}`, color: 'warning' })
}

onMounted(() => {
  loadTrips()
})
</script>

<style scoped lang="scss">
.trips-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0;
}

.trip-card {
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.trip-date {
  width: 64px;
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--va-primary);
  color: white;
}
</style>

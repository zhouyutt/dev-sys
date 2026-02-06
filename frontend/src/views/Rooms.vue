<template>
  <div class="rooms-page">
    <div class="page-header">
      <h1 class="page-title">住宿管理</h1>
      <VaButton @click="showAddModal = true">
        <VaIcon name="add" class="mr-1" />
        添加房间
      </VaButton>
    </div>

    <!-- 房间统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <VaCard v-for="stat in roomStats" :key="stat.label" class="stat-card">
        <VaCardContent>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary text-sm">{{ stat.label }}</p>
              <h3 class="text-2xl font-bold mt-1">{{ stat.value }}</h3>
            </div>
            <VaIcon :name="stat.icon" size="large" :color="stat.color" />
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- 房间列表 -->
    <VaCard>
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <VaCard
            v-for="room in rooms"
            :key="room.id"
            class="room-card"
            :gradient="getCardGradient(room.status)"
          >
            <VaCardContent>
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="text-xl font-bold">{{ room.room_number }}</h3>
                  <p class="text-sm opacity-80">{{ room.type }}</p>
                </div>
                <VaChip :color="getStatusColor(room.status)" size="small">
                  {{ getStatusText(room.status) }}
                </VaChip>
              </div>

              <VaDivider class="my-3" />

              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <VaIcon name="people" size="small" />
                  <span>容纳：{{ room.capacity }}人</span>
                </div>
                <div class="flex items-center gap-2">
                  <VaIcon name="bed" size="small" />
                  <span>{{ room.bed_type || '标准床' }}</span>
                </div>
                <div v-if="room.current_occupants > 0" class="flex items-center gap-2">
                  <VaIcon name="group" size="small" />
                  <span>当前入住：{{ room.current_occupants }}人</span>
                </div>
              </div>

              <div class="mt-4 flex gap-2">
                <VaButton size="small" preset="secondary" class="flex-1" @click="viewRoom(room)">
                  查看
                </VaButton>
                <VaButton size="small" class="flex-1" @click="editRoom(room)">
                  编辑
                </VaButton>
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <div v-if="rooms.length === 0" class="text-center py-12 text-secondary">
          <iconify-icon icon="mdi:bed-empty" width="64" class="opacity-30 mb-4"></iconify-icon>
          <p>暂无房间数据</p>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 添加房间对话框 -->
    <VaModal
      v-model="showAddModal"
      title="添加房间"
      ok-text="保存"
      cancel-text="取消"
      @ok="saveRoom"
    >
      <div class="space-y-4">
        <VaInput
          v-model="roomForm.room_number"
          label="房间号"
          placeholder="如：101"
          required
        />
        <VaSelect
          v-model="roomForm.type"
          label="房型"
          :options="['单人间', '双人间', '三人间', '套房']"
        />
        <VaInput
          v-model.number="roomForm.capacity"
          type="number"
          label="容纳人数"
          min="1"
          max="4"
        />
        <VaTextarea
          v-model="roomForm.notes"
          label="备注"
          placeholder="房间备注..."
        />
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vuestic-ui'

const { init: notify } = useToast()

const rooms = ref([])
const showAddModal = ref(false)

const roomForm = ref({
  room_number: '',
  type: '双人间',
  capacity: 2,
  notes: ''
})

const roomStats = computed(() => [
  { label: '总房间', value: rooms.value.length, icon: 'hotel', color: 'primary' },
  { label: '可用', value: rooms.value.filter(r => r.status === 'available').length, icon: 'check_circle', color: 'success' },
  { label: '已满', value: rooms.value.filter(r => r.status === 'occupied').length, icon: 'cancel', color: 'danger' },
  { label: '维护中', value: rooms.value.filter(r => r.status === 'maintenance').length, icon: 'build', color: 'warning' }
])

const getStatusColor = (status) => {
  const map = {
    available: 'success',
    occupied: 'danger',
    maintenance: 'warning',
    reserved: 'info'
  }
  return map[status] || 'secondary'
}

const getStatusText = (status) => {
  const map = {
    available: '可用',
    occupied: '已满',
    maintenance: '维护中',
    reserved: '已预订'
  }
  return map[status] || '未知'
}

const getCardGradient = (status) => {
  if (status === 'available') return false
  return false
}

const loadRooms = async () => {
  try {
    const { data } = await api.get('/rooms')
    rooms.value = Array.isArray(data) ? data : []
  } catch (error) {
    notify({ message: '加载房间列表失败', color: 'danger' })
  }
}

const saveRoom = async () => {
  try {
    await api.post('/rooms', roomForm.value)
    notify({ message: '房间添加成功', color: 'success' })
    showAddModal.value = false
    loadRooms()
  } catch (error) {
    notify({ message: '房间添加失败', color: 'danger' })
  }
}

const viewRoom = (room) => {
  notify({ message: `查看房间：${room.room_number}`, color: 'info' })
}

const editRoom = (room) => {
  notify({ message: `编辑房间：${room.room_number}`, color: 'info' })
}

onMounted(() => {
  loadRooms()
})
</script>

<style scoped lang="scss">
.rooms-page {
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

.stat-card {
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.room-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}
</style>

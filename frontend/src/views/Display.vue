<template>
  <div class="display-container">
    <!-- 标题 -->
    <div class="header">
      <h1 class="display-title">仙本那潜水店 - 明日出海行程</h1>
      <div class="date-time">
        <div class="date">{{ currentDate }}</div>
        <div class="time">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 行程信息 -->
    <div class="content">
      <va-row :gutter="20">
        <!-- 左侧：行程列表 -->
        <va-column :xs="12" :lg="8">
          <div class="section">
            <h2 class="section-title">
              <va-icon name="directions_boat" />
              出海行程
            </h2>

            <div v-if="loading" class="loading">
              <va-progress-circle indeterminate />
            </div>

            <div v-else-if="Object.keys(groupedTrips).length === 0" class="empty">
              <va-icon name="info" size="large" />
              <p>暂无明日行程</p>
            </div>

            <div v-else class="trips-container">
              <div
                v-for="(trips, destination) in groupedTrips"
                :key="destination"
                class="destination-group"
              >
                <h3 class="destination-title">
                  <va-icon name="place" />
                  {{ destination }}
                </h3>

                <va-card
                  v-for="trip in trips"
                  :key="trip.id"
                  class="trip-card mb-3"
                >
                  <va-card-content>
                    <va-row :gutter="20">
                      <va-column :xs="12" :sm="4">
                        <div class="trip-info">
                          <div class="label">船只</div>
                          <div class="value">{{ trip.boat?.boat_name }}</div>
                        </div>
                      </va-column>
                      
                      <va-column :xs="12" :sm="4">
                        <div class="trip-info">
                          <div class="label">出发时间</div>
                          <div class="value">{{ trip.departure_time || '待定' }}</div>
                        </div>
                      </va-column>

                      <va-column :xs="12" :sm="4">
                        <div class="trip-info">
                          <div class="label">人数</div>
                          <div class="value">{{ trip.current_participants }} / {{ trip.max_participants }}</div>
                        </div>
                      </va-column>
                    </va-row>

                    <va-divider class="my-3" />

                    <va-row :gutter="20">
                      <va-column :xs="12" :sm="4">
                        <div class="staff-info">
                          <va-icon name="person" />
                          <span class="label">船长:</span>
                          <span class="name">{{ trip.captain?.name || '待定' }}</span>
                        </div>
                      </va-column>

                      <va-column :xs="12" :sm="4">
                        <div class="staff-info">
                          <va-icon name="person" />
                          <span class="label">DM:</span>
                          <span class="name">{{ trip.dm?.name || '待定' }}</span>
                        </div>
                      </va-column>

                      <va-column :xs="12" :sm="4">
                        <div class="staff-info">
                          <va-icon name="person" />
                          <span class="label">教练:</span>
                          <span class="name">{{ trip.instructor?.name || '待定' }}</span>
                        </div>
                      </va-column>
                    </va-row>

                    <!-- 参与学员 -->
                    <div v-if="trip.participants && trip.participants.length > 0" class="mt-3">
                      <div class="label mb-2">参与学员：</div>
                      <div class="participants">
                        <va-chip
                          v-for="participant in trip.participants"
                          :key="participant.id"
                          size="small"
                          class="mr-1 mb-1"
                        >
                          {{ participant.student?.name_en }}
                        </va-chip>
                      </div>
                    </div>
                  </va-card-content>
                </va-card>
              </div>
            </div>
          </div>
        </va-column>

        <!-- 右侧：房间状态 -->
        <va-column :xs="12" :lg="4">
          <div class="section">
            <h2 class="section-title">
              <va-icon name="hotel" />
              房间状态
            </h2>

            <div class="rooms-summary mb-3">
              <div class="summary-item">
                <div class="summary-label">总房间数</div>
                <div class="summary-value">{{ roomSummary.total }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">已入住</div>
                <div class="summary-value occupied">{{ roomSummary.occupied }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">可用</div>
                <div class="summary-value available">{{ roomSummary.available }}</div>
              </div>
            </div>

            <div class="rooms-grid">
              <div
                v-for="room in rooms"
                :key="room.id"
                :class="['room-badge', `status-${room.status}`]"
              >
                <div class="room-number">{{ room.room_number }}</div>
                <div class="room-occupancy">{{ room.current_occupancy }}/{{ room.max_capacity }}</div>
              </div>
            </div>
          </div>
        </va-column>
      </va-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { tripAPI, roomAPI } from '../api'
import dayjs from 'dayjs'

const loading = ref(true)
const groupedTrips = ref({})
const rooms = ref([])
const currentDate = ref('')
const currentTime = ref('')

const roomSummary = ref({
  total: 0,
  occupied: 0,
  available: 0
})

let timeInterval = null
let dataInterval = null

const updateTime = () => {
  currentDate.value = dayjs().format('YYYY年MM月DD日 dddd')
  currentTime.value = dayjs().format('HH:mm:ss')
}

const loadTrips = async () => {
  try {
    const response = await tripAPI.getTomorrow()
    groupedTrips.value = response.data.groupedByDestination || {}
  } catch (error) {
    console.error('加载行程失败:', error)
  }
}

const loadRooms = async () => {
  try {
    const response = await roomAPI.getStatus()
    rooms.value = response.data.rooms
    roomSummary.value = {
      total: response.data.rooms.length,
      occupied: response.data.summary.occupied || 0,
      available: response.data.summary.available || 0
    }
  } catch (error) {
    console.error('加载房间状态失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  await Promise.all([loadTrips(), loadRooms()])
  loading.value = false
}

onMounted(() => {
  updateTime()
  loadData()

  // 每秒更新时间
  timeInterval = setInterval(updateTime, 1000)

  // 每30秒刷新数据
  dataInterval = setInterval(loadData, 30000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (dataInterval) clearInterval(dataInterval)
})
</script>

<style scoped>
.display-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.display-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
}

.date-time {
  text-align: right;
}

.date {
  font-size: 24px;
  margin-bottom: 5px;
}

.time {
  font-size: 48px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.content {
  margin-top: 20px;
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  color: #333;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
}

.destination-group {
  margin-bottom: 30px;
}

.destination-title {
  font-size: 20px;
  font-weight: bold;
  color: #0091FF;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-card {
  border-left: 4px solid #0091FF;
}

.trip-info {
  margin-bottom: 10px;
}

.trip-info .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.trip-info .value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.staff-info .label {
  color: #666;
}

.staff-info .name {
  font-weight: bold;
  color: #333;
}

.participants {
  display: flex;
  flex-wrap: wrap;
}

.rooms-summary {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.summary-value.occupied {
  color: #E42E2B;
}

.summary-value.available {
  color: #26A267;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.room-badge {
  padding: 15px 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  transition: transform 0.2s;
}

.room-badge:hover {
  transform: scale(1.05);
}

.room-badge.status-available {
  background: #26A267;
  color: white;
}

.room-badge.status-occupied {
  background: #E42E2B;
  color: white;
}

.room-badge.status-maintenance {
  background: #F59E0B;
  color: white;
}

.room-number {
  font-size: 18px;
  margin-bottom: 5px;
}

.room-occupancy {
  font-size: 12px;
  opacity: 0.9;
}
</style>

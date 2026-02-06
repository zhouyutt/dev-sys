<template>
  <div>
    <h1 class="page-title font-bold mb-6">Dashboard</h1>
    
    <section class="flex flex-col gap-4">
      <!-- 顶部统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <VaCard v-for="stat in stats" :key="stat.title" gradient :stripe="stat.stripe">
          <VaCardContent class="flex items-center justify-between">
            <div>
              <p class="text-secondary text-sm mb-1">{{ stat.title }}</p>
              <h3 class="text-3xl font-bold mb-2">{{ stat.value }}</h3>
              <VaChip size="small" :color="stat.trend >= 0 ? 'success' : 'danger'">
                <VaIcon :name="stat.trend >= 0 ? 'trending_up' : 'trending_down'" size="small" />
                {{ Math.abs(stat.trend) }}% vs last month
              </VaChip>
            </div>
            <VaAvatar :color="stat.color" size="large">
              <VaIcon :name="stat.icon" size="large" color="white" />
            </VaAvatar>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- 收入报告 -->
        <VaCard class="lg:col-span-2">
          <VaCardTitle>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Revenue Report</span>
              <VaButtonGroup>
                <VaButton size="small" preset="secondary">Month</VaButton>
                <VaButton size="small">All</VaButton>
              </VaButtonGroup>
            </div>
          </VaCardTitle>
          <VaCardContent>
            <div class="mb-4">
              <h2 class="text-2xl font-bold">${{ totalRevenue }}</h2>
              <p class="text-secondary text-sm">Total earnings</p>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-secondary text-sm mb-1">Earnings this month</p>
                <p class="text-xl font-semibold">${{ monthRevenue }}</p>
              </div>
              <div>
                <p class="text-secondary text-sm mb-1">Expense this month</p>
                <p class="text-xl font-semibold">${{ monthExpense }}</p>
              </div>
            </div>
            <!-- 简化的图表展示 -->
            <div class="revenue-chart">
              <div class="chart-bars flex items-end justify-between gap-1 h-32">
                <div v-for="(value, index) in monthlyData" :key="index" 
                     class="chart-bar bg-primary opacity-80 hover:opacity-100 transition-all"
                     :style="{ height: value + '%', width: '8%' }">
                </div>
              </div>
              <div class="chart-labels flex justify-between mt-2 text-xs text-secondary">
                <span v-for="month in months" :key="month">{{ month }}</span>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 右侧卡片 -->
        <div class="flex flex-col gap-4">
          <!-- 年度统计 -->
          <VaCard>
            <VaCardTitle class="font-semibold">Yearly Breakup</VaCardTitle>
            <VaCardContent>
              <div class="text-center mb-4">
                <h3 class="text-3xl font-bold mb-2">${{ yearlyRevenue }}</h3>
                <VaChip color="success" size="small">
                  <VaIcon name="trending_up" size="small" />
                  +2.5% last year
                </VaChip>
              </div>
              <div class="flex justify-center mb-4">
                <div class="relative w-32 h-32">
                  <svg class="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e0e0e0" stroke-width="12" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke="#4285f4" stroke-width="12" 
                            fill="none" stroke-dasharray="352" stroke-dashoffset="88" 
                            class="transition-all duration-1000" />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-bold">75%</span>
                  </div>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-secondary">Earnings</span>
                <span class="text-sm text-secondary">Profit</span>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 本月收入 -->
          <VaCard>
            <VaCardTitle class="font-semibold">Monthly Earnings</VaCardTitle>
            <VaCardContent>
              <div class="mb-4">
                <h3 class="text-2xl font-bold mb-2">${{ monthEarnings }}</h3>
                <VaChip color="success" size="small">
                  <VaIcon name="trending_up" size="small" />
                  +25.36% last month
                </VaChip>
              </div>
              <div class="earnings-mini-chart h-16 flex items-end gap-1">
                <div v-for="i in 12" :key="i" 
                     class="flex-1 bg-primary opacity-70 rounded-t"
                     :style="{ height: (Math.random() * 70 + 30) + '%' }">
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>

      <!-- 地区数据和项目表格 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 最新学员 -->
        <VaCard>
          <VaCardTitle class="font-semibold">Recent Students</VaCardTitle>
          <VaCardContent>
            <VaList>
              <VaListItem v-for="student in recentStudents" :key="student.id">
                <VaListItemSection avatar>
                  <VaAvatar :color="student.color">
                    {{ student.name.charAt(0) }}
                  </VaAvatar>
                </VaListItemSection>
                <VaListItemSection>
                  <VaListItemLabel>{{ student.name }}</VaListItemLabel>
                  <VaListItemLabel caption>{{ student.course }}</VaListItemLabel>
                </VaListItemSection>
                <VaListItemSection icon>
                  <VaChip :color="student.statusColor" size="small">
                    {{ student.status }}
                  </VaChip>
                </VaListItemSection>
              </VaListItem>
            </VaList>
          </VaCardContent>
        </VaCard>

        <!-- 最新行程 -->
        <VaCard>
          <VaCardTitle class="font-semibold">Recent Trips</VaCardTitle>
          <VaCardContent>
            <div v-if="recentTrips.length === 0" class="text-center py-8 text-secondary">
              <VaIcon name="sailing" size="large" class="mb-2 opacity-30" />
              <p>No trip data available</p>
            </div>
            <VaList v-else>
              <VaListItem v-for="trip in recentTrips" :key="trip.id">
                <VaListItemSection avatar>
                  <VaAvatar :color="trip.color">
                    <VaIcon name="sailing" />
                  </VaAvatar>
                </VaListItemSection>
                <VaListItemSection>
                  <VaListItemLabel>{{ trip.destination }}</VaListItemLabel>
                  <VaListItemLabel caption>{{ trip.date }} • {{ trip.participants }} people</VaListItemLabel>
                </VaListItemSection>
                <VaListItemSection icon>
                  <VaChip :color="trip.statusColor" size="small">
                    {{ trip.status }}
                  </VaChip>
                </VaListItemSection>
              </VaListItem>
            </VaList>
          </VaCardContent>
        </VaCard>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const stats = ref([
  { title: 'Total Students', value: '0', trend: 15, color: '#4285f4', icon: 'groups', stripe: true },
  { title: 'Ongoing Trips', value: '0', trend: 8, color: '#ea4335', icon: 'sailing', stripe: true },
  { title: 'Available Rooms', value: '0', trend: -5, color: '#34a853', icon: 'hotel', stripe: true },
  { title: 'Monthly Revenue', value: '$0', trend: 20, color: '#fbbc04', icon: 'payments', stripe: true }
])

const totalRevenue = ref('22,214')
const monthRevenue = ref('11,998')
const monthExpense = ref('10,216')
const yearlyRevenue = ref('36,358')
const monthEarnings = ref('6,820')

const monthlyData = ref([45, 52, 48, 65, 72, 68, 78, 82, 75, 88, 92, 85])
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const recentStudents = ref([])
const recentTrips = ref([])

const loadDashboardData = async () => {
  try {
    const [studentsRes, tripsRes, roomsRes] = await Promise.all([
      api.get('/students'),
      api.get('/trips'),
      api.get('/rooms')
    ])

    const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.data || [])
    const tripsData = Array.isArray(tripsRes.data) ? tripsRes.data : (tripsRes.data?.data || [])
    const roomsData = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data?.data || [])

    // 更新统计
    stats.value[0].value = studentsData.length.toString()
    stats.value[1].value = tripsData.filter(t => t.status === 'ongoing' || t.status === 'confirmed').length.toString()
    stats.value[2].value = roomsData.filter(r => r.status === 'available').length.toString()
    stats.value[3].value = `$${(studentsData.length * 1.8).toFixed(1)}k`

    // 最新学员
    const colors = ['primary', 'success', 'warning', 'danger', 'info']
    recentStudents.value = studentsData.slice(0, 5).map((s, i) => ({
      id: s.id,
      name: s.name_cn || s.name_en || 'Unknown',
      course: s.course_type || 'OW Open Water',
      status: 'Active',
      statusColor: 'info',
      color: colors[i % colors.length]
    }))

    // 最新行程  
    recentTrips.value = tripsData.slice(0, 5).map((t, i) => ({
      id: t.id,
      destination: t.destination || 'Unknown',
      date: formatDate(t.trip_date),
      participants: t.current_participants || 0,
      status: 'Confirmed',
      statusColor: 'success',
      color: colors[i % colors.length]
    }))
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  line-height: 1.2;
}

.chart-bar {
  border-radius: 4px 4px 0 0;
  cursor: pointer;
}

.revenue-chart {
  padding: 1rem 0;
}

.earnings-mini-chart > div {
  transition: all 0.3s ease;
}

.earnings-mini-chart > div:hover {
  opacity: 1 !important;
}
</style>

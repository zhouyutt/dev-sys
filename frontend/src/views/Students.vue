<template>
  <div class="students-page">
    <div class="page-header">
      <h1 class="page-title">学员管理</h1>
      <VaButton @click="showAddModal = true">
        <VaIcon name="add" class="mr-1" />
        添加学员
      </VaButton>
    </div>

    <!-- 搜索和筛选 -->
    <VaCard class="mb-4">
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <VaInput
            v-model="filters.search"
            placeholder="搜索学员姓名..."
            @input="handleSearch"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.course"
            placeholder="选择课程"
            :options="courseOptions"
            @update:modelValue="loadStudents"
          />

          <VaSelect
            v-model="filters.status"
            placeholder="选择状态"
            :options="statusOptions"
            @update:modelValue="loadStudents"
          />

          <VaButton preset="secondary" @click="resetFilters">
            <VaIcon name="refresh" class="mr-1" />
            重置
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 学员列表 -->
    <VaCard>
      <VaCardContent>
        <VaDataTable
          :items="students"
          :columns="columns"
          :loading="loading"
          :per-page="perPage"
          :current-page="currentPage"
          hoverable
          striped
        >
          <template #cell(name)="{ rowData }">
            <div class="flex items-center gap-2">
              <VaAvatar size="small" color="primary">
                {{ (rowData.name_cn || rowData.name_en || '?').charAt(0) }}
              </VaAvatar>
              <div>
                <div class="font-medium">{{ rowData.name_cn || rowData.name_en || '未知' }}</div>
                <div class="text-xs text-secondary">{{ rowData.name_en }}</div>
              </div>
            </div>
          </template>

          <template #cell(course)="{ rowData }">
            <VaBadge :text="rowData.course_type || '未选择'" color="info" />
          </template>

          <template #cell(status)="{ rowData }">
            <VaChip
              :color="getStatusColor(rowData.status)"
              size="small"
            >
              {{ rowData.status || '待确认' }}
            </VaChip>
          </template>

          <template #cell(contact)="{ rowData }">
            <div class="text-sm">
              <div v-if="rowData.phone">
                <VaIcon name="phone" size="small" /> {{ rowData.phone }}
              </div>
              <div v-if="rowData.wechat" class="text-secondary">
                <VaIcon name="chat" size="small" /> {{ rowData.wechat }}
              </div>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-1">
              <VaButton
                preset="plain"
                size="small"
                icon="visibility"
                @click="viewStudent(rowData)"
              />
              <VaButton
                preset="plain"
                size="small"
                icon="edit"
                @click="editStudent(rowData)"
              />
              <VaButton
                preset="plain"
                size="small"
                icon="delete"
                color="danger"
                @click="confirmDelete(rowData)"
              />
            </div>
          </template>
        </VaDataTable>

        <!-- 分页 -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-secondary">
            共 {{ totalStudents }} 名学员
          </div>
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            @update:modelValue="loadStudents"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 添加/编辑学员对话框 -->
    <VaModal
      v-model="showAddModal"
      size="large"
      title="添加学员"
      ok-text="保存"
      cancel-text="取消"
      @ok="saveStudent"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaInput
            v-model="formData.chinese_name"
            label="中文姓名"
            placeholder="请输入中文姓名"
            required
          />
          <VaInput
            v-model="formData.english_name"
            label="英文姓名"
            placeholder="请输入英文姓名"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaSelect
            v-model="formData.gender"
            label="性别"
            :options="['男', '女']"
          />
          <VaInput
            v-model="formData.passport_number"
            label="护照号码"
            placeholder="请输入护照号码"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaInput
            v-model="formData.phone"
            label="手机号"
            placeholder="请输入手机号"
          />
          <VaInput
            v-model="formData.wechat"
            label="微信号"
            placeholder="请输入微信号"
          />
        </div>

        <VaSelect
          v-model="formData.course_type"
          label="课程类型"
          :options="courseOptions"
        />

        <VaTextarea
          v-model="formData.notes"
          label="备注"
          placeholder="输入备注信息..."
          :max-rows="3"
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

const students = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const currentPage = ref(1)
const perPage = ref(10)
const totalStudents = ref(0)

const filters = ref({
  search: '',
  course: '',
  status: ''
})

const columns = [
  { key: 'name', label: '姓名', sortable: true },
  { key: 'course', label: '课程' },
  { key: 'status', label: '状态' },
  { key: 'contact', label: '联系方式' },
  { key: 'actions', label: '操作', width: 150 }
]

const courseOptions = [
  '全部',
  'OW开放水域',
  'AOW进阶开放水域',
  '救援潜水员',
  '潜水长',
  '教练课程'
]

const statusOptions = ['全部', '待确认', '已确认', '学习中', '已完成', '已取消']

const formData = ref({
  chinese_name: '',
  english_name: '',
  gender: '男',
  passport_number: '',
  phone: '',
  wechat: '',
  course_type: '',
  notes: ''
})

const totalPages = computed(() => Math.ceil(totalStudents.value / perPage.value))

const getStatusColor = (status) => {
  const colorMap = {
    '待确认': 'warning',
    '已确认': 'info',
    '学习中': 'primary',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return colorMap[status] || 'secondary'
}

const loadStudents = async () => {
  loading.value = true
  try {
    const response = await api.get('/students', { params: filters.value })
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || response || [])
    students.value = data
    totalStudents.value = students.value.length
    console.log('Loaded students:', students.value)
  } catch (error) {
    console.error('加载学员失败:', error)
    notify({ message: '加载学员列表失败', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadStudents()
}

const resetFilters = () => {
  filters.value = { search: '', course: '', status: '' }
  currentPage.value = 1
  loadStudents()
}

const saveStudent = async () => {
  try {
    await api.post('/students', formData.value)
    notify({ message: '学员添加成功', color: 'success' })
    showAddModal.value = false
    loadStudents()
    resetForm()
  } catch (error) {
    notify({ message: '学员添加失败', color: 'danger' })
  }
}

const viewStudent = (student) => {
  // TODO: 查看学员详情
  notify({ message: `查看学员: ${student.name_cn || student.name_en}`, color: 'info' })
}

const editStudent = (student) => {
  // TODO: 编辑学员
  notify({ message: `编辑学员: ${student.name_cn || student.name_en}`, color: 'info' })
}

const confirmDelete = (student) => {
  // TODO: 删除确认
  notify({ message: `删除学员: ${student.name_cn || student.name_en}`, color: 'warning' })
}

const resetForm = () => {
  formData.value = {
    chinese_name: '',
    english_name: '',
    gender: '男',
    passport_number: '',
    phone: '',
    wechat: '',
    course_type: '',
    notes: ''
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped lang="scss">
.students-page {
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
</style>

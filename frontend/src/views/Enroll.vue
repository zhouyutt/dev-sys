<template>
  <div class="enroll-container">
    <va-card class="enroll-card">
      <va-card-title class="text-center">
        <h2>学员报名</h2>
        <p class="text-secondary mt-2">请填写以下信息完成报名</p>
      </va-card-title>
      
      <va-card-content>
        <va-stepper v-model="currentStep" :steps="steps" class="mb-4">
          <!-- 步骤1: 基本信息 -->
          <template #step-content-0>
            <div class="step-content">
              <h3 class="mb-4">基本信息</h3>
              
              <va-input
                v-model="form.name_en"
                label="英文姓名 *"
                placeholder="与护照一致"
                class="mb-3"
                :rules="[(v) => !!v || '请输入英文姓名']"
              />

              <va-input
                v-model="form.name_cn"
                label="中文姓名"
                placeholder="选填"
                class="mb-3"
              />

              <va-select
                v-model="form.gender"
                label="性别 *"
                :options="genderOptions"
                class="mb-3"
                :rules="[(v) => !!v || '请选择性别']"
              />

              <va-date-input
                v-model="form.birth_date"
                label="出生日期"
                class="mb-3"
              />

              <va-input
                v-model="form.nationality"
                label="国籍"
                placeholder="例如: China"
                class="mb-3"
              />
            </div>
          </template>

          <!-- 步骤2: 联系方式 -->
          <template #step-content-1>
            <div class="step-content">
              <h3 class="mb-4">联系方式</h3>

              <va-input
                v-model="form.phone"
                label="手机号码 *"
                placeholder="+60..."
                class="mb-3"
                :rules="[(v) => !!v || '请输入手机号码']"
              />

              <va-input
                v-model="form.email"
                label="邮箱"
                type="email"
                placeholder="example@email.com"
                class="mb-3"
              />

              <va-input
                v-model="form.wechat"
                label="微信号"
                class="mb-3"
              />

              <va-input
                v-model="form.emergency_contact"
                label="紧急联系人"
                class="mb-3"
              />

              <va-input
                v-model="form.emergency_phone"
                label="紧急联系电话"
                class="mb-3"
              />
            </div>
          </template>

          <!-- 步骤3: 护照信息 -->
          <template #step-content-2>
            <div class="step-content">
              <h3 class="mb-4">护照信息</h3>

              <va-file-upload
                v-model="passportFile"
                type="single"
                file-types=".jpg,.jpeg,.png,.pdf"
                class="mb-3"
                @change="handlePassportUpload"
              >
                <template #content>
                  <div class="upload-area">
                    <va-icon name="upload" size="large" />
                    <p>点击或拖拽上传护照照片</p>
                    <p class="text-secondary text-sm">支持 JPG, PNG, PDF 格式</p>
                  </div>
                </template>
              </va-file-upload>

              <va-input
                v-model="form.passport_number"
                label="护照号码 *"
                placeholder="自动识别或手动填写"
                class="mb-3"
                :rules="[(v) => !!v || '请输入护照号码']"
              />

              <va-date-input
                v-model="form.passport_expiry"
                label="护照过期日期"
                class="mb-3"
              />
            </div>
          </template>

          <!-- 步骤4: 课程选择 -->
          <template #step-content-3>
            <div class="step-content">
              <h3 class="mb-4">课程选择</h3>

              <va-select
                v-model="form.course_id"
                label="选择课程"
                :options="courseOptions"
                text-by="course_name"
                value-by="id"
                class="mb-3"
              >
                <template #content="{ value }">
                  <div v-if="value">
                    <div class="font-bold">{{ value.course_name }}</div>
                    <div class="text-sm text-secondary">
                      {{ value.course_name_en }} - {{ value.duration_days }}天
                      - {{ value.price }} {{ value.currency }}
                    </div>
                  </div>
                </template>
              </va-select>

              <va-input
                v-model="form.certification_level"
                label="现有证书等级"
                placeholder="例如: OW, AOW"
                class="mb-3"
              />

              <va-textarea
                v-model="form.medical_conditions"
                label="医疗状况"
                placeholder="请如实填写任何医疗状况"
                class="mb-3"
              />

              <va-textarea
                v-model="form.special_requirements"
                label="特殊要求"
                placeholder="其他需要说明的事项"
                class="mb-3"
              />
            </div>
          </template>
        </va-stepper>

        <div class="stepper-actions">
          <va-button
            v-if="currentStep > 0"
            @click="currentStep--"
            preset="secondary"
          >
            上一步
          </va-button>
          
          <va-button
            v-if="currentStep < steps.length - 1"
            @click="currentStep++"
          >
            下一步
          </va-button>

          <va-button
            v-if="currentStep === steps.length - 1"
            @click="handleSubmit"
            :loading="submitting"
          >
            提交报名
          </va-button>
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { studentAPI, courseAPI } from '../api'
import { useToast } from 'vuestic-ui'

const router = useRouter()
const { init: notify } = useToast()

const currentStep = ref(0)
const steps = [
  { label: '基本信息' },
  { label: '联系方式' },
  { label: '护照信息' },
  { label: '课程选择' }
]

const genderOptions = ['male', 'female', 'other']
const courseOptions = ref([])
const passportFile = ref([])
const submitting = ref(false)

const form = ref({
  name_en: '',
  name_cn: '',
  gender: '',
  birth_date: null,
  nationality: '',
  phone: '',
  email: '',
  wechat: '',
  passport_number: '',
  passport_expiry: null,
  passport_photo_url: '',
  course_id: null,
  certification_level: '',
  emergency_contact: '',
  emergency_phone: '',
  medical_conditions: '',
  special_requirements: ''
})

const loadCourses = async () => {
  try {
    const response = await courseAPI.getAll({ status: 'active' })
    courseOptions.value = response.data
  } catch (error) {
    console.error('加载课程失败:', error)
  }
}

const handlePassportUpload = async () => {
  if (passportFile.value.length === 0) return

  try {
    const formData = new FormData()
    formData.append('passport', passportFile.value[0])

    const response = await studentAPI.uploadPassport(formData)
    
    if (response.success) {
      // 自动填充识别的信息
      if (response.data.passport_number) {
        form.value.passport_number = response.data.passport_number
      }
      if (response.data.name_en) {
        form.value.name_en = response.data.name_en
      }
      if (response.data.gender) {
        form.value.gender = response.data.gender
      }
      form.value.passport_photo_url = response.data.passport_photo_url

      notify({
        message: '护照识别成功',
        color: 'success'
      })
    }
  } catch (error) {
    notify({
      message: '护照识别失败，请手动填写信息',
      color: 'warning'
    })
  }
}

const handleSubmit = async () => {
  if (!form.value.name_en || !form.value.gender || !form.value.phone || !form.value.passport_number) {
    notify({
      message: '请填写必填项',
      color: 'warning'
    })
    return
  }

  submitting.value = true
  try {
    const response = await studentAPI.enroll(form.value)
    
    if (response.success) {
      notify({
        message: '报名成功！我们会尽快联系您',
        color: 'success'
      })
      
      // 3秒后跳转
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    }
  } catch (error) {
    notify({
      message: error.response?.data?.message || '报名失败',
      color: 'danger'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.enroll-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.enroll-card {
  width: 100%;
  max-width: 800px;
}

.step-content {
  min-height: 300px;
  padding: 20px 0;
}

.stepper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.upload-area {
  text-align: center;
  padding: 40px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #0091FF;
  background-color: #f0f8ff;
}
</style>

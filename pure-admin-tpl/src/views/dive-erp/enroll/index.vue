<template>
  <div class="enroll-page min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
    <el-card class="w-full max-w-2xl shadow-xl">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800">{{ t("diveErp.enroll.title") }}</h1>
          <p class="text-gray-600 mt-1">{{ t("diveErp.enroll.subtitle") }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ t("diveErp.enroll.hint") }}</p>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="top">
        <el-divider content-position="left">{{ t("diveErp.enroll.passportSection") }}</el-divider>
        <el-upload
          class="w-full mb-4"
          drag
          :action="uploadUrl"
          name="passport"
          :show-file-list="false"
          :on-success="handlePassportSuccess"
          :on-error="handlePassportError"
        >
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <span class="text-base mb-1">{{ t("diveErp.enroll.passportDrag") }}</span>
            <span class="text-xs">{{ t("diveErp.enroll.passportHint") }}</span>
          </div>
        </el-upload>
        <el-divider content-position="left">{{ t("diveErp.enroll.basicInfo") }}</el-divider>
        <el-form-item :label="t('diveErp.enroll.nameEn')" prop="name_en">
          <el-input v-model="form.name_en" :placeholder="t('diveErp.enroll.nameEn')" />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.nameCn')" prop="name_cn">
          <el-input v-model="form.name_cn" placeholder="输入中文姓名" />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.gender')" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio value="male">{{ t("diveErp.enroll.male") }}</el-radio>
            <el-radio value="female">{{ t("diveErp.enroll.female") }}</el-radio>
            <el-radio value="other">{{ t("diveErp.enroll.other") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.dob')" prop="birth_date">
          <el-date-picker
            v-model="form.birth_date"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="t('diveErp.enroll.dob')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.nationality')" prop="nationality">
          <el-input v-model="form.nationality" placeholder="e.g. China" />
        </el-form-item>

        <el-divider content-position="left">{{ t("diveErp.enroll.contactInfo") }}</el-divider>
        <el-form-item :label="t('diveErp.enroll.phoneNo')" prop="phone">
          <el-input v-model="form.phone" placeholder="e.g., +60123456789" />
        </el-form-item>
        <el-form-item :label="t('diveErp.common.email')" prop="email">
          <el-input v-model="form.email" placeholder="your.email@example.com" />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.wechat')" prop="wechat">
          <el-input v-model="form.wechat" :placeholder="t('diveErp.enroll.wechat')" />
        </el-form-item>

        <el-divider content-position="left">{{ t("diveErp.enroll.passportInfo") }}</el-divider>
        <el-form-item :label="t('diveErp.enroll.passportNo')" prop="passport_number">
          <el-input v-model="form.passport_number" placeholder="e.g., E12345678" />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.passportExpiry')" prop="passport_expiry">
          <el-date-picker
            v-model="form.passport_expiry"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="t('diveErp.enroll.passportExpiry')"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">{{ t("diveErp.enroll.emergency") }}</el-divider>
        <el-form-item :label="t('diveErp.enroll.emergencyName')" prop="emergency_contact">
          <el-input v-model="form.emergency_contact" :placeholder="t('diveErp.enroll.emergencyName')" />
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.emergencyPhone')" prop="emergency_phone">
          <el-input v-model="form.emergency_phone" :placeholder="t('diveErp.enroll.emergencyPhone')" />
        </el-form-item>

        <el-divider content-position="left">{{ t("diveErp.enroll.courseSection") }}</el-divider>
        <el-form-item :label="t('diveErp.enroll.learningContent')" prop="learning_content">
          <el-select v-model="form.learning_content" :placeholder="t('diveErp.enroll.learningContent')" style="width: 100%">
            <el-option label="Fun Dive" value="Fun Dive" />
            <el-option label="DSD" value="DSD" />
            <el-option label="OW" value="OW" />
            <el-option label="AOW" value="AOW" />
            <el-option label="OW+AOW" value="OW+AOW" />
            <el-option :label="t('diveErp.enroll.snorkeling')" value="Snorkeling" />
            <el-option :label="t('diveErp.enroll.hiking')" value="Hiking" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.courseType')" prop="course_id">
          <el-select v-model="form.course_id" :placeholder="t('diveErp.enroll.courseType')" style="width: 100%">
            <el-option
              v-for="c in courses"
              :key="c.id"
              :label="c.course_name_en || c.course_name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目价格">
          <el-input
            :model-value="estimatedPriceLabel"
            readonly
            placeholder="请选择项目后自动计算"
          />
          <div class="w-full mt-2 text-xs text-gray-500">项目和价格 1:1 绑定，价格来自“价格管理”页面配置。</div>
        </el-form-item>

        <el-form-item label="是否拼房" prop="room_sharing_preference">
          <el-radio-group v-model="form.room_sharing_preference">
            <el-radio value="shared">是</el-radio>
            <el-radio value="private">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert
          v-if="form.room_sharing_preference === 'shared'"
          title="提示：拼房为 3-4 人一个房间。"
          type="info"
          :closable="false"
          class="mb-4"
        />

        <el-form-item label="是否报名诗巴丹行程" prop="sipadan_trip">
          <el-radio-group v-model="form.sipadan_trip">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert
          v-if="form.sipadan_trip === true"
          title="本次诗巴丹行程诗巴丹 2 潜，马布岛 1 潜。"
          type="warning"
          :closable="false"
          class="mb-4"
        />

        <el-form-item :label="t('diveErp.enroll.additionalNotes')" prop="notes">
          <el-input v-model="form.notes" type="textarea" :rows="3" :placeholder="t('diveErp.enroll.additionalNotes')" />
        </el-form-item>

        <el-divider content-position="left">{{ t("diveErp.enroll.agreementTitle") }}</el-divider>
        <el-form-item prop="agree_protocol">
          <el-checkbox v-model="form.agree_protocol">
            我已阅读并同意《责任免除暨风险承担协议》
          </el-checkbox>
          <div class="w-full mt-2 text-xs text-gray-500">
            提交即视为同意协议条款。
            <a href="/waiver/免责声明协议.pdf" target="_blank" class="text-blue-600 hover:underline ml-1">查看协议</a>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="submitting" @click="onSubmit" class="w-full">
            {{ t("diveErp.enroll.submit") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { studentApi, courseApi } from "@/api/dive";

defineOptions({ name: "Enroll" });

const { t } = useI18n();

const formRef = ref();
const submitting = ref(false);
const courses = ref<any[]>([]);

const form = reactive({
  name_en: "",
  name_cn: "",
  gender: "male",
  birth_date: "",
  nationality: "",
  phone: "",
  email: "",
  wechat: "",
  passport_number: "",
  passport_expiry: "",
  emergency_contact: "",
  emergency_phone: "",
  learning_content: "" as string,
  course_id: null as number | null,
  room_sharing_preference: "private" as "shared" | "private",
  sipadan_trip: false as boolean,
  notes: "",
  agree_protocol: false
});

const rules = {
  name_en: [{ required: true, message: "Required", trigger: "blur" }],
  gender: [{ required: true, message: "Required", trigger: "change" }],
  phone: [{ required: true, message: "Required", trigger: "blur" }],
  passport_number: [{ required: true, message: "Required", trigger: "blur" }],
  course_id: [{ required: true, message: "Required", trigger: "change" }],
  agree_protocol: [
    {
      validator: (_rule: any, value: boolean, callback: (error?: Error) => void) => {
        if (value) callback();
        else callback(new Error(t("diveErp.enroll.agreeRequired")));
      },
      trigger: "change"
    }
  ]
};

const apiBase = (import.meta.env.VITE_API_BASE as string) || "/api";
const uploadUrl = computed(() => `${apiBase}/students/upload-passport`);
const selectedCourse = computed(() =>
  courses.value.find((course: any) => course.id === form.course_id) || null
);
const estimatedPriceLabel = computed(() => {
  if (!selectedCourse.value) return "";
  const price = selectedCourse.value.price ?? 0;
  const currency = selectedCourse.value.currency || "MYR";
  return `${currency} ${Number(price).toFixed(2)}`;
});

async function loadCourses() {
  try {
    const res = await courseApi.list();
    courses.value = (res as any)?.data ?? [];
  } catch (_) {}
}

function handlePassportSuccess(res: any) {
  if (res?.success && res.data) {
    const d = res.data;
    if (d.passport_number) form.passport_number = d.passport_number;
    if (d.nationality) form.nationality = d.nationality;
    if (d.birth_date) form.birth_date = d.birth_date;
    if (d.passport_expiry) form.passport_expiry = d.passport_expiry;
    if (d.gender) form.gender = d.gender;
    if (d.name_en) form.name_en = d.name_en;
    message(t("diveErp.enroll.passportOcrSuccess"), { type: "success" });
  } else {
    message(t("diveErp.enroll.passportOcrFail"), { type: "warning" });
  }
}

function handlePassportError() {
  message(t("diveErp.enroll.passportUploadFail"), { type: "error" });
}

async function onSubmit() {
  try {
    if (formRef.value) await formRef.value.validate();
  } catch (_) {
    return;
  }
  submitting.value = true;
  try {
    await studentApi.enroll({
      name_en: form.name_en,
      name_cn: form.name_cn,
      gender: form.gender,
      birth_date: form.birth_date || null,
      nationality: form.nationality,
      phone: form.phone,
      email: form.email,
      wechat: form.wechat,
      passport_number: form.passport_number,
      passport_expiry: form.passport_expiry || null,
      learning_content: form.learning_content || null,
      emergency_contact: form.emergency_contact,
      emergency_phone: form.emergency_phone,
      course_id: form.course_id,
      notes: form.notes,
      room_sharing_preference: form.room_sharing_preference,
      sipadan_trip: form.sipadan_trip,
      agree_protocol: form.agree_protocol
    });
    message(t("diveErp.enroll.enrollSuccess"), { type: "success" });
    formRef.value?.resetFields();
  } catch (e: any) {
    message(e?.response?.data?.message || t("diveErp.enroll.enrollFail"), { type: "error" });
  } finally {
    submitting.value = false;
  }
}

onMounted(() => loadCourses());
</script>

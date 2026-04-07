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
          <el-input v-model="form.name_cn" :placeholder="t('diveErp.enroll.nameCnPlaceholder')" />
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
          <el-select
            v-model="form.learning_content"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :placeholder="t('diveErp.enroll.learningContent')"
            style="width: 100%"
          >
            <el-option
              v-for="opt in learningContentOptions"
              :key="opt"
              :label="learningContentLabel(opt)"
              :value="opt"
            />
          </el-select>
        </el-form-item>
        <template v-if="selectedFunDiveRoutes.length">
          <el-form-item
            v-for="route in selectedFunDiveRoutes"
            :key="route"
            :label="t('diveErp.enroll.funDiveDateLabel', { route: learningContentLabel(route) })"
            prop="fun_dive_date_map"
          >
            <el-date-picker
              v-model="form.fun_dive_date_map[route]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('diveErp.enroll.funDiveDatePlaceholder', { route: learningContentLabel(route) })"
              style="width: 100%"
            />
          </el-form-item>
        </template>
        <el-form-item :label="t('diveErp.enroll.courseType')" prop="course_id">
          <el-select v-model="form.course_id" :placeholder="t('diveErp.enroll.courseType')" style="width: 100%">
            <el-option
              v-for="c in courses"
              :key="c.id"
              :label="c.course_name_en || c.course_name"
              :value="c.id"
            />
          </el-select>
          <div class="w-full mt-2 text-xs text-gray-500">{{ t('diveErp.enroll.courseTypeHint') }}</div>
        </el-form-item>
        <el-form-item :label="t('diveErp.enroll.projectPrice')">
          <el-input
            :model-value="estimatedPriceLabel"
            readonly
            :placeholder="t('diveErp.enroll.projectPricePlaceholder')"
          />
          <div class="w-full mt-2 text-xs text-gray-500">{{ t('diveErp.enroll.projectPriceHint') }}</div>
        </el-form-item>

        <el-form-item :label="t('diveErp.enroll.stayRequired')" prop="stay_required">
          <el-radio-group v-model="form.stay_required">
            <el-radio :value="true">{{ t('diveErp.common.yes') }}</el-radio>
            <el-radio :value="false">{{ t('diveErp.common.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.stay_required">
          <el-form-item :label="t('diveErp.enroll.stayDates')" prop="stay_dates">
            <el-date-picker
              v-model="form.stay_dates"
              type="daterange"
              value-format="YYYY-MM-DD"
              :range-separator="t('diveErp.enroll.rangeSeparator')"
              :start-placeholder="t('diveErp.guests.checkIn')"
              :end-placeholder="t('diveErp.guests.checkOut')"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item :label="t('diveErp.enroll.roomSharing')" prop="room_sharing_preference">
            <el-radio-group v-model="form.room_sharing_preference">
              <el-radio value="shared">{{ t('diveErp.common.yes') }}</el-radio>
              <el-radio value="private">{{ t('diveErp.common.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-alert
            v-if="form.room_sharing_preference === 'shared'"
            :title="t('diveErp.enroll.roomSharingHint')"
            type="info"
            :closable="false"
            class="mb-4"
          />
        </template>
        <el-form-item :label="t('diveErp.enroll.sipadanTrip')" prop="sipadan_trip">
          <el-radio-group v-model="form.sipadan_trip">
            <el-radio :value="true">{{ t('diveErp.common.yes') }}</el-radio>
            <el-radio :value="false">{{ t('diveErp.common.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert
          v-if="form.sipadan_trip === true"
          :title="t('diveErp.enroll.sipadanTripHint')"
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
            {{ t('diveErp.enroll.waiverAgreeText') }}
          </el-checkbox>
          <div class="w-full mt-2 text-xs text-gray-500">
            {{ t('diveErp.enroll.waiverHint') }}
            <a href="/waiver/免责声明协议.pdf" target="_blank" class="text-blue-600 hover:underline ml-1">{{ t('diveErp.enroll.viewAgreement') }}</a>
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
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { studentApi, courseApi } from "@/api/dive";

defineOptions({ name: "Enroll" });

const { t } = useI18n();

const formRef = ref();
const submitting = ref(false);
const courses = ref<any[]>([]);
const learningContentOptions = [
  "DSD",
  "OW",
  "AOW",
  "OW+AOW",
  "Snorkeling",
  "Hiking",
  "Fun Dive-马达京路线",
  "Fun Dive-西亚米路线",
  "Fun Dive-马布岛路线"
];
const FUN_DIVE_OPTIONS = [
  "Fun Dive-马达京路线",
  "Fun Dive-西亚米路线",
  "Fun Dive-马布岛路线"
];
const learningContentLabel = (value: string) => {
  const keyMap: Record<string, string> = {
    DSD: "diveErp.enroll.learningOptions.dsd",
    OW: "diveErp.enroll.learningOptions.ow",
    AOW: "diveErp.enroll.learningOptions.aow",
    "OW+AOW": "diveErp.enroll.learningOptions.owAow",
    Snorkeling: "diveErp.enroll.learningOptions.snorkeling",
    Hiking: "diveErp.enroll.learningOptions.hiking",
    "Fun Dive-马达京路线": "diveErp.enroll.learningOptions.funDiveMataking",
    "Fun Dive-西亚米路线": "diveErp.enroll.learningOptions.funDiveSiAmil",
    "Fun Dive-马布岛路线": "diveErp.enroll.learningOptions.funDiveMabul"
  };
  return t(keyMap[value] || value);
};

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
  learning_content: [] as string[],
  course_id: null as number | null,
  stay_required: false as boolean,
  stay_dates: [] as string[],
  room_sharing_preference: "private" as "shared" | "private",
  sipadan_trip: false as boolean,
  fun_dive_date_map: {} as Record<string, string>,
  notes: "",
  agree_protocol: false
});

const rules = {
  name_en: [{ required: true, message: "Required", trigger: "blur" }],
  gender: [{ required: true, message: "Required", trigger: "change" }],
  phone: [{ required: true, message: "Required", trigger: "blur" }],
  passport_number: [{ required: true, message: "Required", trigger: "blur" }],
  stay_dates: [
    {
      validator: (_rule: any, value: string[], callback: (error?: Error) => void) => {
        if (!form.stay_required) return callback();
        if (Array.isArray(value) && value.length === 2) return callback();
        callback(new Error(t("diveErp.enroll.stayDatesRequired")));
      },
      trigger: "change"
    }
  ],
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
const selectedFunDiveRoutes = computed(() =>
  form.learning_content.filter(item => FUN_DIVE_OPTIONS.includes(item))
);
const estimatedPriceLabel = computed(() => {
  if (!selectedCourse.value) return "";
  const price = selectedCourse.value.price ?? 0;
  const currency = selectedCourse.value.currency || "MYR";
  return `${currency} ${Number(price).toFixed(2)}`;
});

watch(selectedFunDiveRoutes, (routes) => {
  const nextMap: Record<string, string> = {};
  routes.forEach((route) => {
    nextMap[route] = form.fun_dive_date_map[route] || "";
  });
  form.fun_dive_date_map = nextMap;
}, { immediate: true });

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
      learning_content: form.learning_content,
      emergency_contact: form.emergency_contact,
      emergency_phone: form.emergency_phone,
      course_id: form.course_id,
      notes: form.notes,
      stay_required: form.stay_required,
      room_sharing_preference: form.stay_required ? form.room_sharing_preference : null,
      check_in_date: form.stay_required ? (form.stay_dates?.[0] || null) : null,
      check_out_date: form.stay_required ? (form.stay_dates?.[1] || null) : null,
      sipadan_trip: form.sipadan_trip,
      fun_dive_dates: selectedFunDiveRoutes.value.map(route => ({
        route,
        date: form.fun_dive_date_map[route] || null
      })),
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

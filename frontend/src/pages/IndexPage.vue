<template>
  <q-page padding class="bg-grey-1">
    <div class="container q-mx-auto" style="max-width: 800px">
      <div class="row items-center q-mb-xl">
        <div class="col">
          <div class="text-h3 text-weight-bold text-primary">My Tasks</div>
          <div class="text-subtitle1 text-grey-7">Fullstack Lab: Express + Prisma + Supabase</div>
        </div>
        <div class="col-auto">
          <q-btn
            round
            color="primary"
            icon="refresh"
            :loading="loading"
            @click="fetchTasks"
          >
            <q-tooltip>Reload Tasks</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div v-if="errorMessage" class="q-mb-md">
        <q-banner dense rounded class="bg-red-1 text-negative">
          <template v-slot:avatar>
            <q-icon name="error" color="negative" />
          </template>
          {{ errorMessage }}
        </q-banner>
      </div>

      <!-- ฟอร์มเพิ่มข้อมูลนักศึกษา -->
      <q-card flat bordered class="q-mb-lg" style="border-radius: 12px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="person_add" class="q-mr-sm" />
            เพิ่มข้อมูลนักศึกษา
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="studentName"
                outlined
                label="ชื่อ-นามสกุล"
                placeholder="เช่น ภาคิน อินแถลง"
                :disable="submitting"
                @keyup.enter="addStudent"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model="studentId"
                outlined
                label="รหัสนักศึกษา"
                placeholder="เช่น 6604101365"
                :disable="submitting"
                @keyup.enter="addStudent"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3 flex items-center">
              <q-btn
                unelevated
                color="primary"
                label="เพิ่มข้อมูล"
                icon="add"
                class="full-width"
                :loading="submitting"
                :disable="!studentName || !studentId"
                @click="addStudent"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md">
        <div v-if="loading" class="col-12 flex justify-center q-pa-xl">
          <q-spinner-dots color="primary" size="3em" />
        </div>

        <template v-else>
          <div v-if="tasks.length === 0" class="col-12 text-center q-pa-xl">
            <q-icon name="task_alt" size="4em" color="grey-4" />
            <div class="text-h6 text-grey-5 q-mt-md">No tasks found</div>
            <div class="text-caption text-grey-5">Try creating one using the seed script or API</div>
          </div>

          <div v-for="task in tasks" :key="task.id" class="col-12">
            <q-card flat bordered class="task-card overflow-hidden">
              <q-card-section>
                <div class="row no-wrap items-center">
                  <div class="col">
                    <div class="text-h6 text-weight-medium">{{ task.title }}</div>
                    <div class="text-body2 text-grey-8 q-mt-xs">{{ task.description || 'No description' }}</div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="bg-grey-2 q-py-xs row items-center no-wrap">
                <q-icon name="schedule" size="xs" color="grey-7" class="q-mr-xs" />
                <div class="text-caption text-grey-7">
                  {{ formatDate(task.createdAt) }}
                </div>
                <q-space />
                <q-chip outline dense size="sm" color="blue-7" text-color="blue-7">
                  {{ task.id.split('-')[0] }}
                </q-chip>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.task-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}
.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  border-color: var(--q-primary);
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const tasks = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const loadingErrorUrl = ref('');

// ตัวแปรสำหรับฟอร์มเพิ่มข้อมูล
const studentName = ref('');
const studentId = ref('');
const submitting = ref(false);

const fetchTasks = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const res = await api.get('/tasks');
    tasks.value = res.data.data; // backend ส่ง { data: [...] }
  } catch (err) {
    console.error('API Error:', err);
    const status = err.response ? err.response.status : 'Network Error';
    errorMessage.value = `โหลดงานไม่สำเร็จ (${status})`;
    loadingErrorUrl.value = api.defaults.baseURL + '/tasks';
  } finally {
    loading.value = false;
  }
};

const addStudent = async () => {
  // ตรวจสอบข้อมูล
  if (!studentName.value || !studentId.value) {
    $q.notify({
      type: 'warning',
      message: 'กรุณากรอกชื่อและรหัสนักศึกษา',
      position: 'top',
    });
    return;
  }

  submitting.value = true;

  try {
    const res = await api.post('/tasks', {
      title: studentName.value,
      description: studentId.value,
    });

    // แสดงข้อความสำเร็จ
    $q.notify({
      type: 'positive',
      message: `เพิ่มข้อมูล ${studentName.value} สำเร็จ!`,
      position: 'top',
      icon: 'check_circle',
    });

    // ล้างฟอร์ม
    studentName.value = '';
    studentId.value = '';

    // รีเฟรชรายการ
    await fetchTasks();
  } catch (err) {
    console.error('Add Student Error:', err);
    $q.notify({
      type: 'negative',
      message: 'ไม่สามารถเพิ่มข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      position: 'top',
      icon: 'error',
    });
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

onMounted(fetchTasks);
</script>

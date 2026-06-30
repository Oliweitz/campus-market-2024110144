<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useItemStore } from '@/stores/itemStore'
import { TYPE_LABELS, CAMPUS_LIST, CONDITION_OPTIONS, type ItemType, type LostOrFound } from '@/data/listings'
import { now } from '@/utils/date'
import FormField from '@/components/FormField.vue'

const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()

const TYPE_REDIRECT: Record<ItemType, string> = {
  secondhand: '/trade',
  lostfound: '/lost-found',
  group: '/group-buy',
  errand: '/errand',
}

const typeFields: ItemType[] = ['secondhand', 'lostfound', 'group', 'errand']
const infoType = ref<ItemType>('secondhand')
const submitting = ref(false)

// 通用字段
const title = ref('')
const description = ref('')
const campus = ref(userStore.campus || CAMPUS_LIST[0]!)
const location = ref('')
const tags = ref('')
const images = ref(['', '', ''])

// 二手交易专属
const price = ref('')
const condition = ref('')
const allowBargain = ref(true)
const stock = ref(1)

// 失物招领专属
const lostOrFound = ref<LostOrFound>('lost')
const eventTime = ref('')
const itemFeature = ref('')

// 拼单搭子专属
const groupType = ref('')
const targetCount = ref(2)
const deadline = ref('')

// 跑腿委托专属
const reward = ref('')
const taskPlace = ref('')
const expectedTime = ref('')

// 补充字段（Day4 规范要求）
const category = ref('')
const itemName = ref('')
const contact = ref('')
const taskType = ref('')
const from = ref('')
const to = ref('')

// 按字段的错误信息
const errors = reactive<Record<string, string>>({})

function clearErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

function getCurrentTime() {
  const d = new Date()
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

function validateForm(): boolean {
  clearErrors()

  if (!title.value.trim()) {
    errors.title = '请输入标题'
  }
  if (!location.value.trim()) {
    errors.location = '请输入地点'
  }
  if (!description.value.trim()) {
    errors.description = '请输入描述'
  }

  if (infoType.value === 'secondhand') {
    if (!category.value.trim()) {
      errors.category = '请输入商品分类'
    }
    if (Number(price.value) <= 0) {
      errors.price = '价格应大于 0'
    }
    if (!condition.value) {
      errors.condition = '请选择成色'
    }
  }

  if (infoType.value === 'lostfound') {
    if (!itemName.value.trim()) {
      errors.itemName = '请输入物品名称'
    }
    if (!eventTime.value) {
      errors.eventTime = '请选择发生时间'
    }
  }

  if (infoType.value === 'group') {
    if (!groupType.value.trim()) {
      errors.groupType = '请输入拼单类型'
    }
    if (targetCount.value < 2) {
      errors.targetCount = '目标人数不能少于 2 人'
    }
    if (!deadline.value) {
      errors.deadline = '请选择截止时间'
    }
  }

  if (infoType.value === 'errand') {
    if (!taskType.value.trim()) {
      errors.taskType = '请输入任务类型'
    }
    if (Number(reward.value) < 0) {
      errors.reward = '酬劳不能为负数'
    }
    if (!from.value.trim()) {
      errors.from = '请输入取件地点'
    }
    if (!to.value.trim()) {
      errors.to = '请输入送达地点'
    }
    if (!taskPlace.value.trim()) {
      errors.taskPlace = '请输入任务地点'
    }
    if (!deadline.value) {
      errors.deadline = '请选择截止时间'
    }
  }

  return Object.values(errors).every((m) => !m)
}

function resetForm() {
  title.value = ''
  description.value = ''
  location.value = ''
  tags.value = ''
  images.value = ['', '', '']
  price.value = ''
  condition.value = ''
  allowBargain.value = true
  stock.value = 1
  lostOrFound.value = 'lost'
  eventTime.value = ''
  itemFeature.value = ''
  groupType.value = ''
  targetCount.value = 2
  deadline.value = ''
  reward.value = ''
  taskPlace.value = ''
  expectedTime.value = ''
  category.value = ''
  itemName.value = ''
  contact.value = ''
  taskType.value = ''
  from.value = ''
  to.value = ''
  clearErrors()
}

// 类型切换时重置
watch(infoType, () => resetForm())

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  const nowStr = now()

  const base: Record<string, unknown> = {
    type: infoType.value,
    title: title.value.trim(),
    description: description.value.trim(),
    campus: campus.value,
    location: location.value,
    tags: tags.value ? tags.value.split(',').map((t) => t.trim()).filter(Boolean) : [],
    images: images.value.filter((u) => u.trim()),
    publisherId: userStore.currentUserId!,
    publisher: userStore.nickname || '当前用户',
    publishTime: getCurrentTime(),
    status: '进行中',
    viewCount: 0,
    favoriteCount: 0,
    createdAt: nowStr,
    updatedAt: nowStr,
  }

  if (infoType.value === 'secondhand') {
    base.category = category.value || undefined
    base.price = Number(price.value) || 0
    base.condition = condition.value
    base.allowBargain = allowBargain.value
    base.stock = stock.value || 1
  } else if (infoType.value === 'lostfound') {
    base.lostOrFound = lostOrFound.value
    base.itemName = itemName.value || undefined
    base.eventTime = eventTime.value || undefined
    base.itemFeature = itemFeature.value || undefined
    base.contact = contact.value || undefined
  } else if (infoType.value === 'group') {
    base.groupType = groupType.value || undefined
    base.targetCount = targetCount.value
    base.currentCount = 1
    base.deadline = deadline.value || undefined
  } else if (infoType.value === 'errand') {
    base.taskType = taskType.value
    base.reward = Number(reward.value) || 0
    base.from = from.value
    base.to = to.value
    base.deadline = deadline.value || undefined
    base.taskPlace = taskPlace.value
    base.expectedTime = expectedTime.value
  }

  try {
    const item = await itemStore.createItem(base as any)
    window.alert(TYPE_LABELS[infoType.value] + '发布成功')
    router.push(TYPE_REDIRECT[infoType.value])
  } catch {
    errors.submit = '发布失败，请检查 Mock 服务是否正常运行'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="publish">
    <div class="page-header">
      <h1>发布信息</h1>
      <p>选择发布类型，填写必要信息，让校园需求更快被看见。</p>
    </div>

    <div v-if="userStore.isLoggedIn" class="publish-form">
      <form @submit.prevent="handleSubmit">
        <FormField label="发布类型" required>
          <div class="type-row">
            <button
              v-for="t in typeFields"
              :key="t"
              type="button"
              :class="['type-btn', { on: infoType === t }]"
              @click="infoType = t"
            >
              {{ TYPE_LABELS[t] }}
            </button>
          </div>
        </FormField>

        <FormField label="标题" required :error="errors.title">
          <input v-model.trim="title" type="text" class="in" placeholder="请输入标题" />
        </FormField>

        <div class="fg-row">
          <div class="fg-half">
            <FormField label="校区" required>
              <select v-model="campus" class="in">
                <option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option>
              </select>
            </FormField>
          </div>
          <div class="fg-half">
            <FormField label="地点" required :error="errors.location">
              <input v-model.trim="location" type="text" class="in" placeholder="具体地点" />
            </FormField>
          </div>
        </div>

        <FormField label="描述" required :error="errors.description">
          <textarea v-model.trim="description" class="in ta" rows="5" placeholder="请简要描述具体情况"></textarea>
        </FormField>

        <FormField label="标签">
          <input v-model="tags" class="in" placeholder="教材, 前端 (逗号分隔)" />
        </FormField>

        <FormField label="图片">
          <div class="img-inputs">
            <input
              v-for="(_, idx) in images"
              :key="idx"
              v-model="images[idx]"
              :placeholder="'图片链接 ' + (idx + 1)"
              class="in img-url"
            />
          </div>
          <div v-if="images.some((u) => u.trim())" class="img-previews">
            <img
              v-for="(url, idx) in images.filter((u) => u.trim()).slice(0, 3)"
              :key="idx"
              :src="url"
              class="preview-thumb"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              alt=""
            />
          </div>
        </FormField>

        <!-- 二手交易 -->
        <template v-if="infoType === 'secondhand'">
          <FormField label="商品分类" required :error="errors.category">
            <input v-model.trim="category" type="text" class="in" placeholder="如：数码配件、教材资料、生活用品" />
          </FormField>
          <div class="fg-row">
            <div class="fg-half">
              <FormField label="价格 (元)" required :error="errors.price">
                <input v-model="price" type="number" min="0" class="in" placeholder="35" />
              </FormField>
            </div>
            <div class="fg-half">
              <FormField label="库存">
                <input v-model.number="stock" type="number" min="1" class="in" />
              </FormField>
            </div>
          </div>
          <div class="fg-row">
            <div class="fg-half">
              <FormField label="成色" required :error="errors.condition">
                <select v-model="condition" class="in">
                  <option value="">请选择成色</option>
                  <option v-for="o in CONDITION_OPTIONS" :key="o" :value="o">{{ o }}</option>
                </select>
              </FormField>
            </div>
            <div class="fg-half">
              <FormField label="支持砍价">
                <label class="cb-label"><input type="checkbox" v-model="allowBargain" /> 支持砍价</label>
              </FormField>
            </div>
          </div>
        </template>

        <!-- 失物招领 -->
        <template v-if="infoType === 'lostfound'">
          <FormField label="信息类型" required>
            <select v-model="lostOrFound" class="in">
              <option value="lost">寻物</option>
              <option value="found">招领</option>
            </select>
          </FormField>
          <FormField label="物品名称" required :error="errors.itemName">
            <input v-model.trim="itemName" type="text" class="in" placeholder="请输入物品名称" />
          </FormField>
          <FormField label="发生时间" required :error="errors.eventTime">
            <input v-model="eventTime" type="date" class="in" />
          </FormField>
          <FormField label="物品特征">
            <input v-model="itemFeature" class="in" placeholder="颜色、大小、特殊标记..." />
          </FormField>
          <FormField label="联系方式">
            <input v-model.trim="contact" type="text" class="in" placeholder="如：站内消息联系" />
          </FormField>
        </template>

        <!-- 拼单搭子 -->
        <template v-if="infoType === 'group'">
          <FormField label="拼单类型" required :error="errors.groupType">
            <input v-model.trim="groupType" type="text" class="in" placeholder="如：拼餐、资料团购、运动搭子" />
          </FormField>
          <FormField label="目标人数" required :error="errors.targetCount">
            <input v-model.number="targetCount" type="number" min="2" class="in" placeholder="请输入目标人数" />
          </FormField>
          <FormField label="截止时间" required :error="errors.deadline">
            <input v-model="deadline" type="date" class="in" />
          </FormField>
        </template>

        <!-- 跑腿委托 -->
        <template v-if="infoType === 'errand'">
          <FormField label="任务类型" required :error="errors.taskType">
            <input v-model.trim="taskType" type="text" class="in" placeholder="如：取快递、代买、代送" />
          </FormField>
          <FormField label="酬劳 (元)" required :error="errors.reward">
            <input v-model="reward" type="number" min="0" class="in" placeholder="5" />
          </FormField>
          <div class="fg-row">
            <div class="fg-half">
              <FormField label="取件地点" required :error="errors.from">
                <input v-model.trim="from" type="text" class="in" placeholder="取件地点" />
              </FormField>
            </div>
            <div class="fg-half">
              <FormField label="送达地点" required :error="errors.to">
                <input v-model.trim="to" type="text" class="in" placeholder="送达地点" />
              </FormField>
            </div>
          </div>
          <FormField label="任务地点" required :error="errors.taskPlace">
            <input v-model.trim="taskPlace" type="text" class="in" placeholder="具体地点" />
          </FormField>
          <FormField label="截止时间" required :error="errors.deadline">
            <input v-model="deadline" type="datetime-local" class="in" />
          </FormField>
          <FormField label="期望完成时间">
            <input v-model="expectedTime" class="in" placeholder="今晚20:00前" />
          </FormField>
        </template>

        <div v-if="errors.submit" class="err-box">
          <span>{{ errors.submit }}</span>
        </div>

        <div class="actions">
          <button type="button" class="secondary" @click="resetForm">重置</button>
          <button type="submit" class="primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '发布' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="login-required">
      <p>请先登录后再发布信息</p>
      <router-link to="/login" class="to-login">去登录</router-link>
    </div>
  </section>
</template>

<style scoped>
.publish { max-width: 580px; }
.page-header { padding: 24px; border-radius: 16px; background: var(--card-bg); margin-bottom: 16px; }
.page-header h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
.page-header p { margin: 0; color: var(--text-light); }

.publish-form { padding: 24px; border-radius: 16px; background: var(--card-bg); }

.fg-row { display: flex; gap: 12px; }
.fg-half { flex: 1; }

.in {
  width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px; outline: none; transition: border-color var(--transition);
}
.in:focus { border-color: var(--primary); }
.ta { resize: vertical; }
.cb-label { display: flex; align-items: center; gap: 6px; cursor: pointer; padding-top: 24px; font-size: 14px; }

.type-row { display: flex; gap: 8px; flex-wrap: wrap; }
.type-btn {
  padding: 8px 18px; border: none; background: var(--bg);
  border-radius: var(--radius-full); font-size: 13px; cursor: pointer;
  color: var(--text-light); transition: all var(--transition);
}
.type-btn.on { background: var(--primary); color: #fff; box-shadow: 0 2px 8px rgba(91,155,213,0.3); }

.actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }

button {
  border: none; border-radius: var(--radius-full); padding: 10px 24px;
  font-size: 14px; font-weight: 500; cursor: pointer; transition: all var(--transition);
}
button:disabled { cursor: not-allowed; opacity: 0.7; }
.primary { background: var(--primary); color: #fff; }
.primary:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(91,155,213,0.35); transform: translateY(-1px); }
.secondary { background: #f3f4f6; color: #374151; }
.secondary:hover { background: #e5e7eb; }

.err-box { background: var(--danger-light); border-radius: var(--radius-sm); padding: 10px 14px; margin-top: 12px; }
.err-box span { font-size: 13px; color: var(--danger); }

.img-inputs { display: flex; flex-direction: column; gap: 6px; }
.img-url { font-size: 13px !important; }
.img-previews { display: flex; gap: 8px; margin-top: 8px; overflow-x: auto; }
.preview-thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e0e0e0; }

.login-required { text-align: center; padding: 60px 0; }
.login-required p { margin: 0 0 16px; font-size: 15px; color: var(--text-light); }
.to-login {
  display: inline-block; padding: 10px 32px; background: var(--primary); color: #fff;
  text-decoration: none; border-radius: var(--radius-full); font-size: 14px; font-weight: 500;
  transition: all var(--transition);
}
.to-login:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); }
</style>

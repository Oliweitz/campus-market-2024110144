<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
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
const images = ref<string[]>([])
const uploading = ref(false)

// ---------- 内联通知（替代 window.alert）----------
type NotifyType = 'success' | 'error' | 'info'
const notify = reactive({ show: false, type: 'info' as NotifyType, message: '' })
let notifyTimer: ReturnType<typeof setTimeout> | null = null

function showNotification(type: NotifyType, message: string, duration = 3500) {
  if (notifyTimer) clearTimeout(notifyTimer)
  notify.show = true
  notify.type = type
  notify.message = message
  notifyTimer = setTimeout(() => { notify.show = false }, duration)
}

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
  images.value = []
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

// ---------- 图片上传 ----------
async function uploadSingleImage(file: File): Promise<string | null> {
  try {
    const res = await itemStore.uploadImage(file)
    return res.url
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || '上传失败'
    showNotification('error', '图片上传失败: ' + msg)
    return null
  }
}

async function processFiles(files: File[]) {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const MAX_COUNT = 9

  const validFiles = files.filter((f) => {
    if (!f.type.startsWith('image/')) {
      showNotification('info', `"${f.name}" 不是图片文件，已跳过`)
      return false
    }
    if (f.size > MAX_SIZE) {
      showNotification('info', `"${f.name}" 超过 5MB 限制，已跳过`)
      return false
    }
    return true
  })

  if (images.value.length + validFiles.length > MAX_COUNT) {
    showNotification('info', `最多上传 ${MAX_COUNT} 张图片，当前已有 ${images.value.length} 张`)
    return
  }

  uploading.value = true
  for (const file of validFiles) {
    const url = await uploadSingleImage(file)
    if (url) images.value.push(url)
  }
  uploading.value = false
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  processFiles(Array.from(input.files))
  input.value = '' // 重置，允许重复选同一文件
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  const imageFiles: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) imageFiles.push(file)
    }
  }

  if (imageFiles.length) {
    e.preventDefault()
    e.stopPropagation()
    processFiles(imageFiles)
  }
  // 无图片时不拦截，正常文本粘贴继续
}

// 全局捕获阶段监听 — 支持右键粘贴、任意位置 Ctrl+V
onMounted(() => document.addEventListener('paste', handlePaste, true))
onUnmounted(() => document.removeEventListener('paste', handlePaste, true))

function handleDrop(e: DragEvent) {
  const dt = e.dataTransfer
  if (!dt?.files?.length) return
  processFiles(Array.from(dt.files))
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

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
    images: images.value,
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
    showNotification('success', TYPE_LABELS[infoType.value] + '发布成功')
    setTimeout(() => router.push(TYPE_REDIRECT[infoType.value]), 600)
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
        <!-- 内联通知条 -->
        <Transition name="notify">
          <div v-if="notify.show" :class="['notify-bar', 'notify-' + notify.type]">
            <span class="notify-icon">{{ notify.type === 'success' ? '✓' : notify.type === 'error' ? '✕' : 'ℹ' }}</span>
            {{ notify.message }}
          </div>
        </Transition>

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
          <div
            contenteditable="true"
            class="img-upload-area"
            @input="($event.target as HTMLElement).textContent = ''"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleDrop"
          >
            <!-- 已上传的图片预览 -->
            <div
              v-for="(url, idx) in images"
              :key="'img-' + idx"
              class="img-item"
            >
              <img :src="url" alt="" class="preview-thumb" />
              <button type="button" class="img-remove" @click="removeImage(idx)" title="移除">
                &times;
              </button>
            </div>

            <!-- 上传按钮 / 加载状态 -->
            <label class="img-add-btn" :class="{ disabled: uploading }">
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                @change="handleFileSelect"
                :disabled="uploading"
              />
              <span v-if="uploading" class="upload-spinner"></span>
              <span>{{ uploading ? '上传中…' : '+ 添加图片' }}</span>
            </label>
          </div>
          <p class="img-hint">
            支持 JPG / PNG / GIF / WebP，单张 ≤ 5MB，最多 9 张。
            可点击选择、拖拽文件、或 <kbd>Ctrl+V</kbd> 粘贴截图。
          </p>
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

/* ---------- 图片上传区域 ---------- */
.img-upload-area {
  display: flex; flex-wrap: wrap; gap: 10px;
  min-height: 88px; padding: 12px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: var(--bg);
  transition: border-color var(--transition);
  align-items: flex-start;
  align-content: flex-start;
  caret-color: transparent;  /* 隐藏 contenteditable 文本光标 */
  outline: none;              /* 隐藏聚焦轮廓 */
}
.img-upload-area:hover { border-color: var(--primary); }

.img-item {
  position: relative;
  width: 80px; height: 60px;
  border-radius: 6px; overflow: hidden;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}
.preview-thumb {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.img-remove {
  position: absolute; top: 2px; right: 2px;
  width: 20px; height: 20px; padding: 0;
  border-radius: 50%; border: none;
  background: rgba(0,0,0,.55); color: #fff;
  font-size: 14px; line-height: 20px;
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s;
}
.img-item:hover .img-remove { opacity: 1; }

.img-add-btn {
  width: 80px; height: 60px;
  border-radius: 6px;
  border: 1px dashed #bbb;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: var(--text-light);
  cursor: pointer; flex-shrink: 0;
  transition: all var(--transition);
  user-select: none;
  gap: 4px;
}
.img-add-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(91,155,213,.06); }
.img-add-btn.disabled { pointer-events: none; opacity: .6; }

.upload-spinner {
  width: 14px; height: 14px;
  border: 2px solid #d1d5db;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.img-hint {
  margin: 6px 0 0;
  font-size: 12px; color: var(--text-light);
}
.img-hint kbd {
  padding: 1px 5px; font-size: 11px;
  border: 1px solid #ccc; border-radius: 3px;
  background: #f5f5f5;
}

/* ---------- 内联通知条 ---------- */
.notify-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; margin-bottom: 16px;
  border-radius: 8px; font-size: 14px;
  font-weight: 500;
}
.notify-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.notify-error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.notify-info    { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.notify-icon { font-weight: 700; font-size: 16px; }

/* 进出动画 */
.notify-enter-active { transition: all .3s ease-out; }
.notify-leave-active { transition: all .25s ease-in; }
.notify-enter-from,
.notify-leave-to   { opacity: 0; transform: translateY(-8px); }

.login-required { text-align: center; padding: 60px 0; }
.login-required p { margin: 0 0 16px; font-size: 15px; color: var(--text-light); }
.to-login {
  display: inline-block; padding: 10px 32px; background: var(--primary); color: #fff;
  text-decoration: none; border-radius: var(--radius-full); font-size: 14px; font-weight: 500;
  transition: all var(--transition);
}
.to-login:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); }
</style>

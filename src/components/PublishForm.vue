<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { TYPE_LABELS, CAMPUS_LIST, CONDITION_OPTIONS, type ItemType, type LostOrFound } from '@/data/listings'
import { now } from '@/utils/date'

const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()

const typeFields: ItemType[] = ['secondhand', 'lostfound', 'group', 'errand']
const infoType = ref<ItemType>('secondhand')
const title = ref('')
const description = ref('')
const campus = ref(userStore.campus || CAMPUS_LIST[0]!)
const location = ref('')
const tags = ref('')

const price = ref(''); const condition = ref(''); const allowBargain = ref(true); const stock = ref(1)
const lostOrFound = ref<LostOrFound>('lost'); const eventTime = ref(''); const itemFeature = ref('')
const targetCount = ref(2); const deadline = ref('')
const reward = ref(''); const taskPlace = ref(''); const expectedTime = ref('')

const submitted = ref(false)
const errors = ref<string[]>([])

async function handleSubmit() {
  errors.value = []
  if (!title.value.trim()) { errors.value.push('请输入标题'); return }
  if (!description.value.trim()) { errors.value.push('请输入描述'); return }

  const nowStr = now()
  const base: Record<string, unknown> = {
    type: infoType.value, title: title.value.trim(), description: description.value.trim(),
    campus: campus.value, location: location.value,
    tags: tags.value ? tags.value.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    images: [], publisherId: userStore.currentUserId!,
    status: '进行中', viewCount: 0, favoriteCount: 0, createdAt: nowStr, updatedAt: nowStr,
  }

  if (infoType.value === 'secondhand') {
    base.price = Number(price.value) || 0; base.condition = condition.value || undefined; base.allowBargain = allowBargain.value; base.stock = stock.value || 1
  } else if (infoType.value === 'lostfound') {
    base.lostOrFound = lostOrFound.value; base.eventTime = eventTime.value || undefined; base.itemFeature = itemFeature.value || undefined
  } else if (infoType.value === 'group') {
    base.targetCount = targetCount.value; base.currentCount = 1; base.deadline = deadline.value || undefined
  } else if (infoType.value === 'errand') {
    base.reward = Number(reward.value) || 0; base.taskPlace = taskPlace.value; base.expectedTime = expectedTime.value
  }

  try {
    const item = await itemStore.createItem(base as any)
    submitted.value = true
    setTimeout(() => router.push('/detail/' + item.id), 800)
  } catch {
    errors.value.push('发布失败，请检查网络连接')
  }
}
</script>

<template>
  <section class="publish">
    <h2 class="page-title">发布信息</h2>

    <div class="fg"><label>类型</label>
      <div class="type-row">
        <button v-for="t in typeFields" :key="t" :class="['type-btn', { on: infoType === t }]" @click="infoType = t">{{ TYPE_LABELS[t] }}</button>
      </div>
    </div>

    <div class="fg"><label>标题</label><input v-model="title" placeholder="请输入标题" class="in" /></div>
    <div class="fg"><label>描述</label><textarea v-model="description" placeholder="详细描述..." class="in ta" rows="3"></textarea></div>
    <div class="fg-row">
      <div class="fg fg-half"><label>校区</label><select v-model="campus" class="in"><option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option></select></div>
      <div class="fg fg-half"><label>地点</label><input v-model="location" placeholder="具体地点" class="in" /></div>
    </div>
    <div class="fg"><label>标签 (逗号分隔)</label><input v-model="tags" placeholder="教材, 前端" class="in" /></div>

    <template v-if="infoType === 'secondhand'">
      <div class="fg-row">
        <div class="fg fg-half"><label>价格 (元)</label><input v-model="price" placeholder="35" type="number" class="in" /></div>
        <div class="fg fg-half"><label>库存</label><input v-model.number="stock" type="number" min="1" class="in" /></div>
      </div>
      <div class="fg-row">
        <div class="fg fg-half"><label>成色</label><select v-model="condition" class="in"><option value="">请选择</option><option v-for="o in CONDITION_OPTIONS" :key="o" :value="o">{{ o }}</option></select></div>
        <div class="fg fg-half"><label class="cb-label"><input type="checkbox" v-model="allowBargain" /> 支持砍价</label></div>
      </div>
    </template>

    <template v-if="infoType === 'lostfound'">
      <div class="fg"><label>类型</label><select v-model="lostOrFound" class="in"><option value="lost">丢失物品</option><option value="found">拾获物品</option></select></div>
      <div class="fg"><label>发生时间</label><input v-model="eventTime" type="date" class="in" /></div>
      <div class="fg"><label>物品特征</label><input v-model="itemFeature" placeholder="颜色、大小、特殊标记..." class="in" /></div>
    </template>

    <template v-if="infoType === 'group'">
      <div class="fg"><label>目标人数</label><input v-model.number="targetCount" type="number" min="2" class="in" /></div>
      <div class="fg"><label>截止时间</label><input v-model="deadline" type="date" class="in" /></div>
    </template>

    <template v-if="infoType === 'errand'">
      <div class="fg"><label>酬劳 (元)</label><input v-model="reward" placeholder="5" type="number" class="in" /></div>
      <div class="fg"><label>任务地点</label><input v-model="taskPlace" placeholder="具体地点" class="in" /></div>
      <div class="fg"><label>期望完成时间</label><input v-model="expectedTime" placeholder="今晚20:00前" class="in" /></div>
    </template>

    <div v-if="errors.length" class="err-box"><span v-for="e in errors" :key="e">{{ e }}</span></div>

    <button class="submit-btn" @click="handleSubmit">发布</button>
    <p v-if="submitted" class="toast">发布成功，正在跳转...</p>
  </section>
</template>

<style scoped>
.publish { max-width: 560px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0 0 18px; color: var(--text); }
.fg { margin-bottom: 14px; }
.fg label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: var(--text); }
.fg-row { display: flex; gap: 12px; }
.fg-half { flex: 1; }
.in { width: 100%; padding: 10px 14px; border: none; border-radius: var(--radius-md); background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 14px; outline: none; color: var(--text); transition: all var(--transition); }
.in:focus { box-shadow: 0 0 0 2px var(--primary-light); }
.ta { resize: vertical; }
.cb-label { display: flex !important; align-items: center; gap: 6px; cursor: pointer; padding-top: 22px; }
.type-row { display: flex; gap: 8px; flex-wrap: wrap; }
.type-btn { padding: 8px 18px; border: none; background: var(--bg); border-radius: var(--radius-full); font-size: 13px; cursor: pointer; color: var(--text-light); transition: all var(--transition); }
.type-btn.on { background: var(--primary); color: #fff; box-shadow: 0 2px 8px rgba(91,155,213,0.3); }
.submit-btn { margin-top: 8px; padding: 12px 48px; font-size: 15px; font-weight: 600; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-full); cursor: pointer; transition: all var(--transition); }
.submit-btn:hover { box-shadow: 0 4px 16px rgba(91,155,213,0.35); transform: translateY(-1px); }
.err-box { background: var(--danger-light); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; }
.err-box span { display: block; font-size: 13px; color: var(--danger); }
.toast { margin-top: 12px; font-size: 14px; font-weight: 600; color: var(--success); }
</style>

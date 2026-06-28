<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, CAMPUS_LIST, type ListingType, type LostSubType } from '@/data/listings'

const router = useRouter()
const profile = useProfileStore()
const listStore = useListingsStore()

const infoType = ref<ListingType>('trade')
const title = ref('')
const desc = ref('')
const campus = ref(profile.profile.campus)
const location = ref('')
const tags = ref('')

const price = ref('')
const stock = ref(1)
const condition = ref('')

const lostType = ref<LostSubType>('lost')
const lostTime = ref('')

const targetCount = ref(2)
const unitPrice = ref('')
const deadline = ref('')

const reward = ref('')
const taskLocation = ref('')
const expectTime = ref('')

const submitted = ref(false)

const typeFields: ListingType[] = ['trade', 'lost', 'pintuan', 'paotui']

function handleSubmit() {
  if (!title.value.trim() || !desc.value.trim()) return

  const base = {
    type: infoType.value,
    title: title.value.trim(),
    poster: profile.profile.nickname,
    desc: desc.value.trim(),
    campus: campus.value,
    location: location.value,
    tags: tags.value ? tags.value.split(',').map(t => t.trim()).filter(Boolean) : [],
  }

  const extra: Record<string, unknown> = {}
  if (infoType.value === 'trade') {
    extra.price = price.value ? '¥' + price.value : undefined
    extra.stock = stock.value
    extra.condition = condition.value || undefined
  } else if (infoType.value === 'lost') {
    extra.lostType = lostType.value
    extra.lostTime = lostTime.value || undefined
  } else if (infoType.value === 'pintuan') {
    extra.targetCount = targetCount.value
    extra.currentCount = 1
    extra.unitPrice = unitPrice.value ? '¥' + unitPrice.value : undefined
    extra.deadline = deadline.value || undefined
  } else if (infoType.value === 'paotui') {
    extra.reward = reward.value ? '¥' + reward.value : undefined
    extra.taskLocation = taskLocation.value
    extra.expectTime = expectTime.value
  }

  const item = listStore.add({ ...base, ...extra } as any)
  submitted.value = true
  setTimeout(() => router.push('/detail/' + item.id), 1000)
}
</script>

<template>
  <section class="publish">
    <h2>发布信息</h2>

    <div class="form-group">
      <label>信息类型</label>
      <div class="type-tabs">
        <button v-for="t in typeFields" :key="t" :class="['type-tab', { active: infoType === t }]" @click="infoType = t">{{ TYPE_LABELS[t] }}</button>
      </div>
    </div>

    <div class="form-group"><label>标题</label><input v-model="title" placeholder="请输入标题" class="input" /></div>
    <div class="form-group"><label>描述</label><textarea v-model="desc" placeholder="请输入详细描述..." class="input textarea" rows="4"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label>校区</label><select v-model="campus" class="input"><option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option></select></div>
      <div class="form-group"><label>地点</label><input v-model="location" placeholder="具体地点" class="input" /></div>
    </div>
    <div class="form-group"><label>标签 (逗号分隔)</label><input v-model="tags" placeholder="教材, 前端" class="input" /></div>

    <template v-if="infoType === 'trade'">
      <div class="form-row">
        <div class="form-group"><label>价格</label><input v-model="price" placeholder="35" class="input" /></div>
        <div class="form-group"><label>库存</label><input v-model.number="stock" type="number" min="1" class="input" /></div>
      </div>
      <div class="form-group"><label>成色</label><select v-model="condition" class="input"><option value="">请选择</option><option>全新</option><option>九成新</option><option>八成新</option><option>六成新</option></select></div>
    </template>

    <template v-if="infoType === 'lost'">
      <div class="form-group"><label>类型</label><select v-model="lostType" class="input"><option value="lost">丢失物品</option><option value="found">拾获物品</option></select></div>
      <div class="form-group"><label>{{ lostType === 'lost' ? '丢失时间' : '拾获时间' }}</label><input v-model="lostTime" type="date" class="input" /></div>
    </template>

    <template v-if="infoType === 'pintuan'">
      <div class="form-row">
        <div class="form-group"><label>目标人数</label><input v-model.number="targetCount" type="number" min="2" class="input" /></div>
        <div class="form-group"><label>人均费用</label><input v-model="unitPrice" placeholder="15" class="input" /></div>
      </div>
      <div class="form-group"><label>截止时间</label><input v-model="deadline" type="date" class="input" /></div>
    </template>

    <template v-if="infoType === 'paotui'">
      <div class="form-group"><label>酬劳</label><input v-model="reward" placeholder="5" class="input" /></div>
      <div class="form-group"><label>任务地点</label><input v-model="taskLocation" placeholder="具体地点" class="input" /></div>
      <div class="form-group"><label>期望完成时间</label><input v-model="expectTime" placeholder="今晚20:00前" class="input" /></div>
    </template>

    <button class="submit-btn" @click="handleSubmit">发布</button>
    <p v-if="submitted" class="toast">[发布成功] 正在跳转到详情页...</p>
  </section>
</template>

<style scoped>
.publish { max-width: 560px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #333; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.textarea { resize: vertical; }
.type-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.type-tab { padding: 8px 16px; border: 1px solid #ccc; background: #fff; border-radius: 20px; cursor: pointer; font-size: 14px; }
.type-tab:hover { border-color: #409eff; color: #409eff; }
.type-tab.active { background: #409eff; color: #fff; border-color: #409eff; }
.submit-btn { margin-top: 16px; padding: 12px 48px; font-size: 16px; background: #409eff; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.submit-btn:hover { background: #337ecc; }
.toast { margin-top: 12px; color: #67c23a; font-weight: bold; }
</style>

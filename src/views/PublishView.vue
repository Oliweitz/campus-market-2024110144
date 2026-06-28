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

const price = ref(''); const stock = ref(1); const condition = ref('')
const lostType = ref<LostSubType>('lost'); const lostTime = ref('')
const targetCount = ref(2); const unitPrice = ref(''); const deadline = ref('')
const reward = ref(''); const taskLocation = ref(''); const expectTime = ref('')

const submitted = ref(false)
const errors = ref<string[]>([])
const typeFields: ListingType[] = ['trade', 'lost', 'pintuan', 'paotui']

function handleSubmit() {
  errors.value = []
  if (!title.value.trim()) errors.value.push('请输入标题')
  if (!desc.value.trim()) errors.value.push('请输入描述')
  if (errors.value.length > 0) return

  const base = {
    type: infoType.value, title: title.value.trim(), poster: profile.profile.nickname,
    desc: desc.value.trim(), campus: campus.value, location: location.value,
    tags: tags.value ? tags.value.split(',').map(t => t.trim()).filter(Boolean) : [],
  }
  const extra: Record<string, unknown> = {}
  if (infoType.value === 'trade') { extra.price = price.value ? '¥' + price.value : undefined; extra.stock = stock.value; extra.condition = condition.value || undefined }
  else if (infoType.value === 'lost') { extra.lostType = lostType.value; extra.lostTime = lostTime.value || undefined }
  else if (infoType.value === 'pintuan') { extra.targetCount = targetCount.value; extra.currentCount = 1; extra.unitPrice = unitPrice.value ? '¥' + unitPrice.value : undefined; extra.deadline = deadline.value || undefined }
  else if (infoType.value === 'paotui') { extra.reward = reward.value ? '¥' + reward.value : undefined; extra.taskLocation = taskLocation.value; extra.expectTime = expectTime.value }

  const item = listStore.add({ ...base, ...extra } as any)
  submitted.value = true
  setTimeout(() => router.push('/detail/' + item.id), 800)
}
</script>

<template>
  <section class="publish">
    <h2 class="page-title">发布信息</h2>

    <!-- type -->
    <div class="fg">
      <label>类型</label>
      <div class="type-row">
        <button v-for="t in typeFields" :key="t" :class="['type-btn', { on: infoType === t }]" @click="infoType = t">{{ TYPE_LABELS[t] }}</button>
      </div>
    </div>

    <!-- base fields -->
    <div class="fg"><label>标题</label><input v-model="title" placeholder="请输入标题" class="in" /></div>
    <div class="fg"><label>描述</label><textarea v-model="desc" placeholder="详细描述..." class="in ta" rows="3"></textarea></div>
    <div class="fg-row">
      <div class="fg fg-half"><label>校区</label><select v-model="campus" class="in"><option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option></select></div>
      <div class="fg fg-half"><label>地点</label><input v-model="location" placeholder="具体地点" class="in" /></div>
    </div>
    <div class="fg"><label>标签 (逗号分隔)</label><input v-model="tags" placeholder="教材, 前端" class="in" /></div>

    <!-- trade -->
    <template v-if="infoType === 'trade'">
      <div class="fg-row">
        <div class="fg fg-half"><label>价格</label><input v-model="price" placeholder="35" class="in" /></div>
        <div class="fg fg-half"><label>库存</label><input v-model.number="stock" type="number" min="1" class="in" /></div>
      </div>
      <div class="fg"><label>成色</label><select v-model="condition" class="in"><option value="">请选择</option><option>全新</option><option>九成新</option><option>八成新</option><option>六成新</option></select></div>
    </template>

    <!-- lost -->
    <template v-if="infoType === 'lost'">
      <div class="fg"><label>{{ lostType === 'lost' ? '丢失' : '拾获' }}类型</label><select v-model="lostType" class="in"><option value="lost">丢失物品</option><option value="found">拾获物品</option></select></div>
      <div class="fg"><label>{{ lostType === 'lost' ? '丢失' : '拾获' }}时间</label><input v-model="lostTime" type="date" class="in" /></div>
    </template>

    <!-- pintuan -->
    <template v-if="infoType === 'pintuan'">
      <div class="fg-row">
        <div class="fg fg-half"><label>目标人数</label><input v-model.number="targetCount" type="number" min="2" class="in" /></div>
        <div class="fg fg-half"><label>人均费用</label><input v-model="unitPrice" placeholder="15" class="in" /></div>
      </div>
      <div class="fg"><label>截止时间</label><input v-model="deadline" type="date" class="in" /></div>
    </template>

    <!-- paotui -->
    <template v-if="infoType === 'paotui'">
      <div class="fg"><label>酬劳</label><input v-model="reward" placeholder="5" class="in" /></div>
      <div class="fg"><label>任务地点</label><input v-model="taskLocation" placeholder="具体地点" class="in" /></div>
      <div class="fg"><label>期望完成时间</label><input v-model="expectTime" placeholder="今晚20:00前" class="in" /></div>
    </template>

    <!-- errors -->
    <div v-if="errors.length > 0" class="err-box">
      <span v-for="e in errors" :key="e">{{ e }}</span>
    </div>

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
.in {
  width: 100%; padding: 10px 14px; border: none; border-radius: var(--radius-md);
  background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 14px;
  outline: none; color: var(--text); transition: all var(--transition);
}
.in:focus { box-shadow: 0 0 0 2px var(--primary-light); }
.ta { resize: vertical; }
.type-row { display: flex; gap: 8px; flex-wrap: wrap; }
.type-btn {
  padding: 8px 18px; border: none; background: var(--bg); border-radius: var(--radius-full);
  font-size: 13px; cursor: pointer; color: var(--text-light); transition: all var(--transition);
}
.type-btn.on { background: var(--primary); color: #fff; box-shadow: 0 2px 8px rgba(91,155,213,0.3); }
.submit-btn {
  margin-top: 8px; padding: 12px 48px; font-size: 15px; font-weight: 600;
  background: var(--primary); color: #fff; border: none; border-radius: var(--radius-full);
  cursor: pointer; transition: all var(--transition);
}
.submit-btn:hover { box-shadow: 0 4px 16px rgba(91,155,213,0.35); transform: translateY(-1px); }
.err-box { background: var(--danger-light); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; }
.err-box span { display: block; font-size: 13px; color: var(--danger); }
.toast { margin-top: 12px; font-size: 14px; font-weight: 600; color: var(--success); }
</style>

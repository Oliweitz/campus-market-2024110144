<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMyListStore } from '@/stores/mylist'
import { useMessageStore } from '@/stores/messageStore'
import { useCartStore } from '@/stores/cart'
import { TYPE_LABELS, STATUS_LABELS, LOST_FOUND_LABELS } from '@/data/listings'
import { userApi } from '@/api/userApi'
import FavoriteButton from '@/components/FavoriteButton.vue'
import BargainPanel from '@/components/BargainPanel.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()
const favStore = useFavoriteStore()
const mylist = useMyListStore()
const msgStore = useMessageStore()
const cartStore = useCartStore()

const productId = computed(() => route.params.id as string)
const product = computed(() => itemStore.getById(productId.value))
const isOwner = computed(() => product.value?.publisherId == userStore.currentUserId)
const isJoined = computed(() => product.value ? mylist.items.some((i) => i.listingId == product.value!.id) : false)

const related = computed(() => itemStore.items.filter((l) => l.type === product.value?.type && l.id != product.value?.id).slice(0, 4))

const bargainShow = ref(false)
const reported = ref(false)

const publisherName = ref('')

async function loadPublisherName(pid: string | number) {
  if (userStore.profile?.id == pid) {
    publisherName.value = userStore.nickname || '我'
    return
  }
  try {
    const res = await userApi.getUserById(pid as number)
    publisherName.value = res.data?.nickname || `用户${pid}`
  } catch {
    publisherName.value = `用户${pid}`
  }
}

function handleAddToCart() {
  if (!product.value || product.value.price == null) return
  const stock = product.value.stock ?? 1
  cartStore.addToCart({ id: product.value.id, title: product.value.title, price: product.value.price, stock })
}

async function handleBargain(price: string) {
  if (!product.value) return
  await msgStore.sendMessage(product.value.publisherId as number, '出价 ¥' + price, publisherName.value)
  router.push('/message')
}

function goMessage() {
  if (!product.value) return
  if (isOwner.value) {
    router.push('/profile')
  } else {
    router.push('/message?uid=' + product.value.publisherId)
  }
}

async function handleJoinGroup() {
  if (!product.value) return
  await mylist.joinGroup({ id: product.value.id as number, title: product.value.title, publisherId: product.value.publisherId as number })
}

async function handleTakeErrand() {
  if (!product.value) return
  await mylist.takeErrand({ id: product.value.id as number, title: product.value.title, publisherId: product.value.publisherId as number })
}

onMounted(async () => {
  if (!product.value) await itemStore.fetchById(productId.value)
  if (product.value) {
    itemStore.incrementView(product.value.id as number)
    loadPublisherName(product.value.publisherId)
  }
})
</script>

<template>
  <section>
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">&larr;</button>
      <div class="breadcrumb"><router-link to="/">首页</router-link><span>/</span><router-link to="/list">列表</router-link><span>/</span><span v-if="product">{{ TYPE_LABELS[product.type] }}</span><span v-else>详情</span></div>
    </div>

    <template v-if="product">
      <div class="hero">
        <div>
          <h2>{{ product.title }}</h2>
          <div class="tags">
            <span class="tag type-tag">{{ TYPE_LABELS[product.type] }}</span>
            <span class="tag" :class="'s-' + (product.status === '进行中' ? 'active' : product.status === '已完成' ? 'completed' : 'closed')">{{ STATUS_LABELS[product.status] }}</span>
            <span v-for="t in product.tags" :key="t" class="tag tag-info">{{ t }}</span>
          </div>
        </div>
        <FavoriteButton :item-id="product.id" />
        <button class="report-btn" @click="reported = true" v-if="!reported">举报</button>
        <span v-else class="reported-tip">已提交</span>
      </div>

      <div v-if="product.images?.length" class="image-strip">
        <img v-for="(img, idx) in product.images" :key="idx" :src="img" class="detail-img" alt="" />
      </div>
      <div class="meta-line"><span>{{ product.campus }} &middot; {{ product.location }}</span><span>👁 {{ product.viewCount }} &middot; {{ product.createdAt.slice(0, 10) }}</span></div>
      <p class="poster">
        <template v-if="isOwner">由你发布</template>
        <template v-else>发布者 <a class="link" @click.prevent="goMessage">{{ publisherName }}</a></template>
      </p>
      <p class="desc">{{ product.description }}</p>

      <template v-if="product.type === 'secondhand'">
        <div class="highlight">¥{{ product.price }} <span class="hl-sub">&middot; {{ product.condition }}</span></div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === '进行中'" class="btn btn-danger" @click="itemStore.updateStatus(product.id, '已关闭')">撤回</button>
            <button v-if="product.status === '已关闭'" class="btn btn-outline" @click="itemStore.updateStatus(product.id, '进行中')">重新发布</button>
          </template>
          <template v-else-if="product.status === '进行中'">
            <a class="btn btn-ghost" @click.prevent="goMessage">联系卖家</a>
            <a v-if="product.allowBargain" class="btn btn-ghost-warn" @click="bargainShow = !bargainShow">砍价</a>
            <button class="btn btn-primary" :disabled="(product.stock ?? 1) === 0" @click="handleAddToCart">{{ (product.stock ?? 1) > 0 ? '加入购物车' : '已售罄' }}</button>
          </template>
        </div>
        <BargainPanel v-if="product.status === '进行中'" v-model="bargainShow" @submit="handleBargain" />
      </template>

      <template v-if="product.type === 'lostfound'">
        <div class="aux">{{ product.lostOrFound ? LOST_FOUND_LABELS[product.lostOrFound] : '' }}<span v-if="product.eventTime"> &middot; {{ product.eventTime }}</span></div>
        <div v-if="product.itemFeature" class="aux">特征: {{ product.itemFeature }}</div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === '进行中'" class="btn btn-success" @click="itemStore.updateStatus(product.id, '已完成')">已找到</button>
            <button v-if="product.status === '进行中'" class="btn btn-danger" @click="itemStore.updateStatus(product.id, '已关闭')">撤回</button>
            <button v-if="product.status === '已关闭'" class="btn btn-outline" @click="itemStore.updateStatus(product.id, '进行中')">重新发布</button>
          </template>
          <template v-else><a class="btn btn-ghost" @click.prevent="goMessage">联系</a></template>
        </div>
      </template>

      <template v-if="product.type === 'group'">
        <div class="highlight">{{ product.currentCount }} / {{ product.targetCount }} <span class="hl-sub">人</span></div>
        <div v-if="product.deadline" class="aux">截止 {{ product.deadline }}</div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === '进行中'" class="btn btn-danger" @click="itemStore.updateStatus(product.id, '已关闭')">撤回</button>
            <button v-if="product.status === '已关闭'" class="btn btn-outline" @click="itemStore.updateStatus(product.id, '进行中')">重新发布</button>
          </template>
          <template v-else-if="product.status === '进行中'">
            <button v-if="!isJoined" class="btn btn-success" @click="handleJoinGroup">参与拼单</button>
            <span v-else class="joined">已参与</span>
          </template>
        </div>
      </template>

      <template v-if="product.type === 'errand'">
        <div class="highlight">¥{{ product.reward }}</div>
        <div class="aux">{{ product.taskPlace }} &middot; {{ product.expectedTime }}</div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === '进行中'" class="btn btn-danger" @click="itemStore.updateStatus(product.id, '已关闭')">撤回</button>
            <button v-if="product.status === '已关闭'" class="btn btn-outline" @click="itemStore.updateStatus(product.id, '进行中')">重新发布</button>
          </template>
          <template v-else-if="product.status === '进行中'">
            <button v-if="!isJoined" class="btn btn-success" @click="handleTakeErrand">接单</button>
            <span v-else class="joined">已接单</span>
          </template>
        </div>
      </template>
    </template>

    <div v-if="product && related.length" class="related"><h3>相关推荐</h3>
      <div class="related-grid">
        <router-link v-for="r in related" :key="r.id" :to="'/detail/' + r.id" class="related-card">
          <div class="rel-img" :class="'img-' + r.type"></div>
          <div class="rel-text"><strong>{{ r.title }}</strong><span v-if="r.price">¥{{ r.price }}</span><span v-if="r.reward">¥{{ r.reward }}</span></div>
        </router-link>
      </div>
    </div>

    <template v-if="!product && !itemStore.loading"><div class="empty-state"><p>信息不存在</p></div></template>
  </section>
</template>

<style scoped>
.top-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: var(--font-sm); color: var(--text-lighter); }
.breadcrumb a { text-decoration: none; color: var(--text-light); } .breadcrumb a:hover { color: var(--primary); }
.report-btn { background: none; border: none; font-size: 12px; color: var(--text-lighter); cursor: pointer; padding: 4px 8px; transition: color var(--transition); } .report-btn:hover { color: var(--danger); }
.reported-tip { font-size: 12px; color: var(--text-lighter); }
.back-btn { background: var(--card-bg); border: none; border-radius: 50%; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: var(--text-light); box-shadow: var(--shadow-sm); margin-bottom: 16px; transition: all var(--transition); }
.back-btn:hover { box-shadow: var(--shadow-md); color: var(--text); }
.hero { display: flex; align-items: flex-start; gap: 12px; } .hero h2 { margin: 0; font-size: 20px; font-weight: 600; }
.tags { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.tag { font-size: 11px; padding: 3px 8px; border-radius: 4px; } .type-tag { background: var(--primary-light); color: var(--primary); } .tag-info { background: #f0f0f0; color: var(--text-light); }
.s-active { background: var(--success-light); color: var(--success); } .s-completed { background: #f0f0f0; color: #bbb; } .s-closed { background: var(--danger-light); color: var(--danger); }
.meta-line { display: flex; gap: 12px; margin-top: 12px; font-size: 13px; color: var(--text-light); }
.poster { font-size: 14px; margin-top: 6px; color: var(--text-light); } .link { color: var(--primary); cursor: pointer; font-weight: 500; } .link:hover { text-decoration: underline; }
.image-strip { display: flex; gap: 10px; margin-top: 16px; overflow-x: auto; }
.detail-img { width: 240px; height: 160px; object-fit: cover; border-radius: 10px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
.desc { margin-top: 14px; line-height: 1.8; color: var(--text); font-size: 14px; }
.highlight { font-size: 22px; font-weight: 700; color: var(--danger); margin-top: 16px; } .hl-sub { font-size: 14px; font-weight: 400; color: var(--text-light); }
.aux { margin-top: 6px; font-size: 14px; color: var(--text-light); }
.actions { display: flex; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.btn { padding: 10px 24px; font-size: 14px; font-weight: 500; border: none; border-radius: var(--radius-full); cursor: pointer; text-decoration: none; display: inline-block; transition: all var(--transition); }
.btn-primary { background: var(--primary); color: #fff; } .btn-primary:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); transform: translateY(-1px); }
.btn-success { background: var(--success); color: #fff; } .btn-success:hover { box-shadow: 0 4px 12px rgba(109,189,122,0.35); transform: translateY(-1px); }
.btn-danger { background: var(--danger); color: #fff; } .btn-danger:hover { box-shadow: 0 4px 12px rgba(232,140,140,0.35); transform: translateY(-1px); }
.btn-ghost { border: 1.5px solid var(--primary); color: var(--primary); background: transparent; } .btn-ghost:hover { background: var(--primary-light); }
.btn-ghost-warn { border: 1.5px solid var(--warn); color: var(--warn); background: transparent; } .btn-ghost-warn:hover { background: var(--warn-light); }
.btn-outline { border: 1.5px solid var(--primary); color: var(--primary); background: transparent; } .btn-outline:hover { background: var(--primary-light); }
.joined { font-size: 14px; font-weight: 600; color: var(--success); }
.empty-state { text-align: center; padding: 60px 0; color: var(--text-light); }
.related { margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee; } .related h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.related-card { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-decoration: none; color: var(--text); transition: all var(--transition); }
.related-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.rel-img { width: 40px; height: 40px; border-radius: var(--radius-sm); flex-shrink: 0; }
.img-secondhand { background: linear-gradient(135deg, #c8e6c9, #a5d6a7); } .img-lostfound { background: linear-gradient(135deg, #bbdefb, #90caf9); }
.img-group { background: linear-gradient(135deg, #e1bee7, #ce93d8); } .img-errand { background: linear-gradient(135deg, #ffccbc, #ffab91); }
.rel-text { flex: 1; min-width: 0; } .rel-text strong { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .rel-text span { font-size: 13px; font-weight: 600; color: var(--danger); }
</style>

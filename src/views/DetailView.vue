<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProfileStore } from '@/stores/profile'
import { useFavoritesStore } from '@/stores/favorites'
import { useMyListStore } from '@/stores/mylist'
import { useChatStore } from '@/stores/chat'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, STATUS_LABELS } from '@/data/listings'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const profile = useProfileStore()
const fav = useFavoritesStore()
const mylist = useMyListStore()
const chat = useChatStore()
const listStore = useListingsStore()

const productId = computed(() => Number(route.params.id))
const product = computed(() => listStore.getById(productId.value))
const isOwner = computed(() => product.value?.poster === profile.profile.nickname)
const cartItem = computed(() => cart.items.find(i => i.id === product.value?.id))
const canAdd = computed(() => {
  if (!product.value || product.value.type !== 'trade' || !product.value.stock) return false
  if (!cartItem.value) return true
  return cartItem.value.quantity < product.value.stock!
})
const isJoined = computed(() => {
  if (!product.value) return false
  return mylist.items.some(i => i.listingId === product.value!.id)
})
const isFav = computed(() => product.value ? fav.isFavorited(product.value.id) : false)

const bargainOffer = ref('')
const bargainShow = ref(false)

function handleAddToCart() {
  if (!product.value || product.value.type !== 'trade') return
  cart.addToCart({ id: product.value.id, title: product.value.title, price: product.value.price ?? '0', stock: product.value.stock ?? 1 })
}

function handleJoinPintuan() {
  if (!product.value) return
  mylist.addPintuan({ id: product.value.id, title: product.value.title, poster: product.value.poster })
}

function handleJoinPaotui() {
  if (!product.value) return
  mylist.addPaotui({ id: product.value.id, title: product.value.title, poster: product.value.poster })
}

function handleBargain() {
  if (!bargainOffer.value.trim() || !product.value) return
  chat.ensureContact(product.value.poster)
  chat.sendMessage(product.value.poster, '我想出价 ' + bargainOffer.value.trim() + '，可以吗？')
  bargainOffer.value = ''
  bargainShow.value = false
  router.push('/message?to=' + product.value.poster)
}

function goMessage() {
  if (!product.value) return
  chat.ensureContact(product.value.poster)
  router.push('/message?to=' + product.value.poster)
}
</script>

<template>
  <section>
    <button class="back-btn" @click="router.back()">&larr; 返回</button>

    <template v-if="product">
      <div class="detail-header">
        <h2>{{ product.title }}</h2>
        <button class="fav-btn" @click="fav.toggle(product.id)">
          {{ isFav ? '★ 已收藏' : '☆ 收藏' }}
        </button>
      </div>

      <div class="tags-row">
        <span class="type-tag">{{ TYPE_LABELS[product.type] }}</span>
        <span class="status-tag" :class="'s-' + product.status">{{ STATUS_LABELS[product.status] }}</span>
        <span v-for="t in product.tags" :key="t" class="info-tag">{{ t }}</span>
      </div>

      <p class="meta-row">
        <span>{{ product.campus }} &middot; {{ product.location }}</span>
        <span class="time">{{ product.publishTime.slice(0, 10) }}</span>
      </p>

      <p class="poster">
        <a class="poster-link" @click.prevent="goMessage">{{ product.poster }}</a>
      </p>

      <p class="desc">{{ product.desc }}</p>

      <!-- 二手交易 -->
      <template v-if="product.type === 'trade'">
        <p class="highlight">{{ product.price }} &middot; {{ product.condition }}</p>
        <p class="stock">库存: {{ product.stock }} 件<span v-if="cartItem"> (已加购 {{ cartItem.quantity }} 件)</span></p>

        <!-- 我是发布者 -->
        <template v-if="isOwner">
          <div class="btn-group">
            <button v-if="product.status === 'active'" class="danger-btn" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="restore-btn" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </div>
        </template>
        <!-- 我不是发布者 -->
        <template v-else>
          <div class="btn-group">
            <button class="add-btn" :disabled="!canAdd" @click="handleAddToCart">{{ canAdd ? '加入购物车' : '已达库存上限' }}</button>
            <a class="contact-btn" @click.prevent="goMessage">联系卖家</a>
            <a class="bargain-btn" @click="bargainShow = !bargainShow">砍价</a>
          </div>
          <div v-if="bargainShow" class="bargain-box">
            <input v-model="bargainOffer" placeholder="输入你的出价..." class="bargain-input" @keyup.enter="handleBargain" />
            <button class="add-btn" @click="handleBargain">出价</button>
          </div>
        </template>
      </template>

      <!-- 失物招领 -->
      <template v-if="product.type === 'lost'">
        <p class="meta">类型: {{ product.lostType === 'lost' ? '丢失物品' : '拾获物品' }}</p>
        <p class="meta">时间: {{ product.lostTime }}</p>

        <template v-if="isOwner">
          <div class="btn-group">
            <button v-if="product.status === 'active'" class="success-btn" @click="listStore.updateStatus(product.id, 'completed')">已找到失主</button>
            <button v-if="product.status === 'active'" class="danger-btn" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="restore-btn" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </div>
        </template>
        <template v-else>
          <a class="contact-btn" @click.prevent="goMessage">联系</a>
        </template>
      </template>

      <!-- 拼单搭子 -->
      <template v-if="product.type === 'pintuan'">
        <p class="meta">参与人数: {{ product.currentCount }} / {{ product.targetCount }} 人</p>
        <p v-if="product.unitPrice" class="highlight">{{ product.unitPrice }} / 人</p>
        <p class="meta">截止: {{ product.deadline }}</p>

        <template v-if="isOwner">
          <div class="btn-group">
            <button v-if="product.status === 'active'" class="danger-btn" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="restore-btn" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </div>
        </template>
        <template v-else>
          <button v-if="!isJoined" class="join-btn" @click="handleJoinPintuan">参与拼单</button>
          <p v-else class="joined-tip">[已参与] 可在「我的」页面查看</p>
        </template>
      </template>

      <!-- 跑腿委托 -->
      <template v-if="product.type === 'paotui'">
        <p class="highlight">{{ product.reward }}</p>
        <p class="meta">任务地点: {{ product.taskLocation }}</p>
        <p class="meta">期望完成: {{ product.expectTime }}</p>

        <template v-if="isOwner">
          <div class="btn-group">
            <button v-if="product.status === 'active'" class="danger-btn" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="restore-btn" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </div>
        </template>
        <template v-else>
          <button v-if="!isJoined" class="join-btn" @click="handleJoinPaotui">接单</button>
          <p v-else class="joined-tip">[已接单] 可在「我的」页面查看</p>
        </template>
      </template>
    </template>

    <template v-else>
      <h2>未找到</h2>
      <p>信息 ID: {{ productId }} 不存在。</p>
    </template>

    <div v-if="cart.totalCount > 0" class="cart-float">
      <router-link to="/profile" class="cart-link">
        购物车: {{ cart.totalCount }} 件 | {{ cart.totalPrice }}
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.back-btn { padding: 6px 16px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; font-size: 14px; margin-bottom: 12px; }
.back-btn:hover { background: #f0f0f0; }
.detail-header { display: flex; align-items: center; gap: 12px; }
.fav-btn { background: none; border: 1px solid #e5e5e5; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 14px; }
.fav-btn:hover { background: #fef0f0; }
.tags-row { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.type-tag { font-size: 12px; color: #409eff; background: #ecf5ff; padding: 2px 8px; border-radius: 4px; }
.status-tag { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.s-active { background: #e8f5e9; color: #4caf50; }
.s-completed { background: #f0f0f0; color: #999; }
.s-closed { background: #fde8e8; color: #e74c3c; }
.info-tag { font-size: 12px; color: #666; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
.meta-row { display: flex; gap: 12px; margin-top: 8px; font-size: 14px; color: #666; }
.time { color: #999; }
.poster { margin-top: 6px; }
.poster-link { color: #409eff; font-weight: bold; cursor: pointer; }
.poster-link:hover { text-decoration: underline; }
.desc { margin-top: 12px; line-height: 1.6; color: #555; }
.highlight { font-size: 24px; color: #e74c3c; font-weight: bold; margin-top: 12px; }
.stock { margin-top: 8px; color: #666; font-size: 14px; }
.meta { margin-top: 8px; color: #666; font-size: 15px; }
.btn-group { display: flex; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.add-btn, .join-btn { padding: 10px 28px; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; color: #fff; }
.add-btn { background: #409eff; } .add-btn:hover { background: #337ecc; }
.add-btn:disabled { background: #ccc; cursor: not-allowed; }
.join-btn { background: #67c23a; } .join-btn:hover { background: #529b2e; }
.danger-btn { padding: 10px 28px; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; color: #fff; background: #e74c3c; }
.danger-btn:hover { background: #c0392b; }
.restore-btn { padding: 10px 28px; font-size: 16px; border: 1px solid #409eff; color: #409eff; background: #fff; border-radius: 6px; cursor: pointer; }
.restore-btn:hover { background: #ecf5ff; }
.success-btn { padding: 10px 28px; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; color: #fff; background: #67c23a; }
.success-btn:hover { background: #529b2e; }
.contact-btn { display: inline-block; padding: 10px 24px; font-size: 16px; border: 1px solid #409eff; color: #409eff; background: #fff; border-radius: 6px; cursor: pointer; text-decoration: none; }
.contact-btn:hover { background: #ecf5ff; }
.bargain-btn { display: inline-block; padding: 10px 24px; font-size: 16px; border: 1px solid #e6a23c; color: #e6a23c; background: #fff; border-radius: 6px; cursor: pointer; text-decoration: none; }
.bargain-btn:hover { background: #fef0d9; }
.bargain-box { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bargain-input { flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
.joined-tip { margin-top: 20px; color: #67c23a; font-weight: bold; }
.cart-float { position: fixed; right: 24px; bottom: 24px; background: #409eff; padding: 12px 20px; border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.cart-link { color: #fff; text-decoration: none; font-size: 15px; font-weight: bold; }
</style>

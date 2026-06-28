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
const isJoined = computed(() => product.value ? mylist.items.some(i => i.listingId === product.value!.id) : false)
const isFav = computed(() => product.value ? fav.isFavorited(product.value.id) : false)

const related = computed(() =>
  listStore.items.filter(l => l.type === product.value?.type && l.id !== product.value?.id).slice(0, 4),
)

const bargainOffer = ref('')
const bargainShow = ref(false)
const reported = ref(false)

function handleAddToCart() {
  if (!product.value || product.value.type !== 'trade') return
  cart.addToCart({ id: product.value.id, title: product.value.title, price: product.value.price ?? '0', stock: product.value.stock ?? 1 })
}
function handleJoinPintuan() { if (product.value) mylist.addPintuan({ id: product.value.id, title: product.value.title, poster: product.value.poster }) }
function handleJoinPaotui() { if (product.value) mylist.addPaotui({ id: product.value.id, title: product.value.title, poster: product.value.poster }) }
function handleBargain() {
  if (!bargainOffer.value.trim() || !product.value) return
  chat.ensureContact(product.value.poster)
  chat.sendMessage(product.value.poster, '出价 ' + bargainOffer.value.trim())
  bargainOffer.value = ''; bargainShow.value = false
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
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">&larr;</button>
      <div class="breadcrumb">
        <router-link to="/">首页</router-link>
        <span>/</span>
        <router-link to="/list">列表</router-link>
        <span>/</span>
        <span v-if="product">{{ TYPE_LABELS[product.type] }}</span>
        <span v-else>详情</span>
      </div>
    </div>

    <template v-if="product">
      <div class="hero">
        <div>
          <h2>{{ product.title }}</h2>
          <div class="tags">
            <span class="tag type-tag">{{ TYPE_LABELS[product.type] }}</span>
            <span class="tag" :class="'s-' + product.status">{{ STATUS_LABELS[product.status] }}</span>
            <span v-for="t in product.tags" :key="t" class="tag tag-info">{{ t }}</span>
          </div>
        </div>
        <button class="fav-icon" @click="fav.toggle(product.id)">{{ isFav ? '&#9733;' : '&#9734;' }}</button>
        <button class="report-btn" @click="reported = true" v-if="!reported">举报</button>
        <span v-else class="reported-tip">已提交</span>
      </div>

      <div class="meta-line">
        <span>{{ product.campus }} &middot; {{ product.location }}</span>
        <span>{{ product.publishTime.slice(0, 10) }}</span>
      </div>

      <p class="poster">
        发布者 <a class="link" @click.prevent="goMessage">{{ product.poster }}</a>
      </p>
      <p class="desc">{{ product.desc }}</p>

      <!-- trade -->
      <template v-if="product.type === 'trade'">
        <div class="highlight">{{ product.price }} <span class="hl-sub">&middot; {{ product.condition }}</span></div>
        <div class="aux">库存 {{ product.stock }} 件<span v-if="cartItem">，已加购 {{ cartItem.quantity }} 件</span></div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === 'active'" class="btn btn-danger" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="btn btn-outline" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </template>
          <template v-else-if="product.status === 'active'">
            <button class="btn btn-primary" :disabled="!canAdd" @click="handleAddToCart">{{ canAdd ? '加入购物车' : '已达上限' }}</button>
            <a class="btn btn-ghost" @click.prevent="goMessage">联系卖家</a>
            <a class="btn btn-ghost-warn" @click="bargainShow = !bargainShow">砍价</a>
          </template>
          <template v-else>
            <a class="btn btn-ghost" @click.prevent="goMessage">联系卖家</a>
          </template>
        </div>
        <div v-if="bargainShow && product.status === 'active'" class="bargain-row">
          <input v-model="bargainOffer" placeholder="输入出价..." class="bargain-in" @keyup.enter="handleBargain" />
          <button class="btn btn-primary" @click="handleBargain">出价</button>
        </div>
      </template>

      <!-- lost -->
      <template v-if="product.type === 'lost'">
        <div class="aux">{{ product.lostType === 'lost' ? '丢失物品' : '拾获物品' }} &middot; {{ product.lostTime }}</div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === 'active'" class="btn btn-success" @click="listStore.updateStatus(product.id, 'completed')">已找到失主</button>
            <button v-if="product.status === 'active'" class="btn btn-danger" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="btn btn-outline" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </template>
          <template v-else>
            <a class="btn btn-ghost" @click.prevent="goMessage">联系</a>
          </template>
        </div>
      </template>

      <!-- pintuan -->
      <template v-if="product.type === 'pintuan'">
        <div class="highlight">{{ product.currentCount }} / {{ product.targetCount }} <span class="hl-sub">人</span></div>
        <div v-if="product.unitPrice" class="aux">{{ product.unitPrice }} / 人 &middot; 截止 {{ product.deadline }}</div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === 'active'" class="btn btn-danger" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="btn btn-outline" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </template>
          <template v-else-if="product.status === 'active'">
            <button v-if="!isJoined" class="btn btn-success" @click="handleJoinPintuan">参与拼单</button>
            <span v-else class="joined">已参与</span>
          </template>
        </div>
      </template>

      <!-- paotui -->
      <template v-if="product.type === 'paotui'">
        <div class="highlight">{{ product.reward }}</div>
        <div class="aux">{{ product.taskLocation }} &middot; {{ product.expectTime }}</div>
        <div class="actions">
          <template v-if="isOwner">
            <button v-if="product.status === 'active'" class="btn btn-danger" @click="listStore.updateStatus(product.id, 'closed')">撤回</button>
            <button v-if="product.status === 'closed'" class="btn btn-outline" @click="listStore.updateStatus(product.id, 'active')">重新发布</button>
          </template>
          <template v-else-if="product.status === 'active'">
            <button v-if="!isJoined" class="btn btn-success" @click="handleJoinPaotui">接单</button>
            <span v-else class="joined">已接单</span>
          </template>
        </div>
      </template>
    </template>

    <!-- 相关推荐 -->
    <div v-if="product && related.length > 0" class="related">
      <h3>相关推荐</h3>
      <div class="related-grid">
        <router-link v-for="r in related" :key="r.id" :to="'/detail/' + r.id" class="related-card">
          <div class="rel-img" :class="'img-' + r.type"></div>
          <div class="rel-text">
            <strong>{{ r.title }}</strong>
            <span v-if="r.price">{{ r.price }}</span>
            <span v-if="r.reward">{{ r.reward }}</span>
          </div>
        </router-link>
      </div>
    </div>

    <template v-else>
      <div class="empty-state"><p>信息不存在</p></div>
    </template>

    <div v-if="cart.totalCount > 0" class="cart-float">
      <router-link to="/profile" class="cart-float-link">
        购物车 {{ cart.totalCount }} 件 &middot; {{ cart.totalPrice }}
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.top-bar {
  display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
}
.breadcrumb {
  display: flex; align-items: center; gap: 6px; font-size: var(--font-sm);
  color: var(--text-lighter);
}
.breadcrumb a { text-decoration: none; color: var(--text-light); }
.breadcrumb a:hover { color: var(--primary); }

.report-btn {
  background: none; border: none; font-size: 12px; color: var(--text-lighter);
  cursor: pointer; padding: 4px 8px; transition: color var(--transition);
}
.report-btn:hover { color: var(--danger); }
.reported-tip { font-size: 12px; color: var(--text-lighter); }

.back-btn {
  background: var(--card-bg); border: none; border-radius: 50%; width: 36px; height: 36px;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  font-size: 18px; color: var(--text-light); box-shadow: var(--shadow-sm); margin-bottom: 16px;
  transition: all var(--transition);
}
.back-btn:hover { box-shadow: var(--shadow-md); color: var(--text); }

.hero { display: flex; align-items: flex-start; gap: 12px; }
.hero h2 { margin: 0; font-size: 20px; font-weight: 600; }
.tags { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.tag { font-size: 11px; padding: 3px 8px; border-radius: 4px; }
.type-tag { background: var(--primary-light); color: var(--primary); }
.tag-info { background: #f0f0f0; color: var(--text-light); }
.s-active { background: var(--success-light); color: var(--success); }
.s-completed { background: #f0f0f0; color: #bbb; }
.s-closed { background: var(--danger-light); color: var(--danger); }

.fav-icon {
  background: none; border: none; font-size: 22px; cursor: pointer; color: var(--warn);
  padding: 4px; transition: transform var(--transition); flex-shrink: 0;
}
.fav-icon:hover { transform: scale(1.2); }

.meta-line { display: flex; gap: 12px; margin-top: 12px; font-size: 13px; color: var(--text-light); }
.poster { font-size: 14px; margin-top: 6px; color: var(--text-light); }
.link { color: var(--primary); cursor: pointer; font-weight: 500; }
.link:hover { text-decoration: underline; }
.desc { margin-top: 14px; line-height: 1.8; color: var(--text); font-size: 14px; }

.highlight { font-size: 22px; font-weight: 700; color: var(--danger); margin-top: 16px; }
.hl-sub { font-size: 14px; font-weight: 400; color: var(--text-light); }
.aux { margin-top: 6px; font-size: 14px; color: var(--text-light); }

.actions { display: flex; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.btn {
  padding: 10px 24px; font-size: 14px; font-weight: 500; border: none; border-radius: var(--radius-full);
  cursor: pointer; text-decoration: none; display: inline-block; transition: all var(--transition);
}
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); transform: translateY(-1px); }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-success { background: var(--success); color: #fff; }
.btn-success:hover { box-shadow: 0 4px 12px rgba(109,189,122,0.35); transform: translateY(-1px); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover { box-shadow: 0 4px 12px rgba(232,140,140,0.35); transform: translateY(-1px); }
.btn-ghost { border: 1.5px solid var(--primary); color: var(--primary); background: transparent; }
.btn-ghost:hover { background: var(--primary-light); }
.btn-ghost-warn { border: 1.5px solid var(--warn); color: var(--warn); background: transparent; }
.btn-ghost-warn:hover { background: var(--warn-light); }
.btn-outline { border: 1.5px solid var(--primary); color: var(--primary); background: transparent; }
.btn-outline:hover { background: var(--primary-light); }

.bargain-row { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bargain-in {
  flex: 1; padding: 10px 16px; border: none; border-radius: var(--radius-full);
  background: var(--bg); font-size: 14px; outline: none;
}

.joined { font-size: 14px; font-weight: 600; color: var(--success); }

.cart-float {
  position: fixed; right: 20px; bottom: 20px;
  background: rgba(91,155,213,0.94); backdrop-filter: blur(8px);
  padding: 12px 20px; border-radius: var(--radius-full);
  box-shadow: 0 4px 20px rgba(91,155,213,0.3);
  transition: all var(--transition);
}
.cart-float:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(91,155,213,0.4); }
.cart-float-link { color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; }

.empty-state { text-align: center; padding: 60px 0; color: var(--text-light); }

/* related */
.related { margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee; }
.related h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.related-card {
  display: flex; align-items: center; gap: 10px; padding: 12px;
  background: var(--card-bg); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); text-decoration: none; color: var(--text);
  transition: all var(--transition);
}
.related-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.rel-img {
  width: 40px; height: 40px; border-radius: var(--radius-sm); flex-shrink: 0;
}
.img-trade  { background: linear-gradient(135deg, #c8e6c9, #a5d6a7); }
.img-lost   { background: linear-gradient(135deg, #bbdefb, #90caf9); }
.img-pintuan{ background: linear-gradient(135deg, #e1bee7, #ce93d8); }
.img-paotui { background: linear-gradient(135deg, #ffccbc, #ffab91); }
.rel-text { flex: 1; min-width: 0; }
.rel-text strong { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rel-text span { font-size: 13px; font-weight: 600; color: var(--danger); }
</style>

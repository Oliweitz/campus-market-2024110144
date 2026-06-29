<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favorite'
import { useMyListStore } from '@/stores/mylist'
import { useCartStore } from '@/stores/cart'
import { TYPE_LABELS, STATUS_LABELS, CAMPUS_LIST, type ItemType, type User } from '@/data/listings'
import FavoriteButton from '@/components/FavoriteButton.vue'

const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()
const favStore = useFavoriteStore()
const mylist = useMyListStore()
const cartStore = useCartStore()

const myPostTabs: ItemType[] = ['secondhand', 'group', 'errand', 'lostfound']
const myActiveTab = ref<ItemType>('secondhand')

const myPosts = computed(() => userStore.currentUserId ? itemStore.items.filter((l) => l.publisherId == userStore.currentUserId && l.type === myActiveTab.value) : [])
const favoriteItems = computed(() => favStore.favorites.map((f) => itemStore.getById(f.itemId)).filter(Boolean))
const myPintuan = computed(() => mylist.items.filter((i) => i.type === 'group'))
const myPaotui = computed(() => mylist.items.filter((i) => i.type === 'errand'))

const openSections = ref<Record<string, boolean>>({ posts: true })

// ---- 身份编辑 ----
const showEdit = ref(false)
const editForm = ref<Partial<User>>({})

function openEdit() {
  if (!userStore.profile) return
  editForm.value = { ...userStore.profile }
  showEdit.value = true
}

async function saveProfile() {
  await userStore.updateProfile(editForm.value)
  showEdit.value = false
}

function toggle(key: string) { openSections.value[key] = !openSections.value[key] }

async function handleWithdraw(id: number) { await mylist.withdraw(id) }

function handleLogout() {
  userStore.logout()
  router.push('/')
}

async function handleDelete(id: string | number, title: string) {
  if (!window.confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) return
  await itemStore.deleteItem(id)
}

onMounted(async () => {
  await itemStore.fetchItems()
  await favStore.fetchFavorites()
})
</script>

<template>
  <section>
    <!-- profile card -->
    <div class="profile-card">
      <div class="pc-top">
        <div class="pc-avatar">{{ userStore.nickname ? userStore.nickname[0] : '?' }}</div>
        <div>
          <h2>{{ userStore.nickname || '未登录' }}</h2>
          <span class="pc-meta">{{ userStore.profile?.college }} &middot; {{ userStore.campus }} &middot; {{ userStore.profile?.role }}</span>
        </div>
        <div class="pc-credit"><span>{{ userStore.profile?.creditScore ?? 0 }}</span><small>信用分</small></div>
        <button class="edit-btn" @click="openEdit">编辑</button>
        <button v-if="userStore.isLoggedIn" class="logout-btn" @click="handleLogout">退出登录</button>
        <router-link v-else to="/login" class="login-btn">登录</router-link>
      </div>
    </div>

    <!-- 身份编辑弹窗 -->
    <div v-if="showEdit" class="modal-mask" @click.self="showEdit = false">
      <div class="modal-card">
        <h3>编辑个人信息</h3>
        <div class="fg"><label>昵称</label><input v-model="editForm.nickname" class="in" /></div>
        <div class="fg"><label>学院</label><input v-model="editForm.college" class="in" /></div>
        <div class="fg"><label>校区</label><select v-model="editForm.campus" class="in"><option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option></select></div>
        <div class="fg"><label>角色</label><input v-model="editForm.role" class="in" /></div>
        <div class="modal-acts"><button class="btn btn-primary" @click="saveProfile">保存</button><button class="btn btn-ghost" @click="showEdit = false">取消</button></div>
      </div>
    </div>

    <!-- my posts -->
    <div class="sec">
      <div class="sec-head" @click="toggle('posts')"><h3>我的发布</h3><span class="chevron">{{ openSections.posts ? '▼' : '▶' }}</span></div>
      <template v-if="openSections.posts">
        <div class="tabs"><button v-for="tab in myPostTabs" :key="tab" :class="['tab', { active: myActiveTab === tab }]" @click="myActiveTab = tab">{{ TYPE_LABELS[tab] }}</button></div>
        <div v-if="myPosts.length" class="rows">
          <div v-for="post in myPosts" :key="post.id" class="row">
            <router-link :to="'/detail/' + post.id" class="row-title">{{ post.title }}</router-link>
            <span class="row-status" :class="'rs-' + (post.status === '进行中' ? 'active' : post.status === '已完成' ? 'completed' : 'closed')">{{ STATUS_LABELS[post.status] }}</span>
            <button v-if="post.status === '进行中'" class="row-act row-close" @click="itemStore.updateStatus(post.id, '已关闭')">撤回</button>
            <button v-if="post.status === '已关闭'" class="row-act row-restore" @click="itemStore.updateStatus(post.id, '进行中')">重发</button>
            <button v-if="post.type === 'lostfound' && post.status === '进行中'" class="row-act row-done" @click="itemStore.updateStatus(post.id, '已完成')">已找到</button>
            <button class="row-act row-delete" @click="handleDelete(post.id, post.title)">删除</button>
          </div>
        </div>
        <p v-else class="empty">暂无发布</p>
      </template>
    </div>

    <!-- favorites -->
    <div class="sec">
      <div class="sec-head" @click="toggle('favs')"><h3>我的收藏</h3><span class="chevron">{{ openSections.favs ? '▼' : '▶' }}</span></div>
      <template v-if="openSections.favs">
        <div v-if="favoriteItems.length" class="rows">
          <div v-for="f in favoriteItems" :key="f!.id" class="row">
            <router-link :to="'/detail/' + f!.id" class="row-title">{{ f!.title }}</router-link>
            <span class="row-tag">{{ TYPE_LABELS[f!.type] }}</span>
            <FavoriteButton :item-id="f!.id" />
          </div>
        </div>
        <p v-else class="empty">暂无收藏</p>
      </template>
    </div>

    <!-- cart -->
    <div class="sec">
      <div class="sec-head" @click="toggle('cart')"><h3>购物车</h3><span class="chevron">{{ openSections.cart ? '▼' : '▶' }}</span><span v-if="cartStore.totalCount" class="cart-badge">{{ cartStore.totalCount }}</span></div>
      <template v-if="openSections.cart">
        <div v-if="cartStore.items.length" class="rows">
          <div v-for="item in cartStore.items" :key="item.id" class="row">
            <router-link :to="'/detail/' + item.id" class="row-title">{{ item.title }}</router-link>
            <span class="cart-qty">
              <button class="qty-btn" @click="cartStore.updateQuantity(item.id, item.quantity - 1)">−</button>
              {{ item.quantity }}
              <button class="qty-btn" :class="{ disabled: item.quantity >= item.stock }" :disabled="item.quantity >= item.stock" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
              <span class="stock-hint">/ {{ item.stock }}</span>
            </span>
            <span class="row-num">¥{{ item.price * item.quantity }}</span>
            <button class="row-act row-done" @click="cartStore.buyItem(item.id)">购买</button>
            <button class="row-act row-close" @click="cartStore.removeFromCart(item.id)">删除</button>
          </div>
        </div>
        <div v-if="cartStore.items.length" class="sec-foot">合计 <strong>{{ cartStore.totalPrice }}</strong></div>
        <p v-else class="empty">购物车为空</p>
      </template>
    </div>

    <!-- pintuan -->
    <div class="sec" v-if="myPintuan.length">
      <div class="sec-head"><h3>我的拼单</h3></div>
      <div class="rows"><div v-for="item in myPintuan" :key="item.id" class="row"><router-link :to="'/detail/' + item.listingId" class="row-title">{{ item.title }}</router-link><button class="row-act row-close" @click="handleWithdraw(item.id)">退出</button></div></div>
    </div>

    <!-- paotui -->
    <div class="sec" v-if="myPaotui.length">
      <div class="sec-head"><h3>我的跑腿</h3></div>
      <div class="rows"><div v-for="item in myPaotui" :key="item.id" class="row"><router-link :to="'/detail/' + item.listingId" class="row-title">{{ item.title }}</router-link><button class="row-act row-close" @click="handleWithdraw(item.id)">退出</button></div></div>
    </div>
  </section>
</template>

<style scoped>
.profile-card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
.pc-top { display: flex; align-items: center; gap: 14px; }
.pc-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--primary-grad); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; flex-shrink: 0; }
.pc-top h2 { margin: 0; font-size: 17px; font-weight: 600; }
.pc-meta { font-size: 13px; color: var(--text-light); }
.pc-credit { margin-left: auto; text-align: center; } .pc-credit span { display: block; font-size: 22px; font-weight: 700; color: var(--primary); } .pc-credit small { font-size: 11px; color: var(--text-lighter); }
.edit-btn { padding: 6px 14px; border: 1px solid #ddd; border-radius: var(--radius-sm); background: #fff; font-size: 12px; cursor: pointer; color: var(--text-light); transition: all var(--transition); }
.edit-btn:hover { border-color: var(--primary); color: var(--primary); }
.logout-btn { padding: 6px 14px; border: 1px solid #f5c6cb; border-radius: var(--radius-sm); background: #fff; font-size: 12px; cursor: pointer; color: var(--danger); transition: all var(--transition); }
.logout-btn:hover { background: var(--danger-light); }
.login-btn { padding: 6px 14px; border: 1px solid var(--primary); border-radius: var(--radius-sm); background: #fff; font-size: 12px; cursor: pointer; color: var(--primary); text-decoration: none; transition: all var(--transition); display: inline-block; }
.login-btn:hover { background: var(--primary-light); }

/* modal */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-card { background: #fff; border-radius: var(--radius-lg); padding: 24px; width: 380px; max-width: 90vw; box-shadow: var(--shadow-lg); }
.modal-card h3 { margin: 0 0 16px; font-size: 16px; }
.fg { margin-bottom: 12px; } .fg label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.in { width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: var(--radius-sm); font-size: 14px; outline: none; }
.in:focus { border-color: var(--primary); }
.modal-acts { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
.btn { padding: 8px 20px; font-size: 13px; font-weight: 500; border: none; border-radius: var(--radius-full); cursor: pointer; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-ghost { border: 1px solid #ddd; background: #fff; color: var(--text); }

.sec { background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: 10px; overflow: hidden; }
.sec-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; cursor: pointer; user-select: none; transition: background var(--transition); }
.sec-head:hover { background: #fafbfc; } .sec-head h3 { margin: 0; font-size: 14px; font-weight: 600; }
.chevron { font-size: 10px; color: var(--text-lighter); }
.tabs { display: flex; gap: 6px; padding: 0 18px 12px; }
.tab { padding: 5px 14px; border: none; background: var(--bg); border-radius: var(--radius-full); font-size: 13px; cursor: pointer; color: var(--text-light); transition: all var(--transition); }
.tab.active { background: var(--primary); color: #fff; }
.rows { padding: 0 18px; }
.row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.row:last-child { border-bottom: none; }
.row-title { flex: 1; text-decoration: none; color: var(--text); font-size: 14px; } .row-title:hover { color: var(--primary); }
.row-status { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
.rs-active { background: var(--success-light); color: var(--success); } .rs-completed { background: #f0f0f0; color: #bbb; } .rs-closed { background: var(--danger-light); color: var(--danger); }
.row-tag { font-size: 11px; background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; }
.row-act { padding: 4px 10px; border: none; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; background: var(--bg); color: var(--text-light); transition: all var(--transition); }
.row-act:hover { background: #e8e8e8; }
.row-close { color: var(--danger); } .row-close:hover { background: var(--danger-light); }
.row-restore { color: var(--primary); } .row-restore:hover { background: var(--primary-light); }
.row-done { color: var(--success); } .row-done:hover { background: var(--success-light); }
.row-delete { color: #999; } .row-delete:hover { background: #f5f5f5; color: var(--danger); }
.row-num { font-size: 13px; font-weight: 600; color: var(--danger); }
.cart-badge { background: var(--primary); color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 8px; margin-left: 6px; }
.cart-qty { display: flex; align-items: center; gap: 4px; font-size: 13px; }
.qty-btn { width: 22px; height: 22px; border: 1px solid #e0e0e0; border-radius: 50%; background: #fff; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
.qty-btn:hover { background: var(--bg); border-color: var(--primary); }
.qty-btn.disabled { opacity: 0.3; cursor: not-allowed; } .qty-btn.disabled:hover { border-color: #e0e0e0; }
.stock-hint { font-size: 11px; color: var(--text-lighter); }
.sec-foot { padding: 10px 18px; text-align: right; font-size: 13px; color: var(--text-light); border-top: 1px solid #f5f5f5; }
.sec-foot strong { color: var(--text); }
.empty { padding: 16px 18px; margin: 0; font-size: 13px; color: var(--text-lighter); }
</style>

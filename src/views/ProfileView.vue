<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProfileStore } from '@/stores/profile'
import { useFavoritesStore } from '@/stores/favorites'
import { useMyListStore } from '@/stores/mylist'
import { useOrdersStore } from '@/stores/orders'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, STATUS_LABELS, type ListingType } from '@/data/listings'

const cart = useCartStore()
const profile = useProfileStore()
const fav = useFavoritesStore()
const mylist = useMyListStore()
const orders = useOrdersStore()
const listStore = useListingsStore()

const MY_NAME = profile.profile.nickname
const myPostTabs: ListingType[] = ['trade', 'pintuan', 'paotui', 'lost']
const myActiveTab = ref<ListingType>('trade')

const myPosts = computed(() => listStore.items.filter(l => l.poster === MY_NAME && l.type === myActiveTab.value))
const myPintuan = computed(() => mylist.items.filter(i => i.type === 'pintuan'))
const myPaotui = computed(() => mylist.items.filter(i => i.type === 'paotui'))
const favoriteList = computed(() => fav.ids.map(id => listStore.getById(id)).filter(Boolean))

// collapsible sections
const openSections = ref<Record<string, boolean>>({ posts: true })
function toggle(key: string) { openSections.value[key] = !openSections.value[key] }
</script>

<template>
  <section>
    <!-- profile card -->
    <div class="profile-card">
      <div class="pc-top">
        <div class="pc-avatar">{{ profile.profile.nickname[0] }}</div>
        <div>
          <h2>{{ profile.profile.nickname }}</h2>
          <span class="pc-meta">{{ profile.profile.college }} &middot; {{ profile.profile.campus }} &middot; {{ profile.profile.role }}</span>
        </div>
        <div class="pc-credit">
          <span>{{ profile.profile.creditScore }}</span>
          <small>信用分</small>
        </div>
      </div>
    </div>

    <!-- my posts -->
    <div class="sec">
      <div class="sec-head" @click="toggle('posts')">
        <h3>我的发布</h3>
        <span class="chevron">{{ openSections.posts ? '&#9660;' : '&#9654;' }}</span>
      </div>
      <template v-if="openSections.posts">
        <div class="tabs">
          <button v-for="tab in myPostTabs" :key="tab" :class="['tab', { active: myActiveTab === tab }]" @click="myActiveTab = tab">{{ TYPE_LABELS[tab] }}</button>
        </div>
        <div v-if="myPosts.length > 0" class="rows">
          <div v-for="post in myPosts" :key="post.id" class="row">
            <router-link :to="'/detail/' + post.id" class="row-title">{{ post.title }}</router-link>
            <span class="row-status" :class="'rs-' + post.status">{{ STATUS_LABELS[post.status] }}</span>
            <span v-if="post.price" class="row-num">{{ post.price }}</span>
            <span v-if="post.reward" class="row-num">{{ post.reward }}</span>
            <button v-if="post.status === 'active'" class="row-act row-close" @click="listStore.updateStatus(post.id, 'closed')">撤回</button>
            <button v-if="post.status === 'closed'" class="row-act row-restore" @click="listStore.updateStatus(post.id, 'active')">重发</button>
            <button v-if="post.type === 'lost' && post.status === 'active'" class="row-act row-done" @click="listStore.updateStatus(post.id, 'completed')">已找到</button>
          </div>
        </div>
        <p v-else class="empty">暂无发布</p>
      </template>
    </div>

    <!-- favorites -->
    <div class="sec">
      <div class="sec-head" @click="toggle('favs')">
        <h3>我的收藏</h3>
        <span class="chevron">{{ openSections.favs ? '&#9660;' : '&#9654;' }}</span>
      </div>
      <template v-if="openSections.favs">
        <div v-if="favoriteList.length > 0" class="rows">
          <div v-for="f in favoriteList" :key="f!.id" class="row">
            <router-link :to="'/detail/' + f!.id" class="row-title">{{ f!.title }}</router-link>
            <span class="row-tag">{{ TYPE_LABELS[f!.type] }}</span>
            <button class="row-act" @click="fav.remove(f!.id)">取消</button>
          </div>
        </div>
        <p v-else class="empty">暂无收藏</p>
      </template>
    </div>

    <!-- pintuan -->
    <div class="sec" v-if="myPintuan.length > 0">
      <div class="sec-head"><h3>我的拼单</h3></div>
      <div class="rows">
        <div v-for="item in myPintuan" :key="item.id" class="row">
          <router-link :to="'/detail/' + item.listingId" class="row-title">{{ item.title }}</router-link>
          <router-link :to="'/message?to=' + item.poster" class="row-link">联系</router-link>
          <button class="row-act row-close" @click="mylist.withdraw(item.id)">退出</button>
        </div>
      </div>
    </div>

    <!-- paotui -->
    <div class="sec" v-if="myPaotui.length > 0">
      <div class="sec-head"><h3>我的跑腿</h3></div>
      <div class="rows">
        <div v-for="item in myPaotui" :key="item.id" class="row">
          <router-link :to="'/detail/' + item.listingId" class="row-title">{{ item.title }}</router-link>
          <router-link :to="'/message?to=' + item.poster" class="row-link">联系</router-link>
          <button class="row-act row-close" @click="mylist.withdraw(item.id)">退出</button>
        </div>
      </div>
    </div>

    <!-- orders -->
    <div class="sec">
      <div class="sec-head" @click="toggle('orders')">
        <h3>我的订单</h3>
        <span class="chevron">{{ openSections.orders ? '&#9660;' : '&#9654;' }}</span>
      </div>
      <template v-if="openSections.orders">
        <div v-if="orders.orders.length > 0" class="rows">
          <div v-for="o in orders.orders" :key="o.id" class="row">
            <router-link :to="'/detail/' + o.listingId" class="row-title">{{ o.title }}</router-link>
            <span class="row-num">{{ o.price }} x {{ o.quantity }}</span>
            <span class="row-time">{{ o.time }}</span>
          </div>
        </div>
        <div v-if="orders.orders.length > 0" class="sec-foot">累计消费 <strong>{{ orders.totalSpent }}</strong></div>
        <p v-else class="empty">暂无订单</p>
      </template>
    </div>

    <!-- cart -->
    <div class="sec">
      <div class="sec-head" @click="toggle('cart')">
        <h3>购物车</h3>
        <span class="chevron">{{ openSections.cart ? '&#9660;' : '&#9654;' }}</span>
      </div>
      <template v-if="openSections.cart">
        <div v-if="cart.items.length > 0" class="rows">
          <div v-for="item in cart.items" :key="item.id" class="row">
            <router-link :to="'/detail/' + item.id" class="row-title">{{ item.title }}</router-link>
            <span class="row-num">{{ item.price }} x {{ item.quantity }}</span>
            <button class="row-act row-done" @click="cart.buyItem(item.id)">购买</button>
            <button class="row-act row-close" @click="cart.removeFromCart(item.id)">删除</button>
          </div>
        </div>
        <div v-if="cart.items.length > 0" class="sec-foot">合计 <strong>{{ cart.totalPrice }}</strong></div>
        <p v-else class="empty">购物车为空</p>
      </template>
    </div>
  </section>
</template>

<style scoped>
.profile-card {
  background: var(--card-bg); border-radius: var(--radius-lg); padding: 20px;
  box-shadow: var(--shadow-sm); margin-bottom: 16px;
}
.pc-top { display: flex; align-items: center; gap: 14px; }
.pc-avatar {
  width: 48px; height: 48px; border-radius: 50%; background: var(--primary-grad);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 600; flex-shrink: 0;
}
.pc-top h2 { margin: 0; font-size: 17px; font-weight: 600; }
.pc-meta { font-size: 13px; color: var(--text-light); }
.pc-credit { margin-left: auto; text-align: center; }
.pc-credit span { display: block; font-size: 22px; font-weight: 700; color: var(--primary); }
.pc-credit small { font-size: 11px; color: var(--text-lighter); }

.sec {
  background: var(--card-bg); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); margin-bottom: 10px; overflow: hidden;
}
.sec-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; cursor: pointer; user-select: none;
  transition: background var(--transition);
}
.sec-head:hover { background: #fafbfc; }
.sec-head h3 { margin: 0; font-size: 14px; font-weight: 600; }
.chevron { font-size: 10px; color: var(--text-lighter); }

.tabs { display: flex; gap: 6px; padding: 0 18px 12px; }
.tab {
  padding: 5px 14px; border: none; background: var(--bg); border-radius: var(--radius-full);
  font-size: 13px; cursor: pointer; color: var(--text-light); transition: all var(--transition);
}
.tab.active { background: var(--primary); color: #fff; }

.rows { padding: 0 18px; }
.row {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.row:last-child { border-bottom: none; }
.row-title { flex: 1; text-decoration: none; color: var(--text); font-size: 14px; }
.row-title:hover { color: var(--primary); }
.row-status { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
.rs-active { background: var(--success-light); color: var(--success); }
.rs-completed { background: #f0f0f0; color: #bbb; }
.rs-closed { background: var(--danger-light); color: var(--danger); }
.row-tag { font-size: 11px; background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; }
.row-num { font-size: 13px; font-weight: 600; color: var(--danger); }
.row-time { font-size: 12px; color: var(--text-lighter); }
.row-link { text-decoration: none; font-size: 12px; color: var(--primary); }
.row-link:hover { text-decoration: underline; }

.row-act {
  padding: 4px 10px; border: none; border-radius: var(--radius-sm); font-size: 12px;
  cursor: pointer; background: var(--bg); color: var(--text-light); transition: all var(--transition);
}
.row-act:hover { background: #e8e8e8; }
.row-close { color: var(--danger); } .row-close:hover { background: var(--danger-light); }
.row-restore { color: var(--primary); } .row-restore:hover { background: var(--primary-light); }
.row-done { color: var(--success); } .row-done:hover { background: var(--success-light); }

.sec-foot { padding: 10px 18px; text-align: right; font-size: 13px; color: var(--text-light); }
.sec-foot strong { color: var(--text); }

.empty { padding: 16px 18px; margin: 0; font-size: 13px; color: var(--text-lighter); }
</style>

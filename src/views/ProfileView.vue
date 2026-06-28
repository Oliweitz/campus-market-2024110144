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

const myPosts = computed(() =>
  listStore.items.filter(l => l.poster === MY_NAME && l.type === myActiveTab.value),
)

const myPintuan = computed(() => mylist.items.filter(i => i.type === 'pintuan'))
const myPaotui = computed(() => mylist.items.filter(i => i.type === 'paotui'))

const favoriteList = computed(() =>
  fav.ids.map(id => listStore.getById(id)).filter(Boolean),
)
</script>

<template>
  <section>
    <div class="profile-card">
      <h2>{{ profile.profile.nickname }}</h2>
      <div class="profile-info">
        <span>{{ profile.profile.college }}</span>
        <span>{{ profile.profile.campus }}</span>
        <span>{{ profile.profile.role }}</span>
        <span class="credit-badge">信用分 {{ profile.profile.creditScore }}</span>
      </div>
    </div>

    <div class="section">
      <h3>我的发布</h3>
      <div class="tabs">
        <button v-for="tab in myPostTabs" :key="tab" :class="['tab', { active: myActiveTab === tab }]" @click="myActiveTab = tab">{{ TYPE_LABELS[tab] }}</button>
      </div>
      <ul v-if="myPosts.length > 0" class="post-list">
        <li v-for="post in myPosts" :key="post.id" class="post-item">
          <router-link :to="'/detail/' + post.id">{{ post.title }}</router-link>
          <span class="status-tag" :class="'st-' + post.status">{{ STATUS_LABELS[post.status] }}</span>
          <span v-if="post.price">{{ post.price }}</span>
          <span v-if="post.reward">{{ post.reward }}</span>
          <button v-if="post.status === 'active'" class="mini-close-btn" @click="listStore.updateStatus(post.id, 'closed')">撤回</button>
          <button v-if="post.status === 'closed'" class="mini-restore-btn" @click="listStore.updateStatus(post.id, 'active')">重新发布</button>
          <button v-if="post.type === 'lost' && post.status === 'active'" class="mini-done-btn" @click="listStore.updateStatus(post.id, 'completed')">已找到</button>
        </li>
      </ul>
      <p v-else class="empty">暂无发布</p>
    </div>

    <div class="section">
      <h3>我的收藏</h3>
      <ul v-if="favoriteList.length > 0" class="post-list">
        <li v-for="f in favoriteList" :key="f!.id" class="post-item">
          <router-link :to="'/detail/' + f!.id">{{ f!.title }}</router-link>
          <span class="type-tag">{{ TYPE_LABELS[f!.type] }}</span>
          <button class="unfav-btn" @click="fav.remove(f!.id)">取消</button>
        </li>
      </ul>
      <p v-else class="empty">暂无收藏</p>
    </div>

    <div class="section" v-if="myPintuan.length > 0">
      <h3>我的拼单</h3>
      <ul class="post-list">
        <li v-for="item in myPintuan" :key="item.id" class="post-item">
          <router-link :to="'/detail/' + item.listingId">{{ item.title }}</router-link>
          <router-link :to="'/message?to=' + item.poster" class="contact-link">联系发起人</router-link>
          <button class="withdraw-btn" @click="mylist.withdraw(item.id)">退出</button>
        </li>
      </ul>
    </div>

    <div class="section" v-if="myPaotui.length > 0">
      <h3>我的跑腿</h3>
      <ul class="post-list">
        <li v-for="item in myPaotui" :key="item.id" class="post-item">
          <router-link :to="'/detail/' + item.listingId">{{ item.title }}</router-link>
          <router-link :to="'/message?to=' + item.poster" class="contact-link">联系委托人</router-link>
          <button class="withdraw-btn" @click="mylist.withdraw(item.id)">退出</button>
        </li>
      </ul>
    </div>

    <div class="section">
      <h3>我的订单</h3>
      <template v-if="orders.orders.length > 0">
        <ul class="post-list">
          <li v-for="o in orders.orders" :key="o.id" class="post-item">
            <router-link :to="'/detail/' + o.listingId">{{ o.title }}</router-link>
            <span class="order-info">{{ o.price }} x {{ o.quantity }}</span>
            <span class="order-time">{{ o.time }}</span>
          </li>
        </ul>
        <div class="order-total">累计消费: <strong>{{ orders.totalSpent }}</strong></div>
      </template>
      <p v-else class="empty">暂无订单，去列表页逛逛吧。</p>
    </div>

    <div class="section">
      <h3>购物车</h3>
      <template v-if="cart.items.length > 0">
        <ul class="cart-list">
          <li v-for="item in cart.items" :key="item.id" class="cart-item">
            <div class="cart-info">
              <router-link :to="'/detail/' + item.id" class="cart-title">{{ item.title }}</router-link>
              <span class="cart-price">{{ item.price }} x {{ item.quantity }}</span>
            </div>
            <div class="cart-actions">
              <router-link :to="'/message?to=卖家'" class="contact-link">联系卖家</router-link>
              <button class="buy-btn" @click="cart.buyItem(item.id)">购买</button>
              <button class="remove-btn" @click="cart.removeFromCart(item.id)">删除</button>
            </div>
          </li>
        </ul>
        <div class="cart-footer">
          <span>合计: <strong>{{ cart.totalPrice }}</strong></span>
          <button class="clear-btn" @click="cart.clearCart()">清空购物车</button>
        </div>
      </template>
      <p v-else class="empty">购物车是空的，去列表页逛逛吧。</p>
    </div>
  </section>
</template>

<style scoped>
.profile-card { background: #ecf5ff; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
.profile-info { display: flex; gap: 12px; margin-top: 8px; font-size: 14px; color: #666; flex-wrap: wrap; align-items: center; }
.credit-badge { background: #fef0d9; color: #e6a23c; padding: 2px 10px; border-radius: 12px; font-weight: bold; }
.section { margin-top: 24px; border-top: 1px solid #e5e5e5; padding-top: 16px; }
.tabs { display: flex; gap: 8px; margin: 12px 0; }
.tab { padding: 6px 16px; border: 1px solid #ccc; background: #fff; border-radius: 20px; cursor: pointer; font-size: 14px; }
.tab:hover { border-color: #409eff; color: #409eff; }
.tab.active { background: #409eff; color: #fff; border-color: #409eff; }
.post-list { list-style: none; padding: 0; }
.post-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.post-item a:first-child { text-decoration: none; color: #333; flex: 1; }
.post-item a:first-child:hover { color: #409eff; }
.type-tag { font-size: 12px; color: #409eff; background: #ecf5ff; padding: 2px 6px; border-radius: 4px; }
.contact-link { text-decoration: none; color: #409eff; font-size: 13px; }
.contact-link:hover { text-decoration: underline; }
.status-tag { font-size: 12px; padding: 2px 6px; border-radius: 4px; }
.st-active { background: #e8f5e9; color: #4caf50; }
.st-completed { background: #f0f0f0; color: #999; }
.st-closed { background: #fde8e8; color: #e74c3c; }
.unfav-btn { padding: 4px 10px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; }
.unfav-btn:hover { background: #f0f0f0; }
.mini-close-btn { padding: 4px 8px; border: 1px solid #e74c3c; color: #e74c3c; background: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; }
.mini-close-btn:hover { background: #e74c3c; color: #fff; }
.mini-restore-btn { padding: 4px 8px; border: 1px solid #409eff; color: #409eff; background: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; }
.mini-restore-btn:hover { background: #409eff; color: #fff; }
.mini-done-btn { padding: 4px 8px; border: 1px solid #67c23a; color: #67c23a; background: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; }
.mini-done-btn:hover { background: #67c23a; color: #fff; }
.withdraw-btn { padding: 4px 12px; border: 1px solid #e6a23c; color: #e6a23c; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; }
.withdraw-btn:hover { background: #e6a23c; color: #fff; }
.cart-list { list-style: none; padding: 0; }
.cart-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.cart-info { display: flex; flex-direction: column; gap: 4px; }
.cart-title { text-decoration: none; color: #333; font-weight: bold; }
.cart-title:hover { color: #409eff; }
.cart-price { color: #e74c3c; font-size: 14px; }
.cart-actions { display: flex; gap: 8px; align-items: center; }
.buy-btn { padding: 4px 12px; border: 1px solid #409eff; color: #409eff; background: #fff; border-radius: 4px; cursor: pointer; }
.buy-btn:hover { background: #409eff; color: #fff; }
.remove-btn { padding: 4px 12px; border: 1px solid #e74c3c; color: #e74c3c; background: #fff; border-radius: 4px; cursor: pointer; }
.remove-btn:hover { background: #e74c3c; color: #fff; }
.cart-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.clear-btn { padding: 6px 16px; border: 1px solid #999; color: #999; background: #fff; border-radius: 4px; cursor: pointer; }
.clear-btn:hover { background: #999; color: #fff; }
.order-info { color: #e74c3c; font-weight: bold; font-size: 14px; }
.order-time { color: #999; font-size: 12px; }
.order-total { margin-top: 12px; text-align: right; color: #333; }
.empty { color: #999; margin-top: 8px; }
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useFavoritesStore } from '@/stores/favorites'
import { useChatStore } from '@/stores/chat'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, type ListingType } from '@/data/listings'

const profile = useProfileStore()
const fav = useFavoritesStore()
const chat = useChatStore()
const listStore = useListingsStore()

const typeEntries: { key: ListingType; label: string }[] = [
  { key: 'trade', label: '二手交易' },
  { key: 'lost', label: '失物招领' },
  { key: 'pintuan', label: '拼单搭子' },
  { key: 'paotui', label: '跑腿委托' },
]

const recentListings = computed(() =>
  [...listStore.items].sort((a, b) => b.publishTime.localeCompare(a.publishTime)).slice(0, 4),
)

const hotListings = computed(() => [...listStore.items].slice(0, 3))
</script>

<template>
  <section class="home">
    <div class="welcome">
      <h2>你好, {{ profile.profile.nickname }}</h2>
      <p class="user-info">
        {{ profile.profile.college }} &middot; {{ profile.profile.campus }}
        <span class="credit">信用分 {{ profile.profile.creditScore }}</span>
      </p>
    </div>

    <div class="safety-notice">
      [安全提醒] 尽量选择公共地点交易，贵重物品注意验真，保护个人联系方式，警惕异常低价。
    </div>

    <div class="quick-entries">
      <router-link v-for="t in typeEntries" :key="t.key" :to="'/list?type=' + t.key" class="entry-card">
        <span class="entry-label">{{ t.label }}</span>
      </router-link>
    </div>

    <div class="func-entries">
      <router-link to="/publish" class="func-btn">发布信息</router-link>
      <router-link to="/message" class="func-btn">
        消息中心
        <span v-if="chat.totalUnread > 0" class="badge">{{ chat.totalUnread }}</span>
      </router-link>
      <router-link to="/profile" class="func-btn">
        个人中心
        <span class="badge fav-badge">{{ fav.count }}</span>
      </router-link>
      <router-link to="/dashboard" class="func-btn">趋势看板</router-link>
    </div>

    <div class="section">
      <h3>最新发布</h3>
      <div class="mini-list">
        <router-link v-for="l in recentListings" :key="l.id" :to="'/detail/' + l.id" class="mini-item">
          <span class="mini-type">{{ TYPE_LABELS[l.type] }}</span>
          <span class="mini-title">{{ l.title }}</span>
          <span class="mini-poster">{{ l.poster }}</span>
        </router-link>
      </div>
    </div>

    <div class="section">
      <h3>热门推荐</h3>
      <div class="mini-list">
        <router-link v-for="l in hotListings" :key="l.id" :to="'/detail/' + l.id" class="mini-item">
          <span class="mini-type">{{ TYPE_LABELS[l.type] }}</span>
          <span class="mini-title">{{ l.title }}</span>
          <span v-if="l.price" class="mini-price">{{ l.price }}</span>
          <span v-if="l.reward" class="mini-price">{{ l.reward }}</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home { max-width: 640px; }
.welcome { margin-bottom: 12px; }
.user-info { color: #666; font-size: 14px; display: flex; align-items: center; gap: 12px; }
.credit { background: #fef0d9; color: #e6a23c; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: bold; }
.safety-notice { background: #fef0d9; border: 1px solid #f5dab1; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #b88230; margin-bottom: 16px; line-height: 1.5; }
.quick-entries { display: flex; gap: 10px; margin-bottom: 16px; }
.entry-card { flex: 1; text-align: center; padding: 16px 8px; border: 1px solid #e5e5e5; border-radius: 8px; text-decoration: none; color: #333; transition: background 0.2s; }
.entry-card:hover { background: #f5f5f5; }
.entry-label { font-size: 14px; font-weight: bold; }
.func-entries { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.func-btn { position: relative; padding: 10px 18px; border: 1px solid #409eff; color: #409eff; border-radius: 20px; text-decoration: none; font-size: 14px; transition: all 0.2s; }
.func-btn:hover { background: #409eff; color: #fff; }
.badge { position: absolute; top: -6px; right: -6px; background: #e74c3c; color: #fff; border-radius: 10px; padding: 1px 7px; font-size: 12px; min-width: 20px; text-align: center; }
.fav-badge { background: #e6a23c; }
.section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e5e5; }
.section h3 { font-size: 16px; margin-bottom: 10px; }
.mini-list { display: flex; flex-direction: column; gap: 6px; }
.mini-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #f0f0f0; border-radius: 6px; text-decoration: none; color: #333; }
.mini-item:hover { background: #f5f5f5; }
.mini-type { font-size: 12px; color: #409eff; background: #ecf5ff; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; }
.mini-title { flex: 1; font-size: 14px; }
.mini-poster { font-size: 13px; color: #999; }
.mini-price { color: #e74c3c; font-weight: bold; font-size: 14px; }
</style>

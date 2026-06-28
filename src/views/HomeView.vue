<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'
import { TYPE_LABELS, type ItemType } from '@/data/listings'
import SafetyNotice from '@/components/SafetyNotice.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

const userStore = useUserStore()
const itemStore = useItemStore()
const favStore = useFavoriteStore()
const msgStore = useMessageStore()

const typeEntries: { key: ItemType; label: string; desc: string; gradient: string }[] = [
  { key: 'secondhand', label: '二手交易', desc: '闲置好物，物美价廉', gradient: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' },
  { key: 'lostfound', label: '失物招领', desc: '丢失拾获，互助找回', gradient: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' },
  { key: 'group', label: '拼单搭子', desc: '一起拼，更划算', gradient: 'linear-gradient(135deg, #f3e5f5, #e1bee7)' },
  { key: 'errand', label: '跑腿委托', desc: '代取代送，随叫随到', gradient: 'linear-gradient(135deg, #fbe9e7, #ffccbc)' },
]

const recentListings = computed(() =>
  [...itemStore.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
)
const hotListings = computed(() =>
  [...itemStore.items].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4),
)

onMounted(async () => {
  await userStore.init()
  await itemStore.fetchItems()
  await favStore.fetchFavorites()
  await msgStore.fetchConversations()
})
</script>

<template>
  <section class="home">
    <router-link to="/profile" class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <div class="banner-avatar">{{ userStore.nickname ? userStore.nickname[0] : '?' }}</div>
        <div>
          <h2>{{ userStore.nickname || '游客' }}，下午好</h2>
          <span class="banner-meta">{{ userStore.profile?.college }} &middot; {{ userStore.campus }} &middot; 信用 {{ userStore.profile?.creditScore ?? 0 }} 分</span>
        </div>
      </div>
      <div class="banner-decor"><div class="decor-circle c1"></div><div class="decor-circle c2"></div><div class="decor-circle c3"></div></div>
    </router-link>

    <SafetyNotice />

    <div class="type-grid">
      <router-link v-for="t in typeEntries" :key="t.key" :to="'/list?type=' + t.key" class="type-card" :style="{ background: t.gradient }">
        <span class="tc-icon" v-html="['&#8635;','&#9744;','&#9878;','&#9971;'][typeEntries.indexOf(t)]"></span>
        <div class="tc-text"><strong>{{ t.label }}</strong><small>{{ t.desc }}</small></div>
        <span class="tc-arrow">&rarr;</span>
      </router-link>
    </div>

    <div class="block">
      <div class="block-head"><h3>最新发布</h3><router-link to="/list" class="more">全部 &rarr;</router-link></div>
      <div class="card-list">
        <div v-for="l in recentListings" :key="l.id" class="card-row">
          <router-link :to="'/detail/' + l.id" class="card">
            <div class="card-img" :class="'img-' + l.type"></div>
            <div class="card-body"><span class="card-type">{{ TYPE_LABELS[l.type] }}</span><span class="card-title">{{ l.title }}</span></div>
            <span v-if="l.price" class="card-num">¥{{ l.price }}</span>
            <span v-if="l.reward" class="card-num">¥{{ l.reward }}</span>
          </router-link>
          <FavoriteButton :item-id="l.id" />
        </div>
      </div>
    </div>

    <div class="block">
      <div class="block-head"><h3>热门推荐</h3></div>
      <div class="card-list">
        <div v-for="l in hotListings" :key="l.id" class="card-row">
          <router-link :to="'/detail/' + l.id" class="card">
            <div class="card-img" :class="'img-' + l.type"></div>
            <div class="card-body"><span class="card-type">{{ TYPE_LABELS[l.type] }}</span><span class="card-title">{{ l.title }}</span></div>
            <span v-if="l.price" class="card-num">¥{{ l.price }}</span>
            <span v-if="l.reward" class="card-num">¥{{ l.reward }}</span>
          </router-link>
          <FavoriteButton :item-id="l.id" />
        </div>
      </div>
    </div>

    <div class="quick-links">
      <router-link to="/publish" class="ql-btn ql-publish">发布信息</router-link>
      <router-link to="/message" class="ql-btn ql-msg">消息<span v-if="msgStore.totalUnread" class="ql-badge">{{ msgStore.totalUnread }}</span></router-link>
      <router-link to="/profile" class="ql-btn ql-profile">收藏 {{ favStore.count }}</router-link>
      <router-link to="/dashboard" class="ql-btn ql-dash">看板</router-link>
    </div>
  </section>
</template>

<style scoped>
.home { animation: slideUp 0.3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } }
.banner {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #4a8ec9 0%, #5b9bd5 25%, #7ab8f5 60%, #a0cff8 100%);
  border-radius: var(--radius-lg); padding: 28px 24px; color: #fff;
  margin-bottom: 14px; display: block; text-decoration: none;
  cursor: pointer; transition: all var(--transition);
}
.banner::before {
  content: ''; position: absolute; top: -30%; right: -10%; width: 180px; height: 180px;
  border-radius: 50%; background: rgba(255,255,255,0.08);
}
.banner:hover { box-shadow: 0 6px 24px rgba(91,155,213,0.35); transform: translateY(-2px); }
.banner-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; }
.banner-avatar { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.25); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.4); }
.banner h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.banner-meta { font-size: 13px; opacity: 0.85; }
.banner-decor { position: absolute; right: -20px; top: -20px; width: 160px; height: 160px; }
.decor-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); }
.c1 { width: 120px; height: 120px; top: 0; right: 0; } .c2 { width: 80px; height: 80px; top: 40px; right: 60px; } .c3 { width: 50px; height: 50px; top: 20px; right: 100px; }
.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px; }
.type-card { display: flex; align-items: center; gap: 12px; padding: 22px 18px; border-radius: var(--radius-lg); text-decoration: none; color: var(--text); transition: all var(--transition); overflow: hidden; }
.type-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.tc-icon { font-size: 28px; width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tc-text { flex: 1; } .tc-text strong { display: block; font-size: 15px; font-weight: 700; margin-bottom: 2px; } .tc-text small { font-size: 12px; color: var(--text-light); }
.tc-arrow { font-size: 16px; color: var(--text-lighter); flex-shrink: 0; }
.block { margin-bottom: 22px; }
.block-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.block-head h3 { font-size: 15px; font-weight: 600; }
.more { font-size: 13px; color: var(--primary); text-decoration: none; } .more:hover { text-decoration: underline; }
.card-list { display: flex; flex-direction: column; gap: 8px; }
.card-row { display: flex; align-items: stretch; background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: all var(--transition); overflow: hidden; padding-right: 8px; }
.card-row:hover { box-shadow: var(--shadow-md); transform: translateX(3px); }
.card { display: flex; align-items: center; gap: 12px; padding: 12px; text-decoration: none; color: var(--text); flex: 1; }
.card-img { width: 44px; height: 44px; border-radius: var(--radius-sm); flex-shrink: 0; }
.img-secondhand { background: linear-gradient(135deg, #c8e6c9, #a5d6a7); }
.img-lostfound { background: linear-gradient(135deg, #bbdefb, #90caf9); }
.img-group { background: linear-gradient(135deg, #e1bee7, #ce93d8); }
.img-errand { background: linear-gradient(135deg, #ffccbc, #ffab91); }
.card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.card-type { font-size: 11px; color: var(--primary); background: var(--primary-light); padding: 1px 6px; border-radius: 4px; display: inline-block; width: fit-content; }
.card-title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-num { font-size: 14px; font-weight: 600; color: var(--danger); flex-shrink: 0; }
.quick-links { display: flex; gap: 10px; }
.ql-btn { position: relative; flex: 1; text-align: center; padding: 11px 0; border-radius: var(--radius-full); font-size: 13px; font-weight: 500; text-decoration: none; transition: all var(--transition); }
.ql-publish { background: var(--primary); color: #fff; } .ql-publish:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.3); transform: translateY(-1px); }
.ql-msg, .ql-profile, .ql-dash { background: var(--card-bg); color: var(--text); box-shadow: var(--shadow-sm); }
.ql-msg:hover, .ql-profile:hover, .ql-dash:hover { background: #f0f4f8; }
.ql-badge { position: absolute; top: -4px; right: 6px; background: var(--danger); color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 8px; }
@media (min-width: 769px) { .card-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } }
@media (max-width: 480px) { .banner { padding: 20px 16px; } .banner-avatar { width: 40px; height: 40px; font-size: 18px; } .banner h2 { font-size: 16px; } .type-grid { gap: 8px; } .type-card { padding: 16px 12px; } .tc-icon { width: 40px; height: 40px; font-size: 24px; } .tc-text strong { font-size: 14px; } }
</style>

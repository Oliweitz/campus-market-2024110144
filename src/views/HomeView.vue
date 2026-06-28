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

const typeEntries: { key: ListingType; label: string; desc: string; gradient: string; icon: string }[] = [
  { key: 'trade', label: '二手交易', desc: '闲置好物，物美价廉', gradient: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', icon: '&#8635;' },
  { key: 'lost', label: '失物招领', desc: '丢失拾获，互助找回', gradient: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', icon: '&#9744;' },
  { key: 'pintuan', label: '拼单搭子', desc: '一起拼，更划算', gradient: 'linear-gradient(135deg, #f3e5f5, #e1bee7)', icon: '&#9878;' },
  { key: 'paotui', label: '跑腿委托', desc: '代取代送，随叫随到', gradient: 'linear-gradient(135deg, #fbe9e7, #ffccbc)', icon: '&#9971;' },
]

const recentListings = computed(() =>
  [...listStore.items].sort((a, b) => b.publishTime.localeCompare(a.publishTime)).slice(0, 6),
)
const hotListings = computed(() =>
  [...listStore.items].sort(() => Math.random() - 0.5).slice(0, 4),
)
</script>

<template>
  <section class="home">
    <!-- banner -->
    <div class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <div class="banner-avatar">{{ profile.profile.nickname[0] }}</div>
        <div>
          <h2>{{ profile.profile.nickname }}，下午好</h2>
          <span class="banner-meta">{{ profile.profile.college }} &middot; {{ profile.profile.campus }} &middot; 信用 {{ profile.profile.creditScore }} 分</span>
        </div>
      </div>
      <div class="banner-decor">
        <div class="decor-circle c1"></div>
        <div class="decor-circle c2"></div>
        <div class="decor-circle c3"></div>
      </div>
    </div>

    <!-- safety -->
    <div class="safety">
      尽量选择公共地点交易，贵重物品注意验真，保护个人隐私。
    </div>

    <!-- type cards — 2x2 grid -->
    <div class="type-grid">
      <router-link v-for="t in typeEntries" :key="t.key" :to="'/list?type=' + t.key" class="type-card" :style="{ background: t.gradient }">
        <span class="tc-icon" v-html="t.icon"></span>
        <div class="tc-text">
          <strong>{{ t.label }}</strong>
          <small>{{ t.desc }}</small>
        </div>
        <span class="tc-arrow">&rarr;</span>
      </router-link>
    </div>

    <!-- recent -->
    <div class="block">
      <div class="block-head">
        <h3>最新发布</h3>
        <router-link to="/list" class="more">全部 &rarr;</router-link>
      </div>
      <div class="card-list">
        <router-link v-for="l in recentListings" :key="l.id" :to="'/detail/' + l.id" class="card">
          <div class="card-img" :class="'img-' + l.type"></div>
          <div class="card-body">
            <span class="card-type">{{ TYPE_LABELS[l.type] }}</span>
            <span class="card-title">{{ l.title }}</span>
          </div>
          <span v-if="l.price" class="card-num">{{ l.price }}</span>
          <span v-if="l.reward" class="card-num">{{ l.reward }}</span>
        </router-link>
      </div>
    </div>

    <!-- hot -->
    <div class="block">
      <div class="block-head"><h3>热门推荐</h3></div>
      <div class="card-list">
        <router-link v-for="l in hotListings" :key="l.id" :to="'/detail/' + l.id" class="card">
          <div class="card-img" :class="'img-' + l.type"></div>
          <div class="card-body">
            <span class="card-type">{{ TYPE_LABELS[l.type] }}</span>
            <span class="card-title">{{ l.title }}</span>
          </div>
          <span v-if="l.price" class="card-num">{{ l.price }}</span>
          <span v-if="l.reward" class="card-num">{{ l.reward }}</span>
        </router-link>
      </div>
    </div>

    <!-- quick links -->
    <div class="quick-links">
      <router-link to="/publish" class="ql-btn ql-publish">发布信息</router-link>
      <router-link to="/message" class="ql-btn ql-msg">
        消息
        <span v-if="chat.totalUnread" class="ql-badge">{{ chat.totalUnread }}</span>
      </router-link>
      <router-link to="/profile" class="ql-btn ql-profile">收藏 {{ fav.count }}</router-link>
      <router-link to="/dashboard" class="ql-btn ql-dash">看板</router-link>
    </div>
  </section>
</template>

<style scoped>
.home { animation: slideUp 0.3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } }

/* ====== Banner ====== */
.banner {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #5b9bd5 0%, #7ab8f5 40%, #a0cff8 100%);
  border-radius: var(--radius-lg); padding: 28px 24px;
  color: #fff; margin-bottom: 14px;
}
.banner-content {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 14px;
}
.banner-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(255,255,255,0.25); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.4);
}
.banner h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.banner-meta { font-size: 13px; opacity: 0.85; }

.banner-decor { position: absolute; right: -20px; top: -20px; width: 160px; height: 160px; }
.decor-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); }
.c1 { width: 120px; height: 120px; top: 0; right: 0; }
.c2 { width: 80px; height: 80px; top: 40px; right: 60px; }
.c3 { width: 50px; height: 50px; top: 20px; right: 100px; }

/* ====== Safety ====== */
.safety {
  background: var(--warn-light); border-left: 3px solid var(--warn);
  border-radius: var(--radius-sm); padding: 10px 14px;
  font-size: 12px; color: #a08040; margin-bottom: 18px; line-height: 1.6;
}

/* ====== Type Cards — 2x2 ====== */
.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
}
.type-card {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 18px; border-radius: var(--radius-lg);
  text-decoration: none; color: var(--text); transition: all var(--transition);
  position: relative; overflow: hidden;
}
.type-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.tc-icon {
  font-size: 28px; width: 48px; height: 48px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.7); display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.tc-text { flex: 1; }
.tc-text strong { display: block; font-size: 15px; font-weight: 700; margin-bottom: 2px; }
.tc-text small { font-size: 12px; color: var(--text-light); }
.tc-arrow { font-size: 16px; color: var(--text-lighter); flex-shrink: 0; }

/* ====== Block ====== */
.block { margin-bottom: 22px; }
.block-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.block-head h3 { font-size: 15px; font-weight: 600; }
.more { font-size: 13px; color: var(--primary); text-decoration: none; }
.more:hover { text-decoration: underline; }

/* ====== Listing Cards ====== */
.card-list { display: flex; flex-direction: column; gap: 8px; }
.card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; background: var(--card-bg); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); text-decoration: none; color: var(--text);
  transition: all var(--transition);
}
.card:hover { transform: translateX(3px); box-shadow: var(--shadow-md); }

/* placeholder thumbnail images */
.card-img {
  width: 44px; height: 44px; border-radius: var(--radius-sm); flex-shrink: 0;
}
.img-trade  { background: linear-gradient(135deg, #c8e6c9, #a5d6a7); }
.img-lost   { background: linear-gradient(135deg, #bbdefb, #90caf9); }
.img-pintuan{ background: linear-gradient(135deg, #e1bee7, #ce93d8); }
.img-paotui { background: linear-gradient(135deg, #ffccbc, #ffab91); }

.card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.card-type {
  font-size: 11px; color: var(--primary); background: var(--primary-light);
  padding: 1px 6px; border-radius: 4px; display: inline-block; width: fit-content;
}
.card-title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-num { font-size: 14px; font-weight: 600; color: var(--danger); flex-shrink: 0; }

/* ====== Quick Links ====== */
.quick-links { display: flex; gap: 10px; }
.ql-btn {
  position: relative; flex: 1; text-align: center; padding: 11px 0;
  border-radius: var(--radius-full); font-size: 13px; font-weight: 500;
  text-decoration: none; transition: all var(--transition);
}
.ql-publish { background: var(--primary); color: #fff; }
.ql-publish:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.3); transform: translateY(-1px); }
.ql-msg, .ql-profile, .ql-dash { background: var(--card-bg); color: var(--text); box-shadow: var(--shadow-sm); }
.ql-msg:hover, .ql-profile:hover, .ql-dash:hover { background: #f0f4f8; }
.ql-badge {
  position: absolute; top: -4px; right: 6px; background: var(--danger);
  color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 8px;
}

/* ====== Desktop grid ====== */
@media (min-width: 769px) {
  .card-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

/* ====== Mobile ====== */
@media (max-width: 480px) {
  .banner { padding: 20px 16px; }
  .banner-avatar { width: 40px; height: 40px; font-size: 18px; }
  .banner h2 { font-size: 16px; }
  .type-grid { gap: 8px; }
  .type-card { padding: 16px 12px; }
  .tc-icon { width: 40px; height: 40px; font-size: 24px; }
  .tc-text strong { font-size: 14px; }
}
</style>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'

const route = useRoute()
const msgStore = useMessageStore()
const showSub = ref(false)

const categoryRoutes = ['/trade', '/lost-found', '/group-buy', '/errand'] as const
const isCategoryActive = computed(() => categoryRoutes.includes(route.path as any))

const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function onEnter() {
  if (hideTimer.value) { clearTimeout(hideTimer.value); hideTimer.value = null }
  showSub.value = true
}
function onLeave() {
  hideTimer.value = setTimeout(() => { showSub.value = false }, 150)
}
onUnmounted(() => {
  if (hideTimer.value) clearTimeout(hideTimer.value)
})
</script>

<template>
  <nav class="nav">
    <router-link to="/">首页</router-link>

    <div class="nav-drop" @mouseenter="onEnter" @mouseleave="onLeave">
      <router-link
        to="/list"
        class="drop-toggle"
        :class="{ 'router-link-active': isCategoryActive }"
      >
        列表
        <span class="arrow" :class="{ open: showSub }">▾</span>
      </router-link>

      <Transition name="drop">
        <div v-show="showSub" class="drop-menu">
          <router-link to="/trade">二手交易</router-link>
          <router-link to="/lost-found">失物招领</router-link>
          <router-link to="/group-buy">拼单搭子</router-link>
          <router-link to="/errand">跑腿委托</router-link>
        </div>
      </Transition>
    </div>

    <router-link to="/publish">发布</router-link>
    <router-link to="/message">
      消息
      <span v-if="msgStore.totalUnread > 0" class="nav-badge">{{ msgStore.totalUnread }}</span>
    </router-link>
    <router-link to="/user">我的</router-link>
  </nav>
</template>

<style scoped>
.nav {
  display: flex; gap: 2px; margin-bottom: 20px; padding: 3px;
  background: var(--card-bg); border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm); width: fit-content;
}
.nav a {
  position: relative; text-decoration: none; color: var(--text-light);
  padding: 6px 14px; border-radius: var(--radius-full);
  font-size: 13px; font-weight: 500; white-space: nowrap;
  transition: all var(--transition);
}
.nav a:hover { color: var(--text); background: var(--bg); }
.nav a.router-link-active {
  color: #fff; background: var(--primary);
  box-shadow: 0 2px 6px rgba(91,155,213,0.35);
}
.nav-badge { position: absolute; top: 0; right: 2px; background: var(--danger); color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 8px; min-width: 14px; text-align: center; line-height: 14px; }

/* 下拉 */
.nav-drop { position: relative; }
.drop-toggle { display: inline-flex; align-items: center; gap: 3px; cursor: pointer; }
.arrow { font-size: 10px; transition: transform 0.2s ease; }
.arrow.open { transform: rotate(180deg); }

.drop-menu {
  position: absolute; top: 100%; left: 0; z-index: 100;
  margin-top: 6px; padding: 4px;
  background: var(--card-bg); border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; gap: 2px; min-width: 120px;
}
.drop-menu a {
  display: block; padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 13px; color: var(--text);
}
.drop-menu a:hover { background: var(--bg); }
.drop-menu a.router-link-active { color: var(--primary); background: var(--primary-light); box-shadow: none; }

/* 过渡动画 */
.drop-enter-active, .drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>

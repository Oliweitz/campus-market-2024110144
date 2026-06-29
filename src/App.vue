<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import AppNav from '@/components/AppNav.vue'

const itemStore = useItemStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const totalCount = computed(() => itemStore.items.length)
const activeCount = computed(() => itemStore.items.filter((i) => i.status === '进行中').length)
const completedCount = computed(() => itemStore.items.filter((i) => i.status === '已完成').length)
const campusCount = computed(() => new Set(itemStore.items.map((i) => i.campus)).size)

onMounted(async () => {
  await userStore.init()
  await itemStore.fetchItems()
})
</script>

<template>
  <main class="app">
    <AppHeader />
    <AppNav />

    <router-link to="/dashboard" class="stats-bar">
      <div class="sb-item">
        <span class="sb-num">{{ totalCount }}</span>
        <span class="sb-label">信息总数</span>
      </div>
      <div class="sb-divider"></div>
      <div class="sb-item">
        <span class="sb-num">{{ activeCount }}</span>
        <span class="sb-label">进行中</span>
      </div>
      <div class="sb-divider"></div>
      <div class="sb-item">
        <span class="sb-num">{{ completedCount }}</span>
        <span class="sb-label">已完成</span>
      </div>
      <div class="sb-divider"></div>
      <div class="sb-item">
        <span class="sb-num">{{ campusCount }}</span>
        <span class="sb-label">覆盖校区</span>
      </div>
    </router-link>

    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <router-link v-if="cartStore.totalCount > 0" to="/user" class="cart-float">
      <span class="cart-float-icon">🛒</span>
      <span class="cart-float-badge">{{ cartStore.totalCount }}</span>
    </router-link>
  </main>
</template>

<style>
:root {
  --primary: #5b9bd5;
  --primary-light: #e8f2fa;
  --primary-grad: linear-gradient(135deg, #5b9bd5, #7ab8f5);
  --success: #6dbd7a;
  --success-light: #eaf5ec;
  --danger: #e88c8c;
  --danger-light: #fdf0f0;
  --warn: #d4a853;
  --warn-light: #fdf6e8;
  --bg: #f7f8fa;
  --card-bg: #ffffff;
  --text: #4a4a4a;
  --text-light: #9a9a9a;
  --text-lighter: #c0c0c0;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 24px;
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --font-base: 14px;
  --font-sm: 13px;
  --font-xs: 11px;
  --font-lg: 18px;
  --page-width: 1200px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--font-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 { margin: 0; line-height: 1.3; }
a { color: inherit; }
input, select, textarea, button { font-family: inherit; font-size: inherit; }
</style>

<style scoped>
.app { max-width: var(--page-width); margin: 0 auto; padding: 28px 32px 60px; }

.stats-bar {
  display: flex; align-items: center; gap: 0;
  background: linear-gradient(135deg, #e3f2fd, #f0f7ff);
  border-radius: var(--radius-lg); padding: 20px 16px;
  text-decoration: none; box-shadow: var(--shadow-sm);
  transition: all var(--transition); margin-bottom: 14px;
}
.stats-bar:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.sb-item { flex: 1; text-align: center; }
.sb-num { display: block; font-size: 24px; font-weight: 800; color: var(--primary); }
.sb-label { font-size: 12px; color: var(--text-light); }
.sb-divider { width: 1px; height: 36px; background: rgba(91,155,213,0.2); }

.cart-float {
  position: fixed; right: 24px; bottom: 24px; z-index: 50;
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--primary-grad); box-shadow: 0 4px 20px rgba(91,155,213,0.4);
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; transition: all var(--transition);
  animation: floatIn 0.3s ease;
}
.cart-float:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(91,155,213,0.5); }
.cart-float-icon { font-size: 24px; }
.cart-float-badge {
  position: absolute; top: -2px; right: -2px;
  background: var(--danger); color: #fff; font-size: 11px; font-weight: 700;
  min-width: 20px; height: 20px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; padding: 0 4px;
}
@keyframes floatIn { from { opacity: 0; transform: translateY(12px) scale(0.8); } }

.page-enter-active, .page-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .app { padding: 20px 16px 48px; }
  .sb-num { font-size: 20px; }
  .stats-bar { padding: 16px 10px; }
}
@media (max-width: 480px) {
  .app { padding: 14px 10px 40px; }
  .sb-num { font-size: 16px; }
  .sb-label { font-size: 10px; }
  .stats-bar { padding: 12px 6px; }
}
</style>

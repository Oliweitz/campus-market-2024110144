<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
const chat = useChatStore()
</script>

<template>
  <main class="app">
    <header class="header">
      <h1><router-link to="/dashboard" class="title-link">校园轻集市</router-link></h1>
      <p class="subtitle">AI 辅助前端工程实践种子项目</p>
    </header>

    <nav class="nav">
      <router-link to="/">首页</router-link>
      <router-link to="/list">列表</router-link>
      <router-link to="/publish">发布</router-link>
      <router-link to="/message">
        消息
        <span v-if="chat.totalUnread > 0" class="nav-badge">{{ chat.totalUnread }}</span>
      </router-link>
      <router-link to="/profile">我的</router-link>
      <router-link to="/dashboard">看板</router-link>
    </nav>

    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
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
.app {
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 28px 32px 60px;
}

.header { margin-bottom: 8px; }
.header h1 {
  font-size: 20px; font-weight: 600; color: var(--text); margin: 0;
}
.subtitle {
  font-size: 13px; color: var(--text-lighter); margin: 4px 0 0;
}

/* ---- 导航栏 ---- */
.nav {
  display: flex;
  gap: 4px;
  margin: 18px 0 24px;
  padding: 4px;
  background: var(--card-bg);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.nav a {
  position: relative;
  text-decoration: none;
  color: var(--text-light);
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition);
}
.nav a:hover {
  color: var(--text);
  background: var(--bg);
}
.nav a.router-link-active {
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 6px rgba(91,155,213,0.35);
}
.nav-badge {
  position: absolute;
  top: 2px; right: 4px;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
  line-height: 14px;
}

.title-link { text-decoration: none; color: inherit; }

/* page transition */
.page-enter-active, .page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }

/* ====== 平板 ====== */
@media (max-width: 768px) {
  .app {
    padding: 20px 16px 48px;
  }
  .nav a {
    padding: 7px 14px;
    font-size: 13px;
  }
}

/* ====== 手机 ====== */
@media (max-width: 480px) {
  .app {
    padding: 14px 10px 40px;
  }
  .header h1 { font-size: 18px; }
  .subtitle { display: none; }
  .nav {
    gap: 0;
    margin: 12px 0 18px;
  }
  .nav a {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>

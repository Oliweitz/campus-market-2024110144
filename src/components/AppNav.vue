<script setup lang="ts">
import { useMessageStore } from '@/stores/messageStore'

const msgStore = useMessageStore()
</script>

<template>
  <nav class="nav">
    <router-link to="/">首页</router-link>
    <router-link to="/list">列表</router-link>
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
  box-shadow: var(--shadow-sm); overflow-x: auto;
  -webkit-overflow-scrolling: touch; width: fit-content;
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
</style>

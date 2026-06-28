<script setup lang="ts"></script>

<template>
  <main class="app">
    <h1><router-link to="/dashboard" class="title-link">校园轻集市</router-link></h1>
    <p>AI 辅助前端工程实践种子项目</p>

    <nav class="nav">
      <router-link to="/">首页</router-link>
      <router-link to="/list">列表</router-link>
      <router-link to="/publish">发布</router-link>
      <router-link to="/message">消息</router-link>
      <router-link to="/profile">我的</router-link>
      <router-link to="/dashboard">看板</router-link>
    </nav>

    <RouterView />
  </main>
</template>

<style scoped>
.app {
  padding: 32px;
}

.nav {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5e5;
}

.nav a {
  text-decoration: none;
  color: #333;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav a:hover {
  background: #f0f0f0;
}

.nav a.router-link-active {
  color: #409eff;
  font-weight: bold;
}

.title-link {
  text-decoration: none;
  color: inherit;
}
</style>
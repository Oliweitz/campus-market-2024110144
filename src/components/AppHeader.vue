<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="header">
    <h1><router-link to="/" class="title-link">校园轻集市</router-link></h1>
    <div class="header-user">
      <template v-if="userStore.isLoggedIn">
        <span class="hu-avatar">{{ userStore.nickname[0] }}</span>
        <span class="hu-name">{{ userStore.nickname }}</span>
        <button class="hu-logout" @click="handleLogout">退出</button>
      </template>
      <router-link v-else to="/login" class="hu-login">登录</router-link>
    </div>
  </header>
</template>

<style scoped>
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.header h1 { font-size: 20px; font-weight: 600; color: var(--text); margin: 0; }
.title-link { text-decoration: none; color: inherit; }

.header-user { display: flex; align-items: center; gap: 8px; }
.hu-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--primary-grad); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.hu-name { font-size: 13px; font-weight: 500; color: var(--text); }
.hu-logout { background: none; border: 1px solid #e0e0e0; border-radius: var(--radius-full); padding: 4px 12px; font-size: 12px; color: var(--text-light); cursor: pointer; transition: all var(--transition); }
.hu-logout:hover { border-color: var(--danger); color: var(--danger); }
.hu-login { text-decoration: none; font-size: 13px; font-weight: 500; color: var(--primary); padding: 6px 16px; border: 1px solid var(--primary); border-radius: var(--radius-full); transition: all var(--transition); }
.hu-login:hover { background: var(--primary); color: #fff; }
</style>

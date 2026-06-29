<template>
  <section class="login-page">
    <div class="login-card">
      <h1>登录</h1>
      <p class="sub">登录校园轻集市，开始交易之旅</p>

      <div v-if="userStore.error" class="error-msg">{{ userStore.error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="fg">
          <label>用户名</label>
          <input
            v-model="form.username"
            class="in"
            placeholder="请输入用户名（拼音）"
            autocomplete="username"
          />
        </div>
        <div class="fg">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            class="in"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="userStore.loading">
          {{ userStore.loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="switch">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </p>

      <div class="demo-hint">
        <p>演示账号：</p>
        <div class="demo-accounts">
          <button
            v-for="acc in demoAccounts"
            :key="acc.username"
            class="demo-btn"
            @click="fillDemo(acc)"
          >
            {{ acc.label }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'

const router = useRouter()
const userStore = useUserStore()
const favStore = useFavoriteStore()
const msgStore = useMessageStore()

const form = reactive({ username: '', password: '' })

const demoAccounts = [
  { label: '张三', username: 'zhangsan', password: '123456' },
  { label: '李四', username: 'lisi', password: '123456' },
  { label: '王五', username: 'wangwu', password: '123456' },
]

function fillDemo(acc: { username: string; password: string }) {
  form.username = acc.username
  form.password = acc.password
}

async function handleLogin() {
  if (!form.username.trim() || !form.password.trim()) {
    userStore.error = '请输入用户名和密码'
    return
  }
  const ok = await userStore.login(form.username.trim(), form.password)
  if (ok) {
    await Promise.all([
      favStore.fetchFavorites(),
      msgStore.fetchConversations(),
    ])
    router.push('/')
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.login-card {
  width: 400px;
  max-width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  box-shadow: var(--shadow-md);
}

.login-card h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 600;
}

.sub {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--text-light);
}

.error-msg {
  padding: 10px 14px;
  background: var(--danger-light);
  color: var(--danger);
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 16px;
}

.fg {
  margin-bottom: 16px;
}

.fg label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

.in {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition);
  box-sizing: border-box;
}

.in:focus {
  border-color: var(--primary);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(91, 155, 213, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
}

.switch a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.switch a:hover {
  text-decoration: underline;
}

.demo-hint {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.demo-hint p {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-lighter);
}

.demo-accounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: var(--radius-full);
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: var(--text);
  transition: all var(--transition);
}

.demo-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}
</style>

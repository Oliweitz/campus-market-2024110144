<template>
  <section class="reg-page">
    <div class="reg-card">
      <h1>注册</h1>
      <p class="sub">创建你的校园轻集市账号</p>

      <div v-if="userStore.error" class="error-msg">{{ userStore.error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="fg">
          <label>用户名</label>
          <input
            v-model="form.username"
            class="in"
            placeholder="建议使用姓名拼音，如 zhangsan"
            autocomplete="username"
          />
        </div>
        <div class="fg">
          <label>昵称</label>
          <input
            v-model="form.nickname"
            class="in"
            placeholder="在平台上显示的名称"
          />
        </div>
        <div class="fg">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            class="in"
            placeholder="至少6位"
            autocomplete="new-password"
          />
        </div>
        <div class="fg-row">
          <div class="fg">
            <label>学院</label>
            <input v-model="form.college" class="in" placeholder="如：计算机学院" />
          </div>
          <div class="fg">
            <label>校区</label>
            <select v-model="form.campus" class="in">
              <option value="">请选择</option>
              <option>南校区</option>
              <option>北校区</option>
              <option>东校区</option>
              <option>西校区</option>
            </select>
          </div>
        </div>
        <div class="fg">
          <label>角色</label>
          <select v-model="form.role" class="in">
            <option value="学生">学生</option>
            <option value="教职工">教职工</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="userStore.loading">
          {{ userStore.loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="switch">
        已有账号？
        <router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  nickname: '',
  password: '',
  college: '',
  campus: '',
  role: '学生',
})

async function handleRegister() {
  if (!form.username.trim() || !form.password.trim() || !form.nickname.trim()) {
    userStore.error = '请填写用户名、昵称和密码'
    return
  }
  if (form.password.length < 6) {
    userStore.error = '密码至少6位'
    return
  }
  const ok = await userStore.register({
    username: form.username.trim(),
    nickname: form.nickname.trim(),
    password: form.password,
    college: form.college.trim(),
    campus: form.campus,
    role: form.role,
  })
  if (ok) {
    router.push('/')
  }
}
</script>

<style scoped>
.reg-page {
  display: flex;
  justify-content: center;
  padding-top: 30px;
}

.reg-card {
  width: 440px;
  max-width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 32px 30px;
  box-shadow: var(--shadow-md);
}

.reg-card h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 600;
}

.sub {
  margin: 0 0 20px;
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
  margin-bottom: 14px;
}

.fg label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

.fg-row {
  display: flex;
  gap: 12px;
}

.fg-row .fg {
  flex: 1;
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
  margin-top: 6px;
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
</style>

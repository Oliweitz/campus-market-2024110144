import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Element Plus (按需引入基础样式，组件在页面中按需导入)
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

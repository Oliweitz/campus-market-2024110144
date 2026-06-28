# AI Collaboration Card

## 协作记录

### 1. 项目背景了解

- **Prompt**：这个项目是干什么的
- **AI 输出**：项目是《校园轻集市》Vue 3 前端课程种子仓库，包含技术栈和目录结构概览
- **理解**：确认了项目定位——教学用的 Vue 3 脚手架，主题是校园二手交易
- **结论**：项目骨架清晰，技术栈为 Vue 3 + TypeScript + Vite + Pinia + Vue Router

### 2. 项目目录分析

- **Prompt**：分析项目 src 目录结构
- **AI 输出**：逐目录解释 api/components/router/stores/views 的职责，以及 main.ts/App.vue 的入口角色
- **理解**：Vue 应用启动链路为 main.ts → createApp → use(Pinia) → use(Router) → mount(#app)；App.vue 通过 RouterView 渲染页面
- **结论**：这是一个标准的 Vue 3 单页应用骨架，分层明确

### 3. 证据卡编写

- **Prompt**：按 Day1 实验手册要求编写证据卡
- **AI 输出**：结构化的 Daily Evidence，覆盖 7 个 Task
- **修改**：对照实验手册逐一核对，精简冗余表述，补充实验思考
- **结论**：AI 生成的结构可用，但需人工审核与补充

---

### 4. Day2 页面骨架批量生成

- **Prompt**：按 Day2 实验手册创建 7 大业务页面骨架
- **AI 输出**：并行创建 ListView / DetailView / PublishView / MessageView / ProfileView / DashboardView 共 6 个新页面，每个页面包含 `<script setup lang="ts">`、`<template>`、`<style scoped>` 三段式结构
- **修改**：人工审核页面命名和内容描述是否匹配业务场景
- **结论**：AI 批量生成骨架页面效率极高，但需人工确认页面职责划分清晰

### 5. Day2 路由系统配置

- **Prompt**：在 `src/router/index.ts` 中新增 7 条路由，`/detail/:id` 带动态参数
- **AI 输出**：完整路由配置，首页直接引入、其余页面懒加载，Detail 路由使用 `:id` 占位符
- **修改**：无修改，一次通过
- **结论**：路由配置是高度结构化的模板工作，AI 输出准确率很高

### 6. Day2 导航栏构建

- **Prompt**：在 App.vue 中实现 5 个入口的页面导航
- **AI 输出**：`<nav>` + `<router-link>` 结构，含 hover/active 样式
- **修改**：初次遗漏看板页入口——导航栏只有 5 个链接，`/dashboard` 路由无 UI 入口可达
- **结论**：AI 会严格按 Prompt 执行（Prompt 只列了 5 个入口），遗漏需要人工发现。后续 Prompt 应明确列出所有需要暴漏的页面入口

### 7. Day2 质量验证

- **Prompt**：运行 TypeScript 类型检查 + Vite 开发服务器验证
- **AI 输出**：`vue-tsc --noEmit` 零错误通过，Vite 正常启动，所有路由可解析
- **修改**：无修改
- **结论**：自动化验证环节 AI 执行效率高，结果可靠

---

> 后续协作记录按此格式追加。

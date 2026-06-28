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

### 4. Day2 页面骨架与路由导航

- **Prompt**：按 Day2 实验手册创建 7 个业务页面 + 路由 + 导航
- **AI 输出**：一次性创建 6 个新页面 + 7 条路由 + App.vue 导航栏，TypeScript 编译零错误
- **修改**：初次遗漏看板页导航入口，后续补充；ListView 下拉筛选取代最初列表
- **结论**：骨架阶段 AI 输出效率极高，结构正确，但需人工检查 UI 可达性

### 5. 四分类业务场景扩展

- **Prompt**：按需求文档将列表页改造为二手交易/失物招领/拼单搭子/跑腿委托四分类下拉筛选
- **AI 输出**：创建 `data/listings.ts` 共享数据层（13 条完整字段），重构 ListView/DetailView 支持四种类型差异化渲染
- **修改**：多次迭代字段设计，补齐 campus/status/publishTime/deadline 等遗漏字段
- **结论**：数据模型设计应前置，边写边改效率低

### 6. 购物车与订单系统

- **Prompt**：实现加入购物车、库存管理、购买、订单记录、库存归零自动撤下
- **AI 输出**：cart/orders 两个 Pinia Store，购物车悬浮窗，profile 页订单列表
- **修改**：Buy 后需联动订单记录+库存扣减+状态更新，经多轮补全
- **结论**：跨 Store 联动逻辑需要显式 Prompt，AI 倾向于只做当前 Store 的改动

### 7. 消息系统

- **Prompt**：消息页从空白开始，通过详情页点击用户名动态创建联系人，支持发送+模拟自动回复+未读计数
- **AI 输出**：chat Store 含 ensureContact/sendMessage/markRead，MessageView 左右分栏布局，模拟回复 800ms 延迟
- **修改**：最初预置了联系人数据，按要求改为动态添加；补充最后消息预览
- **结论**：消息系统状态管理复杂，Store 封装后视图层很薄

### 8. 拼单/跑腿参与和撤回

- **Prompt**：拼单参与后人数+1、跑腿接单后撤下、退出后恢复、拼单满员自动完成
- **AI 输出**：mylist Store 联动 listings Store 的 incrementCount/updateStatus，DetailView 区分发布者/浏览者两套按钮
- **修改**：退出跑腿后需恢复列表状态，该逻辑在多轮迭代后补齐
- **结论**：状态流转（active↔closed↔completed）是 Day2 最复杂逻辑，需画状态图才能不遗漏

### 9. 发布、收藏与看板

- **Prompt**：发布页四种类型动态表单、收藏功能、看板数据统计
- **AI 输出**：PublishView 完整表单框架（发布后写入 listStore 并跳转）、favorites Store、DashboardView 动态柱状图
- **修改**：发布初始只弹 toast，后改为真正写入数据；去除了全项目 Emoji
- **结论**：表单+列表+详情的闭环是验证框架完整性的关键

### 10. Bug 修复与构建验证

- **关键 Bug**：ProfileView `@click="/* TODO */"` 导致 Vue 模板编译失败（注释在表达式位置非法）
- **其他修复**：`v-if` 重复 class、`</ul>` 闭合错误、`\\u00a5` 转义问题
- **结论**：`vue-tsc` 不检查模板语法，`pnpm build-only` 才是最终验证手段

---

> 后续协作记录按此格式追加。

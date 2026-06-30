# Day3 Evidence — Mock 数据建模与列表渲染

## 1. 今日完成内容

完成了校园轻集市的 Mock 数据建模、JSON Server 接口模拟和四类业务的列表渲染。在 `db.json` 中设计了包含 users、items、favorites、conversations、messages、notices 六类资源的完整 Mock 数据库，准备了 20+ 条贴近校园生活的示例数据。搭建了 JSON Server Mock 服务（`npm run mock`），配置了 Vite proxy 实现前后端分离开发。封装了 Axios 请求层（http.ts）和 5 个领域 API 模块。实现了四类业务页面的数据驱动列表渲染——TradeView（二手交易）、LostFoundView（失物招领）、GroupBuyView（拼单搭子）、ErrandView（跑腿委托），以及首页四分类卡片跳转。完成了用户认证体系（登录、注册、登录态持久化）和客户端状态持久化（购物车、订单、参与记录的 localStorage 自动同步）。

## 2. 数据字段设计

| 业务类型 | 数据标识 | 核心字段 | 设计理由 |
|---|---|---|---|
| 二手交易 | type=secondhand | price、condition、category、location、stock、allowBargain | 买家需要知道价格、成色、分类和交易地点，库存和砍价支持是交易流程的必需字段 |
| 失物招领 | type=lostfound | lostOrFound、itemName、eventTime、itemFeature、location | 需要区分寻物/招领，物品名称和特征描述是认领的关键线索，发生时间和地点帮助缩小范围 |
| 拼单搭子 | type=group | targetCount、currentCount、deadline、location | 目标人数和当前人数计算拼单进度，截止时间决定是否还能参与 |
| 跑腿委托 | type=errand | reward、taskPlace、expectedTime、from、to、taskType | 酬劳是接单的核心驱动力，取送路线决定是否顺路，任务类型区分体力要求 |
| 用户 | users | username、password、nickname、college、campus、creditScore | 用户名密码用于认证，昵称院系校区展示身份，信用分预留评价体系 |

字段设计原则：打开页面的人看到这行数据，能否做出判断？比如看到二手商品有价格、成色、地点，就能决定要不要联系卖家。看到拼单有目标人数、当前人数、截止时间，就能判断还能不能参与。如果一个字段对决策没有帮助，那它就不是必要的。

## 3. 数据流与持久化设计

数据存储采用三层策略：

| 存储层 | 技术 | 职责 | 示例 |
|---|---|---|---|
| JSON Server | db.json → REST API | 核心业务数据，跨会话持久化 | 商品信息、收藏、消息、用户 |
| localStorage | 浏览器本地存储 | 客户端状态，与当前用户绑定 | 登录态、购物车、参与记录 |
| Pinia Store | 运行时内存 | 跨组件共享的临时状态 | 当前列表、筛选条件、加载状态 |

数据流向：用户操作 → 页面组件 → Pinia Store（更新缓存）→ API 层（Axios）→ JSON Server（写入 db.json）。列表页通过 `onMounted` 触发 `fetchItems()`，Store 从 API 获取数据后更新响应式缓存，组件自动重渲染。四类业务页面各自通过 `computed` 从统一的 `itemStore.items` 中按 type 过滤数据，保证单一数据源，发布新信息后所有页面自动同步。

持久化策略：给 cart、orders 等 Store 加 `watch` 监听，数据变更时自动 `JSON.stringify` 写入 localStorage，初始化时恢复。用户刷新页面不会丢失购物车内容和操作记录。

## 4. AI 协作记录

- **使用工具**：Claude Code
- **核心提示词**：要求设计 db.json Mock 数据结构、封装 Axios API 层、实现四类业务列表页的数据驱动渲染、搭建用户认证体系
- **AI 生成内容**：db.json 完整数据结构（6 类资源 + 示例数据）、5 个 API 模块（TypeScript 接口 + 请求方法）、4 个业务列表页完整代码、登录注册页面、userStore 认证逻辑、ItemCard 等展示组件
- **AI 生成内容审查**：
  - AI 生成了两套并行的数据模型——四个独立集合（trades/lostFounds/groupBuys/errands）和统一 items 集合，导致数据不一致
  - Mock 数据内容偏通用化（手机壳、充电宝），缺乏校园场景辨识度
  - 多处字段命名不统一（createTime、publishTime、postTime 混用）
  - userStore 的 init() 方法在 API 失败时会清除登录态，容错性差
  - 购物车等 Store 缺少持久化，刷新即丢失

## 5. 人工调整内容

1. **统一数据模型**：放弃两套数据模型并存方案，彻底统一到 `items` 单一集合，通过 `type` 字段区分四类业务，清理了四个不再使用的独立集合和 API 文件
2. **替换 Mock 数据内容**：将 AI 生成的通用数据全部替换为校园场景——机械键盘、折叠书桌、LED 台灯、寻找钱包和 U 盘、奶茶火锅拼单、代取快递、搬宿舍行李
3. **字段命名统一**：全项目时间字段统一为 `createdAt` 和 `updatedAt`，状态值统一为 `进行中 / 已完成 / 已关闭` 三个中文值
4. **修复数据一致性**：四个业务页面全部改为从 itemStore 获取数据，利用 computed 自动响应，发布新信息后所有页面自动同步
5. **修复登录态容错**：userStore 的 init() 在 API 失败时不再清除登录态，改为静默忽略错误，保留本地缓存，后台重试
6. **修复模板编译错误**：AI 在 `<template v-else>` 内嵌套 `<template v-if>` 导致编译失败，将条件判断移到普通 `<div>` 上
7. **补全持久化**：给 cart、orders 等 Store 添加 watch 自动持久化到 localStorage
8. **样式对齐**：将组件中硬编码的颜色值全部替换为 CSS 变量，统一使用 `var(--primary)`、`var(--danger)` 等形式
9. **命名对齐规范**：request.ts → http.ts，ProfileView → UserCenterView，/lostfound → /lost-found，/groupbuy → /group-buy
10. **组件抽取补全**：创建 AppHeader.vue、AppNav.vue、AppLayout.vue 拆分 App.vue，补全 FormField.vue、LoadingState.vue、ErrorState.vue、SearchBar.vue 等工具组件

## 6. 测试记录

1. 执行 `npm run mock` 启动 JSON Server，访问 `http://localhost:3000/items` 确认返回 20+ 条 JSON 数据
2. 访问 `http://localhost:3000/users`、`/favorites`、`/conversations`、`/messages`、`/notices` 确认各资源接口正常
3. 执行 `npm run dev` 启动前端，访问 `/trade` 确认二手商品列表正常渲染，卡片显示标题、价格、成色、地点
4. 访问 `/lost-found` 确认失物招领列表区分丢失和拾获
5. 访问 `/group-buy` 确认拼单列表显示进度（当前人数/目标人数）
6. 访问 `/errand` 确认跑腿列表显示酬劳和路线
7. 使用 `zhangsan / 123456` 登录，确认登录成功、昵称显示正确
8. 刷新页面，确认登录态保持、购物车数据不丢失
9. 执行 `pnpm build-only` 确认项目可正常构建，无类型错误和模板编译错误

## 7. 遇到的问题与解决方法

| 问题 | 原因 | 解决方法 |
|---|---|---|
| 四类页面和列表页数据不一致 | 四个独立集合与统一 items 集合并存，字段结构不同（publishTime vs createdAt，publisher vs publisherId） | 所有视图统一接入 itemStore，以 items 为单一数据源 |
| 刷新后登录态丢失 | userStore.init() 在 API 失败时调用 logout() 清除 localStorage | API 失败时静默忽略，保留本地缓存，后台重试 |
| `<template v-else>` 嵌套 `<template v-if>` 导致页面加载失败 | Vue 模板编译器不支持此写法 | 条件判断移到普通 `<div>` 标签上 |
| 购物车数据刷新丢失 | cart、orders Store 纯内存状态 | 添加 watch 自动写入 localStorage，初始化时恢复 |
| 发布页和消息页在未登录时报错 | currentUserId 为 null 时访问其属性 | 添加登录引导，未登录时显示提示而非报错 |
| 拼单页面缺少进度条可视化 | AI 只显示了数字 | 补充进度条组件，直观展示拼单完成度 |

## 8. 今日反思

Day3 是项目从"静态骨架"变成"活的应用"的关键一天。Mock 数据建模让前端不依赖后端就能独立开发和验证——但数据的质量完全取决于开发者自己的判断：贴不贴业务、全不全面、好不好用。JSON Server 给了我们一个零配置的 API 环境，但真正的挑战在于想清楚"我要什么数据、怎么组织、每个字段服务于什么功能"。

最有收获的是踩坑和修坑的过程。数据不一致问题让我重新理解了单一数据源的价值——当同一份数据有多个来源时，bug 不是可能产生，而是一定会产生。登录态持久化的修复让我意识到容错设计的重要性——API 不可用时不应该惩罚用户。这些都不是看教程能学到的，只能靠实际踩坑。

代码不是写得越多越好，而是越少越好——在功能完整的前提下，文件少、集合少、命名一致、结构清晰，才是好的工程状态。Day3 的探索和试错是必要的，但一旦找到了更好的方案，就应该果断清理旧痕迹。

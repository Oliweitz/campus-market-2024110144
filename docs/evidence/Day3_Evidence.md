# Day3 Evidence — Mock 数据建模与列表渲染

## 1. 今日完成内容

本日完成了校园轻集市项目从「静态页面」到「数据驱动页面」的关键升级，涵盖 Mock 数据建模、JSON Server 接口模拟、API 封装、列表渲染、用户认证系统和数据持久化。具体包括：

### 1.1 Mock 数据与接口
- 在 `db.json` 中设计了 `trades`、`lostFounds`、`groupBuys`、`errands` 四个独立数据集合，每类 5-6 条贴近校园场景的 Mock 数据
- 统一 `items` 集合与四个独立集合保持数据一致（同一批商品，不同字段结构），确保列表页、专属页、详情页数据互通
- 创建了四个业务 API 模块：`src/api/trade.ts`、`lostFound.ts`、`groupBuy.ts`、`errand.ts`

### 1.2 组件与页面
- 创建了通用列表卡片组件 `ItemCard.vue` 和空状态组件 `EmptyState.vue`
- 创建了四个独立业务页面：`TradeView.vue`、`LostFoundView.vue`、`GroupBuyView.vue`、`ErrandView.vue`
- 四个页面通过 Pinia `itemStore` 获取数据，发布新信息后自动同步，无需手动刷新
- 首页分类卡片跳转至对应专属页面，导航栏保持简洁

### 1.3 用户认证系统
- 为 `db.json` 中现有用户添加了统一的账号格式（姓名拼音 + 密码 `123456`）：
  - 张三 → `zhangsan / 123456`
  - 李四 → `lisi / 123456`
  - 王五 → `wangwu / 123456`
- 创建了 `LoginView.vue`（含演示账号一键填充）和 `RegisterView.vue`（含用户名查重）
- 重写 `userStore`：支持 `login()`、`register()`、`logout()`，去掉旧的自动登录逻辑
- 登录态通过 localStorage 持久化，刷新页面不丢失；未登录时发布页和消息页显示登录引导

### 1.4 数据持久化
- 购物车（`cart`）、订单记录（`orders`）、拼单/跑腿参与（`mylist`）全部接入 localStorage
- 每次数据变更通过 `watch` 自动写入 localStorage，初始化时从 localStorage 恢复
- 用户登录信息额外缓存昵称/校区/学院，刷新后 UI 秒级恢复，后台静默刷新完整数据

## 2. Mock 数据结构说明

| 数据集合 | 对应业务 | 主要字段 | 页面用途 |
|---|---|---|---|
| `trades` | 二手交易 | title、category、price、condition、location、publisher、publishTime、status、description | 展示二手商品列表，显示价格和成色 |
| `lostFounds` | 失物招领 | title、type(lost/found)、itemName、location、eventTime、contact、status、description | 展示丢失和拾获物品信息 |
| `groupBuys` | 拼单搭子 | title、type、targetCount、currentCount、deadline、location、publisher、status、description | 展示拼单进度和参与情况 |
| `errands` | 跑腿委托 | title、taskType、reward、from、to、deadline、publisher、status、description | 展示跑腿任务和酬劳信息 |
| `users` | 用户 | username、password、nickname、college、campus、role、creditScore | 登录注册、身份管理 |

## 3. 我的设计

### 3.1 数据字段设计

**二手交易（trades）**：需要 `price` 和 `condition` 字段，因为二手交易的核心是价格和成色，买家需要了解物品的新旧程度来判断性价比。`category` 用于分类浏览，`location` 用于判断交易地点是否方便。

**失物招领（lostFounds）**：需要 `type` 字段区分「丢失」和「拾获」两种场景。`itemName` 是失物的核心标识，`eventTime` 是丢失或拾获的发生时间，`contact` 提供联系方式。

**拼单搭子（groupBuys）**：`targetCount` 和 `currentCount` 是最核心的字段，用来展示拼单进度（如 3/6 人）。`deadline` 是拼单截止时间，对于有时间限制的拼单活动非常重要。

**跑腿委托（errands）**：`from`、`to` 描述取送路线，这是跑腿任务最关键的路径信息。`reward` 是酬劳金额，`taskType` 区分任务类型（取快递/代买/打印等）。

### 3.2 账号体系设计

采用统一的账号格式：**姓名拼音作为用户名，密码统一为 `123456`**。这种格式简单易记，适合教学演示场景。注册新用户时自动分配 80 分信用分。

### 3.3 持久化策略

区分两类数据采用不同持久化方式：业务数据（商品、收藏、消息）通过 JSON Server 写入 `db.json`；客户端状态（购物车、订单、登录态、参与记录）通过 localStorage 持久化。登录信息额外缓存昵称等展示字段，避免刷新后等待 API 响应导致的 UI 闪烁。

## 4. AI 设计

本日的 API 模块、组件、页面代码和认证系统在 AI 辅助下完成。AI 工具帮助生成了：

- 四个业务 API 模块的 TypeScript 接口定义和请求方法
- `ItemCard.vue` 通用卡片组件和 `EmptyState.vue` 空状态组件
- 四个业务页面的完整代码（数据请求 + 列表渲染 + 状态处理）
- 登录/注册页面的表单设计和验证逻辑
- userStore 的登录/注册/登出/持久化逻辑
- localStorage 自动持久化方案（`watch` + `JSON.stringify`）

AI 生成内容中的优点：
- TypeScript 类型定义完整准确
- 代码结构清晰，职责分离
- 错误处理和加载状态覆盖全面
- 注册时自动进行用户名查重

我在审查过程中发现并修正的问题：
- AI 初版未做发布页和消息页的登录保护，我添加了未登录引导
- AI 生成的 `init()` 在 API 失败时直接 `logout()` 清除登录态，我改为静默忽略以容忍 JSON Server 暂时不可用
- AI 用了 `<template v-else>` 嵌套多层 `<template v-if>`，导致 Vue 模板编译器解析异常、整个页面无法加载，我改为 `v-if`/`v-else` 放在普通 `<div>` 上的稳定写法
- AI 生成的拼单页面缺少进度条，我补充了可视化进度条
- 四个页面初始各自调用 API，发布新信息后不同步；我改为统一走 Pinia store，利用 computed 自动响应

## 5. 最终调整

1. **Mock 数据调整**：审核替换了 AI 生成的不贴合校园场景的数据，全部替换为校园常见场景（教材、台灯、自行车、快递代取、拼餐、羽毛球搭子等）
2. **数据统一**：将四个独立集合和统一 `items` 集合的内容对齐，确保列表页、专属页、详情页看到同一批商品，ID 完全对应
3. **字段名称统一**：将 AI 生成的 `createTime` 统一为 `publishTime`，与发布场景一致
4. **状态值简化**：统一使用 `open/closed/done` 三种状态（独立集合）和 `进行中/已关闭/已完成`（统一集合），映射清晰
5. **样式对齐**：将组件样式中的硬编码颜色替换为项目 CSS 变量，保持设计系统一致
6. **未登录保护**：发布页和消息页在未登录时显示引导提示，避免因 `currentUserId` 为 null 导致的错误
7. **持久化补全**：购物车、订单、参与记录从纯内存改为 localStorage 持久化，刷新数据不丢失

## 6. 遇到的问题与解决方法

**问题 1：列表页与四个专属页数据不一致**

四个新页面请求独立集合（`/trades` 等），列表页请求统一集合（`/items`），两边数据完全不同。

**解决方法**：用脚本将四个独立集合与统一 `items` 的内容对齐，同一批商品映射为不同字段结构。同时将四个页面改为从 Pinia store 获取数据，发布新信息后所有页面自动同步。

**问题 2：刷新页面后登录态丢失**

`userStore.init()` 在 API 请求失败时直接调用 `logout()` 清除了 localStorage。

**解决方法**：修改 `init()` 的逻辑，API 失败时不清除登录态，仅静默忽略。同时登录时将昵称/校区/学院缓存到 localStorage 的另一 key 中，刷新后先用缓存数据撑起 UI，后台再静默刷新完整用户信息。

**问题 3：发布页和消息页点击导航无反应**

`<template v-else>` 内嵌套多层 `<template v-if>` 导致 Vue 模板编译器解析异常，组件加载失败，路由跳转被阻断。

**解决方法**：将所有 `v-if`/`v-else` 放在普通 `<div>` 元素上，避免在 `<template>` 上使用 `v-else` 与内部 `<template v-if>` 产生冲突。

**问题 4：购物车刷新后数据丢失**

购物车、订单、参与记录原本是纯 Pinia 内存状态，无任何持久化。

**解决方法**：给 `cart`、`orders`、`mylist` 三个 store 分别添加 `watch` 监听，数据变更时自动 `JSON.stringify` 写入 localStorage，初始化时从 localStorage 恢复。

## 7. 今日反思

Mock 数据建模、接口请求和列表渲染是前端从「静态页面」走向「数据驱动页面」的关键一步。通过本日实践，我深刻体会到：

**Mock 数据不是随便编几条测试内容**——它是对业务理解的体现。设计数据结构时，必须思考每个字段的用途：这个字段是给用户看的？还是给程序逻辑用的？字段命名是否清晰？数据是否贴近真实场景？

**JSON Server 作为 Mock API 的优势**在于它能快速将数据模型转化为可请求的 RESTful 接口，让前端开发不依赖真实后端即可完成完整的请求-响应-渲染链路验证。

**列表渲染是数据驱动页面的起点**——当页面内容从「写死在模板中」变为「通过接口请求获得」，项目的可扩展性就有了质的变化。

**认证系统是前后端协作的缩影**——即使使用 Mock API，登录/注册/登出的完整流程和 localStorage 持久化策略，已经与真实项目的用户模块非常接近。

**数据一致性是页面间互通的基石**——如果不同页面展示的数据来自不同数据源，用户体验会割裂。将四个专属页面接入 Pinia store，利用 `computed` 自动响应变化，既保证了数据一致性，又实现了实时同步。

Day3 的数据结构设计和认证系统为后续 Day4 的发布表单、Day5 的状态管理、Day6 的交互优化和 Day7 的综合验收打下了坚实的基础。

# Day2 Evidence — 页面骨架、路由导航与架构升级

## 1. 今日完成内容

Day2 分为上下半场。上半场完成了多页面骨架搭建和业务功能扩展：在已有 HomeView 基础上新增了 6 个页面（ListView、DetailView、PublishView、MessageView、UserCenterView、DashboardView），配置了 7 条路由（含动态参数路由 `/detail/:id`），实现了四分类业务场景的完整前端框架。数据层设计了统一的 Listing 接口和 13 条种子数据，用 Pinia Store 管理响应式状态。实现了列表筛选（分类、校区、状态）、购物车和订单系统、拼单/跑腿的参与退出逻辑。

下半场完成了从 Level 1（纯前端内存数据）到 Level 2（前端 + Mock API）的架构升级。搭建了 JSON Server Mock 服务，创建了含 6 类资源的 `db.json`，配置了 Vite proxy 将 `/api` 转发到 `localhost:3000`。创建了完整的 API 接口层（http.ts + 5 个领域模块）和工具函数层（date.ts、constants.ts、statistics.ts、mockReply.ts）。抽取了 8 个可复用组件（ItemCard、FilterBar、PublishForm、FavoriteButton、ChatBox、ChartPanel 等），将所有 Pinia Store 从操作内存数组改为调用 API 层。集成了 ECharts 看板，完成了响应式适配和 UI 设计系统（20+ CSS 变量）。

## 2. 路由与导航设计

| 路由路径 | 页面 | 说明 |
|---|---|---|
| `/` | HomeView | 首页，四分类入口卡片 |
| `/list` | ListView | 全部分类列表，支持筛选搜索 |
| `/detail/:id` | DetailView | 信息详情，动态路由参数 |
| `/publish` | PublishView | 发布新信息 |
| `/message` | MessageView | 消息中心 |
| `/user` | UserCenterView | 个人中心 |
| `/dashboard` | DashboardView | 数据看板 |

导航栏设计了六个入口（首页、列表、发布、消息、我的、看板），覆盖了校园轻集市的完整用户动线。Detail 路由使用 `:id` 动态参数，同一路由匹配所有信息详情，通过 `route.params.id` 区分具体条目。

## 3. 数据架构设计

### Level 1 阶段（内存数据）

- Pinia Store 直接操作内存数组，数据定义在 `data/listings.ts`
- 13 条种子数据覆盖四类业务，含公共字段（type、title、campus、status）和专属字段
- 跨组件通过 Store 共享响应式数据，修改一处影响全局

### Level 2 阶段（Mock API）

- JSON Server 读取 `db.json`，自动生成 RESTful 接口
- Vite proxy 将前端 `/api/*` 请求转发到 `http://localhost:3000/*`
- API 层分为 http.ts（Axios 实例 + 拦截器）和 5 个领域模块（itemApi、userApi、favoriteApi、messageApi、noticeApi）
- Store 层从操作内存改为调用 API → 更新缓存，新增 userStore 支持登录态持久化
- 工具函数层：date.ts（时间格式化）、constants.ts（API 地址和 localStorage 键名）、statistics.ts（类型校区状态统计）、mockReply.ts（模拟聊天回复）

### 数据流

```
用户操作 → 页面组件 → Pinia Store → API 层 → JSON Server → db.json
                                                ↓
                                          Pinia Store 更新缓存
                                                ↓
                                          UI 自动响应刷新
```

## 4. AI 协作记录

- **使用工具**：Claude Code
- **核心提示词**：要求搭建多页面 Vue3 项目骨架，配置 Vue Router，设计统一数据接口和 Pinia Store，搭建 JSON Server Mock 服务，封装 API 请求层
- **AI 生成内容**：7 个页面的完整 Vue 组件、路由配置、数据接口定义（Listing 类型）、4 个 Pinia Store、db.json 数据结构、5 个 API 模块、Vite proxy 配置、8 个可复用组件、ECharts 看板集成代码
- **AI 生成内容审查**：
  - AI 对拼单/跑腿的参与退出逻辑处理不够细致——满员自动完成、退出后状态恢复等边界情况需要手动补全
  - CSS 中大量使用硬编码颜色值，未使用 CSS 变量统一管理
  - 部分组件未做响应式适配，在移动端布局错乱
  - 购物车库存扣减逻辑未与 API 层联动，购买后数据不同步

## 5. 人工调整内容

1. **修复 ID 类型不匹配**：JSON Server 对种子数据返回字符串 id，对 POST 新建数据返回随机字符串 id。全链路 ID 比较从严格相等 `===` 改为宽松相等 `==`，`route.params.id` 保持字符串原样不做 Number() 转换
2. **修复 fetchById 缓存 bug**：原逻辑在缓存未命中时丢弃 API 获取的数据，修复为缓存没有时 push 加入
3. **CSS 变量统一**：将组件中散落的硬编码颜色值（`#2563eb`、`#ef4444` 等）全部替换为 CSS 变量（`var(--primary)`、`var(--danger)` 等），定义 20+ 变量覆盖主色、文字色、背景色、阴影、圆角、过渡
4. **响应式适配**：补充桌面 1200px、平板 768px、手机 480px 三个断点的媒体查询
5. **购物车持久化联动**：购买时通过 PATCH API 持久化扣减库存，库存归零显示红色已售罄但不移除
6. **组件抽取**：从 views 中抽出 8 个可复用组件，页面负责组织布局，组件负责具体交互
7. **Store 架构重构**：7 个 Pinia Store 全部从操作内存数组改为调用 API 层再更新缓存
8. **Element Plus 实验后回退**：尝试引入 Element Plus 后发现构建模块从 60 激增至 1620、CSS 从 6KB 增至 362KB，结论是轻量项目用原生组件更优，遂回退

## 6. 测试记录

1. 执行 `npm run mock` 启动 JSON Server，浏览器访问 `http://localhost:3000/items` 确认返回 JSON 数据
2. 执行 `npm run dev` 启动前端服务，访问 `http://localhost:5173` 确认首页正常
3. 依次点击导航栏六个入口，确认路由跳转正常、无 404
4. 访问 `/detail/1` 确认详情页根据动态参数正确加载数据
5. 在列表页切换分类、校区、状态筛选，确认筛选逻辑正确
6. 添加商品到购物车 → 购买 → 确认库存扣减、订单生成、库存归零显示已售罄
7. 参与拼单 → 确认人数 +1、满员自动完成；退出拼单 → 确认人数 -1、状态恢复
8. 执行 `pnpm build-only` 确认项目可正常构建，无模板编译错误

## 7. 遇到的问题与解决方法

| 问题 | 原因 | 解决方法 |
|---|---|---|
| JSON Server 返回的 id 类型不一致 | 种子数据返回字符串 `"1"`，POST 新建返回随机字符串如 `"ckgbJobKzSw"` | 全链路统一用 `==` 宽松比较，`route.params.id` 保持字符串原样 |
| 新发布的商品详情页显示"信息不存在" | `Number(route.params.id)` 对随机字符串 id 转成 NaN，与任何值比较均为 false | 去掉 Number() 转换，Store 所有 ID 参数改为 `string \| number` |
| fetchById 缓存 bug | 只在缓存已有该 id 时才更新，未命中时丢弃 API 结果 | 改为缓存没有时 push 加入 |
| 购物车数据刷新丢失 | cart、orders Store 纯 Pinia 内存状态，未持久化 | 每个 Store 加 `watch` 自动写入 localStorage，初始化时恢复 |
| `<template v-else>` 嵌套 `<template v-if>` 导致模板编译失败 | Vue 模板编译器不支持此写法 | 将条件判断移到普通 `<div>` 上 |
| Element Plus 引入后构建体积暴增 | 全量引入导致模块数从 60 增至 1620 | 回退 Element Plus，用原生组件实现，样式的需求用 CSS 变量覆盖 |

## 8. 今日反思

Day2 最大的收获是理解了前端工程结构的真正含义。上半场做完 7 个页面和完整业务逻辑时，项目看起来已经很完整——但所有数据写在 Pinia 内存里，刷新就丢，没有真正的 API 通信。下半场的架构升级让项目从 Level 1 跨越到 Level 2，这个过程中反复遇到的 id 类型问题、缓存同步问题、API 错误处理问题，恰好就是真实前后端分离开发中最常见的坑。如果没有这一层实践，很容易误以为前端开发就是写几个 Vue 文件加存内存数组。

页面骨架和路由导航的价值在于：后续每加一个新功能，开发者都清楚地知道代码应该放在哪一层（views、components、stores、api、utils），而不是全部塞进一个 vue 文件里。路由设计决定了用户如何在页面之间流转，Store 设计决定了数据如何在组件之间共享，API 层设计决定了前端如何与后端通信——这三层架构一旦定下来，后续开发就有了明确的轨道。这种分层加复用的工程思维，比写出某个具体功能要重要得多。

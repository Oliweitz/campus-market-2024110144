# 校园轻集市

## 1. 项目简介

"校园轻集市"是一个面向高校校园生活场景的 PC 端 Web App，主要支持以下校园业务：

- **二手交易**：发布和浏览二手商品信息
- **失物招领**：发布失物和招领信息
- **拼单搭子**：组织拼单购物、寻找搭子
- **跑腿委托**：发布和承接跑腿任务

本项目是《校园轻集市》AI 辅助前端工程实践课程的实训成果，使用 AI Coding 工具辅助开发，覆盖从项目初始化到综合验收的完整 7 天开发流程。

## 2. 技术栈

- **前端框架**：Vue 3（Composition API）
- **构建工具**：Vite
- **类型系统**：TypeScript
- **路由管理**：Vue Router
- **状态管理**：Pinia
- **HTTP 客户端**：Axios
- **Mock 服务**：JSON Server
- **代码检查**：ESLint + Oxlint

## 3. 核心功能

- 首页与全局导航
- 二手交易列表（含搜索、筛选、收藏）
- 失物招领列表
- 拼单搭子列表
- 跑腿委托列表
- 信息发布（支持多分类表单提交）
- 商品详情页
- 用户中心（个人资料、收藏管理）
- 消息中心
- 购物车与订单管理
- 数据看板（ECharts 可视化）
- 用户登录/注册（模拟）
- 加载状态、空状态、错误状态提示
- 收藏功能（支持收藏/取消收藏）

## 4. 项目运行

### 安装依赖

```bash
npm install
```

### 启动 Mock 服务

```bash
npm run mock
```

Mock 服务默认运行在 `http://localhost:3000`。

### 启动前端项目

新开一个终端：

```bash
npm run dev
```

前端项目默认运行在 `http://localhost:5173`。

### 同时启动 Mock 和前端

```bash
npm run dev:all
```

### 构建项目

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

## 5. 项目目录说明

```plain
campus-market-seed
├── db.json                  # JSON Server Mock 数据
├── src/
│   ├── api/                 # 接口请求模块
│   │   ├── http.ts          # Axios 实例配置
│   │   ├── cartApi.ts       # 购物车 API
│   │   ├── favoriteApi.ts   # 收藏 API
│   │   ├── itemApi.ts       # 商品/信息 API
│   │   ├── messageApi.ts    # 消息 API
│   │   ├── noticeApi.ts     # 通知 API
│   │   └── userApi.ts       # 用户 API
│   ├── components/          # 公共组件
│   │   ├── AppHeader.vue    # 顶部导航栏
│   │   ├── AppLayout.vue    # 页面布局容器
│   │   ├── AppNav.vue       # 侧边/下拉导航
│   │   ├── ItemCard.vue     # 信息卡片
│   │   ├── EmptyState.vue   # 空状态组件
│   │   ├── ErrorState.vue   # 错误状态组件
│   │   ├── LoadingState.vue # 加载状态组件
│   │   ├── SearchBar.vue    # 搜索栏
│   │   ├── FormField.vue    # 表单字段
│   │   ├── FavoriteButton.vue # 收藏按钮
│   │   ├── PublishForm.vue  # 发布表单
│   │   ├── ChatBox.vue      # 聊天组件
│   │   ├── MarketFilterBar.vue  # 筛选栏
│   │   ├── MarketItemCard.vue   # 市场列表卡片
│   │   ├── SafetyNotice.vue # 安全提示
│   │   ├── BargainPanel.vue # 砍价面板
│   │   └── ChartPanel.vue   # 图表面板
│   ├── router/
│   │   └── index.ts         # Vue Router 路由配置（12 条路由）
│   ├── stores/              # Pinia 状态管理
│   │   ├── user.ts          # 用户状态
│   │   ├── favorite.ts      # 收藏状态
│   │   ├── cart.ts          # 购物车状态
│   │   ├── orders.ts        # 订单状态
│   │   ├── itemStore.ts     # 商品状态
│   │   ├── messageStore.ts  # 消息状态
│   │   └── mylist.ts        # 个人列表状态
│   ├── views/               # 页面组件（14 个页面）
│   │   ├── HomeView.vue     # 首页
│   │   ├── TradeView.vue    # 二手交易
│   │   ├── LostFoundView.vue # 失物招领
│   │   ├── GroupBuyView.vue # 拼单搭子
│   │   ├── ErrandView.vue   # 跑腿委托
│   │   ├── MarketListView.vue # 市场总列表
│   │   ├── ItemDetailView.vue # 详情页
│   │   ├── PublishView.vue  # 发布页
│   │   ├── UserCenterView.vue # 用户中心
│   │   ├── MessageView.vue  # 消息中心
│   │   ├── DashboardView.vue # 数据看板
│   │   ├── LoginView.vue    # 登录页
│   │   └── RegisterView.vue # 注册页
│   ├── utils/               # 工具函数
│   ├── data/                # 共享数据模型
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── docs/
│   ├── evidence/            # Day1—Day7 每日证据卡
│   └── ai/                  # AI 协作记录
├── scripts/                 # 检测工具脚本
├── CHECK_REPORT.md          # 检测报告
├── VERSION.md               # 版本说明
└── package.json
```

## 6. 每日开发记录

| 阶段 | 主要内容 |
|------|----------|
| Day1 | 项目启动与业务梳理，确定页面清单和数据结构 |
| Day2 | 页面骨架搭建，路由配置，公共布局组件 |
| Day3 | Mock 数据建模，JSON Server 接入，列表渲染 |
| Day4 | 发布表单设计与校验，数据新增流程 |
| Day5 | Pinia 状态管理，用户中心，收藏功能 |
| Day6 | 交互优化：加载/空/错误状态，搜索筛选集成 |
| Day7 | 综合验收，构建检查，文档整理，项目展示准备 |

## 7. AI 协作说明

本项目在开发过程中使用 AI Coding 工具辅助完成以下工作：

- 页面骨架与路由配置生成
- Mock 数据设计与 JSON Server 数据结构
- API 接口封装
- 表单组件与校验逻辑
- Pinia Store 状态管理
- 交互状态组件设计

开发者对 AI 生成内容进行了人工审查、修改和取舍：

- 调整数据字段使其贴合校园业务场景
- 删除超出范围的功能（如图片上传、真实支付等）
- 简化过度抽象的组件设计
- 修复类型错误和运行时问题
- 控制项目复杂度，保证可维护性

详细 AI 协作过程记录在 `docs/ai/AI_Collaboration_Card.md` 和 `docs/evidence/` 目录中。

## 8. 已知局限

- 后端使用 JSON Server 模拟，非真实后端服务
- 用户认证为模拟登录，无真实鉴权
- 收藏数据刷新后依赖 JSON Server 持久化
- 图片上传尚未实现
- 搜索功能基于前端筛选，非全文检索
- 页面样式还有优化空间，Dashboard 包体积较大

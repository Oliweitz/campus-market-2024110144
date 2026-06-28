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

### 11. 设计系统与 UI 翻新

- **Prompt**：页面需要更灵动轻盈的表现
- **AI 输出**：全局 CSS 变量 20+ 个，导航胶囊化，全站 box-shadow 替代硬边框，圆角体系（8/12/16/24px），页面过渡动画，渐变背景 Banner
- **修改**：多轮迭代才统一所有页面的风格
- **结论**：CSS 变量是设计系统基石，一次定义全局受益

### 12. 响应式适配

- **Prompt**：电脑屏幕留白太多，需要适配手机
- **AI 输出**：三断点方案（桌面 1200px / 平板 768px / 手机 480px），首页双列网格，消息页手机端上下堆叠
- **结论**：响应式应在骨架阶段就考虑，事后补成本高

### 13. Element Plus 实验分支

- **Prompt**：试用 Element Plus 优化导航栏
- **AI 输出**：创建独立分支，安装并替换为 el-menu + el-badge，构建模块从 60 增至 1620，CSS 从 6KB 增至 362KB
- **结论**：Element Plus 适合表单/表格等复杂组件场景，轻量导航栏用原生更优。分支已删除，保留 master 原生方案

### 14. UI 细节补全

- **Prompt**：对照原型提示词补齐面包屑、分页、相关推荐、举报、常用回复
- **AI 输出**：DetailView 加面包屑+举报+4条相关推荐；ListView 加每页6条分页；MessageView 加4个快捷回复按钮；页面宽 1200px
- **修改**：面包屑需链接可点击，分页需圆形按钮 active 态
- **结论**：这些"锦上添花"的功能改动小但体验提升大

---

### 15. 架构升级：Level 1 → Level 2

- **Prompt**：对照技术架构文档分析当前项目差距，制定补全计划
- **AI 输出**：三级优先级差距清单（P0/P1/P2），涵盖 JSON Server、API 层、组件抽取、ECharts 等 11 个维度
- **修改**：确认了架构文档中 type 命名规范、字段结构、资源模型等细节要求
- **结论**：先做差距分析再动手，避免方向性返工

### 16. Mock API 与数据建模

- **Prompt**：创建 db.json，按架构文档设计 6 类资源，补齐字段
- **AI 输出**：6 类资源完整数据结构、13 条 items 示例数据、package.json 启动脚本、Vite proxy 配置
- **修改**：type 值从旧命名改为 secondhand/lostfound/group/errand，字段从 desc/poster/publishTime 改为 description/publisherId/createdAt
- **结论**：数据建模是架构升级的基石，字段一旦定下来后续改动成本低

### 17. API 层与 Store 重构

- **Prompt**：创建 Axios 封装层和 5 个领域 API 模块，将 7 个 Pinia Store 从内存操作改为 API 驱动
- **AI 输出**：request.ts + userApi/itemApi/favoriteApi/messageApi/noticeApi 完整 CRUD，7 个 Store 的 async/await 重构
- **修改**：ID 类型从 number 统一改为 string | number 以兼容 JSON Server，所有比较改为 ==；fetchById 缓存逻辑从"只更新已有"改为"无则加入"
- **结论**：ID 类型问题是全链路的问题，改一处不改全局必然有遗漏

### 18. 组件抽取与 ECharts 集成

- **Prompt**：从 views 中抽取 8 个可复用组件，看板页改用 ECharts
- **AI 输出**：MarketItemCard、MarketFilterBar、PublishForm、FavoriteButton、BargainPanel、ChatBox、ChartPanel、SafetyNotice 完整组件代码，ECharts 饼图和柱状图配置
- **修改**：组件 props/emits 接口需与现有数据模型对齐，ChartPanel 增加了 watch 响应式更新
- **结论**：组件抽取后 views 文件显著缩短，职责边界清晰

### 19. 购物车购买流程完善

- **Prompt**：增加库存字段、购买时扣库存并 API 持久化、库存到零显示已售罄
- **AI 输出**：PublishForm 加库存输入、cart Store 加 stock 追踪和 updateQuantity 限量逻辑、MarketItemCard 加售罄标记、浮动购物车图标
- **修改**：buyItem 从标记已完成改为 PATCH API 更新 stock，库存归零不隐藏商品；多次修正 TypeScript 类型错误
- **结论**：库存管理涉及发布、加购、购买、展示四层联动，改一处需同步验证上下游

### 20. UI 布局与细节调整

- **Prompt**：标题栏副标题改为统计卡片、导航栏与信息栏互换位置、Banner 渐变增强、安全提醒组件化
- **AI 输出**：App.vue 重构布局，SafetyNotice 组件从 notices API 读取数据轮播，HomeView Banner 加 hover 浮起效果
- **修改**：统计卡片样式从独立小卡改为统一样式的大信息框，再改为全宽；导航栏由宽胶囊改为紧凑 fit-content
- **结论**：布局类改动 AI 能快速出方案，但最终视觉需人工验

---

> 后续协作记录按此格式追加。

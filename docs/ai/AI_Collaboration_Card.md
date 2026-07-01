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

#### 16a. 我的设计与 AI 设计的对比

Day3 实训手册要求对「我的设计」和「AI 设计」做明确比较。AI 初版生成的 Mock 数据在字段完整性上做得不错，但在业务贴合度上有明显差距：

**AI 生成的问题**：
- 数据内容泛化——出现了「手机壳」「充电宝」等通用电商词汇，缺乏校园场景感
- 拼单数据缺少 `currentCount` 字段的合理初始值，全部写 0
- 跑腿委托把 `from`/`to` 简单写成了「校内」「校外」，没有具体楼栋名称

**我的判断和修改**：
- 全部替换为校园常见场景：教材交易、台灯、自行车、快递代取、拼餐、羽毛球搭子、搬宿舍行李等
- 二手交易的 `price` 和 `condition` 是买家决策的核心——手册要求这组字段，但 AI 初版缺失了 `condition`
- 失物招领的 `type` 字段用于区分「丢失」和「拾获」——这两个场景的语义完全不同，不能用同一个字段值表示
- 拼单的 `targetCount` 和 `currentCount` 必须配套出现——有了目标人数才能算进度
- 跑腿委托的 `from`/`to` 描述取送路线——这是接单人判断是否顺路的关键信息

**最终保留的 AI 贡献**：
- 六类资源的关系结构（users→items→favorites / conversations→messages）设计合理，直接采用
- JSON Server 的启动脚本和 Vite proxy 配置一次性正确
- 示例数据的字段覆盖度够用，只需要调整内容而非增加字段

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

### 21. 数据模型收敛：废弃独立集合

- **Prompt**：项目中有两套数据模型并存（`items` 统一集合 + `trades`/`lostFounds`/`groupBuys`/`errands` 独立集合），分析是否应该合并
- **AI 输出**：确认四个独立集合在 `src/` 中零引用，全部视图通过 `itemStore` 过滤 `items` 获取数据。建议删除独立集合和对应的四个 API 文件
- **修改**：删除了 `db.json` 中 21 条冗余数据记录，废弃 `trade.ts`/`lostFound.ts`/`groupBuy.ts`/`errand.ts` 四个 API 文件
- **结论**：全局 grep 确认零引用后再删除，这是安全保障的关键步骤

### 22. 命名与结构对齐

- **Prompt**：对照 Day3-Day5 实训手册，检查项目命名和目录结构差异
- **AI 输出**：列出 8 处命名差异：`request.ts→http.ts`、`userStore.ts→user.ts`、`favoriteStore.ts→favorite.ts`、`ProfileView.vue→UserCenterView.vue`、路由 `/lostfound→/lost-found`、`/groupbuy→/group-buy`、`/profile→/user`
- **修改**：逐文件重命名并批量更新所有 import 引用（共涉及 18 处跨文件修改），类型检查和构建双重验证确保无遗漏
- **结论**：重命名是高风险操作，必须用类型检查兜底

### 23. 组件抽取与 PublishForm 重写

- **Prompt**：将 App.vue 中的 header/nav 提取为独立组件，按 Day4 手册要求重写发布表单
- **AI 输出**：创建 `AppHeader.vue`/`AppNav.vue`/`AppLayout.vue` 三个布局组件。重写 `PublishForm.vue`：按字段错误提示替代数组式 errors、增加价格>0 和人数≥2 等数值校验、补全重置按钮和提交中禁用态、使用 `FormField.vue` 包裹所有表单项
- **修改**：PublishForm 改动最大——从 160 行的简版重写为 260 行的完整版，发布人从硬编码改为读取 `userStore.nickname`
- **结论**：表单校验的粒度决定了用户体验的下限，单条错误信息比「请检查表单」有用得多

### 24. 架构决策记录

- **Prompt**：Day3 实训手册要求四个独立数据集合，技术架构文档要求统一 `items` 集合，如何选择？
- **AI 输出**：两条路线的差异分析——独立模型让四类业务 API 边界清晰，统一模型让跨类型列表和数据看板天然支持
- **修改**：最终选择统一模型。依据有三：1) Day3 实际开发中已验证独立模型导致列表页与专属页数据不一致；2) Git 提交 `e206cfb` 记录了向 Level 2 架构的迁移；3) `src/data/listings.ts` 注释明确写「与架构文档对齐」
- **结论**：文档冲突时，以有实际开发验证证据支撑的方案为准。架构文档是设计意图，Day3 证据是实践结果——后者更具有说服力

---

### 25. 列表卡片高度统一

- **Prompt**：四个分类列表页（二手/失物/拼单/跑腿）的卡片高度不一致，同一行卡片参差不齐，需要统一高度
- **AI 输出**：`ItemCard.vue` 重构为 flexbox 列布局（`display: flex; flex-direction: column; height: 100%`），描述区 `flex: 1` 自动撑满剩余空间，meta 区和 footer 区设置 `flex-shrink: 0` 始终底部对齐。四个分类视图（TradeView/LostFoundView/GroupBuyView/ErrandView）的 `.card-link` 设为 `display: flex; height: 100%`
- **修改**：初次方案只改了 ItemCard 内部，同行卡片仍不等高——原因是外层 `<router-link>` 未设置高度。追加 card-link 的 flex+height:100% 后解决
- **结论**：CSS 等高卡片需要整条链路（外层容器→链接包裹→卡片本体）都参与 flex 布局，只改最内层无效

### 26. 收藏按钮对齐

- **Prompt**：首页热门推荐卡片中，收藏按钮（心形图标）与标题区垂直方向未对齐，视觉上不协调
- **AI 输出**：HomeView 和 MarketItemCard 的标题行容器添加 `align-items: center`，收藏按钮垂直居中
- **结论**：flexbox 默认 `align-items: stretch` 可能导致图标与文字基线不一致，显式设 center 是低成本高收益的微调

### 27. 详情页格式统一

- **Prompt**：跑腿委托详情页的取送路线使用了异形的虚线框样式（route-box），与详情页其他字段的 `.aux` 辅助信息格式不一致
- **AI 输出**：删除了 `.route-box` 及其子元素（`.route-node`/`.route-label`/`.route-arrow`）共 9 行 CSS 和 5 行模板代码，改为两条统一的 `.aux` 格式：`取件: {{ product.from }}` 和 `送达: {{ product.to }}`
- **修改**：去掉了彩色圆点标记（黄/绿）和虚线边框，风格与页面其他辅助信息行保持一致
- **结论**：特殊样式是技术债务——当页面只有一处异形组件时，视觉跳脱大于信息突出。统一优于特殊

### 28. 旧数据字段补齐

- **Prompt**：db.json 中有 22 条旧数据缺少 `category`/`itemName`/`contact`/`groupType`/`taskType`/`from`/`to`/`deadline` 等字段，导致详情页渲染空白
- **AI 输出**：逐条分析每条旧数据的 type 类型，按需补齐对应字段——二手交易补 `category`+`itemName`+`contact`，拼单补 `groupType`，跑腿补 `taskType`+`from`+`to`+`deadline`。同时新增了一条跑腿示例数据（帮忙买洗衣粉）作为数据完整性验证
- **修改**：补齐过程中发现部分旧数据的 `from`/`to` 语义与新的 `取件/送达` 格式对齐，人工确认每条路线描述合理性
- **结论**：数据迁移是重构的最后一公里——代码改了字段名但旧数据不补齐，视图层就会静默渲染空白，用户看不到但数据完整性已受损

---

### 29. Day6 搜索筛选集成

- **Prompt**：四个分类列表视图（TradeView/LostFoundView/GroupBuyView/ErrandView）缺少搜索功能，需要为每个页面集成关键词搜索
- **AI 输出**：在每个视图中新增 `keyword` ref + `filteredItems` computed，搜索范围覆盖 title/description/location + 分类专属字段（如 category/itemName/groupType/taskType/from/to），空状态根据有无 keyword 区分"暂无数据"和"无匹配结果"
- **修改**：SearchBar.vue 原本是孤组件（零引用），接入后 4 个视图全部统一使用同一搜索组件。搜索字段按业务场景定制——跑腿额外搜索 from/to/taskPlace，二手额外搜索 category
- **结论**：搜索组件应提前设计并贯入所有列表页，事后补会导致每个视图重复写相似的过滤逻辑

### 30. 导航栏下拉菜单改造

- **Prompt**：导航栏需要保留"列表"入口，同时将四个分类页做成悬停下拉子菜单，避免导航栏过长
- **AI 输出**：使用 `@mouseenter`/`@mouseleave` + `v-show` 实现下拉菜单，带 150ms 延迟收起防止误触，箭头图标旋转动画，分类页激活时父级"列表"同步高亮
- **修改**：初次实现将 hideTimer 声明为模块级 `let` 变量，审查发现组件卸载时定时器未清理会导致内存泄漏。改为 `ref` + `onUnmounted` 清理
- **结论**：悬停交互必须考虑延迟收起（防抖）和组件卸载清理，否则长时间使用会积累定时器泄漏

### 31. 冗余依赖清理

- **Prompt**：审查项目构建产物，发现 element-plus CSS 占 362KB 但项目已废弃 Element Plus 分支
- **AI 输出**：确认 src/ 中零处使用 Element Plus 组件，仅 main.ts 残留 `import 'element-plus/dist/index.css'`
- **修改**：删除 main.ts 中的 CSS 导入和无用注释，从 package.json 移除 `element-plus` 依赖，运行 pnpm install 更新 lockfile
- **结论**：实验性分支删除后应同步清理依赖，否则每次构建都在打包 362KB 死代码。`grep -r` 全局搜索确认零引用是安全删除的前提

### 32. 代码审查与缺陷修复

- **Prompt**：对全项目（stores/api/views/components/utils/router/db.json）进行冗余代码和缺陷审查
- **AI 输出**：三路并行审查发现 5 项高严重度问题——`getRecentItems` 逻辑反了（返回最旧而非最新）、`ChatBox.vue` 模板 ref 未声明导致 Vue 警告、`AppNav.vue` 定时器泄漏、`db.json` deadline 早于 createdAt、senderId 类型不一致
- **修改**：删除 statistics.ts 多余的 `.reverse()`、移除 ChatBox 无用 `ref="logRef"`、hideTimer 改为响应式 ref + onUnmounted 清理、修正 db.json 数据错误
- **结论**：多路并行审查比单一视角覆盖率高——三个 agent 分别从 stores/api、views/components、router/utils 三个维度切入，发现了单一路径难以同时发现的跨层问题（如 ID 类型 mismatch、日期格式混用）

### 33. 证据卡编写

- **Prompt**：按 Day6 实训手册要求编写证据卡，需覆盖交互优化、加载状态、错误状态、搜索筛选、代码整理、AI 协作、完整走查
- **AI 输出**：结构化的 Day6_Evidence.md，覆盖 8 个章节，详述 LoadingState/ErrorState/SearchBar 的创建与集成过程、5 项缺陷修复记录、AI 建议筛选、完整功能走查 12 步
- **修改**：对照实训手册逐条核对交付物清单，补充人工调整细节和反思内容
- **结论**：证据卡应在开发过程中同步记录而非事后补写，否则容易遗漏 AI 建议筛选的细节和真实问题的排查过程

---

### 34. Day5 证据卡补写与代码审查

- **Prompt**：直接粘贴了 Day5 实训任务文档全文（约 6000 字），涵盖实训主题、目标、前置条件、任务总览、操作步骤、状态管理设计说明、AI 协作任务卡、证据卡要求、检测建议等全部内容。未编写独立提示词，AI 从文档中自动提取需要完成的工作

- **AI 输出**：AI 自主完成了以下工作链：
  1. **项目全景扫描**：通读 `src/stores/` 下全部 7 个 Store 文件（user.ts、favorite.ts、itemStore.ts、mylist.ts、cart.ts、orders.ts、messageStore.ts）、`src/views/` 下全部 13 个页面组件、`src/components/` 下关键组件（AppHeader、AppNav、ItemCard、PublishForm、FavoriteButton）、`src/router/index.ts` 路由配置、`src/data/listings.ts` 类型定义、`src/api/` 下 6 个 API 模块、`db.json` Mock 数据
  2. **现状与要求对照**：逐项对比 Day5 交付物清单（8 项）与代码实际状态，发现代码已实现全部 Day5 功能——Pinia 已挂载、user/favorite/itemStore 等 7 个 Store 已创建、AppHeader 显示用户信息、PublishForm 读取当前用户作为发布人、TradeView 集成 FavoriteButton 收藏组件、UserCenterView 完整展示用户资料/我的发布/我的收藏/购物车、MessageView 实现会话聊天。但代码实际水平远超 Day5 要求（完整登录注册、localStorage 持久化、购物车系统、消息会话等均属于 Day6+ 范围）
  3. **缺口识别**：唯一缺口是 `docs/evidence/Day5_Evidence.md` 为空文件（仅 1 行空行）。之前的开发推进较快，Store 体系在 Day5 之前已搭建完成，但证据卡未同步编写
  4. **TypeScript 编译验证**：执行 `npx vue-tsc --noEmit`，编译通过零错误，确认所有 Store/API/组件之间的类型引用正确
  5. **证据卡编写**：按照 Day5 任务文档中的证据卡模板（9 个章节），结合代码实际状态补写了完整证据卡。内容覆盖：今日完成内容、Store 设计说明（4 个 Store 的表格式分析）、状态边界说明（哪些入 Store 哪些不入 + 原因）、页面使用记录（7 个页面/组件使用方式表）、AI 协作记录（前期生成 + 今日审查两种模式）、人工调整内容、测试记录（编译验证已通过 + 10 项运行时测试待执行）、遇到的问题与解决方法、今日反思
  6. **交付物清单对照**：逐项检查 Day5 要求的 8 个交付物，输出状态表（7 项已就绪，1 项 Git 提交待执行）
  7. **今日行动计划**：给出四步行动建议——启动服务并手动验证 10 项功能测试 → 精读 Store 代码理解状态设计 → 对照交付物清单查漏补缺 → Git 提交

- **修改**：
  1. 证据卡初稿将前期 Store 生成和今日审查混在一起描述，按要求将二者拆分为独立的"前期协作"和"今日协作"两段，重点突出今日实际做的工作
  2. 测试记录部分，AI 基于代码推演写了"已完成"的测试描述，审查后标注为"待验证"——TypeScript 编译确实通过了，但 10 项运行时功能测试尚未实际启动服务执行
  3. 用户要求将今日 AI 协作记录写入本文件（AI_Collaboration_Card.md）而非仅保留在证据卡中，补充了本条记录
  4. 证据卡 5.5 节新增了"AI 生成内容不合理之处与审查结论"表，逐项标注审查结果和待改进项

- **结论**：
  1. **缺口识别的价值大于代码生成**：当项目代码已存在但文档缺失时，AI 的审查模式（扫描代码→对照需求→定位缺口→补齐文档）比生成模式（从零写代码）更有实际价值。本次 AI 在 3 分钟内完成了 20+ 个文件的阅读和缺口定位，人工做至少需要 20 分钟
  2. **证据卡不应事后补写**：Day5 代码在前期就已实现，但证据卡直到今天才补写。事后补写的问题在于：测试记录只能基于代码推演而非记忆中的实际操作，AI 建议筛选的细节已丢失（哪些建议采纳了、哪些拒绝了、为什么）。证据卡的最佳实践是开发过程中同步记录
  3. **审查模式下 AI 的角色更像"代码审查员"**：不直接写新功能代码，而是帮助梳理已有代码的合理性。本次 AI 正确识别了表单校验错误（保留在组件内）、搜索关键词（保留在组件内）、可折叠面板状态（保留在组件内）都未进入 Store——这说明 AI 对"状态边界"的理解是正确的。但 AI 对运行时行为（如收藏按钮点击后 DOM 是否真的更新）无法验证，必须人工执行
  4. **指令需要明确目标文件**：用户说"写 AI 协作记录"，AI 默认修改了 `Day5_Evidence.md` 中的第 5 节。用户实际指的是 `docs/ai/AI_Collaboration_Card.md`。当项目中有多个可能的目标文件时，AI 应主动询问而非假设——这是本次协作中的一次沟通偏差

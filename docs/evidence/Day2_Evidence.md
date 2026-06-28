Day 2 — 页面骨架、路由导航与架构升级

今天的工作分为上下两个半场。上半场完成了页面骨架搭建和业务功能扩展，下半场完成了从 Level 1（纯前端内存数据）到 Level 2（前端 + Mock API）的架构升级。

上午的目标是在 Vue3 项目基础上扩展多页面结构、完善路由、构建四分类业务场景的完整前端框架。骨架搭建阶段，在已有 HomeView 基础上新增了 ListView、DetailView、PublishView、MessageView、ProfileView、DashboardView 六个页面。路由配了七条，Detail 路由用 :id 支持动态参数。导航栏有首页、列表、发布、消息、我的、看板六个入口。

数据层做了统一设计，data/listings.ts 定义了 Listing 接口和 13 条种子数据，包含类型、校区、状态、发布时间、标签等公共字段。listings Store 把数据变成响应式，拼单人数变化、发布新信息、状态切换都实时反映到所有页面。列表页支持分类、校区、状态筛选加关键词搜索和收藏。详情页四种类型差异化渲染，发布者名字可点击跳转消息页。

购物车和订单系统是上午交互最复杂的部分。cart Store 管理加购和购买，购买时联动 orders Store 记录订单、扣减库存，库存归零自动撤下商品，个人中心有订单列表。拼单和跑腿的参与退出逻辑经过了多轮迭代，参与拼单人数加一、满员自动完成，退出时人数减一、不满则恢复。跑腿接单后撤下，退出后回到列表。详情页区分发布者和浏览者两套按钮。消息页从空白开始，通过详情页点击用户名动态添加联系人，发送后模拟自动回复，未读数实时显示。发布页四种类型动态表单，提交后写入 listStore 并跳转。看板页从 listStore 实时计算类型占比和校区分布。

上午还做了 UI 翻新：定义 20 多个 CSS 变量统一全站设计系统，导航栏改为胶囊造型，卡片用 box-shadow 替代硬边框，加上页面过渡动画和 Banner 渐变背景。之后做响应式适配，桌面 1200px、平板 768px、手机 480px 三个断点。最后补齐面包屑导航、列表分页、详情相关推荐、举报入口、消息快捷回复等细节。上午遇到的关键 bug 是 ProfileView 里 @click 写了 JS 块注释导致 Vue 模板编译失败，这个教训是 vue-tsc 不检查模板语法，pnpm build-only 才是最终验证手段。也尝试了 Element Plus 分支实验，构建模块从 60 激增至 1620，CSS 从 6KB 增至 362KB，结论是轻量导航栏用原生更优。

下午的核心任务是将项目从 Level 1 升级到 Level 2。上午的项目虽然页面完整、功能齐全，但所有数据都写在 Pinia 内存数组里，刷新即丢失。下午搭建了 JSON Server Mock API 服务，创建 db.json 包含 6 类资源（users、items、favorites、conversations、messages、notices），配置了 Vite proxy 将 /api 转发到 localhost:3000，新增了 pnpm mock 和 pnpm dev:all 启动脚本。然后创建了完整的 API 接口层——request.ts 封装 Axios 实例和拦截器，itemApi、userApi、favoriteApi、messageApi、noticeApi 五个领域模块封装了所有资源的 CRUD 操作。工具函数层创建了四个文件：date.ts 做时间格式化，statistics.ts 做类型校区状态统计，mockReply.ts 按业务类型生成模拟回复，constants.ts 管理 API 地址和 localStorage 键名。

接下来做了组件抽取，从 views 中抽出 8 个可复用组件——MarketItemCard、MarketFilterBar、PublishForm、FavoriteButton、BargainPanel、ChatBox、ChartPanel、SafetyNotice。此前所有 UI 逻辑全部嵌在页面文件中，抽离后页面负责组织布局，组件负责具体交互，修改一处即可影响全局。Store 层也全面重构，7 个 Pinia Store 全部从操作内存数组改为调用 API 层再更新缓存，新增 userStore 支持 localStorage 自动登录，itemStore 增加了 updateStock 和 deleteItem 方法。所有 ID 比较从严格相等改为宽松相等，以兼容 JSON Server 返回的字符串 id。

下午还做了 ECharts 集成，看板页用饼图和柱状图替代了上午的 CSS 条形图。UI 方面做了多项优化：标题栏副标题替换为四张可点击统计卡片，Banner 渐变增强并点击跳转个人中心，安全提醒组件接入 notices API 轮播，右下角新增浮动购物车图标，购物车增加库存追踪功能，购买时通过 PATCH API 持久化扣减，库存到零显示红色已售罄但保留在列表中。个人中心新增身份编辑弹窗。

下午遇到的最大问题是 JSON Server 返回的 id 类型不匹配。JSON Server 对种子数据返回字符串 "1"，对 POST 创建的新数据返回随机字符串如 "ckgbJobKzSw"。前端 DetailView 中 Number(route.params.id) 对种子数据能正常转成数字，但对新数据转成 NaN，NaN 跟任何值比较都是 false，导致新发布的商品详情页始终显示"信息不存在"。解决过程经过三轮迭代：第一轮在 Store 中用 Number() 统一转数字，对新 id 无效；第二轮统一用 == 宽松比较，但因为 NaN == NaN 也是 false 所以仍然不行；最终方案是去掉 Number() 转换，route.params.id 保持字符串原样，Store 所有 ID 参数改为接受 string 或 number，全链路用 == 比较。另外还发现 fetchById 的一个隐藏 bug——它只在缓存已有该 id 时才更新数据，如果没命中缓存就直接丢弃获取到的结果，修复为缓存没有时 push 加入。购买后库存归零的商品原本会被标记为已完成从列表消失，修改为保留在列表中显示红色已售罄。

今天上半场的核心认知是数据为什么要放在共享模块里——列表、详情、看板、个人中心都要用同一份数据，分开写必然不一致。Pinia Store 让所有组件共享同一份响应式数据，普通数组变化不会触发 UI 刷新。UI 设计系统一次定义 CSS 变量，后续所有页面统一受益，改颜色只改一处。为什么状态设计为三个？因为撤回（closed）可以重新发布，完成（completed）不行，两个状态区分不了这两种情况。

下午最大的收获是理解了前端工程结构的真正含义。上午项目已经有 7 个页面和完整的业务逻辑，但那只是看起来完整——所有数据写在 Pinia 内存里，刷新就丢，没有真正的 API 通信。下午的升级让项目从 Level 1 跨越到 Level 2，这个过程中反复遇到的 id 类型问题、缓存同步问题、API 错误处理问题，恰好就是真实前后端分离开发中最常见的坑。如果没有这一层实践，很容易误以为前端开发就是写几个 Vue 文件加存内存数组。页面骨架和路由导航的价值在于后续每加一个新功能，开发者都清楚地知道代码应该放在哪一层（views、components、stores、api、utils），而不是全部塞进一个 vue 文件里。这种分层加复用的工程思维，比写出某个具体功能要重要得多。

#!/usr/bin/env node

// ============================================================
// 校园轻集市 — 项目自动检测脚本
// 用法:
//   node scripts/check.js              # 检测全部7天
//   node scripts/check.js --day=3     # 仅检测 Day3
//   node scripts/check.js --all        # 检测全部7天
// ============================================================

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---- 工具函数 ----
function ok(msg)  { console.log(`  ✅ ${msg}`) }
function fail(msg) { console.log(`  ❌ ${msg}`) }
function warn(msg) { console.log(`  ⚠️  ${msg}`) }
function info(msg) { console.log(`  📋 ${msg}`) }
function hr(title) { console.log(`\n${'─'.repeat(60)}\n  ${title}\n${'─'.repeat(60)}`) }

function exists(...parts) {
  return existsSync(join(ROOT, ...parts))
}

function readText(...parts) {
  if (!exists(...parts)) return ''
  return readFileSync(join(ROOT, ...parts), 'utf-8')
}

function fileSize(...parts) {
  if (!exists(...parts)) return 0
  return statSync(join(ROOT, ...parts)).size
}

function hasKeyword(filePath, keyword) {
  const content = readText(filePath)
  return content.includes(keyword)
}

function filesInDir(dirPath) {
  if (!existsSync(dirPath)) return []
  return readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name)
}

function countCommits() {
  try {
    return parseInt(execSync('git rev-list --count HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim(), 10)
  } catch { return 0 }
}

function commitMessages() {
  try {
    return execSync('git log --oneline -50', { cwd: ROOT, encoding: 'utf-8' }).trim()
  } catch { return '' }
}

// 全局 API 文件列表（跨 Day 使用）
const apiFiles = filesInDir(join(ROOT, 'src', 'api'))

let totalPass = 0, totalFail = 0, totalWarn = 0

function check(condition, msg) {
  if (condition) { ok(msg); totalPass++ }
  else { fail(msg); totalFail++ }
}

function checkWarn(condition, msg) {
  if (condition) { ok(msg); totalPass++ }
  else { warn(msg); totalWarn++ }
}

function checkFile(dir, baseMsg) {
  const path = Array.isArray(dir) ? join(ROOT, ...dir) : join(ROOT, dir)
  const ok_ = existsSync(path)
  if (ok_) { ok(baseMsg); totalPass++ }
  else { fail(`${baseMsg}（缺失: ${dir}）`); totalFail++ }
  return ok_
}

function checkEvidence(day) {
  const file = `docs/evidence/Day${day}_Evidence.md`
  const fullPath = join(ROOT, file)
  const ok_ = existsSync(fullPath)
  if (ok_) {
    const size = statSync(fullPath).size
    if (size > 200) { ok(`${file} (${size} B)`) }
    else { fail(`${file} 内容过少 (${size} B)，建议 >= 200 字节`) }
    totalPass++
  } else {
    fail(`缺失: ${file}`)
    totalFail++
  }
  return ok_
}

// ---- 解析命令行参数 ----
const args = process.argv.slice(2)
let targetDay = 0
let runAll = false

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--day' && args[i + 1]) {
    targetDay = parseInt(args[i + 1], 10)
  }
  if (args[i] === '--all') runAll = true
}

if (targetDay === 0 && !runAll) runAll = true

// ---- 生成 CHECK_REPORT ----
const reportLines = []
reportLines.push('# CHECK REPORT — 自动检测结果\n')
reportLines.push(`**检测时间**：${new Date().toISOString().slice(0, 19).replace('T', ' ')}`)
reportLines.push(`**检测范围**：${runAll ? 'Day1—Day7 全部' : `Day${targetDay}`}\n`)

function report(line) { reportLines.push(line) }

// ============================================================
// DAY 1: 项目启动与业务梳理
// ============================================================
if (runAll || targetDay === 1) {
  hr('DAY 1 — 项目启动与业务梳理')

  info('Task 1: 项目基础结构')
  check(exists('package.json'), 'package.json 存在')
  check(exists('src'), 'src/ 目录存在')
  check(exists('docs'), 'docs/ 目录存在')
  check(exists('public'), 'public/ 目录存在')
  check(exists('src/main.ts'), 'src/main.ts 入口文件存在')
  check(exists('src/App.vue'), 'src/App.vue 根组件存在')
  check(exists('vite.config.ts'), 'vite.config.ts 构建配置存在')
  check(exists('tsconfig.json'), 'tsconfig.json TypeScript 配置存在')

  info('Task 2: 核心目录结构')
  check(exists('src/api'), 'src/api/ API 目录存在')
  check(exists('src/components'), 'src/components/ 组件目录存在')
  check(exists('src/router'), 'src/router/ 路由目录存在')
  check(exists('src/stores'), 'src/stores/ Store 目录存在')
  check(exists('src/views'), 'src/views/ 页面目录存在')

  info('Task 3: 依赖安装')
  const hasNodeModules = exists('node_modules')
  const pkgJson = JSON.parse(readText('package.json') || '{}')
  const hasDeps = Object.keys(pkgJson.dependencies || {}).length > 0
  check(hasNodeModules, 'node_modules/ 目录存在（依赖已安装）')
  check(hasDeps, 'package.json 包含项目依赖')

  info('Task 4: 证据卡与文档')
  checkEvidence(1)
  const day1Content = readText('docs/evidence/Day1_Evidence.md')
  check(day1Content.includes('业务') || day1Content.includes('页面'), 'Day1 证据卡包含业务/页面分析')
  check(exists('README.md'), 'README.md 存在')

  info('Task 5: Git 提交')
  const totalCommits = countCommits()
  check(totalCommits >= 1, `Git 仓库有 ${totalCommits} 个提交（至少 1 个）`)
  report(`- Day1: Git commits=${totalCommits}`)
}

// ============================================================
// DAY 2: 页面骨架与路由导航
// ============================================================
if (runAll || targetDay === 2) {
  hr('DAY 2 — 页面骨架与路由导航')

  info('Task 1: 核心业务页面（8 个）')
  const requiredViews = [
    ['src/views/HomeView.vue',       '首页'],
    ['src/views/TradeView.vue',      '二手交易'],
    ['src/views/LostFoundView.vue',  '失物招领'],
    ['src/views/GroupBuyView.vue',   '拼单搭子'],
    ['src/views/ErrandView.vue',     '跑腿委托'],
    ['src/views/PublishView.vue',    '发布页面'],
    ['src/views/MessageView.vue',    '消息页面'],
    ['src/views/UserCenterView.vue', '个人中心'],
  ]
  for (const [p, name] of requiredViews) checkFile(p.split('/'), `${name} (${p})`)

  info('Task 2: 路由配置')
  checkFile(['src', 'router', 'index.ts'], 'src/router/index.ts 路由文件存在')
  const routerContent = readText('src/router/index.ts')
  check(routerContent.includes('createRouter'), '路由中使用 createRouter')
  check(routerContent.includes("path: '/'"), '路由包含首页路径 /')
  check(routerContent.includes("'/trade'"), '路由包含 /trade')
  check(routerContent.includes("'/lost-found'"), '路由包含 /lost-found')
  check(routerContent.includes("'/group-buy'"), '路由包含 /group-buy')
  check(routerContent.includes("'/errand'"), '路由包含 /errand')
  check(routerContent.includes("'/publish'"), '路由包含 /publish')
  check(routerContent.includes("'/message'"), '路由包含 /message')
  check(routerContent.includes("'/user'"), '路由包含 /user')

  info('Task 3: 公共布局组件')
  checkFile(['src', 'components', 'AppLayout.vue'], 'AppLayout.vue 布局组件')
  checkFile(['src', 'components', 'AppHeader.vue'], 'AppHeader.vue 头部组件')
  checkFile(['src', 'components', 'AppNav.vue'], 'AppNav.vue 导航组件')

  info('Task 4: main.ts 挂载路由')
  const mainContent = readText('src/main.ts')
  check(mainContent.includes('router'), 'main.ts 中引入了路由')
  check(mainContent.includes('use(') || mainContent.includes('app.use'), 'main.ts 中挂载了插件')

  info('Task 5: App.vue 使用布局')
  const appContent = readText('src/App.vue')
  check(
    appContent.includes('AppLayout') || appContent.includes('RouterView') || appContent.includes('router-view'),
    'App.vue 使用了布局或 RouterView'
  )

  info('Task 6: 证据卡')
  checkEvidence(2)
  const d2 = readText('docs/evidence/Day2_Evidence.md')
  const hasD2Keywords = d2.includes('页面骨架') || d2.includes('路由导航') || d2.includes('公共布局')
  check(hasD2Keywords, 'Day2 证据卡包含核心关键词')
}

// ============================================================
// DAY 3: Mock 数据建模与列表渲染
// ============================================================
if (runAll || targetDay === 3) {
  hr('DAY 3 — Mock 数据建模与列表渲染')

  info('Task 1: db.json Mock 数据文件')
  checkFile('db.json', 'db.json Mock 数据文件存在')
  const dbSize = fileSize('db.json')
  check(dbSize > 500, `db.json 文件大小: ${dbSize} B（> 500 B）`)
  let dbContent = ''
  try { dbContent = readText('db.json') } catch {}
  const hasTradeData    = dbContent.includes('"title"') && (dbContent.includes('"price"') || dbContent.includes('"category"'))
  const hasLostFound    = dbContent.includes('lost') || dbContent.includes('found') || dbContent.includes('lostFounds')
  const hasGroupBuy     = dbContent.includes('groupBuys') || dbContent.includes('targetCount') || dbContent.includes('拼')
  const hasErrand       = dbContent.includes('errands') || dbContent.includes('reward') || dbContent.includes('跑腿')
  check(hasTradeData,    'db.json 包含交易类数据（title + price/category）')
  checkWarn(hasLostFound, 'db.json 包含失物招领数据')
  checkWarn(hasGroupBuy,  'db.json 包含拼单搭子数据')
  checkWarn(hasErrand,    'db.json 包含跑腿委托数据')

  info('Task 2: Axios 封装 + API 模块')
  checkFile(['src', 'api', 'http.ts'], 'src/api/http.ts Axios 实例封装')
  const httpContent = readText('src/api/http.ts')
  check(httpContent.includes('axios') || httpContent.includes('create'), 'http.ts 创建了 Axios 实例')

  const hasTradeApi    = apiFiles.some(f => f.toLowerCase().includes('trade') || f.toLowerCase().includes('item'))
  const hasLostApi     = apiFiles.some(f => f.toLowerCase().includes('lost'))
  const hasGroupApi    = apiFiles.some(f => f.toLowerCase().includes('group'))
  const hasErrandApi   = apiFiles.some(f => f.toLowerCase().includes('errand'))
  checkWarn(hasTradeApi,  '存在交易 API 模块')
  checkWarn(hasLostApi,   '存在失物招领 API 模块')
  checkWarn(hasGroupApi,  '存在拼单搭子 API 模块')
  checkWarn(hasErrandApi, '存在跑腿委托 API 模块')

  info('Task 3: 列表渲染组件')
  const hasItemCard   = exists('src/components/ItemCard.vue') || exists('src/components/MarketItemCard.vue')
  const hasEmptyState = exists('src/components/EmptyState.vue')
  check(hasItemCard,   '列表卡片组件存在 (ItemCard / MarketItemCard)')
  check(hasEmptyState, 'EmptyState.vue 空状态组件存在')

  info('Task 4: 页面数据请求')
  const tradeViewContent = readText('src/views/TradeView.vue')
  check(
    tradeViewContent.includes('getTrades') || tradeViewContent.includes('onMounted') || tradeViewContent.includes('fetch'),
    'TradeView.vue 包含数据请求逻辑'
  )

  info('Task 5: JSON Server 启动命令')
  const scripts = JSON.parse(readText('package.json') || '{}').scripts || {}
  check(scripts.mock && scripts.mock.includes('json-server'), 'package.json 包含 mock 命令')

  info('Task 6: 证据卡')
  checkEvidence(3)
  const d3 = readText('docs/evidence/Day3_Evidence.md')
  const hasD3Keywords = d3.includes('Mock') || d3.includes('JSON Server') || d3.includes('列表渲染')
  check(hasD3Keywords, 'Day3 证据卡包含核心关键词')
}

// ============================================================
// DAY 4: 发布表单与数据新增
// ============================================================
if (runAll || targetDay === 4) {
  hr('DAY 4 — 发布表单与数据新增')

  info('Task 1: 发布页面表单')
  checkFile(['src', 'views', 'PublishView.vue'], 'PublishView.vue 发布页面')
  checkFile(['src', 'components', 'PublishForm.vue'], 'PublishForm.vue 发布表单组件')

  // 检查 PublishForm.vue（实际表单逻辑所在）或 PublishView.vue
  const publishContent = readText('src/views/PublishView.vue')
  const publishFormContent = readText('src/components/PublishForm.vue')
  const pubAllContent = publishContent + publishFormContent

  check(pubAllContent.includes('<form') || pubAllContent.includes('submit') || pubAllContent.includes('@submit'),
    '发布页面/表单包含表单结构')
  check(pubAllContent.includes('v-model') || pubAllContent.includes('ref(') || pubAllContent.includes('reactive('),
    '发布页面使用响应式数据绑定')

  info('Task 2: FormField 组件')
  checkFile(['src', 'components', 'FormField.vue'], 'FormField.vue 表单项组件')

  info('Task 3: 表单校验')
  const hasValidation = pubAllContent.includes('error') || pubAllContent.includes('validate') ||
    pubAllContent.includes('校验') || pubAllContent.includes('required') || pubAllContent.includes('Error')
  check(hasValidation, '发布页面/表单包含校验逻辑')

  info('Task 4: POST 请求方法')
  const allApiContent = apiFiles.map(f => readText('src/api', f)).join('\n')
  const hasPostMethod = allApiContent.includes('.post(') || allApiContent.includes('createItem') ||
    allApiContent.includes('createTrade') || allApiContent.includes('createLostFound') ||
    allApiContent.includes('createGroupBuy') || allApiContent.includes('createErrand')
  check(hasPostMethod, 'API 模块包含 POST/Create 方法')

  info('Task 5: 提交后跳转')
  const hasRedirect = pubAllContent.includes('router.push') || pubAllContent.includes('router.replace') ||
    pubAllContent.includes('useRouter')
  check(hasRedirect, '发布成功后包含页面跳转逻辑')

  info('Task 6: 证据卡')
  checkEvidence(4)
  const d4 = readText('docs/evidence/Day4_Evidence.md')
  const hasD4Keywords = d4.includes('发布表单') || d4.includes('表单校验') || d4.includes('数据新增')
  check(hasD4Keywords, 'Day4 证据卡包含核心关键词')
}

// ============================================================
// DAY 5: Pinia 状态管理与用户中心
// ============================================================
if (runAll || targetDay === 5) {
  hr('DAY 5 — Pinia 状态管理与用户中心')

  info('Task 1: Pinia Store 文件')
  checkFile(['src', 'stores', 'user.ts'], 'user.ts 用户状态 Store')
  checkFile('src/stores/favorite.ts', 'favorite.ts 收藏状态 Store')

  const userStoreContent = readText('src/stores/user.ts')
  check(userStoreContent.includes('defineStore'), 'user.ts 正确定义 Pinia Store')
  check(userStoreContent.includes('currentUser') || userStoreContent.includes('profile') || userStoreContent.includes('name'),
    'user.ts 包含用户信息状态')

  const favStoreContent = readText('src/stores/favorite.ts')
  check(favStoreContent.includes('defineStore'), 'favorite.ts 正确定义 Pinia Store')
  check(favStoreContent.includes('favorite') || favStoreContent.includes('Favorite'), 'favorite.ts 包含收藏状态')

  info('Task 2: Pinia 挂载')
  const mainFull = readText('src/main.ts')
  check(mainFull.includes('createPinia') || mainFull.includes('pinia'), 'main.ts 挂载了 Pinia')

  info('Task 3: 跨组件使用 Store')
  const publishFull = readText('src/views/PublishView.vue') + readText('src/components/PublishForm.vue')
  const headerFull  = readText('src/components/AppHeader.vue')
  const usesUserStore = publishFull.includes('useUserStore') || headerFull.includes('useUserStore')
  check(usesUserStore, 'PublishView/PublishForm 或 AppHeader 使用了 userStore')

  const tradeFull = readText('src/views/TradeView.vue') + readText('src/views/MarketListView.vue')
  const usesFavStore = tradeFull.includes('useFavoriteStore') || tradeFull.includes('favoriteStore')
  checkWarn(usesFavStore, '列表页面使用了 favoriteStore（收藏功能）')

  info('Task 4: 用户中心页面')
  checkFile(['src', 'views', 'UserCenterView.vue'], 'UserCenterView.vue 用户中心')
  const userCenterContent = readText('src/views/UserCenterView.vue')
  check(userCenterContent.includes('useUserStore') || userCenterContent.includes('userStore'),
    'UserCenterView 使用了用户状态')
  check(userCenterContent.includes('useFavoriteStore') || userCenterContent.includes('favoriteStore') ||
    userCenterContent.includes('收藏') || userCenterContent.includes('favorite'),
    'UserCenterView 展示收藏内容')

  info('Task 5: 证据卡')
  checkEvidence(5)
  const d5 = readText('docs/evidence/Day5_Evidence.md')
  const hasD5Keywords = d5.includes('Pinia') || d5.includes('状态管理') || d5.includes('用户中心')
  check(hasD5Keywords, 'Day5 证据卡包含核心关键词')
}

// ============================================================
// DAY 6: 交互优化与体验完善
// ============================================================
if (runAll || targetDay === 6) {
  hr('DAY 6 — 交互优化与体验完善')

  info('Task 1: 状态反馈组件')
  checkFile(['src', 'components', 'LoadingState.vue'], 'LoadingState.vue 加载状态组件')
  checkFile(['src', 'components', 'ErrorState.vue'], 'ErrorState.vue 错误状态组件')
  checkFile(['src', 'components', 'EmptyState.vue'], 'EmptyState.vue 空状态组件')

  info('Task 2: 搜索组件')
  checkFile(['src', 'components', 'SearchBar.vue'], 'SearchBar.vue 搜索组件')

  info('Task 3: 列表页面状态使用')
  // 检查至少一个页面使用了 loading/error 状态
  const allViews = filesInDir(join(ROOT, 'src', 'views'))
  let hasLoading = false, hasErrorState = false, hasSearch = false
  for (const v of allViews) {
    const c = readText('src/views', v)
    if (c.includes('LoadingState') || c.includes('loading')) hasLoading = true
    if (c.includes('ErrorState')  || c.includes("error.value")) hasErrorState = true
    if (c.includes('SearchBar')   || c.includes('search')    || c.includes('keyword') || c.includes('filter')) hasSearch = true
  }
  check(hasLoading,    '列表页面包含加载状态')
  check(hasErrorState, '列表页面包含错误状态')
  check(hasSearch,     '列表页面包含搜索/筛选功能')

  info('Task 4: 表单交互优化')
  const pubContent = readText('src/views/PublishView.vue') + readText('src/components/PublishForm.vue')
  check(pubContent.includes('disabled') || pubContent.includes('submitting'),
    '发布按钮有禁用状态（防重复提交）')

  info('Task 5: 证据卡')
  checkEvidence(6)
  const d6 = readText('docs/evidence/Day6_Evidence.md')
  const hasD6Keywords = d6.includes('交互优化') || d6.includes('加载状态') || d6.includes('错误状态')
  check(hasD6Keywords, 'Day6 证据卡包含核心关键词')
}

// ============================================================
// DAY 7: 综合验收与项目展示
// ============================================================
if (runAll || targetDay === 7) {
  hr('DAY 7 — 综合验收与项目展示')

  info('Task 1: README 完整性')
  checkFile('README.md', 'README.md 项目说明文档')
  const readme = readText('README.md')
  check(readme.length > 500, `README.md 内容: ${readme.length} 字符（> 500）`)
  check(readme.includes('校园轻集市'), 'README 包含项目名称')
  check(readme.includes('技术栈') || readme.includes('Vue') || readme.includes('TypeScript'), 'README 说明技术栈')
  check(readme.includes('运行') || readme.includes('启动') || readme.includes('dev') || readme.includes('mock'),
    'README 包含运行说明')
  check(!readme.includes('真实登录') && !readme.includes('支付系统') && !readme.includes('后台管理'),
    'README 没有虚构未实现功能（如真实登录/支付/后台管理）')

  info('Task 2: 全部证据卡检查')
  for (let d = 1; d <= 7; d++) checkEvidence(d)

  info('Task 3: AI 协作记录')
  checkFile(['docs', 'ai', 'AI_Collaboration_Card.md'], 'AI_Collaboration_Card.md AI 协作记录')
  const aiCard = readText('docs/ai/AI_Collaboration_Card.md')
  check(aiCard.length > 200, `AI 协作记录: ${aiCard.length} 字符（> 200）`)

  info('Task 4: 展示提纲')
  const hasPresentation = exists('docs/PRESENTATION.md')
  check(hasPresentation, 'docs/PRESENTATION.md 项目展示提纲')

  info('Task 5: 构建检查')
  try {
    execSync('npx vue-tsc --build', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', timeout: 60000 })
    ok('TypeScript 类型检查通过')
    report('- TypeScript 类型检查: ✅ 通过')
  } catch (e) {
    fail('TypeScript 类型检查失败')
    report(`- TypeScript 类型检查: ❌ 失败\n  \`\`\`\n${e.stderr || e.message}\n  \`\`\``)
  }

  try {
    execSync('npx vite build', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', timeout: 60000 })
    ok('Vite 生产构建通过')
    report('- Vite 生产构建: ✅ 通过')
  } catch (e) {
    fail('Vite 生产构建失败')
    report(`- Vite 生产构建: ❌ 失败\n  \`\`\`\n${e.stderr || e.message}\n  \`\`\``)
  }

  info('Task 6: Git 提交记录检查')
  const commits = countCommits()
  const msgs    = commitMessages()
  const hasDayCommits = []
  for (let d = 1; d <= 7; d++) {
    const found = msgs.toLowerCase().includes(`day${d}`)
    hasDayCommits.push(found)
    if (found) ok(`Git 提交包含 Day${d}`)
    else warn(`Git 提交未明确包含 Day${d}`)
  }
  check(commits >= 7, `Git 总提交数: ${commits}（>= 7 为佳）`)
  report(`- Git 提交数: ${commits}`)
  report(`- Day1-Day7 提交覆盖: ${hasDayCommits.filter(Boolean).length}/7`)

  info('Task 7: 检测报告')
  checkFile('CHECK_REPORT.md', 'CHECK_REPORT.md 检测报告')
}

// ============================================================
// 最终汇总
// ============================================================
hr('检测汇总')

const pct = totalPass + totalFail + totalWarn > 0
  ? Math.round((totalPass / (totalPass + totalFail + totalWarn)) * 100)
  : 100

console.log(`  ✅ 通过: ${totalPass}`)
console.log(`  ❌ 失败: ${totalFail}`)
console.log(`  ⚠️  警告: ${totalWarn}`)
console.log(`  📊 通过率: ${pct}%\n`)

report(`\n## 汇总\n`)
report(`| 指标 | 数值 |`)
report(`|------|------|`)
report(`| 通过 | ${totalPass} |`)
report(`| 失败 | ${totalFail} |`)
report(`| 警告 | ${totalWarn} |`)
report(`| 通过率 | ${pct}% |`)

// 写入 CHECK_REPORT.md
reportLines.push('')
const finalReport = reportLines.join('\n')
const reportPath = join(ROOT, 'CHECK_REPORT.md')
import('fs').then(fs => {
  fs.writeFileSync(reportPath, finalReport, 'utf-8')
})

if (totalFail > 0) {
  console.log('  ⚠️  存在未通过项，请根据上方提示修复后重新执行检测。')
  process.exit(1)
} else {
  console.log('  🎉 所有检查项通过！项目可以提交验收。')
  process.exit(0)
}

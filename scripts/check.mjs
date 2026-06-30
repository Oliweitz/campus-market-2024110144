#!/usr/bin/env node
// ============================================================
// 校园轻集市 — Day 检测脚本
// 用法: npm run check -- --day=4
// ============================================================

import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const args = process.argv.slice(2)
const day = args.find((a) => a.startsWith('--day='))?.split('=')[1] || '4'

let passed = 0
let failed = 0

function check(description, condition) {
  if (condition) {
    console.log(`  [PASS] ${description}`)
    passed++
  } else {
    console.log(`  [FAIL] ${description}`)
    failed++
  }
}

console.log(`\nDay${day} 检测\n`)

if (day === '4') {
  // 文件存在性
  const publishViewExists = existsSync(resolve(root, 'src/views/PublishView.vue'))
  check('PublishView.vue 存在', publishViewExists)

  check('FormField.vue 存在', existsSync(resolve(root, 'src/components/FormField.vue')))

  const publishFormExists = existsSync(resolve(root, 'src/components/PublishForm.vue'))
  check('PublishForm.vue 存在', publishFormExists)

  // 表单结构
  if (publishFormExists) {
    const content = readFileSync(resolve(root, 'src/components/PublishForm.vue'), 'utf-8')
    check('包含表单结构 (form 标签)', content.includes('<form'))
    check('包含表单校验 (validateForm)', content.includes('validateForm'))
    check('包含数据提交 (createItem / POST)', content.includes('createItem'))
    check('支持四种发布类型切换', ['secondhand', 'lostfound', 'group', 'errand'].every((t) => content.includes(t)))
    check('二手交易包含商品分类字段 (category)', content.includes('category'))
    check('失物招领包含物品名称字段 (itemName)', content.includes('itemName'))
    check('失物招领包含联系方式字段 (contact)', content.includes('contact'))
    check('拼单搭子包含拼单类型字段 (groupType)', content.includes('groupType'))
    check('跑腿委托包含任务类型字段 (taskType)', content.includes('taskType'))
    check('跑腿委托包含取件/送达地点 (from/to)', content.includes('from') && content.includes('to'))
    check('跑腿委托包含截止时间校验 (deadline)', /errand[\s\S]*deadline/.test(content))
  }

  // API 方法
  const apiExists = existsSync(resolve(root, 'src/api/itemApi.ts'))
  check('itemApi.ts 存在', apiExists)
  if (apiExists) {
    const apiContent = readFileSync(resolve(root, 'src/api/itemApi.ts'), 'utf-8')
    check('itemApi.ts 包含 POST 方法 (createItem)', apiContent.includes('createItem') && apiContent.includes('.post'))
  }

  // 证据卡
  const evidenceExists = existsSync(resolve(root, 'docs/evidence/Day4_Evidence.md'))
  check('Day4_Evidence.md 存在', evidenceExists)
  if (evidenceExists) {
    const evContent = readFileSync(resolve(root, 'docs/evidence/Day4_Evidence.md'), 'utf-8')
    const empty = evContent.trim().length === 0
    check('证据卡非空', !empty)
    if (!empty) {
      check('证据卡包含"发布表单"', evContent.includes('发布表单'))
      check('证据卡包含"表单校验"', evContent.includes('表单校验'))
      check('证据卡包含"数据新增"', evContent.includes('数据新增'))
      check('证据卡字数 ≥ 300', evContent.length >= 300)
    }
  }

  // 数据模型包含新字段
  const listingsExists = existsSync(resolve(root, 'src/data/listings.ts'))
  if (listingsExists) {
    const lc = readFileSync(resolve(root, 'src/data/listings.ts'), 'utf-8')
    check('Item 接口包含 category 字段', lc.includes('category'))
    check('Item 接口包含 itemName 字段', lc.includes('itemName'))
    check('Item 接口包含 contact 字段', lc.includes('contact'))
    check('Item 接口包含 taskType 字段', lc.includes('taskType'))
    check('Item 接口包含 from/to 字段', lc.includes('from') && lc.includes('to'))
    check('Item 接口包含 groupType 字段', lc.includes('groupType'))
  }
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败, ${passed + failed} 总计\n`)
process.exit(failed > 0 ? 1 : 0)

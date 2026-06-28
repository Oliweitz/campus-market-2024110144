// ============================================================
// 校园轻集市 — 常量配置
// ============================================================

/** JSON Server 基础地址 */
/** JSON Server 地址 — 开发时通过 Vite proxy 转发 /api → localhost:3000 */
export const API_BASE_URL = '/api'

/** 分页默认配置 */
export const PAGE_SIZE = 10

/** localStorage 键名 */
export const LS_KEYS = {
  CURRENT_USER_ID: 'campus_market_user_id',
  SEARCH_HISTORY: 'campus_market_search_history',
  PREFERRED_CAMPUS: 'campus_market_preferred_campus',
} as const

/** 默认头像背景色 */
export const AVATAR_COLORS = [
  '#5b9bd5', '#6dbd7a', '#e88c8c', '#d4a853',
  '#8e7cc3', '#56b4a8', '#e6735c', '#7ab8f5',
]

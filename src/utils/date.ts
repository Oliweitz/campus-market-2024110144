// ============================================================
// 校园轻集市 — 时间格式化工具
// ============================================================

/**
 * 格式化日期时间
 * @param dateStr ISO 字符串或 "YYYY-MM-DD HH:mm:ss" 格式
 * @param format 输出格式: 'full' | 'date' | 'time' | 'relative'
 */
export function formatDate(
  dateStr: string,
  format: 'full' | 'date' | 'time' | 'relative' = 'date',
): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const pad = (n: number) => String(n).padStart(2, '0')

  const y = d.getFullYear()
  const M = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())

  switch (format) {
    case 'full':
      return `${y}-${M}-${day} ${h}:${m}:${s}`
    case 'date':
      return `${y}-${M}-${day}`
    case 'time':
      return `${h}:${m}`
    case 'relative':
      return relativeTime(d)
    default:
      return `${y}-${M}-${day}`
  }
}

/** 相对时间描述 */
function relativeTime(d: Date): string {
  const now = Date.now()
  const diff = now - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(d.toISOString(), 'date')
}

/** 获取当前时间字符串 (用于 createdAt / updatedAt) */
export function now(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

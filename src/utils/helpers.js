export const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export const todayShort = () => DAYS[new Date().getDay()]
export const todayFull  = () => DAYS_FULL[new Date().getDay()]

export const formatTime = t => {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 || 12
  return `${hh}:${m.toString().padStart(2,'0')} ${ampm}`
}

export const daysUntil = dateStr => {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d - today) / 86400000)
}

export const urgencyLabel = dl => {
  if (dl === null) return 'safe'
  if (dl < 0) return 'urgent'
  if (dl === 0) return 'urgent'
  if (dl <= 2) return 'urgent'
  if (dl <= 5) return 'warn'
  if (dl <= 10) return 'ok'
  return 'safe'
}

export const urgencyText = dl => {
  if (dl === null) return 'No date'
  if (dl < 0) return `${Math.abs(dl)}d overdue`
  if (dl === 0) return 'Due today'
  if (dl === 1) return 'Tomorrow'
  return `${dl}d left`
}

export const formatDate = dateStr => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
}

export const getPanicLevel = (deadlines) => {
  const now = new Date(); now.setHours(0,0,0,0)
  const active = deadlines.filter(d => !d.done)
  const overdue = active.filter(d => daysUntil(d.date) < 0).length
  const dueThisWeek = active.filter(d => { const dl = daysUntil(d.date); return dl >= 0 && dl <= 7 }).length
  const dueToday = active.filter(d => daysUntil(d.date) === 0).length
  const score = (overdue * 30) + (dueToday * 20) + (dueThisWeek * 5)
  if (score === 0 && active.length === 0) return { level: 0, label: 'Chill', emoji: '🟢', color: '#34D399' }
  if (score <= 15) return { level: 1, label: 'Busy', emoji: '🟡', color: '#FBBF24' }
  if (score <= 40) return { level: 2, label: 'Dangerous', emoji: '🟠', color: '#F97316' }
  return { level: 3, label: 'Academic Apocalypse', emoji: '🔴', color: '#F87171' }
}

export const getSemesterHealth = (deadlines) => {
  const total = deadlines.length
  if (total === 0) return 85
  const done = deadlines.filter(d => d.done).length
  const overdue = deadlines.filter(d => !d.done && daysUntil(d.date) < 0).length
  const base = total > 0 ? (done / total) * 100 : 80
  const penalty = overdue * 8
  return Math.max(10, Math.min(100, Math.round(base - penalty + 20)))
}

export const getLevelInfo = (xp) => {
  const level = Math.floor(xp / 200) + 1
  const currentLevelXP = (level - 1) * 200
  const nextLevelXP = level * 200
  const progress = ((xp - currentLevelXP) / 200) * 100
  return { level, progress, xpToNext: nextLevelXP - xp, currentXP: xp - currentLevelXP }
}

export const COURSE_COLORS = [
  '#D946EF','#A855F7','#EC4899','#3B82F6','#06B6D4','#10B981','#F59E0B','#EF4444'
]

export function timeToMins(t) {
  if (!t) return 0
  const [h,m] = t.split(':').map(Number)
  return h * 60 + m
}

export function isoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}
export const FRIEND_COLORS = ['#D946EF','#A855F7','#EC4899','#3B82F6','#06B6D4','#10B981','#F59E0B','#EF4444']

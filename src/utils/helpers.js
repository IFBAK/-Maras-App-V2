export const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
export const DAYS_FULL = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export function todayShort() {
  const map = [6,0,1,2,3,4,5]
  return DAYS[map[new Date().getDay()]]
}

// kept as alias for old code
export function todayName() { return todayShort() }

export function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
}

export function formatDateShort(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' })
}

export function daysUntil(str) {
  if (!str) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const t = new Date(str + 'T00:00:00')
  return Math.ceil((t - today) / 86400000)
}

export function urgencyLabel(days) {
  if (days === null) return 'low'
  if (days < 0) return 'overdue'
  if (days <= 2) return 'high'
  if (days <= 7) return 'medium'
  return 'low'
}

export function urgencyText(days) {
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today!'
  if (days === 1) return 'Tomorrow'
  return `${days}d left`
}

export function formatTime(t) {
  if (!t) return ''
  const [h,m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  return `${h%12||12}:${String(m).padStart(2,'0')} ${ap}`
}

export function timeToMins(t) {
  if (!t) return 0
  const [h,m] = t.split(':').map(Number)
  return h*60+m
}

export const COURSE_COLORS = [
  '#C084FC', // orchid
  '#F472B6', // rose
  '#E3A361', // warm amber
  '#7FB99D', // sage
  '#8FA3D9', // dusty periwinkle
  '#D98FB5', // dusty mauve
  '#B97A9B', // plum-rose
  '#7AAFC2', // dusty teal
  '#D67D7D', // muted terracotta
  '#A78BCE', // soft violet
  '#C9A876', // warm taupe
  '#6FA8A0', // muted teal-sage
]

export const CLASS_COLORS = COURSE_COLORS.map(value => ({ value }))

export const FRIEND_COLORS = [
  '#F472B6', '#8FA3D9', '#7FB99D', '#E3A361',
  '#B97A9B', '#7AAFC2', '#A78BCE', '#D67D7D',
]

export function getWeekDates(offset = 0) {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  return Array.from({length:7}, (_,i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function isoDate(d) {
  return d.toISOString().split('T')[0]
}

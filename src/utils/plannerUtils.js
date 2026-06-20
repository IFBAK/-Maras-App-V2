import { daysUntil, timeToMins, DAYS, DAYS_FULL } from './helpers'

// ── FREE TIME FINDER ──────────────────────────────────────────────────────────
export function findFreeSlots(slots, deadlines) {
  const todayIdx = new Date().getDay()
  const todayKey = DAYS[todayIdx]
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const DAY_START = 8 * 60
  const DAY_END = 22 * 60

  const busy = (dayKey) =>
    slots
      .filter(s => s.days?.includes(dayKey))
      .map(s => ({ start: timeToMins(s.startTime), end: timeToMins(s.endTime) }))
      .sort((a, b) => a.start - b.start)

  const gaps = (dayKey, fromMins = DAY_START) => {
    const result = []
    let cursor = fromMins
    for (const sl of busy(dayKey)) {
      if (sl.start > cursor + 29) result.push({ start: cursor, end: sl.start })
      cursor = Math.max(cursor, sl.end)
    }
    if (cursor < DAY_END - 29) result.push({ start: cursor, end: DAY_END })
    return result
  }

  const todayGaps = gaps(todayKey, Math.max(DAY_START, nowMins + 5))
  const nextSlot = todayGaps[0] || null
  const longestToday = todayGaps.reduce((b, g) => (g.end - g.start) > ((b?.end - b?.start) || 0) ? g : b, null)

  let longestWeek = null
  for (let d = 0; d < 7; d++) {
    const dayIdx = (todayIdx + d) % 7
    const dayKey = DAYS[dayIdx]
    const from = d === 0 ? Math.max(DAY_START, nowMins + 5) : DAY_START
    for (const g of gaps(dayKey, from)) {
      g.dayOffset = d
      g.dayKey = dayKey
      g.dayFull = DAYS_FULL[dayIdx]
      if (!longestWeek || (g.end - g.start) > (longestWeek.end - longestWeek.start)) longestWeek = g
    }
  }

  return { nextSlot, longestToday, longestWeek, todayGaps }
}

function minsToTime(mins) {
  const h = Math.floor(mins / 60), m = mins % 60
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export function formatSlot(slot) {
  if (!slot) return null
  return {
    start: minsToTime(slot.start),
    end: minsToTime(slot.end),
    duration: slot.end - slot.start,
    dayKey: slot.dayKey,
    dayFull: slot.dayFull,
    dayOffset: slot.dayOffset ?? 0,
  }
}

// ── STUDY SESSION PLANNER ─────────────────────────────────────────────────────
export function generateStudyPlan(deadlines) {
  const active = deadlines
    .filter(d => !d.done)
    .map(d => {
      const dl = daysUntil(d.date)
      const remaining = Math.max(0.5, (d.estimatedHours || 2) * (1 - (d.progress || 0) / 100))
      const urgency = dl !== null ? Math.max(0, 100 - dl * 8) : 50
      const priority = Math.min(100, Math.round((d.importance || 5) * 5 + urgency * 0.6))
      return { ...d, dl, remaining, priority }
    })
    .sort((a, b) => b.priority - a.priority)

  const make = (items, maxHrs, reason) =>
    items.slice(0, 3).map(d => ({
      id: d.id, title: d.title, type: d.type,
      minutes: Math.round(Math.min(d.remaining, maxHrs) * 60),
      priority: d.priority, reason: typeof reason === 'function' ? reason(d) : reason,
    }))

  return {
    today:    make(active.filter(d => d.dl !== null && d.dl <= 1), 2,   d => d.dl === 0 ? 'Due today!' : 'Due tomorrow'),
    tomorrow: make(active.filter(d => d.dl !== null && d.dl > 1 && d.dl <= 5), 1.5, d => `Due in ${d.dl} days`),
    upcoming: make(active.filter(d => d.dl !== null && d.dl > 5), 1,   d => `Due in ${d.dl} days — start early`),
  }
}

// ── WORKLOAD FORECAST ─────────────────────────────────────────────────────────
export function getWorkloadForecast(deadlines) {
  const today = new Date()
  const build = days => Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dls = deadlines.filter(dl => !dl.done && dl.date === dateStr)
    const hours = dls.reduce((s, dl) => s + ((dl.estimatedHours || 2) * (1 - (dl.progress || 0) / 100)), 0)
    return {
      date: dateStr, deadlineCount: dls.length,
      hours: Math.round(hours * 10) / 10,
      dayLabel: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
    }
  })
  return { forecast7: build(7), forecast30: build(30) }
}

// ── BURNOUT PREDICTOR ─────────────────────────────────────────────────────────
export function getBurnoutRisk(deadlines, focusSessions, gamification) {
  const overdue  = deadlines.filter(d => !d.done && daysUntil(d.date) < 0).length
  const dueSoon  = deadlines.filter(d => !d.done && daysUntil(d.date) >= 0 && daysUntil(d.date) <= 3).length
  const active   = deadlines.filter(d => !d.done).length
  const weekAgo  = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const recentHrs= focusSessions.filter(s => new Date(s.date) > weekAgo).reduce((s, f) => s + (f.minutes || 0), 0) / 60
  const streakBonus = gamification.streak >= 7 ? -10 : gamification.streak === 0 ? 10 : 0

  let score = overdue * 20 + dueSoon * 12 + Math.max(0, active - 5) * 5
  score += recentHrs > 30 ? 20 : recentHrs > 20 ? 10 : 0
  score += streakBonus
  score = Math.max(0, Math.min(100, score))

  if (score < 25) return { score, level: 'Low',      color: '#34D399', emoji: '🟢', advice: "You're balanced. Keep it up!" }
  if (score < 50) return { score, level: 'Moderate', color: '#FBBF24', emoji: '🟡', advice: 'Take regular breaks and stick to your routine.' }
  if (score < 75) return { score, level: 'High',     color: '#F97316', emoji: '🟠', advice: 'Reduce workload. Schedule a proper rest day soon.' }
  return          { score, level: 'Critical',         color: '#F87171', emoji: '🔴', advice: 'Stop and rest. Your wellbeing comes before grades.' }
}

// ── AI ACADEMIC COACH ─────────────────────────────────────────────────────────
export function getCoachRecommendations(deadlines, focusSessions, gamification) {
  const recs = []
  const today = new Date()
  const active = deadlines.filter(d => !d.done).map(d => ({ ...d, dl: daysUntil(d.date) }))

  const overdue  = active.filter(d => d.dl < 0)
  const dueToday = active.filter(d => d.dl === 0)
  const dueSoon  = active.filter(d => d.dl > 0 && d.dl <= 3)
  const thisWeek = active.filter(d => d.dl > 3 && d.dl <= 7)

  if (active.length > 0) recs.push({ icon: '📋', text: `You have ${active.length} active deadline${active.length !== 1 ? 's' : ''} to manage.` })
  if (overdue.length > 0) recs.push({ icon: '🚨', text: `${overdue.length} overdue task${overdue.length !== 1 ? 's' : ''} need immediate attention.`, urgent: true })
  if (dueToday.length > 0) recs.push({ icon: '⚡', text: `${dueToday.map(d => `"${d.title}"`).join(', ')} — due today. Prioritise these now.`, urgent: true })

  const top = active.filter(d => d.dl >= 0).sort((a, b) => {
    const pa = (a.importance||5)*5 + Math.max(0,100-(a.dl*8))*0.6
    const pb = (b.importance||5)*5 + Math.max(0,100-(b.dl*8))*0.6
    return pb - pa
  })[0]
  if (top) recs.push({ icon: '🎯', text: `"${top.title}" should be your top priority right now.` })

  const todayFocusMins = focusSessions
    .filter(s => new Date(s.date).toDateString() === today.toDateString())
    .reduce((s, f) => s + (f.minutes || 0), 0)

  if (todayFocusMins === 0) recs.push({ icon: '⏱️', text: 'Schedule a 60-minute focus session today to stay on track.' })
  else if (todayFocusMins < 60) recs.push({ icon: '⏱️', text: `${todayFocusMins}m of focus today. Push to at least 60 minutes.` })
  else recs.push({ icon: '✅', text: `Great — ${todayFocusMins}m of focus today. You're on track.` })

  if (gamification.streak >= 7) recs.push({ icon: '🔥', text: `${gamification.streak}-day streak! Consistency is your superpower.` })
  else if (gamification.streak === 0) recs.push({ icon: '📅', text: 'Log in daily to build your streak and earn bonus XP.' })

  if (thisWeek.length > 0) {
    const hrs = thisWeek.reduce((s, d) => s + (d.estimatedHours || 2), 0)
    recs.push({ icon: '📊', text: `${thisWeek.length} deadline${thisWeek.length !== 1 ? 's' : ''} due this week — roughly ${hrs}h of work ahead.` })
  }

  return recs.slice(0, 5)
}

// ── GPA PREDICTOR ─────────────────────────────────────────────────────────────
export const GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
}
export const GRADE_OPTIONS = Object.keys(GRADE_POINTS)

export function calculateGPA(courses, expectedGrades) {
  const graded = courses.filter(c => expectedGrades[c.id])
  if (!graded.length) return null
  const totalCredits = graded.reduce((s, c) => s + (Number(c.credits) || 3), 0)
  const totalPoints  = graded.reduce((s, c) => s + (GRADE_POINTS[expectedGrades[c.id]] ?? 0) * (Number(c.credits) || 3), 0)
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : null
}

export function getGPAColor(gpa) {
  if (gpa === null) return 'var(--muted)'
  if (gpa >= 3.5) return 'var(--good)'
  if (gpa >= 2.5) return 'var(--warn)'
  return 'var(--urgent)'
}

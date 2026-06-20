import { useMemo } from 'react'
import { ACHIEVEMENTS } from '../hooks/useAchievements'
import './SemesterReplay.css'

function getLevelFromXP(xp) { return Math.floor((xp || 0) / 200) + 1 }

export default function SemesterReplay({ deadlines, focusSessions, gamification, onBack }) {
  const stats = useMemo(() => {
    const completed   = deadlines.filter(d => d.done).length
    const total       = deadlines.length
    const focusMins   = focusSessions.reduce((s, f) => s + (f.minutes || 0), 0)
    const focusHours  = Math.round(focusMins / 60 * 10) / 10
    const streak      = gamification.streak || 0
    const xp          = gamification.xp || 0
    const level       = getLevelFromXP(xp)
    const sessions    = gamification.totalSessions || 0
    const unlocked    = (gamification.achievements || [])
      .map(id => ACHIEVEMENTS.find(a => a.id === id))
      .filter(Boolean)
    const healthScore = total > 0 ? Math.max(10, Math.min(100, Math.round(completed / total * 100))) : 85

    return { completed, total, focusHours, streak, xp, level, sessions, unlocked, healthScore }
  }, [deadlines, focusSessions, gamification])

  const message =
    stats.completed >= 20 ? "🚀 Incredible semester! You absolutely crushed it." :
    stats.completed >= 10 ? "💪 Solid work this semester. Keep building momentum!" :
    stats.completed >= 5  ? "📈 Good start. Next semester, let's push even harder." :
                            "📚 Every step counts. You've laid the foundation — keep going!"

  return (
    <div className="page replay-page">
      <div className="replay-topbar">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
        <h1 className="page-title" style={{ flex: 1, textAlign: 'center' }}>Semester Replay</h1>
      </div>

      <div className="replay-hero">
        <div className="replay-trophy">🎓</div>
        <div className="replay-heading">Your Semester in Review</div>
        <div className="replay-subhead">Here's everything you accomplished</div>
      </div>

      <div className="replay-grid">
        {[
          { emoji: '✅', val: stats.completed,   label: 'Deadlines Done' },
          { emoji: '📋', val: stats.total,        label: 'Total Deadlines' },
          { emoji: '⏱️', val: `${stats.focusHours}h`, label: 'Focus Hours' },
          { emoji: '🔥', val: stats.streak,       label: 'Longest Streak' },
          { emoji: '⚡', val: stats.xp,           label: 'XP Earned' },
          { emoji: '🏆', val: `Lv.${stats.level}`,label: 'Level Reached' },
          { emoji: '🔮', val: stats.sessions,     label: 'Focus Sessions' },
          { emoji: '❤️', val: `${stats.healthScore}%`, label: 'Health Score' },
        ].map(({ emoji, val, label }) => (
          <div key={label} className="replay-stat">
            <div className="replay-stat-emoji">{emoji}</div>
            <div className="replay-stat-val">{val}</div>
            <div className="replay-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {stats.unlocked.length > 0 && (
        <div className="replay-section">
          <div className="replay-section-title">Achievements Unlocked</div>
          <div className="replay-ach-list">
            {stats.unlocked.map(a => (
              <div key={a.id} className="replay-ach">
                <span className="replay-ach-emoji">{a.emoji}</span>
                <span className="replay-ach-name">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="replay-message">{message}</div>

      <div style={{ height: 24 }}/>
    </div>
  )
}

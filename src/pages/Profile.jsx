import { useState } from 'react'
import { Edit2, Check, X, ChevronRight } from 'lucide-react'
import { getLevelInfo } from '../utils/helpers'
import { ACHIEVEMENTS, RARITY_COLORS } from '../hooks/useAchievements'
import './Profile.css'

export default function Profile({ profile, updateProfile, showToast, onBack, gamification, onReplay }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...profile })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const g = gamification || { xp: 0, level: 1, streak: 0, totalSessions: 0, completedDeadlines: 0, achievements: [] }
  const levelInfo = getLevelInfo(g.xp)
  const unlockedIds = g.achievements || []

  const handleSave = () => { updateProfile(form); setEditing(false); showToast('Profile updated ✓') }

  const fields = [
    ['name', 'Full Name', 'text'],
    ['studentId', 'Student ID', 'text'],
    ['university', 'University', 'text'],
    ['department', 'Department', 'text'],
    ['semester', 'Semester', 'text'],
    ['email', 'Email', 'email'],
  ]

  return (
    <div className="page profile-page">
      <div className="profile-topbar">
        <button className="btn-icon" onClick={onBack}><X size={18}/></button>
        <h1 className="page-title" style={{ flex: 1 }}>Profile</h1>
        <button className="btn btn-secondary btn-sm" onClick={onReplay} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          🎓 Replay
        </button>
        <button className="btn-icon" onClick={() => setEditing(e => !e)}>
          {editing ? <Check size={18} color="var(--good)"/> : <Edit2 size={18}/>}
        </button>
      </div>

      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-av">{(profile.name || '?')[0].toUpperCase()}</div>
        <div className="profile-name">{profile.name || 'Your Name'}</div>
        <div className="profile-uni">
          {[profile.university, profile.department].filter(Boolean).join(' · ') || 'Add your university'}
        </div>
        <div className="profile-badges">
          <span className="profile-badge">LVL {levelInfo.level}</span>
          <span className="profile-badge">⚡ {g.xp} XP</span>
          {g.streak > 0 && <span className="profile-badge">🔥 {g.streak}d streak</span>}
        </div>
        {/* XP bar */}
        <div className="profile-xp-row">
          <span>LVL {levelInfo.level}</span>
          <div className="profile-xp-track">
            <div className="profile-xp-fill" style={{ width: `${levelInfo.progress}%` }}/>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>{levelInfo.xpToNext} XP to next</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="profile-stats">
        {[
          { emoji: '🎯', val: g.completedDeadlines || 0, label: 'Completed' },
          { emoji: '🔥', val: g.streak || 0,             label: 'Day Streak' },
          { emoji: '⏱️', val: g.totalSessions || 0,      label: 'Sessions' },
          { emoji: '⭐', val: g.xp || 0,                 label: 'Total XP' },
        ].map(({ emoji, val, label }) => (
          <div key={label} className="profile-stat-card">
            <div className="profile-stat-emoji">{emoji}</div>
            <div className="profile-stat-val">{val}</div>
            <div className="profile-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements gallery */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div className="profile-section-title">Achievements</div>
          <div className="profile-section-sub">{unlockedIds.length}/{ACHIEVEMENTS.length} unlocked</div>
        </div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedIds.includes(a.id)
            const rc = RARITY_COLORS[a.rarity]
            return (
              <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : ''}`}
                style={unlocked ? { '--ach-color': rc, borderColor: rc + '40', background: `rgba(${hexToRgb(rc)},0.06)` } : {}}>
                <div className="achievement-emoji" style={{ filter: unlocked ? 'none' : 'grayscale(1) brightness(0.25)' }}>
                  {a.emoji}
                </div>
                <div className="achievement-name" style={{ color: unlocked ? rc : 'var(--muted)' }}>{a.name}</div>
                <div className="achievement-desc">{a.desc}</div>
                {unlocked && (
                  <div className="achievement-rarity" style={{ color: rc, borderColor: rc + '50' }}>
                    {a.rarity}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile info */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div className="profile-section-title">About You</div>
        </div>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map(([k, l, t]) => (
              <div className="field" key={k}>
                <label>{l}</label>
                <input type={t} value={form[k] || ''} onChange={e => set(k, e.target.value)} placeholder={l}/>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={handleSave}>Save Profile</button>
          </div>
        ) : (
          <div className="profile-info-list">
            {fields.map(([k, l]) => profile[k] ? (
              <div key={k} className="profile-info-row">
                <span className="profile-info-label">{l}</span>
                <span className="profile-info-val">{profile[k]}</span>
              </div>
            ) : null)}
            {!profile.name && (
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setEditing(true)}>
                Complete your profile →
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ height: 24 }}/>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

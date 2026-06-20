import { useState, useEffect, useCallback } from 'react'
import { Bell, ChevronRight, Zap, Target, TrendingUp, Clock } from 'lucide-react'
import { todayShort, daysUntil, urgencyLabel, urgencyText, DAYS, DAYS_FULL, getPanicLevel, getSemesterHealth, getLevelInfo } from '../utils/helpers'
import './Dashboard.css'

function SemesterHealth({ score }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 44, circ = 2 * Math.PI * r
  const dash = circ * (displayed / 100)

  useEffect(() => {
    let frame, start = null, from = 0, to = score
    const animate = (ts) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / 1200, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      setDisplayed(Math.round(from + (to - from) * ease))
      if (prog < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const color = score >= 70 ? '#34D399' : score >= 40 ? '#FBBF24' : '#F87171'

  return (
    <div className="health-widget">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
        <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{filter:`drop-shadow(0 0 8px ${color})`, transition:'stroke-dasharray 0.1s'}}
        />
        <text x={50} y={46} textAnchor="middle" fill={color} fontSize={18} fontWeight={800} fontFamily="Inter">{displayed}</text>
        <text x={50} y={60} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily="Inter">HEALTH</text>
      </svg>
    </div>
  )
}

function PanicMeter({ deadlines }) {
  const panic = getPanicLevel(deadlines)
  return (
    <div className="panic-widget">
      <div className="panic-label">PANIC METER™</div>
      <div className="panic-levels">
        {[
          {l:0,e:'🟢',t:'Chill'},
          {l:1,e:'🟡',t:'Busy'},
          {l:2,e:'🟠',t:'Danger'},
          {l:3,e:'🔴',t:'Apocalypse'},
        ].map(({l,e,t}) => (
          <div key={l} className={`panic-level ${panic.level === l ? 'active' : ''}`}>
            <span>{e}</span>
            <span className="panic-level-text">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NextCountdown({ deadline }) {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0 })

  useEffect(() => {
    if (!deadline) return
    const tick = () => {
      const now = Date.now()
      const end = new Date(deadline.date + 'T23:59:59').getTime()
      const diff = Math.max(0, end - now)
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  if (!deadline) return (
    <div className="countdown-widget empty">
      <div className="cw-label">NEXT DEADLINE</div>
      <div className="cw-none">No upcoming deadlines 🎉</div>
    </div>
  )

  return (
    <div className="countdown-widget">
      <div className="cw-label">NEXT DEADLINE</div>
      <div className="cw-title">{deadline.title}</div>
      <div className="cw-timer">
        {[{v:time.d,u:'d'},{v:time.h,u:'h'},{v:time.m,u:'m'},{v:time.s,u:'s'}].map(({v,u},i) => (
          <span key={u} className="cw-seg">
            <span className="cw-num">{String(v).padStart(2,'0')}</span>
            <span className="cw-unit">{u}</span>
            {i < 3 && <span className="cw-colon">:</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

function DeadlineHeatmap({ deadlines }) {
  const today = new Date()
  const cells = Array.from({length:35}, (_,i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 27 + i)
    const dateStr = d.toISOString().split('T')[0]
    const count = deadlines.filter(dl => dl.date === dateStr && !dl.done).length
    return { dateStr, count }
  })
  const max = Math.max(1, ...cells.map(c => c.count))

  return (
    <div className="heatmap-widget">
      <div className="section-label">WORKLOAD HEATMAP</div>
      <div className="heatmap-grid">
        {cells.map((c,i) => {
          const intensity = c.count / max
          const alpha = c.count === 0 ? 0.06 : 0.15 + intensity * 0.85
          return (
            <div key={i} className="heatmap-cell" title={`${c.dateStr}: ${c.count} deadline(s)`}
              style={{background: c.count === 0 ? 'rgba(255,255,255,0.04)' : `rgba(168,85,247,${alpha})`,
                boxShadow: c.count > 0 ? `0 0 ${c.count * 4}px rgba(168,85,247,${intensity * 0.5})` : 'none'}}
            />
          )
        })}
      </div>
      <div className="heatmap-legend">
        <span style={{color:'var(--muted)', fontSize:11}}>Light = Low</span>
        <div className="heatmap-grad"/>
        <span style={{color:'var(--muted)', fontSize:11}}>Dark = Heavy</span>
      </div>
    </div>
  )
}

function XPBar({ gamification }) {
  const info = getLevelInfo(gamification.xp)
  return (
    <div className="xp-widget">
      <div className="xp-top">
        <div>
          <span className="xp-level">LVL {info.level}</span>
          <span className="xp-num">{gamification.xp} XP</span>
        </div>
        <span className="xp-next">{info.xpToNext} to next</span>
      </div>
      <div className="xp-track">
        <div className="xp-fill" style={{width:`${info.progress}%`}}/>
      </div>
    </div>
  )
}

export default function Dashboard({ profile, courses, slots, deadlines, friends, notifGranted, setNotifGranted, showToast, onNavigate, gamification }) {
  const todayShortStr = todayShort()
  const todayIdx = DAYS.indexOf(todayShortStr)
  const todayFullStr = DAYS_FULL[todayIdx] || todayShortStr
  const dateStr = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long' })

  const todaySlots = slots
    .filter(s => s.days.includes(todayShortStr))
    .sort((a,b) => a.startTime.localeCompare(b.startTime))

  const enriched = deadlines.map(d => ({ ...d, dl: daysUntil(d.date) }))
  const activeDeadlines = enriched.filter(d => !d.done)
  const dueTodayList   = activeDeadlines.filter(d => d.dl === 0)
  const nextDeadline   = activeDeadlines.filter(d => d.dl >= 0).sort((a,b)=>(a.dl??999)-(b.dl??999))[0]
  const upcoming       = activeDeadlines.sort((a,b)=>(a.dl??999)-(b.dl??999)).slice(0,3)
  const overdue        = activeDeadlines.filter(d => d.dl < 0)
  const healthScore    = getSemesterHealth(deadlines)
  const displayName    = profile.name?.split(' ')[0] || 'Scholar'

  const handleNotif = async () => {
    if (!('Notification' in window)) { showToast('Notifications not supported'); return }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') { setNotifGranted(true); showToast('🔔 Notifications enabled') }
    else { showToast('Permission denied') }
  }

  const formatTime = t => {
    if (!t) return ''
    const [h,m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h%12||12}:${m.toString().padStart(2,'0')} ${ampm}`
  }

  return (
    <div className="page dash-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">Hey, <span className="glow-text">{displayName}</span></h1>
          <span className="dash-sub">{todayFullStr} · {dateStr}</span>
        </div>
        <button className="avatar-btn" onClick={() => onNavigate('profile')}>
          <span className="avatar-char">{(profile.name||'?')[0].toUpperCase()}</span>
        </button>
      </div>

      {/* XP Bar */}
      {gamification && <XPBar gamification={gamification} />}

      {/* Hero Grid: Health + Panic */}
      <div className="hero-grid">
        <div className="glass-card hero-card health-card">
          <SemesterHealth score={healthScore} />
          <div className="health-info">
            <div className="health-title">Semester Health</div>
            <div className="health-sub">{healthScore >= 70 ? 'On track 🎯' : healthScore >= 40 ? 'Needs attention' : 'Critical!'}</div>
          </div>
        </div>
        <div className="glass-card hero-card panic-card">
          <PanicMeter deadlines={deadlines} />
        </div>
      </div>

      {/* Countdown */}
      <div className="glass-card countdown-card" onClick={() => onNavigate('deadlines')}>
        <NextCountdown deadline={nextDeadline} />
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <button className="stat-pill" onClick={() => onNavigate('deadlines')}>
          <Target size={16} className="stat-icon" />
          <span className="stat-val">{activeDeadlines.length}</span>
          <span className="stat-lbl">Active</span>
        </button>
        <button className="stat-pill warn" onClick={() => onNavigate('deadlines')}>
          <Zap size={16} className="stat-icon" />
          <span className="stat-val">{overdue.length}</span>
          <span className="stat-lbl">Overdue</span>
        </button>
        <button className="stat-pill good" onClick={() => onNavigate('routine')}>
          <Clock size={16} className="stat-icon" />
          <span className="stat-val">{todaySlots.length}</span>
          <span className="stat-lbl">Today</span>
        </button>
        <button className="stat-pill accent" onClick={() => onNavigate('courses')}>
          <TrendingUp size={16} className="stat-icon" />
          <span className="stat-val">{courses.length}</span>
          <span className="stat-lbl">Courses</span>
        </button>
      </div>

      {/* Due today alert */}
      {dueTodayList.length > 0 && (
        <div className="alert-banner">
          <div className="alert-dot"/>
          <span>⚡ Due today: {dueTodayList.map(d=>d.title).join(', ')}</span>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {upcoming.length > 0 && (
        <section className="dash-section">
          <div className="section-header">
            <div className="section-label">UPCOMING</div>
            <button className="see-all" onClick={() => onNavigate('deadlines')}>See all →</button>
          </div>
          <div className="deadline-list">
            {upcoming.map(d => {
              const course = courses.find(c => c.id === d.courseId)
              const urg = urgencyLabel(d.dl)
              return (
                <button key={d.id} className="deadline-item" onClick={() => onNavigate('deadlines')}>
                  <div className="dl-left">
                    <div className="dl-indicator" style={{background: course?.color || 'var(--primary)'}}/>
                    <div>
                      <div className="dl-title">{d.title}</div>
                      <div className="dl-course">{course?.code || 'No course'} · {d.type}</div>
                    </div>
                  </div>
                  <div className={`dl-urgency u-${urg}`}>{urgencyText(d.dl)}</div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Today's Classes */}
      <section className="dash-section">
        <div className="section-header">
          <div className="section-label">TODAY'S CLASSES</div>
          <button className="see-all" onClick={() => onNavigate('routine')}>Manage →</button>
        </div>
        {todaySlots.length === 0 ? (
          <div className="empty-state">
            <span>No classes today · </span>
            <button className="link-btn" onClick={() => onNavigate('routine')}>Add routine</button>
          </div>
        ) : (
          <div className="class-list">
            {todaySlots.map(s => {
              const c = courses.find(x => x.id === s.courseId)
              const color = c?.color || 'var(--primary)'
              return (
                <div key={s.id} className="class-item">
                  <div className="class-bar" style={{background:color}}/>
                  <div className="class-info">
                    <span className="class-code" style={{color}}>{c?.code || s.customName || 'Class'}</span>
                    <span className="class-name">{c?.name || ''}{s.type ? ` · ${s.type}` : ''}</span>
                  </div>
                  <span className="class-time">{formatTime(s.startTime)}{s.room ? ` · ${s.room}` : ''}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Heatmap */}
      <DeadlineHeatmap deadlines={deadlines} />

      {/* Notif prompt */}
      {!notifGranted && (
        <button className="notif-prompt" onClick={handleNotif}>
          <Bell size={16}/> Enable deadline alerts
        </button>
      )}

      <div style={{height:20}}/>
    </div>
  )
}

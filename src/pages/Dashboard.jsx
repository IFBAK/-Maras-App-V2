import { useState } from 'react'
import { todayShort, formatTime, daysUntil, urgencyLabel, urgencyText, DAYS_FULL, DAYS } from '../utils/helpers'
import './Dashboard.css'

export default function Dashboard({ profile, courses, slots, deadlines, friends, notifGranted, setNotifGranted, showToast, onNavigate }) {
  const todayIdx = DAYS.indexOf(todayShort())
  const todayFull = DAYS_FULL[todayIdx] || todayShort()
  const dateStr = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })

  const todaySlots = slots
    .filter(s => s.days.includes(todayShort()))
    .sort((a,b) => a.startTime.localeCompare(b.startTime))

  const enriched = deadlines.map(d => ({ ...d, dl: daysUntil(d.date) }))
  const activeDeadlines = enriched.filter(d => !d.done)
  const overdueCount   = activeDeadlines.filter(d => d.dl < 0).length
  const dueTodayList   = activeDeadlines.filter(d => d.dl === 0)
  const upcoming       = activeDeadlines.sort((a,b)=>(a.dl??999)-(b.dl??999)).slice(0,4)

  const totalCredits = courses.reduce((s,c)=>s+(Number(c.credits)||0),0)

  const handleNotif = async () => {
    if (!('Notification' in window)) { showToast('Notifications not supported'); return }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifGranted(true)
      showToast('🔔 Notifications enabled!')
      new Notification("Mara's Planner", { body: "You'll be reminded of deadlines on time!" })
    } else { showToast('Notification permission denied') }
  }

  const displayName = profile.name || 'there'

  return (
    <div className="page dash-page">
      {/* Hero */}
      <div className="dash-hero">
        <div>
          <span className="dash-hey">Hey, {displayName} 👋</span>
          <span className="dash-sub">{todayFull} · {dateStr}</span>
        </div>
        {!notifGranted && (
          <button className="notif-pill" onClick={handleNotif}>🔔 Alerts</button>
        )}
      </div>

      {/* Profile strip */}
      <div className="profile-strip" onClick={()=>onNavigate('profile')}>
        <div className="ps-avatar">{(profile.name||'?')[0].toUpperCase()}</div>
        <div className="ps-info">
          <div className="ps-name">{profile.name || 'Set up your profile'}</div>
          <div className="ps-meta">
            {[profile.university, profile.semester && `Sem ${profile.semester}`, profile.studentId && `ID: ${profile.studentId}`].filter(Boolean).join(' · ') || 'Tap to add your details'}
          </div>
        </div>
        <span className="ps-arrow">›</span>
      </div>

      {/* Stats row */}
      <div className="stat-row">
        <div className={`stat-card ${overdueCount>0?'urgent':''}`} onClick={()=>onNavigate('deadlines')}>
          <span className="sc-value" style={{color: overdueCount>0?'var(--red)':'var(--txt)'}}>
            {activeDeadlines.length}
          </span>
          <span className="sc-label">Deadlines</span>
        </div>
        <div className="stat-card" onClick={()=>onNavigate('routine')}>
          <span className="sc-value">{todaySlots.length}</span>
          <span className="sc-label">Classes today</span>
        </div>
        <div className="stat-card" onClick={()=>onNavigate('courses')}>
          <span className="sc-value">{courses.length}</span>
          <span className="sc-label">Courses</span>
        </div>
        <div className="stat-card">
          <span className="sc-value">{totalCredits || '—'}</span>
          <span className="sc-label">Credits</span>
        </div>
      </div>

      {/* Deadline today alert */}
      {dueTodayList.length > 0 && (
        <div className="alert-banner">
          <span className="ab-icon">⚠️</span>
          <div>
            <div className="ab-title">Deadline today!</div>
            <div className="ab-sub">{dueTodayList.map(d=>d.title).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Today's classes */}
      <section>
        <div className="section-label">My classes today</div>
        {todaySlots.length === 0 ? (
          <div className="dash-empty-row">
            <span>No classes today 🎉</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate('routine')}>+ Add</button>
          </div>
        ) : (
          <div className="today-slots">
            {todaySlots.map(s => {
              const c = courses.find(x=>x.id===s.courseId)
              const color = c?.color || '#7c6af7'
              return (
                <div key={s.id} className="today-slot" style={{'--c':color}}>
                  <div className="ts-bar"/>
                  <div className="ts-body">
                    <div className="ts-name">{c?.name || s.customName || 'Class'}</div>
                    <div className="ts-meta">
                      {s.type && <span style={{fontSize:11,fontWeight:600,color:'var(--txt-3)',fontFamily:'var(--mono)',marginRight:6}}>{s.type}</span>}
                      {formatTime(s.startTime)} – {formatTime(s.endTime)}{s.room ? ` · ${s.room}` : ''}
                    </div>
                  </div>
                  {c?.code && <span className="ts-code">{c.code}</span>}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <section>
          <div className="section-label">Coming up</div>
          <div className="upcoming-list">
            {upcoming.map(d => {
              const urg = urgencyLabel(d.dl)
              const course = courses.find(c=>c.id===d.courseId)
              return (
                <div key={d.id} className="upcoming-item" onClick={()=>onNavigate('deadlines')}>
                  <div className={`ui-bar urg-${urg}`}/>
                  <div className="ui-info">
                    <div className="ui-title">{d.title}</div>
                    <div className="ui-sub">
                      {course && <span>{course.code||course.name}</span>}
                      {d.type && <span style={{color:'var(--txt-3)'}}>{course?' · ':''}{d.type}</span>}
                    </div>
                  </div>
                  <span className={`tag tag-${urg}`}>{urgencyText(d.dl)}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <div className="section-label">Quick actions</div>
        <div className="qa-row">
          <button className="qa-btn" onClick={()=>onNavigate('deadlines')}>
            <span>⏳</span>Add deadline
          </button>
          <button className="qa-btn" onClick={()=>onNavigate('routine')}>
            <span>⊞</span>Add class
          </button>
          <button className="qa-btn" onClick={()=>onNavigate('calendar')}>
            <span>⬡</span>Calendar
          </button>
        </div>
      </section>
    </div>
  )
}

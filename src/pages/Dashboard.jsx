import { Bell, ChevronRight, FileText, FlaskConical, GraduationCap, Layers, Presentation as PresentationIcon, Upload, HelpCircle, Tag } from 'lucide-react'
import { todayShort, formatTime, daysUntil, urgencyLabel, urgencyText, DAYS_FULL, DAYS } from '../utils/helpers'
import './Dashboard.css'

const TYPE_ICON = {
  Assignment: FileText, Quiz: HelpCircle, Midterm: GraduationCap, Final: GraduationCap,
  'Lab Report': FlaskConical, Project: Layers, Presentation: PresentationIcon, Submission: Upload, Other: Tag,
}

export default function Dashboard({ profile, courses, slots, deadlines, friends, notifGranted, setNotifGranted, showToast, onNavigate }) {
  const todayIdx = DAYS.indexOf(todayShort())
  const todayFull = DAYS_FULL[todayIdx] || todayShort()
  const dateStr = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long' })

  const todaySlots = slots
    .filter(s => s.days.includes(todayShort()))
    .sort((a,b) => a.startTime.localeCompare(b.startTime))

  const enriched = deadlines.map(d => ({ ...d, dl: daysUntil(d.date) }))
  const activeDeadlines = enriched.filter(d => !d.done)
  const dueTodayList   = activeDeadlines.filter(d => d.dl === 0)
  const upcoming       = activeDeadlines.sort((a,b)=>(a.dl??999)-(b.dl??999)).slice(0,4)

  const totalCredits = courses.reduce((s,c)=>s+(Number(c.credits)||0),0)

  const handleNotif = async () => {
    if (!('Notification' in window)) { showToast('Notifications not supported'); return }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifGranted(true)
      showToast('Notifications enabled')
      new Notification("Mara's Planner", { body: "You'll be reminded of deadlines on time." })
    } else { showToast('Permission denied') }
  }

  const displayName = profile.name?.split(' ')[0] || 'there'

  return (
    <div className="page dash-page">
      {/* Hero */}
      <div className="dash-hero">
        <div>
          <h1 className="dash-greeting serif">Hello, {displayName}</h1>
          <span className="dash-sub">{todayFull} · {dateStr}</span>
        </div>
        {!notifGranted && (
          <button className="notif-link" onClick={handleNotif}><Bell size={15} strokeWidth={1.6}/> Enable alerts</button>
        )}
      </div>

      {/* Profile line */}
      <button className="profile-line" onClick={()=>onNavigate('profile')}>
        <span className="pl-avatar serif">{(profile.name||'?')[0].toUpperCase()}</span>
        <span className="pl-text">
          <span className="pl-name">{profile.name || 'Set up your profile'}</span>
          <span className="pl-meta">
            {[profile.university, profile.semester && `Semester ${profile.semester}`].filter(Boolean).join(' · ') || 'Tap to add your details'}
          </span>
        </span>
        <ChevronRight size={16} strokeWidth={1.6} style={{color:'var(--txt-3)'}}/>
      </button>

      {/* Editorial stats row */}
      <div className="stat-row">
        <button className="stat" onClick={()=>onNavigate('deadlines')}>
          <span className="stat-num serif">{activeDeadlines.length}</span>
          <span className="stat-label">Deadlines</span>
        </button>
        <div className="stat-divider"/>
        <button className="stat" onClick={()=>onNavigate('routine')}>
          <span className="stat-num serif">{todaySlots.length}</span>
          <span className="stat-label">Classes today</span>
        </button>
        <div className="stat-divider"/>
        <button className="stat" onClick={()=>onNavigate('courses')}>
          <span className="stat-num serif">{courses.length}</span>
          <span className="stat-label">Courses</span>
        </button>
        <div className="stat-divider"/>
        <div className="stat">
          <span className="stat-num serif">{totalCredits || '—'}</span>
          <span className="stat-label">Credits</span>
        </div>
      </div>

      {/* Deadline today notice — plain line, no boxed alert */}
      {dueTodayList.length > 0 && (
        <div className="due-today-line">
          <span className="dot" style={{background:'var(--urgent)'}}/>
          <span><strong>Due today —</strong> {dueTodayList.map(d=>d.title).join(', ')}</span>
        </div>
      )}

      {/* Today's classes */}
      <section className="dash-section">
        <div className="section-label">Today's classes</div>
        {todaySlots.length === 0 ? (
          <div className="dash-empty-line">
            <span>Nothing scheduled today</span>
            <button className="btn-ghost-link" onClick={()=>onNavigate('routine')}>Add class</button>
          </div>
        ) : (
          <div className="elist">
            {todaySlots.map(s => {
              const c = courses.find(x=>x.id===s.courseId)
              const color = c?.color || 'var(--accent)'
              return (
                <div key={s.id} className="erow class-row">
                  <span className="class-bar" style={{background:color}}/>
                  <div className="class-info">
                    <span className="class-code" style={{color}}>{c?.code || s.customName || 'Class'}</span>
                    <span className="class-name">{c?.name || ''}{s.type ? `${c?.name?' · ':''}${s.type}` : ''}</span>
                  </div>
                  <span className="class-time">{formatTime(s.startTime)}{s.room ? ` · ${s.room}` : ''}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <section className="dash-section">
          <div className="section-label">Coming up</div>
          <div className="elist">
            {upcoming.map(d => {
              const urg = urgencyLabel(d.dl)
              const course = courses.find(c=>c.id===d.courseId)
              const Icon = TYPE_ICON[d.type] || Tag
              return (
                <button key={d.id} className="erow dl-row" onClick={()=>onNavigate('deadlines')}>
                  <Icon size={16} strokeWidth={1.6} style={{color:'var(--txt-3)',flexShrink:0}}/>
                  <div className="dl-info">
                    <span className="dl-title">{d.title}</span>
                    <span className="dl-meta">{course ? (course.code||course.name) : 'No course'}</span>
                  </div>
                  <span className={`utext u-${urg}`}>{urgencyText(d.dl)}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick actions — ghost links, not boxes */}
      <section className="dash-section">
        <div className="section-label">Quick actions</div>
        <div className="qa-row">
          <button className="qa-link" onClick={()=>onNavigate('deadlines')}>Add deadline</button>
          <button className="qa-link" onClick={()=>onNavigate('routine')}>Add class</button>
          <button className="qa-link" onClick={()=>onNavigate('calendar')}>Open calendar</button>
        </div>
      </section>
    </div>
  )
}

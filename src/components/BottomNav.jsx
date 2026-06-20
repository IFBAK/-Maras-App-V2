import { useState } from 'react'
import { Home, Target, BarChart2, CalendarDays, BookOpen, MoreHorizontal, Clock, Calendar, Users, CheckSquare, BookMarked, Users2, X } from 'lucide-react'

const PRIMARY_TABS = [
  { id: 'dashboard',  icon: Home,         label: 'Home' },
  { id: 'deadlines',  icon: Target,       label: 'Deadlines' },
  { id: 'analytics',  icon: BarChart2,    label: 'Analytics' },
  { id: 'timeline',   icon: CalendarDays, label: 'Timeline' },
  { id: 'focus',      icon: BookOpen,     label: 'Focus' },
]

const MORE_TABS = [
  { id: 'courses',    icon: BookMarked,   label: 'Courses' },
  { id: 'routine',    icon: Clock,        label: 'Routine' },
  { id: 'calendar',   icon: Calendar,     label: 'Calendar' },
  { id: 'friends',    icon: Users,        label: 'Friends' },
  { id: 'attendance', icon: CheckSquare,  label: 'Attendance' },
  { id: 'journal',    icon: BookOpen,     label: 'Journal' },
  { id: 'groups',     icon: Users2,       label: 'Groups' },
]

export default function BottomNav({ active, onChange }) {
  const [showMore, setShowMore] = useState(false)
  const isMoreActive = MORE_TABS.some(t => t.id === active)

  const handlePrimary = id => { setShowMore(false); onChange(id) }
  const handleMore    = id => { setShowMore(false); onChange(id) }

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <>
          <div className="more-overlay" onClick={() => setShowMore(false)} />
          <div className="more-drawer">
            <div className="more-drawer-title">More pages</div>
            <div className="more-grid">
              {MORE_TABS.map(({ id, icon: Icon, label }) => (
                <button key={id} className={`more-item ${active === id ? 'active' : ''}`}
                  onClick={() => handleMore(id)}>
                  <div className="more-item-icon"><Icon size={20} strokeWidth={1.8}/></div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <nav className="bottom-nav">
        {PRIMARY_TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} className={`nav-item ${active === id ? 'active' : ''}`}
            onClick={() => handlePrimary(id)}>
            <div className="nav-icon-wrap">
              <Icon size={22} strokeWidth={active === id ? 2.2 : 1.8} />
              {active === id && <div className="nav-dot" />}
            </div>
            <span className="nav-label">{label}</span>
          </button>
        ))}
        <button className={`nav-item ${isMoreActive || showMore ? 'active' : ''}`}
          onClick={() => setShowMore(s => !s)}>
          <div className="nav-icon-wrap">
            {showMore ? <X size={22} strokeWidth={2.2}/> : <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.2 : 1.8}/>}
            {(isMoreActive || showMore) && <div className="nav-dot" />}
          </div>
          <span className="nav-label">{isMoreActive ? MORE_TABS.find(t=>t.id===active)?.label : 'More'}</span>
        </button>
      </nav>
    </>
  )
}

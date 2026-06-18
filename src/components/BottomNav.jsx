import { Home, BookOpen, LayoutGrid, ListChecks, Calendar, Users } from 'lucide-react'
import './BottomNav.css'

const TABS = [
  { id:'dashboard', icon:Home,        label:'Home'      },
  { id:'courses',   icon:BookOpen,    label:'Courses'   },
  { id:'routine',   icon:LayoutGrid,  label:'Routine'   },
  { id:'deadlines', icon:ListChecks,  label:'Deadlines' },
  { id:'calendar',  icon:Calendar,    label:'Calendar'  },
  { id:'friends',   icon:Users,       label:'Friends'   },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bnav">
      {TABS.map(t => {
        const Icon = t.icon
        const isActive = active === t.id
        return (
          <button key={t.id} className={`bnav-item ${isActive?'active':''}`} onClick={()=>onChange(t.id)}>
            <Icon size={19} strokeWidth={1.6}/>
            <span className="bnav-label">{t.label}</span>
            <span className="bnav-indicator"/>
          </button>
        )
      })}
    </nav>
  )
}

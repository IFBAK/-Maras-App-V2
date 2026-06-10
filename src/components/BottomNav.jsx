import './BottomNav.css'

const TABS = [
  { id:'dashboard', icon:'⊡', label:'Home'     },
  { id:'courses',   icon:'📚', label:'Courses'  },
  { id:'routine',   icon:'⊞', label:'Routine'  },
  { id:'deadlines', icon:'⏳', label:'Deadlines'},
  { id:'calendar',  icon:'⬡', label:'Calendar' },
  { id:'friends',   icon:'⊛', label:'Friends'  },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bnav">
      {TABS.map(t => (
        <button key={t.id} className={`bnav-item ${active===t.id?'active':''}`} onClick={()=>onChange(t.id)}>
          <span className="bnav-icon">{t.icon}</span>
          <span className="bnav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

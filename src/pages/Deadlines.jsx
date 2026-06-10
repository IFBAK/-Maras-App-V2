import { useState, useEffect } from 'react'
import { daysUntil, urgencyLabel, urgencyText, formatDate } from '../utils/helpers'
import './Deadlines.css'

const DL_TYPES = ['Assignment','Quiz','Midterm','Final','Lab Report','Project','Presentation','Submission','Other']

const TYPE_ICON = {
  Assignment:   '📝',
  Quiz:         '🧪',
  Midterm:      '📖',
  Final:        '🎯',
  'Lab Report': '🔬',
  Project:      '🛠️',
  Presentation: '🎤',
  Submission:   '📤',
  Other:        '📌',
}

export default function Deadlines({ deadlines, courses, addDeadline, updateDeadline, deleteDeadline, toggleDeadline, notifGranted, showToast }) {
  const [modal,      setModal]      = useState(null)
  const [view,       setView]       = useState('timeline')   // timeline | course
  const [statusTab,  setStatusTab]  = useState('active')     // active | done | all
  const [courseFilter, setCourseFilter] = useState('all')
  const [confirmDel, setConfirmDel] = useState(null)

  useEffect(() => {
    if (!notifGranted || !('Notification' in window)) return
    const today = new Date().toISOString().split('T')[0]
    deadlines.forEach(d => {
      if (!d.done && d.date === today) {
        const key = `nf_${d.id}_${today}`
        if (!sessionStorage.getItem(key)) {
          new Notification('⏳ Deadline today!', { body: `${d.title} is due today!`, icon: '/pwa-192x192.png' })
          sessionStorage.setItem(key, '1')
        }
      }
    })
  }, [deadlines, notifGranted])

  const enriched = deadlines.map(d => ({
    ...d,
    dl: daysUntil(d.date),
    course: courses.find(c => c.id === d.courseId),
  }))

  const activeCount  = enriched.filter(d => !d.done).length
  const overdueCount = enriched.filter(d => !d.done && d.dl < 0).length

  // Apply status + course filters
  const filtered = enriched
    .filter(d => statusTab === 'active' ? !d.done : statusTab === 'done' ? d.done : true)
    .filter(d => courseFilter === 'all' || d.courseId === courseFilter)
    .sort((a, b) => a.done !== b.done ? (a.done ? 1 : -1) : (a.dl ?? 999) - (b.dl ?? 999))

  const handleSave = (form) => {
    if (modal === 'add') { addDeadline(form); showToast('✅ Deadline added') }
    else { updateDeadline(modal.id, form); showToast('✏️ Updated') }
    setModal(null)
  }

  // ── Timeline grouping (group by date label) ──────────────────────────────
  const timelineGroups = (() => {
    const groups = {}
    filtered.forEach(d => {
      const key = d.done ? '__done__' : (d.dl < 0 ? '__overdue__' : d.date)
      if (!groups[key]) groups[key] = []
      groups[key].push(d)
    })
    // Sort keys: overdue first, then by date asc, done last
    const keys = Object.keys(groups).sort((a, b) => {
      if (a === '__overdue__') return -1
      if (b === '__overdue__') return  1
      if (a === '__done__')    return  1
      if (b === '__done__')    return -1
      return a.localeCompare(b)
    })
    return keys.map(k => ({ key: k, items: groups[k] }))
  })()

  // ── By Course grouping ───────────────────────────────────────────────────
  const courseGroups = (() => {
    const groups = {}
    filtered.forEach(d => {
      const key = d.courseId || '__none__'
      if (!groups[key]) groups[key] = []
      groups[key].push(d)
    })
    return Object.entries(groups).map(([key, items]) => ({
      key,
      course: courses.find(c => c.id === key) || null,
      items: items.sort((a, b) => (a.dl ?? 999) - (b.dl ?? 999)),
    })).sort((a, b) => {
      if (!a.course) return  1
      if (!b.course) return -1
      return (a.course.code || a.course.name).localeCompare(b.course.code || b.course.name)
    })
  })()

  const groupLabel = (key) => {
    if (key === '__overdue__') return '⚠️ Overdue'
    if (key === '__done__')    return '✓ Completed'
    const d = new Date(key + 'T00:00:00')
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = Math.round((d - today) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })
  }

  return (
    <div className="page dl-page">
      {/* Header */}
      <div className="page-hd">
        <div>
          <h1 className="page-title">Deadlines</h1>
          {overdueCount > 0 && <div className="overdue-badge">⚠️ {overdueCount} overdue</div>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>+ Add</button>
      </div>

      {/* View toggle */}
      <div className="dl-top-bar">
        <div className="view-toggle">
          <button className={`vt-btn ${view==='timeline'?'active':''}`} onClick={()=>setView('timeline')}>Timeline</button>
          <button className={`vt-btn ${view==='course'?'active':''}`} onClick={()=>setView('course')}>By Course</button>
        </div>
        <div className="status-tabs">
          {[['active', `Active${activeCount ? ` (${activeCount})` : ''}`], ['done','Done'], ['all','All']].map(([v,l]) => (
            <button key={v} className={`filter-tab ${statusTab===v?'active':''}`} onClick={()=>setStatusTab(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Course filter pills — only in timeline view */}
      {view === 'timeline' && courses.length > 0 && (
        <div className="course-pills">
          <button className={`course-pill ${courseFilter==='all'?'active':''}`} onClick={()=>setCourseFilter('all')}>All</button>
          {courses.map(c => (
            <button
              key={c.id}
              className={`course-pill ${courseFilter===c.id?'active':''}`}
              style={courseFilter===c.id ? {borderColor:c.color, background:c.color+'20', color:c.color} : {}}
              onClick={()=>setCourseFilter(f=>f===c.id?'all':c.id)}
            >
              {c.code || c.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="ei">{statusTab==='done'?'🏆':'📋'}</span>
          <p>{statusTab==='done' ? 'Nothing completed yet.' : 'No deadlines here. Add one!'}</p>
        </div>
      ) : view === 'timeline' ? (
        <div className="dl-timeline">
          {timelineGroups.map(({ key, items }) => (
            <div key={key} className="tl-group">
              <div className={`tl-group-hd ${key==='__overdue__'?'overdue':''} ${key==='__done__'?'done':''}`}>
                {groupLabel(key)}
              </div>
              {items.map(d => (
                <DeadlineCard
                  key={d.id} d={d}
                  onEdit={()=>setModal({id:d.id,...d})}
                  onToggle={()=>toggleDeadline(d.id)}
                  onDelete={()=>setConfirmDel(d.id)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="dl-by-course">
          {courseGroups.map(({ key, course, items }) => (
            <div key={key} className="bc-group">
              <div className="bc-group-hd" style={course ? {'--c':course.color} : {}}>
                {course ? (
                  <>
                    <span className="bc-dot" style={{background:course.color}}/>
                    <span className="bc-code">{course.code || course.name}</span>
                    {course.code && <span className="bc-name">{course.name}</span>}
                  </>
                ) : (
                  <span className="bc-code" style={{color:'var(--txt-3)'}}>No course</span>
                )}
                <span className="bc-count">{items.filter(d=>!d.done).length} pending</span>
              </div>
              {items.map(d => (
                <DeadlineCard
                  key={d.id} d={d}
                  onEdit={()=>setModal({id:d.id,...d})}
                  onToggle={()=>toggleDeadline(d.id)}
                  onDelete={()=>setConfirmDel(d.id)}
                  hideCourse
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {modal && <DeadlineModal initial={modal==='add'?null:modal} courses={courses} onSave={handleSave} onClose={()=>setModal(null)}/>}
      {confirmDel && (
        <div className="overlay" onClick={()=>setConfirmDel(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><span className="modal-title">Remove deadline?</span><button className="modal-x" onClick={()=>setConfirmDel(null)}>✕</button></div>
            <p style={{color:'var(--txt-2)',marginBottom:18,fontSize:13}}>This will permanently delete the deadline.</p>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-secondary" onClick={()=>setConfirmDel(null)} style={{flex:1}}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>{deleteDeadline(confirmDel);setConfirmDel(null);showToast('🗑️ Removed')}} style={{flex:1,padding:'10px 0',borderRadius:'var(--r2)'}}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Deadline Card ─────────────────────────────────────────────────────────── */
function DeadlineCard({ d, onEdit, onToggle, onDelete, hideCourse }) {
  const urg = d.done ? 'done' : urgencyLabel(d.dl)
  return (
    <div className={`dl-card ${d.done?'done':''}`}>
      <button className={`check-btn ${d.done?'checked':''}`} onClick={onToggle}>
        {d.done && '✓'}
      </button>
      <div className="dl-body" onClick={()=>!d.done && onEdit()}>
        <div className="dl-top">
          <div className="dl-title-row">
            {d.type && <span className="dl-type-icon">{TYPE_ICON[d.type]||'📌'}</span>}
            <span className="dl-title">{d.title}</span>
          </div>
          {!d.done && <span className={`tag tag-${urg}`}>{urgencyText(d.dl)}</span>}
        </div>
        <div className="dl-meta">
          {!hideCourse && d.course && (
            <span className="dl-course" style={{color:d.course.color, borderColor:d.course.color+'44', background:d.course.color+'15'}}>
              {d.course.code || d.course.name}
            </span>
          )}
          {d.type && <span className="dl-type">{d.type}</span>}
          <span className="dl-date">📅 {formatDate(d.date)}{d.time ? ` · ${d.time}` : ''}</span>
          <span className={`dot pri-${d.priority}`}/>
        </div>
        {d.notes && <div className="dl-notes">{d.notes}</div>}
      </div>
      <button className="btn btn-icon danger" onClick={onDelete}>🗑️</button>
    </div>
  )
}

/* ── Deadline Modal ─────────────────────────────────────────────────────────── */
function DeadlineModal({ initial, courses, onSave, onClose }) {
  const [f, setF] = useState(initial || {
    title: '', courseId: '', type: 'Assignment',
    date: '', time: '', priority: 'medium', notes: ''
  })
  const set = (k, v) => setF(p => ({...p, [k]: v}))

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">{initial ? 'Edit deadline' : 'Add deadline'}</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input autoFocus placeholder="e.g. Assignment 3" value={f.title} onChange={e=>set('title',e.target.value)}/>
        </div>

        {/* Type pills */}
        <div className="form-group">
          <label>Type</label>
          <div className="type-pills">
            {DL_TYPES.map(t => (
              <button key={t} className={`type-pill ${f.type===t?'active':''}`} onClick={()=>set('type',t)}>
                <span>{TYPE_ICON[t]}</span> {t}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row form-group">
          <div>
            <label>Course</label>
            <select value={f.courseId} onChange={e=>set('courseId',e.target.value)}>
              <option value="">— None —</option>
              {courses.map(c=><option key={c.id} value={c.id}>{c.code ? `${c.code} – ${c.name}` : c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={f.priority} onChange={e=>set('priority',e.target.value)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        <div className="form-row form-group">
          <div>
            <label>Due date *</label>
            <input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/>
          </div>
          <div>
            <label>Due time <span style={{fontWeight:400,color:'var(--txt-3)',textTransform:'none',fontSize:11}}>(optional)</span></label>
            <input type="time" value={f.time||''} onChange={e=>set('time',e.target.value)}/>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea rows={3} placeholder="Details, instructions..." value={f.notes} onChange={e=>set('notes',e.target.value)} style={{resize:'none'}}/>
        </div>

        <div style={{display:'flex',gap:10,marginTop:6}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>f.title.trim()&&f.date&&onSave(f)} disabled={!f.title.trim()||!f.date} style={{flex:2}}>Save deadline</button>
        </div>
      </div>
    </div>
  )
}

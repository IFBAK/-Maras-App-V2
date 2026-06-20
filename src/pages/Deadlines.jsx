import { useState, useEffect } from 'react'
import { Plus, X, Check, Trash2, ChevronDown, ChevronUp, Clock, Target, Zap, BookOpen, ListTodo } from 'lucide-react'
import { daysUntil, urgencyLabel, urgencyText, formatDate } from '../utils/helpers'
import './Deadlines.css'

const DL_TYPES = ['Assignment','Quiz','Midterm','Final','Lab Report','Project','Presentation','Submission','Other']
const TYPE_EMOJI = {
  Assignment:'📝', Quiz:'🧠', Midterm:'📚', Final:'🎓', 'Lab Report':'🔬',
  Project:'⚙️', Presentation:'🎤', Submission:'📤', Other:'📌'
}
const DEFAULT_SUBTASKS = ['Research','Planning','Development','Review','Submission']

function ProgressRing({ value, size = 44, color = 'var(--primary)' }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r, dash = circ * (value / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{filter:`drop-shadow(0 0 4px ${color})`, transition:'stroke-dasharray .5s'}}
      />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={size*0.22} fontWeight={700} fontFamily="Inter">{value}%</text>
    </svg>
  )
}

function PriorityBadge({ score }) {
  const color = score >= 80 ? 'var(--urgent)' : score >= 50 ? 'var(--warn)' : 'var(--good)'
  return (
    <div className="priority-badge" style={{borderColor:color, color}}>
      <Zap size={10} fill="currentColor"/><span>{score}</span>
    </div>
  )
}

function SubtaskPanel({ d, addSubtask, toggleSubtask, deleteSubtask }) {
  const [newTask, setNewTask] = useState('')
  const subtasks = d.subtasks || []
  const done = subtasks.filter(s => s.done).length

  const handleAdd = title => {
    const t = title || newTask.trim()
    if (!t) return
    addSubtask(d.id, { title: t })
    setNewTask('')
  }

  return (
    <div className="subtask-panel">
      <div className="subtask-head">
        <ListTodo size={12} color="var(--muted)"/>
        <span className="subtask-label">Subtasks</span>
        {subtasks.length > 0 && <span className="subtask-count">{done}/{subtasks.length}</span>}
      </div>
      {subtasks.length === 0 && (
        <div className="subtask-defaults">
          {DEFAULT_SUBTASKS.map(t => (
            <button key={t} className="subtask-chip" onClick={() => handleAdd(t)}>{t}</button>
          ))}
        </div>
      )}
      {subtasks.map(s => (
        <div key={s.id} className={`subtask-item ${s.done ? 'done' : ''}`}>
          <button className="subtask-check" onClick={() => toggleSubtask(d.id, s.id)}
            style={{background: s.done?'var(--good)':'transparent', borderColor: s.done?'var(--good)':'rgba(255,255,255,0.2)'}}>
            {s.done && <Check size={9} strokeWidth={3} color="#000"/>}
          </button>
          <span className="subtask-title">{s.title}</span>
          <button className="subtask-del" onClick={() => deleteSubtask(d.id, s.id)}><X size={11}/></button>
        </div>
      ))}
      <div className="subtask-add">
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          placeholder="Add subtask…"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="subtask-input"/>
        <button className="btn btn-secondary btn-sm" onClick={() => handleAdd()} disabled={!newTask.trim()}>+</button>
      </div>
    </div>
  )
}

function DeadlineCard({ d, courses, onToggle, onEdit, onDelete, addXP, incrementCompleted, addSubtask, toggleSubtask, deleteSubtask }) {
  const [expanded, setExpanded] = useState(false)
  const course = courses.find(c => c.id === d.courseId)
  const urg = urgencyLabel(d.dl)
  const color = course?.color || 'var(--primary)'
  const progress = d.progress || 0
  const importance = d.importance || 5
  const urgencyScore = d.dl !== null ? Math.max(0, 100 - (d.dl * 8)) : 0
  const priorityScore = Math.min(100, Math.round((importance * 5) + urgencyScore * 0.6 + (100 - progress) * 0.4))

  const handleToggle = e => {
    e.stopPropagation()
    if (!d.done) { addXP?.(25); incrementCompleted?.() }
    onToggle(d.id)
  }

  return (
    <div className={`dl-card ${d.done?'done':''} ${urg==='urgent'&&!d.done?'urgent':''}`} style={{'--card-color':color}}>
      <div className="dl-card-main" onClick={() => setExpanded(e => !e)}>
        <div className="dl-card-left">
          <button className="dl-check" onClick={handleToggle}
            style={{borderColor: d.done?color:'rgba(255,255,255,0.2)', background: d.done?color:'transparent'}}>
            {d.done && <Check size={12} strokeWidth={3} color="#000"/>}
          </button>
          <div className="dl-card-info">
            <div className="dl-card-title">{d.title}</div>
            <div className="dl-card-meta">
              <span className="dl-type-badge">{TYPE_EMOJI[d.type]||'📌'} {d.type||'Task'}</span>
              {course && <span style={{color}}>{course.code}</span>}
              {(d.subtasks||[]).length > 0 && (
                <span className="dl-subtask-pill">
                  <ListTodo size={10}/> {(d.subtasks||[]).filter(s=>s.done).length}/{(d.subtasks||[]).length}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="dl-card-right">
          {!d.done && <PriorityBadge score={priorityScore}/>}
          <ProgressRing value={progress} size={44} color={d.done?'var(--good)':color}/>
          {expanded ? <ChevronUp size={14} color="var(--muted)"/> : <ChevronDown size={14} color="var(--muted)"/>}
        </div>
      </div>

      {!d.done && (
        <div className="dl-card-bar">
          <div className="dl-card-progress" style={{width:`${progress}%`, background:`linear-gradient(90deg,${color},var(--accent))`}}/>
        </div>
      )}

      {expanded && (
        <div className="dl-card-expanded">
          <div className="dl-expand-row">
            <div className="dl-expand-item">
              <Clock size={13} color="var(--muted)"/>
              <span className={`u-${urg}`}>{urgencyText(d.dl)}</span>
              <span className="dl-date-sm">{formatDate(d.date)}</span>
            </div>
            {d.estimatedHours && (
              <div className="dl-expand-item">
                <BookOpen size={13} color="var(--muted)"/>
                <span>{d.estimatedHours}h estimated</span>
              </div>
            )}
          </div>
          {d.description && <p className="dl-desc">{d.description}</p>}
          <div className="dl-progress-row">
            <span className="dl-prog-label">Progress</span>
            <input type="range" min={0} max={100} value={progress}
              onChange={e => onEdit(d.id, {progress: Number(e.target.value)})}
              className="dl-slider" style={{'--thumb-color':color}}
              onClick={e => e.stopPropagation()}/>
            <span className="dl-prog-val">{progress}%</span>
          </div>
          {!d.done && addSubtask && (
            <SubtaskPanel d={d} addSubtask={addSubtask} toggleSubtask={toggleSubtask} deleteSubtask={deleteSubtask}/>
          )}
          <div className="dl-actions">
            <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); onEdit(d.id, null) }}>Edit</button>
            <button className="btn-icon danger" onClick={e => { e.stopPropagation(); onDelete(d.id) }}><Trash2 size={14}/></button>
          </div>
        </div>
      )}
    </div>
  )
}

function DeadlineModal({ modal, courses, onSave, onClose }) {
  const isEdit = modal !== 'add'
  const [form, setForm] = useState(isEdit ? {
    title: modal.title||'', type: modal.type||'Assignment', courseId: modal.courseId||'',
    date: modal.date||'', description: modal.description||'', progress: modal.progress||0,
    importance: modal.importance||5, estimatedHours: modal.estimatedHours||''
  } : { title:'', type:'Assignment', courseId:'', date:'', description:'', progress:0, importance:5, estimatedHours:'' })
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Deadline' : 'New Deadline'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="field"><label>Title</label>
          <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="What needs to be done?"/>
        </div>
        <div className="field-row">
          <div className="field"><label>Type</label>
            <select value={form.type} onChange={e=>set('type',e.target.value)}>
              {DL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>Due Date</label>
            <input type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
          </div>
        </div>
        <div className="field"><label>Course</label>
          <select value={form.courseId} onChange={e=>set('courseId',e.target.value)}>
            <option value="">No course</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.code?`${c.code} – `:''}{c.name}</option>)}
          </select>
        </div>
        <div className="field-row">
          <div className="field"><label>Importance (1–10)</label>
            <input type="number" min={1} max={10} value={form.importance} onChange={e=>set('importance',Number(e.target.value))}/>
          </div>
          <div className="field"><label>Est. Hours</label>
            <input type="number" min={0} step={0.5} value={form.estimatedHours} onChange={e=>set('estimatedHours',e.target.value)} placeholder="e.g. 3"/>
          </div>
        </div>
        <div className="field"><label>Description</label>
          <textarea rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Notes, requirements…"/>
        </div>
        <div className="field"><label>Progress — {form.progress}%</label>
          <input type="range" min={0} max={100} value={form.progress} onChange={e=>set('progress',Number(e.target.value))} className="dl-slider"/>
        </div>
        <button className="btn btn-primary" style={{width:'100%'}} onClick={() => form.title && onSave(form)} disabled={!form.title}>
          {isEdit ? 'Save Changes' : 'Add Deadline'}
        </button>
      </div>
    </div>
  )
}

export default function Deadlines({ deadlines, courses, addDeadline, updateDeadline, deleteDeadline, toggleDeadline,
  addSubtask, toggleSubtask, deleteSubtask, notifGranted, showToast, addXP, incrementCompleted }) {
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('active')
  const [confirmDel, setConfirmDel] = useState(null)

  useEffect(() => {
    if (!notifGranted || !('Notification' in window)) return
    const today = new Date().toISOString().split('T')[0]
    deadlines.forEach(d => {
      if (!d.done && d.date === today) {
        const key = `nf_${d.id}_${today}`
        if (!sessionStorage.getItem(key)) {
          new Notification('Deadline today', { body: `${d.title} is due today.`, icon: '/pwa-192x192.png' })
          sessionStorage.setItem(key, '1')
        }
      }
    })
  }, [deadlines, notifGranted])

  const enriched = deadlines.map(d => ({ ...d, dl: daysUntil(d.date) }))
  const filtered = enriched
    .filter(d => filter === 'active' ? !d.done : filter === 'done' ? d.done : true)
    .sort((a,b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const au = a.dl!==null ? Math.max(0,100-a.dl*8) : 0
      const bu = b.dl!==null ? Math.max(0,100-b.dl*8) : 0
      return (bu+(b.importance||5)*10)-(au+(a.importance||5)*10)
    })

  const activeCount = enriched.filter(d => !d.done).length
  const overdueCount = enriched.filter(d => !d.done && d.dl < 0).length

  const handleSave = form => {
    if (modal === 'add') { addDeadline(form); showToast('Deadline added ✓') }
    else { updateDeadline(modal.id, form); showToast('Updated ✓') }
    setModal(null)
  }
  const handleEdit = (id, partial) => {
    if (partial === null) { setModal(enriched.find(d => d.id === id)); return }
    updateDeadline(id, partial)
  }
  const handleDelete = id => {
    if (confirmDel === id) { deleteDeadline(id); setConfirmDel(null); showToast('Deleted') }
    else { setConfirmDel(id); setTimeout(() => setConfirmDel(null), 3000) }
  }

  return (
    <div className="page deadlines-page">
      <div className="dl-header">
        <div>
          <h1 className="page-title">Deadlines</h1>
          <p className="page-sub">{activeCount} active · {overdueCount > 0 ? `${overdueCount} overdue` : 'none overdue'}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}><Plus size={15}/> Add</button>
      </div>
      <div className="dl-filter-row">
        {[['active','Active'],['done','Done'],['all','All']].map(([v,l]) => (
          <button key={v} className={`chip ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="dl-empty">
          <Target size={40} strokeWidth={1} color="var(--muted)"/>
          <p>No {filter} deadlines</p>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal('add')}>Add one</button>
        </div>
      ) : (
        <div className="dl-list">
          {filtered.map(d => (
            <DeadlineCard key={d.id} d={d} courses={courses}
              onToggle={toggleDeadline} onEdit={handleEdit} onDelete={handleDelete}
              addXP={addXP} incrementCompleted={incrementCompleted}
              addSubtask={addSubtask} toggleSubtask={toggleSubtask} deleteSubtask={deleteSubtask}
            />
          ))}
        </div>
      )}
      {modal && <DeadlineModal modal={modal} courses={courses} onSave={handleSave} onClose={() => setModal(null)}/>}
    </div>
  )
}

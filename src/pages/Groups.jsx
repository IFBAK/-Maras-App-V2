import { useState } from 'react'
import { Plus, X, Check, Trash2, Users, BookOpen, Calendar, Link } from 'lucide-react'
import './Groups.css'

// ── Project Card ──────────────────────────────────────────
function ProjectCard({ g, onAddTask, onToggleTask, onDeleteTask, onDelete }) {
  const [taskInput, setTaskInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const done  = (g.tasks || []).filter(t => t.done).length
  const total = (g.tasks || []).length
  const pct   = total ? Math.round(done / total * 100) : 0

  const addTask = () => {
    if (!taskInput.trim()) return
    onAddTask(g.id, { title: taskInput.trim() })
    setTaskInput('')
    setShowInput(false)
  }

  return (
    <div className="grp-card">
      <div className="grp-card-top">
        <div>
          <div className="grp-card-name">{g.name}</div>
          {g.course && <div className="grp-card-meta">{g.course}</div>}
          {g.members?.length > 0 && (
            <div className="grp-card-members">
              <Users size={11}/> {g.members.join(', ')}
            </div>
          )}
        </div>
        <div className="grp-card-right">
          <div className="grp-pct" style={{ color: pct === 100 ? 'var(--good)' : 'var(--primary)' }}>{pct}%</div>
          <button className="btn-icon danger" onClick={() => onDelete(g.id)}><Trash2 size={13}/></button>
        </div>
      </div>

      <div className="grp-progress-track">
        <div className="grp-progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--good)' : 'linear-gradient(90deg,var(--primary),var(--secondary))' }}/>
      </div>
      <div className="grp-task-count">{done}/{total} tasks complete</div>

      <div className="grp-tasks">
        {(g.tasks || []).map(t => (
          <div key={t.id} className={`grp-task${t.done ? ' done' : ''}`}>
            <button className="grp-task-check"
              style={{ background: t.done ? 'var(--good)' : 'transparent', borderColor: t.done ? 'var(--good)' : 'rgba(255,255,255,0.2)' }}
              onClick={() => onToggleTask(g.id, t.id)}>
              {t.done && <Check size={9} strokeWidth={3} color="#000"/>}
            </button>
            <span className="grp-task-title">{t.title}</span>
            <button className="grp-task-del" onClick={() => onDeleteTask(g.id, t.id)}><X size={11}/></button>
          </div>
        ))}
      </div>

      {showInput ? (
        <div className="grp-task-input-row">
          <input value={taskInput} onChange={e => setTaskInput(e.target.value)}
            placeholder="Task name…" autoFocus
            onKeyDown={e => e.key === 'Enter' && addTask()}/>
          <button className="btn btn-primary btn-sm" onClick={addTask}>Add</button>
          <button className="btn-icon" onClick={() => setShowInput(false)}><X size={14}/></button>
        </div>
      ) : (
        <button className="grp-add-task" onClick={() => setShowInput(true)}>
          <Plus size={13}/> Add Task
        </button>
      )}
    </div>
  )
}

// ── Study Group Card ──────────────────────────────────────
function StudyGroupCard({ g, onAddSession, onDeleteSession, onAddResource, onDeleteResource, onDelete }) {
  const [showSess, setShowSess]   = useState(false)
  const [showRes, setShowRes]     = useState(false)
  const [sessForm, setSessForm]   = useState({ topic: '', date: '', time: '' })
  const [resForm, setResForm]     = useState({ title: '', url: '' })

  const addSession = () => {
    if (!sessForm.topic.trim()) return
    onAddSession(g.id, { ...sessForm })
    setSessForm({ topic: '', date: '', time: '' })
    setShowSess(false)
  }
  const addResource = () => {
    if (!resForm.title.trim()) return
    onAddResource(g.id, { ...resForm })
    setResForm({ title: '', url: '' })
    setShowRes(false)
  }

  return (
    <div className="grp-card sg-card">
      <div className="grp-card-top">
        <div>
          <div className="grp-card-name">{g.name}</div>
          <div className="grp-card-meta">{g.subject || 'Study Group'}</div>
          {g.members?.length > 0 && (
            <div className="grp-card-members"><Users size={11}/> {g.members.join(', ')}</div>
          )}
        </div>
        <button className="btn-icon danger" onClick={() => onDelete(g.id)}><Trash2 size={13}/></button>
      </div>

      {(g.sessions || []).length > 0 && (
        <div className="sg-section">
          <div className="sg-section-label"><Calendar size={11}/> Sessions</div>
          {g.sessions.slice(-5).map(s => (
            <div key={s.id} className="sg-item">
              <span className="sg-item-text">{s.topic}</span>
              {(s.date || s.time) && <span className="sg-item-meta">{s.date}{s.time ? ` · ${s.time}` : ''}</span>}
              <button className="sg-item-del" onClick={() => onDeleteSession(g.id, s.id)}><X size={11}/></button>
            </div>
          ))}
        </div>
      )}

      {(g.resources || []).length > 0 && (
        <div className="sg-section">
          <div className="sg-section-label"><Link size={11}/> Resources</div>
          {g.resources.map(r => (
            <div key={r.id} className="sg-item">
              {r.url
                ? <a href={r.url} target="_blank" rel="noreferrer" className="sg-link">{r.title}</a>
                : <span className="sg-item-text">{r.title}</span>
              }
              <button className="sg-item-del" onClick={() => onDeleteResource(g.id, r.id)}><X size={11}/></button>
            </div>
          ))}
        </div>
      )}

      <div className="sg-actions">
        <button className="sg-action-btn" onClick={() => { setShowSess(s => !s); setShowRes(false) }}>
          <Calendar size={12}/> Schedule Session
        </button>
        <button className="sg-action-btn" onClick={() => { setShowRes(s => !s); setShowSess(false) }}>
          <BookOpen size={12}/> Add Resource
        </button>
      </div>

      {showSess && (
        <div className="sg-form">
          <input placeholder="Session topic" value={sessForm.topic} onChange={e => setSessForm(f => ({ ...f, topic: e.target.value }))}/>
          <div className="field-row" style={{ marginTop: 8 }}>
            <input type="date" value={sessForm.date} onChange={e => setSessForm(f => ({ ...f, date: e.target.value }))}/>
            <input type="time" value={sessForm.time} onChange={e => setSessForm(f => ({ ...f, time: e.target.value }))}/>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={addSession}>Add Session</button>
        </div>
      )}

      {showRes && (
        <div className="sg-form">
          <input placeholder="Resource title" value={resForm.title} onChange={e => setResForm(f => ({ ...f, title: e.target.value }))}/>
          <input placeholder="URL (optional)" value={resForm.url} onChange={e => setResForm(f => ({ ...f, url: e.target.value }))} style={{ marginTop: 8 }}/>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={addResource}>Add Resource</button>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function Groups({
  groupProjects, addGroupProject, deleteGroupProject, addGroupTask, toggleGroupTask, deleteGroupTask,
  studyGroups, addStudyGroup, deleteStudyGroup, addStudySession, deleteStudySession, addStudyResource, deleteStudyResource,
  courses, showToast
}) {
  const [tab, setTab]     = useState('projects')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]   = useState({ name: '', course: '', subject: '', members: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    const members = form.members ? form.members.split(',').map(s => s.trim()).filter(Boolean) : []
    if (tab === 'projects') {
      addGroupProject({ name: form.name, course: form.course, members })
      showToast?.('Group project created ✓')
    } else {
      addStudyGroup({ name: form.name, subject: form.subject, members })
      showToast?.('Study group created ✓')
    }
    setForm({ name: '', course: '', subject: '', members: '' })
    setShowAdd(false)
  }

  return (
    <div className="page groups-page">
      <div className="groups-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-sub">Projects & study groups</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15}/> New
        </button>
      </div>

      <div className="groups-tabs">
        <button className={`chip${tab === 'projects' ? ' active' : ''}`} onClick={() => setTab('projects')}>
          <Users size={12}/> Projects ({groupProjects.length})
        </button>
        <button className={`chip${tab === 'study' ? ' active' : ''}`} onClick={() => setTab('study')}>
          <BookOpen size={12}/> Study ({studyGroups.length})
        </button>
      </div>

      {tab === 'projects' && (
        groupProjects.length === 0
          ? <div className="empty-state"><div style={{ fontSize: 36 }}>👥</div><p>No group projects yet. Create one!</p></div>
          : groupProjects.map(g => (
              <ProjectCard key={g.id} g={g}
                onAddTask={addGroupTask} onToggleTask={toggleGroupTask} onDeleteTask={deleteGroupTask}
                onDelete={deleteGroupProject}
              />
            ))
      )}

      {tab === 'study' && (
        studyGroups.length === 0
          ? <div className="empty-state"><div style={{ fontSize: 36 }}>📚</div><p>No study groups yet. Create one!</p></div>
          : studyGroups.map(g => (
              <StudyGroupCard key={g.id} g={g}
                onAddSession={addStudySession} onDeleteSession={deleteStudySession}
                onAddResource={addStudyResource} onDeleteResource={deleteStudyResource}
                onDelete={deleteStudyGroup}
              />
            ))
      )}

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{tab === 'projects' ? 'New Group Project' : 'New Study Group'}</h2>
              <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={18}/></button>
            </div>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Database Project Team"/>
            </div>
            {tab === 'projects' ? (
              <div className="field">
                <label>Course</label>
                <select value={form.course} onChange={e => set('course', e.target.value)}>
                  <option value="">No course</option>
                  {courses.map(c => <option key={c.id} value={c.code || c.name}>{c.code ? `${c.code} – ` : ''}{c.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="field">
                <label>Subject</label>
                <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Linear Algebra"/>
              </div>
            )}
            <div className="field">
              <label>Members (comma-separated)</label>
              <input value={form.members} onChange={e => set('members', e.target.value)} placeholder="Alice, Bob, Carol"/>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdd} disabled={!form.name.trim()}>
              Create
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 20 }}/>
    </div>
  )
}

import { useState } from 'react'
import { COURSE_COLORS } from '../utils/helpers'
import './Courses.css'

export default function Courses({ courses, addCourse, updateCourse, deleteCourse, addCourseLink, deleteCourseLink, updateCourseNotes, deadlines, showToast }) {
  const [view, setView] = useState('list')
  const [activeCourse, setActiveCourse] = useState(null)
  const [modal, setModal] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [notesEditing, setNotesEditing] = useState(false)
  const [linkForm, setLinkForm] = useState({ title:'', url:'' })
  const [showLinkForm, setShowLinkForm] = useState(false)

  const course = courses.find(c => c.id === activeCourse)

  const openCourse = (id) => {
    const c = courses.find(x=>x.id===id)
    setActiveCourse(id)
    setNotesDraft(c?.notes || '')
    setNotesEditing(false)
    setShowLinkForm(false)
    setView('detail')
  }

  const handleSave = (form) => {
    if (modal === 'add') { addCourse(form); showToast('📚 Course added') }
    else { updateCourse(modal.id, form); showToast('✏️ Course updated') }
    setModal(null)
  }

  const handleDelete = (id) => {
    deleteCourse(id)
    setConfirmDel(null)
    if (activeCourse === id) { setView('list'); setActiveCourse(null) }
    showToast('🗑️ Course removed')
  }

  const saveNotes = () => {
    updateCourseNotes(activeCourse, notesDraft)
    setNotesEditing(false)
    showToast('📝 Notes saved')
  }

  const addLink = () => {
    if (!linkForm.url.trim()) return
    const url = linkForm.url.startsWith('http') ? linkForm.url : 'https://'+linkForm.url
    addCourseLink(activeCourse, { title: linkForm.title || url, url })
    setLinkForm({ title:'', url:'' })
    setShowLinkForm(false)
    showToast('🔗 Link added')
  }

  const courseDeadlines = (id) => deadlines.filter(d => d.courseId === id && !d.done)

  if (view === 'detail' && course) {
    return (
      <div className="page courses-page">
        <div className="page-hd">
          <button className="btn btn-ghost btn-sm" onClick={()=>setView('list')}>← Back</button>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal({id:course.id,...course})}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={()=>setConfirmDel(course.id)}>Delete</button>
          </div>
        </div>

        <div className="course-detail-hd" style={{'--c':course.color}}>
          <div className="cdh-dot"/>
          <div style={{flex:1}}>
            <div className="cdh-name">{course.name}</div>
            <div className="cdh-meta">
              {[course.code, course.instructor, course.credits && `${course.credits} credits`].filter(Boolean).join(' · ') || 'No additional details'}
            </div>
          </div>
        </div>

        {courseDeadlines(course.id).length > 0 && (
          <section>
            <div className="section-label">Pending deadlines</div>
            <div className="cd-deadlines">
              {courseDeadlines(course.id).map(d => (
                <div key={d.id} className="cd-deadline">
                  <span className={`dot pri-${d.priority}`}/>
                  <span className="cdd-title">{d.title}</span>
                  <span className="cdd-date">{d.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="section-label" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Notes</span>
            {!notesEditing
              ? <button className="btn btn-ghost btn-sm" onClick={()=>setNotesEditing(true)}>Edit</button>
              : <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{setNotesEditing(false);setNotesDraft(course.notes||'')}}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={saveNotes}>Save</button>
                </div>
            }
          </div>
          {notesEditing ? (
            <textarea rows={6} value={notesDraft} onChange={e=>setNotesDraft(e.target.value)} placeholder="Write notes about this course..." style={{resize:'vertical'}}/>
          ) : (
            <div className="notes-display" onClick={()=>setNotesEditing(true)}>
              {course.notes ? <pre className="notes-pre">{course.notes}</pre> : <span className="notes-placeholder">Tap to add notes…</span>}
            </div>
          )}
        </section>

        <section>
          <div className="section-label" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Resources & links</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowLinkForm(v=>!v)}>
              {showLinkForm ? 'Cancel' : '+ Add link'}
            </button>
          </div>
          {showLinkForm && (
            <div className="link-form">
              <div className="form-group">
                <label>Title (optional)</label>
                <input placeholder="e.g. Lecture slides" value={linkForm.title} onChange={e=>setLinkForm(f=>({...f,title:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label>URL *</label>
                <input placeholder="https://..." value={linkForm.url} onChange={e=>setLinkForm(f=>({...f,url:e.target.value}))}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>{setShowLinkForm(false);setLinkForm({title:'',url:''})}}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addLink} disabled={!linkForm.url.trim()}>Add link</button>
              </div>
            </div>
          )}
          {(!course.links || course.links.length === 0) && !showLinkForm ? (
            <div className="links-empty">No links yet. Add lecture slides, portals, or anything useful.</div>
          ) : (
            <div className="links-list">
              {(course.links||[]).map(l => (
                <div key={l.id} className="link-item">
                  <span className="link-icon">🔗</span>
                  <a href={l.url} target="_blank" rel="noreferrer" className="link-title">{l.title || l.url}</a>
                  <button className="btn btn-icon danger" onClick={()=>deleteCourseLink(course.id,l.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {modal && <CourseModal initial={modal} onSave={handleSave} onClose={()=>setModal(null)}/>}
        {confirmDel && <ConfirmModal message="Delete this course and all its data?" onConfirm={()=>handleDelete(confirmDel)} onClose={()=>setConfirmDel(null)}/>}
      </div>
    )
  }

  return (
    <div className="page courses-page">
      <div className="page-hd">
        <h1 className="page-title">Courses</h1>
        <button className="btn btn-primary btn-sm" onClick={()=>setModal('add')}>+ Add</button>
      </div>

      {courses.length === 0 ? (
        <div className="empty"><span className="ei">📚</span><p>No courses yet.<br/>Add your subjects to link deadlines and track resources.</p></div>
      ) : (
        <div className="course-grid">
          {courses.map(c => {
            const dl = courseDeadlines(c.id).length
            return (
              <div key={c.id} className="course-card" onClick={()=>openCourse(c.id)} style={{'--c':c.color}}>
                <div className="cc-top">
                  <div className="cc-color-bar"/>
                  <div className="cc-info">
                    <div className="cc-code-primary">{c.code || c.name}</div>
                    {c.code && <div className="cc-name">{c.name}</div>}
                  </div>
                </div>
                <div className="cc-bottom">
                  <span className="cc-meta">{[c.instructor, c.credits&&`${c.credits} cr`].filter(Boolean).join(' · ')||'No details'}</span>
                  {dl > 0 && <span className="tag tag-high" style={{fontSize:11}}>{dl} deadline{dl>1?'s':''}</span>}
                </div>
                {c.notes && <div className="cc-notes-preview">{c.notes.slice(0,80)}{c.notes.length>80?'…':''}</div>}
              </div>
            )
          })}
        </div>
      )}

      {modal && <CourseModal initial={modal==='add'?null:modal} onSave={handleSave} onClose={()=>setModal(null)}/>}
      {confirmDel && <ConfirmModal message="Delete this course?" onConfirm={()=>handleDelete(confirmDel)} onClose={()=>setConfirmDel(null)}/>}
    </div>
  )
}

function CourseModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name:'', code:'', color:COURSE_COLORS[0], credits:'', instructor:'' })
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd"><span className="modal-title">{initial?'Edit course':'Add course'}</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="form-group"><label>Course name *</label><input autoFocus placeholder="e.g. Data Structures" value={f.name} onChange={e=>set('name',e.target.value)}/></div>
        <div className="form-row form-group">
          <div><label>Course code</label><input placeholder="e.g. CSE301" value={f.code} onChange={e=>set('code',e.target.value)}/></div>
          <div><label>Credits</label><input type="number" placeholder="3" value={f.credits} onChange={e=>set('credits',e.target.value)}/></div>
        </div>
        <div className="form-group"><label>Instructor</label><input placeholder="e.g. Dr. Rahman" value={f.instructor} onChange={e=>set('instructor',e.target.value)}/></div>
        <div className="form-group">
          <label>Color</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {COURSE_COLORS.map(c=>(
              <button key={c} onClick={()=>set('color',c)} style={{width:26,height:26,borderRadius:'50%',background:c,border:f.color===c?'3px solid #fff':'2px solid transparent',boxShadow:f.color===c?`0 0 0 2px ${c}`:'none',transition:'all .12s'}}/>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>f.name.trim()&&onSave(f)} style={{flex:2}} disabled={!f.name.trim()}>Save course</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd"><span className="modal-title">Are you sure?</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <p style={{color:'var(--txt-2)',marginBottom:20,fontSize:14}}>{message}</p>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} style={{flex:1,padding:'11px 0',borderRadius:'var(--r2)'}}>Delete</button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { ChevronLeft, Pencil, Trash2, Plus, Link2, X, BookOpen } from 'lucide-react'
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
    if (modal === 'add') { addCourse(form); showToast('Course added') }
    else { updateCourse(modal.id, form); showToast('Course updated') }
    setModal(null)
  }

  const handleDelete = (id) => {
    deleteCourse(id)
    setConfirmDel(null)
    if (activeCourse === id) { setView('list'); setActiveCourse(null) }
    showToast('Course removed')
  }

  const saveNotes = () => {
    updateCourseNotes(activeCourse, notesDraft)
    setNotesEditing(false)
    showToast('Notes saved')
  }

  const addLink = () => {
    if (!linkForm.url.trim()) return
    const url = linkForm.url.startsWith('http') ? linkForm.url : 'https://'+linkForm.url
    addCourseLink(activeCourse, { title: linkForm.title || url, url })
    setLinkForm({ title:'', url:'' })
    setShowLinkForm(false)
    showToast('Link added')
  }

  const courseDeadlines = (id) => deadlines.filter(d => d.courseId === id && !d.done)

  if (view === 'detail' && course) {
    return (
      <div className="page courses-page">
        <div className="page-hd" style={{marginBottom:18}}>
          <button className="back-link" onClick={()=>setView('list')}><ChevronLeft size={17} strokeWidth={1.7}/> Courses</button>
          <div style={{display:'flex',gap:6}}>
            <button className="btn-icon" onClick={()=>setModal({id:course.id,...course})}><Pencil size={16} strokeWidth={1.6}/></button>
            <button className="btn-icon danger" onClick={()=>setConfirmDel(course.id)}><Trash2 size={16} strokeWidth={1.6}/></button>
          </div>
        </div>

        {/* Editorial header */}
        <div className="course-hero">
          <span className="course-hero-code serif" style={{color:course.color}}>{course.code || course.name}</span>
          <h1 className="course-hero-name serif">{course.name}</h1>
          <div className="course-hero-meta">
            {[course.instructor, course.credits && `${course.credits} credits`].filter(Boolean).join(' · ') || 'No additional details'}
          </div>
        </div>

        {courseDeadlines(course.id).length > 0 && (
          <section className="course-section">
            <div className="section-label">Pending deadlines</div>
            <div className="elist">
              {courseDeadlines(course.id).map(d => (
                <div key={d.id} className="erow">
                  <span className={`dot pri-${d.priority}`}/>
                  <span style={{flex:1,fontSize:13.5}}>{d.title}</span>
                  <span style={{fontSize:12,color:'var(--txt-3)',fontFamily:'var(--mono)'}}>{d.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="course-section">
          <div className="section-label" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>Notes</span>
            {!notesEditing
              ? <button className="text-action" onClick={()=>setNotesEditing(true)}>Edit</button>
              : <div style={{display:'flex',gap:14}}>
                  <button className="text-action muted" onClick={()=>{setNotesEditing(false);setNotesDraft(course.notes||'')}}>Cancel</button>
                  <button className="text-action" onClick={saveNotes}>Save</button>
                </div>
            }
          </div>
          {notesEditing ? (
            <textarea rows={6} value={notesDraft} onChange={e=>setNotesDraft(e.target.value)} placeholder="Write notes about this course..." style={{resize:'vertical'}}/>
          ) : (
            <div className="notes-display" onClick={()=>setNotesEditing(true)}>
              {course.notes ? <pre className="notes-pre">{course.notes}</pre> : <span className="notes-placeholder">No notes yet — tap to add</span>}
            </div>
          )}
        </section>

        <section className="course-section">
          <div className="section-label" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>Resources</span>
            <button className="text-action" onClick={()=>setShowLinkForm(v=>!v)}>
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
                <label>URL</label>
                <input placeholder="https://..." value={linkForm.url} onChange={e=>setLinkForm(f=>({...f,url:e.target.value}))}/>
              </div>
              <button className="btn btn-primary btn-sm" onClick={addLink} disabled={!linkForm.url.trim()}>Add link</button>
            </div>
          )}
          {(!course.links || course.links.length === 0) && !showLinkForm ? (
            <div className="links-empty">No links yet — add lecture slides, portals, or anything useful.</div>
          ) : (
            <div className="elist">
              {(course.links||[]).map(l => (
                <div key={l.id} className="erow link-row">
                  <Link2 size={15} strokeWidth={1.6} style={{color:'var(--txt-3)',flexShrink:0}}/>
                  <a href={l.url} target="_blank" rel="noreferrer" className="link-title">{l.title || l.url}</a>
                  <button className="btn-icon danger" onClick={()=>deleteCourseLink(course.id,l.id)}><X size={14} strokeWidth={1.7}/></button>
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
        <button className="btn btn-primary btn-sm" onClick={()=>setModal('add')}><Plus size={14} strokeWidth={2}/> Add</button>
      </div>

      {courses.length === 0 ? (
        <div className="empty"><BookOpen size={34} strokeWidth={1.3}/><p>No courses yet.<br/>Add your subjects to link deadlines and track resources.</p></div>
      ) : (
        <div className="elist">
          {courses.map(c => {
            const dl = courseDeadlines(c.id).length
            return (
              <button key={c.id} className="erow course-row" onClick={()=>openCourse(c.id)}>
                <span className="course-row-bar" style={{background:c.color}}/>
                <div className="course-row-info">
                  <span className="course-row-code" style={{color:c.color}}>{c.code || c.name}</span>
                  <span className="course-row-name">{c.code ? c.name : (c.instructor||'')}</span>
                </div>
                <div className="course-row-right">
                  {dl > 0 && <span className="course-row-dl">{dl} due</span>}
                  <span className="course-row-meta">{[c.instructor, c.credits&&`${c.credits} cr`].filter(Boolean).join(' · ')}</span>
                </div>
              </button>
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
        <div className="modal-hd"><span className="modal-title">{initial?'Edit course':'Add course'}</span><button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button></div>
        <div className="form-group"><label>Course name *</label><input autoFocus placeholder="e.g. Data Structures" value={f.name} onChange={e=>set('name',e.target.value)}/></div>
        <div className="form-row form-group">
          <div><label>Course code</label><input placeholder="e.g. CSE301" value={f.code} onChange={e=>set('code',e.target.value)}/></div>
          <div><label>Credits</label><input type="number" placeholder="3" value={f.credits} onChange={e=>set('credits',e.target.value)}/></div>
        </div>
        <div className="form-group"><label>Instructor</label><input placeholder="e.g. Dr. Rahman" value={f.instructor} onChange={e=>set('instructor',e.target.value)}/></div>
        <div className="form-group">
          <label>Color</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:9}}>
            {COURSE_COLORS.map(c=>(
              <button key={c} onClick={()=>set('color',c)} style={{width:24,height:24,borderRadius:'50%',background:c,border:f.color===c?'2px solid var(--txt)':'2px solid transparent',opacity:f.color===c?1:.55,transition:'all .12s'}}/>
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
        <div className="modal-hd"><span className="modal-title">Are you sure?</span><button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button></div>
        <p style={{color:'var(--txt-2)',marginBottom:20,fontSize:13.5}}>{message}</p>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} style={{flex:1}}>Delete</button>
        </div>
      </div>
    </div>
  )
}

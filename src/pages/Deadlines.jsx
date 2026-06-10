import { useState, useEffect } from 'react'
import { daysUntil, urgencyLabel, urgencyText, formatDate } from '../utils/helpers'
import './Deadlines.css'

export default function Deadlines({ deadlines, courses, addDeadline, updateDeadline, deleteDeadline, toggleDeadline, notifGranted, showToast }) {
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
          new Notification('⏳ Deadline today!', { body: `${d.title} is due today!`, icon:'/pwa-192x192.png' })
          sessionStorage.setItem(key, '1')
        }
      }
    })
  }, [deadlines, notifGranted])

  const enriched = deadlines.map(d => ({ ...d, dl: daysUntil(d.date), course: courses.find(c=>c.id===d.courseId) }))
  const filtered = enriched
    .filter(d => filter==='active'?!d.done : filter==='done'?d.done:true)
    .sort((a,b) => a.done!==b.done?(a.done?1:-1):(a.dl??999)-(b.dl??999))

  const activeCount  = deadlines.filter(d=>!d.done).length
  const overdueCount = enriched.filter(d=>!d.done&&d.dl<0).length

  const handleSave = (form) => {
    if (modal==='add') { addDeadline(form); showToast('✅ Deadline added') }
    else { updateDeadline(modal.id, form); showToast('✏️ Updated') }
    setModal(null)
  }

  return (
    <div className="page dl-page">
      <div className="page-hd">
        <div>
          <h1 className="page-title">Deadlines</h1>
          {overdueCount>0 && <div className="overdue-badge">⚠️ {overdueCount} overdue</div>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setModal('add')}>+ Add</button>
      </div>

      <div className="filter-row">
        {[['active',`Active${activeCount?` (${activeCount})`:''}`,],['done','Done'],['all','All']].map(([v,l])=>(
          <button key={v} className={`filter-tab ${filter===v?'active':''}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div className="empty"><span className="ei">{filter==='done'?'🏆':'📋'}</span><p>{filter==='done'?'Nothing completed yet.':'No deadlines. Add one to stay on track.'}</p></div>
      ) : (
        <div className="dl-list">
          {filtered.map(d => {
            const urg = d.done ? 'done' : urgencyLabel(d.dl)
            return (
              <div key={d.id} className={`dl-card ${d.done?'done':''}`}>
                <button className={`check-btn ${d.done?'checked':''}`} onClick={()=>toggleDeadline(d.id)}>
                  {d.done&&'✓'}
                </button>
                <div className="dl-body" onClick={()=>!d.done&&setModal({id:d.id,...d})}>
                  <div className="dl-top">
                    <span className="dl-title">{d.title}</span>
                    {!d.done&&<span className={`tag tag-${urg}`}>{urgencyText(d.dl)}</span>}
                  </div>
                  <div className="dl-meta">
                    {d.course && <span className="dl-course" style={{color:d.course.color,borderColor:d.course.color+'44',background:d.course.color+'15'}}>{d.course.code||d.course.name}</span>}
                    {d.course?.code && <span className="dl-course-name">{d.course.name}</span>}
                    <span className="dl-date">📅 {formatDate(d.date)}</span>
                    <span className={`dot pri-${d.priority}`}/>
                  </div>
                  {d.notes && <div className="dl-notes">{d.notes}</div>}
                </div>
                <button className="btn btn-icon danger" onClick={()=>setConfirmDel(d.id)}>🗑️</button>
              </div>
            )
          })}
        </div>
      )}

      {modal && <DeadlineModal initial={modal==='add'?null:modal} courses={courses} onSave={handleSave} onClose={()=>setModal(null)}/>}
      {confirmDel && (
        <div className="overlay" onClick={()=>setConfirmDel(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><span className="modal-title">Remove deadline?</span><button className="modal-x" onClick={()=>setConfirmDel(null)}>✕</button></div>
            <p style={{color:'var(--txt-2)',marginBottom:20,fontSize:14}}>This will permanently delete the deadline.</p>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-secondary" onClick={()=>setConfirmDel(null)} style={{flex:1}}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>{deleteDeadline(confirmDel);setConfirmDel(null);showToast('🗑️ Removed')}} style={{flex:1,padding:'11px 0',borderRadius:'var(--r2)'}}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DeadlineModal({ initial, courses, onSave, onClose }) {
  const [f, setF] = useState(initial || { title:'', courseId:'', date:'', priority:'medium', notes:'' })
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd"><span className="modal-title">{initial?'Edit deadline':'Add deadline'}</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="form-group"><label>Title *</label><input autoFocus placeholder="e.g. Assignment 3" value={f.title} onChange={e=>set('title',e.target.value)}/></div>
        <div className="form-row form-group">
          <div>
            <label>Course</label>
            <select value={f.courseId} onChange={e=>set('courseId',e.target.value)}>
              <option value="">— None —</option>
              {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
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
        <div className="form-group"><label>Due date *</label><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
        <div className="form-group"><label>Notes</label><textarea rows={3} placeholder="Details..." value={f.notes} onChange={e=>set('notes',e.target.value)} style={{resize:'none'}}/></div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>f.title.trim()&&f.date&&onSave(f)} disabled={!f.title.trim()||!f.date} style={{flex:2}}>Save deadline</button>
        </div>
      </div>
    </div>
  )
}

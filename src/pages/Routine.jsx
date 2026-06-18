import { useState } from 'react'
import { Plus, X, CalendarX } from 'lucide-react'
import { DAYS, formatTime, todayShort, timeToMins } from '../utils/helpers'
import './Routine.css'

const HOURS = Array.from({length:13}, (_,i) => i+7) // 7:00 – 19:00
const START_H = 7
const END_H   = 20
const PX_PER_MIN = 1.4

export default function Routine({ slots, courses, addSlot, updateSlot, deleteSlot, showToast }) {
  const [viewMode, setViewMode] = useState('week')
  const [modal, setModal]       = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const today = todayShort()

  const handleSave = (form) => {
    if (modal === 'add') { addSlot(form); showToast('Class added') }
    else { updateSlot(modal.id, form); showToast('Updated') }
    setModal(null)
  }

  return (
    <div className="page routine-page">
      <div className="page-hd" style={{marginBottom:16}}>
        <div className="ttabs" style={{borderBottom:'none'}}>
          <button className={`ttab ${viewMode==='week'?'active':''}`} onClick={()=>setViewMode('week')}>Week</button>
          <button className={`ttab ${viewMode==='list'?'active':''}`} onClick={()=>setViewMode('list')}>List</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setModal('add')}><Plus size={14} strokeWidth={2}/> Add Class</button>
      </div>

      {viewMode === 'week'
        ? <WeekGrid slots={slots} courses={courses} today={today} onEdit={s=>setModal({...s})} />
        : <ListView slots={slots} courses={courses} today={today} onEdit={s=>setModal({...s})} onDelete={id=>setConfirmDel(id)} />
      }

      {modal && (
        <SlotModal initial={modal==='add'?null:modal} courses={courses} onSave={handleSave} onClose={()=>setModal(null)}/>
      )}
      {confirmDel && (
        <div className="overlay" onClick={()=>setConfirmDel(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><span className="modal-title">Remove class?</span><button className="modal-x" onClick={()=>setConfirmDel(null)}><X size={18} strokeWidth={1.7}/></button></div>
            <p style={{color:'var(--txt-2)',marginBottom:18,fontSize:13.5}}>This removes the slot from all days it's scheduled on.</p>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-secondary" onClick={()=>setConfirmDel(null)} style={{flex:1}}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>{deleteSlot(confirmDel);setConfirmDel(null);showToast('Removed')}} style={{flex:1}}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Week Grid ── */
function WeekGrid({ slots, courses, today, onEdit }) {
  const totalMins = (END_H - START_H) * 60
  const gridH = totalMins * PX_PER_MIN

  return (
    <div className="week-grid-wrap">
      <div className="wg-header">
        <div className="wg-time-col"/>
        {DAYS.map(d => (
          <div key={d} className={`wg-day-hd ${d===today?'today':''}`}>{d}</div>
        ))}
      </div>

      <div className="wg-body">
        <div className="wg-time-col wg-time-labels">
          {HOURS.map(h => (
            <div key={h} className="wg-hour-label" style={{top:(h-START_H)*60*PX_PER_MIN}}>
              {String(h).padStart(2,'0')}:00
            </div>
          ))}
          <div style={{height:gridH}}/>
        </div>

        {DAYS.map(d => {
          const daySlots = slots
            .filter(s=>s.days.includes(d))
            .sort((a,b)=>a.startTime.localeCompare(b.startTime))

          return (
            <div key={d} className={`wg-col ${d===today?'today':''}`} style={{height:gridH,position:'relative'}}>
              {HOURS.map(h=>(
                <div key={h} className="wg-hline" style={{top:(h-START_H)*60*PX_PER_MIN}}/>
              ))}
              {daySlots.map(s => {
                const c = courses.find(x=>x.id===s.courseId)
                const color = c?.color || '#C084FC'
                const sm = timeToMins(s.startTime)
                const em = timeToMins(s.endTime)
                const top = (sm - START_H*60) * PX_PER_MIN
                const height = Math.max((em-sm)*PX_PER_MIN - 3, 18)
                const showDetails = height > 36

                return (
                  <div
                    key={s.id}
                    className="wg-block"
                    style={{top, height, '--c':color, '--c-bg': color+'1A', '--c-border': color+'40'}}
                    onClick={()=>onEdit(s)}
                    title={`${c?.name||s.customName} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`}
                  >
                    <div className="wgb-code">{c?.code || s.customName || '—'}</div>
                    {showDetails && <div className="wgb-label">{s.type ? s.type : ''}{s.room ? ` · ${s.room}` : ''}</div>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── List View ── */
function ListView({ slots, courses, today, onEdit, onDelete }) {
  if (slots.length === 0) return (
    <div className="empty"><CalendarX size={32} strokeWidth={1.3}/><p>No classes yet.<br/>Tap <strong>Add Class</strong> to schedule one.</p></div>
  )

  const grouped = DAYS.reduce((acc,d)=>{
    const daySlots = slots.filter(s=>s.days.includes(d)).sort((a,b)=>a.startTime.localeCompare(b.startTime))
    if (daySlots.length) acc.push({day:d,slots:daySlots})
    return acc
  },[])

  return (
    <div className="list-view">
      {grouped.map(({day,slots:ds})=>(
        <div key={day} className="lv-group">
          <div className={`lv-day-hd ${day===today?'today':''}`}>{day === today ? `${day} — Today` : day}</div>
          <div className="elist">
            {ds.map(s=>{
              const c = courses.find(x=>x.id===s.courseId)
              const color = c?.color||'#C084FC'
              return (
                <div key={s.id} className="erow lv-row" onClick={()=>onEdit(s)}>
                  <span className="lv-bar" style={{background:color}}/>
                  <div className="lv-info">
                    <div className="lv-top">
                      <span className="lv-code" style={{color}}>{c?.code||s.customName||'Class'}</span>
                      {s.type && <span className="lv-type">{s.type}</span>}
                    </div>
                    <div className="lv-meta">
                      {formatTime(s.startTime)} – {formatTime(s.endTime)}{s.room && ` · ${s.room}`}
                    </div>
                  </div>
                  <button className="btn-icon danger" onClick={e=>{e.stopPropagation();onDelete(s.id)}}><X size={15} strokeWidth={1.7}/></button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Slot Modal ── */
function SlotModal({ initial, courses, onSave, onClose }) {
  const [f, setF] = useState(initial || {
    courseId: courses[0]?.id || '',
    customName: '',
    type: 'Lecture',
    days: [],
    startTime: '08:00',
    endTime: '09:30',
    room: '',
  })
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const toggleDay = d => set('days', f.days.includes(d)?f.days.filter(x=>x!==d):[...f.days,d])
  const valid = f.days.length > 0 && (f.courseId || f.customName.trim())

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">{initial?'Edit class':'Add class'}</span>
          <button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button>
        </div>
        <div className="form-group">
          <label>Course</label>
          <select value={f.courseId} onChange={e=>set('courseId',e.target.value)}>
            <option value="">— Custom (no course) —</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.code ? `${c.code} – ${c.name}` : c.name}</option>)}
          </select>
        </div>
        {!f.courseId && (
          <div className="form-group">
            <label>Custom name *</label>
            <input autoFocus placeholder="e.g. Morning Lab" value={f.customName} onChange={e=>set('customName',e.target.value)}/>
          </div>
        )}
        <div className="form-group">
          <label>Type</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
            {['Lecture','Lab','Tutorial','Seminar','Other'].map(t=>(
              <button key={t} className={`day-pill ${f.type===t?'on':''}`} onClick={()=>set('type',t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Days <span style={{fontWeight:400,color:'var(--txt-3)',fontSize:10.5,textTransform:'none',letterSpacing:0}}>— one slot, multiple days</span></label>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
            {DAYS.map(d=>(
              <button key={d} className={`day-pill ${f.days.includes(d)?'on':''}`} onClick={()=>toggleDay(d)}>{d}</button>
            ))}
          </div>
        </div>
        <div className="form-row form-group">
          <div><label>Start</label><input type="time" value={f.startTime} onChange={e=>set('startTime',e.target.value)}/></div>
          <div><label>End</label><input type="time" value={f.endTime} onChange={e=>set('endTime',e.target.value)}/></div>
        </div>
        <div className="form-group">
          <label>Room</label>
          <input placeholder="e.g. 3BO1" value={f.room} onChange={e=>set('room',e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:10,marginTop:6}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>valid&&onSave(f)} disabled={!valid} style={{flex:2}}>Save class</button>
        </div>
      </div>
    </div>
  )
}

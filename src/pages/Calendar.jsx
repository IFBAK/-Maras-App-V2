import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DAYS, isoDate, formatTime, daysUntil } from '../utils/helpers'
import './Calendar.css'

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month+1, 0)
  const startDow = (first.getDay() + 6) % 7
  const cells = []
  for (let i=0; i<startDow; i++) cells.push(null)
  for (let d=1; d<=last.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Calendar({ slots, courses, deadlines }) {
  const today = new Date()
  const todayIso = isoDate(today)

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedIso, setSelectedIso] = useState(todayIso)

  const prevMonth = () => { if (month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  const nextMonth = () => { if (month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }

  const grid = getMonthGrid(year, month)

  const deadlinesForIso = iso => deadlines.filter(d => d.date===iso && !d.done)
  const slotsForIso = iso => {
    const date = new Date(iso+'T00:00:00')
    const dayShort = DAYS[(date.getDay()+6)%7]
    return slots.filter(s=>s.days.includes(dayShort))
  }

  const monthDeadlines = deadlines
    .filter(d => {
      if (d.done) return false
      const [y,m] = d.date.split('-').map(Number)
      return y===year && m-1===month
    })
    .sort((a,b)=>a.date.localeCompare(b.date))

  const selectedDeadlines = deadlinesForIso(selectedIso)
  const selectedSlots     = slotsForIso(selectedIso)

  return (
    <div className="page cal-page">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} strokeWidth={1.7}/></button>
        <span className="cal-month-title serif">{MONTH_NAMES[month]} {year}</span>
        <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} strokeWidth={1.7}/></button>
      </div>

      <div className="cal-grid-wrap">
        <div className="cal-dow-row">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>(
            <div key={d} className="cal-dow">{d}</div>
          ))}
        </div>
        <div className="cal-grid">
          {grid.map((date, i) => {
            if (!date) return <div key={`e-${i}`} className="cal-cell empty"/>
            const iso = isoDate(date)
            const dls = deadlinesForIso(iso)
            const hasSlot = slotsForIso(iso).length > 0
            const isToday = iso === todayIso
            const isSelected = iso === selectedIso
            const dlColors = dls.map(d=>{
              const c = courses.find(x=>x.id===d.courseId)
              return c?.color || 'var(--urgent)'
            })
            return (
              <div key={iso} className={`cal-cell ${isToday?'today':''} ${isSelected?'selected':''}`} onClick={()=>setSelectedIso(iso)}>
                <span className="cal-num">{date.getDate()}</span>
                <div className="cal-dots">
                  {dlColors.slice(0,3).map((col,ci)=>(
                    <span key={ci} className="cal-dot" style={{background:col}}/>
                  ))}
                  {hasSlot && <span className="cal-dot slot-dot"/>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {(selectedDeadlines.length > 0 || selectedSlots.length > 0) && (
        <div className="cal-detail">
          <div className="cal-detail-title">
            {new Date(selectedIso+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
          </div>
          {selectedDeadlines.map(d => {
            const c = courses.find(x=>x.id===d.courseId)
            return (
              <div key={d.id} className="cal-row">
                <span className="cal-row-dot" style={{background: c?.color||'var(--urgent)'}}/>
                <span className="cal-row-title">{d.title}</span>
                {c && <span className="cal-row-code" style={{color: c.color}}>{c.code||c.name}</span>}
              </div>
            )
          })}
          {selectedSlots.map(s => {
            const c = courses.find(x=>x.id===s.courseId)
            return (
              <div key={s.id} className="cal-row">
                <span className="cal-row-dot" style={{background: c?.color||'var(--accent)'}}/>
                <span className="cal-row-code" style={{color:c?.color}}>{c?.code||s.customName}</span>
                {s.type && <span className="cal-row-type">{s.type}</span>}
                <span className="cal-row-time">{formatTime(s.startTime)}–{formatTime(s.endTime)}</span>
                {s.room && <span className="cal-row-room">{s.room}</span>}
              </div>
            )
          })}
        </div>
      )}

      {monthDeadlines.length > 0 && (
        <div className="cal-month-list">
          <div className="section-label">This month</div>
          <div className="elist">
            {monthDeadlines.map(d => {
              const c = courses.find(x=>x.id===d.courseId)
              const dl = daysUntil(d.date)
              const date = new Date(d.date+'T00:00:00')
              const dayLabel = date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
              return (
                <div key={d.id} className="erow cml-row">
                  <div className="cml-date">{dayLabel}</div>
                  <span className="cml-dot" style={{background: c?.color||'var(--urgent)'}}/>
                  <div className="cml-body">
                    <span className="cml-title">{d.title}</span>
                    {d.type && <span className="cml-type">{d.type}</span>}
                  </div>
                  {c && <span className="cml-course" style={{color: c.color}}>{c.code||c.name}</span>}
                  <span className="cml-days">{dl < 0 ? `${Math.abs(dl)}d ago` : dl === 0 ? 'Today' : `${dl}d`}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

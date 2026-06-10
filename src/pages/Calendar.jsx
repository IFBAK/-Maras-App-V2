import { useState } from 'react'
import { DAYS, isoDate, todayShort, formatTime, daysUntil, urgencyLabel } from '../utils/helpers'
import './Calendar.css'

// Returns the full month grid (6 weeks x 7 days = 42 cells, padded with nulls)
function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month+1, 0)
  // JS: 0=Sun. We want Mon=0 index
  const startDow = (first.getDay() + 6) % 7  // 0=Mon
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

  // All active deadlines in this month, sorted by date
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
      {/* Month nav */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="cal-month-title">{MONTH_NAMES[month]} {year}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* Month grid */}
      <div className="cal-grid-wrap">
        {/* Day headers */}
        <div className="cal-dow-row">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>(
            <div key={d} className="cal-dow">{d}</div>
          ))}
        </div>
        {/* Date cells */}
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
              return c?.color || '#f87171'
            })
            return (
              <div
                key={iso}
                className={`cal-cell ${isToday?'today':''} ${isSelected?'selected':''}`}
                onClick={()=>setSelectedIso(iso)}
              >
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

      {/* Selected day detail — only shown if something to show */}
      {(selectedDeadlines.length > 0 || selectedSlots.length > 0) && (
        <div className="cal-detail">
          <div className="cal-detail-title">
            {new Date(selectedIso+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
          </div>
          {selectedDeadlines.map(d => {
            const c = courses.find(x=>x.id===d.courseId)
            return (
              <div key={d.id} className="cal-dl-row">
                <span className="cal-dl-dot" style={{background: c?.color||'var(--red)'}}/>
                <span className="cal-dl-title">{d.title}</span>
                {c && <span className="cal-dl-course" style={{color: c.color}}>{c.code||c.name}</span>}
              </div>
            )
          })}
          {selectedSlots.map(s => {
            const c = courses.find(x=>x.id===s.courseId)
            return (
              <div key={s.id} className="cal-slot-row">
                <span className="cal-slot-dot" style={{background: c?.color||'var(--accent)'}}/>
                <span className="cal-slot-code">{c?.code||s.customName}</span>
                {s.type && <span style={{fontSize:10,fontWeight:600,color:'var(--txt-3)',fontFamily:'var(--mono)'}}>{s.type}</span>}
                <span className="cal-slot-time">{formatTime(s.startTime)}–{formatTime(s.endTime)}</span>
                {s.room&&<span className="cal-slot-room">{s.room}</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* This month deadlines list */}
      {monthDeadlines.length > 0 && (
        <div className="cal-month-list">
          <div className="section-label">This month</div>
          {monthDeadlines.map(d => {
            const c = courses.find(x=>x.id===d.courseId)
            const dl = daysUntil(d.date)
            const date = new Date(d.date+'T00:00:00')
            const dayLabel = date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}).replace(',','')
            return (
              <div key={d.id} className="cml-row">
                <div className="cml-date">{dayLabel}</div>
                <span className="cml-dot" style={{background: c?.color||'var(--red)'}}/>
                <div className="cml-body">
                  <span className="cml-title">{d.title}</span>
                </div>
                {c && (
                  <span className="cml-course" style={{color: c.color, borderColor: c.color+'44', background: c.color+'15'}}>
                    {c.code||c.name}
                  </span>
                )}
                <span className="cml-days">{dl < 0 ? `${Math.abs(dl)}d ago` : dl === 0 ? 'Today' : `${dl}d`}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

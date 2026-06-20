import { useState, useMemo } from 'react'
import { daysUntil, formatDate } from '../utils/helpers'
import './Timeline.css'

const ZOOM_DAYS = { 'Week': 7, 'Month': 30, '3 Months': 90 }

export default function Timeline({ deadlines, courses }) {
  const [zoom, setZoom]   = useState('Month')
  const [filter, setFilter] = useState('active')

  const days = ZOOM_DAYS[zoom]

  const enriched = useMemo(() => {
    return deadlines
      .map(d => ({ ...d, dl: daysUntil(d.date) }))
      .filter(d => {
        if (filter === 'active') return !d.done
        if (filter === 'done')   return d.done
        return true
      })
      .filter(d => d.dl !== null && d.dl >= -14 && d.dl <= days)
      .sort((a, b) => a.dl - b.dl)
  }, [deadlines, filter, days])

  // Group by date
  const grouped = useMemo(() => {
    const map = {}
    enriched.forEach(d => {
      const key = d.date
      if (!map[key]) map[key] = []
      map[key].push(d)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [enriched])

  return (
    <div className="page tl-page">
      <div className="tl-header">
        <h1 className="page-title">Timeline</h1>
        <p className="page-sub">{enriched.length} deadline{enriched.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="tl-controls">
        <div className="tl-filters">
          {['active', 'done', 'all'].map(f => (
            <button key={f} className={`chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="tl-zooms">
          {Object.keys(ZOOM_DAYS).map(z => (
            <button key={z} className={`chip${zoom === z ? ' active' : ''}`} onClick={() => setZoom(z)}>{z}</button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="tl-empty">
          <div style={{ fontSize: 40 }}>📅</div>
          <p>No deadlines in this range</p>
        </div>
      ) : (
        <div className="tl-list">
          {grouped.map(([date, items]) => {
            const dl = daysUntil(date)
            const dateLabel = dl === 0 ? 'Today' : dl === 1 ? 'Tomorrow' : dl < 0 ? `${Math.abs(dl)} days ago` : `In ${dl} days`
            const isToday = dl === 0
            const isOverdue = dl < 0

            return (
              <div key={date} className="tl-group">
                <div className={`tl-date-row${isToday ? ' today' : isOverdue ? ' overdue' : ''}`}>
                  <div className="tl-date-line"/>
                  <div className="tl-date-pill">
                    <span className="tl-date-rel">{dateLabel}</span>
                    <span className="tl-date-abs">{formatDate(date)}</span>
                  </div>
                  <div className="tl-date-line"/>
                </div>

                {items.map(d => {
                  const course = courses.find(c => c.id === d.courseId)
                  const color  = course?.color || 'var(--primary)'
                  const subtasksDone = (d.subtasks || []).filter(s => s.done).length
                  const subtasksTotal = (d.subtasks || []).length

                  return (
                    <div key={d.id} className={`tl-item${d.done ? ' done' : ''}${isOverdue && !d.done ? ' overdue' : ''}`}>
                      <div className="tl-item-dot" style={{
                        background: d.done ? 'var(--good)' : color,
                        boxShadow: d.done ? 'none' : `0 0 8px ${color}55`
                      }}/>
                      <div className="tl-item-body">
                        <div className="tl-item-title">{d.title}</div>
                        <div className="tl-item-meta">
                          {course && <span className="tl-meta-course" style={{ color }}>{course.code}</span>}
                          {d.type && <span className="tl-meta-type">{d.type}</span>}
                          {d.estimatedHours && <span className="tl-meta-hrs">{d.estimatedHours}h</span>}
                          {subtasksTotal > 0 && (
                            <span className="tl-meta-sub">{subtasksDone}/{subtasksTotal} tasks</span>
                          )}
                        </div>
                        {d.progress > 0 && !d.done && (
                          <div className="tl-progress">
                            <div className="tl-progress-fill" style={{ width: `${d.progress}%`, background: color }}/>
                          </div>
                        )}
                      </div>
                      {d.done
                        ? <div className="tl-done-tag">✓ Done</div>
                        : isOverdue
                        ? <div className="tl-overdue-tag">Overdue</div>
                        : dl <= 2
                        ? <div className="tl-soon-tag">Soon!</div>
                        : null
                      }
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
      <div style={{ height: 20 }}/>
    </div>
  )
}

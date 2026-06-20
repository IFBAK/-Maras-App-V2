import { useState } from 'react'
import { Plus, Minus, AlertTriangle, Edit2, X, Check } from 'lucide-react'
import './Attendance.css'

function AttBar({ pct, color }) {
  return (
    <div className="att-bar-track">
      <div className="att-bar-fill" style={{ width: `${pct}%`, background: color }}/>
    </div>
  )
}

function pctColor(p) {
  return p >= 80 ? '#34D399' : p >= 60 ? '#FBBF24' : '#F87171'
}

export default function Attendance({ courses, markAttendance, setAttendanceManual }) {
  const [editId, setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({ attended: 0, missed: 0 })

  if (courses.length === 0) {
    return (
      <div className="page att-page">
        <h1 className="page-title">Attendance</h1>
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>📋</div>
          <p>Add courses first to track attendance.</p>
        </div>
      </div>
    )
  }

  const totalAtt    = courses.reduce((s, c) => s + (c.attendance?.attended || 0), 0)
  const totalMissed = courses.reduce((s, c) => s + (c.attendance?.missed  || 0), 0)
  const totalCls    = totalAtt + totalMissed
  const overallPct  = totalCls > 0 ? Math.round(totalAtt / totalCls * 100) : 100
  const overallClr  = pctColor(overallPct)

  const openEdit = c => {
    setEditId(c.id)
    setEditForm({ attended: c.attendance?.attended || 0, missed: c.attendance?.missed || 0 })
  }
  const saveEdit = () => {
    setAttendanceManual(editId, { attended: Number(editForm.attended), missed: Number(editForm.missed) })
    setEditId(null)
  }

  return (
    <div className="page att-page">
      <div className="att-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-sub">Track your class presence</p>
      </div>

      {/* Overall card */}
      <div className="att-overall">
        <div className="att-overall-score" style={{ color: overallClr }}>{overallPct}%</div>
        <div className="att-overall-label">Overall Attendance</div>
        <div className="att-overall-stats">
          <span>✅ {totalAtt} attended</span>
          <span>❌ {totalMissed} missed</span>
          <span>📚 {totalCls} total</span>
        </div>
        <AttBar pct={overallPct} color={overallClr}/>
      </div>

      {/* Per-course */}
      <div className="att-list">
        {courses.map(c => {
          const att   = c.attendance || { attended: 0, missed: 0 }
          const total = att.attended + att.missed
          const pct   = total > 0 ? Math.round(att.attended / total * 100) : 100
          const clr   = pctColor(pct)
          const warn  = pct < 75 && total > 2

          return (
            <div key={c.id} className="att-card" style={{ '--cc': c.color || 'var(--primary)' }}>
              <div className="att-card-top">
                <div>
                  <div className="att-card-code" style={{ color: c.color || 'var(--primary)' }}>
                    {c.code || c.name}
                  </div>
                  <div className="att-card-name">{c.name}</div>
                </div>
                <div className="att-card-pct" style={{ color: clr }}>{pct}%</div>
              </div>

              <AttBar pct={pct} color={clr}/>

              <div className="att-card-stats">
                <span>✅ {att.attended}</span>
                <span>❌ {att.missed}</span>
                <span>📚 {total}</span>
                {warn && (
                  <span className="att-warn">
                    <AlertTriangle size={11}/> Low attendance
                  </span>
                )}
              </div>

              <div className="att-card-btns">
                <button className="att-btn att-present" onClick={() => markAttendance(c.id, 'attended')}>
                  <Plus size={13}/> Present
                </button>
                <button className="att-btn att-absent" onClick={() => markAttendance(c.id, 'missed')}>
                  <Minus size={13}/> Absent
                </button>
                <button className="att-btn att-edit" onClick={() => openEdit(c)}>
                  <Edit2 size={12}/> Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Low attendance warnings */}
      {courses.some(c => {
        const att = c.attendance || {}
        const t = (att.attended||0) + (att.missed||0)
        return t > 2 && Math.round((att.attended||0)/t*100) < 75
      }) && (
        <div className="att-warning-banner">
          <AlertTriangle size={14} color="var(--warn)"/>
          <span>Some courses have low attendance. Speak to your lecturer if needed.</span>
        </div>
      )}

      {/* Edit modal */}
      {editId && (
        <div className="modal-backdrop" onClick={() => setEditId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Attendance</h2>
              <button className="btn-icon" onClick={() => setEditId(null)}><X size={18}/></button>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Classes Attended</label>
                <input type="number" min={0} value={editForm.attended}
                  onChange={e => setEditForm(f => ({ ...f, attended: e.target.value }))}/>
              </div>
              <div className="field">
                <label>Classes Missed</label>
                <input type="number" min={0} value={editForm.missed}
                  onChange={e => setEditForm(f => ({ ...f, missed: e.target.value }))}/>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveEdit}>
              <Check size={14}/> Save
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 20 }}/>
    </div>
  )
}

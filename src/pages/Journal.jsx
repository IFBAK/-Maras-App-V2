import { useState, useMemo } from 'react'
import { Plus, X, Trash2, BookOpen } from 'lucide-react'
import './Journal.css'

const MOODS = [
  { emoji: '😄', label: 'Great',  value: 5 },
  { emoji: '🙂', label: 'Good',   value: 4 },
  { emoji: '😐', label: 'Okay',   value: 3 },
  { emoji: '😔', label: 'Low',    value: 2 },
  { emoji: '😫', label: 'Rough',  value: 1 },
]
const ENERGY_OPTS      = ['⚡⚡⚡ High', '⚡⚡ Medium', '⚡ Low', '💤 Drained']
const PRODUCTIVITY_OPTS = ['🔥 On Fire', '✅ Productive', '😐 Average', '😴 Slow']

const DEFAULT_FORM = { mood: 4, energy: 1, productivity: 1, note: '' }

export default function Journal({ journal, addJournalEntry, deleteJournalEntry }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ ...DEFAULT_FORM })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = () => {
    addJournalEntry({ mood: form.mood, energy: form.energy, productivity: form.productivity, note: form.note.trim() })
    setForm({ ...DEFAULT_FORM })
    setShowAdd(false)
  }

  // Stats
  const avgMood = useMemo(() => {
    const recent = journal.slice(-14)
    return recent.length ? (recent.reduce((s, e) => s + (e.mood || 3), 0) / recent.length).toFixed(1) : null
  }, [journal])

  const moodTrend = useMemo(() => journal.slice(-14), [journal])

  const moodColor = m => m >= 4 ? '#34D399' : m >= 3 ? '#FBBF24' : '#F87171'

  return (
    <div className="page journal-page">
      <div className="journal-header">
        <div>
          <h1 className="page-title">Academic Journal</h1>
          <p className="page-sub">Daily mood & productivity log</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15}/> Log Day
        </button>
      </div>

      {/* Analytics strip */}
      {journal.length > 0 && (
        <div className="journal-stats">
          <div className="jstat">
            <div className="jstat-val" style={{ color: avgMood >= 4 ? 'var(--good)' : avgMood >= 3 ? 'var(--warn)' : 'var(--urgent)' }}>
              {avgMood}
            </div>
            <div className="jstat-label">Avg Mood (14d)</div>
          </div>
          <div className="jstat">
            <div className="jstat-val">{journal.length}</div>
            <div className="jstat-label">Total Entries</div>
          </div>
          <div className="jstat">
            <div className="jstat-val">{journal.filter(e => (e.mood || 3) >= 4).length}</div>
            <div className="jstat-label">Good Days</div>
          </div>
          <div className="jstat">
            <div className="jstat-val">{journal.filter(e => (e.productivity || 2) <= 1).length}</div>
            <div className="jstat-label">Productive</div>
          </div>
        </div>
      )}

      {/* Mood trend sparkline */}
      {moodTrend.length > 1 && (
        <div className="journal-trend">
          <div className="jt-title">MOOD — LAST 14 DAYS</div>
          <div className="jt-bars">
            {moodTrend.map((e, i) => (
              <div key={i} className="jt-col">
                <div className="jt-bar" style={{
                  height: `${(e.mood / 5) * 56}px`,
                  background: moodColor(e.mood || 3)
                }}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entries */}
      {journal.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} strokeWidth={1} color="var(--muted)"/>
          <p>Start logging your academic day</p>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>First Entry</button>
        </div>
      ) : (
        <div className="journal-entries">
          {[...journal].reverse().map(e => {
            const mood = MOODS.find(m => m.value === e.mood) || MOODS[2]
            const d    = new Date(e.date)
            return (
              <div key={e.id} className="jentry">
                <div className="jentry-top">
                  <div className="jentry-mood">{mood.emoji}</div>
                  <div className="jentry-meta">
                    <div className="jentry-date">
                      {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="jentry-tags">
                      <span className="jtag">{ENERGY_OPTS[e.energy ?? 1]}</span>
                      <span className="jtag">{PRODUCTIVITY_OPTS[e.productivity ?? 1]}</span>
                    </div>
                  </div>
                  <button className="btn-icon danger" onClick={() => deleteJournalEntry(e.id)}>
                    <Trash2 size={13}/>
                  </button>
                </div>
                {e.note && <p className="jentry-note">{e.note}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={ev => ev.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Log Today</h2>
              <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={18}/></button>
            </div>

            <div className="field">
              <label>How are you feeling?</label>
              <div className="mood-picker">
                {MOODS.map(m => (
                  <button key={m.value}
                    className={`mood-btn${form.mood === m.value ? ' active' : ''}`}
                    onClick={() => set('mood', m.value)}>
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Energy Level</label>
                <select value={form.energy} onChange={e => set('energy', Number(e.target.value))}>
                  {ENERGY_OPTS.map((o, i) => <option key={i} value={i}>{o}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Productivity</label>
                <select value={form.productivity} onChange={e => set('productivity', Number(e.target.value))}>
                  {PRODUCTIVITY_OPTS.map((o, i) => <option key={i} value={i}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Notes (optional)</label>
              <textarea rows={3} value={form.note}
                onChange={e => set('note', e.target.value)}
                placeholder="What did you work on? How did it go?"/>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
              Save Entry
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 20 }}/>
    </div>
  )
}

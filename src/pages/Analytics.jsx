import { useState, useMemo } from 'react'
import { Brain, Clock, TrendingUp, AlertTriangle, Target, BarChart2 } from 'lucide-react'
import {
  findFreeSlots, formatSlot, generateStudyPlan, getWorkloadForecast,
  getBurnoutRisk, getCoachRecommendations, calculateGPA, getGPAColor, GRADE_OPTIONS
} from '../utils/plannerUtils'
import { DAYS_FULL } from '../utils/helpers'
import './Analytics.css'

// ── Section wrapper ───────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="an-section">
      <div className="an-section-head">
        <Icon size={15} color="var(--primary)"/>
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}

// ── AI Coach ──────────────────────────────────────────────
function AICoach({ deadlines, focusSessions, gamification }) {
  const recs = useMemo(
    () => getCoachRecommendations(deadlines, focusSessions, gamification),
    [deadlines, focusSessions, gamification]
  )
  return (
    <Section icon={Brain} title="AI Academic Coach">
      {recs.length === 0
        ? <div className="an-empty">Add deadlines to get personalised advice.</div>
        : recs.map((r, i) => (
            <div key={i} className={`an-coach-item${r.urgent ? ' urgent' : ''}`}>
              <span className="an-coach-icon">{r.icon}</span>
              <span className="an-coach-text">{r.text}</span>
            </div>
          ))
      }
    </Section>
  )
}

// ── Burnout Predictor ─────────────────────────────────────
function BurnoutPredictor({ deadlines, focusSessions, gamification }) {
  const risk = useMemo(
    () => getBurnoutRisk(deadlines, focusSessions, gamification),
    [deadlines, focusSessions, gamification]
  )
  const r = 44, circ = 2 * Math.PI * r, dash = circ * (risk.score / 100)
  return (
    <Section icon={AlertTriangle} title="Burnout Predictor">
      <div className="an-burnout-row">
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9}/>
          <circle cx={55} cy={55} r={r} fill="none" stroke={risk.color} strokeWidth={9}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 55 55)"
            style={{ filter: `drop-shadow(0 0 10px ${risk.color})`, transition: 'stroke-dasharray .6s' }}
          />
          <text x={55} y={50} textAnchor="middle" fill={risk.color} fontSize={22} fontWeight={900} fontFamily="Inter">{risk.score}</text>
          <text x={55} y={66} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="Inter">RISK SCORE</text>
        </svg>
        <div className="an-burnout-info">
          <div className="an-burnout-level" style={{ color: risk.color }}>{risk.emoji} {risk.level} Risk</div>
          <div className="an-burnout-advice">{risk.advice}</div>
        </div>
      </div>
    </Section>
  )
}

// ── Free Time Finder ──────────────────────────────────────
function SlotCard({ label, slot, accent }) {
  if (!slot) return (
    <div className="an-slot-card" style={{ '--accent': accent }}>
      <div className="an-slot-label">{label}</div>
      <div className="an-slot-none">No gap found</div>
    </div>
  )
  const h = Math.floor(slot.duration / 60), m = slot.duration % 60
  return (
    <div className="an-slot-card" style={{ '--accent': accent }}>
      <div className="an-slot-label">{label}</div>
      {slot.dayFull && <div className="an-slot-day">{slot.dayFull}</div>}
      <div className="an-slot-time">{slot.start} – {slot.end}</div>
      <div className="an-slot-dur">{h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''} free</div>
    </div>
  )
}

function FreeTimeFinder({ slots, deadlines }) {
  const { nextSlot, longestToday, longestWeek } = useMemo(
    () => findFreeSlots(slots, deadlines),
    [slots, deadlines]
  )
  return (
    <Section icon={Clock} title="Free Time Finder">
      <div className="an-slots-row">
        <SlotCard label="Next Free Slot"   slot={formatSlot(nextSlot)}    accent="var(--primary)"/>
        <SlotCard label="Longest Today"    slot={formatSlot(longestToday)} accent="var(--good)"/>
        <SlotCard label="Best This Week"   slot={formatSlot(longestWeek)}  accent="var(--warn)"/>
      </div>
    </Section>
  )
}

// ── Study Session Planner ─────────────────────────────────
function StudyPlanner({ deadlines }) {
  const plan = useMemo(() => generateStudyPlan(deadlines), [deadlines])
  const sections = [
    { key: 'today',    label: 'Today',    color: 'var(--urgent)' },
    { key: 'tomorrow', label: 'Tomorrow', color: 'var(--warn)' },
    { key: 'upcoming', label: 'Upcoming', color: 'var(--good)' },
  ]
  const hasAny = plan.today.length + plan.tomorrow.length + plan.upcoming.length > 0
  return (
    <Section icon={Target} title="Study Session Planner">
      {!hasAny
        ? <div className="an-empty">No deadlines to plan for 🎉</div>
        : sections.map(({ key, label, color }) =>
            plan[key].length > 0 ? (
              <div key={key} className="an-plan-group">
                <div className="an-plan-day" style={{ color }}>{label}</div>
                {plan[key].map(item => (
                  <div key={item.id} className="an-plan-item">
                    <div className="an-plan-dot" style={{ background: color }}/>
                    <div className="an-plan-info">
                      <div className="an-plan-title">{item.title}</div>
                      <div className="an-plan-reason">
                        {item.reason}
                      </div>
                    </div>
                    <div className="an-plan-mins">{item.minutes}m</div>
                  </div>
                ))}
              </div>
            ) : null
          )
      }
    </Section>
  )
}

// ── Workload Forecast ─────────────────────────────────────
function WorkloadForecast({ deadlines }) {
  const [range, setRange] = useState(7)
  const { forecast7, forecast30 } = useMemo(() => getWorkloadForecast(deadlines), [deadlines])
  const data = range === 7 ? forecast7 : forecast30
  const maxH = Math.max(1, ...data.map(d => d.hours))
  return (
    <Section icon={BarChart2} title="Workload Forecast">
      <div className="an-toggle-row">
        <button className={`chip${range===7?' active':''}`} onClick={() => setRange(7)}>7 days</button>
        <button className={`chip${range===30?' active':''}`} onClick={() => setRange(30)}>30 days</button>
      </div>
      <div className="an-forecast">
        {data.map((d, i) => (
          <div key={i} className="an-fc-col" title={`${d.dayLabel}: ${d.hours}h, ${d.deadlineCount} deadline(s)`}>
            <div className="an-fc-bar-wrap">
              <div className="an-fc-bar" style={{
                height: `${Math.max(3, (d.hours / maxH) * 80)}px`,
                background: d.deadlineCount > 2 ? 'var(--urgent)' : d.deadlineCount > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.07)'
              }}/>
            </div>
            {range === 7 && <div className="an-fc-label">{d.dayLabel.split(',')[0]}</div>}
          </div>
        ))}
      </div>
      <div className="an-forecast-legend">
        <span style={{ color: 'var(--muted)' }}>■ Clear</span>
        <span style={{ color: 'var(--primary)' }}>■ Moderate</span>
        <span style={{ color: 'var(--urgent)' }}>■ Heavy</span>
      </div>
    </Section>
  )
}

// ── GPA Predictor ─────────────────────────────────────────
function GPAPredictor({ courses, gpaData, setExpectedGrade, updateGpaData }) {
  const gpa = useMemo(
    () => calculateGPA(courses, gpaData.expectedGrades || {}),
    [courses, gpaData]
  )
  const gpaColor = getGPAColor(gpa)
  return (
    <Section icon={TrendingUp} title="GPA Predictor">
      <div className="an-gpa-hero">
        <div className="an-gpa-score" style={{ color: gpaColor }}>{gpa !== null ? gpa.toFixed(2) : '–'}</div>
        <div className="an-gpa-label">Projected GPA</div>
      </div>
      <div className="an-gpa-target">
        <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Target GPA</label>
        <input type="number" min="0" max="4" step="0.1"
          value={gpaData.targetGPA || '3.5'}
          onChange={e => updateGpaData({ targetGPA: e.target.value })}
          style={{ width: 90, textAlign: 'center' }}
        />
      </div>
      {courses.length === 0
        ? <div className="an-empty">Add courses to predict your GPA.</div>
        : (
          <div className="an-gpa-list">
            {courses.map(c => (
              <div key={c.id} className="an-gpa-row">
                <div className="an-gpa-course">{c.code || c.name}</div>
                <div className="an-gpa-right">
                  <span className="an-gpa-credits">{c.credits || 3}cr</span>
                  <select
                    value={gpaData.expectedGrades?.[c.id] || ''}
                    onChange={e => setExpectedGrade(c.id, e.target.value)}
                    className="an-gpa-select">
                    <option value="">Grade?</option>
                    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </Section>
  )
}

// ── Main ──────────────────────────────────────────────────
const TABS = ['Overview', 'Planner', 'GPA', 'Forecast']

export default function Analytics({ slots, deadlines, focusSessions, gamification, courses, gpaData, setExpectedGrade, updateGpaData }) {
  const [tab, setTab] = useState('Overview')
  return (
    <div className="page an-page">
      <div className="an-page-head">
        <h1 className="page-title">Analytics</h1>
        <p className="page-sub">Smart insights for your semester</p>
      </div>
      <div className="an-tabs">
        {TABS.map(t => (
          <button key={t} className={`chip${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'Overview' && <>
        <AICoach deadlines={deadlines} focusSessions={focusSessions} gamification={gamification}/>
        <BurnoutPredictor deadlines={deadlines} focusSessions={focusSessions} gamification={gamification}/>
        <FreeTimeFinder slots={slots} deadlines={deadlines}/>
      </>}
      {tab === 'Planner' && <>
        <StudyPlanner deadlines={deadlines}/>
        <FreeTimeFinder slots={slots} deadlines={deadlines}/>
      </>}
      {tab === 'GPA' && <GPAPredictor courses={courses} gpaData={gpaData} setExpectedGrade={setExpectedGrade} updateGpaData={updateGpaData}/>}
      {tab === 'Forecast' && <WorkloadForecast deadlines={deadlines}/>}
      <div style={{ height: 20 }}/>
    </div>
  )
}

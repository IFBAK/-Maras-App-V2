import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Check, Zap, Flame, Clock } from 'lucide-react'
import './Focus.css'

const MODES = [
  { label: '25/5', work: 25, rest: 5, desc: 'Classic Pomodoro' },
  { label: '50/10', work: 50, rest: 10, desc: 'Deep Work' },
  { label: 'Custom', work: null, rest: null, desc: 'Set your own' },
]

function CircularTimer({ progress, phase, timeLeft, isRunning }) {
  const size = 240, r = 100, circ = 2 * Math.PI * r
  const dash = circ * progress
  const color = phase === 'work' ? 'var(--primary)' : 'var(--good)'
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="circular-timer">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{filter:`drop-shadow(0 0 12px ${color})`, transition: isRunning ? 'stroke-dasharray .5s linear' : 'none'}}
        />
        <text x={size/2} y={size/2 - 8} textAnchor="middle" fill="white"
          fontSize={48} fontWeight={800} fontFamily="Inter" dominantBaseline="middle">
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </text>
        <text x={size/2} y={size/2 + 30} textAnchor="middle"
          fill={color} fontSize={13} fontWeight={700} fontFamily="Inter" letterSpacing={3}>
          {phase === 'work' ? 'FOCUS' : 'BREAK'}
        </text>
      </svg>
    </div>
  )
}

export default function Focus({ focusSessions, addFocusSession, addXP, showToast, deadlines }) {
  const [modeIdx, setModeIdx] = useState(0)
  const [customWork, setCustomWork] = useState(30)
  const [customRest, setCustomRest] = useState(5)
  const [phase, setPhase] = useState('work') // work | rest
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [session, setSession] = useState(0)
  const [totalToday, setTotalToday] = useState(0)
  const [selectedTask, setSelectedTask] = useState(null)
  const intervalRef = useRef(null)

  const mode = MODES[modeIdx]
  const workMins = mode.work ?? customWork
  const restMins = mode.rest ?? customRest
  const totalSecs = (phase === 'work' ? workMins : restMins) * 60
  const progress = timeLeft / totalSecs

  // Today's stats
  const today = new Date().toDateString()
  const todaySessions = (focusSessions || []).filter(s => new Date(s.date).toDateString() === today)
  const todayMins = todaySessions.reduce((sum, s) => sum + (s.minutes || 0), 0)

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(workMins * 60)
  }, [workMins])

  useEffect(() => { resetTimer() }, [modeIdx, customWork])

  useEffect(() => {
    if (!isRunning) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          if (phase === 'work') {
            const mins = workMins
            addFocusSession?.({ minutes: mins, task: selectedTask?.title || null })
            addXP?.(15, 'focus')
            setTotalToday(prev => prev + mins)
            setSession(s => s + 1)
            showToast?.(`🎯 Focus session complete! +15 XP`)
            setPhase('rest')
            setIsRunning(false)
            return restMins * 60
          } else {
            setPhase('work')
            setIsRunning(false)
            return workMins * 60
          }
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, phase, workMins, restMins])

  const activeDeadlines = (deadlines || []).filter(d => !d.done)

  return (
    <div className="page focus-page">
      <div className="focus-header">
        <h1 className="page-title">Focus Mode</h1>
        <div className="focus-streak">
          <Flame size={14} color="var(--warn)"/>
          <span>{session} sessions today</span>
        </div>
      </div>

      {/* Mode selector */}
      <div className="mode-selector">
        {MODES.map((m, i) => (
          <button key={m.label} className={`mode-btn ${modeIdx === i ? 'active' : ''}`}
            onClick={() => { setModeIdx(i); }}>
            <span className="mode-label">{m.label}</span>
            <span className="mode-desc">{m.desc}</span>
          </button>
        ))}
      </div>

      {modeIdx === 2 && (
        <div className="custom-mins">
          <div className="field-row" style={{marginBottom:0}}>
            <div className="field">
              <label>Focus (min)</label>
              <input type="number" min={1} max={120} value={customWork} onChange={e => { setCustomWork(Number(e.target.value)); resetTimer() }}/>
            </div>
            <div className="field">
              <label>Break (min)</label>
              <input type="number" min={1} max={60} value={customRest} onChange={e => setCustomRest(Number(e.target.value))}/>
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="timer-area">
        <CircularTimer progress={progress} phase={phase} timeLeft={timeLeft} isRunning={isRunning}/>
        <div className="timer-controls">
          <button className="timer-reset" onClick={resetTimer}><RotateCcw size={20}/></button>
          <button className={`timer-play ${isRunning ? 'pause' : 'play'}`} onClick={() => setIsRunning(r => !r)}>
            {isRunning ? <Pause size={28} fill="white"/> : <Play size={28} fill="white"/>}
          </button>
          <div style={{width:44}}/>
        </div>
      </div>

      {/* Task selector */}
      {activeDeadlines.length > 0 && (
        <div className="focus-task-section">
          <div className="section-label">WORKING ON</div>
          <div className="task-chips">
            <button className={`task-chip ${!selectedTask ? 'active' : ''}`} onClick={() => setSelectedTask(null)}>
              Free session
            </button>
            {activeDeadlines.slice(0,5).map(d => (
              <button key={d.id} className={`task-chip ${selectedTask?.id === d.id ? 'active' : ''}`}
                onClick={() => setSelectedTask(d)}>
                {d.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="focus-stats">
        <div className="focus-stat">
          <Clock size={18} color="var(--primary)"/>
          <span className="fstat-val">{todayMins + totalToday}</span>
          <span className="fstat-lbl">min today</span>
        </div>
        <div className="focus-stat">
          <Zap size={18} color="var(--warn)"/>
          <span className="fstat-val">{todaySessions.length + session}</span>
          <span className="fstat-lbl">sessions</span>
        </div>
        <div className="focus-stat">
          <Check size={18} color="var(--good)"/>
          <span className="fstat-val">{Math.round((todayMins + totalToday) / 60 * 10) / 10}</span>
          <span className="fstat-lbl">hours</span>
        </div>
      </div>

      {/* Session history */}
      {todaySessions.length > 0 && (
        <div className="focus-history">
          <div className="section-label">TODAY'S SESSIONS</div>
          {todaySessions.slice(-5).reverse().map((s, i) => (
            <div key={i} className="history-item">
              <div className="history-dot"/>
              <span>{s.task || 'Free session'}</span>
              <span className="history-time">{s.minutes}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'

function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init }
    catch { return init }
  })
  const set = useCallback((fn) => {
    setV(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])
  return [v, set]
}

const uid = () => crypto.randomUUID()

export function useStore() {
  // ── Profile ──────────────────────────────────────────
  const [profile, setProfile] = useLS('mp_profile', {
    name: '', studentId: '', university: '', department: '', semester: '', totalCredits: '', email: ''
  })
  const updateProfile = d => setProfile(p => ({ ...p, ...d }))

  // ── Courses ──────────────────────────────────────────
  const [courses, setCourses] = useLS('mp_courses', [])
  const addCourse    = d => { const id=uid(); setCourses(p=>[...p,{...d,id,links:d.links||[],notes:d.notes||'',credits:d.credits||3,attendance:{attended:0,missed:0}}]); return id }
  const updateCourse = (id,d) => setCourses(p=>p.map(c=>c.id===id?{...c,...d}:c))
  const deleteCourse = id  => setCourses(p=>p.filter(c=>c.id!==id))
  const addCourseLink    = (cid,link) => setCourses(p=>p.map(c=>c.id===cid?{...c,links:[...(c.links||[]),{...link,id:uid()}]}:c))
  const deleteCourseLink = (cid,lid)  => setCourses(p=>p.map(c=>c.id===cid?{...c,links:(c.links||[]).filter(l=>l.id!==lid)}:c))
  const updateCourseNotes= (cid,notes)=> setCourses(p=>p.map(c=>c.id===cid?{...c,notes}:c))
  // Attendance helpers on course
  const markAttendance = (cid, type) => setCourses(p=>p.map(c=>{
    if (c.id!==cid) return c
    const att = c.attendance || {attended:0,missed:0}
    return {...c, attendance:{...att, [type]:(att[type]||0)+1}}
  }))
  const setAttendanceManual = (cid, data) => setCourses(p=>p.map(c=>c.id===cid?{...c,attendance:{...data}}:c))

  // ── Routine slots ────────────────────────────────────
  const [slots, setSlots] = useLS('mp_slots', [])
  const addSlot    = d => { const id=uid(); setSlots(p=>[...p,{...d,id}]); return id }
  const updateSlot = (id,d) => setSlots(p=>p.map(s=>s.id===id?{...s,...d}:s))
  const deleteSlot = id  => setSlots(p=>p.filter(s=>s.id!==id))

  // ── Deadlines ────────────────────────────────────────
  const [deadlines, setDeadlines] = useLS('mp_deadlines', [])
  const addDeadline    = d => { const id=uid(); setDeadlines(p=>[...p,{...d,id,done:false,progress:d.progress||0,subtasks:d.subtasks||[]}]); return id }
  const updateDeadline = (id,d) => setDeadlines(p=>p.map(x=>x.id===id?{...x,...d}:x))
  const deleteDeadline = id  => setDeadlines(p=>p.filter(x=>x.id!==id))
  const toggleDeadline = id  => setDeadlines(p=>p.map(x=>x.id===id?{...x,done:!x.done,progress:!x.done?100:x.progress}:x))
  // Subtasks
  const addSubtask = (dlId, task) => setDeadlines(p=>p.map(x=>{
    if(x.id!==dlId) return x
    return {...x, subtasks:[...(x.subtasks||[]),{...task,id:uid(),done:false}]}
  }))
  const toggleSubtask = (dlId, stId) => setDeadlines(p=>p.map(x=>{
    if(x.id!==dlId) return x
    const subtasks = (x.subtasks||[]).map(s=>s.id===stId?{...s,done:!s.done}:s)
    const done = subtasks.filter(s=>s.done).length
    const progress = subtasks.length ? Math.round(done/subtasks.length*100) : x.progress
    return {...x, subtasks, progress}
  }))
  const deleteSubtask = (dlId, stId) => setDeadlines(p=>p.map(x=>x.id===dlId?{...x,subtasks:(x.subtasks||[]).filter(s=>s.id!==stId)}:x))

  // ── Friends ──────────────────────────────────────────
  const [friends, setFriends] = useLS('mp_friends', [])
  const addFriend      = d  => { const id=uid(); setFriends(p=>[...p,{...d,id,slots:d.slots||[]}]); return id }
  const updateFriend   = (id,d) => setFriends(p=>p.map(f=>f.id===id?{...f,...d}:f))
  const deleteFriend   = id  => setFriends(p=>p.filter(f=>f.id!==id))
  const addFriendSlot  = (fid,slot) => setFriends(p=>p.map(f=>f.id===fid?{...f,slots:[...(f.slots||[]),{...slot,id:uid()}]}:f))
  const deleteFriendSlot=(fid,sid)  => setFriends(p=>p.map(f=>f.id===fid?{...f,slots:(f.slots||[]).filter(s=>s.id!==sid)}:f))

  // ── Group Projects ───────────────────────────────────
  const [groupProjects, setGroupProjects] = useLS('mp_groups', [])
  const addGroupProject    = d => { const id=uid(); setGroupProjects(p=>[...p,{...d,id,members:d.members||[],tasks:[],createdAt:new Date().toISOString()}]); return id }
  const updateGroupProject = (id,d) => setGroupProjects(p=>p.map(g=>g.id===id?{...g,...d}:g))
  const deleteGroupProject = id => setGroupProjects(p=>p.filter(g=>g.id!==id))
  const addGroupTask   = (gid,task) => setGroupProjects(p=>p.map(g=>g.id===gid?{...g,tasks:[...(g.tasks||[]),{...task,id:uid(),done:false}]}:g))
  const toggleGroupTask= (gid,tid)  => setGroupProjects(p=>p.map(g=>g.id===gid?{...g,tasks:(g.tasks||[]).map(t=>t.id===tid?{...t,done:!t.done}:t)}:g))
  const deleteGroupTask= (gid,tid)  => setGroupProjects(p=>p.map(g=>g.id===gid?{...g,tasks:(g.tasks||[]).filter(t=>t.id!==tid)}:g))

  // ── Study Groups ─────────────────────────────────────
  const [studyGroups, setStudyGroups] = useLS('mp_studygroups', [])
  const addStudyGroup    = d => { const id=uid(); setStudyGroups(p=>[...p,{...d,id,sessions:[],resources:[],createdAt:new Date().toISOString()}]); return id }
  const updateStudyGroup = (id,d) => setStudyGroups(p=>p.map(g=>g.id===id?{...g,...d}:g))
  const deleteStudyGroup = id => setStudyGroups(p=>p.filter(g=>g.id!==id))
  const addStudySession  = (gid,s) => setStudyGroups(p=>p.map(g=>g.id===gid?{...g,sessions:[...(g.sessions||[]),{...s,id:uid()}]}:g))
  const deleteStudySession=(gid,sid)=>setStudyGroups(p=>p.map(g=>g.id===gid?{...g,sessions:(g.sessions||[]).filter(s=>s.id!==sid)}:g))
  const addStudyResource = (gid,r) => setStudyGroups(p=>p.map(g=>g.id===gid?{...g,resources:[...(g.resources||[]),{...r,id:uid()}]}:g))
  const deleteStudyResource=(gid,rid)=>setStudyGroups(p=>p.map(g=>g.id===gid?{...g,resources:(g.resources||[]).filter(r=>r.id!==rid)}:g))

  // ── Academic Journal ─────────────────────────────────
  const [journal, setJournal] = useLS('mp_journal', [])
  const addJournalEntry    = entry => setJournal(p=>[...p,{...entry,id:uid(),date:new Date().toISOString()}])
  const updateJournalEntry = (id,d) => setJournal(p=>p.map(e=>e.id===id?{...e,...d}:e))
  const deleteJournalEntry = id => setJournal(p=>p.filter(e=>e.id!==id))

  // ── GPA ──────────────────────────────────────────────
  const [gpaData, setGpaData] = useLS('mp_gpa', { targetGPA: '3.5', expectedGrades: {} })
  const updateGpaData    = d => setGpaData(g=>({...g,...d}))
  const setExpectedGrade = (courseId, grade) => setGpaData(g=>({...g,expectedGrades:{...g.expectedGrades,[courseId]:grade}}))

  // ── Notifications ────────────────────────────────────
  const [notifications, setNotifications] = useLS('mp_notifications', [])
  const addNotification  = n => setNotifications(p=>[{...n,id:uid(),time:new Date().toISOString(),read:false},...p].slice(0,50))
  const markNotifRead    = id => setNotifications(p=>p.map(n=>n.id===id?{...n,read:true}:n))
  const markAllRead      = () => setNotifications(p=>p.map(n=>({...n,read:true})))
  const clearNotifications = () => setNotifications([])

  // ── Gamification ─────────────────────────────────────
  const [gamification, setGamification] = useLS('mp_gamification', {
    xp: 0, level: 1, totalSessions: 0, totalFocusMinutes: 0,
    streak: 0, lastLogin: null, achievements: [], completedDeadlines: 0
  })
  const addXP = amount => setGamification(g => {
    const newXP = g.xp + amount
    const newLevel = Math.floor(newXP / 200) + 1
    return { ...g, xp: newXP, level: newLevel }
  })
  const unlockAchievement = id => setGamification(g => {
    if (g.achievements.includes(id)) return g
    return { ...g, achievements: [...g.achievements, id] }
  })
  const incrementCompleted = () => setGamification(g => ({ ...g, completedDeadlines: g.completedDeadlines + 1 }))
  const incrementSessions  = mins => setGamification(g => ({ ...g, totalSessions: g.totalSessions + 1, totalFocusMinutes: g.totalFocusMinutes + mins }))

  // ── Focus Sessions ───────────────────────────────────
  const [focusSessions, setFocusSessions] = useLS('mp_focus', [])
  const addFocusSession = s => {
    setFocusSessions(p => [...p, { ...s, id: uid(), date: new Date().toISOString() }])
    incrementSessions(s.minutes || 0)
  }

  // ── Notifications permission ─────────────────────────
  const [notifGranted, setNotifGranted] = useLS('mp_notif', false)

  // ── Sharing ──────────────────────────────────────────
  const generateShareCode = () => btoa(JSON.stringify({ slots, v: 2 }))
  const importFromCode = code => {
    try { const d = JSON.parse(atob(code)); return d.slots || null }
    catch { return null }
  }

  // ── Daily login ──────────────────────────────────────
  const checkDailyLogin = () => {
    const today = new Date().toDateString()
    if (gamification.lastLogin !== today) {
      setGamification(g => ({ ...g, lastLogin: today, xp: g.xp + 5, streak: g.streak + 1 }))
    }
  }

  return {
    profile, updateProfile,
    courses, addCourse, updateCourse, deleteCourse, addCourseLink, deleteCourseLink, updateCourseNotes,
    markAttendance, setAttendanceManual,
    slots, addSlot, updateSlot, deleteSlot,
    deadlines, addDeadline, updateDeadline, deleteDeadline, toggleDeadline,
    addSubtask, toggleSubtask, deleteSubtask,
    friends, addFriend, updateFriend, deleteFriend, addFriendSlot, deleteFriendSlot,
    groupProjects, addGroupProject, updateGroupProject, deleteGroupProject, addGroupTask, toggleGroupTask, deleteGroupTask,
    studyGroups, addStudyGroup, updateStudyGroup, deleteStudyGroup, addStudySession, deleteStudySession, addStudyResource, deleteStudyResource,
    journal, addJournalEntry, updateJournalEntry, deleteJournalEntry,
    gpaData, updateGpaData, setExpectedGrade,
    notifications, addNotification, markNotifRead, markAllRead, clearNotifications,
    gamification, addXP, unlockAchievement, incrementCompleted,
    focusSessions, addFocusSession,
    notifGranted, setNotifGranted,
    generateShareCode, importFromCode, checkDailyLogin,
  }
}

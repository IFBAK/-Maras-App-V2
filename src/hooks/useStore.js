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
  // ── Profile ──────────────────────────────────────────────────────────────
  const [profile, setProfile] = useLS('mp_profile', {
    name: '', studentId: '', university: '', department: '', semester: '', totalCredits: '', email: ''
  })
  const updateProfile = d => setProfile(p => ({ ...p, ...d }))

  // ── Courses ───────────────────────────────────────────────────────────────
  const [courses, setCourses] = useLS('mp_courses', [])
  const addCourse    = d => { const id=uid(); setCourses(p=>[...p,{...d,id,links:d.links||[],notes:d.notes||''}]); return id }
  const updateCourse = (id,d) => setCourses(p=>p.map(c=>c.id===id?{...c,...d}:c))
  const deleteCourse = id  => setCourses(p=>p.filter(c=>c.id!==id))
  const addCourseLink    = (cid,link) => setCourses(p=>p.map(c=>c.id===cid?{...c,links:[...(c.links||[]),{...link,id:uid()}]}:c))
  const deleteCourseLink = (cid,lid)  => setCourses(p=>p.map(c=>c.id===cid?{...c,links:(c.links||[]).filter(l=>l.id!==lid)}:c))
  const updateCourseNotes= (cid,notes)=> setCourses(p=>p.map(c=>c.id===cid?{...c,notes}:c))

  // ── Routine slots ──────────────────────────────────────────────────────────
  const [slots, setSlots] = useLS('mp_slots', [])
  const addSlot    = d => { const id=uid(); setSlots(p=>[...p,{...d,id}]); return id }
  const updateSlot = (id,d) => setSlots(p=>p.map(s=>s.id===id?{...s,...d}:s))
  const deleteSlot = id  => setSlots(p=>p.filter(s=>s.id!==id))

  // ── Deadlines ──────────────────────────────────────────────────────────────
  const [deadlines, setDeadlines] = useLS('mp_deadlines', [])
  const addDeadline    = d => { const id=uid(); setDeadlines(p=>[...p,{...d,id,done:false}]); return id }
  const updateDeadline = (id,d) => setDeadlines(p=>p.map(x=>x.id===id?{...x,...d}:x))
  const deleteDeadline = id  => setDeadlines(p=>p.filter(x=>x.id!==id))
  const toggleDeadline = id  => setDeadlines(p=>p.map(x=>x.id===id?{...x,done:!x.done}:x))

  // ── Friends ────────────────────────────────────────────────────────────────
  const [friends, setFriends] = useLS('mp_friends', [])
  const addFriend      = d  => { const id=uid(); setFriends(p=>[...p,{...d,id,slots:d.slots||[]}]); return id }
  const updateFriend   = (id,d) => setFriends(p=>p.map(f=>f.id===id?{...f,...d}:f))
  const deleteFriend   = id  => setFriends(p=>p.filter(f=>f.id!==id))
  const addFriendSlot  = (fid,slot) => setFriends(p=>p.map(f=>f.id===fid?{...f,slots:[...(f.slots||[]),{...slot,id:uid()}]}:f))
  const deleteFriendSlot=(fid,sid)  => setFriends(p=>p.map(f=>f.id===fid?{...f,slots:(f.slots||[]).filter(s=>s.id!==sid)}:f))

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifGranted, setNotifGranted] = useLS('mp_notif', false)

  // ── Share ──────────────────────────────────────────────────────────────────
  const generateShareCode = () => btoa(JSON.stringify({ slots, v: 2 }))
  const importFromCode = code => {
    try { const d = JSON.parse(atob(code)); return d.slots || null }
    catch { return null }
  }

  return {
    profile, updateProfile,
    courses, addCourse, updateCourse, deleteCourse, addCourseLink, deleteCourseLink, updateCourseNotes,
    slots, addSlot, updateSlot, deleteSlot,
    deadlines, addDeadline, updateDeadline, deleteDeadline, toggleDeadline,
    friends, addFriend, updateFriend, deleteFriend, addFriendSlot, deleteFriendSlot,
    notifGranted, setNotifGranted,
    generateShareCode, importFromCode,
  }
}

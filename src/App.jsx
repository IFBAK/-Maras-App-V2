import { useState, useEffect } from 'react'
import { useStore } from './hooks/useStore'
import { useToast } from './hooks/useToast'
import { useAchievements } from './hooks/useAchievements'

import BottomNav    from './components/BottomNav'
import NotifBell    from './components/NotifBell'

import Dashboard    from './pages/Dashboard'
import Deadlines    from './pages/Deadlines'
import Analytics    from './pages/Analytics'
import Timeline     from './pages/Timeline'
import Focus        from './pages/Focus'
import Courses      from './pages/Courses'
import Routine      from './pages/Routine'
import Calendar     from './pages/Calendar'
import Friends      from './pages/Friends'
import Attendance   from './pages/Attendance'
import Journal      from './pages/Journal'
import Groups       from './pages/Groups'
import Profile      from './pages/Profile'
import SemesterReplay from './pages/SemesterReplay'

import './components/BottomNav.css'

export default function App() {
  const store = useStore()
  const { toast, showToast } = useToast()
  const [tab, setTab]           = useState('dashboard')
  const [showProfile, setShowProfile]   = useState(false)
  const [showReplay, setShowReplay]     = useState(false)

  // Daily login XP + streak
  useEffect(() => { store.checkDailyLogin?.() }, [])

  // Achievement auto-detection
  useAchievements({
    gamification:     store.gamification,
    unlockAchievement: store.unlockAchievement,
    addNotification:  store.addNotification,
    showToast,
  })

  // Smart notifications: deadline warnings (once per session)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    store.deadlines.forEach(d => {
      if (d.done) return
      const dl = Math.round(
        (new Date(d.date + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000
      )
      if (dl === 1) {
        const key = `sn_dl1_${d.id}_${today}`
        if (!sessionStorage.getItem(key)) {
          store.addNotification({ type: 'deadline', title: 'Due Tomorrow', body: `"${d.title}" is due tomorrow!` })
          sessionStorage.setItem(key, '1')
        }
      } else if (dl < 0) {
        const key = `sn_ov_${d.id}_${today}`
        if (!sessionStorage.getItem(key)) {
          store.addNotification({ type: 'deadline', title: 'Overdue!', body: `"${d.title}" is overdue — act now.` })
          sessionStorage.setItem(key, '1')
        }
      }
    })
  }, [store.deadlines])

  // Low attendance notifications
  useEffect(() => {
    store.courses.forEach(c => {
      const att = c.attendance || {}
      const total = (att.attended || 0) + (att.missed || 0)
      if (total > 4) {
        const pct = Math.round((att.attended || 0) / total * 100)
        if (pct < 75) {
          const key = `sn_att_${c.id}_${new Date().toISOString().split('T')[0]}`
          if (!sessionStorage.getItem(key)) {
            store.addNotification({ type: 'attendance', title: 'Low Attendance', body: `${c.code || c.name}: ${pct}% attendance. Consider catching up.` })
            sessionStorage.setItem(key, '1')
          }
        }
      }
    })
  }, [store.courses])

  // Navigation handler — intercepts 'profile' to open overlay
  const navigate = (page) => {
    if (page === 'profile') { setShowProfile(true); return }
    setTab(page)
  }

  const scroll = {
    overflowY: 'auto',
    flex: 1,
    paddingBottom: 'calc(var(--nav) + 8px)',
  }

  // Profile & Replay overlays
  if (showReplay) return (
    <div className="app-content">
      <div style={scroll}>
        <SemesterReplay
          deadlines={store.deadlines}
          focusSessions={store.focusSessions}
          gamification={store.gamification}
          onBack={() => setShowReplay(false)}
        />
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )

  if (showProfile) return (
    <div className="app-content">
      <div style={scroll}>
        <Profile
          profile={store.profile}
          updateProfile={store.updateProfile}
          gamification={store.gamification}
          showToast={showToast}
          onBack={() => setShowProfile(false)}
          onReplay={() => { setShowProfile(false); setShowReplay(true) }}
        />
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )

  const renderPage = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={store.profile}
            courses={store.courses}
            slots={store.slots}
            deadlines={store.deadlines}
            friends={store.friends}
            notifGranted={store.notifGranted}
            setNotifGranted={store.setNotifGranted}
            gamification={store.gamification}
            showToast={showToast}
            onNavigate={navigate}
            onProfile={() => setShowProfile(true)}
          />
        )
      case 'deadlines':
        return (
          <Deadlines
            deadlines={store.deadlines}
            courses={store.courses}
            addDeadline={store.addDeadline}
            updateDeadline={store.updateDeadline}
            deleteDeadline={store.deleteDeadline}
            toggleDeadline={store.toggleDeadline}
            addSubtask={store.addSubtask}
            toggleSubtask={store.toggleSubtask}
            deleteSubtask={store.deleteSubtask}
            notifGranted={store.notifGranted}
            addXP={store.addXP}
            incrementCompleted={store.incrementCompleted}
            showToast={showToast}
          />
        )
      case 'analytics':
        return (
          <Analytics
            slots={store.slots}
            deadlines={store.deadlines}
            focusSessions={store.focusSessions}
            gamification={store.gamification}
            courses={store.courses}
            gpaData={store.gpaData}
            setExpectedGrade={store.setExpectedGrade}
            updateGpaData={store.updateGpaData}
          />
        )
      case 'timeline':
        return (
          <Timeline
            deadlines={store.deadlines}
            courses={store.courses}
          />
        )
      case 'focus':
        return (
          <Focus
            focusSessions={store.focusSessions}
            addFocusSession={store.addFocusSession}
            addXP={store.addXP}
            deadlines={store.deadlines}
            showToast={showToast}
          />
        )
      case 'courses':
        return (
          <Courses
            courses={store.courses}
            addCourse={store.addCourse}
            updateCourse={store.updateCourse}
            deleteCourse={store.deleteCourse}
            addCourseLink={store.addCourseLink}
            deleteCourseLink={store.deleteCourseLink}
            updateCourseNotes={store.updateCourseNotes}
            deadlines={store.deadlines}
            showToast={showToast}
          />
        )
      case 'routine':
        return (
          <Routine
            slots={store.slots}
            courses={store.courses}
            addSlot={store.addSlot}
            updateSlot={store.updateSlot}
            deleteSlot={store.deleteSlot}
            showToast={showToast}
          />
        )
      case 'calendar':
        return (
          <Calendar
            slots={store.slots}
            courses={store.courses}
            deadlines={store.deadlines}
          />
        )
      case 'friends':
        return (
          <Friends
            friends={store.friends}
            addFriend={store.addFriend}
            updateFriend={store.updateFriend}
            deleteFriend={store.deleteFriend}
            addFriendSlot={store.addFriendSlot}
            deleteFriendSlot={store.deleteFriendSlot}
            slots={store.slots}
            courses={store.courses}
            generateShareCode={store.generateShareCode}
            importFromCode={store.importFromCode}
            showToast={showToast}
          />
        )
      case 'attendance':
        return (
          <Attendance
            courses={store.courses}
            markAttendance={store.markAttendance}
            setAttendanceManual={store.setAttendanceManual}
          />
        )
      case 'journal':
        return (
          <Journal
            journal={store.journal}
            addJournalEntry={store.addJournalEntry}
            deleteJournalEntry={store.deleteJournalEntry}
          />
        )
      case 'groups':
        return (
          <Groups
            groupProjects={store.groupProjects}
            addGroupProject={store.addGroupProject}
            deleteGroupProject={store.deleteGroupProject}
            addGroupTask={store.addGroupTask}
            toggleGroupTask={store.toggleGroupTask}
            deleteGroupTask={store.deleteGroupTask}
            studyGroups={store.studyGroups}
            addStudyGroup={store.addStudyGroup}
            deleteStudyGroup={store.deleteStudyGroup}
            addStudySession={store.addStudySession}
            deleteStudySession={store.deleteStudySession}
            addStudyResource={store.addStudyResource}
            deleteStudyResource={store.deleteStudyResource}
            courses={store.courses}
            showToast={showToast}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-blob"/>
        <div className="aurora-blob"/>
        <div className="aurora-blob"/>
      </div>

      <div className="app-content">
        {/* Notification bell — fixed top-right */}
        <div style={{ position: 'fixed', top: 14, right: 14, zIndex: 50 }}>
          <NotifBell
            notifications={store.notifications}
            markNotifRead={store.markNotifRead}
            markAllRead={store.markAllRead}
            clearNotifications={store.clearNotifications}
          />
        </div>

        <div style={scroll}>
          {renderPage()}
        </div>

        <BottomNav active={tab} onChange={setTab}/>

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  )
}

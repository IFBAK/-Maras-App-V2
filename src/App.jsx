import { useState } from 'react'
import { useStore } from './hooks/useStore'
import { useToast } from './hooks/useToast'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Courses   from './pages/Courses'
import Routine   from './pages/Routine'
import Deadlines from './pages/Deadlines'
import Calendar  from './pages/Calendar'
import Friends   from './pages/Friends'
import Profile   from './pages/Profile'

export default function App() {
  const store = useStore()
  const { toast, showToast } = useToast()
  const [tab, setTab] = useState('dashboard')

  const scroll = { overflowY: 'auto', flex: 1, paddingBottom: 'calc(var(--nav) + 8px)' }

  const renderPage = () => {
    if (tab === 'profile') {
      return (
        <div style={scroll}>
          <Profile
            profile={store.profile}
            updateProfile={store.updateProfile}
            showToast={showToast}
            onBack={() => setTab('dashboard')}
          />
        </div>
      )
    }
    switch (tab) {
      case 'dashboard':
        return (
          <div style={scroll}>
            <Dashboard
              profile={store.profile}
              courses={store.courses}
              slots={store.slots}
              deadlines={store.deadlines}
              friends={store.friends}
              notifGranted={store.notifGranted}
              setNotifGranted={store.setNotifGranted}
              showToast={showToast}
              onNavigate={setTab}
            />
          </div>
        )
      case 'courses':
        return (
          <div style={scroll}>
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
          </div>
        )
      case 'routine':
        return (
          <div style={scroll}>
            <Routine
              slots={store.slots}
              courses={store.courses}
              addSlot={store.addSlot}
              updateSlot={store.updateSlot}
              deleteSlot={store.deleteSlot}
              showToast={showToast}
            />
          </div>
        )
      case 'deadlines':
        return (
          <div style={scroll}>
            <Deadlines
              deadlines={store.deadlines}
              courses={store.courses}
              addDeadline={store.addDeadline}
              updateDeadline={store.updateDeadline}
              deleteDeadline={store.deleteDeadline}
              toggleDeadline={store.toggleDeadline}
              notifGranted={store.notifGranted}
              showToast={showToast}
            />
          </div>
        )
      case 'calendar':
        return (
          <div style={scroll}>
            <Calendar
              slots={store.slots}
              courses={store.courses}
              deadlines={store.deadlines}
            />
          </div>
        )
      case 'friends':
        return (
          <div style={scroll}>
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
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      {renderPage()}
      <BottomNav active={tab} onChange={setTab} />
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

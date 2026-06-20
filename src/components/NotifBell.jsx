import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { RARITY_COLORS } from '../hooks/useAchievements'
import './NotifBell.css'

const TYPE_EMOJI = {
  achievement: '🏆', deadline: '⏰', attendance: '📋',
  burnout: '🔥', study: '📚', system: '🔔',
}

export default function NotifBell({ notifications, markNotifRead, markAllRead, clearNotifications }) {
  const [open, setOpen] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="nb-wrap">
      <button className="nb-btn" onClick={() => setOpen(o => !o)}>
        <Bell size={18} strokeWidth={1.8}/>
        {unread > 0 && <span className="nb-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <>
          <div className="nb-overlay" onClick={() => setOpen(false)}/>
          <div className="nb-dropdown">
            <div className="nb-head">
              <span className="nb-head-title">Notifications</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {unread > 0 && <button className="nb-action" onClick={markAllRead}>Mark all read</button>}
                {notifications.length > 0 && <button className="nb-action" onClick={clearNotifications}>Clear</button>}
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="nb-empty">All caught up! 🎉</div>
            ) : (
              <div className="nb-list">
                {notifications.slice(0, 12).map(n => (
                  <div key={n.id} className={`nb-item ${n.read ? 'read' : ''}`}
                    onClick={() => markNotifRead(n.id)}>
                    <span className="nb-icon">{TYPE_EMOJI[n.type] || TYPE_EMOJI.system}</span>
                    <div className="nb-content">
                      <div className="nb-title" style={n.rarity ? { color: RARITY_COLORS[n.rarity] } : {}}>
                        {n.title}
                      </div>
                      <div className="nb-body">{n.body}</div>
                      <div className="nb-time">
                        {new Date(n.time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.read && <div className="nb-dot"/>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

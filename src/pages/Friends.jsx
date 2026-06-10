import { useState } from 'react'
import { DAYS, formatTime, todayShort, FRIEND_COLORS, timeToMins } from '../utils/helpers'
import './Friends.css'

export default function Friends({ friends, addFriend, updateFriend, deleteFriend, addFriendSlot, deleteFriendSlot, slots: mySlots, courses, generateShareCode, importFromCode, showToast }) {
  const [view, setView] = useState('list')
  const [activeFriend, setActiveFriend] = useState(null)
  const [activeDay, setActiveDay] = useState(todayShort())
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [slotModal, setSlotModal] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [confirmDelFriend, setConfirmDelFriend] = useState(null)

  const friend = friends.find(f => f.id === activeFriend)
  const today = todayShort()

  const openFriend = (id) => { setActiveFriend(id); setView('detail') }
  const closeFriend = () => { setActiveFriend(null); setView('list') }

  const handleAddFriendSlot = (form) => {
    addFriendSlot(activeFriend, form)
    showToast('✅ Class added')
    setSlotModal(null)
  }

  const handleDeleteFriend = (id) => {
    deleteFriend(id)
    setConfirmDelFriend(null)
    if (activeFriend === id) closeFriend()
    showToast('👋 Friend removed')
  }

  if (view === 'detail' && friend) {
    const daySlots = (friend.slots || [])
      .filter(s => s.days.includes(activeDay))
      .sort((a,b) => a.startTime.localeCompare(b.startTime))

    return (
      <div className="page friends-page">
        <div className="page-hd">
          <button className="btn btn-ghost btn-sm" onClick={closeFriend}>← Back</button>
          <div style={{display:'flex',gap:8}}>
            <span className="friend-avatar-sm" style={{background:friend.color}}>{friend.name[0].toUpperCase()}</span>
            <span style={{fontWeight:600,alignSelf:'center'}}>{friend.name}</span>
          </div>
          <button className="btn btn-icon danger" onClick={()=>setConfirmDelFriend(friend.id)}>🗑️</button>
        </div>

        <div className="day-tabs">
          {DAYS.map(d => {
            const cnt = (friend.slots||[]).filter(s=>s.days.includes(d)).length
            return (
              <button key={d} className={`day-tab ${activeDay===d?'active':''} ${d===today?'today':''}`} onClick={()=>setActiveDay(d)}>
                {d}{cnt>0&&<span className="day-dot"/>}
              </button>
            )
          })}
        </div>

        <button className="btn btn-primary btn-sm" style={{alignSelf:'flex-start'}} onClick={()=>setSlotModal('add')}>+ Add class</button>

        {daySlots.length === 0 ? (
          <div className="empty"><span className="ei">📭</span><p>{friend.name} has no classes on {activeDay}.</p></div>
        ) : (
          <div className="slot-list">
            {daySlots.map(s => (
              <div key={s.id} className="slot-card" style={{'--c':s.color||friend.color}}>
                <div className="sc-bar"/>
                <div className="sc-body">
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <div className="sc-name">{s.customName||'Class'}</div>
                    {s.type && <span style={{fontSize:10,fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase',color:'var(--txt-3)',background:'var(--bg-3)',border:'1px solid var(--border-2)',padding:'1px 6px',borderRadius:99,fontFamily:'var(--mono)'}}>{s.type}</span>}
                  </div>
                  <div className="sc-time">🕐 {formatTime(s.startTime)} – {formatTime(s.endTime)}</div>
                  {s.room&&<div className="sc-room">📍 {s.room}</div>}
                </div>
                <button className="btn btn-icon danger" onClick={()=>setConfirmDel(s.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        <OverlapSection mySlots={mySlots} courses={courses} friendSlots={friend.slots||[]} friendName={friend.name} activeDay={activeDay}/>

        {slotModal && (
          <FriendSlotModal onSave={handleAddFriendSlot} onClose={()=>setSlotModal(null)} color={friend.color}/>
        )}

        {confirmDel && (
          <ConfirmModal message="Remove this class?" onConfirm={()=>{deleteFriendSlot(activeFriend,confirmDel);setConfirmDel(null);showToast('🗑️ Removed')}} onClose={()=>setConfirmDel(null)}/>
        )}
        {confirmDelFriend && (
          <ConfirmModal message={`Remove ${friend.name} from friends?`} onConfirm={()=>handleDeleteFriend(confirmDelFriend)} onClose={()=>setConfirmDelFriend(null)}/>
        )}
      </div>
    )
  }

  return (
    <div className="page friends-page">
      <div className="page-hd">
        <h1 className="page-title">Friends</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowShareModal(true)}>Share</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAddFriend(true)}>+ Add</button>
        </div>
      </div>

      {friends.length === 0 ? (
        <div className="empty"><span className="ei">👥</span><p>No friends added yet.<br/>Add a friend and enter their schedule, or share your routine code with them.</p></div>
      ) : (
        <div className="friends-list">
          {friends.map(f => {
            const total = (f.slots||[]).length
            const todayCnt = (f.slots||[]).filter(s=>s.days.includes(today)).length
            return (
              <div key={f.id} className="friend-card" onClick={()=>openFriend(f.id)}>
                <span className="friend-avatar" style={{background:f.color}}>{f.name[0].toUpperCase()}</span>
                <div className="friend-card-info">
                  <div className="friend-card-name">{f.name}</div>
                  <div className="friend-card-meta">
                    {total} class{total!==1?'es':''}
                    {todayCnt>0&&<span className="friend-today-tag"> · {todayCnt} today</span>}
                  </div>
                </div>
                <span style={{color:'var(--txt-3)',fontSize:18}}>›</span>
              </div>
            )
          })}
        </div>
      )}

      {friends.length > 0 && <TodayOverlapSummary mySlots={mySlots} courses={courses} friends={friends}/>}

      {showAddFriend && (
        <AddFriendModal
          friends={friends}
          colors={FRIEND_COLORS}
          onAdd={(f)=>{addFriend(f);setShowAddFriend(false);showToast(`👋 ${f.name} added!`)}}
          onImport={(code,name,color)=>{
            const imported = importFromCode(code)
            if(!imported){showToast('❌ Invalid code');return}
            addFriend({name,color,slots:imported})
            setShowAddFriend(false)
            showToast(`✅ Imported ${imported.length} slots for ${name}`)
          }}
          onClose={()=>setShowAddFriend(false)}
        />
      )}

      {showShareModal && (
        <ShareModal code={generateShareCode()} onClose={()=>setShowShareModal(false)} showToast={showToast}/>
      )}
    </div>
  )
}

function OverlapSection({ mySlots, courses, friendSlots, friendName, activeDay }) {
  const myDay = mySlots.filter(s=>s.days.includes(activeDay))
  const fDay  = friendSlots.filter(s=>s.days.includes(activeDay))
  const overlaps = myDay.filter(my=>fDay.some(f=>timesOverlap(my.startTime,my.endTime,f.startTime,f.endTime)))
  if (!myDay.length) return null
  return (
    <div className="overlap-block">
      <div className="section-label">📌 Overlap on {activeDay}</div>
      {overlaps.length===0 ? (
        <p style={{fontSize:13,color:'var(--txt-3)'}}>No overlapping classes with {friendName} on {activeDay}.</p>
      ) : overlaps.map(s=>{
        const c=courses.find(x=>x.id===s.courseId)
        return (
          <div key={s.id} className="overlap-row">
            <span style={{color:'var(--amber)',fontSize:13}}>⚠️</span>
            <span style={{fontSize:13,fontWeight:500}}>{c?.name||s.customName||'Class'}</span>
            <span style={{fontSize:12,color:'var(--txt-3)',fontFamily:'var(--mono)'}}>{formatTime(s.startTime)}–{formatTime(s.endTime)}</span>
          </div>
        )
      })}
    </div>
  )
}

function TodayOverlapSummary({ mySlots, courses, friends }) {
  const today = todayShort()
  const myToday = mySlots.filter(s=>s.days.includes(today))
  if (!myToday.length) return null
  const shared = friends.flatMap(f=>(f.slots||[]).filter(fs=>fs.days.includes(today)&&myToday.some(ms=>timesOverlap(ms.startTime,ms.endTime,fs.startTime,fs.endTime))).map(fs=>({...fs,friendName:f.name,friendColor:f.color})))
  if (!shared.length) return null
  return (
    <div className="overlap-block">
      <div className="section-label">👥 Friends in same class today</div>
      {shared.map((s,i)=>(
        <div key={i} className="overlap-row">
          <span className="color-dot" style={{background:s.friendColor}}/>
          <span style={{fontSize:13,fontWeight:500}}>{s.friendName}</span>
          <span style={{fontSize:12,color:'var(--txt-3)'}}>{s.customName||'Class'} · {formatTime(s.startTime)}</span>
        </div>
      ))}
    </div>
  )
}

function timesOverlap(s1,e1,s2,e2) { return s1<e2&&e1>s2 }

function FriendSlotModal({ onSave, onClose, color }) {
  const [f, setF] = useState({ customName:'', type:'Lecture', days:[], startTime:'08:00', endTime:'09:30', room:'', color })
  const set=(k,v)=>setF(p=>({...p,[k]:v}))
  const toggleDay=d=>set('days',f.days.includes(d)?f.days.filter(x=>x!==d):[...f.days,d])
  const valid=f.days.length>0&&f.customName.trim()
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd"><span className="modal-title">Add class</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="form-group"><label>Class name *</label><input autoFocus placeholder="e.g. Physics" value={f.customName} onChange={e=>set('customName',e.target.value)}/></div>
        <div className="form-group">
          <label>Type</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
            {['Lecture','Lab','Tutorial','Seminar','Other'].map(t=>(
              <button key={t} className={`day-pill ${f.type===t?'on':''}`} onClick={()=>set('type',t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Days *</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
            {DAYS.map(d=><button key={d} className={`day-pill ${f.days.includes(d)?'on':''}`} onClick={()=>toggleDay(d)}>{d}</button>)}
          </div>
        </div>
        <div className="form-row form-group">
          <div><label>Start</label><input type="time" value={f.startTime} onChange={e=>set('startTime',e.target.value)}/></div>
          <div><label>End</label><input type="time" value={f.endTime} onChange={e=>set('endTime',e.target.value)}/></div>
        </div>
        <div className="form-group"><label>Room</label><input placeholder="e.g. Room 204" value={f.room} onChange={e=>set('room',e.target.value)}/></div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>valid&&onSave(f)} disabled={!valid} style={{flex:2}}>Add class</button>
        </div>
      </div>
    </div>
  )
}

function AddFriendModal({ onAdd, onImport, onClose, colors, friends }) {
  const [tab, setTab] = useState('manual')
  const [name, setName] = useState('')
  const [color, setColor] = useState(colors[friends.length%colors.length])
  const [code, setCode] = useState('')
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd"><span className="modal-title">Add friend</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="tab-row">
          <button className={`tab-btn ${tab==='manual'?'active':''}`} onClick={()=>setTab('manual')}>Manual</button>
          <button className={`tab-btn ${tab==='import'?'active':''}`} onClick={()=>setTab('import')}>Import code</button>
        </div>
        <div className="form-group" style={{marginTop:16}}>
          <label>Name *</label>
          <input autoFocus placeholder="e.g. Riya" value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Color</label>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {colors.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:'50%',background:c,border:color===c?'3px solid #fff':'2px solid transparent',boxShadow:color===c?`0 0 0 2px ${c}`:'none',transition:'all .12s'}}/>
            ))}
          </div>
        </div>
        {tab==='import'&&(
          <div className="form-group">
            <label>Routine code</label>
            <textarea rows={3} placeholder="Paste the code your friend shared..." value={code} onChange={e=>setCode(e.target.value)} style={{resize:'none',fontFamily:'var(--mono)',fontSize:12}}/>
          </div>
        )}
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" style={{flex:2}} onClick={()=>tab==='manual'?(!name.trim()||onAdd({name:name.trim(),color,slots:[]})):(!name.trim()||!code.trim()||onImport(code.trim(),name.trim(),color))} disabled={!name.trim()||(tab==='import'&&!code.trim())}>
            {tab==='import'?'Import & add':'Add friend'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShareModal({ code, onClose, showToast }) {
  const [copied, setCopied] = useState(false)
  const copy=()=>navigator.clipboard.writeText(code).then(()=>{setCopied(true);showToast('📋 Copied!');setTimeout(()=>setCopied(false),2000)})
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd"><span className="modal-title">Share your routine</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <p style={{fontSize:13,color:'var(--txt-2)',marginBottom:16}}>Share this code with friends so they can import your schedule.</p>
        <div className="share-code-box"><code>{code.slice(0,100)}…</code></div>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Close</button>
          <button className="btn btn-primary" onClick={copy} style={{flex:2}}>{copied?'✓ Copied!':'📋 Copy code'}</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd"><span className="modal-title">Are you sure?</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <p style={{color:'var(--txt-2)',marginBottom:20,fontSize:14}}>{message}</p>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} style={{flex:1,padding:'11px 0',borderRadius:'var(--r2)'}}>Remove</button>
        </div>
      </div>
    </div>
  )
}

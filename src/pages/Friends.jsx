import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Users, Share2, Copy, Check } from 'lucide-react'
import { DAYS, formatTime, todayShort, FRIEND_COLORS } from '../utils/helpers'
import './Friends.css'

export default function Friends({ friends, addFriend, deleteFriend, addFriendSlot, deleteFriendSlot, slots: mySlots, courses, generateShareCode, importFromCode, showToast }) {
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
    showToast('Class added')
    setSlotModal(null)
  }

  const handleDeleteFriend = (id) => {
    deleteFriend(id)
    setConfirmDelFriend(null)
    if (activeFriend === id) closeFriend()
    showToast('Friend removed')
  }

  if (view === 'detail' && friend) {
    const daySlots = (friend.slots || [])
      .filter(s => s.days.includes(activeDay))
      .sort((a,b) => a.startTime.localeCompare(b.startTime))

    return (
      <div className="page friends-page">
        <div className="page-hd" style={{marginBottom:18}}>
          <button className="back-link" onClick={closeFriend}><ChevronLeft size={17} strokeWidth={1.7}/> Friends</button>
          <button className="btn-icon danger" onClick={()=>setConfirmDelFriend(friend.id)}><Trash2 size={16} strokeWidth={1.6}/></button>
        </div>

        <div className="friend-hero">
          <span className="friend-hero-avatar serif" style={{color:friend.color,borderColor:friend.color+'55',background:friend.color+'10'}}>{friend.name[0].toUpperCase()}</span>
          <h1 className="friend-hero-name serif">{friend.name}</h1>
        </div>

        <div className="ttabs day-tabs-row">
          {DAYS.map(d => (
            <button key={d} className={`ttab ${activeDay===d?'active':''}`} onClick={()=>setActiveDay(d)}>{d}</button>
          ))}
        </div>

        <button className="text-action" style={{margin:'18px 0 8px',display:'flex',alignItems:'center',gap:5}} onClick={()=>setSlotModal('add')}><Plus size={14} strokeWidth={2}/> Add class</button>

        {daySlots.length === 0 ? (
          <div className="empty" style={{padding:'32px 0'}}><p>{friend.name} has no classes on {activeDay}.</p></div>
        ) : (
          <div className="elist">
            {daySlots.map(s => (
              <div key={s.id} className="erow">
                <span className="lv-bar" style={{background:s.color||friend.color}}/>
                <div className="lv-info">
                  <div className="lv-top">
                    <span className="lv-code" style={{color:s.color||friend.color}}>{s.customName||'Class'}</span>
                    {s.type && <span className="lv-type">{s.type}</span>}
                  </div>
                  <div className="lv-meta">{formatTime(s.startTime)} – {formatTime(s.endTime)}{s.room && ` · ${s.room}`}</div>
                </div>
                <button className="btn-icon danger" onClick={()=>setConfirmDel(s.id)}><X size={15} strokeWidth={1.7}/></button>
              </div>
            ))}
          </div>
        )}

        <OverlapSection mySlots={mySlots} courses={courses} friendSlots={friend.slots||[]} friendName={friend.name} activeDay={activeDay}/>

        {slotModal && <FriendSlotModal onSave={handleAddFriendSlot} onClose={()=>setSlotModal(null)} color={friend.color}/>}
        {confirmDel && <ConfirmModal message="Remove this class?" onConfirm={()=>{deleteFriendSlot(activeFriend,confirmDel);setConfirmDel(null);showToast('Removed')}} onClose={()=>setConfirmDel(null)}/>}
        {confirmDelFriend && <ConfirmModal message={`Remove ${friend.name} from friends?`} onConfirm={()=>handleDeleteFriend(confirmDelFriend)} onClose={()=>setConfirmDelFriend(null)}/>}
      </div>
    )
  }

  return (
    <div className="page friends-page">
      <div className="page-hd">
        <h1 className="page-title">Friends</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowShareModal(true)}><Share2 size={13} strokeWidth={1.8}/> Share</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAddFriend(true)}><Plus size={14} strokeWidth={2}/> Add</button>
        </div>
      </div>

      {friends.length === 0 ? (
        <div className="empty"><Users size={32} strokeWidth={1.3}/><p>No friends added yet.<br/>Add a friend and enter their schedule, or share your routine code with them.</p></div>
      ) : (
        <div className="elist">
          {friends.map(f => {
            const total = (f.slots||[]).length
            const todayCnt = (f.slots||[]).filter(s=>s.days.includes(today)).length
            return (
              <button key={f.id} className="erow friend-row" onClick={()=>openFriend(f.id)}>
                <span className="friend-avatar serif" style={{color:f.color,borderColor:f.color+'55',background:f.color+'10'}}>{f.name[0].toUpperCase()}</span>
                <div className="friend-info">
                  <span className="friend-name">{f.name}</span>
                  <span className="friend-meta">{total} class{total!==1?'es':''}{todayCnt>0 && ` · ${todayCnt} today`}</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.6} style={{color:'var(--txt-3)'}}/>
              </button>
            )
          })}
        </div>
      )}

      {friends.length > 0 && <TodayOverlapSummary mySlots={mySlots} friends={friends}/>}

      {showAddFriend && (
        <AddFriendModal
          friends={friends}
          colors={FRIEND_COLORS}
          onAdd={(f)=>{addFriend(f);setShowAddFriend(false);showToast(`${f.name} added`)}}
          onImport={(code,name,color)=>{
            const imported = importFromCode(code)
            if(!imported){showToast('Invalid code');return}
            addFriend({name,color,slots:imported})
            setShowAddFriend(false)
            showToast(`Imported ${imported.length} slots for ${name}`)
          }}
          onClose={()=>setShowAddFriend(false)}
        />
      )}

      {showShareModal && <ShareModal code={generateShareCode()} onClose={()=>setShowShareModal(false)} showToast={showToast}/>}
    </div>
  )
}

function OverlapSection({ mySlots, courses, friendSlots, friendName, activeDay }) {
  const myDay = mySlots.filter(s=>s.days.includes(activeDay))
  const fDay  = friendSlots.filter(s=>s.days.includes(activeDay))
  const overlaps = myDay.filter(my=>fDay.some(f=>timesOverlap(my.startTime,my.endTime,f.startTime,f.endTime)))
  if (!myDay.length) return null
  return (
    <div style={{marginTop:28}}>
      <div className="section-label">Overlap on {activeDay}</div>
      {overlaps.length===0 ? (
        <p style={{fontSize:13,color:'var(--txt-3)'}}>No overlapping classes with {friendName} on {activeDay}.</p>
      ) : overlaps.map(s=>{
        const c=courses.find(x=>x.id===s.courseId)
        return (
          <div key={s.id} className="erow">
            <span className="dot" style={{background:'var(--warn)'}}/>
            <span style={{flex:1,fontSize:13.5,fontWeight:500}}>{c?.name||s.customName||'Class'}</span>
            <span style={{fontSize:11.5,color:'var(--txt-3)',fontFamily:'var(--mono)'}}>{formatTime(s.startTime)}–{formatTime(s.endTime)}</span>
          </div>
        )
      })}
    </div>
  )
}

function TodayOverlapSummary({ mySlots, friends }) {
  const today = todayShort()
  const myToday = mySlots.filter(s=>s.days.includes(today))
  if (!myToday.length) return null
  const shared = friends.flatMap(f=>(f.slots||[]).filter(fs=>fs.days.includes(today)&&myToday.some(ms=>timesOverlap(ms.startTime,ms.endTime,fs.startTime,fs.endTime))).map(fs=>({...fs,friendName:f.name,friendColor:f.color})))
  if (!shared.length) return null
  return (
    <div style={{marginTop:28}}>
      <div className="section-label">Friends in same class today</div>
      <div className="elist">
        {shared.map((s,i)=>(
          <div key={i} className="erow">
            <span className="dot" style={{background:s.friendColor}}/>
            <span style={{flex:1,fontSize:13.5,fontWeight:500}}>{s.friendName}</span>
            <span style={{fontSize:12,color:'var(--txt-3)'}}>{s.customName||'Class'} · {formatTime(s.startTime)}</span>
          </div>
        ))}
      </div>
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
        <div className="modal-hd"><span className="modal-title">Add class</span><button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button></div>
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
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
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
        <div className="modal-hd"><span className="modal-title">Add friend</span><button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button></div>
        <div className="ttabs" style={{marginBottom:18}}>
          <button className={`ttab ${tab==='manual'?'active':''}`} onClick={()=>setTab('manual')}>Manual</button>
          <button className={`ttab ${tab==='import'?'active':''}`} onClick={()=>setTab('import')}>Import code</button>
        </div>
        <div className="form-group">
          <label>Name *</label>
          <input autoFocus placeholder="e.g. Riya" value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Color</label>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {colors.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{width:24,height:24,borderRadius:'50%',background:c,border:color===c?'2px solid var(--txt)':'2px solid transparent',opacity:color===c?1:.55,transition:'all .12s'}}/>
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
  const copy=()=>navigator.clipboard.writeText(code).then(()=>{setCopied(true);showToast('Copied');setTimeout(()=>setCopied(false),2000)})
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd"><span className="modal-title">Share your routine</span><button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button></div>
        <p style={{fontSize:13,color:'var(--txt-2)',marginBottom:16}}>Share this code with friends so they can import your schedule.</p>
        <div className="share-code-box"><code>{code.slice(0,100)}…</code></div>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Close</button>
          <button className="btn btn-primary" onClick={copy} style={{flex:2,justifyContent:'center'}}>
            {copied ? <><Check size={14} strokeWidth={2}/> Copied</> : <><Copy size={14} strokeWidth={1.8}/> Copy code</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd"><span className="modal-title">Are you sure?</span><button className="modal-x" onClick={onClose}><X size={18} strokeWidth={1.7}/></button></div>
        <p style={{color:'var(--txt-2)',marginBottom:20,fontSize:13.5}}>{message}</p>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} style={{flex:1}}>Remove</button>
        </div>
      </div>
    </div>
  )
}

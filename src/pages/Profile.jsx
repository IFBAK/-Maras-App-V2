import { useState } from 'react'
import './Profile.css'

export default function Profile({ profile, updateProfile, showToast, onBack }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const set = (k,v) => setDraft(p=>({...p,[k]:v}))

  const save = () => {
    updateProfile(draft)
    setEditing(false)
    showToast('✅ Profile saved')
  }

  const cancel = () => {
    setDraft(profile)
    setEditing(false)
  }

  const fields = [
    { key:'name',         label:'Full name',      placeholder:'e.g. Mara Hossain'    },
    { key:'studentId',    label:'Student ID',     placeholder:'e.g. 2021-3-60-097'   },
    { key:'university',   label:'University',     placeholder:'e.g. DIU'             },
    { key:'department',   label:'Department',     placeholder:'e.g. CSE'             },
    { key:'semester',     label:'Semester',       placeholder:'e.g. 7th'             },
    { key:'totalCredits', label:'Total credits',  placeholder:'e.g. 130'             },
    { key:'email',        label:'Email',          placeholder:'you@student.edu'       },
  ]

  return (
    <div className="page profile-page">
      <div className="page-hd">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        {!editing
          ? <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(true)}>Edit</button>
          : <div style={{display:'flex',gap:8}}>
              <button className="btn btn-ghost btn-sm" onClick={cancel}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
            </div>
        }
      </div>

      {/* Avatar + name card */}
      <div className="profile-hero">
        <div className="ph-avatar">{(profile.name||'?')[0].toUpperCase()}</div>
        <div className="ph-name">{profile.name || 'Your Name'}</div>
        <div className="ph-meta">
          {[profile.university, profile.department, profile.semester && `Semester ${profile.semester}`].filter(Boolean).join(' · ') || 'No details yet'}
        </div>
      </div>

      {/* Fields */}
      <div className="profile-fields">
        {fields.map(f => (
          <div key={f.key} className="pf-row">
            <div className="pf-label">{f.label}</div>
            {editing ? (
              <input
                value={draft[f.key] || ''}
                placeholder={f.placeholder}
                onChange={e=>set(f.key, e.target.value)}
              />
            ) : (
              <div className="pf-value">{profile[f.key] || <span className="pf-empty">Not set</span>}</div>
            )}
          </div>
        ))}
      </div>

      {!editing && !Object.values(profile).some(Boolean) && (
        <div className="empty" style={{paddingTop:0}}>
          <p style={{fontSize:13}}>Tap <strong>Edit</strong> to fill in your details.</p>
        </div>
      )}
    </div>
  )
}

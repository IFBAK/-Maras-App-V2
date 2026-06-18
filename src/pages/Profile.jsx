import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import './Profile.css'

export default function Profile({ profile, updateProfile, showToast, onBack }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const set = (k,v) => setDraft(p=>({...p,[k]:v}))

  const save = () => { updateProfile(draft); setEditing(false); showToast('Profile saved') }
  const cancel = () => { setDraft(profile); setEditing(false) }

  const fields = [
    { key:'name',         label:'Full name',     placeholder:'Mara Hossain'    },
    { key:'studentId',    label:'Student ID',    placeholder:'2021-3-60-097'   },
    { key:'university',   label:'University',    placeholder:'DIU'             },
    { key:'department',   label:'Department',    placeholder:'CSE'             },
    { key:'semester',     label:'Semester',      placeholder:'7th'             },
    { key:'totalCredits', label:'Total credits', placeholder:'130'             },
    { key:'email',        label:'Email',         placeholder:'you@student.edu' },
  ]

  return (
    <div className="page profile-page">
      <div className="page-hd" style={{marginBottom:8}}>
        <button className="back-link" onClick={onBack}><ChevronLeft size={17} strokeWidth={1.7}/> Home</button>
        {!editing
          ? <button className="text-action" onClick={()=>setEditing(true)}>Edit</button>
          : <div style={{display:'flex',gap:16}}>
              <button className="text-action muted" onClick={cancel}>Cancel</button>
              <button className="text-action" onClick={save}>Save</button>
            </div>
        }
      </div>

      <div className="profile-hero">
        <div className="ph-avatar serif">{(profile.name||'?')[0].toUpperCase()}</div>
        <h1 className="ph-name serif">{profile.name || 'Your Name'}</h1>
        <div className="ph-meta">
          {[profile.university, profile.department, profile.semester && `Semester ${profile.semester}`].filter(Boolean).join(' · ') || 'No details yet'}
        </div>
      </div>

      <div className="profile-fields">
        {fields.map(f => (
          <div key={f.key} className="pf-row">
            <span className="pf-label">{f.label}</span>
            {editing ? (
              <input value={draft[f.key] || ''} placeholder={f.placeholder} onChange={e=>set(f.key, e.target.value)} className="pf-input"/>
            ) : (
              <span className="pf-value">{profile[f.key] || <span className="pf-empty">Not set</span>}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

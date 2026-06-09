'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Badge, SubBadge, Stars, StatusBadge } from '@/components/ui'
import Link from 'next/link'
import {
  MapPin, Briefcase, Check, Pencil, X, Save, Loader2,
  Plus, Trash2, Camera, AlertCircle, CheckCircle,
} from 'lucide-react'

// ─── Firebase ────────────────────────────────────────────────────────────────
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL,
} from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso',
  'Guinée', 'Niger', 'Togo', 'Bénin', 'Congo', 'Gabon', 'RDC',
]
const LANG_LEVELS = ['Natif', 'Courant', 'Intermédiaire', 'Débutant']

function Toast({ msg, type }) {
  if (!msg) return null
  const ok = type === 'success'
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium animate-slide-up ${ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg}
    </div>
  )
}

// Champ texte éditable inline
function EditableField({ label, value, onSave, type = 'text', textarea = false, options }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(value ?? '')
  const [saving, setSaving]   = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(val)
    setSaving(false)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="group flex items-start justify-between gap-2">
        <div>
          {label && <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>}
          <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">{value || <span className="text-gray-300 italic">Non renseigné</span>}</p>
        </div>
        <button onClick={() => { setVal(value ?? ''); setEditing(true) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0">
          <Pencil size={13} />
        </button>
      </div>
    )
  }

  return (
    <div>
      {label && <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>}
      {options ? (
        <select value={val} onChange={e => setVal(e.target.value)} className="input text-sm">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : textarea ? (
        <textarea rows={4} value={val} onChange={e => setVal(e.target.value)}
          className="input text-sm resize-none" />
      ) : (
        <input type={type} value={val} onChange={e => setVal(e.target.value)}
          className="input text-sm" />
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={handleSave} disabled={saving}
          className="btn-gold btn-sm inline-flex items-center gap-1.5 disabled:opacity-60">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Enregistrer
        </button>
        <button onClick={() => setEditing(false)} className="btn-outline btn-sm inline-flex items-center gap-1">
          <X size={12} /> Annuler
        </button>
      </div>
    </div>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function ProfilePage({ params }) {
  const router          = useRouter()
  const avatarInputRef  = useRef(null)

  const [authUser, setAuthUser]   = useState(undefined)
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState({ msg: '', type: '' })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  // Skill / language edit state
  const [newSkill, setNewSkill]     = useState('')
  const [newLang, setNewLang]       = useState({ name: '', level: 'Courant' })

  // ── Auth + profil ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setAuthUser(user ?? null)
      if (!user) { setLoading(false); return }

      const targetId = params?.id ?? user.uid
      const snap = await getDoc(doc(db, 'users', targetId))
      setProfile(snap.exists() ? { uid: targetId, ...snap.data() } : null)
      setLoading(false)
    })
    return unsub
  }, [params?.id])

  const isOwner = authUser && profile && authUser.uid === profile.uid

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 3500)
  }

  // ── Mise à jour Firestore ──────────────────────────────────────────────────
  async function updateField(field, value) {
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        [field]: value, updatedAt: serverTimestamp(),
      })
      setProfile(p => ({ ...p, [field]: value }))
      showToast('Modifié avec succès')
    } catch {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  // ── Upload avatar ──────────────────────────────────────────────────────────
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Fichier trop lourd (max 5 Mo)', 'error'); return }
    setUploadingAvatar(true)
    try {
      const storageRef = ref(storage, `avatars/${profile.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateField('photoURL', url)
    } catch {
      showToast('Erreur upload avatar', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  async function addSkill() {
    if (!newSkill.trim()) return
    const updated = [...(profile.skills ?? []), newSkill.trim()]
    await updateField('skills', updated)
    setNewSkill('')
  }

  async function removeSkill(skill) {
    await updateField('skills', (profile.skills ?? []).filter(s => s !== skill))
  }

  // ── Langues ────────────────────────────────────────────────────────────────
  async function addLanguage() {
    if (!newLang.name.trim()) return
    const updated = [...(profile.languages ?? []), { name: newLang.name.trim(), level: newLang.level }]
    await updateField('languages', updated)
    setNewLang({ name: '', level: 'Courant' })
  }

  async function removeLang(name) {
    await updateField('languages', (profile.languages ?? []).filter(l => l.name !== name))
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-gold-500" />
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Profil introuvable.</p>
          <Link href="/" className="btn-gold btn-sm">Accueil</Link>
        </div>
      </>
    )
  }

  const displayName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || authUser?.email
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <Navbar />
      <Toast msg={toast.msg} type={toast.type} />

      <div className="min-h-screen bg-gray-50 pt-16">

        {/* Cover */}
        <div className="h-48 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #152B47 0%, #1F3D67 60%, rgba(201,168,76,0.2) 100%)',
        }}>
          <div className="absolute inset-0 hero-grid-pattern opacity-50" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 120% at 70% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between -mt-10 pb-5 border-b border-gray-100 flex-wrap gap-4">
              <div className="flex items-end gap-5" style={{zIndex:1}}>

                {/* Avatar */}
                <div className="relative group">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt={displayName}
                      className="w-[88px] h-[88px] rounded-full object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-display text-3xl font-bold border-4 border-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
                      {initials}
                    </div>
                  )}
                  {profile.verified && (
                    <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  {/* Overlay upload si propriétaire */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        {uploadingAvatar
                          ? <Loader2 size={20} className="animate-spin" />
                          : <Camera size={20} />}
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </>
                  )}
                </div>

                <div className="mb-2">
                  {/* Nom éditable */}
                  {isOwner ? (
                    <div className="flex items-center gap-2">
                      <EditableField
                        value={`${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()}
                        onSave={async val => {
                          const [first, ...rest] = val.split(' ')
                          await updateField('firstName', first)
                          await updateField('lastName', rest.join(' '))
                        }}
                      />
                    </div>
                  ) : (
                    <h1 className="font-display text-2xl font-bold text-navy-900" >{displayName}</h1>
                  )}

                  {/* Spécialité */}
                  {isOwner ? (
                    <EditableField value={profile.speciality} onSave={v => updateField('speciality', v)} />
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">{profile.speciality}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} />
                      {isOwner
                        ? <EditableField value={profile.country} onSave={v => updateField('country', v)} options={COUNTRIES} />
                        : profile.country}
                    </span>
                    <Stars rating={profile.rating ?? 5} reviews={profile.reviews ?? 0} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Briefcase size={12} />
                      {isOwner
                        ? <><EditableField value={String(profile.experience ?? '')} onSave={v => updateField('experience', v)} type="number" /> ans</>
                        : `${profile.experience} ans d'expérience`}
                    </span>
                    <SubBadge plan={profile.plan} />
                    {profile.verified && <Badge variant="verified"><Check size={10} strokeWidth={3} /> Certifié</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 mb-3">
                {!isOwner && (
                  <>
                    <Link href={`/contact/${profile.uid}`} className="btn-outline btn-sm">Contacter</Link>
                    <Link href={`/propose/${profile.uid}`} className="btn-gold btn-sm">Proposer un dossier</Link>
                  </>
                )}
                {isOwner && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 border border-gold-200 rounded-xl text-xs font-semibold text-gold-700">
                    <Pencil size={11} /> Mode édition actif
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">

            {/* Stats */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Statistiques</h5>
              {[
                ['Missions complétées', profile.missions ?? '—'],
                ['Taux de succès',      `${profile.successRate ?? '—'}%`],
                ['Temps de réponse',    profile.responseTime ?? '—'],
                ["Pays d'intervention", profile.countries ?? '—'],
                ['Profil vu (30j)',     profile.profileViews?.toLocaleString() ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-semibold text-navy-800">{v}</span>
                </div>
              ))}
            </div>

            {/* Compétences */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Compétences</h5>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(profile.skills ?? []).map(s => (
                  <span key={s} className="group flex items-center gap-1 px-3 py-1 rounded-full bg-navy-50 text-navy-700 border border-navy-100 text-xs font-medium">
                    {s}
                    {isOwner && (
                      <button onClick={() => removeSkill(s)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Ajouter une compétence"
                    className="input text-xs py-1.5 flex-1"
                  />
                  <button onClick={addSkill} className="btn-gold btn-sm px-2.5">
                    <Plus size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Langues */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Langues</h5>
              {(profile.languages ?? []).map(({ name, level }) => (
                <div key={name} className="flex justify-between items-center text-sm py-1.5">
                  <span className="text-gray-500">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-700">{level}</span>
                    {isOwner && (
                      <button onClick={() => removeLang(name)} className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isOwner && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={newLang.name}
                    onChange={e => setNewLang(l => ({ ...l, name: e.target.value }))}
                    placeholder="Langue"
                    className="input text-xs py-1.5 flex-1"
                  />
                  <select
                    value={newLang.level}
                    onChange={e => setNewLang(l => ({ ...l, level: e.target.value }))}
                    className="input text-xs py-1.5 w-28"
                  >
                    {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={addLanguage} className="btn-gold btn-sm px-2.5">
                    <Plus size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Vérifications */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Vérifications</h5>
              {['Email vérifié', 'Carte du barreau', 'Identité nationale', 'Diplôme validé'].map(item => (
                <div key={item} className="flex items-center gap-2 py-1.5 text-sm text-gray-500">
                  <Check size={13} className="text-green-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 border-b-2 border-gray-100 mb-6">
              {[
                { key: 'about',    label: 'À propos'  },
                { key: 'projects', label: 'Dossiers'  },
                { key: 'reviews',  label: 'Avis'      },
                { key: 'pricing',  label: 'Tarifs'    },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-all ${activeTab === key ? 'text-navy-900 border-gold-500 font-semibold' : 'text-gray-400 border-transparent hover:text-navy-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── À propos ── */}
            {activeTab === 'about' && (
              <div className="card mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-[15px] font-semibold text-navy-800">Présentation</h3>
                  {isOwner && <span className="text-[11px] text-gold-600 font-medium flex items-center gap-1"><Pencil size={10}/> Survolez pour modifier</span>}
                </div>
                <EditableField
                  value={profile.bio}
                  textarea
                  onSave={v => updateField('bio', v)}
                />

                {/* Infos contact si propriétaire */}
                {isOwner && (
                  <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <EditableField label="Téléphone" value={profile.phone} onSave={v => updateField('phone', v)} type="tel" />
                    </div>
                    <div>
                      <EditableField label="Site web" value={profile.website} onSave={v => updateField('website', v)} type="url" />
                    </div>
                    <div>
                      <EditableField label="LinkedIn" value={profile.linkedin} onSave={v => updateField('linkedin', v)} />
                    </div>
                    <div>
                      <EditableField label="Cabinet / Structure" value={profile.firm} onSave={v => updateField('firm', v)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Dossiers ── */}
            {activeTab === 'projects' && (
              <div className="card mb-4">
                <h3 className="font-display text-[15px] font-semibold text-navy-800 mb-4">Dossiers récents</h3>
                {(profile.projects ?? []).length === 0
                  ? <p className="text-sm text-gray-400 italic">Aucun dossier pour le moment.</p>
                  : (
                    <div className="flex flex-col gap-2.5">
                      {profile.projects.map(p => (
                        <div key={p.title} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{p.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.client} · {p.date}</p>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* ── Avis ── */}
            {activeTab === 'reviews' && (
              <div className="card">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-display text-[15px] font-semibold text-navy-800">Avis clients</h3>
                  <div className="flex items-center gap-2">
                    <Stars rating={profile.rating ?? 5} />
                    <span className="font-display text-xl font-bold text-navy-900">{profile.rating ?? '—'}</span>
                    <span className="text-xs text-gray-400">({profile.reviews ?? 0})</span>
                  </div>
                </div>
                {(profile.reviews_list ?? []).length === 0
                  ? <p className="text-sm text-gray-400 italic">Aucun avis pour le moment.</p>
                  : (
                    <div className="flex flex-col gap-3">
                      {profile.reviews_list.map(r => (
                        <div key={r.author} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
                                {r.author.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-navy-800">{r.author}</p>
                                <p className="text-[11px] text-gray-400">{r.company} · {r.date}</p>
                              </div>
                            </div>
                            <Stars rating={r.rating} />
                          </div>
                          <p className="text-[13px] text-gray-500 leading-relaxed">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* ── Tarifs ── */}
            {activeTab === 'pricing' && (
              <div className="card">
                <h3 className="font-display text-[15px] font-semibold text-navy-800 mb-4">Mes tarifs</h3>
                {isOwner ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <EditableField label="Taux horaire (XOF)" value={profile.hourlyRate} type="number" onSave={v => updateField('hourlyRate', v)} />
                    </div>
                    <div>
                      <EditableField label="Forfait consultation" value={profile.consultFee} type="number" onSave={v => updateField('consultFee', v)} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {profile.hourlyRate
                      ? <>Taux horaire : <strong className="text-navy-800">{Number(profile.hourlyRate).toLocaleString()} XOF</strong></>
                      : 'Tarifs disponibles sur demande.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
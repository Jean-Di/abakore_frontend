'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DividerOr } from '@/components/ui'
import clsx from 'clsx'
import {
  Scale, Calculator, Search, Building2, Briefcase, GraduationCap,
  Info, FolderOpen, Check, Sparkles, ChevronRight, ArrowLeft,
  AlertCircle, Loader2, X, FileText, Eye, EyeOff,
} from 'lucide-react'

// ─── Firebase imports ───────────────────────────────────────────────────────
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'

// const auth    = getAuth(app)
// const db      = getFirestore(app)
// const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

// ─── Constantes ─────────────────────────────────────────────────────────────
const STEPS = [
  'Informations personnelles',
  'Choisir votre statut',
  'Soumettre vos justificatifs',
  'Validation par Abakoré (24–72h)',
]

const ROLES = [
  { value: 'lawyer',     name: 'Avocat',           desc: 'Droit des affaires OHADA',   requiresDocs: true  },
  { value: 'accountant', name: 'Expert-Comptable',  desc: 'Audit, fiscalité, conseil',  requiresDocs: true  },
  { value: 'consultant', name: 'Consultant',         desc: 'Stratégie & conformité',     requiresDocs: true  },
  { value: 'company',    name: 'Entreprise',         desc: 'Accès aux expertises',       requiresDocs: false },
  { value: 'hr',         name: 'RH / Manager',       desc: 'Ressources humaines',        requiresDocs: false },
  { value: 'student',    name: 'Étudiant',           desc: 'Formation & apprentissage',  requiresDocs: false },
]

const ROLE_ICONS = {
  lawyer: Scale, accountant: Calculator, consultant: Search,
  company: Building2, hr: Briefcase, student: GraduationCap,
}

const COUNTRIES = [
  "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso',
  'Guinée', 'Niger', 'Togo', 'Bénin', 'Congo', 'Gabon', 'RDC',
]

const DOCS_LABELS = [
  'Carte professionnelle du barreau',
  'Diplôme ou attestation professionnelle',
  "Pièce d'identité nationale",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
    'auth/invalid-email':        'Adresse email invalide.',
    'auth/weak-password':        'Mot de passe trop faible (8 caractères min.).',
    'auth/popup-closed-by-user': 'Connexion Google annulée.',
    'auth/too-many-requests':    'Trop de tentatives, réessayez plus tard.',
  }
  return map[code] ?? 'Une erreur est survenue. Réessayez.'
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle size={11} /> {msg}
    </p>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)

  // Navigation
  const [step, setStep] = useState(1)

  // Étape 1 — informations
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', country: COUNTRIES[0],
  })
  const [showPwd, setShowPwd]     = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [fromGoogle, setFromGoogle]   = useState(false)
  const [googleUser, setGoogleUser]   = useState(null) // user Firebase après Google

  // Étape 2 — rôle
  const [selectedRole, setSelectedRole] = useState('lawyer')

  // Étape 3 — documents
  const [files, setFiles]         = useState([])   // File[]
  const [dragOver, setDragOver]   = useState(false)

  // Global
  const [loading, setLoading]     = useState(false)
  const [globalError, setGlobalError] = useState('')

  // ── Validation étape 1 ──────────────────────────────────────────────────
  function validateStep1() {
    const errs = {}
    if (!form.firstName.trim())  errs.firstName = 'Prénom requis'
    if (!form.lastName.trim())   errs.lastName  = 'Nom requis'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Email invalide'
    if (!fromGoogle && form.password.length < 8) errs.password = '8 caractères minimum'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Google sign-up ───────────────────────────────────────────────────────
  async function handleGoogle() {
    setGlobalError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const u = result.user
      setGoogleUser(u)
      setFromGoogle(true)
      // Pré-remplir les champs avec les infos Google
      const [first, ...rest] = (u.displayName ?? '').split(' ')
      setForm(f => ({
        ...f,
        firstName: first ?? '',
        lastName:  rest.join(' ') ?? '',
        email:     u.email ?? '',
        password:  '••••••••', // placeholder visuel
      }))
      setStep(2)
    } catch (err) {
      setGlobalError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 1 → 2 ─────────────────────────────────────────────────────────
  function goToStep2() {
    if (!validateStep1()) return
    setStep(2)
  }

  // ── Gestion fichiers ─────────────────────────────────────────────────────
  function addFiles(fileList) {
    const allowed = Array.from(fileList).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type) && f.size <= 10 * 1024 * 1024
    )
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...allowed.filter(f => !names.has(f.name))]
    })
  }

  function removeFile(name) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  // ── Soumission finale ────────────────────────────────────────────────────
  async function handleSubmit() {
    setGlobalError('')
    setLoading(true)

    const roleObj = ROLES.find(r => r.value === selectedRole)
    if (roleObj.requiresDocs && files.length === 0) {
      setGlobalError('Veuillez déposer au moins un justificatif pour ce statut.')
      setLoading(false)
      return
    }

    try {
      let uid, userEmail, displayName

      if (fromGoogle && googleUser) {
        // Utilisateur déjà authentifié via Google
        uid         = googleUser.uid
        userEmail   = googleUser.email
        displayName = googleUser.displayName
      } else {
        // Créer le compte email/password
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
        uid = cred.user.uid
        userEmail   = form.email
        displayName = `${form.firstName} ${form.lastName}`.trim()
        await updateProfile(cred.user, { displayName })
      }

      // Upload des documents sur Firebase Storage
      const docURLs = await Promise.all(
        files.map(async file => {
          const storageRef = ref(storage, `justificatifs/${uid}/${Date.now()}_${file.name}`)
          await uploadBytes(storageRef, file)
          return getDownloadURL(storageRef)
        })
      )

      // Sauvegarder le profil dans Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        firstName:    fromGoogle ? (googleUser.displayName?.split(' ')[0] ?? '') : form.firstName,
        lastName:     fromGoogle ? (googleUser.displayName?.split(' ').slice(1).join(' ') ?? '') : form.lastName,
        email:        userEmail,
        country:      form.country,
        role:         selectedRole,
        authProvider: fromGoogle ? 'google' : 'email',
        status:       roleObj.requiresDocs ? 'pending' : 'active',
        documents:    docURLs,
        createdAt:    serverTimestamp(),
      })

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setGlobalError(friendlyError(err.code ?? ''))
    } finally {
      setLoading(false)
    }
  }

  // ─── Rendu ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Left panel ── */}
      <div className="relative hidden md:flex flex-col justify-between bg-navy-900 p-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 20% 40%, rgba(37,74,122,0.6) 0%, transparent 65%)' }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 shadow-gold">A</div>
            <span className="font-display text-xl font-bold text-gold-500">Abakoré</span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-white leading-snug max-w-xs">
            Rejoignez la communauté <span className="text-gold-400">OHADA</span> de référence
          </h2>
          <div className="mt-8">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gold-500/50 mb-4">Processus d'inscription</p>
            <div className="flex flex-col gap-3">
              {STEPS.map((label, i) => {
                const done   = i + 1 < step
                const active = i + 1 === step
                return (
                  <div key={label} className={clsx('flex gap-3 items-center', !active && !done && 'opacity-40')}>
                    <div className={clsx(
                      'w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold',
                      done   && 'bg-green-500 text-white',
                      active && 'bg-gold-500 text-navy-900',
                      !done && !active && 'bg-white/[0.06] border border-white/12 text-white/40',
                    )}>
                      {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                    </div>
                    <span className={clsx('text-[13px]', (active || done) ? 'text-white/80' : 'text-white/40')}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <p className="relative z-10 text-[11px] text-white/20">© 2025 Abakoré · Droit OHADA / UEMOA</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Barre de progression */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3].map(n => (
              <div key={n} className={clsx('h-1 flex-1 rounded-full transition-all duration-300',
                n === step ? 'bg-gold-500' : n < step ? 'bg-gold-400' : 'bg-gray-100'
              )} />
            ))}
          </div>

          {/* ── Erreur globale ── */}
          {globalError && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <AlertCircle size={14} className="flex-shrink-0" /> {globalError}
            </div>
          )}

          {/* ══ ÉTAPE 1 ══════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Créez votre compte</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 1 / 3 — Vos informations</p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 disabled:opacity-50"
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.8 39.7 16.4 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C40.9 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
                    </svg>
                  )}
                S'inscrire avec Google
              </button>

              <DividerOr />

              {/* Formulaire */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="label">Prénom</label>
                  <input
                    className="input"
                    placeholder="Jean"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                  <FieldError msg={fieldErrors.firstName} />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input
                    className="input"
                    placeholder="Dupont"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  />
                  <FieldError msg={fieldErrors.lastName} />
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Email professionnel</label>
                <input
                  type="email"
                  className="input"
                  placeholder="jean@cabinet.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <FieldError msg={fieldErrors.email} />
              </div>

              <div className="mb-4">
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Force du mot de passe */}
                {form.password && !fromGoogle && (
                  <div className="flex gap-1 mt-1.5">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={clsx('h-1 flex-1 rounded-full transition-all',
                        form.password.length >= n * 3
                          ? n <= 1 ? 'bg-red-400'
                          : n <= 2 ? 'bg-orange-400'
                          : n <= 3 ? 'bg-yellow-400'
                          : 'bg-green-500'
                          : 'bg-gray-100'
                      )} />
                    ))}
                  </div>
                )}
                <FieldError msg={fieldErrors.password} />
              </div>

              <div className="mb-6">
                <label className="label">Pays d'exercice</label>
                <select
                  className="input"
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                >
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <button
                className="btn-gold w-full justify-center py-3 rounded-xl inline-flex items-center gap-2"
                onClick={goToStep2}
              >
                Continuer <ChevronRight size={15} />
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Déjà un compte ?{' '}
                <Link href="/auth/login" className="font-semibold text-gold-600">Connexion</Link>
              </p>
            </div>
          )}

          {/* ══ ÉTAPE 2 ══════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Votre statut professionnel</h1>
              <p className="text-sm text-gray-400 mb-6">
                Étape 2 / 3 — {fromGoogle && <span className="text-gold-600 font-medium">Connecté via Google · </span>}
                Modifiable ultérieurement
              </p>

              {/* Badge Google si connecté */}
              {fromGoogle && (
                <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-600">
                    {googleUser?.displayName?.[0]?.toUpperCase() ?? 'G'}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-navy-800">{googleUser?.displayName}</p>
                    <p className="text-[11px] text-gray-400">{googleUser?.email}</p>
                  </div>
                  <Check size={14} className="ml-auto text-green-500" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {ROLES.map(role => {
                  const Icon = ROLE_ICONS[role.value] || Scale
                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={clsx(
                        'border-[1.5px] rounded-xl p-3.5 text-left transition-all',
                        selectedRole === role.value
                          ? 'border-gold-500 bg-gold-50 shadow-sm'
                          : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50',
                      )}
                      style={selectedRole === role.value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.14)' } : undefined}
                    >
                      <div className="w-8 h-8 mb-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                        <Icon size={16} />
                      </div>
                      <div className="text-[13px] font-semibold text-navy-800">{role.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{role.desc}</div>
                      {role.requiresDocs && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                          Vérification requise
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-xs text-gold-700 mb-5 flex gap-2 items-start">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-gold-500" />
                Les statuts Avocat, Expert-Comptable et Consultant requièrent une vérification par document. Votre profil sera visible après validation (24–72h ouvrées).
              </div>

              <div className="flex gap-2.5">
                <button className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button className="btn-gold flex-1 justify-center py-3 rounded-xl inline-flex items-center gap-2" onClick={() => setStep(3)}>
                  Continuer <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ══ ÉTAPE 3 ══════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Justificatifs</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 3 / 3 — Déposez vos documents de certification</p>

              {/* Zone de dépôt */}
              {ROLES.find(r => r.value === selectedRole)?.requiresDocs ? (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                    className={clsx(
                      'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all group',
                      dragOver ? 'border-gold-400 bg-gold-50' : 'border-gray-200 hover:border-gold-400 hover:bg-gold-50/50'
                    )}
                  >
                    <div className={clsx('flex justify-center mb-3 transition-colors', dragOver ? 'text-gold-400' : 'text-gray-300 group-hover:text-gold-400')}>
                      <FolderOpen size={36} />
                    </div>
                    <p className="text-sm font-semibold text-navy-800 mb-1">Glissez vos documents ici</p>
                    <p className="text-xs text-gray-400">ou <span className="text-gold-600 font-semibold">cliquez pour sélectionner</span></p>
                    <p className="text-[11px] text-gray-300 mt-2">PDF, JPG, PNG · Max 10 Mo par fichier</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => addFiles(e.target.files)}
                  />

                  {/* Liste des fichiers sélectionnés */}
                  {files.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {files.map(file => (
                        <div key={file.name} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                          <FileText size={14} className="text-gold-500 flex-shrink-0" />
                          <span className="text-[13px] text-navy-800 truncate flex-1">{file.name}</span>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">
                            {(file.size / 1024 / 1024).toFixed(1)} Mo
                          </span>
                          <button onClick={() => removeFile(file.name)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 mb-5">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Documents acceptés :</p>
                    <div className="flex flex-col gap-1.5">
                      {DOCS_LABELS.map(d => (
                        <div key={d} className="flex items-center gap-2 text-[13px] text-gray-500">
                          <Check size={13} className="text-gold-500 flex-shrink-0" /> {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Statut sans vérification */
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                  <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Aucun justificatif requis</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Le statut <strong>{ROLES.find(r => r.value === selectedRole)?.name}</strong> ne nécessite pas de vérification. Votre compte sera activé immédiatement.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  <ArrowLeft size={14} /> Retour
                </button>
                <button
                  className="btn-gold flex-1 justify-center py-3 rounded-xl inline-flex items-center gap-2 disabled:opacity-60"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Création…</>
                    : <><Sparkles size={15} /> Créer mon compte</>
                  }
                </button>
              </div>

              <p className="text-[11px] text-gray-300 text-center mt-4 leading-relaxed">
                En créant un compte, vous acceptez les{' '}
                <Link href="/cgu" className="text-gold-600">Conditions d'utilisation</Link> et la{' '}
                <Link href="/privacy" className="text-gold-600">Politique de confidentialité</Link>.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
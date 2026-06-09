'use client'
import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { DividerOr } from '@/components/ui'
import clsx from 'clsx'
import {
  Scale, Calculator, Search, Building2, Briefcase, GraduationCap,
  Info, FolderOpen, Check, Sparkles, ChevronRight, ArrowLeft,
  AlertCircle, Loader2, X, FileText, Eye, EyeOff, ShieldCheck,
} from 'lucide-react'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'
import { PRICING_PLANS } from '@/lib/data'

const googleProvider = new GoogleAuthProvider()

// ─── Constantes ─────────────────────────────────────────────────────────────

// Types de compte principaux
const ACCOUNT_TYPES = [
  {
    value: 'company',
    name: 'Mon entreprise',
    desc: 'Gérez la conformité juridique de votre entreprise',
    icon: Building2,
    badge: null,
  },
  {
    value: 'expert',
    name: 'Expert juridique',
    desc: "Rejoignez la marketplace en tant qu'avocat, comptable ou consultant",
    icon: Scale,
    badge: 'Vérification requise',
  },
]

// Rôles expert pour la marketplace
const EXPERT_ROLES = [
  { value: 'lawyer',     name: 'Avocat',           desc: 'Droit des affaires OHADA',   icon: Scale },
  { value: 'accountant', name: 'Expert-Comptable',  desc: 'Audit, fiscalité, conseil',  icon: Calculator },
  { value: 'consultant', name: 'Consultant',         desc: 'Stratégie & conformité',     icon: Search },
  { value: 'hr',         name: 'Consultant RH',      desc: 'Ressources humaines',        icon: Briefcase },
]

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

// ─── Page principale ──────────────────────────────────────────────────────────
function RegisterPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef(null)

  // Pré-sélection du plan depuis l'URL (?plan=starter)
  const defaultPlan  = searchParams.get('plan') ?? 'starter'

  // ── State navigation ──────────────────────────────────────────────────────
  // Étapes :
  //   1 → Choix type de compte (Entreprise / Expert)
  //   2 → Infos personnelles
  //   3A → Choix plan (si entreprise)
  //   3B → Choix spécialité + justificatifs (si expert)
  //   4 → Soumission
  const [step,        setStep]        = useState(1)
  const [accountType, setAccountType] = useState('company') // 'company' | 'expert'

  // Étape 2 — infos
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    country: COUNTRIES[0], company: '',
  })
  const [showPwd,      setShowPwd]      = useState(false)
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [fromGoogle,   setFromGoogle]   = useState(false)
  const [googleUser,   setGoogleUser]   = useState(null)

  // Étape 3A — plan entreprise
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)

  // Étape 3B — expert
  const [expertRole, setExpertRole] = useState('lawyer')
  const [files,      setFiles]      = useState([])
  const [dragOver,   setDragOver]   = useState(false)

  // Global
  const [loading,     setLoading]     = useState(false)
  const [globalError, setGlobalError] = useState('')

  const totalSteps = 3 // affiché dans la barre de progression (étapes 2→4 = 3 étapes)
  const currentBar = step - 1 // barre : 0 en step1, 1 en step2, 2 en step3, 3 en step4

  // ── Validation étape 2 ────────────────────────────────────────────────────
  function validateStep2() {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
    if (!form.lastName.trim())  errs.lastName  = 'Nom requis'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Email invalide'
    if (!fromGoogle && form.password.length < 8) errs.password = '8 caractères minimum'
    if (accountType === 'company' && !form.company.trim()) errs.company = 'Nom de l\'entreprise requis'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Google sign-up ────────────────────────────────────────────────────────
  async function handleGoogle() {
    setGlobalError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const u = result.user
      setGoogleUser(u)
      setFromGoogle(true)
      const [first, ...rest] = (u.displayName ?? '').split(' ')
      setForm(f => ({ ...f, firstName: first ?? '', lastName: rest.join(' ') ?? '', email: u.email ?? '', password: '••••••••' }))
      setStep(2)
    } catch (err) {
      setGlobalError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  // ── Gestion fichiers ──────────────────────────────────────────────────────
  function addFiles(fileList) {
    const allowed = Array.from(fileList).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type) && f.size <= 10 * 1024 * 1024
    )
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...allowed.filter(f => !names.has(f.name))]
    })
  }

  // ── Soumission finale ─────────────────────────────────────────────────────
  async function handleSubmit() {
    setGlobalError('')
    setLoading(true)

    if (accountType === 'expert' && files.length === 0) {
      setGlobalError('Veuillez déposer au moins un justificatif.')
      setLoading(false)
      return
    }

    try {
      let uid, userEmail, displayName

      if (fromGoogle && googleUser) {
        uid         = googleUser.uid
        userEmail   = googleUser.email
        displayName = googleUser.displayName
      } else {
        const cred  = await createUserWithEmailAndPassword(auth, form.email, form.password)
        uid         = cred.user.uid
        userEmail   = form.email
        displayName = `${form.firstName} ${form.lastName}`.trim()
        await updateProfile(cred.user, { displayName })
      }

      // Upload justificatifs (experts seulement)
      const docURLs = accountType === 'expert'
        ? await Promise.all(files.map(async file => {
            const storageRef = ref(storage, `justificatifs/${uid}/${Date.now()}_${file.name}`)
            await uploadBytes(storageRef, file)
            return getDownloadURL(storageRef)
          }))
        : []

      await setDoc(doc(db, 'users', uid), {
        uid,
        firstName:    fromGoogle ? (googleUser.displayName?.split(' ')[0] ?? '') : form.firstName,
        lastName:     fromGoogle ? (googleUser.displayName?.split(' ').slice(1).join(' ') ?? '') : form.lastName,
        email:        userEmail,
        country:      form.country,
        accountType,
        // Champs spécifiques entreprise
        ...(accountType === 'company' && {
          company:     form.company,
          plan:        selectedPlan,
          companyRole: 'admin',
          status:      'active',
        }),
        // Champs spécifiques expert
        ...(accountType === 'expert' && {
          role:      expertRole,
          documents: docURLs,
          status:    'pending',
        }),
        authProvider: fromGoogle ? 'google' : 'email',
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

  // ── Panel gauche ──────────────────────────────────────────────────────────
  const LEFT_STEPS = accountType === 'company'
    ? ['Type de compte', 'Vos informations', 'Choisir votre plan']
    : ['Type de compte', 'Vos informations', 'Spécialité & justificatifs', 'Validation Abakoré (24–72h)']

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Panel gauche ── */}
      <div className="relative hidden md:flex flex-col justify-between bg-navy-900 p-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 20% 40%, rgba(37,74,122,0.6) 0%, transparent 65%)' }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 shadow-gold">A</div>
            <span className="font-display text-xl font-bold text-gold-500">Abakoré</span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-white leading-snug max-w-xs">
            Rejoignez <span className="text-gold-400">Abakoré Legal Intelligence</span>
          </h2>
          <div className="mt-8">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-gold-300 mb-4">Étapes d'inscription</p>
            <div className="flex flex-col gap-3">
              {LEFT_STEPS.map((label, i) => {
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
        <p className="relative z-10 text-xs text-white/55">© 2026 Abakoré Business Partner · Abidjan, Côte d'Ivoire</p>
      </div>

      {/* ── Panel droit ── */}
      <div className="flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Barre de progression */}
          {step > 1 && (
            <div className="flex gap-1.5 mb-8">
              {[1, 2, 3].map(n => (
                <div key={n} className={clsx('h-1 flex-1 rounded-full transition-all duration-300',
                  n === currentBar ? 'bg-gold-500' : n < currentBar ? 'bg-gold-400' : 'bg-gray-100'
                )} />
              ))}
            </div>
          )}

          {/* Erreur globale */}
          {globalError && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <AlertCircle size={14} className="flex-shrink-0" /> {globalError}
            </div>
          )}

          {/* ══ ÉTAPE 1 — Type de compte ══════════════════════════════════════ */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Créez votre compte</h1>
              <p className="text-sm text-gray-400 mb-8">Vous êtes…</p>

              <div className="flex flex-col gap-3 mb-8">
                {ACCOUNT_TYPES.map(({ value, name, desc, icon: Icon, badge }) => (
                  <button
                    key={value}
                    onClick={() => setAccountType(value)}
                    className={clsx(
                      'border-[1.5px] rounded-2xl p-5 text-left transition-all',
                      accountType === value
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/40',
                    )}
                    style={accountType === value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.14)' } : undefined}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-600 flex-shrink-0 mt-0.5">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[15px] font-semibold text-navy-800">{name}</p>
                          {badge && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md">{badge}</span>
                          )}
                        </div>
                        <p className="text-[13px] text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
                        accountType === value ? 'border-gold-500 bg-gold-500' : 'border-gray-300',
                      )}>
                        {accountType === value && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                className="btn-gold w-full justify-center py-3 rounded-xl inline-flex items-center gap-2"
                onClick={() => setStep(2)}
              >
                Continuer <ChevronRight size={15} />
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Déjà un compte ?{' '}
                <Link href="/auth/login" className="font-semibold text-gold-600">Connexion</Link>
              </p>
            </div>
          )}

          {/* ══ ÉTAPE 2 — Informations personnelles ══════════════════════════ */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Vos informations</h1>
              <p className="text-sm text-gray-400 mb-6">
                {accountType === 'company' ? 'Étape 1 / 2 — Informations' : 'Étape 1 / 2 — Informations'}
                {fromGoogle && <span className="text-gold-600 font-medium"> · Connecté via Google</span>}
              </p>

              {/* Google */}
              {!fromGoogle && (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (
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
                </>
              )}

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

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="label">Prénom</label>
                  <input className="input" placeholder="Jean" value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                  <FieldError msg={fieldErrors.firstName} />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input className="input" placeholder="Dupont" value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                  <FieldError msg={fieldErrors.lastName} />
                </div>
              </div>

              {accountType === 'company' && (
                <div className="mb-4">
                  <label className="label">Nom de l'entreprise</label>
                  <input className="input" placeholder="TechSen SARL" value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  <FieldError msg={fieldErrors.company} />
                </div>
              )}

              <div className="mb-4">
                <label className="label">Email professionnel</label>
                <input type="email" className="input" placeholder="jean@entreprise.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <FieldError msg={fieldErrors.email} />
              </div>

              {!fromGoogle && (
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
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1 mt-1.5">
                      {[1,2,3,4].map(n => (
                        <div key={n} className={clsx('h-1 flex-1 rounded-full transition-all',
                          form.password.length >= n * 3
                            ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-orange-400' : n <= 3 ? 'bg-yellow-400' : 'bg-green-500'
                            : 'bg-gray-100'
                        )} />
                      ))}
                    </div>
                  )}
                  <FieldError msg={fieldErrors.password} />
                </div>
              )}

              <div className="mb-6">
                <label className="label">Pays</label>
                <select className="input" value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex gap-2.5">
                <button className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button
                  className="btn-gold flex-1 justify-center py-3 rounded-xl inline-flex items-center gap-2"
                  onClick={() => { if (validateStep2()) setStep(3) }}
                >
                  Continuer <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ══ ÉTAPE 3A — Choix du plan (Entreprise) ═════════════════════════ */}
          {step === 3 && accountType === 'company' && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Choisir votre plan</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 2 / 2 — Abonnement</p>

              <div className="flex flex-col gap-3 mb-6">
                {PRICING_PLANS.map(plan => (
                  <button
                    key={plan.value}
                    onClick={() => setSelectedPlan(plan.value)}
                    className={clsx(
                      'border-[1.5px] rounded-2xl p-4 text-left transition-all',
                      selectedPlan === plan.value
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-gray-200 hover:border-gold-300',
                    )}
                    style={selectedPlan === plan.value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.14)' } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-navy-800">{plan.name}</p>
                          {plan.featured && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gold-100 text-gold-700 rounded-md">Populaire</span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-400 mt-0.5">{plan.users}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold text-navy-900">
                          {Number(plan.price).toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">XOF</span>
                        </p>
                        <p className="text-[11px] text-gray-400">/mois</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-xs text-gold-700 mb-6 flex gap-2 items-start">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-gold-500" />
                Paiement via Wave, Orange Money, MTN Mobile Money ou carte bancaire. Résiliable à tout moment.
              </div>

              <div className="flex gap-2.5">
                <button className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5" onClick={() => setStep(2)} disabled={loading}>
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

          {/* ══ ÉTAPE 3B — Spécialité + justificatifs (Expert) ════════════════ */}
          {step === 3 && accountType === 'expert' && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Votre spécialité</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 2 / 2 — Spécialité & justificatifs</p>

              {/* Choix spécialité */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {EXPERT_ROLES.map(({ value, name, desc, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setExpertRole(value)}
                    className={clsx(
                      'border-[1.5px] rounded-xl p-3.5 text-left transition-all',
                      expertRole === value
                        ? 'border-gold-500 bg-gold-50 shadow-sm'
                        : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50',
                    )}
                    style={expertRole === value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.14)' } : undefined}
                  >
                    <div className="w-8 h-8 mb-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                      <Icon size={16} />
                    </div>
                    <div className="text-[13px] font-semibold text-navy-800">{name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>

              {/* Zone de dépôt */}
              <p className="text-xs font-semibold text-gray-600 mb-2">Justificatifs professionnels</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                className={clsx(
                  'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group mb-3',
                  dragOver ? 'border-gold-400 bg-gold-50' : 'border-gray-200 hover:border-gold-400 hover:bg-gold-50/50'
                )}
              >
                <FolderOpen size={30} className={clsx('mx-auto mb-2 transition-colors', dragOver ? 'text-gold-400' : 'text-gray-300 group-hover:text-gold-400')} />
                <p className="text-sm font-semibold text-navy-800 mb-0.5">Glissez vos documents ici</p>
                <p className="text-xs text-gray-400">ou <span className="text-gold-600 font-semibold">cliquez pour sélectionner</span></p>
                <p className="text-[11px] text-gray-300 mt-1">PDF, JPG, PNG · Max 10 Mo</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                className="hidden" onChange={e => addFiles(e.target.files)} />

              {files.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {files.map(file => (
                    <div key={file.name} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <FileText size={14} className="text-gold-500 flex-shrink-0" />
                      <span className="text-[13px] text-navy-800 truncate flex-1">{file.name}</span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                      <button onClick={() => setFiles(p => p.filter(f => f.name !== file.name))} className="text-gray-300 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Documents acceptés :</p>
                {DOCS_LABELS.map(d => (
                  <div key={d} className="flex items-center gap-2 text-[13px] text-gray-500 mb-1.5">
                    <Check size={13} className="text-gold-500 flex-shrink-0" /> {d}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-5 flex gap-2 items-start">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                Votre profil sera visible après vérification par l'équipe Abakoré (24–72h ouvrées).
              </div>

              <div className="flex gap-2.5">
                <button className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5" onClick={() => setStep(2)} disabled={loading}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button
                  className="btn-gold flex-1 justify-center py-3 rounded-xl inline-flex items-center gap-2 disabled:opacity-60"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Envoi…</>
                    : <><ShieldCheck size={15} /> Soumettre mon profil</>
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

export default function RegisterPageWrapper() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  )
}

'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, Stars } from '@/components/ui'
import clsx from 'clsx'
import {
  ArrowLeft, ArrowRight, MessageSquare, FileText,
  DollarSign, HelpCircle, Users, Lock, Info, Clock,
  CheckCircle2, Briefcase, MapPin, AlertTriangle, Check,
  Loader2, X, Upload, Shield, AlertCircle,
} from 'lucide-react'

// ── Firebase ────────────────────────────────────────────────────────────────
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, addDoc, collection,
  serverTimestamp, updateDoc, increment,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'

// ── Constantes ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  { value: 'consultation',  label: 'Demande de consultation',      Icon: MessageSquare, desc: 'Discussion initiale sur votre problématique' },
  { value: 'dossier',       label: 'Proposition de dossier',       Icon: FileText,      desc: 'Confier un dossier complet à cet expert' },
  { value: 'devis',         label: 'Demande de devis',             Icon: DollarSign,    desc: 'Obtenir une estimation tarifaire' },
  { value: 'question',      label: 'Question ponctuelle OHADA',    Icon: HelpCircle,    desc: 'Question rapide sur un point juridique' },
  { value: 'collaboration', label: 'Collaboration professionnelle',Icon: Users,         desc: 'Proposition de partenariat entre experts' },
]

const URGENCY = [
  { value: 'low',    label: 'Pas urgent',  desc: 'Sous 2 semaines', colorClass: 'border-gray-200   text-gray-600'   },
  { value: 'medium', label: 'Modéré',      desc: 'Sous 1 semaine',  colorClass: 'border-gold-300   text-gold-700'   },
  { value: 'high',   label: 'Urgent',      desc: 'Sous 48h',        colorClass: 'border-orange-300 text-orange-700' },
  { value: 'asap',   label: 'Très urgent', desc: 'Immédiat',        colorClass: 'border-red-300    text-red-600'    },
]

const COUNTRIES = [
  "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali',
  'Burkina Faso', 'Plusieurs pays',
]

const MAX_FILE_SIZE   = 20 * 1024 * 1024   // 20 Mo par fichier
const MAX_TOTAL_SIZE  = 50 * 1024 * 1024   // 50 Mo total
const ACCEPTED_TYPES  = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png']
const ACCEPTED_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png'

// ── Helpers ──────────────────────────────────────────────────────────────────
function getDisplayName(u) {
  if (!u) return '—'
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Utilisateur'
}

function getInitials(u) {
  const name = getDisplayName(u)
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function generateMsgRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `#MSG-${year}-${rand}`
}

// ── Sous-composants ───────────────────────────────────────────────────────────
function AlertBanner({ message, type = 'error', onDismiss }) {
  if (!message) return null
  const styles = {
    error:   'text-red-600   bg-red-50   border-red-100',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    info:    'text-blue-600  bg-blue-50  border-blue-100',
  }
  const Icon = type === 'error' ? AlertCircle : type === 'warning' ? AlertTriangle : Info
  return (
    <div className={clsx('flex items-start gap-2 text-xs border rounded-xl p-3 mb-5', styles[type])}>
      <Icon size={14} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-50 hover:opacity-100">
          <X size={12} />
        </button>
      )}
    </div>
  )
}

function ExpertAvatar({ expert }) {
  const initials = getInitials(expert)
  return (
    <div className="relative flex-shrink-0">
      {expert?.photoURL ? (
        <img src={expert.photoURL} alt={getDisplayName(expert)}
          className="w-14 h-14 rounded-full object-cover border-2 border-gold-100" />
      ) : (
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
          style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
          {initials}
        </div>
      )}
      {expert?.verified && (
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
          <Check size={8} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ContactPage({ params }) {
  const router   = useRouter()
  const targetId = params.id

  // ── État auth & profils ──────────────────────────────────────────────────
  const [authUser,  setAuthUser]  = useState(undefined)   // undefined = chargement
  const [expert,    setExpert]    = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [loading,   setLoading]   = useState(true)

  // ── Formulaire ───────────────────────────────────────────────────────────
  const [step,    setStep]    = useState(1)
  const [subject, setSubject] = useState('consultation')
  const [urgency, setUrgency] = useState('medium')
  const [country, setCountry] = useState(COUNTRIES[0])
  const [title,   setTitle]   = useState('')
  const [message, setMessage] = useState('')
  const [budget,  setBudget]  = useState('')

  // ── Fichiers joints ──────────────────────────────────────────────────────
  const fileInputRef  = useRef(null)
  const [attachments, setAttachments] = useState([])   // { name, size, url }
  const [fileErrors,  setFileErrors]  = useState([])   // { name, reason }[]
  const [uploading,   setUploading]   = useState(false)

  // ── Envoi & erreurs ──────────────────────────────────────────────────────
  const [submitting,   setSubmitting]   = useState(false)
  const [sent,         setSent]         = useState(false)
  const [msgRef,       setMsgRef]       = useState('')
  const [globalError,  setGlobalError]  = useState('')
  const [fieldErrors,  setFieldErrors]  = useState({})

  // ── Auth + chargement profils ────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setAuthUser(user ?? null)
      if (!user) { setLoading(false); return }

      try {
        const [expertSnap, mySnap] = await Promise.all([
          getDoc(doc(db, 'users', targetId)),
          getDoc(doc(db, 'users', user.uid)),
        ])
        if (!expertSnap.exists()) {
          setGlobalError('Expert introuvable.')
          setLoading(false)
          return
        }
        setExpert({ id: targetId, ...expertSnap.data() })
        setMyProfile(mySnap.exists()
          ? { uid: user.uid, ...mySnap.data() }
          : { uid: user.uid, email: user.email })
      } catch {
        setGlobalError('Erreur lors du chargement. Réessayez.')
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [targetId])

  // ── Upload pièces jointes ────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const files     = Array.from(e.target.files ?? [])
    if (!files.length) return

    const newErrors = []
    const valid     = []

    for (const f of files) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        newErrors.push({ name: f.name, reason: 'Format non supporté (PDF, DOCX, JPG, PNG)' })
        continue
      }
      if (f.size > MAX_FILE_SIZE) {
        newErrors.push({ name: f.name, reason: `Fichier trop lourd (max 20 Mo, reçu ${(f.size / 1024 / 1024).toFixed(1)} Mo)` })
        continue
      }
      valid.push(f)
    }

    setFileErrors(newErrors)
    if (!valid.length) return

    const totalExisting = attachments.reduce((s, a) => s + (a.rawSize ?? 0), 0)
    const totalNew      = valid.reduce((s, f) => s + f.size, 0)
    if (totalExisting + totalNew > MAX_TOTAL_SIZE) {
      setGlobalError(`Total des pièces jointes dépasse 50 Mo.`)
      return
    }

    setUploading(true)
    try {
      const uploaded = await Promise.all(valid.map(async file => {
        const storageRef = ref(storage, `messages/${authUser.uid}/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} Mo`, rawSize: file.size, url }
      }))
      setAttachments(prev => [...prev, ...uploaded])
    } catch {
      setGlobalError("Erreur lors de l'envoi des pièces jointes. Réessayez.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Validation étape 1 ────────────────────────────────────────────────────
  function validateStep1() {
    const errs = {}
    if (!title.trim())                errs.title   = 'Veuillez saisir un objet'
    if (message.trim().length < 20)   errs.message = 'Message trop court (20 caractères minimum)'
    if (message.trim().length > 2000) errs.message = 'Message trop long (2000 caractères maximum)'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function goToStep2() {
    if (!validateStep1()) return
    setGlobalError('')
    setStep(2)
  }

  // ── Soumission Firestore ──────────────────────────────────────────────────
  async function handleSend() {
    if (!authUser || !expert) return
    if (!navigator.onLine) {
      setGlobalError('Vous semblez hors ligne. Vérifiez votre connexion.')
      return
    }

    setSubmitting(true)
    setGlobalError('')

    const ref_ = generateMsgRef()

    try {
      // 1. Récupère ou crée la conversation
      const { getOrCreateConversation } = await import('@/lib/conversations')
      const convId = await getOrCreateConversation(authUser.uid, expert.id)

      // 2. Ajoute le message dans la conversation
      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        ref:         ref_,
        senderId:    authUser.uid,
        senderName:  getDisplayName(myProfile),
        recipientId: expert.id,
        type:        'contact',
        subject:     SUBJECTS.find(s => s.value === subject)?.label,
        subjectValue: subject,
        urgency:     URGENCY.find(u => u.value === urgency)?.label,
        urgencyValue: urgency,
        title:       title.trim(),
        text:        message.trim(),
        budget:      budget.trim() || null,
        country,
        attachments,
        createdAt:   serverTimestamp(),
        read:        false,
      })

      // 3. Met à jour les métadonnées de la conversation
      await updateDoc(doc(db, 'conversations', convId), {
        lastMessage:    title.trim() || message.trim().slice(0, 60),
        lastMessageAt:  serverTimestamp(),
        lastSenderId:   authUser.uid,
        [`unread.${expert.id}`]: increment(1),
      })

      // 4. Notification à l'expert
      await addDoc(collection(db, 'notifications'), {
        userId:   expert.id,
        type:     'new_message',
        text:     `Nouveau message de ${getDisplayName(myProfile)} : "${title.trim()}"`,
        msgRef:   ref_,
        convId,
        unread:   true,
        dot:      'gold',
        time:     "À l'instant",
        createdAt: serverTimestamp(),
      })

      setMsgRef(ref_)
      setSent(true)
    } catch (err) {
      console.error('[ContactPage] send error:', err)
      if (err?.code === 'permission-denied') {
        setGlobalError("Permissions insuffisantes. Vérifiez votre connexion et réessayez.")
      } else if (err?.code === 'unavailable') {
        setGlobalError("Service temporairement indisponible. Réessayez dans un instant.")
      } else {
        setGlobalError("Erreur lors de l'envoi. Réessayez.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── États de chargement / auth ────────────────────────────────────────────
  if (authUser === undefined || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gold-500" />
        </div>
      </>
    )
  }

  if (authUser === null) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4 px-6">
          <Lock size={36} className="text-gray-300" />
          <p className="font-semibold text-navy-700">Connectez-vous pour contacter un expert</p>
          <Link href="/auth/login" className="btn-gold btn-sm">Se connecter</Link>
        </div>
      </>
    )
  }

  if (!expert && !loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4 px-6">
          <AlertTriangle size={36} className="text-amber-400" />
          <p className="font-semibold text-navy-700">{globalError || 'Expert introuvable.'}</p>
          <button onClick={() => router.back()} className="btn-outline btn-sm">Retour</button>
        </div>
      </>
    )
  }

  const expertName = getDisplayName(expert)

  // ── Écran de confirmation ─────────────────────────────────────────────────
  if (sent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">Message envoyé !</h1>
            <p className="text-gray-400 mb-1">Votre message a bien été transmis à</p>
            <p className="font-semibold text-navy-800 mb-1">{expertName}</p>
            <p className="text-xs text-gray-300 mb-6">Référence : {msgRef}</p>

            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 mb-8 text-left">
              <p className="text-sm font-semibold text-gold-700 mb-1 flex items-center gap-1.5">
                <Clock size={14} /> Temps de réponse moyen
              </p>
              <p className="text-2xl font-display font-bold text-navy-900">
                {expert?.responseTime ?? '24–48h'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Vous serez notifié dans votre tableau de bord dès qu'il répond
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link href="/messages" className="btn-gold w-full justify-center py-3 rounded-xl inline-flex items-center gap-1.5">
                <MessageSquare size={15} /> Aller à la messagerie
              </Link>
              <Link href={`/profile/${expert.id}`} className="btn-outline w-full justify-center py-3 rounded-xl inline-flex items-center gap-1.5">
                <ArrowLeft size={14} /> Retour au profil
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Formulaire principal ──────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/search" className="hover:text-gold-600 transition-colors">Recherche</Link>
            <span>›</span>
            <Link href={`/profile/${expert.id}`} className="hover:text-gold-600 transition-colors">{expertName}</Link>
            <span>›</span>
            <span className="text-navy-700 font-medium">Contacter</span>
          </div>

          {/* Erreur non-bloquante */}
          {globalError && (
            <AlertBanner message={globalError} type="error" onDismiss={() => setGlobalError('')} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* ── FORMULAIRE ── */}
            <div>
              {/* Indicateur d'étapes */}
              <div className="flex items-center gap-3 mb-7">
                {["Rédiger votre message", "Confirmer l'envoi"].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    {i > 0 && <div className="w-8 h-px bg-gray-200" />}
                    <div className={clsx(
                      'flex items-center gap-2 text-sm font-medium',
                      step === i + 1 ? 'text-navy-900' : step > i + 1 ? 'text-green-600' : 'text-gray-400'
                    )}>
                      <div className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        step === i + 1 ? 'bg-gold-500 text-navy-900'
                          : step > i + 1 ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      )}>
                        {step > i + 1 ? <Check size={12} strokeWidth={3} /> : i + 1}
                      </div>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ ÉTAPE 1 ══════════════════════════════════════════════════ */}
              {step === 1 && (
                <div className="animate-slide-up">

                  {/* Objet */}
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Objet de votre message</h2>
                    <div className="grid grid-cols-1 gap-2">
                      {SUBJECTS.map(({ value, label, Icon, desc }) => (
                        <button key={value} onClick={() => setSubject(value)}
                          className={clsx(
                            'flex items-start gap-3 p-3.5 rounded-xl border-[1.5px] text-left transition-all',
                            subject === value
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/40'
                          )}
                          style={subject === value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.12)' } : undefined}
                        >
                          <div className={clsx(
                            'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
                            subject === value ? 'border-gold-500' : 'border-gray-300'
                          )}>
                            {subject === value && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                          </div>
                          <Icon size={15} className="flex-shrink-0 mt-0.5 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Votre message</h2>

                    <div className="mb-4">
                      <label className="label">Titre / Objet précis *</label>
                      <input
                        className={clsx('input', fieldErrors.title && 'border-red-400 focus:ring-red-300')}
                        placeholder="Ex: Besoin d'un avocat pour contrat de distribution UEMOA"
                        value={title}
                        onChange={e => { setTitle(e.target.value); setFieldErrors(fe => ({ ...fe, title: '' })) }}
                      />
                      {fieldErrors.title && (
                        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                          <AlertCircle size={11} /> {fieldErrors.title}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="label">Décrivez votre besoin *</label>
                      <textarea
                        className={clsx('input resize-none', fieldErrors.message && 'border-red-400 focus:ring-red-300')}
                        rows={6}
                        placeholder={`Bonjour ${expertName.split(' ')[0]},\n\nJe vous contacte au sujet de…\n\nContexte : …\nObjectif : …\nÉchéance souhaitée : …`}
                        value={message}
                        onChange={e => {
                          setMessage(e.target.value.slice(0, 2000))
                          setFieldErrors(fe => ({ ...fe, message: '' }))
                        }}
                      />
                      <div className="flex items-center justify-between mt-1">
                        {fieldErrors.message
                          ? <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} /> {fieldErrors.message}</p>
                          : <span />
                        }
                        <p className={clsx('text-xs', message.length > 1800 ? 'text-amber-500' : 'text-gray-300')}>
                          {message.length}/2000
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Budget estimé (optionnel)</label>
                        <input
                          className="input"
                          placeholder="Ex: 150 000 FCFA"
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Pays concerné</label>
                        <select className="input" value={country} onChange={e => setCountry(e.target.value)}>
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Urgence */}
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Niveau d'urgence</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {URGENCY.map(u => (
                        <button key={u.value} onClick={() => setUrgency(u.value)}
                          className={clsx(
                            'p-3 rounded-xl border-[1.5px] text-center transition-all',
                            urgency === u.value
                              ? `${u.colorClass} font-semibold`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          )}
                          style={urgency === u.value ? { background: 'rgba(201,168,76,0.05)', boxShadow: '0 0 0 3px rgba(201,168,76,0.10)' } : undefined}
                        >
                          <p className="text-sm font-semibold">{u.label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{u.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pièces jointes */}
                  <div className="card mb-6">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">
                      Pièces jointes <span className="text-xs font-normal text-gray-400">(optionnel)</span>
                    </h2>

                    <label className={clsx(
                      'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all group block',
                      uploading ? 'border-gold-300 bg-gold-50/30' : 'border-gray-200 hover:border-gold-400 hover:bg-gold-50/40'
                    )}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_ACCEPT}
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <div className="flex justify-center mb-2">
                        {uploading
                          ? <Loader2 size={24} className="text-gold-400 animate-spin" />
                          : <Upload size={24} className="text-gray-300 group-hover:text-gold-400 transition-colors" />}
                      </div>
                      <p className="text-sm font-semibold text-navy-800 mb-0.5">
                        {uploading ? 'Téléversement en cours…' : 'Glissez vos fichiers ou cliquez pour sélectionner'}
                      </p>
                      <p className="text-[11px] text-gray-300 mt-1">PDF, DOCX, JPG, PNG · Max 20 Mo par fichier · 50 Mo total</p>
                    </label>

                    {/* Erreurs de fichiers */}
                    {fileErrors.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {fileErrors.map(e => (
                          <div key={e.name} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                            <span><strong>{e.name}</strong> — {e.reason}</span>
                            <button onClick={() => setFileErrors(fe => fe.filter(x => x.name !== e.name))} className="ml-auto opacity-50 hover:opacity-100">
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Liste des fichiers téléversés */}
                    {attachments.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {attachments.map((f, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-gold-50 border border-gold-200 rounded-xl px-3 py-2">
                            <FileText size={13} className="text-gold-600 flex-shrink-0" />
                            <span className="text-[13px] text-navy-800 truncate flex-1">{f.name}</span>
                            <span className="text-[11px] text-gray-400 flex-shrink-0">{f.size}</span>
                            <button
                              onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                              disabled={uploading}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={goToStep2}
                    className="btn-gold w-full justify-center py-3.5 text-base rounded-xl inline-flex items-center gap-2"
                  >
                    Vérifier avant envoi <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ══ ÉTAPE 2 ══════════════════════════════════════════════════ */}
              {step === 2 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Récapitulatif</h2>

                    {[
                      ['Destinataire', expertName],
                      ['Objet', SUBJECTS.find(s => s.value === subject)?.label],
                      ['Titre', title],
                      ['Urgence', `${URGENCY.find(u => u.value === urgency)?.label} — ${URGENCY.find(u => u.value === urgency)?.desc}`],
                      ['Pays', country],
                      ['Budget', budget || 'Non précisé'],
                      ['Pièces jointes', attachments.length > 0 ? `${attachments.length} fichier(s)` : 'Aucune'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-navy-800 text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}

                    <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
                      {message || '(Aucun message saisi)'}
                    </div>
                  </div>

                  {/* Info messagerie sécurisée */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 flex gap-2.5 mb-5">
                    <Shield size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>
                      Votre message sera visible dans la messagerie sécurisée Abakoré.{' '}
                      <strong>{expertName.split(' ')[0]}</strong> répond généralement en{' '}
                      <strong>{expert?.responseTime ?? '24–48h'}</strong>.
                    </span>
                  </div>

                  {/* Avertissement */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex gap-2.5 mb-5">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
                    <span>
                      Une fois envoyé, votre message sera transmis à <strong>{expertName}</strong>.
                      Relisez votre message avant de confirmer.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5"
                      onClick={() => setStep(1)}
                      disabled={submitting}
                    >
                      <ArrowLeft size={14} /> Modifier
                    </button>
                    <button
                      className="btn-gold flex-1 justify-center py-3.5 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-60"
                      onClick={handleSend}
                      disabled={submitting}
                    >
                      {submitting
                        ? <><Loader2 size={15} className="animate-spin" /> Envoi en cours…</>
                        : <><Check size={15} /> Envoyer le message</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR EXPERT ── */}
            <aside className="flex flex-col gap-4">
              <div className="card sticky top-20" style={{ borderTop: '3px solid #C9A84C' }}>
                <div className="flex gap-3 items-center mb-4">
                  <ExpertAvatar expert={expert} />
                  <div>
                    <p className="font-display text-[15px] font-bold text-navy-900">{expertName}</p>
                    <p className="text-xs text-gray-400">{expert?.speciality ?? expert?.role}</p>
                    <div className="mt-1"><SubBadge plan={expert?.plan} /></div>
                  </div>
                </div>

                <Stars rating={expert?.rating ?? 5} reviews={expert?.reviews ?? 0} />

                <div className="mt-4 flex flex-col gap-0">
                  {[
                    { Icon: Clock,        label: 'Temps de réponse', val: expert?.responseTime ?? '24–48h' },
                    { Icon: CheckCircle2, label: 'Taux de succès',   val: expert?.successRate ? `${expert.successRate}%` : '—' },
                    { Icon: Briefcase,    label: 'Expérience',       val: expert?.experience ? `${expert.experience} ans` : '—' },
                    { Icon: MapPin,       label: 'Localisation',     val: expert?.country ?? expert?.location ?? '—' },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 flex items-center gap-1"><Icon size={11} /> {label}</span>
                      <span className="font-medium text-navy-800">{val}</span>
                    </div>
                  ))}
                </div>

                {expert?.hourlyRate && (
                  <div className="mt-4 bg-gold-50 border border-gold-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gold-700 mb-0.5">Tarif consultation</p>
                    <p className="font-display text-lg font-bold text-navy-800">
                      {Number(expert.hourlyRate).toLocaleString()} FCFA
                    </p>
                    <p className="text-[10px] text-gray-400">par heure</p>
                  </div>
                )}

                {expert?.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {expert.skills.slice(0, 4).map(s => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-700 border border-navy-100 text-[11px]">{s}</span>
                    ))}
                  </div>
                )}

                <Link href={`/profile/${expert.id}`} className="btn-outline w-full justify-center mt-4 text-xs">
                  Voir le profil complet
                </Link>
              </div>

              {/* Note sécurité */}
              <div className="bg-navy-900 rounded-2xl p-4 border border-gold-500/15">
                <p className="text-xs font-semibold text-gold-400 mb-2 flex items-center gap-1.5">
                  <Lock size={12} /> Messagerie sécurisée
                </p>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Tous les échanges sont chiffrés et confidentiels. Vos coordonnées ne seront jamais partagées sans votre accord.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
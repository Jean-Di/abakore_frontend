'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { auth, db, storage } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, getDoc,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useWorkflow, WORKFLOW_STEPS, STEP_INDEX } from '@/lib/useWorkflow'
import clsx from 'clsx'
import {
  ArrowLeft, Plus, Search, ChevronRight, Loader2, X, Check,
  FileText, Upload, Trash2, Clock, CheckCircle2, AlertTriangle,
  MoreHorizontal, Pencil, RefreshCw, Archive, Send, Eye,
  FolderOpen, Calendar, User, MessageSquare, ShieldCheck,
  ChevronDown, Sparkles, Info, Building2, Scale,
} from 'lucide-react'

/* ─── Constantes ──────────────────────────────────────────────────────────── */
const DOSSIER_TYPES = [
  { value: 'contrat',       label: 'Contrat' },
  { value: 'statuts',       label: 'Statuts / Modification' },
  { value: 'ag',            label: 'Assemblée générale' },
  { value: 'conformite',    label: 'Conformité réglementaire' },
  { value: 'fiscal',        label: 'Fiscal' },
  { value: 'social',        label: 'Social / RH' },
  { value: 'litige',        label: 'Litige / Contentieux' },
  { value: 'autre',         label: 'Autre' },
]

const TYPE_LABEL = Object.fromEntries(DOSSIER_TYPES.map(d => [d.value, d.label]))

const STATUS_CFG = {
  draft:     { label: 'Brouillon',   bg: 'bg-gray-50   border-gray-200',   text: 'text-gray-600',   dot: 'bg-gray-400',   Icon: FolderOpen },
  submitted: { label: 'Soumis',      bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500',   Icon: Send },
  revision:  { label: 'Révision',    bg: 'bg-amber-50  border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400',  Icon: RefreshCw },
  approved:  { label: 'Approuvé',    bg: 'bg-green-50  border-green-200',  text: 'text-green-700',  dot: 'bg-green-500',  Icon: CheckCircle2 },
  archived:  { label: 'Archivé',     bg: 'bg-gray-50   border-gray-200',   text: 'text-gray-500',   dot: 'bg-gray-300',   Icon: Archive },
}

// Transitions autorisées selon rôle
const ALLOWED_TRANSITIONS = {
  admin:       { draft: ['submitted'], submitted: ['revision', 'approved'], revision: ['approved'], approved: ['archived'] },
  responsible: { draft: ['submitted'], submitted: ['revision'],             revision: [],           approved: ['archived'] },
  user:        { draft: ['submitted'], submitted: [],                        revision: [],           approved: [] },
  reader:      {},
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-gray-100 rounded-lg', className)} />
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap', cfg.bg, cfg.text)}>
      <cfg.Icon size={10} /> {cfg.label}
    </span>
  )
}

// Timeline des étapes du workflow
function WorkflowTimeline({ status }) {
  const current = STEP_INDEX[status] ?? 0
  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STEPS.filter(s => s.key !== 'archived').map((step, i) => {
        const idx  = STEP_INDEX[step.key]
        const done = idx < current
        const active = idx === current
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all',
                done   ? 'bg-green-500 border-green-500 text-white' :
                active ? 'bg-gold-500  border-gold-500  text-navy-900' :
                         'bg-white     border-gray-200  text-gray-300'
              )}>
                {done ? <Check size={11} strokeWidth={3} /> : i + 1}
              </div>
              <p className={clsx('text-[9px] mt-1 font-medium whitespace-nowrap hidden sm:block',
                done ? 'text-green-600' : active ? 'text-gold-600' : 'text-gray-300')}>
                {step.label}
              </p>
            </div>
            {i < WORKFLOW_STEPS.filter(s => s.key !== 'archived').length - 1 && (
              <div className={clsx('h-0.5 w-8 sm:w-12 mx-1 mb-3.5 sm:mb-4 transition-colors',
                done ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Modal Nouveau / Modifier dossier ─────────────────────────────────────── */
function DossierModal({ dossier, companyId, userRole, onClose }) {
  const isEdit     = !!dossier?.id
  const fileRef    = useRef(null)
  const [form, setForm] = useState({
    title:       dossier?.title       ?? '',
    type:        dossier?.type        ?? 'contrat',
    description: dossier?.description ?? '',
    deadline:    dossier?.deadline    ?? '',
  })
  const [files,     setFiles]    = useState([])       // nouveaux fichiers locaux
  const [existing,  setExisting] = useState(dossier?.documents ?? []) // pièces déjà jointes
  const [loading,   setLoading]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]    = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addFiles(list) {
    const allowed = Array.from(list).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
      && f.size <= 20 * 1024 * 1024
    )
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...allowed.filter(f => !names.has(f.name))]
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Le titre est requis.'); return }
    setLoading(true); setError('')

    try {
      // Upload des nouvelles pièces jointes
      setUploading(true)
      const uploaded = await Promise.all(files.map(async file => {
        const uid   = auth.currentUser?.uid ?? 'unknown'
        const sRef  = storageRef(storage, `workflow/${uid}/${Date.now()}_${file.name}`)
        await uploadBytes(sRef, file)
        const url   = await getDownloadURL(sRef)
        return { name: file.name, url, size: `${(file.size / 1024).toFixed(0)} Ko` }
      }))
      setUploading(false)

      const allDocs = [...existing, ...uploaded]
      const payload = {
        ...form,
        companyId,
        documents:  allDocs,
        updatedAt:  serverTimestamp(),
      }

      if (isEdit) {
        await updateDoc(doc(db, 'workflow_dossiers', dossier.id), payload)
      } else {
        await addDoc(collection(db, 'workflow_dossiers'), {
          ...payload,
          status:    'draft',
          createdAt: serverTimestamp(),
          history:   [{ action: 'created', at: new Date().toISOString() }],
        })
      }
      onClose()
    } catch (err) {
      setError(err.message)
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-display text-base font-bold text-navy-900">
              {isEdit ? 'Modifier le dossier' : 'Nouveau dossier'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Dossier juridique interne</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          <div>
            <label className="label">Titre du dossier *</label>
            <input className="input" placeholder="Ex : Modification des statuts — ajout d'un associé"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {DOSSIER_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Échéance</label>
              <input type="date" className="input" value={form.deadline}
                onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Contexte du dossier, informations importantes…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Pièces jointes */}
          <div>
            <label className="label">Pièces jointes</label>

            {/* Fichiers existants */}
            {existing.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {existing.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <FileText size={13} className="text-gold-500 flex-shrink-0" />
                    <a href={f.url} target="_blank" rel="noreferrer"
                      className="text-[13px] text-navy-700 hover:underline truncate flex-1">{f.name}</a>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{f.size}</span>
                    <button type="button" onClick={() => setExisting(p => p.filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Nouveaux fichiers */}
            {files.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {files.map(f => (
                  <div key={f.name} className="flex items-center gap-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-xl">
                    <FileText size={13} className="text-gold-500 flex-shrink-0" />
                    <span className="text-[13px] text-navy-700 truncate flex-1">{f.name}</span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{(f.size / 1024).toFixed(0)} Ko</span>
                    <button type="button" onClick={() => setFiles(p => p.filter(x => x.name !== f.name))}
                      className="text-gray-300 hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50 transition-all w-full justify-center">
              <Upload size={14} /> Ajouter des fichiers
            </button>
            <input ref={fileRef} type="file" multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden" onChange={e => addFiles(e.target.files)} />
            <p className="text-[11px] text-gray-300 mt-1.5">PDF, Word, images · Max 20 Mo par fichier</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5">Annuler</button>
            <button type="submit" disabled={loading}
              className="btn-gold flex-1 justify-center py-2.5 rounded-xl inline-flex items-center gap-2 disabled:opacity-60">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> {uploading ? 'Envoi…' : 'Enregistrement…'}</>
                : <><Check size={14} /> {isEdit ? 'Enregistrer' : 'Créer le dossier'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Vue détail dossier ──────────────────────────────────────────────────── */
function DossierDetail({ dossier, userRole, onBack, onEdit }) {
  const [loading,  setLoading]  = useState(false)
  const [note,     setNote]     = useState('')
  const [showNote, setShowNote] = useState(false)

  const transitions = ALLOWED_TRANSITIONS[userRole] ?? {}
  const nextSteps   = transitions[dossier.status] ?? []

  async function transition(newStatus) {
    setLoading(true)
    try {
      const histEntry = { action: newStatus, note: note || null, at: new Date().toISOString() }
      await updateDoc(doc(db, 'workflow_dossiers', dossier.id), {
        status:    newStatus,
        updatedAt: serverTimestamp(),
        history:   [...(dossier.history ?? []), histEntry],
      })
      setNote('')
      setShowNote(false)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce dossier ?')) return
    await deleteDoc(doc(db, 'workflow_dossiers', dossier.id))
    onBack()
  }

  const cfg = STATUS_CFG[dossier.status] ?? STATUS_CFG.draft

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack}
          className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 text-gray-400 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={dossier.status} />
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {TYPE_LABEL[dossier.type] ?? dossier.type}
            </span>
          </div>
          <h1 className="font-display text-xl font-bold text-navy-900 truncate">{dossier.title}</h1>
        </div>
        {dossier.status === 'draft' && (
          <button onClick={() => onEdit(dossier)}
            className="btn-outline inline-flex items-center gap-1.5 flex-shrink-0">
            <Pencil size={13} /> Modifier
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Progression</p>
        <WorkflowTimeline status={dossier.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Contenu */}
        <div className="space-y-4">

          {/* Infos générales */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Informations</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: FolderOpen, label: 'Type',      val: TYPE_LABEL[dossier.type] ?? dossier.type },
                { Icon: Calendar,   label: 'Échéance',  val: dossier.deadline || '—' },
                { Icon: Clock,      label: 'Créé le',   val: dossier.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') ?? '—' },
                { Icon: RefreshCw,  label: 'Modifié',   val: dossier.updatedAt?.toDate?.()?.toLocaleDateString('fr-FR') ?? '—' },
              ].map(({ Icon, label, val }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1 mb-1">
                    <Icon size={10} /> {label}
                  </p>
                  <p className="text-sm font-semibold text-navy-800">{val}</p>
                </div>
              ))}
            </div>

            {dossier.description && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{dossier.description}</p>
              </div>
            )}
          </div>

          {/* Pièces jointes */}
          {(dossier.documents ?? []).length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
                Pièces jointes ({dossier.documents.length})
              </p>
              <div className="flex flex-col gap-2">
                {dossier.documents.map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-gold-50 border border-gold-200 rounded-xl hover:bg-gold-100 transition-colors">
                    <FileText size={14} className="text-gold-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-navy-800 flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{f.size}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Historique */}
          {(dossier.history ?? []).length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Historique</p>
              <div className="relative pl-4 border-l-2 border-gray-100 flex flex-col gap-3">
                {[...(dossier.history ?? [])].reverse().map((h, i) => {
                  const cfg = STATUS_CFG[h.action] ?? STATUS_CFG.draft
                  return (
                    <div key={i} className="relative">
                      <div className={clsx('absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white', cfg.dot)} />
                      <p className="text-[12px] font-semibold text-navy-800 capitalize">
                        {WORKFLOW_STEPS.find(s => s.key === h.action)?.label ?? h.action}
                      </p>
                      {h.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{h.note}"</p>}
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {h.at ? new Date(h.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Panneau actions */}
        <div className="space-y-4">

          {/* Actions workflow */}
          {nextSteps.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Actions disponibles</p>

              {/* Note facultative */}
              {showNote ? (
                <div className="mb-3">
                  <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Commentaire ou motif (facultatif)…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:border-gold-400 transition-all" />
                </div>
              ) : (
                <button type="button" onClick={() => setShowNote(true)}
                  className="text-xs text-gray-400 hover:text-gold-600 mb-3 flex items-center gap-1 transition-colors">
                  <MessageSquare size={11} /> Ajouter un commentaire
                </button>
              )}

              <div className="flex flex-col gap-2">
                {nextSteps.map(next => {
                  const cfg = STATUS_CFG[next]
                  const isApprove  = next === 'approved'
                  const isRevision = next === 'revision'
                  const isArchive  = next === 'archived'
                  const isSubmit   = next === 'submitted'
                  return (
                    <button key={next} onClick={() => transition(next)} disabled={loading}
                      className={clsx(
                        'w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2',
                        isApprove  ? 'bg-green-600 hover:bg-green-700 text-white' :
                        isRevision ? 'border border-amber-300 text-amber-700 hover:bg-amber-50' :
                        isArchive  ? 'border border-gray-200 text-gray-500 hover:bg-gray-50' :
                                     'btn-gold'
                      )}>
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <cfg.Icon size={14} />}
                      {isApprove ? 'Approuver' : isRevision ? 'Demander une révision' : isArchive ? 'Archiver' : 'Soumettre pour révision'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Statut courant */}
          <div className={clsx('rounded-2xl p-4 border', STATUS_CFG[dossier.status]?.bg, STATUS_CFG[dossier.status]?.text?.replace('text-', 'border-'))}>
            <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">Statut actuel</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={dossier.status} />
            </div>
            <p className="text-xs mt-2 opacity-90">
              {WORKFLOW_STEPS.find(s => s.key === dossier.status)?.desc}
            </p>
          </div>

          {/* Supprimer */}
          {(dossier.status === 'draft' || dossier.status === 'archived') && (
            <button onClick={handleDelete}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <Trash2 size={14} /> Supprimer le dossier
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page principale ──────────────────────────────────────────────────────── */
export default function WorkflowPage() {
  const router = useRouter()
  const { user, dossiers, loading, error, counts, pendingAction } = useWorkflow()
  const [view,       setView]       = useState('list')     // 'list' | 'detail'
  const [selected,   setSelected]   = useState(null)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editDossier, setEditDossier] = useState(null)

  // Filtres
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType,   setFilterType]   = useState('all')

  // Redirige si non-company
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/auth/login'); return }
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists() && snap.data().accountType !== 'company') router.push('/dashboard')
    })
    return unsub
  }, [router])

  const filtered = useMemo(() => {
    return dossiers
      .filter(d => {
        if (search.trim() && !d.title?.toLowerCase().includes(search.toLowerCase())) return false
        if (filterStatus !== 'all' && d.status !== filterStatus) return false
        if (filterType   !== 'all' && d.type   !== filterType)   return false
        return true
      })
  }, [dossiers, search, filterStatus, filterType])

  function openDetail(dossier) { setSelected(dossier); setView('detail') }
  function openAdd()           { setEditDossier(null);    setModalOpen(true) }
  function openEdit(d)         { setEditDossier(d);       setModalOpen(true) }
  function backToList()        { setView('list'); setSelected(null) }

  // Sync dossier sélectionné avec les mises à jour temps réel
  useEffect(() => {
    if (selected) {
      const updated = dossiers.find(d => d.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [dossiers, selected?.id])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  )

  return (
    <>
      <Navbar />

      {modalOpen && (
        <DossierModal
          dossier={editDossier}
          companyId={user?.uid}
          userRole={user?.companyRole ?? 'user'}
          onClose={() => { setModalOpen(false); setEditDossier(null) }}
        />
      )}

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ── Vue détail ─────────────────────────────────────────── */}
          {view === 'detail' && selected && (
            <DossierDetail
              dossier={selected}
              userRole={user?.companyRole ?? 'user'}
              onBack={backToList}
              onEdit={openEdit}
            />
          )}

          {/* ── Vue liste ──────────────────────────────────────────── */}
          {view === 'list' && (
            <>
              {/* En-tête */}
              <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard"
                  className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 text-gray-400 transition-all">
                  <ArrowLeft size={18} />
                </Link>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-navy-900">Workflow juridique</h1>
                  <p className="text-sm text-gray-400 mt-0.5">Gestion et validation des dossiers internes</p>
                </div>
                <button onClick={openAdd} className="btn-gold inline-flex items-center gap-2">
                  <Plus size={15} /> Nouveau dossier
                </button>
              </div>

              {/* Compteurs par statut */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {WORKFLOW_STEPS.map(step => {
                  const cfg = STATUS_CFG[step.key]
                  const isActive = filterStatus === step.key
                  return (
                    <button key={step.key}
                      onClick={() => setFilterStatus(isActive ? 'all' : step.key)}
                      className={clsx(
                        'bg-white border rounded-2xl p-3 text-left transition-all hover:shadow-sm',
                        isActive ? 'border-gold-400 shadow-sm' : 'border-gray-100'
                      )}
                      style={{ boxShadow: 'var(--shadow-sm)' }}>
                      {loading
                        ? <Skeleton className="h-10 w-full" />
                        : <>
                          <p className="font-display text-2xl font-bold text-navy-900">{counts[step.key] ?? 0}</p>
                          <StatusBadge status={step.key} />
                        </>}
                    </button>
                  )
                })}
              </div>

              {/* Alerte si dossiers en attente */}
              {pendingAction > 0 && !loading && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 mb-5">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">{pendingAction} dossier{pendingAction > 1 ? 's' : ''}</span>{' '}
                    en attente d'action de votre part.
                  </p>
                </div>
              )}

              {/* Filtres */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 flex flex-wrap gap-3"
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 transition-all"
                    placeholder="Rechercher un dossier…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer">
                  <option value="all">Tous les statuts</option>
                  {WORKFLOW_STEPS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer">
                  <option value="all">Tous les types</option>
                  {DOSSIER_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {/* Liste */}
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-[100px] rounded-2xl" />)}
                </div>
              ) : dossiers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mb-4">
                    <FolderOpen size={28} className="text-gold-500" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-navy-800 mb-2">Aucun dossier créé</h3>
                  <p className="text-sm text-gray-400 max-w-sm mb-6">
                    Créez votre premier dossier juridique interne pour démarrer le circuit de validation.
                  </p>
                  <div className="flex flex-col gap-3 text-left max-w-xs w-full mb-6">
                    {[
                      "Modification des statuts — ajout d'un associé",
                      "Préparation de l'assemblée générale ordinaire",
                      'Renouvellement du bail commercial',
                    ].map(ex => (
                      <button key={ex} onClick={() => { setEditDossier({ title: ex }); setModalOpen(true) }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-navy-700 hover:border-gold-300 hover:shadow-sm transition-all group">
                        <Plus size={13} className="text-gold-500 flex-shrink-0" /> {ex}
                        <ChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-gold-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                  <button onClick={openAdd} className="btn-gold inline-flex items-center gap-2">
                    <Plus size={15} /> Créer mon premier dossier
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">
                  <Search size={28} className="mb-3 opacity-30" />
                  <p className="font-semibold text-navy-700">Aucun dossier trouvé</p>
                  <p className="text-sm mt-1">Modifiez vos filtres</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map(d => {
                    const needsAction = d.status === 'submitted' || d.status === 'revision'
                    return (
                      <div key={d.id}
                        onClick={() => openDetail(d)}
                        className={clsx(
                          'bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all',
                          needsAction ? 'border-amber-200 hover:border-amber-300' : 'border-gray-100 hover:border-gold-300'
                        )}
                        style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <StatusBadge status={d.status} />
                              <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {TYPE_LABEL[d.type] ?? d.type}
                              </span>
                              {needsAction && (
                                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                                  <AlertTriangle size={10} /> Action requise
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-navy-800 truncate">{d.title}</p>
                            {d.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{d.description}</p>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                        </div>

                        {/* Timeline mini */}
                        <div className="flex items-center gap-1">
                          {WORKFLOW_STEPS.filter(s => s.key !== 'archived').map((step, i) => {
                            const idx  = STEP_INDEX[step.key]
                            const cur  = STEP_INDEX[d.status] ?? 0
                            const done = idx < cur
                            const active = idx === cur
                            return (
                              <div key={step.key} className="flex items-center">
                                <div className={clsx(
                                  'w-2 h-2 rounded-full transition-all',
                                  done ? 'bg-green-400' : active ? 'bg-gold-500' : 'bg-gray-200'
                                )} />
                                {i < 3 && <div className={clsx('h-0.5 w-4', done ? 'bg-green-300' : 'bg-gray-100')} />}
                              </div>
                            )
                          })}
                          <span className="text-[11px] text-gray-400 ml-2">{d.deadline ? `Éch. ${d.deadline}` : ''}</span>
                          {(d.documents ?? []).length > 0 && (
                            <span className="text-[11px] text-gray-400 ml-auto flex items-center gap-1">
                              <FileText size={10} /> {d.documents.length}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <p className="text-xs text-gray-300 text-center pt-2">
                    {filtered.length} dossier{filtered.length > 1 ? 's' : ''}
                    {filtered.length !== dossiers.length && ` sur ${dossiers.length}`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

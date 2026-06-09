'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc,
} from 'firebase/firestore'
import clsx from 'clsx'
import {
  ShieldCheck, Plus, Search, Filter, ChevronRight, Star,
  CheckCircle2, AlertTriangle, Clock, X, Check, Loader2,
  Calendar, BookOpen, Pencil, Trash2, ChevronDown, Info,
  FileText, BarChart2, Activity, Sparkles, ArrowLeft,
  MoreHorizontal, RefreshCw, Download,
} from 'lucide-react'

/* ─── Constantes ──────────────────────────────────────────────────────────── */
const DOMAINS = [
  { value: 'fiscal',      label: 'Fiscal' },
  { value: 'social',      label: 'Social / RH' },
  { value: 'commercial',  label: 'Commercial' },
  { value: 'societe',     label: 'Droit des sociétés' },
  { value: 'bancaire',    label: 'Bancaire / Financier' },
  { value: 'sectoriel',   label: 'Sectoriel' },
  { value: 'autre',       label: 'Autre' },
]

const FREQUENCIES = [
  { value: 'monthly',   label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'annual',    label: 'Annuel' },
  { value: 'once',      label: 'Ponctuel' },
]

const STATUS_CFG = {
  compliant: { label: 'Conforme',   bg: 'bg-green-50 border-green-200', text: 'text-green-700', dot: 'bg-green-500',  Icon: CheckCircle2 },
  late:      { label: 'En retard',  bg: 'bg-red-50   border-red-200',   text: 'text-red-700',   dot: 'bg-red-500',    Icon: AlertTriangle },
  upcoming:  { label: 'À venir',    bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400',  Icon: Clock },
  pending:   { label: 'À valider',  bg: 'bg-blue-50  border-blue-200',  text: 'text-blue-700',  dot: 'bg-blue-400',   Icon: Clock },
}

const DOMAIN_LABEL = Object.fromEntries(DOMAINS.map(d => [d.value, d.label]))
const FREQ_LABEL   = Object.fromEntries(FREQUENCIES.map(f => [f.value, f.label]))

// Calcul score pondéré par criticité
function computeScore(kpis) {
  if (!kpis.length) return null
  let totalW = 0, earnedW = 0
  for (const k of kpis) {
    const w = k.criticality ?? 1
    totalW  += w
    if (k.status === 'compliant') earnedW += w
  }
  return totalW === 0 ? 100 : Math.round((earnedW / totalW) * 100)
}

/* ─── Composants UI ───────────────────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-gray-100 rounded-lg', className)} />
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap', cfg.bg, cfg.text)}>
      <cfg.Icon size={10} /> {cfg.label}
    </span>
  )
}

function CriticalityStars({ value = 1, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={clsx('transition-colors', onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default')}
        >
          <Star size={onChange ? 14 : 11}
            className={n <= value ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
        </button>
      ))}
    </div>
  )
}

// Jauge demi-cercle SVG
function ScoreGauge({ score, loading }) {
  if (loading) return <Skeleton className="h-[160px] w-full rounded-2xl" />
  const pct   = score ?? 0
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const label = pct >= 80 ? 'Conforme' : pct >= 50 ? 'À améliorer' : 'Critique'
  const R = 70, cx = 90, cy = 90
  const total  = Math.PI * R
  const filled = (pct / 100) * total
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Score global</p>
      <div className="relative w-[140px] h-[80px] overflow-hidden">
        <svg viewBox="0 0 180 95" className="w-full">
          <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`}
            fill="none" stroke="#f3f4f6" strokeWidth="16" strokeLinecap="round" />
          <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`}
            fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${filled} ${total - filled}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
          <p className="font-display text-3xl font-bold" style={{ color }}>{score !== null ? pct : '—'}</p>
          <p className="text-xs text-gray-500">{score !== null ? '/100' : 'Aucun KPI'}</p>
        </div>
      </div>
      <span className="mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
        style={{ background: `${color}18`, color }}>
        {score !== null ? label : 'À configurer'}
      </span>
    </div>
  )
}

/* ─── Modal Ajouter / Modifier ─────────────────────────────────────────────── */
function KpiModal({ kpi, companyId, onClose, onSaved }) {
  const isEdit = !!kpi?.id
  const [form, setForm] = useState({
    title:       kpi?.title       ?? '',
    description: kpi?.description ?? '',
    domain:      kpi?.domain      ?? 'fiscal',
    frequency:   kpi?.frequency   ?? 'annual',
    dueDate:     kpi?.dueDate     ?? '',
    criticality: kpi?.criticality ?? 3,
    legalRef:    kpi?.legalRef    ?? '',
    status:      kpi?.status      ?? 'pending',
  })
  const [loading,    setLoading]    = useState(false)
  const [aiLoading,  setAiLoading]  = useState(false)
  const [error,      setError]      = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Simulation suggestion IA (à remplacer par vraie API Claude)
  async function suggestFromTitle() {
    if (!form.title.trim()) return
    setAiLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    const suggestions = {
      description: `Obligation légale : ${form.title}. Vérifier la conformité selon les textes en vigueur en Côte d'Ivoire et dans l'espace OHADA.`,
      legalRef:    'Code général des impôts CI · Acte Uniforme OHADA applicable',
      frequency:   'annual',
    }
    setForm(f => ({ ...f, ...suggestions }))
    setAiLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Le titre est requis.'); return }
    if (!form.dueDate)       { setError("La date d'échéance est requise."); return }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, companyId, updatedAt: serverTimestamp() }
      if (isEdit) {
        await updateDoc(doc(db, 'compliance_kpis', kpi.id), payload)
      } else {
        await addDoc(collection(db, 'compliance_kpis'), { ...payload, createdAt: serverTimestamp() })
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-display text-base font-bold text-navy-900">
              {isEdit ? "Modifier l'indicateur" : 'Nouvel indicateur'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Obligation légale ou réglementaire à suivre</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Titre + bouton IA */}
          <div>
            <label className="label">Titre de l'obligation *</label>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Ex : Déclaration de TVA mensuelle"
                value={form.title} onChange={e => set('title', e.target.value)} />
              <button type="button" onClick={suggestFromTitle} disabled={aiLoading || !form.title.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gold-300 bg-gold-50 text-gold-700 text-xs font-semibold hover:bg-gold-100 transition-all disabled:opacity-40 whitespace-nowrap flex-shrink-0">
                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                IA
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2}
              placeholder="Détails de l'obligation…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Domaine + Fréquence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Domaine</label>
              <select className="input" value={form.domain} onChange={e => set('domain', e.target.value)}>
                {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fréquence</label>
              <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Date d'échéance + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Échéance *</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUS_CFG).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Criticité */}
          <div>
            <label className="label">Criticité</label>
            <div className="flex items-center gap-3">
              <CriticalityStars value={form.criticality} onChange={v => set('criticality', v)} />
              <span className="text-xs text-gray-400">
                {form.criticality === 1 ? 'Faible' : form.criticality <= 2 ? 'Normale' : form.criticality <= 3 ? 'Modérée' : form.criticality <= 4 ? 'Haute' : 'Critique'}
              </span>
            </div>
          </div>

          {/* Référence légale */}
          <div>
            <label className="label">Référence légale</label>
            <input className="input" placeholder="Ex : Art. 12 CGI · Acte Uniforme OHADA"
              value={form.legalRef} onChange={e => set('legalRef', e.target.value)} />
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="btn-gold flex-1 justify-center py-2.5 rounded-xl inline-flex items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? 'Enregistrer' : "Ajouter l'indicateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Ligne KPI ────────────────────────────────────────────────────────────── */
function KpiRow({ kpi, onEdit, onDelete, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const cfg = STATUS_CFG[kpi.status] ?? STATUS_CFG.pending

  async function handleToggle() {
    const newStatus = kpi.status === 'compliant' ? 'pending' : 'compliant'
    await updateDoc(doc(db, 'compliance_kpis', kpi.id), {
      status: newStatus, updatedAt: serverTimestamp(),
    })
    onToggleStatus?.(kpi.id, newStatus)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-200 transition-all group"
      style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-start gap-4">

        {/* Checkbox conformité */}
        <button onClick={handleToggle}
          className={clsx(
            'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
            kpi.status === 'compliant'
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300 hover:border-green-400'
          )}>
          {kpi.status === 'compliant' && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={clsx('text-sm font-semibold truncate', kpi.status === 'compliant' ? 'text-gray-400 line-through' : 'text-navy-800')}>
                {kpi.title}
              </p>
              {kpi.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{kpi.description}</p>
              )}
            </div>
            {/* Menu actions */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal size={15} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36"
                    style={{ boxShadow: 'var(--shadow-md)' }}>
                    <button onClick={() => { onEdit(kpi); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                      <Pencil size={13} /> Modifier
                    </button>
                    <button onClick={handleToggle}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                      <RefreshCw size={13} />
                      {kpi.status === 'compliant' ? 'Marquer en attente' : 'Marquer conforme'}
                    </button>
                    <div className="border-t border-gray-50 my-1" />
                    <button onClick={() => { onDelete(kpi.id); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Méta */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge status={kpi.status} />
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {DOMAIN_LABEL[kpi.domain] ?? kpi.domain}
            </span>
            {kpi.frequency && (
              <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {FREQ_LABEL[kpi.frequency] ?? kpi.frequency}
              </span>
            )}
            {kpi.dueDate && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Calendar size={10} /> {kpi.dueDate}
              </span>
            )}
            <CriticalityStars value={kpi.criticality ?? 1} />
          </div>

          {kpi.legalRef && (
            <p className="text-[11px] text-navy-500/70 mt-1.5 flex items-center gap-1">
              <BookOpen size={10} /> {kpi.legalRef}
            </p>
          )}
        </div>
      </div>

      {/* Action rapide si en retard */}
      {kpi.status === 'late' && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
            <AlertTriangle size={11} /> Obligation en retard
          </p>
          <Link href="/marketplace"
            className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1">
            Trouver un expert <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </div>
  )
}

/* ─── Page principale ──────────────────────────────────────────────────────── */
export default function ConformitePage() {
  const router = useRouter()
  const [companyId,  setCompanyId]  = useState(null)
  const [kpis,       setKpis]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editKpi,    setEditKpi]    = useState(null) // kpi en cours d'édition
  const [deleteId,   setDeleteId]   = useState(null) // confirmation suppression
  const [deleting,   setDeleting]   = useState(false)

  // Filtres
  const [search,     setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDomain, setFilterDomain] = useState('all')
  const [sortBy,     setSortBy]     = useState('dueDate')

  // Auth + fetch
  useEffect(() => {
    let unsubKpis = null
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/auth/login'); return }

      // Vérifie que c'est bien un compte entreprise
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        const type = snap.exists() ? snap.data().accountType : 'expert'
        if (type !== 'company') { router.push('/dashboard'); return }
      } catch {}

      setCompanyId(u.uid)

      const q = query(
        collection(db, 'compliance_kpis'),
        where('companyId', '==', u.uid),
        orderBy('dueDate', 'asc')
      )
      unsubKpis = onSnapshot(q, snap => {
        setKpis(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      }, () => setLoading(false))
    })
    return () => { unsubAuth(); unsubKpis?.() }
  }, [router])

  // Filtrage + tri
  const filtered = useMemo(() => {
    let list = [...kpis]
    if (search.trim())           list = list.filter(k => k.title?.toLowerCase().includes(search.toLowerCase()))
    if (filterStatus !== 'all')  list = list.filter(k => k.status === filterStatus)
    if (filterDomain !== 'all')  list = list.filter(k => k.domain === filterDomain)
    list.sort((a, b) => {
      if (sortBy === 'dueDate')     return (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      if (sortBy === 'criticality') return (b.criticality ?? 1) - (a.criticality ?? 1)
      if (sortBy === 'status') {
        const order = { late: 0, upcoming: 1, pending: 2, compliant: 3 }
        return (order[a.status] ?? 2) - (order[b.status] ?? 2)
      }
      return 0
    })
    return list
  }, [kpis, search, filterStatus, filterDomain, sortBy])

  const score = computeScore(kpis)

  // Statistiques dérivées
  const stats = {
    total:     kpis.length,
    compliant: kpis.filter(k => k.status === 'compliant').length,
    late:      kpis.filter(k => k.status === 'late').length,
    upcoming:  kpis.filter(k => ['upcoming', 'pending'].includes(k.status)).length,
  }

  async function handleDelete(id) {
    setDeleting(true)
    try { await deleteDoc(doc(db, 'compliance_kpis', id)) }
    catch (e) { console.error(e) }
    finally { setDeleting(false); setDeleteId(null) }
  }

  function openAdd() { setEditKpi(null); setModalOpen(true) }
  function openEdit(kpi) { setEditKpi(kpi); setModalOpen(true) }

  return (
    <>
      <Navbar />

      {/* Modal ajouter / modifier */}
      {modalOpen && (
        <KpiModal
          kpi={editKpi}
          companyId={companyId}
          onClose={() => { setModalOpen(false); setEditKpi(null) }}
          onSaved={() => {}}
        />
      )}

      {/* Modal suppression */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-display text-base font-bold text-navy-900 mb-2">Supprimer l'indicateur ?</h3>
            <p className="text-sm text-gray-400 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="btn-outline flex-1 justify-center inline-flex">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ── En-tête ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 text-gray-400 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-navy-900">Conformité</h1>
              <p className="text-sm text-gray-400 mt-0.5">Suivi des obligations légales et réglementaires</p>
            </div>
            <button onClick={openAdd}
              className="btn-gold inline-flex items-center gap-2">
              <Plus size={15} /> Ajouter un indicateur
            </button>
          </div>

          {/* ── Ligne résumé : jauge + 4 stats ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 mb-6">
            <ScoreGauge score={score} loading={loading} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total',      val: stats.total,     color: 'text-navy-600',  bg: 'bg-navy-50',   Icon: Activity },
                { label: 'Conformes',  val: stats.compliant, color: 'text-green-600', bg: 'bg-green-50',  Icon: CheckCircle2 },
                { label: 'En retard',  val: stats.late,      color: 'text-red-600',   bg: 'bg-red-50',    Icon: AlertTriangle },
                { label: 'À venir',    val: stats.upcoming,  color: 'text-amber-600', bg: 'bg-amber-50',  Icon: Clock },
              ].map(({ label, val, color, bg, Icon }) => (
                loading
                  ? <div key={label} className="animate-pulse bg-gray-100 rounded-2xl h-[100px]" />
                  : (
                    <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4"
                      style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center mb-2', bg)}>
                        <Icon size={16} className={color} />
                      </div>
                      <p className="font-display text-2xl font-bold text-navy-900">{val}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                    </div>
                  )
              ))}
            </div>
          </div>

          {/* ── Barre de filtres ─────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 flex flex-wrap gap-3"
            style={{ boxShadow: 'var(--shadow-sm)' }}>

            {/* Recherche */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 transition-all"
                placeholder="Rechercher un indicateur…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Statut */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer">
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_CFG).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>

            {/* Domaine */}
            <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer">
              <option value="all">Tous les domaines</option>
              {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>

            {/* Tri */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer">
              <option value="dueDate">Échéance</option>
              <option value="criticality">Criticité</option>
              <option value="status">Statut</option>
            </select>
          </div>

          {/* ── Liste des indicateurs ─────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-[100px] rounded-2xl" />)}
            </div>
          ) : kpis.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mb-4">
                <ShieldCheck size={28} className="text-gold-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy-800 mb-2">Aucun indicateur configuré</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                Ajoutez vos premières obligations légales pour commencer à suivre la conformité de votre entreprise.
              </p>
              <div className="flex flex-col gap-3 text-left max-w-xs w-full mb-6">
                {[
                  'Dépôt des comptes annuels au greffe',
                  'Déclaration de TVA mensuelle',
                  'Renouvellement du RCCM',
                  'Visite médicale annuelle des employés',
                ].map(ex => (
                  <button key={ex} onClick={() => {
                    setEditKpi({ title: ex, status: 'pending' })
                    setModalOpen(true)
                  }} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-navy-700 hover:border-gold-300 hover:shadow-sm transition-all group">
                    <Plus size={13} className="text-gold-500 flex-shrink-0" />
                    {ex}
                    <ChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-gold-500 transition-colors" />
                  </button>
                ))}
              </div>
              <button onClick={openAdd} className="btn-gold inline-flex items-center gap-2">
                <Plus size={15} /> Créer mon premier indicateur
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">
              <Search size={28} className="mb-3 opacity-30" />
              <p className="font-semibold text-navy-700">Aucun indicateur trouvé</p>
              <p className="text-sm mt-1">Modifiez vos filtres ou{' '}
                <button onClick={openAdd} className="text-gold-600 font-semibold">ajoutez un indicateur</button>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Groupe : En retard en premier */}
              {filtered.filter(k => k.status === 'late').length > 0 && (
                <>
                  <p className="text-[11px] font-bold tracking-widest uppercase text-red-400 flex items-center gap-1.5 px-1">
                    <AlertTriangle size={11} /> En retard — Action requise
                  </p>
                  {filtered.filter(k => k.status === 'late').map(kpi => (
                    <KpiRow key={kpi.id} kpi={kpi}
                      onEdit={openEdit}
                      onDelete={setDeleteId}
                      onToggleStatus={() => {}}
                    />
                  ))}
                </>
              )}
              {filtered.filter(k => k.status !== 'late').length > 0 && (
                <>
                  {filtered.filter(k => k.status === 'late').length > 0 && (
                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 px-1 mt-2">
                      Autres indicateurs
                    </p>
                  )}
                  {filtered.filter(k => k.status !== 'late').map(kpi => (
                    <KpiRow key={kpi.id} kpi={kpi}
                      onEdit={openEdit}
                      onDelete={setDeleteId}
                      onToggleStatus={() => {}}
                    />
                  ))}
                </>
              )}

              {/* Footer comptage */}
              <p className="text-xs text-gray-400 text-center pt-2">
                {filtered.length} indicateur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
                {filtered.length !== kpis.length && ` sur ${kpis.length}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

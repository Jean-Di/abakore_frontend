// app/dashboard/page.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, StatusBadge, ProgressBar } from '@/components/ui'
import { useDashboardData } from '@/lib/useDashboardData'
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, signOut } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import clsx from 'clsx'
import {
  Home, User, FolderOpen, MessageSquare, Scale, Search,
  BarChart2, CreditCard, Settings, LogOut, Banknote, Star,
  Eye, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  Check, X, Clock, AlertTriangle, CheckCircle2, Filter,
  ArrowUpDown, Loader2, FileText, Send, MapPin, Calendar,
  DollarSign, Shield, MoreHorizontal, RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'


/* ── Constantes ─────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { Icon: Search,        label: 'Trouver un expert', href: '/search' },
  { Icon: MessageSquare, label: 'Messagerie',        href: '/messages' },
  { Icon: Scale,         label: 'OHADA IA',          href: '/ohada-ia' },
  { Icon: BarChart2,     label: 'Mes statistiques',  href: '#' },
]

const DOT_COLORS = {
  gold:  'bg-gold-500',
  green: 'bg-green-500',
  navy:  'bg-navy-400',
}

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200',  Icon: Clock },
  active:    { label: 'En cours',    color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200',   Icon: RefreshCw },
  completed: { label: 'Terminé',     color: 'text-green-600',  bg: 'bg-green-50  border-green-200',  Icon: CheckCircle2 },
  rejected:  { label: 'Refusé',      color: 'text-red-600',    bg: 'bg-red-50    border-red-200',    Icon: X },
  cancelled: { label: 'Annulé',      color: 'text-gray-500',   bg: 'bg-gray-50   border-gray-200',   Icon: X },
}

const PRIORITY_CONFIG = {
  normal: { label: 'Normale', color: 'text-gray-500',   dot: 'bg-gray-400' },
  high:   { label: 'Haute',   color: 'text-orange-500', dot: 'bg-orange-400' },
  urgent: { label: 'Urgente', color: 'text-red-500',    dot: 'bg-red-500' },
}

const TYPE_LABELS = {
  contract:      'Contrat',
  restructuring: 'Restructuration',
  litigation:    'Litige',
  compliance:    'Conformité',
  creation:      'Création',
  hr:            'RH',
  banking:       'Bancaire',
  other:         'Autre',
}

/* ── Skeleton ───────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-gray-100 rounded-lg', className)} />
}

/* ── Badge statut inline ─────────────────────────────────── */
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', cfg.bg, cfg.color)}>
      <cfg.Icon size={10} /> {cfg.label}
    </span>
  )
}

/* ── Modal détail dossier ────────────────────────────────── */
function DossierModal({ dossier, onClose, currentUserUid, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const [note, setNote]         = useState('')
  const isExpert  = dossier.expertId  === currentUserUid
  const isClient  = dossier.clientId  === currentUserUid
  const priority  = PRIORITY_CONFIG[dossier.priority] ?? PRIORITY_CONFIG.normal

  async function handleStatus(newStatus) {
    setUpdating(true)
    try {
      await updateDoc(doc(db, 'dossiers', dossier.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(note ? { expertNote: note } : {}),
      })
      onStatusChange(dossier.id, newStatus)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusPill status={dossier.status} />
              <span className={clsx('text-[11px] font-semibold flex items-center gap-1', priority.color)}>
                <span className={clsx('w-1.5 h-1.5 rounded-full', priority.dot)} />
                {priority.label}
              </span>
              {dossier.confidential && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-600 bg-navy-50 border border-navy-100 px-2 py-0.5 rounded-full">
                  <Shield size={9} /> NDA
                </span>
              )}
            </div>
            <h2 className="font-display text-base font-bold text-navy-900 leading-tight">{dossier.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{dossier.ref}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Infos principales */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: FileText,   label: 'Type',      val: TYPE_LABELS[dossier.type] ?? dossier.type },
              { Icon: MapPin,     label: 'Pays',       val: (dossier.countries ?? []).join(', ') || '—' },
              { Icon: Calendar,   label: 'Échéance',   val: dossier.deadline || (dossier.deadlineFlexible ? 'Flexible' : '—') },
              { Icon: DollarSign, label: 'Budget',     val: dossier.budgetType === 'open' ? 'Ouvert' : dossier.budget ? `${Number(dossier.budget).toLocaleString()} FCFA` : '—' },
            ].map(({ Icon, label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1">
                  <Icon size={10} /> {label}
                </p>
                <p className="text-sm font-semibold text-navy-800">{val}</p>
              </div>
            ))}
          </div>

          {/* Parties */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Parties</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-[10px] text-gray-400">Client</p>
                <p className="font-semibold text-navy-800">{dossier.clientName ?? '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Expert</p>
                <p className="font-semibold text-navy-800">{dossier.expertName ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {dossier.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                {dossier.description}
              </p>
            </div>
          )}

          {/* Documents joints */}
          {(dossier.documents ?? []).length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Documents</p>
              <div className="flex flex-col gap-1.5">
                {dossier.documents.map((doc_, i) => (
                  <a key={i} href={doc_.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-xl text-xs hover:bg-gold-100 transition-colors">
                    <FileText size={13} className="text-gold-600 flex-shrink-0" />
                    <span className="flex-1 font-medium text-navy-800 truncate">{doc_.name}</span>
                    <span className="text-gray-400">{doc_.size}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Note expert si refus */}
          {isExpert && dossier.status === 'pending' && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Note (optionnelle)
              </p>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Motif de refus ou précisions pour le client…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:border-gold-400 transition-all"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex flex-col gap-2">

          {/* Expert : dossier en attente → accepter / refuser */}
          {isExpert && dossier.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatus('rejected')}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <X size={14} /> Refuser
              </button>
              <button
                onClick={() => handleStatus('active')}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-navy-900"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #9E7828)' }}
              >
                {updating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Accepter
              </button>
            </div>
          )}

          {/* Expert : dossier actif → marquer terminé */}
          {isExpert && dossier.status === 'active' && (
            <button
              onClick={() => handleStatus('completed')}
              disabled={updating}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Marquer comme terminé
            </button>
          )}

          {/* Client : dossier en attente → annuler */}
          {isClient && dossier.status === 'pending' && (
            <button
              onClick={() => handleStatus('cancelled')}
              disabled={updating}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Annuler le dossier
            </button>
          )}

          {/* Lien messagerie */}
          <Link
            href={`/contact/${isExpert ? dossier.clientId : dossier.expertId}`}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
          >
            <Send size={13} /> Envoyer un message
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Vue tous les dossiers ───────────────────────────────── */
function AllDossiersView({ projects, currentUserUid, onBack, onOpenDossier }) {
  const [filterStatus,   setFilterStatus]   = useState('all')
  const [filterRole,     setFilterRole]     = useState('all')
  const [search,         setSearch]         = useState('')
  const [sortBy,         setSortBy]         = useState('date')

  const filtered = projects
    .filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false
      if (filterRole === 'client' && p.clientId !== currentUserUid) return false
      if (filterRole === 'expert' && p.expertId !== currentUserUid) return false
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !(p.clientName ?? '').toLowerCase().includes(search.toLowerCase()) &&
          !(p.expertName ?? '').toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date')     return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      if (sortBy === 'deadline') return (a.deadline ?? '').localeCompare(b.deadline ?? '')
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, normal: 2 }
        return (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
      }
      return 0
    })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
          <ChevronRight size={18} className="rotate-180" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-navy-900">Tous mes dossiers</h1>
          <p className="text-xs text-gray-400">{projects.length} dossier{projects.length > 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex flex-wrap gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 transition-all"
              placeholder="Rechercher un dossier…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Statut */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>

          {/* Rôle */}
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer"
          >
            <option value="all">Tous les rôles</option>
            <option value="client">En tant que client</option>
            <option value="expert">En tant qu'expert</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400 bg-white cursor-pointer"
          >
            <option value="date">Plus récents</option>
            <option value="deadline">Échéance</option>
            <option value="priority">Priorité</option>
          </select>
        </div>
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <FolderOpen size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-navy-700">Aucun dossier trouvé</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou créez un nouveau dossier</p>
          <Link href="/search" className="btn-gold btn-sm mt-4 inline-flex">Trouver un expert</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(p => {
            const priority = PRIORITY_CONFIG[p.priority] ?? PRIORITY_CONFIG.normal
            const isExpert = p.expertId === currentUserUid
            return (
              <div
                key={p.id}
                onClick={() => onOpenDossier(p)}
                className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-gold-300 hover:shadow-md transition-all group"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusPill status={p.status} />
                      <span className={clsx('text-[11px] font-semibold flex items-center gap-1', priority.color)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', priority.dot)} />
                        {priority.label}
                      </span>
                      <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {isExpert ? 'Expert' : 'Client'}
                      </span>
                      {p.confidential && (
                        <span className="text-[11px] text-navy-600 bg-navy-50 border border-navy-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Shield size={9} /> NDA
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-navy-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isExpert ? `Client : ${p.clientName}` : `Expert : ${p.expertName}`}
                      {p.deadline && ` · Éch. ${p.deadline}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {p.budget && (
                      <p className="text-sm font-bold text-navy-800">
                        {Number(p.budget).toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span>
                      </p>
                    )}
                    <span className="text-[11px] text-gray-300 font-mono">{p.ref}</span>
                  </div>
                </div>

                {/* Barre de progression si actif */}
                {p.status === 'active' && (
                  <div className="mt-3">
                    <ProgressBar value={p.progress ?? 0} />
                    <p className="text-xs text-gray-400 mt-1">{p.progress ?? 0}% complété</p>
                  </div>
                )}

                {/* Actions rapides expert */}
                {isExpert && p.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await updateDoc(doc(db, 'dossiers', p.id), { status: 'rejected', updatedAt: serverTimestamp() })
                      }}
                      className="flex-1 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                    >
                      <X size={11} /> Refuser
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await updateDoc(doc(db, 'dossiers', p.id), { status: 'active', updatedAt: serverTimestamp() })
                      }}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-navy-900 transition-all flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(135deg, #C9A84C, #9E7828)' }}
                    >
                      <Check size={11} /> Accepter
                    </button>
                    <button
                      onClick={() => onOpenDossier(p)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all"
                    >
                      Détails
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter()
  const [activeKey,      setActiveKey]      = useState('dash')
  const [view,           setView]           = useState('dashboard') // 'dashboard' | 'all-dossiers'
  const [selectedDossier, setSelectedDossier] = useState(null)

  const { user, projects, notifications, kpis, loading, error } = useDashboardData()

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

  async function handleLogout() {
    await signOut(auth)
    router.push('/')
  }

  // KPIs
  const KPIS = kpis ? [
    { Icon: FolderOpen, val: String(kpis.totalDossiers ?? projects.length), label: 'Dossiers total',    change: '+8 ce mois',       up: true },
    { Icon: Banknote,   val: kpis.revenueMonth,                             label: 'FCFA ce mois',      change: kpis.revenueChange, up: true },
    { Icon: Star,       val: String(kpis.avgRating),                        label: 'Note moyenne',      change: 'Stable',           up: true },
    { Icon: Eye,        val: String(kpis.profileViews),                     label: 'Vues profil (30j)', change: kpis.viewsChange,   up: true },
  ] : []

  const unreadCount    = notifications.filter(n => n.unread).length
  const pendingCount   = projects.filter(p => p.status === 'pending').length
  const activeProjects = projects.filter(p => ['active', 'pending'].includes(p.status)).slice(0, 3)

  const SIDEBAR_ITEMS = [
    { Icon: Home,          label: 'Tableau de bord',  href: '/dashboard',                  key: 'dash' },
    { Icon: User,          label: 'Mon profil',        href: `/profile/${user?.uid ?? ''}`, key: 'profile' },
    { Icon: FolderOpen,    label: 'Mes dossiers',      href: '#',                           key: 'dossiers', badge: pendingCount || null },
    { Icon: MessageSquare, label: 'Messagerie',        href: '/messages',                   key: 'messages', badge: unreadCount || null },
    { Icon: Scale,         label: 'OHADA IA',          href: '/ohada-ia',                   key: 'ia' },
    { Icon: Search,        label: 'Recherche',         href: '/search',                     key: 'search' },
    { Icon: BarChart2,     label: 'Statistiques',      href: '#',                           key: 'stats' },
    { Icon: CreditCard,    label: 'Abonnement',        href: '#',                           key: 'sub' },
    { Icon: Settings,      label: 'Paramètres',        href: '#',                           key: 'settings' },
  ]

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />

      {/* Modal dossier */}
      {selectedDossier && (
        <DossierModal
          dossier={selectedDossier}
          currentUserUid={user?.uid}
          onClose={() => setSelectedDossier(null)}
          onStatusChange={(id, newStatus) => {
            setSelectedDossier(null)
          }}
        />
      )}

      <div className="min-h-screen bg-gray-50 pt-16 flex">

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-y-auto">
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[60px] w-full rounded-xl" />
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}
                >
                  {user?.initials ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">{user?.name ?? '—'}</p>
                  <SubBadge plan={user?.plan ?? 'free'} />
                </div>
              </div>
            )}
          </div>

          <nav className="px-3 pb-4">
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-300 px-3 py-2">Principal</p>
            {SIDEBAR_ITEMS.slice(0, 4).map(({ Icon, label, href, key, badge }) => (
              <Link key={key} href={href}
                onClick={(e) => {
                  setActiveKey(key)
                  if (key === 'dossiers') { e.preventDefault(); setView('all-dossiers') }
                  else setView('dashboard')
                }}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all',
                  activeKey === key ? 'bg-gold-50 text-gold-700' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800'
                )}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="text-[10px] font-bold bg-gold-500 text-navy-900 px-1.5 py-0.5 rounded-full">{badge}</span>
                ) : null}
              </Link>
            ))}

            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-300 px-3 py-2 mt-2">Outils</p>
            {SIDEBAR_ITEMS.slice(4, 7).map(({ Icon, label, href, key }) => (
              <Link key={key} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-navy-800 transition-all">
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            ))}

            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-300 px-3 py-2 mt-2">Compte</p>
            {SIDEBAR_ITEMS.slice(7).map(({ Icon, label, href, key }) => (
              <Link key={key} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-navy-800 transition-all">
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-1"
            >
              <LogOut size={16} className="flex-shrink-0" />
              Déconnexion
            </button>
          </nav>
        </aside>

        {/* ── Main ─────────────────────────────────────── */}
        <main className="flex-1 md:ml-[240px] p-6 md:p-8">

          {/* Vue : tous les dossiers */}
          {view === 'all-dossiers' && (
            <AllDossiersView
              projects={projects}
              currentUserUid={user?.uid}
              onBack={() => { setView('dashboard'); setActiveKey('dash') }}
              onOpenDossier={setSelectedDossier}
            />
          )}

          {/* Vue : dashboard principal */}
          {view === 'dashboard' && (
            <>
              {/* Greeting */}
              {loading ? (
                <><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64 mb-6" /></>
              ) : (
                <>
                  <h1 className="font-display text-2xl font-bold text-navy-900">
                    Bonjour, {user?.name?.split(' ')[0] ?? 'vous'}
                  </h1>
                  <p className="text-sm text-gray-400 mb-6 mt-1">
                    {capitalize(today)} · {activeProjects.length} dossier{activeProjects.length > 1 ? 's' : ''} actif{activeProjects.length > 1 ? 's' : ''}
                    {pendingCount > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <AlertTriangle size={11} /> {pendingCount} en attente
                      </span>
                    )}
                  </p>
                </>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[108px] rounded-2xl" />)
                  : KPIS.map(({ Icon, val, label, change, up }) => (
                      <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <Icon size={20} className="mb-2 text-gray-400" />
                        <p className="font-display text-2xl font-bold text-navy-900">{val}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        <p className={clsx('text-xs font-semibold mt-1.5 flex items-center gap-0.5', up ? 'text-green-600' : 'text-red-500')}>
                          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {change}
                        </p>
                      </div>
                    ))
                }
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

                {/* Dossiers actifs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800">Dossiers actifs</h2>
                    <button
                      onClick={() => { setView('all-dossiers'); setActiveKey('dossiers') }}
                      className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-0.5"
                    >
                      Voir tout ({projects.length}) <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[100px] rounded-2xl" />)
                      : activeProjects.length === 0
                        ? (
                          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">
                            Aucun dossier actif pour le moment.
                          </div>
                        )
                        : activeProjects.map(p => {
                            const isExpert = p.expertId === user?.uid
                            return (
                              <div
                                key={p.id}
                                onClick={() => setSelectedDossier(p)}
                                className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-gold-300 hover:shadow-md transition-all"
                                style={{ boxShadow: 'var(--shadow-sm)' }}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-sm font-semibold text-navy-800 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {isExpert ? `Client : ${p.clientName}` : `Expert : ${p.expertName}`}
                                      {p.deadline && ` · Éch. ${p.deadline}`}
                                    </p>
                                  </div>
                                  <StatusPill status={p.status} />
                                </div>
                                <ProgressBar value={p.progress ?? 0} />
                                <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                                  <span>{p.progress ?? 0}% complété</span>
                                  {isExpert && p.status === 'pending' && (
                                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                                      <AlertTriangle size={10} /> Action requise
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                    }
                    <Link href="/search" className="btn-outline btn-sm w-fit inline-flex items-center gap-1.5">
                      + Nouveau dossier
                    </Link>
                  </div>

                  {/* Quick actions */}
                  <div className="mt-6">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Actions rapides</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {QUICK_ACTIONS.map(({ Icon, label, href }) => (
                        <Link key={label} href={href}
                          className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-gold-300 hover:shadow-sm transition-all cursor-pointer group"
                          style={{ boxShadow: 'var(--shadow-sm)' }}>
                          <div className="flex justify-center mb-2">
                            <Icon size={24} className="text-gray-400 group-hover:text-gold-600 group-hover:scale-110 transition-all" />
                          </div>
                          <p className="text-xs font-medium text-gray-600 group-hover:text-navy-800">{label}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notifications + Abonnement */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800">Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="text-xs font-semibold text-gold-600 bg-gold-100 px-2 py-0.5 rounded-full">
                        {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex gap-3 p-4 border-b border-gray-50 last:border-0">
                            <Skeleton className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3.5 w-full" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        ))
                      : notifications.length === 0
                        ? <div className="p-6 text-center text-sm text-gray-400">Aucune notification.</div>
                        : notifications.slice(0, 6).map((n) => (
                            <div key={n.id} className={clsx(
                              'flex gap-3 p-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 cursor-pointer',
                              n.unread && 'bg-gold-50/50'
                            )}>
                              <div className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', DOT_COLORS[n.dot] ?? 'bg-gray-300')} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-600 leading-snug">{n.text}</p>
                                <p className="text-xs text-gray-300 mt-1">{n.time}</p>
                              </div>
                              {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-2" />}
                            </div>
                          ))
                    }
                  </div>

                  {/* Abonnement */}
                  <div className="mt-4 rounded-2xl p-4 border border-gold-500/20" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <SubBadge plan={user?.plan ?? 'free'} />
                      <span className="text-xs text-white/40">Actif</span>
                    </div>
                    <p className="text-xs text-white/50 mb-3">Renouvellement le 15 fév. 2025</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        [String(kpis?.totalDossiers ?? projects.length), 'Missions'],
                        [String(kpis?.avgRating ?? '—'),                 'Note'],
                        ['98%',                                           'Succès'],
                      ].map(([v, l]) => (
                        <div key={l} className="text-center bg-white/[0.06] rounded-lg py-2">
                          <p className="font-display text-sm font-bold text-gold-400">{v}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{l}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2 rounded-xl border border-gold-500/30 text-gold-400 text-xs font-semibold hover:bg-gold-500/10 transition-all">
                      Gérer l'abonnement
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}
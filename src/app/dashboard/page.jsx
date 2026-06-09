'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, StatusBadge, ProgressBar } from '@/components/ui'
import { useDashboardData } from '@/lib/useDashboardData'
import { useCompanyDashboard } from '@/lib/useCompanyDashboard'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import clsx from 'clsx'
import {
  Home, User, FolderOpen, MessageSquare, Scale, Search,
  BarChart2, CreditCard, Settings, LogOut, Banknote, Star,
  Eye, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  Check, X, Clock, AlertTriangle, CheckCircle2, Filter,
  ArrowUpDown, Loader2, FileText, Send, MapPin, Calendar,
  DollarSign, Shield, MoreHorizontal, RefreshCw,
  ShieldCheck, Bell, Gavel, BookOpen, Building2, Sparkles,
  AlertCircle, TrendingUp as Trending, Activity,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   COMPOSANTS PARTAGÉS
══════════════════════════════════════════════════════════════ */
function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-gray-100 rounded-lg', className)} />
}

const DOT_COLORS = {
  gold:  'bg-gold-500',
  green: 'bg-green-500',
  navy:  'bg-navy-400',
  red:   'bg-red-500',
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD ENTREPRISE
══════════════════════════════════════════════════════════════ */

// ── Jauge de conformité (SVG arc) ────────────────────────────
function ConformityGauge({ score, loading }) {
  if (loading) return <Skeleton className="h-[180px] w-full rounded-2xl" />

  const pct    = score ?? 0
  const color  = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const label  = pct >= 80 ? 'Conforme' : pct >= 50 ? 'À améliorer' : 'Critique'

  // Arc SVG : demi-cercle de 180° → cx=100,cy=100,r=80
  const R       = 80
  const cx      = 100
  const cy      = 100
  const total   = Math.PI * R               // longueur demi-cercle
  const filled  = (pct / 100) * total
  const gap     = total - filled

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <p className="text-[11px] font-bold tracking-widest uppercase text-gray-300 mb-3">Score de conformité</p>
      <div className="relative w-[160px] h-[90px] overflow-hidden">
        <svg viewBox="0 0 200 105" className="w-full">
          {/* Fond */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none" stroke="#f3f4f6" strokeWidth="18" strokeLinecap="round"
          />
          {/* Rempli */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <p className="font-display text-3xl font-bold" style={{ color }}>{score !== null ? `${pct}` : '—'}</p>
          <p className="text-[11px] font-semibold text-gray-400">{score !== null ? '/100' : 'Aucun indicateur'}</p>
        </div>
      </div>
      <span className="mt-2 text-[12px] font-bold px-3 py-1 rounded-full"
        style={{ background: `${color}18`, color }}>
        {score !== null ? label : 'À configurer'}
      </span>
    </div>
  )
}

// ── Carte KPI conformité ──────────────────────────────────────
function ComplianceKpiCard({ icon: Icon, value, label, sub, color, loading }) {
  if (loading) return <Skeleton className="h-[100px] rounded-2xl" />
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center mb-2', color.bg)}>
        <Icon size={16} className={color.text} />
      </div>
      <p className="font-display text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
      {sub && <p className={clsx('text-[11px] font-semibold mt-1', color.text)}>{sub}</p>}
    </div>
  )
}

// ── Badge statut KPI ─────────────────────────────────────────
const KPI_STATUS = {
  compliant: { label: 'Conforme',  bg: 'bg-green-50  border-green-200',  text: 'text-green-700',  Icon: CheckCircle2 },
  late:      { label: 'En retard', bg: 'bg-red-50    border-red-200',    text: 'text-red-700',    Icon: AlertTriangle },
  upcoming:  { label: 'À venir',   bg: 'bg-amber-50  border-amber-200',  text: 'text-amber-700',  Icon: Clock },
  pending:   { label: 'À valider', bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-700',   Icon: Clock },
}

function KpiStatusBadge({ status }) {
  const cfg = KPI_STATUS[status] ?? KPI_STATUS.pending
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.bg, cfg.text)}>
      <cfg.Icon size={10} /> {cfg.label}
    </span>
  )
}

// ── Criticité (étoiles) ───────────────────────────────────────
function Criticality({ value = 1 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={9} className={n <= value ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ icon: Icon, title, desc, cta, ctaHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
      <Icon size={32} className="text-gray-200 mb-3" />
      <p className="font-semibold text-navy-700 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-4 max-w-[220px]">{desc}</p>
      {cta && (
        <Link href={ctaHref ?? '#'} className="btn-gold btn-sm inline-flex items-center gap-1.5">
          {cta}
        </Link>
      )}
    </div>
  )
}

// ── Dashboard Entreprise ──────────────────────────────────────
function EnterpriseDashboard() {
  const router = useRouter()
  const { user, complianceKpis, score, workflowItems, alerts, notifications, loading, error, stats, urgentKpis } = useCompanyDashboard()
  const [activeKey, setActiveKey] = useState('dash')

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

  async function handleLogout() {
    await signOut(auth)
    router.push('/')
  }

  const SIDEBAR_ITEMS = [
    { Icon: Home,         label: 'Tableau de bord',   href: '/dashboard',        key: 'dash' },
    { Icon: ShieldCheck,  label: 'Conformité',         href: '/conformite',       key: 'conformite',  badge: stats.lateCount || null },
    { Icon: Gavel,        label: 'Workflow juridique', href: '/workflow',          key: 'workflow',    badge: stats.workflowPendingCount || null },
    { Icon: BookOpen,     label: 'Veille juridique',   href: '/veille',            key: 'veille' },
    { Icon: Bell,         label: 'Alertes',            href: '/alertes',           key: 'alertes',     badge: stats.unreadAlerts || null },
    { Icon: FolderOpen,   label: 'Documents',          href: '/documents',         key: 'docs' },
    { Icon: Scale,        label: 'OHADA IA',           href: '/ohada-ia',          key: 'ia' },
    { Icon: Search,       label: 'Legal Marketplace',  href: '/marketplace',       key: 'marketplace' },
    { Icon: MessageSquare, label: 'Messagerie',        href: '/messages',          key: 'messages',    badge: stats.unreadNotifs || null },
    { Icon: CreditCard,   label: 'Abonnement',         href: '#',                  key: 'sub' },
    { Icon: Settings,     label: 'Paramètres',         href: '#',                  key: 'settings' },
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
      <div className="min-h-screen bg-gray-50 pt-16 flex">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-y-auto">
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[60px] w-full rounded-xl" />
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
                  {user?.initials ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-navy-800 truncate">{user?.company || user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate capitalize">{user?.plan}</p>
                </div>
              </div>
            )}
          </div>

          <nav className="px-3 pb-4">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 px-3 py-2">Principal</p>
            {SIDEBAR_ITEMS.slice(0, 2).map(({ Icon, label, href, key, badge }) => (
              <Link key={key} href={href}
                onClick={() => setActiveKey(key)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all',
                  activeKey === key ? 'bg-gold-50 text-gold-700' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800'
                )}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge ? <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{badge}</span> : null}
              </Link>
            ))}

            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 px-3 py-2 mt-2">Modules</p>
            {SIDEBAR_ITEMS.slice(2, 9).map(({ Icon, label, href, key, badge }) => (
              <Link key={key} href={href}
                onClick={() => setActiveKey(key)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all',
                  activeKey === key ? 'bg-gold-50 text-gold-700' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800'
                )}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge ? <span className="text-[10px] font-bold bg-gold-500 text-navy-900 px-1.5 py-0.5 rounded-full">{badge}</span> : null}
              </Link>
            ))}

            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 px-3 py-2 mt-2">Compte</p>
            {SIDEBAR_ITEMS.slice(9).map(({ Icon, label, href, key }) => (
              <Link key={key} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-navy-800 transition-all">
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            ))}

            <button onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-1">
              <LogOut size={16} className="flex-shrink-0" />
              Déconnexion
            </button>
          </nav>
        </aside>

        {/* ── Contenu principal ─────────────────────────────────────── */}
        <main className="flex-1 md:ml-[240px] p-6 md:p-8">

          {/* Greeting */}
          {loading ? (
            <><Skeleton className="h-8 w-56 mb-2" /><Skeleton className="h-4 w-72 mb-6" /></>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Bonjour, {user?.name?.split(' ')[0] ?? 'vous'}
              </h1>
              <p className="text-sm text-gray-400 mb-6 mt-1 flex items-center gap-3 flex-wrap">
                <span>{capitalize(today)}</span>
                {stats.lateCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs">
                    <AlertTriangle size={12} /> {stats.lateCount} obligation{stats.lateCount > 1 ? 's' : ''} en retard
                  </span>
                )}
                {stats.workflowPendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs">
                    <Clock size={12} /> {stats.workflowPendingCount} dossier{stats.workflowPendingCount > 1 ? 's' : ''} en attente
                  </span>
                )}
              </p>
            </>
          )}

          {/* ── Ligne 1 : Jauge + 4 KPIs ──────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 mb-6">
            <ConformityGauge score={score} loading={loading} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ComplianceKpiCard loading={loading} icon={Activity}      value={stats.totalKpis}     label="Indicateurs total"   sub={stats.totalKpis === 0 ? 'À créer' : null}   color={{ bg: 'bg-navy-50',   text: 'text-navy-600' }} />
              <ComplianceKpiCard loading={loading} icon={CheckCircle2}  value={stats.compliantCount} label="Conformes"            sub={stats.totalKpis > 0 ? `${Math.round((stats.compliantCount / stats.totalKpis) * 100)}%` : null} color={{ bg: 'bg-green-50',  text: 'text-green-600' }} />
              <ComplianceKpiCard loading={loading} icon={AlertTriangle} value={stats.lateCount}      label="En retard"            sub={stats.lateCount > 0 ? 'Action requise' : 'Aucun'}  color={{ bg: 'bg-red-50',    text: 'text-red-600' }} />
              <ComplianceKpiCard loading={loading} icon={Clock}         value={stats.upcomingCount}  label="Échéances à venir"    sub="30 prochains jours"                                color={{ bg: 'bg-amber-50',  text: 'text-amber-600' }} />
            </div>
          </div>

          {/* ── Ligne 2 : Indicateurs + Panneau droit ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

            {/* ── Indicateurs urgents ─────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-navy-800">Indicateurs à traiter</h2>
                <Link href="/conformite" className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-0.5">
                  Voir tout ({stats.totalKpis}) <ChevronRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-[80px] rounded-2xl" />)}
                </div>
              ) : urgentKpis.length === 0 ? (
                score === null ? (
                  <EmptyState
                    icon={ShieldCheck}
                    title="Aucun indicateur configuré"
                    desc="Ajoutez vos premières obligations légales pour suivre la conformité de votre entreprise."
                    cta="+ Ajouter un indicateur"
                    ctaHref="/conformite"
                  />
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Tout est en ordre</p>
                      <p className="text-sm text-green-600 mt-0.5">Aucune obligation en retard ni échéance imminente.</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-3">
                  {urgentKpis.map(kpi => (
                    <div key={kpi.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-300 hover:shadow-sm transition-all cursor-pointer"
                      style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <KpiStatusBadge status={kpi.status} />
                            <Criticality value={kpi.criticality ?? 1} />
                          </div>
                          <p className="text-sm font-semibold text-navy-800 truncate">{kpi.title}</p>
                          {kpi.dueDate && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Calendar size={10} /> Échéance : {kpi.dueDate}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {kpi.status === 'late' && (
                            <Link href="/marketplace"
                              className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 whitespace-nowrap flex items-center gap-1">
                              Trouver un expert <ChevronRight size={11} />
                            </Link>
                          )}
                          <Link href="/conformite"
                            className="text-[11px] text-gray-400 hover:text-navy-800 transition-colors">
                            Voir détail →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/conformite" className="btn-outline btn-sm w-fit inline-flex items-center gap-1.5">
                    + Gérer la conformité
                  </Link>
                </div>
              )}

              {/* ── Actions rapides ─────────────────────────────── */}
              <div className="mt-6">
                <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Actions rapides</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { Icon: Scale,       label: 'Consultation IA',   href: '/ohada-ia',    color: 'text-gold-600' },
                    { Icon: Gavel,       label: 'Nouveau dossier',   href: '/workflow',    color: 'text-navy-600' },
                    { Icon: BookOpen,    label: 'Veille juridique',  href: '/veille',      color: 'text-blue-600' },
                    { Icon: FolderOpen,  label: 'Mes documents',     href: '/documents',   color: 'text-green-600' },
                  ].map(({ Icon, label, href, color }) => (
                    <Link key={label} href={href}
                      className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-gold-300 hover:shadow-sm transition-all group"
                      style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <div className="flex justify-center mb-2">
                        <Icon size={22} className={clsx(color, 'group-hover:scale-110 transition-transform')} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 group-hover:text-navy-800">{label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Panneau droit : Alertes + Workflow + Abonnement ─ */}
            <div className="flex flex-col gap-4">

              {/* Alertes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-base font-semibold text-navy-800">Alertes</h2>
                  {stats.unreadAlerts > 0 && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {stats.unreadAlerts} non lue{stats.unreadAlerts > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  {loading ? (
                    [1,2].map(i => (
                      <div key={i} className="flex gap-3 p-4 border-b border-gray-50 last:border-0">
                        <Skeleton className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3 w-20" /></div>
                      </div>
                    ))
                  ) : alerts.length === 0 ? (
                    <div className="p-5 text-center text-sm text-gray-400">
                      <Bell size={20} className="mx-auto mb-2 opacity-30" />
                      Aucune alerte en attente
                    </div>
                  ) : alerts.slice(0, 4).map(alert => (
                    <div key={alert.id} className="flex gap-3 p-4 border-b border-gray-50 last:border-0 bg-red-50/40">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">{alert.text ?? alert.title}</p>
                        <p className="text-xs text-gray-300 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow en attente */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-base font-semibold text-navy-800">Workflow</h2>
                  {stats.workflowPendingCount > 0 && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {stats.workflowPendingCount} en attente
                    </span>
                  )}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  {loading ? (
                    <div className="p-4"><Skeleton className="h-16 w-full" /></div>
                  ) : workflowItems.length === 0 ? (
                    <div className="p-5 text-center text-sm text-gray-400">
                      <Gavel size={20} className="mx-auto mb-2 opacity-30" />
                      Aucun dossier en attente
                    </div>
                  ) : workflowItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
                      <div className="w-1.5 h-8 rounded-full bg-amber-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-800 truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{item.status === 'revision' ? 'Correction demandée' : 'En attente de révision'}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                    </div>
                  ))}
                </div>
                <Link href="/workflow" className="btn-outline btn-sm w-full justify-center mt-2 inline-flex">
                  Voir le workflow
                </Link>
              </div>

              {/* Abonnement */}
              <div className="rounded-2xl p-4 border border-gold-500/20" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold tracking-widest uppercase text-gold-400">Abonnement</p>
                  <span className="text-xs font-bold text-gold-400 capitalize">{user?.plan ?? '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    [String(stats.totalKpis),   'Indicateurs'],
                    [String(stats.compliantCount), 'Conformes'],
                    [`${score ?? '—'}%`,            'Score'],
                  ].map(([v, l]) => (
                    <div key={l} className="text-center bg-white/[0.06] rounded-lg py-2">
                      <p className="font-display text-sm font-bold text-gold-400">{v}</p>
                      <p className="text-xs text-white/70 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 rounded-xl border border-gold-500/30 text-gold-400 text-xs font-semibold hover:bg-gold-500/10 transition-all">
                  Gérer l'abonnement
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD EXPERT (refactorisé depuis l'ancien dashboard)
══════════════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200',  Icon: Clock },
  active:    { label: 'En cours',    color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200',   Icon: RefreshCw },
  completed: { label: 'Terminé',     color: 'text-green-600',  bg: 'bg-green-50  border-green-200',  Icon: CheckCircle2 },
  rejected:  { label: 'Refusé',      color: 'text-red-600',    bg: 'bg-red-50    border-red-200',    Icon: X },
  cancelled: { label: 'Annulé',      color: 'text-gray-500',   bg: 'bg-gray-50   border-gray-200',   Icon: X },
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', cfg.bg, cfg.color)}>
      <cfg.Icon size={10} /> {cfg.label}
    </span>
  )
}

function ExpertDashboard() {
  const router = useRouter()
  const [activeKey, setActiveKey] = useState('dash')
  const [view, setView] = useState('dashboard')
  const [selectedDossier, setSelectedDossier] = useState(null)
  const { user, projects, notifications, kpis, loading, error } = useDashboardData()

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

  async function handleLogout() {
    await signOut(auth)
    router.push('/')
  }

  const unreadCount    = notifications.filter(n => n.unread).length
  const pendingCount   = projects.filter(p => p.status === 'pending').length
  const activeProjects = projects.filter(p => ['active', 'pending'].includes(p.status)).slice(0, 3)

  const KPIS = kpis ? [
    { Icon: FolderOpen, val: String(kpis.totalDossiers ?? projects.length), label: 'Dossiers total',    change: '+8 ce mois', up: true },
    { Icon: Banknote,   val: kpis.revenueMonth,                             label: 'XOF ce mois',      change: kpis.revenueChange, up: true },
    { Icon: Star,       val: String(kpis.avgRating),                        label: 'Note moyenne',      change: 'Stable', up: true },
    { Icon: Eye,        val: String(kpis.profileViews),                     label: 'Vues profil (30j)', change: kpis.viewsChange, up: true },
  ] : []

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
      <div className="min-h-screen bg-gray-50 pt-16 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-y-auto">
          <div className="p-4">
            {loading ? <Skeleton className="h-[60px] w-full rounded-xl" /> : (
              <div className="flex items-center gap-2.5 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
                  {user?.initials ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">{user?.name ?? '—'}</p>
                  <SubBadge plan={user?.plan ?? 'starter'} />
                </div>
              </div>
            )}
          </div>
          <nav className="px-3 pb-4">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 px-3 py-2">Principal</p>
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
                {badge ? <span className="text-[10px] font-bold bg-gold-500 text-navy-900 px-1.5 py-0.5 rounded-full">{badge}</span> : null}
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
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 px-3 py-2 mt-2">Compte</p>
            {SIDEBAR_ITEMS.slice(7).map(({ Icon, label, href, key }) => (
              <Link key={key} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-navy-800 transition-all">
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-1">
              <LogOut size={16} className="flex-shrink-0" />
              Déconnexion
            </button>
          </nav>
        </aside>

        <main className="flex-1 md:ml-[240px] p-6 md:p-8">
          {view === 'dashboard' && (
            <>
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

              {/* KPIs expert */}
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
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800">Dossiers actifs</h2>
                    <button onClick={() => { setView('all-dossiers'); setActiveKey('dossiers') }}
                      className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-0.5">
                      Voir tout ({projects.length}) <ChevronRight size={13} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[100px] rounded-2xl" />)
                      : activeProjects.length === 0
                        ? <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">Aucun dossier actif.</div>
                        : activeProjects.map(p => (
                          <div key={p.id} onClick={() => setSelectedDossier(p)}
                            className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-gold-300 hover:shadow-md transition-all"
                            style={{ boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-sm font-semibold text-navy-800 truncate">{p.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{p.client}{p.deadline && ` · Éch. ${p.deadline}`}</p>
                              </div>
                              <StatusPill status={p.status} />
                            </div>
                            <ProgressBar value={p.progress ?? 0} />
                            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                              <span>{p.progress ?? 0}% complété</span>
                            </div>
                          </div>
                        ))
                    }
                    <Link href="/search" className="btn-outline btn-sm w-fit inline-flex items-center gap-1.5">+ Nouveau dossier</Link>
                  </div>

                  <div className="mt-6">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Actions rapides</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { Icon: Search, label: 'Trouver un expert', href: '/search' },
                        { Icon: MessageSquare, label: 'Messagerie', href: '/messages' },
                        { Icon: Scale, label: 'OHADA IA', href: '/ohada-ia' },
                        { Icon: BarChart2, label: 'Statistiques', href: '#' },
                      ].map(({ Icon, label, href }) => (
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
                          <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3 w-20" /></div>
                        </div>
                      ))
                      : notifications.length === 0
                        ? <div className="p-6 text-center text-sm text-gray-400">Aucune notification.</div>
                        : notifications.slice(0, 6).map(n => (
                          <div key={n.id} className={clsx('flex gap-3 p-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 cursor-pointer', n.unread && 'bg-gold-50/50')}>
                            <div className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', DOT_COLORS[n.dot] ?? 'bg-gray-300')} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-600 leading-snug">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                            {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-2" />}
                          </div>
                        ))
                    }
                  </div>

                  <div className="mt-4 rounded-2xl p-4 border border-gold-500/20" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <SubBadge plan={user?.plan ?? 'starter'} />
                      <span className="text-xs text-white/70">Actif</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        [String(kpis?.totalDossiers ?? projects.length), 'Missions'],
                        [String(kpis?.avgRating ?? '—'), 'Note'],
                        ['98%', 'Succès'],
                      ].map(([v, l]) => (
                        <div key={l} className="text-center bg-white/[0.06] rounded-lg py-2">
                          <p className="font-display text-sm font-bold text-gold-400">{v}</p>
                          <p className="text-xs text-white/70 mt-0.5">{l}</p>
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

/* ══════════════════════════════════════════════════════════════
   ROUTEUR — détecte accountType et affiche le bon dashboard
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [accountType, setAccountType] = useState(null)
  const [checked,     setChecked]     = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setAccountType('expert'); setChecked(true); return }
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        const type = snap.exists() ? (snap.data().accountType ?? 'expert') : 'expert'
        setAccountType(type)
      } catch {
        setAccountType('expert')
      }
      setChecked(true)
    })
    return unsub
  }, [])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold-500" />
      </div>
    )
  }

  if (accountType === 'company') return <EnterpriseDashboard />
  return <ExpertDashboard />
}

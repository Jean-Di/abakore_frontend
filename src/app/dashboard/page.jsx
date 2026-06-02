'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, StatusBadge, ProgressBar } from '@/components/ui'
import { useDashboardData } from '@/lib/useDashboardData'
import clsx from 'clsx'
import {
  Home, User, FolderOpen, MessageSquare, Scale, Search,
  BarChart2, CreditCard, Settings, LogOut, Banknote, Star,
  Eye, TrendingUp, TrendingDown, ChevronRight, Loader2,
} from 'lucide-react'

/* ── Constantes statiques ───────────────────────────────── */

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

/* ── Skeleton loader ────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={clsx('animate-pulse bg-gray-100 rounded-lg', className)} />
}

/* ── Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const [activeKey, setActiveKey] = useState('dash')
  const { user, projects, notifications, kpis, loading, error } = useDashboardData()

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  // KPIs dynamiques depuis Firestore
  const KPIS = kpis ? [
    { Icon: FolderOpen, val: String(kpis.totalDossiers), label: 'Dossiers total',    change: '+8 ce mois',       up: true },
    { Icon: Banknote,   val: kpis.revenueMonth,          label: 'FCFA ce mois',      change: kpis.revenueChange, up: true },
    { Icon: Star,       val: String(kpis.avgRating),     label: 'Note moyenne',      change: 'Stable',           up: true },
    { Icon: Eye,        val: String(kpis.profileViews),  label: 'Vues profil (30j)', change: kpis.viewsChange,   up: true },
  ] : []

  const unreadCount = notifications.filter(n => n.unread).length

  /* ── Error state ──────────────────────────────────────── */
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


  const SIDEBAR_ITEMS = [
  { Icon: Home,          label: 'Tableau de bord',   href: '/dashboard',           key: 'dash' },
  { Icon: User,          label: 'Mon profil',         href: `/profile/${user?.uid ?? ''}`, key: 'profile' },
  { Icon: FolderOpen,    label: 'Mes dossiers',       href: '#',                    key: 'dossiers', badge: 3 },
  { Icon: MessageSquare, label: 'Messagerie',         href: '/messages',            key: 'messages', badge: 5 },
  { Icon: Scale,         label: 'OHADA IA',           href: '/ohada-ia',            key: 'ia' },
  { Icon: Search,        label: 'Recherche',          href: '/search',              key: 'search' },
  { Icon: BarChart2,     label: 'Statistiques',       href: '#',                    key: 'stats' },
  { Icon: CreditCard,    label: 'Abonnement',         href: '#',                    key: 'sub' },
  { Icon: Settings,      label: 'Paramètres',         href: '#',                    key: 'settings' },
]


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16 flex">

        {/* ── Sidebar ───────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-y-auto">
          {/* User card */}
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
                onClick={() => setActiveKey(key)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all',
                  activeKey === key ? 'bg-gold-50 text-gold-700' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800'
                )}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[10px] font-bold bg-gold-500 text-navy-900 px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
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

            <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-1">
              <LogOut size={16} className="flex-shrink-0" />
              Déconnexion
            </button>
          </nav>
        </aside>

        {/* ── Main content ──────────────────────────────── */}
        <main className="flex-1 md:ml-[240px] p-6 md:p-8">

          {/* Greeting */}
          {loading ? (
            <>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-6" />
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Bonjour, {user?.name?.split(' ')[0] ?? 'vous'}
              </h1>
              <p className="text-sm text-gray-400 mb-6 mt-1">
                {capitalize(today)} · {projects.length} dossier{projects.length > 1 ? 's' : ''} actif{projects.length > 1 ? 's' : ''}
              </p>
            </>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[108px] rounded-2xl" />
                ))
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

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-navy-800">Dossiers actifs</h2>
                <button className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-0.5">
                  Voir tout <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[100px] rounded-2xl" />)
                  : projects.length === 0
                    ? (
                      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">
                        Aucun dossier actif pour le moment.
                      </div>
                    )
                    : projects.map(p => (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-navy-800">{p.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{p.client} · Échéance : {p.deadline}</p>
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                          <ProgressBar value={p.progress} />
                          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                            <span>{p.progress}% complété</span>
                            <span>Éch. {p.deadline}</span>
                          </div>
                        </div>
                      ))
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

            {/* Notifications + Subscription */}
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
                    ? (
                      <div className="p-6 text-center text-sm text-gray-400">
                        Aucune notification.
                      </div>
                    )
                    : notifications.map((n) => (
                        <div key={n.id} className={clsx(
                          'flex gap-3 p-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 cursor-pointer',
                          n.unread && 'bg-gold-50/50'
                        )}>
                          <div className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', DOT_COLORS[n.dot])} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 leading-snug">{n.text}</p>
                            <p className="text-xs text-gray-300 mt-1">{n.time}</p>
                          </div>
                          {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-2" />}
                        </div>
                      ))
                }
              </div>

              {/* Subscription card */}
              <div className="mt-4 rounded-2xl p-4 border border-gold-500/20" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)' }}>
                <div className="flex items-center justify-between mb-3">
                  <SubBadge plan={user?.plan ?? 'free'} />
                  <span className="text-xs text-white/40">Actif</span>
                </div>
                <p className="text-xs text-white/50 mb-3">Renouvellement le 15 fév. 2025</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    [String(kpis?.totalDossiers ?? '—'), 'Missions'],
                    [String(kpis?.avgRating     ?? '—'), 'Note'],
                    ['98%',                               'Succès'],
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
        </main>
      </div>
    </>
  )
}
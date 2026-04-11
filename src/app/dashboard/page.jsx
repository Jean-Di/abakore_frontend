'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, StatusBadge, ProgressBar } from '@/components/ui'
import { PROJECTS, NOTIFICATIONS, CURRENT_USER } from '@/lib/data'
import clsx from 'clsx'

const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Tableau de bord',  href: '/dashboard',   key: 'dash' },
  { icon: '👤', label: 'Mon profil',        href: '/profile/kofi-asante', key: 'profile' },
  { icon: '📋', label: 'Mes dossiers',      href: '#',            key: 'dossiers', badge: 3 },
  { icon: '💬', label: 'Messagerie',        href: '/messages',    key: 'messages', badge: 5 },
  { icon: '⚖',  label: 'OHADA IA',         href: '#',            key: 'ia' },
  { icon: '🔍', label: 'Recherche',         href: '/search',      key: 'search' },
  { icon: '📊', label: 'Statistiques',      href: '#',            key: 'stats' },
  { icon: '💳', label: 'Abonnement',        href: '#',            key: 'sub' },
  { icon: '⚙',  label: 'Paramètres',       href: '#',            key: 'settings' },
]

const KPIS = [
  { icon: '📋', val: '127',   label: 'Dossiers total',   change: '+8 ce mois',  up: true },
  { icon: '💰', val: '4.2M',  label: 'FCFA ce mois',     change: '+18%',         up: true },
  { icon: '⭐', val: '4.9',   label: 'Note moyenne',     change: 'Stable',       up: true },
  { icon: '👁', val: '1 240', label: 'Vues profil (30j)', change: '+34%',         up: true },
]

const DOT_COLORS = {
  gold:  'bg-gold-500',
  green: 'bg-green-500',
  navy:  'bg-navy-400',
}

export default function DashboardPage() {
  const [activeKey, setActiveKey] = useState('dash')

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16 flex">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-y-auto">
          {/* User card */}
          <div className="p-4">
            <div className="flex items-center gap-2.5 p-3 bg-gold-50 border border-gold-200 rounded-xl">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
                {CURRENT_USER.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-800 truncate">{CURRENT_USER.name}</p>
                <SubBadge plan={CURRENT_USER.plan} />
              </div>
            </div>
          </div>

          <nav className="px-3 pb-4">
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-300 px-3 py-2">Principal</p>
            {SIDEBAR_ITEMS.slice(0, 4).map(item => (
              <Link key={item.key} href={item.href}
                onClick={() => setActiveKey(item.key)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all',
                  activeKey === item.key ? 'bg-gold-50 text-gold-700' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800'
                )}>
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-gold-500 text-navy-900 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}
              </Link>
            ))}

            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-300 px-3 py-2 mt-2">Outils</p>
            {SIDEBAR_ITEMS.slice(4, 7).map(item => (
              <Link key={item.key} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-navy-800 transition-all">
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-300 px-3 py-2 mt-2">Compte</p>
            {SIDEBAR_ITEMS.slice(7).map(item => (
              <Link key={item.key} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-navy-800 transition-all">
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-1">
              <span className="text-base w-5 text-center">🚪</span>
              Déconnexion
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-[240px] p-6 md:p-8">
          {/* Greeting */}
          <h1 className="font-display text-2xl font-bold text-navy-900">Bonjour, Kofi 👋</h1>
          <p className="text-sm text-gray-400 mb-6 mt-1">Lundi 20 janvier 2025 · 3 dossiers actifs</p>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {KPIS.map(({ icon, val, label, change, up }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="text-xl mb-2">{icon}</div>
                <p className="font-display text-2xl font-bold text-navy-900">{val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                <p className={clsx('text-xs font-semibold mt-1.5', up ? 'text-green-600' : 'text-red-500')}>
                  {up ? '↑' : '↓'} {change}
                </p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-navy-800">Dossiers actifs</h2>
                <button className="text-xs font-semibold text-gold-600 hover:text-gold-700">Voir tout →</button>
              </div>
              <div className="flex flex-col gap-3">
                {PROJECTS.map(p => (
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
                ))}
                <Link href="/search" className="btn-outline btn-sm w-fit">
                  + Nouveau dossier
                </Link>
              </div>

              {/* Quick actions */}
              <div className="mt-6">
                <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Actions rapides</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: '🔍', label: 'Trouver un expert',     href: '/search' },
                    { icon: '💬', label: 'Messagerie',             href: '/messages' },
                    { icon: '⚖',  label: 'OHADA IA',              href: '#' },
                    { icon: '📊', label: 'Mes statistiques',       href: '#' },
                  ].map(a => (
                    <Link key={a.label} href={a.href}
                      className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-gold-300 hover:shadow-sm transition-all cursor-pointer group"
                      style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{a.icon}</div>
                      <p className="text-xs font-medium text-gray-600 group-hover:text-navy-800">{a.label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-navy-800">Notifications</h2>
                <span className="text-xs font-semibold text-gold-600 bg-gold-100 px-2 py-0.5 rounded-full">2 nouvelles</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                {NOTIFICATIONS.map((n, i) => (
                  <div key={n.id} className={clsx(
                    'flex gap-3 p-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 cursor-pointer',
                    n.unread && 'bg-gold-50/50'
                  )}>
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', DOT_COLORS[n.dot])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 leading-snug" dangerouslySetInnerHTML={{ __html: n.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      <p className="text-xs text-gray-300 mt-1">{n.time}</p>
                    </div>
                    {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-2" />}
                  </div>
                ))}
              </div>

              {/* Subscription card */}
              <div className="mt-4 rounded-2xl p-4 border border-gold-500/20" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)' }}>
                <div className="flex items-center justify-between mb-3">
                  <SubBadge plan="premium" />
                  <span className="text-xs text-white/40">Actif</span>
                </div>
                <p className="text-xs text-white/50 mb-3">Renouvellement le 15 fév. 2025</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['127', 'Missions'], ['4.9★', 'Note'], ['98%', 'Succès']].map(([v, l]) => (
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

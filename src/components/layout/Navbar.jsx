'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu, X, MessageSquare, Sparkles, LogOut, User, Settings, ChevronDown, LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'
import logo from '../../assets/logo.jpeg'

// ─── Firebase ────────────────────────────────────────────────────────────────
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import Image from 'next/image'

// ─── Nav links ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/search', label: 'Rechercher' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/messages', label: 'Messagerie' },
  { href: '/#pricing', label: 'Tarifs' },
]

// ─── Avatar initiales ────────────────────────────────────────────────────────
function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email?.[0]?.toUpperCase() ?? '?'
}

// ─── Composant Avatar ────────────────────────────────────────────────────────
function Avatar({ user, profile, size = 8 }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName ?? 'Avatar'}
        className={clsx(`w-${size} h-${size} rounded-full object-cover ring-2 ring-gold-500/40`)}
      />
    )
  }
  return (
    <div className={clsx(
      `w-${size} h-${size} rounded-full flex items-center justify-center`,
      'bg-gradient-to-br from-gold-500 to-gold-600 text-navy-900 font-bold ring-2 ring-gold-500/40',
      size <= 8 ? 'text-xs' : 'text-sm',
    )}>
      {getInitials(user?.displayName ?? profile?.firstName + ' ' + profile?.lastName, user?.email)}
    </div>
  )
}

// ─── Badge statut ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (!status) return null
  const cfg = {
    active: { label: 'Actif', cls: 'bg-green-500/15 text-green-400' },
    pending: { label: 'En attente', cls: 'bg-amber-500/15 text-amber-400' },
    banned: { label: 'Suspendu', cls: 'bg-red-500/15 text-red-400' },
  }
  const { label, cls } = cfg[status] ?? cfg.pending
  return <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', cls)}>{label}</span>
}

// ─── Dropdown menu utilisateur ───────────────────────────────────────────────
function UserMenu({ user, profile, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Fermer en cliquant dehors
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayName = user?.displayName
    ?? (profile ? `${profile.firstName} ${profile.lastName}` : null)
    ?? user?.email

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all',
          'hover:bg-white/[0.08]',
          open && 'bg-white/[0.08]',
        )}
      >
        <Avatar user={user} profile={profile} size={8} />
        <span className="hidden md:block text-[13px] font-medium text-white/80 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown size={13} className={clsx('hidden md:block text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-navy-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* En-tête profil */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
            <Avatar user={user} profile={profile} size={10} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-white/65 truncate">{user?.email}</p>
              {profile?.status && (
                <div className="mt-1"><StatusBadge status={profile.status} /></div>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <MenuItem href="/dashboard" icon={LayoutDashboard} label="Tableau de bord" onClick={() => setOpen(false)} />
            <MenuItem href="/profile" icon={User} label="Mon profil" onClick={() => setOpen(false)} />
            <MenuItem href="/settings" icon={Settings} label="Paramètres" onClick={() => setOpen(false)} />
          </div>

          {/* Déconnexion */}
          <div className="p-1.5 border-t border-white/[0.07]">
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-[13px] font-medium"
            >
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-all text-[13px] font-medium"
    >
      <Icon size={14} className="flex-shrink-0" /> {label}
    </Link>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auth state
  const [authUser, setAuthUser] = useState(undefined) // undefined = loading, null = non connecté
  const [profile, setProfile] = useState(null)
  const [unreadMessages, setUnreadMessages] = useState(false)

  // Scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Écoute l'état d'authentification Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, firebaseUser => {
      setAuthUser(firebaseUser ?? null)
      if (!firebaseUser) { setProfile(null); return }

      // Écoute le profil Firestore en temps réel
      const unsubProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), snap => {
        setProfile(snap.exists() ? snap.data() : null)
      })
      return unsubProfile
    })
    return unsub
  }, [])

  async function handleLogout() {
    await signOut(auth)
    router.push('/')
  }

  const isLoading = authUser === undefined

  return (
    <>
      <nav className={clsx(
        'fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-8',
        'bg-navy-900 border-b border-gold-500/15 transition-all duration-300',
        scrolled && 'shadow-lg shadow-black/30',
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image
            src={logo}
            alt="logo abakore"
            className="w-10 h-10 rounded-lg"
          />
          <span className="font-display text-lg font-bold text-gold-500">Abakoré</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={clsx('nav-link', pathname === href && 'nav-link-active')}>
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">

          {/* Skeleton loading */}
          {isLoading && (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          )}

          {/* ── Utilisateur connecté ── */}
          {!isLoading && authUser && (
            <>
              {/* Notifications */}
              <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.07] transition-all relative">
                <Bell size={16} />
                {/* Décommenter pour activer le badge de notif */}
                {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /> */}
              </button>

              {/* Messages */}
              <Link
                href="/messages"
                className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.07] transition-all relative"
              >
                <MessageSquare size={16} />
                {unreadMessages && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
                )}
              </Link>

              {/* Dropdown utilisateur */}
              <UserMenu user={authUser} profile={profile} onLogout={handleLogout} />
            </>
          )}

          {/* ── Non connecté ── */}
          {!isLoading && !authUser && (
            <>
              <Link href="/auth/login" className="btn-ghost hidden md:inline-flex">Connexion</Link>
              <Link href="/auth/register" className="btn-gold btn-sm hidden md:inline-flex items-center gap-1.5">
                <Sparkles size={12} /> S'inscrire
              </Link>
            </>
          )}

          {/* Burger mobile */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-navy-900 pt-16 animate-fade-in overflow-y-auto">
          <div className="p-6 flex flex-col gap-2">

            {/* Profil mobile si connecté */}
            {authUser && (
              <div className="flex items-center gap-3 py-3 mb-2 border-b border-white/[0.07]">
                <Avatar user={authUser} profile={profile} size={10} />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {authUser.displayName ?? profile?.firstName ?? authUser.email}
                  </p>
                  <p className="text-xs text-white/65">{authUser.email}</p>
                  {profile?.status && <div className="mt-1"><StatusBadge status={profile.status} /></div>}
                </div>
              </div>
            )}

            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'text-base font-medium py-3 border-b border-white/[0.07] transition-colors',
                  pathname === href ? 'text-gold-400' : 'text-white/70',
                )}
              >
                {label}
              </Link>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              {authUser ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="btn-outline-gold justify-center flex items-center gap-2"><User size={14} /> Mon profil</Link>
                  <Link href="/settings" onClick={() => setMobileOpen(false)} className="btn-outline-gold justify-center flex items-center gap-2"><Settings size={14} /> Paramètres</Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout() }}
                    className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-400 border border-red-400/30 rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={14} /> Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-outline-gold justify-center">Connexion</Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-gold justify-center flex items-center gap-1.5">
                    <Sparkles size={14} /> S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
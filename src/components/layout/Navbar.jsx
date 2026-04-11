'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, X, MessageSquare, Sparkles } from 'lucide-react'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/',          label: 'Accueil' },
  { href: '/search',    label: 'Rechercher' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/messages',  label: 'Messagerie' },
  { href: '/#pricing',  label: 'Tarifs' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={clsx(
        'fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-8',
        'bg-navy-900 border-b border-gold-500/15 transition-all duration-300',
        scrolled && 'shadow-lg',
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-sm text-navy-900 shadow-gold">
            A
          </div>
          <span className="font-display text-lg font-bold text-gold-500">Abakoré</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'nav-link',
                pathname === href && 'nav-link-active'
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
            <Bell size={16} />
          </button>
          <Link href="/messages" className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.07] transition-all relative">
            <MessageSquare size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
          </Link>
          <Link href="/auth/login" className="btn-ghost hidden md:inline-flex">
            Connexion
          </Link>
          <Link href="/auth/register" className="btn-gold btn-sm hidden md:inline-flex items-center gap-1.5">
            <Sparkles size={12} /> S'inscrire
          </Link>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-navy-900 pt-16 animate-fade-in">
          <div className="p-6 flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-white/70 text-base font-medium py-3 border-b border-white/[0.07]"
              >
                {label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/auth/login" className="btn-outline-gold justify-center">Connexion</Link>
              <Link href="/auth/register" className="btn-gold justify-center flex items-center gap-1.5">
                <Sparkles size={14} /> S'inscrire
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

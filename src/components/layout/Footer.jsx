import Link from 'next/link'
import { Twitter, Linkedin, Facebook } from 'lucide-react'

const LINKS = {
  Plateforme: [
    { label: 'Comment ça marche', href: '/#how' },
    { label: 'Rechercher des experts', href: '/search' },
    { label: 'OHADA Intelligence IA', href: '/ohada-ia' },
    { label: 'Tarifs', href: '/#pricing' },
    { label: 'Blog juridique', href: '/blog' },
  ],
  Experts: [
    { label: 'Devenir expert', href: '/auth/register' },
    { label: 'Vérification profil', href: '/verification' },
    { label: 'Plans Spotlight', href: '/#pricing' },
    { label: 'Ressources OHADA', href: '/ressources' },
    { label: 'Communauté', href: '/communaute' },
  ],
  Légal: [
    { label: 'Conditions d\'utilisation', href: '/cgu' },
    { label: 'Politique de confidentialité', href: '/privacy' },
    { label: 'Politique cookies', href: '/cookies' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
}

const SOCIAL = [
  { Icon: Twitter,  label: 'Twitter' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Facebook, label: 'Facebook' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0A1628] border-t border-gold-500/10 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="font-display text-xl font-bold text-gold-500 mb-3">Abakoré</div>
            <p className="text-sm text-white/40 leading-relaxed max-w-[240px]">
              La plateforme de référence pour l'expertise juridique, comptable et RH dans l'espace OHADA.
            </p>
            <div className="flex gap-2 mt-5">
              {SOCIAL.map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-gold-400 hover:bg-white/10 transition-all"
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h5 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 mb-4">{section}</h5>
              <div className="flex flex-col gap-1">
                {links.map(({ label, href }) => (
                  <Link key={href} href={href} className="text-[13px] text-white/50 py-1 hover:text-gold-400 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.07] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-white/25">© 2025 Abakoré. Tous droits réservés.</span>
          <span className="text-xs text-white/25">Droit OHADA · 17 pays · 240M d'habitants</span>
        </div>
      </div>
    </footer>
  )
}

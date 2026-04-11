'use client'
import { useState } from 'react'
import Link from 'next/link'

const DOMAINS = [
  { emoji: '⚖', label: 'Droit des sociétés' },
  { emoji: '💰', label: 'SYSCOHADA' },
  { emoji: '📋', label: 'Droit du travail' },
  { emoji: '🏛', label: 'Arbitrage CCJA' },
  { emoji: '📄', label: 'Contrats' },
  { emoji: '🏢', label: 'Création entreprise' },
]

export default function HeroSection() {
  const [activeChip, setActiveChip] = useState(0)

  return (
    <section className="relative min-h-screen flex items-center bg-navy-900 overflow-hidden">
      <div className="absolute inset-0 hero-grid-pattern" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 90% at 20% 60%, rgba(37,74,122,0.55) 0%, transparent 65%), radial-gradient(ellipse 50% 70% at 85% 20%, rgba(201,168,76,0.08) 0%, transparent 60%)'
      }} />
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="hero-badge mb-7 w-fit">
          <span className="blink">●</span> IA Juridique · Droit OHADA / UEMOA
        </div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] max-w-3xl mb-5">
          L&apos;expertise juridique{' '}<span className="text-gold-500">OHADA accessible</span>{' '}à toutes les entreprises
        </h1>
        <p className="text-lg text-white/60 leading-relaxed max-w-xl mb-10">
          Trouvez l&apos;avocat, le comptable ou le consultant OHADA qu&apos;il vous faut. Négociez, collaborez et exécutez vos dossiers entièrement sur la plateforme.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Link href="/auth/register" className="btn-gold-lg">✦ Démarrer gratuitement</Link>
          <Link href="/search" className="btn-outline-gold btn-lg">Parcourir les experts →</Link>
        </div>
        <div className="flex items-center bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden max-w-2xl mb-5 shadow-lg">
          <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
            <span className="text-xl text-white/40">🔍</span>
            <input type="text" placeholder="Rechercher un expert OHADA, un acte, un contrat…"
              className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/30 font-body" />
          </div>
          <div className="w-px h-8 bg-white/10 flex-shrink-0" />
          <div className="flex items-center gap-2 px-4 text-[13px] text-white/50 cursor-pointer whitespace-nowrap">
            ⚖ Tous domaines <span className="text-[10px] opacity-60">▼</span>
          </div>
          <Link href="/search" className="m-1.5 px-5 py-2 bg-gradient-to-br from-gold-500 to-gold-600 text-navy-900 font-bold text-sm rounded-xl whitespace-nowrap hover:brightness-105 transition-all">
            Rechercher
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mb-16">
          {DOMAINS.map((d, i) => (
            <button key={d.label} onClick={() => setActiveChip(i)} className={i === activeChip ? 'chip-active' : 'chip'}>
              {d.emoji} {d.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-10">
          {[{ val: '2 400+', label: 'Experts certifiés' }, { val: '17', label: 'Pays OHADA couverts' }, { val: '98%', label: 'Satisfaction client' }, { val: '8 500+', label: 'Dossiers traités' }].map(({ val, label }, i) => (
            <div key={label} className="flex items-center gap-10">
              {i > 0 && <div className="w-px h-10 bg-white/10" />}
              <div>
                <div className="font-display text-[28px] font-bold text-gold-400 leading-none">{val}</div>
                <div className="text-[13px] text-white/40 mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

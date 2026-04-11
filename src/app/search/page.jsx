'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, Stars, Badge } from '@/components/ui'
import { EXPERTS } from '@/lib/data'
import Link from 'next/link'
import clsx from 'clsx'

const DOMAINS_FILTER = ['Droit des sociétés','Droit commercial OHADA','SYSCOHADA / Comptabilité','Droit du travail','Arbitrage CCJA','Droit bancaire']
const COUNTRIES_FILTER = ['Côte d\'Ivoire','Sénégal','Cameroun','Mali','Burkina Faso','Niger']
const EXPERT_TYPES = ['⚖ Avocats','📊 Comptables','🔍 Consultants','👔 RH','🎓 Formateurs']

export default function SearchPage() {
  const [activeType, setActiveType] = useState(0)
  const [query, setQuery] = useState('')
  const [checkedDomains, setCheckedDomains] = useState(['Droit des sociétés'])
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const toggleDomain = d => setCheckedDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Search header */}
        <div className="bg-navy-900 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-white/50 text-sm mb-3">🔍 Recherche d'experts et de contenus OHADA</p>
            <div className="flex items-center bg-white/[0.08] border border-white/12 rounded-2xl overflow-hidden">
              <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
                <span className="text-xl text-white/40">🔍</span>
                <input
                  className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/30 font-body"
                  placeholder="Ex: Avocat droit des sociétés Abidjan…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <button className="m-1.5 px-6 py-2.5 rounded-xl font-bold text-sm text-navy-900 transition-all hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #9E7828)' }}>
                Rechercher
              </button>
            </div>
            {/* Type chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {EXPERT_TYPES.map((t, i) => (
                <button key={t} onClick={() => setActiveType(i)}
                  className={clsx('px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all',
                    i === activeType ? 'border-gold-500 text-gold-400 bg-gold-500/8' : 'border-white/15 text-white/60 bg-white/5 hover:border-gold-500/50'
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex gap-6">

            {/* Filter panel — desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="card sticky top-20">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-display text-sm font-semibold text-navy-800">Filtres</span>
                  <button className="text-xs font-semibold text-gold-600 hover:text-gold-700">Réinitialiser</button>
                </div>

                {/* Domains */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Domaine</p>
                  {DOMAINS_FILTER.map(d => (
                    <label key={d} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-navy-800 transition-colors">
                      <input type="checkbox" checked={checkedDomains.includes(d)} onChange={() => toggleDomain(d)}
                        className="accent-gold-500" />
                      {d}
                    </label>
                  ))}
                </div>

                {/* Countries */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Pays</p>
                  {COUNTRIES_FILTER.map(c => (
                    <label key={c} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-navy-800 transition-colors">
                      <input type="checkbox" defaultChecked={c === 'Côte d\'Ivoire'} className="accent-gold-500" />
                      {c}
                    </label>
                  ))}
                </div>

                {/* Status */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Statut du compte</p>
                  <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="accent-gold-500" />
                    ✓ Vérifiés seulement
                  </label>
                </div>

                {/* Plans */}
                <div className="mb-5">
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Abonnement</p>
                  {['✦ Premium', '★ Spotlight', 'Tous'].map(p => (
                    <label key={p} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600">
                      <input type="checkbox" className="accent-gold-500" />
                      {p}
                    </label>
                  ))}
                </div>

                <button className="btn-gold w-full justify-center py-2.5 text-sm rounded-xl">Appliquer</button>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <p className="text-sm text-gray-400"><strong className="text-navy-800">248 experts</strong> trouvés</p>
                <div className="flex items-center gap-2">
                  <button className="lg:hidden btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>⚙ Filtres</button>
                  <select className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-600 bg-white outline-none cursor-pointer hover:border-gray-300 transition-all">
                    <option>Trier : Pertinence</option>
                    <option>Note ↓</option>
                    <option>Tarif croissant</option>
                    <option>Tarif décroissant</option>
                    <option>Missions complétées</option>
                  </select>
                </div>
              </div>

              {EXPERTS.map(e => (
                <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 flex gap-4 transition-all hover:shadow-md hover:border-gold-300 hover:translate-x-0.5 cursor-pointer group"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
                      style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
                      {e.initials}
                    </div>
                    {e.verified && <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-display text-[16px] font-bold text-navy-900 flex items-center gap-2 flex-wrap">
                          {e.name}
                          <SubBadge plan={e.plan} />
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">{e.role}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-lg font-bold text-navy-800">{e.rate}</p>
                        <p className="text-[11px] text-gray-400">{e.ratePeriod}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 my-2.5">
                      {e.domains.map(d => <Badge key={d} variant="navy">{d}</Badge>)}
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{e.bio}</p>
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-4">
                        <Stars rating={e.rating} reviews={e.reviews} />
                        <span className="text-xs text-gray-400">{e.missions} missions</span>
                        <span className="text-xs text-gray-400">📍 {e.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.available
                          ? <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">● Disponible</span>
                          : <span className="text-[11px] font-semibold text-gold-600 bg-gold-100 px-2.5 py-0.5 rounded-full">◔ Partiel</span>
                        }
                        <Link href={`/contact/${e.id}`} onClick={ev => ev.stopPropagation()} className="btn-outline btn-sm">💬 Contacter</Link>
                        <Link href={`/propose/${e.id}`} onClick={ev => ev.stopPropagation()} className="btn-gold btn-sm">Proposer</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more */}
              <div className="text-center pt-4">
                <button className="btn-outline px-8 py-3 rounded-xl">Charger plus d'experts</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

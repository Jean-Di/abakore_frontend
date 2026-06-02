// 'use client'
// import { useState } from 'react'
// import Navbar from '@/components/layout/Navbar'
// import { SubBadge, Stars, Badge } from '@/components/ui'
// import { EXPERTS } from '@/lib/data'
// import Link from 'next/link'
// import clsx from 'clsx'
// import {
//   Check,
//   Scale,
//   Calculator,
//   Search,
//   Briefcase,
//   GraduationCap,
//   MapPin,
//   SlidersHorizontal,
//   ChevronDown,
// } from 'lucide-react'

// const DOMAINS_FILTER = ['Droit des sociétés','Droit commercial OHADA','SYSCOHADA / Comptabilité','Droit du travail','Arbitrage CCJA','Droit bancaire']
// const COUNTRIES_FILTER = ['Côte d\'Ivoire','Sénégal','Cameroun','Mali','Burkina Faso','Niger']
// const EXPERT_TYPES = [
//   { label: 'Avocats',     Icon: Scale },
//   { label: 'Comptables',  Icon: Calculator },
//   { label: 'Consultants', Icon: Search },
//   { label: 'RH',          Icon: Briefcase },
//   { label: 'Formateurs',  Icon: GraduationCap },
// ]

// export default function SearchPage() {
//   const [activeType, setActiveType]         = useState(null)
//   const [query, setQuery]                   = useState('')
//   const [checkedDomains, setCheckedDomains] = useState(['Droit des sociétés'])
//   const [checkedCountries, setCheckedCountries] = useState(['Côte d\'Ivoire'])
//   const [verifiedOnly, setVerifiedOnly]     = useState(true)
//   const [showFilters, setShowFilters]       = useState(false)

//   const toggleDomain  = d => setCheckedDomains(prev  => prev.includes(d)  ? prev.filter(x => x !== d)  : [...prev, d])
//   const toggleCountry = c => setCheckedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

//   const resetFilters = () => {
//     setCheckedDomains([])
//     setCheckedCountries([])
//     setVerifiedOnly(false)
//     setQuery('')
//     setActiveType(null)
//   }

//   const filteredExperts = EXPERTS.filter(e => {
//     if (query) {
//       const q = query.toLowerCase()
//       const match = e.name.toLowerCase().includes(q)
//         || e.role.toLowerCase().includes(q)
//         || e.bio.toLowerCase().includes(q)
//         || e.skills.some(s => s.toLowerCase().includes(q))
//       if (!match) return false
//     }
//     if (verifiedOnly && !e.verified) return false
//     if (checkedDomains.length > 0) {
//       const match = e.domains.some(d => checkedDomains.some(cd => d.includes(cd) || cd.includes(d)))
//         || e.skills.some(s => checkedDomains.some(cd => s.toLowerCase().includes(cd.toLowerCase())))
//       if (!match) return false
//     }
//     if (checkedCountries.length > 0) {
//       const match = checkedCountries.some(c => e.location.includes(c))
//       if (!match) return false
//     }
//     if (activeType !== null) {
//       const patterns = [
//         ['avocat', 'juriste'],
//         ['comptable', 'syscohada'],
//         ['consultant'],
//         ['rh', 'ressources humaines', 'travail'],
//         ['formateur', 'formation'],
//       ][activeType] || []
//       const roleLC = e.role.toLowerCase()
//       if (patterns.length > 0 && !patterns.some(p => roleLC.includes(p))) return false
//     }
//     return true
//   })

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-50 pt-16">
//         {/* Search header */}
//         <div className="bg-navy-900 py-8">
//           <div className="max-w-6xl mx-auto px-6">
//             <p className="text-white/50 text-sm mb-3 flex items-center gap-1.5">
//               <Search size={14} /> Recherche d'experts et de contenus OHADA
//             </p>
//             <div className="flex items-center bg-white/[0.08] border border-white/12 rounded-2xl overflow-hidden">
//               <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
//                 <Search size={18} className="text-white/40 flex-shrink-0" />
//                 <input
//                   className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/30 font-body"
//                   placeholder="Ex: Avocat droit des sociétés Abidjan…"
//                   value={query}
//                   onChange={e => setQuery(e.target.value)}
//                 />
//               </div>
//               <button className="m-1.5 px-6 py-2.5 rounded-xl font-bold text-sm text-navy-900 transition-all hover:brightness-105"
//                 style={{ background: 'linear-gradient(135deg, #C9A84C, #9E7828)' }}>
//                 Rechercher
//               </button>
//             </div>
//             {/* Type chips */}
//             <div className="flex flex-wrap gap-2 mt-4">
//               {EXPERT_TYPES.map(({ label, Icon }, i) => (
//                 <button key={label} onClick={() => setActiveType(prev => prev === i ? null : i)}
//                   className={clsx('px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all inline-flex items-center gap-1.5',
//                     i === activeType ? 'border-gold-500 text-gold-400 bg-gold-500/8' : 'border-white/15 text-white/60 bg-white/5 hover:border-gold-500/50'
//                   )}>
//                   <Icon size={12} /> {label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="max-w-6xl mx-auto px-6 py-6">
//           <div className="flex gap-6">

//             {/* Filter panel — desktop */}
//             <aside className="hidden lg:block w-64 flex-shrink-0">
//               <div className="card sticky top-20">
//                 <div className="flex justify-between items-center mb-5">
//                   <span className="font-display text-sm font-semibold text-navy-800">Filtres</span>
//                   <button onClick={resetFilters} className="text-xs font-semibold text-gold-600 hover:text-gold-700">Réinitialiser</button>
//                 </div>

//                 {/* Domains */}
//                 <div className="mb-5 pb-5 border-b border-gray-100">
//                   <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Domaine</p>
//                   {DOMAINS_FILTER.map(d => (
//                     <label key={d} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-navy-800 transition-colors">
//                       <input type="checkbox" checked={checkedDomains.includes(d)} onChange={() => toggleDomain(d)}
//                         className="accent-gold-500" />
//                       {d}
//                     </label>
//                   ))}
//                 </div>

//                 {/* Countries */}
//                 <div className="mb-5 pb-5 border-b border-gray-100">
//                   <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Pays</p>
//                   {COUNTRIES_FILTER.map(c => (
//                     <label key={c} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-navy-800 transition-colors">
//                       <input type="checkbox" checked={checkedCountries.includes(c)} onChange={() => toggleCountry(c)}
//                         className="accent-gold-500" />
//                       {c}
//                     </label>
//                   ))}
//                 </div>

//                 {/* Status */}
//                 <div className="mb-5 pb-5 border-b border-gray-100">
//                   <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Statut du compte</p>
//                   <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600">
//                     <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="accent-gold-500" />
//                     Vérifiés seulement
//                   </label>
//                 </div>

//                 {/* Plans */}
//                 <div className="mb-5">
//                   <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Abonnement</p>
//                   {['Premium', 'Spotlight', 'Tous'].map(p => (
//                     <label key={p} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600">
//                       <input type="checkbox" className="accent-gold-500" />
//                       {p}
//                     </label>
//                   ))}
//                 </div>

//                 <button className="btn-gold w-full justify-center py-2.5 text-sm rounded-xl">Appliquer</button>
//               </div>
//             </aside>

//             {/* Results */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
//                 <p className="text-sm text-gray-400">
//                   <strong className="text-navy-800">{filteredExperts.length} expert{filteredExperts.length !== 1 ? 's' : ''}</strong> trouvé{filteredExperts.length !== 1 ? 's' : ''}
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <button className="lg:hidden btn-outline btn-sm inline-flex items-center gap-1.5" onClick={() => setShowFilters(!showFilters)}>
//                     <SlidersHorizontal size={13} /> Filtres
//                   </button>
//                   <div className="relative inline-flex items-center">
//                     <select className="pl-3 pr-8 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-600 bg-white outline-none cursor-pointer hover:border-gray-300 transition-all appearance-none">
//                       <option>Trier : Pertinence</option>
//                       <option>Note</option>
//                       <option>Tarif croissant</option>
//                       <option>Tarif décroissant</option>
//                       <option>Missions complétées</option>
//                     </select>
//                     <ChevronDown size={13} className="absolute right-2.5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>

//               {filteredExperts.length === 0 ? (
//                 <div className="text-center py-16 text-gray-400">
//                   <Search size={40} className="mx-auto mb-3 opacity-30" />
//                   <p className="font-semibold text-navy-700">Aucun expert trouvé</p>
//                   <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
//                   <button onClick={resetFilters} className="btn-outline btn-sm mt-4">Réinitialiser les filtres</button>
//                 </div>
//               ) : (
//                 filteredExperts.map(e => (
//                   <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 flex gap-4 transition-all hover:shadow-md hover:border-gold-300 hover:translate-x-0.5 cursor-pointer group"
//                     style={{ boxShadow: 'var(--shadow-sm)' }}>
//                     {/* Avatar */}
//                     <div className="relative flex-shrink-0">
//                       <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
//                         style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
//                         {e.initials}
//                       </div>
//                       {e.verified && (
//                         <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
//                           <Check size={10} />
//                         </span>
//                       )}
//                     </div>

//                     {/* Info */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-3 flex-wrap">
//                         <div>
//                           <p className="font-display text-[16px] font-bold text-navy-900 flex items-center gap-2 flex-wrap">
//                             {e.name}
//                             <SubBadge plan={e.plan} />
//                           </p>
//                           <p className="text-sm text-gray-400 mt-0.5">{e.role}</p>
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className="font-display text-lg font-bold text-navy-800">{e.rate}</p>
//                           <p className="text-[11px] text-gray-400">{e.ratePeriod}</p>
//                         </div>
//                       </div>
//                       <div className="flex flex-wrap gap-1.5 my-2.5">
//                         {e.domains.map(d => <Badge key={d} variant="navy">{d}</Badge>)}
//                       </div>
//                       <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{e.bio}</p>
//                       <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
//                         <div className="flex items-center gap-4">
//                           <Stars rating={e.rating} reviews={e.reviews} />
//                           <span className="text-xs text-gray-400">{e.missions} missions</span>
//                           <span className="text-xs text-gray-400 flex items-center gap-1">
//                             <MapPin size={11} /> {e.location}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           {e.available
//                             ? <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Disponible</span>
//                             : <span className="text-[11px] font-semibold text-gold-600 bg-gold-100 px-2.5 py-0.5 rounded-full">Partiel</span>
//                           }
//                           <Link href={`/contact/${e.id}`} onClick={ev => ev.stopPropagation()} className="btn-outline btn-sm">Contacter</Link>
//                           <Link href={`/propose/${e.id}`} onClick={ev => ev.stopPropagation()} className="btn-gold btn-sm">Proposer</Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}

//               {/* Load more */}
//               {filteredExperts.length > 0 && (
//                 <div className="text-center pt-4">
//                   <button className="btn-outline px-8 py-3 rounded-xl">Charger plus d'experts</button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }



'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, Stars, Badge } from '@/components/ui'
import Link from 'next/link'
import clsx from 'clsx'
import { useDebounce } from 'use-debounce' // npm install use-debounce
import {
  Check, Scale, Calculator, Search, Briefcase,
  GraduationCap, MapPin, SlidersHorizontal, ChevronDown, Loader2,
} from 'lucide-react'

// ── Firebase ────────────────────────────────────────────────────────────────
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ── Constantes ──────────────────────────────────────────────────────────────
const DOMAINS_FILTER   = ['Droit des sociétés','Droit commercial OHADA','SYSCOHADA / Comptabilité','Droit du travail','Arbitrage CCJA','Droit bancaire']
const COUNTRIES_FILTER = ["Côte d'Ivoire",'Sénégal','Cameroun','Mali','Burkina Faso','Niger']
const EXPERT_TYPES = [
  { label: 'Avocats',     Icon: Scale,         patterns: ['avocat','juriste'] },
  { label: 'Comptables',  Icon: Calculator,    patterns: ['comptable','syscohada'] },
  { label: 'Consultants', Icon: Search,        patterns: ['consultant'] },
  { label: 'RH',          Icon: Briefcase,     patterns: ['rh','ressources humaines','travail'] },
  { label: 'Formateurs',  Icon: GraduationCap, patterns: ['formateur','formation'] },
]
const SORT_OPTIONS = [
  { label: 'Pertinence',          value: 'relevance' },
  { label: 'Note',                value: 'rating' },
  { label: 'Tarif croissant',     value: 'rate_asc' },
  { label: 'Tarif décroissant',   value: 'rate_desc' },
  { label: 'Missions complétées', value: 'missions' },
]

// ── Hook : fetch Firestore ──────────────────────────────────────────────────
function useExpertSearch({ verifiedOnly, checkedCountries, sortBy }) {
  const [experts, setExperts]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchExperts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // On construit une requête Firestore avec les filtres indexables
      let q = collection(db, 'users')
      const constraints = [where('role', '==', 'expert')]

      if (verifiedOnly)              constraints.push(where('verified', '==', true))
      if (checkedCountries.length === 1) constraints.push(where('country', '==', checkedCountries[0]))

      // Tri côté Firestore (nécessite un index composite si combiné avec where)
      if (sortBy === 'rating')   constraints.push(orderBy('rating',   'desc'))
      if (sortBy === 'missions') constraints.push(orderBy('missions', 'desc'))

      constraints.push(limit(100)) // on ramène 100 max, filtre client ensuite

      q = query(collection(db, 'users'), ...constraints)
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setExperts(data)
    } catch (err) {
      console.error(err)
      setError('Erreur lors du chargement des experts.')
    } finally {
      setLoading(false)
    }
  }, [verifiedOnly, checkedCountries, sortBy])

  useEffect(() => { fetchExperts() }, [fetchExperts])

  return { experts, loading, error, refetch: fetchExperts }
}

// ── Filtre client-side (texte, domaines, type, pays multiples) ───────────────
function applyClientFilters(experts, { query, checkedDomains, checkedCountries, activeType, sortBy }) {
  let list = [...experts]

  // Texte libre
  if (query.trim()) {
    const q = query.toLowerCase()
    list = list.filter(e =>
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q)  ||
      e.speciality?.toLowerCase().includes(q)||
      e.bio?.toLowerCase().includes(q)       ||
      (e.skills ?? []).some(s => s.toLowerCase().includes(q))
    )
  }

  // Domaines (array-contains-any → côté client car Firestore limite à 1 array filter)
  if (checkedDomains.length > 0) {
    list = list.filter(e =>
      (e.domains ?? []).some(d =>
        checkedDomains.some(cd => d.toLowerCase().includes(cd.toLowerCase()))
      ) ||
      (e.skills ?? []).some(s =>
        checkedDomains.some(cd => s.toLowerCase().includes(cd.toLowerCase()))
      )
    )
  }

  // Pays multiples (si > 1 sélectionné, Firestore ne peut pas, on filtre ici)
  if (checkedCountries.length > 1) {
    list = list.filter(e => checkedCountries.includes(e.country))
  }

  // Type d'expert
  if (activeType !== null) {
    const patterns = EXPERT_TYPES[activeType]?.patterns ?? []
    list = list.filter(e =>
      patterns.some(p => (e.speciality ?? '').toLowerCase().includes(p))
    )
  }

  // Tri client-side pour rate
  if (sortBy === 'rate_asc')  list.sort((a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0))
  if (sortBy === 'rate_desc') list.sort((a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0))

  return list
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [activeType,       setActiveType]       = useState(null)
  const [query,            setQuery]            = useState('')
  const [debouncedQuery]                        = useDebounce(query, 300)
  const [checkedDomains,   setCheckedDomains]   = useState([])
  const [checkedCountries, setCheckedCountries] = useState([])
  const [verifiedOnly,     setVerifiedOnly]     = useState(false)
  const [sortBy,           setSortBy]           = useState('relevance')
  const [showFilters,      setShowFilters]      = useState(false)

  const toggleDomain  = d => setCheckedDomains(p  => p.includes(d)  ? p.filter(x => x !== d)  : [...p, d])
  const toggleCountry = c => setCheckedCountries(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const resetFilters  = () => {
    setCheckedDomains([]); setCheckedCountries([])
    setVerifiedOnly(false); setQuery(''); setActiveType(null); setSortBy('relevance')
  }

  // Fetch Firestore avec les filtres indexables
  const { experts, loading, error } = useExpertSearch({ verifiedOnly, checkedCountries, sortBy })

  // Filtre client-side
  const filteredExperts = applyClientFilters(experts, {
    query: debouncedQuery, checkedDomains, checkedCountries, activeType, sortBy,
  })

  const FilterPanel = () => (
    <div className="card sticky top-20">
      <div className="flex justify-between items-center mb-5">
        <span className="font-display text-sm font-semibold text-navy-800">Filtres</span>
        <button onClick={resetFilters} className="text-xs font-semibold text-gold-600 hover:text-gold-700">Réinitialiser</button>
      </div>

      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Domaine</p>
        {DOMAINS_FILTER.map(d => (
          <label key={d} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-navy-800 transition-colors">
            <input type="checkbox" checked={checkedDomains.includes(d)} onChange={() => toggleDomain(d)} className="accent-gold-500" />
            {d}
          </label>
        ))}
      </div>

      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Pays</p>
        {COUNTRIES_FILTER.map(c => (
          <label key={c} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600 hover:text-navy-800 transition-colors">
            <input type="checkbox" checked={checkedCountries.includes(c)} onChange={() => toggleCountry(c)} className="accent-gold-500" />
            {c}
          </label>
        ))}
      </div>

      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Statut</p>
        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600">
          <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="accent-gold-500" />
          Vérifiés seulement
        </label>
      </div>

      <div className="mb-5">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Abonnement</p>
        {['Premium', 'Spotlight', 'Tous'].map(p => (
          <label key={p} className="flex items-center gap-2.5 py-1.5 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" className="accent-gold-500" /> {p}
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">

        {/* Header recherche */}
        <div className="bg-navy-900 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-white/50 text-sm mb-3 flex items-center gap-1.5">
              <Search size={14} /> Recherche d'experts et de contenus OHADA
            </p>
            <div className="flex items-center bg-white/[0.08] border border-white/12 rounded-2xl overflow-hidden">
              <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
                <Search size={18} className="text-white/40 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/30 font-body"
                  placeholder="Ex : Avocat droit des sociétés Abidjan…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors text-xl leading-none">×</button>
                )}
              </div>
              <button className="m-1.5 px-6 py-2.5 rounded-xl font-bold text-sm text-navy-900 transition-all hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #9E7828)' }}>
                Rechercher
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {EXPERT_TYPES.map(({ label, Icon }, i) => (
                <button key={label} onClick={() => setActiveType(p => p === i ? null : i)}
                  className={clsx('px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all inline-flex items-center gap-1.5',
                    i === activeType ? 'border-gold-500 text-gold-400 bg-gold-500/10' : 'border-white/15 text-white/60 bg-white/5 hover:border-gold-500/50'
                  )}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex gap-6">

            {/* Sidebar filtre desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FilterPanel />
            </aside>

            {/* Résultats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <p className="text-sm text-gray-400">
                  {loading
                    ? <span className="inline-flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Chargement…</span>
                    : <><strong className="text-navy-800">{filteredExperts.length} expert{filteredExperts.length !== 1 ? 's' : ''}</strong> trouvé{filteredExperts.length !== 1 ? 's' : ''}</>
                  }
                </p>
                <div className="flex items-center gap-2">
                  <button className="lg:hidden btn-outline btn-sm inline-flex items-center gap-1.5" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal size={13} /> Filtres
                  </button>
                  <div className="relative inline-flex items-center">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="pl-3 pr-8 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-600 bg-white outline-none cursor-pointer hover:border-gray-300 transition-all appearance-none"
                    >
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Filtre mobile */}
              {showFilters && (
                <div className="lg:hidden mb-4">
                  <FilterPanel />
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Skeleton loader */}
              {loading && (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aucun résultat */}
              {!loading && filteredExperts.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Search size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-navy-700">Aucun expert trouvé</p>
                  <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
                  <button onClick={resetFilters} className="btn-outline btn-sm mt-4">Réinitialiser les filtres</button>
                </div>
              )}

              {/* Cartes experts */}
              {!loading && filteredExperts.map(e => {
                const displayName = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || 'Expert'
                const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

                return (
                  <Link key={e.id} href={`/profile/${e.id}`}>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 flex gap-4 transition-all hover:shadow-md hover:border-gold-300 cursor-pointer group"
                      style={{ boxShadow: 'var(--shadow-sm)' }}>
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {e.photoURL ? (
                          <img src={e.photoURL} alt={displayName} className="w-16 h-16 rounded-full object-cover border-2 border-gold-100" />
                        ) : (
                          <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
                            style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
                            {initials}
                          </div>
                        )}
                        {e.verified && (
                          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                            <Check size={10} />
                          </span>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-display text-[16px] font-bold text-navy-900 flex items-center gap-2 flex-wrap">
                              {displayName}
                              <SubBadge plan={e.plan} />
                            </p>
                            <p className="text-sm text-gray-400 mt-0.5">{e.speciality}</p>
                          </div>
                          {e.hourlyRate && (
                            <div className="text-right flex-shrink-0">
                              <p className="font-display text-lg font-bold text-navy-800">
                                {Number(e.hourlyRate).toLocaleString()} FCFA
                              </p>
                              <p className="text-[11px] text-gray-400">/ heure</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 my-2.5">
                          {(e.domains ?? []).slice(0, 3).map(d => <Badge key={d} variant="navy">{d}</Badge>)}
                        </div>
                        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{e.bio}</p>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <div className="flex items-center gap-4">
                            <Stars rating={e.rating ?? 5} reviews={e.reviews ?? 0} />
                            <span className="text-xs text-gray-400">{e.missions ?? 0} missions</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={11} /> {e.country}
                            </span>
                          </div>
                          <div className="flex items-center gap-2" onClick={ev => ev.preventDefault()}>
                            {e.available
                              ? <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Disponible
                                </span>
                              : <span className="text-[11px] font-semibold text-gold-600 bg-gold-100 px-2.5 py-0.5 rounded-full">Partiel</span>
                            }
                            <Link href={`/contact/${e.id}`} onClick={ev => ev.stopPropagation()} className="btn-outline btn-sm">Contacter</Link>
                            <Link href={`/propose/${e.id}`} onClick={ev => ev.stopPropagation()} className="btn-gold btn-sm">Proposer</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
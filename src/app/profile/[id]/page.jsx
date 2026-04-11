import Navbar from '@/components/layout/Navbar'
import { Avatar, Badge, SubBadge, Stars, StatusBadge } from '@/components/ui'
import { EXPERTS } from '@/lib/data'
import Link from 'next/link'
import { MapPin, Briefcase, Check } from 'lucide-react'

export async function generateStaticParams() {
  return EXPERTS.map(e => ({ id: e.id }))
}

export default function ProfilePage({ params }) {
  const expert = EXPERTS.find(e => e.id === params.id) || EXPERTS[0]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Cover */}
        <div className="h-48 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #152B47 0%, #1F3D67 60%, rgba(201,168,76,0.2) 100%)',
        }}>
          <div className="absolute inset-0 hero-grid-pattern opacity-50" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 120% at 70% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between -mt-10 pb-5 border-b border-gray-100">
              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-display text-3xl font-bold border-4 border-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
                    {expert.initials}
                  </div>
                  {expert.verified && (
                    <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <h1 className="font-display text-2xl font-bold text-navy-900">{expert.name}</h1>
                  <p className="text-sm text-gray-400 mt-0.5">{expert.role}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} /> {expert.location}
                    </span>
                    <Stars rating={expert.rating} reviews={expert.reviews} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Briefcase size={12} /> {expert.experience} ans d'expérience
                    </span>
                    <SubBadge plan={expert.plan} />
                    {expert.verified && <Badge variant="verified"><Check size={10} strokeWidth={3} /> Certifié</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 mb-3">
                <Link href={`/contact/${expert.id}`} className="btn-outline btn-sm">Contacter</Link>
                <Link href={`/propose/${expert.id}`} className="btn-gold btn-sm">Proposer un dossier</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Subscription */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Abonnement</h5>
              <div className="rounded-xl p-4 border border-gold-500/20" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)' }}>
                <SubBadge plan={expert.plan} />
                <p className="text-xs text-white/40 mt-2">Renouvellement le 15 fév. 2025</p>
                <button className="btn-outline-gold btn-sm w-full justify-center mt-3 text-xs">Gérer l'abonnement</button>
              </div>
            </div>
            {/* Stats */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Statistiques</h5>
              {[
                ['Missions complétées', expert.missions],
                ['Taux de succès', `${expert.successRate}%`],
                ['Temps de réponse', expert.responseTime],
                ['Pays d\'intervention', expert.countries],
                ['Profil vu (30j)', expert.profileViews?.toLocaleString() || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-semibold text-navy-800">{v}</span>
                </div>
              ))}
            </div>
            {/* Skills */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Compétences</h5>
              <div className="flex flex-wrap gap-1.5">
                {expert.skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-navy-50 text-navy-700 border border-navy-100 text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            {/* Languages */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Langues</h5>
              {expert.languages.map(({ name, level }) => (
                <div key={name} className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-500">{name}</span>
                  <span className="font-semibold text-navy-700">{level}</span>
                </div>
              ))}
            </div>
            {/* Verification */}
            <div className="card">
              <h5 className="font-display text-sm font-semibold text-navy-800 mb-3">Vérifications</h5>
              {['Email vérifié', 'Carte du barreau', 'Identité nationale', 'Diplôme validé'].map(item => (
                <div key={item} className="flex items-center gap-2 py-1.5 text-sm text-gray-500">
                  <Check size={13} className="text-green-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 border-b-2 border-gray-100 mb-6">
              {['À propos', 'Dossiers', 'Avis', 'Tarifs'].map((tab, i) => (
                <button key={tab} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-all ${i === 0 ? 'text-navy-900 border-gold-500 font-semibold' : 'text-gray-400 border-transparent hover:text-navy-700'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Bio */}
            <div className="card mb-4">
              <h3 className="font-display text-[15px] font-semibold text-navy-800 mb-3">Présentation</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed">{expert.bio}</p>
              <p className="text-[15px] text-gray-500 leading-relaxed mt-3">
                Expert en arbitrage commercial international devant la CCJA, j'ai accompagné plus de {expert.missions} entreprises — PME locales, filiales de groupes internationaux et organismes publics — dans la sécurisation de leurs opérations juridiques.
              </p>
            </div>

            {/* Projects */}
            {expert.projects && (
              <div className="card mb-4">
                <h3 className="font-display text-[15px] font-semibold text-navy-800 mb-4">Dossiers récents</h3>
                <div className="flex flex-col gap-2.5">
                  {expert.projects.map(p => (
                    <div key={p.title} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-navy-800">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.client} · {p.date}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {expert.reviews_list && (
              <div className="card">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-display text-[15px] font-semibold text-navy-800">Avis clients</h3>
                  <div className="flex items-center gap-2">
                    <Stars rating={expert.rating} />
                    <span className="font-display text-xl font-bold text-navy-900">{expert.rating}</span>
                    <span className="text-xs text-gray-400">({expert.reviews})</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {expert.reviews_list.map(r => (
                    <div key={r.author} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
                            {r.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{r.author}</p>
                            <p className="text-[11px] text-gray-400">{r.company} · {r.date}</p>
                          </div>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

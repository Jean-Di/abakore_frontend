// HowItWorks.jsx
'use client'
import Link from 'next/link'
import clsx from 'clsx'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  Cpu,
  MessageCircle,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Créez votre profil',
      body: 'Inscrivez-vous, choisissez votre statut (avocat, comptable, entreprise…) et soumettez vos justificatifs pour obtenir le badge vérifié.',
      extra: (
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { icon: Scale, label: 'Avocat' },
            { icon: BarChart3, label: 'Comptable' },
            { icon: Building2, label: 'Entreprise' },
          ].map((badge) => {
            const Icon = badge.icon
            return (
              <span key={badge.label} className="badge-navy inline-flex items-center gap-1.5 text-[11px]">
                <Icon size={12} />
                {badge.label}
              </span>
            )
          })}
        </div>
      ),
    },
    {
      n: '2',
      title: 'Trouvez & contactez',
      body: 'Recherchez parmi 2 400+ experts certifiés. Consultez profils, notes et tarifs. Lancez une conversation directement sur la plateforme.',
      extra: (
        <div className="mt-4 bg-gold-50 border border-gold-200 rounded-xl px-3 py-2 text-xs text-gold-700 inline-flex items-center gap-2">
          <MessageCircle size={14} />
          Messagerie sécurisée + partage de documents intégré
        </div>
      ),
    },
    {
      n: '3',
      title: 'Exécutez & payez',
      body: 'Soumettez votre dossier, suivez l\'avancement en temps réel, validez les livrables et effectuez le paiement sécurisé — sans sortir d\'Abakoré.',
      extra: (
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="badge-navy inline-flex items-center gap-2 text-[11px]">
            <ShieldCheck size={14} className="text-gold-400" />
            Paiement sécurisé
          </span>
          <span className="badge-verified inline-flex items-center gap-2 text-[11px]">
            <Check size={14} />
            Fonds protégés
          </span>
        </div>
      ),
    },
  ]

  return (
    <section className="page-section bg-white" id="how">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="sec-label">Comment ça marche</p>
          <h2 className="sec-title">Simple, sécurisé, tout en un</h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            De la recherche d'expert à l'exécution du dossier — sans quitter la plateforme.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {steps.map((s, i) => (
            <div key={i} className="card relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-5 w-10 h-px bg-gradient-to-r from-gold-300 to-transparent z-10" />
              )}
              <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center font-display text-xl font-bold text-gold-400 mb-5">
                {s.n}
              </div>
              <h3 className="font-display text-[17px] font-semibold text-navy-800 mb-2">{s.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{s.body}</p>
              {s.extra}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// FeaturedExperts.jsx
// components/sections/FeaturedExperts.jsx
'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Avatar, Badge, SubBadge, Stars } from '@/components/ui'
import { useExperts } from '@/lib/useExperts'

/* ── Skeleton card ──────────────────────────────────────── */
function ExpertCardSkeleton() {
  return (
    <div className="card card-gold-accent animate-pulse">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-3.5 border-t border-gray-100">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function FeaturedExperts() {
  const { experts, loading, error } = useExperts(3)

  return (
    <section className="page-section bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-14 flex-wrap gap-4">
          <div>
            <p className="sec-label">Experts à la une</p>
            <h2 className="sec-title mb-0">Profils vérifiés & recommandés</h2>
          </div>
          <Link href="/search" className="btn-outline inline-flex items-center gap-2">
            Voir tous les experts
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-10 text-sm text-red-400">
            Impossible de charger les experts. Veuillez réessayer.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loading skeletons */}
          {loading && !error && (
            <>
              <ExpertCardSkeleton />
              <ExpertCardSkeleton />
              <ExpertCardSkeleton />
            </>
          )}

          {/* Expert cards */}
          {!loading && !error && experts.length === 0 && (
            <div className="col-span-3 text-center py-10 text-sm text-gray-400">
              Aucun expert disponible pour le moment.
            </div>
          )}

          {!loading && experts.map(e => (
            <Link
              key={e.id}
              href={`/profile/${e.id}`}
              className="card card-gold-accent card-hover block"
            >
              <div className="flex gap-4 items-center mb-4">
                <Avatar initials={e.initials} size="lg" verified={e.verified} />
                <div>
                  <div className="font-display text-[15px] font-bold text-navy-900">{e.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{e.role}</div>
                  <div className="mt-1.5"><SubBadge plan={e.plan} /></div>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{e.bio}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {e.domains.map(d => <Badge key={d} variant="navy">{d}</Badge>)}
              </div>
              <div className="flex justify-between items-center pt-3.5 border-t border-gray-100">
                <Stars rating={e.rating} reviews={e.reviews} />
                <div className="text-right">
                  <div className="font-display text-[15px] font-bold text-navy-800">{e.rate}</div>
                  <div className="text-[10px] text-gray-400">{e.ratePeriod}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// FeaturesSection.jsx
export function FeaturesSection() {
  const features = [
    {
      icon: Cpu,
      title: 'Base OHADA intégrée & IA',
      body: 'Posez vos questions juridiques en langage naturel. L\'IA analyse les actes uniformes, règlements et jurisprudences OHADA pour vous répondre avec sources.',
    },
    {
      icon: ShieldCheck,
      title: 'Paiement & escrow sécurisés',
      body: 'Les fonds sont bloqués sur la plateforme et libérés uniquement à la validation des livrables. Zéro risque pour l\'acheteur et le vendeur.',
    },
    {
      icon: CheckCircle2,
      title: 'Vérification des profils',
      body: 'Chaque expert est vérifié par notre équipe — carte du barreau, diplômes, Kbis. Badge visible sur tous les profils.',
    },
    {
      icon: BarChart3,
      title: 'Suivi de dossiers en temps réel',
      body: 'Tableau de bord complet pour suivre l\'avancement, les documents, les jalons et les échanges de chaque mission.',
    },
  ]

  return (
    <section className="page-section bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Feature list */}
          <div>
            <p className="sec-label">Fonctionnalités</p>
            <h2 className="sec-title">Tout ce qu'il faut,<br />nulle part ailleurs</h2>
            <div className="flex flex-col gap-5 mt-10">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border-[1.5px] border-transparent hover:bg-white hover:border-gold-300 hover:shadow-sm transition-all cursor-default group">
                    <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-xl group-hover:bg-gold-100 transition-colors">
                      <Icon size={20} className="text-navy-900" />
                    </div>
                    <div>
                      <h3 className="font-display text-[15px] font-semibold text-navy-800 mb-1">{f.title}</h3>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{f.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI mockup */}
          <div className="bg-navy-900 rounded-3xl p-7 border border-gold-500/15 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <p className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-gold-500/60 mb-5">
                <Sparkles size={14} />
                OHADA Intelligence
              </p>
              <div className="bg-white/[0.06] border border-white/10 rounded-xl p-4 mb-3">
                <p className="text-xs text-white/40 mb-2">Question IA</p>
                <p className="text-[13px] text-white/85 leading-relaxed">"Quelles sont les conditions de validité d'un contrat de bail commercial sous l'Acte Uniforme OHADA ?"</p>
              </div>
              <div className="bg-gold-500/8 border border-gold-500/20 rounded-xl p-4 mb-5">
                <p className="text-xs text-gold-600 mb-2">Réponse Abakoré IA</p>
                <p className="text-[13px] text-white/75 leading-relaxed">Selon l'AUDCG (Art. 69-103), le bail commercial requiert un écrit, la désignation précise des locaux, la durée minimale de 2 ans…</p>
                <p className="text-[10px] text-gold-500/50 mt-2">Source : AUDCG, révisé 2010 · Art. 69–73</p>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[['Acte cité', 'AUDCG 2010'], ['Articles', '69 – 103'], ['Confiance', '96%']].map(([k, v]) => (
                  <div key={k} className="bg-white/[0.05] border border-white/8 rounded-lg p-3">
                    <p className="text-[10px] text-white/35 mb-1">{k}</p>
                    <p className="text-[13px] font-semibold" style={{ color: k === 'Confiance' ? '#D9BC72' : 'rgba(255,255,255,0.75)' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// PricingSection.jsx
import { PRICING_PLANS } from '@/lib/data'

export function PricingSection() {
  return (
    <section className="page-section bg-cream" id="pricing">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="sec-label">Tarifs</p>
          <h2 className="sec-title">Un plan pour chaque ambition</h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">Commencez gratuitement, montez en puissance à votre rythme.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={clsx(
                'rounded-3xl p-6 relative transition-all duration-200 hover:-translate-y-0.5',
                plan.featured
                  ? 'bg-navy-900 border-[1.5px] border-gold-600'
                  : plan.spotlight
                  ? 'border border-purple-500/40'
                  : 'bg-white border border-gray-100',
              )}
              style={{
                boxShadow: plan.featured ? 'var(--shadow-gold), var(--shadow-md)' : plan.spotlight ? '0 4px 20px rgba(124,58,237,0.15)' : 'var(--shadow-sm)',
                background: plan.spotlight ? 'linear-gradient(160deg, #1E1B4B, #2D1F6E)' : undefined,
              }}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[11px] font-bold px-4 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                  <Star size={14} />
                  Populaire
                </span>
              )}
              <p className={clsx('text-[11px] font-bold tracking-widest uppercase mb-2.5', plan.featured ? 'text-gold-400' : plan.spotlight ? 'text-purple-300/70' : 'text-gray-300')}>
                {plan.name}
              </p>
              <p className={clsx('font-display text-4xl font-bold leading-none', plan.featured ? 'text-gold-400' : plan.spotlight ? 'text-purple-200' : 'text-navy-900')}>
                {plan.price}
              </p>
              <p className={clsx('text-xs mt-1 mb-5', plan.featured ? 'text-white/40' : plan.spotlight ? 'text-purple-300/40' : 'text-gray-400')}>
                {plan.period}
              </p>
              <ul className="space-y-0.5 mb-6">
                {plan.features.map(({ ok, text }) => (
                  <li key={text} className={clsx('flex items-start gap-2 py-1.5 text-[13px] border-b last:border-0', plan.featured ? 'border-white/[0.07] text-white/70' : plan.spotlight ? 'border-purple-500/15 text-purple-200/75' : 'border-gray-50 text-gray-500')}>
                    <span className="flex items-center justify-center w-5 text-lg">
                      {ok ? <Check size={14} className={plan.featured || plan.spotlight ? 'text-white' : 'text-gold-500'} /> : <span className="text-gray-300">–</span>}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={clsx(
                  'flex justify-center w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                  plan.ctaStyle === 'gold'      && 'btn-gold',
                  plan.ctaStyle === 'navy'      && 'btn-navy',
                  plan.ctaStyle === 'outline'   && 'btn-outline',
                  plan.ctaStyle === 'spotlight' && 'text-white font-bold',
                )}
                style={plan.ctaStyle === 'spotlight' ? { background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' } : undefined}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CtaSection.jsx
export function CtaSection() {
  return (
    <section className="page-section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl px-10 py-16 text-center" style={{ background: 'linear-gradient(135deg, #152B47 0%, #1F3D67 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-gold-400 mb-3">Rejoignez Abakoré</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white max-w-xl mx-auto leading-tight mb-4">
              Votre expertise mérite d'être{' '}
              <span className="text-gold-400">vue et reconnue</span>
            </h2>
            <p className="text-[15px] text-white/50 max-w-md mx-auto leading-relaxed mb-8">
              PME à la recherche d'expertise ou professionnel cherchant à développer sa clientèle — Abakoré vous connecte.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/register" className="btn-gold-lg">Créer mon profil gratuitement</Link>
              <Link href="/search" className="btn-outline-gold btn-lg">Parcourir les experts</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

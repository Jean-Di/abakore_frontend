'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, Stars, Toast, ProgressBar } from '@/components/ui'
import { EXPERTS } from '@/lib/data'
import clsx from 'clsx'

const DOSSIER_TYPES = [
  { value: 'contract',       label: '📄 Rédaction de contrat',          desc: 'Contrat commercial, bail, partenariat, franchise…' },
  { value: 'restructuring',  label: '🏢 Restructuration d\'entreprise',  desc: 'Fusion, acquisition, transformation juridique' },
  { value: 'litigation',     label: '⚖ Litige & arbitrage',             desc: 'Arbitrage CCJA, médiation, contentieux commercial' },
  { value: 'compliance',     label: '✅ Mise en conformité OHADA',       desc: 'Audit, conformité réglementaire, SYSCOHADA' },
  { value: 'creation',       label: '🚀 Création d\'entreprise',         desc: 'Immatriculation RCCM, statuts, capital social' },
  { value: 'hr',             label: '👔 Droit du travail & RH',          desc: 'CDI/CDD, règlement intérieur, licenciement' },
  { value: 'banking',        label: '🏦 Droit bancaire & financier',     desc: 'Contrats de financement, sûretés, garanties' },
  { value: 'other',          label: '🔍 Autre / Sur mesure',             desc: 'Décrivez votre besoin spécifique' },
]

const STEPS_LABELS = ['Type de dossier', 'Détails & contexte', 'Budget & délai', 'Récapitulatif']

export default function ProposePage({ params }) {
  const expert = EXPERTS.find(e => e.id === params.id) || EXPERTS[0]
  const [step, setStep] = useState(1)
  const [dossierType, setDossierType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', countries: ['Côte d\'Ivoire'],
    budget: '', budgetType: 'fixed',
    deadline: '', deadlineFlexible: false,
    priority: 'normal', confidential: false,
    documents: [],
  })

  const progress = ((step - 1) / (STEPS_LABELS.length - 1)) * 100

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = () => setSubmitted(true)

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-6">
          <div className="max-w-lg w-full">
            {/* Success card */}
            <div className="card text-center mb-4" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-3xl">
                🎉
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Dossier soumis !</h1>
              <p className="text-white/50 text-sm mb-6">Votre proposition a été transmise à <span className="text-gold-400 font-semibold">{expert.name}</span></p>
              <div className="bg-white/[0.06] border border-white/10 rounded-xl p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Référence dossier</p>
                    <p className="text-white font-mono font-semibold">#DOS-2024-0847</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Statut</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-400 text-xs font-semibold border border-gold-500/30">
                      ⏳ En attente de réponse
                    </span>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Expert</p>
                    <p className="text-white/80 font-semibold">{expert.name}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Réponse estimée</p>
                    <p className="text-white/80 font-semibold">{expert.responseTime}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/30 mb-6">Vous serez notifié par email et dans votre tableau de bord dès que {expert.name.split(' ')[0]} répond.</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/dashboard" className="btn-gold w-full justify-center py-3 rounded-xl">
                  📊 Suivre dans le tableau de bord
                </Link>
                <Link href="/messages" className="btn-outline-gold w-full justify-center py-2.5 rounded-xl text-sm">
                  💬 Aller à la messagerie
                </Link>
              </div>
            </div>
            <Link href="/search" className="block text-center text-sm text-gray-400 hover:text-gold-600 transition-colors">
              ← Retour à la recherche
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/search" className="hover:text-gold-600">Recherche</Link>
            <span>›</span>
            <Link href={`/profile/${expert.id}`} className="hover:text-gold-600">{expert.name}</Link>
            <span>›</span>
            <span className="text-navy-700 font-medium">Proposer un dossier</span>
          </div>

          {/* Progress header */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-display text-lg font-bold text-navy-900">Nouveau dossier</h1>
              <span className="text-xs text-gray-400">Étape {step} / {STEPS_LABELS.length}</span>
            </div>
            <ProgressBar value={progress} className="mb-3" />
            <div className="flex justify-between">
              {STEPS_LABELS.map((label, i) => (
                <div key={label} className={clsx('text-[11px] font-medium', i + 1 === step ? 'text-gold-600' : i + 1 < step ? 'text-green-600' : 'text-gray-300')}>
                  {i + 1 < step ? '✓ ' : ''}{label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div>

              {/* ── STEP 1: Type ── */}
              {step === 1 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Type de dossier</h2>
                    <p className="text-sm text-gray-400 mb-5">Choisissez la catégorie qui correspond à votre besoin</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {DOSSIER_TYPES.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setDossierType(d.value)}
                          className={clsx(
                            'flex items-start gap-3 p-4 rounded-xl border-[1.5px] text-left transition-all',
                            dossierType === d.value
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/30'
                          )}
                          style={dossierType === d.value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.12)' } : undefined}
                        >
                          <span className="text-xl mt-0.5">{d.label.split(' ')[0]}</span>
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{d.label.replace(/^\S+\s/, '')}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{d.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => dossierType && setStep(2)}
                      className={clsx('btn-gold px-8 py-3 rounded-xl', !dossierType && 'opacity-50 cursor-not-allowed')}
                    >
                      Continuer →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Details ── */}
              {step === 2 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Détails du dossier</h2>
                    <p className="text-sm text-gray-400 mb-5">Plus vous êtes précis, meilleure sera la proposition de l'expert</p>

                    <div className="mb-4">
                      <label className="label">Titre du dossier *</label>
                      <input className="input" placeholder="Ex: Rédaction contrat de distribution exclusive — zone CEDEAO"
                        value={form.title} onChange={e => upd('title', e.target.value)} />
                    </div>

                    <div className="mb-4">
                      <label className="label">Description détaillée *</label>
                      <textarea className="input resize-none" rows={6}
                        placeholder="Décrivez le contexte, l'objectif, les parties impliquées, les enjeux spécifiques, et toute contrainte réglementaire à prendre en compte…"
                        value={form.description} onChange={e => upd('description', e.target.value)} />
                      <p className="text-xs text-gray-300 text-right mt-1">{form.description.length}/3000</p>
                    </div>

                    <div className="mb-4">
                      <label className="label">Pays / Juridiction(s) concerné(s) *</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Niger', 'Togo', 'Bénin', 'Guinée', 'Congo', 'Gabon', 'Toute la zone OHADA'].map(country => (
                          <button
                            key={country}
                            onClick={() => {
                              const list = form.countries
                              upd('countries', list.includes(country) ? list.filter(c => c !== country) : [...list, country])
                            }}
                            className={clsx(
                              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                              form.countries.includes(country)
                                ? 'bg-navy-700 text-white border-navy-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-navy-300'
                            )}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-0">
                      <label className="label">Documents existants (optionnel)</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/30 transition-all group">
                        <div className="text-xl mb-1.5">📎</div>
                        <p className="text-sm font-medium text-navy-800">Joindre des documents</p>
                        <p className="text-xs text-gray-400 mt-0.5">Contrats existants, statuts, documents de référence…</p>
                        <p className="text-[11px] text-gray-300 mt-1">PDF, DOCX, JPG · Max 50 Mo total</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button className="btn-outline" onClick={() => setStep(1)}>← Retour</button>
                    <button className="btn-gold px-8 py-3 rounded-xl" onClick={() => setStep(3)}>Continuer →</button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Budget & Deadline ── */}
              {step === 3 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Budget & délai</h2>
                    <p className="text-sm text-gray-400 mb-5">Ces informations aident l'expert à préparer sa proposition</p>

                    {/* Budget type */}
                    <div className="mb-5">
                      <label className="label">Type de rémunération</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'fixed',  label: '💰 Forfait fixe',    desc: 'Prix total convenu' },
                          { value: 'hourly', label: '⏱ Taux horaire',    desc: 'Facturation à l\'heure' },
                          { value: 'open',   label: '🤝 Ouvert',          desc: 'Laisser l\'expert proposer' },
                        ].map(bt => (
                          <button key={bt.value} onClick={() => upd('budgetType', bt.value)}
                            className={clsx(
                              'p-3 rounded-xl border-[1.5px] text-center transition-all',
                              form.budgetType === bt.value ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300'
                            )}>
                            <p className="text-sm font-semibold text-navy-800">{bt.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{bt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.budgetType !== 'open' && (
                      <div className="mb-5">
                        <label className="label">
                          {form.budgetType === 'fixed' ? 'Budget total (FCFA ou €)' : 'Taux horaire souhaité'}
                        </label>
                        <div className="relative">
                          <input className="input pr-16" placeholder={form.budgetType === 'fixed' ? 'Ex: 500 000' : 'Ex: 15 000'}
                            value={form.budget} onChange={e => upd('budget', e.target.value)} />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">FCFA</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                          Tarif habituel de {expert.name.split(' ')[0]} : <span className="font-semibold text-gold-600">{expert.rate}{expert.ratePeriod}</span>
                        </p>
                      </div>
                    )}

                    {/* Deadline */}
                    <div className="mb-5">
                      <label className="label">Date limite souhaitée</label>
                      <input type="date" className="input" value={form.deadline} onChange={e => upd('deadline', e.target.value)} />
                      <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                        <input type="checkbox" className="accent-gold-500" checked={form.deadlineFlexible}
                          onChange={e => upd('deadlineFlexible', e.target.checked)} />
                        <span className="text-xs text-gray-500">La date est flexible — laisser l'expert proposer</span>
                      </label>
                    </div>

                    {/* Priority */}
                    <div className="mb-5">
                      <label className="label">Priorité du dossier</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'normal', label: 'Normale',  color: 'text-gray-600',   bg: '' },
                          { value: 'high',   label: 'Haute',    color: 'text-orange-600', bg: '' },
                          { value: 'urgent', label: 'Urgente',  color: 'text-red-600',    bg: '' },
                        ].map(p => (
                          <button key={p.value} onClick={() => upd('priority', p.value)}
                            className={clsx(
                              'py-2.5 rounded-xl border-[1.5px] text-sm font-semibold transition-all',
                              form.priority === p.value ? `border-gold-500 bg-gold-50 ${p.color}` : 'border-gray-200 text-gray-500 hover:border-gold-300'
                            )}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Confidential */}
                    <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="accent-gold-500 mt-0.5" checked={form.confidential}
                          onChange={e => upd('confidential', e.target.checked)} />
                        <div>
                          <p className="text-sm font-semibold text-navy-800">🔒 Dossier confidentiel</p>
                          <p className="text-xs text-gray-400 mt-0.5">L'expert devra signer un accord de confidentialité (NDA) avant d'accéder aux détails complets du dossier</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button className="btn-outline" onClick={() => setStep(2)}>← Retour</button>
                    <button className="btn-gold px-8 py-3 rounded-xl" onClick={() => setStep(4)}>Vérifier le récapitulatif →</button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Summary ── */}
              {step === 4 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-lg">✅</div>
                      <div>
                        <h2 className="font-display text-base font-semibold text-navy-800">Récapitulatif du dossier</h2>
                        <p className="text-xs text-gray-400">Vérifiez les informations avant d'envoyer</p>
                      </div>
                    </div>

                    {[
                      ['Type', DOSSIER_TYPES.find(d => d.value === dossierType)?.label || '—'],
                      ['Titre', form.title || '(Non renseigné)'],
                      ['Pays', form.countries.join(', ') || '—'],
                      ['Budget', form.budgetType === 'open' ? 'Ouvert (laisser l\'expert proposer)' : form.budget ? `${form.budget} FCFA` : '(Non renseigné)'],
                      ['Délai', form.deadline || (form.deadlineFlexible ? 'Flexible' : 'Non défini')],
                      ['Priorité', { normal: 'Normale', high: 'Haute ⚡', urgent: 'Urgente 🔴' }[form.priority]],
                      ['Confidentiel', form.confidential ? '✓ Oui (NDA requis)' : 'Non'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-navy-800 text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}

                    {form.description && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Description</p>
                        <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
                          {form.description}
                        </div>
                      </div>
                    )}
                  </div>

                  <Toast type="warning" icon="⚠️">
                    <div>
                      <strong>Avant d'envoyer :</strong> une fois soumis, le dossier sera visible par{' '}
                      <strong>{expert.name}</strong> qui pourra l'accepter, le refuser ou demander des précisions.
                      Le paiement n'interviendra qu'après accord mutuel.
                    </div>
                  </Toast>

                  <div className="flex justify-between mt-5">
                    <button className="btn-outline" onClick={() => setStep(3)}>← Modifier</button>
                    <button className="btn-gold px-10 py-3.5 rounded-xl text-base" onClick={handleSubmit}>
                      ✦ Soumettre le dossier
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Expert sidebar ── */}
            <aside>
              <div className="card card-gold-accent sticky top-20">
                <p className="text-xs font-semibold text-gray-400 mb-3">Dossier proposé à</p>
                <div className="flex gap-3 items-center mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
                      style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
                      {expert.initials}
                    </div>
                    {expert.verified && <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</span>}
                  </div>
                  <div>
                    <p className="font-display text-[15px] font-bold text-navy-900">{expert.name}</p>
                    <p className="text-xs text-gray-400">{expert.role}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <SubBadge plan={expert.plan} />
                    </div>
                  </div>
                </div>
                <Stars rating={expert.rating} reviews={expert.reviews} />

                <div className="mt-4 flex flex-col gap-1.5">
                  {[
                    ['⏱ Réponse', expert.responseTime],
                    ['✅ Taux succès', `${expert.successRate}%`],
                    ['📍 Localisation', expert.location],
                    ['💰 Tarif habituel', expert.rate],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium text-navy-800">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Process info */}
                <div className="mt-5 bg-navy-900 rounded-xl p-4 border border-gold-500/15">
                  <p className="text-xs font-bold text-gold-400 mb-3">Comment ça se passe ?</p>
                  {[
                    '1. Vous soumettez le dossier',
                    '2. L\'expert examine et répond',
                    '3. Vous discutez les modalités',
                    '4. Accord → paiement escrow',
                    '5. Exécution & validation',
                  ].map(s => (
                    <p key={s} className="text-[11px] text-white/50 py-1">{s}</p>
                  ))}
                </div>

                <Link href={`/profile/${expert.id}`} className="btn-outline w-full justify-center mt-4 text-xs">
                  Voir le profil complet
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

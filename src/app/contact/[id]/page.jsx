'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Avatar, SubBadge, Stars, Badge, Toast } from '@/components/ui'
import { EXPERTS } from '@/lib/data'
import clsx from 'clsx'

const SUBJECTS = [
  { value: 'consultation', label: '💬 Demande de consultation',       desc: 'Discussion initiale sur votre problématique' },
  { value: 'dossier',      label: '📋 Proposition de dossier',        desc: 'Confier un dossier complet à cet expert' },
  { value: 'devis',        label: '💰 Demande de devis',              desc: 'Obtenir une estimation tarifaire' },
  { value: 'question',     label: '❓ Question ponctuelle OHADA',     desc: 'Question rapide sur un point juridique' },
  { value: 'collaboration',label: '🤝 Collaboration professionnelle', desc: 'Proposition de partenariat entre experts' },
]

const URGENCY = [
  { value: 'low',    label: 'Pas urgent',     desc: 'Sous 2 semaines',  color: 'border-gray-200 text-gray-600' },
  { value: 'medium', label: 'Modéré',         desc: 'Sous 1 semaine',   color: 'border-gold-300 text-gold-700' },
  { value: 'high',   label: 'Urgent',         desc: 'Sous 48h',         color: 'border-orange-300 text-orange-700' },
  { value: 'asap',   label: 'Très urgent',    desc: 'Immédiat',         color: 'border-red-300 text-red-600' },
]

export default function ContactPage({ params }) {
  const expert = EXPERTS.find(e => e.id === params.id) || EXPERTS[0]
  const [subject, setSubject]   = useState('consultation')
  const [urgency, setUrgency]   = useState('medium')
  const [message, setMessage]   = useState('')
  const [budget, setBudget]     = useState('')
  const [sent, setSent]         = useState(false)
  const [step, setStep]         = useState(1) // 1: form, 2: confirm

  const handleSend = () => {
    if (step === 1) { setStep(2); return }
    setSent(true)
  }

  if (sent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-4xl">
              ✅
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">Message envoyé !</h1>
            <p className="text-gray-400 mb-2">Votre message a bien été transmis à</p>
            <p className="font-semibold text-navy-800 mb-6">{expert.name}</p>
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 mb-8 text-left">
              <p className="text-sm font-semibold text-gold-700 mb-1">⏱ Temps de réponse moyen</p>
              <p className="text-2xl font-display font-bold text-navy-900">{expert.responseTime}</p>
              <p className="text-xs text-gray-400 mt-1">Vous serez notifié par email dès qu'il répond</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Link href="/messages" className="btn-gold w-full justify-center py-3 rounded-xl">
                💬 Aller à la messagerie
              </Link>
              <Link href={`/profile/${expert.id}`} className="btn-outline w-full justify-center py-3 rounded-xl">
                ← Retour au profil
              </Link>
            </div>
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
            <Link href="/search" className="hover:text-gold-600 transition-colors">Recherche</Link>
            <span>›</span>
            <Link href={`/profile/${expert.id}`} className="hover:text-gold-600 transition-colors">{expert.name}</Link>
            <span>›</span>
            <span className="text-navy-700 font-medium">Contacter</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* ── FORM ── */}
            <div>
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-7">
                {['Rédiger votre message', 'Confirmer l\'envoi'].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    {i > 0 && <div className="w-8 h-px bg-gray-200" />}
                    <div className={clsx(
                      'flex items-center gap-2 text-sm font-medium',
                      step === i + 1 ? 'text-navy-900' : step > i + 1 ? 'text-green-600' : 'text-gray-400'
                    )}>
                      <div className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        step === i + 1 ? 'bg-gold-500 text-navy-900' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      )}>
                        {step > i + 1 ? '✓' : i + 1}
                      </div>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="animate-slide-up">
                  {/* Sujet */}
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Objet de votre message</h2>
                    <div className="grid grid-cols-1 gap-2">
                      {SUBJECTS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setSubject(s.value)}
                          className={clsx(
                            'flex items-start gap-3 p-3.5 rounded-xl border-[1.5px] text-left transition-all',
                            subject === s.value
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/40'
                          )}
                          style={subject === s.value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.12)' } : undefined}
                        >
                          <div className={clsx(
                            'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
                            subject === s.value ? 'border-gold-500' : 'border-gray-300'
                          )}>
                            {subject === s.value && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{s.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Votre message</h2>
                    <div className="mb-4">
                      <label className="label">Titre / Objet précis</label>
                      <input className="input" placeholder="Ex: Besoin d'un avocat pour contrat de distribution UEMOA" />
                    </div>
                    <div className="mb-4">
                      <label className="label">Décrivez votre besoin</label>
                      <textarea
                        className="input resize-none"
                        rows={6}
                        placeholder={`Bonjour ${expert.name.split(' ')[0]},\n\nJe vous contacte au sujet de…\n\nContexte : …\nObjectif : …\nÉchéance souhaitée : …`}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                      />
                      <p className="text-xs text-gray-300 text-right mt-1">{message.length}/2000</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Budget estimé (optionnel)</label>
                        <input
                          className="input"
                          placeholder="Ex: 150 000 FCFA"
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Pays concerné</label>
                        <select className="input">
                          {['Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Plusieurs pays'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="card mb-6">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Niveau d'urgence</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {URGENCY.map(u => (
                        <button
                          key={u.value}
                          onClick={() => setUrgency(u.value)}
                          className={clsx(
                            'p-3 rounded-xl border-[1.5px] text-center transition-all',
                            urgency === u.value
                              ? `${u.color} bg-opacity-10 font-semibold`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          )}
                          style={urgency === u.value ? { background: 'rgba(201,168,76,0.05)', boxShadow: '0 0 0 3px rgba(201,168,76,0.10)' } : undefined}
                        >
                          <p className="text-sm font-semibold">{u.label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{u.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="card mb-6">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Documents joints (optionnel)</h2>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/40 transition-all group">
                      <div className="text-2xl mb-2">📎</div>
                      <p className="text-sm font-semibold text-navy-800 mb-0.5">Glissez vos fichiers ici</p>
                      <p className="text-xs text-gray-400">ou <span className="text-gold-600 font-semibold">cliquez pour sélectionner</span></p>
                      <p className="text-[11px] text-gray-300 mt-1.5">PDF, DOCX, JPG, PNG · Max 20 Mo</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="btn-gold w-full justify-center py-3.5 text-base rounded-xl"
                  >
                    Continuer → Vérifier avant envoi
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-4">Récapitulatif de votre message</h2>
                    {[
                      ['Destinataire', expert.name],
                      ['Objet', SUBJECTS.find(s => s.value === subject)?.label],
                      ['Urgence', URGENCY.find(u => u.value === urgency)?.label + ' — ' + URGENCY.find(u => u.value === urgency)?.desc],
                      ['Budget', budget || 'Non précisé'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-navy-800 text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                      {message || '(Aucun message saisi)'}
                    </div>
                  </div>

                  <Toast type="info" icon="ℹ">
                    <span>Votre message sera visible dans la messagerie sécurisée Abakoré. <strong>{expert.name}</strong> répond généralement en {expert.responseTime}.</span>
                  </Toast>

                  <div className="flex gap-3 mt-5">
                    <button className="btn-outline flex-shrink-0" onClick={() => setStep(1)}>← Modifier</button>
                    <button className="btn-gold flex-1 justify-center py-3.5 rounded-xl" onClick={handleSend}>
                      ✦ Envoyer le message
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── EXPERT CARD ── */}
            <aside className="flex flex-col gap-4">
              <div className="card card-gold-accent sticky top-20">
                <div className="flex gap-3 items-center mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
                      style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
                      {expert.initials}
                    </div>
                    {expert.verified && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</span>
                    )}
                  </div>
                  <div>
                    <p className="font-display text-[15px] font-bold text-navy-900">{expert.name}</p>
                    <p className="text-xs text-gray-400">{expert.role}</p>
                    <div className="mt-1"><SubBadge plan={expert.plan} /></div>
                  </div>
                </div>
                <Stars rating={expert.rating} reviews={expert.reviews} />
                <div className="mt-4 flex flex-col gap-2">
                  {[
                    ['⏱ Temps de réponse', expert.responseTime],
                    ['✅ Taux de succès', `${expert.successRate}%`],
                    ['💼 Expérience', `${expert.experience} ans`],
                    ['📍 Localisation', expert.location],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium text-navy-800">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-gold-50 border border-gold-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gold-700 mb-0.5">Tarif consultation</p>
                  <p className="font-display text-lg font-bold text-navy-800">{expert.rate}</p>
                  <p className="text-[10px] text-gray-400">{expert.ratePeriod}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {expert.skills.slice(0, 4).map(s => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-700 border border-navy-100 text-[11px]">{s}</span>
                  ))}
                </div>
                <Link href={`/profile/${expert.id}`} className="btn-outline w-full justify-center mt-4 text-xs">
                  Voir le profil complet
                </Link>
              </div>

              {/* Security note */}
              <div className="bg-navy-900 rounded-2xl p-4 border border-gold-500/15">
                <p className="text-xs font-semibold text-gold-400 mb-2">🔒 Messagerie sécurisée</p>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Tous les échanges sont chiffrés et confidentiels. Votre coordonnées ne seront jamais partagées sans votre accord.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

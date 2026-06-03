// 'use client'
// import { useState } from 'react'
// import Link from 'next/link'
// import Navbar from '@/components/layout/Navbar'
// import { SubBadge, Stars, Toast, ProgressBar } from '@/components/ui'
// import { EXPERTS } from '@/lib/data'
// import clsx from 'clsx'
// import {
//   ArrowLeft,
//   ArrowRight,
//   FileText,
//   Building2,
//   Scale,
//   CheckCircle2,
//   Rocket,
//   Briefcase,
//   Landmark,
//   Search,
//   Clock,
//   MapPin,
//   DollarSign,
//   AlertTriangle,
//   Lock,
//   PartyPopper,
//   BarChart2,
//   MessageSquare,
//   Sparkles,
//   Star,
//   Check,
// } from 'lucide-react'

// const DOSSIER_TYPES = [
//   { value: 'contract',      Icon: FileText,     label: 'Rédaction de contrat',         desc: 'Contrat commercial, bail, partenariat, franchise…' },
//   { value: 'restructuring', Icon: Building2,    label: 'Restructuration d\'entreprise', desc: 'Fusion, acquisition, transformation juridique' },
//   { value: 'litigation',    Icon: Scale,        label: 'Litige & arbitrage',            desc: 'Arbitrage CCJA, médiation, contentieux commercial' },
//   { value: 'compliance',    Icon: CheckCircle2, label: 'Mise en conformité OHADA',      desc: 'Audit, conformité réglementaire, SYSCOHADA' },
//   { value: 'creation',      Icon: Rocket,       label: 'Création d\'entreprise',        desc: 'Immatriculation RCCM, statuts, capital social' },
//   { value: 'hr',            Icon: Briefcase,    label: 'Droit du travail & RH',         desc: 'CDI/CDD, règlement intérieur, licenciement' },
//   { value: 'banking',       Icon: Landmark,     label: 'Droit bancaire & financier',    desc: 'Contrats de financement, sûretés, garanties' },
//   { value: 'other',         Icon: Search,       label: 'Autre / Sur mesure',            desc: 'Décrivez votre besoin spécifique' },
// ]

// const STEPS_LABELS = ['Type de dossier', 'Détails & contexte', 'Budget & délai', 'Récapitulatif']

// export default function ProposePage({ params }) {
//   const expert = EXPERTS.find(e => e.id === params.id) || EXPERTS[0]
//   const [step, setStep]           = useState(1)
//   const [dossierType, setDossierType] = useState('')
//   const [submitted, setSubmitted] = useState(false)
//   const [form, setForm] = useState({
//     title: '', description: '', countries: ['Côte d\'Ivoire'],
//     budget: '', budgetType: 'fixed',
//     deadline: '', deadlineFlexible: false,
//     priority: 'normal', confidential: false,
//     documents: [],
//   })

//   const progress = ((step - 1) / (STEPS_LABELS.length - 1)) * 100
//   const upd = (key, val) => setForm(f => ({ ...f, [key]: val }))
//   const handleSubmit = () => setSubmitted(true)

//   if (submitted) {
//     return (
//       <>
//         <Navbar />
//         <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-6">
//           <div className="max-w-lg w-full">
//             <div className="card text-center mb-4" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)', border: '1px solid rgba(201,168,76,0.2)' }}>
//               <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
//                 <PartyPopper size={32} className="text-gold-400" />
//               </div>
//               <h1 className="font-display text-2xl font-bold text-white mb-2">Dossier soumis !</h1>
//               <p className="text-white/50 text-sm mb-6">Votre proposition a été transmise à <span className="text-gold-400 font-semibold">{expert.name}</span></p>
//               <div className="bg-white/[0.06] border border-white/10 rounded-xl p-4 mb-6 text-left">
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <p className="text-white/40 text-xs mb-1">Référence dossier</p>
//                     <p className="text-white font-mono font-semibold">#DOS-2025-0847</p>
//                   </div>
//                   <div>
//                     <p className="text-white/40 text-xs mb-1">Statut</p>
//                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-400 text-xs font-semibold border border-gold-500/30">
//                       <Clock size={10} /> En attente de réponse
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-white/40 text-xs mb-1">Expert</p>
//                     <p className="text-white/80 font-semibold">{expert.name}</p>
//                   </div>
//                   <div>
//                     <p className="text-white/40 text-xs mb-1">Réponse estimée</p>
//                     <p className="text-white/80 font-semibold">{expert.responseTime}</p>
//                   </div>
//                 </div>
//               </div>
//               <p className="text-xs text-white/30 mb-6">Vous serez notifié par email et dans votre tableau de bord dès que {expert.name.split(' ')[0]} répond.</p>
//               <div className="flex flex-col gap-2.5">
//                 <Link href="/dashboard" className="btn-gold w-full justify-center py-3 rounded-xl inline-flex items-center gap-1.5">
//                   <BarChart2 size={15} /> Suivre dans le tableau de bord
//                 </Link>
//                 <Link href="/messages" className="btn-outline-gold w-full justify-center py-2.5 rounded-xl text-sm inline-flex items-center gap-1.5">
//                   <MessageSquare size={14} /> Aller à la messagerie
//                 </Link>
//               </div>
//             </div>
//             <Link href="/search" className="block text-center text-sm text-gray-400 hover:text-gold-600 transition-colors inline-flex items-center justify-center gap-1.5">
//               <ArrowLeft size={13} /> Retour à la recherche
//             </Link>
//           </div>
//         </div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-50 pt-16">
//         <div className="max-w-5xl mx-auto px-6 py-10">

//           {/* Breadcrumb */}
//           <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
//             <Link href="/search" className="hover:text-gold-600">Recherche</Link>
//             <span>›</span>
//             <Link href={`/profile/${expert.id}`} className="hover:text-gold-600">{expert.name}</Link>
//             <span>›</span>
//             <span className="text-navy-700 font-medium">Proposer un dossier</span>
//           </div>

//           {/* Progress header */}
//           <div className="card mb-6">
//             <div className="flex items-center justify-between mb-3">
//               <h1 className="font-display text-lg font-bold text-navy-900">Nouveau dossier</h1>
//               <span className="text-xs text-gray-400">Étape {step} / {STEPS_LABELS.length}</span>
//             </div>
//             <ProgressBar value={progress} className="mb-3" />
//             <div className="flex justify-between">
//               {STEPS_LABELS.map((label, i) => (
//                 <div key={label} className={clsx('text-[11px] font-medium flex items-center gap-0.5', i + 1 === step ? 'text-gold-600' : i + 1 < step ? 'text-green-600' : 'text-gray-300')}>
//                   {i + 1 < step && <Check size={10} strokeWidth={3} />}
//                   {label}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
//             <div>

//               {/* ── STEP 1: Type ── */}
//               {step === 1 && (
//                 <div className="animate-slide-up">
//                   <div className="card mb-4">
//                     <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Type de dossier</h2>
//                     <p className="text-sm text-gray-400 mb-5">Choisissez la catégorie qui correspond à votre besoin</p>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
//                       {DOSSIER_TYPES.map(({ value, Icon, label, desc }) => (
//                         <button
//                           key={value}
//                           onClick={() => setDossierType(value)}
//                           className={clsx(
//                             'flex items-start gap-3 p-4 rounded-xl border-[1.5px] text-left transition-all',
//                             dossierType === value
//                               ? 'border-gold-500 bg-gold-50'
//                               : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/30'
//                           )}
//                           style={dossierType === value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.12)' } : undefined}
//                         >
//                           <Icon size={18} className={clsx('flex-shrink-0 mt-0.5', dossierType === value ? 'text-gold-600' : 'text-gray-400')} />
//                           <div>
//                             <p className="text-sm font-semibold text-navy-800">{label}</p>
//                             <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex justify-end">
//                     <button
//                       onClick={() => dossierType && setStep(2)}
//                       className={clsx('btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2', !dossierType && 'opacity-50 cursor-not-allowed')}
//                     >
//                       Continuer
//                       <ArrowRight size={16} />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 2: Details ── */}
//               {step === 2 && (
//                 <div className="animate-slide-up">
//                   <div className="card mb-4">
//                     <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Détails du dossier</h2>
//                     <p className="text-sm text-gray-400 mb-5">Plus vous êtes précis, meilleure sera la proposition de l'expert</p>
//                     <div className="mb-4">
//                       <label className="label">Titre du dossier *</label>
//                       <input className="input" placeholder="Ex: Rédaction contrat de distribution exclusive — zone CEDEAO"
//                         value={form.title} onChange={e => upd('title', e.target.value)} />
//                     </div>
//                     <div className="mb-4">
//                       <label className="label">Description détaillée *</label>
//                       <textarea className="input resize-none" rows={6}
//                         placeholder="Décrivez le contexte, l'objectif, les parties impliquées, les enjeux spécifiques, et toute contrainte réglementaire à prendre en compte…"
//                         value={form.description} onChange={e => upd('description', e.target.value)} />
//                       <p className="text-xs text-gray-300 text-right mt-1">{form.description.length}/3000</p>
//                     </div>
//                     <div className="mb-4">
//                       <label className="label">Pays / Juridiction(s) concerné(s) *</label>
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         {['Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Niger', 'Togo', 'Bénin', 'Guinée', 'Congo', 'Gabon', 'Toute la zone OHADA'].map(country => (
//                           <button
//                             key={country}
//                             onClick={() => {
//                               const list = form.countries
//                               upd('countries', list.includes(country) ? list.filter(c => c !== country) : [...list, country])
//                             }}
//                             className={clsx(
//                               'px-3 py-1 rounded-full text-xs font-medium border transition-all',
//                               form.countries.includes(country)
//                                 ? 'bg-navy-700 text-white border-navy-600'
//                                 : 'bg-white text-gray-500 border-gray-200 hover:border-navy-300'
//                             )}
//                           >
//                             {country}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="label">Documents existants (optionnel)</label>
//                       <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/30 transition-all group">
//                         <div className="flex justify-center mb-1.5">
//                           <FileText size={20} className="text-gray-300 group-hover:text-gold-400 transition-colors" />
//                         </div>
//                         <p className="text-sm font-medium text-navy-800">Joindre des documents</p>
//                         <p className="text-xs text-gray-400 mt-0.5">Contrats existants, statuts, documents de référence…</p>
//                         <p className="text-[11px] text-gray-300 mt-1">PDF, DOCX, JPG · Max 50 Mo total</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex justify-between">
//                     <button className="btn-outline inline-flex items-center gap-2" onClick={() => setStep(1)}>
//                       <ArrowLeft size={16} /> Retour
//                     </button>
//                     <button className="btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2" onClick={() => setStep(3)}>
//                       Continuer
//                       <ArrowRight size={16} />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 3: Budget & Deadline ── */}
//               {step === 3 && (
//                 <div className="animate-slide-up">
//                   <div className="card mb-4">
//                     <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Budget & délai</h2>
//                     <p className="text-sm text-gray-400 mb-5">Ces informations aident l'expert à préparer sa proposition</p>

//                     <div className="mb-5">
//                       <label className="label">Type de rémunération</label>
//                       <div className="grid grid-cols-3 gap-2.5">
//                         {[
//                           { value: 'fixed',  Icon: DollarSign, label: 'Forfait fixe',  desc: 'Prix total convenu' },
//                           { value: 'hourly', Icon: Clock,      label: 'Taux horaire',  desc: 'Facturation à l\'heure' },
//                           { value: 'open',   Icon: CheckCircle2, label: 'Ouvert',      desc: 'Laisser l\'expert proposer' },
//                         ].map(bt => (
//                           <button key={bt.value} onClick={() => upd('budgetType', bt.value)}
//                             className={clsx(
//                               'p-3 rounded-xl border-[1.5px] text-center transition-all',
//                               form.budgetType === bt.value ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300'
//                             )}>
//                             <div className="flex justify-center mb-1"><bt.Icon size={16} className="text-gray-400" /></div>
//                             <p className="text-sm font-semibold text-navy-800">{bt.label}</p>
//                             <p className="text-[11px] text-gray-400 mt-0.5">{bt.desc}</p>
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {form.budgetType !== 'open' && (
//                       <div className="mb-5">
//                         <label className="label">
//                           {form.budgetType === 'fixed' ? 'Budget total (FCFA ou €)' : 'Taux horaire souhaité'}
//                         </label>
//                         <div className="relative">
//                           <input className="input pr-16" placeholder={form.budgetType === 'fixed' ? 'Ex: 500 000' : 'Ex: 15 000'}
//                             value={form.budget} onChange={e => upd('budget', e.target.value)} />
//                           <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">FCFA</span>
//                         </div>
//                         <p className="text-xs text-gray-400 mt-1.5">
//                           Tarif habituel de {expert.name.split(' ')[0]} : <span className="font-semibold text-gold-600">{expert.rate}{expert.ratePeriod}</span>
//                         </p>
//                       </div>
//                     )}

//                     <div className="mb-5">
//                       <label className="label">Date limite souhaitée</label>
//                       <input type="date" className="input" value={form.deadline} onChange={e => upd('deadline', e.target.value)} />
//                       <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
//                         <input type="checkbox" className="accent-gold-500" checked={form.deadlineFlexible}
//                           onChange={e => upd('deadlineFlexible', e.target.checked)} />
//                         <span className="text-xs text-gray-500">La date est flexible — laisser l'expert proposer</span>
//                       </label>
//                     </div>

//                     <div className="mb-5">
//                       <label className="label">Priorité du dossier</label>
//                       <div className="grid grid-cols-3 gap-2.5">
//                         {[
//                           { value: 'normal', label: 'Normale',  color: 'text-gray-600' },
//                           { value: 'high',   label: 'Haute',    color: 'text-orange-600' },
//                           { value: 'urgent', label: 'Urgente',  color: 'text-red-600' },
//                         ].map(p => (
//                           <button key={p.value} onClick={() => upd('priority', p.value)}
//                             className={clsx(
//                               'py-2.5 rounded-xl border-[1.5px] text-sm font-semibold transition-all',
//                               form.priority === p.value ? `border-gold-500 bg-gold-50 ${p.color}` : 'border-gray-200 text-gray-500 hover:border-gold-300'
//                             )}>
//                             {p.label}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
//                       <label className="flex items-start gap-3 cursor-pointer">
//                         <input type="checkbox" className="accent-gold-500 mt-0.5" checked={form.confidential}
//                           onChange={e => upd('confidential', e.target.checked)} />
//                         <div>
//                           <p className="text-sm font-semibold text-navy-800 flex items-center gap-1.5">
//                             <Lock size={13} /> Dossier confidentiel
//                           </p>
//                           <p className="text-xs text-gray-400 mt-0.5">L'expert devra signer un accord de confidentialité (NDA) avant d'accéder aux détails complets du dossier</p>
//                         </div>
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex justify-between">
//                     <button className="btn-outline inline-flex items-center gap-2" onClick={() => setStep(2)}>
//                       <ArrowLeft size={16} /> Retour
//                     </button>
//                     <button className="btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2" onClick={() => setStep(4)}>
//                       Vérifier le récapitulatif
//                       <ArrowRight size={16} />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ── STEP 4: Summary ── */}
//               {step === 4 && (
//                 <div className="animate-slide-up">
//                   <div className="card mb-4">
//                     <div className="flex items-center gap-2.5 mb-5">
//                       <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
//                         <CheckCircle2 size={18} className="text-green-500" />
//                       </div>
//                       <div>
//                         <h2 className="font-display text-base font-semibold text-navy-800">Récapitulatif du dossier</h2>
//                         <p className="text-xs text-gray-400">Vérifiez les informations avant d'envoyer</p>
//                       </div>
//                     </div>

//                     {[
//                       ['Type', DOSSIER_TYPES.find(d => d.value === dossierType)?.label || '—'],
//                       ['Titre', form.title || '(Non renseigné)'],
//                       ['Pays', form.countries.join(', ') || '—'],
//                       ['Budget', form.budgetType === 'open' ? 'Ouvert (laisser l\'expert proposer)' : form.budget ? `${form.budget} FCFA` : '(Non renseigné)'],
//                       ['Délai', form.deadline || (form.deadlineFlexible ? 'Flexible' : 'Non défini')],
//                       ['Priorité', { normal: 'Normale', high: 'Haute', urgent: 'Urgente' }[form.priority]],
//                       ['Confidentiel', form.confidential ? 'Oui (NDA requis)' : 'Non'],
//                     ].map(([k, v]) => (
//                       <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
//                         <span className="text-gray-400">{k}</span>
//                         <span className="font-medium text-navy-800 text-right max-w-[60%]">{v}</span>
//                       </div>
//                     ))}

//                     {form.description && (
//                       <div className="mt-4">
//                         <p className="text-xs font-semibold text-gray-500 mb-2">Description</p>
//                         <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
//                           {form.description}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <Toast type="warning" icon={<AlertTriangle size={15} className="text-amber-500" />}>
//                     <div>
//                       <strong>Avant d'envoyer :</strong> une fois soumis, le dossier sera visible par{' '}
//                       <strong>{expert.name}</strong> qui pourra l'accepter, le refuser ou demander des précisions.
//                       Le paiement n'interviendra qu'après accord mutuel.
//                     </div>
//                   </Toast>

//                   <div className="flex justify-between mt-5">
//                     <button className="btn-outline inline-flex items-center gap-2" onClick={() => setStep(3)}>
//                       <ArrowLeft size={16} /> Modifier
//                     </button>
//                     <button className="btn-gold px-10 py-3.5 rounded-xl text-base inline-flex items-center gap-1.5" onClick={handleSubmit}>
//                       <Sparkles size={15} /> Soumettre le dossier
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* ── Expert sidebar ── */}
//             <aside>
//               <div className="card card-gold-accent sticky top-20">
//                 <p className="text-xs font-semibold text-gray-400 mb-3">Dossier proposé à</p>
//                 <div className="flex gap-3 items-center mb-4">
//                   <div className="relative">
//                     <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold border-2"
//                       style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
//                       {expert.initials}
//                     </div>
//                     {expert.verified && (
//                       <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
//                         <Check size={8} strokeWidth={3} />
//                       </span>
//                     )}
//                   </div>
//                   <div>
//                     <p className="font-display text-[15px] font-bold text-navy-900">{expert.name}</p>
//                     <p className="text-xs text-gray-400">{expert.role}</p>
//                     <div className="mt-1 flex items-center gap-1.5">
//                       <SubBadge plan={expert.plan} />
//                     </div>
//                   </div>
//                 </div>
//                 <Stars rating={expert.rating} reviews={expert.reviews} />

//                 <div className="mt-4 flex flex-col gap-1.5">
//                   {[
//                     { Icon: Clock,      label: 'Réponse',      val: expert.responseTime },
//                     { Icon: CheckCircle2, label: 'Taux succès', val: `${expert.successRate}%` },
//                     { Icon: MapPin,     label: 'Localisation',  val: expert.location },
//                     { Icon: DollarSign, label: 'Tarif habituel', val: expert.rate },
//                   ].map(({ Icon, label, val }) => (
//                     <div key={label} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
//                       <span className="text-gray-400 flex items-center gap-1"><Icon size={11} /> {label}</span>
//                       <span className="font-medium text-navy-800">{val}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-5 bg-navy-900 rounded-xl p-4 border border-gold-500/15">
//                   <p className="text-xs font-bold text-gold-400 mb-3">Comment ça se passe ?</p>
//                   {[
//                     '1. Vous soumettez le dossier',
//                     '2. L\'expert examine et répond',
//                     '3. Vous discutez les modalités',
//                     '4. Accord → paiement escrow',
//                     '5. Exécution & validation',
//                   ].map(s => (
//                     <p key={s} className="text-[11px] text-white/50 py-1">{s}</p>
//                   ))}
//                 </div>

//                 <Link href={`/profile/${expert.id}`} className="btn-outline w-full justify-center mt-4 text-xs">
//                   Voir le profil complet
//                 </Link>
//               </div>
//             </aside>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }


// app/propose/[id]/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { SubBadge, Stars, ProgressBar } from '@/components/ui'
import clsx from 'clsx'
import {
  ArrowLeft, ArrowRight, FileText, Building2, Scale,
  CheckCircle2, Rocket, Briefcase, Landmark, Search,
  Clock, MapPin, DollarSign, AlertTriangle, Lock,
  PartyPopper, BarChart2, MessageSquare, Sparkles,
  Check, Loader2, Upload, X, Shield,
} from 'lucide-react'

// ── Firebase ────────────────────────────────────────────────────────────────
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, addDoc, collection,
  serverTimestamp, updateDoc, increment,
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL,
} from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'

// ── Constantes ───────────────────────────────────────────────────────────────
const DOSSIER_TYPES = [
  { value: 'contract',      Icon: FileText,     label: 'Rédaction de contrat',          desc: 'Contrat commercial, bail, partenariat, franchise…' },
  { value: 'restructuring', Icon: Building2,    label: "Restructuration d'entreprise",  desc: 'Fusion, acquisition, transformation juridique' },
  { value: 'litigation',    Icon: Scale,        label: 'Litige & arbitrage',            desc: 'Arbitrage CCJA, médiation, contentieux commercial' },
  { value: 'compliance',    Icon: CheckCircle2, label: 'Mise en conformité OHADA',      desc: 'Audit, conformité réglementaire, SYSCOHADA' },
  { value: 'creation',      Icon: Rocket,       label: "Création d'entreprise",         desc: 'Immatriculation RCCM, statuts, capital social' },
  { value: 'hr',            Icon: Briefcase,    label: 'Droit du travail & RH',         desc: 'CDI/CDD, règlement intérieur, licenciement' },
  { value: 'banking',       Icon: Landmark,     label: 'Droit bancaire & financier',    desc: 'Contrats de financement, sûretés, garanties' },
  { value: 'other',         Icon: Search,       label: 'Autre / Sur mesure',            desc: 'Décrivez votre besoin spécifique' },
]

const COUNTRIES = [
  "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali',
  'Burkina Faso', 'Niger', 'Togo', 'Bénin',
  'Guinée', 'Congo', 'Gabon', 'Toute la zone OHADA',
]

const STEPS_LABELS = ['Type de dossier', 'Détails & contexte', 'Budget & délai', 'Récapitulatif']

// ── Helpers ──────────────────────────────────────────────────────────────────
function getDisplayName(u) {
  if (!u) return '—'
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Expert'
}

function getInitials(u) {
  const name = getDisplayName(u)
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `#DOS-${year}-${rand}`
}

// ── Composant : étape indicateur ─────────────────────────────────────────────
function StepIndicator({ step }) {
  return (
    <div className="flex justify-between">
      {STEPS_LABELS.map((label, i) => (
        <div key={label} className={clsx(
          'text-[11px] font-medium flex items-center gap-0.5',
          i + 1 === step ? 'text-gold-600' : i + 1 < step ? 'text-green-600' : 'text-gray-300'
        )}>
          {i + 1 < step && <Check size={10} strokeWidth={3} />}
          {label}
        </div>
      ))}
    </div>
  )
}

// ── Composant : avatar expert ─────────────────────────────────────────────────
function ExpertAvatar({ expert, size = 14 }) {
  const initials = getInitials(expert)
  return (
    <div className="relative flex-shrink-0">
      {expert?.photoURL ? (
        <img src={expert.photoURL} alt={getDisplayName(expert)}
          className={`w-${size} h-${size} rounded-full object-cover border-2 border-gold-100`} />
      ) : (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center font-display text-xl font-bold border-2`}
          style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF' }}>
          {initials}
        </div>
      )}
      {expert?.verified && (
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white">
          <Check size={8} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProposePage({ params }) {
  const router    = useRouter()
  const targetId  = params.id

  const [authUser,   setAuthUser]   = useState(undefined)
  const [expert,     setExpert]     = useState(null)
  const [myProfile,  setMyProfile]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [dosRef,     setDosRef]     = useState('')
  const [error,      setError]      = useState(null)

  const [step,        setStep]        = useState(1)
  const [dossierType, setDossierType] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])   // { name, size, url }
  const [uploading,     setUploading]     = useState(false)

  const [form, setForm] = useState({
    title: '', description: '',
    countries: ["Côte d'Ivoire"],
    budget: '', budgetType: 'fixed',
    deadline: '', deadlineFlexible: false,
    priority: 'normal', confidential: false,
  })

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const progress = ((step - 1) / (STEPS_LABELS.length - 1)) * 100

  // ── Auth + profils ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setAuthUser(user ?? null)
      if (!user) { setLoading(false); return }

      try {
        const [expertSnap, mySnap] = await Promise.all([
          getDoc(doc(db, 'users', targetId)),
          getDoc(doc(db, 'users', user.uid)),
        ])
        if (!expertSnap.exists()) { setError("Expert introuvable."); setLoading(false); return }
        setExpert({ id: targetId, ...expertSnap.data() })
        setMyProfile(mySnap.exists() ? { uid: user.uid, ...mySnap.data() } : { uid: user.uid, email: user.email })
      } catch (e) {
        setError("Erreur de chargement.")
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [targetId])

  // ── Upload fichiers ─────────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const totalSize = files.reduce((s, f) => s + f.size, 0)
    if (totalSize > 50 * 1024 * 1024) {
      setError("Total fichiers > 50 Mo"); return
    }

    setUploading(true)
    try {
      const uploaded = await Promise.all(files.map(async file => {
        const storageRef = ref(storage, `dossiers/${authUser.uid}/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return {
          name: file.name,
          size: `${Math.round(file.size / 1024)} Ko`,
          url,
        }
      }))
      setUploadedFiles(prev => [...prev, ...uploaded])
    } catch {
      setError("Erreur lors de l'upload.")
    } finally {
      setUploading(false)
    }
  }

  // ── Soumission Firestore ────────────────────────────────────────────────
  async function handleSubmit() {
    if (!authUser || !expert) return
    setSubmitting(true)
    setError(null)

    const ref_ = generateRef()

    try {
      // 1. Crée le dossier
      const dossierRef = await addDoc(collection(db, 'dossiers'), {
        ref: ref_,
        type: dossierType,
        title: form.title,
        description: form.description,
        countries: form.countries,
        budget: form.budget,
        budgetType: form.budgetType,
        deadline: form.deadline,
        deadlineFlexible: form.deadlineFlexible,
        priority: form.priority,
        confidential: form.confidential,
        documents: uploadedFiles,
        clientId: authUser.uid,
        clientName: getDisplayName(myProfile),
        expertId: expert.id,
        expertName: getDisplayName(expert),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // 2. Notification à l'expert
      await addDoc(collection(db, 'notifications'), {
        userId: expert.id,
        type: 'new_dossier',
        text: `Nouveau dossier de ${getDisplayName(myProfile)} : "${form.title}"`,
        dossierRef: ref_,
        dossierId: dossierRef.id,
        unread: true,
        dot: 'gold',
        time: 'À l\'instant',
        createdAt: serverTimestamp(),
      })

      // 3. Message automatique dans la conversation
      // Cherche ou crée une conversation
      const { getOrCreateConversation } = await import('@/lib/conversations')
      const convId = await getOrCreateConversation(authUser.uid, expert.id)

      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        text: `📋 Nouveau dossier soumis : "${form.title}" (${ref_})\nType : ${DOSSIER_TYPES.find(d => d.value === dossierType)?.label}\nPriorité : ${{ normal: 'Normale', high: 'Haute', urgent: 'Urgente' }[form.priority]}`,
        senderId: authUser.uid,
        type: 'dossier',
        dossierId: dossierRef.id,
        dossierRef: ref_,
        createdAt: serverTimestamp(),
        read: false,
      })

      await updateDoc(doc(db, 'conversations', convId), {
        lastMessage: `📋 Dossier soumis : "${form.title}"`,
        lastMessageAt: serverTimestamp(),
        lastSenderId: authUser.uid,
        [`unread.${expert.id}`]: increment(1),
      })

      setDosRef(ref_)
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      setError("Erreur lors de la soumission. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── États ───────────────────────────────────────────────────────────────
  if (authUser === undefined || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gold-500" />
        </div>
      </>
    )
  }

  if (authUser === null) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4 px-6">
          <Lock size={36} className="text-gray-300" />
          <p className="font-semibold text-navy-700">Connectez-vous pour proposer un dossier</p>
          <Link href="/login" className="btn-gold btn-sm">Se connecter</Link>
        </div>
      </>
    )
  }

  if (error && !expert) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4 px-6">
          <AlertTriangle size={36} className="text-amber-400" />
          <p className="font-semibold text-navy-700">{error}</p>
          <button onClick={() => router.back()} className="btn-outline btn-sm">Retour</button>
        </div>
      </>
    )
  }

  // ── Succès ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-6">
          <div className="max-w-lg w-full">
            <div className="card text-center mb-4" style={{ background: 'linear-gradient(135deg, #152B47, #1F3D67)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
                <PartyPopper size={32} className="text-gold-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Dossier soumis !</h1>
              <p className="text-white/50 text-sm mb-6">
                Votre proposition a été transmise à{' '}
                <span className="text-gold-400 font-semibold">{getDisplayName(expert)}</span>
              </p>

              <div className="bg-white/[0.06] border border-white/10 rounded-xl p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Référence dossier</p>
                    <p className="text-white font-mono font-semibold">{dosRef}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Statut</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-400 text-xs font-semibold border border-gold-500/30">
                      <Clock size={10} /> En attente de réponse
                    </span>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Expert</p>
                    <p className="text-white/80 font-semibold">{getDisplayName(expert)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Réponse estimée</p>
                    <p className="text-white/80 font-semibold">{expert?.responseTime ?? '24–48h'}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/30 mb-6">
                Vous serez notifié dans votre tableau de bord dès que{' '}
                {getDisplayName(expert).split(' ')[0]} répond.
              </p>

              <div className="flex flex-col gap-2.5">
                <Link href="/dashboard" className="btn-gold w-full justify-center py-3 rounded-xl inline-flex items-center gap-1.5">
                  <BarChart2 size={15} /> Suivre dans le tableau de bord
                </Link>
                <Link href="/messages" className="w-full justify-center py-2.5 rounded-xl text-sm inline-flex items-center gap-1.5 border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 transition-all">
                  <MessageSquare size={14} /> Aller à la messagerie
                </Link>
              </div>
            </div>
            <Link href="/search" className="block text-center text-sm text-gray-400 hover:text-gold-600 transition-colors">
              <ArrowLeft size={13} className="inline mr-1" /> Retour à la recherche
            </Link>
          </div>
        </div>
      </>
    )
  }

  const expertName = getDisplayName(expert)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/search" className="hover:text-gold-600">Recherche</Link>
            <span>›</span>
            <Link href={`/profile/${expert?.id}`} className="hover:text-gold-600">{expertName}</Link>
            <span>›</span>
            <span className="text-navy-700 font-medium">Proposer un dossier</span>
          </div>

          {/* Erreur non-bloquante */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}

          {/* Progress */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-display text-lg font-bold text-navy-900">Nouveau dossier</h1>
              <span className="text-xs text-gray-400">Étape {step} / {STEPS_LABELS.length}</span>
            </div>
            <ProgressBar value={progress} className="mb-3" />
            <StepIndicator step={step} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div>

              {/* ── STEP 1 : Type ── */}
              {step === 1 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Type de dossier</h2>
                    <p className="text-sm text-gray-400 mb-5">Choisissez la catégorie qui correspond à votre besoin</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {DOSSIER_TYPES.map(({ value, Icon, label, desc }) => (
                        <button key={value} onClick={() => setDossierType(value)}
                          className={clsx(
                            'flex items-start gap-3 p-4 rounded-xl border-[1.5px] text-left transition-all',
                            dossierType === value
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/30'
                          )}
                          style={dossierType === value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.12)' } : undefined}>
                          <Icon size={18} className={clsx('flex-shrink-0 mt-0.5', dossierType === value ? 'text-gold-600' : 'text-gray-400')} />
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => dossierType && setStep(2)}
                      className={clsx('btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2', !dossierType && 'opacity-50 cursor-not-allowed')}
                    >
                      Continuer <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2 : Détails ── */}
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
                        placeholder="Décrivez le contexte, l'objectif, les parties impliquées, les enjeux spécifiques…"
                        value={form.description} onChange={e => upd('description', e.target.value.slice(0, 3000))} />
                      <p className={clsx('text-xs text-right mt-1', form.description.length > 2800 ? 'text-amber-500' : 'text-gray-300')}>
                        {form.description.length}/3000
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="label">Pays / Juridiction(s) concerné(s) *</label>
                      <div className="flex flex-wrap gap-2">
                        {COUNTRIES.map(country => (
                          <button key={country}
                            onClick={() => {
                              const list = form.countries
                              upd('countries', list.includes(country) ? list.filter(c => c !== country) : [...list, country])
                            }}
                            className={clsx(
                              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                              form.countries.includes(country)
                                ? 'bg-navy-700 text-white border-navy-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-navy-300'
                            )}>
                            {country}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload documents */}
                    <div>
                      <label className="label">Documents existants (optionnel)</label>
                      <label className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/30 transition-all group block">
                        <input type="file" multiple accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        <div className="flex justify-center mb-1.5">
                          {uploading
                            ? <Loader2 size={20} className="text-gold-400 animate-spin" />
                            : <Upload size={20} className="text-gray-300 group-hover:text-gold-400 transition-colors" />}
                        </div>
                        <p className="text-sm font-medium text-navy-800">
                          {uploading ? 'Téléversement en cours…' : 'Cliquez pour joindre des documents'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Contrats existants, statuts, documents de référence…</p>
                        <p className="text-[11px] text-gray-300 mt-1">PDF, DOCX, JPG · Max 50 Mo total</p>
                      </label>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {uploadedFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-xl text-xs">
                              <FileText size={13} className="text-gold-600 flex-shrink-0" />
                              <span className="flex-1 font-medium text-navy-800 truncate">{f.name}</span>
                              <span className="text-gray-400">{f.size}</span>
                              <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 transition-colors">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button className="btn-outline inline-flex items-center gap-2" onClick={() => setStep(1)}>
                      <ArrowLeft size={16} /> Retour
                    </button>
                    <button
                      onClick={() => form.title.trim() && setStep(3)}
                      className={clsx('btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2', !form.title.trim() && 'opacity-50 cursor-not-allowed')}
                    >
                      Continuer <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3 : Budget & délai ── */}
              {step === 3 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <h2 className="font-display text-base font-semibold text-navy-800 mb-1">Budget & délai</h2>
                    <p className="text-sm text-gray-400 mb-5">Ces informations aident l'expert à préparer sa proposition</p>

                    <div className="mb-5">
                      <label className="label">Type de rémunération</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'fixed',  Icon: DollarSign,   label: 'Forfait fixe',  desc: 'Prix total convenu' },
                          { value: 'hourly', Icon: Clock,         label: 'Taux horaire',  desc: "Facturation à l'heure" },
                          { value: 'open',   Icon: CheckCircle2,  label: 'Ouvert',        desc: "Laisser l'expert proposer" },
                        ].map(bt => (
                          <button key={bt.value} onClick={() => upd('budgetType', bt.value)}
                            className={clsx(
                              'p-3 rounded-xl border-[1.5px] text-center transition-all',
                              form.budgetType === bt.value ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300'
                            )}>
                            <div className="flex justify-center mb-1"><bt.Icon size={16} className="text-gray-400" /></div>
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
                        {expert?.hourlyRate && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            Tarif habituel de {expertName.split(' ')[0]} :{' '}
                            <span className="font-semibold text-gold-600">
                              {Number(expert.hourlyRate).toLocaleString()} FCFA / heure
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mb-5">
                      <label className="label">Date limite souhaitée</label>
                      <input type="date" className="input" value={form.deadline}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => upd('deadline', e.target.value)} />
                      <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                        <input type="checkbox" className="accent-gold-500" checked={form.deadlineFlexible}
                          onChange={e => upd('deadlineFlexible', e.target.checked)} />
                        <span className="text-xs text-gray-500">La date est flexible — laisser l'expert proposer</span>
                      </label>
                    </div>

                    <div className="mb-5">
                      <label className="label">Priorité du dossier</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'normal', label: 'Normale', color: 'text-gray-600',  bg: '' },
                          { value: 'high',   label: 'Haute',   color: 'text-orange-600', bg: '' },
                          { value: 'urgent', label: 'Urgente', color: 'text-red-600',    bg: '' },
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

                    <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="accent-gold-500 mt-0.5" checked={form.confidential}
                          onChange={e => upd('confidential', e.target.checked)} />
                        <div>
                          <p className="text-sm font-semibold text-navy-800 flex items-center gap-1.5">
                            <Shield size={13} /> Dossier confidentiel
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            L'expert devra signer un accord de confidentialité (NDA) avant d'accéder aux détails complets
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button className="btn-outline inline-flex items-center gap-2" onClick={() => setStep(2)}>
                      <ArrowLeft size={16} /> Retour
                    </button>
                    <button className="btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2" onClick={() => setStep(4)}>
                      Vérifier le récapitulatif <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4 : Récapitulatif ── */}
              {step === 4 && (
                <div className="animate-slide-up">
                  <div className="card mb-4">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-green-500" />
                      </div>
                      <div>
                        <h2 className="font-display text-base font-semibold text-navy-800">Récapitulatif</h2>
                        <p className="text-xs text-gray-400">Vérifiez les informations avant d'envoyer</p>
                      </div>
                    </div>

                    {[
                      ['Type',        DOSSIER_TYPES.find(d => d.value === dossierType)?.label ?? '—'],
                      ['Titre',       form.title || '(Non renseigné)'],
                      ['Pays',        form.countries.join(', ') || '—'],
                      ['Budget',      form.budgetType === 'open' ? "Ouvert — laisser l'expert proposer" : form.budget ? `${form.budget} FCFA` : '(Non renseigné)'],
                      ['Délai',       form.deadline || (form.deadlineFlexible ? 'Flexible' : 'Non défini')],
                      ['Priorité',    { normal: 'Normale', high: 'Haute', urgent: 'Urgente' }[form.priority]],
                      ['Confidentiel',form.confidential ? 'Oui (NDA requis)' : 'Non'],
                      ['Documents',   uploadedFiles.length > 0 ? `${uploadedFiles.length} fichier(s) joint(s)` : 'Aucun'],
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

                  {/* Avertissement */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex gap-2.5 mb-5">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <strong>Avant d'envoyer :</strong> une fois soumis, le dossier sera visible par{' '}
                      <strong>{expertName}</strong> qui pourra l'accepter, le refuser ou demander des précisions.
                      Le paiement n'interviendra qu'après accord mutuel.
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button className="btn-outline inline-flex items-center gap-2" onClick={() => setStep(3)}>
                      <ArrowLeft size={16} /> Modifier
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-gold px-10 py-3.5 rounded-xl text-base inline-flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {submitting
                        ? <><Loader2 size={15} className="animate-spin" /> Envoi en cours…</>
                        : <><Sparkles size={15} /> Soumettre le dossier</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar expert ── */}
            <aside>
              <div className="card sticky top-20" style={{ borderTop: '3px solid #C9A84C' }}>
                <p className="text-xs font-semibold text-gray-400 mb-3">Dossier proposé à</p>
                <div className="flex gap-3 items-center mb-4">
                  <ExpertAvatar expert={expert} size={14} />
                  <div>
                    <p className="font-display text-[15px] font-bold text-navy-900">{expertName}</p>
                    <p className="text-xs text-gray-400">{expert?.speciality}</p>
                    <div className="mt-1"><SubBadge plan={expert?.plan} /></div>
                  </div>
                </div>
                <Stars rating={expert?.rating ?? 5} reviews={expert?.reviews ?? 0} />

                <div className="mt-4 flex flex-col gap-0">
                  {[
                    { Icon: Clock,        label: 'Réponse',       val: expert?.responseTime ?? '24–48h' },
                    { Icon: CheckCircle2, label: 'Taux de succès', val: expert?.successRate ? `${expert.successRate}%` : '—' },
                    { Icon: MapPin,       label: 'Localisation',   val: expert?.country ?? '—' },
                    { Icon: DollarSign,   label: 'Tarif',          val: expert?.hourlyRate ? `${Number(expert.hourlyRate).toLocaleString()} FCFA/h` : 'Sur demande' },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 flex items-center gap-1"><Icon size={11} /> {label}</span>
                      <span className="font-medium text-navy-800">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 bg-navy-900 rounded-xl p-4 border border-gold-500/15">
                  <p className="text-xs font-bold text-gold-400 mb-3">Comment ça se passe ?</p>
                  {[
                    '1. Vous soumettez le dossier',
                    "2. L'expert examine et répond",
                    '3. Vous discutez les modalités',
                    '4. Accord → paiement escrow',
                    '5. Exécution & validation',
                  ].map(s => (
                    <p key={s} className="text-[11px] text-white/50 py-0.5">{s}</p>
                  ))}
                </div>

                <Link href={`/profile/${expert?.id}`} className="btn-outline w-full justify-center mt-4 text-xs">
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
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ROLES } from '@/lib/data'
import { DividerOr } from '@/components/ui'
import clsx from 'clsx'
import {
  Scale, Calculator, Search, Building2, Briefcase, GraduationCap,
  Info, FolderOpen, Check, Sparkles, ChevronRight, ArrowLeft,
} from 'lucide-react'

const STEPS = ['Informations personnelles', 'Choisir votre statut', 'Soumettre vos justificatifs', 'Validation par Abakoré (24–72h)']

const ROLE_ICONS = {
  lawyer:     Scale,
  accountant: Calculator,
  consultant: Search,
  company:    Building2,
  hr:         Briefcase,
  student:    GraduationCap,
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('lawyer')
  const router = useRouter()

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden md:flex flex-col justify-between bg-navy-900 p-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 20% 40%, rgba(37,74,122,0.6) 0%, transparent 65%)' }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 shadow-gold">A</div>
            <span className="font-display text-xl font-bold text-gold-500">Abakoré</span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-white leading-snug max-w-xs">
            Rejoignez la communauté{' '}
            <span className="text-gold-400">OHADA</span>{' '}
            de référence
          </h2>
          <div className="mt-8">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gold-500/50 mb-4">Processus d'inscription</p>
            <div className="flex flex-col gap-3">
              {STEPS.map((label, i) => {
                const done = i + 1 < step
                const active = i + 1 === step
                return (
                  <div key={label} className={clsx('flex gap-3 items-center', !active && !done && 'opacity-40')}>
                    <div className={clsx(
                      'w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold',
                      done   && 'bg-green-500 text-white',
                      active && 'bg-gold-500 text-navy-900',
                      !done && !active && 'bg-white/[0.06] border border-white/12 text-white/40',
                    )}>
                      {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                    </div>
                    <span className={clsx('text-[13px]', (active || done) ? 'text-white/80' : 'text-white/40')}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <p className="relative z-10 text-[11px] text-white/20">© 2025 Abakoré</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3].map(n => (
              <div key={n} className={clsx('h-1 flex-1 rounded-full transition-all duration-300', n === step ? 'bg-gold-500' : n < step ? 'bg-gold-400' : 'bg-gray-100')} />
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Créez votre compte</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 1 / 3 — Vos informations</p>
              <button className="w-full flex items-center justify-center gap-2.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all mb-3">
                <span className="text-lg font-bold">G</span> S'inscrire avec Google
              </button>
              <DividerOr />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="label">Prénom</label><input className="input" placeholder="Jean" /></div>
                <div><label className="label">Nom</label><input className="input" placeholder="Dupont" /></div>
              </div>
              <div className="mb-4"><label className="label">Email professionnel</label><input type="email" className="input" placeholder="jean@cabinet.com" /></div>
              <div className="mb-4"><label className="label">Mot de passe</label><input type="password" className="input" placeholder="Minimum 8 caractères" /></div>
              <div className="mb-6">
                <label className="label">Pays d'exercice</label>
                <select className="input">
                  {['Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Guinée', 'Niger', 'Togo', 'Bénin', 'Congo'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn-gold w-full justify-center py-3 rounded-xl inline-flex items-center gap-2" onClick={() => setStep(2)}>
                Continuer <ChevronRight size={15} />
              </button>
              <p className="text-center text-sm text-gray-400 mt-4">
                Déjà un compte ? <Link href="/auth/login" className="font-semibold text-gold-600">Connexion</Link>
              </p>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Votre statut professionnel</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 2 / 3 — Vous pourrez le modifier ultérieurement</p>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {ROLES.map(role => {
                  const Icon = ROLE_ICONS[role.value] || Scale
                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={clsx(
                        'border-[1.5px] rounded-xl p-3.5 text-left transition-all',
                        selectedRole === role.value
                          ? 'border-gold-500 bg-gold-50 shadow-sm'
                          : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50',
                      )}
                      style={selectedRole === role.value ? { boxShadow: '0 0 0 3px rgba(201,168,76,0.14)' } : undefined}
                    >
                      <div className="w-8 h-8 mb-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                        <Icon size={16} />
                      </div>
                      <div className="text-[13px] font-semibold text-navy-800">{role.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{role.desc}</div>
                    </button>
                  )
                })}
              </div>
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-xs text-gold-700 mb-5 flex gap-2 items-start">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-gold-500" />
                Les statuts Avocat, Expert-Comptable et Consultant requièrent une vérification par document. Votre profil sera visible après validation (24–72h ouvrées).
              </div>
              <div className="flex gap-2.5">
                <button className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button className="btn-gold flex-1 justify-center py-3 rounded-xl inline-flex items-center gap-2" onClick={() => setStep(3)}>
                  Continuer <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="animate-slide-up">
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Justificatifs</h1>
              <p className="text-sm text-gray-400 mb-6">Étape 3 / 3 — Déposez vos documents de certification</p>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center mb-5 cursor-pointer hover:border-gold-400 hover:bg-gold-50/50 transition-all group">
                <div className="flex justify-center mb-3 text-gray-300 group-hover:text-gold-400 transition-colors">
                  <FolderOpen size={36} />
                </div>
                <p className="text-sm font-semibold text-navy-800 mb-1">Glissez vos documents ici</p>
                <p className="text-xs text-gray-400">ou <span className="text-gold-600 font-semibold group-hover:text-gold-700">cliquez pour sélectionner</span></p>
                <p className="text-[11px] text-gray-300 mt-2">PDF, JPG, PNG · Max 10 Mo par fichier</p>
              </div>
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 mb-2">Documents acceptés :</p>
                <div className="flex flex-col gap-1.5">
                  {['Carte professionnelle du barreau', 'Diplôme ou attestation professionnelle', 'Pièce d\'identité nationale'].map(d => (
                    <div key={d} className="flex items-center gap-2 text-[13px] text-gray-500">
                      <Check size={13} className="text-gold-500 flex-shrink-0" /> {d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2.5">
                <button className="btn-outline flex-shrink-0 inline-flex items-center gap-1.5" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button className="btn-gold flex-1 justify-center py-3 rounded-xl inline-flex items-center gap-2" onClick={() => router.push('/dashboard')}>
                  <Sparkles size={15} /> Créer mon compte
                </button>
              </div>
              <p className="text-[11px] text-gray-300 text-center mt-4 leading-relaxed">
                En créant un compte, vous acceptez les{' '}
                <Link href="/cgu" className="text-gold-600">Conditions d'utilisation</Link> et la{' '}
                <Link href="/privacy" className="text-gold-600">Politique de confidentialité</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

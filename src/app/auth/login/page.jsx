import Link from 'next/link'
import { DividerOr } from '@/components/ui'
import { Scale, Lock, Bot, LogIn } from 'lucide-react'

export const metadata = { title: 'Connexion — Abakoré' }

export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden md:flex flex-col justify-between bg-navy-900 p-12 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 80% at 20% 40%, rgba(37,74,122,0.6) 0%, transparent 65%), radial-gradient(ellipse 40% 50% at 80% 80%, rgba(201,168,76,0.07) 0%, transparent 60%)'
        }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 shadow-gold">A</div>
            <span className="font-display text-xl font-bold text-gold-500">Abakoré</span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-white leading-snug max-w-xs">
            Connectez-vous à l'expertise{' '}
            <span className="text-gold-400">OHADA</span>{' '}
            dont vous avez besoin
          </h2>
          <div className="mt-8 flex flex-col gap-4">
            {[
              { Icon: Scale, title: '2 400+ experts vérifiés', body: 'Avocats, comptables, consultants certifiés dans tout l\'espace OHADA' },
              { Icon: Lock,  title: 'Paiement 100% sécurisé', body: 'Système d\'escrow — vos fonds sont protégés jusqu\'à validation' },
              { Icon: Bot,   title: 'IA OHADA intégrée',       body: 'Posez vos questions juridiques et obtenez des réponses sourcées' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gold-500/12 border border-gold-500/20 flex items-center justify-center text-gold-400"><Icon size={16} /></div>
                <div>
                  <strong className="text-[13px] text-white/90 block">{title}</strong>
                  <span className="text-[12px] text-white/50 leading-snug">{body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-[11px] text-white/20">© 2025 Abakoré · Droit OHADA / UEMOA</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 text-sm shadow-gold">A</div>
            <span className="font-display text-lg font-bold text-gold-600">Abakoré</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Bon retour !</h1>
          <p className="text-sm text-gray-400 mb-7">Connectez-vous à votre espace Abakoré</p>

          <button className="w-full flex items-center justify-center gap-2.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4">
            <span className="text-lg leading-none">G</span> Continuer avec Google
          </button>
          <DividerOr />

          <form className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input type="email" placeholder="vous@exemple.com" className="input" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" placeholder="••••••••" className="input" />
            </div>
            <div className="text-right">
              <Link href="/auth/forgot" className="text-xs font-semibold text-gold-600 hover:text-gold-700">Mot de passe oublié ?</Link>
            </div>
            <button type="submit" className="btn-gold w-full justify-center py-3 text-sm rounded-xl inline-flex items-center gap-2"><LogIn size={15} /> Connexion</button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="font-semibold text-gold-600 hover:text-gold-700">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

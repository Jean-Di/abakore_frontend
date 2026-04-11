'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 text-sm shadow-gold">A</div>
          <span className="font-display text-lg font-bold text-gold-600">Abakoré</span>
        </Link>

        {!sent ? (
          <>
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Mot de passe oublié</h1>
            <p className="text-sm text-gray-400 mb-7">
              Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={e => { e.preventDefault(); if (email) setSent(true) }} className="space-y-4">
              <div>
                <label className="label">Adresse email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    className="input pl-9"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn-gold w-full justify-center py-3 text-sm rounded-xl">
                Envoyer le lien
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 size={44} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-navy-900 mb-2">Email envoyé !</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Si un compte existe pour <strong className="text-navy-700">{email}</strong>, vous recevrez un lien de réinitialisation sous quelques minutes.
            </p>
            <p className="text-xs text-gray-300">Vérifiez aussi vos spams.</p>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 font-semibold text-gold-600 hover:text-gold-700">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}

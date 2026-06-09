'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DividerOr } from '@/components/ui';
import { Scale, Lock, Bot, LogIn, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, resetPassword } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mode, setMode]         = useState('login'); // 'login' | 'forgot'
  const [resetSent, setResetSent] = useState(false);

  // Messages d'erreur Firebase → français
  function friendlyError(code) {
    const map = {
      'auth/user-not-found':      'Aucun compte associé à cet email.',
      'auth/wrong-password':      'Mot de passe incorrect.',
      'auth/invalid-email':       'Adresse email invalide.',
      'auth/too-many-requests':   'Trop de tentatives. Réessayez plus tard.',
      'auth/invalid-credential':  'Email ou mot de passe incorrect.',
      'auth/popup-closed-by-user':'Connexion Google annulée.',
    };
    return map[code] ?? 'Une erreur est survenue. Réessayez.';
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel — inchangé */}
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
        <p className="relative z-10 text-xs text-white/55">© 2026 Abakoré · Droit OHADA / UEMOA</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-display font-bold text-navy-900 text-sm shadow-gold">A</div>
            <span className="font-display text-lg font-bold text-gold-600">Abakoré</span>
          </div>

          {mode === 'login' ? (
            <>
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Bon retour !</h1>
              <p className="text-sm text-gray-400 mb-7">Connectez-vous à votre espace Abakoré</p>

              {/* Bouton Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.8 39.7 16.4 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C40.9 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
                </svg>
                Continuer avec Google
              </button>

              <DividerOr />

              {/* Formulaire email/password */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="label">Adresse email</label>
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs font-semibold text-gold-600 hover:text-gold-700"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg p-3">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full justify-center py-3 text-sm rounded-xl inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Connexion…</>
                    : <><LogIn size={15} /> Connexion</>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="font-semibold text-gold-600 hover:text-gold-700">Créer un compte</Link>
              </p>
            </>
          ) : (
            /* Vue mot de passe oublié */
            <>
              <button
                onClick={() => { setMode('login'); setResetSent(false); setError(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
              >
                ← Retour à la connexion
              </button>

              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Mot de passe oublié</h1>
              <p className="text-sm text-gray-400 mb-7">
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
              </p>

              {resetSent ? (
                <div className="flex items-start gap-3 text-green-700 bg-green-50 border border-green-200 rounded-xl p-4">
                  <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm">Email envoyé !</strong>
                    <span className="text-xs">Vérifiez votre boîte mail (et les spams) pour le lien de réinitialisation.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="label">Adresse email</label>
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      className="input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg p-3">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full justify-center py-3 text-sm rounded-xl inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading
                      ? <><Loader2 size={15} className="animate-spin" /> Envoi…</>
                      : 'Envoyer le lien'
                    }
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
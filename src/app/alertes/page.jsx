'use client'
import Link from 'next/link'
import { Bell, ArrowLeft, Clock, CalendarDays, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AlertesPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Bell size={28} className="text-amber-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold mb-4">
          <Clock size={11} /> Bientôt disponible
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
          Alertes &amp; Échéances
        </h1>
        <p className="text-white/60 text-[15px] leading-relaxed mb-8">
          Gérez vos échéances légales et fiscales en un seul endroit. Ne manquez plus jamais
          une date limite réglementaire grâce aux rappels automatiques.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { Icon: CalendarDays,   label: 'Calendrier légal',      desc: 'Dates importantes centralisées' },
            { Icon: AlertTriangle,  label: 'Rappels automatiques',  desc: 'J-30, J-7, J-1' },
            { Icon: CheckCircle,    label: 'Suivi des obligations', desc: 'Validation par équipe' },
          ].map(({ Icon, label, desc }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-left">
              <Icon size={16} className="text-gold-400 mb-2" />
              <p className="text-[13px] font-semibold text-white/80">{label}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors">
          <ArrowLeft size={14} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

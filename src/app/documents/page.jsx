'use client'
import Link from 'next/link'
import { FolderOpen, ArrowLeft, Clock, Upload, Lock, Search } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <FolderOpen size={28} className="text-green-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold mb-4">
          <Clock size={11} /> Bientôt disponible
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
          Coffre-fort documentaire
        </h1>
        <p className="text-white/60 text-[15px] leading-relaxed mb-8">
          Stockez, organisez et partagez vos documents juridiques en toute sécurité.
          Contrats, statuts, actes OHADA — tout en un espace chiffré et auditable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { Icon: Upload, label: 'Import facile',         desc: 'PDF, Word, images' },
            { Icon: Lock,   label: 'Stockage chiffré',      desc: 'Sécurité renforcée' },
            { Icon: Search, label: 'Recherche intelligente', desc: 'Plein texte & IA' },
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

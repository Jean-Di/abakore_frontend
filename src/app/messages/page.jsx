'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { CONVERSATIONS } from '@/lib/data'
import Link from 'next/link'
import clsx from 'clsx'

const MESSAGES = [
  { id: 1, mine: false, text: 'Bonjour Maître Asante, j\'aurais besoin de clarifications sur les clauses de non-concurrence dans notre contrat de distribution UEMOA. Notamment concernant la durée applicable sous l\'AUDCG.', time: '10h31' },
  { id: 2, mine: true,  text: 'Bonjour M. Kouyaté. Bonne question. Sous l\'AUDCG, les clauses de non-concurrence ne sont pas directement réglementées mais doivent respecter les principes généraux. La durée raisonnable est généralement de 2 à 3 ans max selon la jurisprudence CCJA.', time: '10h45' },
  { id: 3, mine: false, text: 'Parfait, merci. Et quelle serait la zone géographique couverte recommandée ? On vise l\'ensemble de la zone UEMOA.', time: '11h02', doc: { name: 'Contrat_distribution_v2.pdf', size: '245 Ko' } },
  { id: 4, mine: true,  text: 'Pour l\'UEMOA (8 pays), il est recommandé de délimiter par pays spécifiques et types de produits/services. J\'ai annoté votre document — voir la clause 12.3 modifiée ci-joint.', time: '11h18', doc: { name: 'Contrat_distribution_v2_annoté.pdf', size: '310 Ko', gold: true } },
  { id: 5, mine: false, text: 'Merci pour les précisions sur le contrat, je vais relire les annotations et reviens vers vous.', time: '11h24' },
]

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(0)
  const [text, setText] = useState('')

  const conv = CONVERSATIONS[activeConv]

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 flex bg-gray-50">

        {/* Conversation list */}
        <aside className="hidden md:flex flex-col w-[300px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <p className="font-display text-base font-semibold text-navy-800 mb-3">Messagerie</p>
            <input
              className="w-full px-3.5 py-2 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none placeholder:text-gray-300 focus:border-gold-400 transition-all"
              placeholder="Rechercher…"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {CONVERSATIONS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveConv(i)}
                className={clsx(
                  'w-full flex gap-3 px-4 py-3.5 border-b border-gray-50 transition-all text-left',
                  activeConv === i ? 'bg-gold-50 border-r-2 border-r-gold-500' : 'hover:bg-gray-50'
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
                    {c.initials}
                  </div>
                  {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={clsx('text-sm font-semibold truncate', c.unread > 0 ? 'text-navy-900' : 'text-navy-700')}>{c.name}</p>
                    <span className="text-[11px] text-gray-300 flex-shrink-0 ml-1">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{c.preview}</p>
                </div>
                {c.unread > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-[10px] font-bold text-navy-900 mt-0.5">
                    {c.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 md:ml-[300px] flex flex-col h-[calc(100vh-64px)]">

          {/* Chat header */}
          <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
                {conv.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-800">{conv.name}</p>
                <p className={clsx('text-xs', conv.online ? 'text-green-500' : 'text-gray-400')}>
                  {conv.online ? '● En ligne' : '○ Hors ligne'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex badge-navy items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                📋 Contrat distribution
              </span>
              <Link href="#" className="btn-outline btn-sm text-xs">Voir le dossier</Link>
              <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 hover:border-gray-300 transition-all text-sm">
                ⋮
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            <div className="text-center">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Aujourd'hui, 10h30</span>
            </div>

            {MESSAGES.map(msg => (
              <div key={msg.id} className={clsx('flex gap-2.5 items-end max-w-[75%]', msg.mine && 'self-end flex-row-reverse')}>
                {!msg.mine && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-display text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
                    DK
                  </div>
                )}
                <div>
                  <div className={clsx(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.mine
                      ? 'text-white/90 rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm',
                  )}
                  style={msg.mine ? { background: 'linear-gradient(135deg, #1A3457, #1F3D67)', boxShadow: 'var(--shadow-sm)' } : { boxShadow: 'var(--shadow-sm)' }}>
                    {msg.text}
                    {msg.doc && (
                      <div className={clsx(
                        'flex items-center gap-2.5 mt-2 px-3 py-2 rounded-xl text-xs',
                        msg.gold
                          ? 'bg-gold-500/15 border border-gold-500/25 text-gold-600'
                          : 'bg-navy-50 border border-navy-100 text-navy-700'
                      )}>
                        <span className="text-base">📄</span>
                        <span className="flex-1 font-medium truncate">{msg.doc.name}</span>
                        <span className="text-gray-400 flex-shrink-0">{msg.doc.size}</span>
                      </div>
                    )}
                  </div>
                  <p className={clsx('text-[11px] text-gray-300 mt-1 px-1', msg.mine && 'text-right')}>{msg.time}</p>
                </div>
                {msg.mine && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-display text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
                    KA
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2.5 flex-shrink-0">
            <div className="flex gap-1.5">
              <button className="w-9 h-9 rounded-xl border-[1.5px] border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 hover:border-gold-400 hover:bg-gold-50 transition-all text-sm" title="Joindre un fichier">📎</button>
              <button className="w-9 h-9 rounded-xl border-[1.5px] border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 hover:border-gold-400 hover:bg-gold-50 transition-all text-sm" title="OHADA IA">⚖</button>
            </div>
            <textarea
              rows={1}
              className="flex-1 px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-700 outline-none resize-none bg-white focus:border-gold-400 transition-all max-h-28"
              placeholder="Écrire un message…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setText('') } }}
            />
            <button className="btn-gold btn-sm flex-shrink-0 h-9">
              Envoyer ↗
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

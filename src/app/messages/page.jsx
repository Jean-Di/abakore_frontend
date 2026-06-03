// 'use client'
// import { useState } from 'react'
// import Navbar from '@/components/layout/Navbar'
// import { CONVERSATIONS } from '@/lib/data'
// import Link from 'next/link'
// import clsx from 'clsx'
// import { FileText, Paperclip, Scale, MoreVertical, Send } from 'lucide-react'

// const MESSAGES = [
//   { id: 1, mine: false, text: 'Bonjour Maître Asante, j\'aurais besoin de clarifications sur les clauses de non-concurrence dans notre contrat de distribution UEMOA. Notamment concernant la durée applicable sous l\'AUDCG.', time: '10h31' },
//   { id: 2, mine: true,  text: 'Bonjour M. Kouyaté. Bonne question. Sous l\'AUDCG, les clauses de non-concurrence ne sont pas directement réglementées mais doivent respecter les principes généraux. La durée raisonnable est généralement de 2 à 3 ans max selon la jurisprudence CCJA.', time: '10h45' },
//   { id: 3, mine: false, text: 'Parfait, merci. Et quelle serait la zone géographique couverte recommandée ? On vise l\'ensemble de la zone UEMOA.', time: '11h02', doc: { name: 'Contrat_distribution_v2.pdf', size: '245 Ko' } },
//   { id: 4, mine: true,  text: 'Pour l\'UEMOA (8 pays), il est recommandé de délimiter par pays spécifiques et types de produits/services. J\'ai annoté votre document — voir la clause 12.3 modifiée ci-joint.', time: '11h18', doc: { name: 'Contrat_distribution_v2_annoté.pdf', size: '310 Ko', gold: true } },
//   { id: 5, mine: false, text: 'Merci pour les précisions sur le contrat, je vais relire les annotations et reviens vers vous.', time: '11h24' },
// ]

// export default function MessagesPage() {
//   const [activeConv, setActiveConv] = useState(0)
//   const [text, setText] = useState('')

//   const conv = CONVERSATIONS[activeConv]

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen pt-16 flex bg-gray-50">

//         {/* Conversation list */}
//         <aside className="hidden md:flex flex-col w-[300px] flex-shrink-0 bg-white border-r border-gray-100 fixed top-16 bottom-0 overflow-hidden">
//           <div className="p-4 border-b border-gray-100 flex-shrink-0">
//             <p className="font-display text-base font-semibold text-navy-800 mb-3">Messagerie</p>
//             <input
//               className="w-full px-3.5 py-2 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none placeholder:text-gray-300 focus:border-gold-400 transition-all"
//               placeholder="Rechercher…"
//             />
//           </div>
//           <div className="overflow-y-auto flex-1">
//             {CONVERSATIONS.map((c, i) => (
//               <button
//                 key={c.id}
//                 onClick={() => setActiveConv(i)}
//                 className={clsx(
//                   'w-full flex gap-3 px-4 py-3.5 border-b border-gray-50 transition-all text-left',
//                   activeConv === i ? 'bg-gold-50 border-r-2 border-r-gold-500' : 'hover:bg-gray-50'
//                 )}
//               >
//                 <div className="relative flex-shrink-0">
//                   <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-bold"
//                     style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
//                     {c.initials}
//                   </div>
//                   {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-baseline">
//                     <p className={clsx('text-sm font-semibold truncate', c.unread > 0 ? 'text-navy-900' : 'text-navy-700')}>{c.name}</p>
//                     <span className="text-[11px] text-gray-300 flex-shrink-0 ml-1">{c.time}</span>
//                   </div>
//                   <p className="text-xs text-gray-400 truncate mt-0.5">{c.preview}</p>
//                 </div>
//                 {c.unread > 0 && (
//                   <div className="flex-shrink-0 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-[10px] font-bold text-navy-900 mt-0.5">
//                     {c.unread}
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </aside>

//         {/* Chat area */}
//         <div className="flex-1 md:ml-[300px] flex flex-col h-[calc(100vh-64px)]">

//           {/* Chat header */}
//           <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold"
//                 style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', border: '2px solid #F2E4BF' }}>
//                 {conv.initials}
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-navy-800">{conv.name}</p>
//                 <p className={clsx('text-xs flex items-center gap-1', conv.online ? 'text-green-500' : 'text-gray-400')}>
//                   <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', conv.online ? 'bg-green-500' : 'bg-gray-300')} />
//                   {conv.online ? 'En ligne' : 'Hors ligne'}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="hidden sm:flex badge-navy items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
//                 Contrat distribution
//               </span>
//               <Link href="#" className="btn-outline btn-sm text-xs">Voir le dossier</Link>
//               <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 hover:border-gray-300 transition-all">
//                 <MoreVertical size={15} />
//               </button>
//             </div>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
//             <div className="text-center">
//               <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Aujourd'hui, 10h30</span>
//             </div>

//             {MESSAGES.map(msg => (
//               <div key={msg.id} className={clsx('flex gap-2.5 items-end max-w-[75%]', msg.mine && 'self-end flex-row-reverse')}>
//                 {!msg.mine && (
//                   <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-display text-xs font-bold"
//                     style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
//                     DK
//                   </div>
//                 )}
//                 <div>
//                   <div className={clsx(
//                     'px-4 py-3 rounded-2xl text-sm leading-relaxed',
//                     msg.mine
//                       ? 'text-white/90 rounded-br-sm'
//                       : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm',
//                   )}
//                   style={msg.mine ? { background: 'linear-gradient(135deg, #1A3457, #1F3D67)', boxShadow: 'var(--shadow-sm)' } : { boxShadow: 'var(--shadow-sm)' }}>
//                     {msg.text}
//                     {msg.doc && (
//                       <div className={clsx(
//                         'flex items-center gap-2.5 mt-2 px-3 py-2 rounded-xl text-xs',
//                         msg.doc.gold
//                           ? 'bg-gold-500/15 border border-gold-500/25 text-gold-600'
//                           : 'bg-navy-50 border border-navy-100 text-navy-700'
//                       )}>
//                         <FileText size={14} className="flex-shrink-0" />
//                         <span className="flex-1 font-medium truncate">{msg.doc.name}</span>
//                         <span className="text-gray-400 flex-shrink-0">{msg.doc.size}</span>
//                       </div>
//                     )}
//                   </div>
//                   <p className={clsx('text-[11px] text-gray-300 mt-1 px-1', msg.mine && 'text-right')}>{msg.time}</p>
//                 </div>
//                 {msg.mine && (
//                   <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-display text-xs font-bold"
//                     style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72' }}>
//                     KA
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Input area */}
//           <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2.5 flex-shrink-0">
//             <div className="flex gap-1.5">
//               <button className="w-9 h-9 rounded-xl border-[1.5px] border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 hover:border-gold-400 hover:bg-gold-50 transition-all" title="Joindre un fichier">
//                 <Paperclip size={15} />
//               </button>
//               <button className="w-9 h-9 rounded-xl border-[1.5px] border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 hover:border-gold-400 hover:bg-gold-50 transition-all" title="OHADA IA">
//                 <Scale size={15} />
//               </button>
//             </div>
//             <textarea
//               rows={1}
//               className="flex-1 px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-700 outline-none resize-none bg-white focus:border-gold-400 transition-all max-h-28"
//               placeholder="Écrire un message…"
//               value={text}
//               onChange={e => setText(e.target.value)}
//               onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setText('') } }}
//             />
//             <button className="btn-gold btn-sm flex-shrink-0 h-9 inline-flex items-center gap-1.5">
//               Envoyer <Send size={13} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }


// app/messages/page.jsx
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import clsx from 'clsx'
import {
  FileText, Paperclip, Scale, MoreVertical, Send,
  Search, Check, CheckCheck, Loader2, Lock,
  ArrowLeft, Phone, Video, Smile, X, Circle,
} from 'lucide-react'

// ── Firebase ────────────────────────────────────────────────────────────────
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, doc, getDoc,
  query, where, orderBy, onSnapshot,
  addDoc, updateDoc, serverTimestamp, getDocs, limit,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7)  return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatDateSeparator(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getInitials(firstName, lastName, email) {
  if (firstName || lastName) {
    return `${(firstName ?? '')[0] ?? ''}${(lastName ?? '')[0] ?? ''}`.toUpperCase()
  }
  return (email?.[0] ?? '?').toUpperCase()
}

function getDisplayName(user) {
  if (!user) return '—'
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  return name || user.email || 'Utilisateur'
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/** Charge le profil d'un utilisateur depuis Firestore (avec cache) */
const profileCache = {}
async function fetchProfile(uid) {
  if (profileCache[uid]) return profileCache[uid]
  const snap = await getDoc(doc(db, 'users', uid))
  const data = snap.exists() ? { uid, ...snap.data() } : { uid, firstName: 'Utilisateur', lastName: '' }
  profileCache[uid] = data
  return data
}

// ── Composants ───────────────────────────────────────────────────────────────

function Avatar({ user, size = 10, showOnline = false }) {
  const initials = getInitials(user?.firstName, user?.lastName, user?.email)
  return (
    <div className="relative flex-shrink-0">
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt={getDisplayName(user)}
          className={clsx(`w-${size} h-${size} rounded-full object-cover border-2 border-gold-100`)}
        />
      ) : (
        <div
          className={clsx(`w-${size} h-${size} rounded-full flex items-center justify-center font-display font-bold border-2 flex-shrink-0`)}
          style={{ background: 'linear-gradient(135deg, #1F3D67, #2D5990)', color: '#D9BC72', borderColor: '#F2E4BF', fontSize: size > 8 ? '14px' : '11px' }}
        >
          {initials}
        </div>
      )}
      {showOnline && user?.online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      )}
    </div>
  )
}

function MessageBubble({ msg, isMine, senderProfile }) {
  return (
    <div className={clsx('flex gap-2 items-end', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine && <Avatar user={senderProfile} size={7} />}
      <div className={clsx('max-w-[70%]', isMine && 'items-end flex flex-col')}>
        <div className={clsx(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isMine
            ? 'text-white/90 rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
        )}
        style={isMine ? { background: 'linear-gradient(135deg, #1A3457, #1F3D67)' } : {}}>
          {msg.text}
          {msg.doc && (
            <div className={clsx(
              'flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs cursor-pointer hover:opacity-80 transition-opacity',
              msg.doc.gold
                ? 'bg-gold-500/15 border border-gold-500/25 text-gold-600'
                : 'bg-navy-50 border border-navy-100 text-navy-700'
            )}>
              <FileText size={13} className="flex-shrink-0" />
              <span className="flex-1 font-medium truncate">{msg.doc.name}</span>
              <span className="text-gray-400 flex-shrink-0">{msg.doc.size}</span>
            </div>
          )}
        </div>
        <div className={clsx('flex items-center gap-1 mt-1 px-1', isMine ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-gray-300">{formatTime(msg.createdAt)}</span>
          {isMine && (
            msg.read
              ? <CheckCheck size={11} className="text-gold-400" />
              : <Check size={11} className="text-gray-300" />
          )}
        </div>
      </div>
      {isMine && <Avatar user={senderProfile} size={7} />}
    </div>
  )
}

function DateSeparator({ ts }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[11px] text-gray-300 font-medium">{formatDateSeparator(ts)}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function ConvItem({ conv, isActive, authUid, onClick }) {
  const otherId  = conv.participants?.find(p => p !== authUid)
  const other    = conv.otherProfile
  const unread   = conv.unread?.[authUid] ?? 0
  const lastMine = conv.lastSenderId === authUid

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex gap-3 px-4 py-3.5 border-b border-gray-50 transition-all text-left',
        isActive ? 'bg-gold-50 border-r-2 border-r-gold-500' : 'hover:bg-gray-50'
      )}
    >
      <Avatar user={other} size={10} showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-1">
          <p className={clsx('text-sm truncate', unread > 0 ? 'font-bold text-navy-900' : 'font-semibold text-navy-700')}>
            {getDisplayName(other)}
          </p>
          <span className="text-[11px] text-gray-300 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {lastMine && <CheckCheck size={11} className="text-gray-300 flex-shrink-0" />}
          <p className={clsx('text-xs truncate', unread > 0 ? 'text-navy-700 font-medium' : 'text-gray-400')}>
            {conv.lastMessage || 'Démarrer la conversation'}
          </p>
        </div>
      </div>
      {unread > 0 && (
        <div className="flex-shrink-0 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-[10px] font-bold text-navy-900 self-center">
          {unread}
        </div>
      )}
    </button>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function MessagesPage() {
  const inputRef       = useRef(null)
  const messagesEndRef = useRef(null)

  const [authUser,      setAuthUser]      = useState(undefined)
  const [myProfile,     setMyProfile]     = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConvId,  setActiveConvId]  = useState(null)
  const [messages,      setMessages]      = useState([])
  const [profiles,      setProfiles]      = useState({})   // uid → profile
  const [text,          setText]          = useState('')
  const [search,        setSearch]        = useState('')
  const [sending,       setSending]       = useState(false)
  const [loadingConvs,  setLoadingConvs]  = useState(true)
  const [loadingMsgs,   setLoadingMsgs]   = useState(false)
  const [mobileView,    setMobileView]    = useState('list') // 'list' | 'chat'

  const activeConv = conversations.find(c => c.id === activeConvId)

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setAuthUser(user ?? null)
      if (user) {
        const p = await fetchProfile(user.uid)
        setMyProfile(p)
      }
    })
    return unsub
  }, [])

  // ── Conversations temps réel ─────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    setLoadingConvs(true)

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', authUser.uid),
      orderBy('lastMessageAt', 'desc')
    )

    const unsub = onSnapshot(q, async snap => {
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Charge les profils des autres participants
      const toLoad = convs
        .map(c => c.participants?.find(p => p !== authUser.uid))
        .filter(Boolean)
        .filter(uid => !profiles[uid])

      const newProfiles = { ...profiles }
      await Promise.all(toLoad.map(async uid => {
        newProfiles[uid] = await fetchProfile(uid)
      }))
      setProfiles(newProfiles)

      const enriched = convs.map(c => ({
        ...c,
        otherProfile: newProfiles[c.participants?.find(p => p !== authUser.uid)],
      }))

      setConversations(enriched)
      setLoadingConvs(false)
    })

    return unsub
  }, [authUser?.uid])

  // ── Messages temps réel ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId || !authUser) return
    setLoadingMsgs(true)

    const q = query(
      collection(db, 'conversations', activeConvId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(msgs)
      setLoadingMsgs(false)

      // Marquer les messages reçus comme lus
      snap.docs.forEach(d => {
        if (d.data().senderId !== authUser.uid && !d.data().read) {
          updateDoc(d.ref, { read: true })
        }
      })

      // Remettre le compteur unread à 0
      updateDoc(doc(db, 'conversations', activeConvId), {
        [`unread.${authUser.uid}`]: 0,
      }).catch(() => {})
    })

    return unsub
  }, [activeConvId, authUser?.uid])

  // ── Scroll auto ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Envoi ────────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!text.trim() || !activeConvId || sending) return
    setSending(true)
    const content = text.trim()
    setText('')

    const otherId = activeConv?.participants?.find(p => p !== authUser.uid)

    try {
      await addDoc(collection(db, 'conversations', activeConvId, 'messages'), {
        text: content,
        senderId: authUser.uid,
        createdAt: serverTimestamp(),
        read: false,
      })
      await updateDoc(doc(db, 'conversations', activeConvId), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastSenderId: authUser.uid,
        ...(otherId ? { [`unread.${otherId}`]: (activeConv?.unread?.[otherId] ?? 0) + 1 } : {}),
      })
    } catch (e) {
      console.error(e)
      setText(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // ── Groupement messages par date ─────────────────────────────────────────
  function groupMessages(msgs) {
    const items = []
    let lastDate = null
    msgs.forEach(msg => {
      const d = msg.createdAt?.toDate ? msg.createdAt.toDate().toDateString() : null
      if (d && d !== lastDate) {
        items.push({ type: 'date', ts: msg.createdAt, key: d })
        lastDate = d
      }
      items.push({ type: 'msg', ...msg })
    })
    return items
  }

  // ── Filtrage conversations ────────────────────────────────────────────────
  const filteredConvs = conversations.filter(c => {
    if (!search) return true
    const name = getDisplayName(c.otherProfile).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const grouped  = groupMessages(messages)
  const otherId  = activeConv?.participants?.find(p => p !== authUser?.uid)
  const other    = activeConv?.otherProfile

  // ── Non connecté ─────────────────────────────────────────────────────────
  if (authUser === null) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4">
          <Lock size={36} className="text-gray-300" />
          <p className="font-semibold text-navy-700">Connectez-vous pour accéder à la messagerie</p>
          <Link href="/login" className="btn-gold btn-sm">Se connecter</Link>
        </div>
      </>
    )
  }

  if (authUser === undefined) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gold-500" />
        </div>
      </>
    )
  }

  // ── Sidebar conversations ────────────────────────────────────────────────
  const SidebarConvs = (
    <aside className={clsx(
      'flex flex-col bg-white border-r border-gray-100',
      'md:w-[300px] md:flex-shrink-0 md:fixed md:top-16 md:bottom-0',
      mobileView === 'list' ? 'flex w-full h-[calc(100vh-64px)]' : 'hidden md:flex'
    )}>
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <p className="font-display text-base font-semibold text-navy-800 mb-3">Messagerie</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            className="w-full pl-8 pr-3 py-2 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none placeholder:text-gray-300 focus:border-gold-400 transition-all"
            placeholder="Rechercher une conversation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {loadingConvs && (
          <div className="flex flex-col gap-1 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingConvs && filteredConvs.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Circle size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium text-navy-700">Aucune conversation</p>
            <p className="text-xs mt-1">Contactez un expert depuis sa page profil</p>
            <Link href="/search" className="btn-gold btn-sm mt-4 inline-flex">Trouver un expert</Link>
          </div>
        )}

        {!loadingConvs && filteredConvs.map(conv => (
          <ConvItem
            key={conv.id}
            conv={conv}
            isActive={activeConvId === conv.id}
            authUid={authUser.uid}
            onClick={() => {
              setActiveConvId(conv.id)
              setMobileView('chat')
            }}
          />
        ))}
      </div>
    </aside>
  )

  // ── Zone chat ────────────────────────────────────────────────────────────
  const ChatArea = (
    <div className={clsx(
      'flex flex-col',
      'md:ml-[300px] md:flex md:h-[calc(100vh-64px)]',
      mobileView === 'chat' ? 'flex w-full h-[calc(100vh-64px)]' : 'hidden md:flex'
    )}>
      {!activeConvId ? (
        /* État vide desktop */
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-4 p-8">
          <div className="w-20 h-20 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center">
            <Send size={30} className="text-gold-400 rotate-12" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-navy-800">Sélectionnez une conversation</p>
            <p className="text-sm mt-1">ou contactez un expert depuis la recherche</p>
          </div>
          <Link href="/search" className="btn-gold btn-sm">Trouver un expert</Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <ArrowLeft size={18} />
            </button>

            <Avatar user={other} size={9} showOnline />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-navy-900 truncate">{getDisplayName(other)}</p>
              <p className={clsx('text-xs flex items-center gap-1', other?.online ? 'text-green-500' : 'text-gray-400')}>
                <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', other?.online ? 'bg-green-500' : 'bg-gray-300')} />
                {other?.online ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Appel">
                <Phone size={15} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Vidéo">
                <Video size={15} />
              </button>
              <Link href={`/profile/${otherId}`} className="btn-outline btn-sm text-xs hidden sm:inline-flex">
                Voir le profil
              </Link>
              <Link href={`/propose/${otherId}`} className="btn-gold btn-sm text-xs hidden sm:inline-flex">
                Proposer un dossier
              </Link>
              <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-navy-700 transition-all">
                <MoreVertical size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 bg-gray-50">
            {loadingMsgs && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gold-400" />
              </div>
            )}

            {!loadingMsgs && messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-12">
                <p className="text-sm font-medium text-navy-700">Démarrez la conversation</p>
                <p className="text-xs">Présentez-vous à {getDisplayName(other).split(' ')[0]}</p>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {[
                    'Bonjour, je souhaite discuter d\'un dossier.',
                    'Êtes-vous disponible pour une consultation ?',
                    'J\'ai besoin d\'un expert en droit OHADA.',
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => { setText(s); inputRef.current?.focus() }}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gold-400 hover:text-gold-600 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loadingMsgs && grouped.map((item, idx) =>
              item.type === 'date' ? (
                <DateSeparator key={item.key ?? idx} ts={item.ts} />
              ) : (
                <MessageBubble
                  key={item.id}
                  msg={item}
                  isMine={item.senderId === authUser.uid}
                  senderProfile={item.senderId === authUser.uid ? myProfile : other}
                />
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <div className="flex items-end gap-2">
              <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50 transition-all flex-shrink-0 mb-0.5" title="Fichier">
                <Paperclip size={15} />
              </button>
              <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50 transition-all flex-shrink-0 mb-0.5" title="OHADA IA">
                <Scale size={15} />
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-700 outline-none resize-none bg-white focus:border-gold-400 transition-all"
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                  placeholder={`Écrire à ${getDisplayName(other).split(' ')[0]}…`}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onInput={e => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                  }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-all',
                  text.trim() && !sending
                    ? 'text-navy-900 hover:brightness-105'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                )}
                style={text.trim() && !sending ? { background: 'linear-gradient(135deg, #C9A84C, #9E7828)' } : {}}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-300 text-center mt-1.5">
              Entrée pour envoyer · Maj+Entrée pour un saut de ligne
            </p>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 flex bg-gray-50">
        {SidebarConvs}
        {ChatArea}
      </div>
    </>
  )
}

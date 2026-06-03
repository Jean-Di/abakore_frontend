// lib/conversations.js
import {
  collection, query,
  where, getDocs, addDoc, serverTimestamp, limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function getOrCreateConversation(uid1, uid2) {
  const participants = [uid1, uid2].sort()

  // array-contains cherche les convs où l'uid1 est participant
  // puis on filtre côté client pour vérifier que uid2 est aussi dedans
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid1),
    limit(20)
  )

  const snap = await getDocs(q)

  // Cherche une conv qui contient exactement les deux participants
  const existing = snap.docs.find(d => {
    const p = d.data().participants ?? []
    return p.includes(uid2) && p.length === 2
  })

  if (existing) return existing.id

  // Crée une nouvelle conversation
  const ref = await addDoc(collection(db, 'conversations'), {
    participants,          // array trié [uid_a, uid_b]
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unread: { [uid1]: 0, [uid2]: 0 },
  })
  return ref.id
}
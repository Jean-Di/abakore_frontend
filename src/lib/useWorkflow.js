import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, limit } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

// Étapes du workflow dans l'ordre
export const WORKFLOW_STEPS = [
  { key: 'draft',     label: 'Brouillon',    desc: 'Dossier en cours de création' },
  { key: 'submitted', label: 'Soumis',       desc: 'En attente de révision' },
  { key: 'revision',  label: 'En révision',  desc: 'Corrections demandées' },
  { key: 'approved',  label: 'Approuvé',     desc: "Validé par l'administrateur" },
  { key: 'archived',  label: 'Archivé',      desc: 'Dossier clôturé et archivé' },
]

export const STEP_INDEX = Object.fromEntries(WORKFLOW_STEPS.map((s, i) => [s.key, i]))

export function useWorkflow() {
  const [user,      setUser]      = useState(null)
  const [dossiers,  setDossiers]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let unsubDossiers = null

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      unsubDossiers?.()
      if (!u) { setUser(null); setLoading(false); return }

      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists()) {
          const d = snap.data()
          const name = d.name ?? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()
          setUser({
            uid:         u.uid,
            name,
            initials:    getInitials(name),
            company:     d.company     ?? '',
            plan:        d.plan        ?? 'starter',
            companyRole: d.companyRole ?? 'user',
            accountType: d.accountType ?? 'company',
          })
        }

        const q = query(
          collection(db, 'workflow_dossiers'),
          where('companyId', '==', u.uid),
          orderBy('updatedAt', 'desc'),
          limit(100)
        )
        unsubDossiers = onSnapshot(q, snap => {
          setDossiers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
          setLoading(false)
        }, err => { setError(err.message); setLoading(false) })
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    })

    return () => { unsubAuth(); unsubDossiers?.() }
  }, [])

  // Comptages par statut
  const counts = WORKFLOW_STEPS.reduce((acc, s) => {
    acc[s.key] = dossiers.filter(d => d.status === s.key).length
    return acc
  }, {})

  const pendingAction = dossiers.filter(d =>
    d.status === 'submitted' || d.status === 'revision'
  ).length

  return { user, dossiers, loading, error, counts, pendingAction }
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

import { useState, useEffect } from 'react'
import { doc, collection, query, where, orderBy, onSnapshot, getDoc, limit } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

// ─── Calcul du score de conformité ────────────────────────────────────────────
// Score pondéré par criticité (1–5 étoiles). Les indicateurs "late" pénalisent.
function computeScore(kpis) {
  if (!kpis.length) return null
  let totalWeight = 0
  let earnedWeight = 0
  for (const k of kpis) {
    const w = k.criticality ?? 1
    totalWeight += w
    if (k.status === 'compliant') earnedWeight += w
  }
  return totalWeight === 0 ? 100 : Math.round((earnedWeight / totalWeight) * 100)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCompanyDashboard() {
  const [user,         setUser]         = useState(null)
  const [complianceKpis, setComplianceKpis] = useState([])
  const [score,        setScore]        = useState(null)
  const [workflowItems, setWorkflowItems] = useState([])
  const [alerts,       setAlerts]       = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    let unsubKpis    = null
    let unsubWorkflow = null
    let unsubAlerts  = null
    let unsubNotifs  = null

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubKpis?.()
      unsubWorkflow?.()
      unsubAlerts?.()
      unsubNotifs?.()

      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // ── 1. Profil utilisateur ─────────────────────────────────────────
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userSnap.exists()) {
          const d = userSnap.data()
          const fullName = d.name ?? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() ?? 'Utilisateur'
          setUser({
            uid:         firebaseUser.uid,
            name:        fullName,
            initials:    getInitials(fullName),
            company:     d.company     ?? '',
            plan:        d.plan        ?? 'starter',
            companyRole: d.companyRole ?? 'admin',
            accountType: d.accountType ?? 'company',
            country:     d.country     ?? '',
          })
        } else {
          setUser({
            uid:         firebaseUser.uid,
            name:        firebaseUser.displayName ?? 'Utilisateur',
            initials:    getInitials(firebaseUser.displayName ?? 'U'),
            company:     '',
            plan:        'starter',
            companyRole: 'admin',
            accountType: 'company',
          })
        }

        // ── 2. Indicateurs de conformité (temps réel) ─────────────────────
        const kpiQuery = query(
          collection(db, 'compliance_kpis'),
          where('companyId', '==', firebaseUser.uid),
          orderBy('dueDate', 'asc'),
          limit(50)
        )
        unsubKpis = onSnapshot(kpiQuery, (snap) => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          setComplianceKpis(items)
          setScore(computeScore(items))
        }, err => setError(err.message))

        // ── 3. Workflow interne (dossiers en attente d'action) ────────────
        const workflowQuery = query(
          collection(db, 'workflow_dossiers'),
          where('companyId', '==', firebaseUser.uid),
          where('status', 'in', ['submitted', 'revision']),
          orderBy('updatedAt', 'desc'),
          limit(10)
        )
        unsubWorkflow = onSnapshot(workflowQuery, (snap) => {
          setWorkflowItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }, err => setError(err.message))

        // ── 4. Alertes non lues ───────────────────────────────────────────
        const alertsQuery = query(
          collection(db, 'company_alerts'),
          where('companyId', '==', firebaseUser.uid),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(10)
        )
        unsubAlerts = onSnapshot(alertsQuery, (snap) => {
          setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }, err => setError(err.message))

        // ── 5. Notifications générales ────────────────────────────────────
        const notifQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc'),
          limit(15)
        )
        unsubNotifs = onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => {
            const data = d.data()
            return {
              id:     d.id,
              text:   data.text   ?? '',
              time:   formatTime(data.createdAt),
              dot:    data.dot    ?? 'navy',
              unread: data.unread ?? false,
            }
          }))
          setLoading(false)
        }, err => {
          setError(err.message)
          setLoading(false)
        })

      } catch (err) {
        console.error('useCompanyDashboard:', err)
        setError(err.message)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      unsubKpis?.()
      unsubWorkflow?.()
      unsubAlerts?.()
      unsubNotifs?.()
    }
  }, [])

  // ── KPIs dérivés ─────────────────────────────────────────────────────────
  const totalKpis    = complianceKpis.length
  const compliantCount = complianceKpis.filter(k => k.status === 'compliant').length
  const lateCount    = complianceKpis.filter(k => k.status === 'late').length
  const upcomingCount = complianceKpis.filter(k => {
    if (k.status !== 'upcoming' && k.status !== 'pending') return false
    return true
  }).length
  const workflowPendingCount = workflowItems.filter(w => w.status === 'submitted' || w.status === 'revision').length
  const unreadAlerts = alerts.length
  const unreadNotifs = notifications.filter(n => n.unread).length

  // Indicateurs urgents (late ou upcoming dans les 7 prochains jours)
  const urgentKpis = complianceKpis
    .filter(k => k.status === 'late' || k.status === 'upcoming')
    .slice(0, 5)

  return {
    user,
    complianceKpis,
    score,
    workflowItems,
    alerts,
    notifications,
    loading,
    error,
    // Dérivés
    stats: { totalKpis, compliantCount, lateCount, upcomingCount, workflowPendingCount, unreadAlerts, unreadNotifs },
    urgentKpis,
  }
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(ts) {
  if (!ts) return ''
  try {
    const d    = ts.toDate ? ts.toDate() : new Date(ts)
    const diff = Date.now() - d.getTime()
    const min  = Math.floor(diff / 60000)
    const h    = Math.floor(diff / 3600000)
    const day  = Math.floor(diff / 86400000)
    if (min < 1)  return 'À l\'instant'
    if (min < 60) return `Il y a ${min} min`
    if (h < 24)   return `Il y a ${h}h`
    if (day < 7)  return `Il y a ${day}j`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

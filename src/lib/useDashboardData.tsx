// hooks/useDashboardData.ts
import { useState, useEffect } from 'react'
import { doc, collection, query, where, orderBy, onSnapshot, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

/* ── Types ─────────────────────────────────────────────── */
export interface UserData {
  uid:       string
  name:      string
  initials:  string
  plan:      'free' | 'pro' | 'premium'
  avatarUrl?: string
}

export interface Project {
  id:       string
  title:    string
  client:   string
  deadline: string
  progress: number
  status:   'active' | 'pending' | 'completed'
}

export interface Notification {
  id:     string
  text:   string
  time:   string
  dot:    'gold' | 'green' | 'navy'
  unread: boolean
}

export interface KPI {
  totalDossiers:  number
  revenueMonth:   string
  avgRating:      number
  profileViews:   number
  revenueChange:  string
  viewsChange:    string
}

export interface DashboardData {
  user:          UserData | null
  projects:      Project[]
  notifications: Notification[]
  kpis:          KPI | null
  loading:       boolean
  error:         string | null
}

/* ── Hook ───────────────────────────────────────────────── */
export function useDashboardData(): DashboardData {
  const [user,          setUser]          = useState<UserData | null>(null)
  const [projects,      setProjects]      = useState<Project[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [kpis,          setKpis]          = useState<KPI | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)

  useEffect(() => {
    // Écoute le changement d'état d'authentification
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        // ── 1. Profil utilisateur ──────────────────────────
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userSnap.exists()) {
          const d = userSnap.data()
          setUser({
            uid:      firebaseUser.uid,
            name:     d.name      ?? firebaseUser.displayName ?? 'Utilisateur',
            initials: d.initials  ?? getInitials(d.name ?? ''),
            plan:     d.plan      ?? 'free',
            avatarUrl: d.avatarUrl,
          })

          // ── 2. KPIs ──────────────────────────────────────
          const kpiSnap = await getDoc(doc(db, 'users', firebaseUser.uid, 'stats', 'kpis'))
          if (kpiSnap.exists()) {
            const k = kpiSnap.data()
            setKpis({
              totalDossiers: k.totalDossiers ?? 0,
              revenueMonth:  k.revenueMonth  ?? '0',
              avgRating:     k.avgRating     ?? 0,
              profileViews:  k.profileViews  ?? 0,
              revenueChange: k.revenueChange ?? '+0%',
              viewsChange:   k.viewsChange   ?? '+0%',
            })
          }
        }

        // ── 3. Dossiers (temps réel) ───────────────────────
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', firebaseUser.uid),
          where('status', 'in', ['active', 'pending']),
          orderBy('deadline', 'asc')
        )
        const unsubProjects = onSnapshot(projectsQuery, (snap) => {
          setProjects(snap.docs.map(d => ({
            id:       d.id,
            title:    d.data().title    ?? '',
            client:   d.data().client   ?? '',
            deadline: d.data().deadline ?? '',
            progress: d.data().progress ?? 0,
            status:   d.data().status   ?? 'pending',
          })))
        }, (err) => setError(err.message))

        // ── 4. Notifications (temps réel) ─────────────────
        const notifQuery = query(
          collection(db, 'users', firebaseUser.uid, 'notifications'),
          orderBy('createdAt', 'desc')
        )
        const unsubNotifs = onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => ({
            id:     d.id,
            text:   d.data().text   ?? '',
            time:   d.data().time   ?? '',
            dot:    d.data().dot    ?? 'navy',
            unread: d.data().unread ?? false,
          })))
          setLoading(false)
        }, (err) => {
          setError(err.message)
          setLoading(false)
        })

        // Nettoyage des listeners temps réel
        return () => {
          unsubProjects()
          unsubNotifs()
        }

      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    })

    return () => unsubAuth()
  }, [])

  return { user, projects, notifications, kpis, loading, error }
}

/* ── Utilitaire ─────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
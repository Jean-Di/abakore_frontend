// hooks/useDashboardData.ts
import { useState, useEffect } from 'react'
import { doc, collection, query, where, orderBy, onSnapshot, getDoc, limit } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

/* ── Types ─────────────────────────────────────────────── */
export interface UserData {
  uid:        string
  name:       string
  initials:   string
  plan:       'free' | 'pro' | 'premium'
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
  totalDossiers: number
  revenueMonth:  string
  avgRating:     number
  profileViews:  number
  revenueChange: string
  viewsChange:   string
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
    // Stocke les unsubscribes pour les listeners temps réel
    let unsubProjects:  (() => void) | null = null
    let unsubNotifs:    (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Nettoie les anciens listeners si l'utilisateur change
      unsubProjects?.()
      unsubNotifs?.()

      if (!firebaseUser) {
        setUser(null)
        setProjects([])
        setNotifications([])
        setKpis(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // ── 1. Profil utilisateur ──────────────────────────────────────
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userSnap.exists()) {
          const d = userSnap.data()

          // Construit le nom depuis firstName/lastName ou name
          const fullName = d.name
            ?? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()
            ?? firebaseUser.displayName
            ?? 'Utilisateur'

          setUser({
            uid:      firebaseUser.uid,
            name:     fullName,
            initials: d.initials ?? getInitials(fullName),
            plan:     d.plan     ?? 'free',
            avatarUrl: d.photoURL ?? d.avatarUrl,
          })

          // ── 2. KPIs (sous-collection stats/kpis) ──────────────────────
          // Si la sous-collection n'existe pas encore, on calcule depuis dossiers
          const kpiSnap = await getDoc(doc(db, 'users', firebaseUser.uid, 'stats', 'kpis'))
          if (kpiSnap.exists()) {
            const k = kpiSnap.data()
            setKpis({
              totalDossiers: k.totalDossiers ?? 0,
              revenueMonth:  k.revenueMonth  ?? '0 FCFA',
              avgRating:     k.avgRating     ?? 0,
              profileViews:  k.profileViews  ?? 0,
              revenueChange: k.revenueChange ?? '+0%',
              viewsChange:   k.viewsChange   ?? '+0%',
            })
          } else {
            // Fallback : KPIs depuis les champs du profil directement
            setKpis({
              totalDossiers: d.missions      ?? 0,
              revenueMonth:  '—',
              avgRating:     d.rating        ?? 0,
              profileViews:  d.profileViews  ?? 0,
              revenueChange: '+0%',
              viewsChange:   '+0%',
            })
          }
        } else {
          // Document utilisateur inexistant — profil minimal
          setUser({
            uid:      firebaseUser.uid,
            name:     firebaseUser.displayName ?? firebaseUser.email ?? 'Utilisateur',
            initials: getInitials(firebaseUser.displayName ?? firebaseUser.email ?? 'U'),
            plan:     'free',
          })
        }

        // ── 3. Dossiers temps réel ─────────────────────────────────────
        // PROBLÈME CORRIGÉ : la collection s'appelle 'dossiers' (pas 'projects')
        // et le champ est 'clientId' ou 'expertId' (pas 'userId')
        // On fait deux requêtes séparées pour couvrir client ET expert
        const dossiersAsClient = query(
          collection(db, 'dossiers'),
          where('clientId', '==', firebaseUser.uid),
          where('status', 'in', ['active', 'pending']),
          orderBy('createdAt', 'desc'),
          limit(10)
        )

        const dossiersAsExpert = query(
          collection(db, 'dossiers'),
          where('expertId', '==', firebaseUser.uid),
          where('status', 'in', ['active', 'pending']),
          orderBy('createdAt', 'desc'),
          limit(10)
        )

        // Listener client
        unsubProjects = onSnapshot(dossiersAsClient, (snapClient) => {
          const clientDossiers = snapClient.docs.map(d => formatDossier(d))

          // Listener expert imbriqué pour fusionner les deux
          unsubProjects = onSnapshot(dossiersAsExpert, (snapExpert) => {
            const expertDossiers = snapExpert.docs.map(d => formatDossier(d))

            // Fusionne et déduplique
            const all = [...clientDossiers, ...expertDossiers]
            const unique = all.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
            unique.sort((a, b) => a.deadline.localeCompare(b.deadline))
            setProjects(unique)
          }, (err) => setError(err.message))

        }, (err) => setError(err.message))

        // ── 4. Notifications temps réel ────────────────────────────────
        // PROBLÈME CORRIGÉ : notifications dans collection racine avec userId
        // (correspond à ce qu'on écrit dans propose/page.jsx)
        const notifQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        )

        unsubNotifs = onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => {
            const data = d.data()
            return {
              id:     d.id,
              text:   data.text   ?? '',
              time:   formatNotifTime(data.createdAt),
              dot:    data.dot    ?? 'navy',
              unread: data.unread ?? false,
            }
          }))
          setLoading(false)
        }, (err) => {
          setError(err.message)
          setLoading(false)
        })

      } catch (err: any) {
        console.error('useDashboardData error:', err)
        setError(err.message)
        setLoading(false)
      }
    })

    // Nettoyage global
    return () => {
      unsubAuth()
      unsubProjects?.()
      unsubNotifs?.()
    }
  }, [])

  return { user, projects, notifications, kpis, loading, error }
}

/* ── Utilitaires ────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDossier(d: any): Project {
  const data = d.data()
  return {
    id:       d.id,
    title:    data.title          ?? 'Sans titre',
    // 'client' = nom du client si on est expert, sinon nom de l'expert
    client:   data.clientName     ?? data.expertName ?? '—',
    deadline: data.deadline       ?? '—',
    progress: data.progress       ?? 0,
    status:   data.status         ?? 'pending',
  }
}

function formatNotifTime(ts: any): string {
  if (!ts) return ''
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    const diff = Date.now() - d.getTime()
    const min  = Math.floor(diff / 60000)
    const h    = Math.floor(diff / 3600000)
    const day  = Math.floor(diff / 86400000)
    if (min < 1)  return 'À l\'instant'
    if (min < 60) return `Il y a ${min} min`
    if (h < 24)   return `Il y a ${h}h`
    if (day < 7)  return `Il y a ${day}j`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
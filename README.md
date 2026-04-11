# Abakoré — Legal Intelligence Platform

> Marketplace B2B/B2C pour l'expertise juridique, comptable et RH dans l'espace OHADA.

## Stack technique

| Couche      | Technologie                          |
|-------------|--------------------------------------|
| Framework   | Next.js 14 (App Router)              |
| Style       | Tailwind CSS + CSS custom properties |
| Typos       | Comfortaa (titres) + Open Sans (corps)|
| Icônes      | Lucide React                         |
| Utilitaires | clsx                                 |

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir http://localhost:3000
```

## Structure du projet

```
src/
├── app/
│   ├── page.jsx                  → Homepage
│   ├── layout.jsx                → Layout global (fonts, metadata)
│   ├── auth/
│   │   ├── login/page.jsx        → Connexion
│   │   └── register/page.jsx     → Inscription multi-step (3 étapes)
│   ├── profile/[id]/page.jsx     → Profil expert
│   ├── contact/[id]/page.jsx     → ★ Contacter un profil
│   ├── propose/[id]/page.jsx     → ★ Proposer un dossier (4 étapes)
│   ├── search/page.jsx           → Recherche d'experts
│   ├── dashboard/page.jsx        → Tableau de bord
│   └── messages/page.jsx         → Messagerie
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx            → Navigation principale
│   │   └── Footer.jsx            → Pied de page
│   ├── home/
│   │   ├── HeroSection.jsx       → Section hero homepage
│   │   └── index.jsx             → HowItWorks, FeaturedExperts,
│   │                                FeaturesSection, PricingSection, CtaSection
│   └── ui/
│       └── index.jsx             → Avatar, Badge, SubBadge, Stars,
│                                    StatusBadge, SectionHeader, Toast,
│                                    DividerOr, ProgressBar
│
├── lib/
│   └── data.js                   → Données mock (experts, projets, messages…)
│
└── styles/
    └── globals.css               → Design tokens, composants Tailwind
```

## Pages & routes

| Route              | Description                            |
|--------------------|----------------------------------------|
| `/`                | Homepage (hero, experts, features, prix)|
| `/auth/login`      | Connexion                              |
| `/auth/register`   | Inscription 3 étapes + choix de rôle  |
| `/profile/[id]`    | Profil expert complet                  |
| `/contact/[id]`    | **Contacter un expert** (2 étapes)     |
| `/propose/[id]`    | **Proposer un dossier** (4 étapes)     |
| `/search`          | Recherche avec filtres                 |
| `/dashboard`       | Tableau de bord + KPIs                 |
| `/messages`        | Messagerie                             |

## Design system

### Couleurs principales

```js
navy: {
  900: '#152B47',  // Fond principal
  800: '#1A3457',  // Surfaces sombres
  700: '#1F3D67',  // Accents navy
}
gold: {
  500: '#C9A84C',  // Or principal
  600: '#9E7828',  // Or foncé (hover)
  400: '#D9BC72',  // Or clair
}
```

### Classes utilitaires clés

```css
.btn-gold       → Bouton principal doré
.btn-navy       → Bouton navy
.btn-outline    → Bouton contour gris
.btn-outline-gold → Bouton contour doré
.card           → Carte blanche avec ombre
.input          → Champ de formulaire (focus doré)
.badge-navy     → Badge texte navy
.sub-premium    → Badge abonnement premium
.avatar         → Avatar arrondi
```

## Palettes d'abonnement

| Plan       | Visuel                          |
|------------|----------------------------------|
| Free       | Gris neutre                      |
| Pro        | Navy léger                       |
| Premium    | Dégradé doré ★ (mis en avant)   |
| Spotlight  | Dégradé violet                   |
| Enterprise | Navy foncé, texte doré           |

## Prochaines étapes (backend)

1. **Auth** — NextAuth.js avec JWT + rôles (user/expert/owner/admin)
2. **BDD** — PostgreSQL + Prisma ORM (schéma dans `/prisma/schema.prisma`)
3. **API Routes** — `/api/experts`, `/api/dossiers`, `/api/messages`
4. **OHADA RAG** — Intégration Claude API + pgvector pour la recherche sémantique
5. **Paiement** — Intégration Stripe / CinetPay (FCFA)
6. **Upload** — Cloudinary ou S3 pour les documents

## Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

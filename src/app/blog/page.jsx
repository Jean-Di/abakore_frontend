import Link from 'next/link'
import StaticPage from '@/components/layout/StaticPage'

const POSTS = [
  { title: 'Comprendre l’AUDCG : 5 points essentiels', date: '15 mars 2025', excerpt: 'Un guide clair pour maîtriser l’Acte Uniforme et sécuriser vos contrats dans l’espace OHADA.', href: '#' },
  { title: 'SYSCOHADA révisé : nouveautés 2025', date: '8 mars 2025', excerpt: 'Les principaux changements comptables pour les PME dans la zone UEMOA.', href: '#' },
  { title: 'Comment choisir un expert OHADA fiable ?', date: '28 février 2025', excerpt: 'Conseils pratiques pour sélectionner un avocat, comptable ou consultant certifié.', href: '#' },
]

export default function BlogPage() {
  return (
    <StaticPage
      title="Blog juridique"
      subtitle="Actualités et bonnes pratiques OHADA"
      description="Articles, guides et analyses pour accompagner votre entreprise dans l’espace OHADA."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {POSTS.map(post => (
          <article key={post.title} className="card p-6 hover:shadow-xl transition-all">
            <p className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-3">{post.date}</p>
            <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">{post.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{post.excerpt}</p>
            <Link href={post.href} className="text-gold-600 font-semibold text-sm">
              Lire l’article →
            </Link>
          </article>
        ))}
      </div>
    </StaticPage>
  )
}

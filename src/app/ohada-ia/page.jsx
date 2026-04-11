import Link from 'next/link'
import StaticPage from '@/components/layout/StaticPage'

export default function OhadaIaPage() {
  return (
    <StaticPage
      title="OHADA Intelligence IA"
      subtitle="Assistant juridique augmentée"
      description="Une IA spécialisée OHADA pour analyser vos actes, suggérer des clauses, vérifier la conformité et générer des recommandations de haute qualité."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-3">Ce que fait Abakoré IA</h2>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li>• Analyse des textes OHADA, codes et jurisprudence.</li>
            <li>• Synthèse des points clés et recommandations pratiques.</li>
            <li>• Vérification de conformité pour contrats, statuts et clauses.</li>
            <li>• Conseils personnalisés selon la zone UEMOA.</li>
          </ul>
        </div>
        <div className="card bg-navy-900 text-white">
          <h2 className="font-display text-xl font-semibold mb-3">Essayez la recherche intelligente</h2>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            Posez une question OHADA en quelques secondes et découvrez comment Abakoré transforme l'accès au droit pour les PME et experts.
          </p>
          <Link href="/search" className="btn-gold w-full justify-center py-3 rounded-xl">
            Tester la recherche
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Rapide', text: 'Réponses en temps réel sur l’AUDCG, le droit des sociétés et le droit du travail.' },
          { title: 'Précis', text: 'Sources OHADA citées et recommandations claires pour vos contrats et dossiers.' },
          { title: 'Sécurisé', text: 'Aucune donnée n’est partagée en dehors de la plateforme.' },
        ].map(card => (
          <div key={card.title} className="card border border-gray-100 p-6">
            <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{card.text}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}

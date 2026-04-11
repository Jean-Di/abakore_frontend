import StaticPage from '@/components/layout/StaticPage'

const RESOURCES = [
  { title: 'Guide OHADA 2025', description: 'Résumé des règles clés pour les PME et les experts.', badge: 'PDF' },
  { title: 'Modèles de contrats', description: 'Contrats de bail, distribution et prestation adaptés OHADA.', badge: 'Modèle' },
  { title: 'Fiches pratiques SYSCOHADA', description: 'Points de vigilance et meilleures pratiques comptables.', badge: 'Guide' },
]

export default function RessourcesPage() {
  return (
    <StaticPage
      title="Ressources OHADA"
      subtitle="Documents et guides pratiques"
      description="Accédez à des ressources utiles pour votre entreprise, votre cabinet et vos projets OHADA."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RESOURCES.map(resource => (
          <div key={resource.title} className="card p-6 border border-gray-100 hover:border-gold-300 transition-all">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700 mb-4">
              {resource.badge}
            </div>
            <h2 className="font-display text-lg font-semibold text-navy-900 mb-2">{resource.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}

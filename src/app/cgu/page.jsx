import StaticPage from '@/components/layout/StaticPage'

export default function CguPage() {
  return (
    <StaticPage
      title="Conditions d'utilisation"
      subtitle="Règles de la plateforme"
      description="Ces conditions encadrent l’utilisation d’Abakoré par les experts et les entreprises."
    >
      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">1. Objet</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          La présente plateforme met en relation des experts juridiques, comptables et RH avec des entreprises cherchant une assistance en droit OHADA.
        </p>
        <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">2. Utilisation</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Tout utilisateur s’engage à fournir des informations exactes, à respecter la réglementation et à utiliser le service de manière loyale.
        </p>
        <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">3. Responsabilités</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Abakoré fournit une plateforme de mise en relation et ne peut être tenu responsable des conseils individuels fournis par des experts tiers.
        </p>
      </div>
    </StaticPage>
  )
}

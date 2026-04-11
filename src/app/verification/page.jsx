import StaticPage from '@/components/layout/StaticPage'

const STEPS = [
  'Soumettre vos documents',
  'Vérification par Abakoré',
  'Validation du profil',
  'Badge certifié visible',
]

export default function VerificationPage() {
  return (
    <StaticPage
      title="Vérification profil"
      subtitle="Renforcez votre crédibilité"
      description="Obtenez le badge certifié en soumettant vos justificatifs : carte professionnelle, diplôme et pièce d’identité."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">Pourquoi se faire vérifier ?</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>• Améliore la confiance des clients.</li>
            <li>• Augmente la visibilité dans les résultats.</li>
            <li>• Confirme la qualité juridique et comptable.</li>
            <li>• Facilite la signature de mandats et contrats.</li>
          </ul>
        </div>
        <div className="card p-6 bg-gold-50 border border-gold-200">
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">Étapes de vérification</h2>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
            {STEPS.map(step => <li key={step}>{step}</li>)}
          </ol>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Documents acceptés</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          {['Carte du barreau', 'Attestation de diplôme', 'Kbis / RCCM', 'Pièce d’identité', 'Justificatif de domicile', 'Certificat de stage'].map(doc => (
            <div key={doc} className="rounded-2xl border border-gray-100 p-4 bg-white">{doc}</div>
          ))}
        </div>
      </div>
    </StaticPage>
  )
}

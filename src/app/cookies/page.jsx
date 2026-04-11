import StaticPage from '@/components/layout/StaticPage'

export const metadata = { title: 'Politique des cookies — Abakoré' }

export default function CookiesPage() {
  return (
    <StaticPage
      title="Politique des cookies"
      subtitle="Utilisation des cookies"
      description="Cette page explique comment Abakoré utilise les cookies et technologies similaires sur sa plateforme."
    >
      <div className="card p-6 space-y-6">
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">1. Qu'est-ce qu'un cookie ?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Il permet de mémoriser vos préférences et d'assurer le bon fonctionnement des fonctionnalités interactives.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">2. Cookies techniques</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ces cookies sont strictement nécessaires au fonctionnement du site (authentification, session, sécurité). Ils ne peuvent pas être désactivés sans dégrader votre expérience.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">3. Cookies analytiques</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nous utilisons des cookies d'analyse anonymisée pour comprendre comment les utilisateurs naviguent sur la plateforme et améliorer nos services. Ces données ne sont pas transmises à des tiers.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">4. Gérer vos préférences</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti lors de leur dépôt. Notez que certaines fonctionnalités du site peuvent ne plus être disponibles si vous désactivez les cookies techniques.
          </p>
        </section>
      </div>
    </StaticPage>
  )
}

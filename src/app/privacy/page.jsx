import StaticPage from '@/components/layout/StaticPage'

export const metadata = { title: 'Politique de confidentialité — Abakoré' }

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Politique de confidentialité"
      subtitle="Vos données, votre vie privée"
      description="Nous prenons la protection de vos données personnelles très au sérieux. Voici comment nous les collectons, les utilisons et les protégeons."
    >
      <div className="card p-6 space-y-6">
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">1. Données collectées</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nous collectons les informations que vous nous fournissez lors de la création de votre compte (nom, adresse email, pays, documents justificatifs) ainsi que les données de navigation nécessaires au bon fonctionnement de la plateforme.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">2. Utilisation des données</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vos données sont utilisées exclusivement pour vous mettre en relation avec des experts, traiter vos paiements de manière sécurisée, et améliorer nos services. Nous ne vendons aucune donnée personnelle à des tiers.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">3. Conservation des données</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vos données sont conservées pendant la durée de votre relation contractuelle avec Abakoré, et supprimées dans un délai de 3 ans après la clôture de votre compte, sauf obligation légale contraire.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">4. Vos droits</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Conformément aux réglementations en vigueur, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à <strong className="text-navy-700">privacy@abakore.com</strong>.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-navy-900 mb-3">5. Cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nous utilisons des cookies techniques indispensables au fonctionnement du site. Pour en savoir plus, consultez notre <a href="/cookies" className="text-gold-600 font-semibold hover:text-gold-700">politique relative aux cookies</a>.
          </p>
        </section>
      </div>
    </StaticPage>
  )
}

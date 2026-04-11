import StaticPage from '@/components/layout/StaticPage'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      subtitle="Besoin d’aide ?"
      description="Contactez notre service client ou consultez nos experts directement depuis la plateforme."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-3">Support Abakoré</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Notre équipe est disponible pour répondre à vos questions sur l’inscription, le fonctionnement de la plateforme et la mise en relation avec des experts OHADA.
          </p>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-navy-900">Email</p>
              <a href="mailto:contact@abakore.io" className="text-gold-600">contact@abakore.io</a>
            </div>
            <div>
              <p className="font-semibold text-navy-900">Téléphone</p>
              <a href="tel:+22512345678" className="text-gold-600">+225 12 34 56 78</a>
            </div>
            <div>
              <p className="font-semibold text-navy-900">Adresse</p>
              <p>Abidjan, Côte d’Ivoire</p>
            </div>
          </div>
        </div>
        <div className="card p-6 bg-navy-900 text-white">
          <h2 className="font-display text-xl font-semibold mb-3">Vous cherchez un expert ?</h2>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            Accédez à notre annuaire d’experts OHADA vérifiés et lancez une conversation immédiatement.
          </p>
          <Link href="/search" className="btn-gold w-full justify-center py-3 rounded-xl">
            Trouver un expert
          </Link>
        </div>
      </div>
    </StaticPage>
  )
}

import StaticPage from '@/components/layout/StaticPage'
import Link from 'next/link'

export default function CommunautePage() {
  return (
    <StaticPage
      title="Communauté"
      subtitle="Rejoignez l’écosystème Abakoré"
      description="Réseau d’experts, d’entreprises et de partenaires OHADA pour partager des opportunités, des bonnes pratiques et des projets."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-3">Ce que vous y trouvez</h2>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li>• Groupes thématiques OHADA et événements professionnels.</li>
            <li>• Partages de cas pratiques et retours d’expérience.</li>
            <li>• Opportunités de collaboration entre experts.</li>
            <li>• Actualités et formations spécifiques à la zone UEMOA.</li>
          </ul>
        </div>
        <div className="card p-6 bg-gold-50 border border-gold-200">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-3">Faites le premier pas</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            Inscrivez-vous, complétez votre profil et commencez à échanger avec les acteurs du droit, de la comptabilité et de la gestion d’entreprise OHADA.
          </p>
          <Link href="/auth/register" className="btn-gold w-full justify-center py-3 rounded-xl">
            Rejoindre la communauté
          </Link>
        </div>
      </div>
    </StaticPage>
  )
}

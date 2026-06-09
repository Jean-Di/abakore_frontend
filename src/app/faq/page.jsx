import StaticPage from '@/components/layout/StaticPage'
import Link from 'next/link'

export const metadata = { title: 'FAQ — Abakoré' }

const FAQS = [
  {
    category: 'Compte & inscription',
    items: [
      { q: 'Comment créer un compte expert ?', a: 'Rendez-vous sur la page d\'inscription, choisissez votre statut professionnel, puis déposez vos justificatifs. Votre profil sera validé sous 24 à 72h ouvrées.' },
      { q: 'Quels documents sont requis pour la vérification ?', a: 'Selon votre statut : carte professionnelle du barreau, diplôme, attestation d\'exercice ou pièce d\'identité nationale. Tous les fichiers doivent être au format PDF, JPG ou PNG (max 10 Mo).' },
      { q: 'Puis-je modifier mon profil après validation ?', a: 'Oui, vous pouvez mettre à jour vos informations à tout moment. Toute modification des justificatifs entraîne une nouvelle vérification.' },
    ],
  },
  {
    category: 'Missions & dossiers',
    items: [
      { q: 'Comment fonctionne le système d\'escrow ?', a: 'Lorsqu\'une entreprise propose un dossier, les fonds sont sécurisés sur un compte séquestre. Ils ne sont libérés vers l\'expert qu\'après validation de la mission par les deux parties.' },
      { q: 'Que se passe-t-il en cas de litige ?', a: 'Notre équipe de médiation intervient pour trouver une solution équitable. Vous pouvez initier une procédure de résolution depuis votre tableau de bord.' },
      { q: 'Puis-je proposer un dossier à plusieurs experts ?', a: 'Oui, vous pouvez envoyer une proposition à plusieurs experts. Une fois qu\'un expert accepte, les autres propositions sont automatiquement clôturées.' },
    ],
  },
  {
    category: 'Abonnements & facturation',
    items: [
      { q: 'Quels sont les plans disponibles pour les entreprises ?', a: 'Abakoré propose 4 plans pour les entreprises : Starter (25 000 XOF/mois, 1 utilisateur), Growth (49 000 XOF/mois, 3 utilisateurs), Business (149 000 XOF/mois, 10 utilisateurs — le plus populaire) et Enterprise (450 000 XOF/mois, utilisateurs illimités). Tous les plans incluent l\'IA OHADA, la veille juridique et les alertes d\'échéances.' },
      { q: 'Les experts juridiques doivent-ils souscrire à un plan ?', a: 'Non. Les experts juridiques s\'inscrivent gratuitement sur la Legal Marketplace d\'Abakoré pour proposer leurs services. Leur profil est vérifié par notre équipe avant activation (24 à 72h ouvrées).' },
      { q: 'Comment annuler mon abonnement ?', a: 'Vous pouvez annuler à tout moment depuis la section "Abonnement" de votre tableau de bord. L\'accès reste actif jusqu\'à la fin de la période en cours, sans frais supplémentaires.' },
    ],
  },
]

export default function FaqPage() {
  return (
    <StaticPage
      title="Foire aux questions"
      subtitle="Aide & Support"
      description="Trouvez rapidement des réponses aux questions les plus fréquentes sur Abakoré."
    >
      {FAQS.map(({ category, items }) => (
        <div key={category} className="card p-6">
          <h2 className="font-display text-base font-bold text-navy-900 mb-4 pb-3 border-b border-gray-100">{category}</h2>
          <div className="space-y-5">
            {items.map(({ q, a }) => (
              <div key={q}>
                <p className="text-sm font-semibold text-navy-800 mb-1.5">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Vous n'avez pas trouvé votre réponse ?</p>
        <Link href="/contact" className="btn-gold btn-sm inline-flex items-center gap-2">Contacter le support</Link>
      </div>
    </StaticPage>
  )
}

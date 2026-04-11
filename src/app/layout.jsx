import { Comfortaa, Open_Sans } from 'next/font/google'
import '../styles/globals.css'

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata = {
  title: 'Abakoré — Legal Intelligence Platform OHADA',
  description: 'La plateforme de référence pour l\'expertise juridique, comptable et RH dans l\'espace OHADA. Connectez PME et experts certifiés.',
  keywords: 'OHADA, droit des affaires, avocat, comptable, SYSCOHADA, UEMOA, expertise juridique',
  openGraph: {
    title: 'Abakoré — Legal Intelligence Platform',
    description: 'Trouvez l\'expert OHADA qu\'il vous faut. Négociez, collaborez et exécutez vos dossiers entièrement sur la plateforme.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${comfortaa.variable} ${openSans.variable}`}>
      <body className="font-body bg-gray-50 text-gray-700 antialiased">
        {children}
      </body>
    </html>
  )
}

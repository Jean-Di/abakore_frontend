import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function StaticPage({ title, subtitle, description, children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            {subtitle && <p className="sec-label">{subtitle}</p>}
            <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-4">{title}</h1>
            {description && (
              <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">{description}</p>
            )}
          </div>
          <div className="space-y-8">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}

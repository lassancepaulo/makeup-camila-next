import type { Metadata } from 'next'
import { Playfair_Display, Poppins } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://makeupcamilasoares.com'),
  title: {
    default: 'Makeup Camila Soares | Maquiadora Profissional',
    template: '%s | Makeup Camila Soares',
  },
  description: 'Maquiagem profissional para noivas, formaturas, ensaios e eventos especiais. Camila Soares — Makeup Artist com mais de 8 anos de experiência.',
  keywords: ['maquiadora', 'makeup', 'noiva', 'formatura', 'maquiagem profissional', 'Camila Soares'],
  authors: [{ name: 'Camila Soares' }],
  creator: 'Camila Soares',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://makeupcamilasoares.com',
    siteName: 'Makeup Camila Soares',
    title: 'Makeup Camila Soares | Maquiadora Profissional',
    description: 'Maquiagem profissional para os momentos mais especiais da sua vida.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Makeup Camila Soares' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Makeup Camila Soares',
    description: 'Maquiadora profissional — noivas, formaturas, ensaios e eventos.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: 'https://makeupcamilasoares.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/assets/logo-black.png" />
        <link rel="apple-touch-icon" href="/assets/logo-black.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BeautySalon',
              name: 'Makeup Camila Soares',
              url: 'https://makeupcamilasoares.com',
              logo: 'https://makeupcamilasoares.com/assets/logo-black.png',
              description: 'Maquiadora profissional — noivas, formaturas, ensaios e eventos especiais.',
              priceRange: '$$',
              address: { '@type': 'PostalAddress', addressCountry: 'BR' },
              sameAs: ['https://instagram.com/makeupcamilasoares'],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

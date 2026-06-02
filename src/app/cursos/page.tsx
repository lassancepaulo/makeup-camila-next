import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cursos de Maquiagem Profissional',
  description: 'Aprenda maquiagem profissional com a Camila Soares. Cursos completos em vídeo com certificado.',
  alternates: { canonical: 'https://makeupcamilasoares.com/cursos' },
}

export const revalidate = 3600

const LEVEL_LABEL: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

export default async function CursosPage() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .schema('makeup_camila')
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Cursos de Maquiagem — Camila Soares',
        url: 'https://makeupcamilasoares.com/cursos',
        itemListElement: (courses || []).map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Course',
            name: c.title,
            description: c.description,
            url: `https://makeupcamilasoares.com/cursos/${c.slug}`,
            provider: { '@type': 'Person', name: 'Camila Soares' },
            offers: { '@type': 'Offer', price: c.price_promo || c.price, priceCurrency: 'BRL' },
          },
        })),
      })}} />

      <main className="min-h-screen bg-[#FFF8F8]">
        {/* Header */}
        <div className="bg-gradient-coral py-20 text-center text-white">
          <span className="text-white/70 text-sm uppercase tracking-widest font-medium">Aprenda com quem faz</span>
          <h1 className="font-serif text-5xl mt-2 mb-4">Cursos de Maquiagem</h1>
          <p className="max-w-xl mx-auto text-white/80 text-lg">
            Técnicas profissionais, aulas em vídeo de alta qualidade e certificado ao concluir.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          {!courses?.length ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🎓</p>
              <h2 className="font-serif text-2xl text-[#3D1E1E] mb-2">Em breve!</h2>
              <p className="text-[#8A6060]">Estamos preparando conteúdo incrível para você.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => (
                <Link key={course.id} href={`/cursos/${course.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-coral relative overflow-hidden">
                    {course.thumbnail_url
                      ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="flex items-center justify-center h-full text-white/30 text-5xl">🎬</div>
                    }
                    {course.price_promo && (
                      <span className="absolute top-3 left-3 bg-[#F07272] text-white text-xs font-bold px-3 py-1 rounded-full">
                        PROMOÇÃO
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#FEE8E8] text-[#F07272] px-2 py-0.5 rounded-full font-semibold">
                        {LEVEL_LABEL[course.level]}
                      </span>
                      {course.certificate && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          + Certificado
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-xl text-[#3D1E1E] mb-2 group-hover:text-[#F07272] transition-colors">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-[#8A6060] text-sm line-clamp-2 mb-4">{course.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-[#FEE8E8]">
                      <div>
                        {course.price_promo ? (
                          <>
                            <span className="text-[#8A6060] text-sm line-through">{formatPrice(course.price)}</span>
                            <span className="text-[#F07272] font-bold text-xl ml-2">{formatPrice(course.price_promo)}</span>
                          </>
                        ) : (
                          <span className="text-[#3D1E1E] font-bold text-xl">{formatPrice(course.price)}</span>
                        )}
                      </div>
                      {course.duration_min > 0 && (
                        <span className="text-[#8A6060] text-xs">⏱ {Math.floor(course.duration_min / 60)}h{course.duration_min % 60 > 0 ? `${course.duration_min % 60}min` : ''}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

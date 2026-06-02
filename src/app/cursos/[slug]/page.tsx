import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, SITE_URL, WHATSAPP } from '@/lib/utils'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: course } = await supabase
    .schema('makeup_camila').from('courses')
    .select('title, description, thumbnail_url').eq('slug', slug).single()
  if (!course) return { title: 'Curso não encontrado' }
  return {
    title: course.title,
    description: course.description || undefined,
    openGraph: { title: course.title, type: 'website', images: course.thumbnail_url ? [{ url: course.thumbnail_url }] : [] },
    alternates: { canonical: `${SITE_URL}/cursos/${slug}` },
  }
}

export const revalidate = 3600

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .schema('makeup_camila').from('courses').select('*').eq('slug', slug).eq('is_published', true).single()
  if (!course) notFound()

  const { data: modules } = await supabase
    .schema('makeup_camila').from('modules')
    .select('*, lessons(*)').eq('course_id', course.id).order('position')

  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0
  const freeLessons = modules?.flatMap(m => m.lessons || []).filter((l: { is_free: boolean }) => l.is_free) || []
  const displayPrice = course.price_promo || course.price

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description,
        url: `${SITE_URL}/cursos/${slug}`,
        image: course.thumbnail_url,
        provider: { '@type': 'Person', name: 'Camila Soares', url: SITE_URL },
        offers: { '@type': 'Offer', price: displayPrice, priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
      })}} />

      <main className="min-h-screen bg-[#FFF8F8]">
        {/* Hero do curso */}
        <div className="bg-[#3D1E1E] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#F9ABAB] text-sm font-semibold uppercase tracking-widest">Curso online</span>
              <h1 className="font-serif text-4xl md:text-5xl mt-2 mb-4 leading-tight">{course.title}</h1>
              {course.description && <p className="text-white/75 text-lg leading-relaxed mb-6">{course.description}</p>}

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {course.duration_min > 0 && (
                  <span className="flex items-center gap-1 text-sm text-white/80">⏱ {Math.floor(course.duration_min/60)}h de conteúdo</span>
                )}
                <span className="flex items-center gap-1 text-sm text-white/80">🎬 {totalLessons} aulas</span>
                {course.certificate && <span className="flex items-center gap-1 text-sm text-white/80">📜 Certificado incluso</span>}
                <span className="flex items-center gap-1 text-sm text-white/80">♾️ Acesso vitalício</span>
              </div>
            </div>

            {/* Card de compra */}
            <div className="bg-white rounded-2xl p-8 text-[#3D1E1E] shadow-2xl">
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover rounded-xl mb-6" />
              )}
              <div className="mb-4">
                {course.price_promo ? (
                  <div>
                    <span className="text-[#8A6060] line-through text-lg">{formatPrice(course.price)}</span>
                    <div className="text-[#F07272] font-bold text-4xl mt-1">{formatPrice(course.price_promo)}</div>
                    <span className="text-green-600 text-sm font-semibold">
                      Economia de {formatPrice(course.price - course.price_promo)}
                    </span>
                  </div>
                ) : (
                  <div className="text-[#3D1E1E] font-bold text-4xl">{formatPrice(course.price)}</div>
                )}
                <p className="text-[#8A6060] text-sm mt-1">ou em até 12x no cartão</p>
              </div>

              {/* Botão de compra */}
              <a href={`/api/pagamento/checkout?course_id=${course.id}`}
                className="block w-full text-center py-4 rounded-xl font-bold text-lg text-white bg-gradient-coral hover:opacity-90 transition-opacity mb-3">
                🎓 Quero me matricular
              </a>

              {/* WhatsApp CTA */}
              <a href={`https://wa.me/${WHATSAPP}?text=Olá Camila! Tenho interesse no curso "${course.title}". Pode me dar mais informações?`}
                target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl font-semibold text-[#25D366] border-2 border-[#25D366] hover:bg-green-50 transition-colors">
                💬 Tirar dúvidas pelo WhatsApp
              </a>

              <div className="mt-4 space-y-2 text-sm text-[#8A6060]">
                <p className="flex items-center gap-2">✅ Pagamento 100% seguro</p>
                <p className="flex items-center gap-2">✅ Acesso imediato após confirmação</p>
                <p className="flex items-center gap-2">✅ Suporte direto com a Camila</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do curso */}
        <div className="max-w-4xl mx-auto px-6 py-16">

          {/* Aulas gratuitas */}
          {freeLessons.length > 0 && (
            <div className="mb-12">
              <h2 className="font-serif text-2xl text-[#3D1E1E] mb-6">Aulas gratuitas — assista agora</h2>
              <div className="space-y-3">
                {freeLessons.map((lesson: { id: string; title: string; duration_sec: number; mux_playback_id: string }) => (
                  <a key={lesson.id}
                    href={`/cursos/${slug}/assistir?lesson=${lesson.id}`}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-[#FEE8E8] group">
                    <span className="w-10 h-10 bg-gradient-coral rounded-full flex items-center justify-center text-white flex-shrink-0">▶</span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#3D1E1E] group-hover:text-[#F07272] transition-colors">{lesson.title}</p>
                    </div>
                    {lesson.duration_sec > 0 && (
                      <span className="text-[#8A6060] text-sm">{Math.floor(lesson.duration_sec/60)}min</span>
                    )}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Grátis</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Grade completa do curso */}
          {modules && modules.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl text-[#3D1E1E] mb-6">
                Grade completa — {totalLessons} aulas
              </h2>
              <div className="space-y-4">
                {modules.map((mod) => (
                  <div key={mod.id} className="bg-white rounded-xl border border-[#FEE8E8] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-[#FFF8F8]">
                      <h3 className="font-semibold text-[#3D1E1E]">{mod.title}</h3>
                      <span className="text-[#8A6060] text-sm">{mod.lessons?.length || 0} aulas</span>
                    </div>
                    <div className="divide-y divide-[#FEE8E8]">
                      {(mod.lessons || []).map((lesson: { id: string; title: string; duration_sec: number; is_free: boolean }) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                          <span className="text-[#F07272] text-sm">{lesson.is_free ? '▶' : '🔒'}</span>
                          <span className="flex-1 text-[#4A2B2B] text-sm">{lesson.title}</span>
                          {lesson.duration_sec > 0 && (
                            <span className="text-[#8A6060] text-xs">{Math.floor(lesson.duration_sec/60)}min</span>
                          )}
                          {lesson.is_free && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Grátis</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

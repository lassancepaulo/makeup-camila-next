import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, SITE_URL } from '@/lib/utils'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .schema('makeup_camila')
    .from('posts')
    .select('title, seo_desc, cover_url, published_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: 'Post não encontrado' }

  return {
    title: post.title,
    description: post.seo_desc || undefined,
    openGraph: {
      title: post.title,
      description: post.seo_desc || undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: post.cover_url ? [{ url: post.cover_url }] : [],
    },
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .schema('makeup_camila')
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  return (
    <>
      {/* Schema.org Article */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.seo_desc,
          image: post.cover_url,
          datePublished: post.published_at,
          author: { '@type': 'Person', name: 'Camila Soares', url: SITE_URL },
          publisher: {
            '@type': 'Organization',
            name: 'Makeup Camila Soares',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo-black.png` },
          },
        })
      }} />

      <main className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-6 py-16">
          {/* Categoria */}
          <div className="text-center mb-8">
            {post.category && (
              <span className="text-[#F07272] text-sm font-bold uppercase tracking-widest">
                {post.category}
              </span>
            )}
            <h1 className="font-serif text-4xl md:text-5xl text-[#3D1E1E] mt-3 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-[#8A6060]">
              <span>Por Camila Soares</span>
              <span>•</span>
              <span>{post.published_at ? formatDate(post.published_at) : ''}</span>
              {post.source_name && (
                <>
                  <span>•</span>
                  <span>Fonte: {post.source_name}</span>
                </>
              )}
            </div>
          </div>

          {/* Cover */}
          {post.cover_url && (
            <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
              <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Conteúdo */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-[#3D1E1E]
              prose-p:text-[#4A2B2B] prose-p:leading-relaxed
              prose-a:text-[#F07272] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#3D1E1E]
              prose-ul:text-[#4A2B2B]"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Tags */}
          {post.tags?.length && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[#FEE8E8]">
              {post.tags.map((tag: string) => (
                <span key={tag}
                  className="bg-[#FEE8E8] text-[#F07272] text-xs font-semibold px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-coral rounded-2xl p-8 text-center text-white">
            <h3 className="font-serif text-2xl mb-2">Quer uma maquiagem profissional?</h3>
            <p className="mb-6 opacity-90">Camila atende noivas, formaturas, ensaios e eventos especiais.</p>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=Oi Camila! Vi seu blog e gostaria de agendar uma consulta.`}
              className="inline-flex items-center gap-2 bg-white text-[#F07272] font-bold px-8 py-3 rounded-full hover:bg-[#FEE8E8] transition-colors">
              💬 Agendar pelo WhatsApp
            </a>
          </div>
        </article>
      </main>
    </>
  )
}

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Blog de Beleza e Maquiagem',
  description: 'Dicas de maquiagem, tendências de beleza, truques para noivas e muito mais. Conteúdo exclusivo da Camila Soares.',
  alternates: { canonical: 'https://makeupcamilasoares.com/blog' },
}

export const revalidate = 3600 // Revalida a cada 1 hora

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .schema('makeup_camila')
    .from('posts')
    .select('id, title, slug, excerpt, cover_url, category, tags, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  return (
    <>
      {/* Schema.org Blog */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Blog Makeup Camila Soares',
          url: 'https://makeupcamilasoares.com/blog',
          description: 'Dicas de maquiagem e beleza por Camila Soares',
        })
      }} />

      <main className="min-h-screen bg-[#FFF8F8]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-[#F07272] text-sm font-semibold uppercase tracking-widest">Conteúdo gratuito</span>
            <h1 className="font-serif text-4xl md:text-5xl text-[#3D1E1E] mt-2 mb-4">
              Blog de Beleza
            </h1>
            <p className="text-[#8A6060] max-w-xl mx-auto">
              Dicas, tendências e inspirações do mundo da maquiagem. Conteúdo novo toda semana!
            </p>
          </div>

          {/* Grid de posts */}
          {!posts?.length ? (
            <p className="text-center text-[#8A6060]">Nenhum post publicado ainda. Em breve!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                  {post.cover_url && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={post.cover_url} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-bold text-[#F07272] uppercase tracking-widest">
                        {post.category}
                      </span>
                    )}
                    <h2 className="font-serif text-xl text-[#3D1E1E] mt-1 mb-2 line-clamp-2 group-hover:text-[#F07272] transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[#8A6060] text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8A6060]">
                        {post.published_at ? formatDate(post.published_at) : ''}
                      </span>
                      <span className="text-[#F07272] text-sm font-semibold">Ler mais →</span>
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

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/news/publish  — chamado pelo admin ao aprovar um draft da fila
export async function POST(req: Request) {
  const { news_id } = await req.json()
  if (!news_id) return NextResponse.json({ error: 'news_id obrigatório' }, { status: 400 })

  const supabase = await createClient()

  // Busca o item da fila
  const { data: item, error } = await supabase
    .schema('makeup_camila')
    .from('news_queue')
    .select('*')
    .eq('id', news_id)
    .single()

  if (error || !item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  // Publica como post
  const { data: post, error: postErr } = await supabase
    .schema('makeup_camila')
    .from('posts')
    .insert({
      title:       item.ai_title || item.raw_title,
      slug:        item.ai_slug!,
      excerpt:     item.ai_excerpt,
      content:     item.ai_content,
      cover_url:   item.cover_url,
      category:    'beleza',
      tags:        item.ai_tags,
      status:      'published',
      source_url:  item.raw_url,
      source_name: item.source_name,
      seo_desc:    item.ai_seo_desc,
      published_at: new Date().toISOString(),
    })
    .select('id, slug')
    .single()

  if (postErr) return NextResponse.json({ error: postErr.message }, { status: 500 })

  // Marca como publicado na fila
  await supabase
    .schema('makeup_camila')
    .from('news_queue')
    .update({ status: 'published', reviewed_at: new Date().toISOString() })
    .eq('id', news_id)

  return NextResponse.json({ success: true, post })
}

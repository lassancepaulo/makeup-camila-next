import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import Anthropic from '@anthropic-ai/sdk'

// POST /api/news/fetch  — chamado pelo CRON do Railway
// Header: Authorization: Bearer CRON_SECRET
export async function POST(req: Request) {
  // Segurança básica para o cron
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // 1. Busca notícias de beleza/maquiagem
  const queries = ['maquiagem tendência', 'makeup trend', 'beleza noiva', 'skincare dicas']
  const query = queries[Math.floor(Math.random() * queries.length)]

  const gnewsRes = await fetch(
    `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=pt&country=br&max=5&apikey=${process.env.GNEWS_API_KEY}`
  )
  const gnewsData = await gnewsRes.json()
  const articles = gnewsData.articles || []

  if (!articles.length) {
    return NextResponse.json({ message: 'Nenhuma notícia encontrada', count: 0 })
  }

  let saved = 0

  for (const article of articles) {
    // Verifica se já existe
    const { data: existing } = await supabase
      .schema('makeup_camila')
      .from('news_queue')
      .select('id')
      .eq('raw_url', article.url)
      .single()

    if (existing) continue

    // 2. Claude reescreve o conteúdo em português, voz da Camila
    const prompt = `Você é redatora do blog da maquiadora profissional Camila Soares.
Reescreva o seguinte artigo de beleza em português brasileiro, com:
- Tom pessoal e caloroso, como se a Camila estivesse conversando com as seguidoras
- Título SEO-otimizado (máx 60 chars)
- Slug URL amigável (ex: dicas-make-noiva-inverno-2026)
- Resumo/excerpt (máx 160 chars)
- Conteúdo completo em HTML (use <p>, <h2>, <h3>, <ul>, <strong>)
- Meta description SEO (máx 155 chars)
- 3-5 tags relevantes em array

Artigo original:
Título: ${article.title}
Conteúdo: ${article.content || article.description}

Responda APENAS com JSON válido no formato:
{
  "title": "",
  "slug": "",
  "excerpt": "",
  "content": "",
  "seo_desc": "",
  "tags": []
}`

    try {
      const msg = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      })

      const raw = (msg.content[0] as { text: string }).text
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim())

      await supabase.schema('makeup_camila').from('news_queue').insert({
        raw_title:   article.title,
        raw_content: article.content || article.description,
        raw_url:     article.url,
        source_name: article.source?.name,
        cover_url:   article.image,
        ai_title:    json.title,
        ai_slug:     json.slug || slugify(json.title),
        ai_excerpt:  json.excerpt,
        ai_content:  json.content,
        ai_seo_desc: json.seo_desc,
        ai_tags:     json.tags,
        status:      'pending',
      })
      saved++
    } catch (e) {
      console.error('Erro ao processar artigo:', article.title, e)
    }
  }

  return NextResponse.json({ message: `${saved} novos artigos salvos para revisão`, count: saved })
}

'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NewsQueue } from '@/lib/supabase/types'

export default function NoticiasAdmin() {
  const [items, setItems] = useState<NewsQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .schema('makeup_camila')
      .from('news_queue')
      .select('*')
      .eq('status', 'pending')
      .order('fetched_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function publish(item: NewsQueue) {
    setPublishing(item.id)
    const res = await fetch('/api/news/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ news_id: item.id }),
    })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== item.id))
    } else {
      alert('Erro ao publicar. Tente novamente.')
    }
    setPublishing(null)
  }

  async function reject(id: string) {
    await supabase
      .schema('makeup_camila')
      .from('news_queue')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1E1E]">Fila de Notícias</h1>
          <p className="text-[#8A6060] text-sm mt-1">
            Artigos buscados automaticamente e reescritos pela IA. Revise e publique ou descarte.
          </p>
        </div>
        <button onClick={load}
          className="bg-[#FEE8E8] text-[#F07272] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F9ABAB]/30">
          ↻ Atualizar
        </button>
      </div>

      {loading && <p className="text-[#8A6060]">Carregando...</p>}

      {!loading && !items.length && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#FEE8E8]">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-[#3D1E1E] font-semibold">Fila vazia!</p>
          <p className="text-[#8A6060] text-sm mt-1">Novos artigos chegam automaticamente todo dia.</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#FEE8E8] overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                {item.cover_url && (
                  <img src={item.cover_url} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#8A6060] mb-1">
                    Fonte: {item.source_name || 'Desconhecida'} • {new Date(item.fetched_at).toLocaleDateString('pt-BR')}
                  </p>
                  <h3 className="font-bold text-[#3D1E1E] text-lg leading-tight">
                    {item.ai_title || item.raw_title}
                  </h3>
                  {item.ai_excerpt && (
                    <p className="text-[#8A6060] text-sm mt-1 line-clamp-2">{item.ai_excerpt}</p>
                  )}
                  {item.ai_tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.ai_tags.map(tag => (
                        <span key={tag} className="text-xs bg-[#FEE8E8] text-[#F07272] px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview do conteúdo */}
              {expanded === item.id && item.ai_content && (
                <div className="mt-4 pt-4 border-t border-[#FEE8E8]">
                  <div
                    className="prose prose-sm max-w-none text-[#4A2B2B] max-h-64 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: item.ai_content }}
                  />
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => publish(item)}
                  disabled={publishing === item.id}
                  className="bg-gradient-coral text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {publishing === item.id ? 'Publicando...' : '✅ Publicar'}
                </button>
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="bg-[#FEE8E8] text-[#F07272] px-4 py-2 rounded-lg text-sm font-semibold">
                  {expanded === item.id ? 'Fechar' : '👁 Ver conteúdo'}
                </button>
                {item.raw_url && (
                  <a href={item.raw_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#8A6060] hover:text-[#F07272]">
                    🔗 Original
                  </a>
                )}
                <button onClick={() => reject(item.id)}
                  className="ml-auto text-sm text-[#8A6060] hover:text-red-500">
                  ✕ Descartar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

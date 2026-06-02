'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Course } from '@/lib/supabase/types'

export default function AdminCursos() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', slug: '', description: '', price: '', price_promo: '',
    level: 'iniciante', thumbnail_url: '', certificate: true,
  })
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .schema('makeup_camila').from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.title || !form.slug || !form.price) {
      alert('Preencha título, slug e preço')
      return
    }
    setSaving(true)
    const { error } = await supabase.schema('makeup_camila').from('courses').insert({
      title: form.title,
      slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null,
      price: parseFloat(form.price),
      price_promo: form.price_promo ? parseFloat(form.price_promo) : null,
      level: form.level,
      thumbnail_url: form.thumbnail_url || null,
      certificate: form.certificate,
      is_published: false,
    })
    if (error) { alert('Erro: ' + error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ title:'',slug:'',description:'',price:'',price_promo:'',level:'iniciante',thumbnail_url:'',certificate:true })
    await load()
    setSaving(false)
  }

  async function togglePublish(course: Course) {
    await supabase.schema('makeup_camila').from('courses')
      .update({ is_published: !course.is_published }).eq('id', course.id)
    await load()
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1E1E]">Cursos</h1>
          <p className="text-[#8A6060] text-sm mt-1">Gerencie seus cursos online</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-gradient-coral text-white px-6 py-2.5 rounded-lg font-semibold text-sm">
          + Novo curso
        </button>
      </div>

      {/* Formulário novo curso */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#FEE8E8] p-6 mb-6">
          <h2 className="font-bold text-[#3D1E1E] mb-4">Novo curso</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">Título *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm" placeholder="Ex: Maquiagem para Noivas" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">Slug (URL) *</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm" placeholder="maquiagem-para-noivas" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">Descrição</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm" rows={3} />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">Preço (R$) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm" placeholder="297.00" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">Preço promocional (R$)</label>
              <input type="number" value={form.price_promo} onChange={e => setForm({...form, price_promo: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm" placeholder="197.00" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">Nível</label>
              <select value={form.level} onChange={e => setForm({...form, level: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm">
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A6060] uppercase block mb-1">URL da thumbnail</label>
              <input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})}
                className="w-full border border-[#FEE8E8] rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm text-[#4A2B2B]">
              <input type="checkbox" checked={form.certificate} onChange={e => setForm({...form, certificate: e.target.checked})} />
              Emite certificado
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving}
              className="bg-gradient-coral text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50">
              {saving ? 'Salvando...' : '✓ Criar curso'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-[#FEE8E8] px-4 py-2 rounded-lg text-sm text-[#8A6060]">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de cursos */}
      {loading ? <p className="text-[#8A6060]">Carregando...</p> : (
        <div className="space-y-4">
          {!courses.length && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#FEE8E8]">
              <p className="text-4xl mb-3">🎓</p>
              <p className="text-[#3D1E1E] font-semibold">Nenhum curso criado ainda</p>
            </div>
          )}
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-[#FEE8E8] p-5 flex items-center gap-4">
              {course.thumbnail_url
                ? <img src={course.thumbnail_url} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                : <div className="w-20 h-14 bg-gradient-coral rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">🎬</div>
              }
              <div className="flex-1">
                <h3 className="font-bold text-[#3D1E1E]">{course.title}</h3>
                <p className="text-[#8A6060] text-sm">/cursos/{course.slug}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#F07272] font-bold">{formatPrice(course.price_promo || course.price)}</span>
                  {course.price_promo && <span className="text-[#8A6060] line-through text-sm">{formatPrice(course.price)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/admin/cursos/${course.id}/aulas`}
                  className="bg-[#FEE8E8] text-[#F07272] px-4 py-2 rounded-lg text-sm font-semibold">
                  📹 Aulas
                </a>
                <button onClick={() => togglePublish(course)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    course.is_published
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                  {course.is_published ? '● Publicado' : '○ Rascunho'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

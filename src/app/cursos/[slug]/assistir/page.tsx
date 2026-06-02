'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  mux_playback_id: string | null
  duration_sec: number
  is_free: boolean
  position: number
}

interface Module {
  id: string
  title: string
  position: number
  lessons: Lesson[]
}

function WatchContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson')
  const token = searchParams.get('token') // token de matrícula

  const [modules, setModules] = useState<Module[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Verifica matrícula pelo token
      if (token) {
        const { data: enrollment } = await supabase
          .schema('makeup_camila')
          .from('enrollments')
          .select('id, course_id')
          .eq('id', token)
          .eq('mp_status', 'approved')
          .single()

        if (enrollment) setAuthorized(true)
      }

      // Busca módulos e aulas
      const { data: course } = await supabase
        .schema('makeup_camila')
        .from('courses')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!course) return

      const { data: mods } = await supabase
        .schema('makeup_camila')
        .from('modules')
        .select('*, lessons(*)')
        .eq('course_id', course.id)
        .order('position')

      const allMods = (mods || []).map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.position - b.position)
      }))
      setModules(allMods)

      // Define aula atual
      const allLessons = allMods.flatMap(m => m.lessons)
      const target = lessonId
        ? allLessons.find(l => l.id === lessonId)
        : allLessons.find(l => l.is_free) || allLessons[0]

      if (target) {
        setCurrentLesson(target)
        // Busca signed URL do Mux via API
        if (target.mux_playback_id) {
          const res = await fetch(`/api/cursos/signed-url?playback_id=${target.mux_playback_id}&enrollment_id=${token || ''}`)
          const data = await res.json()
          if (data.url) setSignedUrl(data.url)
        }
      }
      setLoading(false)
    }
    load()
  }, [slug, lessonId, token])

  async function selectLesson(lesson: Lesson) {
    if (!lesson.is_free && !authorized) {
      alert('Esta aula é exclusiva para alunos matriculados.')
      return
    }
    setCurrentLesson(lesson)
    setSignedUrl(null)
    if (lesson.mux_playback_id) {
      const res = await fetch(`/api/cursos/signed-url?playback_id=${lesson.mux_playback_id}&enrollment_id=${token || ''}`)
      const data = await res.json()
      if (data.url) setSignedUrl(data.url)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#3D1E1E] flex items-center justify-center text-white">
      Carregando aula...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1A0A0A] flex flex-col lg:flex-row">
      {/* Player */}
      <div className="flex-1">
        <div className="aspect-video bg-black">
          {signedUrl ? (
            <iframe
              src={signedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : currentLesson?.mux_playback_id ? (
            <div className="flex items-center justify-center h-full text-white/40">
              Carregando vídeo...
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 text-center px-8">
              <div>
                <p className="text-4xl mb-3">🎬</p>
                <p>Vídeo em breve</p>
              </div>
            </div>
          )}
        </div>

        {currentLesson && (
          <div className="p-6 text-white">
            <h1 className="font-serif text-2xl">{currentLesson.title}</h1>
          </div>
        )}
      </div>

      {/* Sidebar de aulas */}
      <div className="lg:w-80 bg-[#2A1414] overflow-y-auto lg:max-h-screen">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Conteúdo do curso</h2>
        </div>
        {modules.map(mod => (
          <div key={mod.id}>
            <div className="px-4 py-3 bg-[#3D1E1E]">
              <p className="text-[#F9ABAB] text-xs font-bold uppercase tracking-widest">{mod.title}</p>
            </div>
            {mod.lessons.map(lesson => (
              <button key={lesson.id}
                onClick={() => selectLesson(lesson)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-white/5 transition-colors ${
                  currentLesson?.id === lesson.id ? 'bg-[#F07272]/20 text-white' : 'text-white/70 hover:bg-white/5'
                }`}>
                <span className="text-sm flex-shrink-0">
                  {lesson.is_free || authorized ? '▶' : '🔒'}
                </span>
                <span className="text-sm flex-1 text-left">{lesson.title}</span>
                {lesson.duration_sec > 0 && (
                  <span className="text-xs text-white/40 flex-shrink-0">{Math.floor(lesson.duration_sec/60)}min</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AssistirPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#3D1E1E] flex items-center justify-center text-white">Carregando...</div>}>
      <WatchContent slug={params.slug} />
    </Suspense>
  )
}

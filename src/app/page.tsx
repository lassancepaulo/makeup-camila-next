import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, waLink, SITE_URL } from '@/lib/utils'

export const revalidate = 3600

const WA = process.env.NEXT_PUBLIC_WHATSAPP || '5511999999999'

const SERVICES = [
  { icon: '💍', title: 'Noiva', desc: 'Dia exclusivo com acompanhamento completo — da preparação até a troca do vestido.', slug: 'noiva', destaque: true },
  { icon: '👑', title: 'Madrinhas', desc: 'Pacote harmonioso para todo o cortejo, com cronograma personalizado.', slug: 'madrinhas' },
  { icon: '🎓', title: 'Formatura', desc: 'Make impecável para o dia mais especial da sua trajetória acadêmica.', slug: 'formatura' },
  { icon: '📸', title: 'Ensaio Fotográfico', desc: 'Maquiagem que fotografa bem e dura o dia inteiro.', slug: 'ensaio' },
  { icon: '✨', title: 'Evento Social', desc: 'Looks elaborados para festas, galas e eventos especiais.', slug: 'evento' },
  { icon: '🎓', title: 'Aula Particular', desc: 'Aprenda técnicas profissionais com a Camila no conforto da sua casa.', slug: 'aula' },
]

export default async function HomePage() {
  const supabase = await createClient()

  // Últimos posts
  const { data: posts } = await supabase
    .schema('makeup_camila')
    .from('posts')
    .select('title, slug, cover_url, category, published_at, excerpt')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  // Depoimentos em destaque
  const { data: testimonials } = await supabase
    .schema('makeup_camila')
    .from('testimonials')
    .select('name, role, text, rating')
    .eq('is_featured', true)
    .order('position')
    .limit(4)

  // Portfólio em destaque
  const { data: portfolio } = await supabase
    .schema('makeup_camila')
    .from('portfolio')
    .select('title, image_url, category')
    .eq('is_featured', true)
    .order('position')
    .limit(6)

  return (
    <>
      {/* Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BeautySalon',
        name: 'Makeup Camila Soares',
        url: SITE_URL,
        image: `${SITE_URL}/assets/logo-black.png`,
        description: 'Maquiadora profissional — noivas, formaturas, ensaios e eventos especiais.',
        priceRange: '$$',
        sameAs: ['https://instagram.com/makeupcamilasoares'],
      })}} />

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-5 bg-transparent" style={{ '--navbar-scrolled': '0' } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="relative" style={{ height: 128 }}>
            <img src="/assets/logo-brand-white.png" alt="Makeup Camila Soares" className="nav-logo-light absolute top-0 left-0" style={{ height: 128, width: 'auto' }} />
            <img src="/assets/logo-black.png"       alt="Makeup Camila Soares" className="nav-logo-dark  absolute top-0 left-0 opacity-0" style={{ height: 128, width: 'auto' }} />
          </Link>
          <ul className="hidden md:flex items-center gap-2">
            {[['#sobre','Sobre'],['#servicos','Serviços'],['#portfolio','Portfólio'],['#depoimentos','Depoimentos'],].map(([href,label])=>(
              <li key={href}><a href={href} className="px-4 py-2 rounded-full text-white/90 text-sm font-medium hover:bg-white/15 transition-colors nav-link">{label}</a></li>
            ))}
            {posts?.length ? <li><Link href="/blog" className="px-4 py-2 rounded-full text-white/90 text-sm font-medium hover:bg-white/15 transition-colors nav-link">Blog</Link></li> : null}
            <li>
              <a href={`https://wa.me/${WA}?text=Olá Camila! Gostaria de agendar um horário.`}
                className="ml-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-coral hover:opacity-90 transition-opacity">
                Agendar horário
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(240,114,114,.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(216,90,90,.5) 0%, transparent 50%), linear-gradient(160deg,#2A1414 0%,#3D1E1E 50%,#4A1F1F 100%)'
        }} />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-32 pb-20">
          <span className="text-[#F9ABAB] text-sm tracking-[4px] uppercase font-light mb-6 block">✦ Beleza que transforma ✦</span>
          <h1 className="font-serif text-[clamp(3.5rem,9vw,7rem)] font-bold text-white leading-none mb-4">
            Camila<br/><em className="text-[#F9ABAB] not-italic font-normal italic">Soares</em>
          </h1>
          <p className="text-white/70 text-sm tracking-[3px] uppercase font-light mb-4">Makeup Artist Profissional</p>
          <p className="text-white/75 text-lg max-w-lg mx-auto mb-10">Criando experiências únicas de beleza para os momentos mais especiais da sua vida</p>
          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <a href="#servicos" className="px-8 py-4 rounded-full font-semibold text-white bg-gradient-coral hover:opacity-90 transition-opacity">
              Agende sua consultoria
            </a>
            <a href="#portfolio" className="px-8 py-4 rounded-full font-semibold text-white border-2 border-white/70 hover:bg-white/15 transition-colors">
              Ver portfólio
            </a>
          </div>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {[['500+','Clientes atendidas'],['8+','Anos de experiência'],['100%','Satisfação garantida']].map(([n,l])=>(
              <div key={n} className="text-center">
                <span className="block font-serif text-[2.2rem] font-bold text-[#F9ABAB]">{n}</span>
                <span className="text-white/60 text-xs uppercase tracking-widest">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <a href="#sobre" className="absolute bottom-10 left-1/2 -translate-x-1/2 w-11 h-11 border border-white/30 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors animate-bounce">
          ↓
        </a>
      </section>

      {/* ── SOBRE ──────────────────────────────── */}
      <section id="sobre" className="py-24 bg-[#FFF8F8]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="aspect-[3/4] bg-gradient-coral rounded-2xl flex items-center justify-center text-white/30 text-6xl font-serif italic">
            📸
          </div>
          <div>
            <span className="text-[#F07272] text-sm font-semibold uppercase tracking-widest">Sobre mim</span>
            <h2 className="font-serif text-4xl text-[#3D1E1E] mt-2 mb-6">Arte e técnica a serviço da sua beleza</h2>
            <p className="text-[#8A6060] mb-4 leading-relaxed">
              Olá! Sou Camila Soares, maquiadora profissional apaixonada pela arte de realçar a beleza natural de cada mulher. Com mais de 8 anos de experiência, já tive o privilégio de fazer parte dos momentos mais especiais na vida de centenas de clientes.
            </p>
            <p className="text-[#8A6060] mb-8 leading-relaxed">
              Minha abordagem é personalizada — cada rosto conta uma história única, e meu trabalho é destacar o melhor de cada uma.
            </p>
            <div className="space-y-3 mb-8">
              {['Certificada pela Academia Brasileira de Beleza','Especialização em make para noivas','Experiência em editorials e fashion'].map(c=>(
                <div key={c} className="flex items-center gap-3 text-[#4A2B2B]">
                  <span className="text-[#F07272]">✓</span>{c}
                </div>
              ))}
            </div>
            <a href={`https://wa.me/${WA}?text=Olá Camila! Gostaria de conhecer melhor seu trabalho.`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-coral hover:opacity-90 transition-opacity">
              Fale comigo
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ───────────────────────────── */}
      <section id="servicos" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[#F07272] text-sm font-semibold uppercase tracking-widest">O que ofereço</span>
            <h2 className="font-serif text-4xl text-[#3D1E1E] mt-2">Serviços exclusivos</h2>
            <p className="text-[#8A6060] mt-3 max-w-xl mx-auto">Cada serviço é pensado para realçar sua beleza única com técnicas modernas e produtos premium</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {SERVICES.map(s => (
              <div key={s.slug} className={`rounded-2xl p-8 flex flex-col border transition-all hover:-translate-y-2 hover:shadow-xl ${s.destaque ? 'bg-[#3D1E1E] border-transparent' : 'bg-[#FFF8F8] border-transparent hover:border-[#F9ABAB]'}`}>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className={`font-serif text-xl mb-3 ${s.destaque ? 'text-white' : 'text-[#3D1E1E]'}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed flex-1 mb-6 ${s.destaque ? 'text-white/80' : 'text-[#8A6060]'}`}>{s.desc}</p>
                <a href={`https://wa.me/${WA}?text=Olá Camila! Tenho interesse no serviço de ${s.title}. Podemos conversar?`}
                  className={`inline-flex items-center justify-center py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 ${s.destaque ? 'bg-gradient-coral text-white' : 'bg-gradient-coral text-white'}`}>
                  Agendar consulta →
                </a>
              </div>
            ))}
          </div>
          {/* CTA WhatsApp */}
          <div className="mt-14 text-center py-10 px-8 rounded-2xl" style={{ background: 'linear-gradient(135deg,#fff4f4,#fff0f0)', border: '1px solid rgba(240,114,114,.18)' }}>
            <p className="text-[#8A6060] text-lg mb-5">Não sabe qual serviço escolher? Fale comigo pelo WhatsApp!</p>
            <a href={`https://wa.me/${WA}?text=Oi Camila! Gostaria de um orçamento personalizado.`}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-white text-lg bg-[#25D366] hover:bg-[#1EBE5A] transition-colors shadow-lg">
              <span className="text-2xl">💬</span> Solicitar orçamento pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── PORTFÓLIO ──────────────────────────── */}
      <section id="portfolio" className="py-24 bg-[#3D1E1E]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[#F9ABAB] text-sm font-semibold uppercase tracking-widest">Trabalhos realizados</span>
            <h2 className="font-serif text-4xl text-white mt-2">Portfólio</h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">Cada trabalho é único — veja algumas das transformações que já fizemos juntas</p>
          </div>
          {portfolio && portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.map((item, i) => (
                <div key={item.image_url} className={`rounded-xl overflow-hidden ${i === 0 ? 'row-span-2' : ''}`}>
                  <img src={item.image_url} alt={item.title || item.category} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['noiva','formatura','editorial','evento','noiva-2','social'].map((cat, i) => (
                <div key={cat} className={`aspect-square rounded-xl bg-gradient-coral flex items-center justify-center text-white/30 text-4xl font-serif ${i === 0 ? 'row-span-2' : ''}`}>
                  📸
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <a href={`https://wa.me/${WA}?text=Oi Camila! Vi seu portfólio e adorei! Posso agendar uma consulta?`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white border-2 border-white/40 hover:bg-white/10 transition-colors">
              📷 Ver mais no Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────── */}
      <section id="depoimentos" className="py-24 bg-[#FFF8F8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[#F07272] text-sm font-semibold uppercase tracking-widest">Clientes</span>
            <h2 className="font-serif text-4xl text-[#3D1E1E] mt-2">O que dizem sobre mim</h2>
          </div>
          {testimonials && testimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map(t => (
                <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4 text-yellow-400 text-sm">{'★'.repeat(t.rating)}</div>
                  <p className="text-[#8A6060] italic text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-coral flex items-center justify-center text-white text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-[#3D1E1E] font-semibold text-sm">{t.name}</p>
                      {t.role && <p className="text-[#8A6060] text-xs">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{n:'Ana Paula',r:'Noiva',t:'Camila é incrível! Me senti a noiva mais linda do mundo. Ela entendeu exatamente o que eu queria!'},
                {n:'Mariana',r:'Formanda',t:'Make perfeita para minha formatura. Durou a noite toda e fotografou lindamente!'},
                {n:'Fernanda',r:'Madrinha',t:'Toda a turma ficou apaixonada! Organizou o cronograma perfeitamente.'},
                {n:'Juliana',r:'Ensaio foto',t:'Melhor investimento que fiz. As fotos ficaram perfeitas graças à make.'},
              ].map(t=>(
                <div key={t.n} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-yellow-400 text-sm mb-4">★★★★★</div>
                  <p className="text-[#8A6060] italic text-sm leading-relaxed mb-5">"{t.t}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-coral flex items-center justify-center text-white text-sm font-bold">{t.n[0]}</div>
                    <div>
                      <p className="text-[#3D1E1E] font-semibold text-sm">{t.n}</p>
                      <p className="text-[#8A6060] text-xs">{t.r}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BLOG (se tiver posts) ───────────────── */}
      {posts && posts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[#F07272] text-sm font-semibold uppercase tracking-widest">Conteúdo gratuito</span>
                <h2 className="font-serif text-4xl text-[#3D1E1E] mt-1">Blog de Beleza</h2>
              </div>
              <Link href="/blog" className="text-[#F07272] font-semibold hover:underline">Ver todos →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-7">
              {posts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                  {p.cover_url && (
                    <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4">
                      <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <span className="text-[#F07272] text-xs font-bold uppercase tracking-widest">{p.category}</span>
                  <h3 className="font-serif text-lg text-[#3D1E1E] mt-1 mb-2 line-clamp-2 group-hover:text-[#F07272] transition-colors">{p.title}</h3>
                  <p className="text-[#8A6060] text-sm line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTATO / CTA ──────────────────────── */}
      <section id="contato" className="py-24 bg-[#FFF8F8]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[#F07272] text-sm font-semibold uppercase tracking-widest">Vamos conversar</span>
          <h2 className="font-serif text-4xl text-[#3D1E1E] mt-2 mb-4">Pronta para se transformar?</h2>
          <p className="text-[#8A6060] max-w-xl mx-auto mb-10">Agende uma consulta gratuita e vamos criar juntas o look perfeito para o seu momento especial.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`https://wa.me/${WA}?text=Olá Camila! Quero agendar uma consulta.`}
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-semibold text-white text-lg bg-[#25D366] hover:bg-[#1EBE5A] transition-colors shadow-lg">
              💬 Agendar pelo WhatsApp
            </a>
            <a href="https://instagram.com/makeupcamilasoares" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-gradient-coral hover:opacity-90 transition-opacity">
              📸 Ver no Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="bg-[#2A1414] text-white/70 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
            <div>
              <img src="/assets/logo-brand-white.png" alt="Makeup Camila Soares" className="h-14 mb-4" />
              <p className="text-sm leading-relaxed text-white/50">Maquiadora profissional criando experiências únicas de beleza.</p>
            </div>
            <div>
              <h4 className="text-[#F9ABAB] text-xs uppercase tracking-widest mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm">
                {SERVICES.map(s=><li key={s.slug}>{s.title}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-[#F9ABAB] text-xs uppercase tracking-widest mb-4">Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/cursos" className="hover:text-white transition-colors">Cursos</Link></li>
                <li><Link href="/produtos" className="hover:text-white transition-colors">Produtos</Link></li>
                <li><a href={`https://wa.me/${WA}`} className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>© {new Date().getFullYear()} Makeup Camila Soares. Todos os direitos reservados.</p>
            <a href="/admin" className="hover:text-white/50 transition-colors">Admin</a>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ─────────────────────── */}
      <a href={`https://wa.me/${WA}?text=Olá Camila! Vim pelo site e gostaria de mais informações.`}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white text-2xl shadow-xl hover:scale-110 transition-transform z-50"
        aria-label="WhatsApp">
        💬
      </a>

      {/* ── Navbar scroll script ────────────────── */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var nb = document.getElementById('navbar');
          var lights = document.querySelectorAll('.nav-logo-light');
          var darks  = document.querySelectorAll('.nav-logo-dark');
          var links  = document.querySelectorAll('.nav-link');
          function update(){
            var s = window.scrollY > 60;
            nb.style.background = s ? 'rgba(255,255,255,.97)' : 'transparent';
            nb.style.backdropFilter = s ? 'blur(20px)' : 'none';
            nb.style.boxShadow = s ? '0 2px 8px rgba(0,0,0,.08)' : 'none';
            nb.style.paddingTop = s ? '12px' : '20px';
            nb.style.paddingBottom = s ? '12px' : '20px';
            lights.forEach(function(el){ el.style.opacity = s ? '0' : '1'; });
            darks.forEach(function(el){  el.style.opacity = s ? '1' : '0'; });
            links.forEach(function(el){  el.style.color   = s ? '#4A2B2B' : 'rgba(255,255,255,.9)'; });
          }
          window.addEventListener('scroll', update);
          update();
        })();
      `}} />
    </>
  )
}

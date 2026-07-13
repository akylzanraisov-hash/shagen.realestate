import { Calendar, Clock, ArrowRight, Home, DollarSign, TrendingUp } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';
import CardImage from '../components/CardImage';
import { BLOG_ARTICLES } from '../content/site-content';

const articleIcons = [Home, DollarSign, TrendingUp];

const categoryColors: Record<string, string> = {
  АРХИТЕКТУРА: '#3B82F6',
  ФИНАНСЫ: '#10B981',
  ИНВЕСТИЦИИ: '#D9A34A',
};

export default function Blog() {
  return (
    <>
      <PageSeo
        title="Блог — строительство и инвестиции в A-Frame — SHAG Engineering"
        description="Экспертные статьи о строительстве каркасных домов A-Frame, инвестициях в загородную недвижимость, выборе проекта и расчёте бюджета."
        canonical="https://shagenrealestate.com/blog"
      />
      <InnerPageHero
        label="БЛОГ"
        title={'ЭКСПЕРТНЫЕ\nСТАТЬИ'}
        subtitle="Делимся знаниями о строительстве A-Frame, инвестициях в загородную недвижимость и жизни в треугольных домах."
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ПОСЛЕДНИЕ ПУБЛИКАЦИИ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_ARTICLES.map((a, i) => {
              const Icon = articleIcons[i];
              return (
                <article
                  key={a.title}
                  className="rounded-[16px] overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="relative">
                    <CardImage icon={Icon} height="200px" />
                    <span
                      className="absolute top-4 left-4 uppercase font-semibold px-2.5 py-1 rounded-md"
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        background: 'rgba(10,13,18,0.85)',
                        color: categoryColors[a.category] ?? '#D9A34A',
                      }}
                    >
                      {a.category}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#707887' }}>
                        <Calendar size={12} strokeWidth={1.5} />
                        {a.date}
                      </span>
                      <span className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#707887' }}>
                        <Clock size={12} strokeWidth={1.5} />
                        {a.readTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#F3F5F8] mb-3 leading-snug" style={{ fontSize: '15px' }}>
                      {a.title}
                    </h3>
                    <p className="flex-1 mb-5" style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>
                      {a.excerpt}
                    </p>
                    <button
                      className="flex items-center gap-2 text-[#D9A34A] font-semibold uppercase transition-colors duration-200 hover:text-[#E9B65C] self-start"
                      style={{ fontSize: '11px', letterSpacing: '0.1em', minHeight: '44px' }}
                    >
                      ЧИТАТЬ ДАЛЕЕ
                      <ArrowRight size={13} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

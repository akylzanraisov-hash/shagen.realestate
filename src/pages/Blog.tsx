import { Calendar, Clock, ArrowRight } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';

// TODO: заменить на реальные статьи заказчика
const articles = [
  {
    title: 'Почему A-Frame — лучший выбор для загородного дома в 2025 году',
    excerpt: 'Рассказываем, чем треугольные дома отличаются от обычных каркасников, как снижают затраты на отопление и почему они быстро растут в цене при перепродаже.',
    date: '5 июля 2025',
    readTime: '7 мин',
    category: 'АРХИТЕКТУРА',
    img: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    title: 'Как рассчитать бюджет на строительство A-Frame: полный чек-лист',
    excerpt: 'Разбираем все статьи расходов: фундамент, каркас, кровля, утепление, инженерия и отделка. Приводим реальные цифры из наших проектов 2024–2025 годов.',
    date: '22 июня 2025',
    readTime: '10 мин',
    category: 'ФИНАНСЫ',
    img: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    title: 'Инвестиции в загородную недвижимость: сравниваем A-Frame и классические дачи',
    excerpt: 'Анализируем ликвидность, доходность от аренды и прирост стоимости трёх форматов недвижимости на горизонте 5 лет. Спойлер: A-Frame выигрывает по всем метрикам.',
    date: '10 июня 2025',
    readTime: '8 мин',
    category: 'ИНВЕСТИЦИИ',
    img: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
];

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
        description="Экспертные статьи о строительстве каркасных домов A-Frame, инвестициях в загородную недвижимость, выборе проекта и расчёте бюджета. Опыт 500+ реализованных объектов."
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

          {/* TODO: заменить на реальные статьи заказчика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <article
                key={a.title}
                className="rounded-[16px] overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={a.img}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span
                    className="absolute top-4 left-4 uppercase font-semibold px-2.5 py-1 rounded-md"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      background: 'rgba(10,13,18,0.75)',
                      color: categoryColors[a.category] ?? '#D9A34A',
                      backdropFilter: 'blur(4px)',
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
                    style={{ fontSize: '11px', letterSpacing: '0.1em' }}
                  >
                    ЧИТАТЬ ДАЛЕЕ
                    <ArrowRight size={13} strokeWidth={2} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

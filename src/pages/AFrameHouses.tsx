import { Ruler, Layers, Leaf, Zap, Home, Grid, Maximize, Star } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';
import CardImage from '../components/CardImage';
import { AFRAME_PROJECTS } from '../content/site-content';

const projectIcons = [Home, Grid, Maximize, Star];

const advantages = [
  { icon: Ruler, title: 'Эффективная планировка', text: 'Угловая форма крыши создаёт двусветные пространства и антресоли, максимально используя каждый квадратный метр.' },
  { icon: Layers, title: 'Прочность конструктива', text: 'Треугольная форма — самая устойчивая в архитектуре. A-Frame уверенно переносит высокие снеговые и ветровые нагрузки.' },
  { icon: Leaf, title: 'Энергоэффективность', text: 'Компактная форма снижает теплопотери. При правильном утеплении достигается высокий класс энергоэффективности.' },
  { icon: Zap, title: 'Быстрый монтаж', text: 'Каркасная технология позволяет возвести коробку в короткие сроки. Строим круглый год, независимо от сезона.' },
];

export default function AFrameHouses() {
  return (
    <>
      <PageSeo
        title="Дома A-Frame — каталог проектов — SHAG Engineering"
        description="Каталог домов A-Frame: проекты 6×8, 6×10, 8×12, A-Frame Max. Стоимость рассчитывается по проекту. Строительство под ключ. Узнайте детали у менеджера."
        canonical="https://shagenrealestate.com/a-frame-houses"
      />
      <InnerPageHero
        label="ДОМА A-FRAME"
        title={'УНИКАЛЬНАЯ\nАРХИТЕКТУРА'}
        subtitle="Треугольные дома с двусветными пространствами, панорамными окнами и высочайшей энергоэффективностью. Четыре типоразмера на любой участок."
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            КАТАЛОГ ПРОЕКТОВ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AFRAME_PROJECTS.map((p, i) => {
              const Icon = projectIcons[i];
              return (
                <div
                  key={p.name}
                  className="rounded-[16px] overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <CardImage icon={Icon} height="180px" />
                  <div className="p-4">
                    <h3 className="font-bold text-[#F3F5F8] mb-3" style={{ fontSize: '15px' }}>{p.name}</h3>
                    <div className="flex flex-col gap-1 mb-4">
                      <span style={{ fontSize: '12px', color: '#8B93A1' }}>Площадь: <span className="text-[#C7CBD3]">{p.area}</span></span>
                      <span style={{ fontSize: '12px', color: '#8B93A1' }}>Этажность: <span className="text-[#C7CBD3]">{p.floors}</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ fontSize: '13px', color: '#D9A34A' }}>{p.price}</span>
                      <button
                        className="text-[11px] font-semibold text-[#D9A34A] uppercase"
                        style={{ letterSpacing: '0.08em', minHeight: '44px' }}
                      >
                        ВЫБРАТЬ →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="w-full mb-10" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ПРЕИМУЩЕСТВА A-FRAME
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {advantages.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[14px] p-6 flex gap-5"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
                >
                  <Icon size={20} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
                </div>
                <div>
                  <h3 className="font-bold text-[#F3F5F8] mb-2" style={{ fontSize: '14px' }}>{title}</h3>
                  <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

import { Ruler, Layers, Leaf, Zap } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';

// TODO: заменить на реальный текст заказчика
const projects = [
  {
    name: 'A-Frame 6×8',
    area: '48 м²',
    floors: '1–2 этажа',
    price: 'от 3 200 000 ₽',
    img: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600&h=380&fit=crop',
  },
  {
    name: 'A-Frame 6×10',
    area: '60 м²',
    floors: '1–2 этажа',
    price: 'от 4 100 000 ₽',
    img: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=600&h=380&fit=crop',
  },
  {
    name: 'A-Frame 8×12',
    area: '96 м²',
    floors: '2 этажа',
    price: 'от 6 800 000 ₽',
    img: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600&h=380&fit=crop',
  },
  {
    name: 'A-Frame Max',
    area: '140 м²',
    floors: '2–3 этажа',
    price: 'от 10 500 000 ₽',
    img: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600&h=380&fit=crop',
  },
];

// TODO: заменить на реальный текст заказчика
const advantages = [
  { icon: Ruler, title: 'Эффективная планировка', text: 'Угловая форма крыши создаёт двусветные пространства и антресоли, максимально используя каждый квадратный метр.' },
  { icon: Layers, title: 'Прочность конструктива', text: 'Треугольная форма — самая устойчивая в архитектуре. A-Frame выдерживает снеговую нагрузку до 560 кг/м² и порывы ветра до 40 м/с.' },
  { icon: Leaf, title: 'Энергоэффективность', text: 'Компактная форма снижает теплопотери. Класс энергоэффективности A+ при правильном утеплении. Расходы на отопление в 2–3 раза ниже.' },
  { icon: Zap, title: 'Быстрый монтаж', text: 'Каркасная технология позволяет возвести коробку за 3–5 недель. Работы не зависят от сезона — строим круглый год.' },
];

export default function AFrameHouses() {
  return (
    <>
      <PageSeo
        title="Дома A-Frame — каталог проектов и цены — SHAG Engineering"
        description="Каталог домов A-Frame от 48 до 140 м². Цены от 3,2 млн ₽. Проекты 6×8, 6×10, 8×12, A-Frame Max. Строительство под ключ за 3–4 месяца. Узнайте стоимость онлайн."
        canonical="https://shagenrealestate.com/a-frame-houses"
      />
      <InnerPageHero
        label="ДОМА A-FRAME"
        title={'УНИКАЛЬНАЯ\nАРХИТЕКТУРА'}
        subtitle="Треугольные дома с двусветными пространствами, панорамными окнами и высочайшей энергоэффективностью. 4 типоразмера на любой участок."
      />

      {/* Каталог проектов */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            КАТАЛОГ ПРОЕКТОВ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {projects.map((p) => (
              <div
                key={p.name}
                className="rounded-[16px] overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="h-[200px] overflow-hidden">
                  <img
                    src={p.img}
                    alt={`Проект ${p.name} — каркасный дом A-Frame`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#F3F5F8] mb-3" style={{ fontSize: '15px' }}>{p.name}</h3>
                  <div className="flex flex-col gap-1 mb-4">
                    <span style={{ fontSize: '12px', color: '#8B93A1' }}>Площадь: <span className="text-[#C7CBD3]">{p.area}</span></span>
                    <span style={{ fontSize: '12px', color: '#8B93A1' }}>Этажность: <span className="text-[#C7CBD3]">{p.floors}</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ fontSize: '14px', color: '#D9A34A' }}>{p.price}</span>
                    <button
                      className="text-[11px] font-semibold text-[#D9A34A] uppercase"
                      style={{ letterSpacing: '0.08em' }}
                    >
                      ВЫБРАТЬ →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
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
                  {/* TODO: заменить на реальный текст заказчика */}
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

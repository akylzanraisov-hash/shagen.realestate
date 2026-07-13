import { MapPin, TrendingUp, Key } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';

// TODO: заменить на реальный текст заказчика
const properties = [
  {
    title: 'A-Frame Лесной 6×8',
    location: 'Подмосковье, 80 км от МКАД',
    price: 'от 4 800 000 ₽',
    area: '48 м²',
    img: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    title: 'A-Frame Горный 8×12',
    location: 'Сочи, Красная Поляна',
    price: 'от 9 200 000 ₽',
    area: '96 м²',
    img: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    title: 'A-Frame Max 10×14',
    location: 'Карелия, берег озера',
    price: 'от 14 500 000 ₽',
    area: '140 м²',
    img: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
];

// TODO: заменить на реальный текст заказчика
const terms = [
  { icon: TrendingUp, title: 'Ипотека и рассрочка', text: 'Партнёрские программы с ведущими банками. Ипотечная ставка от 5,9% годовых. Рассрочка на 24 месяца без переплаты.' },
  { icon: Key, title: 'Готовые и строящиеся', text: 'В каталоге как готовые объекты для немедленного заселения, так и объекты на этапе строительства по сниженной цене.' },
  { icon: MapPin, title: 'Выбор локации', text: 'Московская область, Краснодарский край, Карелия, Сибирь. Помогаем подобрать земельный участок под ваш бюджет.' },
];

export default function RealEstate() {
  return (
    <>
      <PageSeo
        title="Продажа недвижимости A-Frame — SHAG Engineering"
        description="Каталог готовых и строящихся домов A-Frame премиум класса. Ипотека от 5,9%, рассрочка без переплаты. Подмосковье, Сочи, Карелия. Консультация бесплатно."
        canonical="https://shagenrealestate.com/real-estate"
      />
      <InnerPageHero
        label="НЕДВИЖИМОСТЬ"
        title={'ГОТОВЫЕ ОБЪЕКТЫ\nA-FRAME'}
        subtitle="Премиальные дома для жизни, аренды и инвестиций. Выберите объект из каталога или закажите индивидуальный проект."
      />

      {/* Каталог */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            КАТАЛОГ ОБЪЕКТОВ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <div
                key={p.title}
                className="rounded-[16px] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={p.img}
                    alt={`${p.title} — дом A-Frame`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,13,18,0.7) 0%, transparent 50%)' }} />
                  <span
                    className="absolute bottom-3 left-4 font-bold"
                    style={{ fontSize: '18px', color: '#D9A34A' }}
                  >
                    {p.price}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#F3F5F8] mb-2" style={{ fontSize: '15px' }}>{p.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={13} className="text-[#8B93A1]" strokeWidth={1.5} />
                    <span style={{ fontSize: '13px', color: '#8B93A1' }}>{p.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="uppercase font-semibold"
                      style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#707887' }}
                    >
                      Площадь: {p.area}
                    </span>
                    <button
                      className="text-[11px] font-semibold text-[#D9A34A] uppercase transition-colors duration-200 hover:text-[#E9B65C]"
                      style={{ letterSpacing: '0.08em' }}
                    >
                      ПОДРОБНЕЕ →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Условия покупки */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="w-full mb-10" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            УСЛОВИЯ ПОКУПКИ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {terms.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[16px] p-6"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                  style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
                </div>
                <h3 className="font-bold text-[#F3F5F8] mb-3" style={{ fontSize: '15px' }}>{title}</h3>
                {/* TODO: заменить на реальный текст заказчика */}
                <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

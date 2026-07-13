import { MapPin, TrendingUp, Key, Home, Mountain, Star } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';
import CardImage from '../components/CardImage';
import { PROPERTIES, PURCHASE_TERMS } from '../content/site-content';

const propertyIcons = { Home, Mountain, Star };
const termIcons = [TrendingUp, Key, MapPin];

export default function RealEstate() {
  return (
    <>
      <PageSeo
        title="Продажа недвижимости A-Frame — SHAG Engineering"
        description="Каталог готовых и строящихся домов A-Frame премиум класса. Ипотека, рассрочка, выбор локации. Консультация бесплатно."
        canonical="https://shagenrealestate.com/real-estate"
      />
      <InnerPageHero
        label="НЕДВИЖИМОСТЬ"
        title={'ГОТОВЫЕ ОБЪЕКТЫ\nA-FRAME'}
        subtitle="Премиальные дома для жизни, аренды и инвестиций. Выберите объект из каталога или закажите индивидуальный проект."
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            КАТАЛОГ ОБЪЕКТОВ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROPERTIES.map((p) => {
              const Icon = propertyIcons[p.icon];
              return (
                <div
                  key={p.title}
                  className="rounded-[16px] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                  style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <CardImage
                    icon={Icon}
                    height="220px"
                    overlay
                    overlayContent={
                      <span className="font-bold" style={{ fontSize: '18px', color: '#D9A34A' }}>{p.price}</span>
                    }
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-[#F3F5F8] mb-2" style={{ fontSize: '15px' }}>{p.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={13} className="text-[#8B93A1]" strokeWidth={1.5} />
                      <span style={{ fontSize: '13px', color: '#8B93A1' }}>{p.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="uppercase font-semibold" style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#707887' }}>
                        Площадь: {p.area}
                      </span>
                      <button
                        className="text-[11px] font-semibold text-[#D9A34A] uppercase transition-colors duration-200 hover:text-[#E9B65C]"
                        style={{ letterSpacing: '0.08em', minHeight: '44px' }}
                      >
                        ПОДРОБНЕЕ →
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
            УСЛОВИЯ ПОКУПКИ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PURCHASE_TERMS.map(({ title, text }, i) => {
              const Icon = termIcons[i];
              return (
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
                  <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

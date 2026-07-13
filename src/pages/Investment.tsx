import { TrendingUp, BarChart3, Percent, DollarSign, Clock, Layers, Users, BarChart2 } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';
import { INVESTMENT_PROGRAMS, INVESTMENT_STATS } from '../content/site-content';

const programIcons = [TrendingUp, BarChart3, Percent];
const statIcons = [Clock, Layers, Users, BarChart2];

export default function Investment() {
  return (
    <>
      <PageSeo
        title="Инвестиции в недвижимость A-Frame — SHAG Engineering"
        description="Инвестируйте в премиальную недвижимость A-Frame: арендный бизнес, перепродажа, совместное строительство. Прозрачные договоры и реальные кейсы. Консультация бесплатно."
        canonical="https://shagenrealestate.com/investment"
      />
      <InnerPageHero
        label="ИНВЕСТИЦИИ"
        title={'ИНВЕСТИЦИИ\nВ НЕДВИЖИМОСТЬ'}
        subtitle="Вложите средства в сегмент премиальных загородных домов. Прозрачные договоры и реальные кейсы."
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ИНВЕСТИЦИОННЫЕ ПРОГРАММЫ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INVESTMENT_PROGRAMS.map(({ title, yieldLabel, text, featured }, i) => {
              const Icon = programIcons[i];
              return (
                <div
                  key={title}
                  className="rounded-[16px] p-6 relative"
                  style={{
                    background: '#10151C',
                    border: featured ? '1px solid rgba(217,163,74,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {featured && (
                    <span
                      className="absolute top-4 right-4 uppercase font-semibold px-2.5 py-1 rounded-md"
                      style={{ fontSize: '10px', letterSpacing: '0.1em', background: 'rgba(217,163,74,0.12)', color: '#D9A34A' }}
                    >
                      ПОПУЛЯРНОЕ
                    </span>
                  )}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                    style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
                  >
                    <Icon size={22} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
                  </div>
                  <h3 className="font-bold text-[#F3F5F8] mb-1" style={{ fontSize: '16px' }}>{title}</h3>
                  <span className="font-bold block mb-4" style={{ fontSize: '13px', color: '#D9A34A' }}>
                    {yieldLabel}
                  </span>
                  <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
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
            ПОЧЕМУ ВЫГОДНО
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {INVESTMENT_STATS.map(({ value, label }, i) => {
              const Icon = statIcons[i];
              return (
                <div
                  key={label}
                  className="rounded-[14px] p-5 text-center"
                  style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex justify-center mb-3">
                    <Icon size={20} strokeWidth={1.5} style={{ color: 'rgba(217,163,74,0.5)' }} />
                  </div>
                  <span className="font-extrabold block mb-2" style={{ fontSize: '22px', color: '#D9A34A' }}>
                    {value}
                  </span>
                  <span style={{ fontSize: '12px', color: '#8B93A1', lineHeight: '1.5' }}>{label}</span>
                </div>
              );
            })}
          </div>

          <div
            className="mt-8 rounded-[14px] p-6 flex items-start gap-4"
            style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <DollarSign size={24} strokeWidth={1.5} style={{ color: '#D9A34A', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 className="font-bold text-[#F3F5F8] mb-2" style={{ fontSize: '15px' }}>Юридическая защита инвестора</h3>
              <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>
                Все инвестиционные соглашения оформляются через нотариально заверенный договор участия. Имущество инвестора защищено залогом объекта недвижимости на весь срок строительства.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

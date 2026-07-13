import { TrendingUp, BarChart3, Percent, DollarSign } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';

// TODO: заменить на реальный текст заказчика
const programs = [
  {
    icon: TrendingUp,
    title: 'Арендный бизнес',
    yield: 'до 18% годовых',
    text: 'Передайте готовый дом в управляющую компанию SHAG. Мы занимаемся сдачей в краткосрочную аренду, вы получаете стабильный доход.',
    tag: 'ПОПУЛЯРНОЕ',
  },
  {
    icon: BarChart3,
    title: 'Перепродажа',
    yield: 'до 25% за цикл',
    text: 'Инвестируйте на этапе строительства, продайте готовый объект по рыночной цене. Среднее время реализации — 12–18 месяцев.',
    tag: null,
  },
  {
    icon: Percent,
    title: 'Совместное строительство',
    yield: 'от 15% годовых',
    text: 'Участвуйте в финансировании строительства посёлка A-Frame. Доходность привязана к продажам. Минимальный вход — 1 500 000 ₽.',
    tag: null,
  },
];

// TODO: заменить на реальный текст заказчика
const stats = [
  { value: '14.2%', label: 'Средняя доходность портфеля за 2023 год' },
  { value: '500+', label: 'Реализованных объектов в работе' },
  { value: '3 года', label: 'Средний срок окупаемости инвестиций' },
  { value: '98%', label: 'Клиентов возвращаются для повторных инвестиций' },
];

export default function Investment() {
  return (
    <>
      <PageSeo
        title="Инвестиции в недвижимость A-Frame — SHAG Engineering"
        description="Инвестируйте в премиальную недвижимость A-Frame. Доходность до 25% годовых: арендный бизнес, перепродажа, совместное строительство. Минимальный вход от 1,5 млн ₽."
        canonical="https://shagenrealestate.com/investment"
      />
      <InnerPageHero
        label="ИНВЕСТИЦИИ"
        title={'ИНВЕСТИЦИИ\nВ НЕДВИЖИМОСТЬ'}
        subtitle="Вложите средства в сегмент премиальных загородных домов с доходностью до 25% годовых. Прозрачные договоры и реальные кейсы."
      />

      {/* Программы */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ИНВЕСТИЦИОННЫЕ ПРОГРАММЫ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map(({ icon: Icon, title, yield: yld, text, tag }) => (
              <div
                key={title}
                className="rounded-[16px] p-6 relative"
                style={{
                  background: '#10151C',
                  border: tag ? '1px solid rgba(217,163,74,0.35)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {tag && (
                  <span
                    className="absolute top-4 right-4 uppercase font-semibold px-2.5 py-1 rounded-md"
                    style={{ fontSize: '10px', letterSpacing: '0.1em', background: 'rgba(217,163,74,0.12)', color: '#D9A34A' }}
                  >
                    {tag}
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                  style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
                </div>
                <h3 className="font-bold text-[#F3F5F8] mb-1" style={{ fontSize: '16px' }}>{title}</h3>
                <span
                  className="font-bold block mb-4"
                  style={{ fontSize: '13px', color: '#D9A34A' }}
                >
                  {yld}
                </span>
                {/* TODO: заменить на реальный текст заказчика */}
                <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="w-full mb-10" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ПОЧЕМУ ВЫГОДНО
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-[14px] p-6 text-center"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="font-extrabold block mb-2" style={{ fontSize: '28px', color: '#D9A34A' }}>
                  {value}
                </span>
                {/* TODO: заменить на реальный текст заказчика */}
                <span style={{ fontSize: '12px', color: '#8B93A1', lineHeight: '1.5' }}>{label}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-8 rounded-[14px] p-6 flex items-start gap-4"
            style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <DollarSign size={24} strokeWidth={1.5} style={{ color: '#D9A34A', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 className="font-bold text-[#F3F5F8] mb-2" style={{ fontSize: '15px' }}>Юридическая защита инвестора</h3>
              {/* TODO: заменить на реальный текст заказчика */}
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

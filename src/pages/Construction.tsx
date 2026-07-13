import { ClipboardCheck, Wrench, Home, ShieldCheck } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';

const stages = [
  { num: '01', icon: ClipboardCheck, title: 'Проектирование', text: 'Разработка архитектурного и конструктивного проекта, согласование с заказчиком, получение необходимых разрешений. Сроки обсуждаются индивидуально.' },
  { num: '02', icon: Wrench, title: 'Фундамент и каркас', text: 'Заливка фундамента, сборка несущего каркаса из клееного бруса, монтаж кровельной системы. Сроки зависят от проекта и условий площадки.' },
  { num: '03', icon: Home, title: 'Утепление и отделка', text: 'Монтаж утеплителя, внешняя и внутренняя отделка, установка окон и дверей, инженерные системы. Объём работ определяется комплектацией.' },
  { num: '04', icon: ShieldCheck, title: 'Сдача объекта', text: 'Финальная проверка всех систем, устранение замечаний, оформление документов, ввод в эксплуатацию.' },
];

const materials = [
  { title: 'Клееный брус', desc: 'Несущие конструкции из клееного бруса камерной сушки. Геометрическая стабильность, высокая прочность, долговечность.' },
  { title: 'Минеральная вата', desc: 'Утепление стен, кровли и пола базальтовой ватой. Паронепроницаемая мембрана с внешней стороны.' },
  { title: 'Фасадные системы', desc: 'Лиственница термообработанная, планкен, фасадные панели HPL. Долговечные покрытия с гарантией производителя.' },
  { title: 'Окна и витражи', desc: 'Многокамерные стеклопакеты с энергосберегающим напылением. Подбираем под климатическую зону и архитектуру проекта.' },
];

export default function Construction() {
  return (
    <>
      <PageSeo
        title="Строительство домов A-Frame под ключ — SHAG Engineering"
        description="Строим каркасные дома A-Frame под ключ: фундамент, каркас, отделка, инженерные системы. Полный цикл работ с единой ответственностью и фиксированной ценой в договоре."
        canonical="https://shagenrealestate.com/construction"
      />
      <InnerPageHero
        label="СТРОИТЕЛЬСТВО"
        title={'СТРОИТЕЛЬСТВО\nПОД КЛЮЧ'}
        subtitle="От разработки проекта до сдачи объекта. Полный цикл работ с единой ответственностью и фиксированной ценой в договоре."
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-12" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ЭТАПЫ СТРОИТЕЛЬСТВА
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map(({ num, icon: Icon, title, text }) => (
              <div
                key={num}
                className="rounded-[16px] p-6"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span
                  className="font-extrabold block mb-4"
                  style={{ fontSize: '36px', color: 'rgba(217,163,74,0.12)', lineHeight: 1 }}
                >
                  {num}
                </span>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
                </div>
                <h3 className="font-bold text-[#F3F5F8] mb-3" style={{ fontSize: '15px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="w-full mb-10" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-10" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            МАТЕРИАЛЫ И ТЕХНОЛОГИИ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {materials.map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-[14px] p-5 flex gap-4"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-1 rounded-full flex-shrink-0" style={{ background: '#D9A34A' }} />
                <div>
                  <h3 className="font-bold text-[#F3F5F8] mb-2" style={{ fontSize: '14px' }}>{title}</h3>
                  <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{desc}</p>
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

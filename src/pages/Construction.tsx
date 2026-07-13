import { ClipboardCheck, Wrench, Home, ShieldCheck } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import PageCta from '../components/PageCta';

// TODO: заменить на реальный текст заказчика
const stages = [
  { num: '01', icon: ClipboardCheck, title: 'Проектирование', text: 'Разработка архитектурного и конструктивного проекта, согласование с заказчиком, получение разрешений. Срок: 2–4 недели.' },
  { num: '02', icon: Wrench, title: 'Фундамент и каркас', text: 'Заливка фундамента, сборка несущего каркаса из клееного бруса, монтаж кровельной системы. Срок: 3–6 недель.' },
  { num: '03', icon: Home, title: 'Утепление и отделка', text: 'Монтаж утеплителя, внешняя и внутренняя отделка, установка окон и дверей, инженерные системы. Срок: 4–8 недель.' },
  { num: '04', icon: ShieldCheck, title: 'Сдача объекта', text: 'Финальная проверка, устранение замечаний, оформление документов, ввод в эксплуатацию. Срок: 1–2 недели.' },
];

// TODO: заменить на реальный текст заказчика
const materials = [
  { title: 'Клееный брус', desc: 'Несущие конструкции из клееного бруса камерной сушки. Геометрическая стабильность, высокая прочность, долговечность.' },
  { title: 'Минеральная вата', desc: 'Утепление стен, кровли и пола базальтовой ватой λ=0.036. Паронепроницаемая мембрана с внешней стороны.' },
  { title: 'Фасадные системы', desc: 'Лиственница термообработанная, планкен, фасадные панели HPL. Гарантия покрытия — 15 лет.' },
  { title: 'Окна и витражи', desc: 'Трёхкамерные стеклопакеты немецкого производства. Энергосберегающее напыление, коэффициент теплопроводности 0.9.' },
];

export default function Construction() {
  return (
    <>
      <PageSeo
        title="Строительство домов A-Frame под ключ — SHAG Engineering"
        description="Строим каркасные дома A-Frame под ключ: фундамент, каркас, отделка, инженерные системы. Срок строительства от 3 месяцев. Гарантия до 10 лет на конструктив."
        canonical="https://shagenrealestate.com/construction"
      />
      <InnerPageHero
        label="СТРОИТЕЛЬСТВО"
        title={'СТРОИТЕЛЬСТВО\nПОД КЛЮЧ'}
        subtitle="От разработки проекта до сдачи объекта. Полный цикл работ с единой ответственностью и фиксированной ценой в договоре."
      />

      {/* Этапы */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-12" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ЭТАПЫ СТРОИТЕЛЬСТВА
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map(({ num, icon: Icon, title, text }) => (
              <div
                key={num}
                className="rounded-[16px] p-6 relative"
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
                {/* TODO: заменить на реальный текст заказчика */}
                <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.7' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Материалы */}
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
                  {/* TODO: заменить на реальный текст заказчика */}
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

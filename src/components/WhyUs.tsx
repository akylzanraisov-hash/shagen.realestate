import { Clock, Blocks, BadgeCheck, ClipboardCheck, LifeBuoy } from 'lucide-react';

const stats = [
  { icon: Clock, value: '10+', label: 'ЛЕТ ОПЫТА' },
  { icon: Blocks, value: '500+', label: 'РЕАЛИЗОВАННЫХ\nПРОЕКТОВ' },
  { icon: BadgeCheck, value: 'ГАРАНТИЯ', label: 'ДО 10 ЛЕТ' },
  { icon: ClipboardCheck, value: 'ПОД КЛЮЧ', label: 'ОТ ПРОЕКТА ДО СДАЧИ' },
  { icon: LifeBuoy, value: 'ПОДДЕРЖКА', label: 'НА ВСЕХ ЭТАПАХ' },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="w-full mb-8" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <h2
          className="text-center uppercase font-bold text-[#F3F5F8] mb-10"
          style={{ fontSize: '18px', letterSpacing: '0.1em' }}
        >
          ПОЧЕМУ ВЫБИРАЮТ НАС
        </h2>

        <div className="whyus-grid">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
              >
                <Icon size={26} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="font-bold leading-tight"
                  style={{ fontSize: '20px', color: '#F3F5F8' }}
                >
                  {value}
                </span>
                <span
                  className="uppercase font-semibold whitespace-pre-line leading-tight"
                  style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#8B93A1' }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Box, Layers, ShieldCheck, Leaf } from 'lucide-react';

const advantages = [
  { icon: Box, label: 'ИННОВАЦИОННЫЕ\nТЕХНОЛОГИИ' },
  { icon: Layers, label: 'ПРЕМИАЛЬНЫЕ\nМАТЕРИАЛЫ' },
  { icon: ShieldCheck, label: 'НАДЕЖНОСТЬ\nИ КАЧЕСТВО' },
  { icon: Leaf, label: 'ЭКОЛОГИЧНОСТЬ\nИ УСТОЙЧИВОСТЬ' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.jpg"
          alt="A-Frame дом ночью"
          className="w-full h-full object-cover"
          style={{ objectPosition: '42% 35%' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, #0A0D12 0%, rgba(10,13,18,0.92) 45%, rgba(10,13,18,0.15) 70%, transparent 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0A0D12 0%, rgba(10,13,18,0.7) 12%, transparent 35%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,13,18,0.6) 0%, transparent 18%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center pt-28 pb-10">
        <div className="max-w-[1280px] mx-auto px-6 w-full">
          <div className="max-w-[680px]">
            <h1
              className="font-extrabold uppercase leading-[1.12] mb-6"
              style={{ fontSize: 'clamp(32px, 4.2vw, 52px)' }}
            >
              <span className="text-white block whitespace-nowrap">СТРОИТЕЛЬСТВО</span>
              <span className="text-white block whitespace-nowrap">КАРКАСНЫХ ДОМОВ</span>
              <span className="text-white block whitespace-nowrap">ПРЕМИУМ КЛАССА</span>
              <span style={{ color: '#D9A34A' }} className="block whitespace-nowrap">A-FRAME</span>
            </h1>

            <div className="flex items-stretch gap-4 mb-8">
              <div className="w-[3px] rounded-full flex-shrink-0" style={{ background: '#D9A34A' }} />
              <p className="text-[16px]" style={{ color: '#C7CBD3' }}>
                Проектируем. Строим. Создаем будущее.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="text-[11px] font-semibold uppercase px-7 py-3.5 rounded-lg transition-all duration-200 hover:brightness-110 sm:w-auto w-full"
                style={{
                  background: 'linear-gradient(180deg, #E7B257, #C68F3F)',
                  color: '#171006',
                  letterSpacing: '0.08em',
                }}
              >
                СПРОЕКТИРОВАТЬ ДОМ
              </button>
              <button
                className="text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] px-7 py-3.5 rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)] sm:w-auto w-full"
                style={{ letterSpacing: '0.08em' }}
              >
                СМОТРЕТЬ ПРОЕКТЫ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom advantages bar */}
      <div className="relative z-10">
        <div className="max-w-[1280px] mx-auto px-6 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {advantages.map((adv, i) => {
              const Icon = adv.icon;
              const borderClass =
                i === 0
                  ? ''
                  : i % 2 !== 0
                  ? 'border-l border-white/[0.08]'
                  : 'md:border-l border-white/[0.08]';
              return (
                <div
                  key={i}
                  className={`flex flex-col items-start gap-3 px-4 md:px-6 py-4 ${borderClass}`}
                >
                  <Icon size={28} className="text-[#D9A34A]" strokeWidth={1.5} />
                  <span
                    className="font-semibold leading-tight whitespace-pre-line"
                    style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#C7CBD3' }}
                  >
                    {adv.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

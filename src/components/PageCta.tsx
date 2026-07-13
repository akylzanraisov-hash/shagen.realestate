export default function PageCta() {
  return (
    <section className="py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="rounded-[20px] px-8 py-16 text-center"
          style={{
            background: 'linear-gradient(135deg, #10151C, #0E1420)',
            border: '1px solid rgba(217,163,74,0.18)',
          }}
        >
          <span
            className="uppercase font-semibold block mb-4"
            style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#D9A34A' }}
          >
            НАЧНИТЕ СЕГОДНЯ
          </span>
          <h2
            className="font-extrabold uppercase leading-tight mb-5"
            style={{ fontSize: 'clamp(22px, 3vw, 38px)', color: '#F3F5F8' }}
          >
            РАССЧИТАЙТЕ СТОИМОСТЬ
            <br />
            ВАШЕГО ПРОЕКТА
          </h2>
          <p className="mb-10 max-w-[480px] mx-auto" style={{ color: '#8B93A1', fontSize: '15px', lineHeight: '1.6' }}>
            Получите точный расчёт за 24 часа. Бесплатная консультация эксперта по вашему проекту.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="text-[11px] font-semibold uppercase px-8 rounded-lg transition-all duration-200 hover:brightness-110"
              style={{
                background: 'linear-gradient(180deg, #E7B257, #C68F3F)',
                color: '#171006',
                letterSpacing: '0.08em',
                minHeight: '48px',
              }}
            >
              РАССЧИТАТЬ ПРОЕКТ
            </button>
            <button
              className="text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] px-8 rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)]"
              style={{ letterSpacing: '0.08em', minHeight: '48px' }}
            >
              СВЯЗАТЬСЯ С НАМИ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

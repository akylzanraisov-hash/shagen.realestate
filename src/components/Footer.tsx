import { Instagram, Send, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="pt-12 pb-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-4 gap-10 mb-10">
          {/* Col 1 - Logo + description */}
          <div>
            <div className="flex flex-col items-start mb-4">
              <svg width="36" height="30" viewBox="0 0 36 30" fill="none">
                <rect x="0" y="14" width="8" height="16" fill="#D9A34A" />
                <rect x="10" y="7" width="8" height="23" fill="#D9A34A" />
                <rect x="20" y="0" width="8" height="30" fill="#D9A34A" />
                <rect x="30" y="10" width="6" height="20" fill="#D9A34A" />
              </svg>
              <span
                className="text-white font-bold mt-1 leading-none"
                style={{ letterSpacing: '0.35em', fontSize: '14px' }}
              >
                SHAG
              </span>
              <span
                className="text-[#D9A34A] mt-0.5 leading-none"
                style={{ fontSize: '9px', letterSpacing: '0.12em' }}
              >
                — ENGINEERING —
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#8B93A1', lineHeight: '1.6' }}>
              Строим каркасные дома премиум класса A-Frame по инновационным технологиям.
            </p>
          </div>

          {/* Col 2 - Menu */}
          <div>
            <span
              className="uppercase font-semibold text-[#707887] block mb-4"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              МЕНЮ
            </span>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Главная', gold: false },
                { label: 'Проекты', gold: false },
                { label: 'Конструкции', gold: false },
                { label: '3D-Конструктор', gold: true },
                { label: 'О компании', gold: false },
                { label: 'Контакты', gold: false },
              ].map(({ label, gold }) => (
                <a
                  key={label}
                  href="#"
                  className="transition-colors duration-200 hover:text-white"
                  style={{
                    fontSize: '13px',
                    color: gold ? '#D9A34A' : '#8B93A1',
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3 - Projects */}
          <div>
            <span
              className="uppercase font-semibold text-[#707887] block mb-4"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              ПРОЕКТЫ
            </span>
            <div className="flex flex-col gap-2.5">
              {['A-Frame 6x8', 'A-Frame 6x10', 'A-Frame 8x12', 'A-Frame Max'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="transition-colors duration-200 hover:text-white"
                  style={{ fontSize: '13px', color: '#8B93A1' }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Col 4 - Contacts */}
          <div>
            <span
              className="uppercase font-semibold text-[#707887] block mb-4"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              КОНТАКТЫ
            </span>
            <div className="flex flex-col gap-2.5 mb-5">
              <a
                href="tel:+79991234567"
                className="transition-colors duration-200 hover:text-white"
                style={{ fontSize: '13px', color: '#8B93A1' }}
              >
                +7 (999) 123-45-67
              </a>
              <a
                href="mailto:info@shag-engineering.ru"
                className="transition-colors duration-200 hover:text-white"
                style={{ fontSize: '13px', color: '#8B93A1' }}
              >
                info@shag-engineering.ru
              </a>
              <span style={{ fontSize: '13px', color: '#8B93A1' }}>
                г. Москва, ул. Примерная, 1
              </span>
            </div>
            <div className="flex gap-2">
              {[Instagram, Send, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:border-[#D9A34A] hover:text-[#D9A34A]"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#8B93A1',
                  }}
                >
                  <Icon size={15} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div
          className="w-full mb-4"
          style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
        />
        <p className="text-center" style={{ fontSize: '12px', color: '#8B93A1' }}>
          © 2024 SHAG Engineering. Все права защищены.
        </p>
      </div>
    </footer>
  );
}

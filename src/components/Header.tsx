import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'ГЛАВНАЯ' },
  { label: 'ПРОЕКТЫ' },
  { label: 'КОНСТРУКЦИИ' },
  { label: '3D-КОНСТРУКТОР', active: true },
  { label: 'О КОМПАНИИ' },
  { label: 'КОНТАКТЫ' },
];

function Logo() {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <svg width="36" height="30" viewBox="0 0 36 30" fill="none">
        <rect x="0" y="14" width="8" height="16" fill="#D9A34A" />
        <rect x="10" y="7" width="8" height="23" fill="#D9A34A" />
        <rect x="20" y="0" width="8" height="30" fill="#D9A34A" />
        <rect x="30" y="10" width="6" height="20" fill="#D9A34A" />
      </svg>
      <span className="text-white font-bold mt-1 leading-none" style={{ letterSpacing: '0.35em', fontSize: '14px' }}>
        SHAG
      </span>
      <span className="text-[#D9A34A] mt-0.5 leading-none" style={{ fontSize: '9px', letterSpacing: '0.12em' }}>
        — ENGINEERING —
      </span>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 py-5 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`text-[12px] font-medium transition-colors duration-200 relative pb-1 ${
                item.active ? 'text-[#D9A34A]' : 'text-[#C7CBD3] hover:text-white'
              }`}
              style={{ letterSpacing: '0.1em' }}
            >
              {item.label}
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D9A34A]" />
              )}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          className="hidden lg:block text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] px-7 py-3.5 rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)]"
          style={{ letterSpacing: '0.08em' }}
        >
          РАССЧИТАТЬ ПРОЕКТ
        </button>

        {/* Burger button (mobile/tablet) */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 text-[#C7CBD3] hover:text-white transition-colors duration-200"
          onClick={() => setMenuOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <div
        className="fixed inset-0 z-[100] lg:hidden transition-opacity duration-300"
        style={{
          pointerEvents: menuOpen ? 'auto' : 'none',
          opacity: menuOpen ? 1 : 0,
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className="absolute top-0 right-0 h-full w-[300px] flex flex-col transition-transform duration-300"
          style={{
            background: '#0E1218',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          {/* Close */}
          <div className="flex items-center justify-between px-6 py-5">
            <Logo />
            <button
              onClick={() => setMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center text-[#8B93A1] hover:text-white transition-colors duration-200 rounded-xl"
              aria-label="Закрыть меню"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <div className="w-full px-6" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {/* Links */}
          <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-3.5 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
                  item.active
                    ? 'text-[#D9A34A] bg-[rgba(217,163,74,0.06)]'
                    : 'text-[#C7CBD3] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                }`}
                style={{ letterSpacing: '0.1em' }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="px-4" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))' }}>
            <button
              className="w-full py-4 text-[11px] font-semibold uppercase rounded-xl transition-all duration-200 hover:brightness-110"
              style={{
                background: 'linear-gradient(180deg, #E7B257, #C68F3F)',
                color: '#171006',
                letterSpacing: '0.08em',
              }}
              onClick={() => setMenuOpen(false)}
            >
              РАССЧИТАТЬ ПРОЕКТ
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

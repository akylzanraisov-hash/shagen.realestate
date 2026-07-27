import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  isAnchor?: boolean;
}

const navItems: NavItem[] = [
  { label: 'ГЛАВНАЯ', to: '/' },
  { label: 'НЕДВИЖИМОСТЬ', to: '/real-estate' },
  { label: 'СТРОИТЕЛЬСТВО', to: '/construction' },
  { label: 'ИНВЕСТИЦИИ', to: '/investment' },
  { label: 'ДОМА A-FRAME', to: '/a-frame-houses' },
  { label: '3D-КОНСТРУКТОР', to: '/#configurator', isAnchor: true },
  { label: 'КОНТАКТЫ', to: '/contacts' },
  { label: 'БЛОГ', to: '/blog' },
];

function Logo() {
  return (
    <NavLink to="/" className="flex-shrink-0" aria-label="Luxury Villas — главная">
      <img
        src="/Screenshot_2026-07-27_at_8.30.57_PM.png"
        alt="Luxury Villas — Exclusive Real Estate"
        style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
      />
    </NavLink>
  );
}

function AnchorNavItem({ label }: { label: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <a
      href="/#configurator"
      onClick={handleClick}
      className="text-[11px] font-medium transition-colors duration-200 relative pb-1 text-[#C7CBD3] hover:text-white whitespace-nowrap"
      style={{ letterSpacing: '0.1em' }}
    >
      {label}
    </a>
  );
}

function AnchorDrawerItem({ label, onClose }: { label: string; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (location.pathname === '/') {
      setTimeout(() => {
        document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <a
      href="/#configurator"
      onClick={handleClick}
      className="px-3 py-3.5 rounded-xl text-[13px] font-semibold transition-colors duration-200 text-[#C7CBD3] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
      style={{ letterSpacing: '0.1em' }}
    >
      {label}
    </a>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-4">
          {navItems.map((item) =>
            item.isAnchor ? (
              <AnchorNavItem key={item.label} label={item.label} />
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-[11px] font-medium transition-colors duration-200 relative pb-1 whitespace-nowrap ${
                    isActive ? 'text-[#D9A34A]' : 'text-[#C7CBD3] hover:text-white'
                  }`
                }
                style={{ letterSpacing: '0.1em' }}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D9A34A]" />}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop CTA */}
        <button
          className="hidden lg:block text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] px-5 py-3 rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)] whitespace-nowrap flex-shrink-0"
          style={{ letterSpacing: '0.08em' }}
        >
          РАССЧИТАТЬ ПРОЕКТ
        </button>

        {/* Burger button */}
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
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMenuOpen(false)}
        />

        <div
          className="absolute top-0 right-0 h-full w-[300px] flex flex-col transition-transform duration-300"
          style={{
            background: '#0E1218',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
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

          <nav className="flex flex-col gap-1 px-4 py-6 flex-1 overflow-y-auto">
            {navItems.map((item) =>
              item.isAnchor ? (
                <AnchorDrawerItem key={item.label} label={item.label} onClose={() => setMenuOpen(false)} />
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-3.5 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-[#D9A34A] bg-[rgba(217,163,74,0.06)]'
                        : 'text-[#C7CBD3] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                    }`
                  }
                  style={{ letterSpacing: '0.1em' }}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

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

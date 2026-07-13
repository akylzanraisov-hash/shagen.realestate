import { Instagram, Send, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACTS } from '../content/site-content';

const menuLinks = [
  { label: 'Главная', to: '/' },
  { label: 'Недвижимость', to: '/real-estate' },
  { label: 'Строительство', to: '/construction' },
  { label: 'Инвестиции', to: '/investment' },
  { label: 'Дома A-Frame', to: '/a-frame-houses' },
  { label: 'Контакты', to: '/contacts' },
  { label: 'Блог', to: '/blog' },
];

const projectLinks = ['A-Frame 6×8', 'A-Frame 6×10', 'A-Frame 8×12', 'A-Frame Max'];

const emailList = [
  { role: 'Общие вопросы', email: 'info@shagenrealestate.com' },
  { role: 'Продажи', email: 'sales@shagenrealestate.com' },
  { role: 'Поддержка', email: 'support@shagenrealestate.com' },
  { role: 'Инвесторам', email: 'invest@shagenrealestate.com' },
  { role: 'Директор', email: 'ceo@shagenrealestate.com' },
];

const socialIcons = [
  { Icon: Instagram, label: 'Instagram', href: CONTACTS.instagram },
  { Icon: Send, label: 'Telegram', href: CONTACTS.telegram },
  { Icon: Youtube, label: 'YouTube', href: CONTACTS.youtube },
];

export default function Footer() {
  return (
    <footer
      id="contacts"
      className="pt-12 pb-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="footer-grid mb-10">
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
              {menuLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="transition-colors duration-200 hover:text-white"
                  style={{ fontSize: '13px', color: '#8B93A1' }}
                >
                  {label}
                </Link>
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
              {projectLinks.map((item) => (
                <Link
                  key={item}
                  to="/a-frame-houses"
                  className="transition-colors duration-200 hover:text-white"
                  style={{ fontSize: '13px', color: '#8B93A1' }}
                >
                  {item}
                </Link>
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
                href={CONTACTS.phoneHref}
                className="transition-colors duration-200 hover:text-white"
                style={{ fontSize: '13px', color: '#8B93A1' }}
              >
                {CONTACTS.phone}
              </a>

              <div className="flex flex-col gap-3">
                {emailList.map(({ role, email }) => (
                  <div key={email} className="flex flex-col">
                    <span
                      className="uppercase"
                      style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#707887' }}
                    >
                      {role}
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="transition-colors duration-200 hover:text-[#D9A34A]"
                      style={{ fontSize: '13px', color: '#C7CBD3', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                    >
                      {email}
                    </a>
                  </div>
                ))}
              </div>

              <span style={{ fontSize: '13px', color: '#8B93A1' }}>
                {CONTACTS.address}
              </span>
            </div>
            <div className="flex gap-2">
              {socialIcons.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 hover:border-[#D9A34A] hover:text-[#D9A34A]"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#8B93A1',
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="w-full mb-4"
          style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
        />
        <p className="text-center" style={{ fontSize: '12px', color: '#8B93A1' }}>
          © 2025 SHAG Engineering. Все права защищены.
        </p>
      </div>
    </footer>
  );
}

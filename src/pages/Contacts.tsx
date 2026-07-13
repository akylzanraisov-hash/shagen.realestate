import { Phone, MapPin, Instagram, Send, Youtube } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';

const emails = [
  { role: 'Общие вопросы', email: 'info@shagenrealestate.com' },
  { role: 'Продажи', email: 'sales@shagenrealestate.com' },
  { role: 'Поддержка', email: 'support@shagenrealestate.com' },
  { role: 'Инвесторам', email: 'invest@shagenrealestate.com' },
  { role: 'Директор', email: 'ceo@shagenrealestate.com' },
];

const socials = [
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Send, label: 'Telegram', href: '#' },
  { Icon: Youtube, label: 'YouTube', href: '#' },
];

export default function Contacts() {
  return (
    <>
      <PageSeo
        title="Контакты — SHAG Engineering"
        description="Свяжитесь с командой SHAG Engineering: по вопросам продаж, строительства, инвестиций и поддержки. Телефон, почта, адрес офиса. Ответим в течение 24 часов."
        canonical="https://shagenrealestate.com/contacts"
      />
      <InnerPageHero
        label="КОНТАКТЫ"
        title={'МЫ РЯДОМ,\nЧТОБЫ ПОМОЧЬ'}
        subtitle="Обратитесь к нужному специалисту напрямую. Отвечаем в течение одного рабочего дня."
      />

      <section id="contacts-section" className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">

          {/* Email cards */}
          <h2 className="uppercase font-bold text-[#F3F5F8] mb-8" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ОТДЕЛЫ И ПОЧТА
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {emails.map(({ role, email }) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="rounded-[14px] p-6 flex flex-col gap-2 transition-all duration-200 hover:border-[rgba(217,163,74,0.4)] group"
                style={{
                  background: '#10151C',
                  border: '1px solid rgba(255,255,255,0.07)',
                  minHeight: '100px',
                  textDecoration: 'none',
                }}
              >
                <span
                  className="uppercase"
                  style={{ fontSize: '11px', letterSpacing: '0.14em', color: '#707887' }}
                >
                  {role}
                </span>
                <span
                  className="font-semibold transition-colors duration-200 group-hover:text-[#D9A34A] break-all"
                  style={{ fontSize: '14px', color: '#C7CBD3' }}
                >
                  {email}
                </span>
              </a>
            ))}
          </div>

          {/* Phone + Address + Socials */}
          <div className="w-full mb-10" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="rounded-[14px] p-6 flex gap-4"
              style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
              >
                <Phone size={18} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
              </div>
              <div>
                <span
                  className="uppercase font-semibold block mb-2"
                  style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#707887' }}
                >
                  ТЕЛЕФОН
                </span>
                <a
                  href="tel:+79991234567"
                  className="font-semibold transition-colors duration-200 hover:text-[#D9A34A]"
                  style={{ fontSize: '15px', color: '#F3F5F8' }}
                >
                  +7 (999) 123-45-67
                </a>
              </div>
            </div>

            <div
              className="rounded-[14px] p-6 flex gap-4"
              style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1.5px solid rgba(217,163,74,0.45)' }}
              >
                <MapPin size={18} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
              </div>
              <div>
                <span
                  className="uppercase font-semibold block mb-2"
                  style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#707887' }}
                >
                  АДРЕС
                </span>
                {/* TODO: заменить на реальный адрес заказчика */}
                <span className="font-semibold" style={{ fontSize: '15px', color: '#F3F5F8' }}>
                  г. Москва, ул. Примерная, 1
                </span>
              </div>
            </div>

            <div
              className="rounded-[14px] p-6"
              style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span
                className="uppercase font-semibold block mb-4"
                style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#707887' }}
              >
                СОЦИАЛЬНЫЕ СЕТИ
              </span>
              <div className="flex gap-3">
                {socials.map(({ Icon, label, href }) => (
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
                    <Icon size={17} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div
            className="mt-10 rounded-[16px] overflow-hidden flex items-center justify-center"
            style={{
              height: '300px',
              background: '#10151C',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* TODO: встроить реальную карту (Яндекс.Карты или Google Maps) */}
            <div className="text-center">
              <MapPin size={36} strokeWidth={1} style={{ color: 'rgba(217,163,74,0.4)', margin: '0 auto 12px' }} />
              <span style={{ fontSize: '13px', color: '#707887', letterSpacing: '0.06em' }}>
                КАРТА БУДЕТ ЗДЕСЬ
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

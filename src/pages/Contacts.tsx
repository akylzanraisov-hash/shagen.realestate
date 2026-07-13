import { Phone, MapPin, Instagram, Send, Youtube } from 'lucide-react';
import PageSeo from '../components/PageSeo';
import InnerPageHero from '../components/InnerPageHero';
import { CONTACTS } from '../content/site-content';

const emailList = [
  { role: 'Общие вопросы', email: 'info@shagenrealestate.com' },
  { role: 'Продажи', email: 'sales@shagenrealestate.com' },
  { role: 'Поддержка', email: 'support@shagenrealestate.com' },
  { role: 'Инвесторам', email: 'invest@shagenrealestate.com' },
  { role: 'Директор', email: 'ceo@shagenrealestate.com' },
];

const socialIcons = [
  { Icon: Instagram, label: 'Instagram', hrefKey: 'instagram' as const },
  { Icon: Send, label: 'Telegram', hrefKey: 'telegram' as const },
  { Icon: Youtube, label: 'YouTube', hrefKey: 'youtube' as const },
];

export default function Contacts() {
  return (
    <>
      <PageSeo
        title="Контакты — SHAG Engineering"
        description="Свяжитесь с командой SHAG Engineering: по вопросам продаж, строительства, инвестиций и поддержки. Телефон, почта, адрес офиса. Ответим в течение одного рабочего дня."
        canonical="https://shagenrealestate.com/contacts"
      />
      <InnerPageHero
        label="КОНТАКТЫ"
        title={'МЫ РЯДОМ,\nЧТОБЫ ПОМОЧЬ'}
        subtitle="Обратитесь к нужному специалисту напрямую. Отвечаем в течение одного рабочего дня."
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">

          <h2 className="uppercase font-bold text-[#F3F5F8] mb-8" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>
            ОТДЕЛЫ И ПОЧТА
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {emailList.map(({ role, email }) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="rounded-[14px] p-6 flex flex-col gap-3 transition-all duration-200 group"
                style={{
                  background: '#10151C',
                  border: '1px solid rgba(255,255,255,0.07)',
                  minHeight: '100px',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(217,163,74,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
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

          <div className="w-full mb-10" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone */}
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
                  href={CONTACTS.phoneHref}
                  className="font-semibold transition-colors duration-200 hover:text-[#D9A34A]"
                  style={{ fontSize: '15px', color: '#F3F5F8', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  {CONTACTS.phone}
                </a>
              </div>
            </div>

            {/* Address */}
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
                <span className="font-semibold" style={{ fontSize: '15px', color: '#F3F5F8' }}>
                  {CONTACTS.address}
                </span>
              </div>
            </div>

            {/* Socials */}
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
                {socialIcons.map(({ Icon, label, hrefKey }) => (
                  <a
                    key={label}
                    href={CONTACTS[hrefKey]}
                    aria-label={label}
                    className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 hover:text-[#D9A34A]"
                    style={{
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#8B93A1',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#D9A34A'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
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
            style={{ height: '280px', background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* TODO: встроить реальную карту (Яндекс.Карты или Google Maps) */}
            <div className="text-center">
              <MapPin size={36} strokeWidth={1} style={{ color: 'rgba(217,163,74,0.35)', margin: '0 auto 12px' }} />
              <span style={{ fontSize: '12px', color: '#707887', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                КАРТА — СКОРО
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

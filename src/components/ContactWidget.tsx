import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Phone, Send } from 'lucide-react';
import { CONTACTS, QUICK_CONTACT } from '../content/site-content';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="white" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ITEMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    bg: '#25D366',
    border: 'transparent',
    iconColor: 'white',
    icon: <WhatsAppIcon />,
    href: `https://wa.me/${QUICK_CONTACT.whatsappNumber}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    bg: '#229ED9',
    border: 'transparent',
    iconColor: 'white',
    icon: <Send size={22} color="white" aria-hidden="true" />,
    href: `https://t.me/${QUICK_CONTACT.telegramUsername}`,
  },
  {
    id: 'phone',
    label: 'Позвонить',
    bg: '#10151C',
    border: '#D9A34A',
    iconColor: '#D9A34A',
    icon: <Phone size={22} color="#D9A34A" aria-hidden="true" />,
    href: CONTACTS.phoneHref,
  },
] as const;

export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes cw-pulse {
          0%   { box-shadow: 0 6px 20px rgba(0,0,0,.45), 0 0 0 0 rgba(217,163,74,.5); }
          70%  { box-shadow: 0 6px 20px rgba(0,0,0,.45), 0 0 0 14px rgba(217,163,74,0); }
          100% { box-shadow: 0 6px 20px rgba(0,0,0,.45), 0 0 0 0 rgba(217,163,74,0); }
        }
        @keyframes cw-item-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cw-main {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(180deg, #E7B257, #C68F3F);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; outline: none;
          transition: transform 180ms ease;
          animation: cw-pulse 2.2s infinite;
          flex-shrink: 0;
        }
        .cw-main.cw-open {
          animation: none;
          box-shadow: 0 6px 20px rgba(0,0,0,.45);
        }
        .cw-main:hover { transform: scale(1.06); }
        .cw-item-btn {
          width: 56px; height: 56px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          border: 2px solid transparent;
          transition: transform 180ms ease, opacity 180ms ease;
          animation: cw-item-in 200ms ease both;
          cursor: pointer;
        }
        .cw-item-btn:hover { transform: scale(1.08); }
        .cw-tooltip {
          position: absolute;
          right: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #10151C;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 12px;
          color: #F3F5F8;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .cw-item-wrap:hover .cw-tooltip { opacity: 1; }
        @media (max-width: 767px) {
          .cw-tooltip { display: none; }
          .cw-main { width: 60px; height: 60px; }
          .cw-item-btn { width: 60px; height: 60px; }
        }
      `}</style>

      <div
        ref={ref}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
        className="cw-root"
      >
        <style>{`
          @media (max-width: 767px) {
            .cw-root {
              right: 16px !important;
              bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
            }
          }
        `}</style>

        {/* Action buttons — render above main button */}
        {ITEMS.map((item, i) => (
          <div
            key={item.id}
            className="cw-item-wrap"
            style={{
              position: 'relative',
              display: open ? 'flex' : 'none',
              alignItems: 'center',
              order: ITEMS.length - i,
            }}
          >
            <span className="cw-tooltip">{item.label}</span>
            <a
              href={item.href}
              target={item.id !== 'phone' ? '_blank' : undefined}
              rel={item.id !== 'phone' ? 'noopener noreferrer' : undefined}
              aria-label={item.label}
              className="cw-item-btn"
              style={{
                background: item.bg,
                borderColor: item.border,
                animationDelay: `${i * 60}ms`,
              }}
            >
              {item.icon}
            </a>
          </div>
        ))}

        {/* Main toggle button */}
        <button
          className={`cw-main${open ? ' cw-open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Закрыть меню связи' : 'Открыть меню связи'}
          style={{ order: ITEMS.length + 1 }}
        >
          {open
            ? <X size={26} color="white" aria-hidden="true" />
            : <MessageCircle size={26} color="white" aria-hidden="true" />
          }
        </button>
      </div>
    </>
  );
}

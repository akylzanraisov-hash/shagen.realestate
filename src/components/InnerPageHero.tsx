interface InnerPageHeroProps {
  label: string;
  title: string;
  subtitle: string;
}

export default function InnerPageHero({ label, title, subtitle }: InnerPageHeroProps) {
  return (
    <section
      className="relative pt-36 pb-20 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A0D12 0%, #0E1420 60%, #0A0D12 100%)',
      }}
    >
      {/* decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(217,163,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217,163,74,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* glow */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(217,163,74,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6">
        <span
          className="uppercase font-semibold block mb-4"
          style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#D9A34A' }}
        >
          {label}
        </span>
        <h1
          className="font-extrabold uppercase leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: '#F3F5F8' }}
        >
          {title}
        </h1>
        <div className="flex items-stretch gap-4 max-w-[600px]">
          <div className="w-[3px] rounded-full flex-shrink-0" style={{ background: '#D9A34A' }} />
          <p style={{ fontSize: '16px', color: '#C7CBD3', lineHeight: '1.6' }}>{subtitle}</p>
        </div>
      </div>
    </section>
  );
}

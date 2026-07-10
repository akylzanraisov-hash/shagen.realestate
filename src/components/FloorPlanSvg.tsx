interface Props {
  floor: 1 | 2;
}

// Shared style constants
const WALL = '#2A2118';
const WALL_W = 5;
const TEXT_FILL = '#1A1208';
const LABEL_SIZE = 9;
const AREA_SIZE = 8;

function RoomLabel({ x, y, name, area }: { x: number; y: number; name: string; area: string }) {
  return (
    <>
      <text x={x} y={y} textAnchor="middle" fontSize={LABEL_SIZE} fontWeight="600" fill={TEXT_FILL} fontFamily="Montserrat,sans-serif">
        {name}
      </text>
      <text x={x} y={y + 12} textAnchor="middle" fontSize={AREA_SIZE} fontWeight="400" fill="#6B4A2C" fontFamily="Montserrat,sans-serif">
        {area}
      </text>
    </>
  );
}

function Floor1() {
  // SVG viewport 220×280 — house footprint with terrace below
  // Layout (all coords in SVG units):
  //   Kitchen top-right  ~45% width, top 30%
  //   Living room left ~55% width, middle rows
  //   Bathroom bottom-right small
  //   Terrace: bottom strip, full width, hatch lines

  return (
    <svg viewBox="0 0 220 290" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="220" height="290" fill="#C9A876" />

      {/* ── Main house outline 20,10 → 200,220 ── */}
      {/* Living room fill */}
      <rect x="20" y="10" width="108" height="210" fill="#D4B485" />
      {/* Kitchen fill */}
      <rect x="128" y="10" width="72" height="110" fill="#CDAB78" />
      {/* Bathroom fill */}
      <rect x="128" y="120" width="72" height="100" fill="#C5A268" />

      {/* Terrace strip */}
      <rect x="20" y="225" width="180" height="55" fill="#B8904E" />
      {/* Terrace plank lines */}
      {[235, 243, 251, 259, 267].map((y) => (
        <line key={y} x1="20" y1={y} x2="200" y2={y} stroke="#A07A3A" strokeWidth="1" />
      ))}
      {/* Terrace vertical dividers */}
      {[56, 92, 128, 164].map((x) => (
        <line key={x} x1={x} y1="225" x2={x} y2="280" stroke="#A07A3A" strokeWidth="0.5" opacity="0.5" />
      ))}

      {/* ── Walls ── */}
      {/* Outer walls */}
      <rect x="20" y="10" width="180" height="210" fill="none" stroke={WALL} strokeWidth={WALL_W} strokeLinejoin="round" />
      {/* Interior divider: kitchen / living */}
      <line x1="128" y1="10" x2="128" y2="220" stroke={WALL} strokeWidth={WALL_W} />
      {/* Interior divider: kitchen / bathroom horizontal */}
      <line x1="128" y1="120" x2="200" y2="120" stroke={WALL} strokeWidth={WALL_W} />

      {/* Terrace border */}
      <rect x="20" y="225" width="180" height="55" fill="none" stroke={WALL} strokeWidth={WALL_W} strokeLinejoin="round" />

      {/* ── Doors (simple arcs) ── */}
      {/* Living → Kitchen door */}
      <path d="M128,60 A18,18 0 0 0 146,78" fill="none" stroke={WALL} strokeWidth="1.5" />
      <line x1="128" y1="60" x2="128" y2="78" stroke={WALL} strokeWidth="1.5" />
      {/* Living → Bathroom door */}
      <path d="M128,150 A16,16 0 0 1 144,166" fill="none" stroke={WALL} strokeWidth="1.5" />
      <line x1="128" y1="150" x2="144" y2="150" stroke={WALL} strokeWidth="1.5" />
      {/* Living → Terrace door */}
      <path d="M90,220 A18,18 0 0 0 108,202" fill="none" stroke={WALL} strokeWidth="1.5" />
      <line x1="90" y1="220" x2="108" y2="220" stroke={WALL} strokeWidth="1.5" />

      {/* ── Windows ── */}
      {/* Kitchen top window */}
      <rect x="148" y="10" width="30" height="5" fill="#98C8D8" stroke={WALL} strokeWidth="1" />
      {/* Living left window */}
      <rect x="20" y="60" width="5" height="40" fill="#98C8D8" stroke={WALL} strokeWidth="1" />
      {/* Living left window 2 */}
      <rect x="20" y="130" width="5" height="40" fill="#98C8D8" stroke={WALL} strokeWidth="1" />
      {/* Bathroom right window */}
      <rect x="195" y="145" width="5" height="28" fill="#98C8D8" stroke={WALL} strokeWidth="1" />

      {/* ── Furniture silhouettes ── */}
      {/* Kitchen: counter L-shape */}
      <rect x="136" y="16" width="56" height="14" rx="2" fill="#2A2118" opacity="0.55" />
      <rect x="136" y="16" width="14" height="50" rx="2" fill="#2A2118" opacity="0.55" />
      {/* Kitchen: table */}
      <rect x="150" y="60" width="30" height="20" rx="3" fill="#2A2118" opacity="0.4" />
      <circle cx="155" cy="55" r="4" fill="#2A2118" opacity="0.35" />
      <circle cx="175" cy="55" r="4" fill="#2A2118" opacity="0.35" />
      <circle cx="155" cy="85" r="4" fill="#2A2118" opacity="0.35" />
      <circle cx="175" cy="85" r="4" fill="#2A2118" opacity="0.35" />

      {/* Living: sofa + armchair */}
      <rect x="28" y="18" width="55" height="22" rx="4" fill="#2A2118" opacity="0.45" />
      <rect x="28" y="18" width="8" height="22" rx="2" fill="#2A2118" opacity="0.6" />
      <rect x="75" y="18" width="8" height="22" rx="2" fill="#2A2118" opacity="0.6" />
      {/* Armchair */}
      <rect x="92" y="18" width="22" height="18" rx="4" fill="#2A2118" opacity="0.4" />
      {/* Coffee table */}
      <rect x="40" y="52" width="40" height="22" rx="3" fill="#2A2118" opacity="0.3" />
      {/* TV stand */}
      <rect x="26" y="178" width="92" height="8" rx="2" fill="#2A2118" opacity="0.5" />

      {/* Bathroom: toilet + sink + shower */}
      <rect x="134" y="127" width="18" height="22" rx="5" fill="#2A2118" opacity="0.45" />
      <ellipse cx="163" cy="135" rx="8" ry="6" fill="#2A2118" opacity="0.4" />
      <rect x="176" y="127" width="18" height="18" rx="2" fill="#2A2118" opacity="0.4" />

      {/* Terrace: outdoor furniture */}
      <rect x="60" y="233" width="36" height="20" rx="3" fill="#2A2118" opacity="0.3" />
      <rect x="104" y="237" width="16" height="12" rx="2" fill="#2A2118" opacity="0.3" />
      <rect x="128" y="233" width="28" height="20" rx="3" fill="#2A2118" opacity="0.3" />

      {/* ── Labels ── */}
      <RoomLabel x="74" y="115" name="Гостиная" area="24.5 м²" />
      <RoomLabel x="164" y="60" name="Кухня" area="10.2 м²" />
      <RoomLabel x="164" y="168" name="Санузел" area="4.1 м²" />
      <RoomLabel x="110" y="255" name="Терраса" area="18.0 м²" />

      {/* Compass */}
      <g transform="translate(196,16)">
        <circle cx="0" cy="0" r="8" fill="rgba(42,33,24,0.12)" />
        <text x="0" y="4" textAnchor="middle" fontSize="8" fontWeight="700" fill={WALL} fontFamily="sans-serif">N</text>
      </g>
    </svg>
  );
}

function Floor2() {
  // SVG viewport 220×260 — smaller footprint (A-Frame narrows at top)
  // Bedroom: large left cell
  // Wardrobe: small top-right
  // Study: bottom-right

  return (
    <svg viewBox="0 0 220 270" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="220" height="270" fill="#C9A876" />

      {/* Floor area — slightly narrower to suggest A-frame pitch */}
      {/* Bedroom fill */}
      <rect x="20" y="20" width="110" height="230" fill="#D4B485" />
      {/* Wardrobe fill */}
      <rect x="130" y="20" width="70" height="90" fill="#CDAB78" />
      {/* Study fill */}
      <rect x="130" y="110" width="70" height="140" fill="#C5A268" />

      {/* ── Walls ── */}
      {/* Outer walls */}
      <rect x="20" y="20" width="180" height="230" fill="none" stroke={WALL} strokeWidth={WALL_W} strokeLinejoin="round" />
      {/* Bedroom / right divider */}
      <line x1="130" y1="20" x2="130" y2="250" stroke={WALL} strokeWidth={WALL_W} />
      {/* Wardrobe / study divider */}
      <line x1="130" y1="110" x2="200" y2="110" stroke={WALL} strokeWidth={WALL_W} />

      {/* ── Doors ── */}
      {/* Bedroom → Wardrobe */}
      <path d="M130,65 A18,18 0 0 0 148,83" fill="none" stroke={WALL} strokeWidth="1.5" />
      <line x1="130" y1="65" x2="130" y2="83" stroke={WALL} strokeWidth="1.5" />
      {/* Bedroom → Study */}
      <path d="M130,160 A16,16 0 0 1 146,176" fill="none" stroke={WALL} strokeWidth="1.5" />
      <line x1="130" y1="160" x2="146" y2="160" stroke={WALL} strokeWidth="1.5" />
      {/* Stairwell opening at bottom of bedroom */}
      <rect x="44" y="244" width="40" height="6" fill="#A07A3A" stroke={WALL} strokeWidth="1" />
      {[48, 54, 60, 66, 72, 78].map((x) => (
        <line key={x} x1={x} y1="244" x2={x} y2="250" stroke={WALL} strokeWidth="0.8" opacity="0.6" />
      ))}

      {/* ── Windows ── */}
      {/* Bedroom left window */}
      <rect x="20" y="80" width="5" height="50" fill="#98C8D8" stroke={WALL} strokeWidth="1" />
      {/* Bedroom top window */}
      <rect x="55" y="20" width="40" height="5" fill="#98C8D8" stroke={WALL} strokeWidth="1" />
      {/* Study right window */}
      <rect x="195" y="145" width="5" height="40" fill="#98C8D8" stroke={WALL} strokeWidth="1" />
      {/* Study bottom window */}
      <rect x="145" y="245" width="36" height="5" fill="#98C8D8" stroke={WALL} strokeWidth="1" />

      {/* ── Furniture ── */}
      {/* Bed */}
      <rect x="30" y="28" width="60" height="90" rx="4" fill="#2A2118" opacity="0.4" />
      {/* Pillows */}
      <rect x="34" y="31" width="22" height="14" rx="3" fill="#2A2118" opacity="0.55" />
      <rect x="60" y="31" width="22" height="14" rx="3" fill="#2A2118" opacity="0.55" />
      {/* Bedside tables */}
      <rect x="100" y="35" width="16" height="16" rx="2" fill="#2A2118" opacity="0.35" />
      <rect x="24" y="35" width="16" height="16" rx="2" fill="#2A2118" opacity="0.35" />
      {/* Wardrobe shelves */}
      <rect x="136" y="26" width="56" height="16" rx="2" fill="#2A2118" opacity="0.5" />
      <rect x="136" y="46" width="56" height="10" rx="1" fill="#2A2118" opacity="0.35" />
      <rect x="136" y="60" width="56" height="10" rx="1" fill="#2A2118" opacity="0.35" />
      {/* Wardrobe hanging rail */}
      <line x1="138" y1="80" x2="188" y2="80" stroke={WALL} strokeWidth="1.5" opacity="0.5" />
      {[142, 150, 158, 166, 174, 182].map((x) => (
        <line key={x} x1={x} y1="76" x2={x} y2="86" stroke={WALL} strokeWidth="1" opacity="0.4" />
      ))}
      {/* Study: desk */}
      <rect x="136" y="116" width="56" height="20" rx="3" fill="#2A2118" opacity="0.5" />
      {/* Chair */}
      <rect x="150" y="142" width="22" height="18" rx="4" fill="#2A2118" opacity="0.35" />
      {/* Bookshelf */}
      <rect x="136" y="200" width="22" height="44" rx="2" fill="#2A2118" opacity="0.45" />
      {[207, 214, 221, 228, 235].map((y) => (
        <line key={y} x1="137" y1={y} x2="157" y2={y} stroke="#C9A876" strokeWidth="1" />
      ))}

      {/* ── Labels ── */}
      <RoomLabel x="75" y="155" name="Спальня" area="16.3 м²" />
      <RoomLabel x="165" y="68" name="Гардероб" area="4.0 м²" />
      <RoomLabel x="165" y="185" name="Кабинет" area="9.6 м²" />

      {/* Compass */}
      <g transform="translate(196,28)">
        <circle cx="0" cy="0" r="8" fill="rgba(42,33,24,0.12)" />
        <text x="0" y="4" textAnchor="middle" fontSize="8" fontWeight="700" fill={WALL} fontFamily="sans-serif">N</text>
      </g>
    </svg>
  );
}

export default function FloorPlanSvg({ floor }: Props) {
  return floor === 1 ? <Floor1 /> : <Floor2 />;
}

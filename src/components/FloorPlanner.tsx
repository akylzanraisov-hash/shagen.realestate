import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  BedDouble,
  Bath,
  Shirt,
  Monitor,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Sofa,
  Armchair,
  Refrigerator,
  ShowerHead,
  Droplets,
  Waves,
  Sprout,
  Lamp,
  Lightbulb,
  Fan,
  type LucideIcon,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

interface Room {
  id: number;
  icon: LucideIcon;
  name: string;
  area: string;
}

interface DroppedObject {
  id: number;
  Icon: LucideIcon;
  x: number; // percent of plan container
  y: number;
}

// ─── static data ──────────────────────────────────────────────────────────────

const INITIAL_ROOMS: Room[] = [
  { id: 1, icon: BedDouble, name: 'Спальня', area: '12.5 м²' },
  { id: 2, icon: Bath, name: 'Санузел', area: '4.2 м²' },
  { id: 3, icon: Shirt, name: 'Гардероб', area: '3.8 м²' },
  { id: 4, icon: Monitor, name: 'Кабинет', area: '9.6 м²' },
];

const objectGroups: { label: string; icons: LucideIcon[] }[] = [
  { label: 'МЕБЕЛЬ', icons: [Sofa, Armchair, BedDouble, Refrigerator] },
  { label: 'САНТЕХНИКА', icons: [Bath, ShowerHead, Droplets, Waves] },
  { label: 'ДЕКОР', icons: [Sprout, Lamp, Lightbulb, Fan] },
];

const floor1Rooms = [
  { name: 'Кухня', area: '10.2 м²', top: '18%', left: '62%' },
  { name: 'Гостиная', area: '24.5 м²', top: '42%', left: '38%' },
  { name: 'Санузел', area: '4.1 м²', top: '68%', left: '62%' },
  { name: 'Терраса', area: '18.0 м²', top: '84%', left: '38%' },
];

const floor2Rooms = [
  { name: 'Спальня', area: '16.3 м²', top: '22%', left: '30%' },
  { name: 'Гардероб', area: '4.0 м²', top: '22%', left: '68%' },
  { name: 'Кабинет', area: '9.6 м²', top: '62%', left: '50%' },
];

// ─── Add-room modal ───────────────────────────────────────────────────────────

function AddRoomModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string, area: string) => void;
}) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    const areaTrimmed = area.trim();
    if (!trimmed) return;
    onSave(trimmed, areaTrimmed ? `${areaTrimmed} м²` : '');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(10,13,18,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-[16px] p-6 w-[340px] flex flex-col gap-5"
        style={{
          background: '#10151C',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="uppercase font-bold text-[#F3F5F8]"
            style={{ fontSize: '13px', letterSpacing: '0.12em' }}
          >
            ДОБАВИТЬ КОМНАТУ
          </span>
          <button onClick={onClose} className="text-[#707887] hover:text-[#F3F5F8] transition-colors duration-200">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label
              className="uppercase text-[#707887] font-semibold block mb-1.5"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              Название
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Спальня"
              className="w-full px-3 py-2.5 rounded-[10px] text-sm text-[#F3F5F8] outline-none transition-all duration-200 placeholder-[#707887]"
              style={{
                background: '#151B24',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D9A34A')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              autoFocus
            />
          </div>
          <div>
            <label
              className="uppercase text-[#707887] font-semibold block mb-1.5"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              Площадь, м²
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="0.0"
              min={0}
              step={0.1}
              className="w-full px-3 py-2.5 rounded-[10px] text-sm text-[#F3F5F8] outline-none transition-all duration-200 placeholder-[#707887]"
              style={{
                background: '#151B24',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D9A34A')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[11px] font-semibold text-[#8B93A1] border rounded-lg uppercase transition-all duration-200 hover:text-[#F3F5F8]"
            style={{ letterSpacing: '0.08em', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            ОТМЕНА
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 text-[11px] font-semibold rounded-lg uppercase transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #E7B257, #C68F3F)',
              color: '#171006',
              letterSpacing: '0.08em',
            }}
          >
            СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── floor plan drop zone ─────────────────────────────────────────────────────

function FloorPlan({
  label,
  imageSrc,
  rooms,
  active,
  onClick,
  objects,
  onDrop,
  onMoveObject,
  onRemoveObject,
  isDragActive,
}: {
  label: string;
  imageSrc: string;
  rooms: { name: string; area: string; top: string; left: string }[];
  active: boolean;
  onClick: () => void;
  objects: DroppedObject[];
  onDrop: (icon: LucideIcon, x: number, y: number) => void;
  onMoveObject: (id: number, x: number, y: number) => void;
  onRemoveObject: (id: number) => void;
  isDragActive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingObjectId = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const getRelativePos = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const iconName = e.dataTransfer.getData('iconName');
    if (!iconName || !containerRef.current) return;
    // find icon from all groups
    let foundIcon: LucideIcon | null = null;
    for (const group of objectGroups) {
      const icon = group.icons.find((ic) => ic.displayName === iconName || ic.name === iconName);
      if (icon) { foundIcon = icon; break; }
    }
    if (!foundIcon) return;
    const { x, y } = getRelativePos(e.clientX, e.clientY);
    onDrop(foundIcon, x, y);
  };

  // pointer-based move for placed objects
  const handleObjectPointerDown = (e: React.PointerEvent, id: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    draggingObjectId.current = id;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleObjectPointerMove = (e: React.PointerEvent, id: number) => {
    if (draggingObjectId.current !== id || !containerRef.current) return;
    const { x, y } = getRelativePos(
      e.clientX - dragOffsetRef.current.x,
      e.clientY - dragOffsetRef.current.y,
    );
    onMoveObject(id, x, y);
  };

  const handleObjectPointerUp = () => {
    draggingObjectId.current = null;
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-2">
      <span
        className="uppercase text-[#707887] font-semibold"
        style={{ fontSize: '11px', letterSpacing: '0.12em' }}
      >
        {label}
      </span>
      <div
        ref={containerRef}
        onClick={onClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
        style={{
          background: '#10151C',
          border: active
            ? '2px solid #D9A34A'
            : isDragActive
            ? '2px solid rgba(217,163,74,0.4)'
            : '1px solid rgba(255,255,255,0.07)',
          aspectRatio: '0.85',
        }}
      >
        <img
          src={imageSrc}
          alt={`${label} планировка`}
          className="w-full h-full object-cover"
          draggable={false}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />

        {/* dropped objects */}
        {objects.map(({ id, Icon, x, y }) => (
          <div
            key={id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none"
            style={{ left: `${x}%`, top: `${y}%`, zIndex: 10 }}
            onPointerDown={(e) => handleObjectPointerDown(e, id)}
            onPointerMove={(e) => handleObjectPointerMove(e, id)}
            onPointerUp={handleObjectPointerUp}
            onDoubleClick={(e) => { e.stopPropagation(); onRemoveObject(id); }}
            title="Двойной клик — удалить"
          >
            <div
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity duration-200 hover:opacity-80"
              style={{
                background: 'rgba(14,18,24,0.85)',
                border: '1px solid rgba(217,163,74,0.5)',
              }}
            >
              <Icon size={14} strokeWidth={1.5} style={{ color: '#D9A34A' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

let nextId = 100;

export default function FloorPlanner() {
  const [selectedFloor, setSelectedFloor] = useState<1 | 2>(2);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // objects per floor: floor 1 → index 0, floor 2 → index 1
  const [floorObjects, setFloorObjects] = useState<[DroppedObject[], DroppedObject[]]>([[], []]);

  const handleAddRoom = (name: string, area: string) => {
    setRooms((prev) => [
      ...prev,
      { id: nextId++, icon: BedDouble, name, area },
    ]);
  };

  const handleDrop = useCallback((floorIdx: 0 | 1, Icon: LucideIcon, x: number, y: number) => {
    const obj: DroppedObject = { id: nextId++, Icon, x, y };
    setFloorObjects((prev) => {
      const next: [DroppedObject[], DroppedObject[]] = [prev[0].slice(), prev[1].slice()];
      next[floorIdx] = [...next[floorIdx], obj];
      return next;
    });
  }, []);

  const handleMoveObject = useCallback((floorIdx: 0 | 1, id: number, x: number, y: number) => {
    setFloorObjects((prev) => {
      const next: [DroppedObject[], DroppedObject[]] = [prev[0].slice(), prev[1].slice()];
      next[floorIdx] = next[floorIdx].map((o) => (o.id === id ? { ...o, x, y } : o));
      return next;
    });
  }, []);

  const handleRemoveObject = useCallback((floorIdx: 0 | 1, id: number) => {
    setFloorObjects((prev) => {
      const next: [DroppedObject[], DroppedObject[]] = [prev[0].slice(), prev[1].slice()];
      next[floorIdx] = next[floorIdx].filter((o) => o.id !== id);
      return next;
    });
  }, []);

  // global drag tracking for hint highlight
  useEffect(() => {
    const onDragStart = () => setIsDragActive(true);
    const onDragEnd = () => setIsDragActive(false);
    window.addEventListener('dragstart', onDragStart);
    window.addEventListener('dragend', onDragEnd);
    window.addEventListener('drop', onDragEnd);
    return () => {
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('dragend', onDragEnd);
      window.removeEventListener('drop', onDragEnd);
    };
  }, []);

  return (
    <>
      <section className="py-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className="rounded-[20px] p-6"
            style={{
              background: '#0E1218',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="fp-grid">
              {/* LEFT CARD */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-4"
                style={{
                  background: '#10151C',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span
                  className="uppercase font-bold text-[#F3F5F8]"
                  style={{ fontSize: '12px', letterSpacing: '0.12em' }}
                >
                  ПЛАНИРОВКА ИНТЕРЬЕРА
                </span>

                {/* Floor selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="uppercase text-[#707887] font-semibold"
                      style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                    >
                      ВЫБЕРИТЕ ЭТАЖ
                    </span>
                    <X
                      size={12}
                      className="text-[#707887] cursor-pointer hover:text-[#F3F5F8] transition-colors duration-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    {([1, 2] as const).map((floor) => (
                      <button
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-[10px] cursor-pointer transition-all duration-200"
                        style={{
                          background: '#151B24',
                          border: selectedFloor === floor ? '1px solid #D9A34A' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{ color: selectedFloor === floor ? '#D9A34A' : '#8B93A1' }}
                        >
                          {floor} этаж
                        </span>
                        <ChevronDown
                          size={12}
                          strokeWidth={2}
                          style={{ color: selectedFloor === floor ? '#D9A34A' : '#8B93A1' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms list */}
                <div>
                  <span
                    className="uppercase text-[#707887] font-semibold block mb-2"
                    style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                  >
                    КОМНАТЫ
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {rooms.map(({ id, icon: Icon, name, area }) => (
                      <div
                        key={id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200"
                        style={{
                          background: '#151B24',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = '#151B24';
                        }}
                      >
                        <Icon size={14} className="text-[#8B93A1] flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-[#F3F5F8] text-sm flex-1">{name}</span>
                        <span className="text-[#8B93A1] text-xs">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-3 text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)] mt-auto"
                  style={{ letterSpacing: '0.08em' }}
                >
                  ДОБАВИТЬ КОМНАТУ
                </button>
              </div>

              {/* CENTER — floor plans */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <FloorPlan
                  label="1 ЭТАЖ"
                  imageSrc="/images/plan-1.jpg"
                  rooms={floor1Rooms}
                  active={selectedFloor === 1}
                  onClick={() => setSelectedFloor(1)}
                  objects={floorObjects[0]}
                  onDrop={(icon, x, y) => handleDrop(0, icon, x, y)}
                  onMoveObject={(id, x, y) => handleMoveObject(0, id, x, y)}
                  onRemoveObject={(id) => handleRemoveObject(0, id)}
                  isDragActive={isDragActive}
                />

                {/* Arrow: right on desktop, down on mobile */}
                <div className="flex-shrink-0 flex items-center justify-center md:mt-20">
                  <ArrowRight size={20} className="text-[#D9A34A] hidden md:block" strokeWidth={2} />
                  <ArrowDown size={20} className="text-[#D9A34A] block md:hidden" strokeWidth={2} />
                </div>

                <FloorPlan
                  label="2 ЭТАЖ"
                  imageSrc="/images/plan-2.jpg"
                  rooms={floor2Rooms}
                  active={selectedFloor === 2}
                  onClick={() => setSelectedFloor(2)}
                  objects={floorObjects[1]}
                  onDrop={(icon, x, y) => handleDrop(1, icon, x, y)}
                  onMoveObject={(id, x, y) => handleMoveObject(1, id, x, y)}
                  onRemoveObject={(id) => handleRemoveObject(1, id)}
                  isDragActive={isDragActive}
                />
              </div>

              {/* RIGHT CARD */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-4"
                style={{
                  background: '#10151C',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span
                  className="uppercase font-bold text-[#F3F5F8]"
                  style={{ fontSize: '12px', letterSpacing: '0.12em' }}
                >
                  ДОБАВЬТЕ ОБЪЕКТЫ
                </span>

                {objectGroups.map(({ label, icons }) => (
                  <div key={label}>
                    <span
                      className="uppercase text-[#707887] font-semibold block mb-2"
                      style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                    >
                      {label}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {icons.map((Icon) => (
                        <div
                          key={Icon.displayName ?? Icon.name}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('iconName', Icon.displayName ?? Icon.name ?? '');
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          className="flex items-center justify-center rounded-[10px] cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-[rgba(217,163,74,0.5)] hover:bg-[rgba(217,163,74,0.06)]"
                          style={{
                            width: '56px',
                            height: '56px',
                            background: '#151B24',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <Icon size={20} strokeWidth={1.5} style={{ color: '#8B93A1' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <p
                  className="mt-auto transition-colors duration-200"
                  style={{
                    fontSize: '11px',
                    color: isDragActive ? '#D9A34A' : '#707887',
                    letterSpacing: '0.06em',
                  }}
                >
                  Перетаскивайте объекты на план
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showAddModal && (
        <AddRoomModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRoom}
        />
      )}
    </>
  );
}

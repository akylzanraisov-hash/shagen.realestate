import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  Rotate3d,
  RotateCcw,
  Share2,
  Undo2,
  Move,
  Maximize,
  Camera,
  Globe,
  Home,
  LayoutGrid,
  Sofa,
  Zap,
  Loader2,
  Check,
} from 'lucide-react';
import AFrameScene, { SceneParams } from './AFrameScene';

const tabs = ['КОНСТРУКТОР ДОМА', 'ПЛАНИРОВКА', 'ИНТЕРЬЕР', 'ЭКСТЕРЬЕР', 'РАСЧЕТ СТОИМОСТИ'];

const ROOF_COLORS = ['#23272E', '#3A3F47', '#6B7280', '#14171C'];
const FACADE_COLORS = ['#B98A4A', '#2E333B', '#4A505A', '#8A9099'];
const INTERIOR_COLORS = ['#C89A62', '#A87B4C', '#8A5F38', '#6B4A2C'];
const WINDOW_COLORS = ['#0F1216', '#2B3138', '#3E454E', '#5A626C'];

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="w-11 h-11 rounded-full cursor-pointer transition-all duration-200"
      style={{
        background: color,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: selected ? `0 0 0 2px #10151C, 0 0 0 4px #D9A34A` : 'none',
      }}
    />
  );
}

function SliderRow({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  const displayValue = step < 1 ? value.toFixed(1) : value.toString();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span
          className="uppercase font-semibold text-[#707887]"
          style={{ fontSize: '11px', letterSpacing: '0.12em' }}
        >
          {label}
        </span>
        <span className="text-[#F3F5F8] text-sm font-semibold">
          {displayValue}
          {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ '--range-progress': `${progress}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function Toast({ visible }: { visible: boolean }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300"
      style={{
        background: '#10151C',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        pointerEvents: 'none',
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(217,163,74,0.15)' }}
      >
        <Check size={13} strokeWidth={2.5} style={{ color: '#D9A34A' }} />
      </div>
      <span style={{ fontSize: '13px', color: '#F3F5F8', fontWeight: 500 }}>
        Параметры применены
      </span>
    </div>
  );
}

export default function Configurator() {
  const [activeTab, setActiveTab] = useState(0);

  // UI (pending) params — what the sliders show
  const [floors, setFloors] = useState<1 | 2>(1);
  const [height, setHeight] = useState(8.0);
  const [roofAngle, setRoofAngle] = useState(60);
  const [wallThickness, setWallThickness] = useState(200);
  const [roofSelected, setRoofSelected] = useState(0);
  const [facadeSelected, setFacadeSelected] = useState(0);
  const [interiorSelected, setInteriorSelected] = useState(0);
  const [windowSelected, setWindowSelected] = useState(0);

  // scene params — only update on ПРИМЕНИТЬ
  const [sceneParams, setSceneParams] = useState<SceneParams>({
    height: 8.0,
    roofAngle: 60,
    floors: 1,
    roofColorIdx: 0,
    facadeColorIdx: 0,
  });

  const [applying, setApplying] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // camera reset callback registered by AFrameScene
  const resetCameraRef = useRef<(() => void) | null>(null);
  const handleResetRegister = useCallback((fn: () => void) => {
    resetCameraRef.current = fn;
  }, []);

  const handleApply = () => {
    if (applying) return;
    setApplying(true);
    setTimeout(() => {
      setSceneParams({
        height,
        roofAngle,
        floors,
        roofColorIdx: roofSelected,
        facadeColorIdx: facadeSelected,
      });
      setApplying(false);
      setToastVisible(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
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
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <Zap size={16} className="text-[#D9A34A]" strokeWidth={1.5} />
              <h2
                className="text-[20px] font-bold uppercase text-[#F3F5F8]"
                style={{ letterSpacing: '0.06em' }}
              >
                3D-КОНСТРУКТОР ВАШЕГО ДОМА
              </h2>
            </div>

            {/* Tab bar */}
            <div
              className="flex items-center mb-5 rounded-xl overflow-x-auto scrollbar-hide"
              style={{ background: '#0B0F14', height: '52px', padding: '0 4px' }}
            >
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 h-full text-center uppercase font-semibold relative transition-colors duration-200 ${
                    i === activeTab ? 'text-[#D9A34A]' : 'text-[#8B93A1] hover:text-[#C7CBD3]'
                  }`}
                  style={{ fontSize: '11px', letterSpacing: '0.1em' }}
                >
                  {tab}
                  {i === activeTab && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#D9A34A]" />
                  )}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="cfg-grid">
              {/* LEFT CARD */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-4"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span
                  className="uppercase font-semibold text-[#F3F5F8]"
                  style={{ fontSize: '12px', letterSpacing: '0.12em' }}
                >
                  ПАРАМЕТРЫ ДОМА
                </span>

                <div>
                  <span
                    className="uppercase text-[#707887] font-semibold block mb-1.5"
                    style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                  >
                    ТИП ДОМА
                  </span>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-[10px] cursor-pointer"
                    style={{ background: '#151B24', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-[#F3F5F8] text-sm">A-Frame 8x12</span>
                    <ChevronDown size={14} className="text-[#8B93A1]" />
                  </div>
                </div>

                <div>
                  <span
                    className="uppercase text-[#707887] font-semibold block mb-1.5"
                    style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                  >
                    РАЗМЕР (М)
                  </span>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-[10px] cursor-pointer"
                    style={{ background: '#151B24', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-[#F3F5F8] text-sm">8x12</span>
                    <ChevronDown size={14} className="text-[#8B93A1]" />
                  </div>
                </div>

                <div>
                  <span
                    className="uppercase text-[#707887] font-semibold block mb-1.5"
                    style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                  >
                    ЭТАЖНОСТЬ
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFloors(1)}
                      className="flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all duration-200"
                      style={{
                        background: floors === 1 ? 'rgba(217,163,74,0.08)' : '#151B24',
                        border: floors === 1 ? '1px solid #D9A34A' : '1px solid rgba(255,255,255,0.08)',
                        color: floors === 1 ? '#D9A34A' : '#8B93A1',
                      }}
                    >
                      1 этаж
                    </button>
                    <button
                      onClick={() => setFloors(2)}
                      className="flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all duration-200"
                      style={{
                        background: floors === 2 ? 'rgba(217,163,74,0.08)' : '#151B24',
                        border: floors === 2 ? '1px solid #D9A34A' : '1px solid rgba(255,255,255,0.08)',
                        color: floors === 2 ? '#D9A34A' : '#8B93A1',
                      }}
                    >
                      2 этажа
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <SliderRow
                    label="ВЫСОТА (М)"
                    value={height}
                    min={4}
                    max={12}
                    step={0.5}
                    onChange={setHeight}
                  />
                  <SliderRow
                    label="УГОЛ КРЫШИ (°)"
                    value={roofAngle}
                    unit="°"
                    min={30}
                    max={75}
                    step={1}
                    onChange={setRoofAngle}
                  />
                  <SliderRow
                    label="ТОЛЩИНА СТЕН (ММ)"
                    value={wallThickness}
                    min={100}
                    max={400}
                    step={10}
                    onChange={setWallThickness}
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full py-3 text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)] mt-auto flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ letterSpacing: '0.08em' }}
                >
                  {applying && <Loader2 size={14} className="animate-spin" />}
                  ПРИМЕНИТЬ
                </button>
              </div>

              {/* CENTER — 3D Viewport */}
              <div className="flex flex-col gap-3">
                <div
                  className="relative rounded-[14px] overflow-hidden flex-1"
                  style={{ background: '#0B0F14', minHeight: 'clamp(300px, 50vw, 520px)' }}
                >
                  {/* Three.js canvas */}
                  <AFrameScene params={sceneParams} onResetRef={handleResetRegister} />

                  {/* Top-left toolbar */}
                  <div
                    className="absolute top-4 left-4 flex items-center gap-1 rounded-full px-2 py-1.5 pointer-events-auto"
                    style={{
                      background: 'rgba(14,18,24,0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {[Rotate3d, Share2, Undo2, Move].map((Icon, i) => (
                      <button
                        key={i}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#8B93A1] hover:text-[#D9A34A] transition-colors duration-200"
                      >
                        <Icon size={15} strokeWidth={1.5} />
                      </button>
                    ))}
                    <button
                      onClick={() => resetCameraRef.current?.()}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-[#8B93A1] hover:text-[#D9A34A] transition-colors duration-200"
                      title="Сбросить камеру"
                    >
                      <RotateCcw size={15} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Top-right controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8B93A1] hover:text-[#D9A34A] transition-colors duration-200"
                      style={{ background: 'rgba(14,18,24,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Maximize size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full text-[#8B93A1] hover:text-[#D9A34A] transition-colors duration-200"
                      style={{ background: 'rgba(14,18,24,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Camera size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full text-[#171006] transition-colors duration-200"
                      style={{ background: '#D9A34A' }}
                    >
                      <Globe size={15} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Bottom-left hint */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
                    <Move size={14} className="text-[#8B93A1]" strokeWidth={1.5} />
                    <span className="text-[12px]" style={{ color: '#8B93A1' }}>
                      Вращайте модель и изменяйте параметры
                    </span>
                  </div>
                </div>

                {/* View tabs */}
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ background: '#0B0F14', padding: '4px', height: '52px' }}
                >
                  <div
                    className="px-3 flex-shrink-0"
                    style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#707887' }}
                  >
                    ВИДЫ
                  </div>
                  {[
                    { label: 'Экстерьер', icon: Home },
                    { label: 'Планировка', icon: LayoutGrid },
                    { label: 'Интерьер', icon: Sofa },
                  ].map(({ label, icon: Icon }, idx) => (
                    <button
                      key={label}
                      className={`flex items-center gap-2 px-4 h-full rounded-lg text-sm font-medium transition-colors duration-200 ${
                        idx === 0 ? 'text-[#D9A34A]' : 'text-[#8B93A1] hover:text-[#C7CBD3]'
                      }`}
                      style={{
                        border: idx === 0 ? '1px solid #D9A34A' : '1px solid transparent',
                        margin: '0 2px',
                      }}
                    >
                      <Icon size={15} strokeWidth={1.5} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT CARD */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-4"
                style={{ background: '#10151C', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span
                  className="uppercase font-semibold text-[#F3F5F8]"
                  style={{ fontSize: '12px', letterSpacing: '0.12em' }}
                >
                  ВЫБОР ОТДЕЛКИ
                </span>

                {[
                  { label: 'ЦВЕТ КРОВЛИ', colors: ROOF_COLORS, selected: roofSelected, setSelected: setRoofSelected },
                  { label: 'ЦВЕТ ФАСАДА', colors: FACADE_COLORS, selected: facadeSelected, setSelected: setFacadeSelected },
                  { label: 'ОТДЕЛКА ВНУТРИ', colors: INTERIOR_COLORS, selected: interiorSelected, setSelected: setInteriorSelected },
                  { label: 'ЦВЕТ ОКОН', colors: WINDOW_COLORS, selected: windowSelected, setSelected: setWindowSelected },
                ].map(({ label, colors, selected, setSelected }) => (
                  <div key={label}>
                    <span
                      className="uppercase text-[#707887] font-semibold block mb-2"
                      style={{ fontSize: '11px', letterSpacing: '0.12em' }}
                    >
                      {label}
                    </span>
                    <div className="flex gap-2">
                      {colors.map((color, i) => (
                        <ColorSwatch
                          key={color}
                          color={color}
                          selected={i === selected}
                          onClick={() => setSelected(i)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-auto flex flex-col gap-3">
                  <button
                    className="w-full py-3 text-[11px] font-semibold text-[#D9A34A] border border-[#D9A34A] rounded-lg uppercase transition-all duration-200 hover:bg-[rgba(217,163,74,0.08)]"
                    style={{ letterSpacing: '0.08em' }}
                  >
                    СОХРАНИТЬ ПРОЕКТ
                  </button>
                  <button
                    className="text-center text-[#D9A34A] uppercase font-semibold transition-colors duration-200 hover:text-[#E9B65C]"
                    style={{ fontSize: '11px', letterSpacing: '0.1em' }}
                  >
                    ПОДЕЛИТЬСЯ ПРОЕКТОМ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Toast visible={toastVisible} />
    </>
  );
}

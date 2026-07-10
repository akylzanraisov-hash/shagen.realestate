import { useEffect, useRef, useCallback, useState } from 'react';

// Three.js r147 UMD global loaded via CDN script in index.html.
// The Bolt WebContainer dev-server cannot resolve the 'three' npm package
// through Vite's module graph at HMR time, so we read the global instead.
// OrbitControls is intentionally NOT loaded from CDN — we use a minimal
// spherical-coords controller implemented below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getT = (): any => (window as any).THREE;

const ROOF_COLORS   = ['#23272E', '#3A3F47', '#6B7280', '#14171C'];
const FACADE_COLORS = ['#B98A4A', '#2E333B', '#4A505A', '#8A9099'];

const W  = 6;
const D  = 8;
const HW = W / 2;
const HD = D / 2;

export interface SceneParams {
  height:         number;
  roofAngle:      number;
  floors:         1 | 2;
  roofColorIdx:   number;
  facadeColorIdx: number;
}

function peakY(angle: number) {
  return Math.tan((angle * Math.PI) / 180) * HW;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildRoofGeo(peak: number, THREE: any) {
  const geo = new THREE.BufferGeometry();
  const v = new Float32Array([
    -HW, 0, -HD,  -HW, 0,  HD,   0, peak,  HD,
    -HW, 0, -HD,   0, peak,  HD,  0, peak, -HD,
     HW, 0, -HD,   0, peak, -HD,  0, peak,  HD,
     HW, 0, -HD,   0, peak,  HD,  HW, 0,  HD,
    -HW, 0,  HD,   HW, 0,  HD,   0, peak,  HD,
    -HW, 0, -HD,   0, peak, -HD,  HW, 0, -HD,
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  geo.computeVertexNormals();
  return geo;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildGableGeo(peak: number, THREE: any) {
  const geo = new THREE.BufferGeometry();
  const v = new Float32Array([-HW, 0, 0,  HW, 0, 0,  0, peak, 0]);
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  geo.computeVertexNormals();
  return geo;
}

// Minimal spherical-coords camera controller (replaces OrbitControls).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeController(camera: any, domEl: HTMLElement, THREE: any) {
  const target = new THREE.Vector3(0, 1, 0);
  const initial = { r: 11, theta: Math.PI / 5, phi: Math.PI / 4.5 };
  let r = initial.r, theta = initial.theta, phi = initial.phi;
  let drag = false;
  let px = 0, py = 0;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  function applyPos() {
    camera.position.set(
      target.x + r * Math.sin(theta) * Math.sin(phi),
      target.y + r * Math.cos(theta),
      target.z + r * Math.sin(theta) * Math.cos(phi),
    );
    camera.lookAt(target);
  }
  applyPos();

  const onDown = (e: PointerEvent) => { drag = true; px = e.clientX; py = e.clientY; domEl.setPointerCapture(e.pointerId); };
  const onUp   = () => { drag = false; };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    phi   -= dx * 0.007;
    theta  = clamp(theta - dy * 0.007, 0.15, Math.PI / 2.1);
    applyPos();
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    r = clamp(r + e.deltaY * 0.01, 4, 18);
    applyPos();
  };

  domEl.addEventListener('pointerdown', onDown);
  domEl.addEventListener('pointerup',   onUp);
  domEl.addEventListener('pointermove', onMove);
  domEl.addEventListener('wheel',       onWheel, { passive: false });

  return {
    target,
    dispose() {
      domEl.removeEventListener('pointerdown', onDown);
      domEl.removeEventListener('pointerup',   onUp);
      domEl.removeEventListener('pointermove', onMove);
      domEl.removeEventListener('wheel',       onWheel);
    },
    reset() {
      r = initial.r; theta = initial.theta; phi = initial.phi;
      applyPos();
    },
  };
}

interface Props {
  params:      SceneParams;
  onResetRef?: (fn: () => void) => void;
  active:      boolean;
}

export default function AFrameScene({ params, onResetRef, active }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const st        = useRef<any>({ animId: 0, live: { angle: params.roofAngle } });
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const resetCamera = useCallback(() => {
    st.current.controls?.reset();
  }, []);

  useEffect(() => { onResetRef?.(resetCamera); }, [onResetRef, resetCamera]);

  // When the container switches from display:none → visible the renderer
  // has size 0×0. Correct dimensions as soon as active becomes true.
  useEffect(() => {
    if (!active) return;
    const s     = st.current;
    const mount = mountRef.current;
    if (!s.renderer || !mount) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    s.renderer.setSize(w, h);
    if (s.camera) {
      s.camera.aspect = w / h;
      s.camera.updateProjectionMatrix();
    }
  }, [active]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const s     = st.current;

    const THREE = getT();
    if (!THREE) { setFailed(true); return; }

    try {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x0b0f14);
      mount.appendChild(renderer.domElement);
      s.renderer = renderer;

      const scene = new THREE.Scene();
      scene.fog   = new THREE.Fog(0x0b0f14, 18, 32);

      const camera = new THREE.PerspectiveCamera(
        45,
        (mount.clientWidth || 1) / (mount.clientHeight || 1),
        0.1,
        100,
      );
      s.camera = camera;

      const controls = makeController(camera, renderer.domElement, THREE);
      s.controls = controls;

      scene.add(new THREE.AmbientLight(0x98b8d8, 0.15));
      const dirLight = new THREE.DirectionalLight(0xb8cce0, 0.35);
      dirLight.position.set(-5, 10, 5);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      Object.assign(dirLight.shadow.camera, { near: 0.5, far: 35, left: -10, right: 10, top: 10, bottom: -10 });
      scene.add(dirLight);

      const innerLight = new THREE.PointLight(0xe7b257, 4, 9);
      innerLight.position.set(0, 1, 0);
      innerLight.castShadow = true;
      scene.add(innerLight);

      const innerLight2 = new THREE.PointLight(0xe7b257, 0, 6);
      innerLight2.position.set(0, 3, 0);
      scene.add(innerLight2);
      s.innerLight2 = innerLight2;

      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 6, 0.18, 64),
        new THREE.MeshStandardMaterial({ color: 0x1a2a12, roughness: 0.95 }),
      );
      platform.position.y = -0.09;
      platform.receiveShadow = true;
      scene.add(platform);

      const terrace = new THREE.Mesh(
        new THREE.BoxGeometry(W - 0.4, 0.14, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x5c3d22, roughness: 0.88 }),
      );
      terrace.position.set(0, 0.07, HD + 1.4);
      terrace.castShadow = true;
      terrace.receiveShadow = true;
      scene.add(terrace);

      const plankMat = new THREE.MeshStandardMaterial({ color: 0x3d2610 });
      [-0.9, -0.3, 0.3, 0.9].forEach((z: number) => {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(W - 0.5, 0.02, 0.05), plankMat);
        plank.position.set(0, 0.145, HD + 1.4 + z * 0.65);
        scene.add(plank);
      });

      const initPeak = peakY(params.roofAngle);

      const roofMat = new THREE.MeshStandardMaterial({
        color:     new THREE.Color(ROOF_COLORS[params.roofColorIdx]),
        roughness: 0.75, metalness: 0.25, side: THREE.DoubleSide,
      });
      s.roofMat = roofMat;
      const roofMesh = new THREE.Mesh(buildRoofGeo(initPeak, THREE), roofMat);
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      scene.add(roofMesh);
      s.roofMesh = roofMesh;

      const makeGableMat = () => new THREE.MeshPhysicalMaterial({
        color:             new THREE.Color(FACADE_COLORS[params.facadeColorIdx]),
        transparent:       true,
        opacity:           0.52,
        roughness:         0.04,
        transmission:      0.65,
        emissive:          new THREE.Color(0xe7b257),
        emissiveIntensity: 0.35,
        side:              THREE.DoubleSide,
      });

      const frontGableMat = makeGableMat();
      const backGableMat  = makeGableMat();
      s.frontGableMat = frontGableMat;
      s.backGableMat  = backGableMat;

      const frontGable = new THREE.Mesh(buildGableGeo(initPeak, THREE), frontGableMat);
      frontGable.position.set(0, 0, HD + 0.01);
      scene.add(frontGable);
      s.frontGable = frontGable;

      const backGable = new THREE.Mesh(buildGableGeo(initPeak, THREE), backGableMat);
      backGable.position.set(0, 0, -HD - 0.01);
      backGable.rotation.y = Math.PI;
      scene.add(backGable);
      s.backGable = backGable;

      const floorPlate = new THREE.Mesh(
        new THREE.BoxGeometry(W - 0.08, 0.14, D - 0.08),
        new THREE.MeshStandardMaterial({ color: 0x1a130a, roughness: 0.9 }),
      );
      floorPlate.position.y = -50;
      floorPlate.visible    = false;
      floorPlate.castShadow = true;
      scene.add(floorPlate);
      s.floorPlate = floorPlate;

      let last = performance.now();
      function animate() {
        s.animId = requestAnimationFrame(animate);
        const now   = performance.now();
        const delta = Math.min((now - last) / 1000, 0.1);
        last = now;
        const p = paramsRef.current;
        const t = Math.min(1, delta * 2.2);

        s.live.angle = lerp(s.live.angle, p.roofAngle, t);
        const peak   = peakY(s.live.angle);

        s.roofMesh.geometry.dispose();
        s.roofMesh.geometry = buildRoofGeo(peak, THREE);

        s.frontGable.geometry.dispose();
        s.frontGable.geometry = buildGableGeo(peak, THREE);
        s.frontGable.position.set(0, 0, HD + 0.01);

        s.backGable.geometry.dispose();
        s.backGable.geometry = buildGableGeo(peak, THREE);
        s.backGable.position.set(0, 0, -HD - 0.01);

        s.roofMat.color.lerp(new THREE.Color(ROOF_COLORS[p.roofColorIdx]), t);
        const fc = new THREE.Color(FACADE_COLORS[p.facadeColorIdx]);
        s.frontGableMat.color.lerp(fc, t);
        s.backGableMat.color.lerp(fc, t);

        if (p.floors === 2) {
          s.floorPlate.visible     = true;
          s.floorPlate.position.y  = lerp(s.floorPlate.position.y, peak * 0.48, t * 1.5);
          s.innerLight2.intensity  = lerp(s.innerLight2.intensity, 2, t);
          s.innerLight2.position.y = peak * 0.65;
        } else {
          s.floorPlate.position.y = lerp(s.floorPlate.position.y, -50, t * 1.5);
          if (s.floorPlate.position.y < -10) s.floorPlate.visible = false;
          s.innerLight2.intensity = lerp(s.innerLight2.intensity, 0, t);
        }

        renderer.render(scene, camera);
      }
      animate();

      const ro = new ResizeObserver(() => {
        if (!mount) return;
        const rw = mount.clientWidth;
        const rh = mount.clientHeight;
        if (!rw || !rh) return;
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      });
      ro.observe(mount);

      return () => {
        cancelAnimationFrame(s.animId);
        ro.disconnect();
        controls.dispose();
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    } catch (err) {
      console.error('AFrameScene init error:', err);
      setFailed(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return null;

  return (
    <div
      ref={mountRef}
      style={{
        width:    '100%',
        height:   '100%',
        display:   active ? 'block' : 'none',
        position: 'absolute',
        inset:     0,
      }}
    />
  );
}

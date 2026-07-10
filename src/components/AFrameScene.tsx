/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';

// three.js r147 загружается CDN-скриптом в index.html и доступен как window.THREE.
// OrbitControls НЕ используется — управление камерой реализовано внутри компонента.

export interface SceneParams {
  height: number;
  roofAngle: number;
  floors: 1 | 2;
  roofColorIdx: number;
  facadeColorIdx: number;
}

interface Props {
  params: SceneParams;
  onResetRef?: (fn: () => void) => void;
  active: boolean;
}

const ROOF_COLORS = ['#23272E', '#3A3F47', '#6B7280', '#14171C'];
const FACADE_COLORS = ['#B98A4A', '#2E333B', '#4A505A', '#8A9099'];

const D = 8; // глубина дома
const CAM_START = { theta: 0.65, phi: 1.12, radius: 15 };

function waitForThree(tries = 50): Promise<any> {
  return new Promise((resolve, reject) => {
    const tick = () => {
      const T = (window as any).THREE;
      if (T) return resolve(T);
      if (--tries <= 0) return reject(new Error('THREE not loaded'));
      setTimeout(tick, 100);
    };
    tick();
  });
}

export default function AFrameScene({ params, onResetRef, active }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  const st = useRef<any>({
    inited: false,
    initing: false,
    T: null,
    renderer: null,
    scene: null,
    camera: null,
    house: null,
    mats: null,
    lights: null,
    animId: 0,
    ro: null,
    // камера (своя орбита)
    cam: { ...CAM_START },
    camTgt: { ...CAM_START },
    // параметры дома
    live: { height: 8, angle: 60, floors: 1 as 1 | 2 },
    tgt: { height: 8, angle: 60, floors: 1 as 1 | 2 },
    colorTgt: { roof: '#23272E', facade: '#B98A4A' },
    needsRebuild: true,
    activeFlag: false,
    cleanupFns: [] as Array<() => void>,
  });

  st.current.activeFlag = active;

  /* ---------- геометрия дома ---------- */

  const rebuildHouse = useCallback(() => {
    const s = st.current;
    const T = s.T;
    if (!T || !s.scene) return;

    if (s.house) {
      s.house.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); });
      s.scene.remove(s.house);
    }
    const g = new T.Group();
    const { height, angle, floors } = s.live;
    const peak = Math.max(3, Math.min(9.5, height * 0.75));
    const hw = Math.max(1.8, Math.min(6, peak / Math.tan((angle * Math.PI) / 180)));
    const hd = D / 2;
    const M = s.mats;

    // скаты крыши
    const roofGeo = new T.BufferGeometry();
    roofGeo.setAttribute('position', new T.BufferAttribute(new Float32Array([
      -hw, 0, -hd,  -hw, 0, hd,   0, peak, hd,
      -hw, 0, -hd,   0, peak, hd, 0, peak, -hd,
       hw, 0, -hd,   0, peak, -hd, 0, peak, hd,
       hw, 0, -hd,   0, peak, hd,  hw, 0, hd,
    ]), 3));
    roofGeo.computeVertexNormals();
    const roof = new T.Mesh(roofGeo, M.roof);
    roof.castShadow = true; roof.receiveShadow = true;
    g.add(roof);

    // конёк
    const ridge = new T.Mesh(new T.BoxGeometry(0.2, 0.14, D + 0.35), M.roof);
    ridge.position.set(0, peak + 0.03, 0);
    g.add(ridge);

    // стеклянные фронтоны (перед — ярче, зад — приглушён)
    const glassTri = (z: number, mat: any, sc = 0.93) => {
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(new Float32Array([
        -hw * sc, 0.05, z,  hw * sc, 0.05, z,  0, peak * 0.96, z,
      ]), 3));
      geo.computeVertexNormals();
      return new T.Mesh(geo, mat);
    };
    g.add(glassTri(hd - 0.05, M.glassFront));
    g.add(glassTri(-hd + 0.05, M.glassBack));

    // каркасные балки фасада
    const post = new T.Mesh(new T.BoxGeometry(0.16, peak * 0.94, 0.16), M.facade);
    post.position.set(0, peak * 0.47, hd - 0.02);
    g.add(post);
    const beamY = floors === 2 ? peak * 0.42 : peak * 0.4;
    const beam = new T.Mesh(new T.BoxGeometry(hw * 1.35, 0.14, 0.16), M.facade);
    beam.position.set(0, beamY, hd - 0.02);
    g.add(beam);

    // LED-подсветка передних граней крыши
    const edgeLen = Math.sqrt(hw * hw + peak * peak);
    const a = Math.atan2(peak, hw);
    const ledL = new T.Mesh(new T.BoxGeometry(edgeLen, 0.09, 0.09), M.led);
    ledL.rotation.z = a;
    ledL.position.set(-hw / 2, peak / 2, hd + 0.04);
    g.add(ledL);
    const ledR = new T.Mesh(new T.BoxGeometry(edgeLen, 0.09, 0.09), M.led);
    ledR.rotation.z = Math.PI - a;
    ledR.position.set(hw / 2, peak / 2, hd + 0.04);
    g.add(ledR);

    // пол и антресоль второго этажа
    const floor1 = new T.Mesh(new T.BoxGeometry(hw * 1.7, 0.12, D * 0.86), M.wood);
    floor1.position.y = 0.06;
    floor1.receiveShadow = true;
    g.add(floor1);
    if (floors === 2) {
      const mez = new T.Mesh(new T.BoxGeometry(hw * 1.2, 0.12, D * 0.8), M.wood);
      mez.position.y = peak * 0.42;
      g.add(mez);
    }

    // терраса со ступенями
    const deck = new T.Mesh(new T.BoxGeometry(hw * 1.6, 0.14, 2.3), M.deck);
    deck.position.set(0, 0.07, hd + 1.25);
    deck.castShadow = true; deck.receiveShadow = true;
    g.add(deck);
    const step1 = new T.Mesh(new T.BoxGeometry(hw * 1.0, 0.12, 0.5), M.deck);
    step1.position.set(0, 0.06, hd + 2.55);
    g.add(step1);
    const step2 = new T.Mesh(new T.BoxGeometry(hw * 0.8, 0.1, 0.45), M.deck);
    step2.position.set(0, 0.05, hd + 3.0);
    g.add(step2);

    s.house = g;
    s.scene.add(g);

    // свет внутри следует за высотой
    if (s.lights) {
      s.lights.inner.position.y = peak * 0.3;
      s.lights.inner2.position.y = peak * 0.55;
      s.lights.inner2.visible = floors === 2;
    }
  }, []);

  /* ---------- инициализация ---------- */

  const doResize = useCallback(() => {
    const s = st.current;
    const mount = mountRef.current;
    if (!s.inited || !mount || mount.clientWidth === 0) return;
    s.renderer.setSize(mount.clientWidth, mount.clientHeight);
    s.camera.aspect = mount.clientWidth / mount.clientHeight;
    s.camera.updateProjectionMatrix();
  }, []);

  const init = useCallback(async () => {
    const s = st.current;
    const mount = mountRef.current;
    if (s.inited || s.initing || !mount) return;
    s.initing = true;
    try {
      const T = await waitForThree();
      // ждём, пока контейнер получит реальный размер
      for (let i = 0; i < 60 && mount.clientWidth === 0; i++) {
        await new Promise((r) => requestAnimationFrame(r));
      }
      if (mount.clientWidth === 0) throw new Error('zero size');
      s.T = T;

      const renderer = new T.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);
      s.renderer = renderer;

      const scene = new T.Scene();
      scene.background = new T.Color('#0B0F14');
      scene.fog = new T.Fog('#0B0F14', 20, 46);
      s.scene = scene;

      const camera = new T.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 120);
      s.camera = camera;

      // материалы (создаются один раз, цвета анимируются)
      s.mats = {
        roof: new T.MeshStandardMaterial({ color: ROOF_COLORS[params.roofColorIdx] || ROOF_COLORS[0], roughness: 0.5, metalness: 0.4, side: T.DoubleSide }),
        facade: new T.MeshStandardMaterial({ color: FACADE_COLORS[params.facadeColorIdx] || FACADE_COLORS[0], roughness: 0.7, metalness: 0.1 }),
        glassFront: new T.MeshStandardMaterial({ color: '#2a1c0c', emissive: '#E7B257', emissiveIntensity: 0.75, transparent: true, opacity: 0.55, side: T.DoubleSide }),
        glassBack: new T.MeshStandardMaterial({ color: '#1c1409', emissive: '#B8863E', emissiveIntensity: 0.35, transparent: true, opacity: 0.5, side: T.DoubleSide }),
        led: new T.MeshBasicMaterial({ color: '#FFD9A0' }),
        wood: new T.MeshStandardMaterial({ color: '#7a5433', roughness: 0.8 }),
        deck: new T.MeshStandardMaterial({ color: '#6b4a2c', roughness: 0.85 }),
      };

      // платформа с газоном
      const shape = new T.Shape();
      const pw = 8.5, pd = 8, r = 1.4;
      shape.moveTo(-pw + r, -pd);
      shape.lineTo(pw - r, -pd); shape.quadraticCurveTo(pw, -pd, pw, -pd + r);
      shape.lineTo(pw, pd - r); shape.quadraticCurveTo(pw, pd, pw - r, pd);
      shape.lineTo(-pw + r, pd); shape.quadraticCurveTo(-pw, pd, -pw, pd - r);
      shape.lineTo(-pw, -pd + r); shape.quadraticCurveTo(-pw, -pd, -pw + r, -pd);
      const plat = new T.Mesh(
        new T.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: false }),
        new T.MeshStandardMaterial({ color: '#242a33', roughness: 0.9 })
      );
      plat.rotation.x = -Math.PI / 2;
      plat.position.y = -0.4;
      plat.receiveShadow = true;
      scene.add(plat);
      const grass = new T.Mesh(new T.PlaneGeometry(15.6, 14.6), new T.MeshStandardMaterial({ color: '#1d3123', roughness: 1 }));
      grass.rotation.x = -Math.PI / 2;
      grass.position.y = 0.012;
      grass.receiveShadow = true;
      scene.add(grass);

      // деревья и фонарики
      const treeMat = new T.MeshStandardMaterial({ color: '#152619', roughness: 1 });
      const trunkMat = new T.MeshStandardMaterial({ color: '#3a2a1a', roughness: 1 });
      [[-6.5, -5, 2.2], [6.3, -5.6, 1.7], [-6.8, 5.4, 1.5], [6.6, 5.8, 2.0]].forEach(([x, z, h]) => {
        const tree = new T.Group();
        const cone = new T.Mesh(new T.ConeGeometry(h * 0.34, h, 8), treeMat);
        cone.position.y = h / 2 + 0.25;
        cone.castShadow = true;
        const trunk = new T.Mesh(new T.CylinderGeometry(0.07, 0.09, 0.3, 6), trunkMat);
        trunk.position.y = 0.15;
        tree.add(cone, trunk);
        tree.position.set(x, 0, z);
        scene.add(tree);
      });
      const bulbMat = new T.MeshBasicMaterial({ color: '#FFD9A0' });
      [[-3.5, 6.6], [3.5, 6.6], [-5.8, 2.5], [5.8, 2.5]].forEach(([x, z]) => {
        const lamp = new T.Group();
        const stub = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.22, 6), trunkMat);
        stub.position.y = 0.11;
        const bulb = new T.Mesh(new T.SphereGeometry(0.06, 8, 8), bulbMat);
        bulb.position.y = 0.26;
        lamp.add(stub, bulb);
        lamp.position.set(x, 0, z);
        scene.add(lamp);
      });

      // свет
      const inner = new T.PointLight('#E7B257', 1.7, 17, 2);
      inner.position.set(0, 2, 0);
      inner.castShadow = true;
      inner.shadow.mapSize.set(1024, 1024);
      scene.add(inner);
      const inner2 = new T.PointLight('#E7B257', 1.1, 12, 2);
      inner2.position.set(0, 3.4, 0);
      inner2.visible = false;
      scene.add(inner2);
      const moon = new T.DirectionalLight('#b9cde3', 0.5);
      moon.position.set(-8, 10, -6);
      moon.castShadow = true;
      moon.shadow.mapSize.set(1024, 1024);
      moon.shadow.camera.left = -14; moon.shadow.camera.right = 14;
      moon.shadow.camera.top = 14; moon.shadow.camera.bottom = -14;
      scene.add(moon);
      scene.add(new T.AmbientLight('#405066', 0.45));
      s.lights = { inner, inner2, moon };

      /* --- своя орбита камеры: drag = вращение, колесо = зум --- */
      const el = renderer.domElement;
      el.style.touchAction = 'none';
      let dragging = false, px = 0, py = 0;
      const down = (e: PointerEvent) => { dragging = true; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        s.camTgt.theta -= (e.clientX - px) * 0.006;
        s.camTgt.phi = Math.max(0.55, Math.min(1.45, s.camTgt.phi - (e.clientY - py) * 0.004));
        px = e.clientX; py = e.clientY;
      };
      const up = (e: PointerEvent) => { dragging = false; try { el.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ } el.style.cursor = 'grab'; };
      const wheel = (e: WheelEvent) => { e.preventDefault(); s.camTgt.radius = Math.max(7, Math.min(26, s.camTgt.radius + e.deltaY * 0.012)); };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointerleave', up);
      el.addEventListener('wheel', wheel, { passive: false });
      el.style.cursor = 'grab';
      s.cleanupFns.push(() => {
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointerleave', up);
        el.removeEventListener('wheel', wheel);
      });

      const ro = new ResizeObserver(() => doResize());
      ro.observe(mount);
      s.ro = ro;

      s.inited = true;
      s.needsRebuild = true;
      rebuildHouse();

      /* --- цикл --- */
      const lookAt = new T.Vector3(0, 2.1, 0);
      const roofC = new T.Color(); const facadeC = new T.Color();
      const loop = () => {
        s.animId = requestAnimationFrame(loop);
        if (!s.activeFlag) return; // в фото-режиме не рендерим
        // плавная камера
        s.cam.theta += (s.camTgt.theta - s.cam.theta) * 0.12;
        s.cam.phi += (s.camTgt.phi - s.cam.phi) * 0.12;
        s.cam.radius += (s.camTgt.radius - s.cam.radius) * 0.12;
        const { theta, phi, radius } = s.cam;
        camera.position.set(
          lookAt.x + radius * Math.sin(phi) * Math.sin(theta),
          lookAt.y + radius * Math.cos(phi),
          lookAt.z + radius * Math.sin(phi) * Math.cos(theta)
        );
        camera.lookAt(lookAt);
        // плавные параметры дома
        const dh = s.tgt.height - s.live.height;
        const da = s.tgt.angle - s.live.angle;
        if (Math.abs(dh) > 0.02 || Math.abs(da) > 0.05 || s.needsRebuild) {
          s.live.height += dh * 0.1;
          s.live.angle += da * 0.1;
          if (Math.abs(dh) <= 0.02 && Math.abs(da) <= 0.05) {
            s.live.height = s.tgt.height; s.live.angle = s.tgt.angle; s.needsRebuild = false;
          }
          s.live.floors = s.tgt.floors;
          rebuildHouse();
        }
        // плавные цвета
        roofC.set(s.colorTgt.roof); facadeC.set(s.colorTgt.facade);
        s.mats.roof.color.lerp(roofC, 0.12);
        s.mats.facade.color.lerp(facadeC, 0.12);
        renderer.render(scene, camera);
      };
      loop();
    } catch (e) {
      setFailed(true);
    } finally {
      s.initing = false;
    }
  }, [doResize, rebuildHouse, params.roofColorIdx, params.facadeColorIdx]);

  /* ---------- реакции ---------- */

  useEffect(() => {
    if (active) {
      if (!st.current.inited) init();
      else doResize();
    }
  }, [active, init, doResize]);

  useEffect(() => {
    const s = st.current;
    s.tgt = { height: params.height, angle: params.roofAngle, floors: params.floors };
    s.colorTgt = {
      roof: ROOF_COLORS[params.roofColorIdx] || ROOF_COLORS[0],
      facade: FACADE_COLORS[params.facadeColorIdx] || FACADE_COLORS[0],
    };
    s.needsRebuild = true;
  }, [params]);

  const resetCamera = useCallback(() => {
    st.current.camTgt = { ...CAM_START };
  }, []);

  useEffect(() => { onResetRef?.(resetCamera); }, [onResetRef, resetCamera]);

  useEffect(() => {
    const s = st.current;
    return () => {
      cancelAnimationFrame(s.animId);
      s.cleanupFns.forEach((fn: () => void) => fn());
      if (s.ro) s.ro.disconnect();
      if (s.renderer) {
        s.renderer.dispose();
        if (s.renderer.domElement.parentNode) s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
      }
      s.inited = false;
    };
  }, []);

  /* ---------- рендер ---------- */

  if (failed && active) {
    return (
      <img
        src="/model-fallback.jpg"
        alt="A-Frame модель"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, display: active ? 'block' : 'none' }}
    />
  );
}

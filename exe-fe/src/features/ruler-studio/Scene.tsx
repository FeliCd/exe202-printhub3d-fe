import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { translateCustom as tr } from './language';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  Group,
  Shape,
  SRGBColorSpace,
  Vector3,
  PCFShadowMap,
  PerspectiveCamera,
} from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import { STLExporter } from "three-stdlib";
import { type Design, type Surface } from "./model";
import { paintSurface, surfaceSize } from "./surface";
import { getRuler } from "./library/registry";
import { getProfile } from "./geometry/profiles";
import { flatSolid, triangularSolid } from "./geometry/solid";
import type { LiveArtwork } from "./liveArtwork";

export interface SceneHandle {
  getSTLBlob: () => Blob | null;
  getScreenshotBlob: () => Promise<Blob | null>;
}

export type View = "Hero" | "Top" | "45°" | "Side" | "Bottom";
function outline(w: number, h: number, r: number, badge = false) {
  const s = new Shape();
  if (badge) {
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.lineTo(-w / 2, 0);
    s.closePath();
    return s;
  }
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}
function Body({
  w,
  h,
  depth,
  color,
  gloss,
  shape = "rounded",
}: {
  w: number;
  h: number;
  depth: number;
  color: string;
  gloss: boolean;
  shape?: string;
}) {
  const geometry = useMemo(
    () =>
      new ExtrudeGeometry(
        outline(
          w - 0.08,
          h - 0.08,
          shape === "capsule" ? h / 2 - 0.05 : 0.15,
          shape === "badge",
        ),
        {
          depth: depth - 0.08,
          bevelEnabled: true,
          bevelThickness: 0.04,
          bevelSize: 0.04,
          bevelSegments: 4,
          curveSegments: 16,
          steps: 1,
        },
      ),
    [w, h, depth, shape],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.04, 0]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={color}
        roughness={gloss ? 0.26 : 0.66}
        metalness={0}
        clearcoat={gloss ? 0.38 : 0.06}
        clearcoatRoughness={0.25}
      />
    </mesh>
  );
}
function Artwork({
  design,
  surface,
  y,
  rotation = -Math.PI / 2,
  z = 0,
  live,
}: {
  design: Design;
  surface: Surface;
  y: number;
  rotation?: number;
  z?: number;
  live: LiveArtwork;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    paintSurface(c, design, surface);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    if (surface === "back") t.flipY = false;
    return t;
  }, [design, surface]);
  useEffect(() => () => texture.dispose(), [texture]);
  const { invalidate } = useThree();
  useEffect(
    () =>
      live.subscribe((update) => {
        if (update && update.surface !== surface) return;
        paintSurface(
          texture.image as HTMLCanvasElement,
          update?.design ?? design,
          surface,
        );
        texture.needsUpdate = true;
        invalidate();
      }),
    [design, surface, texture, live, invalidate],
  );
  const [w, h] = surfaceSize(design, surface);
  return (
    <mesh
      rotation={[rotation, 0, 0]}
      position={[0, y, z]}
      userData={{ artwork: true }}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        toneMapped={false}
        map={texture}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}
function Rig({
  view,
  serial,
  length,
  reduced,
  height,
  surface,
  surfaceSerial,
}: {
  view: View;
  serial: number;
  length: number;
  reduced: boolean;
  height: number;
  surface: Surface;
  surfaceSerial: number;
}) {
  const controls = useRef<Controls>(null),
    moving = useRef(true),
    elapsed = useRef(0),
    idle = useRef(false),
    idleElapsed = useRef(0);
  const { invalidate, size } = useThree();
  const destination = useMemo(() => {
    const distance =
      Math.max(
        ((length + 2) * size.height) / Math.max(1, size.width),
        height + 2,
      ) *
      2.15 *
      (view === "Top" ? 2.73 : 1);
    const vectors: Record<View, [number, number, number]> = {
      Hero: [0.2, 0.8, 1],
      Top: [0, 1, 0.001],
      "45°": [0.55, 0.85, 0.8],
      Side: [0.2, 0.13, 1],
      Bottom: [0, -1, 0.01],
    };
    const surfaceViews: Partial<Record<Surface, [number, number, number]>> = {
      back: [0, -1, 0.01],
      "face-a": [0, 0.5, 0.866],
      "face-b": [0, 0.5, -0.866],
      "face-c": [0, -1, 0.01],
    };
    return new Vector3(
      ...(view === "Hero" && surfaceViews[surface]
        ? surfaceViews[surface]!
        : vectors[view]),
    )
      .normalize()
      .multiplyScalar(distance);
  }, [view, length, height, size, surface]);
  useEffect(() => {
    moving.current = true;
    elapsed.current = 0;
    idle.current = false;
    invalidate();
  }, [destination, serial, surfaceSerial, invalidate]);
  useEffect(() => {
    if (reduced || view !== "Hero") return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      idle.current = false;
      timer = setTimeout(() => {
        idleElapsed.current = 0;
        idle.current = true;
        invalidate();
      }, 12000);
    };
    window.addEventListener("pointerdown", schedule);
    window.addEventListener("keydown", schedule);
    schedule();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", schedule);
      window.removeEventListener("keydown", schedule);
    };
  }, [reduced, view, invalidate]);
  useFrame(({ camera }, dt) => {
    if (moving.current) {
      elapsed.current += Math.min(dt, 0.05);
      const amount = reduced ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) * 5);
      camera.position.lerp(destination, amount);
      if (camera instanceof PerspectiveCamera) {
        camera.fov += ((view === "Top" ? 12 : 32) - camera.fov) * amount;
        camera.updateProjectionMatrix();
      }
      controls.current?.target.lerp(new Vector3(0, 0.2, 0), amount);
      controls.current?.update();
      if (reduced || elapsed.current > 1.3) {
        camera.position.copy(destination);
        if (camera instanceof PerspectiveCamera) {
          camera.fov = view === "Top" ? 12 : 32;
          camera.updateProjectionMatrix();
        }
        moving.current = false;
      }
      invalidate();
    } else if (idle.current) {
      idleElapsed.current += Math.min(dt, 0.05);
      camera.position.applyAxisAngle(
        new Vector3(0, 1, 0),
        Math.sin(idleElapsed.current * Math.PI) * 0.003 * Math.min(dt, 0.05),
      );
      controls.current?.update();
      if (idleElapsed.current >= 2) idle.current = false;
      else invalidate();
    }
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      minDistance={6}
      maxDistance={1500}
      onStart={() => {
        moving.current = false;
        idle.current = false;
      }}
    />
  );
}
function Model({
  design,
  modelRef,
  live,
}: {
  design: Design;
  modelRef: React.RefObject<Group | null>;
  live: LiveArtwork;
}) {
  const [tw, th] = surfaceSize(design, "tag");
  const r = getRuler(design.rulerId);
  const profile = useMemo(
    () =>
      getProfile({
        rulerId: design.rulerId,
        length: design.length,
        angle: design.angle,
      }),
    [design.rulerId, design.length, design.angle],
  );
  const prism = r.geometryType === "triangular-scale";
  const solid = useMemo(
    () =>
      prism
        ? triangularSolid(profile.width, profile.height)
        : flatSolid(profile),
    [profile, prism],
  );
  useEffect(() => () => solid.dispose(), [solid]);
  const prismHeight = (profile.height * Math.sqrt(3)) / 2;
  return (
    <group ref={modelRef}>
      <mesh geometry={solid} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={design.color}
          roughness={design.material === "PETG" ? 0.26 : 0.66}
          metalness={0}
          clearcoat={design.material === "PETG" ? 0.38 : 0.06}
        />
      </mesh>
      {prism ? (
        <>
          <Artwork
            design={design}
            surface="face-a"
            y={prismHeight / 2 + 0.004}
            z={profile.height / 4 + 0.006}
            rotation={-Math.PI / 6}
            live={live}
          />
          <Artwork
            design={design}
            surface="face-b"
            y={prismHeight / 2 + 0.004}
            z={-profile.height / 4 - 0.006}
            rotation={(-5 * Math.PI) / 6}
            live={live}
          />
          <Artwork
            design={design}
            surface="face-c"
            y={-0.006}
            rotation={Math.PI / 2}
            live={live}
          />
        </>
      ) : (
        <>
          <Artwork
            design={design}
            surface="ruler"
            y={profile.thickness + 0.006}
            live={live}
          />
          <Artwork
            design={design}
            surface="back"
            y={-0.006}
            rotation={Math.PI / 2}
            live={live}
          />
        </>
      )}
      {r.supportsNameTag && design.tag.enabled && (
        <group
          position={[
            (design.tag.x - 0.5) * profile.width,
            profile.thickness,
            Math.min(0.62, profile.height / 2 - th / 2 - 0.08),
          ]}
        >
          <Body
            w={tw}
            h={th}
            depth={design.tag.mode === "raised" ? 0.16 : 0.1}
            color={design.tag.color}
            gloss={design.material === "PETG"}
            shape={design.tag.shape}
          />
          <Artwork
            design={design}
            surface="tag"
            y={design.tag.mode === "raised" ? 0.165 : 0.105}
            live={live}
          />
        </group>
      )}
    </group>
  );
}
const Scene = forwardRef<
  SceneHandle,
  {
    design: Design;
    live: LiveArtwork;
    surface: Surface;
    surfaceSerial: number;
  }
>(function Scene(
  {
    design,
    live,
    surface,
    surfaceSerial,
  },
  ref,
) {
  const [view, setView] = useState<View>("Hero"),
    [serial, setSerial] = useState(0),
    [dimensions, setDimensions] = useState(true),
    [error, setError] = useState("");
  const model = useRef<Group>(null);
  const ruler = getRuler(design.rulerId),
    profile = getProfile(design);
  const [manualSurfaceSerial, setManualSurfaceSerial] = useState(surfaceSerial);
  const effectiveView = manualSurfaceSerial === surfaceSerial ? view : "Hero";
  const reduced = !!useReducedMotion();
  const light = new Color(design.color).getHSL({ h: 0, s: 0, l: 0 }).l > 0.45;

  useImperativeHandle(
    ref,
    () => ({
      getSTLBlob: () => {
        try {
          if (!model.current) return null;
          const copy = model.current.clone();
          const artwork: Group[] = [];
          copy.traverse((obj) => {
            if (obj.userData.artwork) artwork.push(obj as Group);
          });
          artwork.forEach((obj) => obj.removeFromParent());
          copy.scale.setScalar(10);
          copy.updateMatrixWorld(true);
          const result = new STLExporter().parse(copy, { binary: true });
          return new Blob([result.buffer as ArrayBuffer], {
            type: "application/octet-stream",
          });
        } catch (e) {
          console.error("STL generation error", e);
          setError("Lỗi khi tạo mô hình STL.");
          return null;
        }
      },
      getScreenshotBlob: () => {
        return new Promise<Blob | null>((resolve) => {
          try {
            const canvas = document.querySelector(
              ".studio-canvas canvas",
            ) as HTMLCanvasElement | null;
            if (!canvas) {
              resolve(null);
              return;
            }
            requestAnimationFrame(() => {
              try {
                if (canvas.toBlob) {
                  canvas.toBlob((blob) => {
                    if (blob) {
                      resolve(blob);
                    } else {
                      try {
                        const dataUrl = canvas.toDataURL("image/png");
                        const arr = dataUrl.split(",");
                        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                          u8arr[n] = bstr.charCodeAt(n);
                        }
                        resolve(new Blob([u8arr], { type: mime }));
                      } catch {
                        resolve(null);
                      }
                    }
                  }, "image/png");
                } else {
                  const dataUrl = canvas.toDataURL("image/png");
                  const arr = dataUrl.split(",");
                  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
                  const bstr = atob(arr[1]);
                  let n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                  }
                  resolve(new Blob([u8arr], { type: mime }));
                }
              } catch (err) {
                console.error("Canvas export error", err);
                resolve(null);
              }
            });
          } catch (e) {
            console.error("Screenshot error", e);
            setError("Lỗi khi chụp ảnh mô hình 3D.");
            resolve(null);
          }
        });
      },
    }),
    [design],
  );

  return (
    <section
      className={`studio-preview ${light ? "dark-product-bg" : "light-product-bg"}`}
      aria-label={tr("Interactive 3D ruler preview")}
    >
      <div className="studio-preview-heading">
        <span>{tr("PRINT HUB / DESIGN STUDIO")}</span>
        <strong>
          {ruler.name} · {design.length} {tr("cm")} </strong>
      </div>
      <div className={`studio-canvas ${reduced ? "" : "studio-enter"}`}>
        <Canvas
          shadows={{ type: PCFShadowMap }}
          frameloop="demand"
          dpr={[1, 1.75]}
          camera={{ position: [5, 28, 36], fov: 32, near: 0.1, far: 2500 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[4, 15, 8]}
            intensity={2.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-22}
            shadow-camera-right={22}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
            shadow-normalBias={0.03}
          />
          <directionalLight position={[-10, 5, -5]} intensity={1.2} />
          <Environment resolution={128}>
            <Lightformer
              position={[0, 8, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[25, 12, 1]}
              intensity={2}
            />
            <Lightformer
              position={[-10, 3, 2]}
              rotation={[0, Math.PI / 2, 0]}
              scale={[8, 5, 1]}
              intensity={2}
            />
          </Environment>
          <Model design={design} modelRef={model} live={live} />
          {effectiveView !== "Bottom" &&
            surface !== "back" &&
            surface !== "face-c" && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.06, 0]}
                receiveShadow
              >
                <planeGeometry args={[200, 200]} />
                <shadowMaterial transparent opacity={0.2} />
              </mesh>
            )}
          <Rig
            view={effectiveView}
            serial={serial}
            length={profile.width}
            height={profile.height}
            surface={surface}
            surfaceSerial={surfaceSerial}
            reduced={reduced}
          />
        </Canvas>
      </div>
      <div className="studio-preview-footer">
        <div className="studio-camera" aria-label={tr("Camera presets")}>
          {(["Hero", "Top", "45°", "Side", "Bottom"] as View[]).map((v) => (
            <button
              key={v}
              aria-pressed={effectiveView === v}
              onClick={() => {
                setView(v);
                setManualSurfaceSerial(surfaceSerial);
                setSerial((s) => s + 1);
              }}
            >
              {tr(v)}
            </button>
          ))}
          <button
            onClick={() => {
              setView("Hero");
              setManualSurfaceSerial(surfaceSerial);
              setSerial((s) => s + 1);
            }}
          > {tr("Reset view")} </button>
        </div>
        <div className="studio-row">
          <label>
            <input
              type="checkbox"
              checked={dimensions}
              onChange={(e) => setDimensions(e.target.checked)}
            />{" "}
            {tr("Dimensions")}
          </label>
        </div>
        {dimensions && (
          <p className="studio-dimensions"> {tr("Body")} {(profile.width * 10).toFixed(0)} ×{" "}
            {(profile.height * 10).toFixed(0)} ×{" "}
            {(ruler.geometryType === "triangular-scale"
              ? ((profile.height * Math.sqrt(3)) / 2) * 10
              : profile.thickness * 10
            ).toFixed(1)}{" "} {tr("mm ·")}{" "}
            {ruler.geometryType.includes("curve")
              ? tr("Tracing guide")
              : ruler.geometryType === "protractor"
                ? "0–180°"
                : design.measurementSystem === "imperial"
                  ? tr("1/16 inch")
                  : design.scaleId !== "1:1"
                    ? `${design.scaleId} scale`
                    : tr("1 mm graduations")}
          </p>
        )}
        <p className="studio-hint">
          {tr("Kéo chuột / chạm để xoay 3D · Cuộn để phóng to/thu nhỏ.")}
        </p>
        {error && <p role="alert">{tr(error)}</p>}
      </div>
    </section>
  );
});

export default Scene;

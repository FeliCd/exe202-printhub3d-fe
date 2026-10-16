import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as Controls } from "three-stdlib";
import { PCFShadowMap } from "three";
import type { Design } from "./model";
import { Model } from "./Scene";
import { getProfile } from "./geometry/profiles";
import { translateCustom as tr } from "./language";

export interface Modal3DViewerProps {
  design: Design;
}

export function Modal3DViewer({ design }: Modal3DViewerProps) {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const controlsRef = useRef<Controls>(null);

  const profile = useMemo(() => getProfile(design), [design]);
  const distance = useMemo(() => Math.max(profile.width, 15) * 1.4, [profile.width]);

  const setCameraView = (pos: [number, number, number]) => {
    setIsAutoRotating(false);
    if (!controlsRef.current) return;
    controlsRef.current.object.position.set(...pos);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="modal-3d-wrapper">
      <div className="modal-3d-canvas-container">
        <Canvas
          shadows={{ type: PCFShadowMap }}
          dpr={[1, 1.75]}
          camera={{
            position: [distance * 0.3, distance * 0.75, distance * 0.9],
            fov: 34,
            near: 0.1,
            far: 1500,
          }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[5, 16, 8]}
            intensity={2.6}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, 6, -5]} intensity={1.3} />
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

          <Model design={design} />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            autoRotate={isAutoRotating}
            autoRotateSpeed={1.8}
            minDistance={4}
            maxDistance={1200}
            onStart={() => setIsAutoRotating(false)}
          />
        </Canvas>

        {/* Floating Quick Camera Controls */}
        <div className="modal-3d-toolbar" aria-label={tr("Camera controls")}>
          <button
            type="button"
            className={`btn-snap-view ${isAutoRotating ? "active" : ""}`}
            onClick={() => setIsAutoRotating((prev) => !prev)}
            title={isAutoRotating ? "Tạm dừng tự xoay" : "Bật tự xoay 360°"}
          >
            {isAutoRotating ? "⏸️ " + tr("Dừng xoay") : "🔄 " + tr("Tự xoay")}
          </button>
          <button
            type="button"
            className="btn-snap-view"
            onClick={() => setCameraView([0, distance * 1.55, 0.001])}
          >
            ⬆️ {tr("Mặt trước")}
          </button>
          <button
            type="button"
            className="btn-snap-view"
            onClick={() => setCameraView([0, -distance * 1.55, 0.001])}
          >
            ⬇️ {tr("Mặt sau")}
          </button>
          <button
            type="button"
            className="btn-snap-view"
            onClick={() => setCameraView([distance * 0.45, distance * 0.7, distance * 0.85])}
          >
            📐 {tr("Góc 45°")}
          </button>
        </div>
      </div>

      <p className="modal-3d-hint">
        💡 {tr("Dùng chuột hoặc chạm vuốt để xoay 360° · Cuộn để phóng to")}
      </p>
    </div>
  );
}

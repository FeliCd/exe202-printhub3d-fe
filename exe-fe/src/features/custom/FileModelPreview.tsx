import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls } from '@react-three/drei';
import { Box3, Group, Line, Mesh, MeshStandardMaterial, Points } from 'three';
import { OBJLoader, STLLoader } from 'three-stdlib';

function dispose(model: Group) {
  model.traverse(object => {
    if (!(object instanceof Mesh || object instanceof Line || object instanceof Points)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => material.dispose());
  });
}

export default function FileModelPreview({ file, unavailable, loading }: {
  file: File;
  unavailable: string;
  loading: string;
}) {
  const [result, setResult] = useState<{ file: File; model?: Group }>();

  useEffect(() => {
    let active = true;
    let model: Group | undefined;
    async function readModel() {
      try {
        const isStl = /\.stl$/i.test(file.name);
        const data = isStl ? await file.arrayBuffer() : await file.text();
        if (!active) return;
        if (typeof data === 'string') {
          model = new OBJLoader().parse(data);
        } else {
          model = new Group();
          const geometry = new STLLoader().parse(data);
          geometry.computeVertexNormals();
          model.add(new Mesh(geometry, new MeshStandardMaterial({ roughness: 0.8 })));
        }
        const bounds = new Box3().setFromObject(model);
        if (bounds.isEmpty() || ![...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite)) {
          dispose(model);
          model = undefined;
        }
        setResult({ file, model });
      } catch {
        if (model) dispose(model);
        model = undefined;
        if (active) setResult({ file });
      }
    }
    void readModel();
    return () => {
      active = false;
      if (model) dispose(model);
    };
  }, [file]);

  const current = result?.file === file ? result : undefined;
  if (!current?.model) return <p role="status" className="p-3 text-center text-xs text-theme-muted">{current ? unavailable : loading}</p>;

  return (
    <Canvas camera={{ position: [2, 1.7, 2.8], fov: 42 }} frameloop="demand" dpr={[1, 1.5]}
      fallback={<p aria-hidden="true" className="p-3 text-xs text-theme-muted">{unavailable}</p>}>
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <Bounds fit clip observe margin={1.25}>
        <primitive object={current.model} />
      </Bounds>
      <OrbitControls makeDefault enablePan={false} enableZoom={false} />
    </Canvas>
  );
}

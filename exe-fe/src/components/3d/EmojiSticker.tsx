import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export default function EmojiSticker({ canvas, x, z, height, scale, rotation }: {
  canvas: HTMLCanvasElement; x: number; z: number; height: number; scale: number; rotation: number;
}) {
  const texture = useMemo(() => {
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [canvas]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={[x, height, z]} rotation={[0, THREE.MathUtils.degToRad(rotation), 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.01} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

import Modal from '../Modal';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Text } from '@react-three/drei';
import * as THREE from 'three';
import { STLExporter } from 'three-stdlib';
import {
  Download,
  ShoppingBag,
  Sparkles,
  Palette,
  Type,
  Ruler,
  CheckCircle2,
  QrCode,
  X,
  Move,
  RotateCcw,
  RotateCw,
  PenTool,
  Sticker,
  Trash2,
  Eraser,
} from 'lucide-react';
import { formatPrice } from '../../utils/format';

// Available 3D Printed Plastic Preset Colors
const COLOR_PRESETS = [
  { name: 'Xanh Lá (Emerald)', hex: '#39FF14' },
  { name: 'Xanh Dương (Cyan)', hex: '#00F0FF' },
  { name: 'Đen Nhám (Industrial)', hex: '#1C1D22' },
  { name: 'Tím Cyberpunk', hex: '#A855F7' },
  { name: 'Đỏ Thẩm (Fast)', hex: '#EF4444' },
  { name: 'Trắng Tinh (Optical)', hex: '#F8FAFC' },
  { name: 'Vàng Hoàng Gia', hex: '#FACC15' },
  { name: 'Cam Nổi Bật', hex: '#F97316' },
];

interface RulerModelOption {
  id: string;
  name: string;
  category: 'HỌC TẬP & ĐỒ ÁN' | 'TRENDY GEN Z (TIKTOK VIRAL)' | 'TIỆN ÍCH ĐA NĂNG';
  length: number;
  width: number;
  thickness: number;
  basePrice: number;
  badge?: string;
}

// Sticker Item Interface
export interface StickerItem {
  id: string;
  type: 'star' | 'flame' | 'heart' | 'lightning' | 'crown' | 'rocket' | 'paw' | 'gamepad';
  name: string;
  posX: number;
  posZ: number;
  scale: number;
  rotationY: number;
  color: string;
}

const STICKER_PRESETS: Array<{
  type: StickerItem['type'];
  name: string;
  icon: string;
  defaultColor: string;
}> = [
  { type: 'star', name: 'Ngôi Sao ⭐', icon: '⭐', defaultColor: '#FACC15' },
  { type: 'flame', name: 'Ngọn Lửa 🔥', icon: '🔥', defaultColor: '#EF4444' },
  { type: 'heart', name: 'Trái Tim ❤️', icon: '❤️', defaultColor: '#EC4899' },
  { type: 'lightning', name: 'Tia Chớp ⚡', icon: '⚡', defaultColor: '#39FF14' },
  { type: 'crown', name: 'Vương Miện 👑', icon: '👑', defaultColor: '#FACC15' },
  { type: 'rocket', name: 'Tên Lửa 🚀', icon: '🚀', defaultColor: '#00F0FF' },
  { type: 'paw', name: 'Chân Thú 🐾', icon: '🐾', defaultColor: '#A855F7' },
  { type: 'gamepad', name: 'Tay Game 🎮', icon: '🎮', defaultColor: '#3B82F6' },
];

const RULER_MODELS: RulerModelOption[] = [
  // 1. Nhóm Thước Học Tập & Đồ Án
  {
    id: 'straight-20',
    name: 'Thước Thẳng 20cm (Tiêu chuẩn học tập)',
    category: 'HỌC TẬP & ĐỒ ÁN',
    length: 20,
    width: 3,
    thickness: 0.4,
    basePrice: 45000,
  },
  {
    id: 'straight-30',
    name: 'Thước Thẳng 30cm (Kích thước lớn)',
    category: 'HỌC TẬP & ĐỒ ÁN',
    length: 30,
    width: 3.5,
    thickness: 0.4,
    basePrice: 55000,
  },
  {
    id: 'parabola',
    name: 'Thước Parabol / Đồ Thị Toán Học',
    category: 'HỌC TẬP & ĐỒ ÁN',
    length: 22,
    width: 4.5,
    thickness: 0.4,
    basePrice: 50000,
    badge: 'Thủ Khoa Khối A 🔥',
  },
  {
    id: 'stencil',
    name: 'Thước Stencil (Khuôn Vẽ Hình Geometry)',
    category: 'HỌC TẬP & ĐỒ ÁN',
    length: 20,
    width: 3.8,
    thickness: 0.4,
    basePrice: 52000,
  },
  {
    id: 'eke-combo',
    name: 'Bộ Ê-Ke & Đo Độ Combo (45° & 60°)',
    category: 'HỌC TẬP & ĐỒ ÁN',
    length: 22,
    width: 4.2,
    thickness: 0.4,
    basePrice: 68000,
    badge: 'Best Seller ⭐',
  },
  {
    id: 't-square',
    name: 'Thước Chữ T Kỹ Thuật (Đồ Án Kiến Trúc)',
    category: 'HỌC TẬP & ĐỒ ÁN',
    length: 25,
    width: 3,
    thickness: 0.5,
    basePrice: 65000,
  },

  // 2. Nhóm "Độc Lạ" & Trendy Gen Z (TikTok Viral)
  {
    id: 'katana-sword',
    name: 'Thước Kiếm Katana / Pixel Sword 8-Bit',
    category: 'TRENDY GEN Z (TIKTOK VIRAL)',
    length: 24,
    width: 3.5,
    thickness: 0.45,
    basePrice: 58000,
    badge: 'TikTok Viral 🔥',
  },
  {
    id: 'dino-spine',
    name: 'Thước Gai Khủng Long Dino Spine',
    category: 'TRENDY GEN Z (TIKTOK VIRAL)',
    length: 20,
    width: 3.4,
    thickness: 0.4,
    basePrice: 52000,
  },
  {
    id: 'cat-paw',
    name: 'Thước Đuôi Mèo & Dấu Chân Thú Cưng',
    category: 'TRENDY GEN Z (TIKTOK VIRAL)',
    length: 20,
    width: 3.2,
    thickness: 0.4,
    basePrice: 48000,
  },

  // 3. Nhóm Tiện Ích Đa Năng
  {
    id: 'bookmark',
    name: 'Thước Bookmark (Kẹp Đánh Dấu Trang Sách)',
    category: 'TIỆN ÍCH ĐA NĂNG',
    length: 18,
    width: 2.8,
    thickness: 0.35,
    basePrice: 46000,
  },
  {
    id: 'keychain',
    name: 'Thước Móc Khóa Treo Balo Sinh Viên',
    category: 'TIỆN ÍCH ĐA NĂNG',
    length: 15,
    width: 3.0,
    thickness: 0.45,
    basePrice: 42000,
    badge: 'Không Sợ Quên 🎒',
  },
];

// Font Option Styles
const FONT_OPTIONS = [
  {
    id: 'block',
    name: 'Font Block (Cơ bản / Heavy Bold)',
    fontSize: 0.55,
    letterSpacing: 0.05,
    fontStyle: 'normal',
    transformText: (t: string) => t.toUpperCase(),
  },
  {
    id: 'pixel',
    name: 'Font Pixel (Retro / 8-Bit Game)',
    fontSize: 0.62,
    letterSpacing: 0.18,
    fontStyle: 'normal',
    transformText: (t: string) => `[ ${t.toUpperCase()} ]`,
  },
  {
    id: 'cursive',
    name: 'Font Cursive (Bay bướm / Art Script)',
    fontSize: 0.58,
    letterSpacing: 0.08,
    fontStyle: 'italic',
    transformText: (t: string) => t,
  },
  {
    id: 'stencil',
    name: 'Font Stencil (Kỹ thuật / Tech Military)',
    fontSize: 0.50,
    letterSpacing: 0.22,
    fontStyle: 'normal',
    transformText: (t: string) => `< ${t.toUpperCase()} >`,
  },
];

// 3D Ruler Base Mesh with Flat Bottom (FDM Print Compatible)
function RulerBaseMesh({
  model,
  baseColor,
}: {
  model: RulerModelOption;
  baseColor: string;
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w = model.length;
    const h = model.width;

    if (model.id === 'wave-20') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      for (let x = w / 2; x >= -w / 2; x -= 0.5) {
        const y = h / 2 + Math.sin(x * 1.5) * 0.3;
        s.lineTo(x, y);
      }
      s.closePath();
    } else if (model.id === 'parabola') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      for (let x = w / 2; x >= -w / 2; x -= 0.4) {
        const y = -h / 2 + 0.07 * Math.pow(x, 2);
        s.lineTo(x, Math.min(y, h / 2));
      }
      s.closePath();
    } else if (model.id === 'stencil') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      s.lineTo(-w / 2, h / 2);
      s.closePath();

      const circleHole = new THREE.Path();
      circleHole.absarc(-w / 3, 0, 0.6, 0, Math.PI * 2, true);
      s.holes.push(circleHole);

      const squareHole = new THREE.Path();
      squareHole.moveTo(-0.6, -0.6);
      squareHole.lineTo(0.6, -0.6);
      squareHole.lineTo(0.6, 0.6);
      squareHole.lineTo(-0.6, 0.6);
      squareHole.closePath();
      s.holes.push(squareHole);

      const triHole = new THREE.Path();
      triHole.moveTo(w / 3, -0.6);
      triHole.lineTo(w / 3 + 0.8, 0.6);
      triHole.lineTo(w / 3 - 0.8, 0.6);
      triHole.closePath();
      s.holes.push(triHole);
    } else if (model.id === 'eke-combo') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(-w / 2, h / 2 + 2.5);
      s.closePath();

      const innerTri = new THREE.Path();
      innerTri.moveTo(-w / 2 + 1.2, -h / 2 + 0.8);
      innerTri.lineTo(w / 2 - 2.5, -h / 2 + 0.8);
      innerTri.lineTo(-w / 2 + 1.2, h / 2 + 0.5);
      innerTri.closePath();
      s.holes.push(innerTri);
    } else if (model.id === 'dino-spine') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      for (let x = w / 2; x >= -w / 2; x -= 1.5) {
        s.lineTo(x - 0.4, h / 2 + 0.7);
        s.lineTo(x - 0.8, h / 2);
      }
      s.closePath();
    } else if (model.id === 'katana-sword') {
      s.moveTo(-w / 2 - 1.8, -h / 2);
      s.lineTo(w / 2 - 1, -h / 2);
      s.lineTo(w / 2 + 1.2, 0);
      s.lineTo(w / 2 - 1, h / 2);
      s.lineTo(-w / 2, h / 2);

      s.lineTo(-w / 2 - 0.3, h / 2 + 0.9);
      s.lineTo(-w / 2 - 0.8, h / 2 + 0.9);
      s.lineTo(-w / 2 - 0.8, -h / 2 - 0.9);
      s.lineTo(-w / 2 - 0.3, -h / 2 - 0.9);
      s.lineTo(-w / 2, -h / 2);
      s.closePath();
    } else if (model.id === 'cat-paw') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      for (let x = w / 2; x >= -w / 2 + 3; x -= 0.6) {
        const y = h / 2 + Math.sin(x * 2) * 0.25;
        s.lineTo(x, y);
      }

      s.lineTo(-w / 2 + 2.2, h / 2 + 0.9);
      s.lineTo(-w / 2 + 1.4, h / 2);
      s.lineTo(-w / 2 + 0.8, h / 2 + 0.9);
      s.lineTo(-w / 2, h / 2);
      s.closePath();

      const pawHole = new THREE.Path();
      pawHole.absarc(-w / 2 + 1.5, 0, 0.4, 0, Math.PI * 2, true);
      s.holes.push(pawHole);
    } else if (model.id === 'bookmark') {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      s.lineTo(-w / 2, h / 2);
      s.closePath();

      const clipSlot = new THREE.Path();
      clipSlot.moveTo(w / 2 - 1, -h / 2 + 0.6);
      clipSlot.lineTo(-w / 4, -h / 2 + 0.6);
      clipSlot.lineTo(-w / 4, h / 2 - 0.6);
      clipSlot.lineTo(w / 2 - 1, h / 2 - 0.6);
      clipSlot.closePath();
      s.holes.push(clipSlot);
    } else if (model.id === 'keychain') {
      s.moveTo(-w / 2 - 0.5, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      s.lineTo(-w / 2 - 0.5, h / 2);
      s.closePath();

      const keyHole = new THREE.Path();
      keyHole.absarc(-w / 2 + 0.8, 0, 0.65, 0, Math.PI * 2, true);
      s.holes.push(keyHole);
    } else {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      s.lineTo(-w / 2, h / 2);
      s.closePath();
    }

    return s;
  }, [model]);

  const extrudeSettings = useMemo(
    () => ({
      depth: model.thickness,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    }),
    [model]
  );

  return (
    <group>
      {/* Flat Bottom Main Ruler Extruded Body */}
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* T-Head Bar if T-Square Model */}
      {model.id === 't-square' && (
        <mesh position={[-model.length / 2 - 0.5, model.thickness / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, model.thickness * 1.2, 8]} />
          <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.1} />
        </mesh>
      )}

      {/* Etched 3D Tick Marks Lines along Ruler Edge */}
      <group position={[0, model.thickness + 0.01, model.width / 2 - 0.4]}>
        {Array.from({ length: Math.floor(model.length) + 1 }).map((_, i) => {
          const xPos = -model.length / 2 + i;
          const isMajor = i % 5 === 0;
          const tickLength = isMajor ? 0.8 : 0.4;
          return (
            <mesh key={i} position={[xPos, 0.01, -tickLength / 2]}>
              <boxGeometry args={[0.08, 0.02, tickLength]} />
              <meshStandardMaterial color="#000000" roughness={0.2} />
            </mesh>
          );
        })}

        {/* Major Tick Mark Numbers (0, 5, 10, 15, 20 cm) */}
        {Array.from({ length: Math.floor(model.length / 5) + 1 }).map((_, idx) => {
          const cmVal = idx * 5;
          const xPos = -model.length / 2 + cmVal;
          return (
            <Text
              key={cmVal}
              position={[xPos, 0.03, -1.0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.4}
              color="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {`${cmVal}`}
            </Text>
          );
        })}
      </group>
    </group>
  );
}

// 3D Sticker Mesh (3D Extruded Badges)
function Sticker3DMesh({
  sticker,
  modelThickness,
}: {
  sticker: StickerItem;
  modelThickness: number;
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (sticker.type === 'star') {
      const points = 5;
      const outerR = 0.7;
      const innerR = 0.32;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / points - Math.PI / 2;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
      }
      s.closePath();
    } else if (sticker.type === 'heart') {
      s.moveTo(0, 0.35);
      s.bezierCurveTo(0, 0.65, -0.55, 0.85, -0.75, 0.35);
      s.bezierCurveTo(-0.75, -0.05, -0.3, -0.45, 0, -0.75);
      s.bezierCurveTo(0.3, -0.45, 0.75, -0.05, 0.75, 0.35);
      s.bezierCurveTo(0.55, 0.85, 0, 0.65, 0, 0.35);
      s.closePath();
    } else if (sticker.type === 'lightning') {
      s.moveTo(-0.2, 0.7);
      s.lineTo(0.35, 0.1);
      s.lineTo(0.05, 0.1);
      s.lineTo(0.25, -0.7);
      s.lineTo(-0.3, -0.1);
      s.lineTo(0.0, -0.1);
      s.closePath();
    } else if (sticker.type === 'crown') {
      s.moveTo(-0.6, -0.4);
      s.lineTo(0.6, -0.4);
      s.lineTo(0.7, 0.35);
      s.lineTo(0.35, 0.0);
      s.lineTo(0.0, 0.55);
      s.lineTo(-0.35, 0.0);
      s.lineTo(-0.7, 0.35);
      s.closePath();
    } else if (sticker.type === 'flame') {
      s.moveTo(0, 0.75);
      s.bezierCurveTo(-0.5, 0.3, -0.6, -0.3, 0, -0.75);
      s.bezierCurveTo(0.6, -0.3, 0.5, 0.3, 0, 0.75);
      s.closePath();
    } else if (sticker.type === 'rocket') {
      s.moveTo(0, 0.8);
      s.lineTo(0.3, 0.2);
      s.lineTo(0.5, -0.4);
      s.lineTo(0.2, -0.4);
      s.lineTo(0.2, -0.7);
      s.lineTo(-0.2, -0.7);
      s.lineTo(-0.2, -0.4);
      s.lineTo(-0.5, -0.4);
      s.lineTo(-0.3, 0.2);
      s.closePath();
    } else {
      // Round Paw / Gamepad Badge
      s.absarc(0, 0, 0.55, 0, Math.PI * 2, true);
    }
    return s;
  }, [sticker.type]);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    }),
    []
  );

  const radY = THREE.MathUtils.degToRad(sticker.rotationY);

  return (
    <group
      position={[sticker.posX, modelThickness + 0.02, sticker.posZ]}
      scale={[sticker.scale, sticker.scale, sticker.scale]}
      rotation={[-Math.PI / 2, 0, radY]}
    >
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color={sticker.color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

// Dynamic Freehand Drawing 3D Texture Overlay (Instant WebGL Texture Refresh)
function DrawingOverlay3D({
  canvasElement,
  drawTextureTrigger,
  modelLength,
  modelWidth,
  modelThickness,
}: {
  canvasElement: HTMLCanvasElement | null;
  drawTextureTrigger: number;
  modelLength: number;
  modelWidth: number;
  modelThickness: number;
}) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => {
    if (!canvasElement) return null;
    const tex = new THREE.CanvasTexture(canvasElement);
    tex.needsUpdate = true;
    return tex;
  }, [canvasElement]);
  useEffect(() => { if (materialRef.current?.map) materialRef.current.map.needsUpdate = true; }, [texture, drawTextureTrigger]);
  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh
      position={[0, modelThickness + 0.008, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[modelLength, modelWidth]} />
      <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0.98} depthWrite={false} />
    </mesh>
  );
}

// 3D Embossed Text Mesh Group (Position, Scale & DegToRad Y-Rotation)
function EmbossedText3D({
  name,
  studentId,
  university,
  model,
  plateColor,
  textColor,
  selectedFont,
  plateOffsetX,
  plateOffsetZ,
  plateScaleX,
  plateScaleZ,
  plateRotationY,
  plateStyle = 'box',
  plateThickness = 0.1,
  borderStyle = 'embossed',
}: {
  name: string;
  studentId: string;
  university: string;
  model: RulerModelOption;
  plateColor: string;
  textColor: string;
  selectedFont: string;
  plateOffsetX: number;
  plateOffsetZ: number;
  plateScaleX: number;
  plateScaleZ: number;
  plateRotationY: number;
  plateStyle?: 'box' | 'rounded' | 'hexagon' | 'diamond' | 'none';
  plateThickness?: number;
  borderStyle?: 'none' | 'embossed' | 'beveled';
}) {
  const displayName = name.trim() ? name : 'NGUYỄN VĂN ANH';
  const displayId = studentId.trim() ? `MSSV: ${studentId.trim()}` : 'MSSV: 20210123';
  const displayUni = university.trim() ? university.toUpperCase() : 'ĐẠI HỌC BÁCH KHOA';

  const fontConfig = useMemo(() => {
    return FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];
  }, [selectedFont]);

  const formattedName = fontConfig.transformText(displayName);

  // Dynamic Plate Dimensions based on Scale
  const baseWidth = Math.min(formattedName.length * 0.7 + 3, model.length - 2) * plateScaleX;
  const baseHeight = 1.3 * plateScaleZ;

  const radY = (plateRotationY * Math.PI) / 180;

  // Custom Shape Geometry for Tag Badge
  const plateShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = baseWidth;
    const h = baseHeight;

    if (plateStyle === 'rounded') {
      const r = Math.min(w, h) * 0.35;
      s.moveTo(-w / 2 + r, -h / 2);
      s.lineTo(w / 2 - r, -h / 2);
      s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      s.lineTo(w / 2, h / 2 - r);
      s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      s.lineTo(-w / 2 + r, h / 2);
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      s.lineTo(-w / 2, -h / 2 + r);
      s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      s.closePath();
    } else if (plateStyle === 'hexagon') {
      const c = 0.4;
      s.moveTo(-w / 2 + c, -h / 2);
      s.lineTo(w / 2 - c, -h / 2);
      s.lineTo(w / 2, 0);
      s.lineTo(w / 2 - c, h / 2);
      s.lineTo(-w / 2 + c, h / 2);
      s.lineTo(-w / 2, 0);
      s.closePath();
    } else if (plateStyle === 'diamond') {
      s.moveTo(0, -h / 2 - 0.2);
      s.lineTo(w / 2 + 0.3, 0);
      s.lineTo(0, h / 2 + 0.2);
      s.lineTo(-w / 2 - 0.3, 0);
      s.closePath();
    } else {
      // Box
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      s.lineTo(-w / 2, h / 2);
      s.closePath();
    }

    return s;
  }, [baseWidth, baseHeight, plateStyle]);

  const plateExtrudeSettings = useMemo(
    () => ({
      depth: plateThickness,
      bevelEnabled: borderStyle !== 'none',
      bevelSegments: 2,
      steps: 1,
      bevelSize: borderStyle === 'embossed' ? 0.04 : 0.02,
      bevelThickness: borderStyle === 'embossed' ? 0.03 : 0.01,
    }),
    [plateThickness, borderStyle]
  );

  const textYPos = plateStyle === 'none' ? 0.03 : plateThickness + 0.02;

  return (
    <group
      position={[plateOffsetX, model.thickness + 0.01, plateOffsetZ]}
      rotation={[0, radY, 0]}
    >
      {/* LAYER 2: 3D Raised Plate / Background Badge Mesh */}
      {plateStyle !== 'none' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <extrudeGeometry args={[plateShape, plateExtrudeSettings]} />
          <meshStandardMaterial color={plateColor} roughness={0.35} metalness={0.15} />
        </mesh>
      )}

      {/* LAYER 3: Main Student Name 3D Embossed Text */}
      <Text
        key={selectedFont}
        position={[0, textYPos, -0.25 * plateScaleZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fontConfig.fontSize * Math.min(plateScaleX, 1.2)}
        letterSpacing={fontConfig.letterSpacing}
        fontStyle={fontConfig.fontStyle as 'italic' | 'normal'}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {formattedName}
      </Text>

      {/* Student ID & School Sub-Text */}
      <Text
        position={[0, textYPos, 0.25 * plateScaleZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.35 * Math.min(plateScaleX, 1.2)}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {`${displayId}  •  ${displayUni}`}
      </Text>
    </group>
  );
}

export default function RulerConfigurator() {
  // State 1: Ruler Shape Model
  const [selectedModel, setSelectedModel] = useState<RulerModelOption>(RULER_MODELS[0]);

  // State 2: 3 Independent Color Layers
  const [baseColor, setBaseColor] = useState<string>('#39FF14'); // Layer 1: Thân thước
  const [plateColor, setPlateColor] = useState<string>('#1C1D22'); // Layer 2: Nền biển chữ
  const [textColor, setTextColor] = useState<string>('#FFFFFF'); // Layer 3: Chữ khắc nổi 3D

  // State 3: Text Plate Position, Scale & Rotation + Custom Badge Shape
  const [plateOffsetX, setPlateOffsetX] = useState<number>(0);
  const [plateOffsetZ, setPlateOffsetZ] = useState<number>(-0.2);
  const [plateScaleX, setPlateScaleX] = useState<number>(1.0);
  const [plateScaleZ, setPlateScaleZ] = useState<number>(1.0);
  const [plateRotationY, setPlateRotationY] = useState<number>(0);
  const [plateStyle, setPlateStyle] = useState<'box' | 'rounded' | 'hexagon' | 'diamond' | 'none'>('box');
  const [plateThickness, setPlateThickness] = useState<number>(0.1);
  const [borderStyle, setBorderStyle] = useState<'none' | 'embossed' | 'beveled'>('embossed');

  // State 4: Custom Text & Font
  const [selectedFont, setSelectedFont] = useState<string>('block');
  const [studentName, setStudentName] = useState<string>('Nguyễn Văn Anh');
  const [studentId, setStudentId] = useState<string>('20210123');
  const [university, setUniversity] = useState<string>('ĐHQG TP.HCM');

  // State 5: Production Parameters
  const [infillDensity, setInfillDensity] = useState<number>(30);
  const [materialType, setMaterialType] = useState<string>('PLA Pro+ (Emerald)');

  // State 6: 3D Stickers List
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  // State 7: Freehand Canvas Drawing State & HTML Canvas Element State
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [drawingColor, setDrawingColor] = useState<string>('#39FF14');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawTextureTrigger, setDrawTextureTrigger] = useState<number>(0);

  // Ref for Drawing Canvas Pad & Last Mouse Pos
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawPosRef = useRef<{ x: number; y: number } | null>(null);
  const stickerCounterRef = useRef<number>(1);
  const groupRef = useRef<THREE.Group>(null);

  // Modal & Export States
  const [exportError, setExportError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Initialize Canvas Pad Background & Store Canvas State
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    setDrawingCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Smooth Freehand Stroke Drawing Handler (Live Real-Time Update)
  const handleCanvasMouseDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;
    lastDrawPosRef.current = { x, y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = drawingColor;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
      setDrawTextureTrigger((prev) => prev + 1);
    }
  };

  const handleCanvasMouseMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastDrawPosRef.current) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;

    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = brushSize * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastDrawPosRef.current.x, lastDrawPosRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastDrawPosRef.current = { x, y };
    setDrawTextureTrigger((prev) => prev + 1);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    lastDrawPosRef.current = null;
    setDrawTextureTrigger((prev) => prev + 1);
  };

  // Clear Canvas Pad
  const handleClearCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawTextureTrigger((prev) => prev + 1);
    }
  };

  // Preset Doodle Stamp onto Canvas
  const handleAddStamp = useCallback((stampText: string) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = drawingColor;
    ctx.font = '28px sans-serif';
    ctx.fillText(stampText, 20 + Math.floor(Math.random() * (canvas.width - 60)), 45);
    setDrawTextureTrigger((prev) => prev + 1);
  }, [drawingColor]);

  // Add 3D Sticker to Ruler
  const handleAddSticker = useCallback((presetType: StickerItem['type']) => {
    const found = STICKER_PRESETS.find((s) => s.type === presetType);
    const uniqueId = `stk-${stickerCounterRef.current++}`;
    const newSticker: StickerItem = {
      id: uniqueId,
      type: presetType,
      name: found ? found.name : 'Sticker',
      posX: 0,
      posZ: 0,
      scale: 1.0,
      rotationY: 0,
      color: found ? found.defaultColor : '#FACC15',
    };
    setStickers((prev) => [...prev, newSticker]);
    setActiveStickerId(uniqueId);
  }, []);

  // Update Sticker Item
  const handleUpdateSticker = (id: string, updates: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Remove Sticker
  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((item) => item.id !== id));
    if (activeStickerId === id) setActiveStickerId(null);
  };

  // Reset Plate Transform
  const handleResetPlateTransform = () => {
    setPlateOffsetX(0);
    setPlateOffsetZ(-0.2);
    setPlateScaleX(1.0);
    setPlateScaleZ(1.0);
    setPlateRotationY(0);
  };

  // Multi-Color Printing Surcharge Calculation (Phụ phí dừng máy thay cuộn nhựa)
  const multiColorSurcharge = useMemo(() => {
    let fee = 0;
    if (baseColor.toLowerCase() !== plateColor.toLowerCase()) fee += 10000;
    if (plateColor.toLowerCase() !== textColor.toLowerCase()) fee += 10000;
    if (stickers.length > 0) fee += stickers.length * 5000; // +5.000đ per 3D sticker
    return fee;
  }, [baseColor, plateColor, textColor, stickers]);

  // Total real-time price calculation
  const totalPrice = useMemo(() => {
    let price = selectedModel.basePrice;
    if (infillDensity >= 50) price += 10000;
    if (materialType.includes('PETG')) price += 8000;
    if (materialType.includes('Resin')) price += 15000;
    price += multiColorSurcharge;
    return price;
  }, [selectedModel, infillDensity, materialType, multiColorSurcharge]);

  // STLExporter & Order Action
  const handleConfirmOrder = () => {
    if (!groupRef.current) { setExportError('Mô hình chưa sẵn sàng. Vui lòng chờ tải xong.'); return; }
    setExportError('');
    setIsExporting(true);

    try {
      const exporter = new STLExporter();
      const stlResult = exporter.parse(groupRef.current, { binary: true });

      const blob = new Blob([stlResult.buffer as ArrayBuffer], {
        type: 'application/octet-stream',
      });
      const link = document.createElement('a');
      const filename = `PrintHub_Ruler_${studentName.replace(/\s+/g, '_')}_${studentId || '2021'}.stl`;

      const downloadUrl = URL.createObjectURL(blob);
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      setShowOrderModal(true);
    } catch (err) {
      console.error('Lỗi xuất tệp STL 3D:', err);
      setExportError('Không thể xuất tệp STL. Vui lòng thử lại sau khi mô hình tải xong.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeSticker = stickers.find((s) => s.id === activeStickerId);

  return (
    <div className="w-full flex flex-col xl:flex-row bg-[#0A0A0A] rounded-3xl border border-border overflow-hidden shadow-2xl min-h-[750px]">
      {/* ========================================================================= */}
      {/* 60% VIEWPORT: REAL-TIME 3D CANVAS VIEWPORT */}
      {/* ========================================================================= */}
      <div className="w-full xl:w-[60%] relative min-h-[400px] lg:min-h-[750px] bg-gradient-to-b from-[#18191d] via-[#111215] to-[#0A0A0A] flex flex-col justify-between p-4 border-b lg:border-b-0 lg:border-r border-border">
        {/* Floating Top Badge */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-surface-inset/90 border border-border text-[#39FF14] text-xs font-black flex items-center gap-2 backdrop-blur shadow-lg">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>3D Real-time WebGL Engine (R3F)</span>
          </div>

          <div className="flex items-center gap-2">
            {stickers.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-bold">
                {stickers.length} Sticker 3D
              </span>
            )}
            {multiColorSurcharge > 0 && (
              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-bold">
                + In Đa Màu (+{formatPrice(multiColorSurcharge)}đ)
              </span>
            )}
          </div>
        </div>

        {/* 3D R3F Canvas Viewport */}
        <div className="w-full flex-1 relative flex items-center justify-center cursor-grab active:cursor-grabbing">
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            camera={{ position: [0, 18, 25], fov: 45 }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[15, 25, 15]} intensity={1.5} castShadow />
            <directionalLight position={[-15, -10, -15]} intensity={0.4} />

            <OrbitControls
              makeDefault
              enablePan={true}
              enableZoom={true}
              minDistance={8}
              maxDistance={45}
              maxPolarAngle={Math.PI / 2.05}
            />

            <Center>
              <group ref={groupRef} position={[0, 0, 0]}>
                {/* 1. Base Ruler Extrusion */}
                <RulerBaseMesh model={selectedModel} baseColor={baseColor} />

                {/* 2. Freehand Drawing Texture Overlay */}
                <DrawingOverlay3D
                  canvasElement={drawingCanvas}
                  drawTextureTrigger={drawTextureTrigger}
                  modelLength={selectedModel.length}
                  modelWidth={selectedModel.width}
                  modelThickness={selectedModel.thickness}
                />

                {/* 3. Embossed Student Name Tag */}
                <EmbossedText3D
                  name={studentName}
                  studentId={studentId}
                  university={university}
                  model={selectedModel}
                  plateColor={plateColor}
                  textColor={textColor}
                  selectedFont={selectedFont}
                  plateOffsetX={plateOffsetX}
                  plateOffsetZ={plateOffsetZ}
                  plateScaleX={plateScaleX}
                  plateScaleZ={plateScaleZ}
                  plateRotationY={plateRotationY}
                  plateStyle={plateStyle}
                  plateThickness={plateThickness}
                  borderStyle={borderStyle}
                />

                {/* 4. 3D Stickers Attached on Ruler */}
                {stickers.map((st) => (
                  <Sticker3DMesh
                    key={st.id}
                    sticker={st}
                    modelThickness={selectedModel.thickness}
                  />
                ))}
              </group>
            </Center>
          </Canvas>
        </div>

        {/* Canvas Bottom Dimensions */}
        <div className="relative z-10 flex items-center justify-between text-xs text-text-muted px-2 pt-2 border-t border-border/60">
          <span>🖱️ Xoay 360° &amp; Cuộn chuột để Zoom mô hình 3D</span>
          <span className="font-mono text-[#39FF14]">
            X: {selectedModel.length * 10}mm | Y: {selectedModel.width * 10}mm | Z:{' '}
            {selectedModel.thickness * 10}mm
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 40% VIEWPORT: CONTROL PANEL FORM & STICKY FOOTER */}
      {/* ========================================================================= */}
      <div className="w-full xl:w-[40%] p-6 bg-surface-inset flex flex-col justify-between space-y-5 xl:overflow-y-auto xl:max-h-[750px]">
        <div className="space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-[#39FF14]">
              <Ruler className="w-5 h-5" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Cấu Hình Thước In 3D
              </h2>
            </div>
            <p className="text-sm text-text-muted">
              Tùy biến phôi thước, vẽ thêm nét vẽ cá nhân &amp; dán sticker 3D độc đáo.
            </p>
          </div>

          {/* I. KHU VỰC CHỌN KIỂU DÁNG (<select> DROPDOWN GỌN GÀNG) */}
          <div className="space-y-1.5">
            <label htmlFor="rulerconfigurator-field-1" className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#39FF14]" /> I. Chọn Mẫu Phôi Thước 3D
              </span>
              {selectedModel.badge && (
                <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold text-xs">
                  {selectedModel.badge}
                </span>
              )}
            </label>

            <select id="rulerconfigurator-field-1"
              value={selectedModel.id}
              onChange={(e) => {
                const found = RULER_MODELS.find((m) => m.id === e.target.value);
                if (found) setSelectedModel(found);
              }}
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#39FF14]"
            >
              <optgroup label="📚 NHÓM THƯỚC HỌC TẬP & ĐỒ ÁN">
                {RULER_MODELS.filter((m) => m.category === 'HỌC TẬP & ĐỒ ÁN').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatPrice(m.basePrice)}đ
                  </option>
                ))}
              </optgroup>
              <optgroup label="🔥 NHÓM TRENDY GEN Z (TIKTOK VIRAL)">
                {RULER_MODELS.filter((m) => m.category === 'TRENDY GEN Z (TIKTOK VIRAL)').map(
                  (m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {formatPrice(m.basePrice)}đ
                    </option>
                  )
                )}
              </optgroup>
              <optgroup label="🎒 NHÓM TIỆN ÍCH ĐA NĂNG">
                {RULER_MODELS.filter((m) => m.category === 'TIỆN ÍCH ĐA NĂNG').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatPrice(m.basePrice)}đ
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* II. KHU VỰC TÙY CHỈNH MÀU SẮC (3 INDEPENDENT COLOR LAYERS) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#39FF14]" /> II. Phối 3 Lớp Màu Độc Lập
              </label>
              <span className="text-xs text-text-muted">Xưởng sơn/đổi cuộn nhựa</span>
            </div>

            {/* LAYER 1: Màu Thân Thước */}
            <div className="space-y-1 bg-surface p-3 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: baseColor }} />
                  1. Màu Thân Thước (Base)
                </span>
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Chọn màu tự do"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setBaseColor(c.hex)}
                    className={`w-5 h-5 rounded-full border border-white/20 transition ${
                      baseColor === c.hex ? 'ring-2 ring-[#39FF14] scale-110' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* LAYER 2: Màu Nền Biển Chữ */}
            <div className="space-y-1 bg-surface p-3 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plateColor }} />
                  2. Màu Nền Biển Chữ (Plate)
                </span>
                <input
                  type="color"
                  value={plateColor}
                  onChange={(e) => setPlateColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Chọn màu tự do"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setPlateColor(c.hex)}
                    className={`w-5 h-5 rounded-full border border-white/20 transition ${
                      plateColor === c.hex ? 'ring-2 ring-[#39FF14] scale-110' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* LAYER 3: Màu Chữ Nổi 3D */}
            <div className="space-y-1 bg-surface p-3 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: textColor }} />
                  3. Màu Chữ Nổi 3D (Text)
                </span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Chọn màu tự do"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setTextColor(c.hex)}
                    className={`w-5 h-5 rounded-full border border-white/20 transition ${
                      textColor === c.hex ? 'ring-2 ring-[#39FF14] scale-110' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* III. KHU VỰC TÙY CHỌN MỚI 1: VẼ THÊM TÙY THÍCH (FREEHAND DRAWING CANVAS PAD) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-[#39FF14]" /> III. Vẽ Thêm Tùy Thích Lên Thước (Cập nhật 3D Tức Thì)
              </label>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="text-xs text-red-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Eraser className="w-3 h-3" /> Xóa nét vẽ
              </button>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border space-y-3 text-xs">
              {/* Drawing Pad Canvas */}
              <div className="w-full h-24 bg-[#0A0A0A] rounded-lg border border-border relative overflow-hidden flex items-center justify-center">
                <canvas
                  ref={drawingCanvasRef}
                  width={320}
                  height={80}
                  onPointerDown={handleCanvasMouseDown}
                  onPointerMove={handleCanvasMouseMove}
                  onPointerUp={handleCanvasMouseUp}
                  onPointerCancel={handleCanvasMouseUp}
                  onLostPointerCapture={handleCanvasMouseUp}
                  aria-label="Bảng vẽ tự do trên thước"
                  className="w-full h-full cursor-crosshair touch-none"
                />
                <span className="absolute bottom-1 right-2 text-xs text-slate-500 pointer-events-none">
                  🖊️ Kéo chuột/ngón tay để vẽ tự do
                </span>
              </div>

              {/* Brush Settings & Color Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-300 font-bold">Màu cọ:</span>
                  <input
                    type="color"
                    aria-label="Màu cọ vẽ"
                    value={drawingColor}
                    onChange={(e) => setDrawingColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-300 font-bold">Cỡ cọ:</span>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    aria-label="Kích thước cọ vẽ"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 accent-[#39FF14] bg-surface-inset cursor-pointer"
                  />
                  <span className="font-mono text-xs text-[#39FF14]">{brushSize}px</span>
                </div>
              </div>

              {/* Quick Preset Doodle Stamps */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold block">
                  Dán nhanh họa tiết Doodle:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['❤️', '⭐', '⚡', '👑', '🚀', '🐾', '😊', '🔥', '💀'].map((stamp) => (
                    <button
                      key={stamp}
                      type="button"
                      onClick={() => handleAddStamp(stamp)}
                      className="px-2 py-1 bg-surface-inset border border-border hover:border-[#39FF14] rounded text-xs transition active:scale-95"
                    >
                      {stamp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* IV. KHU VỰC TÙY CHỌN MỚI 2: DÁN STICKER 3D NỔI (3D STICKER BADGE LIBRARY) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sticker className="w-3.5 h-3.5 text-cyan-400" /> IV. Dán Sticker 3D Nổi Lên Thước
              </label>
              <span className="text-xs text-text-muted font-mono">
                {stickers.length} / 5 Sticker
              </span>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border space-y-3 text-xs">
              {/* Sticker Selector Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {STICKER_PRESETS.map((preset) => (
                  <button
                    key={preset.type}
                    type="button"
                    disabled={stickers.length >= 5}
                    onClick={() => handleAddSticker(preset.type)}
                    className="p-2 rounded-xl bg-surface-inset border border-border hover:border-cyan-400 flex flex-col items-center justify-center gap-0.5 text-slate-200 hover:text-white transition active:scale-95 shadow-sm"
                  >
                    <span className="text-base">{preset.icon}</span>
                    <span className="text-xs font-bold truncate w-full text-center">
                      {preset.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Sticker List & Controls */}
              {stickers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold text-cyan-400 block uppercase tracking-wider">
                    Danh Sách Sticker 3D Đã Dán:
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {stickers.map((st) => (
                      <div
                        key={st.id}
                        role="group"
                        aria-label={`Sticker ${st.name}`}
                        className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition ${
                          activeStickerId === st.id
                            ? 'bg-cyan-950/60 border-cyan-400 text-white'
                            : 'bg-surface-inset border-border text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <button type="button" onClick={() => setActiveStickerId(st.id)} aria-pressed={activeStickerId === st.id} className="flex flex-1 items-center gap-2 text-left">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: st.color }}
                          />
                          <span className="font-bold text-xs">{st.name}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSticker(st.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Xóa sticker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Active Sticker Adjustments (Position, Scale, Rotation, Color) */}
                  {activeSticker && (
                    <div className="p-3 bg-surface-inset rounded-xl border border-cyan-900/60 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                        <span>Chỉnh sửa: {activeSticker.name}</span>
                        <input
                          type="color"
                          value={activeSticker.color}
                          onChange={(e) =>
                            handleUpdateSticker(activeSticker.id, { color: e.target.value })
                          }
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          title="Đổi màu sticker 3D"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Position X Slider */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Vị trí ngang (X):</span>
                            <span className="font-mono text-cyan-400">
                              {activeSticker.posX.toFixed(1)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-8"
                            max="8"
                            step="0.2"
                            aria-label="Vị trí ngang sticker"
                    value={activeSticker.posX}
                            onChange={(e) =>
                              handleUpdateSticker(activeSticker.id, {
                                posX: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-cyan-400 bg-surface cursor-pointer"
                          />
                        </div>

                        {/* Position Z Slider */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Vị trí dọc (Z):</span>
                            <span className="font-mono text-cyan-400">
                              {activeSticker.posZ.toFixed(1)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-2"
                            max="2"
                            step="0.1"
                            aria-label="Vị trí dọc sticker"
                    value={activeSticker.posZ}
                            onChange={(e) =>
                              handleUpdateSticker(activeSticker.id, {
                                posZ: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-cyan-400 bg-surface cursor-pointer"
                          />
                        </div>

                        {/* Scale Size Slider */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Kích thước:</span>
                            <span className="font-mono text-cyan-400">
                              {Math.round(activeSticker.scale * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            aria-label="Kích thước sticker"
                    value={activeSticker.scale}
                            onChange={(e) =>
                              handleUpdateSticker(activeSticker.id, {
                                scale: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-cyan-400 bg-surface cursor-pointer"
                          />
                        </div>

                        {/* Rotation Y Slider */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Góc xoay:</span>
                            <span className="font-mono text-cyan-400">
                              {activeSticker.rotationY}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="15"
                            aria-label="Góc xoay sticker"
                    value={activeSticker.rotationY}
                            onChange={(e) =>
                              handleUpdateSticker(activeSticker.id, {
                                rotationY: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-cyan-400 bg-surface cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* V. KHU VỰC VỊ TRÍ, KÍCH THƯỚC & GÓC XOAY BIỂN CHỮ 3D */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-cyan-400" /> V. Vị Trí, Kích Thước &amp; Góc Xoay Biển Chữ 3D
              </label>
              <button
                type="button"
                onClick={handleResetPlateTransform}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại mặc định
              </button>
            </div>

            <div className="space-y-3 p-3 bg-surface rounded-xl border border-border text-xs">
              {/* Position & Scale Sliders Grid - Unrestricted Axes */}
              <div className="grid grid-cols-2 gap-3">
                {/* Position X Offset Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Vị trí ngang (X):</span>
                    <strong className="font-mono text-cyan-400">
                      {plateOffsetX > 0 ? `+${plateOffsetX}` : plateOffsetX}cm
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.1"
                    aria-label="Vị trí ngang biển tên"
                    value={plateOffsetX}
                    onChange={(e) => setPlateOffsetX(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-surface-inset cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>-15cm</span>
                    <span>+15cm</span>
                  </div>
                </div>

                {/* Position Z Offset Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Vị trí dọc (Z):</span>
                    <strong className="font-mono text-cyan-400">
                      {plateOffsetZ > 0 ? `+${plateOffsetZ}` : plateOffsetZ}cm
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="-4.0"
                    max="4.0"
                    step="0.05"
                    aria-label="Vị trí dọc biển tên"
                    value={plateOffsetZ}
                    onChange={(e) => setPlateOffsetZ(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-surface-inset cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>-4.0cm</span>
                    <span>+4.0cm</span>
                  </div>
                </div>

                {/* Width Scale X */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Chiều dài biển:</span>
                    <strong className="font-mono text-cyan-400">{Math.round(plateScaleX * 100)}%</strong>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.05}
                    aria-label="Chiều dài biển tên"
                    value={plateScaleX}
                    onChange={(e) => setPlateScaleX(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-surface-inset cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>20% (Tí hon)</span>
                    <span>300% (Khổng lồ)</span>
                  </div>
                </div>

                {/* Height Scale Z */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Chiều rộng biển:</span>
                    <strong className="font-mono text-cyan-400">{Math.round(plateScaleZ * 100)}%</strong>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.05}
                    aria-label="Chiều rộng biển tên"
                    value={plateScaleZ}
                    onChange={(e) => setPlateScaleZ(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-surface-inset cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>20% (Hẹp)</span>
                    <span>300% (Rộng)</span>
                  </div>
                </div>
              </div>

              {/* Rotation Angle Y Slider & Presets */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-bold text-[#39FF14]">
                    <RotateCw className="w-3.5 h-3.5" /> Góc xoay biển tên (Rotation Y):
                  </span>
                  <strong className="font-mono text-[#39FF14] text-xs">{plateRotationY}°</strong>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  aria-label="Góc xoay biển tên"
                    value={plateRotationY}
                  onChange={(e) => setPlateRotationY(Number(e.target.value))}
                  className="w-full accent-[#39FF14] bg-surface-inset cursor-pointer"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 15, 30, 45, 90, 180, -45, -90].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setPlateRotationY(deg)}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition ${
                        plateRotationY === deg
                          ? 'bg-[#39FF14] text-slate-950 font-black'
                          : 'bg-surface-inset border border-border text-slate-300 hover:border-cyan-400'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VI. KHU VỰC CUSTOM TÙY CHỈNH BIỂN TÊN & FONT CHỮ */}
          <div className="space-y-3 pt-2 border-t border-border">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#39FF14]" /> VI. Custom Kiểu Dáng Biển Tên &amp; Font Chữ
              </span>
              <span className="text-xs text-cyan-300 font-mono">Tùy biến 3D 100%</span>
            </label>

            {/* Kiểu Dáng Khối Biển Tên (Badge Shape) */}
            <div className="space-y-2 p-3 bg-surface rounded-xl border border-border text-xs">
              <span className="text-xs font-bold text-slate-300 block">
                1. Kiểu dáng khối biển tên (Badge Shape):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'box', name: '🟩 Hộp Vuông' },
                  { id: 'rounded', name: '💊 Bo Tròn' },
                  { id: 'hexagon', name: '🛡️ Hexagon' },
                  { id: 'diamond', name: '💎 Kim Cương' },
                  { id: 'none', name: '🚫 Không Nền' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() =>
                      setPlateStyle(st.id as 'box' | 'rounded' | 'hexagon' | 'diamond' | 'none')
                    }
                    className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition ${
                      plateStyle === st.id
                        ? 'bg-[#39FF14] text-slate-950 border-[#39FF14]'
                        : 'bg-surface-inset border-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>

              {/* Border Style Accent & Thickness */}
              {plateStyle !== 'none' && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-bold">2. Độ dày nổi của biển tên:</span>
                    <span className="font-mono text-[#39FF14]">{plateThickness.toFixed(2)}cm</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.02"
                    aria-label="Độ dày biển tên"
                    value={plateThickness}
                    onChange={(e) => setPlateThickness(Number(e.target.value))}
                    className="w-full accent-[#39FF14] bg-surface-inset cursor-pointer"
                  />

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-300 font-bold">3. Gờ viền trang trí:</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'embossed', label: 'Viền Nổi ✨' },
                        { id: 'beveled', label: 'Gờ Chìm 📐' },
                        { id: 'none', label: 'Tối Giản ⚪' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            setBorderStyle(b.id as 'none' | 'embossed' | 'beveled')
                          }
                          className={`px-2 py-0.5 rounded text-xs font-bold border transition ${
                            borderStyle === b.id
                              ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                              : 'bg-surface-inset border-border text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Font Chữ */}
            <select
              aria-label="Kiểu chữ khắc trên thước"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#39FF14]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              <input aria-label="Họ và tên sinh viên (Tối đa 20 ký tự)"
                type="text"
                maxLength={20}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Họ và tên sinh viên (Tối đa 20 ký tự)"
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#39FF14]"
              />

              <div className="grid grid-cols-2 gap-2">
                <input aria-label="MSSV (VD: 20210123)"
                  type="text"
                  maxLength={12}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="MSSV (VD: 20210123)"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#39FF14] font-mono"
                />
                <input aria-label="Tên Trường ĐH"
                  type="text"
                  maxLength={15}
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Tên Trường ĐH"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#39FF14]"
                />
              </div>
            </div>
          </div>

          {/* VII. THÔNG SỐ INFILL % & NHỰA */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
            <div>
              <label htmlFor="rulerconfigurator-field-2" className="text-xs font-bold text-slate-300 block mb-1">
                Mật độ Infill đặc:
              </label>
              <select id="rulerconfigurator-field-2"
                value={infillDensity}
                onChange={(e) => setInfillDensity(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#39FF14]"
              >
                <option value={20}>20% (Tiêu chuẩn)</option>
                <option value={30}>30% (Khuyên dùng đồ án)</option>
                <option value={50}>50% (Siêu bền chịu lực)</option>
                <option value={100}>100% (Đặc nguyên khối)</option>
              </select>
            </div>

            <div>
              <label htmlFor="rulerconfigurator-field-3" className="text-xs font-bold text-slate-300 block mb-1">
                Loại nhựa gia công:
              </label>
              <select id="rulerconfigurator-field-3"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#39FF14]"
              >
                <option value="PLA Pro+ (Emerald)">PLA Pro+ (Chống mẻ)</option>
                <option value="PETG Chịu Nhiệt">PETG Chịu Nhiệt 80°C</option>
                <option value="Resin UV Quang Học">Resin UV Quang Học</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STICKY FOOTER CTA */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-border space-y-3 xl:sticky bottom-0 bg-surface-inset z-20">
          {exportError && <p role="alert" className="text-sm text-red-300">{exportError}</p>}
          {/* Itemized Price Summary */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-text-muted">
              <span>Giá phôi thước ({selectedModel.name.split(' ')[0]}):</span>
              <span>{formatPrice(selectedModel.basePrice)}đ</span>
            </div>
            {stickers.length > 0 && (
              <div className="flex justify-between text-cyan-300 font-bold">
                <span>Phụ phí gia công {stickers.length} Sticker 3D:</span>
                <span>+{formatPrice(stickers.length * 5000)}đ</span>
              </div>
            )}
            {multiColorSurcharge > 0 && (
              <div className="flex justify-between text-purple-300 font-bold">
                <span>Phụ phí gia công in đa màu:</span>
                <span>+{formatPrice(multiColorSurcharge)}đ</span>
              </div>
            )}
            <div className="flex justify-between text-[#39FF14] text-base font-black border-t border-border pt-1">
              <span>TỔNG TIỀN TẠM TÍNH:</span>
              <span className="font-mono text-xl">{formatPrice(totalPrice)}đ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={isExporting}
              className="px-4 py-3 rounded-xl bg-surface border border-[#39FF14]/40 hover:border-[#39FF14] text-[#39FF14] font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Đang tạo STL...' : 'Tải STL'}</span>
            </button>

            {/* BIG PROMINENT CTA BUTTON */}
            <button
              type="button"
              onClick={handleConfirmOrder}
              className="flex-1 py-3.5 rounded-xl bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-xl shadow-emerald-950/80 uppercase tracking-tight"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Xác Nhận &amp; Đặt Hàng Ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHECKOUT ORDER & QR CODE PAYMENT MODAL */}
      {/* ========================================================================= */}
      {showOrderModal && (
        <Modal open={showOrderModal} onClose={() => setShowOrderModal(false)} label="Thông tin thiết kế 3D">
          <div className="bg-surface border border-border rounded-3xl p-6 max-w-md w-full text-xs space-y-5 shadow-2xl relative">
            <button
              aria-label="Đóng thông tin thiết kế"
              onClick={() => setShowOrderModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[#39FF14] mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">ĐÃ ĐẶT HÀNG THƯỚC 3D THÀNH CÔNG!</h3>
              <p className="text-text-muted text-sm">
                Đã tự động đóng gói tệp <strong className="text-[#39FF14]">.STL</strong> và chuyển sang xưởng in BK-Makerlab.
              </p>
            </div>

            {/* Order Details */}
            <div className="p-4 rounded-2xl bg-surface-inset border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Mẫu thước:</span>
                <strong className="text-white">{selectedModel.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Kiểu Font:</span>
                <strong className="text-cyan-300">
                  {FONT_OPTIONS.find((f) => f.id === selectedFont)?.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Khắc tên:</span>
                <strong className="text-[#39FF14]">{studentName} ({studentId})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sticker 3D đã dán:</span>
                <strong className="text-cyan-300">{stickers.length} sticker</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Phối màu (Base / Plate / Text):</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: baseColor }} />
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: plateColor }} />
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: textColor }} />
                </div>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="font-bold text-white">Tổng thanh toán:</span>
                <strong className="text-[#39FF14] font-mono">{formatPrice(totalPrice)}đ</strong>
              </div>
            </div>

            {/* Payment QR Code */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-bold">
                <QrCode className="w-4 h-4" /> Quét Mã VietQR Để Thanh Toán
              </div>
              <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-md">
                <div className="w-full h-full border-2 border-slate-900 rounded-lg flex items-center justify-center font-mono font-black text-slate-900 text-xs">
                  VIETQR 3D
                </div>
              </div>
              <p className="text-sm text-cyan-200">
                Nội dung chuyển khoản: <strong className="text-white font-mono">PRINT3D {studentId}</strong>
              </p>
            </div>

            <button
              onClick={() => setShowOrderModal(false)}
              className="w-full py-3 rounded-xl bg-[#39FF14] hover:bg-emerald-400 text-slate-950 font-black text-xs transition uppercase"
            >
              Hoàn Tất &amp; Theo Dõi Tiến Độ Đơn
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

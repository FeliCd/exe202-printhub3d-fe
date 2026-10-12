// Regenerate after updating the icon libraries: node scripts/generate-sticker-icons.mjs
// Only this curated selection is shipped to the client, not the entire libraries.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as lucide from 'lucide-react';
import * as tabler from '@tabler/icons-react';
import { writeFileSync } from 'node:fs';

const selection = [
  ['Lucide', lucide, [
    ['Heart', 'Trái tim'], ['Star', 'Ngôi sao'], ['Sun', 'Mặt trời'], ['Moon', 'Mặt trăng'],
    ['Cloud', 'Đám mây'], ['Zap', 'Tia chớp'], ['Flame', 'Ngọn lửa'], ['Snowflake', 'Bông tuyết'],
    ['Flower2', 'Bông hoa'], ['Leaf', 'Chiếc lá'], ['Trees', 'Cây xanh'], ['Mountain', 'Núi'],
    ['Cat', 'Mèo'], ['Dog', 'Chó'], ['Bird', 'Chim'], ['Fish', 'Cá'],
    ['Rocket', 'Tên lửa'], ['Plane', 'Máy bay'], ['Bike', 'Xe đạp'], ['Car', 'Ô tô'],
    ['Music', 'Âm nhạc'], ['Camera', 'Máy ảnh'], ['Gamepad2', 'Tay cầm chơi game'], ['Headphones', 'Tai nghe'],
    ['BookOpen', 'Sách'], ['GraduationCap', 'Mũ tốt nghiệp'], ['Pencil', 'Bút chì'], ['Ruler', 'Thước'],
    ['Code', 'Lập trình'], ['Cpu', 'Vi xử lý'], ['Settings', 'Bánh răng'], ['Smile', 'Nụ cười'],
  ]],
  ['Tabler', tabler, [
    ['IconAlien', 'Người ngoài hành tinh'], ['IconRobot', 'Robot'], ['IconUfo', 'Đĩa bay'], ['IconPlanet', 'Hành tinh'],
    ['IconAtom', 'Nguyên tử'], ['IconDna', 'ADN'], ['IconFlask', 'Bình thí nghiệm'], ['IconMathPi', 'Số Pi'],
    ['IconPaw', 'Dấu chân thú'], ['IconButterfly', 'Bướm'], ['IconCactus', 'Xương rồng'], ['IconClover', 'Cỏ bốn lá'],
    ['IconCrown', 'Vương miện'], ['IconDiamond', 'Kim cương'], ['IconTrophy', 'Cúp'], ['IconMedal', 'Huy chương'],
    ['IconBallFootball', 'Bóng đá'], ['IconBallBasketball', 'Bóng rổ'], ['IconChessKnight', 'Quân mã'], ['IconDice5', 'Xúc xắc'],
    ['IconCoffee', 'Cà phê'], ['IconPizza', 'Pizza'], ['IconIceCream', 'Kem'], ['IconCherry', 'Anh đào'],
    ['IconSailboat', 'Thuyền buồm'], ['IconTent', 'Lều'], ['IconCompass', 'La bàn'], ['IconWorld', 'Trái đất'],
    ['IconInfinity', 'Vô cực'], ['IconYinYang', 'Âm dương'], ['IconPeace', 'Hòa bình'], ['IconBolt', 'Sấm sét'],
  ]],
];
const icons = selection.flatMap(([library, exports, items]) => items.map(([name, vi]) => {
  if (!exports[name]) throw new Error(`Missing icon ${name}`);
  const svg = renderToStaticMarkup(createElement(exports[name], { size: 24 }));
  const nodes = [...svg.matchAll(/<(path|circle|ellipse|rect|line|polyline|polygon)\b([^>]*)\/?\s*>/g)]
    .map(([, tag, attributes]) => ({ tag, attrs: Object.fromEntries(
      [...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]),
    ) })).filter(node => node.attrs.stroke !== 'none');
  if (!nodes.length) throw new Error(`Empty icon ${name}`);
  return { id: `${library.toLowerCase()}:${name}`, library, name: name.replace(/^Icon/, '').replace(/([a-z])([A-Z])/g, '$1 $2'), vi, nodes };
}));
writeFileSync(new URL('../src/features/ruler-studio/sticker-icons.json', import.meta.url), JSON.stringify(icons, null, 2) + '\n');
console.log(`Generated ${icons.length} icons`);

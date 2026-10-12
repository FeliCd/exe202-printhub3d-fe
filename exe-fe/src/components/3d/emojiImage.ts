import { emojiAssetKey, singleEmoji } from '../../utils/emoji';

const files = import.meta.glob('../../../node_modules/@twemoji/svg/*.svg', {
  eager: true, query: '?url&no-inline', import: 'default',
}) as Record<string, string>;
const assets = new Map(Object.entries(files).map(([path, url]) => [
  path.split('/').pop()!.replace('.svg', '').replace(/-fe0[ef]/g, ''), url,
]));

export async function prepareEmoji(value: string): Promise<{ emoji: string; canvas: HTMLCanvasElement }> {
  const emoji = singleEmoji(value);
  if (!emoji) throw new Error('Hãy nhập một emoji mỗi lần, ví dụ ❤️ hoặc 👍🏽.');
  const url = assets.get(emojiAssetKey(emoji));
  if (!url) throw new Error('Emoji này chưa được hỗ trợ. Hãy chọn emoji khác.');
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      image.onload = image.onerror = null;
      reject(new Error('Tải emoji quá lâu. Hãy thử lại.'));
    }, 10000);
    image.onload = () => { window.clearTimeout(timeout); resolve(); };
    image.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('Chưa tải được hình emoji. Hãy thử lại.'));
    };
    image.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Không thể tạo hình emoji trên thiết bị này.');
  context.drawImage(image, 8, 8, 240, 240);
  return { emoji, canvas };
}


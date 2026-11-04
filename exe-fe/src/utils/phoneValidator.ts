/**
 * Tiện ích chuẩn hóa và kiểm tra số điện thoại di động Việt Nam chuẩn
 * Quy tắc: 10 chữ số, bắt đầu bằng các đầu mạng 03, 05, 07, 08, 09
 * Hỗ trợ chuẩn hóa định dạng quốc tế +84 hoặc 84 về đầu số 0
 */

export function normalizeVietnamesePhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[\s.-]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

export function isValidVietnamesePhone(phone: string): boolean {
  const normalized = normalizeVietnamesePhone(phone);
  return /^(0[35789])[0-9]{8}$/.test(normalized);
}

export function validatePhoneMessage(phone: string): string | null {
  if (!phone || !phone.trim()) {
    return 'Số điện thoại nhận hàng không được để trống.';
  }
  const normalized = normalizeVietnamesePhone(phone);
  if (!/^\d+$/.test(normalized)) {
    return 'Số điện thoại chỉ được chứa các ký tự số (0-9).';
  }
  if (normalized.length !== 10) {
    return `Số điện thoại phải có đúng 10 chữ số (hiện có ${normalized.length} số).`;
  }
  if (!/^(0[35789])/.test(normalized)) {
    return 'Đầu số không hợp lệ. Vui lòng nhập đầu số mạng Việt Nam (03x, 05x, 07x, 08x, 09x).';
  }
  return null;
}

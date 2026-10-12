/**
 * Format a number as Vietnamese currency string.
 * @example formatPrice(45000) => "45.000"
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN');
}

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
export const money = (value: number) => vnd.format(value);

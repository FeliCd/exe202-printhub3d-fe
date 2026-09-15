/**
 * Format a number as Vietnamese currency string.
 * @example formatPrice(45000) => "45.000"
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN');
}

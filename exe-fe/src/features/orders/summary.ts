export const isActiveProductOrder = (status: string) =>
  !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status);

export const isActiveCustomOrder = (status: string) =>
  ['ACCEPTED', 'PAID', 'PREPARING', 'PRINTING', 'SHIPPING'].includes(status);

export function summarizeOrders(value: unknown) {
  if (!Array.isArray(value) || value.some(order => !order || typeof order.status !== 'string')) return null;
  const count = (status: string) => value.filter(order => order.status.toUpperCase() === status).length;
  return { printing: count('PRINTING'), completed: count('COMPLETED') };
}

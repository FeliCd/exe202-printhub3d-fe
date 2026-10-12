export function summarizeOrders(value: unknown) {
  if (!Array.isArray(value) || value.some(order => !order || typeof order.status !== 'string')) return null;
  const count = (status: string) => value.filter(order => order.status.toUpperCase() === status).length;
  return { printing: count('PRINTING'), completed: count('COMPLETED') };
}

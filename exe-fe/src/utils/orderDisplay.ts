import type { CheckoutOrderDTO } from '../services/checkoutOrderService';
import type { CustomDTO } from '../services/quotationService';

export function uniqueOrderLines<T extends { id: string }>(lines: readonly T[]): T[] {
  return [...new Map(lines.map(line => [line.id, line])).values()];
}

export function checkoutCustomLines(order: CheckoutOrderDTO): CustomDTO[] {
  const lines = new Map<string, CustomDTO>();
  for (const line of [...(order.customOrders ?? []), ...(order.customOrderDetails ?? [])]) {
    lines.set(line.id, { ...lines.get(line.id), ...line });
  }
  return [...lines.values()];
}

export function standaloneCustomLines<T extends { id: string; checkoutOrderId?: string }>(
  lines: readonly T[], parents: readonly CheckoutOrderDTO[], parentsReady: boolean,
): T[] {
  if (!parentsReady) return [];
  const childIds = new Set(parents.flatMap(checkoutCustomLines).map(line => line.id));
  return uniqueOrderLines(lines).filter(line => !line.checkoutOrderId && !childIds.has(line.id));
}

interface DisplayLine {
  id: string;
  quantity?: number;
  status?: string;
}

export function orderDisplay(customLines: readonly DisplayLine[], marketLines: readonly DisplayLine[] = []) {
  const customs = uniqueOrderLines(customLines);
  const markets = uniqueOrderLines(marketLines);
  const activeCustomItems = customs.filter(line => line.status?.toUpperCase() !== 'CANCELLED');
  const activeMarketItems = markets.filter(line => line.status?.toUpperCase() !== 'CANCELLED');
  const cancelledCount = customs.length + markets.length - activeCustomItems.length - activeMarketItems.length;
  const totalCopies = activeCustomItems.reduce((sum, line) => sum + (line.quantity || 1), 0);
  const count = activeCustomItems.length;
  let label = `${count} thiết kế · ${totalCopies} bản`;
  if (!count && !activeMarketItems.length && cancelledCount) label = 'Đã hủy';
  else if (activeMarketItems.length && count) label = `Hỗn hợp · ${activeMarketItems.length} sản phẩm có sẵn · ${count} thiết kế (${totalCopies} bản)`;
  else if (activeMarketItems.length) label = `${activeMarketItems.length} sản phẩm có sẵn`;
  else if (count >= 2) label = `Đơn gộp · ${count} thiết kế · ${totalCopies} bản`;
  return { activeCustomItems, totalCopies, cancelledCount, label };
}

export function checkoutDisplay(order: CheckoutOrderDTO) {
  const markets = (order.marketplaceOrders ?? []).filter(line => !!line && typeof line.id === 'string');
  return orderDisplay(checkoutCustomLines(order), markets);
}

export function checkoutStatus(order: CheckoutOrderDTO) {
  return checkoutDisplay(order).label === 'Đã hủy' ? 'CANCELLED' : order.status;
}

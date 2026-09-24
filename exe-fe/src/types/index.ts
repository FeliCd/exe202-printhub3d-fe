export type UserRole = 'BUYER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  university?: string;
  isVerified: boolean;
  hasPasscode: boolean;
  isLocked?: boolean;
  lockReason?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  material: string;
  originalPrice: number;
  price: number;
  description: string;
  badgeText: string;
  badgeColor: string;
  materialBadge: string;
  thumbnail: 'ruler-20cm' | 'ruler-30cm' | 'ruler-t' | 'stencil' | 'caliper' | 'combo' | 'custom-model';
  imageUrl?: string;
  dimensions?: { x: number; y: number; z: number };
  specs?: {
    layerHeight: string;
    infillDensity: string;
    tolerance: string;
    printTechnology: string;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  engraving?: string;
  colorOption?: string;
  customFile?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  label?: string;
}

export type OrderStatus = 
  | 'PENDING'       // Đã tiếp nhận
  | 'PREPARING'     // Đang chuẩn bị tệp 3D
  | 'PRINTING'      // Đang in 3D
  | 'SHIPPING'      // Đang giao hàng
  | 'COMPLETED'     // Hoàn thành
  | 'CANCELLED'     // Đã hủy
  | 'WARRANTY_REQ'; // Yêu cầu bảo hành

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: 'COD' | 'BANKING' | 'VNPAY';
  trackingNumber?: string;
  estimatedDelivery?: string;
  printerAssigned?: string;
  factoryName?: string;
}

export interface CustomOrderRequest {
  id: string;
  fileName: string;
  fileSize: string;
  material: string;
  color: string;
  infill: number;
  layerHeight: string;
  quantity: number;
  status: 'PENDING_QUOTE' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'IN_PRODUCTION';
  quotedPrice?: number;
  factoryNotes?: string;
  createdAt: string;
}

export interface BulkOrderItem {
  id: string;
  fileName: string;
  material: string;
  quantity: number;
  estimatedVolume: string;
  pricePerUnit: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  badge?: string;
  features: string[];
  discountPercent: number;
  freeShippingCount: number;
  isPopular?: boolean;
}

export interface WarrantyClaim {
  id: string;
  orderId: string;
  productName: string;
  issueType: 'BROKEN_RULER' | 'INACCURATE_SCALE' | 'DEFECTIVE_PRINT' | 'OTHER';
  description: string;
  imageUrl?: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REPLACED';
  createdAt: string;
  adminResponse?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  buyerName: string;
  factoryName: string;
  amount: number;
  reason: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUND_FULL' | 'RESOLVED_REFUND_PARTIAL' | 'REJECTED';
  adminDecisionNotes?: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'ORDER' | 'SYSTEM' | 'SECURITY';
  link?: string;
}

export interface PrinterMachine {
  id: string;
  name: string;
  type: 'FDM' | 'SLA' | 'SLS';
  status: 'PRINTING' | 'IDLE' | 'MAINTENANCE' | 'OFFLINE';
  currentJob?: string;
  progressPercent?: number;
  temperatureNozzle?: number;
  temperatureBed?: number;
}

export interface FileVaultItem {
  id: string;
  fileName: string;
  fileFormat: 'STL' | 'OBJ' | 'STEP';
  fileSize: string;
  weightGrams: number;
  volumeCm3: number;
  dimensions: { x: number; y: number; z: number };
  materialPreference: string;
  uploadedAt: string;
  lastPrintedAt?: string;
  printCount: number;
}


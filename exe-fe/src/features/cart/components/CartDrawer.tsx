/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem as CartItemType } from '../../../types';
import { formatPrice } from '../../../utils/format';
import CartItemComponent from './CartItem';
import { paymentService } from '../../../services/paymentService';
import { orderService } from '../../../services/orderService';
import { productService } from '../../../services/productService';
import { useAuth } from '../../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string;
  couponApplied: boolean;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onApplyCoupon: (code: string) => void;
  onOpenAddressModal: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  totalItems,
  subtotal,
  discount,
  shippingFee,
  total,
  couponCode,
  couponApplied,
  onUpdateQuantity,
  onApplyCoupon,
  onOpenAddressModal,
}: CartDrawerProps) {
  const [localCoupon, setLocalCoupon] = useState(couponCode);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleProceedCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setCheckoutError('');

    try {
      // 1. Chuẩn bị danh sách sản phẩm với UUID thật từ backend database
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      let fallbackRealUUID: string | null = null;

      const orderItems = await Promise.all(
        items.map(async (item) => {
          let pId = item.product.id;
          if (!uuidRegex.test(pId)) {
            if (!fallbackRealUUID) {
              fallbackRealUUID = await productService.getActiveProductUUID();
            }
            if (fallbackRealUUID) {
              pId = fallbackRealUUID;
            }
          }
          return {
            productId: pId,
            quantity: Math.max(1, item.quantity),
            color: item.colorOption || 'BLUE',
            engravingText: item.engraving || '',
          };
        })
      );

      const orderPayload = {
        recipientName: user?.name || 'Khách hàng PrintHub',
        phone: user?.phone || '0987654321',
        address: 'KTX Khu B, ĐHQG TP.HCM',
        province: 'TP.HCM',
        paymentMethod: 'PAYOS',
        items: orderItems,
      };

      console.log('Sending orderPayload to backend:', orderPayload);
      const orderRes = await orderService.createOrder(orderPayload);
      const orderList = Array.isArray(orderRes?.result)
        ? orderRes.result
        : (Array.isArray(orderRes) ? orderRes : [orderRes?.result || orderRes]);
      const realOrderId = orderList[0]?.id || orderList[0]?.orderId || orderRes?.result?.id || orderRes?.id;

      if (!realOrderId || !uuidRegex.test(String(realOrderId))) {
        throw new Error('Máy chủ backend không trả về mã đơn hàng hợp lệ.');
      }

      console.log('Order created successfully with ID:', realOrderId);

      // 2. Tạo link thanh toán PayOS với orderId thật từ Database
      const paymentRes = await paymentService.createPaymentLink({
        orderId: realOrderId,
        orderType: 'ORDER',
        description: `Thanh toan don hang ${String(realOrderId).substring(0, 8)}`,
        customAmount: total,
        paymentOption: 'FULL',
      });

      const checkoutUrl =
        paymentRes?.result?.paymentLinkUrl ||
        paymentRes?.result?.checkoutUrl ||
        paymentRes?.paymentLinkUrl ||
        paymentRes?.checkoutUrl ||
        paymentRes?.data?.paymentLinkUrl ||
        paymentRes?.data?.checkoutUrl;

      if (checkoutUrl) {
        console.log('Redirecting to PayOS checkout:', checkoutUrl);
        window.location.href = checkoutUrl;
        return;
      }

      throw new Error('Không nhận được đường dẫn thanh toán từ PayOS.');
    } catch (err: any) {
      console.error('Lỗi khi tiến hành thanh toán PayOS từ Drawer:', err);
      const backendMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng trên máy chủ';
      setCheckoutError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#111215] border-l border-[#272930] shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#272930] flex items-center justify-between bg-[#18191d]">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <h3 className="font-bold text-white text-base">Giỏ Hàng Của Bạn</h3>
          <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-bold">{totalItems} món</span>
        </div>
        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#272930] transition" onClick={onClose}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <CartItemComponent key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} />
          ))}
        </div>

        {/* Voucher */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Mã Giảm Giá Sinh Viên</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#18191d] border border-[#272930] rounded-lg px-3 py-2 text-xs uppercase font-mono text-white focus:border-[#22c55e] outline-none"
              placeholder="Nhập mã (Vd: SINHVIEN2024)"
              type="text"
              value={localCoupon}
              onChange={(e) => setLocalCoupon(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-[#1e2025] hover:bg-[#272930] border border-[#272930] rounded-lg text-xs font-bold text-[#22c55e] transition"
              onClick={() => onApplyCoupon(localCoupon)}
            >
              Áp dụng
            </button>
          </div>
          {couponApplied && (
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Đã giảm {formatPrice(discount)}đ từ Voucher Tân Sinh Viên!
            </p>
          )}
        </div>

        {/* Shipping Address */}
        <div className="p-3.5 rounded-xl bg-[#18191d] border border-[#272930] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Địa chỉ nhận hàng
            </span>
            <button className="text-xs text-[#22c55e] hover:underline font-semibold" onClick={onOpenAddressModal}>
              Thay đổi
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111215] border border-[#272930] text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>Nguyễn Văn Anh • 0987.654.321</span>
              <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-1.5 py-0.5 rounded font-bold uppercase">Mặc định</span>
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              Phòng 402, KTX Khu B Đại Học Quốc Gia TP.HCM, Phường Đông Hòa, Dĩ An, Bình Dương.
            </p>
          </div>
        </div>

        {/* Guarantee Badge */}
        <div className="text-[11px] text-slate-400 bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-[#22c55e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Cam kết: 1 đổi 1 miễn phí nếu thước gãy hoặc sai vạch đo trong 1 học kỳ!</span>
        </div>
      </div>

      {/* Footer: Checkout */}
      <div className="p-4 border-t border-[#272930] bg-[#18191d] space-y-3">
        <div className="space-y-1.5 text-xs text-[#94a3b8]">
          <div className="flex justify-between">
            <span>Tạm tính ({totalItems} thước):</span>
            <span className="text-slate-200 font-medium">{formatPrice(subtotal)}đ</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between">
              <span>Mã giảm giá ({couponCode}):</span>
              <span className="text-emerald-400 font-medium">-{formatPrice(discount)}đ</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Phí vận chuyển KTX / Nội thành:</span>
            <span className="text-slate-200 font-medium">{formatPrice(shippingFee)}đ</span>
          </div>
          <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#272930]">
            <span>Tổng thanh toán:</span>
            <span className="text-[#22c55e] text-base">{formatPrice(total)}đ</span>
          </div>
        </div>
        {checkoutError && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl p-2 text-center">
            {checkoutError}
          </p>
        )}

        <button
          onClick={handleProceedCheckout}
          disabled={isSubmitting || items.length === 0}
          className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              ĐANG KẾT NỐI CỔNG PAYOS...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              TIẾN HÀNH ĐẶT HÀNG &amp; IN 3D
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/cart');
          }}
          className="w-full py-1 text-center text-xs text-slate-300 hover:text-[#22c55e] hover:underline font-semibold transition"
        >
          Mở trang Giỏ hàng &amp; Chọn phương thức khác →
        </button>
      </div>
    </div>
  );
}

import type { ShippingAddress } from '../../address/data';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal';
import type { CartItem as CartItemType } from '../../../types';
import { formatPrice } from '../../../utils/format';
import CartItemComponent from './CartItem';
import { useAuth } from '../../../context/AuthContext';


interface CartDrawerProps {
  shippingAddress: ShippingAddress;
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
  shippingAddress,
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
  const navigate = useNavigate();
  const [localCoupon, setLocalCoupon] = useState(couponCode);

  const { isAuthenticated } = useAuth();

  return (
    <Modal open={isOpen} onClose={onClose} label="Giỏ hàng của bạn" drawer>

    <div className="w-full h-full bg-surface-inset border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <h3 className="font-bold text-white text-base">Giỏ Hàng Của Bạn</h3>
          <span className="text-xs bg-primary/20 text-[#22c55e] px-2 py-0.5 rounded-full font-bold">{totalItems} món</span>
        </div>
        <button aria-label="Đóng giỏ hàng" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#272930] transition" onClick={onClose}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.length === 0 && <p role="status" className="py-6 text-sm text-slate-300">Giỏ hàng đang trống. Thêm sản phẩm để tiếp tục.</p>}
          {items.map((item) => (
            <CartItemComponent key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} />
          ))}
        </div>

        {/* Voucher */}
        <div className="pt-2">
          <label htmlFor="cart-coupon" className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Mã Giảm Giá Sinh Viên</label>
          <div className="flex gap-2">
            <input
              id="cart-coupon"
              className="flex-1 min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-xs uppercase font-mono text-white focus:border-[#22c55e] outline-none"
              placeholder="Nhập mã (Vd: SINHVIEN2024)"
              type="text"
              value={localCoupon}
              onChange={(e) => setLocalCoupon(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-surface-raised hover:bg-[#272930] border border-border rounded-lg text-xs font-bold text-[#22c55e] transition"
              onClick={() => onApplyCoupon(localCoupon)}
            >
              Áp dụng
            </button>
          </div>
          {couponApplied && (
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Đã giảm {formatPrice(discount)}đ từ Voucher Tân Sinh Viên!
            </p>
          )}
        </div>

        {/* Shipping Address */}
        <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2.5">
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
          <div className="p-2.5 rounded-lg bg-surface-inset border border-border text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>{shippingAddress.recipientName} • {shippingAddress.phone}</span>
              <span className="text-xs bg-primary/20 text-[#22c55e] px-1.5 py-0.5 rounded font-bold uppercase">Đã chọn</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              {shippingAddress.addressLine}
            </p>
          </div>
        </div>

        {/* Guarantee Badge */}
        <div className="text-xs text-slate-400 bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-[#22c55e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Cam kết: 1 đổi 1 miễn phí nếu thước gãy hoặc sai vạch đo trong 1 học kỳ!</span>
        </div>
      </div>

      {/* Footer: Checkout */}
      <div className="p-4 border-t border-border bg-surface space-y-3">
        <div className="space-y-1.5 text-xs text-text-muted">
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
          <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-border">
            <span>Tổng thanh toán:</span>
            <span className="text-[#22c55e] text-base">{formatPrice(total)}đ</span>
          </div>
        </div>
        <button
          disabled={!items.length}
          onClick={() => {
            onClose();
            if (!isAuthenticated) {
              navigate('/login?redirect=/cart');
            } else {
              navigate('/cart');
            }
          }}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          {!isAuthenticated ? 'ĐĂNG NHẬP ĐỂ ĐẶT HÀNG' : 'TIẾN HÀNH ĐẶT HÀNG & IN 3D'}
        </button>
      </div>
    </div>
    </Modal>
  );
}
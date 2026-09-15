import { useState, useCallback } from 'react';
import AppRoutes from './routes';
import CartDrawer from './features/cart/components/CartDrawer';
import AddressModal from './features/address/components/AddressModal';
import LockOverlayModal from './components/LockOverlayModal';
import { useCart } from './features/cart/hooks/useCart';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const cart = useCart();

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openAddressModal = useCallback(() => setAddressModalOpen(true), []);
  const closeAddressModal = useCallback(() => setAddressModalOpen(false), []);

  const handleAddToCart = useCallback(
    (product: Parameters<typeof cart.addToCart>[0]) => {
      cart.addToCart(product);
      setCartOpen(true);
    },
    [cart]
  );

  return (
    <div className="bg-[#0A0A0A] text-slate-100 h-screen overflow-hidden flex flex-col font-sans selection:bg-[#39FF14] selection:text-black">
      <AppRoutes
        cartCount={cart.totalItems}
        onOpenCart={openCart}
        onAddToCart={handleAddToCart}
        onOpenAddressModal={openAddressModal}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        items={cart.items}
        totalItems={cart.totalItems}
        subtotal={cart.subtotal}
        discount={cart.discount}
        shippingFee={cart.shippingFee}
        total={cart.total}
        couponCode={cart.couponCode}
        couponApplied={cart.couponApplied}
        onUpdateQuantity={cart.updateQuantity}
        onApplyCoupon={cart.applyCoupon}
        onOpenAddressModal={openAddressModal}
      />

      <AddressModal isOpen={addressModalOpen} onClose={closeAddressModal} />
      <LockOverlayModal />
    </div>
  );
}

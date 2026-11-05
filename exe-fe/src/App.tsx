import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { read } from './services/api';
import {
  emptyAddress,
  type ShippingAddress,
  loadSelectedAddress,
  saveSelectedAddress,
  getAddressSelectionMode,
  ADDRESS_CHANGED_EVENT,
} from './features/address/data';
import { Notice } from './components/DataUI';
import AppRoutes from './routes';
import CartDrawer from './features/cart/components/CartDrawer';
import AddressModal from './features/address/components/AddressModal';
import LockOverlayModal from './components/LockOverlayModal';
import { useCart } from './features/cart/hooks/useCart';

export default function App() {
  const { user } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const cart = useCart();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(loadSelectedAddress);

  const refreshShippingAddress = useCallback(async () => {
    if (!user) {
      setShippingAddress(emptyAddress);
      return;
    }
    try {
      const rows = await read<ShippingAddress[]>('/addresses');
      if (!rows || rows.length === 0) {
        setShippingAddress(emptyAddress);
        return;
      }
      const mode = getAddressSelectionMode();
      const defaultAddr = rows.find(a => a.isDefault) || rows[0];

      if (mode === 'AUTO_DEFAULT') {
        setShippingAddress(defaultAddr);
        saveSelectedAddress(defaultAddr, 'AUTO_DEFAULT');
      } else {
        const currentSaved = loadSelectedAddress();
        const matched = rows.find(a => a.id === currentSaved.id);
        if (matched) {
          setShippingAddress(matched);
        } else {
          setShippingAddress(defaultAddr);
          saveSelectedAddress(defaultAddr, 'AUTO_DEFAULT');
        }
      }
    } catch {
      // fallback
    }
  }, [user]);

  useEffect(() => {
    refreshShippingAddress();
    const handleAddressEvent = () => {
      refreshShippingAddress();
    };
    window.addEventListener(ADDRESS_CHANGED_EVENT, handleAddressEvent);
    return () => {
      window.removeEventListener(ADDRESS_CHANGED_EVENT, handleAddressEvent);
    };
  }, [refreshShippingAddress]);
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
    <div className="bg-[#0A0A0A] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-[#39FF14] selection:text-black">
      <Notice error={cart.error} />
      <AppRoutes
        cart={cart}
        shippingAddress={shippingAddress}
        cartCount={cart.totalItems}
        onOpenCart={openCart}
        onAddToCart={handleAddToCart}
        onOpenAddressModal={openAddressModal}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        shippingAddress={shippingAddress}
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

      <AddressModal isOpen={addressModalOpen} onClose={closeAddressModal} onSelectAddress={setShippingAddress} />
      <LockOverlayModal />
    </div>
  );
}

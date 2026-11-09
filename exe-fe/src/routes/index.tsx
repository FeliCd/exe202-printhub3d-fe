import { lazy } from 'react';
import type { ShippingAddress } from '../features/address/data';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import type { Product } from '../types';
import type { useCart } from '../features/cart/hooks/useCart';

// Layouts & Guard
import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PageTransition from '../components/PageTransition';

// Auth Pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));

// Buyer & Public Pages
import LandingPage from '../pages/LandingPage';
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const BulkOrderPage = lazy(() => import('../pages/BulkOrderPage'));
const CustomOrderPage = lazy(() => import('../pages/CustomOrderPage'));
const CustomOrderCheckoutPage = lazy(() => import('../pages/CustomOrderCheckoutPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderHistoryPage = lazy(() => import('../pages/OrderHistoryPage'));
const QuotationsPage = lazy(() => import('../pages/QuotationsPage'));
const HelpCenterPage = lazy(() => import('../pages/HelpCenterPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/legal/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('../pages/legal/TermsOfServicePage'));
const PaymentResultPage = lazy(() => import('../pages/PaymentResultPage'));
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'));
const WarrantyPage = lazy(() => import('../pages/WarrantyPage'));
const WarrantyCreatePage = lazy(() => import('../pages/WarrantyCreatePage'));
const DisputesPage = lazy(() => import('../pages/DisputesPage'));
const DisputeCreatePage = lazy(() => import('../pages/DisputeCreatePage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const AddressBookPage = lazy(() => import('../pages/AddressBookPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminSubscriptionsPage = lazy(() => import('../pages/admin/AdminSubscriptionsPage'));
const AdminDisputesPage = lazy(() => import('../pages/admin/AdminDisputesPage'));
const AdminWarrantyPage = lazy(() => import('../pages/admin/AdminWarrantyPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminCustomOrdersPage = lazy(() => import('../pages/admin/AdminCustomOrdersPage'));
const AdminGlobalOrdersPage = lazy(() => import('../pages/admin/AdminGlobalOrdersPage'));
const AdminOrderHistoryPage = lazy(() => import('../pages/admin/AdminOrderHistoryPage'));
const AdminOrderDetailPage = lazy(() => import('../pages/admin/AdminOrderDetailPage'));
const AdminFinancePage = lazy(() => import('../pages/admin/AdminFinancePage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

interface AppRoutesProps {
  shippingAddress: ShippingAddress;
  cart: ReturnType<typeof useCart>;
  cartCount: number;
  onOpenCart: () => void;
  onAddToCart: (product: Product) => void;
  onOpenAddressModal: () => void;
}

export default function AppRoutes({
  cart,
  shippingAddress,
  cartCount,
  onOpenCart,
  onAddToCart,
  onOpenAddressModal,
}: AppRoutesProps) {
  const location = useLocation();

  return (
    <Routes>
      {/* 1. Dedicated Auth Layout Routes (No App Header/Sidebar) */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <PageTransition key="/login">
              <LoginPage />
            </PageTransition>
          </AuthLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthLayout>
            <PageTransition key="/signup">
              <SignupPage />
            </PageTransition>
          </AuthLayout>
        }
      />

      {/* 2. Dedicated Public Marketing Landing Page (No App Header/Sidebar) */}
      <Route
        path="/"
        element={
          <AnimatePresence mode="wait">
            <PageTransition key="landing-page">
              <LandingPage />
            </PageTransition>
          </AnimatePresence>
        }
      />

      {/* 3. Persistent User Layout Group - Header & Sidebar Stay 100% Mounted */}
      <Route
        element={
          <UserLayout
            cartCount={cartCount}
            onOpenCart={onOpenCart}
            onOpenAddressModal={onOpenAddressModal}
          />
        }
      >
        <Route path="/dashboard" element={<Navigate to="/catalog" replace />} />
        <Route path="/app" element={<Navigate to="/catalog" replace />} />

        <Route
          path="/catalog-preview"
          element={<Navigate to={{ pathname: '/catalog', search: location.search, hash: location.hash }} replace />}
        />
        <Route
          path="/catalog/:productId?"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <CatalogPage onAddToCart={onAddToCart} />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/cart"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <CartPage shippingAddress={shippingAddress} cart={cart} onOpenAddressModal={onOpenAddressModal} />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/bulk-order"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <BulkOrderPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/custom"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <CustomOrderPage onAddToCart={onAddToCart} cart={cart} />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route path="/custom-order" element={<Navigate to="/custom" replace />} />
        <Route
          path="/custom/checkout"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <CustomOrderCheckoutPage
                    shippingAddress={shippingAddress}
                    onOpenAddressModal={onOpenAddressModal}
                  />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderKey?"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <OrdersPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history/:orderKey?"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <OrderHistoryPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route path="/file-vault" element={<Navigate to="/quotations" replace />} />
        <Route
          path="/quotations/:requestId?"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <QuotationsPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <PrivacyPolicyPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/terms"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <TermsOfServicePage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/help-center" 
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <HelpCenterPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/payment-result"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <PaymentResultPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/payment-cancel"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <PaymentResultPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <SubscriptionsPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warranty/create"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <WarrantyCreatePage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warranty/:claimId?"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <WarrantyPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disputes/create"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <DisputeCreatePage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disputes/:disputeId?"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <DisputesPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <ProfilePage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <AddressBookPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 4. Persistent Admin Layout Group - Header & AdminSidebar Stay 100% Mounted */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout cartCount={cartCount} onOpenCart={onOpenCart} />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin/dashboard"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminDashboardPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminUsersPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminProductsPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminReviewsPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminCategoriesPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/custom-orders"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminCustomOrdersPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminGlobalOrdersPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminOrderDetailPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/order-history"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminOrderHistoryPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminFinancePage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/factories"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/production"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/subscriptions"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminSubscriptionsPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminDisputesPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/warranty"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminWarrantyPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminSettingsPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
      </Route>

      {/* Redirect factory routes to catalog */}
      <Route path="/factory/*" element={<Navigate to="/catalog" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

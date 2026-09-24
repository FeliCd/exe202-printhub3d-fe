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
const CatalogPreviewPage = lazy(() => import('../pages/CatalogPreviewPage'));
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const BulkOrderPage = lazy(() => import('../pages/BulkOrderPage'));
const CustomOrderPage = lazy(() => import('../pages/CustomOrderPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderHistoryPage = lazy(() => import('../pages/OrderHistoryPage'));
const FileVaultPage = lazy(() => import('../pages/FileVaultPage'));
const QuotationsPage = lazy(() => import('../pages/QuotationsPage'));
const HelpCenterPage = lazy(() => import('../pages/HelpCenterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PaymentResultPage = lazy(() => import('../pages/PaymentResultPage'));
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'));
const WarrantyPage = lazy(() => import('../pages/WarrantyPage'));
const DisputesPage = lazy(() => import('../pages/DisputesPage'));
const Ruler3DPage = lazy(() => import('../pages/Ruler3DPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductionPage = lazy(() => import('../pages/admin/AdminProductionPage'));
const AdminSubscriptionsPage = lazy(() => import('../pages/admin/AdminSubscriptionsPage'));
const AdminDisputesPage = lazy(() => import('../pages/admin/AdminDisputesPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminGlobalOrdersPage = lazy(() => import('../pages/admin/AdminGlobalOrdersPage'));
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key="/dashboard">
                  <DashboardPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/catalog-preview"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <CatalogPreviewPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/catalog"
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
                <CustomOrderPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/orders"
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
          path="/order-history"
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
        <Route
          path="/file-vault"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <FileVaultPage />
                </PageTransition>
              </AnimatePresence>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations"
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
          path="/warranty"
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
          path="/disputes"
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
          path="/ruler-3d"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Ruler3DPage />
              </PageTransition>
            </AnimatePresence>
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
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminProductionPage />
              </PageTransition>
            </AnimatePresence>
          }
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

      {/* Redirect factory routes to home/dashboard */}
      <Route path="/factory/*" element={<Navigate to="/dashboard" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

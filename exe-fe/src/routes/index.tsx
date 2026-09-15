import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import type { Product } from '../types';

// Layouts & Guard
import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import FactoryLayout from '../layouts/FactoryLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PageTransition from '../components/PageTransition';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';

// Buyer & Public Pages
import LandingPage from '../pages/LandingPage';
import CatalogPreviewPage from '../pages/CatalogPreviewPage';
import CatalogPage from '../pages/CatalogPage';
import CartPage from '../pages/CartPage';
import BulkOrderPage from '../pages/BulkOrderPage';
import CustomOrderPage from '../pages/CustomOrderPage';
import OrdersPage from '../pages/OrdersPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import FileVaultPage from '../pages/FileVaultPage';
import QuotationsPage from '../pages/QuotationsPage';
import HelpCenterPage from '../pages/HelpCenterPage';
import WalletPage from '../pages/WalletPage';
import PaymentResultPage from '../pages/PaymentResultPage';
import SubscriptionsPage from '../pages/SubscriptionsPage';
import WarrantyPage from '../pages/WarrantyPage';
import DisputesPage from '../pages/DisputesPage';
import Ruler3DPage from '../pages/Ruler3DPage';
import ProfilePage from '../pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductionPage from '../pages/admin/AdminProductionPage';
import AdminSubscriptionsPage from '../pages/admin/AdminSubscriptionsPage';
import AdminDisputesPage from '../pages/admin/AdminDisputesPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminGlobalOrdersPage from '../pages/admin/AdminGlobalOrdersPage';
import AdminFinancePage from '../pages/admin/AdminFinancePage';
import AdminFactoriesPage from '../pages/admin/AdminFactoriesPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Factory / Maker Pages
import FactoryDashboardPage from '../pages/factory/FactoryDashboardPage';
import FactoryOrdersPage from '../pages/factory/FactoryOrdersPage';
import FactoryPrintersPage from '../pages/factory/FactoryPrintersPage';
import FactoryPackingPage from '../pages/factory/FactoryPackingPage';
import FactoryGCodePage from '../pages/factory/FactoryGCodePage';
import FactoryQCPage from '../pages/factory/FactoryQCPage';
import FactoryMaintenancePage from '../pages/factory/FactoryMaintenancePage';
import FactoryInventoryPage from '../pages/factory/FactoryInventoryPage';

interface AppRoutesProps {
  cartCount: number;
  onOpenCart: () => void;
  onAddToCart: (product: Product) => void;
  onOpenAddressModal: () => void;
}

export default function AppRoutes({
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

      {/* 2. Persistent User Layout Group - Header & Sidebar Stay 100% Mounted */}
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
          path="/"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <LandingPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
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
                <CartPage onOpenAddressModal={onOpenAddressModal} />
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
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <OrdersPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/order-history"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <OrderHistoryPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/file-vault"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FileVaultPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/quotations"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <QuotationsPage />
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
          path="/wallet"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <WalletPage />
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
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <SubscriptionsPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/warranty"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <WarrantyPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/disputes"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <DisputesPage />
              </PageTransition>
            </AnimatePresence>
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
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <ProfilePage />
              </PageTransition>
            </AnimatePresence>
          }
        />
      </Route>

      {/* 3. Persistent Admin Layout Group - Header & AdminSidebar Stay 100% Mounted */}
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
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <AdminFactoriesPage />
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
      </Route>

      {/* 4. Persistent Factory Layout Group - Header & FactorySidebar Stay 100% Mounted */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['FACTORY', 'ADMIN']}>
            <FactoryLayout cartCount={cartCount} onOpenCart={onOpenCart} />
          </ProtectedRoute>
        }
      >
        <Route
          path="/factory/dashboard"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryDashboardPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/orders"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryOrdersPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/printers"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryPrintersPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/packing"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryPackingPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/gcode"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryGCodePage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/qc"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryQCPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/maintenance"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryMaintenancePage />
              </PageTransition>
            </AnimatePresence>
          }
        />
        <Route
          path="/factory/inventory"
          element={
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <FactoryInventoryPage />
              </PageTransition>
            </AnimatePresence>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

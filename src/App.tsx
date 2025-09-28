import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/Products";
import ProductFormPage from "./pages/ProductForm";
import Checkout from "./pages/Checkout";
import PurchaseHistory from "./pages/PurchaseHistory";
import OrderManagement from "./pages/OrderManagement";
import ProtectedRoute from "./components/protected-route";
import { CartProvider } from "./contexts/CartContext";
import { CheckoutProvider } from "./contexts/CheckoutContext";
import { PurchaseHistoryProvider } from "./contexts/PurchaseHistoryContext";
import { OrderManagementProvider } from "./contexts/OrderManagementContext";

function App() {
  return (
    <CartProvider>
      <CheckoutProvider>
        <PurchaseHistoryProvider>
          <OrderManagementProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />

              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="catalogo" element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductsPage />
                  </ProtectedRoute>
                } />
                <Route path="catalogo/novo" element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductFormPage />
                  </ProtectedRoute>
                } />
                <Route path="catalogo/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductFormPage />
                  </ProtectedRoute>
                } />
                <Route path="historico-compras" element={<PurchaseHistory />} />
                <Route path="gestao-pedidos" element={
                  <ProtectedRoute requiredRole="admin">
                    <OrderManagement />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </OrderManagementProvider>
        </PurchaseHistoryProvider>
      </CheckoutProvider>
    </CartProvider>
  );
}

export default App;

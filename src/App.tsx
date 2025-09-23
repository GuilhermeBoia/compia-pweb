import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/Products";
import ProductFormPage from "./pages/ProductForm";
import ProtectedRoute from "./components/protected-route";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;

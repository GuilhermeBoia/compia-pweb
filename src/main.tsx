import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { OrderProvider } from "./contexts/OrderContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

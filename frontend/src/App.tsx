import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { GuestRoute } from "./components/GuestRoute";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { AuthProvider } from "./context/AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrderCreatePage } from "./pages/OrderCreatePage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductsPage } from "./pages/ProductsPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route element={<RoleRoute roles={["warehouse_manager"]} />}>
                <Route path="/products" element={<ProductsPage />} />
              </Route>
              <Route
                element={<RoleRoute roles={["logistic", "employee"]} />}
              >
                <Route path="/orders" element={<OrdersPage />} />
              </Route>
              <Route element={<RoleRoute roles={["employee"]} />}>
                <Route path="/orders/new" element={<OrderCreatePage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

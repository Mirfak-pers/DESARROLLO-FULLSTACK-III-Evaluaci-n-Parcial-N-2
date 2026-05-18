import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Pedidos from "./pages/Pedidos";
import Envios from "./pages/Envios";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="envios" element={<Envios />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ProtectedRoute>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Pedidos from "./pages/Pedidos";
import Envios from "./pages/Envios";
import NotFound from "./pages/NotFound";

function App({ keycloak, authenticated }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout keycloak={keycloak} authenticated={authenticated} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="envios" element={<Envios />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
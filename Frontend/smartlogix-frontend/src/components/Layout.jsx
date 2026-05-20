import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout({ keycloak, authenticated }) {
  return (
    <div>
      <Navbar keycloak={keycloak} authenticated={authenticated} />
      <main className="contenedor">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
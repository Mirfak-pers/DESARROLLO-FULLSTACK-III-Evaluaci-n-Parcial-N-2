import { Link } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

function Navbar() {
  const { user, roles, logout } = useAuth();
  const username = user?.preferred_username || user?.name || "Usuario";

  return (
    <nav className="navbar">
      <Link to="/" className="brand-logo">
        SmartLogix
      </Link>

      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/pedidos">Pedidos</Link>
        <Link to="/envios">Envíos</Link>
      </div>

      <div className="user-box">
        <UserRound size={17} />
        <div>
          <strong>{username}</strong>
          <span>{roles.filter((rol) => ["admin", "docente", "estudiante"].includes(rol)).join(" / ") || "sin rol"}</span>
        </div>
        <button className="logout-button" onClick={logout} title="Cerrar sesión">
          <LogOut size={17} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

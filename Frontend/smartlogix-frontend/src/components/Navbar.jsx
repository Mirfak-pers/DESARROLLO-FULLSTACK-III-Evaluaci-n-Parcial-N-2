import { Link } from "react-router-dom";

function Navbar() {
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
    </nav>
  );
}

export default Navbar;
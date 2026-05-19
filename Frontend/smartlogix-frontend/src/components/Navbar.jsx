import { Link } from "react-router-dom";

function Navbar({ keycloak, authenticated }) {
  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    localStorage.removeItem("kc_token");
    keycloak.logout({
      redirectUri: "http://localhost:5173",
    });
  };

  const username =
    keycloak?.tokenParsed?.preferred_username ||
    keycloak?.tokenParsed?.name ||
    "Usuario";

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

        {!authenticated ? (
          <button className="login-btn" onClick={login}>
            Iniciar sesión
          </button>
        ) : (
          <div className="user-box">
            <span className="user-name">{username}</span>
            <button className="login-btn logout-btn" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
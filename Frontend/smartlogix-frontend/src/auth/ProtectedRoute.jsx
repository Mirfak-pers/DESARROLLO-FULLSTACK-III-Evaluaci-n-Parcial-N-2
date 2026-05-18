import { ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ children }) {
  const { initialized, authenticated, login, authError } = useAuth();

  if (!initialized) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <ShieldCheck size={42} />
          <h1>Cargando seguridad...</h1>
          <p>Conectando con Keycloak.</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <ShieldCheck size={48} />
          <span className="tag">SmartLogix seguro</span>
          <h1>No se pudo conectar con Keycloak</h1>
          <p>
            Revisa que Keycloak esté levantado en http://localhost:8080, que el realm sea
            smartlogix y que el cliente smartlogix-app tenga redirect URI http://localhost:5173/*.
          </p>
          <button className="btn-primary" onClick={login}>
            Reintentar login
          </button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <ShieldCheck size={48} />
          <span className="tag">SmartLogix seguro</span>
          <h1>Sesión no iniciada</h1>
          <p>
            Debes autenticarte en Keycloak antes de entrar al dashboard, inventario, pedidos o envíos.
          </p>
          <button className="btn-primary" onClick={login}>
            Iniciar sesión con Keycloak
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;

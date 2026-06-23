import { Link } from "react-router-dom";
import { Boxes, ClipboardList, Truck, ArrowRight, Users } from "lucide-react";

function Dashboard() {
  return (
    <section className="dashboard">
      <div className="hero">
        <div>
          <span className="tag">Sistema logístico eCommerce</span>
          <h1>Panel principal SmartLogix</h1>
          <p>
            Gestiona inventario, pedidos, envíos y usuarios desde una plataforma
            moderna, ordenada y conectada al backend mediante API REST.
          </p>
        </div>

        <div className="hero-card">
          <h3>Resumen general</h3>
          <p>Operación logística centralizada</p>

          <div className="hero-stats">
            <div>
              <strong>4</strong>
              <span>Módulos</span>
            </div>
            <div>
              <strong>API</strong>
              <span>REST</span>
            </div>
            <div>
              <strong>JPA</strong>
              <span>Persistencia</span>
            </div>
          </div>
        </div>
      </div>

      <div className="module-grid">
        <Link to="/inventario" className="module-card">
          <div className="module-icon inventario-icon">
            <Boxes size={34} />
          </div>

          <div>
            <h3>Inventario</h3>
            <p>Consulta productos, stock disponible y registra nuevos artículos.</p>
          </div>

          <div className="module-action">
            Entrar <ArrowRight size={18} />
          </div>
        </Link>

        <Link to="/pedidos" className="module-card">
          <div className="module-icon pedidos-icon">
            <ClipboardList size={34} />
          </div>

          <div>
            <h3>Pedidos</h3>
            <p>Crea pedidos, consulta estados y valida el flujo de aprobación.</p>
          </div>

          <div className="module-action">
            Entrar <ArrowRight size={18} />
          </div>
        </Link>

        <Link to="/envios" className="module-card">
          <div className="module-icon envios-icon">
            <Truck size={34} />
          </div>

          <div>
            <h3>Envíos</h3>
            <p>Coordina despachos, transportistas y estados de entrega.</p>
          </div>

          <div className="module-action">
            Entrar <ArrowRight size={18} />
          </div>
        </Link>

        <Link to="/usuarios" className="module-card">
          <div className="module-icon usuarios-icon">
            <Users size={34} />
          </div>

          <div>
            <h3>Usuarios</h3>
            <p>Administra usuarios, roles y registros asociados al sistema.</p>
          </div>

          <div className="module-action">
            Entrar <ArrowRight size={18} />
          </div>
        </Link>
      </div>
    </section>
  );
}

export default Dashboard;
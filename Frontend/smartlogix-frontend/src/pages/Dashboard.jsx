function Dashboard() {
  return (
    <section>
      <h1>Panel principal SmartLogix</h1>
      <p>
        Plataforma para gestionar inventario, pedidos y envíos de una PYME de
        eCommerce.
      </p>

      <div className="grid">
        <div className="card">
          <h3>Inventario</h3>
          <p>Consulta productos y stock disponible.</p>
        </div>

        <div className="card">
          <h3>Pedidos</h3>
          <p>Crea pedidos y revisa su estado.</p>
        </div>

        <div className="card">
          <h3>Envíos</h3>
          <p>Consulta el estado de los despachos.</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
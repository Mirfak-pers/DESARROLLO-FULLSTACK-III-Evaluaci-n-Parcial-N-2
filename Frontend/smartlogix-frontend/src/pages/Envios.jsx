import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Search, Truck } from "lucide-react";
import { crearEnvio, obtenerEnvios } from "../services/enviosService";
import { obtenerPedidos } from "../services/pedidosService";

function Envios() {
  const [envios, setEnvios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    pedidoId: "",
    direccion: "",
    transportista: "",
    fechaEstimada: "",
  });

  const cargarEnvios = async () => {
    try {
      const data = await obtenerEnvios();
      setEnvios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar envíos", error);
      alert("No se pudieron cargar los envíos. Verifica el BFF y Keycloak.");
    }
  };

  const cargarPedidos = async () => {
    try {
      const data = await obtenerPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar pedidos", error);
      alert("No se pudieron cargar los pedidos para crear envíos.");
    }
  };

  useEffect(() => {
    cargarEnvios();
    cargarPedidos();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.pedidoId || !form.direccion || !form.transportista) {
      alert("Completa los campos obligatorios");
      return;
    }

    if (Number(form.pedidoId) <= 0) {
      alert("El ID del pedido debe ser mayor a 0");
      return;
    }

    try {
      await crearEnvio({
        pedidoId: Number(form.pedidoId),
        direccion: form.direccion,
        transportista: form.transportista,
        fechaEstimada: form.fechaEstimada,
      });

      setForm({
        pedidoId: "",
        direccion: "",
        transportista: "",
        fechaEstimada: "",
      });

      cargarEnvios();
    } catch (error) {
      console.error("Error al crear envío", error);
      alert("No se pudo crear el envío. Verifica que el pedido esté aprobado.");
    }
  };

  const enviosFiltrados = envios.filter((envio) => {
    const texto = `${envio.id} ${envio.pedidoId} ${envio.direccion} ${envio.transportista} ${envio.estado}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const pedidosAprobados = pedidos.filter((pedido) => pedido.estado === "APROBADO");

  return (
    <section className="page-panel">
      <div className="page-header">
        <div className="page-title">
          <div className="title-icon">
            <Truck size={26} />
          </div>
          <div>
            <h1>Envíos</h1>
            <p>Coordinación de despachos, transportistas y entregas.</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={cargarEnvios}>
            <RefreshCcw size={17} />
            Actualizar
          </button>

          <button className="btn-primary" type="submit" form="envioForm">
            <Plus size={17} />
            Nuevo envío
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Total envíos</span>
          <strong>{envios.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pedidos aprobados</span>
          <strong>{pedidosAprobados.length}</strong>
        </div>

        <div className="stat-card">
          <span>Entregados</span>
          <strong>
            {envios.filter((envio) => envio.estado === "ENTREGADO").length}
          </strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Buscar por ID de pedido, dirección, transportista o estado"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <form id="envioForm" className="formulario panel-form envios-form" onSubmit={handleSubmit}>
        <select name="pedidoId" value={form.pedidoId} onChange={handleChange}>
          <option value="">Selecciona ID de pedido aprobado</option>
          {pedidosAprobados.map((pedido) => (
            <option key={pedido.id} value={pedido.id}>
              Pedido ID #{pedido.id} - {pedido.cliente}
            </option>
          ))}
        </select>

        <input
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
        />

        <input
          name="transportista"
          placeholder="Transportista"
          value={form.transportista}
          onChange={handleChange}
        />

        <input
          name="fechaEstimada"
          type="date"
          value={form.fechaEstimada}
          onChange={handleChange}
        />
      </form>

      <div className="info-box">
        Para crear un envío, primero aprueba un pedido en el módulo Pedidos. Aquí se muestra explícitamente el ID del pedido aprobado.
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Listado de envíos</h3>
          <span>{enviosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID Envío</th>
              <th>ID Pedido</th>
              <th>Dirección</th>
              <th>Transportista</th>
              <th>Fecha estimada</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {enviosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  No hay envíos registrados
                </td>
              </tr>
            ) : (
              enviosFiltrados.map((envio) => (
                <tr key={envio.id}>
                  <td>
                    <strong>#{envio.id}</strong>
                  </td>
                  <td>
                    <strong>Pedido #{envio.pedidoId}</strong>
                  </td>
                  <td>{envio.direccion}</td>
                  <td>{envio.transportista}</td>
                  <td>{envio.fechaEstimada || "Sin fecha"}</td>
                  <td>
                    <span
                      className={
                        envio.estado === "ENTREGADO"
                          ? "badge badge-success"
                          : envio.estado === "INCIDENCIA"
                          ? "badge badge-danger"
                          : "badge badge-warning"
                      }
                    >
                      {envio.estado || "PENDIENTE"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Envios;

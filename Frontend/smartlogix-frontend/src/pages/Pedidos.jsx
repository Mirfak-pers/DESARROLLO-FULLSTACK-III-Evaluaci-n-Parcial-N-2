import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCcw, Search, X } from "lucide-react";
import {
  aprobarPedido,
  crearPedido,
  obtenerPedidos,
} from "../services/pedidosService";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ cliente: "", productoId: "", cantidad: "" });

  // Modal de aprobación
  const [modalAprobar, setModalAprobar] = useState(null); // null o pedidoId
  const [envioForm, setEnvioForm] = useState({
    direccionDestino: "",
    ciudadDestino: "",
    regionDestino: "",
    transportista: "",
  });

  const cargarPedidos = async () => {
    try {
      const data = await obtenerPedidos();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos", error);
    }
  };

  useEffect(() => { cargarPedidos(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEnvioChange = (e) => setEnvioForm({ ...envioForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cliente || !form.productoId || !form.cantidad) {
      alert("Completa todos los campos");
      return;
    }
    try {
      await crearPedido({
        cliente: form.cliente,
        items: [{ productoId: Number(form.productoId), cantidad: Number(form.cantidad) }],
      });
      setForm({ cliente: "", productoId: "", cantidad: "" });
      cargarPedidos();
    } catch (error) {
      console.error("Error al crear pedido", error);
      alert("No se pudo crear el pedido");
    }
  };

  const abrirModalAprobar = (id) => {
    setModalAprobar(id);
    setEnvioForm({ direccionDestino: "", ciudadDestino: "", regionDestino: "", transportista: "" });
  };

  const confirmarAprobacion = async () => {
    if (!envioForm.direccionDestino || !envioForm.ciudadDestino || !envioForm.regionDestino) {
      alert("Dirección, ciudad y región son obligatorios");
      return;
    }
    try {
      await aprobarPedido(modalAprobar, envioForm);
      setModalAprobar(null);
      cargarPedidos();
    } catch (error) {
      console.error("Error al aprobar pedido", error);
      alert("No se pudo aprobar el pedido.");
    }
  };

  const pedidosFiltrados = pedidos.filter((p) =>
    `${p.id} ${p.cliente} ${p.estado}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <section className="page-panel">
      <div className="page-header">
        <div className="page-title">
          <div className="title-icon"><ClipboardList size={26} /></div>
          <div>
            <h1>Pedidos</h1>
            <p>Creación, validación y seguimiento de pedidos.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={cargarPedidos}>
            <RefreshCcw size={17} /> Actualizar
          </button>
          <button className="btn-primary" type="submit" form="pedidoForm">
            <Plus size={17} /> Nuevo pedido
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Total pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pendientes</span>
          <strong>{pedidos.filter((p) => p.estado !== "APROBADO").length}</strong>
        </div>
        <div className="stat-card">
          <span>Aprobados</span>
          <strong>{pedidos.filter((p) => p.estado === "APROBADO").length}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Buscar por cliente, ID o estado"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <form id="pedidoForm" className="formulario panel-form pedidos-form" onSubmit={handleSubmit}>
        <input name="cliente" placeholder="Cliente" value={form.cliente} onChange={handleChange} />
        <input name="productoId" type="number" placeholder="ID Producto" value={form.productoId} onChange={handleChange} />
        <input name="cantidad" type="number" placeholder="Cantidad" value={form.cantidad} onChange={handleChange} />
      </form>

      <div className="table-card">
        <div className="table-header">
          <h3>Listado de pedidos</h3>
          <span>{pedidosFiltrados.length} resultados</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr><td colSpan="4" className="empty-row">No hay pedidos registrados</td></tr>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td><strong>#{pedido.id}</strong></td>
                  <td>{pedido.cliente}</td>
                  <td>
                    <span className={
                      pedido.estado === "APROBADO" ? "badge badge-success" :
                      pedido.estado === "RECHAZADO" ? "badge badge-danger" : "badge badge-warning"
                    }>
                      {pedido.estado}
                    </span>
                  </td>
                  <td>
                    {pedido.estado !== "APROBADO" && pedido.estado !== "RECHAZADO" && (
                      <button className="btn-small" onClick={() => abrirModalAprobar(pedido.id)}>
                        Aprobar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DATOS DE ENVÍO */}
      {modalAprobar && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e2433", borderRadius: "12px", padding: "2rem",
            width: "100%", maxWidth: "440px", position: "relative"
          }}>
            <button onClick={() => setModalAprobar(null)} style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "none", border: "none", cursor: "pointer", color: "#aaa"
            }}>
              <X size={20} />
            </button>

            <h3 style={{ marginBottom: "1.2rem", color: "#fff" }}>
              Aprobar pedido #{modalAprobar}
            </h3>
            <p style={{ color: "#aaa", marginBottom: "1.2rem", fontSize: "0.9rem" }}>
              Se creará un envío automáticamente. Ingresa los datos de destino.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <input
                name="direccionDestino"
                placeholder="Dirección de destino *"
                value={envioForm.direccionDestino}
                onChange={handleEnvioChange}
                style={inputStyle}
              />
              <input
                name="ciudadDestino"
                placeholder="Ciudad *"
                value={envioForm.ciudadDestino}
                onChange={handleEnvioChange}
                style={inputStyle}
              />
              <input
                name="regionDestino"
                placeholder="Región *"
                value={envioForm.regionDestino}
                onChange={handleEnvioChange}
                style={inputStyle}
              />
              <input
                name="transportista"
                placeholder="Transportista (opcional)"
                value={envioForm.transportista}
                onChange={handleEnvioChange}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => setModalAprobar(null)}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "8px",
                  background: "#2d3447", border: "none", color: "#fff", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAprobacion}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "8px",
                  background: "#4f8ef7", border: "none", color: "#fff",
                  cursor: "pointer", fontWeight: 600 }}
              >
                Confirmar y aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const inputStyle = {
  padding: "0.65rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid #3a4255",
  background: "#141824",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
};

export default Pedidos;
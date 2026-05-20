import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCcw, Search, XCircle } from "lucide-react";
import {
  aprobarPedido,
  crearPedido,
  obtenerPedidos,
  rechazarPedido,
} from "../services/pedidosService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extrae el mensaje de error más descriptivo posible de una respuesta de axios.
 * Cubre: errores de validación de Spring (Map<field,msg>),
 * error genérico { "error": "..." } y mensajes de red/desconocidos.
 */
function extraerMensajeError(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 401) return "Sesión no iniciada o expirada. Recarga la página e inicia sesión.";
  if (status === 403) return "No tienes permisos para realizar esta acción (rol ADMIN requerido).";
  if (status === 404) return "El pedido solicitado no existe.";
  if (status === 503 || error?.code === "ERR_NETWORK")
    return "El servicio de pedidos no está disponible. Verifica que el backend esté corriendo.";

  // Error de validación de Spring: { campo: "mensaje", ... }
  if (data && typeof data === "object" && !data.error) {
    const campos = Object.entries(data)
      .map(([campo, msg]) => `• ${campo}: ${msg}`)
      .join("\n");
    return `Datos inválidos:\n${campos}`;
  }

  // Error de negocio: { "error": "..." }
  if (data?.error) return data.error;

  // Fallback
  return "No se pudo completar la operación. Revisa que el backend esté corriendo.";
}

// ─── Componente ───────────────────────────────────────────────────────────────

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);

  const [form, setForm] = useState({
    cliente: "",
    productoId: "",
    cantidad: "",
  });

  // ── Carga de pedidos ────────────────────────────────────────────────────────

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      setErrorGlobal(null);
      const data = await obtenerPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg = extraerMensajeError(error);
      setErrorGlobal(msg);
      console.error("Error al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // ── Formulario ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({ cliente: "", productoId: "", cantidad: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación local
    if (!form.cliente.trim()) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    if (!form.productoId || Number(form.productoId) <= 0) {
      alert("El ID del producto debe ser mayor a 0.");
      return;
    }
    if (!form.cantidad || Number(form.cantidad) <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    try {
      setCargando(true);
      // El service normaliza `items` → `detalles` automáticamente
      await crearPedido({
        cliente: form.cliente.trim(),
        items: [
          {
            productoId: Number(form.productoId),
            cantidad: Number(form.cantidad),
          },
        ],
      });

      limpiarFormulario();
      await cargarPedidos();
      alert("Pedido creado correctamente.");
    } catch (error) {
      const msg = extraerMensajeError(error);
      console.error("Error al crear pedido:", error);
      alert(`Error al crear el pedido:\n${msg}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Acciones de estado ──────────────────────────────────────────────────────

  const handleAprobar = async (id) => {
    if (!window.confirm(`¿Confirmas aprobar el pedido #${id}?`)) return;
    try {
      setCargando(true);
      await aprobarPedido(id);
      await cargarPedidos();
    } catch (error) {
      const msg = extraerMensajeError(error);
      console.error("Error al aprobar pedido:", error);
      alert(`No se pudo aprobar el pedido #${id}:\n${msg}`);
    } finally {
      setCargando(false);
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm(`¿Confirmas rechazar el pedido #${id}?`)) return;
    try {
      setCargando(true);
      await rechazarPedido(id);
      await cargarPedidos();
    } catch (error) {
      const msg = extraerMensajeError(error);
      console.error("Error al rechazar pedido:", error);
      alert(`No se pudo rechazar el pedido #${id}:\n${msg}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Filtrado ────────────────────────────────────────────────────────────────

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = `${pedido.id} ${pedido.cliente} ${pedido.estado}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="page-panel">
      <div className="page-header">
        <div className="page-title">
          <div className="title-icon">
            <ClipboardList size={26} />
          </div>
          <div>
            <h1>Pedidos</h1>
            <p>Creación, validación y seguimiento de pedidos.</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={cargarPedidos} disabled={cargando}>
            <RefreshCcw size={17} />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>

          <button className="btn-primary" type="submit" form="pedidoForm" disabled={cargando}>
            <Plus size={17} />
            Nuevo pedido
          </button>
        </div>
      </div>

      {/* Banner de error global (si el GET /pedidos falla) */}
      {errorGlobal && (
        <div className="error-banner">
          <XCircle size={18} />
          <span>{errorGlobal}</span>
          <button onClick={() => setErrorGlobal(null)}>✕</button>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <span>Total pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pendientes</span>
          <strong>
            {pedidos.filter((p) => p.estado === "CREADO" || p.estado === "VALIDADO").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Aprobados</span>
          <strong>{pedidos.filter((p) => p.estado === "APROBADO").length}</strong>
        </div>

        <div className="stat-card">
          <span>Rechazados</span>
          <strong>{pedidos.filter((p) => p.estado === "RECHAZADO").length}</strong>
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

      {/* Formulario nuevo pedido */}
      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h3>Nuevo pedido</h3>
            <p>Completa los datos y presiona "Nuevo pedido".</p>
          </div>
        </div>

        <form
          id="pedidoForm"
          className="formulario panel-form pedidos-form"
          onSubmit={handleSubmit}
        >
          <input
            name="cliente"
            placeholder="Cliente *"
            value={form.cliente}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="productoId"
            type="number"
            min="1"
            step="1"
            placeholder="ID Producto *"
            value={form.productoId}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="cantidad"
            type="number"
            min="1"
            step="1"
            placeholder="Cantidad *"
            value={form.cantidad}
            onChange={handleChange}
            disabled={cargando}
          />
        </form>
      </div>

      {/* Tabla */}
      <div className="table-card">
        <div className="table-header">
          <h3>Listado de pedidos</h3>
          <span>{pedidosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">
                  {cargando ? "Cargando pedidos..." : "No hay pedidos registrados"}
                </td>
              </tr>
            ) : (
              pedidosFiltrados.map((pedido) => {
                const esFinal =
                  pedido.estado === "APROBADO" || pedido.estado === "RECHAZADO";

                return (
                  <tr key={pedido.id}>
                    <td>
                      <strong>#{pedido.id}</strong>
                    </td>
                    <td>{pedido.cliente}</td>
                    <td>
                      <span
                        className={
                          pedido.estado === "APROBADO"
                            ? "badge badge-success"
                            : pedido.estado === "RECHAZADO"
                            ? "badge badge-danger"
                            : pedido.estado === "VALIDADO"
                            ? "badge badge-info"
                            : "badge badge-warning"
                        }
                      >
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      {!esFinal && (
                        <>
                          <button
                            className="btn-small btn-success"
                            onClick={() => handleAprobar(pedido.id)}
                            disabled={cargando}
                            title="Aprobar pedido"
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleRechazar(pedido.id)}
                            disabled={cargando}
                            title="Rechazar pedido"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {esFinal && (
                        <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Pedidos;

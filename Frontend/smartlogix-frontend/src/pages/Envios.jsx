import { useEffect, useState } from "react";
import { Truck, Plus, RefreshCcw, Search, XCircle } from "lucide-react";
import {
  obtenerEnvios,
  crearEnvio,
  actualizarEstadoEnvio,
} from "../services/enviosService";

// ─── Helper de errores ────────────────────────────────────────────────────────
function extraerMensajeError(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 401) return "Sesión no iniciada o expirada. Recarga la página.";
  if (status === 403) return "No tienes permisos para realizar esta acción (rol ADMIN requerido).";
  if (status === 404) return "El envío solicitado no existe.";
  if (status === 503 || error?.code === "ERR_NETWORK")
    return "El servicio de envíos no está disponible. Verifica que el backend esté corriendo.";
  if (data && typeof data === "object" && !data.error) {
    const campos = Object.entries(data)
      .map(([campo, msg]) => `• ${campo}: ${msg}`)
      .join("\n");
    return `Datos inválidos:\n${campos}`;
  }
  if (data?.error) return data.error;
  return "No se pudo completar la operación. Revisa que el backend esté corriendo.";
}

// ─── Mapa de colores por estado ───────────────────────────────────────────────
function badgeClase(estado) {
  switch (estado) {
    case "ENTREGADO":   return "badge badge-success";
    case "CANCELADO":   return "badge badge-danger";
    case "EN_TRANSITO": return "badge badge-info";
    case "INCIDENCIA":  return "badge badge-danger";
    case "ASIGNADO":    return "badge badge-warning";
    default:            return "badge badge-warning"; // PENDIENTE
  }
}

// Estados válidos para cambio manual
const ESTADOS_ENVIO = ["PENDIENTE", "ASIGNADO", "EN_TRANSITO", "ENTREGADO", "INCIDENCIA", "CANCELADO"];

// ─── Componente ───────────────────────────────────────────────────────────────
function Envios() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);

  const [form, setForm] = useState({
    pedidoId: "",
    usuarioId: "",
    direccionDestino: "",
    ciudadDestino: "",
    regionDestino: "",
    transportista: "",
  });

  // ── Carga ───────────────────────────────────────────────────────────────────
  const cargarEnvios = async () => {
    try {
      setCargando(true);
      setErrorGlobal(null);
      const data = await obtenerEnvios();
      setEnvios(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorGlobal(extraerMensajeError(error));
      console.error("Error al cargar envíos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEnvios();
  }, []);

  // ── Formulario ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({
      pedidoId: "",
      usuarioId: "",
      direccionDestino: "",
      ciudadDestino: "",
      regionDestino: "",
      transportista: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.pedidoId || Number(form.pedidoId) <= 0) {
      alert("El ID del pedido debe ser mayor a 0.");
      return;
    }
    if (!form.usuarioId || Number(form.usuarioId) <= 0) {
      alert("El ID del usuario debe ser mayor a 0.");
      return;
    }
    if (!form.direccionDestino.trim()) {
      alert("La dirección de destino es obligatoria.");
      return;
    }
    if (!form.ciudadDestino.trim()) {
      alert("La ciudad de destino es obligatoria.");
      return;
    }
    if (!form.regionDestino.trim()) {
      alert("La región de destino es obligatoria.");
      return;
    }

    try {
      setCargando(true);
      await crearEnvio({
        pedidoId: Number(form.pedidoId),
        usuarioId: Number(form.usuarioId),
        direccionDestino: form.direccionDestino.trim(),
        ciudadDestino: form.ciudadDestino.trim(),
        regionDestino: form.regionDestino.trim(),
        transportista: form.transportista.trim() || null,
      });
      limpiarFormulario();
      await cargarEnvios();
      alert("Envío creado correctamente.");
    } catch (error) {
      const msg = extraerMensajeError(error);
      console.error("Error al crear envío:", error);
      alert(`Error al crear el envío:\n${msg}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Cambio de estado ────────────────────────────────────────────────────────
  const handleCambiarEstado = async (id, estadoActual) => {
    const opcionesDisponibles = ESTADOS_ENVIO.filter((e) => e !== estadoActual);
    const nuevoEstado = window.prompt(
      `Envío #${id} — Estado actual: ${estadoActual}\n\nEscribe el nuevo estado:\n${opcionesDisponibles.join(", ")}`
    );

    if (!nuevoEstado) return;
    const estadoNormalizado = nuevoEstado.trim().toUpperCase();

    if (!ESTADOS_ENVIO.includes(estadoNormalizado)) {
      alert(`Estado inválido: "${estadoNormalizado}"\nOpciones válidas: ${ESTADOS_ENVIO.join(", ")}`);
      return;
    }

    try {
      setCargando(true);
      await actualizarEstadoEnvio(id, estadoNormalizado);
      await cargarEnvios();
    } catch (error) {
      const msg = extraerMensajeError(error);
      console.error("Error al cambiar estado del envío:", error);
      alert(`No se pudo cambiar el estado:\n${msg}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const enviosFiltrados = envios.filter((envio) => {
    const texto = `${envio.id} ${envio.numeroSeguimiento} ${envio.ciudadDestino} ${envio.regionDestino} ${envio.estado} ${envio.pedidoId}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const pendientes  = envios.filter((e) => e.estado === "PENDIENTE").length;
  const enTransito  = envios.filter((e) => e.estado === "EN_TRANSITO" || e.estado === "ASIGNADO").length;
  const entregados  = envios.filter((e) => e.estado === "ENTREGADO").length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="page-panel">
      <div className="page-header">
        <div className="page-title">
          <div className="title-icon">
            <Truck size={26} />
          </div>
          <div>
            <h1>Envíos</h1>
            <p>Gestión y seguimiento de envíos.</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={cargarEnvios} disabled={cargando}>
            <RefreshCcw size={17} />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>

          <button className="btn-primary" type="submit" form="envioForm" disabled={cargando}>
            <Plus size={17} />
            Nuevo envío
          </button>
        </div>
      </div>

      {/* Banner de error global */}
      {errorGlobal && (
        <div className="error-banner">
          <XCircle size={18} />
          <span>{errorGlobal}</span>
          <button onClick={() => setErrorGlobal(null)}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span>Total envíos</span>
          <strong>{envios.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
        </div>
        <div className="stat-card">
          <span>En tránsito</span>
          <strong>{enTransito}</strong>
        </div>
        <div className="stat-card">
          <span>Entregados</span>
          <strong>{entregados}</strong>
        </div>
      </div>

      {/* Buscador */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Buscar por ID, seguimiento, ciudad, estado o pedido"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h3>Registrar nuevo envío</h3>
            <p>Completa los datos y presiona "Nuevo envío".</p>
          </div>
        </div>

        <form
          id="envioForm"
          className="formulario panel-form"
          onSubmit={handleSubmit}
        >
          <input
            name="pedidoId"
            type="number"
            min="1"
            step="1"
            placeholder="ID Pedido *"
            value={form.pedidoId}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="usuarioId"
            type="number"
            min="1"
            step="1"
            placeholder="ID Usuario *"
            value={form.usuarioId}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="direccionDestino"
            placeholder="Dirección destino *"
            value={form.direccionDestino}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="ciudadDestino"
            placeholder="Ciudad destino *"
            value={form.ciudadDestino}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="regionDestino"
            placeholder="Región destino *"
            value={form.regionDestino}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="transportista"
            placeholder="Transportista (opcional)"
            value={form.transportista}
            onChange={handleChange}
            disabled={cargando}
          />
        </form>
      </div>

      {/* Tabla */}
      <div className="table-card">
        <div className="table-header">
          <h3>Listado de envíos</h3>
          <span>{enviosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>N° Seguimiento</th>
              <th>Pedido</th>
              <th>Destino</th>
              <th>Transportista</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {enviosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {cargando ? "Cargando envíos..." : "No hay envíos registrados"}
                </td>
              </tr>
            ) : (
              enviosFiltrados.map((envio) => (
                <tr key={envio.id}>
                  <td><strong>#{envio.id}</strong></td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {envio.numeroSeguimiento}
                  </td>
                  <td>Pedido #{envio.pedidoId}</td>
                  <td>
                    {envio.ciudadDestino}, {envio.regionDestino}
                  </td>
                  <td>{envio.transportista || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                  <td>
                    <span className={badgeClase(envio.estado)}>
                      {envio.estado}
                    </span>
                  </td>
                  <td>
                    {envio.estado !== "ENTREGADO" && envio.estado !== "CANCELADO" ? (
                      <button
                        className="btn-small"
                        onClick={() => handleCambiarEstado(envio.id, envio.estado)}
                        disabled={cargando}
                      >
                        Cambiar estado
                      </button>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>—</span>
                    )}
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

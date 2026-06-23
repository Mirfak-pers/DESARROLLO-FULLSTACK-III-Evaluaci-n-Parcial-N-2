import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Search, Truck } from "lucide-react";
import {
  actualizarEstadoEnvio,
  crearEnvio,
  obtenerEnvios,
} from "../services/enviosService";

function Envios() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    pedidoId: "",
    usuarioId: "",
    direccionDestino: "",
    ciudadDestino: "",
    regionDestino: "",
    transportista: "",
    fechaEntregaEstimada: "",
  });

  const cargarEnvios = async () => {
    try {
      setCargando(true);
      const data = await obtenerEnvios();
      setEnvios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar envíos:", error);
      alert("No se pudieron cargar los envíos. Revisa que el backend esté funcionando.");
      setEnvios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEnvios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pedidoId" || name === "usuarioId") {
      if (value === "") {
        setForm({ ...form, [name]: value });
        return;
      }

      if (!/^[1-9]\d*$/.test(value)) return;
    }

    setForm({ ...form, [name]: value });
  };

  const limpiarFormulario = () => {
    setForm({
      pedidoId: "",
      usuarioId: "",
      direccionDestino: "",
      ciudadDestino: "",
      regionDestino: "",
      transportista: "",
      fechaEntregaEstimada: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.pedidoId ||
      !form.usuarioId ||
      !form.direccionDestino.trim() ||
      !form.ciudadDestino.trim() ||
      !form.regionDestino.trim()
    ) {
      alert("Completa los campos obligatorios: pedido, usuario, dirección, ciudad y región.");
      return;
    }

    if (Number(form.pedidoId) <= 0 || Number(form.usuarioId) <= 0) {
      alert("El ID del pedido y el ID del usuario deben ser mayores a 0.");
      return;
    }

    const nuevoEnvio = {
      pedidoId: Number(form.pedidoId),
      usuarioId: Number(form.usuarioId),
      direccionDestino: form.direccionDestino.trim(),
      ciudadDestino: form.ciudadDestino.trim(),
      regionDestino: form.regionDestino.trim(),
      transportista: form.transportista.trim(),
      fechaEntregaEstimada: form.fechaEntregaEstimada || null,
    };

    try {
      setCargando(true);
      await crearEnvio(nuevoEnvio);
      limpiarFormulario();
      await cargarEnvios();
      alert("Envío creado correctamente.");
    } catch (error) {
      console.error("Error al crear envío:", error);
      alert("No se pudo crear el envío. Revisa los datos ingresados.");
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async (id, estado) => {
    const confirmar = window.confirm(`¿Confirmas cambiar el envío #${id} a ${estado}?`);

    if (!confirmar) return;

    try {
      setCargando(true);
      await actualizarEstadoEnvio(id, estado);
      await cargarEnvios();
    } catch (error) {
      console.error("Error al cambiar estado del envío:", error);
      alert("No se pudo cambiar el estado del envío.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === "ENTREGADO") return "badge badge-success";
    if (estado === "INCIDENCIA" || estado === "CANCELADO") return "badge badge-danger";
    return "badge badge-warning";
  };

  const formatearEstado = (estado) => {
    if (!estado) return "SIN ESTADO";
    return estado.replace("_", " ");
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleString("es-CL");
  };

  const enviosFiltrados = envios.filter((envio) => {
    const texto = `
      ${envio.id || ""}
      ${envio.pedidoId || ""}
      ${envio.usuarioId || ""}
      ${envio.numeroSeguimiento || ""}
      ${envio.direccionDestino || ""}
      ${envio.ciudadDestino || ""}
      ${envio.regionDestino || ""}
      ${envio.transportista || ""}
      ${envio.estado || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const totalPendientes = envios.filter((envio) => envio.estado === "PENDIENTE").length;
  const totalTransito = envios.filter((envio) => envio.estado === "EN_TRANSITO").length;
  const totalEntregados = envios.filter((envio) => envio.estado === "ENTREGADO").length;

  return (
    <section className="page-panel">
      <div className="page-header">
        <div className="page-title">
          <div className="title-icon">
            <Truck size={26} />
          </div>

          <div>
            <h1>Envíos</h1>
            <p>Gestión, seguimiento y actualización de estados de envío.</p>
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

      <div className="stats-row">
        <div className="stat-card">
          <span>Total envíos</span>
          <strong>{envios.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pendientes</span>
          <strong>{totalPendientes}</strong>
        </div>

        <div className="stat-card">
          <span>En tránsito</span>
          <strong>{totalTransito}</strong>
        </div>

        <div className="stat-card">
          <span>Entregados</span>
          <strong>{totalEntregados}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Buscar por ID, pedido, usuario, seguimiento, ciudad o estado"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h3>Nuevo envío</h3>
            <p>Completa los datos y presiona "Nuevo envío".</p>
          </div>
        </div>

        <form
          id="envioForm"
          className="formulario panel-form envios-form"
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
            placeholder="Transportista"
            value={form.transportista}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="fechaEntregaEstimada"
            type="datetime-local"
            value={form.fechaEntregaEstimada}
            onChange={handleChange}
            disabled={cargando}
          />
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Listado de envíos</h3>
          <span>{enviosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pedido</th>
              <th>Usuario</th>
              <th>Seguimiento</th>
              <th>Destino</th>
              <th>Transportista</th>
              <th>Estado</th>
              <th>Entrega estimada</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {enviosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  No hay envíos registrados
                </td>
              </tr>
            ) : (
              enviosFiltrados.map((envio) => (
                <tr key={envio.id}>
                  <td>
                    <strong>#{envio.id}</strong>
                  </td>

                  <td>{envio.pedidoId}</td>

                  <td>{envio.usuarioId}</td>

                  <td>{envio.numeroSeguimiento || "Sin seguimiento"}</td>

                  <td>
                    {envio.direccionDestino}, {envio.ciudadDestino}, {envio.regionDestino}
                  </td>

                  <td>{envio.transportista || "Sin transportista"}</td>

                  <td>
                    <span className={obtenerClaseEstado(envio.estado)}>
                      {formatearEstado(envio.estado)}
                    </span>
                  </td>

                  <td>{formatearFecha(envio.fechaEntregaEstimada)}</td>

                  <td>
                    {envio.estado === "ENTREGADO" ? (
                      <span style={{ color: "#64748b", fontWeight: "700" }}>
                        Finalizado
                      </span>
                    ) : (
                      <button
                        className="btn-small"
                        type="button"
                        onClick={() => handleCambiarEstado(envio.id, "ENTREGADO")}
                        disabled={cargando}
                      >
                        Marcar entregado
                      </button>
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
import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Search, Truck } from "lucide-react";
import { crearEnvio, obtenerEnvios } from "../services/enviosService";

function Envios() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    pedidoId: "",
    usuarioId: "1",
    direccionDestino: "",
    ciudadDestino: "",
    regionDestino: "",
    transportista: "",
    fechaEntregaEstimada: "",
  });

  const mostrarErrorBackend = (error, accion = "realizar la operación") => {
    console.error(`Error al ${accion}`, error);

    const status = error?.response?.status;
    const mensajeBackend =
      error?.response?.data?.mensaje ||
      error?.response?.data?.message ||
      error?.response?.data?.error;

    if (status === 401) {
      alert("Sesión no iniciada o expirada. Inicia sesión nuevamente.");
      return;
    }

    if (status === 403) {
      alert("No tienes permisos para realizar esta acción.");
      return;
    }

    if (status === 400) {
      alert(
        mensajeBackend ||
          "Datos inválidos. Revisa que los campos estén completos y que los ID sean números enteros positivos."
      );
      return;
    }

    alert("No se pudo completar la operación. Revisa que el backend esté funcionando.");
  };

  const cargarEnvios = async () => {
    try {
      setCargando(true);
      const data = await obtenerEnvios();
      setEnvios(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarErrorBackend(error, "cargar envíos");
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
        setForm({
          ...form,
          [name]: value,
        });
        return;
      }

      const soloEnterosPositivos = /^[1-9]\d*$/;

      if (!soloEnterosPositivos.test(value)) {
        return;
      }
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      pedidoId: "",
      usuarioId: "1",
      direccionDestino: "",
      ciudadDestino: "",
      regionDestino: "",
      transportista: "",
      fechaEntregaEstimada: "",
    });
  };

  const convertirFechaParaBackend = (fecha) => {
    if (!fecha) {
      return null;
    }

    return `${fecha}T00:00:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pedidoId = Number(form.pedidoId);
    const usuarioId = Number(form.usuarioId);
    const direccionDestino = form.direccionDestino.trim();
    const ciudadDestino = form.ciudadDestino.trim();
    const regionDestino = form.regionDestino.trim();
    const transportista = form.transportista.trim();

    if (
      !form.pedidoId ||
      !form.usuarioId ||
      !direccionDestino ||
      !ciudadDestino ||
      !regionDestino
    ) {
      alert("Completa los campos obligatorios: pedido, usuario, dirección, ciudad y región.");
      return;
    }

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      alert("El ID del pedido debe ser un número entero mayor a 0.");
      return;
    }

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      alert("El ID del usuario debe ser un número entero mayor a 0.");
      return;
    }

    const nuevoEnvio = {
      pedidoId,
      usuarioId,
      direccionDestino,
      ciudadDestino,
      regionDestino,
      transportista,
      fechaEntregaEstimada: convertirFechaParaBackend(
        form.fechaEntregaEstimada
      ),
    };

    try {
      setCargando(true);
      await crearEnvio(nuevoEnvio);
      limpiarFormulario();
      await cargarEnvios();
      alert("Envío creado correctamente.");
    } catch (error) {
      mostrarErrorBackend(error, "crear envío");
    } finally {
      setCargando(false);
    }
  };

  const enviosFiltrados = envios.filter((envio) => {
    const texto = `${envio.id || ""} ${envio.pedidoId || ""} ${
      envio.usuarioId || ""
    } ${envio.direccionDestino || ""} ${envio.ciudadDestino || ""} ${
      envio.regionDestino || ""
    } ${envio.transportista || ""} ${envio.estado || ""}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return String(fecha).replace("T", " ").slice(0, 16);
  };

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
          <button
            className="btn-secondary"
            onClick={cargarEnvios}
            disabled={cargando}
          >
            <RefreshCcw size={17} />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>

          <button
            className="btn-primary"
            type="submit"
            form="envioForm"
            disabled={cargando}
          >
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
          <span>En tránsito</span>
          <strong>
            {envios.filter((envio) => envio.estado === "EN_TRANSITO").length}
          </strong>
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
            placeholder="Buscar por pedido, usuario, dirección, ciudad, región, transportista o estado"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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
          placeholder="ID Pedido"
          value={form.pedidoId}
          onChange={handleChange}
          disabled={cargando}
        />

        <input
          name="usuarioId"
          type="number"
          min="1"
          step="1"
          placeholder="ID Usuario"
          value={form.usuarioId}
          onChange={handleChange}
          disabled={cargando}
        />

        <input
          name="direccionDestino"
          placeholder="Dirección destino"
          value={form.direccionDestino}
          onChange={handleChange}
          disabled={cargando}
        />

        <input
          name="ciudadDestino"
          placeholder="Ciudad destino"
          value={form.ciudadDestino}
          onChange={handleChange}
          disabled={cargando}
        />

        <input
          name="regionDestino"
          placeholder="Región destino"
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
          type="date"
          value={form.fechaEntregaEstimada}
          onChange={handleChange}
          disabled={cargando}
        />
      </form>

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
              <th>Dirección</th>
              <th>Ciudad</th>
              <th>Región</th>
              <th>Transportista</th>
              <th>Fecha estimada</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {enviosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  {cargando ? "Cargando envíos..." : "No hay envíos registrados"}
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
                  <td>{envio.direccionDestino}</td>
                  <td>{envio.ciudadDestino}</td>
                  <td>{envio.regionDestino}</td>
                  <td>{envio.transportista || "Sin transportista"}</td>
                  <td>{formatearFecha(envio.fechaEntregaEstimada)}</td>
                  <td>
                    <span
                      className={
                        envio.estado === "ENTREGADO"
                          ? "badge badge-success"
                          : envio.estado === "INCIDENCIA" ||
                            envio.estado === "CANCELADO"
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
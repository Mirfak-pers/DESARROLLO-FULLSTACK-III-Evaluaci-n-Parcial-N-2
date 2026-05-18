import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCcw, Search } from "lucide-react";
import { obtenerProductos } from "../services/inventarioService";
import {
  aprobarPedido,
  crearPedido,
  obtenerPedidos,
} from "../services/pedidosService";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    cliente: "",
    productoId: "",
    cantidad: "",
  });

  const cargarPedidos = async () => {
    try {
      const data = await obtenerPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar pedidos", error);
      alert("No se pudieron cargar los pedidos. Verifica el BFF y Keycloak.");
    }
  };

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos", error);
      alert("No se pudieron cargar los productos para crear pedidos.");
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const productoSeleccionado = productos.find(
    (producto) => String(producto.id) === String(form.productoId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cliente || !form.productoId || !form.cantidad) {
      alert("Completa todos los campos");
      return;
    }

    if (Number(form.cantidad) <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      await crearPedido({
        cliente: form.cliente,
        items: [
          {
            productoId: Number(form.productoId),
            cantidad: Number(form.cantidad),
          },
        ],
      });

      setForm({
        cliente: "",
        productoId: "",
        cantidad: "",
      });

      cargarPedidos();
    } catch (error) {
      console.error("Error al crear pedido", error);
      alert("No se pudo crear el pedido");
    }
  };

  const handleAprobar = async (id) => {
    try {
      await aprobarPedido(id);
      cargarPedidos();
    } catch (error) {
      console.error("Error al aprobar pedido", error);
      alert("No se pudo aprobar el pedido. Puede que no exista stock suficiente.");
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const detalleTexto = (pedido.detalles || [])
      .map((detalle) => `${detalle.nombreProducto || ""} ${detalle.codigoProducto || ""}`)
      .join(" ");
    const texto = `${pedido.id} ${pedido.cliente} ${pedido.estado} ${detalleTexto}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const obtenerDetalleVisible = (pedido) => {
    if (!pedido.detalles || pedido.detalles.length === 0) {
      return "Sin detalle";
    }

    return pedido.detalles
      .map((detalle) => {
        const nombre = detalle.nombreProducto || detalle.codigoProducto || "Producto";
        return `${nombre} x${detalle.cantidad}`;
      })
      .join(", ");
  };

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
          <button className="btn-secondary" onClick={cargarPedidos}>
            <RefreshCcw size={17} />
            Actualizar
          </button>

          <button className="btn-primary" type="submit" form="pedidoForm">
            <Plus size={17} />
            Nuevo pedido
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
          <strong>
            {pedidos.filter((pedido) => pedido.estado !== "APROBADO").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Aprobados</span>
          <strong>
            {pedidos.filter((pedido) => pedido.estado === "APROBADO").length}
          </strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Buscar por cliente, pedido, producto o estado"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <form id="pedidoForm" className="formulario panel-form pedidos-form" onSubmit={handleSubmit}>
        <input
          name="cliente"
          placeholder="Cliente"
          value={form.cliente}
          onChange={handleChange}
        />

        <select name="productoId" value={form.productoId} onChange={handleChange}>
          <option value="">Selecciona un producto</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} - Stock: {producto.stock} - ${Number(producto.precio || 0).toLocaleString("es-CL")}
            </option>
          ))}
        </select>

        <input
          name="cantidad"
          type="number"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={handleChange}
        />
      </form>

      {productoSeleccionado && (
        <div className="info-box">
          Producto seleccionado: <strong>{productoSeleccionado.nombre}</strong> · Stock disponible: {productoSeleccionado.stock}
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <h3>Listado de pedidos</h3>
          <span>{pedidosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No hay pedidos registrados
                </td>
              </tr>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td>
                    <strong>#{pedido.id}</strong>
                  </td>
                  <td>{pedido.cliente}</td>
                  <td>{obtenerDetalleVisible(pedido)}</td>
                  <td>
                    <span
                      className={
                        pedido.estado === "APROBADO"
                          ? "badge badge-success"
                          : pedido.estado === "RECHAZADO"
                          ? "badge badge-danger"
                          : "badge badge-warning"
                      }
                    >
                      {pedido.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => handleAprobar(pedido.id)}
                      disabled={pedido.estado === "APROBADO"}
                    >
                      Aprobar
                    </button>
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

export default Pedidos;

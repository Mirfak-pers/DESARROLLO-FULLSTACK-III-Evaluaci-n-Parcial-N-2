import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCcw, Search } from "lucide-react";
import {
  aprobarPedido,
  crearPedido,
  obtenerPedidos,
} from "../services/pedidosService";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    cliente: "",
    productoId: "",
    cantidad: "",
  });

  const cargarPedidos = async () => {
    try {
      const data = await obtenerPedidos();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos", error);
      console.log("BFF no disponible para cargar pedidos");
    }
  };

  useEffect(() => {
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

    if (!form.cliente || !form.productoId || !form.cantidad) {
      alert("Completa todos los campos");
      return;
    }

    if (Number(form.productoId) <= 0 || Number(form.cantidad) <= 0) {
      alert("El ID del producto y la cantidad deben ser mayores a 0");
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
    const texto = `${pedido.id} ${pedido.cliente} ${pedido.estado}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

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
            placeholder="Buscar por cliente, ID o estado"
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

        <input
          name="productoId"
          type="number"
          placeholder="ID Producto"
          value={form.productoId}
          onChange={handleChange}
        />

        <input
          name="cantidad"
          type="number"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={handleChange}
        />
      </form>

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
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">
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
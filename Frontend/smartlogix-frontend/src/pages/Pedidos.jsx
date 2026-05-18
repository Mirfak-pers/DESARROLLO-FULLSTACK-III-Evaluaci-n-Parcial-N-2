import { useEffect, useState } from "react";
import {
  aprobarPedido,
  crearPedido,
  obtenerPedidos,
} from "../services/pedidosService";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
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

  return (
    <section>
      <h1>Pedidos</h1>

      <form className="formulario" onSubmit={handleSubmit}>
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

        <button type="submit">Crear pedido</button>
      </form>

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
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="4">No hay pedidos registrados</td>
            </tr>
          ) : (
            pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.cliente}</td>
                <td>{pedido.estado}</td>
                <td>
                  <button onClick={() => handleAprobar(pedido.id)}>
                    Aprobar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Pedidos;
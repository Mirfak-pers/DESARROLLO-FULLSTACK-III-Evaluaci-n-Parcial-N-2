import { useEffect, useState } from "react";
import { crearProducto, obtenerProductos } from "../services/inventarioService";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos", error);
      console.log("BFF no disponible para cargar productos");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.codigo || !form.nombre || !form.precio || !form.stock) {
      alert("Completa los campos obligatorios");
      return;
    }

    if (Number(form.precio) <= 0 || Number(form.stock) < 0) {
      alert("El precio debe ser mayor a 0 y el stock no puede ser negativo");
      return;
    }

    try {
      await crearProducto({
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
      });

      setForm({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
      });

      cargarProductos();
    } catch (error) {
      console.error("Error al crear producto", error);
      alert("No se pudo crear el producto");
    }
  };

  return (
    <section>
      <h1>Inventario</h1>

      <form className="formulario" onSubmit={handleSubmit}>
        <input
          name="codigo"
          placeholder="Código"
          value={form.codigo}
          onChange={handleChange}
        />

        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />

        <input
          name="precio"
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />

        <button type="submit">Crear producto</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="5">No hay productos registrados</td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.codigo}</td>
                <td>{producto.nombre}</td>
                <td>${producto.precio}</td>
                <td>{producto.stock}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Inventario;
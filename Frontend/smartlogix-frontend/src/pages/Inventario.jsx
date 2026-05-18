import { useEffect, useState } from "react";
import { Boxes, Filter, Plus, RefreshCcw, Search } from "lucide-react";
import { crearProducto, obtenerProductos } from "../services/inventarioService";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
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

  const limpiarFormulario = () => {
    setForm({
      codigo: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
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

    const nuevoProducto = {
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
    };

    try {
      const productoCreado = await crearProducto(nuevoProducto);

      setProductos((prevProductos) => [
        ...prevProductos,
        productoCreado || {
          id: Date.now(),
          ...nuevoProducto,
        },
      ]);

      limpiarFormulario();
    } catch (error) {
      console.error(
        "Error al crear producto en BFF, se agrega solo en pantalla",
        error
      );

      const productoDemo = {
        id: Date.now(),
        ...nuevoProducto,
      };

      setProductos((prevProductos) => [...prevProductos, productoDemo]);
      limpiarFormulario();
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    const texto = `${producto.codigo || ""} ${producto.nombre || ""} ${
      producto.descripcion || ""
    }`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const totalStock = productos.reduce(
    (total, producto) => total + Number(producto.stock || 0),
    0
  );

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <div className="page-title">
            <div className="title-icon">
              <Boxes size={26} />
            </div>
            <div>
              <h1>Inventario</h1>
              <p>Gestión de productos y stock disponible.</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={cargarProductos}>
            <RefreshCcw size={17} />
            Actualizar
          </button>

          <button className="btn-primary" type="submit" form="productoForm">
            <Plus size={17} />
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Productos</span>
          <strong>{productos.length}</strong>
        </div>

        <div className="stat-card">
          <span>Stock total</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="stat-card">
          <span>Estado</span>
          <strong>Activo</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Buscar por código, nombre o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button className="icon-button" type="button">
          <Filter size={18} />
        </button>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h3>Agregar nuevo producto</h3>
            <p>Completa los datos y presiona “Nuevo producto”.</p>
          </div>
        </div>

        <form
          id="productoForm"
          className="formulario panel-form"
          onSubmit={handleSubmit}
        >
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
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Listado de productos</h3>
          <span>{productosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Producto</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>
                    <strong>{producto.codigo}</strong>
                  </td>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion || "Sin descripción"}</td>
                  <td>
                    ${Number(producto.precio || 0).toLocaleString("es-CL")}
                  </td>
                  <td>{producto.stock}</td>
                  <td>
                    <span
                      className={
                        Number(producto.stock) > 0
                          ? "badge badge-success"
                          : "badge badge-danger"
                      }
                    >
                      {Number(producto.stock) > 0 ? "Disponible" : "Sin stock"}
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

export default Inventario;
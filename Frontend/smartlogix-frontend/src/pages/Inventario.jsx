import { useEffect, useState } from "react";
import { Boxes, Filter, Plus, RefreshCcw, Search } from "lucide-react";
import { crearProducto, obtenerProductos } from "../services/inventarioService";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });

  const mostrarErrorBackend = (error, accion = "realizar la operación") => {
    console.error(`Error al ${accion}`, error);

    const status = error?.response?.status;

    if (status === 401) {
      alert("Sesión no iniciada o expirada. Inicia sesión nuevamente.");
      return;
    }

    if (status === 403) {
      alert("No tienes permisos para realizar esta acción.");
      return;
    }

    if (status === 400) {
      alert("Datos inválidos. Revisa que el precio sea mayor a 0 y el stock no sea negativo.");
      return;
    }

    if (status === 409) {
      alert("Código ya usado, ingrese otro.");
      return;
    }

    alert("No se pudo completar la operación. Revisa que el backend esté funcionando.");
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarErrorBackend(error, "cargar productos");
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Bloquea - + e , desde el teclado en inputs numéricos (precio acepta punto decimal)
  const blockNegativeKeys = (e) => {
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === ",") {
      e.preventDefault();
    }
  };

  // Para stock: además bloquea el punto decimal
  const blockNegativeKeysInt = (e) => {
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "." || e.key === ",") {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Bloquear valores no enteros y negativos en precio
    if (name === "precio") {
      if (value === "") {
        setForm({ ...form, [name]: value });
        return;
      }
      if (!/^[1-9]\d*$/.test(value)) return;
    }

    // Bloquear valores negativos en stock: solo enteros >= 0
    if (name === "stock") {
      if (value === "") {
        setForm({ ...form, [name]: value });
        return;
      }
      // Rechazar si contiene punto decimal, signo negativo o no es entero positivo/cero
      if (!/^\d+$/.test(value)) return;
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) return;
    }

    setForm({ ...form, [name]: value });
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

    const codigo = form.codigo.trim();
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const precio = Number(form.precio);
    const stock = Number(form.stock);

    if (!codigo || !nombre || form.precio === "" || form.stock === "") {
      alert("Completa los campos obligatorios: código, nombre, precio y stock.");
      return;
    }

    if (precio <= 0) {
      alert("El precio debe ser mayor a 0.");
      return;
    }

    if (stock < 0) {
      alert("El stock no puede ser negativo.");
      return;
    }

    if (!Number.isInteger(stock)) {
      alert("El stock debe ser un número entero.");
      return;
    }

    const codigoExiste = productos.some(
      (producto) =>
        String(producto.codigo).trim().toLowerCase() === codigo.toLowerCase()
    );

    if (codigoExiste) {
      alert("Código ya usado, ingrese otro.");
      return;
    }

    const nuevoProducto = { codigo, nombre, descripcion, precio, stock };

    try {
      setCargando(true);
      const productoCreado = await crearProducto(nuevoProducto);

      if (!productoCreado) {
        alert("El backend no devolvió el producto creado. Actualiza la lista para verificar.");
        await cargarProductos();
        return;
      }

      setProductos((prevProductos) => [...prevProductos, productoCreado]);
      limpiarFormulario();
      alert("Producto guardado correctamente.");
    } catch (error) {
      mostrarErrorBackend(error, "crear producto");
    } finally {
      setCargando(false);
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
          <button
            className="btn-secondary"
            onClick={cargarProductos}
            disabled={cargando}
          >
            <RefreshCcw size={17} />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>

          <button
            className="btn-primary"
            type="submit"
            form="productoForm"
            disabled={cargando}
          >
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
          <strong>{cargando ? "Cargando" : "Activo"}</strong>
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
            <p>Completa los datos y presiona "Nuevo producto".</p>
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
            disabled={cargando}
          />

          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="precio"
            type="number"
            min="1"
            step="1"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            onKeyDown={blockNegativeKeysInt}
            disabled={cargando}
          />

          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            onKeyDown={blockNegativeKeysInt}
            disabled={cargando}
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
                  {cargando ? "Cargando productos..." : "No hay productos registrados"}
                </td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => (
                <tr key={producto.id || producto.codigo}>
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
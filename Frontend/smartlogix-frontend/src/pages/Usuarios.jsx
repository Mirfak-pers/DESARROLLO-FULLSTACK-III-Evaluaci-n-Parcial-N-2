import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Search, Users } from "lucide-react";
import { crearUsuario, listarUsuarios } from "../services/usuariosService";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "CLIENTE",
  });

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await listarUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("No se pudieron cargar los usuarios. Revisa que el backend esté funcionando.");
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      email: "",
      password: "",
      rol: "CLIENTE",
    });
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Completa los campos obligatorios: nombre, correo y contraseña.");
      return;
    }

    if (!validarEmail(form.email)) {
      alert("Ingresa un correo válido.");
      return;
    }

    if (form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const nuevoUsuario = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
      rol: form.rol,
    };

    try {
      setCargando(true);
      await crearUsuario(nuevoUsuario);
      limpiarFormulario();
      await cargarUsuarios();
      alert("Usuario creado correctamente.");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("No se pudo crear el usuario. Revisa los datos ingresados.");
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = `
      ${usuario.id || ""}
      ${usuario.nombre || ""}
      ${usuario.email || ""}
      ${usuario.rol || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const totalAdmins = usuarios.filter((usuario) => usuario.rol === "ADMIN").length;
  const totalClientes = usuarios.filter((usuario) => usuario.rol === "CLIENTE").length;
  const totalOperadores = usuarios.filter((usuario) => usuario.rol === "OPERADOR").length;

  return (
    <section className="page-panel">
      <div className="page-header">
        <div className="page-title">
          <div className="title-icon">
            <Users size={26} />
          </div>

          <div>
            <h1>Usuarios</h1>
            <p>Gestión de usuarios registrados en la plataforma SmartLogix.</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={cargarUsuarios} disabled={cargando}>
            <RefreshCcw size={17} />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>

          <button className="btn-primary" type="submit" form="usuarioForm" disabled={cargando}>
            <Plus size={17} />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Total usuarios</span>
          <strong>{usuarios.length}</strong>
        </div>

        <div className="stat-card">
          <span>Administradores</span>
          <strong>{totalAdmins}</strong>
        </div>

        <div className="stat-card">
          <span>Operadores</span>
          <strong>{totalOperadores}</strong>
        </div>

        <div className="stat-card">
          <span>Clientes</span>
          <strong>{totalClientes}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Buscar por ID, nombre, correo o rol"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h3>Nuevo usuario</h3>
            <p>Completa los datos y presiona "Nuevo usuario".</p>
          </div>
        </div>

        <form
          id="usuarioForm"
          className="formulario panel-form usuarios-form"
          onSubmit={handleSubmit}
        >
          <input
            name="nombre"
            placeholder="Nombre completo *"
            value={form.nombre}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="email"
            type="email"
            placeholder="Correo electrónico *"
            value={form.email}
            onChange={handleChange}
            disabled={cargando}
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña *"
            value={form.password}
            onChange={handleChange}
            disabled={cargando}
          />

          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            disabled={cargando}
          >
            <option value="CLIENTE">CLIENTE</option>
            <option value="OPERADOR">OPERADOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Listado de usuarios</h3>
          <span>{usuariosFiltrados.length} resultados</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>#{usuario.id}</strong>
                  </td>

                  <td>{usuario.nombre}</td>

                  <td>{usuario.email}</td>

                  <td>
                    <span className="badge badge-warning">
                      {usuario.rol || "SIN ROL"}
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

export default Usuarios;
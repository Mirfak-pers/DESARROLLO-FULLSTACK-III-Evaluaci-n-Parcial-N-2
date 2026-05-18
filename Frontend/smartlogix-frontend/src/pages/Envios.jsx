import { useEffect, useState } from "react";
import { crearEnvio, obtenerEnvios } from "../services/enviosService";

function Envios() {
  const [envios, setEnvios] = useState([]);
  const [form, setForm] = useState({
    pedidoId: "",
    direccion: "",
    transportista: "",
    fechaEstimada: "",
  });

  const cargarEnvios = async () => {
    try {
      const data = await obtenerEnvios();
      setEnvios(data);
    } catch (error) {
      console.error("Error al cargar envíos", error);
      console.log("BFF no disponible para cargar envíos");
    }
  };

  useEffect(() => {
    cargarEnvios();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.pedidoId || !form.direccion || !form.transportista) {
      alert("Completa los campos obligatorios");
      return;
    }

    if (Number(form.pedidoId) <= 0) {
      alert("El ID del pedido debe ser mayor a 0");
      return;
    }

    try {
      await crearEnvio({
        pedidoId: Number(form.pedidoId),
        direccion: form.direccion,
        transportista: form.transportista,
        fechaEstimada: form.fechaEstimada,
      });

      setForm({
        pedidoId: "",
        direccion: "",
        transportista: "",
        fechaEstimada: "",
      });

      cargarEnvios();
    } catch (error) {
      console.error("Error al crear envío", error);
      alert("No se pudo crear el envío. Verifica que el pedido esté aprobado.");
    }
  };

  return (
    <section>
      <h1>Envíos</h1>

      <form className="formulario" onSubmit={handleSubmit}>
        <input
          name="pedidoId"
          type="number"
          placeholder="ID Pedido"
          value={form.pedidoId}
          onChange={handleChange}
        />

        <input
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
        />

        <input
          name="transportista"
          placeholder="Transportista"
          value={form.transportista}
          onChange={handleChange}
        />

        <input
          name="fechaEstimada"
          type="date"
          value={form.fechaEstimada}
          onChange={handleChange}
        />

        <button type="submit">Crear envío</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pedido</th>
            <th>Dirección</th>
            <th>Transportista</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {envios.length === 0 ? (
            <tr>
              <td colSpan="5">No hay envíos registrados</td>
            </tr>
          ) : (
            envios.map((envio) => (
              <tr key={envio.id}>
                <td>{envio.id}</td>
                <td>{envio.pedidoId}</td>
                <td>{envio.direccion}</td>
                <td>{envio.transportista}</td>
                <td>{envio.estado}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Envios;
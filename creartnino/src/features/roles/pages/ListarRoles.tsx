// src/components/ListarRoles.tsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "../style/style.css";

import CrearRolModal from "./CrearRoles";
import EditarRolModal from "./EditarRoles";
import VerRolModal from "./VerRoles";

import type { IRol } from "../../interfaces/IRoles";

const ListarRoles: React.FC = () => {
  const [roles, setRoles] = useState<IRol[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [rolEditar, setRolEditar] = useState<IRol | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [rolVer, setRolVer] = useState<IRol | null>(null);

  const rolesPorPagina = 5;

  // 👉 Función auxiliar para identificar Admin o Cliente
  const esProtegido = (nombre: string) => {
    const lower = nombre.toLowerCase();
    return lower === "admin" || lower === "administrador" || lower === "cliente";
  };

  // ✅ Cargar datos desde la API
  const fetchRoles = async () => {
    try {
      const response = await fetch("https://apicreartnino.somee.com/api/Roles/Lista");
      if (!response.ok) throw new Error("Error al obtener los roles");

      const data: IRol[] = await response.json();

      const rolesNormalizados = data.map((r) => ({
        ...r,
        Rol: r.Rol || "Sin nombre",
      }));

      setRoles(rolesNormalizados);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los roles", "error");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // =================== ELIMINAR ===================
  const handleEliminarRol = async (id: number, estado: boolean, nombre: string) => {
    if (esProtegido(nombre)) return;

    if (estado) {
      Swal.fire(
        "Rol activo",
        "No puedes eliminar un rol activo. Desactívalo primero.",
        "warning"
      );
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const resp = await fetch(
        `https://apicreartnino.somee.com/api/Roles/Eliminar/${id}`,
        { method: "DELETE" }
      );

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || "Error al eliminar el rol");
      }

      await fetchRoles();

      Swal.fire("Eliminado", "El rol ha sido eliminado correctamente", "success");
    } catch (error) {
      console.error("Error eliminando rol:", error);
      Swal.fire(
        "Error",
        "No se puede eliminar este rol porque está asociado a un usuario",
        "error"
      );
    }
  };

  // =================== CAMBIO DE ESTADO ===================
  const handleEstadoChange = async (id: number, nombre: string) => {
    if (esProtegido(nombre)) return;

    const target = roles.find((r) => r.IdRol === id);
    if (!target) return;

    const actualizado: IRol = { ...target, Estado: !target.Estado };

    setRoles((prev) => prev.map((r) => (r.IdRol === id ? actualizado : r)));

    try {
      const resp = await fetch(
        `https://apicreartnino.somee.com/api/Roles/Actualizar/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actualizado),
        }
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      await fetchRoles();

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El rol ${actualizado.Rol} ahora está ${
          actualizado.Estado ? "activo" : "inactivo"
        }.`,
        confirmButtonColor: "#f78fb3",
      });
    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del rol.",
        confirmButtonColor: "#f78fb3",
      });

      setRoles((prev) => prev.map((r) => (r.IdRol === id ? target : r)));
    }
  };

  const handleCrearRol = (nuevoRol: IRol) => {
    if (!nuevoRol.Rol) {
      Swal.fire("Error", "El rol debe tener un nombre", "error");
      return;
    }

    const rolConNombre = { ...nuevoRol, Rol: nuevoRol.Rol || "Sin nombre" };

    setRoles((prev) => [...prev, rolConNombre]);
    setMostrarModal(false);
    Swal.fire({
      icon: "success",
      title: `Rol "${rolConNombre.Rol}" creado correctamente`,
      confirmButtonColor: "#f78fb3",
    });
  };

  const handleEditarRol = (rol: IRol) => {
    if (esProtegido(rol.Rol)) return;

    setRolEditar(rol);
    setMostrarEditarModal(true);
  };

  const handleActualizarRol = (rolActualizado: IRol) => {
    setRoles((prev) =>
      prev.map((r) => (r.IdRol === rolActualizado.IdRol ? rolActualizado : r))
    );
    setMostrarEditarModal(false);
  };

  const handleVerRol = (rol: IRol) => {
    setRolVer(rol);
    setMostrarVerModal(true);
  };

  // ✅ Búsqueda
  const rolesFiltrados = roles.filter((r) =>
    `${r.Rol} ${r.Descripcion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);
  const indexInicio = (paginaActual - 1) * rolesPorPagina;
  const indexFin = indexInicio + rolesPorPagina;
  const rolesPagina = rolesFiltrados.slice(indexInicio, indexFin);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Roles</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Rol
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Rol o descripción"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={(e) => {
            const value = e.target.value;
            if (value.trim() === "" && value !== "") return;
            setBusqueda(value);
          setPaginaActual(1);
        }}
      />

      <div className="tabla-container">
        <table className="table tabla-proveedores">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rolesPagina.map((rol, index) => (
              <tr
                key={rol.IdRol}
                className={index % 2 === 0 ? "fila-par" : "fila-impar"}
              >
                <td>{rol.Rol}</td>
                <td>{rol.Descripcion}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={rol.Estado}
                      onChange={() => handleEstadoChange(rol.IdRol, rol.Rol)}
                      disabled={esProtegido(rol.Rol)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleVerRol(rol)}
                  />
                  <FaEdit
                    className={`icono me-2 ${
                      esProtegido(rol.Rol) ? "text-secondary" : "text-warning"
                    }`}
                    style={{
                      cursor: esProtegido(rol.Rol) ? "not-allowed" : "pointer",
                      marginRight: "10px",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!esProtegido(rol.Rol)) handleEditarRol(rol);
                    }}
                  />
                  <FaTrash
                    className={`icono ${
                      esProtegido(rol.Rol) ? "text-secondary" : "text-danger"
                    }`}
                    style={{
                      cursor: esProtegido(rol.Rol) ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      if (!esProtegido(rol.Rol))
                        handleEliminarRol(rol.IdRol, rol.Estado, rol.Rol);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-center align-items-center mt-4 mb-3">
              <button
                className="btn btn-light me-2"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                «
              </button>

              {paginaActual > 1 && (
                <button
                  className="btn btn-light me-2"
                  onClick={() => setPaginaActual(paginaActual - 1)}
                >
                  {paginaActual - 1}
                </button>
              )}

              <button className="btn btn-pink me-2">{paginaActual}</button>

              {paginaActual < totalPaginas && (
                <button
                  className="btn btn-light me-2"
                  onClick={() => setPaginaActual(paginaActual + 1)}
                >
                  {paginaActual + 1}
                </button>
              )}

              <button
                className="btn btn-light"
                onClick={() =>
                  setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaActual === totalPaginas}
              >
                »
              </button>
            </div>
      </div>

      {/* Modales */}
      {mostrarModal && (
        <CrearRolModal
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrearRol}
        />
      )}

      {mostrarEditarModal && rolEditar && (
        <EditarRolModal
          rol={rolEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarRol}
        />
      )}

      {mostrarVerModal && rolVer && (
        <VerRolModal rol={rolVer} onClose={() => setMostrarVerModal(false)} />
      )}
    </div>
  );
};

export default ListarRoles;

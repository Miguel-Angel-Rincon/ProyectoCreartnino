import { useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import '../style/style.css';

import CrearRolModal from "./CrearRoles";
import EditarRolModal from "./EditarRoles";
import VerRolModal from "./VerRoles";

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  permisos: string[];
}

const rolesIniciales: Rol[] = [
  {
    idRol: 1,
    nombre: "Administrador",
    descripcion: "Control total del sistema",
    estado: true,
    permisos: ['Dashboard', 'Roles', 'Usuario', 'Clientes', 'Proveedores', 'Compras', 'Productos'],
  },
  {
    idRol: 2,
    nombre: "Vendedor",
    descripcion: "Gestión de productos y ventas",
    estado: true,
    permisos: ['Clientes', 'Proveedores', 'Pedidos', 'Productos'],
  },
  {
    idRol: 3,
    nombre: "Cliente",
    descripcion: "Acceso limitado a compras",
    estado: false,
    permisos: ['Pedidos'],
  },
];

const ListarRoles: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>(rolesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [rolEditar, setRolEditar] = useState<Rol | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [rolVer, setRolVer] = useState<Rol | null>(null);

  const rolesPorPagina = 5;

  const handleEliminarRol = (id: number, estado: boolean, nombre: string) => {
    if (nombre === "Administrador") return;

    if (estado) {
      Swal.fire('Rol activo', 'No puedes eliminar un rol activo. Desactívalo primero.', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        setRoles(prev => prev.filter(r => r.idRol !== id));
        Swal.fire('Eliminado', 'El rol ha sido eliminado correctamente', 'success');
      }
    });
  };

  const handleEstadoChange = (id: number, nombre: string) => {
    if (nombre === "Administrador") return;

    setRoles(prev => prev.map(r => r.idRol === id ? { ...r, estado: !r.estado } : r));
  };

  const handleCrearRol = (nuevoRol: Rol) => {
    setRoles(prev => [...prev, nuevoRol]);
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Rol creado correctamente',
      confirmButtonColor: '#f78fb3',
    });
  };

  const handleEditarRol = (rol: Rol) => {
    if (rol.nombre === "Administrador") return;

    setRolEditar(rol);
    setMostrarEditarModal(true);
  };

  const handleActualizarRol = (rolActualizado: Rol) => {
    setRoles(prev => prev.map(r => r.idRol === rolActualizado.idRol ? rolActualizado : r));
    setMostrarEditarModal(false);
  };

  const handleVerRol = (rol: Rol) => {
    setRolVer(rol);
    setMostrarVerModal(true);
  };

  const rolesFiltrados = roles.filter(r =>
    `${r.nombre} ${r.descripcion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);
  const indexInicio = (paginaActual - 1) * rolesPorPagina;
  const indexFin = indexInicio + rolesPorPagina;
  const rolesPagina = rolesFiltrados.slice(indexInicio, indexFin);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Roles</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Rol</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Rol o descripción"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={e => {
          setBusqueda(e.target.value);
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
              <tr key={rol.idRol} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{rol.nombre}</td>
                <td>{rol.descripcion}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={rol.estado}
                      onChange={() => handleEstadoChange(rol.idRol, rol.nombre)}
                      disabled={rol.nombre === "Administrador"}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerRol(rol)}
                  />
                  <FaEdit
                    className={`icono me-2 ${rol.nombre === "Administrador" ? 'text-secondary' : 'text-warning'}`}
                    style={{ cursor: rol.nombre === "Administrador" ? 'not-allowed' : 'pointer', marginRight: '10px' }}
                    onClick={() => {
                      if (rol.nombre !== "Administrador") handleEditarRol(rol);
                    }}
                  />
                  <FaTrash
                    className={`icono ${rol.nombre === "Administrador" ? 'text-secondary' : 'text-danger'}`}
                    style={{ cursor: rol.nombre === "Administrador" ? 'not-allowed' : 'pointer' }}
                    onClick={() => {
                      if (rol.nombre !== "Administrador") handleEliminarRol(rol.idRol, rol.estado, rol.nombre);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paginacion text-end">
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={`btn me-2 ${paginaActual === i + 1 ? 'btn-pink' : 'btn-light'}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
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
        <VerRolModal
          rol={rolVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarRoles;

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import CrearUsuarioModal from "./Crear";
import EditarUsuarioModal from "./Editar";
import VerUsuarioModal from './Ver';
import type { IUsuarios } from '../../interfaces/IUsuarios';

const ListarUsuarios: React.FC = () => {
  const [Usuarios, setUsuarios] = useState<IUsuarios[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [usuarioVer, setUsuarioVer] = useState<IUsuarios | null>(null);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [UsuarioEditar, setUsuarioEditar] = useState<IUsuarios | null>(null);
  const UsuariosPorPagina = 6;

  // Fetch desde la API
  const obtenerUsuarios = async () => {
    try {
      const response = await fetch("https://apicreartnino.somee.com/api/Usuarios/Lista");
      if (!response.ok) throw new Error("Error al obtener usuarios");
      const data: IUsuarios[] = await response.json();
      setUsuarios(data);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
      });
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleEliminarUsuarios = async (id: number, estado: boolean) => {
  if (estado) {
    Swal.fire({
      icon: 'warning',
      title: 'Usuario activo',
      text: 'No puedes eliminar un Usuario que está activo. Desactívalo primero.',
      confirmButtonColor: '#d33',
    });
    return;
  }

  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const resp = await fetch(
          `https://apicreartnino.somee.com/api/Usuarios/Eliminar/${id}`,
          { method: "DELETE" }
        );

        if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);

        // Refresca la lista
        await obtenerUsuarios();

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El Usuario ha sido eliminado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      } catch (err) {
        console.error("Eliminar usuario:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario. Intenta de nuevo.',
          confirmButtonColor: '#e83e8c',
        });
      }
    }
  });
};

  const handleEstadoChange = async (id: number) => {
  const target = Usuarios.find((u) => u.IdUsuarios === id);
  if (!target) return;

  const actualizado: IUsuarios = { ...target, Estado: !target.Estado };

  // Actualiza localmente
  setUsuarios((prev) =>
    prev.map((u) => (u.IdUsuarios === id ? actualizado : u))
  );

  try {
    const resp = await fetch(
      `https://apicreartnino.somee.com/api/Usuarios/Actualizar/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    // Vuelve a traer los usuarios desde la API
    await obtenerUsuarios();

    // Aviso de éxito
    Swal.fire({
      icon: "success",
      title: "Estado actualizado",
      text: `El usuario ${actualizado.NombreCompleto} ahora está ${actualizado.Estado ? "activo" : "inactivo"}.`,
      confirmButtonColor: "#e83e8c",
    });
  } catch (err) {
    console.error("actualizarEstado:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar el estado del usuario.",
      confirmButtonColor: "#e83e8c",
    });

    // Revertir el cambio local si falla
    setUsuarios((prev) =>
      prev.map((u) => (u.IdUsuarios === id ? target : u))
    );
  }
};

  const handleCrear = (nuevoUsuario: IUsuarios) => {
    setUsuarios(prev => [...prev, nuevoUsuario]);
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Usuario creado correctamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const handleVerUsuario = (usuario: IUsuarios) => {
    setUsuarioVer(usuario);
    setMostrarVerModal(true);
  };

  const handleEditarUsuario = (usuario: IUsuarios) => {
    setUsuarioEditar(usuario);
    setMostrarEditarModal(true);
  };

  const handleActualizarUsuario = (usuarioActualizado: IUsuarios) => {
    setUsuarios(prev =>
      prev.map(p => (p.IdUsuarios === usuarioActualizado.IdUsuarios ? usuarioActualizado : p))
    );
    setMostrarEditarModal(false);
  };

  // Filtrado y paginación
  const UsuariosFiltrados = Usuarios.filter(p =>
    p.NombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.NumDocumento.includes(busqueda) ||
    (p.IdRolNavigation ? p.IdRolNavigation.toString().toLowerCase().includes(busqueda.toLowerCase()) : false) ||
    p.Celular.includes(busqueda)
  );

  const indexInicio = (paginaActual - 1) * UsuariosPorPagina;
  const indexFin = indexInicio + UsuariosPorPagina;
  const UsuariosPagina = UsuariosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(UsuariosFiltrados.length / UsuariosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Usuarios</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Usuario</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre del usuario"
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
              <th># Documento</th>
              <th>Nombre Completo</th>
              <th>Celular</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {UsuariosPagina.map((p, index) => (
              <tr key={p.IdUsuarios} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.TipoDocumento} {p.NumDocumento}</td>
                <td>{p.NombreCompleto}</td>
                <td>{p.Celular}</td>
                <td>
  {p.IdRol === 1 ? "Administrador" : "Usuario"}
</td>

                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={p.Estado}
                      onChange={() => handleEstadoChange(p.IdUsuarios)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerUsuario(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleEditarUsuario(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarUsuarios(p.IdUsuarios, p.Estado)}
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

      {mostrarModal && (
        <CrearUsuarioModal onClose={() => setMostrarModal(false)} onCrear={handleCrear} />
      )}

      {mostrarEditarModal && UsuarioEditar && (
        <EditarUsuarioModal
          usuario={{ ...UsuarioEditar, Contrasena: UsuarioEditar.Contrasena ?? "" }}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarUsuario}
        />
      )}

      {mostrarVerModal && usuarioVer && (
        <VerUsuarioModal
          usuario={{ ...usuarioVer, Contrasena: usuarioVer.Contrasena ?? "" }}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarUsuarios;

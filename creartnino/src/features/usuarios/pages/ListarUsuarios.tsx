import { useState } from "react";
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

import CrearUsuarioModal from "./Crear";
import EditarUsuarioModal from "./Editar";
import VerUsuarioModal from './Ver';

interface Usuarios {
  IdUsuarios: number;
  NombreCompleto: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Celular: string;
  Direccion: string;
  Departamento: string;
  Ciudad: string;
  Correo: string;
  idRol: string;
  estado: boolean;
}

const usuariosiniciales: Usuarios[] = [
  { IdUsuarios: 1, NombreCompleto: 'Juan Pérez', Tipodocumento: 'CC', Numerodocumento: '1010101010', Celular: '3001234567', Direccion: 'Calle 123 #45-67', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'juan.perez@example.com', idRol: 'admin', estado: true },
  { IdUsuarios: 2, NombreCompleto: 'María Gómez', Tipodocumento: 'TI', Numerodocumento: '1020304050', Celular: '3007654321', Direccion: 'Carrera 10 #20-30', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'maria.gomez@example.com', idRol: 'cliente', estado: true },
  { IdUsuarios: 3, NombreCompleto: 'Carlos Ramirez', Tipodocumento: 'CC', Numerodocumento: '1122334455', Celular: '3012345678', Direccion: 'Av. Siempre Viva 742', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'carlos.ramirez@example.com', idRol: 'vendedor', estado: false },
  { IdUsuarios: 4, NombreCompleto: 'Laura Martínez', Tipodocumento: 'CE', Numerodocumento: '5566778899', Celular: '3023456789', Direccion: 'Calle 50 #10-20', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'laura.martinez@example.com', idRol: 'admin', estado: true },
  { IdUsuarios: 5, NombreCompleto: 'Andrés López', Tipodocumento: 'CC', Numerodocumento: '9988776655', Celular: '3034567890', Direccion: 'Diagonal 60 #30-40', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'andres.lopez@example.com', idRol: 'cliente', estado: false },
  { IdUsuarios: 6, NombreCompleto: 'Sofía Torres', Tipodocumento: 'TI', Numerodocumento: '3344556677', Celular: '3045678901', Direccion: 'Transversal 80 #40-50', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'sofia.torres@example.com', idRol: 'cliente', estado: true },
  { IdUsuarios: 7, NombreCompleto: 'Miguel Salazar', Tipodocumento: 'CC', Numerodocumento: '7788990011', Celular: '3056789012', Direccion: 'Calle 70 #30-31', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'miguel.salazar@example.com', idRol: 'vendedor', estado: true },
  { IdUsuarios: 8, NombreCompleto: 'Valentina Ríos', Tipodocumento: 'CE', Numerodocumento: '4455667788', Celular: '3067890123', Direccion: 'Carrera 25 #15-16', Departamento: 'Antioquia', Ciudad: 'Medellín', Correo: 'valentina.rios@example.com', idRol: 'admin', estado: false }
];

const ListarUsuarios: React.FC = () => {
  const [Usuarios, setusuarios] = useState<Usuarios[]>(usuariosiniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [usuarioVer, setUsuariosVer] = useState<Usuarios | null>(null);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [UsuarioEditar, setUsuarioEditar] = useState<Usuarios | null>(null);
  const UsuariosPorPagina = 6;

  const handleEliminarUsuarios = (id: number, estado: boolean) => {
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
    }).then((result) => {
      if (result.isConfirmed) {
        setusuarios(prev => prev.filter(p => p.IdUsuarios !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El Usuario ha sido eliminado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleEstadoChange = (id: number) => {
    setusuarios(prev =>
      prev.map(p => (p.IdUsuarios === id ? { ...p, estado: !p.estado } : p))
    );
  };

  const handleCrear = (nuevoUsuario: Usuarios) => {
    setusuarios(prev => [...prev, nuevoUsuario]);
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Usuario creado correctamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const handleVerusuario = (usuario: Usuarios) => {
    setUsuariosVer(usuario);
    setMostrarVerModal(true);
  };

  const handleEditarUsuario = (usuario: Usuarios) => {
    setUsuarioEditar(usuario);
    setMostrarEditarModal(true);
  };

  const handleActualizarProducto = (UsuariosActualizado: Usuarios) => {
    setusuarios(prev =>
      prev.map(p => (p.IdUsuarios === UsuariosActualizado.IdUsuarios ? UsuariosActualizado : p))
    );
    setMostrarEditarModal(false);
  };

  const UsuariosFiltrados = Usuarios.filter(p =>
    p.NombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
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
                <td>{p.Tipodocumento} {p.Numerodocumento}</td>
                <td>{p.NombreCompleto}</td>
                
                <td>{p.Celular}</td>
                <td>{p.idRol}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={p.estado}
                      onChange={() => handleEstadoChange(p.IdUsuarios)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerusuario(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleEditarUsuario(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarUsuarios(p.IdUsuarios, p.estado)}
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
        <EditarUsuarioModal usuario={UsuarioEditar} onClose={() => setMostrarEditarModal(false)} onEditar={handleActualizarProducto} />
      )}

      {mostrarVerModal && usuarioVer && (
        <VerUsuarioModal usuario={usuarioVer} onClose={() => setMostrarVerModal(false)} />
      )}
    </div>
  );
};

export default ListarUsuarios;

import { useState } from "react";
import '../style/Listar.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

import CrearProveedorModal from "./NuevoProveedor";
import EditarProveedorModal from "./Editar";
import VerProveedoresModal from './Ver'; // 👈 Nuevo import

interface Proveedores {
  IdProveedores: number;
  TipoPersona: string;
  TipoDocumento: string;
  NumDocumento: string;
  NombreCompleto: string;
  
  Ciudad: string;
  Direccion: string;
  Celular: string;
  estado: boolean;
}

const proveedoresiniciales: Proveedores[] = [
  { IdProveedores: 1, TipoPersona: 'Natural', TipoDocumento: 'CC', NombreCompleto: 'Juan Pérez', NumDocumento: '123456789',  Ciudad: 'Medellín', Direccion: 'Cra 50 #45-20', Celular: '3001234567', estado: true },
  { IdProveedores: 2, TipoPersona: 'Jurídica', TipoDocumento: 'NIT', NombreCompleto: 'Comercializadora XYZ S.A.S.', NumDocumento: '900123456', Ciudad: 'Bogotá', Direccion: 'Av 68 #24-30', Celular: '3109876543', estado: false },
  { IdProveedores: 3, TipoPersona: 'Natural', TipoDocumento: 'CC', NombreCompleto: 'Ana Gómez', NumDocumento: '456789123',  Ciudad: 'Barranquilla', Direccion: 'Cll 72 #35-15', Celular: '3112233445', estado: true },
  { IdProveedores: 4, TipoPersona: 'Jurídica', TipoDocumento: 'NIT', NombreCompleto: 'Distribuciones ABC Ltda.', NumDocumento: '901234567',  Ciudad: 'Cartagena', Direccion: 'Cra 17 #27-80', Celular: '3201122334', estado: true },
  { IdProveedores: 5, TipoPersona: 'Natural', TipoDocumento: 'CC', NombreCompleto: 'Luis Martínez', NumDocumento: '321654987',  Ciudad: 'Cali', Direccion: 'Cll 5 #60-45', Celular: '3025566778', estado: false },
  { IdProveedores: 6, TipoPersona: 'Jurídica', TipoDocumento: 'NIT', NombreCompleto: 'Importadora Nacional S.A.', NumDocumento: '902345678',  Ciudad: 'Medellín', Direccion: 'Cll 30 #80-70', Celular: '3134455667', estado: true },
  { IdProveedores: 7, TipoPersona: 'Natural', TipoDocumento: 'CC', NombreCompleto: 'Carlos Ruiz', NumDocumento: '654987321',  Ciudad: 'Valledupar', Direccion: 'Cra 40 #18-90', Celular: '3049988776', estado: true },
  { IdProveedores: 8, TipoPersona: 'Jurídica', TipoDocumento: 'NIT', NombreCompleto: 'Servicios Integrales SAS', NumDocumento: '903456789',  Ciudad: 'Villavicencio', Direccion: 'Cll 15 #33-55', Celular: '3011122334', estado: false }
];



const ListarProveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedores[]>(proveedoresiniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [proveedorEditar, setProveedoresEditar] = useState<Proveedores | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [proveedorVer, setProveedorVer] = useState<Proveedores | null>(null);

  const productosPorPagina = 6;

  const handleEliminarProducto = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: 'warning',
        title: 'Proveedor activo',
        text: 'No puedes eliminar el proveedor que está activo. Desactívalo primero.',
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
        setProveedores(prev => prev.filter(p => p.IdProveedores !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El proveedor ha sido eliminado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleEstadoChange = (id: number) => {
    setProveedores(prev =>
      prev.map(p => (p.IdProveedores === id ? { ...p, estado: !p.estado } : p))
    );
  };


  const handleEditarProveedor = (proveedor: Proveedores) => {
    setProveedoresEditar(proveedor);
    setMostrarEditarModal(true);
  };

  const handleVerProveedor = (Proveedor: Proveedores) => {
    setProveedorVer(Proveedor);
    setMostrarVerModal(true);
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.NombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.NumDocumento.includes(busqueda) ||
    p.Ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.Celular.includes(busqueda)
  );

  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const proveedoresPagina = proveedoresFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / productosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Proveedores</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Proveedor</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre del Proveedor"
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
              <th>Ciudad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresPagina.map((p, index) => (
              <tr key={p.IdProveedores} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.TipoDocumento} {p.NumDocumento}</td>
                <td>{p.NombreCompleto}</td>
                <td>{p.Celular}</td>
                <td>{p.Ciudad}</td>
                
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={p.estado}
                      onChange={() => handleEstadoChange(p.IdProveedores)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleVerProveedor(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => handleEditarProveedor(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarProducto(p.IdProveedores, p.estado)}
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
  <CrearProveedorModal
    onClose={() => setMostrarModal(false)}
    onCrear={(nuevoProveedor: any) => {
      const proveedorMapeado: Proveedores = {
        IdProveedores: Math.max(...proveedores.map(p => p.IdProveedores)) + 1,
        TipoPersona: nuevoProveedor.TipoPersona,
        TipoDocumento: nuevoProveedor.IdTipoDocumento,
        NumDocumento: nuevoProveedor.NumDocumento,
        NombreCompleto: nuevoProveedor.NombreCompleto,
        Ciudad: nuevoProveedor.Ciudad,
        Direccion: nuevoProveedor.Direccion,
        Celular: nuevoProveedor.Celular,
        estado: nuevoProveedor.estado
      };
      
      setProveedores(prev => [...prev, proveedorMapeado]);
      setMostrarModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Proveedor creado correctamente',
        confirmButtonColor: '#e83e8c',
      });
    }}
  />
)}

{mostrarEditarModal && proveedorEditar && (
  <EditarProveedorModal
    proveedor={{
      ...proveedorEditar,
      IdTipoPersona: proveedorEditar.TipoPersona,
      IdTipoDocumento: proveedorEditar.TipoDocumento,
      Departamento: '' // Agregar si no existe
    }}
    onClose={() => setMostrarEditarModal(false)}
    onEditar={(proveedorActualizado: any) => {
      const proveedorMapeado: Proveedores = {
        IdProveedores: proveedorActualizado.IdProveedores,
        TipoPersona: proveedorActualizado.IdTipoPersona,
        TipoDocumento: proveedorActualizado.IdTipoDocumento,
        NumDocumento: proveedorActualizado.NumDocumento,
        NombreCompleto: proveedorActualizado.NombreCompleto,
        Ciudad: proveedorActualizado.Ciudad,
        Direccion: proveedorActualizado.Direccion,
        Celular: proveedorActualizado.Celular,
        estado: proveedorActualizado.estado
      };

      setProveedores(prev =>
        prev.map(p => (p.IdProveedores === proveedorMapeado.IdProveedores ? proveedorMapeado : p))
      );
      setMostrarEditarModal(false);
    }}
  />
)}

      {mostrarVerModal && proveedorVer && (
        <VerProveedoresModal
          proveedor={proveedorVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarProveedores;
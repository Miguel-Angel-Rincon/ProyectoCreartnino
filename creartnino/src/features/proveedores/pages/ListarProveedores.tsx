import { useState } from "react";
import '../style/Listar.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

// import CrearProductoModal from "./NuevoProducto";
// import EditarProductoModal from "./Editar";
// import VerProductoModal from './Ver'; // 👈 Nuevo import

interface Proveedores {
  IdProveedores: number;
  IdTipoPersona: string;
  IdTipoDocumento: string;
  NombreCompleto: string;
  NumDocumento: string;
  Departamento: string;
  Ciudad: string;
  Direccion: string;
  Celular: string;
  estado: boolean;
}

const proveedoresiniciales: Proveedores[] = [
  { IdProveedores: 1, IdTipoPersona: 'Natural', IdTipoDocumento: 'CC', NombreCompleto: 'Juan Pérez', NumDocumento: '123456789', Departamento: 'Antioquia', Ciudad: 'Medellín', Direccion: 'Cra 50 #45-20', Celular: '3001234567', estado: true },
  { IdProveedores: 2, IdTipoPersona: 'Jurídica', IdTipoDocumento: 'NIT', NombreCompleto: 'Comercializadora XYZ S.A.S.', NumDocumento: '900123456', Departamento: 'Cundinamarca', Ciudad: 'Bogotá', Direccion: 'Av 68 #24-30', Celular: '3109876543', estado: false },
  { IdProveedores: 3, IdTipoPersona: 'Natural', IdTipoDocumento: 'CC', NombreCompleto: 'Ana Gómez', NumDocumento: '456789123', Departamento: 'Atlántico', Ciudad: 'Barranquilla', Direccion: 'Cll 72 #35-15', Celular: '3112233445', estado: true },
  { IdProveedores: 4, IdTipoPersona: 'Jurídica', IdTipoDocumento: 'NIT', NombreCompleto: 'Distribuciones ABC Ltda.', NumDocumento: '901234567', Departamento: 'Bolívar', Ciudad: 'Cartagena', Direccion: 'Cra 17 #27-80', Celular: '3201122334', estado: true },
  { IdProveedores: 5, IdTipoPersona: 'Natural', IdTipoDocumento: 'CC', NombreCompleto: 'Luis Martínez', NumDocumento: '321654987', Departamento: 'Valle del Cauca', Ciudad: 'Cali', Direccion: 'Cll 5 #60-45', Celular: '3025566778', estado: false },
  { IdProveedores: 6, IdTipoPersona: 'Jurídica', IdTipoDocumento: 'NIT', NombreCompleto: 'Importadora Nacional S.A.', NumDocumento: '902345678', Departamento: 'Antioquia', Ciudad: 'Medellín', Direccion: 'Cll 30 #80-70', Celular: '3134455667', estado: true },
  { IdProveedores: 7, IdTipoPersona: 'Natural', IdTipoDocumento: 'CC', NombreCompleto: 'Carlos Ruiz', NumDocumento: '654987321', Departamento: 'Cesar', Ciudad: 'Valledupar', Direccion: 'Cra 40 #18-90', Celular: '3049988776', estado: true },
  { IdProveedores: 8, IdTipoPersona: 'Jurídica', IdTipoDocumento: 'NIT', NombreCompleto: 'Servicios Integrales SAS', NumDocumento: '903456789', Departamento: 'Meta', Ciudad: 'Villavicencio', Direccion: 'Cll 15 #33-55', Celular: '3011122334', estado: false }
];



const ListarProveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedores[]>(proveedoresiniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
//   const [mostrarModal, setMostrarModal] = useState(false);
//   const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
//   const [productoEditar, setProductoEditar] = useState<Proveedores | null>(null);
//   const [mostrarVerModal, setMostrarVerModal] = useState(false);
//   const [productoVer, setProductoVer] = useState<Proveedores | null>(null);

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

//   const handleCrear = (nuevoProducto: Proveedores) => {
//     setProductos(prev => [...prev, nuevoProducto]);
//     setMostrarModal(false);
//     Swal.fire({
//       icon: 'success',
//       title: 'Producto creado correctamente',
//       confirmButtonColor: '#e83e8c',
//     });
//   };

//   const handleEditarProducto = (producto: Productos) => {
//     setProductoEditar(producto);
//     setMostrarEditarModal(true);
//   };

//   const handleActualizarProducto = (productoActualizado: Productos) => {
//     setProductos(prev =>
//       prev.map(p => (p.IdProducto === productoActualizado.IdProducto ? productoActualizado : p))
//     );
//     setMostrarEditarModal(false);
//   };

//   const handleVerProducto = (producto: Productos) => {
//     setProductoVer(producto);
//     setMostrarVerModal(true);
//   };

  const proveedoresFiltrados = proveedores.filter(p =>
    `${p.NombreCompleto}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const productosPagina = proveedoresFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / productosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Proveedores</h2>
        <button className="btn btn-pink" /* onClick={() => setMostrarModal(true)}*/>Crear Proveedor</button>
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
              <th>Id Producto</th>
              <th>Nombre Completo</th>
              <th># Documento</th>
              <th>Departamento</th>
              <th>Ciudad</th>
              <th>Celular</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((p, index) => (
              <tr key={p.IdProveedores} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.IdProveedores}</td>
                <td>{p.NombreCompleto}</td>
                <td>{p.NumDocumento}</td>
                <td>{p.Departamento}</td>
                <td>{p.Ciudad}</td>
                <td>{p.Celular}</td>
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
                    /*onClick={() => handleVerProducto(p)}*/
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    /*onClick={() => handleEditarProducto(p)}*/
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

      {/* {mostrarModal && (
        <CrearProductoModal
          onClose={() => setMostrarModal(false)}
          onCrear={handleCrear}
        />
      )}

      {mostrarEditarModal && productoEditar && (
        <EditarProductoModal
          producto={productoEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarProducto}
        />
      )}

      {mostrarVerModal && productoVer && (
        <VerProductoModal
          producto={productoVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )} */}
    </div>
  );
};

export default ListarProveedores;

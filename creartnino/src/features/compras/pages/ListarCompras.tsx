import { useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import CrearCompra from './crear'; // Modal

interface Compras {
  IdCompra: number;
  IdProveedor: string;
  MetodoPago: string;
  FechaCompra: string;
  TotalCompra: number;
  IdEstado: string;
}

const comprasIniciales: Compras[] = [
  { IdCompra: 601, IdProveedor: 'Lucas', MetodoPago: 'Tarjeta', FechaCompra: '2025-05-01', TotalCompra: 120000, IdEstado: 'Anulado' },
  { IdCompra: 602, IdProveedor: 'Marta', MetodoPago: 'Efectivo', FechaCompra: '2025-05-02', TotalCompra: 200000, IdEstado: 'En proceso' },
  { IdCompra: 603, IdProveedor: 'Mario', MetodoPago: 'Transferencia', FechaCompra: '2025-05-03', TotalCompra: 150000, IdEstado: 'En proceso' },
  { IdCompra: 604, IdProveedor: 'Laura', MetodoPago: 'Tarjeta', FechaCompra: '2025-05-04', TotalCompra: 120000, IdEstado: 'Completado' },
  { IdCompra: 605, IdProveedor: 'Andres', MetodoPago: 'Efectivo', FechaCompra: '2025-05-05', TotalCompra: 180000, IdEstado: 'Completado' },
  { IdCompra: 606, IdProveedor: 'Penelope', MetodoPago: 'Transferencia', FechaCompra: '2025-05-06', TotalCompra: 160000, IdEstado: 'Anulado' },
  { IdCompra: 607, IdProveedor: 'Juan', MetodoPago: 'Tarjeta', FechaCompra: '2025-05-07', TotalCompra: 210000, IdEstado: 'En proceso' },
  { IdCompra: 608, IdProveedor: 'Angel', MetodoPago: 'Efectivo', FechaCompra: '2025-05-08', TotalCompra: 130000, IdEstado: 'Completado' }
];

const ListarCompras: React.FC = () => {
  const [compras, setCompras] = useState<Compras[]>(comprasIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  const comprasPorPagina = 6;

  const handleEliminarCompra = (id: number) => {
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
        setCompras(prev => prev.filter(p => p.IdCompra !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La compra ha sido eliminada correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const comprasFiltradas = compras.filter(p =>
    p.IdCompra.toString().includes(busqueda)
  );

  const indexInicio = (paginaActual - 1) * comprasPorPagina;
  const indexFin = indexInicio + comprasPorPagina;
  const comprasPagina = comprasFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina);

  const handleCrearCompra = (nuevaCompra: any) => {
    const nueva: Compras = {
      IdCompra: compras.length + 609,
      IdProveedor: nuevaCompra.proveedorSeleccionado,
      MetodoPago: nuevaCompra.metodoPago,
      FechaCompra: nuevaCompra.fechaCompra,
      TotalCompra: nuevaCompra.detalleCompra.reduce((acc: number, item: any) => acc + item.cantidad * item.precio, 0),
      IdEstado: 'En proceso'
    };
    setCompras([...compras, nueva]);
    setMostrarModal(false);
    Swal.fire('Éxito', 'Compra registrada correctamente', 'success');
  };

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Compras</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>Crear Compra</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por ID de la compra"
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
              <th>Id Compra</th>
              <th>Proveedor</th>
              <th>Método Pago</th>
              <th>Fecha de Compra</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasPagina.map((p, index) => (
              <tr key={p.IdCompra} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.IdCompra}</td>
                <td>{p.IdProveedor}</td>
                <td>{p.MetodoPago}</td>
                <td>{p.FechaCompra}</td>
                <td>${p.TotalCompra.toLocaleString()}</td>
                <td>{p.IdEstado}</td>
                <td>
                  <FaEye className="icono text-info" style={{ cursor: 'pointer', marginRight: '10px' }} />
                  <FaEdit className="icono text-warning" style={{ cursor: 'pointer', marginRight: '10px' }} />
                  <FaTrash className="icono text-danger" style={{ cursor: 'pointer' }} onClick={() => handleEliminarCompra(p.IdCompra)} />
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <CrearCompra
                onClose={() => setMostrarModal(false)}
                onCrear={handleCrearCompra}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarCompras;

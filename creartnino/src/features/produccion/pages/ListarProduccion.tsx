import { useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

// import CrearProduccionModal from "./NuevaProduccion";
// import EditarProduccionModal from "./Editar";
// import VerProduccionModal from './Ver';

interface Producciones {
  IdProduccion: number;
  Nombre: string; // string | number
  TipoProducción: string;
  FechaRegistro: string;
  FechaFinal: string;
  EstadosPedido: string;
  Estado: string;
}

const produccionesIniciales: Producciones[] = [
  { IdProduccion: 601, Nombre: 'Lucas', TipoProducción: 'Tipo A', FechaRegistro: '2025-05-01', FechaFinal: '2025-05-05', EstadosPedido: 'Inicial', Estado: 'Pendiente' },
  { IdProduccion: 602, Nombre: 'Marta', TipoProducción: 'Tipo B', FechaRegistro: '2025-05-02', FechaFinal: '2025-05-06', EstadosPedido: 'Inicial', Estado: 'Finalizado' },
  { IdProduccion: 603, Nombre: 'Mario', TipoProducción: 'Tipo C', FechaRegistro: '2025-05-03', FechaFinal: '2025-05-07', EstadosPedido: 'Intermedio', Estado: 'En proceso' },
  { IdProduccion: 604, Nombre: 'Laura', TipoProducción: 'Tipo D', FechaRegistro: '2025-05-04', FechaFinal: '2025-05-08', EstadosPedido: 'Inicial', Estado: 'Pendiente' },
  { IdProduccion: 605, Nombre: 'Andres', TipoProducción: 'Tipo E', FechaRegistro: '2025-05-05', FechaFinal: '2025-05-09', EstadosPedido: 'Final', Estado: 'Finalizado' },
  { IdProduccion: 606, Nombre: 'Penelope', TipoProducción: 'Tipo F', FechaRegistro: '2025-05-06', FechaFinal: '2025-05-10', EstadosPedido: 'Intermedio', Estado: 'En proceso' },
  { IdProduccion: 607, Nombre: 'Juan', TipoProducción: 'Tipo G', FechaRegistro: '2025-05-07', FechaFinal: '2025-05-11', EstadosPedido: 'Final', Estado: 'Finalizado' },
  { IdProduccion: 608, Nombre: 'Angel', TipoProducción: 'Tipo H', FechaRegistro: '2025-05-08', FechaFinal: '2025-05-12', EstadosPedido: 'Inicial', Estado: 'Pendiente' }
];

const ListarProduccion: React.FC = () => {
  const [producciones, setProducciones] = useState<Producciones[]>(produccionesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const produccionesPorPagina = 6;

  const handleEliminarProduccion = (id: number) => {
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
        setProducciones(prev => prev.filter(p => p.IdProduccion !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La producción ha sido eliminada correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const produccionesFiltradas = producciones.filter(p =>
    `${p.IdProduccion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * produccionesPorPagina;
  const indexFin = indexInicio + produccionesPorPagina;
  const produccionesPagina = produccionesFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(produccionesFiltradas.length / produccionesPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Producciones</h2>
        <button className="btn btn-pink">Crear Producción</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por ID de la Producción"
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
              <th>Id Producción</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Fecha Registro</th>
              <th>Fecha Final</th>
              <th>Estado Pedido</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {produccionesPagina.map((p, index) => (
              <tr key={p.IdProduccion} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.Nombre}</td>
                <td>{p.TipoProducción}</td>
                <td>{p.FechaRegistro}</td>
                <td>{p.FechaFinal}</td>
                <td>{p.EstadosPedido}</td>
                <td>{p.Estado}</td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    // onClick={() => handleVerProduccion(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    // onClick={() => handleEditarProduccion(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarProduccion(p.IdProduccion)}
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
    </div>
  );
};

export default ListarProduccion;

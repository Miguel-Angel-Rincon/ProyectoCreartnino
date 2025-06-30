import { useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaBan } from 'react-icons/fa';
import CrearProduccion from "./Crear";
import VerProduccionModal from "./Ver";
import EditarProduccionModal from "./Editar";

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
}

interface Producciones {
  IdProduccion: number;
  Nombre: string;
  TipoProduccion: string;
  FechaRegistro: string;
  FechaFinal: string;
  EstadosPedido: string;
  Estado: string;
  Productos?: DetalleProduccion[];
}

const produccionesIniciales: Producciones[] = [
  { IdProduccion: 601, Nombre: 'Produccion 1', TipoProduccion: 'Directa', FechaRegistro: '2025-05-01', FechaFinal: '2025-05-05', EstadosPedido: 'primer pago', Estado: 'en proceso' },
  { IdProduccion: 602, Nombre: 'Produccion 2', TipoProduccion: 'Directa', FechaRegistro: '2025-05-02', FechaFinal: '2025-05-06', EstadosPedido: 'en proceso', Estado: 'completado' },
  { IdProduccion: 603, Nombre: 'Produccion 3', TipoProduccion: 'Pedido', FechaRegistro: '2025-05-03', FechaFinal: '2025-05-07', EstadosPedido: 'en producción', Estado: 'anulado' },
  { IdProduccion: 604, Nombre: 'Produccion 4', TipoProduccion: 'Directa', FechaRegistro: '2025-05-04', FechaFinal: '2025-05-08', EstadosPedido: 'en proceso de entrega', Estado: 'completado' },
  { IdProduccion: 605, Nombre: 'Produccion 5', TipoProduccion: 'Directa', FechaRegistro: '2025-05-01', FechaFinal: '2025-05-05', EstadosPedido: 'primer pago', Estado: 'en proceso' },
  { IdProduccion: 606, Nombre: 'Produccion 6', TipoProduccion: 'Directa', FechaRegistro: '2025-05-02', FechaFinal: '2025-05-06', EstadosPedido: 'en proceso', Estado: 'completado' },
  { IdProduccion: 607, Nombre: 'Produccion 7', TipoProduccion: 'Pedido', FechaRegistro: '2025-05-03', FechaFinal: '2025-05-07', EstadosPedido: 'en producción', Estado: 'anulado' },
  { IdProduccion: 608, Nombre: 'Produccion 8', TipoProduccion: 'Directa', FechaRegistro: '2025-05-04', FechaFinal: '2025-05-08', EstadosPedido: 'en proceso de entrega', Estado: 'completado' },
];

const ListarProduccion: React.FC = () => {
  const [producciones, setProducciones] = useState<Producciones[]>(produccionesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [produccionSeleccionada, setProduccionSeleccionada] = useState<Producciones | null>(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [produccionAEditar, setProduccionAEditar] = useState<Producciones | null>(null);

  const produccionesPorPagina = 6;

  const getColorClaseEstadoPedido = (estado: string) => {
    switch (estado) {
      case 'primer pago': return 'estado-primer-pago';
      case 'en proceso': return 'estado-en-proceso';
      case 'en producción': return 'estado-en-produccion';
      case 'en proceso de entrega': return 'estado-en-proceso-entrega';
      case 'entregado': return 'estado-entregado';
      case 'anulado': return 'estado-anulado';
      default: return '';
    }
  };

  const getColorClaseEstadoProduccion = (estado: string) => {
    switch (estado) {
      case 'en proceso': return 'estado-produccion-en-proceso';
      case 'completado': return 'estado-produccion-completado';
      case 'anulado': return 'estado-produccion-anulado';
      default: return '';
    }
  };

  const handleAnularProduccion = (id: number) => {
    const produccion = producciones.find(p => p.IdProduccion === id);
    if (produccion?.Estado === 'anulado') return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cambiará el estado a "anulado"',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setProducciones(prev =>
          prev.map(p =>
            p.IdProduccion === id ? { ...p, Estado: 'anulado' } : p
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Anulado',
          text: 'La producción ha sido anulada correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleCrearProduccion = (nuevaProduccion: Producciones) => {
    setProducciones(prev => [nuevaProduccion, ...prev]);
    setMostrarModalCrear(false);
    Swal.fire({
      icon: 'success',
      title: 'Creado',
      text: 'La producción ha sido registrada correctamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const produccionesFiltradas = producciones.filter(p =>
    p.Nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * produccionesPorPagina;
  const indexFin = indexInicio + produccionesPorPagina;
  const produccionesPagina = produccionesFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(produccionesFiltradas.length / produccionesPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Producciones</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModalCrear(true)}>Crear Producción</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre de producción"
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
                <td>{p.TipoProduccion}</td>
                <td>{p.FechaRegistro}</td>
                <td>{p.FechaFinal}</td>
                <td>
                  <select
                    className={`form-select estado-select ${getColorClaseEstadoPedido(p.EstadosPedido)}`}
                    value={p.EstadosPedido}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      setProducciones(prev =>
                        prev.map(prod =>
                          prod.IdProduccion === p.IdProduccion
                            ? { ...prod, EstadosPedido: nuevoEstado }
                            : prod
                        )
                      );
                    }}
                  >
                    <option value="primer pago">Primer Pago</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="en producción">En Producción</option>
                    <option value="en proceso de entrega">En Proceso de Entrega</option>
                    <option value="entregado">Entregado</option>
                    <option value="anulado">Anulado</option>
                  </select>
                </td>
                <td>
                  <select
                    className={`form-select estado-select ${getColorClaseEstadoProduccion(p.Estado)}`}
                    value={p.Estado}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      setProducciones(prev =>
                        prev.map(prod =>
                          prod.IdProduccion === p.IdProduccion
                            ? { ...prod, Estado: nuevoEstado }
                            : prod
                        )
                      );
                    }}
                    disabled={p.Estado === 'anulado'}
                  >
                    <option value="en proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="anulado">Anulado</option>
                  </select>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => setProduccionSeleccionada(p)}
                  />
                  <FaEdit
                    className={`icono ${p.Estado === 'anulado' ? 'text-secondary' : 'text-warning'}`}
                    style={{
                      cursor: p.Estado === 'anulado' ? 'not-allowed' : 'pointer',
                      marginRight: '10px'
                    }}
                    onClick={() => {
                      if (p.Estado !== 'anulado') {
                        setProduccionAEditar(p);
                        setMostrarModalEditar(true);
                      }
                    }}
                  />
                  <FaBan
                    className={`icono ${p.Estado === 'anulado' ? 'text-secondary' : 'text-danger'}`}
                    style={{ cursor: p.Estado === 'anulado' ? 'not-allowed' : 'pointer' }}
                    onClick={() => {
                      if (p.Estado !== 'anulado') {
                        handleAnularProduccion(p.IdProduccion);
                      }
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

      {mostrarModalCrear && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <CrearProduccion
              onClose={() => setMostrarModalCrear(false)}
              onCrear={handleCrearProduccion}
            />
          </div>
        </div>
      )}

      {produccionSeleccionada && (
        <VerProduccionModal
          produccion={{
            ...produccionSeleccionada,
            Productos: produccionSeleccionada.Productos ?? []
          }}
          onClose={() => setProduccionSeleccionada(null)}
        />
      )}

      {mostrarModalEditar && produccionAEditar && (
        <EditarProduccionModal
          produccion={{
            ...produccionAEditar,
            Productos: produccionAEditar.Productos ?? []
          }}
          onClose={() => setMostrarModalEditar(false)}
          onGuardar={(produccionActualizada) => {
            setProducciones(prev =>
              prev.map(p => p.IdProduccion === produccionActualizada.IdProduccion ? produccionActualizada : p)
            );
            setMostrarModalEditar(false);
            Swal.fire({
              icon: 'success',
              title: 'Actualizado',
              text: 'La producción se actualizó correctamente',
              confirmButtonColor: '#e83e8c',
            });
          }}
        />
      )}
    </div>
  );
};

export default ListarProduccion;

import { useEffect, useState } from "react";
import '../styles/style.css';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaBan } from 'react-icons/fa';
import CrearProduccion from "./Crear";
import VerProduccionVista from "./Ver";
import EditarProduccionModal from "./Editar";

interface InsumoGasto {
  insumo: string;
  cantidadUsada: number;
  disponible: number;
}

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
  insumos?: InsumoGasto[];
}

interface Producciones {
  IdProduccion: number;
  Nombre: string;
  TipoProduccion: string;
  FechaRegistro: string;
  FechaFinal: string;
  EstadosPedido: string;
  Estado: string;
  Productos: DetalleProduccion[];
}

const produccionesIniciales: Producciones[] = [
  { IdProduccion: 601, Nombre: 'Produccion 1', TipoProduccion: 'Directa', FechaRegistro: '2025-05-01', FechaFinal: '2025-05-05', EstadosPedido: 'primer pago', Estado: 'en proceso', Productos: [] },
  { IdProduccion: 602, Nombre: 'Produccion 2', TipoProduccion: 'Directa', FechaRegistro: '2025-05-08', FechaFinal: '2025-08-06', EstadosPedido: 'en proceso', Estado: 'completado', Productos: [] },
  { IdProduccion: 603, Nombre: 'Produccion 3', TipoProduccion: 'Pedido', FechaRegistro: '2025-05-08', FechaFinal: '2025-06-07', EstadosPedido: 'en producción', Estado: 'en proceso', Productos: [] },
  { IdProduccion: 604, Nombre: 'Produccion 4', TipoProduccion: 'Pedido', FechaRegistro: '2025-05-04', FechaFinal: '2025-07-08', EstadosPedido: 'en proceso de entrega', Estado: 'en proceso', Productos: [] },
];

const ListarProduccion: React.FC = () => {
  const [producciones, setProducciones] = useState<Producciones[]>(produccionesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [produccionSeleccionada, setProduccionSeleccionada] = useState<Producciones | null>(null);
  const [mostrarCrearVista, setMostrarCrearVista] = useState(false);
  const [vistaEditar, setVistaEditar] = useState<Producciones | null>(null);

  const produccionesPorPagina = 6;

  const getColorClaseEstadoProduccion = (estado: string) => {
    switch (estado) {
      case 'en proceso': return 'estado-produccion-en-proceso';
      case 'completado': return 'estado-produccion-completado';
      case 'anulado': return 'estado-produccion-anulado';
      default: return '';
    }
  };

  useEffect(() => {
    const hoy = new Date();
    let anuladas: Producciones[] = [];

    const actualizadas = producciones.map(p => {
      const fechaFin = new Date(p.FechaFinal);
      if (fechaFin < hoy && p.Estado !== 'completado' && p.Estado !== 'anulado') {
        anuladas.push(p);
        return { ...p, Estado: 'anulado' };
      }
      return p;
    });

    if (anuladas.length > 0) {
      setTimeout(() => {
        Swal.fire({
          icon: 'warning',
          title: '⚠️ Producciones Anuladas Automáticamente',
          html: `
            ${anuladas.map(a => `<p><strong>${a.Nombre}</strong> (ID: ${a.IdProduccion}) fue anulada porque su fecha final (${a.FechaFinal}) ya pasó.</p>`).join('')}
          `,
          confirmButtonColor: '#f08c8c',
        });
      }, 200);
    }

    setProducciones(actualizadas);
  }, []);

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
    setMostrarCrearVista(false);
    Swal.fire({
      icon: 'success',
      title: 'Creado',
      text: 'La producción ha sido registrada correctamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const produccionesFiltradas = producciones.filter(p => {
    const texto = busqueda.toLowerCase();
    return (
      p.Nombre.toLowerCase().includes(texto) ||
      p.TipoProduccion.toLowerCase().includes(texto) ||
      p.FechaRegistro.toLowerCase().includes(texto) ||
      p.FechaFinal.toLowerCase().includes(texto)
    );
  });

  const indexInicio = (paginaActual - 1) * produccionesPorPagina;
  const indexFin = indexInicio + produccionesPorPagina;
  const produccionesPagina = produccionesFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(produccionesFiltradas.length / produccionesPorPagina);

  if (mostrarCrearVista) {
    return (
      <CrearProduccion
        onClose={() => setMostrarCrearVista(false)}
        onCrear={handleCrearProduccion}
      />
    );
  }

  if (vistaEditar) {
    return (
      <EditarProduccionModal
        produccion={vistaEditar}
        onClose={() => setVistaEditar(null)}
        onGuardar={(produccionActualizada) => {
          setProducciones(prev =>
            prev.map(p => p.IdProduccion === produccionActualizada.IdProduccion ? produccionActualizada : p)
          );
          setVistaEditar(null);
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'La producción se actualizó correctamente',
            confirmButtonColor: '#e83e8c',
          });
        }}
      />
    );
  }

  if (produccionSeleccionada) {
    const fechaFinal = new Date(produccionSeleccionada.FechaFinal);
    const hoy = new Date();
    const diferenciaTiempo = fechaFinal.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    Swal.fire({
      icon: diasRestantes >= 0 ? 'info' : 'warning',
      title: diasRestantes >= 0 ? '⏳ Tiempo restante' : '⚠️ Producción finalizada',
      text: diasRestantes >= 0
        ? `Faltan ${diasRestantes} día(s) para finalizar esta producción.`
        : 'La fecha de finalización ya pasó.',
      confirmButtonColor: diasRestantes >= 0 ? '#a58cf0' : '#f08c8c',
    });

    return (
      <VerProduccionVista
        produccion={produccionSeleccionada}
        onClose={() => setProduccionSeleccionada(null)}
      />
    );
  }

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Producciones</h2>
        <button className="btn btn-pink" onClick={() => setMostrarCrearVista(true)}>Crear Producción</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por cualquier campo visible (excepto estado)"
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
              <th>Fecha de Inicio</th>
              <th>Fecha Final</th>
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
                    className={`form-select estado-select ${getColorClaseEstadoProduccion(p.Estado)}`}
                    value={p.Estado}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      setProducciones(prev =>
                        prev.map(prod =>
                          prod.IdProduccion === p.IdProduccion
                            ? {
                                ...prod,
                                Estado: nuevoEstado,
                                EstadosPedido:
                                  prod.TipoProduccion === 'Pedido' && nuevoEstado === 'completado'
                                    ? 'entregado'
                                    : prod.EstadosPedido
                              }
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
                    onClick={() => setProduccionSeleccionada({ ...p, Productos: p.Productos ?? [] })}
                  />
                  <FaEdit
                    className={`icono ${p.Estado === 'anulado' ? 'text-secondary' : 'text-warning'}`}
                    style={{
                      cursor: p.Estado === 'anulado' ? 'not-allowed' : 'pointer',
                      marginRight: '10px'
                    }}
                    onClick={() => {
                      if (p.Estado !== 'anulado') {
                        setVistaEditar({ ...p, Productos: p.Productos ?? [] });
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
    </div>
  );
};

export default ListarProduccion;

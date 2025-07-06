// src/pages/MisCompras.tsx
import { useState } from 'react';
import { useCompras } from '../../../context/CompraContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaTimes,
  FaBoxOpen,
  FaEye
} from 'react-icons/fa';
import '../../styles/MisCompras.css';

const MySwal = withReactContent(Swal);
const ITEMS_POR_PAGINA = 6;

const MisCompras = () => {
  const { compras, anularCompra } = useCompras();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);

  const limpiarFiltro = () => {
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const filtrarCompras = compras.filter(compra => {
    if (!desde && !hasta) return true;
    const fechaCompra = new Date(compra.fecha).getTime();
    const desdeDate = desde ? new Date(desde).getTime() : 0;
    const hastaDate = hasta ? new Date(hasta).getTime() + 86400000 : Infinity;
    return fechaCompra >= desdeDate && fechaCompra <= hastaDate;
  });

  const totalPaginas = Math.ceil(filtrarCompras.length / ITEMS_POR_PAGINA);
  const comprasPaginadas = filtrarCompras
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

  const confirmarAnulacion = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción anulará tu pedido.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, anular',
    }).then(result => {
      if (result.isConfirmed) anularCompra(id);
    });
  };

  const mostrarDetalleProducto = (prod: any) => {
    MySwal.fire({
      title: `<div style="font-size: 1.3rem; color: #b73a93;">🧸 ${prod.nombre}</div>`,
      html: `
        <div style="text-align:left; font-size: 1rem; padding: 0.5rem;">
          <p><strong>Tipo:</strong> ${prod.tipo}</p>
          <p><strong>Precio:</strong> $${prod.precio.toLocaleString()}</p>
          <p><strong>Cantidad:</strong> ${prod.cantidad || 1}</p>
          ${prod.mensaje ? `<p><strong>Mensaje personalizado:</strong><br><em>${prod.mensaje}</em></p>` : ''}
        </div>
      `,
      customClass: {
        popup: 'sweet-detalle-popup'
      },
      background: '#fff8fc',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#d14fa2',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  };

  return (
    <div className="mis-compras-container">
      <h2><FaBoxOpen /> Mis Compras</h2>

      <div className="filtros-fecha">
        <div className="filtro-grupo">
          Desde:
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div className="filtro-grupo">
          Hasta:
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <button className="boton-limpiar" onClick={limpiarFiltro}><FaTimes /> Limpiar filtro</button>
      </div>

      {comprasPaginadas.length === 0 ? (
        <p style={{ textAlign: 'center', fontWeight: 500 }}>No se encontraron compras.</p>
      ) : (
        <div className="compras-grid">
          {comprasPaginadas.map(compra => (
            <div className="card-compra" key={compra.id}>
              <div className="card-info">
                <div><FaCalendarAlt /> <strong>Fecha:</strong> {new Date(compra.fecha).toLocaleString()}</div>
                <div><FaCreditCard /> <strong>Método:</strong> {compra.metodoPago}</div>
                <div>
                  <FaMoneyBillWave /> <strong>Estado:</strong>
                  <span className={compra.estado === 'Anulado' ? 'estado-anulado' : 'estado-activo'}>
                    {compra.estado}
                  </span>
                </div>
                <div><FaMoneyBillWave /> <strong>Inicial:</strong> ${compra.inicial.toLocaleString()}</div>
                <div><FaMoneyBillWave /> <strong>Restante:</strong> ${compra.restante.toLocaleString()}</div>
                <div><FaMoneyBillWave /> <strong>Total:</strong> ${compra.total.toLocaleString()}</div>
              </div>

              <div>
                <div className="titulo-productos"><FaBoxOpen /> Productos:</div>
                <ul className="lista-productos">
                  {compra.productos.map((prod, i) => (
                    <li key={i}>
                      {prod.nombre} - ${prod.precio.toLocaleString()} ({prod.tipo})
                      <FaEye
                        className="icono-ojo"
                        title="Ver detalle"
                        onClick={() => mostrarDetalleProducto(prod)}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {compra.estado !== 'Anulado' && (
                <button className="btn-anular" onClick={() => confirmarAnulacion(compra.id)}>
                  <FaTimes /> Anular pedido
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              className={`page-btn ${pagina === i + 1 ? 'active' : ''}`}
              onClick={() => setPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCompras;

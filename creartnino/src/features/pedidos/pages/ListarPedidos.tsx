import { useState } from "react";
import Swal from 'sweetalert2';
import { FaEye, FaFilePdf, FaBan } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CrearPedido from './Crear';
import VerPedidoModal from './Ver';
import '../styles/style.css';

interface PedidoDetalle {
  producto: string;
  cantidad: number;
  precio: number;
}

interface Pedidos {
  IdPedido: number;
  IdCliente: string;
  MetodoPago: string;
  FechaPedido: string;
  FechaEntrega: string;
  Descripcion: string;
  ValorInicial: number;
  ValorRestante: number;
  ComprobantePago: string;
  TotalPedido: number;
  Estado: string;
  detallePedido?: PedidoDetalle[];
}

const pedidosIniciales: Pedidos[] = [
  { IdPedido: 601, IdCliente: 'Ana ', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-01', FechaEntrega: '2025-05-05', Descripcion: 'Pedido por producción', ValorInicial: 30000, ValorRestante: 90000, ComprobantePago: 'comprobante601.jpg', TotalPedido: 120000, Estado: 'primer pago' },
  { IdPedido: 602, IdCliente: 'Lucas', MetodoPago: 'Transferencia', FechaPedido: '2025-05-02', FechaEntrega: '2025-05-06', Descripcion: 'Pedido por producción', ValorInicial: 40000, ValorRestante: 80000, ComprobantePago: 'comprobante602.jpg', TotalPedido: 120000, Estado: 'en proceso' },
  { IdPedido: 603, IdCliente: 'Maribel', MetodoPago: 'Efectivo', FechaPedido: '2025-05-03', FechaEntrega: '2025-05-07', Descripcion: 'Pedido por producción', ValorInicial: 50000, ValorRestante: 70000, ComprobantePago: 'comprobante603.jpg', TotalPedido: 120000, Estado: 'en producción' },
  { IdPedido: 604, IdCliente: 'Sergio', MetodoPago: 'Efectivo', FechaPedido: '2025-05-04', FechaEntrega: '2025-05-08', Descripcion: 'Pedido por producción', ValorInicial: 20000, ValorRestante: 100000, ComprobantePago: 'comprobante604.jpg', TotalPedido: 120000, Estado: 'en proceso de entrega' },
  { IdPedido: 605, IdCliente: 'Lupita', MetodoPago: 'Tarjeta ', FechaPedido: '2025-05-01', FechaEntrega: '2025-05-05', Descripcion: 'Pedido por producción', ValorInicial: 30000, ValorRestante: 90000, ComprobantePago: 'comprobante605.jpg', TotalPedido: 120000, Estado: 'entregado' },
  { IdPedido: 606, IdCliente: 'Enrique', MetodoPago: 'Efectivo', FechaPedido: '2025-05-02', FechaEntrega: '2025-05-06', Descripcion: 'Pedido por producción', ValorInicial: 40000, ValorRestante: 80000, ComprobantePago: 'comprobante606.jpg', TotalPedido: 120000, Estado: 'anulado' },
];

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

const ListarPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedidos[]>(pedidosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedidos | null>(null);

  const pedidosPorPagina = 6;

  const handleEliminarPedido = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, Anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setPedidos(prev => prev.map(p =>
          p.IdPedido === id ? { ...p, Estado: 'anulado' } : p
        ));
        Swal.fire({
          icon: 'success',
          title: 'Anulado',
          text: 'El pedido ha sido anulado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleCrearPedido = (nuevoPedido: Omit<Pedidos, 'IdPedido'>) => {
    const nuevoId = Math.max(...pedidos.map(p => p.IdPedido)) + 1;
    setPedidos(prev => [...prev, { ...nuevoPedido, IdPedido: nuevoId }]);
    setMostrarModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Pedido creado',
      text: 'El pedido fue registrado exitosamente',
      confirmButtonColor: '#e83e8c',
    });
  };

  const generarPDF = (pedido: Pedidos) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(`Resumen de Pedido #${pedido.IdPedido}`, 105, 20, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);

    const infoY = 32;
    const lineSpacing = 7;
    const labels = [
      ['Cliente', pedido.IdCliente],
      ['Método de Pago', pedido.MetodoPago],
      ['Fecha del Pedido', pedido.FechaPedido],
      ['Fecha de Entrega', pedido.FechaEntrega],
      ['Estado', pedido.Estado],
      ['Descripción', pedido.Descripcion],
      ['Valor Inicial', `$${pedido.ValorInicial.toLocaleString()}`],
      ['Valor Restante', `$${pedido.ValorRestante.toLocaleString()}`],
      ['Total Pedido', `$${pedido.TotalPedido.toLocaleString()}`],
    ];

    labels.forEach(([label, value], index) => {
      const y = infoY + index * lineSpacing;
      doc.text(`${label}:`, 14, y);
      doc.text(String(value), 60, y);
    });

    const tablaStartY = infoY + labels.length * lineSpacing + 5;
    doc.line(14, tablaStartY - 3, 196, tablaStartY - 3);

    autoTable(doc, {
      startY: tablaStartY,
      head: [['Producto', 'Cantidad', 'Precio']],
      body: pedido.detallePedido?.map((item) => [
        item.producto,
        item.cantidad.toString(),
        `$${item.precio.toLocaleString()}`,
      ]) || [],
      theme: 'striped',
      headStyles: {
        fillColor: [224, 78, 131],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 11,
        cellPadding: 3,
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, finalY + 10);

    doc.save(`Pedido-${pedido.IdPedido}.pdf`);
  };

  // Filtro corregido
  const pedidosFiltrados = pedidos.filter(p =>
    p.IdPedido.toString().toLowerCase().startsWith(busqueda.toLowerCase()) ||
    p.IdCliente.toLowerCase().startsWith(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * pedidosPorPagina;
  const indexFin = indexInicio + pedidosPorPagina;
  const pedidosPagina = pedidosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Pedidos</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          
          Crear Pedido
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar Por Nombre de Cliente"
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
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Entrega</th>
              <th>Inicial</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.map((p, index) => (
              <tr key={p.IdPedido} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{p.IdCliente}</td>
                <td>{p.MetodoPago}</td>
                <td>{p.FechaEntrega}</td>
                <td>${p.ValorInicial.toLocaleString()}</td>
                <td>${p.TotalPedido.toLocaleString()}</td>
                <td>
                  <select
                    className={`form-select estado-select ${getColorClaseEstadoPedido(p.Estado)}`}
                    value={p.Estado}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      setPedidos(prev =>
                        prev.map(ped =>
                          ped.IdPedido === p.IdPedido ? { ...ped, Estado: nuevoEstado } : ped
                        )
                      );
                    }}
                    disabled={p.Estado === 'anulado'}
                  >
                    <option value="en proceso">En Proceso</option>
                    <option value="primer pago">Primer Pago</option>
                    <option value="en producción">En Producción</option>
                    <option value="en proceso de entrega">En Proceso de Entrega</option>
                    <option value="entregado">Entregado</option>
                    <option value="anulado">Anulado</option>
                  </select>
                </td>
                <td>
                  <FaEye
                    className="icono text-info me-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPedidoSeleccionado(p)}
                  />
                  <FaBan
                    className={`icono me-2 ${p.Estado === 'anulado' ? 'text-dark' : 'text-warning'}`}
                    style={{ cursor: p.Estado === 'anulado' ? 'not-allowed' : 'pointer' }}
                    onClick={p.Estado === 'anulado' ? undefined : () => handleEliminarPedido(p.IdPedido)}
                  />
                  <FaFilePdf
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => generarPDF(p)}
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
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo Pedido</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body">
                  <CrearPedido
                    onClose={() => setMostrarModal(false)}
                    onCrear={handleCrearPedido}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {pedidoSeleccionado && (
        <VerPedidoModal
          pedido={{
            ...pedidoSeleccionado,
            detallePedido: pedidoSeleccionado.detallePedido ?? []
          }}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default ListarPedidos;
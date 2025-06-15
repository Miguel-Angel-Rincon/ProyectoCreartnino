import { useState } from "react";
import Swal from 'sweetalert2';
import { FaEye, FaFilePdf, FaBan, FaPlus } from 'react-icons/fa';
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
 { IdPedido: 601, IdCliente: 'Lucas', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-01', FechaEntrega: '2025-05-05', Descripcion: 'Pedido de productos categoría 1', ValorInicial: 20000, ValorRestante: 100000, ComprobantePago: 'comprobante201.jpg', TotalPedido: 120000, Estado: 'Pendiente' },
  { IdPedido: 602, IdCliente: 'Marta', MetodoPago: 'Efectivo', FechaPedido: '2025-05-02', FechaEntrega: '2025-05-06', Descripcion: 'Pedido de productos categoría 2', ValorInicial: 10000, ValorRestante: 200000, ComprobantePago: 'comprobante202.jpg', TotalPedido: 200000, Estado: 'Pagado' },
  { IdPedido: 603, IdCliente: 'Mario', MetodoPago: 'Transferencia', FechaPedido: '2025-05-03', FechaEntrega: '2025-05-07', Descripcion: 'Pedido de productos categoría 3', ValorInicial: 5000, ValorRestante: 145000, ComprobantePago: 'comprobante203.jpg', TotalPedido: 150000, Estado: 'Parcial' },
  { IdPedido: 604, IdCliente: 'Laura', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-04', FechaEntrega: '2025-05-08', Descripcion: 'Pedido de productos categoría 4', ValorInicial: 12000, ValorRestante: 108000, ComprobantePago: 'comprobante204.jpg', TotalPedido: 120000, Estado: 'Pendiente' },
  { IdPedido: 605, IdCliente: 'Andres', MetodoPago: 'Efectivo', FechaPedido: '2025-05-05', FechaEntrega: '2025-05-09', Descripcion: 'Pedido de productos categoría 5', ValorInicial: 50000, ValorRestante: 180000, ComprobantePago: 'comprobante205.jpg', TotalPedido: 180000, Estado: 'Pagado' },
  { IdPedido: 606, IdCliente: 'Penelope', MetodoPago: 'Transferencia', FechaPedido: '2025-05-06', FechaEntrega: '2025-05-10', Descripcion: 'Pedido de productos categoría 6', ValorInicial: 4000, ValorRestante: 156000, ComprobantePago: 'comprobante206.jpg', TotalPedido: 160000, Estado: 'Parcial' },
  { IdPedido: 607, IdCliente: 'Juan', MetodoPago: 'Tarjeta', FechaPedido: '2025-05-07', FechaEntrega: '2025-05-11', Descripcion: 'Pedido de productos categoría 7', ValorInicial: 30000, ValorRestante: 210000, ComprobantePago: 'comprobante207.jpg', TotalPedido: 210000, Estado: 'Pagado' },
  { IdPedido: 608, IdCliente: 'Angel', MetodoPago: 'Efectivo', FechaPedido: '2025-05-08', FechaEntrega: '2025-05-12', Descripcion: 'Pedido de productos categoría 8', ValorInicial: 13000, ValorRestante: 117000, ComprobantePago: 'comprobante208.jpg', TotalPedido: 130000, Estado: 'Pendiente' }
];

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
        setPedidos(prev => prev.filter(p => p.IdPedido !== id));
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

    // Use doc.lastAutoTable.finalY if available, otherwise fallback to 140
    const finalY = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, finalY + 10);

    doc.save(`Pedido-${pedido.IdPedido}.pdf`);
  };

  const pedidosFiltrados = pedidos.filter(p =>
    `${p.IdPedido}`.toLowerCase().includes(busqueda.toLowerCase())
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
          <FaPlus className="me-2" />
          Crear Pedido
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por ID del Pedido"
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
                <td>{p.Estado}</td>
                <td>
                  <FaEye
                    className="icono text-info me-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPedidoSeleccionado(p)}
                  />
                  <FaBan
                    className="icono text-warning me-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEliminarPedido(p.IdPedido)}
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

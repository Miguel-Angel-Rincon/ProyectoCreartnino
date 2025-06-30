import { useState } from "react";
import Swal from 'sweetalert2';
import { FaEye, FaBan, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CrearCompra from './Crear';
import VerCompra from './Ver';
import '../styles/style.css';

interface CompraDetalle {
  producto: string;
  cantidad: number;
  precio: number;
}

interface Compras {
  IdCompra: number;
  IdProveedor: string;
  MetodoPago: string;
  FechaCompra: string;
  TotalCompra: number;
  IdEstado: string;
  detalleCompra?: CompraDetalle[];
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
  const [mostrarVer, setMostrarVer] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compras | null>(null);

  const comprasPorPagina = 6;

  const getColorClaseEstadocompra = (estado: string) => {
    const estadoNormalizado = estado.toLowerCase().replace(/\s/g, '');
    switch (estadoNormalizado) {
      case 'enproceso': return 'estado-compra-en-proceso';
      case 'completado': return 'estado-compra-completado';
      case 'anulado': return 'estado-compra-anulado';
      default: return '';
    }
  };

  const handleAnularCompra = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'La compra será marcada como anulada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setCompras(prev =>
          prev.map(c =>
            c.IdCompra === id ? { ...c, IdEstado: 'Anulado' } : c
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Compra anulada',
          text: 'El estado fue actualizado correctamente',
          confirmButtonColor: '#e83e8c',
        });
      }
    });
  };

  const handleCrearCompra = (nuevaCompra: any) => {
    const nueva: Compras = {
      IdCompra: Math.max(...compras.map(c => c.IdCompra)) + 1,
      IdProveedor: nuevaCompra.proveedorSeleccionado,
      MetodoPago: nuevaCompra.metodoPago,
      FechaCompra: nuevaCompra.fechaCompra,
      TotalCompra: nuevaCompra.detalleCompra.reduce((acc: number, item: any) => acc + item.cantidad * item.precio, 0),
      IdEstado: 'En proceso',
      detalleCompra: nuevaCompra.detalleCompra.map((i: any) => ({
        producto: i.insumo,
        cantidad: i.cantidad,
        precio: i.precio
      }))
    };
    setCompras([...compras, nueva]);
    setMostrarModal(false);
    Swal.fire('Compra Exitosa', 'Compra registrada correctamente', 'success');
  };

  const handleVerCompra = (compra: Compras) => {
    setCompraSeleccionada(compra);
    setMostrarVer(true);
  };

  const generarPDF = (compra: Compras) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Resumen de Compra #${compra.IdCompra}`, 105, 20, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    const labels = [
      ['Proveedor', compra.IdProveedor],
      ['Método de Pago', compra.MetodoPago],
      ['Fecha de Compra', compra.FechaCompra],
      ['Estado', compra.IdEstado],
      ['Total Compra', `$${compra.TotalCompra.toLocaleString()}`],
    ];

    labels.forEach(([label, value], index) => {
      const y = 32 + index * 7;
      doc.setFontSize(12);
      doc.text(`${label}:`, 14, y);
      doc.text(String(value), 60, y);
    });

    const tablaY = 32 + labels.length * 7 + 5;
    doc.line(14, tablaY - 3, 196, tablaY - 3);

    autoTable(doc, {
      startY: tablaY,
      head: [['Insumo', 'Cantidad', 'Precio']],
      body: compra.detalleCompra?.map((item) => [
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
    doc.save(`Compra-${compra.IdCompra}.pdf`);
  };

  // 🔍 Filtrar por primera letra del nombre del proveedor
  const comprasFiltradas = compras.filter(p =>
    p.IdProveedor.toLowerCase().startsWith(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * comprasPorPagina;
  const indexFin = indexInicio + comprasPorPagina;
  const comprasPagina = comprasFiltradas.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Compras</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          
          Crear Compra
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar Por Nombre de Proveedor"
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
              <th>Proveedor</th>
              <th>Método</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasPagina.map((c, index) => (
              <tr key={c.IdCompra} className={index % 2 === 0 ? 'fila-par' : 'fila-impar'}>
                <td>{c.IdProveedor}</td>
                <td>{c.MetodoPago}</td>
                <td>{c.FechaCompra}</td>
                <td>${c.TotalCompra.toLocaleString()}</td>
                <td>
                  <select
                    className={`form-select estado-select ${getColorClaseEstadocompra(c.IdEstado)}`}
                    value={c.IdEstado}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      setCompras(prev =>
                        prev.map((compra) =>
                          compra.IdCompra === c.IdCompra
                            ? { ...compra, IdEstado: nuevoEstado }
                            : compra
                        )
                      );
                    }}
                    disabled={c.IdEstado === 'Anulado'}
                  >
                    <option value="En proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Anulado">Anulado</option>
                  </select>
                </td>
                <td>
                  <FaEye
                    className="icono text-info me-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleVerCompra(c)}
                  />
                  <FaBan
                    className={`icono me-2 ${c.IdEstado === 'Anulado' ? 'text-secondary' : 'text-warning'}`}
                    style={{ cursor: c.IdEstado === 'Anulado' ? 'not-allowed' : 'pointer' }}
                    onClick={() => {
                      if (c.IdEstado !== 'Anulado') handleAnularCompra(c.IdCompra);
                    }}
                  />
                  <FaFilePdf
                    className="icono text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => generarPDF(c)}
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

      {mostrarVer && compraSeleccionada && (
        <VerCompra
          compra={{
            ...compraSeleccionada,
            proveedorSeleccionado: compraSeleccionada.IdProveedor,
            metodoPago: compraSeleccionada.MetodoPago,
            fechaCompra: compraSeleccionada.FechaCompra,
            Subtotal: compraSeleccionada.TotalCompra,
            detalleCompra: (compraSeleccionada.detalleCompra || []).map(item => ({
              insumo: item.producto,
              cantidad: item.cantidad,
              precio: item.precio
            })),
            IVA: compraSeleccionada.TotalCompra * 0.19,
            Total: compraSeleccionada.TotalCompra * 1.19,
          }}
          onClose={() => setMostrarVer(false)}
        />
      )}
    </div>
  );
};

export default ListarCompras;
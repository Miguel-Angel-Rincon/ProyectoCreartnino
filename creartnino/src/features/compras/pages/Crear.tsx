import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';
import { FaMoneyBillWave, FaPercent, FaCalculator } from 'react-icons/fa';

interface CrearCompraProps {
  onClose: () => void;
  onCrear: (compra: any) => void;
}

interface CompraDetalle {
  insumo: string;
  cantidad: number;
  precio: number;
}

const proveedoresMock = [
  { IdProveedores: 1, NombreCompleto: 'Juan Aranago' },
  { IdProveedores: 2, NombreCompleto: 'Maria Lopez' },
  { IdProveedores: 3, NombreCompleto: 'Pedro Martinez' }
];

const insumosMock = [
  { IdInsumos: 301, Nombre: 'Cartulina', precioUnitario: 20000 },
  { IdInsumos: 306, Nombre: 'Carton Paja', precioUnitario: 12000 },
  { IdInsumos: 307, Nombre: 'Palos Paleta', precioUnitario: 40000 }
];

const CrearCompra: React.FC<CrearCompraProps> = ({ onClose, onCrear }) => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [detalleCompra, setDetalleCompra] = useState<CompraDetalle[]>([]);

  const agregarDetalle = () => {
    setDetalleCompra([...detalleCompra, { insumo: '', cantidad: 0, precio: 0 }]);
  };

  const actualizarDetalle = (index: number, campo: keyof CompraDetalle, valor: string | number) => {
    const copia = [...detalleCompra];
    if (campo === 'insumo') {
      const insumo = insumosMock.find(i => i.Nombre === valor);
      copia[index].insumo = insumo?.Nombre || '';
      copia[index].precio = insumo?.precioUnitario || 0;
    } else {
      copia[index][campo] = parseFloat(valor as string);
    }
    setDetalleCompra(copia);
  };

  const eliminarDetalle = (index: number) => {
    const copia = [...detalleCompra];
    copia.splice(index, 1);
    setDetalleCompra(copia);
  };

  const calcularSubtotal = () =>
    detalleCompra.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

  const calcularIVA = () => calcularSubtotal() * 0.19;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const handleSubmit = () => {
    if (!proveedorSeleccionado || !metodoPago || !fechaCompra) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Debes completar todos los campos principales.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (detalleCompra.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Detalle vacío',
        text: 'Debes agregar al menos un insumo.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    for (let i = 0; i < detalleCompra.length; i++) {
      const item = detalleCompra[i];
      if (!item.insumo || item.cantidad <= 0 || item.precio <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Error en insumo',
          text: `Todos los campos del insumo #${i + 1} deben estar completos y tener valores válidos.`,
          confirmButtonColor: '#f78fb3',
        });
        return;
      }
    }

    const nuevaCompra = {
      proveedorSeleccionado,
      metodoPago,
      fechaCompra,
      detalleCompra,
      Subtotal: calcularSubtotal(),
      IVA: calcularIVA(),
      Total: calcularTotal()
    };
    onCrear(nuevaCompra);
  };

  return (
    <div className="modal d-block pastel-overlay">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pastel-modal shadow">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🧾 Registrar Compra</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row g-4">

              {/* Proveedor y Método de Pago */}
              <div className="col-md-6">
                <label className="form-label">🏢 Proveedor</label>
                <select className="form-select" value={proveedorSeleccionado} onChange={e => setProveedorSeleccionado(e.target.value)} required>
                  <option value="">Seleccione</option>
                  {proveedoresMock.map(p => (
                    <option key={p.IdProveedores} value={p.NombreCompleto}>
                      {p.NombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">💳 Método de Pago</label>
                <select className="form-select" value={metodoPago} onChange={e => setMetodoPago(e.target.value)} required>
                  <option value="">Seleccione</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              {/* Fecha de Compra */}
              <div className="col-md-6">
                <label className="form-label">📅 Fecha de Compra</label>
                <input type="date" className="form-control" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} required />
              </div>

              {/* Detalle de Insumos */}
              <div className="col-12 mt-4">
                <h6 className="text-muted">📦 Detalle de la compra</h6>
                <div className="row fw-bold mb-2 small">
                  <div className="col-md-4">Nombre del Insumo</div>
                  <div className="col-md-4">Cantidad</div>
                  <div className="col-md-3">Precio</div>
                  <div className="col-md-1"></div>
                </div>
                {detalleCompra.map((item, index) => (
                  <div key={index} className="row mb-1 align-items-center small">
                    <div className="col-md-4">
                      <select className="form-select form-select-sm" value={item.insumo} onChange={e => actualizarDetalle(index, 'insumo', e.target.value)} required>
                        <option value="">Seleccione un insumo</option>
                        {insumosMock.map(i => (
                          <option key={i.IdInsumos} value={i.Nombre}>{i.Nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={1}
                        value={item.cantidad}
                        onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={Math.round(item.precio).toLocaleString('es-CO')}
                        onChange={e =>
                          actualizarDetalle(
                            index,
                            'precio',
                            parseInt(e.target.value.replace(/\./g, '').replace(',', '')) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-md-1 text-center">
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>✖</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-sm pastel-btn-secondary mt-2" onClick={agregarDetalle}>+ Agregar Insumo</button>
              </div>

              {/* Resumen de la Compra reducido */}
              <div className="col-12 mt-4">
                <h6 className="text-muted mb-3">📊 Resumen de la Compra</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body py-2 px-1">
                        <FaMoneyBillWave size={18} className="mb-1 text-success" />
                        <small className="d-block">Subtotal</small>
                        <small className="m-0">${Math.round(calcularSubtotal()).toLocaleString('es-CO')}</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body py-2 px-1">
                        <FaPercent size={18} className="mb-1 text-warning" />
                        <small className="d-block">IVA (19%)</small>
                        <small className="m-0">${Math.round(calcularIVA()).toLocaleString('es-CO')}</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body py-2 px-1">
                        <FaCalculator size={18} className="mb-1 text-primary" />
                        <small className="d-block">Total</small>
                        <small className="m-0">${Math.round(calcularTotal()).toLocaleString('es-CO')}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-footer pastel-footer">
            <button className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn pastel-btn-primary" onClick={handleSubmit}>Registrar Compra</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearCompra;

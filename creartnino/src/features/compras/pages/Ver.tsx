import React from 'react';
import '../styles/acciones.css';
import { FaMoneyBillWave, FaPercent, FaCalculator } from 'react-icons/fa';

interface CompraDetalle {
  insumo: string;
  cantidad: number;
  precio: number;
}

interface CompraData {
  proveedorSeleccionado: string;
  metodoPago: string;
  fechaCompra: string;
  detalleCompra: CompraDetalle[];
  Subtotal: number;
  IVA: number;
  Total: number;
}

interface VerCompraProps {
  compra: CompraData;
  onClose: () => void;
}

const VerCompra: React.FC<VerCompraProps> = ({ compra, onClose }) => {
  return (
    <div className="modal d-block pastel-overlay">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pastel-modal shadow">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🔍 Detalles de la Compra</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="row g-3">

              {/* Información general */}
              <div className="col-md-6">
                <label className="form-label">🏢 Proveedor</label>
                <input className="form-control" value={compra.proveedorSeleccionado} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">💳 Método de Pago</label>
                <input className="form-control" value={compra.metodoPago} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📅 Fecha de Compra</label>
                <input className="form-control" value={compra.fechaCompra} disabled />
              </div>

              {/* Detalle de Insumos */}
              <div className="col-12 mt-4">
                <h6 className="text-muted">📦 Detalle de la compra</h6>
                <div className="row fw-bold mb-2">
                  <div className="col-md-4">Nombre del Insumo</div>
                  <div className="col-md-4">Cantidad</div>
                  <div className="col-md-4">Precio</div>
                </div>
                {compra.detalleCompra.map((item, index) => (
                  <div key={index} className="row mb-2">
                    <div className="col-md-4">
                      <input className="form-control" value={item.insumo} disabled />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" value={item.cantidad} disabled />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" value={item.precio} disabled />
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen */}
              <div className="col-12 mt-4">
                <h6 className="text-muted mb-3">📊 Resumen de la Compra</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaMoneyBillWave size={20} className="mb-2 text-success" />
                        <h6>Subtotal</h6>
                        <p className="m-0">${compra.Subtotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaPercent size={20} className="mb-2 text-warning" />
                        <h6>IVA (19%)</h6>
                        <p className="m-0">${compra.IVA.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaCalculator size={20} className="mb-2 text-primary" />
                        <h6>Total</h6>
                        <p className="m-0">${compra.Total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-footer pastel-footer">
            <button className="btn pastel-btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCompra;

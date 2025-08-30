import React from 'react';
import { FaMoneyBillWave, FaPercent, FaCalculator } from 'react-icons/fa';
import '../styles/style.css';

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
    <div className="container-fluid pastel-contenido py-4">
      <h2 className="titulo mb-4">🔍 Detalles de la Compra</h2>

      {/* Proveedor, Método de Pago y Fecha */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <label className="form-label">🧑 Proveedor</label>
          <input
            className="form-control"
            value={compra.proveedorSeleccionado}
            disabled
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">💳 Método de Pago</label>
          <input className="form-control" value={compra.metodoPago} disabled />
        </div>
        <div className="col-md-4">
          <label className="form-label">📅 Fecha de Compra</label>
          <input className="form-control" value={compra.fechaCompra} disabled />
        </div>
      </div>

      {/* Detalle de la compra */}
      <div className="mb-3">
        <h5 className="text-muted mb-3">📦 Detalle de la compra</h5>

        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-4">Insumo</div>
          <div className="col-md-2">Cantidad</div>
          <div className="col-md-3">Precio</div>
          <div className="col-md-3">Subtotal</div>
        </div>

        {compra.detalleCompra.map((item, index) => (
          <div key={index} className="row align-items-center mb-2">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                value={item.insumo}
                disabled
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                value={item.cantidad}
                disabled
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                value={`$${Math.round(item.precio).toLocaleString('es-CO')}`}
                disabled
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                value={`$${Math.round(
                  item.cantidad * item.precio
                ).toLocaleString('es-CO')}`}
                disabled
              />
            </div>
          </div>
        ))}
      </div>

      {/* Totales con tarjetas (igual que en crear) */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaMoneyBillWave size={18} className="text-success mb-1" />
            <small className="d-block">Subtotal</small>
            <small>${Math.round(compra.Subtotal).toLocaleString('es-CO')}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaPercent size={18} className="text-warning mb-1" />
            <small className="d-block">IVA (19%)</small>
            <small>${Math.round(compra.IVA).toLocaleString('es-CO')}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaCalculator size={18} className="text-primary mb-1" />
            <small className="d-block">Total</small>
            <small>${Math.round(compra.Total).toLocaleString('es-CO')}</small>
          </div>
        </div>
      </div>

      <div className="text-end">
        <button
          className="btn pastel-btn-secondary"
          onClick={onClose}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default VerCompra;

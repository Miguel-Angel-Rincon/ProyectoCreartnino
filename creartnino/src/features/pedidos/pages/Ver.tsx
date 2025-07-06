import React from 'react';
import { FaCalculator, FaWallet, FaCoins } from 'react-icons/fa';
import '../styles/acciones.css';

interface PedidoDetalle {
  producto: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  IdCliente: string;
  Direccion: string;
  MetodoPago: string;
  FechaPedido: string;
  FechaEntrega: string;
  Descripcion: string;
  ValorInicial: number;
  ValorRestante: number;
  TotalPedido: number;
  Estado: string;
  ComprobantePago?: string;
  detallePedido: PedidoDetalle[];
}

interface VerPedidoProps {
  pedido: Pedido;
  onVolver: () => void;
}

const VerPedido: React.FC<VerPedidoProps> = ({ pedido, onVolver }) => {
  return (
    <div className="container py-4">
      <h4 className="mb-4">📄 Detalles del Pedido</h4>
      <div className="row g-4 mb-3">
        <div className="col-md-3">
          <label className="form-label">👤 Cliente</label>
          <input type="text" className="form-control" value={pedido.IdCliente} readOnly />
        </div>
        <div className="col-md-3">
          <label className="form-label">💳 Método de Pago</label>
          <input type="text" className="form-control" value={pedido.MetodoPago} readOnly />
        </div>
        <div className="col-md-3">
          <label className="form-label">📅 Fecha del Pedido</label>
          <input type="date" className="form-control" value={pedido.FechaPedido} readOnly />
        </div>
        <div className="col-md-3">
          <label className="form-label">📦 Fecha de Entrega</label>
          <input type="date" className="form-control" value={pedido.FechaEntrega} readOnly />
        </div>
      </div>

      

      <div className="col-12 mt-4">
        <h6 className="text-muted">🧾 Detalle del Pedido</h6>
        <div className="row fw-bold mb-2">
          <div className="col-md-4">Producto</div>
          <div className="col-md-2">Cantidad</div>
          <div className="col-md-2">Precio</div>
          <div className="col-md-4">Subtotal</div>
        </div>
        {pedido.detallePedido.map((item, index) => (
          <div key={index} className="row mb-2 align-items-center">
            <div className="col-md-4">
              <input type="text" className="form-control" value={item.producto} readOnly />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" value={item.cantidad} readOnly />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" value={`$${item.precio.toLocaleString()}`} readOnly />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                value={`$${(item.cantidad * item.precio).toLocaleString()}`}
                readOnly
              />
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <label className="form-label">🎨 Personalización</label>
          <textarea className="form-control" rows={2} value={pedido.Descripcion} readOnly />
        </div>
        <div className="col-md-6">
          <label className="form-label">📍 Dirección del Cliente</label>
          <input type="text" className="form-control" value={pedido.Direccion} readOnly />
        </div>
      </div>

      {pedido.MetodoPago === 'Transferencia' && pedido.ComprobantePago && (
        <div className="col-md-6 mt-4">
          <label className="form-label">📎 Comprobante de Pago</label>
          <input type="text" className="form-control" value={pedido.ComprobantePago} readOnly />
        </div>
      )}

      <div className="col-12 mt-4">
        <h6 className="text-muted mb-2">📊 Resumen del Pedido</h6>
        <div className="row g-2">
          <div className="col-md-4">
            <div className="card pastel-card p-1">
              <div className="d-flex align-items-center gap-1">
                <FaWallet size={16} className="text-info" />
                <div>
                  <div className="fw-semibold fs-7">Valor Inicial</div>
                  <div className="text-muted fw-bold fs-7">${pedido.ValorInicial.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card pastel-card p-1">
              <div className="d-flex align-items-center gap-1">
                <FaCoins size={16} className="text-danger" />
                <div>
                  <div className="fw-semibold fs-7">Valor Restante</div>
                  <div className="text-muted fw-bold fs-7">${pedido.ValorRestante.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card pastel-card p-1">
              <div className="d-flex align-items-center gap-1">
                <FaCalculator size={16} className="text-primary" />
                <div>
                  <div className="fw-semibold fs-7">Total</div>
                  <div className="text-muted fw-bold fs-7">${pedido.TotalPedido.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary" onClick={onVolver}>Volver</button>
      </div>
    </div>
  );
};

export default VerPedido;

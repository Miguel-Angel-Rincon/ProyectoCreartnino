import React from 'react';
import '../styles/acciones.css';
import { FaMoneyBillWave, FaPercent, FaCalculator, FaWallet, FaCoins } from 'react-icons/fa';

interface PedidoDetalle {
  producto: string;
  cantidad: number;
  precio: number;
}

interface VerPedidoProps {
  onClose: () => void;
  pedido: {
    IdCliente: string;
    MetodoPago: string;
    FechaPedido: string;
    FechaEntrega: string;
    Descripcion: string;
    ComprobantePago: string;
    ValorInicial: number;
    ValorRestante: number;
    TotalPedido: number;
    Estado: string;
    detallePedido: PedidoDetalle[];
  };
}

const VerPedidoModal: React.FC<VerPedidoProps> = ({ onClose, pedido }) => {
  const calcularSubtotal = () =>
    pedido.detallePedido.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

  const calcularIVA = () => calcularSubtotal() * 0.19;
  const calcularTotalConIVA = () => calcularSubtotal() + calcularIVA();

  return (
    <div className="modal d-block pastel-overlay">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pastel-modal shadow">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">📋 Ver Pedido</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">👤 Cliente</label>
                <input className="form-control" value={pedido.IdCliente} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">💳 Método de Pago</label>
                <input className="form-control" value={pedido.MetodoPago} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📅 Fecha del Pedido</label>
                <input className="form-control" value={pedido.FechaPedido} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📦 Fecha de Entrega</label>
                <input className="form-control" value={pedido.FechaEntrega} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📝 Descripción</label>
                <input className="form-control" value={pedido.Descripcion} disabled />
              </div>

              {pedido.MetodoPago === 'Transferencia' && (
                <div className="col-12">
                  <label className="form-label">📎 Comprobante de Pago</label>
                  <input className="form-control" value={pedido.ComprobantePago} disabled />
                </div>
              )}

              {/* Detalle del Pedido */}
              <div className="col-12 mt-4">
                <h6 className="text-muted">🧾 Detalle del Pedido</h6>
                <div className="row fw-bold mb-2">
                  <div className="col-md-4">Nombre del Producto</div>
                  <div className="col-md-4">Cantidad</div>
                  <div className="col-md-4">Precio</div>
                </div>
                {pedido.detallePedido.map((item, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-md-4">
                      <input className="form-control" value={item.producto} disabled />
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

              {/* Resumen del Pedido */}
              <div className="col-12 mt-4">
                <h6 className="text-muted mb-2">📊 Resumen del Pedido</h6>
                <div className="row g-2">
                  {[{
                    icon: <FaMoneyBillWave size={16} className="text-success" />,
                    label: 'Subtotal',
                    value: calcularSubtotal()
                  }, {
                    icon: <FaPercent size={16} className="text-warning" />,
                    label: 'IVA (19%)',
                    value: calcularIVA()
                  }, {
                    icon: <FaCalculator size={16} className="text-primary" />,
                    label: 'Total con IVA',
                    value: calcularTotalConIVA()
                  }].map((item, idx) => (
                    <div className="col-md-4" key={idx}>
                      <div className="card pastel-card p-1">
                        <div className="d-flex align-items-center gap-1">
                          <div>{item.icon}</div>
                          <div>
                            <div className="fw-semibold fs-7">{item.label}</div>
                            <div className="text-muted fw-bold fs-7">${item.value.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row g-2 mt-1">
                  {[{
                    icon: <FaWallet size={16} className="text-info" />,
                    label: 'Valor Inicial',
                    value: pedido.ValorInicial
                  }, {
                    icon: <FaCoins size={16} className="text-danger" />,
                    label: 'Valor Restante',
                    value: pedido.ValorRestante
                  }].map((item, idx) => (
                    <div className="col-md-6" key={idx}>
                      <div className="card pastel-card p-1">
                        <div className="d-flex align-items-center gap-1">
                          <div>{item.icon}</div>
                          <div>
                            <div className="fw-semibold fs-7">{item.label}</div>
                            <div className="text-muted fw-bold fs-7">${item.value.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

export default VerPedidoModal;
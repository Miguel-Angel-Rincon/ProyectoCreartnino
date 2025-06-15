import React, { useState } from 'react';
import '../styles/acciones.css';
import { FaMoneyBillWave, FaPercent, FaCalculator, FaWallet, FaCoins } from 'react-icons/fa';

interface CrearPedidoProps {
  onClose: () => void;
  onCrear: (pedido: any) => void;
}

interface PedidoDetalle {
  producto: string;
  cantidad: number;
  precio: number;
}

const clientesMock = [
  { IdClientes: 1, Nombre: 'Laura', Apellido: 'García' },
  { IdClientes: 2, Nombre: 'Carlos', Apellido: 'Ramírez' },
  { IdClientes: 3, Nombre: 'Ana', Apellido: 'Martínez' }
];

const productosMock = [
  { IdProducto: 201, Nombre: 'Toppers', precio: 20000 },
  { IdProducto: 202, Nombre: 'Caja ataúd', precio: 25000 },
  { IdProducto: 203, Nombre: 'Taza', precio: 18000 }
];

const CrearPedido: React.FC<CrearPedidoProps> = ({ onClose, onCrear }) => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [fechaPedido, setFechaPedido] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [detallePedido, setDetallePedido] = useState<PedidoDetalle[]>([]);

  const agregarDetalle = () => {
    setDetallePedido([...detallePedido, { producto: '', cantidad: 0, precio: 0 }]);
  };

  const actualizarDetalle = (index: number, campo: keyof PedidoDetalle, valor: string | number) => {
    const copia = [...detallePedido];
    if (campo === 'producto') {
      const producto = productosMock.find(p => p.Nombre === valor);
      copia[index].producto = producto?.Nombre || '';
      copia[index].precio = producto?.precio || 0;
    } else {
      copia[index][campo] = parseFloat(valor as string);
    }
    setDetallePedido(copia);
  };

  const eliminarDetalle = (index: number) => {
    const copia = [...detallePedido];
    copia.splice(index, 1);
    setDetallePedido(copia);
  };

  const calcularSubtotal = () =>
    detallePedido.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

  const calcularIVA = () => calcularSubtotal() * 0.19;
  const calcularTotalConIVA = () => calcularSubtotal() + calcularIVA();
  const calcularValorInicial = () => calcularTotalConIVA() * 0.5;
  const calcularValorRestante = () => calcularTotalConIVA() - calcularValorInicial();

  const handleSubmit = () => {
    const clienteObj = clientesMock.find(c => c.IdClientes.toString() === clienteSeleccionado);
    const nombreCliente = clienteObj ? `${clienteObj.Nombre} ${clienteObj.Apellido}` : '';

    const nuevoPedido = {
      IdCliente: nombreCliente,
      MetodoPago: metodoPago,
      FechaPedido: fechaPedido,
      FechaEntrega: fechaEntrega,
      Descripcion: descripcion,
      ValorInicial: calcularValorInicial(),
      ValorRestante: calcularValorRestante(),
      ComprobantePago: comprobantePago ? comprobantePago.name : '',
      TotalPedido: calcularTotalConIVA(),
      Estado: 'Pendiente',
      detallePedido
    };
    onCrear(nuevoPedido);
  };

  return (
    <div className="modal d-block pastel-overlay">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pastel-modal shadow">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">📝 Crear Pedido</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              {/* Cliente y Método de Pago */}
              <div className="col-md-6">
                <label className="form-label">👤 Cliente</label>
                <select className="form-select" value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)} required>
                  <option value="">Seleccione</option>
                  {clientesMock.map(c => (
                    <option key={c.IdClientes} value={c.IdClientes}>
                      {c.Nombre} {c.Apellido}
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

              {/* Fechas */}
              <div className="col-md-6">
                <label className="form-label">📅 Fecha del Pedido</label>
                <input type="date" className="form-control" value={fechaPedido} onChange={e => setFechaPedido(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">📦 Fecha de Entrega</label>
                <input type="date" className="form-control" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required />
              </div>

              {/* Descripción */}
              <div className="col-12">
                <label className="form-label">📝 Descripción</label>
                <textarea className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
              </div>

              {/* Comprobante de pago */}
              {metodoPago === 'Transferencia' && (
                <div className="col-12">
                  <label className="form-label">📎 Comprobante de Pago</label>
                  <input type="file" className="form-control" onChange={e => {
                    if (e.target.files?.length) {
                      setComprobantePago(e.target.files[0]);
                    }
                  }} />
                </div>
              )}

              {/* Detalle de productos */}
              <div className="col-12 mt-4">
                <h6 className="text-muted">🧾 Detalle del Pedido</h6>
                <div className="row fw-bold mb-2">
                  <div className="col-md-4">Nombre del Producto</div>
                  <div className="col-md-4">Cantidad</div>
                  <div className="col-md-3">Precio</div>
                  <div className="col-md-1"></div>
                </div>
                {detallePedido.map((item, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-md-4">
                      <select className="form-select" value={item.producto} onChange={e => actualizarDetalle(index, 'producto', e.target.value)}>
                        <option value="">Seleccione un producto</option>
                        {productosMock.map(p => (
                          <option key={p.IdProducto} value={p.Nombre}>{p.Nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input type="number" className="form-control" value={item.cantidad} onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <input type="number" className="form-control" value={item.precio} onChange={e => actualizarDetalle(index, 'precio', e.target.value)} />
                    </div>
                    <div className="col-md-1 text-center">
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>✖</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn pastel-btn-secondary" onClick={agregarDetalle}>+ Agregar Producto</button>
              </div>

              {/* RESUMEN DEL PEDIDO */}
              <div className="col-12 mt-4">
                <h6 className="text-muted mb-3">📊 Resumen del Pedido</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaMoneyBillWave size={20} className="mb-2 text-success" />
                        <h6>Subtotal</h6>
                        <p className="m-0">${calcularSubtotal().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaPercent size={20} className="mb-2 text-warning" />
                        <h6>IVA (19%)</h6>
                        <p className="m-0">${calcularIVA().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaCalculator size={20} className="mb-2 text-primary" />
                        <h6>Total con IVA</h6>
                        <p className="m-0">${calcularTotalConIVA().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaWallet size={20} className="mb-2 text-info" />
                        <h6>Valor Inicial (50%)</h6>
                        <p className="m-0">${calcularValorInicial().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card pastel-card text-center">
                      <div className="card-body">
                        <FaCoins size={20} className="mb-2 text-danger" />
                        <h6>Valor Restante</h6>
                        <p className="m-0">${calcularValorRestante().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn pastel-btn-primary" onClick={handleSubmit}>Registrar Pedido</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPedido;

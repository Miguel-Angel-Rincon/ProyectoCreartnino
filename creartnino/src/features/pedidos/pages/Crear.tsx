import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
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
  precioFormateado?: string;
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

const sumarDiasHabiles = (fechaStr: string, diasHabiles: number) => {
  const fecha = new Date(fechaStr);
  let sumados = 0;
  while (sumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay();
    if (dia !== 0 && dia !== 6) sumados++;
  }
  return fecha.toISOString().split('T')[0];
};

const CrearPedido: React.FC<CrearPedidoProps> = ({ onClose, onCrear }) => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [fechaPedido, setFechaPedido] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [detallePedido, setDetallePedido] = useState<PedidoDetalle[]>([]);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaPedido(hoy);
    setFechaEntrega(sumarDiasHabiles(hoy, 3));
  }, []);

  const agregarDetalle = () => {
    setDetallePedido([...detallePedido, { producto: '', cantidad: 0, precio: 0, precioFormateado: '' }]);
  };

  const actualizarDetalle = (index: number, campo: keyof PedidoDetalle, valor: string | number) => {
    const copia = [...detallePedido];
    if (campo === 'producto') {
      const producto = productosMock.find(p => p.Nombre === valor);
      copia[index].producto = producto?.Nombre || '';
      copia[index].precio = producto?.precio || 0;
      copia[index].precioFormateado = producto ? producto.precio.toLocaleString('es-CO') : '';
    } else if (campo === 'precio') {
      const valorNumerico = parseFloat(valor as string);
      copia[index].precio = isNaN(valorNumerico) ? 0 : valorNumerico;
      copia[index].precioFormateado = isNaN(valorNumerico) ? '' : valorNumerico.toLocaleString('es-CO');
    } else {
      if (campo === 'cantidad') {
        copia[index].cantidad = parseFloat(valor as string);
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productosValidos = detallePedido.filter(
      item => item.producto && item.cantidad > 0 && item.precio > 0
    );

    if (productosValidos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Debe agregar al menos un producto al pedido.'
      });
      return;
    }

    if (metodoPago === 'Transferencia' && !comprobantePago) {
      Swal.fire({
        icon: 'warning',
        title: 'Comprobante requerido',
        text: 'Debe adjuntar el comprobante de pago.'
      });
      return;
    }

    const clienteSeleccionadoObj = clientesMock.find(c => c.IdClientes.toString() === clienteSeleccionado);
    const nombreCliente = clienteSeleccionadoObj ? `${clienteSeleccionadoObj.Nombre} ${clienteSeleccionadoObj.Apellido}` : '';

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
      Estado: 'primer pago',
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

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="row g-4">
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

                <div className="col-md-6">
                  <label className="form-label">📅 Fecha del Pedido</label>
                  <input type="date" className="form-control" value={fechaPedido} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📦 Fecha de Entrega</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaEntrega}
                    min={sumarDiasHabiles(new Date().toISOString().split('T')[0], 3)}
                    onChange={e => setFechaEntrega(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📝 Descripción</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                  />
                </div>

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
                        <select className="form-select" value={item.producto} onChange={e => actualizarDetalle(index, 'producto', e.target.value)} required>
                          <option value="">Seleccione un producto</option>
                          {productosMock.map(p => (
                            <option key={p.IdProducto} value={p.Nombre}>{p.Nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <input type="number" className="form-control" value={item.cantidad} min={1} onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)} required />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          value={item.precioFormateado || ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                            const numero = parseInt(raw, 10);
                            actualizarDetalle(index, 'precio', isNaN(numero) ? 0 : numero);
                          }}
                          required
                        />
                      </div>
                      <div className="col-md-1 text-center">
                        <button className="btn btn-danger btn-sm" type="button" onClick={() => eliminarDetalle(index)}>✖</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn pastel-btn-secondary" onClick={agregarDetalle}>+ Agregar Producto</button>
                </div>

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
                      value: calcularValorInicial()
                    }, {
                      icon: <FaCoins size={16} className="text-danger" />,
                      label: 'Valor Restante',
                      value: calcularValorRestante()
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
              <button className="btn pastel-btn-secondary" type="button" onClick={onClose}>Cancelar</button>
              <button className="btn pastel-btn-primary" type="submit">Registrar Pedido</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearPedido;

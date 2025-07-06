import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';
import { FaCalculator, FaWallet, FaCoins, FaTrash } from 'react-icons/fa';

interface CrearPedidoProps {
  onClose: () => void;
  onCrear: (pedido: any) => void;
}

interface PedidoDetalle {
  producto: string;
  cantidad: number;
  precio: number;
  precioFormateado?: string;
  subtotal?: number;
}

const clientesMock = [
  { IdClientes: 1, Nombre: 'Laura', Apellido: 'García', Direccion: 'Calle 123 #45-67' },
  { IdClientes: 2, Nombre: 'Carlos', Apellido: 'Ramírez', Direccion: 'Carrera 89 #10-22' },
  { IdClientes: 3, Nombre: 'Ana', Apellido: 'Martínez', Direccion: 'Diagonal 56 #78-90' }
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
  const [direccionCliente, setDireccionCliente] = useState('');
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
    setDetallePedido([...detallePedido, { producto: '', cantidad: 0, precio: 0, precioFormateado: '', subtotal: 0 }]);
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
    } else if (campo === 'cantidad') {
      copia[index].cantidad = parseFloat(valor as string);
    }
    copia[index].subtotal = copia[index].cantidad * copia[index].precio;
    setDetallePedido(copia);
  };

  const eliminarDetalle = (index: number) => {
    const copia = [...detallePedido];
    copia.splice(index, 1);
    setDetallePedido(copia);
  };

  const calcularTotal = () =>
    detallePedido.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  const calcularValorInicial = () => calcularTotal() * 0.5;
  const calcularValorRestante = () => calcularTotal() - calcularValorInicial();

  const handleClienteSeleccionado = (id: string) => {
    setClienteSeleccionado(id);
    const cliente = clientesMock.find(c => c.IdClientes.toString() === id);
    setDireccionCliente(cliente?.Direccion || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
      await Swal.fire({
        icon: 'warning',
        title: 'Cliente requerido',
        text: 'Debe seleccionar un cliente para continuar.'
      });
      return;
    }

    if (!metodoPago) {
      await Swal.fire({
        icon: 'warning',
        title: 'Método de pago requerido',
        text: 'Seleccione un método de pago válido.'
      });
      return;
    }

    if (!fechaEntrega) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fecha de entrega requerida',
        text: 'Debe seleccionar una fecha de entrega.'
      });
      return;
    }

    const productosValidos = detallePedido.filter(
      item => item.producto && item.cantidad > 0 && item.precio > 0
    );

    if (productosValidos.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Debe agregar al menos un producto al pedido con cantidad y precio válidos.'
      });
      return;
    }

    if (metodoPago === 'Transferencia' && !comprobantePago) {
      await Swal.fire({
        icon: 'warning',
        title: 'Comprobante requerido',
        text: 'Debe adjuntar el comprobante de pago para la transferencia.'
      });
      return;
    }

    const clienteSeleccionadoObj = clientesMock.find(c => c.IdClientes.toString() === clienteSeleccionado);
    const nombreCliente = clienteSeleccionadoObj ? `${clienteSeleccionadoObj.Nombre} ${clienteSeleccionadoObj.Apellido}` : '';

    const nuevoPedido = {
      IdCliente: nombreCliente,
      Direccion: direccionCliente,
      MetodoPago: metodoPago,
      FechaPedido: fechaPedido,
      FechaEntrega: fechaEntrega,
      Descripcion: descripcion,
      ValorInicial: calcularValorInicial(),
      ValorRestante: calcularValorRestante(),
      ComprobantePago: comprobantePago ? comprobantePago.name : '',
      TotalPedido: calcularTotal(),
      Estado: 'primer pago',
      detallePedido
    };

    await Swal.fire({
      icon: 'success',
      title: 'Pedido creado',
      text: 'El pedido ha sido creado exitosamente.'
    });

    onCrear(nuevoPedido);
  };

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="row g-4 mb-3">
          <div className="col-md-3">
            <label className="form-label">👤 Cliente <span className="text-danger">*</span></label>
            <select className="form-select" value={clienteSeleccionado} onChange={e => handleClienteSeleccionado(e.target.value)} required>
              <option value="">Seleccione</option>
              {clientesMock.map(c => (
                <option key={c.IdClientes} value={c.IdClientes}>
                  {c.Nombre} {c.Apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">💳 Método de Pago <span className="text-danger">*</span></label>
            <select className="form-select" value={metodoPago} onChange={e => setMetodoPago(e.target.value)} required>
              <option value="">Seleccione</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">📅 Fecha del Pedido</label>
            <input type="date" className="form-control" value={fechaPedido} readOnly />
          </div>
          <div className="col-md-3">
            <label className="form-label">📦 Fecha de Entrega <span className="text-danger">*</span></label>
            <input type="date" className="form-control" value={fechaEntrega} min={sumarDiasHabiles(new Date().toISOString().split('T')[0], 3)} onChange={e => setFechaEntrega(e.target.value)} required />
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="col-12 mt-4">
          <h6 className="text-muted">🧾 Detalle del Pedido</h6>
          <div className="row fw-bold mb-2">
            <div className="col-md-3">Producto <span className="text-danger">*</span></div>
            <div className="col-md-2">Cantidad <span className="text-danger">*</span></div>
            <div className="col-md-2">Precio <span className="text-danger">*</span></div>
            <div className="col-md-3">Subtotal</div>
            <div className="col-md-2"></div>
          </div>
          {detallePedido.map((item, index) => (
            <div key={index} className="row mb-2 align-items-center">
              <div className="col-md-3">
                <select className="form-select" value={item.producto} onChange={e => actualizarDetalle(index, 'producto', e.target.value)} required>
                  <option value="">Seleccione un producto</option>
                  {productosMock.map(p => (
                    <option key={p.IdProducto} value={p.Nombre}>{p.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <input type="number" className="form-control" value={item.cantidad} min={1} onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)} required />
              </div>
              <div className="col-md-2">
                <input type="text" className="form-control" value={item.precioFormateado || ''} onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                  const numero = parseInt(raw, 10);
                  actualizarDetalle(index, 'precio', isNaN(numero) ? 0 : numero);
                }} required />
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control" value={`$${(item.cantidad * item.precio).toLocaleString()}`} readOnly />
              </div>
              <div className="col-md-2 text-center">
                <button className="btn btn-danger btn-sm" type="button" onClick={() => eliminarDetalle(index)}><FaTrash /></button>
              </div>
            </div>
          ))}
          <button type="button" className="btn pastel-btn-secondary mt-2" onClick={agregarDetalle}>+ Agregar Producto</button>
        </div>

        {/* Personalización y dirección */}
        <div className="row g-4 mt-3">
          <div className="col-md-6">
            <label className="form-label">🎨 Personalización</label>
            <textarea className="form-control" rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          </div>
          {clienteSeleccionado && (
            <div className="col-md-6">
              <label className="form-label">📍 Dirección del Cliente</label>
              <input type="text" className="form-control" value={direccionCliente} onChange={e => setDireccionCliente(e.target.value)} />
            </div>
          )}
          {metodoPago === 'Transferencia' && (
            <div className="col-md-6 mt-3">
              <label className="form-label">📎 Comprobante de Pago</label>
              <input type="file" className="form-control" onChange={e => {
                if (e.target.files?.length) {
                  setComprobantePago(e.target.files[0]);
                }
              }} />
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="col-12 mt-4">
          <h6 className="text-muted mb-2">📊 Resumen del Pedido</h6>
          <div className="row g-2">
            <div className="col-md-4">
              <div className="card pastel-card p-1">
                <div className="d-flex align-items-center gap-1">
                  <div><FaWallet size={16} className="text-info" /></div>
                  <div>
                    <div className="fw-semibold fs-7">Valor Inicial</div>
                    <div className="text-muted fw-bold fs-7">${calcularValorInicial().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card pastel-card p-1">
                <div className="d-flex align-items-center gap-1">
                  <div><FaCoins size={16} className="text-danger" /></div>
                  <div>
                    <div className="fw-semibold fs-7">Valor Restante</div>
                    <div className="text-muted fw-bold fs-7">${calcularValorRestante().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card pastel-card p-1">
                <div className="d-flex align-items-center gap-1">
                  <div><FaCalculator size={16} className="text-primary" /></div>
                  <div>
                    <div className="fw-semibold fs-7">Total</div>
                    <div className="text-muted fw-bold fs-7">${calcularTotal().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-end mt-4">
          <button type="button" className="btn pastel-btn-secondary me-2" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn pastel-btn-primary">Crear</button>
        </div>
      </form>
    </div>
  );
};

export default CrearPedido;

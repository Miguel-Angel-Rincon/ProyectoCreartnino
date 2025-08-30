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
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [direccionCliente, setDireccionCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [fechaPedido, setFechaPedido] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [detallePedido, setDetallePedido] = useState<PedidoDetalle[]>([]);
  const [productoQuery, setProductoQuery] = useState<string[]>([]);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaPedido(hoy);
    setFechaEntrega(sumarDiasHabiles(hoy, 3));
  }, []);

  const clientesFiltrados = clienteBusqueda
    ? clientesMock.filter(c =>
        `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase())
      )
    : [];

  const handleClienteSeleccionado = (c: typeof clientesMock[0]) => {
    setClienteSeleccionado(c.IdClientes);
    setClienteBusqueda(`${c.Nombre} ${c.Apellido}`);
    setDireccionCliente(c.Direccion);
  };

  const agregarDetalle = () => {
    setDetallePedido([...detallePedido, { producto: '', cantidad: 0, precio: 0, subtotal: 0 }]);
    setProductoQuery(prev => [...prev, '']);
  };

  const actualizarDetalle = (index: number, campo: keyof PedidoDetalle, valor: string | number) => {
    const copia = [...detallePedido];
    if (campo === 'producto') {
      const prod = productosMock.find(p => p.Nombre === valor);
      copia[index].producto = prod?.Nombre || (valor as string);
      copia[index].precio = prod?.precio ?? copia[index].precio;
      copia[index].subtotal = copia[index].cantidad * copia[index].precio;
      setProductoQuery(prev => {
        const copy = [...prev];
        copy[index] = '';
        return copy;
      });
    } else if (campo === 'cantidad') {
      copia[index].cantidad = Number(valor) || 0;
      copia[index].subtotal = copia[index].cantidad * copia[index].precio;
    } else if (campo === 'precio') {
      copia[index].precio = Number(valor) || 0;
      copia[index].subtotal = copia[index].cantidad * copia[index].precio;
    }
    setDetallePedido(copia);
  };

  const seleccionarProducto = (index: number, nombre: string) => {
    const prod = productosMock.find(p => p.Nombre === nombre);
    if (!prod) return;
    actualizarDetalle(index, 'producto', prod.Nombre);
  };

  const handleProductoQueryChange = (index: number, value: string) => {
    setProductoQuery(prev => {
      const copia = [...prev];
      copia[index] = value;
      return copia;
    });
    setDetallePedido(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], producto: '' };
      return copia;
    });
  };

  const eliminarDetalle = (index: number) => {
    setDetallePedido(prev => prev.filter((_, i) => i !== index));
    setProductoQuery(prev => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () =>
    detallePedido.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  const calcularValorInicial = () => calcularTotal() * 0.5;
  const calcularValorRestante = () => calcularTotal() - calcularValorInicial();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
      await Swal.fire({ icon: 'warning', title: 'Cliente requerido', text: 'Debe seleccionar un cliente válido.' });
      return;
    }

    if (!metodoPago) {
      await Swal.fire({ icon: 'warning', title: 'Método de pago requerido', text: 'Seleccione un método válido.' });
      return;
    }

    if (!fechaEntrega) {
      await Swal.fire({ icon: 'warning', title: 'Fecha de entrega requerida', text: 'Seleccione una fecha válida.' });
      return;
    }

    if (detallePedido.length === 0) {
      await Swal.fire({ icon: 'warning', title: 'Detalle vacío', text: 'Debe agregar al menos un producto.' });
      return;
    }

    for (let i = 0; i < detallePedido.length; i++) {
      const item = detallePedido[i];
      const existe = productosMock.some(p => p.Nombre === item.producto);
      if (!item.producto || !existe || item.cantidad <= 0 || item.precio <= 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Error en producto',
          text: `Fila #${i + 1}: debes seleccionar un producto válido y completar cantidad/precio.`
        });
        return;
      }
    }

    if (metodoPago === 'Transferencia' && !comprobantePago) {
      await Swal.fire({ icon: 'warning', title: 'Comprobante requerido', text: 'Debe adjuntar el comprobante de pago.' });
      return;
    }

    const clienteObj = clientesMock.find(
  (c) => c.IdClientes.toString() === String(clienteSeleccionado)
);

const nombreCliente = clienteObj
  ? `${clienteObj.Nombre} ${clienteObj.Apellido}`
  : '';

    const nuevoPedido = {
  Cliente: nombreCliente,  // ✅ ya guarda el nombre completo
  Direccion: direccionCliente,
  MetodoPago: metodoPago,
  FechaPedido: fechaPedido,
  FechaEntrega: fechaEntrega,
  Descripcion: descripcion,
  ValorInicial: calcularValorInicial(),
  ValorRestante: calcularValorRestante(),
  ComprobantePago: comprobantePago ? comprobantePago.name : '',
  TotalPedido: calcularTotal(),
  Estado: 'Primer Pago',  // 👈 te recomiendo mayúscula para que quede parejo
  detallePedido
};

    await Swal.fire({ icon: 'success', title: 'Pedido creado', text: 'El pedido ha sido creado exitosamente.' });
    onCrear(nuevoPedido);
    onClose();
  };

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="row g-4 mb-3">
          {/* Cliente */}
          <div className="col-md-3 position-relative">
            <label className="form-label">👤 Cliente <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar cliente..."
              value={clienteBusqueda}
              onChange={e => {
                setClienteBusqueda(e.target.value);
                setClienteSeleccionado(null);
              }}
            />
            {!clienteSeleccionado && clienteBusqueda && clientesFiltrados.length > 0 && (
              <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                {clientesFiltrados.map(c => (
                  <li
                    key={c.IdClientes}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleClienteSeleccionado(c)}
                  >
                    {c.Nombre} {c.Apellido} - {c.Direccion}
                  </li>
                ))}
              </ul>
            )}
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

        {/* Detalle Pedido */}
        <div className="col-12 mt-4">
          <h6 className="text-muted">🧾 Detalle del Pedido</h6>
          <div className="row fw-bold mb-2">
            <div className="col-md-3">Producto</div>
            <div className="col-md-2">Cantidad</div>
            <div className="col-md-2">Precio</div>
            <div className="col-md-3">Subtotal</div>
            <div className="col-md-2"></div>
          </div>

          {detallePedido.map((item, index) => {
            const query = productoQuery[index] ?? '';
            const sugerencias = query.length > 0
              ? productosMock.filter(p => p.Nombre.toLowerCase().includes(query.toLowerCase()))
              : [];

            return (
              <div key={index} className="row mb-2 align-items-center position-relative">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar producto..."
                    value={query !== '' ? query : item.producto}
                    onChange={e => handleProductoQueryChange(index, e.target.value)}
                  />
                  {query && sugerencias.length > 0 && (
                    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, top: '38px' }}>
                      {sugerencias.map(p => (
                        <li
                          key={p.IdProducto}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: 'pointer' }}
                          onClick={() => seleccionarProducto(index, p.Nombre)}
                        >
                          {p.Nombre} - ${p.precio.toLocaleString('es-CO')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={item.cantidad}
                    onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
  <input
    type="text"
    className="form-control"
    value={
      item.precio > 0
        ? item.precio.toLocaleString("es-CO")
        : ""
    }
    onChange={e => {
      // Quitamos puntos y comas al digitar
      const raw = e.target.value.replace(/\./g, "").replace(/,/g, "");
      const parsed = Number(raw) || 0;
      actualizarDetalle(index, "precio", parsed);
    }}
  />
</div>
                <div className="col-md-3">
                  <input type="text" className="form-control" value={`$${(item.cantidad * item.precio).toLocaleString('es-CO')}`} readOnly />
                </div>
                <div className="col-md-2 text-center">
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => eliminarDetalle(index)}><FaTrash /></button>
                </div>
              </div>
            );
          })}

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
                if (e.target.files?.length) setComprobantePago(e.target.files[0]);
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
                  <FaWallet size={16} className="text-info" />
                  <div>
                    <div className="fw-semibold fs-7">Valor Inicial</div>
                    <div className="text-muted fw-bold fs-7">${calcularValorInicial().toLocaleString('es-CO')}</div>
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
                    <div className="text-muted fw-bold fs-7">${calcularValorRestante().toLocaleString('es-CO')}</div>
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
                    <div className="text-muted fw-bold fs-7">${calcularTotal().toLocaleString('es-CO')}</div>
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

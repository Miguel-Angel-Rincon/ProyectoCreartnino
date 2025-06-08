import React, { useState } from 'react';

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
  { IdProducto: 201, Nombre: 'Camiseta', precio: 35000 },
  { IdProducto: 202, Nombre: 'Gorra', precio: 15000 },
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
    <div>
      <h4>Registrar Pedido</h4>

      <div className="mb-3">
        <label className="form-label">Cliente:</label>
        <select
          className="form-control"
          value={clienteSeleccionado}
          onChange={e => setClienteSeleccionado(e.target.value)}
        >
          <option value="">Seleccione</option>
          {clientesMock.map(c => (
            <option key={c.IdClientes} value={c.IdClientes}>
              {c.Nombre} {c.Apellido}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Método de Pago:</label>
        <select className="form-control" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
          <option value="">Seleccione</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha del Pedido:</label>
        <input type="date" className="form-control" value={fechaPedido} onChange={e => setFechaPedido(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha de Entrega:</label>
        <input type="date" className="form-control" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Descripción:</label>
        <textarea className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Comprobante de Pago:</label>
        <input
          type="file"
          className="form-control"
          onChange={e => {
            if (e.target.files?.length) {
              setComprobantePago(e.target.files[0]);
            }
          }}
        />
      </div>

      <h5>Detalle de Productos</h5>
      {detallePedido.map((item, index) => (
        <div key={index} className="d-flex gap-2 mb-2">
          <select
            className="form-control"
            value={item.producto}
            onChange={e => actualizarDetalle(index, 'producto', e.target.value)}
          >
            <option value="">Seleccione un producto</option>
            {productosMock.map(p => (
              <option key={p.IdProducto} value={p.Nombre}>
                {p.Nombre}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={item.cantidad}
            onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)}
          />
          <input
            type="number"
            className="form-control"
            value={item.precio}
            readOnly
          />
          <button className="btn btn-danger" onClick={() => eliminarDetalle(index)}>X</button>
        </div>
      ))}
      <button className="btn btn-secondary mb-3" onClick={agregarDetalle}>+ Agregar Producto</button>

      <div className="mb-2"><strong>Subtotal:</strong> ${calcularSubtotal().toLocaleString()}</div>
      <div className="mb-2"><strong>IVA (19%):</strong> ${calcularIVA().toLocaleString()}</div>
      <div className="mb-2"><strong>Total con IVA:</strong> ${calcularTotalConIVA().toLocaleString()}</div>
      <div className="mb-2"><strong>Valor Inicial (50%):</strong> ${calcularValorInicial().toLocaleString()}</div>
      <div className="mb-2"><strong>Valor Restante:</strong> ${calcularValorRestante().toLocaleString()}</div>

      <div className="text-end">
        <button className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button className="btn btn-success" onClick={handleSubmit}>Registrar Pedido</button>
      </div>
    </div>
  );
};

export default CrearPedido;

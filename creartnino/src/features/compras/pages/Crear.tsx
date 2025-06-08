import React, { useState } from 'react';

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
    const nuevaCompra = {
      proveedorSeleccionado,
      metodoPago,
      fechaCompra,
      detalleCompra
    };
    onCrear(nuevaCompra);
  };

  return (
    <div>
      <h4>Registrar Compra</h4>

      <div className="mb-3">
        <label className="form-label">Proveedor:</label>
        <select
          className="form-control"
          value={proveedorSeleccionado}
          onChange={e => setProveedorSeleccionado(e.target.value)}
        >
          <option value="">Seleccione</option>
          {proveedoresMock.map(p => (
            <option key={p.IdProveedores} value={p.NombreCompleto}>
              {p.NombreCompleto}
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
        <label className="form-label">Fecha de Compra:</label>
        <input type="date" className="form-control" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} />
      </div>

      <h5>Detalle de Insumos</h5>
      {detalleCompra.map((item, index) => (
        <div key={index} className="d-flex gap-2 mb-2">
          <select
            className="form-control"
            value={item.insumo}
            onChange={e => actualizarDetalle(index, 'insumo', e.target.value)}
          >
            <option value="">Seleccione un insumo</option>
            {insumosMock.map(insumo => (
              <option key={insumo.IdInsumos} value={insumo.Nombre}>
                {insumo.Nombre}
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
      <button className="btn btn-secondary mb-3" onClick={agregarDetalle}>+ Agregar Insumo</button>

      <div className="mb-2"><strong>Subtotal:</strong> ${calcularSubtotal().toLocaleString()}</div>
      <div className="mb-2"><strong>IVA (19%):</strong> ${calcularIVA().toLocaleString()}</div>
      <div className="mb-2"><strong>Total:</strong> ${calcularTotal().toLocaleString()}</div>

      <div className="text-end">
        <button className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button className="btn btn-pink" onClick={handleSubmit}>Registrar Compra</button>
      </div>
    </div>
  );
};

export default CrearCompra;

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaMoneyBillWave, FaPercent, FaCalculator, FaTrash } from 'react-icons/fa';
import '../styles/style.css';

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
    if (!proveedorSeleccionado || !metodoPago || !fechaCompra) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Debes completar todos los campos principales.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (detalleCompra.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Detalle vacío',
        text: 'Debes agregar al menos un insumo.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    for (let i = 0; i < detalleCompra.length; i++) {
      const item = detalleCompra[i];
      if (!item.insumo || item.cantidad <= 0 || item.precio <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Error en insumo',
          text: `Todos los campos del insumo #${i + 1} deben estar completos y tener valores válidos.`,
          confirmButtonColor: '#f78fb3',
        });
        return;
      }
    }

    const nuevaCompra = {
      proveedorSeleccionado,
      metodoPago,
      fechaCompra,
      detalleCompra,
      Subtotal: calcularSubtotal(),
      IVA: calcularIVA(),
      Total: calcularTotal()
    };
    onCrear(nuevaCompra);
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Crear Compra</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">
            🧑 Proveedor <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
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

        <div className="col-md-4">
          <label className="form-label">
            💳 Método de Pago <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">
            📅 Fecha de Compra <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={fechaCompra}
            onChange={e => setFechaCompra(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <h5 className="mb-3">📦 Detalle de la compra</h5>

        <div className="row fw-bold text-secondary mb-1">
          <div className="col-md-3">Insumo</div>
          <div className="col-md-2">Cantidad</div>
          <div className="col-md-2">Precio</div>
          <div className="col-md-3">Subtotal</div>
          <div className="col-md-2 text-end">Acción</div>
        </div>

        {detalleCompra.map((item, index) => (
          <div key={index} className="row align-items-center mb-2">
            <div className="col-md-3">
              <select
                className="form-control form-control-sm"
                value={item.insumo}
                onChange={e => actualizarDetalle(index, 'insumo', e.target.value)}
              >
                <option value="">Seleccione un insumo</option>
                {insumosMock.map(i => (
                  <option key={i.IdInsumos} value={i.Nombre}>{i.Nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control form-control-sm"
                min={1}
                value={item.cantidad}
                onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control form-control-sm"
                value={Math.round(item.precio).toLocaleString('es-CO')}
                onChange={e =>
                  actualizarDetalle(
                    index,
                    'precio',
                    parseInt(e.target.value.replace(/\./g, '').replace(',', '')) || 0
                  )
                }
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                value={`$${Math.round(item.precio * item.cantidad).toLocaleString('es-CO')}`}
                disabled
              />
            </div>
            <div className="col-md-2 text-end">
              <button className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        <button className="btn btn-sm pastel-btn-secondary mt-2" onClick={agregarDetalle}>
          + Agregar Insumo
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaMoneyBillWave size={18} className="mb-1" />
            <small className="d-block">Subtotal</small>
            <small>${Math.round(calcularSubtotal()).toLocaleString('es-CO')}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaPercent size={18} className="mb-1" />
            <small className="d-block">IVA (19%)</small>
            <small>${Math.round(calcularIVA()).toLocaleString('es-CO')}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaCalculator size={18} className="mb-1" />
            <small className="d-block">Total</small>
            <small>${Math.round(calcularTotal()).toLocaleString('es-CO')}</small>
          </div>
        </div>
      </div>

      <div className="text-end">
        <button className="btn pastel-btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button className="btn pastel-btn-primary" onClick={handleSubmit}>Crear</button>
      </div>
    </div>
  );
};

export default CrearCompra;

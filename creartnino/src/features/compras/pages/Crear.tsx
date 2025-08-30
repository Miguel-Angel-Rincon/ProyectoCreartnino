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
  { IdProveedor: 1, NombreCompleto: 'Juan Aranago' },
  { IdProveedor: 2, NombreCompleto: 'Maria Lopez' },
  { IdProveedor: 3, NombreCompleto: 'Pedro Martinez' }
];

const insumosMock = [
  { IdInsumos: 301, Nombre: 'Cartulina', precioUnitario: 20000 },
  { IdInsumos: 306, Nombre: 'Carton Paja', precioUnitario: 12000 },
  { IdInsumos: 307, Nombre: 'Palos Paleta', precioUnitario: 40000 }
];

const getToday = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const CrearCompra: React.FC<CrearCompraProps> = ({ onClose, onCrear }) => {
  const [proveedorIdSeleccionado, setProveedorIdSeleccionado] = useState<number | null>(null);
  const [proveedorBusqueda, setProveedorBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [detalleCompra, setDetalleCompra] = useState<CompraDetalle[]>([]);
  const [insumoQuery, setInsumoQuery] = useState<string[]>([]);
  const fechaCompra = getToday();

  const proveedoresFiltrados = proveedorBusqueda
    ? proveedoresMock.filter(p =>
        p.NombreCompleto.toLowerCase().includes(proveedorBusqueda.toLowerCase())
      )
    : [];

  const agregarDetalle = () => {
    setDetalleCompra(prev => [...prev, { insumo: '', cantidad: 0, precio: 0 }]);
    setInsumoQuery(prev => [...prev, '']);
  };

  const actualizarDetalle = (index: number, campo: keyof CompraDetalle, valor: string | number) => {
    const copia = [...detalleCompra];
    if (campo === 'cantidad') {
      copia[index].cantidad = Number(valor) || 0;
    } else if (campo === 'precio') {
      copia[index].precio = Number(valor) || 0;
    } else if (campo === 'insumo') {
      const insumo = insumosMock.find(i => i.Nombre === valor);
      copia[index].insumo = insumo?.Nombre || (valor as string);
      copia[index].precio = insumo?.precioUnitario ?? copia[index].precio;
      setInsumoQuery(prev => {
        const copyQ = [...prev];
        copyQ[index] = '';
        return copyQ;
      });
    }
    setDetalleCompra(copia);
  };

  const seleccionarInsumo = (index: number, nombre: string) => {
    const insumo = insumosMock.find(i => i.Nombre === nombre);
    if (!insumo) return;
    actualizarDetalle(index, 'insumo', insumo.Nombre);
  };

  const handleInsumoQueryChange = (index: number, value: string) => {
    setInsumoQuery(prev => {
      const copia = [...prev];
      copia[index] = value;
      return copia;
    });
    setDetalleCompra(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], insumo: '' };
      return copia;
    });
  };

  const eliminarDetalle = (index: number) => {
    setDetalleCompra(prev => prev.filter((_, i) => i !== index));
    setInsumoQuery(prev => prev.filter((_, i) => i !== index));
  };

  const calcularSubtotal = () =>
    detalleCompra.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

  const calcularIVA = () => calcularSubtotal() * 0.19;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const handleProveedorSuggestionSelect = (p: { IdProveedor: number; NombreCompleto: string }) => {
    setProveedorIdSeleccionado(p.IdProveedor);
    setProveedorBusqueda(p.NombreCompleto);
  };

  const handleSubmit = () => {
    if (!proveedorIdSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Proveedor inválido',
        text: 'Debes seleccionar un proveedor válido desde la lista.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!metodoPago) {
      Swal.fire({
        icon: 'warning',
        title: 'Método de pago requerido',
        text: 'Selecciona un método de pago.',
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
      const existe = insumosMock.some(ins => ins.Nombre === item.insumo);
      if (!item.insumo || !existe || item.cantidad <= 0 || item.precio <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Error en insumo',
          text: `Fila #${i + 1}: debes seleccionar un insumo válido y completar cantidad/precio.`,
          confirmButtonColor: '#f78fb3',
        });
        return;
      }
    }

    // OBTENEMOS EL NOMBRE (aseguramos enviar el nombre esperado por ListarCompras)
    const proveedorNombre =
      proveedoresMock.find(p => p.IdProveedor === proveedorIdSeleccionado)?.NombreCompleto ?? proveedorBusqueda ?? '';

    // AQUI: mantenemos exactamente tu estructura + añadimos proveedorSeleccionado (nombre)
    const nuevaCompra = {
      proveedorId: proveedorIdSeleccionado,
      proveedorSeleccionado: proveedorNombre, // <- importante: así ListarCompras lo mostrará
      proveedorNombre,
      metodoPago,
      fechaCompra,
      detalleCompra,
      Subtotal: calcularSubtotal(),
      IVA: calcularIVA(),
      Total: calcularTotal()
    };

    // ✅ primero crea
    onCrear(nuevaCompra);
    // ✅ luego cierra
    onClose();
    // ✅ y muestra alerta ya en el listado
    Swal.fire({
      icon: 'success',
      title: 'Compra creada',
      text: 'La compra se creó correctamente.',
      confirmButtonColor: '#4CAF50',
    });
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Crear Compra</h2>

      <div className="row mb-3">
        {/* Proveedor */}
        <div className="col-md-4 position-relative">
          <label className="form-label">🧑 Proveedor <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar proveedor..."
            value={proveedorBusqueda}
            onChange={e => {
              setProveedorBusqueda(e.target.value);
              setProveedorIdSeleccionado(null);
            }}
          />
          {!proveedorIdSeleccionado && proveedorBusqueda && proveedoresFiltrados.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
              {proveedoresFiltrados.map(p => (
                <li
                  key={p.IdProveedor}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleProveedorSuggestionSelect(p)}
                >
                  {p.NombreCompleto}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label">💳 Método de Pago <span className="text-danger">*</span></label>
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
          <label className="form-label">📅 Fecha de Compra <span className="text-danger">*</span></label>
          <input type="date" className="form-control" value={fechaCompra} disabled readOnly />
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

        {detalleCompra.map((item, index) => {
          const query = insumoQuery[index] ?? '';
          const sugerencias = query.length > 0
            ? insumosMock.filter(i => i.Nombre.toLowerCase().includes(query.toLowerCase()))
            : [];

          return (
            <div key={index} className="row align-items-center mb-2 position-relative">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar insumo..."
                  value={query !== '' ? query : item.insumo}
                  onChange={e => handleInsumoQueryChange(index, e.target.value)}
                />
                {query && sugerencias.length > 0 && (
                  <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, top: '38px' }}>
                    {sugerencias.map(i => (
                      <li
                        key={i.IdInsumos}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => seleccionarInsumo(index, i.Nombre)}
                      >
                        {i.Nombre} - ${i.precioUnitario.toLocaleString('es-CO')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={1}
                  step={1}
                  value={item.cantidad}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                    actualizarDetalle(index, 'cantidad', parsed);
                  }}
                  onBlur={(e) => {
                    const parsed = Math.max(0, parseInt(e.target.value || '0', 10) || 0);
                    actualizarDetalle(index, 'cantidad', parsed);
                  }}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={0}
                  value={item.precio}
                  onChange={e => actualizarDetalle(index, 'precio', Number(e.target.value))}
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
                <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}

        <button type="button" className="btn btn-sm pastel-btn-secondary mt-2" onClick={agregarDetalle}>
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
        <button type="button" className="btn pastel-btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button type="button" className="btn pastel-btn-primary" onClick={handleSubmit}>Crear</button>
      </div>
    </div>
  );
};

export default CrearCompra;

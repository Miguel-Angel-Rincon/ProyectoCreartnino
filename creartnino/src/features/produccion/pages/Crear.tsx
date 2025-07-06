import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

interface CrearProduccionProps {
  onClose: () => void;
  onCrear: (produccion: any) => void;
}

const productosMock = [
  { IdProducto: 201, Nombre: 'Toppers', precio: 20000 },
  { IdProducto: 202, Nombre: 'Caja ataúd', precio: 25000 },
  { IdProducto: 203, Nombre: 'Taza', precio: 18000 }
];

const insumosMock = [
  { IdInsumo: 1, Nombre: 'Vinilo', cantidad: 100 },
  { IdInsumo: 2, Nombre: 'Resina', cantidad: 200 },
  { IdInsumo: 3, Nombre: 'Papel Transfer', cantidad: 150 }
];

interface InsumoGasto {
  insumo: string;
  cantidadUsada: number;
  disponible: number;
}

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
  insumos?: InsumoGasto[];
}

const CrearProduccion: React.FC<CrearProduccionProps> = ({ onClose, onCrear }) => {
  const [nombre, setNombre] = useState('');
  const [tipoProduccion, setTipoProduccion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [detalle, setDetalle] = useState<DetalleProduccion[]>([]);
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const validarFormulario = (): boolean => {
    if (!nombre.trim() || !tipoProduccion || !fechaInicio || !fechaFin) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos obligatorios.', confirmButtonColor: '#e83e8c' });
      return false;
    }

    if (fechaInicio < today) {
      Swal.fire({ icon: 'error', title: 'Fecha inválida', text: 'La fecha de inicio no puede ser anterior a hoy.', confirmButtonColor: '#d33' });
      return false;
    }

    if (fechaFin < fechaInicio) {
      Swal.fire({ icon: 'error', title: 'Fecha inválida', text: 'La fecha de finalización no puede ser anterior a la de inicio.', confirmButtonColor: '#d33' });
      return false;
    }

    if (detalle.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin productos', text: 'Agrega al menos un producto.', confirmButtonColor: '#e83e8c' });
      return false;
    }

    for (let i = 0; i < detalle.length; i++) {
      const prod = detalle[i];
      if (!prod.producto || prod.cantidad <= 0) {
        Swal.fire({ icon: 'error', title: 'Producto inválido', text: `El producto #${i + 1} está incompleto o tiene cantidad inválida.`, confirmButtonColor: '#d33' });
        return false;
      }
      if (!prod.insumos || prod.insumos.length === 0) {
        Swal.fire({ icon: 'error', title: 'Faltan insumos', text: `Debes agregar al menos un insumo para el producto "${prod.producto}".`, confirmButtonColor: '#d33' });
        return false;
      }
      for (let ins of prod.insumos) {
        if (!ins.insumo || ins.cantidadUsada <= 0) {
          Swal.fire({ icon: 'error', title: 'Insumo inválido', text: `Revisa los insumos del producto "${prod.producto}".`, confirmButtonColor: '#d33' });
          return false;
        }
        const global = insumosMock.find(i => i.Nombre === ins.insumo);
        if (ins.cantidadUsada > (global?.cantidad || 0)) {
          Swal.fire({ icon: 'error', title: 'Cantidad excedida', text: `No hay suficiente "${ins.insumo}" disponible.`, confirmButtonColor: '#d33' });
          return false;
        }
      }
    }
    return true;
  };

  const cerrarSubmodalValidado = () => {
    const detalleActual = detalle[mostrarSubmodal!];
    if (!detalleActual.insumos || detalleActual.insumos.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin insumos', text: 'Debes agregar al menos un insumo.', confirmButtonColor: '#e83e8c' });
      return;
    }
    for (let ins of detalleActual.insumos) {
      if (!ins.insumo || ins.cantidadUsada <= 0) {
        Swal.fire({ icon: 'error', title: 'Insumo inválido', text: 'Completa correctamente todos los insumos antes de continuar.', confirmButtonColor: '#d33' });
        return;
      }
    }
    setMostrarSubmodal(null);
  };

  const agregarDetalle = () => setDetalle([...detalle, { producto: '', cantidad: 0, precio: 0, insumos: [] }]);

  const actualizarDetalle = (index: number, campo: 'producto' | 'cantidad' | 'precio', valor: string | number) => {
    const copia = [...detalle];
    if (campo === 'producto') {
      const producto = productosMock.find(p => p.Nombre === valor);
      copia[index].producto = producto?.Nombre || '';
      copia[index].precio = producto?.precio || 0;
    } else copia[index][campo] = parseFloat(valor as string);
    setDetalle(copia);
  };

  const eliminarDetalle = (index: number) => {
    const copia = [...detalle];
    copia.splice(index, 1);
    setDetalle(copia);
  };

  const agregarInsumo = (index: number) => {
    const copia = [...detalle];
    copia[index].insumos = copia[index].insumos || [];
    copia[index].insumos!.push({ insumo: '', cantidadUsada: 0, disponible: 0 });
    setDetalle(copia);
  };

  const actualizarInsumo = (pIndex: number, iIndex: number, campo: keyof InsumoGasto, valor: string | number) => {
    const copia = [...detalle];
    const insumos = copia[pIndex].insumos || [];
    if (campo === 'insumo') {
      const ins = insumosMock.find(i => i.Nombre === valor);
      insumos[iIndex].insumo = ins?.Nombre || '';
      insumos[iIndex].disponible = ins?.cantidad || 0;
    } else if (campo === 'cantidadUsada') {
      const nuevaCantidad = parseFloat(valor as string);
      if (nuevaCantidad > insumos[iIndex].disponible) {
        Swal.fire({ icon: 'error', title: 'Cantidad excedida', text: 'No puedes usar más insumo del disponible.', confirmButtonColor: '#d33' });
        return;
      }
      insumos[iIndex].cantidadUsada = nuevaCantidad;
    }
    copia[pIndex].insumos = insumos;
    setDetalle(copia);
  };

  const eliminarInsumo = (pIndex: number, iIndex: number) => {
    const copia = [...detalle];
    copia[pIndex].insumos?.splice(iIndex, 1);
    setDetalle(copia);
  };

  const handleSubmit = () => {
    if (!validarFormulario()) return;
    const nuevaProduccion = {
      IdProduccion: Math.floor(Math.random() * 1000) + 600,
      Nombre: nombre,
      TipoProduccion: tipoProduccion,
      FechaRegistro: fechaInicio,
      FechaFinal: fechaFin,
      EstadosPedido: 'en producción',
      Estado: 'en proceso',
      Productos: detalle
    };
    onCrear(nuevaProduccion);
    Swal.fire({ icon: 'success', title: 'Producción creada', text: `Tipo de producción: ${tipoProduccion}`, confirmButtonColor: '#e83e8c' });
  };

  return (
    <>
     <div className="modal d-block pastel-overlay">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content pastel-modal shadow">
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🛠️ Crear Producción</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">🏷️ Nombre</label>
                  <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div className="col-md-6" aria-required="true">
                  <label className="form-label">⚙️ Tipo de Producción</label>
                  <select className="form-select" value={tipoProduccion} onChange={e => setTipoProduccion(e.target.value)}>
                    <option value="">Seleccione</option>
                    <option value="Directa">Directa</option>
                    <option value="Prediseñada">Pedido</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">📅 Fecha de Inicio</label>
                  <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">📦 Fecha de Finalización</label>
                  <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
                <div className="col-12 mt-4">
                  <h6 className="text-muted">📦 Detalle de la producción</h6>
                  <div className="row fw-bold mb-2">
                    <div className="col-md-5">Nombre del Producto</div>
                    <div className="col-md-4">Cantidad</div>
                    <div className="col-md-3"></div>
                  </div>
                  {detalle.map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="row mb-2 align-items-center">
                        <div className="col-md-5">
                          <select className="form-select" value={item.producto} onChange={e => actualizarDetalle(index, 'producto', e.target.value)}>
                            <option value="">Seleccione un producto</option>
                            {productosMock.map(p => (
                              <option key={p.IdProducto} value={p.Nombre}>{p.Nombre}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-7 d-flex align-items-center">
                          <input type="number" className="form-control me-2" placeholder="Cantidad" value={item.cantidad} onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)} />
                          <button className="btn btn-outline-secondary btn-sm me-1" title="Gasto de Insumos" onClick={() => setMostrarSubmodal(index)}>🧪</button>
                          <button className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>✖</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn pastel-btn-secondary mt-2" onClick={agregarDetalle}>+ Agregar Producto</button>
                </div>
              </div>
            </div>
            <div className="modal-footer pastel-footer">
              <button className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn pastel-btn-primary" onClick={handleSubmit}>Crear</button>
            </div>
          </div>
        </div>
      </div>
      {mostrarSubmodal !== null && (
        <div className="modal d-block pastel-overlay">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content pastel-modal shadow">
              <div className="modal-header pastel-header">
                <h5 className="modal-title">🧪 Gasto de Insumos</h5>
                <button type="button" className="btn-close" onClick={cerrarSubmodalValidado}></button>
              </div>
              <div className="modal-body">
                {detalle[mostrarSubmodal].insumos?.map((insumo, i) => (
                  <div key={i} className="row mb-2 align-items-center">
                    <div className="col-md-6">
                      <select className="form-select" value={insumo.insumo} onChange={e => actualizarInsumo(mostrarSubmodal, i, 'insumo', e.target.value)}>
                        <option value="">Seleccione un insumo</option>
                        {insumosMock.map(ins => (
                          <option key={ins.IdInsumo} value={ins.Nombre}>{ins.Nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input type="number" className="form-control" placeholder="Cantidad usada" value={insumo.cantidadUsada} onChange={e => actualizarInsumo(mostrarSubmodal, i, 'cantidadUsada', e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarInsumo(mostrarSubmodal, i)}>✖</button>
                    </div>
                  </div>
                ))}
                <div className="text-end">
                  <button className="btn pastel-btn-secondary btn-sm" onClick={() => agregarInsumo(mostrarSubmodal)}>+ Agregar Insumo</button>
                </div>
                <hr />
                <div>
                  <strong>Total insumos usados:</strong>
                  <ul className="mt-2">
                    {detalle[mostrarSubmodal].insumos?.map((ins, i) => (
                      <li key={i}>{ins.insumo}: {ins.cantidadUsada} / {ins.disponible}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="modal-footer pastel-footer">
                <button className="btn pastel-btn-primary" onClick={cerrarSubmodalValidado}>Listo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrearProduccion;

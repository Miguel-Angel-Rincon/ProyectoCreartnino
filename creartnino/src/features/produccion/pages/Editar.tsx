// EditarProduccionModal.tsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/style.css';

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

interface Produccion {
  IdProduccion: number;
  Nombre: string;
  TipoProduccion: string;
  FechaRegistro: string;
  FechaFinal: string;
  EstadosPedido: string;
  Estado: string;
  Productos: DetalleProduccion[];
}

interface Props {
  produccion: Produccion;
  onClose: () => void;
  onGuardar: (produccionEditada: Produccion) => void;
}

const insumosMock = [
  { IdInsumo: 1, Nombre: 'Vinilo', cantidad: 100 },
  { IdInsumo: 2, Nombre: 'Resina', cantidad: 200 },
  { IdInsumo: 3, Nombre: 'Papel Transfer', cantidad: 150 }
];

const EditarProduccionModal: React.FC<Props> = ({ produccion, onClose, onGuardar }) => {
  const [form, setForm] = useState<Produccion>({ ...produccion });
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);

  const handleChange = (campo: keyof Produccion, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleInsumoChange = (pIndex: number, iIndex: number, campo: keyof InsumoGasto, valor: string | number) => {
    const copia = [...form.Productos];
    const insumos = copia[pIndex].insumos || [];
    if (campo === 'insumo') {
      const ins = insumosMock.find(i => i.Nombre === valor);
      insumos[iIndex].insumo = ins?.Nombre || '';
      insumos[iIndex].disponible = ins?.cantidad || 0;
    } else if (campo === 'cantidadUsada') {
      const cantidad = parseFloat(valor as string);
      if (cantidad > insumos[iIndex].disponible) {
        Swal.fire({ icon: 'error', title: 'Cantidad excedida', text: 'No puedes usar más insumo del disponible.', confirmButtonColor: '#d33' });
        return;
      }
      insumos[iIndex].cantidadUsada = cantidad;
    }
    copia[pIndex].insumos = insumos;
    setForm(prev => ({ ...prev, Productos: copia }));
  };

  const agregarInsumo = (index: number) => {
    const copia = [...form.Productos];
    copia[index].insumos = copia[index].insumos || [];
    copia[index].insumos!.push({ insumo: '', cantidadUsada: 0, disponible: 0 });
    setForm(prev => ({ ...prev, Productos: copia }));
  };

  const eliminarInsumo = (pIndex: number, iIndex: number) => {
    const copia = [...form.Productos];
    copia[pIndex].insumos?.splice(iIndex, 1);
    setForm(prev => ({ ...prev, Productos: copia }));
  };

  const cerrarSubmodalValidado = () => {
    const detalleActual = form.Productos[mostrarSubmodal!];
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

  const validarFormulario = (): boolean => {
    if (!form.Nombre.trim() || !form.TipoProduccion || !form.FechaRegistro || !form.FechaFinal) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos obligatorios.', confirmButtonColor: '#e83e8c' });
      return false;
    }

    if (form.FechaFinal < form.FechaRegistro) {
      Swal.fire({ icon: 'error', title: 'Fecha inválida', text: 'La fecha final no puede ser anterior a la inicial.', confirmButtonColor: '#d33' });
      return false;
    }

    for (let i = 0; i < form.Productos.length; i++) {
      const prod = form.Productos[i];
      if (!prod.insumos || prod.insumos.length === 0) {
        Swal.fire({ icon: 'error', title: 'Faltan insumos', text: `Debes agregar al menos un insumo para el producto "${prod.producto}".`, confirmButtonColor: '#d33' });
        return false;
      }
      for (let ins of prod.insumos) {
        if (!ins.insumo || ins.cantidadUsada <= 0 || ins.cantidadUsada > ins.disponible) {
          Swal.fire({ icon: 'error', title: 'Insumo inválido', text: `Revisa los insumos del producto "${prod.producto}".`, confirmButtonColor: '#d33' });
          return false;
        }
      }
    }

    return true;
  };

  const handleGuardar = () => {
    if (!validarFormulario()) return;
    const actualizado = {
      ...form,
      EstadosPedido: 'en producción',
      Estado: 'en proceso',
    };
    onGuardar(actualizado);
    Swal.fire({ icon: 'success', title: 'Producción actualizada', confirmButtonColor: '#e83e8c' });
  };

  const resumenInsumos = (insumos?: InsumoGasto[]) => {
    if (!insumos || insumos.length === 0) return null;
    const totales: Record<string, { usado: number; disponible: number }> = {};
    insumos.forEach(ins => {
      if (!totales[ins.insumo]) {
        totales[ins.insumo] = { usado: 0, disponible: ins.disponible };
      }
      totales[ins.insumo].usado += ins.cantidadUsada;
    });

    return (
      <div className="mt-3">
        <h6 className="text-secondary">Resumen de Insumos:</h6>
        <ul className="mb-0 ps-3">
          {Object.entries(totales).map(([nombre, datos], i) => (
            <li key={i}>
              {nombre}: Usado {datos.usado} / Disponible {datos.disponible}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">✏️ Editar Producción</h2>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={form.Nombre} onChange={e => handleChange('Nombre', e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción <span className="text-danger">*</span></label>
          <select className="form-select" value={form.TipoProduccion} onChange={e => handleChange('TipoProduccion', e.target.value)}>
            <option value="">Seleccione</option>
            <option value="Directa">Directa</option>
            <option value="Pedido">Pedido</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">📅 Fecha de Inicio <span className="text-danger">*</span></label>
          <input type="date" className="form-control" value={form.FechaRegistro} onChange={e => handleChange('FechaRegistro', e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización <span className="text-danger">*</span></label>
          <input type="date" className="form-control" value={form.FechaFinal} onChange={e => handleChange('FechaFinal', e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-5">Producto</div>
          <div className="col-md-4">Cantidad</div>
          <div className="col-md-3">Acciones <span className="text-danger">*</span></div>
        </div>

        {form.Productos.map((item, index) => (
          <div key={index} className="row align-items-center mb-2">
            <div className="col-md-5">
              <input className="form-control" value={item.producto} disabled />
            </div>
            <div className="col-md-4">
              <input className="form-control" value={item.cantidad} disabled />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarSubmodal(index)}>
                🧪 <span className="text-danger">*</span>
              </button>
            </div>

            {mostrarSubmodal === index && (
              <div className="modal d-block pastel-overlay">
                <div className="modal-dialog modal-md modal-dialog-centered">
                  <div className="modal-content pastel-modal shadow">
                    <div className="modal-header pastel-header">
                      <h5 className="modal-title">🧪 Gasto de Insumos</h5>
                      <button type="button" className="btn-close" onClick={cerrarSubmodalValidado}></button>
                    </div>
                    <div className="modal-body">
                      {item.insumos?.map((insumo, i) => (
                        <div key={i} className="row align-items-center mb-2">
                          <div className="col-md-5">
                            <select className="form-select" value={insumo.insumo} onChange={e => handleInsumoChange(index, i, 'insumo', e.target.value)}>
                              <option value="">Seleccione</option>
                              {insumosMock.map(ins => (
                                <option key={ins.IdInsumo} value={ins.Nombre}>{ins.Nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-5">
                            <input type="number" className="form-control" value={insumo.cantidadUsada} onChange={e => handleInsumoChange(index, i, 'cantidadUsada', e.target.value)} />
                          </div>
                          <div className="col-md-2 text-end">
                            <button className="btn btn-danger btn-sm" onClick={() => eliminarInsumo(index, i)}>✖</button>
                          </div>
                        </div>
                      ))}
                      {resumenInsumos(item.insumos)}
                      <div className="text-end mt-3">
                        <button className="btn btn-sm pastel-btn-secondary me-2" onClick={() => agregarInsumo(index)}>+ Agregar Insumo</button>
                        <button className="btn btn-sm pastel-btn-primary" onClick={cerrarSubmodalValidado}>✔ Listo</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button className="btn pastel-btn-primary" onClick={handleGuardar}>Guardar Cambios</button>
      </div>
    </div>
  );
};

export default EditarProduccionModal;

import React, { useState } from 'react';
import '../styles/acciones.css';

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
}

interface Produccion {
  IdProduccion: number;
  Nombre: string;
  TipoProducción: string;
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

const EditarProduccionModal: React.FC<Props> = ({ produccion, onClose, onGuardar }) => {
  const [form, setForm] = useState<Produccion>({ ...produccion });

  const handleChange = (campo: keyof Produccion, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleDetalleChange = (index: number, campo: keyof DetalleProduccion, valor: string | number) => {
    const copia = [...form.Productos];
    copia[index] = { ...copia[index], [campo]: campo === 'producto' ? valor : parseFloat(valor as string) };
    setForm(prev => ({ ...prev, Productos: copia }));
  };

  return (
    <div className="modal d-block pastel-overlay">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pastel-modal shadow">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">✏️ Editar Producción</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              <div className="col-md-6">
                <label className="form-label">🏷️ Nombre de la Producción</label>
                <input
                  className="form-control"
                  value={form.Nombre}
                  onChange={e => handleChange('Nombre', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">⚙️ Tipo de Producción</label>
                <select
                  className="form-control"
                  value={form.TipoProducción}
                  onChange={e => handleChange('TipoProducción', e.target.value)}
                >
                  <option value="">Seleccione</option>
                  <option value="Directa">Directa</option>
                  <option value="Pedido">Pedido</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">📅 Fecha de Inicio</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.FechaRegistro}
                  onChange={e => handleChange('FechaRegistro', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">📦 Fecha de Finalización</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.FechaFinal}
                  onChange={e => handleChange('FechaFinal', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">📋 Estado del Pedido</label>
                <select
                  className="form-control"
                  value={form.EstadosPedido}
                  onChange={e => handleChange('EstadosPedido', e.target.value)}
                >
                  <option value="">Seleccione</option>
                  <option value="Inicial">Inicial</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">⏳ Estado</label>
                <select
                  className="form-control"
                  value={form.Estado}
                  onChange={e => handleChange('Estado', e.target.value)}
                >
                  <option value="">Seleccione</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              <div className="col-12 mt-4">
                <h6 className="text-muted">🧾 Detalle de la produccion</h6>
                <div className="row fw-bold mb-2">
                  <div className="col-md-5">Nombre del Producto</div>
                  <div className="col-md-4">Cantidad</div>
                  
                </div>
                {form.Productos.map((item, index) => (
                  <div key={index} className="row mb-2">
                    <div className="col-md-5">
                      <input
                        className="form-control"
                        value={item.producto}
                        onChange={e => handleDetalleChange(index, 'producto', e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        value={item.cantidad}
                        onChange={e => handleDetalleChange(index, 'cantidad', e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        value={item.precio}
                        onChange={e => handleDetalleChange(index, 'precio', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-success" onClick={() => onGuardar(form)}>Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProduccionModal;

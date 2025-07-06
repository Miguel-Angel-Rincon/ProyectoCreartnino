import React, { useState } from 'react';
import '../styles/acciones.css';

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
}

const VerProduccionModal: React.FC<Props> = ({ produccion, onClose }) => {
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);

  return (
    <>
      <div className="modal d-block pastel-overlay">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content pastel-modal shadow">
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🔍 Detalle de Producción</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Datos generales */}
                <div className="col-md-6">
                  <label className="form-label">🏷️ Nombre de la Producción</label>
                  <input className="form-control" value={produccion.Nombre} disabled />
                </div>

                <div className="col-md-6">
                  <label className="form-label">⚙️ Tipo de Producción</label>
                  <input className="form-control" value={produccion.TipoProduccion} disabled />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📅 Fecha de Inicio</label>
                  <input type="date" className="form-control" value={produccion.FechaRegistro} disabled />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📦 Fecha de Finalización</label>
                  <input type="date" className="form-control" value={produccion.FechaFinal} disabled />
                </div>

                {/* Detalle productos */}
                <div className="col-12 mt-4">
                  <h6 className="text-muted">🧾 Detalle de la Producción</h6>
                  <div className="row fw-bold mb-2">
                    <div className="col-md-6">Nombre del Producto</div>
                    <div className="col-md-3">Cantidad</div>
                    <div className="col-md-3"></div>
                  </div>

                  {produccion.Productos.map((item, index) => (
                    <div key={index} className="row mb-3 align-items-center">
                      <div className="col-md-6">
                        <input className="form-control" value={item.producto} disabled />
                      </div>
                      <div className="col-md-3">
                        <input type="number" className="form-control" value={item.cantidad} disabled />
                      </div>
                      <div className="col-md-3">
                        <button className="btn pastel-btn-secondary btn-sm" onClick={() => setMostrarSubmodal(index)}>
                          Ver Insumos
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button className="btn pastel-btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      {mostrarSubmodal !== null && (
        <div className="modal d-block pastel-overlay">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content pastel-modal shadow">
              <div className="modal-header pastel-header">
                <h5 className="modal-title">🧪 Insumos Usados</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarSubmodal(null)}></button>
              </div>
              <div className="modal-body">
                {produccion.Productos[mostrarSubmodal].insumos && produccion.Productos[mostrarSubmodal].insumos!.length > 0 ? (
                  <ul className="list-group">
                    {produccion.Productos[mostrarSubmodal].insumos!.map((ins, i) => (
                      <li key={i} className="list-group-item">
                        <strong>{ins.insumo}</strong>: {ins.cantidadUsada} / {ins.disponible}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Sin insumos registrados para este producto.</p>
                )}
              </div>
              <div className="modal-footer pastel-footer">
                <button className="btn pastel-btn-primary" onClick={() => setMostrarSubmodal(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerProduccionModal;

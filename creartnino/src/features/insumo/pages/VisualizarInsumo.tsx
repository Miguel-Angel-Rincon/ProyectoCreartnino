// components/VisualizarInsumoModal.tsx
import React, { useEffect, useRef } from 'react';
import '../styles/acciones.css';

interface Insumos {
  IdInsumos: number;
  IdCatInsumo: string;
  Nombre: string;
  Descripcion: string;
  marca: string;
  cantidad: number;
  precioUnitario: number;
  estado: boolean;
}

interface Props {
  insumo: Insumos;
  onClose: () => void;
}

const VisualizarInsumoModal: React.FC<Props> = ({ insumo, onClose }) => {
  const descripcionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (descripcionRef.current) {
      descripcionRef.current.style.height = 'auto';
      descripcionRef.current.style.height = `${descripcionRef.current.scrollHeight}px`;
    }
  }, []);

  // Formato COP para precio
  const precioFormateado = insumo.precioUnitario.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🔍 Detalle del Insumo</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              {/* Categoría y Nombre */}
              <div className="col-md-6">
                <label className="form-label">📝 Nombre</label>
                <input className="form-control" value={insumo.Nombre} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📦 Categoría</label>
                <input className="form-control" value={insumo.IdCatInsumo} disabled />
              </div>

              {/* Marca y Descripción */}
              <div className="col-md-6">
                <label className="form-label">🏷️ Marca</label>
                <input className="form-control" value={insumo.marca} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">🧾 Descripción</label>
                <textarea
                  ref={descripcionRef}
                  className="form-control"
                  value={insumo.Descripcion}
                  title={insumo.Descripcion}
                  rows={1}
                  disabled
                  style={{ resize: 'none', overflow: 'hidden' }}
                />
              </div>

              {/* Cantidad y Precio */}
              <div className="col-md-6">
                <label className="form-label">🔢 Cantidad</label>
                <input className="form-control" value={insumo.cantidad} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">💲 Precio Unitario</label>
                <input className="form-control" value={precioFormateado} disabled />
              </div>

            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarInsumoModal;

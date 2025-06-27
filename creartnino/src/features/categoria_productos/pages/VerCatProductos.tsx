// components/VerProductoModal.tsx
import React from 'react';
import '../styles/Funciones.css';

interface CategoriaProducto {
  IdCategoriaProducto: number;
  Nombre: string;
  Descripcion: string;
  Estado: boolean;
}

interface Props {
  catproducto: CategoriaProducto;
  onClose: () => void;
}

const VerProductoModal: React.FC<Props> = ({ catproducto, onClose }) => {
  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🔍 Detalle de la Categoría de Producto</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">
              <div className="col-md-12">
                <label className="form-label">📛 Nombre</label>
                <input
                  className="form-control"
                  value={catproducto.Nombre}
                  disabled
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">📝 Descripción</label>
                <textarea
                  className="form-control"
                  value={catproducto.Descripcion}
                  rows={3}
                  disabled
                />
              </div>
              
            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button
              type="button"
              className="btn pastel-btn-secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerProductoModal;

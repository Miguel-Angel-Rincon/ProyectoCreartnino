// components/VerProductoModal.tsx
import React from 'react';


interface CategoriaInsumos {
  IdCategoriaInsumo: number;
  Nombre: string;
  Descripcion: string;
  Estado: boolean;
}
interface Props {
  catinsumo: CategoriaInsumos;
  onClose: () => void;
}

const VerInsumoModal: React.FC<Props> = ({ catinsumo, onClose }) => {
  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-pink text-white">
            <h5 className="modal-title">Detalle de la Categoria</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <input
                className="form-control"
                value={catinsumo.IdCategoriaInsumo}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={catinsumo.Nombre}
                disabled
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Descripcion</label>
              <input
                className="form-control"
                value={catinsumo.Descripcion}
                disabled
              />
            </div>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={catinsumo.Estado}
                disabled
              />
              <label className="form-check-label">Activo</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerInsumoModal;

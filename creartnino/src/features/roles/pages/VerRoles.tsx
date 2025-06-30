import React from 'react';
import '../style/acciones.css';

interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  permisos: string[];
}

interface Props {
  rol: Rol;
  onClose: () => void;
}

const VerRolModal: React.FC<Props> = ({ rol, onClose }) => {
  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🧐 Detalles del Rol</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              <div className="col-md-6">
                <label className="form-label">🏷️ Nombre</label>
                <input className="form-control" value={rol.nombre} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">🧾 Descripción</label>
                <textarea
                  className="form-control"
                  value={rol.descripcion}
                  rows={2}
                  disabled
                  style={{ resize: 'none' }}
                />
              </div>

        

              <div className="col-md-12">
                <label className="form-label">🔐 Permisos Asignados</label>
                <div className="row">
                  {rol.permisos.length > 0 ? (
                    rol.permisos.map((permiso) => (
                      <div key={permiso} className="col-6 col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked
                            disabled
                          />
                          <label className="form-check-label">
                            {permiso}
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted px-2">Este rol no tiene permisos asignados.</p>
                  )}
                </div>
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

export default VerRolModal;

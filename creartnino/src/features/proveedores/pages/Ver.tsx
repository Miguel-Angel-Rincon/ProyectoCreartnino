// components/VerProductoModal.tsx
import React from 'react';


interface Proveedores {
  IdProveedores: number;
  IdTipoPersona: string;
  IdTipoDocumento: string;
  NombreCompleto: string;
  NumDocumento: string;
  Departamento: string;
  Ciudad: string;
  Direccion: string;
  Celular: string;
  estado: boolean;
}

interface Props {
  Proveedor: Proveedores;
  onClose: () => void;
}

const VerProveedoresModal: React.FC<Props> = ({ Proveedor, onClose }) => {
  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-pink text-white">
            <h5 className="modal-title">Detalles del Proveedor</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Tipo de Persona</label>
              <input
                className="form-control"
                value={Proveedor.IdTipoPersona}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo de Documento</label>
              <input
                className="form-control"
                value={Proveedor.IdTipoDocumento}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre Completo</label>
              <input
                className="form-control"
                value={Proveedor.NombreCompleto}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Número de Documento</label>
              <input
                className="form-control"
                value={Proveedor.NumDocumento}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Departamento</label>
              <input
                className="form-control"
                value={Proveedor.Departamento}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ciudad</label>
              <input
                className="form-control"
                value={Proveedor.Ciudad}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input
                className="form-control"
                value={Proveedor.Direccion}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Celular</label>
              <input
                className="form-control"
                value={Proveedor.Celular}
                disabled
              />
            </div>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={Proveedor.estado}
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

export default VerProveedoresModal;

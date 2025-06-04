// components/VerUsuarioModal.tsxx
import React from 'react';

interface Usuario {
  IdUsuarios: number;
  Nombre: string;
  Apellido: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Celular: string;
  Direccion: string;
  Barrio: string;
  Correo: string;
  idRol: string;
  estado: boolean;
}

interface Props {
  usuario: Usuario;
  onClose: () => void;
}

const VerUsuarioModal: React.FC<Props> = ({ usuario, onClose }) => {
  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-pink text-white">
            <h5 className="modal-title">Detalles del Usuario</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">ID Usuario</label>
              <input className="form-control" value={usuario.IdUsuarios} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={usuario.Nombre} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input className="form-control" value={usuario.Apellido} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo Documento</label>
              <input className="form-control" value={usuario.Tipodocumento} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Número Documento</label>
              <input className="form-control" value={usuario.Numerodocumento} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Celular</label>
              <input className="form-control" value={usuario.Celular} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={usuario.Direccion} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Barrio</label>
              <input className="form-control" value={usuario.Barrio} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input className="form-control" value={usuario.Correo} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Rol</label>
              <input className="form-control" value={usuario.idRol} disabled />
            </div>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={usuario.estado}
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

export default VerUsuarioModal;

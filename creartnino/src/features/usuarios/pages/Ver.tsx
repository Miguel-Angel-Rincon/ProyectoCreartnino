import React from 'react';
import '../style/acciones.css';
interface Usuario {
  IdUsuarios: number;
  NombreCompleto: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Celular: string;
  Direccion: string;
  Departamento: string;
  Ciudad: string;
  Correo: string;
  contrasena: string;
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
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">👁️ Ver Usuario</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">🧾 Tipo de Documento</label>
                <input className="form-control" value={usuario.Tipodocumento} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">🔢 Número de Documento</label>
                <input className="form-control" value={usuario.Numerodocumento} disabled />
              </div>
              <div className="col-md-12">
                <label className="form-label">🙍 Nombre Completo</label>
                <input className="form-control" value={usuario.NombreCompleto} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">📱 Celular</label>
                <input className="form-control" value={usuario.Celular} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">📧 Correo Electrónico</label>
                <input className="form-control" type="email" value={usuario.Correo} disabled />
              </div>

            <div className="col-md-6">
                <label className="form-label">🔐 Contraseña</label>
                <input className="form-control" type="email" value={usuario.contrasena} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">🏞️ Departamento</label>
                <input className="form-control" value={usuario.Departamento} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">🏙️ Ciudad</label>
                <input className="form-control" value={usuario.Ciudad} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">🏡 Dirección</label>
                <input className="form-control" value={usuario.Direccion} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">🛡️ Rol</label>
                <input className="form-control" value={usuario.idRol} disabled />
              </div>
             
            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerUsuarioModal;

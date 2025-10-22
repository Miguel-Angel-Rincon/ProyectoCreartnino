import React, { useState } from 'react';
import '../styles/acciones.css';

import type { IClientes } from '../../interfaces/IClientes';

type Cliente = IClientes;
interface Props {
  cliente: Cliente;
  onClose: () => void;
}

const VerClienteModal: React.FC<Props> = ({ cliente, onClose }) => {
  const [showDireccionModal, setShowDireccionModal] = useState(false);

  const partesDireccion = cliente.Direccion?.split(',') || [];
  const barrio = partesDireccion[0]?.trim() || '';
  const calle = partesDireccion[1]?.trim() || '';
  const Complementos = partesDireccion[2]?.replace('CP', '').trim() || '';

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">👁️ Ver Cliente</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">🙍 Nombre Completo</label>
                <input className="form-control" value={cliente.NombreCompleto} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">📧 Correo Electrónico</label>
                <input className="form-control" value={cliente.Correo} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">🧾 Tipo de Documento</label>
                <input className="form-control" value={cliente.TipoDocumento} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">🔢 Número de Documento</label>
                <input className="form-control" value={cliente.NumDocumento} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">📱 Celular</label>
                <input className="form-control" value={cliente.Celular} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">🏞️ Departamento</label>
                <input className="form-control" value={cliente.Departamento} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">🏙️ Ciudad</label>
                <input className="form-control" value={cliente.Ciudad} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label">🏡 Dirección</label>
                <input
                  className="form-control"
                  value={cliente.Direccion}
                  readOnly
                  onClick={() => setShowDireccionModal(true)}
                  style={{ cursor: 'pointer' }}
                  title="Haz clic para ver detalles"
                />
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

      {/* Submodal Dirección */}
      {showDireccionModal && (
        <div className="modal d-block pastel-overlay" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content pastel-modal shadow">
              <div className="modal-header pastel-header">
                <h5 className="modal-title">🏠 Información de Dirección</h5>
                <button className="btn-close" onClick={() => setShowDireccionModal(false)}></button>
              </div>
              <div className="modal-body px-4 py-3">
                <div className="mb-3">
                  <label>Barrio</label>
                  <input className="form-control" value={barrio} disabled />
                </div>
                <div className="mb-3">
                  <label>Calle / Carrera</label>
                  <input className="form-control" value={calle} disabled />
                </div>
                <div className="mb-3">
                  <label>Complementos</label>
                  <input className="form-control" value={Complementos} disabled />
                </div>
              </div>
              <div className="modal-footer pastel-footer">
                <button className="btn pastel-btn-primary" onClick={() => setShowDireccionModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerClienteModal;

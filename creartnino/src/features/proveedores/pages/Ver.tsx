import React, { useState } from 'react';
import '../style/acciones.css';

interface Proveedores {
  IdProveedores: number;
  TipoPersona: string;
  IdTipoDocumento: string;
  NombreCompleto: string;
  NumDocumento: string;
  Ciudad: string;
  Direccion: string;
  Celular: string;
  estado: boolean;
}

interface Props {
  proveedor: Proveedores;
  onClose: () => void;
}

const VerProveedorModal: React.FC<Props> = ({ proveedor, onClose }) => {
  const [showDireccionModal, setShowDireccionModal] = useState(false);

  const [direccionData, setDireccionData] = useState({
    barrio: '',
    calle: '',
    codigoPostal: '',
  });

  const abrirSubmodalDireccion = () => {
    const partes = proveedor.Direccion.split(', ');
    const barrio = partes[0] || '';
    const calle = partes[1] || '';
    const cp = partes[2]?.replace('CP ', '') || '';
    setDireccionData({ barrio, calle, codigoPostal: cp });
    setShowDireccionModal(true);
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">👁️ Ver Detalle del Proveedor</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              <div className="col-md-6">
                <label className="form-label">👤 Tipo de Persona</label>
                <select className="form-select" disabled value={proveedor.TipoPersona}>
                  <option value="Natural">Natural</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">🧾 Tipo de Documento</label>
                <select className="form-select" disabled value={proveedor.IdTipoDocumento}>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  {proveedor.TipoPersona === 'Jurídica'
                    ? '🔢 Número NIT'
                    : '🔢 Número de Documento'}
                </label>
                <input
                  className="form-control"
                  value={proveedor.NumDocumento}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  {proveedor.TipoPersona === 'Jurídica'
                    ? '🏢 Nombre de la Empresa'
                    : '🙍 Nombre Completo'}
                </label>
                <input
                  className="form-control"
                  value={proveedor.NombreCompleto}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">📱 Celular</label>
                <input
                  className="form-control"
                  value={proveedor.Celular}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">🏙️ Ciudad</label>
                <input
                  className="form-control"
                  value={proveedor.Ciudad}
                  disabled
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">🏡 Dirección</label>
                <input
                  className="form-control"
                  value={proveedor.Direccion}
                  onClick={abrirSubmodalDireccion}
                  readOnly
                />
                <small className="text-muted">Haz clic para ver más detalle</small>
              </div>

            </div>
          </div>
          <div className="modal-footer pastel-footer">
            <button type="button" className="btn pastel-btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>

          {/* Submodal Dirección */}
          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Detalle de Dirección</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDireccionModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label className="form-label">Barrio</label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Calle / Carrera</label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Código Postal</label>
                      <input
                        className="form-control"
                        value={direccionData.codigoPostal}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="modal-footer pastel-footer">
                    <button
                      type="button"
                      className="btn pastel-btn-primary"
                      onClick={() => setShowDireccionModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerProveedorModal;

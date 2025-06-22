import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';

let idProveedorActual = 9;

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
  onClose: () => void;
  onCrear: (formData: Proveedores) => void;
}

const CrearProveedorModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [formData, setFormData] = useState<Proveedores>({
    IdProveedores: idProveedorActual,
    TipoPersona: 'Natural',
    IdTipoDocumento: 'CC',
    NombreCompleto: '',
    NumDocumento: '',
    Ciudad: '',
    Direccion: '',
    Celular: '',
    estado: true,
  });

  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({
    barrio: '',
    calle: '',
    codigoPostal: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'IdTipoPersona') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        IdTipoDocumento: value === 'Jurídica' ? 'NIT' : prev.IdTipoDocumento,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDireccionModalSave = () => {
    const direccionCompleta = `${direccionData.barrio}, ${direccionData.calle}, CP ${direccionData.codigoPostal}`;
    setFormData((prev) => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^\d+$/.test(formData.Celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número de celular debe contener solo dígitos.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    if (!/^\d+$/.test(formData.NumDocumento)) {
      Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'El número de documento debe contener solo dígitos.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    onCrear({ ...formData, IdProveedores: idProveedorActual++ });
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📦 Crear Proveedor</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">

                <div className="col-md-6">
                  <label className="form-label">👤 Tipo de Persona</label>
                  <select
                    className="form-select"
                    name="IdTipoPersona"
                    value={formData.TipoPersona}
                    onChange={handleChange}
                    required
                  >
                    <option value="Natural">Natural</option>
                    <option value="Jurídica">Jurídica</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo de Documento</label>
                  <select
                    className="form-select"
                    name="IdTipoDocumento"
                    value={formData.IdTipoDocumento}
                    onChange={handleChange}
                    required
                    disabled={formData.TipoPersona === 'Jurídica'}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    {formData.TipoPersona === 'Jurídica'
                      ? '🔢 Número NIT'
                      : '🔢 Número de Documento'}
                  </label>
                  <input
                    className="form-control"
                    name="NumDocumento"
                    value={formData.NumDocumento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    {formData.TipoPersona === 'Jurídica'
                      ? '🏢 Nombre de la Empresa'
                      : '🙍 Nombre Completo'}
                  </label>
                  <input
                    className="form-control"
                    name="NombreCompleto"
                    value={formData.NombreCompleto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular</label>
                  <input
                    className="form-control"
                    name="Celular"
                    value={formData.Celular}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad</label>
                  <input
                    className="form-control"
                    name="Ciudad"
                    value={formData.Ciudad}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">🏡 Dirección</label>
                  <input
                    className="form-control"
                    name="Direccion"
                    value={formData.Direccion}
                    onClick={() => setShowDireccionModal(true)}
                    readOnly
                    required
                  />
                </div>

              </div>
            </div>
            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Crear
              </button>
            </div>
          </form>

          {/* Submodal Dirección */}
          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Información de Dirección</h5>
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
                        onChange={(e) =>
                          setDireccionData({ ...direccionData, barrio: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Calle / Carrera</label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        onChange={(e) =>
                          setDireccionData({ ...direccionData, calle: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Código Postal</label>
                      <input
                        className="form-control"
                        value={direccionData.codigoPostal}
                        onChange={(e) =>
                          setDireccionData({ ...direccionData, codigoPostal: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="modal-footer pastel-footer">
                    <button
                      type="button"
                      className="btn pastel-btn-secondary"
                      onClick={() => setShowDireccionModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn pastel-btn-primary"
                      onClick={handleDireccionModalSave}
                    >
                      Guardar Dirección
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

export default CrearProveedorModal;

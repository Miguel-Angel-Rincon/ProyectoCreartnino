import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';

interface Proveedores {
  IdProveedores: number;
  TipoPersona: string;
  TipoDocumento: string;
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
  onEditar: (formData: Proveedores) => void;
}

const EditarProveedorModal: React.FC<Props> = ({ proveedor, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Proveedores>(proveedor);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({
    barrio: '',
    calle: '',
    codigoPostal: '',
  });

  useEffect(() => {
    setFormData(proveedor);
  }, [proveedor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'IdTipoPersona') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        TipoDocumento: value === 'Jurídica' ? 'NIT' : prev.TipoDocumento,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDireccionModalSave = () => {
    if (
      direccionData.barrio.trim() === '' ||
      direccionData.calle.trim() === '' ||
      direccionData.codigoPostal.trim() === ''
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos de la dirección.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!/^\d{6}$/.test(direccionData.codigoPostal)) {
      Swal.fire({
        icon: 'error',
        title: 'Código postal inválido',
        text: 'El código postal debe tener 5 dígitos numéricos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    const direccionCompleta = `${direccionData.barrio}, ${direccionData.calle}, CP ${direccionData.codigoPostal}`;
    setFormData((prev) => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones generales
    if (!/^\d{10}$/.test(formData.Celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número de celular debe contener exactamente 10 dígitos numéricos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!/^\d{6,15}$/.test(formData.NumDocumento)) {
      Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'El número de documento debe tener entre 6 y 15 dígitos numéricos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.NombreCompleto)) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: 'El nombre solo debe contener letras y espacios.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.Ciudad)) {
      Swal.fire({
        icon: 'error',
        title: 'Ciudad inválida',
        text: 'El nombre de la ciudad solo debe contener letras.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!formData.Direccion.includes('CP') || formData.Direccion.length < 10) {
      Swal.fire({
        icon: 'error',
        title: 'Dirección inválida',
        text: 'Debes ingresar una dirección válida desde el submodal.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    // Si pasa todas las validaciones:
    onEditar(formData);

    Swal.fire({
      icon: 'success',
      title: 'Proveedor actualizado',
      text: 'Cambios guardados correctamente.',
      confirmButtonColor: '#f78fb3',
    }).then(() => {
      onClose();
    });
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Proveedor</h5>
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
                    name="TipoDocumento"
                    value={formData.TipoDocumento}
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
                    onClick={() => {
                      const partes = formData.Direccion.split(', ');
                      const barrio = partes[0] || '';
                      const calle = partes[1] || '';
                      const cp = partes[2]?.replace('CP ', '') || '';
                      setDireccionData({
                        barrio,
                        calle,
                        codigoPostal: cp,
                      });
                      setShowDireccionModal(true);
                    }}
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
                Guardar Cambios
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

export default EditarProveedorModal;

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';

let idProveedorActual = 9;

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
  onClose: () => void;
  onCrear: (formData: Proveedores) => void;
}

const CrearProveedorModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [formData, setFormData] = useState<Proveedores>({
    IdProveedores: idProveedorActual,
    TipoPersona: 'Natural',
    TipoDocumento: 'CC',
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

    if (name === 'TipoPersona') {
      const nuevaPersona = value;
      setFormData((prev) => ({
        ...prev,
        TipoPersona: nuevaPersona,
        TipoDocumento: nuevaPersona === 'Jurídica' ? 'NIT' : 'CC',
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
        text: 'El código postal debe tener 6 dígitos numéricos.',
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

    for (const key in formData) {
      if (
        Object.prototype.hasOwnProperty.call(formData, key) &&
        (formData[key as keyof typeof formData] === '' || formData[key as keyof typeof formData] === null)
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obligatorio faltante',
          text: `Por favor completa todos los campos.`,
          confirmButtonColor: '#f78fb3',
        });
        return;
      }
    }

    if (!/^\d+$/.test(formData.Celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número de celular debe contener solo dígitos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.Celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número de celular debe tener exactamente 10 dígitos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (!/^\d+$/.test(formData.NumDocumento)) {
      Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'El número de documento debe contener solo dígitos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (formData.NumDocumento.length < 6 || formData.NumDocumento.length > 15) {
      Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'El número de documento debe tener entre 6 y 15 dígitos.',
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

    onCrear({ ...formData, IdProveedores: idProveedorActual++ });

    Swal.fire({
      icon: 'success',
      title: 'Proveedor creado',
      text: 'El proveedor ha sido registrado correctamente.',
      confirmButtonColor: '#f78fb3',
    }).then(() => {
      onClose();
    });
  };

  const esJuridica = formData.TipoPersona === 'Jurídica';

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
                    name="TipoPersona"
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
                    disabled={esJuridica}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    {esJuridica ? '🔢 Número NIT' : '🔢 Número de Documento'}
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
                    {esJuridica ? '🏢 Nombre de la Empresa' : '🙍 Nombre Completo'}
                  </label>
                  <input
                    className="form-control"
                    name="NombreCompleto"
                    placeholder={esJuridica ? '' : ''}
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

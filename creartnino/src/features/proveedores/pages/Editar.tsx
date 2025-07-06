import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';

interface Proveedores {
  IdProveedores: number;
  IdTipoPersona: string;
  IdTipoDocumento: string;
  NombreCompleto: string;
  NumDocumento: string;
  Departamento?: string;
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

  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setFormData(proveedor);
  }, [proveedor]);

  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/Department')
      .then(res => res.json())
      .then((data: { id: number; name: string }[]) => {
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.Departamento) {
      setCiudades([]);
      return;
    }

    const dep = departamentos.find(d => d.name === formData.Departamento);
    if (!dep) return;

    fetch(`https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000`)
      .then(res => res.json())
      .then((res: { data: { id: number; name: string; departmentId: number }[] }) => {
        const cityList = res.data
          .filter(c => c.departmentId === dep.id)
          .map(c => ({ id: c.id, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCiudades(cityList);
      })
      .catch(console.error);
  }, [formData.Departamento, departamentos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'IdTipoPersona') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        IdTipoDocumento: value === 'Jurídica' ? 'NIT' : prev.IdTipoDocumento,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'Departamento' ? { Ciudad: '' } : {})
      }));
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
    setFormData(prev => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.Celular)) {
      return Swal.fire({ icon: 'error', title: 'Celular inválido', text: 'Debe contener exactamente 10 dígitos.', confirmButtonColor: '#f78fb3' });
    }

    if (!/^\d{6,15}$/.test(formData.NumDocumento)) {
      return Swal.fire({ icon: 'error', title: 'Documento inválido', text: 'Debe tener entre 6 y 15 dígitos.', confirmButtonColor: '#f78fb3' });
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.NombreCompleto)) {
      return Swal.fire({ icon: 'error', title: 'Nombre inválido', text: 'Solo letras y espacios.', confirmButtonColor: '#f78fb3' });
    }

    if (!formData.Departamento) {
      return Swal.fire({ icon: 'warning', title: 'Falta departamento', text: 'Seleccione un departamento.', confirmButtonColor: '#f78fb3' });
    }

    if (!formData.Ciudad) {
      return Swal.fire({ icon: 'warning', title: 'Falta ciudad', text: 'Seleccione una ciudad.', confirmButtonColor: '#f78fb3' });
    }

    if (!formData.Direccion.includes('CP') || formData.Direccion.length < 10) {
      return Swal.fire({ icon: 'error', title: 'Dirección inválida', text: 'Use el submodal para ingresar una dirección válida.', confirmButtonColor: '#f78fb3' });
    }

    onEditar(formData);
    Swal.fire({ icon: 'success', title: 'Proveedor actualizado', text: 'Cambios guardados correctamente.', confirmButtonColor: '#f78fb3' }).then(() => onClose());
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
                  <label className="form-label">👤 Tipo de Persona <span className="text-danger">*</span></label>
                  <select className="form-select" name="IdTipoPersona" value={formData.IdTipoPersona} onChange={handleChange} required>
                    <option value="Natural">Natural</option>
                    <option value="Jurídica">Jurídica</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo de Documento <span className="text-danger">*</span></label>
                  <select className="form-select" name="IdTipoDocumento" value={formData.IdTipoDocumento} onChange={handleChange} required disabled={formData.IdTipoPersona === 'Jurídica'}>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">{formData.IdTipoPersona === 'Jurídica' ? '🔢 Número NIT' : '🔢 Número de Documento'} <span className="text-danger">*</span></label>
                  <input className="form-control" name="NumDocumento" value={formData.NumDocumento} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">{formData.IdTipoPersona === 'Jurídica' ? '🏢 Nombre de la Empresa' : '🙍 Nombre Completo'} <span className="text-danger">*</span></label>
                  <input className="form-control" name="NombreCompleto" value={formData.NombreCompleto} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input className="form-control" name="Celular" value={formData.Celular} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento <span className="text-danger">*</span></label>
                  <select className="form-select" name="Departamento" value={formData.Departamento || ''} onChange={handleChange} required>
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad <span className="text-danger">*</span></label>
                  <select className="form-select" name="Ciudad" value={formData.Ciudad} onChange={handleChange} required>
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección <span className="text-danger">*</span></label>
                  <input className="form-control" name="Direccion" value={formData.Direccion} onClick={() => {
                    const partes = formData.Direccion.split(', ');
                    const barrio = partes[0] || '';
                    const calle = partes[1] || '';
                    const cp = partes[2]?.replace('CP ', '') || '';
                    setDireccionData({ barrio, calle, codigoPostal: cp });
                    setShowDireccionModal(true);
                  }} readOnly required />
                </div>
              </div>
            </div>
            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn pastel-btn-primary">Guardar Cambios</button>
            </div>
          </form>

          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Información de Dirección</h5>
                    <button className="btn-close" onClick={() => setShowDireccionModal(false)}></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3"><label>Barrio</label><input className="form-control" value={direccionData.barrio} onChange={e => setDireccionData(prev => ({ ...prev, barrio: e.target.value }))} /></div>
                    <div className="mb-3"><label>Calle / Carrera</label><input className="form-control" value={direccionData.calle} onChange={e => setDireccionData(prev => ({ ...prev, calle: e.target.value }))} /></div>
                    <div className="mb-3"><label>Código Postal</label><input className="form-control" value={direccionData.codigoPostal} onChange={e => setDireccionData(prev => ({ ...prev, codigoPostal: e.target.value }))} /></div>
                  </div>
                  <div className="modal-footer pastel-footer">
                    <button className="btn pastel-btn-secondary" onClick={() => setShowDireccionModal(false)}>Cancelar</button>
                    <button className="btn pastel-btn-primary" onClick={handleDireccionModalSave}>Guardar Dirección</button>
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

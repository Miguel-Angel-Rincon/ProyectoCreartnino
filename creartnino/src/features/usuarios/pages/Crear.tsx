import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';

export interface Usuario {
  IdUsuarios: number;
  NombreCompleto: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Celular: string;
  Departamento: string;
  Ciudad: string;
  Direccion: string;
  Correo: string;
  idRol: string;
  estado: boolean;
}

interface Props {
  onClose: () => void;
  onCrear: (nuevoUsuario: Usuario) => void;
}

let idUsuarioActual = 101;

const CrearUsuarioModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [formData, setFormData] = useState<Omit<Usuario, 'IdUsuarios'>>({
    NombreCompleto: '',
    Tipodocumento: 'CC',
    Numerodocumento: '',
    Celular: '',
    Departamento: '',
    Ciudad: '',
    Direccion: '',
    Correo: '',
    idRol: '',
    estado: true,
  });

  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({ barrio: '', calle: '', codigoPostal: '' });

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

    fetch('https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000')
      .then(res => res.json())
      .then((res: { data: { id: number; name: string; departmentId: number }[] }) => {
        const cities = res.data
          .filter(c => c.departmentId === dep.id)
          .map(c => ({ id: c.id, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCiudades(cities);
      })
      .catch(console.error);
  }, [formData.Departamento, departamentos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = (type === 'checkbox' && 'checked' in target) ? (target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'Departamento' ? { Ciudad: '' } : {})
    }));
  };

  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, CP ${direccionData.codigoPostal}`;
    setFormData(prev => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.NombreCompleto.trim()) {
      return Swal.fire({ icon: 'error', title: 'Nombre requerido', text: 'El nombre completo es obligatorio.', confirmButtonColor: '#e83e8c' });
    }

    if (!formData.Correo.includes('@')) {
      return Swal.fire({ icon: 'error', title: 'Correo inválido', text: 'Por favor ingresa un correo válido.', confirmButtonColor: '#e83e8c' });
    }

    if (!/^\d+$/.test(formData.Celular)) {
      return Swal.fire({ icon: 'error', title: 'Celular inválido', text: 'Solo se permiten números.', confirmButtonColor: '#e83e8c' });
    }

    if (!/^\d+$/.test(formData.Numerodocumento)) {
      return Swal.fire({ icon: 'error', title: 'Documento inválido', text: 'Solo se permiten números.', confirmButtonColor: '#e83e8c' });
    }

    if (formData.Departamento && ciudades.length && !formData.Ciudad) {
      return Swal.fire({ icon: 'error', title: 'Ciudad no seleccionada', text: 'Seleccione una ciudad.', confirmButtonColor: '#e83e8c' });
    }

    const nuevoUsuario: Usuario = {
      IdUsuarios: idUsuarioActual++,
      ...formData
    };

    onCrear(nuevoUsuario);
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">👤 Crear Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo Documento <span className="text-danger">*</span></label>
                  <select name="Tipodocumento" className="form-select" value={formData.Tipodocumento} onChange={handleChange} required>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🔢 Número Documento <span className="text-danger">*</span></label>
                  <input name="Numerodocumento" className="form-control" value={formData.Numerodocumento} onChange={handleChange} required />
                </div>

                <div className="col-md-12">
                  <label className="form-label">🙍 Nombre Completo <span className="text-danger">*</span></label>
                  <input name="NombreCompleto" className="form-control" value={formData.NombreCompleto} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input name="Celular" className="form-control" value={formData.Celular} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📧 Correo <span className="text-danger">*</span></label>
                  <input type="email" name="Correo" className="form-control" value={formData.Correo} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento <span className="text-danger">*</span></label>
                  <select name="Departamento" className="form-select" value={formData.Departamento} onChange={handleChange} required>
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map(dep => (
                      <option key={dep.id} value={dep.name}>{dep.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad <span className="text-danger">*</span></label>
                  <select name="Ciudad" className="form-select" value={formData.Ciudad} onChange={handleChange} required>
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección <span className="text-danger">*</span></label>
                  <input name="Direccion" className="form-control" value={formData.Direccion} readOnly onClick={() => setShowDireccionModal(true)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🛡️ Rol <span className="text-danger">*</span></label>
                  <select name="idRol" className="form-select" value={formData.idRol} onChange={handleChange} required>
                    <option value="">Seleccione...</option>
                    <option value="admin">Administrador</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>

                <div className="col-12">
                  <small className="text-muted">
                    Los campos marcados con <span className="text-danger">*</span> son obligatorios.
                  </small>
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn pastel-btn-primary">Crear</button>
            </div>
          </form>

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
                      <input className="form-control" value={direccionData.barrio} onChange={e => setDireccionData(prev => ({ ...prev, barrio: e.target.value }))} />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera</label>
                      <input className="form-control" value={direccionData.calle} onChange={e => setDireccionData(prev => ({ ...prev, calle: e.target.value }))} />
                    </div>
                    <div className="mb-3">
                      <label>Código Postal</label>
                      <input className="form-control" value={direccionData.codigoPostal} onChange={e => setDireccionData(prev => ({ ...prev, codigoPostal: e.target.value }))} />
                    </div>
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

export default CrearUsuarioModal;

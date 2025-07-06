import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

export interface Clientes {
  IdClientes: number;
  NombreCompleto: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Correo: string;
  Celular: string;
  Departamento: string;
  Ciudad: string;
  Direccion: string;
  estado: boolean;
}

let idClienteActual = 3;

interface Props {
  onClose: () => void;
  onCrear: (formData: Clientes) => void;
}

const CrearClienteModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [formData, setFormData] = useState<Omit<Clientes, 'IdClientes'>>({
    NombreCompleto: '',
    Tipodocumento: 'CC',
    Numerodocumento: '',
    Correo: '',
    Celular: '',
    Departamento: '',
    Ciudad: '',
    Direccion: '',
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nombreCompletoValido = formData.NombreCompleto.trim().split(' ').length >= 2;
    const celularValido = /^\d{10}$/.test(formData.Celular);
    const documentoValido = /^\d{8,13}$/.test(formData.Numerodocumento);

    if (!documentoValido) {
      return Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'Debe contener solo dígitos y tener entre 8 y 13 caracteres.',
        confirmButtonColor: '#e83e8c'
      });
    }

    if (!nombreCompletoValido) {
      return Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: 'Ingrese al menos nombre y apellido.',
        confirmButtonColor: '#e83e8c'
      });
    }

    if (!correoRegex.test(formData.Correo)) {
      return Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Ingrese un correo electrónico válido.',
        confirmButtonColor: '#e83e8c'
      });
    }

    if (!celularValido) {
      return Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'Debe contener exactamente 10 dígitos.',
        confirmButtonColor: '#e83e8c'
      });
    }

    if (formData.Departamento && ciudades.length && !formData.Ciudad) {
      return Swal.fire({
        icon: 'error',
        title: 'Ciudad no seleccionada',
        text: 'Seleccione una ciudad.',
        confirmButtonColor: '#e83e8c'
      });
    }

    if (direccionData.barrio || direccionData.calle || direccionData.codigoPostal) {
      const barrioValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]{2,}$/.test(direccionData.barrio);
      const calleValida = /^[A-Za-z0-9 #\-]{3,}$/.test(direccionData.calle);
      const codigoPostalValido = /^\d{6}$/.test(direccionData.codigoPostal);

      if (!barrioValido) {
        return Swal.fire({
          icon: 'error',
          title: 'Barrio inválido',
          text: 'Solo letras y espacios, mínimo 2 caracteres.',
          confirmButtonColor: '#e83e8c'
        });
      }

      if (!calleValida) {
        return Swal.fire({
          icon: 'error',
          title: 'Calle inválida',
          text: 'Debe contener letras, números o guiones (mínimo 3 caracteres).',
          confirmButtonColor: '#e83e8c'
        });
      }

      if (!codigoPostalValido) {
        return Swal.fire({
          icon: 'error',
          title: 'Código postal inválido',
          text: 'Debe contener exactamente 6 dígitos.',
          confirmButtonColor: '#e83e8c'
        });
      }

      const fullDireccion = `${direccionData.barrio}, ${direccionData.calle}, CP ${direccionData.codigoPostal}`;
      setFormData(prev => ({ ...prev, Direccion: fullDireccion }));
    }

    onCrear({ ...formData, IdClientes: idClienteActual++ });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'Departamento' ? { Ciudad: '' } : {}) }));
  };

  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, CP ${direccionData.codigoPostal}`;
    setFormData(prev => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🧑 Crear Cliente</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo de Documento</label>
                  <select name="Tipodocumento" className="form-select" value={formData.Tipodocumento} onChange={handleChange} required>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">🔢 Número de Documento</label>
                  <input name="Numerodocumento" className="form-control" value={formData.Numerodocumento} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">🙍 Nombre Completo</label>
                  <input name="NombreCompleto" className="form-control" value={formData.NombreCompleto} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">📧 Correo Electrónico</label>
                  <input type="email" name="Correo" className="form-control" value={formData.Correo} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">📱 Celular</label>
                  <input name="Celular" className="form-control" value={formData.Celular} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento</label>
                  <select name="Departamento" className="form-select" value={formData.Departamento} onChange={handleChange} required>
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad</label>
                  <select name="Ciudad" className="form-select" value={formData.Ciudad} onChange={handleChange} required>
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección</label>
                  <input name="Direccion" className="form-control" value={formData.Direccion} readOnly onClick={() => setShowDireccionModal(true)} />
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn pastel-btn-primary">Crear</button>
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

export default CrearClienteModal;

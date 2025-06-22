import React, { useEffect, useState } from 'react';
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

interface Props {
  cliente: Clientes;
  onClose: () => void;
  onEditar: (formData: Clientes) => void;
}

const EditarClienteModal: React.FC<Props> = ({ cliente, onClose, onEditar }) => {
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

  useEffect(() => {
    if (cliente) {
      setFormData({
        NombreCompleto: cliente.NombreCompleto,
        Tipodocumento: cliente.Tipodocumento,
        Numerodocumento: cliente.Numerodocumento,
        Correo: cliente.Correo,
        Celular: cliente.Celular,
        Departamento: cliente.Departamento,
        Ciudad: cliente.Ciudad,
        Direccion: cliente.Direccion,
        estado: cliente.estado,
      });

      const partes = cliente.Direccion ? cliente.Direccion.split(',') : [];
      setDireccionData({
        barrio: partes.length > 0 ? partes[0].trim() : '',
        calle: partes.length > 1 ? partes[1].trim() : '',
        codigoPostal: partes.length > 2 ? partes[2].replace('CP', '').trim() : '',
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      ...(name === 'Departamento' ? { Ciudad: '' } : {}),
    }));
  };

  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, CP ${direccionData.codigoPostal}`;
    setFormData(prev => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.NombreCompleto.trim()) {
      return Swal.fire({
        icon: 'error',
        title: 'Campo obligatorio',
        text: 'El nombre completo es obligatorio.',
        confirmButtonColor: '#e83e8c',
      });
    }
    if (!/^\d+$/.test(formData.Celular)) {
      return Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'Solo dígitos.',
        confirmButtonColor: '#e83e8c',
      });
    }
    if (!/^\d+$/.test(formData.Numerodocumento)) {
      return Swal.fire({
        icon: 'error',
        title: 'Documento inválido',
        text: 'Solo dígitos.',
        confirmButtonColor: '#e83e8c',
      });
    }
    if (formData.Departamento && ciudades.length && !formData.Ciudad) {
      return Swal.fire({
        icon: 'error',
        title: 'Ciudad no seleccionada',
        text: 'Seleccione una ciudad.',
        confirmButtonColor: '#e83e8c',
      });
    }

    onEditar({ ...formData, IdClientes: cliente.IdClientes });

    Swal.fire({
      icon: 'success',
      title: 'Cliente actualizado',
      text: 'La información del cliente se ha actualizado correctamente.',
      confirmButtonColor: '#28a745',
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
              <h5 className="modal-title">✏️ Editar Cliente</h5>
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
                  <input
                    name="Direccion"
                    className="form-control"
                    value={formData.Direccion}
                    readOnly
                    onClick={() => setShowDireccionModal(true)}
                    required
                  />
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

export default EditarClienteModal;

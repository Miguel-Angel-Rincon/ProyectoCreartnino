// components/EditarUsuarioModal.tsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';


interface Usuario {
  IdUsuarios: number;
  Nombre: string;
  Apellido: string;
  Tipodocumento: string;
  Numerodocumento: string;
  Celular: string;
  Direccion: string;
  Barrio: string;
  Correo: string;
  idRol: string;
  estado: boolean;
}

interface Props {
  usuario: Usuario;
  onClose: () => void;
  onEditar: (formData: Usuario) => void;
}

const EditarUsuarioModal: React.FC<Props> = ({ usuario, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Usuario>(usuario);

  useEffect(() => {
    setFormData(usuario);
  }, [usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones básicas ejemplo:
    if (!formData.Nombre.trim() || !formData.Apellido.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: 'El nombre y apellido son obligatorios.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    if (!formData.Correo.includes('@')) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor ingresa un correo válido.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    try {
      onEditar(formData);

      await Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#e83e8c',
      });

      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al editar',
        text: 'Ocurrió un error inesperado al guardar los cambios.',
        confirmButtonColor: '#e83e8c',
      });
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Editar Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="Nombre"
                  value={formData.Nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input
                  className="form-control"
                  name="Apellido"
                  value={formData.Apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Tipo Documento</label>
                <select
                  className="form-select"
                  name="Tipodocumento"
                  value={formData.Tipodocumento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                  {/* Agrega más opciones si quieres */}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Número Documento</label>
                <input
                  className="form-control"
                  name="Numerodocumento"
                  value={formData.Numerodocumento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Celular</label>
                <input
                  className="form-control"
                  name="Celular"
                  value={formData.Celular}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  className="form-control"
                  name="Direccion"
                  value={formData.Direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Barrio</label>
                <input
                  className="form-control"
                  name="Barrio"
                  value={formData.Barrio}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-control"
                  name="Correo"
                  value={formData.Correo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Rol</label>
                <input
                  className="form-control"
                  name="idRol"
                  value={formData.idRol}
                  onChange={handleChange}
                />
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleChange}
                />
                <label className="form-check-label">Activo</label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-pink">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarUsuarioModal;

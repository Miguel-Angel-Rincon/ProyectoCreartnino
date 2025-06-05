// components/EditarRolModal.tsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

interface Props {
  rol: Rol;
  onClose: () => void;
  onEditar: (formData: Rol) => void;
}

const EditarRolModal: React.FC<Props> = ({ rol, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Rol>(rol);

  useEffect(() => {
    setFormData(rol);
  }, [rol]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, ariaChecked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? ariaChecked: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre del rol no puede estar vacío.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    try {
      onEditar(formData);

      await Swal.fire({
        icon: 'success',
        title: 'Rol actualizado',
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
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-pink text-white">
              <h5 className="modal-title">Editar Rol</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
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

export default EditarRolModal;

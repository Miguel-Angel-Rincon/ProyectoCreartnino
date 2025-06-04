// components/EditarCategoriaProductoModal.tsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface CategoriaProductos {
  IdCategoriaProducto: number;
  Nombre: string;
  Descripcion: string;
  Estado: boolean;
}

interface Props {
  categoria: CategoriaProductos;
  onClose: () => void;
  onEditar: (formData: CategoriaProductos) => void;
}

const EditarCategoriaProductoModal: React.FC<Props> = ({ categoria, onClose, onEditar }) => {
  const [formData, setFormData] = useState<CategoriaProductos>(categoria);

  useEffect(() => {
    setFormData(categoria);
  }, [categoria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      onEditar(formData);

      await Swal.fire({
        icon: 'success',
        title: 'Categoría actualizada',
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
              <h5 className="modal-title">Editar Categoría</h5>
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
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  name="Descripcion"
                  value={formData.Descripcion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="Estado"
                  checked={formData.Estado}
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

export default EditarCategoriaProductoModal;

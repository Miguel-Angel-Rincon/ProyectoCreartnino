// components/EditarInsumoModal.tsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Insumos {
  IdInsumos: number;
  IdCatInsumo: string;
  Nombre: string;
  Descripcion: string;
  marca: string;
  cantidad: number;
  precioUnitario: number;
  estado: boolean;
}

interface Props {
  insumo: Insumos;
  onClose: () => void;
  onEditar: (formData: Insumos) => void;
}

const EditarInsumoModal: React.FC<Props> = ({ insumo, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Insumos>(insumo);

  useEffect(() => {
    setFormData(insumo);
  }, [insumo]);

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

    // Validar cantidad negativa
    if (formData.cantidad < 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'La cantidad no puede ser un número negativo.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    // Validar precio unitario negativo
    if (formData.precioUnitario < 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Precio inválido',
        text: 'El precio unitario no puede ser un número negativo.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    try {
      onEditar(formData);

      await Swal.fire({
        icon: 'success',
        title: 'Insumo actualizado',
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
              <h5 className="modal-title">Editar Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">ID Categoría de Insumo</label>
                <input
                  className="form-control"
                  name="IdCatInsumo"
                  value={formData.IdCatInsumo}
                  onChange={handleChange}
                  required
                />
              </div>
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
              <div className="mb-3">
                <label className="form-label">Marca</label>
                <input
                  className="form-control"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  className="form-control"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Precio Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="precioUnitario"
                  value={formData.precioUnitario}
                  onChange={handleChange}
                  required
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

export default EditarInsumoModal;

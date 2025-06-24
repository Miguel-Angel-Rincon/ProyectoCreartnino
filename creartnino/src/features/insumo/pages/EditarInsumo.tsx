// components/EditarInsumoModal.tsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

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
  const listaMarcas = ['Paps', 'Pinturillo', 'Papelfony', 'mirellon', 'sabanero'];

  useEffect(() => {
    setFormData(insumo);
  }, [insumo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.cantidad < 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'La cantidad no puede ser un número negativo.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    if (formData.precioUnitario < 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Precio inválido',
        text: 'El precio unitario no puede ser un número negativo.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    try {
      onEditar(formData);
      await Swal.fire({
        icon: 'success',
        title: 'Insumo actualizado',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#f78fb3',
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al editar',
        text: 'Ocurrió un error inesperado al guardar los cambios.',
        confirmButtonColor: '#f78fb3',
      });
    }
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📝 Editar Insumo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">

                {/* Categoría y Nombre */}
                <div className="col-md-6">
                  <label className="form-label">📝 Nombre</label>
                  <input
                    className="form-control"
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                 <div className="col-md-6">
                  <label className="form-label">📦 Categoría</label>
                  <select
                    className="form-select"
                    name="IdCatInsumo"
                    value={formData.IdCatInsumo}
                    onChange={handleChange}
                    required
                  >
                    {/* Categoría actual */}
                    <option value={formData.IdCatInsumo}>
                      {formData.IdCatInsumo}
                    </option>
                    {/* Otras categorías */}
                    {Array.from({ length: 8 }, (_, i) => {
                      const cat = `Categoría ${i + 1}`;
                      return cat !== formData.IdCatInsumo ? (
                        <option key={i} value={cat}>{cat}</option>
                      ) : null;
                    })}
                  </select>
                </div>

                {/* Marca y Descripción */}
                <div className="col-md-6">
  <label className="form-label">🏷️ Marca</label>
  <select
    className="form-select"
    name="marca"
    value={formData.marca}
    onChange={handleChange}
    required
  >
    <option value="">Seleccione una marca</option>
    {listaMarcas.map((marca, i) => (
      <option key={i} value={marca}>
        {marca}
      </option>
    ))}
  </select>
</div>

                <div className="col-md-6">
  <label className="form-label">🧾 Descripción</label>
  <textarea
    className="form-control"
    name="Descripcion"
    value={formData.Descripcion}
    onChange={handleChange}
    onFocus={(e) => {
      // Mostrar todo el contenido expandiendo el textarea al enfocarse
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    onBlur={(e) => {
      // Opcional: colapsar nuevamente si quieres
      e.target.style.height = 'auto';
    }}
    title={formData.Descripcion}
    rows={1}
    style={{ resize: 'none', overflow: 'hidden' }}
    required
  />
</div>

                {/* Cantidad y Precio */}
                <div className="col-md-6">
                  <label className="form-label">🔢 Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">💲 Precio Unitario</label>
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
        </div>
      </div>
    </div>
  );
};

export default EditarInsumoModal;

// components/EditarProductoModal.tsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

interface Producto {
  IdProducto: number;
  IdCatProductos: string;//IdCatProductos?: number;
  Nombre: string;
  Imagen: string; //IdImagen?: number;
  cantidad: number;
  marca: string;
  precio: number;
  estado: boolean;
  //IdCatProductosNavigation?: IECatProductos;
//IdImagenNavigation?: IEImagen;
}

interface Props {
  producto: Producto;
  onClose: () => void;
  onEditar: (formData: Producto) => void;
}

const EditarProductoModal: React.FC<Props> = ({ producto, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Producto>(producto);

  useEffect(() => {
    setFormData(producto);
  }, [producto]);

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

    const cantidad = parseInt(formData.cantidad.toString());
    const precio = parseFloat(formData.precio.toString());

    if (cantidad < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Cantidad inválida',
        text: 'La cantidad no puede ser un número negativo.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    if (precio < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Precio inválido',
        text: 'El precio no puede ser un número negativo.',
        confirmButtonColor: '#e83e8c',
      });
      return;
    }

    try {
      onEditar({ ...formData, cantidad, precio });

      await Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
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
              <h5 className="modal-title">Editar Producto</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  name="IdCatProductos"
                  value={formData.IdCatProductos}
                  onChange={handleChange}
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i}>Categoría {i + 1}</option>
                  ))}
                </select>
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
                <label className="form-label">Imagen</label>
                <input
                  className="form-control"
                  name="Imagen"
                  value={formData.Imagen}
                  onChange={handleChange}
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
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  className="form-control"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                 
                  step="0.01"
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

export default EditarProductoModal;

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/acciones.css';

interface Producto {
  IdProducto: number;
  IdCatProductos: string;
  Nombre: string;
  Imagen: string;
  cantidad: number;
  marca: string;
  precio: number;
  estado: boolean; // Aunque se elimina del formulario, se mantiene por compatibilidad de tipo
}

interface Props {
  producto: Producto;
  onClose: () => void;
  onEditar: (formData: Producto) => void;
}

const EditarProductoModal: React.FC<Props> = ({ producto, onClose, onEditar }) => {
  const [formData, setFormData] = useState<Producto>(producto);

  // Simulación de imágenes disponibles
  const imagenesDisponibles = [
    'https://via.placeholder.com/300x200.png?text=Imagen+1',
    'https://via.placeholder.com/300x200.png?text=Imagen+2',
    'https://via.placeholder.com/300x200.png?text=Imagen+3',
  ];

  useEffect(() => {
    setFormData(producto);
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cantidad = parseInt(formData.cantidad.toString());
    const precio = parseFloat(formData.precio.toString());

    if (cantidad < 0 || precio < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'Cantidad y precio deben ser valores positivos.',
        confirmButtonColor: '#f78fb3',
      });
      return;
    }

    try {
      onEditar({ ...formData, cantidad, precio });

      await Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
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
              <h5 className="modal-title">✏️ Editar Producto</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Nombre y Categoría */}
                <div className="col-md-6">
                  <label className="form-label">🛍️ Nombre</label>
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
                    name="IdCatProductos"
                    value={formData.IdCatProductos}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`Categoría ${i + 1}`}>
                        Categoría {i + 1}
                      </option>
                    ))}
                  </select>
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
                  <label className="form-label">💲 Precio</label>
                  <input
                    type="number"
                    className="form-control"
                    name="precio"
                    step="0.01"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Marca y Imagen */}
                <div className="col-md-6">
                  <label className="form-label">🏷️ Marca</label>
                  <input
                    className="form-control"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">🖼️ Imagen</label>
                  <select
                    className="form-select"
                    name="Imagen"
                    value={formData.Imagen}
                    onChange={handleChange}
                  >
                    {imagenesDisponibles.map((img, index) => (
                      <option key={index} value={img}>
                        Imagen {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vista previa centrada */}
                {formData.Imagen && (
                  <div className="col-12 text-center">
                    <img
                      src={formData.Imagen}
                      alt="Vista previa"
                      className="img-thumbnail mt-2"
                      style={{
                        maxWidth: '180px',
                        maxHeight: '180px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                )}
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

export default EditarProductoModal;
